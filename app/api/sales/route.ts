import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Sale, { ISale } from "@/features/sales/model";
import SaleCounter from "@/features/sales/modelSaleCounter";
import Stock from "@/features/stock/model";
import Customer from "@/features/customers/model";
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
    const {
      outletId,
      customerId,
      items,
      paymentMethod,
      discountAmount = 0,
      notes,
    } = body;

    if (!outletId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Outlet ID and items are required" },
        { status: 400 }
      );
    }

    // Generate unique sale ID
    const today = new Date();
    const dateStr = `${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    
    let saleCounter = await SaleCounter.findOne({ date: dateStr });
    if (!saleCounter) {
      saleCounter = await SaleCounter.create({ date: dateStr, seq: 0 });
    }
    
    saleCounter.seq += 1;
    await saleCounter.save();
    
    const saleId = `S${dateStr}${saleCounter.seq.toString().padStart(4, '0')}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity) - item.discountApplied;
    }, 0) - discountAmount;

    // Process FIFO stock deduction
    const stockUpdates = [];
    const saleItems = [];

    for (const item of items) {
      const { stockId, quantity, unitPrice, discountApplied } = item;
      
      // Get stock entries in FIFO order
      const stockEntries = await Stock.find({ _id: stockId })
        .sort({ entryDate: 1 })
        .populate("productId", "name");

      if (!stockEntries.length) {
        return NextResponse.json(
          { message: `Stock not found for item` },
          { status: 400 }
        );
      }

      let remainingQuantity = quantity;
      let totalDeducted = 0;

      for (const stockEntry of stockEntries) {
        if (remainingQuantity <= 0) break;

        const deductQuantity = Math.min(remainingQuantity, stockEntry.units);
        
        if (stockEntry.units < deductQuantity) {
          const productName = (stockEntry.productId as any)?.name || 'Unknown';
          return NextResponse.json(
            { message: `Insufficient stock for ${productName}` },
            { status: 400 }
          );
        }

        stockEntry.units -= deductQuantity;
        stockUpdates.push(stockEntry.save());
        totalDeducted += deductQuantity;
        remainingQuantity -= deductQuantity;
      }

      if (remainingQuantity > 0) {
        const productName = (stockEntries[0].productId as any)?.name || 'Unknown';
        return NextResponse.json(
          { message: `Insufficient stock for ${productName}` },
          { status: 400 }
        );
      }

      saleItems.push({
        stockId,
        quantity,
        unitPrice,
        discountApplied,
      });
    }

    // Update customer stats if customer is provided
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: {
          totalOrders: 1,
          totalSpent: totalAmount,
        },
      });
    }

    // Create the sale
    const sale = await Sale.create({
      saleId,
      outletId,
      customerId,
      saleDate: new Date(),
      totalAmount,
      items: saleItems,
      paymentMethod,
      discountAmount,
      notes,
      createdBy: authResult._id,
    });

    // Wait for all stock updates to complete
    await Promise.all(stockUpdates);

    return NextResponse.json({
      data: sale,
      message: "Sale completed successfully",
    });
  } catch (error) {
    console.error("Sale creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const outletId = searchParams.get("outletId");
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};

    if (outletId) query.outletId = outletId;
    if (customerId) query.customerId = customerId;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("outletId", "name")
        .populate("customerId", "name email phone")
        .populate("createdBy", "name")
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query),
    ]);

    return NextResponse.json({
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Sales fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 