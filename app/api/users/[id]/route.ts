import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { User } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    // Authorize request - only admins can view users
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ['admin']
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    const { _id } = await params;
    const user = await User.findById(_id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    // Authorize request - only admins can update users
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ['admin']
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    const { name, email, role, isActive, avatar } = body;
    
    // Check if user exists
    const { _id } = await params;
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'User name is required' },
        { status: 400 }
      );
    }
    
    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'User email is required' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check if new email conflicts with existing user (excluding current one)
    const emailConflict = await User.findOne({
      _id: { $ne: _id },
      email: email.trim().toLowerCase()
    });
    
    if (emailConflict) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
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
        avatar: avatar || existingUser.avatar
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    // Authorize request - only admins can delete users
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requiredRoles: ['admin']
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    // Check if user exists
    const { _id } = await params;
    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent self-deletion
    if (authResult.user && authResult.user._id === _id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    await User.findByIdAndDelete(_id);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 