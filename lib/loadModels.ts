/**
 * Model Loader - Ensures all Mongoose models are registered at application startup
 * This prevents "Schema hasn't been registered" errors when using populate() or references
 */

// Import all models to register their schemas with Mongoose
import "@/features/brands/model";
import "@/features/categories/model";
import "@/features/customers/model";
import "@/features/demand/model";
import "@/features/discounts/model";
import "@/features/outlets/model";
import "@/features/products/model";
import "@/features/sales/model";
import "@/features/settings/model";
import "@/features/stock/model";
import "@/features/users/model";
import "@/features/vendors/model";
import "@/features/warehouses/model";

/**
 * This function doesn't need to do anything - just importing this file
 * will cause all the models to be registered with Mongoose
 */
export const loadAllModels = () => {
  // Models are loaded via imports above
  console.log("All Mongoose models loaded and registered");
};

export default loadAllModels;
