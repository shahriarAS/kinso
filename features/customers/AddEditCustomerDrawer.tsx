"use client";
import { Form } from "antd";
import { CustomerInput, Customer } from "./types";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";
import { GenericDrawer, type FormField } from "@/components/common";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customer?: Customer | null;
  onSuccess?: () => void;
}

export default function AddEditCustomerDrawer({
  open,
  setOpen,
  customer,
  onSuccess,
}: Props) {
  const [form] = Form.useForm<CustomerInput>();
  const isEditing = !!customer;

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const { success, error: showError } = useNotification();

  const isLoading = isCreating || isUpdating;

  // Define form fields using the generic interface
  const fields: FormField[] = [
    {
      name: "customer",
      label: "Customer ID",
      type: "input",
      placeholder: "Enter Customer ID",
      rules: [
        { required: true, message: "Please enter customer ID" },
        { min: 3, message: "Customer ID must be at least 3 characters" },
      ],
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "input",
      placeholder: "Enter Customer Name",
      rules: [
        { required: true, message: "Please enter customer name" },
        { min: 2, message: "Customer name must be at least 2 characters" },
      ],
    },
    {
      name: "contactInfo",
      label: "Contact Information",
      type: "textarea",
      placeholder: "Enter email, phone, or address",
      rules: [
        { required: true, message: "Please enter contact information" },
        { min: 5, message: "Contact information must be at least 5 characters" },
      ],
    },
    {
      name: "purchaseAmount",
      label: "Purchase Amount",
      type: "number",
      placeholder: "0.00",
      rules: [
        { required: true, message: "Please enter purchase amount" },
        { type: "number", min: 0, message: "Purchase amount must be positive" },
      ],
    },
    {
      name: "membershipStatus",
      label: "Membership Status",
      type: "select",
      placeholder: "Select Membership Status",
      options: [
        { label: "Non-Member", value: false },
        { label: "Member", value: true },
      ],
    },
  ];

  const handleSubmit = async (values: CustomerInput) => {
    try {
      if (isEditing && customer) {
        await updateCustomer({ _id: customer._id, customer: values }).unwrap();
        success("Customer updated successfully");
      } else {
        await createCustomer(values).unwrap();
        success("Customer created successfully");
      }
    } catch (err: unknown) {
      const error = err as {
        data?: { message?: string };
        errorFields?: unknown;
      };
      if (error?.data?.message) {
        showError("Failed to save customer", error.data.message);
      } else if (!error?.errorFields) {
        // Only show error if it's not a form validation error
        showError("Failed to save customer", "An unexpected error occurred");
      }
      throw error; // Re-throw to prevent drawer from closing
    }
  };

  const handleClose = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Customer" : "Add New Customer"}
      form={form}
      fields={fields}
      initialValues={
        customer
          ? {
              customer: customer.customer,
              customerName: customer.customerName,
              contactInfo: customer.contactInfo,
              purchaseAmount: customer.purchaseAmount,
              membershipStatus: customer.membershipStatus,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      loading={isLoading}
      submitText={isLoading ? "Saving..." : "Save"}
      gridCols={2}
    />
  );
}
