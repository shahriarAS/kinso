import React, { useMemo } from "react";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "./api";
import { Customer, CustomerInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form, Switch } from "antd";
import { GenericDrawer, FormField } from "@/components/common";

interface AddEditCustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

const AddEditCustomerDrawer: React.FC<AddEditCustomerDrawerProps> = ({
  open,
  onClose,
  customer,
}) => {
  const [form] = Form.useForm<CustomerInput>();
  const { success, error } = useNotification();
  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();

  const isEditing = !!customer;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Customer Name",
        type: "input",
        placeholder: "Enter customer name",
        rules: [
          { required: true, message: "Please enter customer name" },
          { min: 2, message: "Customer name must be at least 2 characters" },
        ],
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "input",
        placeholder: "Enter phone number",
        rules: [
          { required: true, message: "Please enter phone number" },
          {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: "Please enter a valid phone number",
          },
        ],
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter email address",
        rules: [
          { required: true, message: "Please enter email address" },
          { type: "email", message: "Please enter a valid email address" },
        ],
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter customer address",
      },
      // {
      //   name: "membershipActive",
      //   label: "Membership Status",
      //   type: "custom",
      //   component: (
      //     <Form.Item name="membershipActive" valuePropName="checked" noStyle>
      //       <Switch />
      //     </Form.Item>
      //   ),
      // }
    ],
    [],
  );

  // Set initial values for edit mode
  const initialValues = customer
    ? {
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer?.address || "",
        membershipActive: customer.membershipActive,
        totalSpent: customer.totalSpent,
        totalPurchaseLastMonth: customer.totalPurchaseLastMonth,
        totalSales: customer.totalSales,
      }
    : {
        membershipActive: false,
        totalSpent: 0,
        totalPurchaseLastMonth: 0,
        totalSales: 0,
        phone: "",
        email: "",
        address: "",
      };

  const handleSubmit = async (values: any) => {
    try {
      // Use flat structure
      const customerData: CustomerInput = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        membershipActive: values.membershipActive,
      };

      if (isEditing && customer) {
        await updateCustomer({
          _id: customer._id,
          customer: customerData,
        }).unwrap();
        success("Customer updated successfully");
      } else {
        await createCustomer(customerData).unwrap();
        success("Customer created successfully");
      }
      onClose();
    } catch (err: any) {
      error(
        err?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} customer`,
      );
    }
  };

  return (
    <GenericDrawer<any>
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Customer" : "Add Customer"}
      form={form}
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitText={isEditing ? "Update Customer" : "Create Customer"}
      loading={isCreating || isUpdating}
      width={600}
    />
  );
};

export default AddEditCustomerDrawer;
