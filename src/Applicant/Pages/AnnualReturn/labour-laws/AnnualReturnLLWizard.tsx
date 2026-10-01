import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ACT_DEFS,
  ActKey,
  ActSelection,
  emptyActSelection,
} from "./arTypes";
import { arBtn, Req } from "./components/arFormPrimitives";
import { annualReturnLLApi } from "./annualReturnLLApi";

/**
 * Step 1 — "Submission of Return under various Labour Laws".
 * The applicant picks the return year and answers Yes/No for each act.
 * Selection is carried to the common form via router state (UI-only, no API yet).
 */
const AnnualReturnLLWizard: React.FC = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  const [year, setYear] = useState<string>("");
  const [acts, setActs] = useState<ActSelection>(emptyActSelection());
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const setAct = (key: ActKey, value: boolean) =>
    setActs((prev) => ({ ...prev, [key]: value }));

  const handleContinue = async () => {
    if (!year) {
      setError("Please select the return year.");
      return;
    }
    if (!Object.values(acts).some(Boolean)) {
      setError("Please select at least one act to submit a return for.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { wizardId } = await annualReturnLLApi.saveWizard(year, acts);
      navigate("/annual-return/form", { state: { year, acts, wizardId } });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded bg-white shadow">
        <div className="bg-[#1D5A89] px-4 py-3">
          <h1 className="text-[16px] font-semibold text-white">
            Submission of Return under various Labour Laws
          </h1>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Year */}
          <div className="mb-6 max-w-xs">
            <label className="mb-1 block text-[13px] font-medium text-gray-700">
              1. Year
              <Req />
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-[13px] outline-none focus:border-[#1D5A89] focus:ring-1 focus:ring-[#1D5A89]"
            >
              <option value="">- Select Year -</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Acts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {ACT_DEFS.map((act, idx) => (
              <div
                key={act.key}
                className="rounded border border-gray-200 bg-slate-50 p-3"
              >
                <p className="mb-2 text-[13px] font-medium text-gray-800">
                  {idx + 2}. {act.wizardLabel}
                  <Req />
                </p>
                <div className="flex gap-6">
                  {[
                    { v: true, l: "Yes" },
                    { v: false, l: "No" },
                  ].map((opt) => (
                    <label
                      key={opt.l}
                      className="flex items-center gap-2 text-[13px]"
                    >
                      <input
                        type="radio"
                        name={act.key}
                        checked={acts[act.key] === opt.v}
                        onChange={() => setAct(act.key, opt.v)}
                        className="h-4 w-4 accent-[#1D5A89]"
                      />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={handleContinue} disabled={saving} className={arBtn}>
              {saving ? "Saving…" : "SAVE & CONTINUE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReturnLLWizard;
