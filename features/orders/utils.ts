import { Order } from './types';

export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const calculateOrderTotal = (items: Order['items']): number => {
  return items.reduce((total, item) => total + item.totalPrice, 0);
};

export const formatOrderStatus = (status: Order['status']): string => {
  const statusMap = {
    Pending: 'Pending',
    Processing: 'Processing',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: Order['status']): string => {
  const colorMap = {
    Pending: 'orange',
    Processing: 'blue',
    Completed: 'green',
    Cancelled: 'red',
  };
  return colorMap[status] || 'default';
};

export const mapOrderToInvoiceDataWithSettings = (order: Order, settings: any) => {
  return {
    invoiceNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString(),
    customerName: order.customer,
    items: order.items.map(item => ({
      description: item.product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
    })),
    subtotal: order.totalAmount,
    total: order.totalAmount,
    companyName: settings?.companyName || 'KINSO Stores',
    companyAddress: settings?.companyAddress || '',
    companyPhone: settings?.companyPhone || '',
    companyEmail: settings?.companyEmail || '',
  };
}; 