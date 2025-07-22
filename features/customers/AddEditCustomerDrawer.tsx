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
      name: "name",
      label: "Full Name",
      type: "input",
      placeholder: "Enter Full Name",
      rules: [{ required: true, message: "Please enter customer name" }],
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter Email",
      rules: [
        { required: true, message: "Please enter email" },
        { type: "email", message: "Please enter a valid email" },
      ],
    },
    {
      name: "phone",
      label: "Phone",
      type: "input",
      placeholder: "Enter Phone",
      rules: [{ required: true, message: "Please enter phone number" }],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select Status",
      rules: [{ required: true, message: "Please select status" }],
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Enter Notes",
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
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              status: customer.status,
              notes: customer.notes,
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
