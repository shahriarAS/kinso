import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "@/features/demand/model";
import { authenticateUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const demand = await Demand.findById(params.id).populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    if (!demand) {
      return NextResponse.json(
        { message: "Demand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: demand });
  } catch (error) {
    console.error("Demand fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { outletId, warehouseId, productId, quantity, demandDate } = body;

    const demand = await Demand.findById(params.id);
    if (!demand) {
      return NextResponse.json(
        { message: "Demand not found" },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (outletId !== undefined) demand.outletId = outletId;
    if (warehouseId !== undefined) demand.warehouseId = warehouseId;
    if (productId !== undefined) demand.productId = productId;
    if (quantity !== undefined) demand.quantity = quantity;
    if (demandDate !== undefined) demand.demandDate = new Date(demandDate);

    await demand.save();

    const populatedDemand = await demand.populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    return NextResponse.json({
      message: "Demand updated successfully",
      data: populatedDemand,
    });
  } catch (error) {
    console.error("Demand update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const demand = await Demand.findById(params.id);
    if (!demand) {
      return NextResponse.json(
        { message: "Demand not found" },
        { status: 404 }
      );
    }

    await Demand.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Demand deleted successfully",
    });
  } catch (error) {
    console.error("Demand deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 