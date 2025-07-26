import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Outlet from "@/features/outlets/model";

export async function GET(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();

    const outlet = await Outlet.findById(params._id).lean();

    if (!outlet) {
      return NextResponse.json(
        { message: "Outlet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: outlet });
  } catch (error) {
    console.error("Error fetching outlet:", error);
    return NextResponse.json(
      { message: "Failed to fetch outlet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { outletId, name } = body;

    // Validate required fields
    if (!outletId || !name) {
      return NextResponse.json(
        { message: "Outlet ID and name are required" },
        { status: 400 }
      );
    }

    // Check if outletId already exists (excluding current outlet)
    const existingOutlet = await Outlet.findOne({
      outletId,
      _id: { $ne: params._id },
    });
    if (existingOutlet) {
      return NextResponse.json(
        { message: "Outlet ID already exists" },
        { status: 400 }
      );
    }

    // Update outlet
    const outlet = await Outlet.findByIdAndUpdate(
      params._id,
      {
        outletId: outletId.toUpperCase(),
        name,
      },
      { new: true, runValidators: true }
    );

    if (!outlet) {
      return NextResponse.json(
        { message: "Outlet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Outlet updated successfully",
      data: outlet,
    });
  } catch (error) {
    console.error("Error updating outlet:", error);
    return NextResponse.json(
      { message: "Failed to update outlet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();

    const outlet = await Outlet.findByIdAndDelete(params._id);

    if (!outlet) {
      return NextResponse.json(
        { message: "Outlet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Outlet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting outlet:", error);
    return NextResponse.json(
      { message: "Failed to delete outlet" },
      { status: 500 }
    );
  }
} 