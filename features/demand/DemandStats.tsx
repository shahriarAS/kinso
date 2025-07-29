"use client";

import React from "react";
import { Card, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Demand } from "./types";

interface DemandStatsProps {
  demands: Demand[];
  loading: boolean;
}

export const DemandStats: React.FC<DemandStatsProps> = ({
  demands,
  loading,
}) => {
  const totalDemands = demands.length;
  const pendingDemands = demands.filter((d) => d.status === "Pending").length;
  const approvedDemands = demands.filter((d) => d.status === "Approved").length;
  const convertedDemands = demands.filter(
    (d) => d.status === "ConvertedToStock",
  ).length;

  const totalItems = demands.reduce(
    (sum, demand) =>
      sum +
      demand.products.reduce(
        (itemSum, product) => itemSum + product.quantity,
        0,
      ),
    0,
  );

  const stats = [
    {
      title: "Total Demands",
      value: totalDemands,
      icon: <ShoppingCartOutlined className="text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: pendingDemands,
      icon: <ClockCircleOutlined className="text-orange-600" />,
      color: "text-orange-600",
    },
    {
      title: "Approved",
      value: approvedDemands,
      icon: <CheckCircleOutlined className="text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "Converted",
      value: convertedDemands,
      icon: <ArrowUpOutlined className="text-purple-600" />,
      color: "text-purple-600",
    },
    {
      title: "Total Items",
      value: totalItems,
      icon: <ShoppingCartOutlined className="text-indigo-600" />,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:border-primary/30 transition-all border border-gray-200"
        >
          <Statistic
            title={
              <span className="text-gray-600 font-medium">{stat.title}</span>
            }
            value={stat.value}
            prefix={stat.icon}
            loading={loading}
            valueStyle={{ fontSize: "24px", fontWeight: "600" }}
            className={stat.color}
          />
        </Card>
      ))}
    </div>
  );
};
