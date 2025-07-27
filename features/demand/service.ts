import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "./model";
import Stock from "../stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import { LocationType, LOCATION_TYPES, DemandStatus, DEMAND_STATUSES } from "@/types";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
} from "@/lib/apiResponse";

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
    const { location, locationType, products, status } = body;

    // Basic validation
    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location is required" },
        { status: 400 },
      );
    }

    if (!locationType || !LOCATION_TYPES.includes(locationType as LocationType)) {
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
      if (!product.product || !product.quantity || product.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Each product must have a valid product and quantity > 0" },
          { status: 400 },
        );
      }
    }

    if (!status || !DEMAND_STATUSES.includes(status as DemandStatus)) {
      return NextResponse.json(
        { success: false, message: "Status must be one of: Pending, Approved, ConvertedToStock" },
        { status: 400 },
      );
    }

    // Create demand
    const demand = await Demand.create({
      location,
      locationType,
      products,
      status,
    });

    return createSuccessResponse(demand, undefined, 201);
  } catch (error) {
    console.error("Error creating demand:", error);
    return createErrorResponse("Failed to create demand");
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
    const location = searchParams.get("location");
    const locationType = searchParams.get("locationType");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (location) {
      query.location = location;
    }
    if (locationType && LOCATION_TYPES.includes(locationType as LocationType)) {
      query.locationType = locationType;
    }
    if (status && DEMAND_STATUSES.includes(status as DemandStatus)) {
      query.status = status;
    }

    // Execute query
    const [demands, total] = await Promise.all([
      Demand.find(query)
        .populate("products.product", "name barcode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Demand.countDocuments(query),
    ]);

    return createPaginatedResponse(demands, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching demands:", error);
    return createErrorResponse("Failed to fetch demands");
  }
}

// GET /api/demands/[id] - Get a specific demand
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
    const demand = await Demand.findById(id)
      .populate("products.product", "name barcode")
      .lean();
    if (!demand) {
      return createNotFoundResponse("Demand");
    }
    return createSuccessResponse(demand);
  } catch (error) {
    console.error("Error fetching demand:", error);
    return createErrorResponse("Failed to fetch demand");
  }
}

// PUT /api/demands/[id] - Update a demand
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
    const { location, locationType, products, status } = body;
    const { id } = await params;
    
    const existingDemand = await Demand.findById(id);
    if (!existingDemand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }

    // Validation
    if (locationType && !LOCATION_TYPES.includes(locationType as LocationType)) {
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
        if (!product.product || !product.quantity || product.quantity <= 0) {
          return NextResponse.json(
            { success: false, message: "Each product must have a valid product and quantity > 0" },
            { status: 400 },
          );
        }
      }
    }

    if (status && !DEMAND_STATUSES.includes(status as DemandStatus)) {
      return NextResponse.json(
        { success: false, message: "Status must be one of: Pending, Approved, ConvertedToStock" },
        { status: 400 },
      );
    }

    // Build update object
    const updateData: any = {};
    if (location) updateData.location = location;
    if (locationType) updateData.locationType = locationType;
    if (products) updateData.products = products;
    if (status) updateData.status = status;

    const updatedDemand = await Demand.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedDemand) {
      return createErrorResponse("Failed to update demand");
    }

    return createSuccessResponse(updatedDemand);
  } catch (error) {
    console.error("Error updating demand:", error);
    return createErrorResponse("Failed to update demand");
  }
}

// DELETE /api/demands/[id] - Delete a demand
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
    const demand = await Demand.findById(id);
    if (!demand) {
      return NextResponse.json(
        { success: false, message: "Demand not found" },
        { status: 404 },
      );
    }
    await Demand.findByIdAndDelete(id);
    return createSuccessResponse(undefined, "Demand deleted");
  } catch (error) {
    console.error("Error deleting demand:", error);
    return createErrorResponse("Failed to delete demand");
  }
}

// POST /api/demands/[id]/convert - Convert demand to stock
export async function handleConvertToStock(
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
    const { mrp, tp, expireDate, batchNumber } = body;
    const { id } = await params;

    // Validate demand exists
    const demand = await Demand.findById(id);
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

    // Create stock entries for each product in the demand
    const stockEntries = [];
    for (const product of demand.products) {
      const stockEntry = await Stock.create({
        product: product.product,
        location: demand.location,
        locationType: demand.locationType,
        mrp,
        tp,
        expireDate: new Date(expireDate),
        unit: product.quantity,
        batchNumber: batchNumber.trim(),
      });
      stockEntries.push(stockEntry);
    }

    // Update demand status to ConvertedToStock
    await Demand.findByIdAndUpdate(
      id,
      { status: "ConvertedToStock" },
      { new: true, runValidators: true },
    );

    // Return the first stock entry as representative
    return createSuccessResponse(stockEntries[0]);
  } catch (error) {
    console.error("Error converting demand to stock:", error);
    return createErrorResponse("Failed to convert demand to stock");
  }
} 