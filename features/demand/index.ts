// API
export { demandApi } from "./api";
export {
  useGetDemandsQuery,
  useGetDemandQuery,
  useCreateDemandMutation,
  useUpdateDemandMutation,
  useDeleteDemandMutation,
  useGenerateDemandsMutation,
  useConvertDemandToStockMutation,
  useUpdateDemandStatusMutation,
} from "./api";

// Types
export type {
  Demand,
  DemandInput,
  DemandFilters,
  DemandGenerationRequest,
  DemandGenerationResponse,
  DemandConversionRequest,
  DemandResponse,
} from "./types";

// Components
export * from "./components"; 