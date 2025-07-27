import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Discount from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/discounts - Create a new discount
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create discounts
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
    const { product, type, amount, startDate, endDate } = body;

    // Basic validation
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product is required" },
        { status: 400 },
      );
    }

    if (!type || !["General", "Membership"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Valid discount type is required" },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount is required" },
        { status: 400 },
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Start date and end date are required" },
        { status: 400 },
      );
    }

    // Create discount
    const discount = await Discount.create({
      product,
      type,
      amount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json(
      {
        success: true,
        data: discount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create discount" },
      { status: 500 },
    );
  }
}

// GET /api/discounts - List all discounts with pagination and filters
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view discounts
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
    const product = searchParams.get("product") || "";
    const type = searchParams.get("type") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (product) {
      query.product = product;
    }
    if (type) {
      query.type = type;
    }
    if (isActive === "true") {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    // Execute query
    const [discounts, total] = await Promise.all([
      Discount.find(query)
        .populate("product", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Discount.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: discounts,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch discounts" },
      { status: 500 },
    );
  }
}

// GET /api/discounts/[id] - Get a specific discount
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
    const discount = await Discount.findById(id)
      .populate("product", "name")
      .lean();
    if (!discount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch discount" },
      { status: 500 },
    );
  }
}

// PUT /api/discounts/[id] - Update a discount
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
    const { product, type, amount, startDate, endDate } = body;
    const { id } = await params;
    
    const existingDiscount = await Discount.findById(id);
    if (!existingDiscount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 },
      );
    }

    // Validation
    if (type && !["General", "Membership"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Valid discount type is required" },
        { status: 400 },
      );
    }
    if (amount && amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount is required" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (product) updateData.product = product;
    if (type) updateData.type = type;
    if (amount) updateData.amount = amount;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedDiscount) {
      return NextResponse.json(
        { success: false, message: "Failed to update discount" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update discount" },
      { status: 500 },
    );
  }
}

// DELETE /api/discounts/[id] - Delete a discount
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
    const discount = await Discount.findById(id);
    if (!discount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 },
      );
    }
    await Discount.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Discount deleted",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete discount" },
      { status: 500 },
    );
  }
} 