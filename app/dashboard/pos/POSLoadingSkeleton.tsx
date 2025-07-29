import { Skeleton } from "antd";

export default function POSLoadingSkeleton() {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-80"
      style={{ pointerEvents: "auto" }}
    >
      <div className="gap-4 grid grid-cols-5 w-full h-full p-6">
        {/* ProductGrid Skeleton (col-span-3) */}
        <div className="col-span-3">
          <div className="mb-8 flex gap-4 items-center">
            <Skeleton.Input
              active
              size="large"
              className="w-full rounded-lg"
              style={{ height: 40 }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 min-h-[220px] flex flex-col gap-3 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Skeleton.Avatar active size={40} shape="square" />
                  <div className="flex flex-col flex-1">
                    <Skeleton.Input
                      active
                      size="small"
                      style={{
                        width: 120,
                        height: 18,
                        marginBottom: 4,
                      }}
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 80, height: 14 }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 60, height: 20 }}
                  />
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 40, height: 20 }}
                  />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 60, height: 24 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 50, height: 16 }}
                  />
                </div>
                <Skeleton.Button
                  active
                  size="large"
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 12,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* CartDetails Skeleton (col-span-2) */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 min-h-[500px] overflow-hidden relative">
            <div className="font-semibold text-xl text-primary flex justify-between items-center mb-1">
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, height: 24 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 80, height: 16 }}
              />
            </div>
            <div className="flex gap-2 mb-1">
              <Skeleton.Input
                active
                size="large"
                style={{ width: "100%", height: 40, borderRadius: 24 }}
              />
              <Skeleton.Button
                active
                size="large"
                style={{ width: 48, height: 40, borderRadius: 8 }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 py-4 gap-4 bg-white/80 rounded-md px-2"
                >
                  <div className="flex items-center gap-3 w-1/3">
                    <div>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{
                          width: 80,
                          height: 16,
                          marginBottom: 4,
                        }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 60, height: 12 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-2/3">
                    <Skeleton.Button
                      active
                      size="small"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                      }}
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 28, height: 24 }}
                    />
                    <Skeleton.Button
                      active
                      size="small"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                      }}
                    />
                    <Skeleton.Input
                      active
                      size="large"
                      style={{ width: 60, height: 32 }}
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 50, height: 20 }}
                    />
                    <Skeleton.Button
                      active
                      size="small"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Cart summary skeleton */}
            <div className="pt-4 border-t border-gray-200 text-sm flex flex-col gap-1">
              <div className="flex justify-between">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 60, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 30, height: 16 }}
                />
              </div>
              <div className="flex justify-between">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 60, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 50, height: 16 }}
                />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 60, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="large"
                  style={{ width: 80, height: 32 }}
                />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 items-center">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 60, height: 20 }}
                />
                <Skeleton.Input
                  active
                  size="large"
                  style={{ width: 80, height: 32 }}
                />
              </div>
              <Skeleton.Button
                active
                size="large"
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 12,
                  marginTop: 16,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
