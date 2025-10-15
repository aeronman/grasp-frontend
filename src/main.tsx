import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageUI from "./components/LandingPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AboutUs from "./components/AboutUs";
import AdminDashboard from "./components/AdminDashboard";
import StudentList from "./components/StudentList";
import StudentFormWithClustering from "./components/StudentForm";
import AdminPredictions from "./components/AdminPredictions";
import StudentDashboard from "./components/StudentDashboard";
import StudentManageProfile from "./components/StudentManageProfile";
import AdminManageProfile from "./components/AdminManageProfile";

export default function ProtectedRoute() {
  const uid = localStorage.getItem("user_id");
  const email = localStorage.getItem("user_email");
  const role = localStorage.getItem("user_role");
  return uid && email && role ? <Outlet /> : <Navigate to="/login" replace />;
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPageUI />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admindashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/students" element={<StudentList />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/predict" element={<StudentFormWithClustering />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/student-manage-profile" element={<StudentManageProfile />} />
        </Route>.
         <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<AdminManageProfile />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/predictionlist" element={<AdminPredictions />} />
        </Route>
        
        

        {/* later: add <Route path="/admin" element={<AdminPage />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
