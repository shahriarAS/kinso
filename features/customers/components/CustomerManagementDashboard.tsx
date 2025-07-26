import React, { useState } from "react";
import { Card, Row, Col, Statistic, Button, Space, Table, Tag, Switch, Modal } from "antd";
import {
  UserOutlined,
  CrownOutlined,
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Customer } from "../types";
import { useGetCustomersQuery, useGetCustomerStatsQuery, useUpdateMembershipMutation, useDeleteCustomerMutation } from "../api";
import CustomerRegistrationForm from "./CustomerRegistrationForm";
import toast from "react-hot-toast";

const CustomerManagementDashboard: React.FC = () => {
  const [isRegistrationModalVisible, setIsRegistrationModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const { data: customersData, isLoading: customersLoading, refetch } = useGetCustomersQuery({
    page: 1,
    limit: 10,
  });

  const { data: statsData, isLoading: statsLoading } = useGetCustomerStatsQuery();
  const [updateMembership] = useUpdateMembershipMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const handleMembershipToggle = async (customer: Customer, checked: boolean) => {
    try {
      await updateMembership({ _id: customer._id, membershipStatus: checked }).unwrap();
      toast.success(`Membership ${checked ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update membership status");
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    Modal.confirm({
      title: "Delete Customer",
      content: `Are you sure you want to delete ${customer.customerName}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteCustomer(customer._id).unwrap();
          toast.success("Customer deleted successfully");
          refetch();
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete customer");
        }
      },
    });
  };

  const columns = [
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
      render: (text: string) => <code className="bg-gray-100 px-2 py-1 rounded">{text}</code>,
    },
    {
      title: "Name",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Contact Info",
      dataIndex: "contactInfo",
      key: "contactInfo",
      ellipsis: true,
    },
    {
      title: "Purchase Amount",
      dataIndex: "purchaseAmount",
      key: "purchaseAmount",
      render: (amount: number) => (
        <span className="font-mono text-green-600">
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Membership",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      render: (isMember: boolean, record: Customer) => (
        <Switch
          checked={isMember}
          onChange={(checked) => handleMembershipToggle(record, checked)}
          checkedChildren="Member"
          unCheckedChildren="Non-Member"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Customer) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setSelectedCustomer(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCustomer(record);
              setIsEditModalVisible(true);
            }}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCustomer(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={statsData?.totalCustomers || 0}
              prefix={<UserOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Members"
              value={statsData?.members || 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#3f8600" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Purchase Amount"
              value={statsData?.totalPurchaseAmount || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#1890ff" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={statsData?.newCustomersThisMonth || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsRegistrationModalVisible(true)}
          >
            Add New Customer
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={customersData?.data || []}
          loading={customersLoading}
          rowKey="_id"
          pagination={{
            total: customersData?.pagination?.total || 0,
            pageSize: customersData?.pagination?.limit || 10,
            current: customersData?.pagination?.page || 1,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
        />
      </Card>

      {/* Registration Modal */}
      <Modal
        title="Register New Customer"
        open={isRegistrationModalVisible}
        onCancel={() => setIsRegistrationModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CustomerRegistrationForm
          onSuccess={() => {
            setIsRegistrationModalVisible(false);
            refetch();
          }}
          onCancel={() => setIsRegistrationModalVisible(false)}
        />
      </Modal>

      {/* Customer Details Modal */}
      <Modal
        title="Customer Details"
        open={!!selectedCustomer && !isEditModalVisible}
        onCancel={() => setSelectedCustomer(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedCustomer(null)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Customer ID:</label>
                <p className="bg-gray-100 px-2 py-1 rounded">{selectedCustomer.customerId}</p>
              </div>
              <div>
                <label className="font-semibold">Name:</label>
                <p>{selectedCustomer.customerName}</p>
              </div>
            </div>
            <div>
              <label className="font-semibold">Contact Information:</label>
              <p>{selectedCustomer.contactInfo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Purchase Amount:</label>
                <p className="text-green-600 font-mono">${selectedCustomer.purchaseAmount.toFixed(2)}</p>
              </div>
              <div>
                <label className="font-semibold">Membership Status:</label>
                <p>
                  <Tag color={selectedCustomer.membershipStatus ? "green" : "default"}>
                    {selectedCustomer.membershipStatus ? "Member" : "Non-Member"}
                  </Tag>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagementDashboard; 