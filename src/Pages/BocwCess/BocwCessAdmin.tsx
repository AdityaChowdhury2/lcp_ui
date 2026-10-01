import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { logout } from "@/store/authSlice";
import {
  Building2,
  Home,
  Briefcase,
  Layers,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogOut,
} from "lucide-react";
import { BocwCessList } from "./BocwCessList";

export interface SubMenuOption {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  tagText?: string;
}

const subMenus: SubMenuOption[] = [
  {
    id: "ud_ma",
    name: "1. UD & MA Collection",
    shortDesc: "Urban Development & Municipal Affairs - OBPASS Building Plan Cess Records",
    icon: Building2,
    active: true,
    tagText: "Active / Live",
  },
  {
    id: "prd",
    name: "2. P & RD Collection",
    shortDesc: "Panchayat & Rural Development - Gram Panchayat Cess Collection",
    icon: Home,
    active: false,
    tagText: "Coming Soon",
  },
  {
    id: "residential",
    name: "3. Individual Residencial House",
    shortDesc: "Self-assessment & Cess Collection for Private Residential Constructions",
    icon: Home,
    active: false,
    tagText: "Coming Soon",
  },
  {
    id: "others",
    name: "4. Employer/Contractor/PSU/Govt Authority/Others",
    shortDesc: "Commercial Employers, Govt Projects, PSUs, and Public Works",
    icon: Briefcase,
    active: false,
    tagText: "Coming Soon",
  },
];

const BocwCessAdmin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<string>("ud_ma");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/bocwcess");
  };

  const currentSubMenu = subMenus.find((m) => m.id === activeTab) || subMenus[0];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium mb-1">
              <Link to="/" className="hover:underline flex items-center gap-1">
                Home
              </Link>
              <span>/</span>
              <Link to="/bocwcess" className="hover:underline">
                BOCW Cess Portal
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">Admin Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              BOCW Cess Collection — Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/bocwcess"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-200 hover:text-white px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Access Portal
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Section - Full Width Vertical Stack Layout */}
      <div className="max-w-full px-4 sm:px-8 py-8 w-full flex-grow space-y-8">
        {/* Top Menu Block: Cess Collection Sub-Menus */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm w-full">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cess Collection Categories</h2>
              <p className="text-xs text-gray-500 font-medium">Select a category below to view and manage collection data</p>
            </div>
          </div>

          {/* 4 Horizontal Sub-Menu Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subMenus.map((menu) => {
              const IconComponent = menu.icon;
              const isSelected = activeTab === menu.id;

              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  className={`text-left p-4 rounded-xl text-xs font-semibold transition-all flex flex-col justify-between border min-h-[105px] group ${isSelected
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-600 shadow-lg shadow-blue-600/25 ring-2 ring-blue-500"
                    : menu.active
                      ? "bg-white hover:bg-blue-50/60 text-slate-800 border-slate-200 hover:border-blue-300 shadow-sm"
                      : "bg-gray-50/70 text-gray-500 border-gray-200/80 hover:bg-gray-100/70"
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-2 rounded-lg ${isSelected
                        ? "bg-white/20 text-white"
                        : menu.active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSelected
                        ? "bg-white/20 text-white"
                        : menu.active
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                    >
                      {menu.tagText}
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-bold text-sm leading-snug ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {menu.name}
                    </h3>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                      {menu.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Content / List View Block (Full Width) */}
        <div className="w-full">
          {currentSubMenu.active ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
              {/* Module Sub-Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Integration
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {currentSubMenu.name}
                  </h2>
                  <p className="text-blue-200 text-xs sm:text-sm mt-1">
                    {currentSubMenu.shortDesc}
                  </p>
                </div>
              </div>

              {/* Render OBPASS Collection Data List View (Full Width) */}
              <div className="p-4 sm:p-6 w-full">
                <BocwCessList />
              </div>
            </div>
          ) : (
            /* Coming Soon View for Inactive Sub-menus */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-14 text-center flex flex-col items-center justify-center min-h-[380px] w-full">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 border border-amber-200 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3.5 py-1 rounded-full border border-amber-300 uppercase tracking-wider mb-3">
                Coming Soon
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {currentSubMenu.name}
              </h3>
              <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                This module is currently under development & integration. It will be available shortly for official administration and reporting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-slate-200 bg-white">
        Labour Commissionerate, Government of West Bengal © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default BocwCessAdmin;
