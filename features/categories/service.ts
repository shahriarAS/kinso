import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Category from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/categories - List all categories with pagination
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

    const skip = (page - 1) * limit;

    // Execute query
    const [categories, total] = await Promise.all([
      Category.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
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
    const { categoryId, name, applyVAT } = body;

    // Basic validation
    if (!categoryId || categoryId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length === 0) {
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
      name: name.trim(),
      applyVAT: applyVAT || false,
    });

    return NextResponse.json(
      {
        success: true,
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

// GET /api/categories/:categoryId - Get a specific category
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
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

    const category = await Category.findOne({ categoryId }).lean();

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

// PUT /api/categories/:categoryId - Update a category
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
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
    const { name, applyVAT } = body;

    // Check if category exists
    const existingCategory = await Category.findOne({ categoryId });
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    // Update category
    const updatedCategory = await Category.findOneAndUpdate(
      { categoryId },
      {
        name: name.trim(),
        applyVAT: applyVAT !== undefined ? applyVAT : existingCategory.applyVAT,
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
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

// DELETE /api/categories/:categoryId - Delete a category
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
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
    const category = await Category.findOne({ categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // TODO: Check if category is being used by any products
    // This would require checking the Product model for references
    // For now, we'll allow deletion but you should implement this check

    await Category.findOneAndDelete({ categoryId });

    return NextResponse.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
