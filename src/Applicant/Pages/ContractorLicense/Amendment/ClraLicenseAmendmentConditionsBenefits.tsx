import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAmendmentFieldSelectionApi,
  parseClraLicenseRenewalAmendmentCtx,
  saveAmendmentConditionsBenefitsApi,
} from "@/store/clraLicenseRenewalSlice";
import {
  fetchContractorLicenseAmendmentDetails,
  replaceContractorLicenseAmendmentContext,
  selectContractorLicenseAmendmentDetails,
} from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { navigateToAmendmentApply } from "@/utils/amendmentApplyRoute";

const ClraLicenseAmendmentConditionsBenefits: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector((state: RootState) => selectContractorLicenseAmendmentDetails(state));

  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weeklyHoliday, setWeeklyHoliday] = useState("");
  const [noHoliday, setNoHoliday] = useState("");
  const [holidayWages, setHolidayWages] = useState("");
  const [annualLeaveNo, setAnnualLeaveNo] = useState("");
  const [casualLeaveNo, setCasualLeaveNo] = useState("");
  const [sickLeaveNo, setSickLeaveNo] = useState("");
  const [maternityLeaveNo, setMaternityLeaveNo] = useState("");
  const [earnedLeaveNo, setEarnedLeaveNo] = useState("");
  const [otherLeaveNo, setOtherLeaveNo] = useState("");
  const [specialBenifites, setSpecialBenifites] = useState("");
  const [stateInsurance, setStateInsurance] = useState("");
  const [miscellaneousProvisions, setMiscellaneousProvisions] = useState("");

  useEffect(() => {
    const ctx = parseClraLicenseRenewalAmendmentCtx();
    if (!ctx?.formVSerialNo) {
      toast.error("Amendment context not found.");
      setLoading(false);
      return;
    }
    dispatch(replaceContractorLicenseAmendmentContext(ctx));
    setFormVSerialNo(ctx.formVSerialNo);

    let cancelled = false;
    (async () => {
      try {
        const sel = await getAmendmentFieldSelectionApi(ctx.formVSerialNo);
        if (cancelled) return;
        if (
          !sel.saved ||
          !(sel.selection.leaveDetails || sel.selection.specialBenifites || sel.selection.stateInsurance || sel.selection.miscellaneous)
        ) {
          toast.error('Enable "Leave/Benefits/ESI/Miscellaneous" in field selection first.');
          setAllowed(false);
          return;
        }
        setAllowed(true);
        await dispatch(fetchContractorLicenseAmendmentDetails({ formVSerialNo: ctx.formVSerialNo }));
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Unable to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!details) return;
    setWeeklyHoliday((p) => (p.trim() ? p : details.weekly_holiday != null ? String(details.weekly_holiday) : ""));
    setNoHoliday((p) => (p.trim() ? p : String(details.no_holiday ?? "")));
    setHolidayWages((p) => (p.trim() ? p : details.holiday_wages != null ? String(details.holiday_wages) : ""));
    setAnnualLeaveNo((p) => (p.trim() ? p : details.annual_leave_no != null ? String(details.annual_leave_no) : ""));
    setCasualLeaveNo((p) => (p.trim() ? p : details.casual_leave_no != null ? String(details.casual_leave_no) : ""));
    setSickLeaveNo((p) => (p.trim() ? p : details.sick_leave_no != null ? String(details.sick_leave_no) : ""));
    setMaternityLeaveNo((p) => (p.trim() ? p : details.maternity_leave_no != null ? String(details.maternity_leave_no) : ""));
    setEarnedLeaveNo((p) => (p.trim() ? p : details.earned_leave_no != null ? String(details.earned_leave_no) : ""));
    setOtherLeaveNo((p) => (p.trim() ? p : details.other_leave_no != null ? String(details.other_leave_no) : ""));
    setSpecialBenifites((p) => (p.trim() ? p : String(details.special_benifites ?? "")));
    setStateInsurance((p) => (p.trim() ? p : String(details.state_insurance ?? "")));
    setMiscellaneousProvisions((p) => (p.trim() ? p : String(details.miscellaneous_provisions ?? "")));
  }, [details]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formVSerialNo == null) return;
    try {
      setSaving(true);
      const payload = {
        formVSerialNo,
        weeklyHoliday: weeklyHoliday.trim() ? Number(weeklyHoliday) : undefined,
        noHoliday: noHoliday.trim() || undefined,
        holidayWages: holidayWages.trim() ? Number(holidayWages) : undefined,
        annualLeaveNo: annualLeaveNo.trim() ? Number(annualLeaveNo) : undefined,
        casualLeaveNo: casualLeaveNo.trim() ? Number(casualLeaveNo) : undefined,
        sickLeaveNo: sickLeaveNo.trim() ? Number(sickLeaveNo) : undefined,
        maternityLeaveNo: maternityLeaveNo.trim() ? Number(maternityLeaveNo) : undefined,
        earnedLeaveNo: earnedLeaveNo.trim() ? Number(earnedLeaveNo) : undefined,
        otherLeaveNo: otherLeaveNo.trim() ? Number(otherLeaveNo) : undefined,
        specialBenifites: specialBenifites.trim() || undefined,
        stateInsurance: stateInsurance.trim() || undefined,
        miscellaneousProvisions: miscellaneousProvisions.trim() || undefined,
      };
      const res = await saveAmendmentConditionsBenefitsApi(payload);
      toast.success(res.message);
      navigateToAmendmentApply(navigate, (m) => toast.error(m));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="w-full p-8 text-sm text-gray-600">Loading...</div>;
  if (!allowed || formVSerialNo == null) {
    return (
      <div className="w-full p-6">
        <button
          type="button"
          className="text-sm text-blue-700 underline"
          onClick={() => navigateToAmendmentApply(navigate, (m) => toast.error(m))}
        >
          ← Back to amendment sections
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans px-2 md:px-6 py-4 max-w-4xl">
      <button
        type="button"
        onClick={() => navigateToAmendmentApply(navigate, (m) => toast.error(m))}
        className="text-sm text-[#1D5A89] mb-4 hover:underline"
      >
        ← Back to sections
      </button>
      <div className="bg-white rounded border shadow p-6">
        <h1 className="text-lg font-semibold text-[#0B2C48] mb-1">Leave, conditions and benefits</h1>
        <p className="text-sm text-gray-600 mb-4">
          Form‑V <span className="font-mono">{formVSerialNo}</span> — update leave conditions and statutory benefit details.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Weekly holiday (0/1)" value={weeklyHoliday} onChange={(e) => setWeeklyHoliday(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="No holiday codes (e.g. 1,7)" value={noHoliday} onChange={(e) => setNoHoliday(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Holiday wages" value={holidayWages} onChange={(e) => setHolidayWages(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Annual leave no." value={annualLeaveNo} onChange={(e) => setAnnualLeaveNo(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Casual leave no." value={casualLeaveNo} onChange={(e) => setCasualLeaveNo(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Sick leave no." value={sickLeaveNo} onChange={(e) => setSickLeaveNo(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Maternity leave no." value={maternityLeaveNo} onChange={(e) => setMaternityLeaveNo(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Earned leave no." value={earnedLeaveNo} onChange={(e) => setEarnedLeaveNo(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Other leave no." value={otherLeaveNo} onChange={(e) => setOtherLeaveNo(e.target.value)} />
          </div>
          <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="Special benefits" value={specialBenifites} onChange={(e) => setSpecialBenifites(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="State insurance details" value={stateInsurance} onChange={(e) => setStateInsurance(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="Miscellaneous provisions" value={miscellaneousProvisions} onChange={(e) => setMiscellaneousProvisions(e.target.value)} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-md bg-[#1D5A89] text-white font-medium disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigateToAmendmentApply(navigate, (m) => toast.error(m))} className="px-5 py-2 rounded-md border border-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentConditionsBenefits;
