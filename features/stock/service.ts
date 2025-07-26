import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Stock from "./model";
import Product from "@/features/products/model";
import Outlet from "@/features/outlets/model";
import Warehouse from "@/features/warehouses/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import { StockInput, StockMoveInput } from "./types";

// GET /api/stock - List all stock with pagination, search, and filters
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
    const search = searchParams.get("search") || "";
    const productId = searchParams.get("productId") || "";
    const outletId = searchParams.get("outletId") || "";
    const warehouseId = searchParams.get("warehouseId") || "";
    const expireDateFrom = searchParams.get("expireDateFrom") || "";
    const expireDateTo = searchParams.get("expireDateTo") || "";
    const entryDateFrom = searchParams.get("entryDateFrom") || "";
    const entryDateTo = searchParams.get("entryDateTo") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const expiringSoon = searchParams.get("expiringSoon") === "true";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { "product.name": { $regex: search, $options: "i" } },
        { "product.barcode": { $regex: search, $options: "i" } },
      ];
    }
    
    if (productId) {
      query.productId = productId;
    }
    
    if (outletId) {
      query.outletId = outletId;
    }
    
    if (warehouseId) {
      query.warehouseId = warehouseId;
    }
    
    if (expireDateFrom || expireDateTo) {
      query.expireDate = {};
      if (expireDateFrom) {
        query.expireDate.$gte = new Date(expireDateFrom);
      }
      if (expireDateTo) {
        query.expireDate.$lte = new Date(expireDateTo);
      }
    }
    
    if (entryDateFrom || entryDateTo) {
      query.entryDate = {};
      if (entryDateFrom) {
        query.entryDate.$gte = new Date(entryDateFrom);
      }
      if (entryDateTo) {
        query.entryDate.$lte = new Date(entryDateTo);
      }
    }
    
    if (lowStock) {
      query.units = { $lt: 10 };
    }
    
    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.expireDate = { $lte: thirtyDaysFromNow };
    }

    // Execute query with FIFO ordering
    const [stocks, total] = await Promise.all([
      Stock.find(query)
        .populate("productId", "name barcode")
        .populate("outletId", "name outletId")
        .populate("warehouseId", "name warehouseId")
        .sort({ entryDate: 1 }) // FIFO order
        .skip(skip)
        .limit(limit)
        .lean(),
      Stock.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock" },
      { status: 500 },
    );
  }
}

// POST /api/stock - Add new stock
export async function handlePost(request: NextRequest) {
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

    const body: StockInput = await request.json();
    const { productId, outletId, warehouseId, mrp, tp, expireDate, units, entryDate } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!outletId && !warehouseId) {
      return NextResponse.json(
        { success: false, message: "Either outlet ID or warehouse ID is required" },
        { status: 400 },
      );
    }

    if (outletId && warehouseId) {
      return NextResponse.json(
        { success: false, message: "Cannot specify both outlet ID and warehouse ID" },
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

    if (!units || units <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid units count is required" },
        { status: 400 },
      );
    }

    // Validate expire date is in the future
    const expireDateObj = new Date(expireDate);
    if (expireDateObj <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Expire date must be in the future" },
        { status: 400 },
      );
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Validate outlet or warehouse exists
    if (outletId) {
      const outlet = await Outlet.findById(outletId);
      if (!outlet) {
        return NextResponse.json(
          { success: false, message: "Outlet not found" },
          { status: 404 },
        );
      }
    }

    if (warehouseId) {
      const warehouse = await Warehouse.findOne({ warehouseId: warehouseId.toUpperCase() });
      if (!warehouse) {
        return NextResponse.json(
          { success: false, message: "Warehouse not found" },
          { status: 404 },
        );
      }
    }

    // Create stock entry
    const stockData: any = {
      productId,
      mrp,
      tp,
      expireDate: expireDateObj,
      units,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    };

    if (outletId) {
      stockData.outletId = outletId;
    } else {
      stockData.warehouseId = warehouseId?.toUpperCase();
    }

    const stock = await Stock.create(stockData);

    // Populate references for response
    const populatedStock = await Stock.findById(stock._id)
      .populate("productId", "name barcode")
      .populate("outletId", "name outletId")
      .populate("warehouseId", "name warehouseId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Stock added successfully",
        data: populatedStock,
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

// POST /api/stock/move - Move stock between locations
export async function handleMoveStock(request: NextRequest) {
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

    const body: StockMoveInput = await request.json();
    const { stockId, targetOutletId, targetWarehouseId, units } = body;

    // Validation
    if (!stockId) {
      return NextResponse.json(
        { success: false, message: "Stock ID is required" },
        { status: 400 },
      );
    }

    if (!targetOutletId && !targetWarehouseId) {
      return NextResponse.json(
        { success: false, message: "Target outlet ID or warehouse ID is required" },
        { status: 400 },
      );
    }

    if (targetOutletId && targetWarehouseId) {
      return NextResponse.json(
        { success: false, message: "Cannot specify both target outlet ID and warehouse ID" },
        { status: 400 },
      );
    }

    if (!units || units <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid units count is required" },
        { status: 400 },
      );
    }

    // Find the source stock entry
    const sourceStock = await Stock.findById(stockId);
    if (!sourceStock) {
      return NextResponse.json(
        { success: false, message: "Stock entry not found" },
        { status: 404 },
      );
    }

    if (sourceStock.units < units) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock available" },
        { status: 400 },
      );
    }

    // Validate target location exists
    if (targetOutletId) {
      const outlet = await Outlet.findById(targetOutletId);
      if (!outlet) {
        return NextResponse.json(
          { success: false, message: "Target outlet not found" },
          { status: 404 },
        );
      }
    }

    if (targetWarehouseId) {
      const warehouse = await Warehouse.findOne({ warehouseId: targetWarehouseId.toUpperCase() });
      if (!warehouse) {
        return NextResponse.json(
          { success: false, message: "Target warehouse not found" },
          { status: 404 },
        );
      }
    }

    // Use FIFO logic to find the oldest stock entries
    const stockEntries = await Stock.find({
      productId: sourceStock.productId,
      outletId: sourceStock.outletId,
      warehouseId: sourceStock.warehouseId,
      units: { $gt: 0 },
    }).sort({ entryDate: 1 }); // FIFO order

    let remainingUnits = units;
    const updates: any[] = [];

    for (const entry of stockEntries) {
      if (remainingUnits <= 0) break;

      const unitsToMove = Math.min(entry.units, remainingUnits);
      remainingUnits -= unitsToMove;

      // Update source stock
      updates.push(
        Stock.findByIdAndUpdate(entry._id, {
          $inc: { units: -unitsToMove },
        })
      );

      // Create target stock entry
      const targetStockData: any = {
        productId: entry.productId,
        mrp: entry.mrp,
        tp: entry.tp,
        expireDate: entry.expireDate,
        units: unitsToMove,
        entryDate: new Date(),
      };

      if (targetOutletId) {
        targetStockData.outletId = targetOutletId;
      } else {
        targetStockData.warehouseId = targetWarehouseId?.toUpperCase();
      }

      updates.push(Stock.create(targetStockData));
    }

    if (remainingUnits > 0) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock available for move" },
        { status: 400 },
      );
    }

    // Execute all updates
    await Promise.all(updates);

    return NextResponse.json(
      {
        success: true,
        message: "Stock moved successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error moving stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to move stock" },
      { status: 500 },
    );
  }
}

// GET /api/stock/stats - Get stock statistics
export async function handleGetStats(request: NextRequest) {
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

    // Get total stock count
    const totalStock = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);

    // Get total value
    const totalValue = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ["$units", "$mrp"] } } } },
    ]);

    // Get low stock items (less than 10 units)
    const lowStockItems = await Stock.countDocuments({ units: { $lt: 10 } });

    // Get expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringItems = await Stock.countDocuments({
      expireDate: { $lte: thirtyDaysFromNow },
    });

    // Get stock by location
    const stockByWarehouse = await Stock.aggregate([
      { $match: { warehouseId: { $exists: true } } },
      { $group: { _id: "$warehouseId", total: { $sum: "$units" } } },
    ]);

    const stockByOutlet = await Stock.aggregate([
      { $match: { outletId: { $exists: true } } },
      { $group: { _id: "$outletId", total: { $sum: "$units" } } },
    ]);

    const stats = {
      totalStock: totalStock[0]?.total || 0,
      totalValue: totalValue[0]?.total || 0,
      lowStockItems,
      expiringItems,
      stockByLocation: {
        warehouse: Object.fromEntries(
          stockByWarehouse.map((item) => [item._id, item.total])
        ),
        outlet: Object.fromEntries(
          stockByOutlet.map((item) => [item._id, item.total])
        ),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stock stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock statistics" },
      { status: 500 },
    );
  }
} 