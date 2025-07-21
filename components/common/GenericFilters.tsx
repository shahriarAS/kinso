"use client";
import { Form, Input, Select, DatePicker, InputNumber, Button } from "antd";
import React, { useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export interface FilterField {
  name: string;
  label: string;
  type: "input" | "select" | "date" | "number" | "range" | "custom";
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: { label: string; value: any }[];
  component?: React.ReactNode;
  className?: string;
  span?: number; // For grid layout
  debounce?: number; // For input fields that need debouncing
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericFiltersProps<T = any> {
  // Filter configuration
  fields: FilterField[];
  initialValues?: Partial<T>;
  onFiltersChange: (filters: T) => void;

  // Layout
  gridCols?: number;
  className?: string;

  // Actions
  showReset?: boolean;
  resetText?: string;
  onReset?: () => void;

  // Custom content
  children?: React.ReactNode;

  // Debounce configuration
  debounceDelay?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericFilters<T = any>({
  fields,
  initialValues,
  onFiltersChange,
  gridCols = 4,
  className = "border border-gray-300 rounded-3xl p-4 bg-white",
  showReset = false,
  resetText = "Reset",
  onReset,
  children,
  debounceDelay = 500,
}: GenericFiltersProps<T>) {
  const [form] = Form.useForm<T>();
  const debouncedValues = useDebounce(form.getFieldsValue(), debounceDelay);

  useEffect(() => {
    if (initialValues) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setFieldsValue(initialValues as any);
    }
  }, [initialValues, form]);

  const handleFiltersChange = useCallback((values: T) => {
    if (Object.keys(values as object).length > 0) {
      onFiltersChange(values);
    }
  }, [onFiltersChange]);

  useEffect(() => {
    const values = form.getFieldsValue();
    handleFiltersChange(values);
  }, [debouncedValues, handleFiltersChange]);

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  const renderField = (field: FilterField) => {
    const { type, component } = field;

    if (type === "custom" && component) {
      return component;
    }

    const commonProps = {
      size: "large" as const,
      placeholder: field.placeholder,
      className: `w-full ${field.className || ""}`,
    };

    switch (type) {
      case "input":
        return <Input {...commonProps} />;
      case "select":
        return <Select {...commonProps} options={field.options} allowClear />;
      case "date":
        return <DatePicker {...commonProps} className="w-full" />;
      case "number":
        return <InputNumber {...commonProps} className="w-full" />;
      case "range":
        return (
          <div className="flex gap-2">
            <InputNumber {...commonProps} placeholder="Min" className="w-1/2" />
            <span className="self-center">-</span>
            <InputNumber {...commonProps} placeholder="Max" className="w-1/2" />
          </div>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderFields = () => {
    if (gridCols === 1) {
      return fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          className="font-medium"
        >
          {renderField(field)}
        </Form.Item>
      ));
    }

    // Grid layout
    const rows: FilterField[][] = [];
    for (let i = 0; i < fields.length; i += gridCols) {
      rows.push(fields.slice(i, i + gridCols));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className={`grid grid-cols-${gridCols} gap-8`}>
        {row.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            className="font-medium"
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </div>
    ));
  };

  return (
    <Form
      form={form}
      name="generic-filters"
      layout="vertical"
      requiredMark={false}
      className={`${className} ${showReset ? "grid grid-cols-4 gap-8" : ""}`}
    >
      {children || renderFields()}

      {showReset && (
        <div className="flex items-end">
          <Button type="default" onClick={handleReset} className="h-10">
            {resetText}
          </Button>
        </div>
      )}
    </Form>
  );
}
