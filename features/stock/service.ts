import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

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
    const locationId = searchParams.get("locationId") || "";
    const locationType = searchParams.get("locationType") || "";
    const productId = searchParams.get("productId") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (locationId) {
      query.locationId = locationId;
    }
    
    if (locationType) {
      query.locationType = locationType;
    }
    
    if (productId) {
      query.productId = productId;
    }

    // Execute query
    const [stocks, total] = await Promise.all([
      Stock.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stock.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: stocks,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stocks" },
      { status: 500 },
    );
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
    const { stockId, productId, locationId, locationType, mrp, tp, expireDate, quantity, batchNumber } = body;

    // Validation
    if (!stockId) {
      return NextResponse.json(
        { success: false, message: "Stock ID is required" },
        { status: 400 },
      );
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!locationId) {
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

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid quantity is required" },
        { status: 400 },
      );
    }

    if (!batchNumber) {
      return NextResponse.json(
        { success: false, message: "Batch number is required" },
        { status: 400 },
      );
    }

    // Check if stockId already exists
    const existingStock = await Stock.findOne({ stockId });
    if (existingStock) {
      return NextResponse.json(
        { success: false, message: "Stock ID already exists" },
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
      stockId,
      productId,
      locationId,
      locationType,
      mrp,
      tp,
      expireDate: new Date(expireDate),
      quantity,
      batchNumber,
    };

    const stock = await Stock.create(stockData);

    return NextResponse.json(
      {
        success: true,
        data: stock,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add stock" },
      { status: 500 },
    );
  }
}

// GET /api/stocks/:stockId - Get specific stock
export async function handleGetById(request: NextRequest, { params }: { params: { stockId: string } }) {
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

    const { stockId } = params;

    const stock = await Stock.findOne({ stockId }).lean();

    if (!stock) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock" },
      { status: 500 },
    );
  }
}

// PUT /api/stocks/:stockId - Update stock
export async function handlePut(request: NextRequest, { params }: { params: { stockId: string } }) {
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

    const { stockId } = params;
    const body = await request.json();
    const { productId, locationId, locationType, mrp, tp, expireDate, quantity, batchNumber } = body;

    // Find existing stock
    const existingStock = await Stock.findOne({ stockId });
    if (!existingStock) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!locationId) {
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

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid quantity is required" },
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
    const existingBatch = await Stock.findOne({ batchNumber, stockId: { $ne: stockId } });
    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Batch number already exists" },
        { status: 400 },
      );
    }

    // Update stock
    const updatedStock = await Stock.findOneAndUpdate(
      { stockId },
      {
        productId,
        locationId,
        locationType,
        mrp,
        tp,
        expireDate: new Date(expireDate),
        quantity,
        batchNumber,
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: updatedStock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update stock" },
      { status: 500 },
    );
  }
}

// DELETE /api/stocks/:stockId - Delete stock
export async function handleDelete(request: NextRequest, { params }: { params: { stockId: string } }) {
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

    const { stockId } = params;

    const stock = await Stock.findOneAndDelete({ stockId });

    if (!stock) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stock deleted",
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete stock" },
      { status: 500 },
    );
  }
} 