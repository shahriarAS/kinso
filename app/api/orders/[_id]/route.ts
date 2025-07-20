import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Order } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can view orders
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

    const order = await Order.findById(_id)
      .populate("customerId", "name email phone")
      .populate("items.product", "name upc sku")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// // PUT /api/orders/[id] - Update an order
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ _id: string }> }
// ) {
//   const { _id } = await params;
//   try {
//     // Authorize request - only managers and admins can update orders
//     const authResult = await authorizeRequest(request as AuthenticatedRequest, {
//       requiredRoles: ['admin', 'manager']
//     });

//     if (!authResult.success) {
//       return NextResponse.json(
//         { success: false, message: authResult.error },
//         { status: authResult.status || 401 }
//       );
//     }

//     await dbConnect();

//     const body = await request.json();
//     const { customerId, customerName, items, notes } = body;

//     // Check if order exists
//     const existingOrder = await Order.findById(_id);
//     if (!existingOrder) {
//       return NextResponse.json(
//         { success: false, message: 'Order not found' },
//         { status: 404 }
//       );
//     }

//     // Basic validation
//     if (!customerId) {
//       return NextResponse.json(
//         { success: false, message: 'Customer ID is required' },
//         { status: 400 }
//       );
//     }

//     if (!customerName || customerName.trim().length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Customer name is required' },
//         { status: 400 }
//       );
//     }

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Order items are required' },
//         { status: 400 }
//       );
//     }

//     // Validate customer exists
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return NextResponse.json(
//         { success: false, message: 'Customer not found' },
//         { status: 404 }
//       );
//     }

//     // Validate items and calculate totals
//     let totalAmount = 0;
//     const validatedItems = [];

//     for (const item of items) {
//       if (!item.product || !item.quantity || !item.unitPrice) {
//         return NextResponse.json(
//           { success: false, message: 'Each item must have product, quantity, and unitPrice' },
//           { status: 400 }
//         );
//       }

//       if (item.quantity <= 0) {
//         return NextResponse.json(
//           { success: false, message: 'Item quantity must be greater than 0' },
//           { status: 400 }
//         );
//       }

//       if (item.unitPrice < 0) {
//         return NextResponse.json(
//           { success: false, message: 'Item unit price cannot be negative' },
//           { status: 400 }
//         );
//       }

//       // Validate product exists
//       const product = await Product.findById(item.product);
//       if (!product) {
//         return NextResponse.json(
//           { success: false, message: `Product with ID ${item.product} not found` },
//           { status: 404 }
//         );
//       }

//       const totalPrice = item.quantity * item.unitPrice;
//       totalAmount += totalPrice;

//       validatedItems.push({
//         product: item.product,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         totalPrice
//       });
//     }

//     // Calculate the difference in total amount for customer statistics update
//     const amountDifference = totalAmount - existingOrder.totalAmount;

//     // Update order
//     const updatedOrder = await Order.findByIdAndUpdate(
//       _id,
//       {
//         customerId,
//         customerName: customerName.trim(),
//         items: validatedItems,
//         totalAmount,
//         notes: notes?.trim() || ''
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedOrder) {
//       return NextResponse.json(
//         { success: false, message: 'Failed to update order' },
//         { status: 500 }
//       );
//     }

//     // Update customer statistics if customer changed or amount changed
//     if (existingOrder.customerId.toString() !== customerId || amountDifference !== 0) {
//       // Decrease stats for old customer
//       if (existingOrder.customerId.toString() !== customerId) {
//         await Customer.findByIdAndUpdate(existingOrder.customerId, {
//           $inc: {
//             totalOrders: -1,
//             totalSpent: -existingOrder.totalAmount
//           }
//         });
//       } else {
//         // Same customer, just update the amount difference
//         await Customer.findByIdAndUpdate(customerId, {
//           $inc: { totalSpent: amountDifference }
//         });
//       }

//       // Increase stats for new customer (if different)
//       if (existingOrder.customerId.toString() !== customerId) {
//         await Customer.findByIdAndUpdate(customerId, {
//           $inc: {
//             totalOrders: 1,
//             totalSpent: totalAmount
//           }
//         });
//       }
//     }

//     // Populate references for response
//     const populatedOrder = await Order.findById(updatedOrder._id)
//       .populate('customerId', 'name email phone')
//       .populate('items.product', 'name upc sku')
//       .lean();

//     return NextResponse.json({
//       success: true,
//       message: 'Order updated successfully',
//       data: populatedOrder
//     });

//   } catch (error) {
//     console.error('Error updating order:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to update order' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/orders/[id] - Delete an order
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ _id: string }> }
// ) {
//   const { _id } = await params;
//   try {
//     // Authorize request - only admins can delete orders
//     const authResult = await authorizeRequest(request as AuthenticatedRequest, {
//       requiredRoles: ['admin']
//     });

//     if (!authResult.success) {
//       return NextResponse.json(
//         { success: false, message: authResult.error },
//         { status: authResult.status || 401 }
//       );
//     }

//     await dbConnect();

//     // Check if order exists
//     const order = await Order.findById(_id);
//     if (!order) {
//       return NextResponse.json(
//         { success: false, message: 'Order not found' },
//         { status: 404 }
//       );
//     }

//     // Update customer statistics before deleting
//     await Customer.findByIdAndUpdate(order.customerId, {
//       $inc: {
//         totalOrders: -1,
//         totalSpent: -order.totalAmount
//       }
//     });

//     await Order.findByIdAndDelete(_id);

//     return NextResponse.json({
//       success: true,
//       message: 'Order deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting order:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to delete order' },
//       { status: 500 }
//     );
//   }
// }
