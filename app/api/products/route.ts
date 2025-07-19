import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { Product, Category, Warehouse } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/products - List all products with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view products
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requireAuth: true
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const warehouse = searchParams.get('warehouse') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { upc: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (warehouse) {
      query['stock.warehouse'] = warehouse;
    }
    if (lowStock) {
      query['stock.unit'] = { $lt: 10 }; // Less than 10 units
    }
    
    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('stock.warehouse', 'name location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can create products
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ['admin', 'manager']
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { name, upc, category, stock } = body;
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name is required' },
        { status: 400 }
      );
    }
    
    if (!upc || upc.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product UPC is required' },
        { status: 400 }
      );
    }
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Product category is required' },
        { status: 400 }
      );
    }
    
    if (!stock || !Array.isArray(stock) || stock.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product stock information is required' },
        { status: 400 }
      );
    }
    
    // Validate stock data
    for (const stockItem of stock) {
      if (!stockItem.warehouse || !stockItem.dp || !stockItem.mrp) {
        return NextResponse.json(
          { success: false, message: 'Each stock item must have warehouse, dp, and mrp' },
          { status: 400 }
        );
      }
      
      if (stockItem.dp < 0 || stockItem.mrp < 0) {
        return NextResponse.json(
          { success: false, message: 'Prices cannot be negative' },
          { status: 400 }
        );
      }
      
      if (stockItem.unit < 0) {
        return NextResponse.json(
          { success: false, message: 'Stock unit cannot be negative' },
          { status: 400 }
        );
      }
    }
    
    // Check if product already exists
    const existingProduct = await Product.findOne({ upc: upc.trim() });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product with this UPC already exists' },
        { status: 409 }
      );
    }
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Validate warehouses exist
    const warehouseIds = stock.map((s: any) => s.warehouse);
    const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
    if (warehouses.length !== warehouseIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more warehouses not found' },
        { status: 404 }
      );
    }
    
    // Create product
    const product = await Product.create({
      name: name.trim(),
      upc: upc.trim(),
      category,
      stock: stock.map((s: any) => ({
        warehouse: s.warehouse,
        unit: s.unit || 0,
        dp: s.dp,
        mrp: s.mrp
      }))
    });
    
    // Populate references for response
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('stock.warehouse', 'name location')
      .lean();
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
} 