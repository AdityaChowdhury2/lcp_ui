import React from "react";

interface SectionHeaderProps {
  title: string;
  variant?: "primary" | "secondary";
}

const SECTION_HEADER_PRIMARY = "bg-[#2f5f85] text-white font-semibold px-4 py-2";
const SECTION_HEADER_SECONDARY = "bg-[#7c8a96] text-white font-semibold px-4 py-2";

export function SectionHeader({
  title,
  variant = "primary",
}: SectionHeaderProps) {
  const className =
    variant === "primary" ? SECTION_HEADER_PRIMARY : SECTION_HEADER_SECONDARY;
  return <div className={className}>{title}</div>;
}
