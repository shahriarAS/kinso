import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import { LocationType, LOCATION_TYPES } from "@/types";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  createConflictErrorResponse,
  createUnauthorizedResponse,
} from "@/lib/apiResponse";

// GET /api/stocks - List all stocks with pagination and filters
export async function handleGet(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const location = searchParams.get("location") || "";
    const locationType = searchParams.get("locationType") || "";
    const product = searchParams.get("product") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (location) {
      query.location = location;
    }
    
    if (locationType) {
      query.locationType = locationType;
    }
    
    if (product) {
      query.product = product;
    }

    // Execute query
    const [stocks, total] = await Promise.all([
      Stock.find(query)
        .populate("product", "name barcode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stock.countDocuments(query),
    ]);

    return createPaginatedResponse(stocks, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return createErrorResponse("Failed to fetch stocks");
  }
}

// POST /api/stocks - Add new stock
export async function handlePost(request: NextRequest) {
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

    const body = await request.json();
    const { product, location, locationType, mrp, tp, expireDate, unit, batchNumber } = body;

    // Validation
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product is required" },
        { status: 400 },
      );
    }

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

    if (!mrp || mrp <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid MRP is required" },
        { status: 400 },
      );
    }

    if (!tp || tp <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid TP is required" },
        { status: 400 },
      );
    }

    if (!expireDate) {
      return NextResponse.json(
        { success: false, message: "Expire date is required" },
        { status: 400 },
      );
    }

    if (!unit || unit <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid unit is required" },
        { status: 400 },
      );
    }

    if (!batchNumber) {
      return NextResponse.json(
        { success: false, message: "Batch number is required" },
        { status: 400 },
      );
    }

    // Check if batchNumber already exists
    const existingBatch = await Stock.findOne({ batchNumber });
    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Batch number already exists" },
        { status: 400 },
      );
    }

    // Create stock entry
    const stockData = {
      product,
      location,
      locationType,
      mrp,
      tp,
      expireDate: new Date(expireDate),
      unit,
      batchNumber,
    };

    const stock = await Stock.create(stockData);

    return createSuccessResponse(stock, undefined, 201);
  } catch (error) {
    console.error("Error adding stock:", error);
    return createErrorResponse("Failed to add stock");
  }
}

// GET /api/stocks/:id - Get specific stock
export async function handleGetById(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const stock = await Stock.findById(id)
      .populate("product", "name barcode")
      .lean();

    if (!stock) {
      return createNotFoundResponse("Stock");
    }

    return createSuccessResponse(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return createErrorResponse("Failed to fetch stock");
  }
}

// PUT /api/stocks/:id - Update stock
export async function handlePut(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await request.json();
    const { product, location, locationType, mrp, tp, expireDate, unit, batchNumber } = body;

    // Find existing stock
    const existingStock = await Stock.findById(id);
    if (!existingStock) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product is required" },
        { status: 400 },
      );
    }

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

    if (!mrp || mrp <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid MRP is required" },
        { status: 400 },
      );
    }

    if (!tp || tp <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid TP is required" },
        { status: 400 },
      );
    }

    if (!expireDate) {
      return NextResponse.json(
        { success: false, message: "Expire date is required" },
        { status: 400 },
      );
    }

    if (!unit || unit <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid unit is required" },
        { status: 400 },
      );
    }

    if (!batchNumber) {
      return NextResponse.json(
        { success: false, message: "Batch number is required" },
        { status: 400 },
      );
    }

    // Check if batchNumber already exists for different stock
    const existingBatch = await Stock.findOne({ batchNumber, _id: { $ne: id } });
    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Batch number already exists" },
        { status: 400 },
      );
    }

    // Update stock
    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      {
        product,
        location,
        locationType,
        mrp,
        tp,
        expireDate: new Date(expireDate),
        unit,
        batchNumber,
      },
      { new: true }
    ).lean();

    return createSuccessResponse(updatedStock);
  } catch (error) {
    console.error("Error updating stock:", error);
    return createErrorResponse("Failed to update stock");
  }
}

// DELETE /api/stocks/:id - Delete stock
export async function handleDelete(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const stock = await Stock.findByIdAndDelete(id);

    if (!stock) {
      return createNotFoundResponse("Stock");
    }

    return createSuccessResponse(undefined, "Stock deleted");
  } catch (error) {
    console.error("Error deleting stock:", error);
    return createErrorResponse("Failed to delete stock");
  }
} 