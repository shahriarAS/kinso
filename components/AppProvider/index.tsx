"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { useAppSelector } from "@/store/hooks";
import NotificationContainer from "@/components/common/NotificationContainer";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "var(--font-montserrat)",
            colorPrimary: theme.primaryColor,
          },
          algorithm: theme.mode === "dark" ? undefined : undefined, // Add dark mode support later
          components: {
            Button: {
              colorPrimary: theme.primaryColor,
            },
          },
        }}
      >
        {children}
        <NotificationContainer />
      </ConfigProvider>
    </AntdRegistry>
  );
}
