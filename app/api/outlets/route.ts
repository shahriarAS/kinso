import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Outlet from "@/features/outlets/model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { outletId: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Build sort query
    const sortQuery: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Get total count
    const total = await Outlet.countDocuments(searchQuery);

    // Get outlets with pagination
    const outlets = await Outlet.find(searchQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: outlets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching outlets:", error);
    return NextResponse.json(
      { message: "Failed to fetch outlets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { outletId, name } = body;

    // Validate required fields
    if (!outletId || !name) {
      return NextResponse.json(
        { message: "Outlet ID and name are required" },
        { status: 400 }
      );
    }

    // Check if outletId already exists
    const existingOutlet = await Outlet.findOne({ outletId });
    if (existingOutlet) {
      return NextResponse.json(
        { message: "Outlet ID already exists" },
        { status: 400 }
      );
    }

    // Create new outlet
    const outlet = new Outlet({
      outletId: outletId.toUpperCase(),
      name,
    });

    await outlet.save();

    return NextResponse.json(
      { message: "Outlet created successfully", data: outlet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating outlet:", error);
    return NextResponse.json(
      { message: "Failed to create outlet" },
      { status: 500 }
    );
  }
} 