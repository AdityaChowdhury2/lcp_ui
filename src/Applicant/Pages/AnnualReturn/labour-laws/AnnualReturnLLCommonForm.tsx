import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArAccordion,
  ArSection,
  TextField,
  YesNoField,
  arBtn,
  Req,
} from "./components/arFormPrimitives";
import { AddressCascade, AddressFieldNames } from "./components/AddressCascade";
import {
  ManagerSubForm,
  EmployerParticularsSubForm,
  RetrenchmentSubForm,
  PfEsiSubForm,
  TradeUnionSubForm,
} from "./components/InnerSubForms";
import { ACT_FORM_COMPONENTS } from "./components/ActForms";
import { ACT_DEFS, AnnualReturnWizardState } from "./arTypes";
import {
  annualReturnLLApi,
  EstablishmentContext,
} from "./annualReturnLLApi";

const NATURE_OF_BUSINESS = [
  "Manufacturing",
  "Construction",
  "Transport & Logistics",
  "Mining & Quarrying",
  "Plantation",
  "Hospitality",
  "Information Technology",
  "Retail & Trade",
  "Healthcare",
  "Security Services",
  "Housekeeping / Facility Management",
  "Others",
];

const WORKMEN_ROWS = [
  { key: "direct", label: "Direct Employee / Workman", col: "direct_emp" },
  { key: "contract", label: "Contract labour", col: "contract_emp" },
  { key: "casual", label: "Casual labour", col: "casual_emp" },
] as const;

/** Local common-field name → DB column name (sections 4–11). */
const COMMON_FIELD_MAP: Record<string, string> = {
  min_wage_if_paid: "minimum_wages",
  w_p_p_m_max: "wages_paid_maximum",
  w_p_p_m_min: "wages_paid_minimum",
  wages_paid_wrkmen_emp_in_yr: "total_amount_of_wages",
  retrenched_no: "no_of_workers_retrenched",
  resigned_no: "no_of_workers_resigned",
  terminated_no: "no_of_workers_terminated",
  max_no_workers_directly_on_any_day: "max_no_of_workmen_emp_directly_per_yr",
  total_no_days_employed: "total_days_for_direct_labour",
  total_no_mandays_employed_workmen: "total_man_days",
  premises_men: "avg_no_emp_industrial_premises_men",
  premises_women: "avg_no_emp_industrial_premises_women",
  premises_young_persons: "avg_no_emp_industrial_premises_yp",
  premises_male: "avg_no_emp_industrial_premises_male",
  premises_female: "avg_no_emp_industrial_premises_female",
};

type WorkmenState = Record<string, string>;

/** Field-name map for the establishment address cascade (section 1). */
const EST_ADDRESS_NAMES: AddressFieldNames = {
  district: "est_district",
  subdivision: "est_subdivision",
  policeStation: "est_ps",
  addressLine: "establishment_address",
  pin: "est_pin_number",
};

const AnnualReturnLLCommonForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as
    | (AnnualReturnWizardState & { wizardId?: string })
    | undefined;

  const year = state?.year ?? "";
  const acts = state?.acts;
  const wizardId = state?.wizardId ?? "";

  const selectedActs = useMemo(
    () => (acts ? ACT_DEFS.filter((a) => acts[a.key]) : []),
    [acts]
  );

  const [establishment, setEstablishment] = useState<EstablishmentContext | null>(null);
  const [estInfo, setEstInfo] = useState<Record<string, string>>({});
  const [nature, setNature] = useState<string[]>([]);
  const [workmen, setWorkmen] = useState<WorkmenState>({});
  const [common, setCommon] = useState<Record<string, string>>({});
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Collected data from the nested/act forms (refs — no re-render on change).
  const managersRef = useRef<Record<string, string>[]>([]);
  const particularsRef = useRef<Record<string, string>[]>([]);
  const retrenchRef = useRef<Record<string, string>[]>([]);
  const pfEsiRef = useRef<Record<string, string>>({});
  const actsRef = useRef<Record<string, Record<string, string>>>({});

  useEffect(() => {
    let active = true;
    annualReturnLLApi
      .getEstablishment()
      .then((data) => active && setEstablishment(data))
      .catch(() => active && setEstablishment(null));
    return () => {
      active = false;
    };
  }, []);

  const setC = (name: string, v: string) => setCommon((c) => ({ ...c, [name]: v }));
  const setEst = (name: string, v: string) => setEstInfo((e) => ({ ...e, [name]: v }));
  const setWm = (name: string, v: string) => setWorkmen((w) => ({ ...w, [name]: v }));
  const toggleNature = (item: string) =>
    setNature((n) => (n.includes(item) ? n.filter((x) => x !== item) : [...n, item]));

  const num = (v?: string) => {
    const n = parseInt(v ?? "", 10);
    return isNaN(n) ? 0 : n;
  };
  const rowTotal = (key: string, suffix: "" | "_ad") =>
    num(workmen[`${key}${suffix}_m`]) + num(workmen[`${key}${suffix}_f`]);

  const buildCommonPayload = (): Record<string, string> => {
    const out: Record<string, string> = {
      // section 1 — establishment details (now applicant-entered)
      est_name: estInfo.est_name ?? "",
      establishment_address: estInfo.establishment_address ?? "",
      est_loc: estInfo.establishment_address ?? "",
      est_district: estInfo.est_district ?? "",
      est_subdivision: estInfo.est_subdivision ?? "",
      est_ps: estInfo.est_ps ?? "",
      est_pin_number: estInfo.est_pin_number ?? "",
    };
    // sections 4–11
    for (const [local, col] of Object.entries(COMMON_FIELD_MAP)) {
      out[col] = common[local] ?? "";
    }
    // section 3 — workmen matrix with computed totals
    for (const row of WORKMEN_ROWS) {
      out[`${row.col}_male`] = workmen[`${row.key}_m`] ?? "";
      out[`${row.col}_female`] = workmen[`${row.key}_f`] ?? "";
      out[`${row.col}_total`] = String(rowTotal(row.key, ""));
      out[`${row.col}_adolmale`] = workmen[`${row.key}_ad_m`] ?? "";
      out[`${row.col}_adolfemale`] = workmen[`${row.key}_ad_f`] ?? "";
      out[`${row.col}_adoltotal`] = String(rowTotal(row.key, "_ad"));
    }
    return out;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!declared) return;
    setSaving(true);
    try {
      await annualReturnLLApi.submit({
        wizardId,
        year,
        common: buildCommonPayload(),
        nature,
        managers: managersRef.current,
        particulars: particularsRef.current,
        retrenchments: retrenchRef.current,
        pfEsi: pfEsiRef.current,
        acts: actsRef.current,
      });
      toast.success("Annual Return submitted successfully.");
      navigate("/annual-return/list");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to submit the annual return."
      );
    } finally {
      setSaving(false);
    }
  };

  // Guard — must arrive from the wizard with a saved wizard id.
  if (!state?.year || !state?.acts || !wizardId) {
    return <Navigate to="/annual-return/wizard" replace />;
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded bg-white shadow">
        <div className="bg-[#1D5A89] px-4 py-3">
          <h1 className="text-[16px] font-semibold text-white">Online filing of return</h1>
          <p className="mt-0.5 text-[12px] text-slate-200">
            Return of the year ending 31st December : {year}
          </p>
        </div>

        <div className="p-4">
          <ArAccordion defaultValue={["s1", "s2"]}>
            {/* 1. Establishment Details */}
            <ArSection
              value="s1"
              index={1}
              title="Establishment Details"
              required
              helpItems={[
                "Enter the establishment name and its postal address.",
                "Select District → Sub-division → Police Station, then enter the street address & PIN.",
              ]}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextField
                  label="Name of the establishment / industrial undertaking"
                  name="est_name"
                  value={estInfo.est_name}
                  onChange={setEst}
                  required
                  className="md:col-span-3"
                />
                <AddressCascade
                  names={EST_ADDRESS_NAMES}
                  values={estInfo}
                  onChange={setEst}
                  required
                />
              </div>
            </ArSection>

            {/* 2. Nature of Business */}
            <ArSection
              value="s2"
              index={2}
              title="Nature of Business"
              required
              helpItems={["Select one or more nature of business applicable."]}
            >
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {NATURE_OF_BUSINESS.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-[13px]"
                  >
                    <input
                      type="checkbox"
                      checked={nature.includes(item)}
                      onChange={() => toggleNature(item)}
                      className="h-4 w-4 accent-[#1D5A89]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </ArSection>

            {/* 3. Number of Workmen engaged */}
            <ArSection
              value="s3"
              index={3}
              title="Number of Workmen engaged in the establishment"
              required
              helpItems={["All fields are numeric.", "Total columns are auto-calculated."]}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Type</th>
                      <th className="border p-2">Male</th>
                      <th className="border p-2">Female</th>
                      <th className="border p-2">Total</th>
                      <th className="border p-2">Adolescent Male</th>
                      <th className="border p-2">Adolescent Female</th>
                      <th className="border p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WORKMEN_ROWS.map((row) => (
                      <tr key={row.key}>
                        <td className="border p-2 font-semibold">{row.label}</td>
                        {(["_m", "_f"] as const).map((s) => (
                          <td key={s} className="border p-1">
                            <input
                              type="number"
                              value={workmen[`${row.key}${s}`] ?? ""}
                              onChange={(e) => setWm(`${row.key}${s}`, e.target.value)}
                              className="w-full rounded border border-gray-300 p-1.5 text-center"
                            />
                          </td>
                        ))}
                        <td className="border bg-slate-50 p-1 text-center font-semibold">
                          {rowTotal(row.key, "")}
                        </td>
                        {(["_ad_m", "_ad_f"] as const).map((s) => (
                          <td key={s} className="border p-1">
                            <input
                              type="number"
                              value={workmen[`${row.key}${s}`] ?? ""}
                              onChange={(e) => setWm(`${row.key}${s}`, e.target.value)}
                              className="w-full rounded border border-gray-300 p-1.5 text-center"
                            />
                          </td>
                        ))}
                        <td className="border bg-slate-50 p-1 text-center font-semibold">
                          {rowTotal(row.key, "_ad")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ArSection>

            {/* 4. Whether Minimum Wages are paid */}
            <ArSection value="s4" index={4} title="Whether Minimum Wages are paid" required>
              <YesNoField label="Whether Minimum Wages are paid" name="min_wage_if_paid" value={common.min_wage_if_paid} onChange={setC} required />
            </ArSection>

            {/* 5. Wages paid per month */}
            <ArSection value="s5" index={5} title="Wages paid to the Workman / Employee per month" required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField label="Maximum" name="w_p_p_m_max" value={common.w_p_p_m_max} onChange={setC} type="number" required />
                <TextField label="Minimum" name="w_p_p_m_min" value={common.w_p_p_m_min} onChange={setC} type="number" required />
              </div>
            </ArSection>

            {/* 6. Total Amount of Wages paid during year */}
            <ArSection value="s6" index={6} title="Total Amount of Wages paid to the workmen / employees during the year" required>
              <TextField label="Total Amount of Wages paid during the year" name="wages_paid_wrkmen_emp_in_yr" value={common.wages_paid_wrkmen_emp_in_yr} onChange={setC} type="number" required className="max-w-md" />
            </ArSection>

            {/* 7. Numbers of workers during the year */}
            <ArSection value="s7" index={7} title="Numbers of workers during the year" required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextField label="A. Retrenched" name="retrenched_no" value={common.retrenched_no} onChange={setC} type="number" required />
                <TextField label="B. Resigned" name="resigned_no" value={common.resigned_no} onChange={setC} type="number" required />
                <TextField label="C. Terminated" name="terminated_no" value={common.terminated_no} onChange={setC} type="number" required />
              </div>
            </ArSection>

            {/* 8. Max number of workmen employed directly on any day */}
            <ArSection value="s8" index={8} title="Maximum number of workmen employed directly on any day during the year" required>
              <TextField label="Maximum number of workmen employed directly on any day" name="max_no_workers_directly_on_any_day" value={common.max_no_workers_directly_on_any_day} onChange={setC} type="number" required className="max-w-md" />
            </ArSection>

            {/* 9. Total number of days direct labour employed */}
            <ArSection value="s9" index={9} title="Total number of days during the year on which direct labour was employed" required>
              <TextField label="Total number of days direct labour was employed" name="total_no_days_employed" value={common.total_no_days_employed} onChange={setC} type="number" required className="max-w-md" />
            </ArSection>

            {/* 10. Total man-days */}
            <ArSection value="s10" index={10} title="Total number of man-days worked by directly employed workmen" required>
              <TextField label="Total number of man-days worked" name="total_no_mandays_employed_workmen" value={common.total_no_mandays_employed_workmen} onChange={setC} type="number" required className="max-w-md" />
            </ArSection>

            {/* 11. Average number of employees daily */}
            <ArSection value="s11" index={11} title="Average number of employees employed daily in the industrial premises" required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextField label="Men" name="premises_men" value={common.premises_men} onChange={setC} type="number" required />
                <TextField label="Women" name="premises_women" value={common.premises_women} onChange={setC} type="number" required />
                <TextField label="Young persons" name="premises_young_persons" value={common.premises_young_persons} onChange={setC} type="number" required />
                <TextField label="Male" name="premises_male" value={common.premises_male} onChange={setC} type="number" required />
                <TextField label="Female" name="premises_female" value={common.premises_female} onChange={setC} type="number" required />
              </div>
            </ArSection>

            {/* 12–16. Inner repeatable sub-forms */}
            <ManagerSubForm value="s12" index={12} onChange={(r) => (managersRef.current = r)} />
            <EmployerParticularsSubForm value="s13" index={13} onChange={(r) => (particularsRef.current = r)} />
            <RetrenchmentSubForm value="s14" index={14} onChange={(r) => (retrenchRef.current = r)} />
            <PfEsiSubForm value="s15" index={15} onChange={(d) => (pfEsiRef.current = d)} />
            <TradeUnionSubForm value="s16" index={16} tradeUnions={establishment?.tradeUnions ?? []} />

            {/* 17+. Conditional act-specific forms */}
            {selectedActs.map((act, i) => {
              const Comp = ACT_FORM_COMPONENTS[act.key];
              return (
                <Comp
                  key={act.key}
                  value={`act-${act.key}`}
                  index={17 + i}
                  onData={(d) => (actsRef.current[act.key] = d)}
                />
              );
            })}
          </ArAccordion>

          {/* Selected acts summary */}
          <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-600">
            <span className="font-semibold">Returns being filed for:</span>{" "}
            {selectedActs.map((a) => a.shortLabel).join("; ")}
          </div>

          {/* Declaration */}
          <div className="mt-5 border-t pt-4">
            <label className="flex items-start gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1D5A89]"
              />
              <span>
                I hereby declare that the above furnished details are true to the best of my
                knowledge.
                <Req />
              </span>
            </label>
            {submitted && !declared && (
              <p className="mt-1 text-[12px] text-red-600">
                Please accept the declaration to submit.
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/annual-return/wizard")}
                className="rounded border border-gray-300 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
              <button type="button" onClick={handleSubmit} disabled={saving} className={arBtn}>
                {saving ? "Saving…" : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReturnLLCommonForm;
