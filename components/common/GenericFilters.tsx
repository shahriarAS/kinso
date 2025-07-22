import React, { useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import isEqual from "fast-deep-equal/react";
import { Form, Input, Select, DatePicker, InputNumber, Button } from "antd";

export interface FilterField {
  name: string;
  label: string;
  type: "input" | "select" | "date" | "number" | "range" | "custom";
  placeholder?: string;
  options?: { label: string; value: any }[];
  component?: React.ReactNode;
  className?: string;
  span?: number;
  debounce?: number;
}

export interface GenericFiltersProps<T = any> {
  fields: FilterField[];
  initialValues?: Partial<T>;
  onFiltersChange: (filters: T) => void;
  gridCols?: number;
  className?: string;
  showReset?: boolean;
  resetText?: string;
  onReset?: () => void;
  children?: React.ReactNode;
  debounceDelay?: number;
}

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
  const lastInitialValues = React.useRef<Partial<T> | undefined>(undefined);

  // State to hold current form values
  const [formValues, setFormValues] = React.useState<T>({} as T);
  // Debounce the form values
  const debouncedValues = useDebounce(formValues, debounceDelay);

  useEffect(() => {
    
    onFiltersChange(debouncedValues);
  }, [debouncedValues, onFiltersChange]);

  useEffect(() => {
    if (
      initialValues &&
      !isEqual(initialValues, lastInitialValues.current)
    ) {
      form.setFieldsValue(initialValues as any);
      setFormValues((initialValues || {}) as T);
      lastInitialValues.current = initialValues;
    }
  }, [initialValues]);

  const handleValuesChange = useCallback((_changedValues: any, allValues: T) => {
    setFormValues(allValues);
  }, []);

  const handleReset = () => {
    form.resetFields();
    setFormValues({} as T);
    onReset?.();
  };

  const renderField = (field: FilterField) => {
    const { type, component } = field;
    if (type === "custom" && component) return component;
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
      onValuesChange={handleValuesChange}
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
