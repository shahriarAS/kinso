export * from "./product";
export * from "./warehouse";
export * from "./order";
export * from "./customer";
export * from "./user";
export * from "./common";

export interface Category {
  _id: string;
  name: string;
  description?: string;
}