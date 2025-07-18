"use client";

import { MailOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import Link from "next/link";

type Props = {};

export default function ForgetPassword({}: Props) {
  const [form] = Form.useForm();

  const onFinish = (values: { email: string }) => {};

  return (
    <div className="flex flex-col items-center justify-center container mx-auto">
      <div className="w-96 h-[60vh] flex items-center justify-center flex-col gap-6">
        <h2 className="text-2xl font-medium">Recover Your Password</h2>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          className="w-full"
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
            <Input type="email" prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" className="text-lg">
              Recover
            </Button>
            <p className="mt-2 text-center text-base">
              or, have an account? <Link href="/login">Login</Link>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
