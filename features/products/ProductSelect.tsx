import React, { useState, useCallback } from "react";
import { Select, Spin } from "antd";
import { useGetProductsQuery } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const PAGE_SIZE = 20;

export default function ProductSelect({ value, onChange, placeholder }: ProductSelectProps) {
  const [rawSearch, setRawSearch] = useState("");
  const debouncedSearch = useDebounce(rawSearch, 400);
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [fetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading } = useGetProductsQuery({ search: debouncedSearch, page, limit: PAGE_SIZE }, { skip: !hasMore && page > 1 });

  // Update options when data changes
  React.useEffect(() => {
    if (data) {
      const newOptions = data.data.map((p: Product) => ({ label: p.name, value: p._id }));
      setOptions((prev) => (page === 1 ? newOptions : [...prev, ...newOptions]));
      setHasMore(data.data.length === PAGE_SIZE);
      setFetching(false);
    }
  }, [data, page]);

  // Search handler (updates rawSearch, debounced by useDebounce)
  const handleSearch = (val: string) => {
    setOptions([]);
    setPage(1);
    setHasMore(true);
    setRawSearch(val);
  };

  // Infinite scroll handler
  const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 32 && hasMore && !fetching) {
      setFetching(true);
      setPage((prev) => prev + 1);
    }
  }, [hasMore, fetching]);

  return (
    <Select
      showSearch
      value={value || undefined}
      placeholder={placeholder || "Select Product"}
      filterOption={false}
      onSearch={handleSearch}
      onChange={onChange}
      notFoundContent={isLoading ? <Spin size="small" /> : null}
      options={options}
      onPopupScroll={handlePopupScroll}
      allowClear
      style={{ width: "100%" }}
    />
  );
} 