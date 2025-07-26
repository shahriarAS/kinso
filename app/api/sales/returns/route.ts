import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale from "@/features/sales/model";
import Stock from "@/features/stock/model";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await authenticateUser(request);
    if (!authResult) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { saleId, items, notes } = body;

    if (!saleId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Sale ID and return items are required" },
        { status: 400 }
      );
    }

    // Find the original sale
    const originalSale = await Sale.findById(saleId)
      .populate("outletId", "name")
      .populate("customerId", "name email phone");

    if (!originalSale) {
      return NextResponse.json(
        { message: "Sale not found" },
        { status: 404 }
      );
    }

    // Process returns and update stock
    const stockUpdates = [];
    const returnItems = [];

    for (const returnItem of items) {
      const { stockId, quantity, reason } = returnItem;

      // Find the original stock entry
      const stockEntry = await Stock.findById(stockId);
      if (!stockEntry) {
        return NextResponse.json(
          { message: "Stock entry not found" },
          { status: 400 }
        );
      }

      // Add returned quantity back to stock
      stockEntry.units += quantity;
      stockUpdates.push(stockEntry.save());

      returnItems.push({
        stockId,
        quantity,
        reason,
      });
    }

    // Create return record (you might want to create a separate Return model)
    // For now, we'll just update the original sale with return information
    const returnData = {
      returnDate: new Date(),
      returnItems,
      notes,
      processedBy: authResult._id,
    };

    // Update the sale with return information
    originalSale.returnData = returnData;
    await originalSale.save();

    // Wait for all stock updates to complete
    await Promise.all(stockUpdates);

    return NextResponse.json({
      data: originalSale,
      message: "Return processed successfully",
    });
  } catch (error) {
    console.error("Sale return error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 