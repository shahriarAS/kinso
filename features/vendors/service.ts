import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Vendor from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/vendors - Create a new vendor
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create vendors
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
    const { vendorId, name } = body;

    // Basic validation
    if (!vendorId || vendorId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Vendor ID is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Vendor name is required" },
        { status: 400 },
      );
    }

    // Check if vendor already exists with same vendorId
    const existingVendor = await Vendor.findOne({ vendorId: vendorId.trim() });
    if (existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor with this ID already exists" },
        { status: 409 },
      );
    }

    // Create vendor
    const vendor = await Vendor.create({
      vendorId: vendorId.trim(),
      name: name.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: vendor,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create vendor" },
      { status: 500 },
    );
  }
}

// GET /api/vendors - List all vendors with pagination
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view vendors
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

    const skip = (page - 1) * limit;

    // Execute query
    const [vendors, total] = await Promise.all([
      Vendor.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vendor.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendors" },
      { status: 500 },
    );
  }
}

// GET /api/vendors/[vendorId] - Get a specific vendor
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> },
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
    const { vendorId } = await params;
    const vendor = await Vendor.findOne({ vendorId }).lean();
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor" },
      { status: 500 },
    );
  }
}

// PUT /api/vendors/[vendorId] - Update a vendor
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> },
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
    const { name } = body;
    const { vendorId } = await params;
    
    const existingVendor = await Vendor.findOne({ vendorId });
    if (!existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Vendor name is required" },
        { status: 400 },
      );
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { vendorId },
      {
        name: name.trim(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedVendor) {
      return NextResponse.json(
        { success: false, message: "Failed to update vendor" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update vendor" },
      { status: 500 },
    );
  }
}

// DELETE /api/vendors/[vendorId] - Delete a vendor
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> },
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
    const { vendorId } = await params;
    const vendor = await Vendor.findOne({ vendorId });
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }
    await Vendor.findOneAndDelete({ vendorId });
    return NextResponse.json({
      success: true,
      message: "Vendor deleted",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete vendor" },
      { status: 500 },
    );
  }
}
