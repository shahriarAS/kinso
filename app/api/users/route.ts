import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { User } from "@/models";
import { authorizeRequest, AuthenticatedRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Authorize request - only admins can view users
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

export async function POST(request: NextRequest) {
  try {
    // Authorize request - only admins can create users
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
    const { password: _, ...userWithoutPassword } = userResponse;

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
