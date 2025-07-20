import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Category } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

// GET /api/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can view categories
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requireAuth: true,
    });

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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only managers and admins can update categories
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ["admin", "manager"],
    });

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, description } = body;

    // Check if category exists
    const existingCategory = await Category.findById(_id);
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

    // Check if new name conflicts with existing category (excluding current one)
    const nameConflict = await Category.findOne({
      _id: { $ne: _id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 409 },
      );
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can delete categories
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ["admin"],
    });

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
