import React from "react";
import { Card, Statistic, Row, Col, Progress } from "antd";
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined 
} from "@ant-design/icons";
import { StockStats as StockStatsType } from "../types";

interface StockStatsProps {
  stats: StockStatsType;
  loading?: boolean;
}

const StockStats: React.FC<StockStatsProps> = ({ stats, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Stock"
              value={stats.totalStock}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Value"
              value={formatCurrency(stats.totalValue)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Low Stock Items"
              value={stats.lowStockItems}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.lowStockItems > 0 ? "#faad14" : "#3f8600" }}
            />
            {stats.lowStockItems > 0 && (
              <div className="mt-2">
                <Progress
                  percent={Math.min((stats.lowStockItems / 100) * 100, 100)}
                  size="small"
                  status={stats.lowStockItems > 10 ? "exception" : "active"}
                />
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Expiring Items"
              value={stats.expiringItems}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats.expiringItems > 0 ? "#cf1322" : "#3f8600" }}
            />
            {stats.expiringItems > 0 && (
              <div className="mt-2">
                <Progress
                  percent={Math.min((stats.expiringItems / 50) * 100, 100)}
                  size="small"
                  status={stats.expiringItems > 20 ? "exception" : "active"}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Stock by Location */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title="Stock by Warehouse" loading={loading}>
            {Object.entries(stats.stockByLocation.warehouse).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.stockByLocation.warehouse).map(([warehouseId, units]) => (
                  <div key={warehouseId} className="flex justify-between items-center">
                    <span className="font-medium">{warehouseId}</span>
                    <span className="text-blue-600 font-semibold">{units} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No warehouse stock data</p>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Stock by Outlet" loading={loading}>
            {Object.entries(stats.stockByLocation.outlet).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.stockByLocation.outlet).map(([outletId, units]) => (
                  <div key={outletId} className="flex justify-between items-center">
                    <span className="font-medium">{outletId}</span>
                    <span className="text-green-600 font-semibold">{units} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No outlet stock data</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StockStats; 