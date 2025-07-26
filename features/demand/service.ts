import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "./model";
import Stock from "../stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/demands - Create a new demand
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create demands
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
    const { demandId, locationId, locationType, products, status } = body;

    // Basic validation
    if (!demandId || demandId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Demand ID is required" },
        { status: 400 },
      );
    }

    if (!locationId || locationId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Location ID is required" },
        { status: 400 },
      );
    }

    if (!locationType || !["Warehouse", "Outlet"].includes(locationType)) {
      return NextResponse.json(
        { success: false, message: "Location type must be either 'Warehouse' or 'Outlet'" },
        { status: 400 },
      );
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Products array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Validate each product in the array
    for (const product of products) {
      if (!product.productId || !product.quantity || product.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Each product must have a valid productId and quantity > 0" },
          { status: 400 },
        );
      }
    }

    if (!status || !["Pending", "Approved", "ConvertedToStock"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be one of: Pending, Approved, ConvertedToStock" },
        { status: 400 },
      );
    }

    // Check if demand already exists with same demandId
    const existingDemand = await Demand.findOne({ demandId: demandId.trim() });
    if (existingDemand) {
      return NextResponse.json(
        { success: false, message: "Demand with this ID already exists" },
        { status: 409 },
      );
    }

    // Create demand
    const demand = await Demand.create({
      demandId: demandId.trim(),
      locationId: locationId.trim(),
      locationType,
      products,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        data: demand,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating demand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create demand" },
      { status: 500 },
    );
  }
}

// GET /api/demands - List all demands with pagination and filters
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view demands
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
    const locationId = searchParams.get("locationId");
    const locationType = searchParams.get("locationType");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (locationId) {
      query.locationId = locationId;
    }
    if (locationType && ["Warehouse", "Outlet"].includes(locationType)) {
      query.locationType = locationType;
    }
    if (status && ["Pending", "Approved", "ConvertedToStock"].includes(status)) {
      query.status = status;
    }

    // Execute query
    const [demands, total] = await Promise.all([
      Demand.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Demand.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: demands,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching demands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch demands" },
      { status: 500 },
    );
  }
}

// GET /api/demands/[demandId] - Get a specific demand
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ demandId: string }> },
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
    const { demandId } = await params;
    const demand = await Demand.findOne({ demandId }).lean();
    if (!demand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: demand,
    });
  } catch (error) {
    console.error("Error fetching demand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch demand" },
      { status: 500 },
    );
  }
}

// PUT /api/demands/[demandId] - Update a demand
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ demandId: string }> },
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
    const { locationId, locationType, products, status } = body;
    const { demandId } = await params;
    
    const existingDemand = await Demand.findOne({ demandId });
    if (!existingDemand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }

    // Validation
    if (locationId && locationId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Location ID cannot be empty" },
        { status: 400 },
      );
    }

    if (locationType && !["Warehouse", "Outlet"].includes(locationType)) {
      return NextResponse.json(
        { success: false, message: "Location type must be either 'Warehouse' or 'Outlet'" },
        { status: 400 },
      );
    }

    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        return NextResponse.json(
          { success: false, message: "Products array must not be empty" },
          { status: 400 },
        );
      }

      // Validate each product in the array
      for (const product of products) {
        if (!product.productId || !product.quantity || product.quantity <= 0) {
          return NextResponse.json(
            { success: false, message: "Each product must have a valid productId and quantity > 0" },
            { status: 400 },
          );
        }
      }
    }

    if (status && !["Pending", "Approved", "ConvertedToStock"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be one of: Pending, Approved, ConvertedToStock" },
        { status: 400 },
      );
    }

    // Build update object
    const updateData: any = {};
    if (locationId) updateData.locationId = locationId.trim();
    if (locationType) updateData.locationType = locationType;
    if (products) updateData.products = products;
    if (status) updateData.status = status;

    const updatedDemand = await Demand.findOneAndUpdate(
      { demandId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedDemand) {
      return NextResponse.json(
        { success: false, message: "Failed to update demand" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDemand,
    });
  } catch (error) {
    console.error("Error updating demand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update demand" },
      { status: 500 },
    );
  }
}

// DELETE /api/demands/[demandId] - Delete a demand
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ demandId: string }> },
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
    const { demandId } = await params;
    const demand = await Demand.findOne({ demandId });
    if (!demand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }
    await Demand.findOneAndDelete({ demandId });
    return NextResponse.json({
      success: true,
      message: "Demand deleted",
    });
  } catch (error) {
    console.error("Error deleting demand:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete demand" },
      { status: 500 },
    );
  }
}

// POST /api/demands/[demandId]/convert - Convert demand to stock
export async function handleConvertToStock(
  request: NextRequest,
  { params }: { params: Promise<{ demandId: string }> },
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
    const { mrp, tp, expireDate, batchNumber } = body;
    const { demandId } = await params;

    // Validate demand exists
    const demand = await Demand.findOne({ demandId });
    if (!demand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }

    // Validate demand status
    if (demand.status !== "Approved") {
      return NextResponse.json(
        { success: false, message: "Only approved demands can be converted to stock" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!mrp || mrp <= 0) {
      return NextResponse.json(
        { success: false, message: "MRP must be greater than 0" },
        { status: 400 },
      );
    }

    if (!tp || tp <= 0) {
      return NextResponse.json(
        { success: false, message: "TP must be greater than 0" },
        { status: 400 },
      );
    }

    if (!expireDate) {
      return NextResponse.json(
        { success: false, message: "Expire date is required" },
        { status: 400 },
      );
    }

    if (!batchNumber || batchNumber.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Batch number is required" },
        { status: 400 },
      );
    }

    // Check if batch number already exists
    const existingBatch = await Stock.findOne({ batchNumber: batchNumber.trim() });
    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Batch number already exists" },
        { status: 409 },
      );
    }

    // Generate stock ID
    const stockId = `STK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create stock entries for each product in the demand
    const stockEntries = [];
    for (const product of demand.products) {
      const stockEntry = await Stock.create({
        stockId: `${stockId}-${product.productId}`,
        productId: product.productId,
        locationId: demand.locationId,
        locationType: demand.locationType,
        mrp,
        tp,
        expireDate: new Date(expireDate),
        quantity: product.quantity,
        batchNumber: batchNumber.trim(),
      });
      stockEntries.push(stockEntry);
    }

    // Update demand status to ConvertedToStock
    await Demand.findOneAndUpdate(
      { demandId },
      { status: "ConvertedToStock" },
      { new: true, runValidators: true },
    );

    // Return the first stock entry as representative
    return NextResponse.json({
      success: true,
      data: stockEntries[0],
    });
  } catch (error) {
    console.error("Error converting demand to stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to convert demand to stock" },
      { status: 500 },
    );
  }
} 