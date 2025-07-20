import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Order from "./model";
import Customer from "@/features/customers/model";
import Product from "@/features/products/model";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";
import OrderCounter from "@/features/orders/modelOrderCounter";
import { PaymentMethod } from "./model";

// GET /api/orders - List all orders with pagination and search
export async function handleGet(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const customerId = searchParams.get("customerId") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
    if (customerId) {
      query.customerId = customerId;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod.toUpperCase();
    }

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone")
        .populate("items.product", "name upc sku")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST /api/orders - Create a new order
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can create orders
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

    const body = await request.json();
    const {
      customerId,
      customerName,
      items,
      notes,
      discount = 0,
      paymentMethod,
    } = body;

    // Basic validation
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required" },
        { status: 400 },
      );
    }

    if (!customerName || customerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order items are required" },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400 },
      );
    }

    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Validate items and calculate totals
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          {
            success: false,
            message: "Each item must have product, quantity, and unitPrice",
          },
          { status: 400 },
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Item quantity must be greater than 0" },
          { status: 400 },
        );
      }

      if (item.unitPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Item unit price cannot be negative" },
          { status: 400 },
        );
      }

      // Validate product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item.product} not found`,
          },
          { status: 404 },
        );
      }

      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    // Apply discount
    const finalTotal = Math.max(0, totalAmount - discount);

    // Generate order number (date + daily sequence)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    // Atomically increment the sequence for today
    const counter = await OrderCounter.findOneAndUpdate(
      { date: dateStr },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    const seqNum = String(counter.seq).padStart(4, "0");
    const orderNumber = `ORD-${dateStr}-${seqNum}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customerId,
      customerName: customerName.trim(),
      items: validatedItems,
      totalAmount: finalTotal,
      discount,
      notes: notes?.trim() || "",
      paymentMethod: paymentMethod.toUpperCase() as PaymentMethod,
    });

    // Update customer statistics
    await Customer.findByIdAndUpdate(customerId, {
      $inc: {
        totalOrders: 1,
        totalSpent: finalTotal,
      },
    });

    // Populate references for response
    const populatedOrder = await Order.findById(order._id)
      .populate("customerId", "name email phone")
      .populate("items.product", "name upc sku")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: populatedOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 },
    );
  }
}

// GET /api/orders/[id] - Get a specific order
export async function handleGetById(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
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

// PUT /api/orders/[id] - Update an order
export async function handleUpdateById(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params;
  try {
    // Authorize request - only managers and admins can update orders
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
    const {
      customerId,
      customerName,
      items,
      notes,
      discount = 0,
      paymentMethod,
    } = body;

    // Check if order exists
    const existingOrder = await Order.findById(_id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required" },
        { status: 400 },
      );
    }

    if (!customerName || customerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order items are required" },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400 },
      );
    }

    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Validate items and calculate totals
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          {
            success: false,
            message: "Each item must have product, quantity, and unitPrice",
          },
          { status: 400 },
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Item quantity must be greater than 0" },
          { status: 400 },
        );
      }

      if (item.unitPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Item unit price cannot be negative" },
          { status: 400 },
        );
      }

      // Validate product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item.product} not found`,
          },
          { status: 404 },
        );
      }

      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    // Apply discount
    const finalTotal = Math.max(0, totalAmount - discount);

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      {
        customerId,
        customerName: customerName.trim(),
        items: validatedItems,
        totalAmount: finalTotal,
        discount,
        notes: notes?.trim() || "",
        paymentMethod: paymentMethod.toUpperCase() as PaymentMethod,
      },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Failed to update order" },
        { status: 500 },
      );
    }

    // Populate references for response
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("customerId", "name email phone")
      .populate("items.product", "name upc sku")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 },
    );
  }
}

// DELETE /api/orders/[id] - Delete an order
export async function handleDeleteById(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can delete orders
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

    // Check if order exists
    const order = await Order.findById(_id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    await Order.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 },
    );
  }
}

// GET /api/orders/customer/[id] - Get orders by customer
export async function handleGetByCustomer(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can view customer orders
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

    const orders = await Order.find({ customerId: _id })
      .populate("customerId", "name email phone")
      .populate("items.product", "name upc sku")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer orders" },
      { status: 500 },
    );
  }
} 