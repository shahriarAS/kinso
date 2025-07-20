import { Button, Drawer, Spin, Table } from "antd";
import type { Order } from "@/types/order";

type Props = {
  viewOrder: Order | null;
  setViewOrder: (order: Order | null) => void;
};

export default function ViewOrderDrawer({ viewOrder, setViewOrder }: Props) {
  return (
    <Drawer
      title={viewOrder ? `Order #${viewOrder.orderNumber}` : ""}
      open={!!viewOrder}
      onClose={() => setViewOrder(null)}
      width={800}
      className="rounded-3xl"
      getContainer={false}
      destroyOnClose
      extra={
        <Button onClick={() => setViewOrder(null)} type="default">
          Close
        </Button>
      }
    >
      {viewOrder ? (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="font-semibold text-lg mb-2">
              Customer: {viewOrder.customerName}
            </div>
            <div className="text-gray-600 text-sm mb-1">
              Order #: {viewOrder.orderNumber}
            </div>
            <div className="text-gray-600 text-sm mb-1">
              Date: {new Date(viewOrder.createdAt).toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm mb-1">
              Subtotal: ৳
              {viewOrder.items
                .reduce((sum, item) => sum + item.totalPrice, 0)
                .toFixed(2)}
            </div>
            <div className="text-red-500 text-sm mb-1">
              Discount: ৳
              {typeof viewOrder.discount === "number"
                ? viewOrder.discount.toFixed(2)
                : (
                    viewOrder.items.reduce(
                      (sum, item) => sum + item.totalPrice,
                      0
                    ) - viewOrder.totalAmount
                  ).toFixed(2)}
            </div>
            <div className="text-green-700 text-base font-bold mb-1">
              Final Total: ৳{viewOrder.totalAmount.toFixed(2)}
            </div>
            {viewOrder.notes && (
              <div className="text-gray-600 text-sm mb-1">
                Notes: {viewOrder.notes}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold mb-2">Items</div>
            <Table
              columns={[
                {
                  title: "Product",
                  dataIndex: ["product", "name"],
                  key: "product",
                },
                { title: "SKU", dataIndex: ["product", "sku"], key: "sku" },
                { title: "Qty", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  render: (v: number) => `৳${v.toFixed(2)}`,
                },
                {
                  title: "Total",
                  dataIndex: "totalPrice",
                  key: "totalPrice",
                  render: (v: number) => `৳${v.toFixed(2)}`,
                },
              ]}
              dataSource={viewOrder.items.map((item) => ({
                ...item,
                key: item.product._id,
              }))}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        </div>
      ) : (
        <Spin />
      )}
    </Drawer>
  );
}
