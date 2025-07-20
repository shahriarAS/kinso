import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Product } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requireAuth: true,
    });
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
