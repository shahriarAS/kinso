import { Warehouse } from "./warehouse";


export interface Product {
    id: string;
    name: string;
    upc: string;
    category: string;
    stock: {
        warehouse: Warehouse;
        unit: number;
        dp: number;
        mrp: number;
    }[]
}

export interface ProductInput extends Omit<Product, "_id"> { }