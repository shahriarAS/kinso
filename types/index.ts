export interface Notification {
  _id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export * from "./invoice";