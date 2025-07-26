import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/features/auth";
import { customersApi } from "@/features/customers";
import { ordersApi } from "@/features/orders";
import { warehousesApi } from "@/features/warehouses";
import { categoriesApi } from "@/features/categories";
import { usersApi } from "@/features/users";
import { dashboardApi } from "@/features/dashboard";
import uiReducer from "./slices/uiSlice";
import { productsApi } from "@/features/products";
import { settingsApi } from "@/features/settings";
import { vendorApi } from "@/features/vendors";
import { brandsApi } from "@/features/brands";
import { outletsApi } from "@/features/outlets";
import { stockApi } from "@/features/stock";
import { salesApi } from "@/features/sales";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [warehousesApi.reducerPath]: warehousesApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [outletsApi.reducerPath]: outletsApi.reducer,
    [stockApi.reducerPath]: stockApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }    ).concat(
      authApi.middleware,
      productsApi.middleware,
      customersApi.middleware,
      ordersApi.middleware,
      warehousesApi.middleware,
      categoriesApi.middleware,
      usersApi.middleware,
      dashboardApi.middleware,
      settingsApi.middleware,
      vendorApi.middleware,
      brandsApi.middleware,
      outletsApi.middleware,
      stockApi.middleware,
      salesApi.middleware,
    ),
});

export default store;

// Type definitions for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
