import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "@/features/demand/model";
import Product from "@/features/products/model";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { demandId, warehouseId, quantity } = body;

    // Find the demand
    const demand = await Demand.findById(demandId);
    if (!demand) {
      return NextResponse.json(
        { message: "Demand not found" },
        { status: 404 }
      );
    }

    // Check if demand is in a convertible status
    if (demand.status !== "pending" && demand.status !== "approved") {
      return NextResponse.json(
        { message: "Demand cannot be converted. Status must be pending or approved." },
        { status: 400 }
      );
    }

    // Find the product
    const product = await Product.findById(demand.productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if warehouse exists in product stock
    const warehouseStockIndex = product.stock.findIndex(
      (stock: any) => stock.warehouse.toString() === warehouseId
    );

    if (warehouseStockIndex === -1) {
      return NextResponse.json(
        { message: "Warehouse not found in product stock" },
        { status: 400 }
      );
    }

    // Update product stock
    const currentStock = product.stock[warehouseStockIndex].unit;
    product.stock[warehouseStockIndex].unit = currentStock + quantity;

    await product.save();

    // Update demand status to converted
    demand.status = "converted";
    await demand.save();

    // Populate the updated demand
    const populatedDemand = await demand.populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    return NextResponse.json({
      message: `Successfully converted demand to stock. Added ${quantity} units to warehouse.`,
      data: populatedDemand,
    });
  } catch (error) {
    console.error("Demand conversion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 