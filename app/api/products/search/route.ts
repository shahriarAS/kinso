import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "@/features/products/model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 },
      );
    }

    // Search products by name or barcode
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { barcode: { $regex: query, $options: "i" } },
      ],
    })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
      message: "Products found successfully",
    });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
