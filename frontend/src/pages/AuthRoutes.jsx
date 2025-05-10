import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "../components/ui/suspense";
import Signup from "@/components/auth/signup";
import OtpVerification from "@/components/auth/OtpVerification";

const Login = lazy(() => import("../components/auth/Login"));

function AuthRoutes() {
  return (
    <Suspense>
      <Routes>
        <Route path="" element={<Navigate replace to="login" />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />
        <Route path="verify" element={<OtpVerification />} />
        <Route path="*" element={<Navigate replace to="/404" />} />
      </Routes>
    </Suspense>
  );
}

export default AuthRoutes;
