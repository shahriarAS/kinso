import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/auth";
import { customersApi } from "@/features/customers";
import { ordersApi } from "./api/orders";
import { warehousesApi } from "./api/warehouses";
import { categoriesApi } from "./api/categories";
import { usersApi } from "./api/users";
import { dashboardApi } from "./api/dashboard";
import uiReducer from "./slices/uiSlice";
import { productsApi } from "@/features/products";

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(
      authApi.middleware,
      productsApi.middleware,
      customersApi.middleware,
      ordersApi.middleware,
      warehousesApi.middleware,
      categoriesApi.middleware,
      usersApi.middleware,
      dashboardApi.middleware,
    ),
});

export default store;

// Type definitions for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
