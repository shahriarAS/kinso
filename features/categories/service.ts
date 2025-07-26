import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Category from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/categories - List all categories with pagination and search
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view categories
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

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { categoryId: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add additional filters
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("categoryName");
    const vatStatus = searchParams.get("vatStatus");

    if (categoryId) {
      query.categoryId = { $regex: categoryId, $options: "i" };
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: "i" };
    }

    if (vatStatus !== null && vatStatus !== undefined) {
      query.vatStatus = vatStatus === "true";
    }

    // Execute query
    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create a new category
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create categories
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
    const { categoryId, categoryName, vatStatus, description } = body;

    // Basic validation
    if (!categoryId || categoryId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 },
      );
    }

    if (!categoryName || categoryName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    // Check if categoryId already exists
    const existingCategory = await Category.findOne({
      categoryId: { $regex: new RegExp(`^${categoryId.trim()}$`, "i") },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this ID already exists" },
        { status: 409 },
      );
    }

    // Create category
    const category = await Category.create({
      categoryId: categoryId.trim(),
      categoryName: categoryName.trim(),
      vatStatus: vatStatus || false,
      description: description?.trim() || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 },
    );
  }
}

// GET /api/categories/[id] - Get a specific category
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can view categories
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

    const category = await Category.findById(_id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// PUT /api/categories/[id] - Update a category
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only managers and admins can update categories
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
    const { categoryId, categoryName, vatStatus, description } = body;

    // Check if category exists
    const existingCategory = await Category.findById(_id);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!categoryId || categoryId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 },
      );
    }

    if (!categoryName || categoryName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    // Check if new categoryId conflicts with existing category (excluding current one)
    const idConflict = await Category.findOne({
      _id: { $ne: _id },
      categoryId: { $regex: new RegExp(`^${categoryId.trim()}$`, "i") },
    });

    if (idConflict) {
      return NextResponse.json(
        { success: false, message: "Category with this ID already exists" },
        { status: 409 },
      );
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      {
        categoryId: categoryId.trim(),
        categoryName: categoryName.trim(),
        vatStatus: vatStatus || false,
        description: description?.trim() || "",
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can delete categories
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

    // Check if category exists
    const category = await Category.findById(_id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // TODO: Check if category is being used by any products
    // This would require checking the Product model for references
    // For now, we'll allow deletion but you should implement this check

    await Category.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
