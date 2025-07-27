import React from 'react';
import { Drawer, Descriptions, Tag, Button } from 'antd';
import { Order } from './types';
import { formatOrderStatus, getOrderStatusColor } from './utils';

interface ViewOrderDrawerProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
}

const ViewOrderDrawer: React.FC<ViewOrderDrawerProps> = ({
  order,
  visible,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Drawer
      title="Order Details"
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Order Number">
          {order.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Customer">
          {order.customer}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getOrderStatusColor(order.status)}>
            {formatOrderStatus(order.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          ${order.totalAmount.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(order.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {new Date(order.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <h4>Order Items</h4>
        {order.items.map((item, index) => (
          <div key={index} style={{ marginBottom: 8, padding: 8, border: '1px solid #d9d9d9', borderRadius: 4 }}>
            <div>Product: {item.product}</div>
            <div>Quantity: {item.quantity}</div>
            <div>Unit Price: ${item.unitPrice.toFixed(2)}</div>
            <div>Total: ${item.totalPrice.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Drawer>
  );
};

export default ViewOrderDrawer; 