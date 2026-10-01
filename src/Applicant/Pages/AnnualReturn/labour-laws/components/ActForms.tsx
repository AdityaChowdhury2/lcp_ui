import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArSection,
  SubHeading,
  TextField,
  TextAreaField,
  SelectField,
  YesNoField,
  Req,
  fieldLabel,
  fieldInput,
  arBtn,
  arBtnOutline,
} from "./arFormPrimitives";
import { ActKey } from "../arTypes";
import { annualReturnLLApi, PartiEstDetails } from "../annualReturnLLApi";
import { AddressCascade, AddressFieldNames } from "./AddressCascade";

/**
 * Conditional, act-specific return forms. Each renders as an accordion section
 * only when the corresponding act was chosen in the wizard. Field `name`s are
 * aligned to the DB columns so the submit payload passes through; extra display
 * fields (e.g. registration number) are simply ignored by the server whitelist.
 * Each form syncs its state up via `onData`.
 *
 * A subset of the acts (CLRA, BOCWA, MTW, ISMW) are registration-backed: instead
 * of an accordion the applicant must first key in the registration / license
 * number and verify it against their own records. On a hit the establishment &
 * principal-employer particulars are shown read-only and the editable return
 * fields are revealed; on a miss an alert is raised.
 */

interface ActFormProps {
  value: string;
  index: number;
  onData?: (data: Record<string, string>) => void;
}

function useLocal(initial: Record<string, string>, onData?: (d: Record<string, string>) => void) {
  const [data, setData] = useState<Record<string, string>>(initial);
  useEffect(() => {
    onData?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const set = (name: string, v: string) => setData((d) => ({ ...d, [name]: v }));
  return { data, set };
}

/** Read-only row inside the fetched-particulars panel. */
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <tr className="border-b last:border-b-0">
      <th className="w-2/5 border-r bg-slate-50 p-2 text-left align-top font-semibold">
        {label}
      </th>
      <td className="p-2 align-top">{value?.trim() ? value : "—"}</td>
    </tr>
  );
}

/** Establishment + principal-employer particulars fetched from the registration. */
function ParticularsPanel({ details }: { details: PartiEstDetails }) {
  const est = details.estDetails;
  const pe = details.peDetails;
  const hasPe = pe && (pe.employerName?.trim() || pe.fullAddress?.trim());
  return (
    <div className="mt-4 overflow-x-auto rounded border border-emerald-200 bg-emerald-50/40">
      <div className="border-b border-emerald-200 bg-emerald-100/60 px-3 py-1.5 text-[12px] font-semibold text-emerald-800">
        Registration details fetched — verify the particulars below.
      </div>
      <table className="w-full border-collapse text-[13px]">
        <tbody>
          <InfoRow label="Name of the establishment" value={est?.establishmentName} />
          <InfoRow label="Address of the establishment" value={est?.fullAddress} />
          {est?.phoneNumber?.trim() && (
            <InfoRow label="Phone number" value={est?.phoneNumber} />
          )}
          {est?.emailAddress?.trim() && (
            <InfoRow label="Email address" value={est?.emailAddress} />
          )}
          {hasPe && (
            <>
              <InfoRow label="Name of the Principal Employer" value={pe?.employerName} />
              <InfoRow label="Address of the Principal Employer" value={pe?.fullAddress} />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Non-accordion, registration-backed act section. Renders a header bar, a
 * registration/license-number input with a Verify action, and — once verified —
 * the fetched particulars panel followed by the editable return fields
 * (`children`). Failing verification raises a toast alert.
 */
function VerifyActSection({
  index,
  title,
  actId,
  regLabel,
  regValue,
  onRegChange,
  onVerified,
  children,
}: {
  index: number;
  title: React.ReactNode;
  actId: number;
  regLabel: string;
  regValue?: string;
  onRegChange: (v: string) => void;
  onVerified?: (d: PartiEstDetails | null) => void;
  children: React.ReactNode;
}) {
  const [verifying, setVerifying] = useState(false);
  const [details, setDetails] = useState<PartiEstDetails | null>(null);

  const handleVerify = async () => {
    const reg = (regValue ?? "").trim();
    if (!reg) {
      toast.error(`Please enter the ${regLabel}.`);
      return;
    }
    setVerifying(true);
    try {
      const res = await annualReturnLLApi.verifyRegistration(actId, reg);
      if (!res?.estDetails) {
        throw new Error("No matching registration details were found.");
      }
      setDetails(res);
      onVerified?.(res);
      toast.success("Registration details found. Please continue filling the form.");
    } catch (err: any) {
      setDetails(null);
      onVerified?.(null);
      toast.error(
        err?.response?.data?.message ??
          err?.message ??
          "No matching registration details were found."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = () => {
    setDetails(null);
    onVerified?.(null);
  };

  return (
    <div className="mb-3 overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-[#1D5A89] px-4 py-3 text-[14px] font-semibold text-white">
        {index != null && <span>{index}.</span>}
        <span className="flex-1">
          {title}
          <span className="ml-1 text-red-300">*</span>
        </span>
      </div>
      <div className="px-4 pt-4 pb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-60 flex-1">
            <label className={fieldLabel}>
              {regLabel}
              <Req />
            </label>
            <input
              type="text"
              value={regValue ?? ""}
              disabled={!!details}
              placeholder={`Enter ${regLabel}`}
              onChange={(e) => onRegChange(e.target.value)}
              className={fieldInput}
            />
          </div>
          {!details ? (
            <button type="button" onClick={handleVerify} disabled={verifying} className={arBtn}>
              {verifying ? "Verifying…" : "Verify"}
            </button>
          ) : (
            <button type="button" onClick={handleChange} className={arBtnOutline}>
              Change
            </button>
          )}
        </div>

        {details && (
          <>
            <ParticularsPanel details={details} />
            <div className="mt-4">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

/** act key → self-cert `actId` used by the particulars lookup. */
const VERIFY_ACT_ID: Partial<Record<ActKey, number>> = {
  clra_act: 1,
  bocwa_act: 2,
  mtw_act: 3,
  ismw_act: 4,
};

/** Cascading-address field map for the Minimum Wages return. */
const MINWAGES_ADDRESS_NAMES: AddressFieldNames = {
  district: "dist_code",
  subdivision: "subdivision",
  policeStation: "ps",
  addressLine: "address",
  pin: "pin",
};

/* ---- CLRA (Principal Employer) ---- */
function ClraForm({ index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { regno: "", days_work_last_yr: "", total_no_of_days: "", man_days_work: "", reson_amend: "" },
    onData,
  );
  return (
    <VerifyActSection
      index={index}
      title="Information required under the Contract Labour (R & A) Act, 1970"
      actId={VERIFY_ACT_ID.clra_act!}
      regLabel="CL(R&A) Registration Number"
      regValue={data.regno}
      onRegChange={(v) => set("regno", v)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="No. of days worked in the last year" name="days_work_last_yr" value={data.days_work_last_yr} onChange={set} type="number" />
        <TextField label="Total number of days contract labour engaged" name="total_no_of_days" value={data.total_no_of_days} onChange={set} type="number" />
        <TextField label="Man-days worked" name="man_days_work" value={data.man_days_work} onChange={set} type="number" />
        <TextAreaField label="Reason for Amendment / Remarks" name="reson_amend" value={data.reson_amend} onChange={set} className="md:col-span-2" />
      </div>
    </VerifyActSection>
  );
}

/* ---- CLRA License ---- */
function LicenseForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { license_no: "", nature_work: "", max_workmen: "", days_worked: "" },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Information required for License Annual Return (Contract Labour)" required>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="License Number" name="license_no" value={data.license_no} onChange={set} required />
        <TextField label="Nature of work" name="nature_work" value={data.nature_work} onChange={set} />
        <TextField label="Maximum number of workmen employed" name="max_workmen" value={data.max_workmen} onChange={set} type="number" />
        <TextField label="No. of days worked during the year" name="days_worked" value={data.days_worked} onChange={set} type="number" />
      </div>
    </ArSection>
  );
}

/* ---- BOCWA ---- */
function BocwaForm({ index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      regno: "",
      bocwa_permanent_address: "",
      workers_ordinary_employed: "",
      total_building_workers: "",
      numberofdays_workers_employed: "",
      man_days_worked: "",
      yes_no_accident: "",
      no_of_accident: "",
      no_of_deaths: "",
      total_accidents: "",
    },
    onData,
  );
  return (
    <VerifyActSection
      index={index}
      title="Annual Return Form for Building and Other Construction Workers Act, 1996"
      actId={VERIFY_ACT_ID.bocwa_act!}
      regLabel="BOCW Act Registration Number"
      regValue={data.regno}
      onRegChange={(v) => set("regno", v)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="6. No. of building workers ordinarily employed" name="workers_ordinary_employed" value={data.workers_ordinary_employed} onChange={set} type="number" />
        <TextField label="7. Total no. of days during the year workers were employed" name="numberofdays_workers_employed" value={data.numberofdays_workers_employed} onChange={set} type="number" />
        <TextField label="8. Total no. of man-days worked by building workers" name="man_days_worked" value={data.man_days_worked} onChange={set} type="number" />
        <TextField label="9. Total building workers" name="total_building_workers" value={data.total_building_workers} onChange={set} type="number" />
        <TextField label="Permanent address" name="bocwa_permanent_address" value={data.bocwa_permanent_address} onChange={set} className="md:col-span-2" />
        <YesNoField label="10. Any accident that took place during the year?" name="yes_no_accident" value={data.yes_no_accident} onChange={set} />
        {data.yes_no_accident === "1" && (
          <>
            <TextField label="No. of accidents" name="no_of_accident" value={data.no_of_accident} onChange={set} type="number" />
            <TextField label="No. of deaths" name="no_of_deaths" value={data.no_of_deaths} onChange={set} type="number" />
            <TextField label="Total accidents" name="total_accidents" value={data.total_accidents} onChange={set} type="number" />
          </>
        )}
      </div>
    </VerifyActSection>
  );
}

/* ---- ISMW (Principal Employer) ---- */
function IsmwForm({ index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { regno: "", est_address: "", no_of_days_emp_migrant_wm: "", no_of_mandays_emp_migrant_year: "" },
    onData,
  );
  return (
    <VerifyActSection
      index={index}
      title="Information required under the ISMW Act, 1979"
      actId={VERIFY_ACT_ID.ismw_act!}
      regLabel="ISMW Registration Number"
      regValue={data.regno}
      onRegChange={(v) => set("regno", v)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Establishment address" name="est_address" value={data.est_address} onChange={set} className="md:col-span-2" />
        <TextField label="No. of days migrant workmen employed" name="no_of_days_emp_migrant_wm" value={data.no_of_days_emp_migrant_wm} onChange={set} type="number" />
        <TextField label="No. of man-days migrant workmen employed (year)" name="no_of_mandays_emp_migrant_year" value={data.no_of_mandays_emp_migrant_year} onChange={set} type="number" />
      </div>
    </VerifyActSection>
  );
}

/* ---- ISMW License (Contractor) ---- */
function InterstateContractorForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { license_no: "", nature_work: "", max_workmen: "", days_worked: "" },
    onData,
  );
  return (
    <ArSection
      value={value}
      index={index}
      title="Inter State Migrant Workmen Act, 1981 — License"
      required
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="License Number" name="license_no" value={data.license_no} onChange={set} required />
        <TextField label="Nature of work" name="nature_work" value={data.nature_work} onChange={set} />
        <TextField label="Maximum number of migrant workmen employed" name="max_workmen" value={data.max_workmen} onChange={set} type="number" />
        <TextField label="No. of days worked" name="days_worked" value={data.days_worked} onChange={set} type="number" />
      </div>
    </ArSection>
  );
}

/* ---- MTW ---- */
function MtwForm({ index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      regno: "",
      postal_address: "",
      avg_emp_daily_adult: "",
      avg_emp_daily_adol: "",
      hr_per_day_adult: "",
      hr_per_day_adol: "",
      no_of_worker_annual_leave_adult: "",
      no_of_worker_annual_leave_adol: "",
    },
    onData,
  );
  return (
    <VerifyActSection
      index={index}
      title="Information required under the MTW Act, 1961"
      actId={VERIFY_ACT_ID.mtw_act!}
      regLabel="MTW Registration Number"
      regValue={data.regno}
      onRegChange={(v) => set("regno", v)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Postal address" name="postal_address" value={data.postal_address} onChange={set} className="md:col-span-2" />
        <TextField label="4. Average number of workers employed daily (Adult)" name="avg_emp_daily_adult" value={data.avg_emp_daily_adult} onChange={set} type="number" />
        <TextField label="4. Average number of workers employed daily (Adolescent)" name="avg_emp_daily_adol" value={data.avg_emp_daily_adol} onChange={set} type="number" />
        <TextField label="5. Normal hours worked per day (Adult)" name="hr_per_day_adult" value={data.hr_per_day_adult} onChange={set} type="number" />
        <TextField label="5. Normal hours worked per day (Adolescent)" name="hr_per_day_adol" value={data.hr_per_day_adol} onChange={set} type="number" />
        <TextField label="8. Workers entitled to annual leave with wages (Adult)" name="no_of_worker_annual_leave_adult" value={data.no_of_worker_annual_leave_adult} onChange={set} type="number" />
        <TextField label="8. Workers entitled to annual leave with wages (Adolescent)" name="no_of_worker_annual_leave_adol" value={data.no_of_worker_annual_leave_adol} onChange={set} type="number" />
      </div>
    </VerifyActSection>
  );
}

/* ---- Minimum Wages ---- */
function MinimumWagesForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      name_of_est: "",
      name_of_mg_if_any: "",
      address: "",
      dist_code: "",
      subdivision: "",
      ps: "",
      pin: "",
      no_of_days_worked_during_yr: "",
      no_of_mandays_worked_during_yr: "",
      balance_fine_fund_in_hand: "",
    },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Information required under Minimum Wages Act, 1948" required>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextField label="Name of establishment" name="name_of_est" value={data.name_of_est} onChange={set} />
        <TextField label="Name of managing agent / director / partner" name="name_of_mg_if_any" value={data.name_of_mg_if_any} onChange={set} className="md:col-span-2" />
        <AddressCascade names={MINWAGES_ADDRESS_NAMES} values={data} onChange={set} />
        <TextField label="No. of days worked during the year" name="no_of_days_worked_during_yr" value={data.no_of_days_worked_during_yr} onChange={set} type="number" />
        <TextField label="No. of man-days worked during the year" name="no_of_mandays_worked_during_yr" value={data.no_of_mandays_worked_during_yr} onChange={set} type="number" />
        <TextField label="Balance of fine fund in hand" name="balance_fine_fund_in_hand" value={data.balance_fine_fund_in_hand} onChange={set} type="number" />
      </div>
    </ArSection>
  );
}

/* ---- Plantation Labour (UI only — no persistence table yet) ---- */
function PlantationForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { area: "", workers_male: "", workers_female: "", accidents: "", housing_units: "", medical_facilities: "" },
    onData,
  );
  return (
    <ArSection
      value={value}
      index={index}
      title="Information required under Plantations Labour Act, 1951"
      required
      helpItems={["Persistence for this act is pending backend table definition."]}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Area under plantation (hectares)" name="area" value={data.area} onChange={set} type="number" />
        <TextField label="Number of workers - Male" name="workers_male" value={data.workers_male} onChange={set} type="number" />
        <TextField label="Number of workers - Female" name="workers_female" value={data.workers_female} onChange={set} type="number" />
        <TextField label="Number of accidents during the year" name="accidents" value={data.accidents} onChange={set} type="number" />
        <TextField label="Number of housing units provided" name="housing_units" value={data.housing_units} onChange={set} type="number" />
        <TextAreaField label="Medical facilities provided" name="medical_facilities" value={data.medical_facilities} onChange={set} className="md:col-span-2" />
      </div>
    </ArSection>
  );
}

/* ---- Payment of Bonus ---- */
function BonusForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      total_number_emp: "",
      total_amount_payable_bonus: "",
      settlement: "",
      settlement_remarks: "",
      percentage_bonus: "",
      total_amount_bonus: "",
      date_payment_made: "",
      whether_bonus_paid: "",
      none_payment: "",
      remark: "",
    },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Payment of Bonus Act, 1965" required>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="1. Total number of employees benefited" name="total_number_emp" value={data.total_number_emp} onChange={set} type="number" />
        <TextField label="2. Total amount payable as bonus (u/s 10 or 11)" name="total_amount_payable_bonus" value={data.total_amount_payable_bonus} onChange={set} type="number" />
        <YesNoField label="3. Settlement (if any)" name="settlement" value={data.settlement} onChange={set} />
        <TextField label="5. Settlement remarks" name="settlement_remarks" value={data.settlement_remarks} onChange={set} />
        <TextField label="6. Percentage of bonus declared to be paid" name="percentage_bonus" value={data.percentage_bonus} onChange={set} type="number" />
        <TextField label="7. Total amount of bonus actually paid" name="total_amount_bonus" value={data.total_amount_bonus} onChange={set} type="number" />
        <TextField label="8. Date on which payment made" name="date_payment_made" value={data.date_payment_made} onChange={set} type="date" />
        <YesNoField label="9. Whether bonus paid to all employees" name="whether_bonus_paid" value={data.whether_bonus_paid} onChange={set} />
        {data.whether_bonus_paid === "0" && (
          <TextAreaField label="10. Reason of non payment of bonus" name="none_payment" value={data.none_payment} onChange={set} className="md:col-span-2" />
        )}
        <TextAreaField label="11. Remarks" name="remark" value={data.remark} onChange={set} className="md:col-span-2" />
      </div>
    </ArSection>
  );
}

/* ---- Maternity Benefit ---- */
function MaternityForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      date_opening: "",
      closing_date: "",
      medical_officer_name: "",
      qualification_medical_officer: "",
      resident_establishment: "",
      hospital_est: "",
      beds_provided: "",
      lady_doctor: "",
      qualified_midwife: "",
      creche_provided: "",
      women_temporarily_employed: "",
      women_permanently_employed: "",
      claims_for_meternity_benefit_paid: "",
      claims_for_maternity_benefit_rejected: "",
    },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Information required under Maternity Benefit Act, 1961" required>
      <SubHeading>Establishment & Medical Facilities</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="1. Date of opening of the establishment" name="date_opening" value={data.date_opening} onChange={set} type="date" />
        <TextField label="2. Date of closing (if any)" name="closing_date" value={data.closing_date} onChange={set} type="date" />
        <TextField label="3. Name of the medical officer" name="medical_officer_name" value={data.medical_officer_name} onChange={set} />
        <TextField label="4. Qualification of medical officer" name="qualification_medical_officer" value={data.qualification_medical_officer} onChange={set} />
        <YesNoField label="5. Is he resident at the establishment?" name="resident_establishment" value={data.resident_establishment} onChange={set} />
        <YesNoField label="8. Any hospital attached to the establishment?" name="hospital_est" value={data.hospital_est} onChange={set} />
        <TextField label="9. Beds provided for women employees" name="beds_provided" value={data.beds_provided} onChange={set} type="number" />
        <YesNoField label="10. Is there a lady doctor?" name="lady_doctor" value={data.lady_doctor} onChange={set} />
        <YesNoField label="12. Is there a qualified midwife?" name="qualified_midwife" value={data.qualified_midwife} onChange={set} />
        <YesNoField label="13. Has any creche been provided?" name="creche_provided" value={data.creche_provided} onChange={set} />
      </div>
      <div className="mt-4">
        <SubHeading>Women Employees & Claims</SubHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="14. Women temporarily employed during the year" name="women_temporarily_employed" value={data.women_temporarily_employed} onChange={set} type="number" />
          <TextField label="15. Women permanently employed during the year" name="women_permanently_employed" value={data.women_permanently_employed} onChange={set} type="number" />
          <TextField label="19. Claims for maternity benefit paid" name="claims_for_meternity_benefit_paid" value={data.claims_for_meternity_benefit_paid} onChange={set} type="number" />
          <TextField label="20. Claims for maternity benefit rejected" name="claims_for_maternity_benefit_rejected" value={data.claims_for_maternity_benefit_rejected} onChange={set} type="number" />
        </div>
      </div>
    </ArSection>
  );
}

/* ---- Payment of Wages ---- */
function WagesForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    { total_number_emp: "", fines: "", amount_realized: "", case_realized: "", disbursement: "", balance: "", remark: "" },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Information required under Payment of Wages Act, 1936" required>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Total number of employees" name="total_number_emp" value={data.total_number_emp} onChange={set} type="number" />
        <TextField label="Fines imposed" name="fines" value={data.fines} onChange={set} type="number" />
        <TextField label="Number of cases realized" name="case_realized" value={data.case_realized} onChange={set} type="number" />
        <TextField label="Amount realized" name="amount_realized" value={data.amount_realized} onChange={set} type="number" />
        <TextField label="Disbursement" name="disbursement" value={data.disbursement} onChange={set} type="number" />
        <TextField label="Balance" name="balance" value={data.balance} onChange={set} type="number" />
        <TextAreaField label="Remarks" name="remark" value={data.remark} onChange={set} className="md:col-span-2" />
      </div>
    </ArSection>
  );
}

/* ---- Payment of Gratuity ---- */
function GratuityForm({ value, index, onData }: ActFormProps) {
  const { data, set } = useLocal(
    {
      no_persons_emp: "",
      max_number_person: "",
      number_covered_act: "",
      type_organisation: "",
      articles_details: "",
      seasonal: "",
      date_opening: "",
    },
    onData,
  );
  return (
    <ArSection value={value} index={index} title="Information required under Payment of Gratuity Act, 1972" required>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="1. Number of persons employed" name="no_persons_emp" value={data.no_persons_emp} onChange={set} type="number" />
        <TextField label="2. Max. persons employed on any day (preceding 12 months)" name="max_number_person" value={data.max_number_person} onChange={set} type="number" />
        <TextField label="3. Number of employees covered by the Act" name="number_covered_act" value={data.number_covered_act} onChange={set} type="number" />
        <SelectField
          label="4. Type of Organisation"
          name="type_organisation"
          value={data.type_organisation}
          onChange={set}
          options={[
            { value: "factory", label: "Factory" },
            { value: "shop", label: "Shop / Establishment" },
            { value: "plantation", label: "Plantation" },
            { value: "mine", label: "Mine" },
            { value: "other", label: "Other" },
          ]}
        />
        <TextField label="5. Articles produced / services rendered" name="articles_details" value={data.articles_details} onChange={set} />
        <YesNoField label="6. Whether seasonal (in case of factory)" name="seasonal" value={data.seasonal} onChange={set} />
        <TextField label="7. Date of opening" name="date_opening" value={data.date_opening} onChange={set} type="date" />
      </div>
    </ArSection>
  );
}

/** Map act key → its form component. */
export const ACT_FORM_COMPONENTS: Record<
  ActKey,
  (props: ActFormProps) => React.ReactElement
> = {
  clra_act: ClraForm,
  license_act: LicenseForm,
  bocwa_act: BocwaForm,
  ismw_act: IsmwForm,
  mtw_act: MtwForm,
  minimum_wages_act: MinimumWagesForm,
  plantation_labour_act: PlantationForm,
  annual_return_bonus: BonusForm,
  maternity_benefit: MaternityForm,
  annual_return_wages: WagesForm,
  payments_gratuity_act: GratuityForm,
  interstatecontractor: InterstateContractorForm,
};
