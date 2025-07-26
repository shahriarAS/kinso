import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Product from "./model";
import Category from "@/features/categories/model";
import Warehouse from "@/features/warehouses/model";
import Vendor from "@/features/vendors/model";
import Brand from "@/features/brands/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/products - List all products with pagination, search, and filters
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
    const barcode = searchParams.get("barcode") || "";
    const vendorId = searchParams.get("vendorId") || "";
    const brandId = searchParams.get("brandId") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const warehouse = searchParams.get("warehouse") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }
    if (barcode) {
      query.barcode = { $regex: barcode, $options: "i" };
    }
    if (vendorId) {
      query.vendorId = vendorId;
    }
    if (brandId) {
      query.brandId = brandId;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (warehouse) {
      query["stock.warehouse"] = warehouse;
    }
    if (lowStock) {
      query["stock.unit"] = { $lt: 10 }; // Less than 10 units
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("vendorId", "vendorId vendorName")
        .populate("brandId", "brandId brandName")
        .populate("categoryId", "categoryId categoryName")
        .populate("stock.warehouse", "name location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
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
    const { name, barcode, vendorId, brandId, categoryId, warranty, stock } = body;

    // Basic validation
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

    if (!stock || !Array.isArray(stock) || stock.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product stock information is required" },
        { status: 400 },
      );
    }

    // Validate stock data
    for (const stockItem of stock) {
      if (!stockItem.warehouse || !stockItem.mrp) {
        return NextResponse.json(
          {
            success: false,
            message: "Each stock item must have warehouse and mrp",
          },
          { status: 400 },
        );
      }

      if ((stockItem.dp && stockItem.dp < 0) || stockItem.mrp < 0) {
        return NextResponse.json(
          { success: false, message: "Prices cannot be negative" },
          { status: 400 },
        );
      }

      if (stockItem.unit < 0) {
        return NextResponse.json(
          { success: false, message: "Stock unit cannot be negative" },
          { status: 400 },
        );
      }
    }

    // Check if product already exists with same barcode
    const existingProductWithBarcode = await Product.findOne({ barcode: barcode.trim() });
    if (existingProductWithBarcode) {
      return NextResponse.json(
        { success: false, message: "Product with this barcode already exists" },
        { status: 409 },
      );
    }

    // Validate vendor exists
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }

    // Validate brand exists
    const brandExists = await Brand.findById(brandId);
    if (!brandExists) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 },
      );
    }

    // Validate category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // Validate warehouses exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const warehouseIds = stock.map((s: any) => s.warehouse);
    const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
    if (warehouses.length !== warehouseIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more warehouses not found" },
        { status: 404 },
      );
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      barcode: barcode.trim(),
      vendorId,
      brandId,
      categoryId,
      warranty,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stock: stock.map((s: any) => ({
        warehouse: s.warehouse,
        unit: s.unit || 0,
        dp: s.dp,
        mrp: s.mrp,
      })),
    });

    // Populate references for response
    const populatedProduct = await Product.findById(product._id)
      .populate("vendorId", "vendorId vendorName")
      .populate("brandId", "brandId brandName")
      .populate("categoryId", "categoryId categoryName")
      .populate("stock.warehouse", "name location")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: populatedProduct,
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

// GET /api/products/[id] - Get a specific product
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
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
    const { _id } = await params;
    const product = await Product.findById(_id)
      .populate("vendorId", "vendorId vendorName")
      .populate("brandId", "brandId brandName")
      .populate("categoryId", "categoryId categoryName")
      .populate("stock.warehouse", "name location")
      .lean();
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

// PUT /api/products/[id] - Update a product
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
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
    const { name, barcode, vendorId, brandId, categoryId, warranty, stock } = body;
    const { _id } = await params;
    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
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
    if (!stock || !Array.isArray(stock) || stock.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product stock information is required" },
        { status: 400 },
      );
    }
    for (const stockItem of stock) {
      if (!stockItem.warehouse || !stockItem.mrp) {
        return NextResponse.json(
          {
            success: false,
            message: "Each stock item must have warehouse and mrp",
          },
          { status: 400 },
        );
      }
      if (stockItem.dp < 0 || stockItem.mrp < 0) {
        return NextResponse.json(
          { success: false, message: "Prices cannot be negative" },
          { status: 400 },
        );
      }
      if (stockItem.unit < 0) {
        return NextResponse.json(
          { success: false, message: "Stock unit cannot be negative" },
          { status: 400 },
        );
      }
    }
    const barcodeConflict = await Product.findOne({
      _id: { $ne: _id },
      barcode: barcode.trim(),
    });
    if (barcodeConflict) {
      return NextResponse.json(
        { success: false, message: "Product with this barcode already exists" },
        { status: 409 },
      );
    }
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }
    const brandExists = await Brand.findById(brandId);
    if (!brandExists) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 },
      );
    }
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }
    const warehouseIds = stock.map((s: any) => s.warehouse);
    const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
    if (warehouses.length !== warehouseIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more warehouses not found" },
        { status: 404 },
      );
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        barcode: barcode.trim(),
        vendorId,
        brandId,
        categoryId,
        warranty,
        stock: stock.map((s: any) => ({
          warehouse: s.warehouse,
          unit: s.unit || 0,
          dp: s.dp,
          mrp: s.mrp,
        })),
      },
      { new: true, runValidators: true },
    );
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Failed to update product" },
        { status: 500 },
      );
    }
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate("vendorId", "vendorId vendorName")
      .populate("brandId", "brandId brandName")
      .populate("categoryId", "categoryId categoryName")
      .populate("stock.warehouse", "name location")
      .lean();
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: populatedProduct,
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
  { params }: { params: Promise<{ _id: string }> },
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
    const { _id } = await params;
    const product = await Product.findById(_id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    // TODO: Check if product is being used by any orders
    await Product.findByIdAndDelete(_id);
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
