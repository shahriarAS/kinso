"use client";

import { Drawer, Descriptions, Table, Tag, Divider, Spin, Alert, Button, Space, Card, Row, Col, Typography } from "antd";
import { CalendarOutlined, UserOutlined, ShopOutlined, CreditCardOutlined, FileTextOutlined, DownloadOutlined, NumberOutlined, ContactsOutlined } from "@ant-design/icons";
import { useGetSaleByIdQuery } from "../api";
import type { Sale } from "../types";
import { pdf } from "@react-pdf/renderer";
import { useGetSettingsQuery } from "@/features/settings/api";
import { useFetchAuthUserQuery } from "@/features/auth";
import InvoicePDF from "@/components/common/InvoicePDF";
import { mapSaleToInvoiceData } from "@/lib/invoiceUtils";
import toast from "react-hot-toast";
import { useCallback } from "react";

const { Text, Title } = Typography;

interface ViewSaleDrawerProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
}

export default function ViewSaleDrawer({ open, onClose, saleId }: ViewSaleDrawerProps) {
  const { data: saleData, isLoading, error } = useGetSaleByIdQuery(saleId || "", {
    skip: !saleId,
  });
  const { data: settingsData } = useGetSettingsQuery();
  const { data: userData } = useFetchAuthUserQuery();

  const sale = saleData?.data;

  // Download invoice PDF function
  const downloadInvoicePDF = useCallback(
    async () => {
      if (!sale || !settingsData) {
        toast.error("Sale or settings not found");
        return;
      }
      try {
        const invoiceData = mapSaleToInvoiceData(
          sale,
          settingsData.data,
          userData?.user?.name,
        );
        const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded successfully!");
      } catch (err) {
        toast.error("Failed to download Invoice");
        console.error("Failed to download PDF", err);
      }
    },
    [sale, settingsData, userData]
  );

  const itemColumns = [
    {
      title: "Product",
      dataIndex: ["stock", "product", "name"],
      key: "product",
      render: (productName: string, record: any) => {
        const product = record.stock?.product;
        return (
          <div>
            <div className="font-medium text-gray-900">{product?.name || "Unknown Product"}</div>
            {product?.barcode && (
              <div className="text-xs text-gray-500">Barcode: {product.barcode}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center" as const,
      render: (quantity: number) => <Text strong className="text-blue-600">{quantity}</Text>,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      align: "right" as const,
      render: (price: number) => <Text>৳{price?.toFixed(2)}</Text>,
    },
    {
      title: "Discount",
      dataIndex: "discountApplied",
      key: "discountApplied",
      width: 100,
      align: "right" as const,
      render: (discount: number) => (
        <Text className="text-red-600">-৳{discount?.toFixed(2) || '0.00'}</Text>
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 120,
      align: "right" as const,
      render: (record: any) => {
        const subtotal = (record.quantity * record.unitPrice) - (record.discountApplied || 0);
        return <Text strong className="text-green-600">৳{subtotal?.toFixed(2)}</Text>;
      },
    },
  ];

  if (error) {
    return (
      <Drawer
        title="Sale Details"
        open={open}
        onClose={onClose}
        width={900}
      >
        <Alert
          message="Error"
          description="Failed to load sale details. Please try again."
          type="error"
          showIcon
          className="mt-8"
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <Space>
            <FileTextOutlined className="text-blue-600" />
            <span>Sale Details</span>
            {sale && (
              <Tag color="blue" className="text-sm font-medium">
                {sale.saleId}
              </Tag>
            )}
          </Space>
          {sale && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadInvoicePDF}
              size="middle"
            >
              Download Invoice
            </Button>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={900}
      className="sale-details-drawer"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : sale ? (
        <div className="space-y-6">
          {/* Sale Information Card */}
          <Card size="small" className="shadow-sm">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" className="w-full">
                  <div className="flex items-center gap-2">
                    <NumberOutlined className="text-gray-500" />
                    <Text strong>Sale ID:</Text>
                    <Tag color="processing">{sale.saleId}</Tag>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-500" />
                    <Text strong>Date:</Text>
                    <Text>{new Date(sale.saleDate).toLocaleString()}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShopOutlined className="text-gray-500" />
                    <Text strong>Outlet:</Text>
                    <Text>{sale.outlet?.name || "N/A"}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" className="w-full">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-500" />
                    <Text strong>Customer:</Text>
                    {sale.customer ? (
                      <div>
                        <div className="font-medium">{sale.customer.name}</div>
                        {sale.customer.contactInfo?.phone && (
                          <Text type="secondary" className="text-xs">
                            {sale.customer.contactInfo.phone}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Tag color="orange">Walk-in Customer</Tag>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ContactsOutlined className="text-gray-500" />
                    <Text strong>Created By:</Text>
                    <Text>{sale.createdBy?.name || "Unknown"}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-500" />
                    <Text strong>Created At:</Text>
                    <Text>{new Date(sale.createdAt).toLocaleString()}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Items Section */}
          <Card 
            size="small" 
            title={
              <Space>
                <Text strong>Items ({sale.items?.length || 0})</Text>
              </Space>
            }
            className="shadow-sm"
          >
            <Table
              columns={itemColumns}
              dataSource={sale.items || []}
              rowKey={(record, index) => `${record.stock?._id}-${index}`}
              pagination={false}
              size="small"
              bordered
              summary={(pageData) => {
                const totalQuantity = pageData.reduce((sum, record) => sum + record.quantity, 0);
                const totalAmount = pageData.reduce((sum, record) => {
                  return sum + ((record.quantity * record.unitPrice) - (record.discountApplied || 0));
                }, 0);

                return (
                  <Table.Summary.Row className="bg-gray-50">
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{totalQuantity}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} />
                    <Table.Summary.Cell index={4}>
                      <Text strong className="text-green-600">৳{totalAmount.toFixed(2)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>

          {/* Payment Information Card */}
          <Card 
            size="small"
            title={
              <Space>
                <CreditCardOutlined className="text-blue-600" />
                <Text strong>Payment Details</Text>
              </Space>
            }
            className="shadow-sm"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={14}>
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex justify-between items-center">
                    <Text>Items Total:</Text>
                    <Text className="font-medium">
                      ৳{((sale.totalAmount || 0) + (sale.discountAmount || 0)).toFixed(2)}
                    </Text>
                  </div>
                  {(sale.discountAmount || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <Text>Discount:</Text>
                      <Text className="font-medium text-red-600">
                        -৳{(sale.discountAmount || 0).toFixed(2)}
                      </Text>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text strong className="text-lg">Total Amount:</Text>
                    <Text strong className="text-lg text-green-600">
                      ৳{(sale.totalAmount || 0).toFixed(2)}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="font-medium">Paid Amount:</Text>
                    <Text className="font-medium text-blue-600">
                      ৳{(sale.paymentMethods?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0).toFixed(2)}
                    </Text>
                  </div>
                  {(() => {
                    const dueAmount = Math.max(0, (sale.totalAmount || 0) - (sale.paymentMethods?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0));
                    return dueAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <Text className="font-medium">Due Amount:</Text>
                        <Text className="font-medium text-red-600">
                          ৳{dueAmount.toFixed(2)}
                        </Text>
                      </div>
                    );
                  })()}
                </Space>
              </Col>
              <Col xs={24} md={10}>
                <div>
                  <Text strong className="mb-3 block">Payment Methods:</Text>
                  <Space direction="vertical" size="small" className="w-full">
                    {sale.paymentMethods?.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <Tag color="processing" className="mb-0">{payment.method}</Tag>
                        <Text className="font-medium">৳{payment.amount?.toFixed(2)}</Text>
                      </div>
                    ))}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Notes Section */}
          {sale.notes && (
            <Card size="small" title={<Text strong>Notes</Text>} className="shadow-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Text>{sale.notes}</Text>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Alert
          message="No Data"
          description="Sale details not found."
          type="warning"
          showIcon
          className="mt-8"
        />
      )}
    </Drawer>
  );
}
