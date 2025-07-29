import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Vendor from "./model";
import Product from "@/features/products/model";
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
    const { name } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Vendor name is required" },
        { status: 400 },
      );
    }

    // Check if vendor already exists with same name
    const existingVendor = await Vendor.findOne({ name: name.trim() });
    if (existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor with this name already exists" },
        { status: 409 },
      );
    }

    // Create vendor
    const vendor = await Vendor.create({
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
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    // Execute query
    const [vendors, total] = await Promise.all([
      Vendor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Vendor.countDocuments(query),
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

// GET /api/vendors/[id] - Get a specific vendor
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const { id } = await params;
    const vendor = await Vendor.findById(id).lean();
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

// PUT /api/vendors/[id] - Update a vendor
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const { id } = await params;

    const existingVendor = await Vendor.findById(id);
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

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
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

// DELETE /api/vendors/[id] - Delete a vendor
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const { id } = await params;
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }

    // Check if vendor is used by any products
    const productCount = await Product.countDocuments({ vendor: id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete vendor: it is used by products",
        },
        { status: 409 },
      );
    }

    await Vendor.findByIdAndDelete(id);
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
