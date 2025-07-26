import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import CustomerModel from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";
import type { Customer, CustomerInput, CustomerFilters } from "./types";

// GET /api/customers - List all customers with pagination and search
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
    const search = searchParams.get("search") || "";
    const membershipStatus = searchParams.get("membershipStatus");
    const customerName = searchParams.get("customerName") || "";
    const sortBy = searchParams.get("sortBy") || "customerName";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { customerId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { contactInfo: { $regex: search, $options: "i" } },
      ];
    }
    if (membershipStatus !== null && membershipStatus !== undefined) {
      query.membershipStatus = membershipStatus === "true";
    }
    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" };
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
    const { customerId, customerName, contactInfo, purchaseAmount, membershipStatus } = body;

    // Basic validation
    if (!customerId || customerId.trim().length === 0) {
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

    if (!contactInfo || contactInfo.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Contact information is required" },
        { status: 400 },
      );
    }

    // Check if customer already exists
    const existingCustomer = await CustomerModel.findOne({
      customerId: customerId.trim(),
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer with this ID already exists" },
        { status: 409 },
      );
    }

    // Create customer
    const customer = await CustomerModel.create({
      customerId: customerId.trim(),
      customerName: customerName.trim(),
      contactInfo: contactInfo.trim(),
      purchaseAmount: purchaseAmount || 0,
      membershipStatus: membershipStatus || false,
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
    const { customerId, customerName, contactInfo, purchaseAmount, membershipStatus } = body;

    // Check if customer exists
    const existingCustomer = await CustomerModel.findById(_id);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!customerId || customerId.trim().length === 0) {
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

    if (!contactInfo || contactInfo.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Contact information is required" },
        { status: 400 },
      );
    }

    // Check if new customerId conflicts with existing customer (excluding current one)
    const customerIdConflict = await CustomerModel.findOne({
      _id: { $ne: _id },
      customerId: customerId.trim(),
    });

    if (customerIdConflict) {
      return NextResponse.json(
        { success: false, message: "Customer with this ID already exists" },
        { status: 409 },
      );
    }

    // Update customer
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      _id,
      {
        customerId: customerId.trim(),
        customerName: customerName.trim(),
        contactInfo: contactInfo.trim(),
        purchaseAmount: purchaseAmount || 0,
        membershipStatus: membershipStatus || false,
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
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin", "manager"],
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

// PUT /api/customers/membership/[id] - Update membership status
export async function handleUpdateMembership(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - all authenticated users can update membership
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
    const { membershipStatus } = body;

    // Check if customer exists
    const existingCustomer = await CustomerModel.findById(_id);
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Update membership status
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      _id,
      { membershipStatus: Boolean(membershipStatus) },
      { new: true, runValidators: true },
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: "Failed to update membership status" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Membership status updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating membership status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update membership status" },
      { status: 500 },
    );
  }
}

// GET /api/customers/membership/[status] - Get customers by membership status
export async function handleGetByMembership(
  request: NextRequest,
  { params }: { params: Promise<{ membershipStatus: string }> },
) {
  const { membershipStatus } = await params;
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
    const limit = parseInt(searchParams.get("limit") || "10");

    const customers = await CustomerModel.find({
      membershipStatus: membershipStatus === "true",
    })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers by membership:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

// GET /api/customers/stats - Get customer statistics
export async function handleGetStats(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view stats
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

    const [
      totalCustomers,
      members,
      nonMembers,
      newCustomersThisMonth,
      totalPurchaseAmount,
    ] = await Promise.all([
      CustomerModel.countDocuments(),
      CustomerModel.countDocuments({ membershipStatus: true }),
      CustomerModel.countDocuments({ membershipStatus: false }),
      CustomerModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      CustomerModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$purchaseAmount" },
            average: { $avg: "$purchaseAmount" },
          },
        },
      ]),
    ]);

    const averagePurchaseAmount = totalPurchaseAmount[0]?.average || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        members,
        nonMembers,
        newCustomersThisMonth,
        averagePurchaseAmount,
        totalPurchaseAmount: totalPurchaseAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer statistics" },
      { status: 500 },
    );
  }
}

// POST /api/customers/membership/auto-activate - Auto-activate membership based on purchase threshold
export async function handleAutoActivateMembership(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can auto-activate membership
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
    const { threshold = 1000 } = body;

    // Find customers who meet the threshold but don't have membership
    const eligibleCustomers = await CustomerModel.find({
      purchaseAmount: { $gte: threshold },
      membershipStatus: false,
    });

    if (eligibleCustomers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No customers eligible for membership activation",
        data: { updatedCount: 0 },
      });
    }

    // Update membership status for eligible customers
    const updateResult = await CustomerModel.updateMany(
      {
        purchaseAmount: { $gte: threshold },
        membershipStatus: false,
      },
      { membershipStatus: true }
    );

    return NextResponse.json({
      success: true,
      message: `Membership activated for ${updateResult.modifiedCount} customers`,
      data: { updatedCount: updateResult.modifiedCount },
    });
  } catch (error) {
    console.error("Error auto-activating membership:", error);
    return NextResponse.json(
      { success: false, message: "Failed to auto-activate membership" },
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

    if (!data.customerId || data.customerId.trim().length === 0) {
      errors.push("Customer ID is required");
    }

    if (!data.customerName || data.customerName.trim().length === 0) {
      errors.push("Customer name is required");
    }

    if (!data.contactInfo || data.contactInfo.trim().length === 0) {
      errors.push("Contact information is required");
    }

    if (data.purchaseAmount < 0) {
      errors.push("Purchase amount cannot be negative");
    }

    return errors;
  }

  /**
   * Format customer data for display
   */
  static formatCustomerForDisplay(customer: Customer) {
    return {
      ...customer,
      customerId: customer.customerId.trim(),
      customerName: customer.customerName.trim(),
      contactInfo: customer.contactInfo.trim(),
      purchaseAmount: Number(customer.purchaseAmount.toFixed(2)),
    };
  }

  /**
   * Prepare customer data for API submission
   */
  static prepareCustomerForSubmission(data: CustomerInput): CustomerInput {
    return {
      customerId: data.customerId.trim(),
      customerName: data.customerName.trim(),
      contactInfo: data.contactInfo.trim(),
      purchaseAmount: data.purchaseAmount || 0,
      membershipStatus: data.membershipStatus || false,
    };
  }

  /**
   * Apply filters to customer data
   */
  static applyFilters(
    customers: Customer[],
    filters: CustomerFilters,
  ): Customer[] {
    return customers.filter((customer) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          customer.customerId.toLowerCase().includes(searchTerm) ||
          customer.customerName.toLowerCase().includes(searchTerm) ||
          customer.contactInfo.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Membership status filter
      if (filters.membershipStatus !== undefined) {
        if (customer.membershipStatus !== filters.membershipStatus) return false;
      }

      // Customer name filter
      if (filters.customerName) {
        const nameTerm = filters.customerName.toLowerCase();
        if (!customer.customerName.toLowerCase().includes(nameTerm)) return false;
      }

      return true;
    });
  }

  /**
   * Sort customers by specified field
   */
  static sortCustomers(
    customers: Customer[],
    sortBy: keyof Customer = "customerName",
    sortOrder: "asc" | "desc" = "asc",
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
    const members = customers.filter((c) => c.membershipStatus).length;
    const nonMembers = totalCustomers - members;
    const totalPurchaseAmount = customers.reduce((sum, c) => sum + c.purchaseAmount, 0);
    const averagePurchaseAmount = totalCustomers > 0 ? totalPurchaseAmount / totalCustomers : 0;

    return {
      totalCustomers,
      members,
      nonMembers,
      totalPurchaseAmount,
      averagePurchaseAmount,
    };
  }

  /**
   * Generate customer display name
   */
  static getDisplayName(customer: Customer): string {
    return customer.customerName || customer.customerId || "Unknown Customer";
  }

  /**
   * Check if customer qualifies for membership based on purchase amount
   */
  static checkMembershipEligibility(
    customer: Customer,
    threshold: number = 1000,
  ): boolean {
    return customer.purchaseAmount >= threshold;
  }

  /**
   * Update membership status based on purchase amount
   */
  static updateMembershipStatus(
    customer: Customer,
    threshold: number = 1000,
  ): boolean {
    return this.checkMembershipEligibility(customer, threshold);
  }
}
