import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "@/features/products/model";
import Stock from "@/features/stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

export async function GET(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can search products
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
    const query = searchParams.get("query");
    const outletId = searchParams.get("outletId");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Search query must be at least 2 characters long" },
        { status: 400 },
      );
    }

    // Build search query
    const searchQuery = {
      $or: [
        { name: { $regex: query.trim(), $options: "i" } },
        { barcode: { $regex: query.trim(), $options: "i" } },
        { sku: { $regex: query.trim(), $options: "i" } },
      ],
    };

    // Get products with stock information
    const products = await Product.find(searchQuery)
      .populate("categoryId", "categoryName")
      .populate("brandId", "name")
      .lean();

    // Filter products by outlet stock if outletId is provided
    let filteredProducts = products;
    if (outletId) {
      const stockItems = await Stock.find({
        locationId: outletId,
        locationType: "Outlet",
        quantity: { $gt: 0 },
      }).lean();

      const availableProductIds = stockItems.map(item => item.productId.toString());
      filteredProducts = products.filter(product => 
        availableProductIds.includes((product as any)._id.toString())
      );
    }

    // Format response with stock information
    const formattedProducts = filteredProducts.map(product => ({
      _id: product._id,
      name: product.name,
      barcode: product.barcode,
      sku: product.sku,
      category: product.categoryId?.categoryName,
      brand: product.brandId?.name,
      stock: [], // Will be populated by the frontend from inventory data
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search products" },
      { status: 500 },
    );
  }
} 