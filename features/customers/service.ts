import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import CustomerModel from "./model";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";
import type { Customer, CustomerInput, CustomerFilters } from "./types";

// GET /api/customers - List all customers with pagination and search
export async function handleGet(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const email = searchParams.get("email") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    // Build sort object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const [customers, total] = await Promise.all([
      CustomerModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      CustomerModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
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

    // Check if customer already exists
    const existingCustomer = await CustomerModel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer with this email already exists" },
        { status: 409 },
      );
    }

    // Create customer
    const customer = await CustomerModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      status: status || "active",
      notes: notes?.trim() || "",
      totalOrders: 0,
      totalSpent: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
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

// GET /api/customers/[id] - Get a specific customer
export async function handleGetById(
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

    const customer = await CustomerModel.findById(_id).lean();

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
export async function handleUpdateById(
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
    const existingCustomer = await CustomerModel.findById(_id);
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
    const emailConflict = await CustomerModel.findOne({
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
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
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
export async function handleDeleteById(
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
    const customer = await CustomerModel.findById(_id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // TODO: Check if customer is being used by any orders
    // This would require checking the Order model for references
    // For now, we'll allow deletion but you should implement this check

    await CustomerModel.findByIdAndDelete(_id);

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

export class CustomerService {
  /**
   * Validate customer input data
   */
  static validateCustomerInput(data: CustomerInput): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push("Phone number is required");
    }

    if (data.status && !["active", "inactive"].includes(data.status)) {
      errors.push("Status must be either 'active' or 'inactive'");
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format customer data for display
   */
  static formatCustomerForDisplay(customer: Customer) {
    return {
      ...customer,
      name: customer.name.trim(),
      email: customer.email.toLowerCase().trim(),
      phone: customer.phone.trim(),
      totalSpent: Number(customer.totalSpent.toFixed(2)),
    };
  }

  /**
   * Prepare customer data for API submission
   */
  static prepareCustomerForSubmission(data: CustomerInput): CustomerInput {
    return {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      status: data.status || "active",
      notes: data.notes?.trim() || "",
    };
  }

  /**
   * Apply filters to customer data
   */
  static applyFilters(customers: Customer[], filters: CustomerFilters): Customer[] {
    return customers.filter((customer) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status) {
        if (customer.status !== filters.status) return false;
      }

      // Email filter
      if (filters.email) {
        const emailTerm = filters.email.toLowerCase();
        if (!customer.email.toLowerCase().includes(emailTerm)) return false;
      }

      return true;
    });
  }

  /**
   * Sort customers by specified field
   */
  static sortCustomers(
    customers: Customer[],
    sortBy: keyof Customer = "name",
    sortOrder: "asc" | "desc" = "asc"
  ): Customer[] {
    return [...customers].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === "asc" ? 1 : -1;
      if (bValue === undefined) return sortOrder === "asc" ? -1 : 1;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Get customer statistics
   */
  static getCustomerStats(customers: Customer[]) {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalSpent,
      averageSpent,
    };
  }

  /**
   * Generate customer display name
   */
  static getDisplayName(customer: Customer): string {
    return customer.name || customer.email || "Unknown Customer";
  }

  /**
   * Check if customer has recent activity
   */
  static hasRecentActivity(customer: Customer, daysThreshold: number = 30): boolean {
    // This would typically check order history
    // For now, we'll use totalOrders as a proxy
    return customer.totalOrders > 0;
  }
} 