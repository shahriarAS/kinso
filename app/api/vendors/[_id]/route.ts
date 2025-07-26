import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Vendor from "@/features/vendors/model";
import { authorizeRequest } from "@/lib/auth";

// GET /api/vendors/[id] - Get single vendor
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

    const vendor = await Vendor.findById(_id).lean();

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update vendor
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
    const { vendorId, vendorName } = body;

    // Check if vendor exists
    const existingVendor = await Vendor.findById(_id);
    if (!existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if vendorId already exists (if being updated)
    if (vendorId && vendorId !== existingVendor.vendorId) {
      const duplicateVendor = await Vendor.findOne({ vendorId });
      if (duplicateVendor) {
        return NextResponse.json(
          { success: false, message: "Vendor ID already exists" },
          { status: 400 }
        );
      }
    }

    // Update vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      _id,
      { vendorId, vendorName },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete vendor
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

    // Check if vendor exists
    const existingVendor = await Vendor.findById(_id);
    if (!existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Delete vendor
    await Vendor.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 