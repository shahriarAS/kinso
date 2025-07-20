import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Customer } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

// GET /api/customers/[id] - Get a specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can view customers
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

    const customer = await Customer.findById(_id).lean();

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

// PUT /api/customers/[id] - Update a customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can update customers
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
    const { name, email, phone, status, notes } = body;

    // Check if customer exists
    const existingCustomer = await Customer.findById(_id);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer email is required" },
        { status: 400 },
      );
    }

    if (!phone || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Customer phone is required" },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if new email conflicts with existing customer (excluding current one)
    const emailConflict = await Customer.findOne({
      _id: { $ne: _id },
      email: email.trim().toLowerCase(),
    });

    if (emailConflict) {
      return NextResponse.json(
        { success: false, message: "Customer with this email already exists" },
        { status: 409 },
      );
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        status: status || "active",
        notes: notes?.trim() || "",
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
      message: "Customer updated successfully",
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

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only managers and admins can delete customers
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

    // Check if customer exists
    const customer = await Customer.findById(_id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // TODO: Check if customer is being used by any orders
    // This would require checking the Order model for references
    // For now, we'll allow deletion but you should implement this check

    await Customer.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
