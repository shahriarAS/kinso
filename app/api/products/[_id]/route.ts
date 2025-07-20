import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { Product, Category, Warehouse } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
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
    
    const { _id } = await params;

    const product = await Product.findById(_id)
      .populate('category', 'name')
      .populate('stock.warehouse', 'name location')
      .lean();
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    // Authorize request - only managers and admins can update products
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
    const { name, sku, upc, category, stock } = body;
    
    // Check if product exists
    const { _id } = await params;
    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name is required' },
        { status: 400 }
      );
    }
    
    if (!sku || sku.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product SKU is required' },
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

    // Check if new UPC conflicts with existing product (excluding current one)
    const upcConflict = await Product.findOne({
      _id: { $ne: _id },
      upc: upc.trim()
    });
    
    if (upcConflict) {
      return NextResponse.json(
        { success: false, message: 'Product with this UPC already exists' },
        { status: 409 }
      );
    }

    // Check if new SKU conflicts with existing product (excluding current one)
    const skuConflict = await Product.findOne({
      _id: { $ne: _id },
      sku: sku.trim()
    });
    
    if (skuConflict) {
      return NextResponse.json(
        { success: false, message: 'Product with this SKU already exists' },
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
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        sku: sku.trim(),
        upc: upc.trim(),
        category,
        stock: stock.map((s: any) => ({
          warehouse: s.warehouse,
          unit: s.unit || 0,
          dp: s.dp,
          mrp: s.mrp
        }))
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 500 }
      );
    }
    
    // Populate references for response
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('category', 'name')
      .populate('stock.warehouse', 'name location')
      .lean();
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: populatedProduct
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    // Authorize request - only admins can delete products
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ['admin']
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    // Check if product exists
    const { _id } = await params;
    const product = await Product.findById(_id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // TODO: Check if product is being used by any orders
    // This would require checking the Order model for references
    // For now, we'll allow deletion but you should implement this check
    
    await Product.findByIdAndDelete(_id);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 