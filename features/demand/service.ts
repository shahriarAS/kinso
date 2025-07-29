import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "./model";
import Stock from "../stock/model";
import Warehouse from "../warehouses/model";
import Outlet from "../outlets/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import { LocationType, LOCATION_TYPES, DemandStatus, DEMAND_STATUSES } from "@/types";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
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

    // Populate the created demand with all necessary data
    const populatedDemand: any = await Demand.findById(demand._id)
      .populate({
        path: "products.product",
        select: "name barcode category brand vendor",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
          { path: "vendor", select: "name" }
        ]
      })
      .lean();

    if (!populatedDemand) {
      return createErrorResponse("Failed to populate created demand");
    }

    // Populate location based on locationType
    if (populatedDemand.locationType === "Warehouse") {
      const warehouse = await Warehouse.findById(populatedDemand.location).select("name").lean();
      populatedDemand.location = warehouse;
    } else if (populatedDemand.locationType === "Outlet") {
      const outlet = await Outlet.findById(populatedDemand.location).select("name type").lean();
      populatedDemand.location = outlet;
    }

    return createSuccessResponse(populatedDemand, undefined, 201);
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
    const [demandsRaw, total] = await Promise.all([
      Demand.find(query)
        .populate({
          path: "products.product",
          select: "name barcode category brand vendor",
          populate: [
            { path: "category", select: "name" },
            { path: "brand", select: "name" },
            { path: "vendor", select: "name" }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Demand.countDocuments(query),
    ]);

    // Manually populate location based on locationType
    const demands = await Promise.all(
      demandsRaw.map(async (demand: any) => {
        if (demand.locationType === "Warehouse") {
          const warehouse = await Warehouse.findById(demand.location).select("name").lean();
          demand.location = warehouse;
        } else if (demand.locationType === "Outlet") {
          const outlet = await Outlet.findById(demand.location).select("name type").lean();
          demand.location = outlet;
        }
        return demand;
      })
    );

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
    const demand: any = await Demand.findById(id)
      .populate({
        path: "products.product",
        select: "name barcode category brand vendor",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
          { path: "vendor", select: "name" }
        ]
      })
      .lean();
    if (!demand) {
      return createNotFoundResponse("Demand");
    }
    
    // Populate location based on locationType
    if (demand.locationType === "Warehouse") {
      const warehouse = await Warehouse.findById(demand.location).select("name").lean();
      demand.location = warehouse;
    } else if (demand.locationType === "Outlet") {
      const outlet = await Outlet.findById(demand.location).select("name type").lean();
      demand.location = outlet;
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
    )
    .populate({
      path: "products.product",
      select: "name barcode category brand vendor",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
        { path: "vendor", select: "name" }
      ]
    });

    if (!updatedDemand) {
      return createErrorResponse("Failed to update demand");
    }

    // Populate location based on locationType
    let populatedDemand = updatedDemand.toObject();
    if (populatedDemand.locationType === "Warehouse") {
      const warehouse = await Warehouse.findById(populatedDemand.location).select("name").lean();
      populatedDemand.location = warehouse;
    } else if (populatedDemand.locationType === "Outlet") {
      const outlet = await Outlet.findById(populatedDemand.location).select("name type").lean();
      populatedDemand.location = outlet;
    }

    return createSuccessResponse(populatedDemand);
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
    const { products } = body;
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

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Products array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Validate each product in the array
    for (const product of products) {
      if (!product.productId) {
        return NextResponse.json(
          { success: false, message: "Product ID is required for each product" },
          { status: 400 },
        );
      }

      if (!product.quantity || product.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Quantity must be greater than 0 for each product" },
          { status: 400 },
        );
      }

      if (!product.mrp || product.mrp <= 0) {
        return NextResponse.json(
          { success: false, message: "MRP must be greater than 0 for each product" },
          { status: 400 },
        );
      }

      if (!product.tp || product.tp <= 0) {
        return NextResponse.json(
          { success: false, message: "TP must be greater than 0 for each product" },
          { status: 400 },
        );
      }

      if (!product.expireDate) {
        return NextResponse.json(
          { success: false, message: "Expire date is required for each product" },
          { status: 400 },
        );
      }

      if (!product.batchNumber || product.batchNumber.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: "Batch number is required for each product" },
          { status: 400 },
        );
      }

      // Check if batch number already exists
      const existingBatch = await Stock.findOne({ batchNumber: product.batchNumber.trim() });
      if (existingBatch) {
        return NextResponse.json(
          { success: false, message: `Batch number '${product.batchNumber}' already exists` },
          { status: 409 },
        );
      }
    }

    // Create stock entries for each product with individual details
    const stockEntries = [];
    for (const productData of products) {
      const stockEntry = await Stock.create({
        product: productData.productId,
        location: demand.location,
        locationType: demand.locationType,
        mrp: productData.mrp,
        tp: productData.tp,
        expireDate: new Date(productData.expireDate),
        unit: productData.quantity,
        batchNumber: productData.batchNumber.trim(),
      });
      stockEntries.push(stockEntry);
    }

    // Update demand status to ConvertedToStock
    await Demand.findByIdAndUpdate(
      id,
      { status: "ConvertedToStock" },
      { new: true, runValidators: true },
    );

    // Return all created stock entries
    return createSuccessResponse(stockEntries, `Successfully converted demand to ${stockEntries.length} stock entries`);
  } catch (error) {
    console.error("Error converting demand to stock:", error);
    return createErrorResponse("Failed to convert demand to stock");
  }
} 