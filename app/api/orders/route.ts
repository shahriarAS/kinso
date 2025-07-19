import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { Order, Customer, Product } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/orders - List all orders with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view orders
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
    const customerId = searchParams.get('customerId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (customerId) {
      query.customerId = customerId;
    }
    
    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'name email phone')
        .populate('items.product', 'name upc')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can create orders
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
    
    const body = await request.json();
    const { customerId, customerName, items, notes, discount = 0 } = body;
    
    // Basic validation
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!customerName || customerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      );
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      );
    }
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Validate items and calculate totals
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.product || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { success: false, message: 'Each item must have product, quantity, and unitPrice' },
          { status: 400 }
        );
      }
      
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: 'Item quantity must be greater than 0' },
          { status: 400 }
        );
      }
      
      if (item.unitPrice < 0) {
        return NextResponse.json(
          { success: false, message: 'Item unit price cannot be negative' },
          { status: 400 }
        );
      }
      
      // Validate product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${item.product} not found` },
          { status: 404 }
        );
      }
      
      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice
      });
    }

    // Apply discount
    const finalTotal = Math.max(0, totalAmount - discount);
    
    // Generate order number (you might want to implement a more sophisticated numbering system)
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create order
    const order = await Order.create({
      orderNumber,
      customerId,
      customerName: customerName.trim(),
      items: validatedItems,
      totalAmount: finalTotal,
      discount,
      notes: notes?.trim() || ''
    });
    
    // Update customer statistics
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { 
        totalOrders: 1, 
        totalSpent: finalTotal 
      }
    });
    
    // Populate references for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email phone')
      .populate('items.product', 'name upc')
      .lean();
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
} 