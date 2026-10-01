export const EXPENDITURE_LABELS: { id: number; label: string; hasDescription: boolean }[] = [
  { id: 1, label: "Salaries allowances of Officers", hasDescription: true },
  { id: 2, label: "Travelling allowances, salaries allowances and expenses of estblishment", hasDescription: true },
  { id: 3, label: "Auditors fees", hasDescription: true },
  { id: 4, label: "Legal Expenses : Expenses conducting trade disputes", hasDescription: true },
  { id: 5, label: "Compensation paid members for loss arising out of trade disputes", hasDescription: true },
  { id: 6, label: "Funeral, Old age, sickness, unemployment benifits ect...", hasDescription: true },
  { id: 7, label: "Education, Social and religious benefit", hasDescription: true },
  { id: 8, label: "Cost of publishing periodicals/Stationery", hasDescription: true },
  { id: 9, label: "General Charges", hasDescription: true },
  { id: 10, label: "Electric Charges", hasDescription: true },
  { id: 11, label: "Rent, Rates and Taxes", hasDescription: true },
  { id: 12, label: "Printing, Stationery and Postage", hasDescription: true },
  { id: 13, label: "Affiliation fee", hasDescription: true },
  { id: 14, label: "Expenses incurred in publishing periodicals", hasDescription: true },
  { id: 15, label: "Other Expenses (to be specified)", hasDescription: true },
  { id: 16, label: "Balance at the end of the year", hasDescription: true },
];

export const incomeTitleIdMap: Record<string, number> = {
  "Subscription from members": 2,
  "Donation from members": 7,
  "Loans from": 3,
  "Sale of periodicals books, rules, etc.": 4,
  "Interest on investments": 5,
  "Income from miscellaneous sources (to be specified)": 6,
};
