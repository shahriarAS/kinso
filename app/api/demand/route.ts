import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Demand from "@/features/demand/model";
import { authenticateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const outletId = searchParams.get("outletId");
    const warehouseId = searchParams.get("warehouseId");
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "demandDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: any = {};

    if (search) {
      query.$or = [
        { demandId: { $regex: search, $options: "i" } },
      ];
    }

    if (outletId) query.outletId = outletId;
    if (warehouseId) query.warehouseId = warehouseId;
    if (productId) query.productId = productId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.demandDate = {};
      if (startDate) query.demandDate.$gte = new Date(startDate);
      if (endDate) query.demandDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [demands, total] = await Promise.all([
      Demand.find(query)
        .populate("outletId", "name outletId")
        .populate("productId", "name barcode")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit),
      Demand.countDocuments(query),
    ]);

    return NextResponse.json({
      data: demands,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Demand fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { outletId, warehouseId, productId, quantity, demandDate } = body;

    // Generate unique demand ID
    const timestamp = Date.now().toString();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const demandId = `DEM${timestamp.slice(-6)}${randomSuffix}`;

    const demand = new Demand({
      demandId,
      outletId: outletId || null,
      warehouseId: warehouseId || null,
      productId,
      quantity,
      demandDate: demandDate || new Date(),
      status: "pending",
    });

    await demand.save();

    const populatedDemand = await demand.populate([
      { path: "outletId", select: "name outletId" },
      { path: "productId", select: "name barcode" },
    ]);

    return NextResponse.json({
      message: "Demand created successfully",
      data: populatedDemand,
    });
  } catch (error) {
    console.error("Demand creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 