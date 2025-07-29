import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Order from "@/features/orders/model";
import Product from "@/features/products/model";
import Customer from "@/features/customers/model";
import Stock from "@/features/stock/model";
import Warehouse from "@/features/warehouses/model";
import Outlet from "@/features/outlets/model";
import Category from "@/features/categories/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/reports/sales - Get sales report
export async function handleGetSalesReport(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requireAuth: true,
      },
    );
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const outletId = searchParams.get("outletId");
    const category = searchParams.get("category");

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "startDate and endDate are required" },
        { status: 400 },
      );
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format" },
        { status: 400 },
      );
    }

    // Build match conditions
    const matchConditions: any = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    // Add outlet filter if provided
    if (outletId) {
      // Since orders are linked to warehouses, we need to check if the warehouse is associated with the outlet
      // For now, we'll assume outletId refers to warehouseId in this context
      matchConditions.warehouse = outletId;
    }

    // Get total sales and revenue
    const totalStats = await Order.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get sales by outlet
    const outletStats = await Order.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$warehouse",
          salesCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          outletId: "$_id",
          salesCount: 1,
          revenue: 1,
        },
      },
    ]);

    // Get sales by category (requires looking up product categories)
    const categoryStats = await Order.aggregate([
      { $match: matchConditions },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      ...(category ? [{ $match: { "productDetails.category": category } }] : []),
      {
        $group: {
          _id: "$productDetails.category",
          salesCount: { $sum: 1 },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          salesCount: 1,
          revenue: 1,
        },
      },
    ]);

    const processedResult = {
      totalSales: totalStats[0]?.totalSales || 0,
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      byOutlet: outletStats,
      byCategory: categoryStats,
    };

    return NextResponse.json({
      success: true,
      data: processedResult,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate sales report" },
      { status: 500 },
    );
  }
}

// GET /api/reports/inventory - Get inventory report
export async function handleGetInventoryReport(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requireAuth: true,
      },
    );
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const locationType = searchParams.get("locationType");
    const product = searchParams.get("product");

    // Build match conditions for stock
    const stockMatch: any = {};
    if (locationId) {
      stockMatch.locationId = locationId;
    }
    if (locationType) {
      stockMatch.locationType = locationType;
    }
    if (product) {
      stockMatch.product = product;
    }

    // Get stock data with product information
    const stockData = await Stock.find(stockMatch)
      .populate("product", "product name")
      .lean();

    const inventoryData = stockData.map((stock: any) => ({
      product: stock.product?.product || stock.product,
      locationId: stock.locationId,
      locationType: stock.locationType,
      quantity: stock.quantity,
      mrp: stock.mrp,
      tp: stock.tp,
      expireDate: stock.expireDate,
      batchNumber: stock.batchNumber,
    }));

    return NextResponse.json({
      success: true,
      data: inventoryData,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate inventory report" },
      { status: 500 },
    );
  }
}

// GET /api/reports/customers - Get customer report
export async function handleGetCustomerReport(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requireAuth: true,
      },
    );
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const membershipActive = searchParams.get("membershipActive");

    // Build match conditions for customers
    const customerMatch: any = {};
    if (membershipActive !== null && membershipActive !== undefined) {
      customerMatch.membershipActive = membershipActive === "true";
    }

    // Get customers
    const customers = await Customer.find(customerMatch).lean();

    // Build match conditions for orders
    const orderMatch: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        orderMatch.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }

    // Get customer purchase data
    const customerPurchaseData = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: "$customer",
          totalPurchases: { $sum: 1 },
          lastPurchaseDate: { $max: "$createdAt" },
        },
      },
    ]);

    // Create a map of customer purchase data
    const purchaseMap = new Map();
    customerPurchaseData.forEach((item) => {
      purchaseMap.set(item._id.toString(), item);
    });

    // Combine customer data with purchase data
    const customerReportData = customers.map((customer: any) => {
      const purchaseData = purchaseMap.get(customer._id.toString()) || {
        totalPurchases: 0,
        lastPurchaseDate: null,
      };

      return {
        customer: customer.customer,
        name: customer.name,
        totalPurchases: purchaseData.totalPurchases,
        membershipActive: customer.membershipActive,
        lastPurchaseDate: purchaseData.lastPurchaseDate,
      };
    });

    return NextResponse.json({
      success: true,
      data: customerReportData,
    });
  } catch (error) {
    console.error("Error generating customer report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate customer report" },
      { status: 500 },
    );
  }
} 