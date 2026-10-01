/** Central definition of the labour-law acts selectable in the Annual Return
 *  wizard. `key` is used across the wizard, the common form and the list. */
export interface ActDef {
  key: ActKey;
  /** Wizard question label. */
  wizardLabel: string;
  /** Short name used in the list / accordion header. */
  shortLabel: string;
}

export type ActKey =
  | "clra_act"
  | "license_act"
  | "bocwa_act"
  | "ismw_act"
  | "mtw_act"
  | "minimum_wages_act"
  | "plantation_labour_act"
  | "annual_return_bonus"
  | "maternity_benefit"
  | "annual_return_wages"
  | "payments_gratuity_act"
  | "interstatecontractor";

export const ACT_DEFS: ActDef[] = [
  {
    key: "clra_act",
    wizardLabel:
      "Submit Return of Principal Employer under Contract Labour (Regulation & Abolition) Act, 1970",
    shortLabel: "Contract Labour (R & A) Act, 1970",
  },
  {
    key: "license_act",
    wizardLabel:
      "Submit Return of License under Contract Labour (Regulation & Abolition) Act, 1970",
    shortLabel: "Contract License",
  },
  {
    key: "bocwa_act",
    wizardLabel:
      "Submit Return under Building & Other Construction Workers (Regulation of Employment and Conditions of Service) Act, 1996",
    shortLabel: "Building & Other Construction Workers Act, 1996",
  },
  {
    key: "ismw_act",
    wizardLabel:
      "Submit Return of Principal Employer under Inter State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979",
    shortLabel: "Inter State Migrant Workmen Act, 1979",
  },
  {
    key: "mtw_act",
    wizardLabel: "Submit Return under Motor Transport Workers Act, 1961",
    shortLabel: "Motor Transport Workers Act, 1961",
  },
  {
    key: "minimum_wages_act",
    wizardLabel: "Submit Return under Minimum Wages Act, 1948",
    shortLabel: "Minimum Wages Act, 1948",
  },
  {
    key: "plantation_labour_act",
    wizardLabel: "Submit Return under Plantations Labour Act, 1951",
    shortLabel: "Plantations Labour Act, 1951",
  },
  {
    key: "annual_return_bonus",
    wizardLabel: "Submit Return under Payment of Bonus Act, 1965",
    shortLabel: "Payment of Bonus Act, 1965",
  },
  {
    key: "maternity_benefit",
    wizardLabel: "Submit Return under Maternity Benefit Act, 1961",
    shortLabel: "Maternity Benefit Act, 1961",
  },
  {
    key: "annual_return_wages",
    wizardLabel: "Submit Return under Payment of Wages Act, 1936",
    shortLabel: "Payment of Wages Act, 1936",
  },
  {
    key: "payments_gratuity_act",
    wizardLabel: "Submit Return under Payment of Gratuity Act, 1972",
    shortLabel: "Payment of Gratuity Act, 1972",
  },
  {
    key: "interstatecontractor",
    wizardLabel:
      "Submit Return of License under Inter State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1981",
    shortLabel: "ISMW (License) Act, 1981",
  },
];

export type ActSelection = Record<ActKey, boolean>;

export const emptyActSelection = (): ActSelection =>
  ACT_DEFS.reduce((acc, a) => {
    acc[a.key] = false;
    return acc;
  }, {} as ActSelection);

export interface AnnualReturnWizardState {
  year: string;
  acts: ActSelection;
}
