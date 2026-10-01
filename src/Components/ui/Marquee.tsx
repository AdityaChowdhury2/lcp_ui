import React from "react";
import { FRONTEND_BASE } from "@/constants/constants";

export const Marquee: React.FC = React.memo(function Marquee() {
  return (
    <div className="flex items-center overflow-hidden h-[50px]">
      <div className="animate-marquee flex whitespace-nowrap text-white text-sm font-semibold">
        <span className="text-black">All payments will be accepted after ALC's approval through Counter Payment / Online Payment / Govt. (Head to Head) through only <strong className="text-[#f35957]">{FRONTEND_BASE}</strong> which has been already been integrated with GRIPS</span>

      </div>

      {/* Animation styles must be inside JSX */}
      <style>
        {`
          .animate-marquee {
            animation: marquee 28s linear infinite;
          }

          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
});
