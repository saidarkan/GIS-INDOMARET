import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/tailwind.css";

import MainLayout from "./layouts/MainLayout";

const Home = React.lazy(() => import("./pages/Home"));
const Peta = React.lazy(() => import("./pages/Peta"));

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
        </Route>
      </Routes>
    </Suspense>
  );
}
