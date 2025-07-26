import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Outlet from "@/features/outlets/model";
import Product from "@/features/products/model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get total outlets
    const totalOutlets = await Outlet.countDocuments();

    // Get all outlets with basic info
    const outlets = await Outlet.find({}).lean();

    // Get total products (simplified - using all products)
    const totalProducts = await Product.countDocuments();

    // Calculate total value (simplified - using warehouse stock)
    const products = await Product.find({}).lean();
    const totalValue = products.reduce((sum, product) => {
      const firstStock = product.stock?.[0];
      return sum + ((firstStock?.dp || 0) * (firstStock?.unit || 0));
    }, 0);

    // Calculate low stock products (products with less than 10 units)
    const lowStockProducts = products.filter((product) => {
      const firstStock = product.stock?.[0];
      return (firstStock?.unit || 0) < 10;
    }).length;

    // Calculate outlet-specific stats (simplified)
    const outletStats = outlets.map((outlet) => ({
      _id: outlet._id,
      outletId: outlet.outletId,
      name: outlet.name,
      productCount: totalProducts, // Simplified - same for all outlets
      totalValue: totalValue / totalOutlets, // Simplified - distributed equally
    }));

    return NextResponse.json({
      data: {
        totalOutlets,
        totalProducts,
        totalValue,
        lowStockProducts,
        outlets: outletStats,
      },
    });
  } catch (error) {
    console.error("Error fetching outlet stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch outlet stats" },
      { status: 500 }
    );
  }
} 