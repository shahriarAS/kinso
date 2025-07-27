import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "@/features/stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/stock/stats - Get stock statistics
export async function GET(request: NextRequest) {
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
    const location = searchParams.get("location") || "";
    const locationType = searchParams.get("locationType") || "";

    // Build query
    const query: any = {};
    if (location) {
      query.location = location;
    }
    if (locationType) {
      query.locationType = locationType;
    }

    // Get total stock count
    const totalStock = await Stock.countDocuments(query);

    // Get total stock value
    const stockValueResult = await Stock.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$unit", "$mrp"] } },
        },
      },
    ]);
    const totalValue = stockValueResult[0]?.totalValue || 0;

    // Get low stock items (unit < 10)
    const lowStockItems = await Stock.countDocuments({
      ...query,
      unit: { $lt: 10 },
    });

    // Get out of stock items
    const outOfStockItems = await Stock.countDocuments({
      ...query,
      unit: 0,
    });

    // Get expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringItems = await Stock.countDocuments({
      ...query,
      expireDate: { $lte: thirtyDaysFromNow },
      unit: { $gt: 0 },
    });

    // Get stock by location
    const stockByLocation = await Stock.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            location: "$location",
            locationType: "$locationType",
          },
          itemCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$unit", "$mrp"] } },
        },
      },
      {
        $project: {
          location: "$_id.location",
          locationType: "$_id.locationType",
          itemCount: 1,
          totalValue: 1,
          _id: 0,
        },
      },
    ]);

    // Get stock by product
    const stockByProduct = await Stock.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$unit" },
          totalValue: { $sum: { $multiply: ["$unit", "$mrp"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          product: "$_id",
          productName: "$product.name",
          totalQuantity: 1,
          totalValue: 1,
          _id: 0,
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);

    const stats = {
      totalStock,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiringItems,
      stockByLocation,
      stockByProduct,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stock stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock statistics" },
      { status: 500 },
    );
  }
} 