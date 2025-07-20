import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Warehouse } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

// GET /api/warehouses - List all warehouses with pagination and search
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
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
export async function POST(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create warehouses
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

    // Check if warehouse already exists
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
      location: location.trim(),
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
