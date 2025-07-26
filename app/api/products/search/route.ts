import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "@/features/products/model";
import Stock from "@/features/stock/model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const outletId = searchParams.get("outletId");

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Search products by name, barcode, or SKU
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { barcode: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
      ],
    })
      .populate("categoryId", "categoryName")
      .populate("brandId", "name")
      .populate("vendorId", "name")
      .limit(20);

    // Get stock information for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockQuery: any = { productId: product._id };
        
        if (outletId) {
          stockQuery.outletId = outletId;
        }

        const stock = await Stock.find(stockQuery)
          .sort({ entryDate: 1 }) // FIFO order
          .limit(10);

        return {
          _id: product._id,
          name: product.name,
          barcode: product.barcode,
          category: product.categoryId,
          brand: product.brandId,
          vendor: product.vendorId,
          stock: stock.map((s) => ({
            _id: s._id,
            units: s.units,
            mrp: s.mrp,
            tp: s.tp,
            expireDate: s.expireDate,
            entryDate: s.entryDate,
          })),
        };
      })
    );

    return NextResponse.json({
      data: productsWithStock,
      message: "Products found successfully",
    });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 