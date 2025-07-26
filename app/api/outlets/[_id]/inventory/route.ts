import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Outlet from "@/features/outlets/model";
import Product from "@/features/products/model";

export async function GET(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();

    // Get outlet
    const outlet = await Outlet.findById(params._id).lean();
    if (!outlet) {
      return NextResponse.json(
        { message: "Outlet not found" },
        { status: 404 }
      );
    }

    // Get products with inventory for this outlet
    // Note: This is a simplified implementation. In a real system,
    // you would have a separate inventory collection that tracks
    // stock levels per outlet. For now, we'll show all products
    // with their warehouse stock as a placeholder
    const products = await Product.find({})
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .lean();

    // Calculate inventory data
    const inventoryProducts = products.map((product) => {
      // For now, we'll use the first warehouse stock as a placeholder
      // In a real implementation, you'd have outlet-specific inventory
      const firstStock = product.stock?.[0] || { unit: 0, dp: 0, mrp: 0 };

      return {
        product: {
          _id: product._id,
          name: product.name,
          upc: product.barcode, // Using barcode as UPC
          sku: product.barcode, // Using barcode as SKU
          category: product.categoryId?.name || "Uncategorized",
        },
        quantity: firstStock.unit || 0,
        unit: "pcs",
        dp: firstStock.dp,
        mrp: firstStock.mrp,
      };
    });

    const totalProducts = inventoryProducts.length;
    const totalValue = inventoryProducts.reduce(
      (sum, item) => sum + ((item.dp || 0) * item.quantity),
      0
    );

    return NextResponse.json({
      data: {
        outlet,
        products: inventoryProducts,
        totalProducts,
        totalValue,
      },
    });
  } catch (error) {
    console.error("Error fetching outlet inventory:", error);
    return NextResponse.json(
      { message: "Failed to fetch outlet inventory" },
      { status: 500 }
    );
  }
} 