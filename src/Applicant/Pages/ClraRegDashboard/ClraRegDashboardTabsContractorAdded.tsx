"use client";

import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";


type TabKey = "application" | "tradeUnion" | "contractor" | "preview";

const tabs: { key: TabKey; label: string }[] = [
  { key: "application", label: "APPLICATION DETAILS" },
  { key: "tradeUnion", label: "TRADE UNION DETAILS" },
  { key: "contractor", label: "CONTRACTOR INFORMATION" },
  { key: "preview", label: "APPLICATION PREVIEW" },
];

const ClraRegDashboardTabsContractorAdded: React.FC = () => {
   const navigate = useNavigate();
    
  const [activeTab, setActiveTab] = useState<TabKey>("application");

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);

    // Only navigate when "Trade Union Details" is clicked
    if (tabKey === "application") {
             navigate("/view-clra-application-details/view-clra-application");
    }
     if (tabKey === "tradeUnion") {
             navigate("/view-clra-application-details/view-trade-union-application");
    }
   
    if (tabKey === "contractor") {
   navigate("/view-clra-application-details/clra-contractor-info");
    }
    if (tabKey === "preview") {
   navigate("/view-clra-application-details/verify");
    }
    // You can add more navigation for other tabs later:
    // else if (tabKey === "contractor") { ... }
  };

  return (
    <div className="w-full bg-gray-100 py-4">
      <nav className="flex space-x-1 border-b-[1px] border-b-[#32507a] pb-1" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              "relative px-6 py-3 text-sm font-medium transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer",
              // Active tab styles
              activeTab === tab.key
                ? "bg-[linear-gradient(to_bottom,rgb(67,109,159)_0%,rgb(47,76,113)_100%)] text-white rounded-t-lg shadow-md"
                : "bg-white text-[#32507a] border rounded-t-md border-[#32507a] hover:bg-blue-50",
              // First tab special rounding
              index === 0 && activeTab === tab.key && "rounded-tl-lg",
              // Last tab special rounding
              index === tabs.length - 1 && activeTab === tab.key && "rounded-tr-lg"
            )}
            aria-current={activeTab === tab.key ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Optional: Tab Content Area (you can render different content here) */}
      
    </div>
  );
};

export default ClraRegDashboardTabsContractorAdded;