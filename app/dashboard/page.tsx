"use client";
import React from "react";
import { Row, Col, Alert } from "antd";
import { useGetDashboardStatsQuery } from "@/features/dashboard";
import {
  DashboardHeader,
  DashboardSkeleton,
  RecentSales,
  StatsCards,
  TopProducts,
} from "@/features/dashboard/components";
import { DashboardStats } from "@/features/dashboard/types";
import { useFetchAuthUserQuery } from "@/features/auth";

const Dashboard: React.FC = () => {
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery({});
  const { data: userData } = useFetchAuthUserQuery();
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [clickedFeature, setClickedFeature] = React.useState('');
  // const { data: inventoryAlerts } = useGetInventoryAlertsQuery();

  const handleFeatureClick = (featureName: string) => {
    setClickedFeature(featureName);
    setShowComingSoon(true);
  };

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description="Failed to load dashboard data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const stats: DashboardStats = dashboardStats?.data || {
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingSales: 0,
    lowStockProducts: 0,
    recentSales: [],
    topProducts: [],
    revenueChart: [],
  };

  // let alerts: InventoryAlertsType = {
  //   lowStockProducts: [],
  //   outOfStockProducts: [],
  //   expiringProducts: [],
  // };
  // if (inventoryAlerts) alerts = inventoryAlerts;

  return (
    <div className="p-6 space-y-6">
      {/* Clean Dashboard Header */}
      <div className="relative p-8 overflow-hidden text-white border-2 border-gray-200 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/20 via-transparent to-gray-700/20"></div>

        {/* Minimal floating elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/3 blur-lg"></div>

        <div className="relative z-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3">
              {/* Date with simple indicator */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                <p className="text-xs font-medium tracking-wide text-gray-300 uppercase">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Clean greeting */}
              <h1 className="text-4xl font-bold leading-tight text-white lg:text-4xl">
                Good{" "}
                {new Date().getHours() < 12
                  ? "Morning"
                  : new Date().getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                ,{" "}
                {userData?.user?.name
                  ? userData.user.name.split(" ").slice(-1)[0]
                  : "User"}
              </h1>

              {/* Simple subtitle */}
              <div className="flex items-center gap-3">
                <div className="w-0.5 h-4 bg-secondary rounded-full"></div>
                <p className="text-xl font-medium text-gray-200">
                  How can I help you today?
                </p>
              </div>
            </div>

            {/* Clean Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleFeatureClick('Ask AI')}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full text-sm font-semibold border border-purple-500/30 hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-2 overflow-hidden hover:scale-[1.02] transform cursor-pointer">
                {/* Subtle shine effect */}
                <div className="absolute inset-0 transition-transform duration-700 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full"></div>
                <span className="relative z-10">✨</span>
                <span className="relative z-10">Ask AI</span>
              </button>
              
              <button 
                onClick={() => handleFeatureClick('Get Tasks Updates')}
                className="group px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-transparent border border-gray-300 rounded-full hover:border-gray-200 hover:bg-white/10 hover:scale-[1.02] transform relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 transition-transform duration-500 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full"></div>
                <span className="relative z-10">Get tasks updates</span>
              </button>

              <button 
                onClick={() => handleFeatureClick('Create Workspace')}
                className="group px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-transparent border border-gray-300 rounded-full hover:border-gray-200 hover:bg-white/10 hover:scale-[1.02] transform relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 transition-transform duration-500 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full"></div>
                <span className="relative z-10">Create workspace</span>
              </button>

              <button 
                onClick={() => handleFeatureClick('Connect Apps')}
                className="group px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-transparent border border-gray-300 rounded-full hover:border-gray-200 hover:bg-white/10 hover:scale-[1.02] transform relative overflow-hidden cursor-pointer">
                <div className="absolute inset-0 transition-transform duration-500 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full"></div>
                <span className="relative z-10">Connect apps</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          ></div>
          
          {/* Modal */}
          <div className="relative w-full max-w-md p-8 mx-4 transition-all duration-300 transform scale-100 border-2 border-gray-200 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full bg-purple-500/20 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 -mb-10 -ml-10 rounded-full bg-violet-500/15 blur-lg"></div>
            
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-600">
                <span className="text-2xl">🚀</span>
              </div>
              
              {/* Title */}
              <h3 className="mb-3 text-2xl font-bold text-white">
                Coming Soon
              </h3>
              
              {/* Message */}
              <p className="mb-6 leading-relaxed text-gray-300">
                <span className="font-semibold text-purple-300">{clickedFeature}</span> is on its way! 
                This exciting feature will be available in our next update.
              </p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowComingSoon(false)}
                className="relative px-6 py-3 overflow-hidden font-semibold text-white transition-all duration-300 border rounded-full cursor-pointer group bg-gradient-to-r from-purple-600 to-violet-600 border-purple-500/30 hover:from-purple-700 hover:to-violet-700"
              >
                <div className="absolute inset-0 transition-transform duration-700 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full"></div>
                <span className="relative z-10">Got it!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <StatsCards stats={stats} />

      {/* <InventoryAlerts alerts={alerts} /> */}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <RecentSales recentSales={stats.recentSales} />
        </Col>
        <Col xs={24} lg={12}>
          <TopProducts topProducts={stats.topProducts} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
