import React, { useState } from "react";
import { Card, Button, InputNumber, Space, Alert, Statistic, Row, Col } from "antd";
import { CrownOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";
import { useAutoActivateMembershipMutation, useGetCustomerStatsQuery } from "../api";
import toast from "react-hot-toast";

const MembershipManagement: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(1000);
  const [autoActivateMembership, { isLoading }] = useAutoActivateMembershipMutation();
  const { data: statsData, refetch } = useGetCustomerStatsQuery();

  const handleAutoActivate = async () => {
    try {
      const result = await autoActivateMembership({ threshold }).unwrap();
      toast.success(result.message);
      refetch(); // Refresh stats
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to auto-activate membership");
    }
  };

  return (
    <Card
      title={
        <Space>
          <CrownOutlined />
          Membership Management
        </Space>
      }
      className="w-full"
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Statistic
            title="Total Members"
            value={statsData?.members || 0}
            prefix={<CrownOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Non-Members"
            value={statsData?.nonMembers || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: "#722ed1" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Membership Rate"
            value={statsData?.totalCustomers ? ((statsData.members / statsData.totalCustomers) * 100) : 0}
            suffix="%"
            precision={1}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Col>
      </Row>

      <Alert
        message="Automatic Membership Activation"
        description="Automatically activate membership for customers who meet the purchase threshold. This will update all eligible customers at once."
        type="info"
        showIcon
        className="mb-4"
      />

      <Space direction="vertical" className="w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Amount Threshold
          </label>
          <InputNumber
            value={threshold}
            onChange={(value) => setThreshold(value || 1000)}
            min={0}
            step={100}
            className="w-full"
          />
        </div>

        <Button
          type="primary"
          icon={<CrownOutlined />}
          onClick={handleAutoActivate}
          loading={isLoading}
          size="large"
          className="w-full"
        >
          Auto-Activate Membership
        </Button>

        <p className="text-sm text-gray-500 text-center">
          This will activate membership for all customers with purchase amount ≥ ${threshold.toLocaleString()}
        </p>
      </Space>
    </Card>
  );
};

export default MembershipManagement; 