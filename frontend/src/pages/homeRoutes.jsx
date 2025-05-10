import React, { lazy, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Suspense } from "../components/ui/suspense";
import Topbar from "../components/home/Topbar";
import NavigationBar from "../components/home/NavigationBar";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useSelector } from "react-redux";
import { selectUserRole } from "@/redux/features/user/userSlice";

const LearnerRoutes = lazy(() => import("./learnerRoutes/LearnerRoutes"));
const CuratorRoutes = lazy(() => import("./curatorRoutes/CuratorRoutes"));


function HomeRoutes() {
  const role=useSelector(selectUserRole)
 
  
  return (
    <ProtectedRoute>
      <Suspense>
        <div className="min-h-screen bg-background">
          <NavigationBar />
          <div className="lg:pl-72">
            <Topbar />
            <main className="container mx-auto py-6 px-4 lg:px-6">
              <Routes>
                <Route path="" element={<Navigate replace to={role==="learner"?"/home/learner":"/home/curator"} />} />
                <Route path="learner/*" element={<LearnerRoutes />} />
                <Route path="curator/*" element={<CuratorRoutes />} />
                <Route path="*" element={<Navigate replace to="/404" />} />
              </Routes>
            </main>
          </div>
        </div>
      </Suspense>
    </ProtectedRoute>
  );
}

export default HomeRoutes;
