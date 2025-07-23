"use client";

import {
  Tabs,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Switch,
  Select,
  Skeleton,
  Divider,
  Tooltip,
} from "antd";
import { useEffect, useRef } from "react";
import { message } from "antd";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/settings";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";

export default function SettingsPage() {
  const [form] = Form.useForm();
  const { data, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const saveButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({ warrantyPolicy: data.data.warrantyPolicy || "" });
    }
  }, [data, form]);

  const handleFinish = async (values: any) => {
    try {
      await updateSettings({ warrantyPolicy: values.warrantyPolicy }).unwrap();
      message.success("Warranty policy saved");
      refetch();
    } catch {
      message.error("Failed to save warranty policy");
    }
  };

  // Responsive: stack fields vertically on mobile
  const colProps = { xs: 24, md: 12 };

  return (
    <div className="h-full w-full min-h-screen p-0">
      <div className="p-6 flex flex-col gap-10">
        <div className="flex items-center gap-4 mb-2">
          <DashboardHeader
            title="Settings"
            subtitle="Manage your system and business settings."
          />
        </div>
        <Card className="w-full bg-white border rounded-2xl shadow-sm p-0 relative overflow-visible">
          <Tabs
            defaultActiveKey="general"
            type="card"
            className="settings-tabs transition-all duration-300"
            tabBarGutter={32}
          >
            <Tabs.TabPane tab={"General"} key="general">
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleFinish}
                  initialValues={{ warrantyPolicy: "" }}
                >
                  <Divider orientation="left" className="!mb-2">
                    Invoice Settings
                  </Divider>
                  <Form.Item
                    label={
                      <span>
                        Invoice Warranty Policy
                        <Tooltip title="This policy will appear on all customer invoices.">
                          <span className="ml-1 text-gray-400 cursor-pointer">
                            ?
                          </span>
                        </Tooltip>
                      </span>
                    }
                    name="warrantyPolicy"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the warranty policy.",
                      },
                    ]}
                    extra="This policy will be printed at the bottom of every invoice."
                  >
                    <Input.TextArea
                      rows={6}
                      placeholder="Enter warranty policy for invoices..."
                      disabled={isLoading || isSaving}
                      className="transition-all duration-200"
                    />
                  </Form.Item>
                  <div
                    ref={saveButtonRef}
                    className="flex justify-end gap-2 sticky bottom-0 bg-white py-3 z-10 mt-6"
                  >
                    <Button
                      type="default"
                      size="large"
                      disabled={isLoading || isSaving}
                      onClick={() => form.resetFields()}
                      className="transition-all duration-200"
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      disabled={isLoading}
                      size="large"
                      className="transition-all duration-200"
                    >
                      Save
                    </Button>
                  </div>
                </Form>
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab={"Business"} key="business">
              <Divider orientation="left" className="!mb-2">
                Business Information
              </Divider>
              <Form layout="vertical" disabled>
                <Row gutter={16}>
                  <Col {...colProps}>
                    <Form.Item
                      label={"Business Name"}
                      extra="Your registered business name."
                    >
                      <Input placeholder="Business Name" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item
                      label={"Business Email"}
                      extra="Official email for business communication."
                    >
                      <Input placeholder="Business Email" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col {...colProps}>
                    <Form.Item label={"Phone"} extra="Primary contact number.">
                      <Input placeholder="Phone Number" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item
                      label={"Address"}
                      extra="Business address for invoices."
                    >
                      <Input placeholder="Business Address" />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider orientation="left" className="!mb-2">
                  Preferences
                </Divider>
                <Row gutter={16}>
                  <Col {...colProps}>
                    <Form.Item
                      label={"Dark Mode"}
                      extra="Toggle dark mode for the dashboard."
                    >
                      <Switch checkedChildren="On" unCheckedChildren="Off" />
                    </Form.Item>
                  </Col>
                  <Col {...colProps}>
                    <Form.Item
                      label={"Currency"}
                      extra="Default currency for transactions."
                    >
                      <Select placeholder="Select Currency">
                        <Select.Option value="usd">USD</Select.Option>
                        <Select.Option value="eur">EUR</Select.Option>
                        <Select.Option value="bdt">BDT</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab={"Security"} key="security">
              <Divider orientation="left" className="!mb-2">
                Account Security
              </Divider>
              <Form layout="vertical" disabled>
                <Form.Item
                  label={"Change Password"}
                  extra="Update your account password regularly."
                >
                  <Input.Password placeholder="********" />
                </Form.Item>
                <Form.Item
                  label={"2FA Email Alerts"}
                  extra="Enable two-factor authentication alerts."
                >
                  <Switch
                    checkedChildren="Enabled"
                    unCheckedChildren="Disabled"
                  />
                </Form.Item>
              </Form>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
      <style jsx global>{`
        .settings-tabs .ant-tabs-tab {
          transition:
            color 0.2s,
            border-color 0.2s;
        }
        .settings-tabs .ant-tabs-tab-active {
          color: #1677ff !important;
        }
        .ant-btn {
          transition:
            background 0.2s,
            color 0.2s,
            box-shadow 0.2s;
        }
        .ant-input,
        .ant-input-password,
        .ant-input-textarea {
          transition:
            box-shadow 0.2s,
            border-color 0.2s;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
