import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "@/features/products/model";
import Sale from "@/features/sales/model";
import Customer from "@/features/customers/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/dashboard/stats - Get dashboard statistics
export async function handleGetStats(request: NextRequest) {
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

    // Parse low stock threshold from query, default to 5
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get("threshold") || "5", 10);

    // Total revenue
    const totalRevenueAgg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Total sales
    const totalSales = await Sale.countDocuments();
    console.log("Total sales count:", totalSales);

    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Total products
    const totalProducts = await Product.countDocuments();
    console.log("Total products count:", totalProducts);

    // Low stock products (dynamic threshold)
    const products = await Product.find({}, { stock: 1, name: 1 }).lean();
    let lowStockProducts = 0;
    for (const product of products) {
      if (Array.isArray(product.stock)) {
        if (
          product.stock.some(
            (s: any) =>
              typeof s.unit === "number" && s.unit > 0 && s.unit < threshold,
          )
        ) {
          lowStockProducts++;
        }
      }
    }

    // Recent sales (last 5)
    let recentSalesFormatted: any[] = [];
    try {
      const recentSales = await Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name")
        .select(
          "_id saleId customer totalAmount paymentMethods status createdAt",
        )
        .lean();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentSalesFormatted = recentSales.map((s: any) => ({
        _id: s._id,
        saleId: s.saleId,
        customerName: s.customer?.name || "Walk-in Customer",
        totalAmount: s.totalAmount,
        paymentMethods: s.paymentMethods || [],
        status: s.status || "Completed",
        createdAt: s.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching recent sales:", error);
      recentSalesFormatted = [];
    }

    // Top products (by total sold)
    let topProductsAgg: any[] = [];
    try {
      // First, let's check if we have any sales with items
      const salesWithItems = await Sale.countDocuments({
        items: { $exists: true, $ne: [] },
      });
      console.log("Sales with items count:", salesWithItems);

      topProductsAgg = await Sale.aggregate([
        { $match: { items: { $exists: true, $ne: [] } } }, // Ensure items exist
        { $unwind: "$items" },
        {
          $lookup: {
            from: "stocks", // First lookup the stock
            localField: "items.stock",
            foreignField: "_id",
            as: "stock",
          },
        },
        { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$stock.product", // Group by product from stock
            totalSold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products", // Then lookup the product details
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: { $ifNull: ["$product.name", "Unknown Product"] },
            totalSold: 1,
            revenue: 1,
            category: { $ifNull: ["$category.name", "Uncategorized"] },
          },
        },
      ]);

      console.log(
        "Top products aggregation result:",
        topProductsAgg.length,
        "products found",
      );
    } catch (error) {
      console.error("Error fetching top products:", error);
      topProductsAgg = [];
    }

    // Revenue chart (last 7 days)
    let revenueChart: any[] = [];
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const revenueChartAgg = await Sale.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            sales: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      revenueChart = revenueChartAgg.map((d: any) => ({
        date: d._id,
        revenue: d.revenue,
        sales: d.sales,
      }));
    } catch (error) {
      console.error("Error fetching revenue chart:", error);
      revenueChart = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalSales,
        totalCustomers,
        totalProducts,
        pendingSales: 0, // No status field in model
        lowStockProducts,
        recentSales: recentSalesFormatted,
        topProducts: topProductsAgg,
        revenueChart,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}

// GET /api/dashboard/inventory-alerts - Get inventory alerts
export async function handleGetInventoryAlerts(request: NextRequest) {
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

    // Parse low stock threshold from query, default to 5
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get("threshold") || "5", 10);

    // Low stock products (dynamic threshold)
    const lowStockProductsAgg = await Product.aggregate([
      { $unwind: "$stock" },
      { $match: { "stock.unit": { $gt: 0, $lt: threshold } } },
      {
        $lookup: {
          from: "warehouses",
          localField: "stock.warehouse",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      { $unwind: "$warehouse" },
      {
        $project: {
          _id: 1,
          name: 1,
          currentStock: "$stock.unit",
          minStock: { $literal: threshold },
          warehouse: "$warehouse.name",
        },
      },
    ]);

    // Out of stock products (unit == 0)
    const outOfStockProductsAgg = await Product.aggregate([
      { $unwind: "$stock" },
      { $match: { "stock.unit": 0 } },
      {
        $lookup: {
          from: "warehouses",
          localField: "stock.warehouse",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      { $unwind: "$warehouse" },
      {
        $project: {
          _id: 1,
          name: 1,
          warehouse: "$warehouse.name",
        },
      },
    ]);

    // No expiry field, so expiringProducts is empty
    return NextResponse.json({
      success: true,
      data: {
        lowStockProducts: lowStockProductsAgg,
        outOfStockProducts: outOfStockProductsAgg,
        expiringProducts: [],
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching inventory alerts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory alerts",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}

// GET /api/dashboard/sales-analytics - Get sales analytics
export async function handleGetSalesAnalytics(request: NextRequest) {
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
    const period = searchParams.get("period") || "daily";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let matchCondition: any = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let groupBy: any;
    switch (period) {
      case "weekly":
        groupBy = {
          $dateToString: { format: "%Y-W%U", date: "$createdAt" },
        };
        break;
      case "monthly":
        groupBy = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      default: // daily
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    const salesAnalytics = await Sale.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const analytics = salesAnalytics.map((item: any) => ({
      period: item._id,
      totalSales: item.totalSales,
      totalRevenue: item.totalRevenue,
      averageOrderValue: Math.round(item.averageOrderValue * 100) / 100,
    }));

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        period,
        totalPeriods: analytics.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching sales analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sales analytics",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}
