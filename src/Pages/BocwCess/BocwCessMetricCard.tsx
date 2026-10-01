import React from "react";

export interface BocwCessMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass?: string;
  valueColorClass?: string;
}

/**
 * Reusable Metric Card component for BOCW Cess stats section.
 */
export const BocwCessMetricCard: React.FC<BocwCessMetricCardProps> = ({
  title,
  value,
  icon,
  iconBgClass = "bg-blue-50 text-blue-600",
  valueColorClass = "text-gray-900",
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`p-3 rounded-lg ${iconBgClass}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <h3 className={`text-2xl font-bold ${valueColorClass}`}>{value}</h3>
      </div>
    </div>
  );
};

export default BocwCessMetricCard;
