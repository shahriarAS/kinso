export * from "./product";
export * from "./warehouse";

export interface Category {
  id: string;
  name: string;
  description?: string;
}