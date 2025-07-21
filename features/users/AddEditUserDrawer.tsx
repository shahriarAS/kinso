"use client";
import { Form } from "antd";
import React from "react";
import { User, UserInput, UserUpdateInput } from "./types";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "./api";
import { useNotification } from "@/hooks/useNotification";
import { GenericDrawer, type FormField } from "@/components/common";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user?: User | null;
  onClose?: () => void;
}

export default function AddEditUserDrawer({
  open,
  setOpen,
  user,
  onClose,
}: Props) {
  const [form] = Form.useForm<UserInput>();
  const { success, error: showError } = useNotification();

  // API hooks
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isEditing = !!user;
  const isLoading = isCreating || isUpdating;

  // Define form fields using the generic interface
  const fields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "input",
      placeholder: "Enter Full Name",
      rules: [{ required: true, message: "Please enter user name" }],
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
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter Password",
      rules: isEditing ? [] : [{ required: true, message: "Please enter password" }],
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select Role",
      rules: [{ required: true, message: "Please select a role" }],
      options: [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "Staff", value: "staff" },
      ],
    },

  ];

  const handleSubmit = async (values: UserInput) => {
    try {
      if (isEditing && user) {
        const updateData: UserUpdateInput = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        await updateUser({
          _id: user._id,
          user: updateData,
        }).unwrap();
        success("User updated successfully");
      } else {
        await createUser(values).unwrap();
        success("User created successfully");
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError("Failed to save user", (error.data as { message: string }).message);
      } else {
        showError("Failed to save user");
      }
      throw error; // Re-throw to prevent drawer from closing
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit User" : "Add New User"}
      form={form}
      fields={fields}
      initialValues={
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      loading={isLoading}
      submitText={isEditing ? "Update" : "Save"}
      gridCols={2}
    />
  );
} 