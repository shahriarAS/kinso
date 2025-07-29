import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Import all models (you'll need to adjust these imports based on your actual file structure)
import Category from '../features/categories/model';
import Vendor from '../features/vendors/model';
import Brand from '../features/brands/model';
import Warehouse from '../features/warehouses/model';
import Outlet from '../features/outlets/model';
import User from '../features/users/model';
import Customer from '../features/customers/model';
import Product from '../features/products/model';
import Stock from '../features/stock/model';
import Discount from '../features/discounts/model';
import Demand from '../features/demand/model';
import Sale from '../features/sales/model';
import Settings from '../features/settings/model';

// Connect to database
async function connectDB(): Promise<void> {
  try {
    // Get database URL from command line arguments or environment variable
    const dbUrl = process.argv[2] || process.env.MONGODB_URI || 'mongodb://localhost:27017/kinso';
    
    console.log(`🔌 Connecting to database: ${dbUrl.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in log
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear all collections
async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');
  
  const collections = [
    'categories', 'vendors', 'brands', 'warehouses', 'outlets',
    'users', 'customers', 'products', 'stocks', 'discounts',
    'demands', 'sales', 'settings', 'salecounters'
  ];

  for (const collection of collections) {
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`   Cleared ${collection}`);
      }
    } catch (error) {
      console.log(`   Collection ${collection} doesn't exist, skipping...`);
    }
  }
}

// Seed data
async function seedData(): Promise<void> {
  console.log('🌱 Seeding database...');

  // 1. Categories (Independent)
  console.log('   Creating categories...');
  const categories = await Category.insertMany([
    { name: 'Electronics', applyVAT: true },
    { name: 'Home Appliances', applyVAT: true },
    { name: 'Personal Care', applyVAT: false },
    { name: 'Food & Beverages', applyVAT: false },
    { name: 'Clothing', applyVAT: true },
    { name: 'Mobile Accessories', applyVAT: true },
    { name: 'Kitchen Items', applyVAT: false },
    { name: 'Health & Medicine', applyVAT: false },
    { name: 'Stationery', applyVAT: false },
    { name: 'Toys & Games', applyVAT: true }
  ]);

  // 2. Vendors (Independent)
  console.log('   Creating vendors...');
  const vendors = await Vendor.insertMany([
    { name: 'Samsung Bangladesh' },
    { name: 'Unilever Bangladesh' },
    { name: 'Square Group' },
    { name: 'ACI Limited' },
    { name: 'Bashundhara Group' },
    { name: 'Pran-RFL Group' },
    { name: 'Beximco Group' },
    { name: 'DBL Group' },
    { name: 'Yellow Pages' },
    { name: 'Fresh Food Ltd' }
  ]);

  // 3. Warehouses (Independent)
  console.log('   Creating warehouses...');
  const warehouses = await Warehouse.insertMany([
    { name: 'Central Warehouse Dhaka' },
    { name: 'Chittagong Distribution Center' },
    { name: 'Sylhet Regional Warehouse' },
    { name: 'Rajshahi Storage Hub' },
    { name: 'Khulna Logistics Center' }
  ]);

  // 4. Outlets (Independent)
  console.log('   Creating outlets...');
  const outlets = await Outlet.insertMany([
    { name: 'Dhanmondi Branch', type: 'Super Shop' },
    { name: 'Gulshan Store', type: 'Super Shop' },
    { name: 'Uttara Outlet', type: 'Micro Outlet' },
    { name: 'Mirpur Branch', type: 'Super Shop' },
    { name: 'Old Dhaka Store', type: 'Micro Outlet' },
    { name: 'Chittagong Main', type: 'Super Shop' },
    { name: 'Sylhet Express', type: 'Micro Outlet' },
    { name: 'Rajshahi Center', type: 'Super Shop' },
    { name: 'Khulna Plaza', type: 'Micro Outlet' },
    { name: 'Comilla Branch', type: 'Micro Outlet' }
  ]);

  // 5. Brands (Depends on Vendors)
  console.log('   Creating brands...');
  const brands = await Brand.insertMany([
    { name: 'Samsung', vendor: vendors[0]._id },
    { name: 'LG', vendor: vendors[0]._id },
    { name: 'Dove', vendor: vendors[1]._id },
    { name: 'Lux', vendor: vendors[1]._id },
    { name: 'Lifebuoy', vendor: vendors[1]._id },
    { name: 'Square Pharmaceuticals', vendor: vendors[2]._id },
    { name: 'ACI Pure', vendor: vendors[3]._id },
    { name: 'Fresh', vendor: vendors[4]._id },
    { name: 'Pran', vendor: vendors[5]._id },
    { name: 'RFL', vendor: vendors[5]._id },
    { name: 'Bashundhara Tissue', vendor: vendors[4]._id },
    { name: 'DBL Ceramic', vendor: vendors[7]._id }
  ]);

  // 6. Users (Depends on Outlets)
  console.log('   Creating users...');
  const hashedPassword = await bcryptjs.hash('password123', 12);
  const users = await User.insertMany([
    {
      name: 'Super Admin',
      email: 'admin@kinso.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      outlet: null // Admin doesn't belong to specific outlet
    },
    {
      name: 'Rafiq Ahmed',
      email: 'rafiq@dhanmondi.com',
      password: hashedPassword,
      role: 'manager',
      isActive: true,
      outlet: outlets[0]._id // Dhanmondi Branch
    },
    {
      name: 'Fatima Khan',
      email: 'fatima@gulshan.com',
      password: hashedPassword,
      role: 'manager',
      isActive: true,
      outlet: outlets[1]._id // Gulshan Store
    },
    {
      name: 'Karim Uddin',
      email: 'karim@uttara.com',
      password: hashedPassword,
      role: 'staff',
      isActive: true,
      outlet: outlets[2]._id // Uttara Outlet
    },
    {
      name: 'Nasir Ahmed',
      email: 'nasir@mirpur.com',
      password: hashedPassword,
      role: 'staff',
      isActive: true,
      outlet: outlets[3]._id // Mirpur Branch
    },
    {
      name: 'Ruma Begum',
      email: 'ruma@olddhaka.com',
      password: hashedPassword,
      role: 'staff',
      isActive: true,
      outlet: outlets[4]._id // Old Dhaka Store
    },
    {
      name: 'Jahangir Alam',
      email: 'jahangir@chittagong.com',
      password: hashedPassword,
      role: 'manager',
      isActive: true,
      outlet: outlets[5]._id // Chittagong Main
    },
    {
      name: 'Salma Khatun',
      email: 'salma@sylhet.com',
      password: hashedPassword,
      role: 'staff',
      isActive: true,
      outlet: outlets[6]._id // Sylhet Express
    }
  ]);

  // 7. Customers (Independent)
  console.log('   Creating customers...');
  const customers = await Customer.insertMany([
    {
      name: 'Mohammad Rahman',
      phone: '+8801712345678',
      email: 'rahman@email.com',
      address: 'House 15, Road 8, Dhanmondi, Dhaka',
      membershipActive: true,
      totalPurchaseLastMonth: 15750,
      totalSales: 45,
      totalSpent: 125400
    },
    {
      name: 'Ayesha Siddique',
      phone: '+8801987654321',
      email: 'ayesha@email.com',
      address: 'Apt 4B, Gulshan Avenue, Dhaka',
      membershipActive: true,
      totalPurchaseLastMonth: 22300,
      totalSales: 67,
      totalSpent: 189750
    },
    {
      name: 'Abdul Karim',
      phone: '+8801555123456',
      email: 'karim@email.com',
      address: 'Block C, Uttara Model Town, Dhaka',
      membershipActive: false,
      totalPurchaseLastMonth: 8500,
      totalSales: 23,
      totalSpent: 45600
    },
    {
      name: 'Fatima Begum',
      phone: '+8801666789012',
      email: 'fatima@email.com',
      address: 'House 25, Mirpur DOHS, Dhaka',
      membershipActive: true,
      totalPurchaseLastMonth: 11200,
      totalSales: 34,
      totalSpent: 78900
    },
    {
      name: 'Nasir Uddin',
      phone: '+8801777345678',
      email: 'nasir@email.com',
      address: 'Old Dhaka, Wari, Dhaka',
      membershipActive: false,
      totalPurchaseLastMonth: 5600,
      totalSales: 18,
      totalSpent: 29400
    }
  ]);

  // 8. Products (Depends on Vendors, Brands, Categories)
  console.log('   Creating products...');
  const products = await Product.insertMany([
    // Electronics
    {
      name: 'Samsung Galaxy A54 128GB',
      barcode: '8801234567890',
      vendor: vendors[0]._id,
      brand: brands[0]._id,
      category: categories[0]._id
    },
    {
      name: 'LG 32" Smart TV',
      barcode: '8801234567891',
      vendor: vendors[0]._id,
      brand: brands[1]._id,
      category: categories[1]._id
    },
    // Personal Care
    {
      name: 'Dove Beauty Bar 100g',
      barcode: '8801234567892',
      vendor: vendors[1]._id,
      brand: brands[2]._id,
      category: categories[2]._id
    },
    {
      name: 'Lux Velvet Touch Soap',
      barcode: '8801234567893',
      vendor: vendors[1]._id,
      brand: brands[3]._id,
      category: categories[2]._id
    },
    {
      name: 'Lifebuoy Hand Sanitizer 250ml',
      barcode: '8801234567894',
      vendor: vendors[1]._id,
      brand: brands[4]._id,
      category: categories[2]._id
    },
    // Food & Beverages
    {
      name: 'Pran Orange Juice 250ml',
      barcode: '8801234567895',
      vendor: vendors[5]._id,
      brand: brands[8]._id,
      category: categories[3]._id
    },
    {
      name: 'ACI Pure Salt 1kg',
      barcode: '8801234567896',
      vendor: vendors[3]._id,
      brand: brands[6]._id,
      category: categories[3]._id
    },
    // Health & Medicine
    {
      name: 'Square Napa Extra 500mg',
      barcode: '8801234567897',
      vendor: vendors[2]._id,
      brand: brands[5]._id,
      category: categories[7]._id
    },
    // Kitchen Items
    {
      name: 'RFL Plastic Bowl Set',
      barcode: '8801234567898',
      vendor: vendors[5]._id,
      brand: brands[9]._id,
      category: categories[6]._id
    },
    // Stationery
    {
      name: 'Bashundhara A4 Paper 500 sheets',
      barcode: '8801234567899',
      vendor: vendors[4]._id,
      brand: brands[10]._id,
      category: categories[8]._id
    },
    // More products for variety
    {
      name: 'Samsung Galaxy Earbuds',
      barcode: '8801234567900',
      vendor: vendors[0]._id,
      brand: brands[0]._id,
      category: categories[5]._id
    },
    {
      name: 'Fresh Mineral Water 1L',
      barcode: '8801234567901',
      vendor: vendors[4]._id,
      brand: brands[7]._id,
      category: categories[3]._id
    },
    {
      name: 'Pran Chips 25g',
      barcode: '8801234567902',
      vendor: vendors[5]._id,
      brand: brands[8]._id,
      category: categories[3]._id
    },
    {
      name: 'DBL Dinner Set',
      barcode: '8801234567903',
      vendor: vendors[7]._id,
      brand: brands[11]._id,
      category: categories[6]._id
    },
    {
      name: 'Lux Perfumed Soap 100g',
      barcode: '8801234567904',
      vendor: vendors[1]._id,
      brand: brands[3]._id,
      category: categories[2]._id
    }
  ]);

  // 9. Stock (Depends on Products and Locations)
  console.log('   Creating stock...');
  const stockItems: any[] = [];
  const currentDate = new Date();
  
  // Create stock for each product in multiple locations
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Stock in warehouses
    for (let j = 0; j < Math.min(3, warehouses.length); j++) {
      const warehouse = warehouses[j];
      stockItems.push({
        product: product._id,
        location: warehouse._id,
        locationType: 'Warehouse',
        mrp: 100 + (i * 50) + (j * 10), // Varying prices
        tp: 80 + (i * 40) + (j * 8), // Trade price (lower than MRP)
        expireDate: new Date(currentDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year from now
        unit: 50 + (i * 5) + (j * 10), // Varying stock units
        batchNumber: `BATCH${String(i + 1).padStart(3, '0')}${String(j + 1).padStart(2, '0')}`
      });
    }
    
    // Stock in outlets
    for (let k = 0; k < Math.min(5, outlets.length); k++) {
      const outlet = outlets[k];
      stockItems.push({
        product: product._id,
        location: outlet._id,
        locationType: 'Outlet',
        mrp: 110 + (i * 50) + (k * 10), // Slightly higher MRP in outlets
        tp: 85 + (i * 40) + (k * 8),
        expireDate: new Date(currentDate.getTime() + (300 * 24 * 60 * 60 * 1000)), // 10 months
        unit: 20 + (i * 2) + (k * 5), // Less stock in outlets
        batchNumber: `OUT${String(i + 1).padStart(3, '0')}${String(k + 1).padStart(2, '0')}`
      });
    }
  }
  
  const stocks = await Stock.insertMany(stockItems);

  // 10. Discounts (Depends on Products)
  console.log('   Creating discounts...');
  const discounts = await Discount.insertMany([
    {
      product: products[0]._id, // Samsung Galaxy A54
      type: 'General',
      amount: 2000, // 2000 BDT discount
      startDate: new Date(),
      endDate: new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days
    },
    {
      product: products[2]._id, // Dove Beauty Bar
      type: 'Membership',
      amount: 15, // 15 BDT discount for members
      startDate: new Date(),
      endDate: new Date(currentDate.getTime() + (60 * 24 * 60 * 60 * 1000)) // 60 days
    },
    {
      product: products[5]._id, // Pran Orange Juice
      type: 'General',
      amount: 10, // 10 BDT discount
      startDate: new Date(),
      endDate: new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000)) // 15 days
    },
    {
      product: products[1]._id, // LG TV
      type: 'Membership',
      amount: 5000, // 5000 BDT membership discount
      startDate: new Date(),
      endDate: new Date(currentDate.getTime() + (45 * 24 * 60 * 60 * 1000)) // 45 days
    }
  ]);

  // 11. Demands (Depends on Products and Locations)
  console.log('   Creating demands...');
  const demands = await Demand.insertMany([
    {
      location: outlets[0]._id, // Dhanmondi Branch
      locationType: 'Outlet',
      products: [
        { product: products[0]._id, quantity: 10 }, // Samsung phones
        { product: products[2]._id, quantity: 50 }, // Dove soap
        { product: products[5]._id, quantity: 100 } // Pran juice
      ],
      status: 'Pending'
    },
    {
      location: outlets[1]._id, // Gulshan Store
      locationType: 'Outlet',
      products: [
        { product: products[1]._id, quantity: 5 }, // LG TV
        { product: products[3]._id, quantity: 30 }, // Lux soap
        { product: products[6]._id, quantity: 25 } // ACI salt
      ],
      status: 'Approved'
    },
    {
      location: warehouses[0]._id, // Central Warehouse
      locationType: 'Warehouse',
      products: [
        { product: products[7]._id, quantity: 200 }, // Square medicine
        { product: products[8]._id, quantity: 150 }, // RFL bowls
        { product: products[9]._id, quantity: 300 } // A4 paper
      ],
      status: 'ConvertedToStock'
    },
    {
      location: outlets[2]._id, // Uttara Outlet
      locationType: 'Outlet',
      products: [
        { product: products[10]._id, quantity: 20 }, // Galaxy Earbuds
        { product: products[11]._id, quantity: 80 }, // Fresh water
        { product: products[12]._id, quantity: 120 } // Pran chips
      ],
      status: 'Pending'
    }
  ]);

  // 12. Sales (Depends on Outlets, Customers, Stock, Users)
  console.log('   Creating sales...');
  const sales: any[] = [];
  const saleDate = new Date();
  
  // Create multiple sales for different outlets
  for (let i = 0; i < 15; i++) {
    const outlet = outlets[i % outlets.length];
    const customer = i % 3 === 0 ? customers[i % customers.length]._id : null; // Some sales without customers
    const creator = users.find(u => u.outlet?.toString() === outlet._id.toString()) || users[1];
    const outletStocks = stocks.filter(s => s.location.toString() === outlet._id.toString() && s.locationType === 'Outlet');
    
    if (outletStocks.length > 0) {
      // Select 1-3 random items for this sale
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedStocks = outletStocks.slice(0, itemCount);
      
      const items = selectedStocks.map((stock, idx) => ({
        stock: stock._id,
        quantity: Math.floor(Math.random() * 5) + 1, // 1-5 units
        unitPrice: stock.mrp,
        discountApplied: idx === 0 ? Math.floor(Math.random() * 50) : 0 // Random discount on first item
      }));
      
      const totalAmount = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice - item.discountApplied), 0
      );
      
      const discountAmount = items.reduce((sum, item) => sum + item.discountApplied, 0);
      
      // Random payment method distribution
      const paymentMethods: any[] = [];
      const cashAmount = Math.floor(totalAmount * 0.7); // 70% cash
      const digitalAmount = totalAmount - cashAmount;
      
      paymentMethods.push({ method: 'CASH', amount: cashAmount });
      if (digitalAmount > 0) {
        const digitalMethods = ['BKASH', 'ROCKET', 'NAGAD', 'BANK', 'CARD'];
        paymentMethods.push({
          method: digitalMethods[Math.floor(Math.random() * digitalMethods.length)],
          amount: digitalAmount
        });
      }
      
      sales.push({
        saleId: `SLE${String(Date.now() + i).slice(-8)}`, // Unique sale ID
        outlet: outlet._id,
        customer: customer,
        saleDate: new Date(saleDate.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
        totalAmount: totalAmount,
        items: items,
        paymentMethods: paymentMethods,
        discountAmount: discountAmount,
        notes: i % 4 === 0 ? 'Customer requested fast delivery' : undefined,
        createdBy: creator._id
      });
    }
  }
  
  await Sale.insertMany(sales);

  // 13. Settings (Singleton)
  console.log('   Creating settings...');
  await Settings.create({
    invoiceFooter: 'Thank you for shopping with us! Please keep your receipt for any returns or exchanges.',
    invoiceFooterTitle: 'Return Policy',
    companyName: 'KINSO Retail Chain',
    companyEmail: 'info@kinso.com.bd',
    companyPhone: '+880-2-9876543',
    companyAddress: 'House 123, Road 15, Block C, Bashundhara R/A, Dhaka-1229, Bangladesh'
  });

  console.log('✅ Database seeding completed successfully!');
  
  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Vendors: ${vendors.length}`);
  console.log(`   Brands: ${brands.length}`);
  console.log(`   Warehouses: ${warehouses.length}`);
  console.log(`   Outlets: ${outlets.length}`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Stock Items: ${stocks.length}`);
  console.log(`   Discounts: ${discounts.length}`);
  console.log(`   Demands: ${demands.length}`);
  console.log(`   Sales: ${sales.length}`);
  console.log(`   Settings: 1 (singleton)`);
}

// Main execution
async function main(): Promise<void> {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
📚 KINSO Database Seeding Script

Usage:
  tsx scripts/seed-database.ts [DATABASE_URL]
  npm run seed [DATABASE_URL]
  pnpm run seed [DATABASE_URL]

Arguments:
  DATABASE_URL    MongoDB connection string (optional)
                  Falls back to MONGODB_URI env var or localhost

Examples:
  tsx scripts/seed-database.ts
  tsx scripts/seed-database.ts mongodb://localhost:27017/kinso-dev
  tsx scripts/seed-database.ts mongodb://user:pass@localhost:27017/kinso
  tsx scripts/seed-database.ts mongodb+srv://user:pass@cluster.mongodb.net/kinso

⚠️  WARNING: This script will DELETE ALL existing data before seeding!
    Only use this on development/testing databases.
`);
    process.exit(0);
  }

  try {
    await connectDB();
    await clearDatabase();
    await seedData();
    console.log('\n🎉 All done! Your database is ready for use.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the script
main();
