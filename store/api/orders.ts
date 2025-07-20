import { ordersApi } from "@/features/orders/api";

export { ordersApi };
export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useGetOrdersByCustomerQuery,
} = ordersApi;
