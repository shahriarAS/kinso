"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "var(--font-montserrat)",
            colorPrimary: "var(--color-primary)",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
