import { FieldConfig } from "../types/liabilities.types";

export const LIABILITY_ROWS: FieldConfig[] = [
  { label: "Loan From", fieldId: 1, flag: "L", key: "loanFrom" },
  { label: "Debts due to", fieldId: 2, flag: "L", key: "debtsDue" },
  { label: "Other Liabilities", fieldId: 3, flag: "L", key: "otherLiabilities" },
];

export const ASSET_ROWS: FieldConfig[] = [
  { label: "Cash", fieldId: 4, flag: "A", key: "cash" },
  { label: "In hands of", fieldId: 5, flag: "A", key: "inHands" },
  { label: "Securities as per list", fieldId: 6, flag: "A", key: "securities" },
  { label: "Unpaid Subscription due for", fieldId: 7, flag: "A", key: "unpaidSubscription" },
  { label: "Loans to", fieldId: 8, flag: "A", key: "loansTo" },
  { label: "Immovable Properties", fieldId: 9, flag: "A", key: "immovableProperties" },
  { label: "Goods and Furniture", fieldId: 10, flag: "A", key: "goodsFurniture" },
  { label: "Other assets (to be specified)", fieldId: 11, flag: "A", key: "otherAssets" },
];

export const ALL_FIELDS: Record<number, FieldConfig> = {};
[...LIABILITY_ROWS, ...ASSET_ROWS].forEach((row) => {
  ALL_FIELDS[row.fieldId] = row;
});

export const inputClass =
  "w-full h-[28px] border border-[#999] px-2 text-[12px] rounded-sm focus:outline-none focus:border-[#2c6da4]";

export const labelClass = "text-[12px] font-semibold text-gray-700";
