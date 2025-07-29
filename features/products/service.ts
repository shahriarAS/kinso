import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "./model";
import Vendor from "@/features/vendors/model";
import Brand from "@/features/brands/model";
import Category from "@/features/categories/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
} from "@/lib/apiResponse";

// POST /api/products - Create a new product
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create products
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
    const { name, barcode, vendor, brand, category } = body;

    // Basic validation
    if (!name?.trim())
      return createValidationErrorResponse("Product name is required");
    if (!barcode?.trim())
      return createValidationErrorResponse("Product barcode is required");
    if (!vendor)
      return createValidationErrorResponse("Product vendor is required");
    if (!brand)
      return createValidationErrorResponse("Product brand is required");
    if (!category)
      return createValidationErrorResponse("Product category is required");

    // Barcode uniqueness
    if (await Product.findOne({ barcode: barcode.trim() }))
      return createErrorResponse(
        "Product with this barcode already exists",
        409,
      );

    // Check existence of vendor, brand, category
    const [vendorExists, brandExists, categoryExists] = await Promise.all([
      Vendor.findById(vendor),
      Brand.findById(brand),
      Category.findById(category),
    ]);
    if (!vendorExists) return createNotFoundResponse("Vendor");
    if (!brandExists) return createNotFoundResponse("Brand");
    if (!categoryExists) return createNotFoundResponse("Category");

    // Create product
    const product = await Product.create({
      name: name.trim(),
      barcode: barcode.trim(),
      vendor,
      brand,
      category,
    });

    return createSuccessResponse(product, "Product created successfully", 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return createErrorResponse("Failed to create product");
  }
}

// GET /api/products - List all products with pagination and search
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view products
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
    const categoryFilter = searchParams.get("category") || "";
    const brandFilter = searchParams.get("brand") || "";
    const vendorFilter = searchParams.get("vendor") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    if (categoryFilter) {
      query.category = categoryFilter;
    }
    if (brandFilter) {
      query.brand = brandFilter;
    }
    if (vendorFilter) {
      query.vendor = vendorFilter;
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("vendor", "name")
        .populate("brand", "name")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return createPaginatedResponse(products, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return createErrorResponse("Failed to fetch products");
  }
}

// GET /api/products/[id] - Get a specific product
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
    const product = await Product.findById(id)
      .populate("vendor", "name")
      .populate("brand", "name")
      .populate("category", "name")
      .lean();
    if (!product) {
      return createNotFoundResponse("Product");
    }
    return createSuccessResponse(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return createErrorResponse("Failed to fetch product");
  }
}

// PUT /api/products/[id] - Update a product
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
    const { name, barcode, vendor, brand, category } = body;
    const { id } = await params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!name?.trim())
      return createValidationErrorResponse("Product name is required");
    if (!barcode?.trim())
      return createValidationErrorResponse("Product barcode is required");
    if (!vendor)
      return createValidationErrorResponse("Product vendor is required");
    if (!brand)
      return createValidationErrorResponse("Product brand is required");
    if (!category)
      return createValidationErrorResponse("Product category is required");

    // Barcode uniqueness (exclude current product)
    if (await Product.findOne({ _id: { $ne: id }, barcode: barcode.trim() }))
      return createErrorResponse(
        "Product with this barcode already exists",
        409,
      );

    // Check existence of vendor, brand, category
    const [vendorExists, brandExists, categoryExists] = await Promise.all([
      Vendor.findById(vendor),
      Brand.findById(brand),
      Category.findById(category),
    ]);
    if (!vendorExists) return createNotFoundResponse("Vendor");
    if (!brandExists) return createNotFoundResponse("Brand");
    if (!categoryExists) return createNotFoundResponse("Category");

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        barcode: barcode.trim(),
        vendor,
        brand,
        category,
      },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Failed to update product" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id] - Delete a product
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
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    await Product.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
