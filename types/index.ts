export * from "./product";
export * from "./warehouse";
export * from "./order";
export * from "./customer";

export interface Category {
  id: string;
  name: string;
  description?: string;
}