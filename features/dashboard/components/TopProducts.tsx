import React from "react";
import { Card, Table, Space } from "antd";
import { RiseOutlined } from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface TopProductsProps {
  topProducts: DashboardStats["topProducts"];
}

const TopProducts: React.FC<TopProductsProps> = ({ topProducts }) => {
  return (
    <Card
      title={
        <Space>
          <RiseOutlined className="text-primary" />
          <span className="text-primary font-semibold">Top Products</span>
        </Space>
      }
      className="bg-white border rounded-lg shadow-sm"
    >
      <Table
        dataSource={topProducts}
        pagination={false}
        size="small"
        columns={[
          {
            title: "Product",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "Sold",
            dataIndex: "totalSold",
            key: "totalSold",
          },
          {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            render: (value: number) => `৳${value}`,
          },
        ]}
      />
    </Card>
  );
};

export default TopProducts;
