import React from "react";
import { Drawer, Descriptions, Tag, Button, Space, Divider } from "antd";
import { EditOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";
import { Customer } from "./types";

interface ViewCustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onEdit?: (customer: Customer) => void;
}

const ViewCustomerDrawer: React.FC<ViewCustomerDrawerProps> = ({
  open,
  onClose,
  customer,
  onEdit,
}) => {
  if (!customer) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(customer);
    }
    onClose();
  };

  return (
    <Drawer
      title={
        <Space>
          <UserOutlined />
          Customer Details
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
      extra={
        onEdit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            Edit Customer
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Customer Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserOutlined className="mr-2" />
            Basic Information
          </h3>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Customer Name">
              <span className="font-medium">{customer.name}</span>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Membership Status">
              <Tag color={customer.membershipActive ? "green" : "default"}>
                {customer.membershipActive ? "Active Member" : "Non-Member"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {new Date(customer.createdAt).toLocaleDateString()}
            </Descriptions.Item> */}
          </Descriptions>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PhoneOutlined className="mr-2" />
            Contact Information
          </h3>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item 
              label={<span><PhoneOutlined className="mr-1" />Phone</span>}
            >
              {customer?.phone || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item 
              label={<span><MailOutlined className="mr-1" />Email</span>}
            >
              {customer?.email || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item 
              label={<span><HomeOutlined className="mr-1" />Address</span>}
            >
              {customer?.address || "Not provided"}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Purchase History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Purchase History
          </h3>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Total Amount Spent">
              <span className="text-green-600 font-semibold text-lg">
                ${customer.totalSpent.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Last Month Purchase">
              <span className="text-blue-600 font-medium">
                ${customer.totalPurchaseLastMonth.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Number of Sales">
              <span className="text-gray-600">
                {customer.totalSales} transactions
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-sm font-medium">Average per Sale</div>
              <div className="text-blue-800 text-xl font-bold">
                ${customer.totalSales > 0 ? (customer.totalSpent / customer.totalSales).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 text-sm font-medium">Customer Value</div>
              <div className="text-green-800 text-xl font-bold">
                {customer.membershipActive ? 'Premium' : 'Standard'}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Timestamps */}
        <div className="text-sm text-gray-500 space-y-1">
          <div>Created: {new Date(customer.createdAt).toLocaleString()}</div>
          <div>Last Updated: {new Date(customer.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </Drawer>
  );
};

export default ViewCustomerDrawer;
