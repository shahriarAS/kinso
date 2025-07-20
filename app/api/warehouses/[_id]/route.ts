import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Warehouse } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

// GET /api/warehouses/[id] - Get a specific warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  try {
    // Authorize request - all authenticated users can view warehouses
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

    const { _id } = await params;
    const warehouse = await Warehouse.findById(_id).lean();

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch warehouse" },
      { status: 500 },
    );
  }
}

// PUT /api/warehouses/[id] - Update a warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  try {
    // Authorize request - only managers and admins can update warehouses
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ["admin", "manager"],
    });

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, location } = body;

    // Check if warehouse exists
    const { _id } = await params;
    const existingWarehouse = await Warehouse.findById(_id);
    if (!existingWarehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Warehouse name is required" },
        { status: 400 },
      );
    }

    if (!location || location.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Warehouse location is required" },
        { status: 400 },
      );
    }

    // Check if new name conflicts with existing warehouse (excluding current one)
    const nameConflict = await Warehouse.findOne({
      _id: { $ne: _id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Warehouse with this name already exists" },
        { status: 409 },
      );
    }

    // Update warehouse
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        location: location.trim(),
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "Warehouse updated successfully",
      data: updatedWarehouse,
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update warehouse" },
      { status: 500 },
    );
  }
}

// DELETE /api/warehouses/[id] - Delete a warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  try {
    // Authorize request - only admins can delete warehouses
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ["admin"],
    });

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    // Check if warehouse exists
    const { _id } = await params;
    const warehouse = await Warehouse.findById(_id);
    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 },
      );
    }

    // TODO: Check if warehouse is being used by any products
    // This would require checking the Product model for references in stock array
    // For now, we'll allow deletion but you should implement this check

    await Warehouse.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete warehouse" },
      { status: 500 },
    );
  }
}
