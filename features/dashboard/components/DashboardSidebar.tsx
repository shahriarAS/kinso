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
  {
    icon: "lineicons:user",
    label: "Users",
    href: "/dashboard/users",
  },
  {
    icon: "lineicons:cog",
    label: "Settings",
    href: "/dashboard/settings",
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
          Kinso
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
            <Icon icon={item.icon} className="text-2xl" />
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
      {/* Profile context menu at the bottom */}
      <ProfileMenu collapsed={collapsed} />
    </aside>
  );
}

function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const { data, isLoading } = useFetchAuthUserQuery();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
  const email = data?.user?.email || "";
  const avatar = data?.user?.avatar;

  const handleLogout = async () => {
    await logoutUser();
  };

  const menu = (
    <div className="min-w-[180px] py-2 px-3 bg-[#232323] rounded-lg shadow-lg border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          size={32}
          src={avatar}
          icon={<UserOutlined />}
          className="bg-secondary/30"
        />
        <div className="flex flex-col">
          <span className="text-xs text-white font-medium">{email}</span>
        </div>
      </div>
      <Button
        type="text"
        icon={<LogoutOutlined />}
        className="w-full text-left text-red-500 hover:bg-red-50 hover:text-red-700 mt-2"
        onClick={handleLogout}
        loading={isLoggingOut}
      >
        Logout
      </Button>
    </div>
  );

  return (
    <div
      className={twMerge(
        "w-full flex items-center justify-center py-4 border-t border-white/10",
        collapsed ? "px-0" : "px-4",
      )}
    >
      {isLoading ? (
        <Spin size="small" />
      ) : (
        <Dropdown popupRender={() => menu} trigger={["click"]} placement="top">
          <div
            className={twMerge(
              "flex items-center cursor-pointer p-2 rounded-lg hover:bg-secondary/10 transition-all",
              collapsed ? "justify-center" : "justify-start gap-2",
            )}
            tabIndex={0}
          >
            <Avatar
              size={collapsed ? 32 : 40}
              src={avatar}
              icon={<UserOutlined />}
              className={twMerge("bg-secondary/30", collapsed ? "ml-4" : "")}
            />
            <span
              className={twMerge(
                "transition-all text-white text-sm font-medium whitespace-nowrap overflow-hidden",
                collapsed
                  ? "max-w-0 opacity-0 pointer-events-none select-none"
                  : "max-w-xs opacity-100",
              )}
              style={{ transitionProperty: "max-width, opacity" }}
            >
              {email}
            </span>
            <DownOutlined
              className={twMerge(
                "text-white text-xs transition-all",
                collapsed ? "opacity-0" : "opacity-100",
              )}
            />
          </div>
        </Dropdown>
      )}
    </div>
  );
}
