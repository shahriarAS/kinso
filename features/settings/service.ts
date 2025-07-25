import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Settings from "./model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

// GET /api/settings - Get settings (singleton)
export async function handleGet(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can view settings
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      { requireAuth: true },
    );
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }
    await dbConnect();
    const settings = await Settings.getSingleton();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// POST /api/settings - Update settings (singleton)
export async function handlePost(request: NextRequest) {
  try {
    // Authorize request - only managers and admins can update settings
    const authResult = await authorizeRequest(
      request as NextRequest & AuthenticatedRequest,
      { requiredRoles: ["admin", "manager"] },
    );
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 },
      );
    }
    await dbConnect();
    const body = await request.json();
    const { invoiceFooter, invoiceFooterTitle, companyName, companyEmail, companyPhone, companyAddress } = body;
    const settings = await Settings.getSingleton();
    if (typeof invoiceFooter === "string") {
      settings.invoiceFooter = invoiceFooter;
    }
    if (typeof invoiceFooterTitle === "string") {
      settings.invoiceFooterTitle = invoiceFooterTitle;
    }
    if (typeof companyName === "string") {
      settings.companyName = companyName;
    }
    if (typeof companyEmail === "string") {
      settings.companyEmail = companyEmail;
    }
    if (typeof companyPhone === "string") {
      settings.companyPhone = companyPhone;
    }
    if (typeof companyAddress === "string") {
      settings.companyAddress = companyAddress;
    }
    await settings.save();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
