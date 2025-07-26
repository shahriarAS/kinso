import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Vendor from "@/features/vendors/model";
import { authorizeRequest } from "@/lib/auth";

// GET /api/vendors - Get all vendors with pagination and filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const vendorId = searchParams.get("vendorId") || "";
    const vendorName = searchParams.get("vendorName") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { vendorId: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
      ];
    }
    
    if (vendorId) {
      query.vendorId = { $regex: vendorId, $options: "i" };
    }
    
    if (vendorName) {
      query.vendorName = { $regex: vendorName, $options: "i" };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Vendor.countDocuments(query);

    // Get vendors
    const vendors = await Vendor.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { vendorId, vendorName } = body;

    // Validate required fields
    if (!vendorId || !vendorName) {
      return NextResponse.json(
        { success: false, message: "Vendor ID and Vendor Name are required" },
        { status: 400 }
      );
    }

    // Check if vendorId already exists
    const existingVendor = await Vendor.findOne({ vendorId });
    if (existingVendor) {
      return NextResponse.json(
        { success: false, message: "Vendor ID already exists" },
        { status: 400 }
      );
    }

    // Create vendor
    const vendor = new Vendor({
      vendorId,
      vendorName,
    });

    await vendor.save();

    return NextResponse.json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 