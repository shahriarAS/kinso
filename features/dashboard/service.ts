import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "@/features/products/model";
import Order from "@/features/orders/model";
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

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock products (threshold: 5)
    const lowStockProductsAgg = await Product.aggregate([
      { $unwind: "$stock" },
      { $match: { "stock.unit": { $gt: 0, $lt: 5 } } },
      { $group: { _id: "$name" } },
    ]);
    const lowStockProducts = lowStockProductsAgg.length;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id orderNumber customerName totalAmount createdAt")
      .lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentOrdersFormatted = recentOrders.map((o: any) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: "N/A",
    }));

    // Top products (by total sold)
    const topProductsAgg = await Order.aggregate([
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
    const revenueChartAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const revenueChart = revenueChartAgg.map((d) => ({
      date: d._id,
      revenue: d.revenue,
      orders: d.orders,
    }));

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders: 0, // No status field in model
      lowStockProducts,
      recentOrders: recentOrdersFormatted,
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

    // Low stock products (unit < 5)
    const lowStockProductsAgg = await Product.aggregate([
      { $unwind: "$stock" },
      { $match: { "stock.unit": { $gt: 0, $lt: 5 } } },
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
          minStock: { $literal: 5 },
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
