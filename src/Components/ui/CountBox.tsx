import { IMAGE_BASE } from "@/constants/constants";
// "use client";

import React, { type FC } from "react";
import CountUp from "react-countup";

interface CountBoxProps {
  end: number;
  label: string;
}

const CountBox: FC<CountBoxProps> = ({ end, label }) => {
  return (
    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 p-2 mt-2">
      <div
        className="relative w-full h-44 bg-[url('${IMAGE_BASE}meter-box-bg-265.jpg')] 
               p-3 text-center border border-dashed border-[#dacfbc] group overflow-hidden"
      >
        {/* INNER BORDER WRAPPER WITH 10PX PADDING */}
        <div className="absolute inset-2.5">
          {/* TOP BORDER */}
          <span
            className="absolute top-0 left-0 w-0 h-0.5 bg-[#C90]
                   group-hover:w-full transition-all duration-300"
          />

          {/* BOTTOM BORDER */}
          <span
            className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#C90]
                   group-hover:w-full transition-all duration-300"
          />

          {/* LEFT BORDER */}
          <span
            className="absolute top-0 left-0 w-0.5 h-0 bg-[#C90]
                   group-hover:h-full transition-all duration-300 delay-150"
          />

          {/* RIGHT BORDER */}
          <span
            className="absolute bottom-0 right-0 w-0.5 h-0 bg-[#C90]
                   group-hover:h-full transition-all duration-300 delay-150"
          />
        </div>

        {/* CONTENT */}
        <div className="relative flex flex-col h-full px-4">
          <h2 className="text-3xl font-bold text-[#7a4f1d]">
            <CountUp end={end} duration={2} />
          </h2>

          <p className="text-[15px] text-gray-900 mt-1 leading-snug font-normal">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountBox;
