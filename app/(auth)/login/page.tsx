"use client";

import { useLoginUserMutation } from "@/features/auth";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Alert, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Login() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const redirectURL = searchParams.get("redirect");
  const router = useRouter();
  const [login, { isLoading, error, reset }] = useLoginUserMutation();

  // Helper function to extract error message
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "data" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (error as any).data;
      if (errorData && typeof errorData.message === "string") {
        return errorData.message;
      }
    }
    return "An unexpected error occurred";
  };

  const onFinish = async (values: { email: string; password: string }) => {
    login(values)
      .unwrap()
      .then(() => {
        router.replace(redirectURL || "/dashboard");
      })
      .catch(() => {
        router.replace(
          "/login" + (redirectURL ? `?redirect=${redirectURL}` : ""),
        );
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 ">
          {error ? (
            <div className="mb-6">
              <Alert
                message={getErrorMessage(error)}
                type="error"
                className="rounded-md"
                showIcon
              />
            </div>
          ) : null}

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">Log in to your account</p>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            className="space-y-6"
            onChange={() => reset()}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your Email!" },
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
              ]}
            >
              <Input
                type="email"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email address"
                className="rounded-sm border-gray-300"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                type="password"
                placeholder="Password"
                className="rounded-sm border-gray-300"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                loading={isLoading}
                block
                type="primary"
                htmlType="submit"
                className="h-12 text-base font-semibold border border-gray-200 rounded-sm hover:border-primary/30 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Secure login protected by enterprise-grade encryption
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
