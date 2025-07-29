import React from "react";
import { Card, Statistic, Row, Col, Spin, Button } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  TrophyOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  useGetCustomerStatsQuery,
  useAutoActivateMembershipMutation,
} from "./api";
import { useNotification } from "@/hooks/useNotification";

const CustomerStats: React.FC = () => {
  const {
    data: statsResponse,
    isLoading,
    error,
    refetch,
  } = useGetCustomerStatsQuery();
  const [autoActivateMembership, { isLoading: isActivating }] =
    useAutoActivateMembershipMutation();
  const { success, error: notifyError } = useNotification();

  const stats = statsResponse?.data;

  const handleAutoActivateMembership = async () => {
    try {
      const result = await autoActivateMembership({ threshold: 1000 }).unwrap();
      success(
        `${result.data?.updatedCount || 0} customers upgraded to membership`,
      );
      refetch();
    } catch (err) {
      notifyError("Failed to auto-activate memberships");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load customer statistics</p>
        <Button onClick={() => refetch()} type="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">
          Customer Overview
        </h3>
        <Button
          type="primary"
          loading={isActivating}
          onClick={handleAutoActivateMembership}
          icon={<CrownOutlined />}
        >
          Auto-Activate Memberships
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="Active Members"
              value={stats.members}
              prefix={<CrownOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
              suffix={`/ ${stats.totalCustomers}`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="Non-Members"
              value={stats.nonMembers}
              prefix={<UserOutlined className="text-gray-500" />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="New This Month"
              value={stats.newCustomersThisMonth}
              prefix={<TrophyOutlined className="text-purple-500" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="Total Revenue"
              value={stats.totalPurchaseAmount}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: "#389e0d" }}
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="text-center">
            <Statistic
              title="Avg Purchase"
              value={stats.averagePurchaseAmount}
              prefix={<ShoppingOutlined className="text-orange-500" />}
              valueStyle={{ color: "#fa8c16" }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Membership Ratio */}
      <Card title="Membership Distribution">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span>Members</span>
              <span>
                {((stats.members / stats.totalCustomers) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(stats.members / stats.totalCustomers) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {stats.members}
            </div>
            <div className="text-sm text-gray-500">Active Members</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerStats;
