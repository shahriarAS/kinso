"use client";

import { Drawer, Descriptions, Table, Tag, Divider, Spin, Alert, Button } from "antd";
import { CalendarOutlined, UserOutlined, ShopOutlined, CreditCardOutlined, FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import { useGetSaleByIdQuery } from "../api";
import type { Sale } from "../types";
import { pdf } from "@react-pdf/renderer";
import { useGetSettingsQuery } from "@/features/settings/api";
import { useFetchAuthUserQuery } from "@/features/auth";
import InvoicePDF from "@/components/common/InvoicePDF";
import { mapSaleToInvoiceData } from "@/lib/invoiceUtils";
import toast from "react-hot-toast";
import { useCallback } from "react";

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
      render: (productName: string, record: any) => (
        <div>
          <div className="font-medium">{productName || "Unknown Product"}</div>
          <div className="text-xs text-gray-500">Barcode: {record.stock?.product?.barcode}</div>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => <span className="font-medium">{quantity}</span>,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      render: (price: number) => <span>৳{price?.toFixed(2)}</span>,
    },
    {
      title: "Discount",
      dataIndex: "discountApplied",
      key: "discountApplied",
      width: 100,
      render: (discount: number) => (
        <span className="text-red-600">-৳{discount?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 120,
      render: (record: any) => {
        const subtotal = (record.quantity * record.unitPrice) - (record.discountApplied || 0);
        return <span className="font-medium">৳{subtotal?.toFixed(2)}</span>;
      },
    },
  ];

  if (error) {
    return (
      <Drawer
        title="Sale Details"
        open={open}
        onClose={onClose}
        width={800}
      >
        <Alert
          message="Error"
          description="Failed to load sale details. Please try again."
          type="error"
          showIcon
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-primary" />
            <span>Sale Details</span>
            {sale && <Tag color="blue">{sale.saleId}</Tag>}
          </div>
          {sale && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadInvoicePDF}
              size="small"
            >
              Download Invoice
            </Button>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={800}
      className="sale-details-drawer"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : sale ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <Descriptions
            title="Sale Information"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-1">
                  <CalendarOutlined /> Sale ID
                </span>
              }
            >
              <Tag color="blue" className="text-sm">{sale.saleId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-1">
                  <CalendarOutlined /> Date
                </span>
              }
            >
              {new Date(sale.saleDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-1">
                  <ShopOutlined /> Outlet
                </span>
              }
            >
              {sale.outlet?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-1">
                  <UserOutlined /> Customer
                </span>
              }
            >
              {sale.customer ? (
                <div>
                  <div className="font-medium">{sale.customer.name}</div>
                  <div className="text-xs text-gray-500">{sale.customer.contactInfo?.phone}</div>
                </div>
              ) : (
                <Tag color="orange">Anonymous</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {sale.createdBy?.name || "Unknown"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(sale.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Items ({sale.items?.length || 0})</h3>
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
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={1}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totalQuantity}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} />
                    <Table.Summary.Cell index={4}>
                      <strong>৳{totalAmount.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCardOutlined />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span className="font-medium">
                    ৳{((sale.totalAmount || 0) + (sale.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span className="font-medium">-৳{(sale.discountAmount || 0).toFixed(2)}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-green-600">
                    ৳{(sale.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Paid Amount:</span>
                  <span className="font-medium text-blue-600">
                    ৳{(sale.paymentMethods?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Due Amount:</span>
                  <span className={`font-medium ${Math.max(0, (sale.totalAmount || 0) - (sale.paymentMethods?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0)) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    ৳{Math.max(0, (sale.totalAmount || 0) - (sale.paymentMethods?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Payment Methods:</div>
                <div className="space-y-1">
                  {sale.paymentMethods?.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <Tag color="blue">{payment.method}</Tag>
                      <span className="font-medium">৳{payment.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <div className="p-3 bg-gray-50 rounded border">
                {sale.notes}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Alert
          message="No Data"
          description="Sale details not found."
          type="warning"
          showIcon
        />
      )}
    </Drawer>
  );
}
