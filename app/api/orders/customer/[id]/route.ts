import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { Order } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/orders/customer/[id] - Get orders by customer ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
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

    const { _id } = await params;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get orders for the specific customer
    const orders = await Order.find({ customerId: _id })
      .populate('customerId', 'name email phone')
      .populate('items.product', 'name upc')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page: 1,
        limit: orders.length,
        total: orders.length,
        totalPages: 1
      }
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer orders' },
      { status: 500 }
    );
  }
} 