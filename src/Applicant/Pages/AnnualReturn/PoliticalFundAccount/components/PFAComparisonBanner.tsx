import React from "react";

interface PFAComparisonBannerProps {
  totalIncome: number;
  totalExpenditure: number;
}

export const PFAComparisonBanner: React.FC<PFAComparisonBannerProps> = ({
  totalIncome,
  totalExpenditure,
}) => {
  const isEqual = totalIncome === totalExpenditure;
  const difference = Math.abs(totalIncome - totalExpenditure);

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
            ✓ Total Income (₹{totalIncome.toLocaleString("en-IN")}) and Total Expenditure (₹{totalExpenditure.toLocaleString("en-IN")}) are equal.
          </>
        ) : (
          <>
            ⚠️ Total Income (₹{totalIncome.toLocaleString("en-IN")}) and Total Expenditure (₹{totalExpenditure.toLocaleString("en-IN")}) do not match. (Difference: ₹{difference.toLocaleString("en-IN")})
          </>
        )}
      </span>
    </div>
  );
};
