export { 
  handleGetSalesReport, 
  handleGetInventoryReport, 
  handleGetCustomerReport 
} from "./service";

export { reportsApi } from "./api";

export type { 
  SalesReportResponse, 
  InventoryReportResponse, 
  CustomerReportResponse,
  ReportFilters,
  ReportRequest,
  StockMovementReport,
  ProfitLossReport
} from "./types"; 