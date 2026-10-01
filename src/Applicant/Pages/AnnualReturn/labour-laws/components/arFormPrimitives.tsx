import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion";

/**
 * Shared UI primitives for the "Annual Return under various Labour Laws" module.
 * Styling mirrors the existing applicant forms (section header bar `#1D5A89`,
 * bordered inputs) so the new module blends with the current app.
 */

export const AR_PRIMARY = "#1D5A89";

/** A single collapsible accordion section — the building block for every
 *  form section and every nested "inside" form. */
export function ArSection({
  value,
  index,
  title,
  required,
  helpItems,
  children,
  badge,
}: {
  value: string;
  index?: number | string;
  title: React.ReactNode;
  required?: boolean;
  helpItems?: string[];
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="mb-3 overflow-hidden rounded border border-gray-200 bg-white shadow-sm last:border-b"
    >
      <AccordionTrigger className="flex items-center gap-2 rounded-none bg-[#1D5A89] px-4 py-3 text-white hover:no-underline data-[state=open]:bg-[#164a72] [&>svg]:text-white">
        <span className="flex-1 text-left text-[14px] font-semibold">
          {index != null && <span className="mr-1">{index}.</span>}
          {title}
          {required && <span className="ml-1 text-red-300">*</span>}
        </span>
        {badge}
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-4 pb-5">
        {children}
        {helpItems && helpItems.length > 0 && (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
            <p className="mb-1 font-semibold">Help</p>
            <ul className="list-disc space-y-0.5 pl-5">
              {helpItems.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

/** Wrapper for a group of ArSections. `type="multiple"` lets several stay open. */
export function ArAccordion({
  children,
  defaultValue,
  className,
}: {
  children: React.ReactNode;
  defaultValue?: string[];
  className?: string;
}) {
  return (
    <Accordion type="multiple" defaultValue={defaultValue} className={className}>
      {children}
    </Accordion>
  );
}

export const fieldLabel = "mb-1 block text-[13px] font-medium text-gray-700";
export const fieldInput =
  "w-full rounded border border-gray-300 p-2 text-[13px] outline-none focus:border-[#1D5A89] focus:ring-1 focus:ring-[#1D5A89] disabled:bg-gray-100";

export function Req() {
  return <span className="text-red-500"> *</span>;
}

/** Labelled text/number/date input. */
export function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  readOnly,
  placeholder,
  className,
}: {
  label: React.ReactNode;
  name: string;
  value?: string | number;
  onChange?: (name: string, value: string) => void;
  type?: "text" | "number" | "date" | "email" | "tel";
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabel}>
        {label}
        {required && <Req />}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(name, e.target.value)}
        className={fieldInput}
      />
    </div>
  );
}

/** Labelled select. */
export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  className,
  placeholder = "- Select -",
}: {
  label: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabel}>
        {label}
        {required && <Req />}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange?.(name, e.target.value)}
        className={fieldInput}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Labelled textarea. */
export function TextAreaField({
  label,
  name,
  value,
  onChange,
  required,
  rows = 3,
  className,
}: {
  label: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
  required?: boolean;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabel}>
        {label}
        {required && <Req />}
      </label>
      <textarea
        name={name}
        value={value ?? ""}
        rows={rows}
        onChange={(e) => onChange?.(name, e.target.value)}
        className={fieldInput}
      />
    </div>
  );
}

/** Yes / No radio pair — used heavily across the labour-law returns. */
export function YesNoField({
  label,
  name,
  value,
  onChange,
  required,
  className,
}: {
  label: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabel}>
        {label}
        {required && <Req />}
      </label>
      <div className="flex gap-6 pt-1">
        {[
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ].map((opt) => (
          <label key={opt.v} className="flex items-center gap-2 text-[13px]">
            <input
              type="radio"
              name={name}
              checked={value === opt.v}
              onChange={() => onChange?.(name, opt.v)}
              className="h-4 w-4 accent-[#1D5A89]"
            />
            {opt.l}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Grey sub-heading strip inside a section. */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-l-4 border-[#1D5A89] bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-700">
      {children}
    </div>
  );
}

export const arBtn =
  "rounded bg-[#1D5A89] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#164a72] disabled:opacity-50";
export const arBtnOutline =
  "rounded border border-[#1D5A89] px-4 py-2 text-[13px] font-semibold text-[#1D5A89] transition hover:bg-[#1D5A89] hover:text-white";
