import React from "react";
import { FaPlus, FaList, FaClipboardList, FaGavel } from "react-icons/fa";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { key: "new", label: "New Inspection Note", icon: FaPlus, path: "/inspection/new" },
  { key: "list", label: "List of All Inspection", icon: FaList, path: "/inspection/list" },
  { key: "note", label: "List of Inspection Note", icon: FaClipboardList, path: "/inspection/note" },
  { key: "show-cause", label: "List of Show Cause", icon: FaClipboardList, path: "/inspection/show-cause" },
  { key: "court", label: "List of Court Case/Let off", icon: FaGavel, path: "/inspection/courtcase" }
];

export default function InspectionTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on URL
  const activeTab = tabs.find(t => location.pathname.includes(t.key))?.key || "list";

  return (
    <div className="p-2 min-h-screen overflow-hidden">
      {/* Render the selected component through <Outlet /> */}
      <Outlet />
    </div>
  );
}
