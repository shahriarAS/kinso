import React, { useEffect } from "react";
import { Drawer, Form, Input, Button } from "antd";
import { useCreateVendorMutation, useUpdateVendorMutation } from "./api";
import { Vendor, VendorInput } from "./types";
import { useNotification } from "@/hooks/useNotification";

interface AddEditVendorDrawerProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
}

const AddEditVendorDrawer: React.FC<AddEditVendorDrawerProps> = ({
  open,
  onClose,
  vendor,
}) => {
  const [form] = Form.useForm();
  const { success, error } = useNotification();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const isEditing = !!vendor;

  useEffect(() => {
    if (open) {
      if (vendor) {
        form.setFieldsValue({
          name: vendor.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, vendor, form]);

  const handleSubmit = async (values: VendorInput) => {
    try {
      if (isEditing && vendor) {
        await updateVendor({
          _id: vendor._id,
          vendor: values,
        }).unwrap();
        success("Vendor updated successfully");
      } else {
        await createVendor(values).unwrap();
        success("Vendor created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save vendor");
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? "Edit Vendor" : "Add Vendor"}
      width={500}
      open={open}
      onClose={handleClose}
      autoFocus={true}
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
          name="name"
          label="Vendor Name"
          rules={[
            { required: true, message: "Please enter vendor name" },
          ]}
        >
          <Input placeholder="Enter vendor name" />
        </Form.Item> 
      </Form>
    </Drawer>
  );
};

export default AddEditVendorDrawer; 