import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "@/features/demand/model";
import Sale from "@/features/sales/model";
import Product from "@/features/products/model";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { outletId, warehouseId, days = 30, minSalesThreshold = 1 } = body;

    // Calculate the date range for sales analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query for sales data
    const salesQuery: any = {
      saleDate: { $gte: startDate, $lte: endDate },
    };

    if (outletId) {
      salesQuery.outletId = outletId;
    }

    // Get sales data for the specified period
    const salesData = await Sale.find(salesQuery)
      .populate("items.productId", "name barcode")
      .lean();

    // Simplified demand generation algorithm based on average sales
    // This is a simplified approach - in a real scenario, you might want to consider:
    // - Seasonal trends
    // - Day of week patterns
    // - Stock levels
    // - Lead times
    // - Safety stock requirements
    
    const productSalesMap = new Map();

    // Aggregate sales by product
    salesData.forEach((sale) => {
      sale.items.forEach((item: any) => {
        const productId = item.productId._id.toString();
        const quantity = item.quantity || 0;

        if (productSalesMap.has(productId)) {
          productSalesMap.get(productId).totalQuantity += quantity;
          productSalesMap.get(productId).saleCount += 1;
        } else {
          productSalesMap.get(productId).totalQuantity = quantity;
          productSalesMap.get(productId).saleCount = 1;
          productSalesMap.get(productId).productName = item.productId.name;
        }
      });
    });

    const generatedDemands = [];
    const timestamp = Date.now().toString();

    // Generate demands for products that meet the threshold
    for (const [productId, salesInfo] of productSalesMap.entries()) {
      const { totalQuantity, saleCount, productName } = salesInfo;

      // Only generate demand if sales meet minimum threshold
      if (totalQuantity >= minSalesThreshold) {
        // Calculate average daily sales
        const averageDailySales = totalQuantity / days;
        
        // Generate demand for 7 days of average sales (simplified approach)
        // In a real scenario, you might want to consider:
        // - Current stock levels
        // - Reorder points
        // - Lead times
        // - Safety stock requirements
        const demandQuantity = Math.ceil(averageDailySales * 7);

        // Generate unique demand ID
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const demandId = `DEM${timestamp.slice(-6)}${randomSuffix}`;

        const demand = new Demand({
          demandId,
          outletId: outletId || null,
          warehouseId: warehouseId || null,
          productId,
          quantity: demandQuantity,
          demandDate: new Date(),
          status: "pending",
        });

        await demand.save();
        generatedDemands.push(demand);
      }
    }

    // Populate the generated demands with product and outlet information
    const populatedDemands = await Demand.find({
      _id: { $in: generatedDemands.map(d => d._id) }
    }).populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    return NextResponse.json({
      message: `Generated ${generatedDemands.length} demands based on sales data`,
      generatedCount: generatedDemands.length,
      demands: populatedDemands,
    });
  } catch (error) {
    console.error("Demand generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 