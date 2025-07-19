import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import { Warehouse, Product } from '@/models';
import { authorizeRequest, AuthenticatedRequest } from '@/lib/auth';

// GET /api/warehouses/[id]/inventory - Get inventory for a specific warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authorize request - all authenticated users can view warehouse inventory
    const authResult = await authorizeRequest(request as AuthenticatedRequest, {
      requireAuth: true
    });
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await dbConnect();
    
    // Check if warehouse exists
    const warehouse = await Warehouse.findById(params.id).lean();
    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Get all products that have stock in this warehouse
    const products = await Product.find({
      'stock.warehouse': params.id
    }).populate('category').lean();

    // Transform the data to match the expected format
    const inventoryData = products.map(product => {
      // Find the stock entry for this warehouse
      const stockEntry = product.stock.find((stock: any) => 
        stock.warehouse.toString() === params.id
      );

      if (!stockEntry) {
        return null;
      }

      return {
        product: {
          _id: product._id,
          name: product.name,
          upc: product.upc,
          category: product.category,
        },
        quantity: stockEntry.unit,
        unit: stockEntry.unit,
        dp: stockEntry.dp,
        mrp: stockEntry.mrp,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null); // Remove null entries

    // Calculate totals
    const totalProducts = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);

    return NextResponse.json({
      success: true,
      data: {
        warehouse,
        products: inventoryData,
        totalProducts,
        totalValue,
      }
    });
    
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch warehouse inventory' },
      { status: 500 }
    );
  }
} 