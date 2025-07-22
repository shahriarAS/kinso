"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Spin, Input, Select } from "antd";
import React, { useEffect } from "react";
import type { FormInstance } from "antd/es/form";

export interface FormField {
  name: string;
  label: string;
  type:
    | "input"
    | "textarea"
    | "select"
    | "number"
    | "email"
    | "password"
    | "date"
    | "custom";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any[];
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: { label: string; value: any }[];
  component?: React.ReactNode;
  className?: string;
  span?: number; // For grid layout
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericDrawerProps<T = any> {
  // Drawer configuration
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;

  // Form configuration
  form: FormInstance<T>;
  fields: FormField[];
  initialValues?: Partial<T>;
  layout?: "vertical" | "horizontal" | "inline";

  // Actions
  onSubmit: (values: T) => Promise<void> | void;
  submitText?: string;
  loading?: boolean;

  // Custom content
  children?: React.ReactNode;
  extra?: React.ReactNode;

  // Styling
  className?: string;
  formClassName?: string;
  gridCols?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericDrawer<T = any>({
  open,
  onClose,
  title,
  width = 480,
  form,
  fields,
  initialValues,
  layout = "vertical",
  onSubmit,
  submitText = "Save",
  loading = false,
  children,
  extra,
  className = "rounded-3xl",
  formClassName = "border border-gray-200 shadow-sm rounded-xl p-4 pb-6",
  gridCols = 1,
}: GenericDrawerProps<T>) {
  useEffect(() => {
    if (open && initialValues) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setFieldsValue(initialValues as any);
    } else if (!open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      handleClose();
    } catch {
      // Form validation errors are handled by Ant Design
      // API errors should be handled in the onSubmit function
    }
  };

  const renderField = (field: FormField) => {
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
      case "textarea":
        return <Input.TextArea {...commonProps} rows={4} />;
      case "select":
        return <Select {...commonProps} options={field.options} />;
      case "number":
        return <Input type="number" {...commonProps} />;
      case "email":
        return <Input type="email" {...commonProps} />;
      case "password":
        return <Input.Password {...commonProps} />;
      case "date":
        return <Input type="date" {...commonProps} />;
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
          rules={field.rules}
          className="font-medium"
        >
          {renderField(field)}
        </Form.Item>
      ));
    }

    // Grid layout
    const rows: FormField[][] = [];
    for (let i = 0; i < fields.length; i += gridCols) {
      rows.push(fields.slice(i, i + gridCols));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className={`grid grid-cols-${gridCols} gap-6`}>
        {row.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
            className="font-medium"
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </div>
    ));
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={width}
      className={className}
      getContainer={false}
      destroyOnHidden={true}
      closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
      extra={
        <div className="flex gap-4 justify-end">
          <Button type="default" onClick={handleClose} disabled={loading}>
            Discard
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={loading ? <Spin size="small" /> : undefined}
          >
            {loading ? "Saving..." : submitText}
          </Button>
          {extra}
        </div>
      }
    >
      <Form
        form={form}
        layout={layout}
        requiredMark={false}
        className={formClassName}
        disabled={loading}
      >
        {renderFields()}
        {children}
      </Form>
    </Drawer>
  );
}
