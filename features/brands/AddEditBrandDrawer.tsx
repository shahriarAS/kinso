import React, { useEffect } from "react";
import { Drawer, Form, Input, Button, Select } from "antd";
import { useCreateBrandMutation, useUpdateBrandMutation } from "./api";
import { useGetAllVendorsQuery } from "@/features/vendors/api";
import { Brand, ICreateBrandRequest, IUpdateBrandRequest } from "./types";
import { useNotification } from "@/hooks/useNotification";

const { Option } = Select;

interface AddEditBrandDrawerProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
}

const AddEditBrandDrawer: React.FC<AddEditBrandDrawerProps> = ({
  open,
  onClose,
  brand,
}) => {
  const [form] = Form.useForm();
  const { success, error } = useNotification();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const { data: vendorsResponse } = useGetAllVendorsQuery();

  const isEditing = !!brand;

  useEffect(() => {
    if (open) {
      if (brand) {
        form.setFieldsValue({
          brandId: brand.brandId,
          brandName: brand.brandName,
          vendorId: brand.vendorId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, brand, form]);

  const handleSubmit = async (values: ICreateBrandRequest | IUpdateBrandRequest) => {
    try {
      if (isEditing && brand) {
        await updateBrand({
          _id: brand._id,
          brand: values as IUpdateBrandRequest,
        }).unwrap();
        success("Brand updated successfully");
      } else {
        await createBrand(values as ICreateBrandRequest).unwrap();
        success("Brand created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save brand");
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? "Edit Brand" : "Add Brand"}
      width={500}
      open={open}
      onClose={handleClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isCreating || isUpdating}
            onClick={() => form.submit()}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="brandId"
          label="Brand ID"
          rules={[
            { required: true, message: "Please enter brand ID" },
            { min: 2, message: "Brand ID must be at least 2 characters" },
          ]}
        >
          <Input placeholder="Enter brand ID" />
        </Form.Item>

        <Form.Item
          name="brandName"
          label="Brand Name"
          rules={[
            { required: true, message: "Please enter brand name" },
            { min: 2, message: "Brand name must be at least 2 characters" },
          ]}
        >
          <Input placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item
          name="vendorId"
          label="Vendor"
          rules={[
            { required: true, message: "Please select a vendor" },
          ]}
        >
          <Select
            placeholder="Select vendor"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {vendorsResponse?.data?.map((vendor) => (
              <Option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddEditBrandDrawer; 