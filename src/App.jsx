import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/tailwind.css";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

const Home = React.lazy(() => import("./pages/Home"));
const Peta = React.lazy(() => import("./pages/Peta"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const TabelPeta = React.lazy(() => import("./pages/TabelPeta"));
const TambahData = React.lazy(() => import("./pages/TambahData"));
const EditData = React.lazy(() => import("./pages/EditData"));
const Kontak = React.lazy(() => import("./pages/KontakKami"));


export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/peta" element={<Peta />} />
          <Route path="/kontak" element={<Kontak />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/TabelPeta" element={<TabelPeta />} />
          <Route path="/TambahData" element={<TambahData />} />
          <Route path="/EditData/:id" element={<EditData />} />
        </Route>

      </Routes>
    </Suspense>
  );
}
