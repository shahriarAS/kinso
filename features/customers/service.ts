import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import CustomerModel from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/customers - List all customers with pagination and filters
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view customers
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
    const membershipActive = searchParams.get("membershipActive");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (membershipActive !== null && membershipActive !== undefined) {
      query.membershipActive = membershipActive === "true";
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "contactInfo.phone": { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    // Execute query
    const [customers, total] = await Promise.all([
      CustomerModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CustomerModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

// POST /api/customers - Create a new customer
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can create customers
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
    const { name, contactInfo, membershipActive, totalPurchaseLastMonth } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    // Create customer
    const customer = await CustomerModel.create({
      name: name.trim(),
      contactInfo: {
        phone: contactInfo?.phone?.trim() || "",
        email: contactInfo?.email?.trim() || "",
        address: contactInfo?.address?.trim() || "",
      },
      membershipActive: membershipActive || false,
      totalPurchaseLastMonth: totalPurchaseLastMonth || 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 },
    );
  }
}

// GET /api/customers/:id - Get a specific customer
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - all authenticated users can view customers
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

    const customer = await CustomerModel.findById(id).lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

// PUT /api/customers/:id - Update a customer
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - all authenticated users can update customers
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
    const { name, contactInfo, membershipActive, totalPurchaseLastMonth } = body;

    // Check if customer exists
    const existingCustomer = await CustomerModel.findById(id);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    // Update customer
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        contactInfo: {
          phone: contactInfo?.phone?.trim() || "",
          email: contactInfo?.email?.trim() || "",
          address: contactInfo?.address?.trim() || "",
        },
        membershipActive: membershipActive !== undefined ? membershipActive : existingCustomer.membershipActive,
        totalPurchaseLastMonth: totalPurchaseLastMonth !== undefined ? totalPurchaseLastMonth : existingCustomer.totalPurchaseLastMonth,
      },
      { new: true, runValidators: true },
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: "Failed to update customer" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 },
    );
  }
}

// DELETE /api/customers/:id - Delete a customer
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Authorize request - all authenticated users can delete customers
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

    // Check if customer exists
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    await CustomerModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
