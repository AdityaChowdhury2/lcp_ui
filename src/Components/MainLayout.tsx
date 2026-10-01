// src/layouts/MainLayout.tsx
import React, { type FC } from "react";
import { Outlet } from "react-router-dom";
// import Header from "@/ShareModules/Header/Header";
// import Footer from "@/ShareModules/Footer/Footer";
import Header from '../ShareModules/Header/Header';
import Footer from "../ShareModules/Footer/Footer";
import Helpdesk from "../ShareModules/Helpdesk/Helpdesk/Helpdesk";

const MainLayout: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Normal site header */}
      <Header />

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Helpdesk */}
      <Helpdesk />

      {/* Normal site footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
