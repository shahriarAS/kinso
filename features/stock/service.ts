import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "./model";
import Warehouse from "../warehouses/model";
import Outlet from "../outlets/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import { LocationType, LOCATION_TYPES } from "@/types";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
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
    const [stocksRaw, total] = await Promise.all([
      Stock.find(query)
        .populate("product", "name barcode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stock.countDocuments(query),
    ]);

    // Manually populate location based on locationType
    const stocks = await Promise.all(
      stocksRaw.map(async (stock: any) => {
        if (stock.locationType === "Warehouse") {
          const warehouse = await Warehouse.findById(stock.location).select("name").lean();
          stock.location = warehouse;
        } else if (stock.locationType === "Outlet") {
          const outlet = await Outlet.findById(stock.location).select("name type").lean();
          stock.location = outlet;
        }
        return stock;
      })
    );

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

    const stockRaw = await Stock.findById(id)
      .populate("product", "name barcode")
      .lean();

    if (!stockRaw) {
      return createNotFoundResponse("Stock");
    }

    // Manually populate location based on locationType
    let stock = stockRaw as any;
    if (stock.locationType === "Warehouse") {
      const warehouse = await Warehouse.findById(stock.location).select("name").lean();
      stock.location = warehouse;
    } else if (stock.locationType === "Outlet") {
      const outlet = await Outlet.findById(stock.location).select("name type").lean();
      stock.location = outlet;
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

// POST /api/stock/movement - Transfer stock between locations
export async function handleTransferStock(request: NextRequest) {
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
    const { 
      product, 
      fromLocation, 
      toLocation, 
      fromLocationType, 
      toLocationType, 
      unit,
      reason = "Stock Transfer"
    } = body;

    // Validation
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product is required" },
        { status: 400 },
      );
    }

    if (!fromLocation || !toLocation) {
      return NextResponse.json(
        { success: false, message: "Source and destination locations are required" },
        { status: 400 },
      );
    }

    if (!fromLocationType || !toLocationType) {
      return NextResponse.json(
        { success: false, message: "Location types are required" },
        { status: 400 },
      );
    }

    if (!unit || unit <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid unit is required" },
        { status: 400 },
      );
    }

    // Get available stock from source location (FIFO order)
    const availableStock = await Stock.find({
      product,
      location: fromLocation,
      locationType: fromLocationType,
      unit: { $gt: 0 }
    })
    .sort({ createdAt: 1 }) // FIFO: oldest first
    .lean();

    if (!availableStock.length) {
      return NextResponse.json(
        { success: false, message: "No stock available at source location" },
        { status: 400 },
      );
    }

    // Calculate total available quantity
    const totalAvailable = availableStock.reduce((sum, stock) => sum + stock.unit, 0);
    
    if (totalAvailable < unit) {
      return NextResponse.json(
        { success: false, message: `Insufficient stock. Available: ${totalAvailable}, Requested: ${unit}` },
        { status: 400 },
      );
    }

    // Transfer stock using FIFO logic
    let remainingQuantity = unit;
    const transferResults = [];

    for (const stock of availableStock) {
      if (remainingQuantity <= 0) break;

      const transferAmount = Math.min(stock.unit, remainingQuantity);
      
      // Reduce stock from source
      await Stock.findByIdAndUpdate(stock._id, {
        $inc: { unit: -transferAmount }
      });

      // Add stock to destination (create new entry or update existing)
      const existingDestinationStock = await Stock.findOne({
        product,
        location: toLocation,
        locationType: toLocationType,
        batchNumber: stock.batchNumber
      });

      if (existingDestinationStock) {
        // Update existing stock entry
        await Stock.findByIdAndUpdate(existingDestinationStock._id, {
          $inc: { unit: transferAmount }
        });
      } else {
        // Create new stock entry at destination
        await Stock.create({
          product,
          location: toLocation,
          locationType: toLocationType,
          mrp: stock.mrp,
          tp: stock.tp,
          expireDate: stock.expireDate,
          unit: transferAmount,
          batchNumber: stock.batchNumber
        });
      }

      transferResults.push({
        stock: stock._id,
        batchNumber: stock.batchNumber,
        transferredQuantity: transferAmount,
        fromLocation: fromLocation,
        toLocation: toLocation
      });

      remainingQuantity -= transferAmount;
    }

    return createSuccessResponse({
      totalTransferred: unit,
      transfers: transferResults
    }, `Successfully transferred ${unit} units`);

  } catch (error) {
    console.error("Error transferring stock:", error);
    return createErrorResponse("Failed to transfer stock");
  }
}