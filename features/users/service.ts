import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import User from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/users - List all users with pagination and search
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - only admins can view users
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
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
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password") // Exclude password from response
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST /api/users - Create a new user
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only admins can create users
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
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
    const { name, email, password: userPassword, role } = body;

    // Basic validation
    if (!name || !email || !userPassword) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create user (password should be hashed in production)
    const user = await User.create({
      name,
      email,
      password: userPassword, // TODO: Hash password before saving
      role: role || "staff",
    });

    // Return user without password
    const userResponse = user.toObject();
    const userWithoutPassword = {
      ...userResponse,
      password: undefined,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 },
    );
  }
}

// GET /api/users/[id] - Get a specific user
export async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can view users
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    const user = await User.findById(_id).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function handleUpdateById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can update users
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
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
    const { name, email, role, isActive, avatar } = body;

    // Check if user exists
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "User name is required" },
        { status: 400 },
      );
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "User email is required" },
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

    // Check if new email conflicts with existing user (excluding current one)
    const emailConflict = await User.findOne({
      _id: { $ne: _id },
      email: email.trim().toLowerCase(),
    });

    if (emailConflict) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || existingUser.role,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        avatar: avatar || existingUser.avatar,
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> },
) {
  const { _id } = await params;
  try {
    // Authorize request - only admins can delete users
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      {
        requiredRoles: ["admin"],
      },
    );

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Prevent self-deletion
    if (authResult.user && authResult.user._id === _id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await User.findByIdAndDelete(_id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
