import React, { useState } from "react";
import { Form, Input, Button, Space, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { signInWithEmailAndPassword,signOut } from "firebase/auth";
import {useNavigate } from "react-router-dom";
import auth from "../apis/auth";
import { FetchDataFromCollection } from '../firestore';

const NormalLoginForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, seterrors] = useState({});
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setIsLoggingIn(true);
    try {
      let user=await signInWithEmailAndPassword(auth, values?.email, values?.password);
      const SelectedUser = await FetchDataFromCollection("UsersRoles", 20, "__name__", "==", user['user']['uid'], 0);
      if(SelectedUser.length===0)
      {
      	 await signOut(auth);
      	 message.success("User Not Found");
      	 errors.LoginError="Incorrect email Or password.";
      	 seterrors(errors);
      }
      else if(SelectedUser.length)
      {
      		if(SelectedUser?.[0]?.['Role']!=="Admin" && SelectedUser?.[0]?.['Role']!=="Gold")
      		{
      			await signOut(auth);
      	 		message.success("This Is Admin Dashboard");
      	 		errors.LoginError="This Is Admin Dashboard! You can't login here. Please contact administrator.";
      	 		seterrors(errors);
      		}
      		else
      		{
      			 message.success("Logged in");
      			 navigate('/leads');
      		}
      }
    } catch (err) {
      message.error(err.message || "Something went wrong");
      console.log(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Space className="h-screen w-screen flex items-center justify-center">
      <Form name="normal_login" className="w-fit" onFinish={onFinish}>
      {errors.LoginError && <span class="validationerror">{errors.LoginError}</span>}
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            type="email"
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item className="text-center">
          <Button
            loading={isLoggingIn}
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default NormalLoginForm;
