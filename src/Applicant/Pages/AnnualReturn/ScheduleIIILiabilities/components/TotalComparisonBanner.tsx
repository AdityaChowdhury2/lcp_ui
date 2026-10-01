import React from "react";

interface TotalComparisonBannerProps {
  liabilitiesTotal: number;
  assetsTotal: number;
}

export const TotalComparisonBanner: React.FC<TotalComparisonBannerProps> = ({
  liabilitiesTotal,
  assetsTotal,
}) => {
  const isEqual = liabilitiesTotal === assetsTotal;
  const difference = Math.abs(liabilitiesTotal - assetsTotal);

  return (
    <div
      className={`px-4 py-2.5 rounded text-sm font-semibold flex items-center justify-between border ${
        isEqual
          ? "bg-green-50 border-green-300 text-green-800"
          : "bg-amber-50 border-amber-300 text-amber-800"
      }`}
    >
      <span>
        {isEqual ? (
          <>
            ✓ Total Liabilities (₹{liabilitiesTotal}) and Total Assets (₹{assetsTotal}) are equal.
          </>
        ) : (
          <>
            ⚠️ Total Liabilities (₹{liabilitiesTotal}) and Total Assets (₹{assetsTotal}) do not match. (Difference: ₹{difference})
          </>
        )}
      </span>
    </div>
  );
};
