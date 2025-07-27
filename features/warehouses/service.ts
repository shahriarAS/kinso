import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Warehouse from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/warehouses - List all warehouses with pagination and search
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view warehouses
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Execute query
    const [warehouses, total] = await Promise.all([
      Warehouse.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Warehouse.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: warehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch warehouses" },
      { status: 500 },
    );
  }
}

// POST /api/warehouses - Create a new warehouse
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create warehouses
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin", "manager"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Warehouse name is required" },
        { status: 400 },
      );
    }

    // Check if warehouse name already exists
    const existingWarehouse = await Warehouse.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingWarehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse with this name already exists" },
        { status: 409 },
      );
    }

    // Create warehouse
    const warehouse = await Warehouse.create({
      name: name.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Warehouse created successfully",
        data: warehouse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create warehouse" },
      { status: 500 },
    );
  }
}

// GET /api/warehouses/[id] - Get a specific warehouse
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - all authenticated users can view warehouses
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

    const warehouse = await Warehouse.findById(id).lean();

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
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - only managers and admins can update warehouses
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin", "manager"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name } = body;

    // Check if warehouse exists
    const existingWarehouse = await Warehouse.findById(id);
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

    // Check if new name conflicts with existing warehouse (excluding current one)
    const nameConflict = await Warehouse.findOne({
      _id: { $ne: id },
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
      id,
      {
        name: name.trim(),
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
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - only admins can delete warehouses
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    // Check if warehouse exists
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 },
      );
    }

    // TODO: Check if warehouse is being used by any products
    // This would require checking the Product model for references in stock array
    // For now, we'll allow deletion but you should implement this check

    await Warehouse.findByIdAndDelete(id);

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
