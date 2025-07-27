import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale from "./model";
import Customer from "@/features/customers/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// POST /api/sales - Create a new sale
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can create sales
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

    const body = await request.json();
    const { outlet, customer, items, paymentMethod, discountAmount, notes } = body;

    // Basic validation
    if (!outlet) {
      return NextResponse.json(
        { success: false, message: "Outlet is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items array is required and cannot be empty" },
        { status: 400 },
      );
    }

    if (!paymentMethod || !["CASH", "BKASH", "ROCKET", "NAGAD", "BANK", "CARD"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "Valid payment method is required" },
        { status: 400 },
      );
    }

    // Validate items array
    for (const item of items) {
      if (!item.stock || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { success: false, message: "Each item must have stock, quantity, and unitPrice" },
          { status: 400 },
        );
      }
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Item quantity must be greater than 0" },
          { status: 400 },
        );
      }
      if (item.unitPrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Item unit price must be greater than 0" },
          { status: 400 },
        );
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) - (discountAmount || 0);

    // Generate sale ID
    const saleId = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get user from auth
    const userId = authResult.user?._id;

    // Create sale
    const sale = await Sale.create({
      saleId,
      outlet,
      customer: customer || null,
      saleDate: new Date().toISOString().split('T')[0],
      items,
      totalAmount,
      paymentMethod,
      discountAmount: discountAmount || 0,
      notes: notes || "",
      createdBy: userId,
    });

    // Update customer statistics if customer exists
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: {
          totalOrders: 1,
          totalSpent: totalAmount,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sale created successfully",
        data: sale,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create sale" },
      { status: 500 },
    );
  }
}

// GET /api/sales - List all sales with pagination and filters
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view sales
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
    const outlet = searchParams.get("outlet");
    const customer = searchParams.get("customer");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMethod = searchParams.get("paymentMethod");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (outlet) {
      query.outlet = outlet;
    }
    if (customer) {
      query.customer = customer;
    }
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) {
        query.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.totalAmount.$lte = parseFloat(maxAmount);
      }
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    if (search) {
      query.$or = [
        { saleId: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with population
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("outlet", "name")
        .populate("customer", "name")
        .populate("createdBy", "name")
        .populate("items.stock", "product")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sales" },
      { status: 500 },
    );
  }
}

// GET /api/sales/[id] - Get a specific sale
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
    const sale = await Sale.findOne({ saleId: id })
      .populate("outlet", "name")
      .populate("customer", "name")
      .populate("createdBy", "name")
      .populate("items.stock", "product")
      .lean();
    if (!sale) {
      return NextResponse.json(
        { success: false, message: "Sale not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sale" },
      { status: 500 },
    );
  }
}

// PUT /api/sales/[id] - Update a sale (Error Correction)
export async function handlePut(
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
    const body = await request.json();
    const { outlet, customer, items, totalAmount, paymentMethod, discountAmount, notes } = body;
    const { id } = await params;
    
    const existingSale = await Sale.findOne({ saleId: id });
    if (!existingSale) {
      return NextResponse.json(
        { success: false, message: "Sale not found" },
        { status: 404 },
      );
    }

    // Validation
    if (!outlet) {
      return NextResponse.json(
        { success: false, message: "Outlet is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items array is required and cannot be empty" },
        { status: 400 },
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Total amount is required and must be greater than 0" },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400 },
      );
    }

    // Validate items array
    for (const item of items) {
      if (!item.stock || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { success: false, message: "Each item must have stock, quantity, and unitPrice" },
          { status: 400 },
        );
      }
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Item quantity must be greater than 0" },
          { status: 400 },
        );
      }
      if (item.unitPrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Item unit price must be greater than 0" },
          { status: 400 },
        );
      }
    }

    const updatedSale = await Sale.findOneAndUpdate(
      { saleId: id },
      {
        outlet,
        customer: customer || null,
        items,
        totalAmount,
        paymentMethod,
        discountAmount: discountAmount || 0,
        notes: notes || "",
      },
      { new: true, runValidators: true },
    );

    if (!updatedSale) {
      return NextResponse.json(
        { success: false, message: "Failed to update sale" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update sale" },
      { status: 500 },
    );
  }
}

// DELETE /api/sales/[id] - Delete a sale
export async function handleDelete(
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
    const sale = await Sale.findOne({ saleId: id });
    if (!sale) {
      return NextResponse.json(
        { success: false, message: "Sale not found" },
        { status: 404 },
      );
    }
    await Sale.findOneAndDelete({ saleId: id });
    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete sale" },
      { status: 500 },
    );
  }
}
