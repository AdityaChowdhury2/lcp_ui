import React, { useLayoutEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { shift } from "@floating-ui/react";
import "react-datepicker/dist/react-datepicker.css";

const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();

export const DATE_MIN = new Date(2013, 0, 1);
export const DATE_MAX = new Date(
  TODAY.getFullYear(),
  TODAY.getMonth(),
  TODAY.getDate(),
);

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2013 + 1 },
  (_, i) => 2013 + i,
);

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATE_PICKER_MODIFIERS = [shift({ padding: 8 })];

const controlClass =
  "h-9 w-full rounded border border-[#d2d6de] bg-white px-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const invalidControlClass =
  "border-red-500 focus:border-red-500 focus:ring-red-200";

export function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoMonth(value: string): Date | null {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

export function toIsoMonth(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampReportDate(date: Date | null, minDate: Date, maxDate: Date) {
  if (!date) return null;
  const day = startOfDay(date);
  const min = startOfDay(minDate);
  const max = startOfDay(maxDate);
  if (day < min || day > max) return null;
  return day;
}

function clampReportMonth(date: Date | null, minDate: Date, maxDate: Date) {
  if (!date) return null;
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  if (monthStart < minMonth || monthStart > maxMonth) return null;
  return monthStart;
}

function isMonthDisabled(
  year: number,
  monthIndex: number,
  minDate: Date,
  maxDate: Date,
) {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const min = startOfDay(minDate);
  const max = startOfDay(maxDate);
  return monthEnd < min || monthStart > max;
}

function isYearDisabled(year: number, minDate: Date, maxDate: Date) {
  return year < minDate.getFullYear() || year > maxDate.getFullYear();
}

function clampMonthInYear(year: number, monthIndex: number, minDate: Date, maxDate: Date) {
  const minMonth = minDate.getFullYear() === year ? minDate.getMonth() : 0;
  const maxMonth = maxDate.getFullYear() === year ? maxDate.getMonth() : 11;
  if (monthIndex < minMonth) return minMonth;
  if (monthIndex > maxMonth) return maxMonth;
  return monthIndex;
}

function DatePickerCustomHeader({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  decreaseYear,
  increaseYear,
  prevYearButtonDisabled,
  nextYearButtonDisabled,
  pickerMode = "date",
  minDate = DATE_MIN,
  maxDate = DATE_MAX,
}: any) {
  const [panel, setPanel] = useState<"none" | "month" | "year">("none");
  const year = date.getFullYear();
  const month = date.getMonth();
  const isMonthPicker = pickerMode === "month";
  const rangeMin = minDate ?? DATE_MIN;
  const rangeMax = maxDate ?? DATE_MAX;

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [panel]);

  return (
    <div
      className={`px-1 pb-1${panel !== "none" ? " report-datepicker-month-year-open" : ""}`}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={isMonthPicker ? decreaseYear : decreaseMonth}
          disabled={
            isMonthPicker ? prevYearButtonDisabled : prevMonthButtonDisabled
          }
          className="flex h-7 w-7 items-center justify-center rounded text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={isMonthPicker ? "Previous year" : "Previous month"}
        >
          ‹
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {!isMonthPicker && (
            <button
              type="button"
              onClick={() => setPanel((p) => (p === "month" ? "none" : "month"))}
              className="rounded px-2 py-1 text-sm font-semibold text-white hover:bg-white/20"
            >
              {MONTH_OPTIONS[month]}
            </button>
          )}
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "year" ? "none" : "year"))}
            className="rounded px-2 py-1 text-sm font-semibold text-white hover:bg-white/20"
          >
            {year}
          </button>
        </div>
        <button
          type="button"
          onClick={isMonthPicker ? increaseYear : increaseMonth}
          disabled={
            isMonthPicker ? nextYearButtonDisabled : nextMonthButtonDisabled
          }
          className="flex h-7 w-7 items-center justify-center rounded text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={isMonthPicker ? "Next year" : "Next month"}
        >
          ›
        </button>
      </div>

      {panel === "month" && (
        <div className="mt-2 grid grid-cols-3 gap-1 rounded bg-white p-1.5">
          {MONTH_OPTIONS.map((label, index) => {
            const disabled = isMonthDisabled(year, index, rangeMin, rangeMax);
            const selected = index === month;
            return (
              <button
                type="button"
                key={label}
                disabled={disabled}
                onClick={() => {
                  changeMonth(index);
                  setPanel("none");
                }}
                className={`rounded px-1 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-[#3c8dbc] text-white"
                    : "text-gray-700 hover:bg-[#e8f4fa]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {label.slice(0, 3)}
              </button>
            );
          })}
        </div>
      )}

      {panel === "year" && (
        <div className="mt-2 grid grid-cols-4 gap-1 rounded bg-white p-1.5">
          {YEAR_OPTIONS.map((optionYear) => {
            const selected = optionYear === year;
            const disabled = isYearDisabled(optionYear, rangeMin, rangeMax);
            return (
              <button
                type="button"
                key={optionYear}
                disabled={disabled}
                onClick={() => {
                  changeYear(optionYear);
                  const nextMonth = clampMonthInYear(
                    optionYear,
                    month,
                    rangeMin,
                    rangeMax,
                  );
                  if (nextMonth !== month) {
                    changeMonth(nextMonth);
                  }
                  setPanel("none");
                }}
                className={`rounded px-1 py-1.5 text-xs font-medium ${
                  selected
                    ? "bg-[#3c8dbc] text-white"
                    : "text-gray-700 hover:bg-[#e8f4fa]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {optionYear}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DATEPICKER_STYLES = `
  .report-datepicker-popper {
    z-index: 60 !important;
    overflow: visible;
  }
  .report-datepicker-calendar {
    font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
    border: 1px solid #d2d6de;
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
    overflow: visible;
  }
  .report-datepicker-calendar:has(.report-datepicker-month-year-open) .react-datepicker__day-names,
  .report-datepicker-calendar:has(.report-datepicker-month-year-open) .react-datepicker__month {
    display: none;
  }
  .report-datepicker-calendar .react-datepicker__header {
    background: #3c8dbc;
    border-bottom: none;
    padding-top: 8px;
    border-radius: 4px 4px 0 0;
  }
  .report-datepicker-calendar .react-datepicker__current-month {
    color: #fff;
    font-weight: 600;
  }
  .report-datepicker-calendar .react-datepicker__day-names {
    background: #fff;
    margin: 8px -8px -8px;
    padding: 4px 8px 0;
  }
  .report-datepicker-calendar .react-datepicker__day-name {
    width: 2rem;
    line-height: 2rem;
    margin: 0.1rem;
    color: #111827;
    font-weight: 700;
  }
  .report-datepicker-calendar .react-datepicker__day {
    width: 2rem;
    line-height: 2rem;
    margin: 0.1rem;
    border-radius: 4px;
    color: #111827;
  }
  .report-datepicker-calendar .react-datepicker__day--outside-month {
    color: #9ca3af;
  }
  .report-datepicker-calendar .react-datepicker__day:hover {
    background: #e8f4fa;
  }
  .report-datepicker-calendar .react-datepicker__day--selected,
  .report-datepicker-calendar .react-datepicker__day--keyboard-selected {
    background: #3c8dbc;
    color: #fff;
  }
  .report-datepicker-calendar .react-datepicker__day--disabled {
    color: #c4c4c4;
  }
  .report-datepicker-calendar .react-datepicker__month-text,
  .report-datepicker-calendar .react-datepicker__quarter-text {
    width: 4.2rem;
    margin: 0.25rem;
    padding: 0.45rem 0;
    border-radius: 4px;
    color: #111827;
  }
  .report-datepicker-calendar .react-datepicker__month-text:hover {
    background: #e8f4fa;
  }
  .report-datepicker-calendar .react-datepicker__month-text--selected,
  .report-datepicker-calendar .react-datepicker__month-text--keyboard-selected {
    background: #3c8dbc;
    color: #fff;
  }
  .report-datepicker-calendar .react-datepicker__month-text--disabled {
    color: #c4c4c4;
  }
  .report-datepicker-calendar .react-datepicker__triangle {
    display: none;
  }
`;

export interface ReportDatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  minDate?: Date;
  maxDate?: Date;
  hasError?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  picker?: "date" | "month";
}

const ReportDatePicker: React.FC<ReportDatePickerProps> = ({
  id,
  value,
  onChange,
  rangeStart,
  rangeEnd,
  minDate = DATE_MIN,
  maxDate = DATE_MAX,
  hasError = false,
  disabled = false,
  placeholder,
  className = "",
  picker = "date",
}) => {
  const isMonthPicker = picker === "month";
  const rangeStartDate = parseIsoDate(rangeStart ?? "");
  const rangeEndDate = parseIsoDate(rangeEnd ?? "");
  const resolvedMin =
    rangeStartDate && rangeStartDate > minDate ? rangeStartDate : minDate;
  const resolvedMax =
    rangeEndDate && rangeEndDate < maxDate ? rangeEndDate : maxDate;
  const selected = isMonthPicker ? parseIsoMonth(value) : parseIsoDate(value);

  return (
    <>
      <style>{DATEPICKER_STYLES}</style>
      <DatePicker
        id={id}
        selected={selected}
        onChange={(date: Date | null) => {
          if (!date) return;
          if (isMonthPicker) {
            const nextMonth = clampReportMonth(date, resolvedMin, resolvedMax);
            if (!nextMonth) return;
            onChange(toIsoMonth(nextMonth));
            return;
          }
          const next = clampReportDate(date, resolvedMin, resolvedMax);
          if (!next) return;
          onChange(toIsoDate(next));
        }}
        dateFormat={isMonthPicker ? "MM/yyyy" : "dd/MM/yyyy"}
        showMonthYearPicker={isMonthPicker}
        placeholderText={placeholder ?? (isMonthPicker ? "mm/yyyy" : "dd/mm/yyyy")}
        autoComplete="off"
        minDate={resolvedMin}
        maxDate={resolvedMax}
        disabled={disabled}
        openToDate={selected ?? resolvedMin}
        renderCustomHeader={(headerProps) => (
          <DatePickerCustomHeader
            {...headerProps}
            pickerMode={picker}
            minDate={resolvedMin}
            maxDate={resolvedMax}
          />
        )}
        shouldCloseOnSelect
        portalId="report-datepicker-portal"
        popperPlacement="bottom-start"
        popperProps={{ strategy: "fixed" }}
        popperModifiers={DATE_PICKER_MODIFIERS}
        popperClassName="report-datepicker-popper"
        calendarClassName="report-datepicker-calendar"
        wrapperClassName="w-full"
        className={`${controlClass} ${hasError ? invalidControlClass : ""} cursor-pointer ${className}`.trim()}
      />
    </>
  );
};

export default ReportDatePicker;
