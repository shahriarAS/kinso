import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale from "@/features/sales/model";
import Stock from "@/features/stock/model";
import Product from "@/features/products/model";
import Demand from "@/features/demand/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

export async function POST(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can generate demands
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin", "manager"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { 
      outletId, 
      warehouseId, 
      days = 30, 
      minSalesThreshold = 1,
      demandDays = 7,
      safetyStockFactor = 1.2,
      seasonalAdjustment = 1.0
    } = body;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build sales query
    const salesQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (outletId) {
      salesQuery.outletId = outletId;
    }

    // Get sales data
    const sales = await Sale.find(salesQuery)
      .populate("items.stockId", "productId")
      .lean();

    // Analyze sales patterns
    const productSales: Record<string, {
      totalQuantity: number;
      totalRevenue: number;
      saleDays: number;
      lastSaleDate: Date;
      averageDailySales: number;
      maxDailySales: number;
      minDailySales: number;
      salesFrequency: number;
    }> = {};

    // Group sales by product
    for (const sale of sales) {
      for (const item of sale.items) {
        const productId = (item.stockId as any)?.productId;
        if (!productId) continue;

        if (!productSales[productId]) {
          productSales[productId] = {
            totalQuantity: 0,
            totalRevenue: 0,
            saleDays: 0,
            lastSaleDate: new Date(0),
            averageDailySales: 0,
            maxDailySales: 0,
            minDailySales: Infinity,
            salesFrequency: 0,
          };
        }

        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalRevenue += item.quantity * item.unitPrice;
        
        const saleDate = new Date(sale.createdAt);
        if (saleDate > productSales[productId].lastSaleDate) {
          productSales[productId].lastSaleDate = saleDate;
        }
      }
    }

    // Calculate daily sales patterns
    const dailySales: Record<string, Record<string, number>> = {};
    
    for (const sale of sales) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      
      for (const item of sale.items) {
        const productId = (item.stockId as any)?.productId;
        if (!productId) continue;

        if (!dailySales[productId]) {
          dailySales[productId] = {};
        }
        
        if (!dailySales[productId][saleDate]) {
          dailySales[productId][saleDate] = 0;
        }
        
        dailySales[productId][saleDate] += item.quantity;
      }
    }

    // Calculate statistics for each product
    for (const [productId, salesData] of Object.entries(productSales)) {
      const dailyQuantities = Object.values(dailySales[productId] || {});
      
      if (dailyQuantities.length > 0) {
        salesData.averageDailySales = salesData.totalQuantity / days;
        salesData.maxDailySales = Math.max(...dailyQuantities);
        salesData.minDailySales = Math.min(...dailyQuantities);
        salesData.saleDays = dailyQuantities.length;
        salesData.salesFrequency = dailyQuantities.length / days;
      }
    }

    // Get current stock levels
    const stockQuery: any = {
      quantity: { $gt: 0 },
    };

    if (warehouseId) {
      stockQuery.locationId = warehouseId;
      stockQuery.locationType = "Warehouse";
    } else if (outletId) {
      stockQuery.locationId = outletId;
      stockQuery.locationType = "Outlet";
    }

    const currentStock = await Stock.find(stockQuery).lean();
    const stockByProduct: Record<string, number> = {};
    
    for (const stock of currentStock) {
      const productId = stock.productId.toString();
      stockByProduct[productId] = (stockByProduct[productId] || 0) + stock.quantity;
    }

    // Generate demands
    const demands = [];
    let generatedCount = 0;

    for (const [productId, salesData] of Object.entries(productSales)) {
      // Skip products that don't meet minimum threshold
      if (salesData.totalQuantity < minSalesThreshold) {
        continue;
      }

      // Calculate demand using sophisticated algorithm
      const currentStockLevel = stockByProduct[productId] || 0;
      
      // Base demand calculation
      let baseDemand = salesData.averageDailySales * demandDays;
      
      // Apply safety stock factor
      baseDemand *= safetyStockFactor;
      
      // Apply seasonal adjustment
      baseDemand *= seasonalAdjustment;
      
      // Consider sales frequency and variability
      const variabilityFactor = salesData.maxDailySales / (salesData.averageDailySales || 1);
      baseDemand *= Math.min(variabilityFactor, 2.0); // Cap at 2x
      
      // Consider sales frequency (more frequent sales = higher demand)
      const frequencyFactor = Math.min(salesData.salesFrequency * 2, 1.5);
      baseDemand *= frequencyFactor;
      
      // Subtract current stock
      const netDemand = Math.max(0, Math.ceil(baseDemand - currentStockLevel));
      
      if (netDemand > 0) {
        // Generate demand ID
        const demandId = `DEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const demand = {
          demandId,
          locationId: outletId || warehouseId,
          locationType: outletId ? "Outlet" : "Warehouse",
          products: [{
            productId,
            quantity: netDemand,
          }],
          status: "Pending",
          generatedFrom: {
            analysisPeriod: days,
            averageDailySales: salesData.averageDailySales,
            salesFrequency: salesData.salesFrequency,
            currentStock: currentStockLevel,
            algorithm: "Enhanced",
          },
        };

        demands.push(demand);
        generatedCount++;
      }
    }

    // Create demands in database
    if (demands.length > 0) {
      await Demand.insertMany(demands);
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedCount,
        demands,
        analysis: {
          totalProducts: Object.keys(productSales).length,
          productsWithDemand: demands.length,
          analysisPeriod: days,
          averageDailySales: Object.values(productSales).reduce((sum, data) => sum + data.averageDailySales, 0) / Object.keys(productSales).length,
        },
      },
      message: `Successfully generated ${generatedCount} demands`,
    });
  } catch (error) {
    console.error("Error generating demands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate demands" },
      { status: 500 },
    );
  }
} 