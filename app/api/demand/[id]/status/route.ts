import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "@/features/demand/model";
import { authenticateUser } from "@/lib/auth";

export async function PATCH(
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
    const { status } = body;

    // Validate status
    const validStatuses = ["pending", "approved", "converted", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be one of: pending, approved, converted, cancelled" },
        { status: 400 }
      );
    }

    const demand = await Demand.findById(params.id);
    if (!demand) {
      return NextResponse.json(
        { message: "Demand not found" },
        { status: 404 }
      );
    }

    demand.status = status;
    await demand.save();

    const populatedDemand = await demand.populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    return NextResponse.json({
      message: "Demand status updated successfully",
      data: populatedDemand,
    });
  } catch (error) {
    console.error("Demand status update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 