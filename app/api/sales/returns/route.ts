import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale from "@/features/sales/model";
import Stock from "@/features/stock/model";
import { authorizeRequest } from "@/lib/auth";
import { AuthenticatedRequest } from "@/features/auth";

export async function POST(request: NextRequest) {
  try {
    // Authorize request - all authenticated users can process returns
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
    const { saleId, items, notes } = body;

    // Basic validation
    if (!saleId || saleId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Sale ID is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items array is required and cannot be empty" },
        { status: 400 },
      );
    }

    // Validate items array
    for (const item of items) {
      if (!item.stockId || !item.quantity || !item.reason) {
        return NextResponse.json(
          { success: false, message: "Each item must have stockId, quantity, and reason" },
          { status: 400 },
        );
      }
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Item quantity must be greater than 0" },
          { status: 400 },
        );
      }
    }

    // Find the original sale
    const originalSale = await Sale.findOne({ saleId: saleId.trim() });
    if (!originalSale) {
      return NextResponse.json(
        { success: false, message: "Sale not found" },
        { status: 404 },
      );
    }

    // Process returns for each item
    const returnItems = [];
    for (const returnItem of items) {
      // Find the original sale item
      const originalItem = originalSale.items.find((item: any) => item.stockId === returnItem.stockId);
      if (!originalItem) {
        return NextResponse.json(
          { success: false, message: `Item with stockId ${returnItem.stockId} not found in original sale` },
          { status: 400 },
        );
      }

      // Check if return quantity is valid
      if (returnItem.quantity > originalItem.quantity) {
        return NextResponse.json(
          { success: false, message: `Return quantity cannot exceed original quantity for item ${returnItem.stockId}` },
          { status: 400 },
        );
      }

      // Update stock (FIFO - add back to stock)
      const stockItem = await Stock.findById(returnItem.stockId);
      if (!stockItem) {
        return NextResponse.json(
          { success: false, message: `Stock item ${returnItem.stockId} not found` },
          { status: 404 },
        );
      }

      // Add quantity back to stock
      stockItem.quantity += returnItem.quantity;
      await stockItem.save();

      returnItems.push({
        stockId: returnItem.stockId,
        quantity: returnItem.quantity,
        reason: returnItem.reason,
        originalQuantity: originalItem.quantity,
        unitPrice: originalItem.unitPrice,
      });
    }

    // Create return record
    const returnRecord = {
      saleId: originalSale.saleId,
      items: returnItems,
      notes: notes || "",
      processedBy: authResult.user?._id,
      processedAt: new Date(),
    };

    // Update original sale with return information
    originalSale.returns = originalSale.returns || [];
    originalSale.returns.push(returnRecord);
    await originalSale.save();

    return NextResponse.json({
      success: true,
      data: returnRecord,
      message: "Return processed successfully",
    });
  } catch (error) {
    console.error("Error processing sale return:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process sale return" },
      { status: 500 },
    );
  }
} 