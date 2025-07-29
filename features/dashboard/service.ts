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

    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Total products
    const totalProducts = await Product.countDocuments();

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
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "_id saleNumber customerName totalAmount paymentMethods createdAt",
      )
      .lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentSalesFormatted = recentSales.map((s: any) => ({
      _id: s._id,
      saleNumber: s.saleNumber,
      customerName: s.customerName,
      totalAmount: s.totalAmount,
      paymentMethods: s.paymentMethods || [],
      status: "N/A",
    }));

    // Top products (by total sold)
    const topProductsAgg = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: "$product.name",
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);

    // Revenue chart (last 7 days)
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
    const revenueChart = revenueChartAgg.map((d: any) => ({
      date: d._id,
      revenue: d.revenue,
      sales: d.sales,
    }));

    return NextResponse.json({
      totalRevenue,
      totalSales,
      totalCustomers,
      totalProducts,
      pendingSales: 0, // No status field in model
      lowStockProducts,
      recentSales: recentSalesFormatted,
      topProducts: topProductsAgg,
      revenueChart,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
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
      lowStockProducts: lowStockProductsAgg,
      outOfStockProducts: outOfStockProductsAgg,
      expiringProducts: [],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
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
