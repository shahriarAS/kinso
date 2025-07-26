import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

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
    const { productId, name, barcode, vendorId, brandId, categoryId } = body;

    // Basic validation
    if (!productId || productId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product name is required" },
        { status: 400 },
      );
    }

    if (!barcode || barcode.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product barcode is required" },
        { status: 400 },
      );
    }

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Product vendor is required" },
        { status: 400 },
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { success: false, message: "Product brand is required" },
        { status: 400 },
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Product category is required" },
        { status: 400 },
      );
    }

    // Check if product already exists with same productId
    const existingProductWithId = await Product.findOne({ productId: productId.trim() });
    if (existingProductWithId) {
      return NextResponse.json(
        { success: false, message: "Product with this ID already exists" },
        { status: 409 },
      );
    }

    // Check if product already exists with same barcode
    const existingProductWithBarcode = await Product.findOne({ barcode: barcode.trim() });
    if (existingProductWithBarcode) {
      return NextResponse.json(
        { success: false, message: "Product with this barcode already exists" },
        { status: 409 },
      );
    }

    // Create product
    const product = await Product.create({
      productId: productId.trim(),
      name: name.trim(),
      barcode: barcode.trim(),
      vendorId,
      brandId,
      categoryId,
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 },
    );
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

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// GET /api/products/[productId] - Get a specific product
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
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
    const { productId } = await params;
    const product = await Product.findOne({ productId }).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT /api/products/[productId] - Update a product
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
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
    const { name, barcode, vendorId, brandId, categoryId } = body;
    const { productId } = await params;
    
    const existingProduct = await Product.findOne({ productId });
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product name is required" },
        { status: 400 },
      );
    }
    if (!barcode || barcode.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product barcode is required" },
        { status: 400 },
      );
    }
    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Product vendor is required" },
        { status: 400 },
      );
    }
    if (!brandId) {
      return NextResponse.json(
        { success: false, message: "Product brand is required" },
        { status: 400 },
      );
    }
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Product category is required" },
        { status: 400 },
      );
    }

    // Check for barcode conflict with other products
    const barcodeConflict = await Product.findOne({
      productId: { $ne: productId },
      barcode: barcode.trim(),
    });
    if (barcodeConflict) {
      return NextResponse.json(
        { success: false, message: "Product with this barcode already exists" },
        { status: 409 },
      );
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      {
        name: name.trim(),
        barcode: barcode.trim(),
        vendorId,
        brandId,
        categoryId,
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

// DELETE /api/products/[productId] - Delete a product
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
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
    const { productId } = await params;
    const product = await Product.findOne({ productId });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    await Product.findOneAndDelete({ productId });
    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
