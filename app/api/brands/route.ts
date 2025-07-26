import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Brand from "@/features/brands/model";
import { authorizeRequest } from "@/lib/auth";

// GET /api/brands - Get all brands with pagination and filters
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
    const brandId = searchParams.get("brandId") || "";
    const brandName = searchParams.get("brandName") || "";
    const vendorId = searchParams.get("vendorId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { brandId: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } },
      ];
    }
    
    if (brandId) {
      query.brandId = { $regex: brandId, $options: "i" };
    }
    
    if (brandName) {
      query.brandName = { $regex: brandName, $options: "i" };
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Brand.countDocuments(query);

    // Get brands with vendor information
    const brands = await Brand.find(query)
      .populate("vendorId", "vendorId vendorName")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create new brand
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
    const { brandId, brandName, vendorId } = body;

    // Validate required fields
    if (!brandId || !brandName || !vendorId) {
      return NextResponse.json(
        { success: false, message: "Brand ID, Brand Name, and Vendor ID are required" },
        { status: 400 }
      );
    }

    // Check if brandId already exists
    const existingBrand = await Brand.findOne({ brandId });
    if (existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand ID already exists" },
        { status: 400 }
      );
    }

    // Create brand
    const brand = new Brand({
      brandId,
      brandName,
      vendorId,
    });

    await brand.save();

    // Populate vendor information
    await brand.populate("vendorId", "vendorId vendorName");

    return NextResponse.json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 