"use client";
import { KeyOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";

type Props = {};

export default function ResetPassword({}: Props) {
  const [form] = Form.useForm();

  const onFinish = (values: { password: string; password2: string }) => {};

  return (
    <div className="flex flex-col items-center justify-center container mx-auto">
      <div className="w-96 h-[60vh] flex items-center justify-center flex-col gap-6">
        <h2 className="text-2xl font-medium">Reset Your Password</h2>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          className="w-full"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your Password!" },
              {
                pattern:
                  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,}$/,
                message:
                  "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters",
              },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="password2"
            rules={[
              { required: true, message: "Please input your Password!" },
              {
                validator: (_, value) =>
                  value === form.getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!",
                        ),
                      ),
              },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" className="text-lg">
              Reset
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
