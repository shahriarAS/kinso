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
  Skeleton,
  Divider,
  Tooltip,
  Modal,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/settings";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [generalForm] = Form.useForm();
  const [businessForm] = Form.useForm();
  const { data, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const saveButtonRef = useRef<HTMLDivElement>(null);
  const [generalTouched, setGeneralTouched] = useState(false);
  const [businessTouched, setBusinessTouched] = useState(false);

  useEffect(() => {
    if (data?.data) {
      generalForm.setFieldsValue({
        invoiceFooter: data.data.invoiceFooter || "",
        invoiceFooterTitle: data.data.invoiceFooterTitle || "Warranty Policy",
      });
      businessForm.setFieldsValue({
        companyName: data.data.companyName || "",
        companyEmail: data.data.companyEmail || "",
        companyPhone: data.data.companyPhone || "",
        companyAddress: data.data.companyAddress || "",
      });
      setGeneralTouched(false);
      setBusinessTouched(false);
    }
  }, [data, generalForm, businessForm]);

  const handleGeneralSave = async (values: {
    invoiceFooter: string;
    invoiceFooterTitle: string;
  }) => {
    try {
      await updateSettings({
        invoiceFooter: values.invoiceFooter,
        invoiceFooterTitle: values.invoiceFooterTitle,
      }).unwrap();
      toast.success("Warranty policy saved");
      refetch();
      setGeneralTouched(false);
    } catch {
      toast.error("Failed to save warranty policy");
    }
  };

  const handleBusinessSave = async (values: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
  }) => {
    try {
      await updateSettings({
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        companyAddress: values.companyAddress,
      }).unwrap();
      toast.success("Company info saved");
      refetch();
      setBusinessTouched(false);
    } catch {
      toast.error("Failed to save company info");
    }
  };

  // Responsive: stack fields vertically on mobile
  const colProps = { xs: 24, md: 12 };

  const handleTabChange = (key: string) => {
    if (key === activeTab) return;
    if (
      (activeTab === "general" && generalTouched) ||
      (activeTab === "business" && businessTouched)
    ) {
      setPendingTab(key);
      Modal.confirm({
        title: "Unsaved Changes",
        content: "You have unsaved changes. Are you sure you want to switch tabs and lose your changes?",
        okText: "Switch Tab",
        cancelText: "Stay",
        onOk: () => {
          setActiveTab(key);
          setPendingTab(null);
        },
        onCancel: () => {
          setPendingTab(null);
        },
      });
    } else {
      setActiveTab(key);
    }
  };

  return (
    <div className="h-full w-full min-h-screen p-0">
      <div className="p-6 flex flex-col gap-10">
        <div className="flex items-center gap-4 mb-2">
          <DashboardHeader
            title="Settings"
            subtitle="Manage your system and business settings."
          />
        </div>
        <Card className="w-full bg-white border border-gray-200 rounded-lg p-0 relative overflow-visible">
          <Tabs
            activeKey={activeTab}
            type="card"
            className="settings-tabs transition-all duration-300"
            tabBarGutter={32}
            onChange={handleTabChange}
          >
            <Tabs.TabPane tab={"General"} key="general">
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Form
                  layout="vertical"
                  form={generalForm}
                  onFinish={handleGeneralSave}
                  initialValues={{ invoiceFooter: "", invoiceFooterTitle: "" }}
                  onValuesChange={() => setGeneralTouched(true)}
                >
                  <Divider orientation="left" className="!mb-2">
                    Invoice Settings
                  </Divider>
                  <div className="mb-4">
                    <div className="font-semibold text-base mb-1 flex items-center">
                      Invoice Footer
                      <Tooltip title="This policy will appear on all customer invoices.">
                        <span className="ml-1 text-gray-400 cursor-pointer">
                          ?
                        </span>
                      </Tooltip>
                    </div>
                    <Form.Item
                      name="invoiceFooterTitle"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the warranty policy title.",
                        },
                      ]}
                      extra="This title will appear above the warranty policy on invoices."
                      className="mb-2"
                    >
                      <Input
                        placeholder="Enter warranty policy title (e.g. Warranty Policy)"
                        disabled={isLoading || isSaving}
                        className="transition-all duration-200"
                      />
                    </Form.Item>
                    <Form.Item
                      name="invoiceFooter"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the warranty policy.",
                        },
                      ]}
                      extra="This policy will be printed at the bottom of every invoice."
                      className="mb-0"
                    >
                      <Input.TextArea
                        rows={6}
                        placeholder="Enter warranty policy for invoices..."
                        disabled={isLoading || isSaving}
                        className="transition-all duration-200"
                      />
                    </Form.Item>
                  </div>
                  <div
                    ref={saveButtonRef}
                    className="flex justify-end gap-2 sticky bottom-0 bg-white py-3 z-10 mt-6"
                  >
                    <Button
                      type="default"
                      size="large"
                      disabled={isLoading || isSaving}
                      onClick={() => { generalForm.resetFields(); setGeneralTouched(false); }}
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
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Form
                  layout="vertical"
                  form={businessForm}
                  onFinish={handleBusinessSave}
                  initialValues={{ companyName: "", companyEmail: "", companyPhone: "", companyAddress: "" }}
                  onValuesChange={() => setBusinessTouched(true)}
                >
                  <Row gutter={16}>
                    <Col {...colProps}>
                      <Form.Item
                        name="companyName"
                        label="Business Name"
                        rules={[
                          { required: true, message: "Please enter the business name." },
                        ]}
                        extra="Your registered business name."
                      >
                        <Input placeholder="Business Name" disabled={isLoading || isSaving} />
                      </Form.Item>
                    </Col>
                    <Col {...colProps}>
                      <Form.Item
                        name="companyEmail"
                        label="Business Email"
                        rules={[
                          { required: true, message: "Please enter the business email." },
                          { type: "email", message: "Please enter a valid email address." },
                        ]}
                        extra="Official email for business communication."
                      >
                        <Input placeholder="Business Email" disabled={isLoading || isSaving} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col {...colProps}>
                      <Form.Item
                        name="companyPhone"
                        label="Phone"
                        rules={[
                          { required: true, message: "Please enter the phone number." },
                        ]}
                        extra="Primary contact number."
                      >
                        <Input placeholder="Phone Number" disabled={isLoading || isSaving} />
                      </Form.Item>
                    </Col>
                    <Col {...colProps}>
                      <Form.Item
                        name="companyAddress"
                        label="Address"
                        rules={[
                          { required: true, message: "Please enter the business address." },
                        ]}
                        extra="Business address for invoices."
                      >
                        <Input placeholder="Business Address" disabled={isLoading || isSaving} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div
                    ref={saveButtonRef}
                    className="flex justify-end gap-2 sticky bottom-0 bg-white py-3 z-10 mt-6"
                  >
                    <Button
                      type="default"
                      size="large"
                      disabled={isLoading || isSaving}
                      onClick={() => { businessForm.resetFields(); setBusinessTouched(false); }}
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
            border-color 0.2s;
        }
        .ant-input,
        .ant-input-password,
        .ant-input-textarea {
          transition:
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
