import React, { useState } from "react";
import { Form, Input, Button, Space, message } from "antd";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { signInWithEmailAndPassword,signOut } from "firebase/auth";
import auth from "../apis/auth";

const NormalLoginForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  try {
      await signOut(auth);
      console.log('Sign-out successful');
      // Redirect or perform other actions upon successful sign-out
    } catch (error) {
      console.error('Sign-out error:', error.message);
      // Handle sign-out error, if any
    }

  return (
 
  );
};

export default NormalLoginForm;
