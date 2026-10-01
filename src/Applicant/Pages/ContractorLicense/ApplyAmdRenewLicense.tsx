import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";
import {
  checkClraLicenseEligibility,
  selectClraEligibility,
  type ClraEligibilityContext,
  type ClraLicenseRenewalRootState,
} from "@/store/clraLicenseRenewalSlice";
import type { AppDispatch } from "@/store/store";
import { syncAmendmentReduxFromSession } from "@/store/syncAmendmentReduxFromSession";
import {
  buildAmendmentSelectFieldsPath,
  buildRenewalApplyPath,
} from "@/utils/contractorLicenseRouteLinks";

/** Identifiers each flow needs before its application link can be opened. */
const MISSING_CONTEXT_MESSAGE: Record<"renewal" | "amendment", string> = {
  renewal:
    "This licence has no application reference yet, so the renewal application cannot be opened. Please contact the administrator.",
  amendment:
    "This licence has no updated FORM‑V reference yet, so the amendment application cannot be opened. Please contact the administrator.",
};

/** One outcome card in the eligibility result panel. */
const EligibilityCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isEligible: boolean;
  remark?: string;
  actionLabel: string;
  onProceed: () => void;
}> = ({ title, description, icon, isEligible, remark, actionLabel, onProceed }) => (
  <div
    className={`flex flex-col rounded-xl border p-4 transition-colors ${isEligible
      ? "border-emerald-200 bg-emerald-50/60"
      : "border-slate-200 bg-slate-50"
      }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isEligible ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"
          }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-[#0B2C48]">{title}</h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${isEligible
              ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-rose-200"
              }`}
          >
            {isEligible ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {isEligible ? "Eligible" : "Not eligible"}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
      </div>
    </div>

    {remark && (
      <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-[12px] leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-200">
        {remark}
      </p>
    )}

    <Button
      type="button"
      disabled={!isEligible}
      onClick={onProceed}
      className={`mt-4 w-full justify-between px-4 py-2 text-sm font-semibold ${isEligible
        ? "bg-[#1D5A89] text-white hover:bg-[#154970]"
        : "cursor-not-allowed bg-slate-200 text-slate-500 hover:bg-slate-200"
        }`}
    >
      {actionLabel}
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
);

const ApplyAmdRenewLicense: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [refNo, setRefNo] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const { status, error, eligible, eligibilityRemarks, context } = useSelector(
    (state: ClraLicenseRenewalRootState) => selectClraEligibility(state),
  );

  useEffect(() => {
    syncAmendmentReduxFromSession(dispatch);
  }, [dispatch]);

  const showSampleFormV = () => {
    window.open("/pdfs/sample-form-v.pdf", "_blank");
  };

  const handleContinue = async () => {
    const ref = refNo.trim();
    const lic = licenseNo.trim();

    if (!ref) {
      toast.error("Please enter the reference number / FORM‑V serial number.");
      return;
    }
    if (!lic) {
      toast.error("Please enter the license number.");
      return;
    }

    const action = await dispatch(
      checkClraLicenseEligibility({ refNo: ref, licenseNo: lic }),
    );
    if (checkClraLicenseEligibility.rejected.match(action)) {
      toast.error(action.payload ?? "Unable to verify details.");
      return;
    }
    syncAmendmentReduxFromSession(dispatch);
    toast.success("Details verified successfully.");
  };

  const proceed = (target: "renewal" | "amendment", context: ClraEligibilityContext) => {
    const path =
      target === "renewal"
        ? buildRenewalApplyPath(context)
        : buildAmendmentSelectFieldsPath(context);

    if (!path) {
      toast.error(MISSING_CONTEXT_MESSAGE[target]);
      return;
    }
    navigate(path);
  };

  const isChecking = status === "loading";

  return (
    <div className="w-full px-2 py-4 md:px-8">
      {/* Page heading */}
      <div className="mb-5 border-l-4 border-[#52C7EA] pl-3">
        <h1 className="text-lg font-bold uppercase leading-snug tracking-tight text-[#0B2C48] md:text-xl">
          Application for Renewal or Amendment of License
        </h1>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Verify your licence first — we will then show which of the two
          services you can apply for.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ------------------- Eligibility form ------------------- */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 bg-linear-to-r from-[#1D5A89] to-[#2E82B8] px-4 py-3.5 text-white">
              <FileSearch className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-[13px] font-semibold leading-snug">
                Check which service you are eligible to apply for by entering
                your FORM-V number or reference number.
              </p>
            </div>

            <form
              className="space-y-5 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void handleContinue();
              }}
            >
              {/* Reference / Form-V number */}
              <div>
                <label
                  htmlFor="clra-ref-no"
                  className="block text-[13px] font-semibold text-slate-800"
                >
                  Reference number / serial number of FORM-V
                  <span className="ml-0.5 text-rose-600">*</span>
                </label>
                <p className="mt-0.5 text-[11.5px] text-slate-500">
                  Provided to you by the principal employer.
                </p>
                <Input
                  id="clra-ref-no"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="mt-2 h-11 w-full rounded-md border-slate-300 px-3 text-base focus-visible:ring-[#1D5A89]"
                  placeholder="e.g. 123456"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={showSampleFormV}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#1D5A89] hover:text-[#0B2C48] hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Click here to view sample Form V
                </button>
              </div>

              {/* License number */}
              <div>
                <label
                  htmlFor="clra-license-no"
                  className="block text-[13px] font-semibold text-slate-800"
                >
                  License number
                  <span className="ml-0.5 text-rose-600">*</span>
                </label>
                <p className="mt-0.5 text-[11.5px] text-slate-500">
                  As printed on your existing CLRA contractor licence.
                </p>
                <Input
                  id="clra-license-no"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="mt-2 h-11 w-full rounded-md border-slate-300 px-3 text-base focus-visible:ring-[#1D5A89]"
                  placeholder="e.g. WB/CLRA/L/0001"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <Button
                  type="submit"
                  disabled={isChecking}
                  className="bg-[#1D5A89] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#154970]"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Check availability
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {error && !isChecking && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ------------------- Eligibility result ------------------- */}
          {eligible && context && (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-600">
                  Eligibility result
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[#1D5A89]/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1D5A89]">
                    Ref / Form-V: {context.formVSerialNo}
                  </span>
                  {context.legacyLicenseId ? (
                    <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11.5px] font-semibold text-slate-600">
                      License ID: {context.legacyLicenseId}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <EligibilityCard
                  title="Renewal of Licence"
                  description="Extend the validity of your existing licence."
                  icon={<RefreshCw className="h-5 w-5" />}
                  isEligible={eligible.renewal}
                  remark={eligibilityRemarks?.renewal}
                  actionLabel="Proceed to Renewal"
                  onProceed={() => proceed("renewal", context)}
                />

                <EligibilityCard
                  title="Amendment of Licence"
                  description="Correct or update the particulars on your licence."
                  icon={<BadgeCheck className="h-5 w-5" />}
                  isEligible={eligible.amendment}
                  remark={eligibilityRemarks?.amendment}
                  actionLabel="Proceed to Amendment"
                  onProceed={() => proceed("amendment", context)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ------------------- Helper panel ------------------- */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-600">
              Before you start
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                "Keep the FORM-V issued by your principal employer handy — the reference / serial number is printed on it.",
                "Enter the licence number exactly as it appears on your existing CLRA contractor licence.",
                "We check both services at once; only the ones you qualify for can be opened.",
              ].map((line, index) => (
                <li key={index} className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-600">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1D5A89]/10 text-[11px] font-bold text-[#1D5A89]">
                    {index + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={showSampleFormV}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1D5A89] hover:text-[#0B2C48] hover:underline"
              >
                <FileText className="h-4 w-4" />
                View a sample Form V
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ApplyAmdRenewLicense;
