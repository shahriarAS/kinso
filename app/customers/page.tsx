"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { Tabs, TabsProps } from "antd";
import CustomerManagementDashboard from "@/features/customers/components/CustomerManagementDashboard";
import MembershipManagement from "@/features/customers/components/MembershipManagement";

const CustomersPage: React.FC = () => {
  const items: TabsProps['items'] = [
    {
      key: 'dashboard',
      label: 'Customer Management',
      children: <CustomerManagementDashboard />,
    },
    {
      key: 'membership',
      label: 'Membership Management',
      children: <MembershipManagement />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">
            Manage customer registrations, track purchases, and handle membership status
          </p>
        </div>
        
        <Tabs
          defaultActiveKey="dashboard"
          items={items}
          className="bg-white rounded-lg shadow-sm"
          size="large"
        />
      </div>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default CustomersPage; 