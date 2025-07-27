import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Brand from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/brands - Create a new brand
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create brands
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
    const { name, vendor } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Brand name is required" },
        { status: 400 },
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor is required" },
        { status: 400 },
      );
    }

    // Create brand
    const brand = await Brand.create({
      name: name.trim(),
      vendor,
    });

    return NextResponse.json(
      {
        success: true,
        data: brand,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create brand" },
      { status: 500 },
    );
  }
}

// GET /api/brands - List all brands with pagination and filters
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view brands
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
    const vendor = searchParams.get("vendor") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (vendor) {
      query.vendor = vendor;
    }

    // Execute query
    const [brands, total] = await Promise.all([
      Brand.find(query)
        .populate("vendor", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Brand.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: brands,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}

// GET /api/brands/[id] - Get a specific brand
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
    const brand = await Brand.findById(id)
      .populate("vendor", "name")
      .lean();
    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

// PUT /api/brands/[id] - Update a brand
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
    const { name, vendor } = body;
    const { id } = await params;
    
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Brand name is required" },
        { status: 400 },
      );
    }
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor is required" },
        { status: 400 },
      );
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        vendor,
      },
      { new: true, runValidators: true },
    );

    if (!updatedBrand) {
      return NextResponse.json(
        { success: false, message: "Failed to update brand" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update brand" },
      { status: 500 },
    );
  }
}

// DELETE /api/brands/[id] - Delete a brand
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
    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 },
      );
    }
    await Brand.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Brand deleted",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete brand" },
      { status: 500 },
    );
  }
} 