import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "@/features/stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/stock/movement - Transfer stock between locations
export async function POST(request: NextRequest) {
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
      productId, 
      fromLocationId, 
      toLocationId, 
      fromLocationType, 
      toLocationType, 
      quantity,
      reason = "Stock Transfer"
    } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!fromLocationId || !toLocationId) {
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

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid quantity is required" },
        { status: 400 },
      );
    }

    // Get available stock from source location (FIFO order)
    const availableStock = await Stock.find({
      productId,
      locationId: fromLocationId,
      locationType: fromLocationType,
      quantity: { $gt: 0 }
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
    const totalAvailable = availableStock.reduce((sum, stock) => sum + stock.quantity, 0);
    
    if (totalAvailable < quantity) {
      return NextResponse.json(
        { success: false, message: `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantity}` },
        { status: 400 },
      );
    }

    // Transfer stock using FIFO logic
    let remainingQuantity = quantity;
    const transferResults = [];

    for (const stock of availableStock) {
      if (remainingQuantity <= 0) break;

      const transferAmount = Math.min(stock.quantity, remainingQuantity);
      
      // Reduce stock from source
      await Stock.findByIdAndUpdate(stock._id, {
        $inc: { quantity: -transferAmount }
      });

      // Add stock to destination (create new entry or update existing)
      const existingDestinationStock = await Stock.findOne({
        productId,
        locationId: toLocationId,
        locationType: toLocationType,
        batchNumber: stock.batchNumber
      });

      if (existingDestinationStock) {
        // Update existing stock entry
        await Stock.findByIdAndUpdate(existingDestinationStock._id, {
          $inc: { quantity: transferAmount }
        });
      } else {
        // Create new stock entry at destination
        await Stock.create({
          stockId: `STK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId,
          locationId: toLocationId,
          locationType: toLocationType,
          mrp: stock.mrp,
          tp: stock.tp,
          expireDate: stock.expireDate,
          quantity: transferAmount,
          batchNumber: stock.batchNumber
        });
      }

      transferResults.push({
        stockId: stock.stockId,
        batchNumber: stock.batchNumber,
        transferredQuantity: transferAmount,
        fromLocation: fromLocationId,
        toLocation: toLocationId
      });

      remainingQuantity -= transferAmount;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${quantity} units`,
      data: {
        totalTransferred: quantity,
        transfers: transferResults
      }
    });

  } catch (error) {
    console.error("Error transferring stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to transfer stock" },
      { status: 500 },
    );
  }
}

// GET /api/stock/movement - Get stock movement history
export async function GET(request: NextRequest) {
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
    const productId = searchParams.get("productId") || "";
    const locationId = searchParams.get("locationId") || "";
    const movementType = searchParams.get("movementType") || "";

    const skip = (page - 1) * limit;

    // Build query for stock movement history
    // Note: This would require a separate StockMovement collection
    // For now, we'll return a placeholder response
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
      },
      message: "Stock movement history feature coming soon"
    });

  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 },
    );
  }
} 