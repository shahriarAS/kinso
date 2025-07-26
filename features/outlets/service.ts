import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Outlet from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/outlets - Create a new outlet
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create outlets
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
    const { outletId, name, type } = body;

    // Basic validation
    if (!outletId || outletId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Outlet ID is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Outlet name is required" },
        { status: 400 },
      );
    }

    if (!type || !["Micro Outlet", "Super Shop"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Outlet type must be 'Micro Outlet' or 'Super Shop'" },
        { status: 400 },
      );
    }

    // Check if outlet already exists with same outletId
    const existingOutlet = await Outlet.findOne({ outletId: outletId.trim() });
    if (existingOutlet) {
      return NextResponse.json(
        { success: false, message: "Outlet with this ID already exists" },
        { status: 409 },
      );
    }

    // Create outlet
    const outlet = await Outlet.create({
      outletId: outletId.trim(),
      name: name.trim(),
      type,
    });

    return NextResponse.json(
      {
        success: true,
        data: outlet,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating outlet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create outlet" },
      { status: 500 },
    );
  }
}

// GET /api/outlets - List all outlets with pagination and filtering
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view outlets
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
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (type) {
      query.type = type;
    }

    // Execute query
    const [outlets, total] = await Promise.all([
      Outlet.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Outlet.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: outlets,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching outlets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch outlets" },
      { status: 500 },
    );
  }
}

// GET /api/outlets/[outletId] - Get a specific outlet
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> },
) {
  try {
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
    const { outletId } = await params;
    const outlet = await Outlet.findOne({ outletId }).lean();
    if (!outlet) {
      return NextResponse.json(
        { success: false, message: "Outlet not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    console.error("Error fetching outlet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch outlet" },
      { status: 500 },
    );
  }
}

// PUT /api/outlets/[outletId] - Update an outlet
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> },
) {
  try {
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
    const { name, type } = body;
    const { outletId } = await params;
    
    const existingOutlet = await Outlet.findOne({ outletId });
    if (!existingOutlet) {
      return NextResponse.json(
        { success: false, message: "Outlet not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Outlet name is required" },
        { status: 400 },
      );
    }
    if (!type || !["Micro Outlet", "Super Shop"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Outlet type must be 'Micro Outlet' or 'Super Shop'" },
        { status: 400 },
      );
    }

    const updatedOutlet = await Outlet.findOneAndUpdate(
      { outletId },
      {
        name: name.trim(),
        type,
      },
      { new: true, runValidators: true },
    );

    if (!updatedOutlet) {
      return NextResponse.json(
        { success: false, message: "Failed to update outlet" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOutlet,
    });
  } catch (error) {
    console.error("Error updating outlet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update outlet" },
      { status: 500 },
    );
  }
}

// DELETE /api/outlets/[outletId] - Delete an outlet
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> },
) {
  try {
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
    const { outletId } = await params;
    const outlet = await Outlet.findOne({ outletId });
    if (!outlet) {
      return NextResponse.json(
        { success: false, message: "Outlet not found" },
        { status: 404 },
      );
    }
    await Outlet.findOneAndDelete({ outletId });
    return NextResponse.json({
      success: true,
      message: "Outlet deleted",
    });
  } catch (error) {
    console.error("Error deleting outlet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete outlet" },
      { status: 500 },
    );
  }
}
