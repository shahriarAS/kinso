import React from "react";
import { Card, Table, Space, Empty } from "antd";
import { RiseOutlined } from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface TopProductsProps {
  topProducts: DashboardStats["topProducts"];
}

const TopProducts: React.FC<TopProductsProps> = ({ topProducts }) => {
  console.log('TopProducts data:', topProducts); // Debug log

  return (
    <Card
      title={
        <Space>
          <RiseOutlined className="text-primary" />
          <span className="font-semibold text-primary">Top Products</span>
        </Space>
      }
      className="bg-white border border-gray-200 rounded-lg"
    >
      {!topProducts || topProducts.length === 0 ? (
        <Empty 
          description="No product sales data available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          dataSource={topProducts}
          pagination={false}
          size="small"
          rowKey="_id"
          columns={[
            {
              title: "Rank",
              key: "rank",
              width: 60,
              render: (_, __, index) => (
                <span className="font-bold text-primary">#{index + 1}</span>
              ),
            },
            {
              title: "Product",
              dataIndex: "name",
              key: "name",
              render: (name: string, record: any) => (
                <div>
                  <div className="font-medium">{name || 'Unknown Product'}</div>
                  {record.category && (
                    <div className="text-xs text-gray-500">{record.category}</div>
                  )}
                </div>
              ),
            },
            {
              title: "Sold",
              dataIndex: "totalSold",
              key: "totalSold",
              align: "center",
              render: (value: number) => (
                <span className="font-semibold text-blue-600">
                  {value?.toLocaleString() || '0'}
                </span>
              ),
            },
            {
              title: "Revenue",
              dataIndex: "revenue",
              key: "revenue",
              align: "right",
              render: (value: number) => (
                <span className="font-semibold text-green-600">
                  ৳{value?.toFixed(2) || '0.00'}
                </span>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
};

export default TopProducts;
