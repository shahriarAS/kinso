import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale from "@/features/sales/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

export async function GET(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view sales stats
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

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Build outlet filter
    const outletFilter = outletId ? { outletId } : {};

    // Combine filters
    const query = { ...dateFilter, ...outletFilter };

    // Get sales data
    const sales = await Sale.find(query).lean();

    // Calculate statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Sales by payment method
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || "UNKNOWN";
      if (!acc[method]) {
        acc[method] = { count: 0, totalAmount: 0 };
      }
      acc[method].count += 1;
      acc[method].totalAmount += sale.totalAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    // Sales by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSales = sales.filter(sale => 
      new Date(sale.createdAt) >= thirtyDaysAgo
    );

    const salesByDate = recentSales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { saleCount: 0, totalRevenue: 0 };
      }
      acc[date].saleCount += 1;
      acc[date].totalRevenue += sale.totalAmount || 0;
      return acc;
    }, {} as Record<string, { saleCount: number; totalRevenue: number }>);

    // Convert to arrays for easier frontend consumption
    const paymentMethodStats = Object.entries(salesByPaymentMethod).map(([method, stats]) => ({
      method: method as any,
      count: stats.count,
      totalAmount: stats.totalAmount,
    }));

    const dateStats = Object.entries(salesByDate).map(([date, stats]) => ({
      date,
      saleCount: stats.saleCount,
      totalRevenue: stats.totalRevenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalRevenue,
        averageSaleValue,
        salesByPaymentMethod: paymentMethodStats,
        salesByDate: dateStats,
      },
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sales statistics" },
      { status: 500 },
    );
  }
} 