"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dropdown, Avatar, Button, Spin } from "antd";
import { UserOutlined, LogoutOutlined, DownOutlined } from "@ant-design/icons";
import { useFetchAuthUserQuery, useLogoutUserMutation } from "@/features/auth";

const menuItems = [
  {
    icon: "lineicons:dashboard-square-1",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: "lineicons:cart-1",
    label: "Point of Sale",
    href: "/dashboard/pos",
  },
  {
    icon: "lsicon:management-stockout-outline",
    label: "Inventory",
    href: "/dashboard/inventory",
  },
  {
    icon: "lineicons:folder-1",
    label: "Category",
    href: "/dashboard/category",
  },
  {
    icon: "lineicons:buildings-1",
    label: "Warehouse",
    href: "/dashboard/warehouse",
  },
  {
    icon: "tabler:currency-taka",
    label: "Orders",
    href: "/dashboard/orders",
  },
  {
    icon: "lineicons:users",
    label: "Customers",
    href: "/dashboard/customers",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={twMerge(
        "h-full py-6 flex flex-col gap-16 transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={twMerge(
          "flex justify-between items-center transition-all duration-300",
          collapsed ? "px-4" : "px-8",
        )}
      >
        <span
          className={twMerge(
            "text-2xl font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
            collapsed
              ? "max-w-0 opacity-0 pointer-events-none select-none"
              : "max-w-xs opacity-100",
          )}
          style={{ transitionProperty: "max-width, opacity" }}
        >
          Ez Gadgets
        </span>
        <span
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer p-2 hover:bg-secondary/5 rounded-lg"
        >
          <Icon
            icon="lineicons:menu-cheesburger"
            className="text-2xl text-white/80"
          />
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              "flex items-center gap-4 text-white font-medium py-3 cursor-pointer transition-all duration-75  border-l-4 border-transparent",
              pathname === item.href
                ? "bg-gradient-to-r from-secondary/10 to-40% border-secondary"
                : "hover:bg-secondary/5",
              collapsed ? "pl-6" : "px-8",
            )}
          >
            <Icon
              icon={item.icon}
              className="text-xl text-white/80 flex-shrink-0"
            />
            <span
              className={twMerge(
                "whitespace-nowrap overflow-hidden transition-all duration-300",
                collapsed
                  ? "max-w-0 opacity-0 pointer-events-none select-none"
                  : "max-w-xs opacity-100",
              )}
              style={{ transitionProperty: "max-width, opacity" }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      <ProfileMenu collapsed={collapsed} />
    </aside>
  );
}

function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const { data: authUser, isLoading } = useFetchAuthUserQuery();
  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => {
        // Handle profile navigation
      },
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  if (isLoading) {
    return (
      <div
        className={twMerge(
          "flex items-center gap-3 transition-all duration-300",
          collapsed ? "px-4" : "px-8",
        )}
      >
        <Spin size="small" />
        {!collapsed && <span className="text-white/60">Loading...</span>}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        "flex items-center gap-3 transition-all duration-300",
        collapsed ? "px-4" : "px-8",
      )}
    >
      <Dropdown
        menu={{ items: menuItems }}
        placement="topRight"
        trigger={["click"]}
      >
        <Button
          type="text"
          className="flex items-center gap-3 text-white hover:bg-secondary/10 p-2 rounded-lg transition-all duration-75"
        >
          <Avatar
            size="small"
            icon={<UserOutlined />}
            className="bg-secondary/20"
          />
          <div
            className={twMerge(
              "flex flex-col items-start whitespace-nowrap overflow-hidden transition-all duration-300",
              collapsed
                ? "max-w-0 opacity-0 pointer-events-none select-none"
                : "max-w-xs opacity-100",
            )}
            style={{ transitionProperty: "max-width, opacity" }}
          >
            <span className="text-sm font-medium text-white">
              {authUser?.user?.name || "User"}
            </span>
            <span className="text-xs text-white/60">
              {authUser?.user?.role || "Staff"}
            </span>
          </div>
          <DownOutlined
            className={twMerge(
              "text-white/60 transition-all duration-300",
              collapsed
                ? "max-w-0 opacity-0 pointer-events-none select-none"
                : "max-w-xs opacity-100",
            )}
            style={{ transitionProperty: "max-width, opacity" }}
          />
        </Button>
      </Dropdown>
    </div>
  );
}
