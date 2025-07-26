import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Brand from "@/features/brands/model";
import { authorizeRequest } from "@/lib/auth";

// GET /api/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();
    
    // Check authentication
    const authResult = await authorizeRequest(request, { requireAuth: true });
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { _id } = params;

    const brand = await Brand.findById(_id)
      .populate("vendorId", "vendorId vendorName")
      .lean();

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();
    
    // Check authentication and authorization
    const authResult = await authorizeRequest(request, { 
      requiredRoles: ["admin", "manager"],
      requireAuth: true 
    });
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { _id } = params;
    const body = await request.json();
    const { brandId, brandName, vendorId } = body;

    // Check if brand exists
    const existingBrand = await Brand.findById(_id);
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    // Check if brandId already exists (if being updated)
    if (brandId && brandId !== existingBrand.brandId) {
      const duplicateBrand = await Brand.findOne({ brandId });
      if (duplicateBrand) {
        return NextResponse.json(
          { success: false, message: "Brand ID already exists" },
          { status: 400 }
        );
      }
    }

    // Update brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      _id,
      { brandId, brandName, vendorId },
      { new: true, runValidators: true }
    ).populate("vendorId", "vendorId vendorName");

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();
    
    // Check authentication and authorization
    const authResult = await authorizeRequest(request, { 
      requiredRoles: ["admin"],
      requireAuth: true 
    });
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { _id } = params;

    // Check if brand exists
    const existingBrand = await Brand.findById(_id);
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    // Delete brand
    await Brand.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 