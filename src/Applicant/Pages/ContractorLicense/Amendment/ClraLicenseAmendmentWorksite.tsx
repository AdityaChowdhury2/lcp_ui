import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

const toNum = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatFee = (value: number | string): string => toNum(value).toFixed(2);

const ReadonlyFieldWithTick = ({
  id,
  value,
  emphasize,
}: {
  id: string;
  value: string;
  emphasize?: boolean;
}) => (
  <div className="relative">
    <input
      id={id}
      className={`w-full border rounded px-3 py-2 pr-8 text-sm bg-gray-50 ${
        emphasize ? "font-semibold text-[#1d5f8d]" : ""
      }`}
      value={value}
      readOnly
    />
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600" aria-hidden>
      ✓
    </span>
  </div>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-xs leading-snug text-gray-500">{children}</p>
);

/** License fee slab — same bands as backend `legacyApplicableAmendmentFees`. */
const getApplicableAmendmentFee = (labour: number): number => {
  const n = Math.floor(toNum(labour));
  if (n <= 0) return 0;
  if (n <= 20) return 50;
  if (n <= 50) return 125;
  if (n <= 100) return 250;
  if (n <= 200) return 500;
  if (n <= 400) return 1000;
  return 1250;
};

/** Security = workmen × ₹25 (co-operative) or ₹100 (others). */
const getApplicableSecurityFee = (labour: number, isCooperative: number): number => {
  const n = Math.floor(toNum(labour));
  if (n <= 0) return 0;
  return Number(isCooperative) === 1 ? n * 25 : n * 100;
};

/**
 * Payable license fee = applicable slab − highest fee already paid.
 * If the licence is already in the top slab (> 400 workmen), nothing more is due.
 */
const getPayableAmendmentFee = (
  applicableFee: number,
  alreadyPaidFee: number,
  previousLabour: number,
): number => {
  if (previousLabour > 400) return 0;
  if (alreadyPaidFee >= applicableFee) return 0;
  return applicableFee - alreadyPaidFee;
};

/**
 * Payable security = extra deposit for added workmen, plus any outstanding due.
 * If applicable ≤ already deposited, only due (if any) is collected.
 */
const getPayableSecurityFee = (
  applicableSecurity: number,
  alreadyPaidSecurity: number,
  dueSecurity: number,
): number => {
  const due = toNum(dueSecurity);
  if (applicableSecurity > alreadyPaidSecurity) {
    return applicableSecurity - alreadyPaidSecurity + (due !== 0 ? due : 0);
  }
  return due !== 0 ? due : 0;
};

/** Highest licence fee already paid, never less than the slab of the issued licence. */
const resolveAlreadyPaidLicenseFee = (draft: any, baselineLabour: number): number =>
  Math.max(
    toNum(draft?.previous_highest_deposit_fees),
    toNum(draft?.license_renewal_fees),
    toNum(draft?.license_renewal_fees_dopsit),
    getApplicableAmendmentFee(baselineLabour),
  );

/** Highest security already deposited, never less than workmen × rate on the issued licence. */
const resolveAlreadyPaidSecurity = (
  draft: any,
  baselineLabour: number,
  isCooperative: number,
): number =>
  Math.max(
    toNum(draft?.previous_highest_security),
    toNum(draft?.deposited_max_security_fees),
    toNum(draft?.amount_of_security_deposit),
    toNum(draft?.license_renewal_security_fees),
    getApplicableSecurityFee(baselineLabour, isCooperative),
  );

const ClraLicenseAmendmentWorksite: React.FC = () => {
  const navigate = useNavigate();

  const [details, setDetails] = useState<any>(null);
  const [canEditLabour, setCanEditLabour] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [worksiteAddressLine, setWorksiteAddressLine] = useState("");
  const [isCoparative, setIsCoparative] = useState<"0" | "1">("0");
  const [maxLabour, setMaxLabour] = useState("");

  const [initialLabour, setInitialLabour] = useState(0);
  const [peMaxLabour, setPeMaxLabour] = useState(0);
  const [alreadyPaidLicenseFees, setAlreadyPaidLicenseFees] = useState(0);
  const [alreadyPaidSecurityFees, setAlreadyPaidSecurityFees] = useState(0);
  const [dueSecurityFees, setDueSecurityFees] = useState(0);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const ctx = JSON.parse(
          sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX") || "{}"
        );

        const formVNo = ctx.formVSerialNo;
        const updatedFormVNo = ctx.updatedFormV;
        const amendId = ctx.amendmentDraftId;

        const res = await fetch(
          `${API_BASE}contractor-license/amendment/details-new?formVNo=${formVNo}&updatedFormVNo=${updatedFormVNo}&amendId=${amendId}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        const json = await res.json();

        if (!json?.status) {
          toast.error(json?.message || "Failed to load details");
          return;
        }

        const amendmentDraft = json.data?.amendmentDraft;
        const baselineLabour = toNum(json.data?.baselineMaxLabour);
        const peMax = toNum(
          json.data?.contractorInfoData?.contractor_max_no_of_labours_on_any_day
        );
        const draftCoop = toNum(amendmentDraft?.is_coparative) === 1 ? 1 : 0;
        const draftLabour = toNum(amendmentDraft?.max_of_contract_labour);

        setDetails(json.data);
        setWorksiteAddressLine(amendmentDraft?.worksite_address_line ?? "");
        setIsCoparative(draftCoop === 1 ? "1" : "0");
        setInitialLabour(baselineLabour);
        setPeMaxLabour(peMax);
        setMaxLabour(String(draftLabour || baselineLabour || ""));
        setDueSecurityFees(toNum(amendmentDraft?.due_security_fees));
        setAlreadyPaidLicenseFees(
          resolveAlreadyPaidLicenseFee(amendmentDraft, baselineLabour)
        );
        setAlreadyPaidSecurityFees(
          resolveAlreadyPaidSecurity(amendmentDraft, baselineLabour, draftCoop)
        );
        setCanEditLabour(true);
        setLoading(false);
      } catch {
        toast.error("Unable to load amendment details");
      }
    };

    loadDetails();
  }, []);

  const labour = Math.floor(toNum(maxLabour));
  const coop = Number(isCoparative);

  const applicableAmendmentFee =
    labour > 0 ? getApplicableAmendmentFee(labour) : 0;
  const applicableSecurityFees =
    labour > 0 ? getApplicableSecurityFee(labour, coop) : 0;

  const payableAmendmentFees =
    labour > 0
      ? getPayableAmendmentFee(
          applicableAmendmentFee,
          alreadyPaidLicenseFees,
          initialLabour,
        )
      : 0;

  const payableAmendmentSecurityFees =
    labour > 0
      ? getPayableSecurityFee(
          applicableSecurityFees,
          alreadyPaidSecurityFees,
          dueSecurityFees,
        )
      : 0;

  const totalPayable = payableAmendmentFees + payableAmendmentSecurityFees;
  const labourBelowLicense = labour > 0 && labour < initialLabour;
  const labourAbovePe = peMaxLabour > 0 && labour > peMaxLabour;
  const labourInvalid = labourBelowLicense || labourAbovePe;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (labour < initialLabour) {
      toast.error(
        "You can't decrease Number of Max Contract Labour on any day than mentioned in your license"
      );
      return;
    }

    if (peMaxLabour > 0 && labour > peMaxLabour) {
      toast.error(
        `Max Contract Labour on any day cannot be greater than ${peMaxLabour} as mentioned in Form-V.`
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: details?.amendmentDraft?.id,
        flag: "FORM_2",
        contractorMaxNoOfLaboursOnAnyDay: labour,
        applicableSecFees: applicableSecurityFees,
        applicableAmendFees: applicableAmendmentFee,
        payableAmendSecFees: payableAmendmentSecurityFees,
        payableAmendFees: payableAmendmentFees,
        dueSecFees: dueSecurityFees,
      };

      const response = await fetch(
        `${API_BASE}contractor-license/amendment/edit-draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Failed to save worksite details");
        return;
      }

      toast.success(result?.message || "Worksite details saved successfully");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Unable to save worksite details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="w-full p-8 text-sm text-gray-600">Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#ececec] font-sans px-2 md:px-6 py-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-[#1D5A89] mb-4 hover:underline"
      >
        ← Back to sections
      </button>

      <div className="mx-auto w-full max-w-[1200px] border border-gray-300 bg-white shadow-sm">
        <div className="border-b border-gray-300 bg-[#1d5f8d] px-4 py-2 text-center text-sm font-semibold uppercase text-white">
          Worksite and Contract Labour Details
        </div>
        <div className="px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="worksite-address-line" className="mb-1 block text-sm font-medium text-gray-800">
                  1. Worksite Address Line
                </label>
                <textarea
                  id="worksite-address-line"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                  value={worksiteAddressLine}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">2. Co-operative Society</label>
                <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="is-coparative-worksite"
                        checked={isCoparative === "1"}
                        readOnly
                        disabled
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="is-coparative-worksite"
                        checked={isCoparative === "0"}
                        readOnly
                        disabled
                      />
                      No
                    </label>
                  </div>
                </div>
                <FieldHint>
                  Security is ₹{isCoparative === "1" ? "25" : "100"} per workman
                  {isCoparative === "1" ? " (co-operative society)" : ""}.
                </FieldHint>
              </div>
              <div>
                <label htmlFor="max-contract-labour" className="mb-1 block text-sm font-medium text-gray-800">
                  3. Max Contract Labour on any day
                </label>
                <input
                  id="max-contract-labour"
                  type="number"
                  min={initialLabour || 1}
                  max={peMaxLabour > 0 ? peMaxLabour : undefined}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={maxLabour}
                  onChange={(e) => setMaxLabour(e.target.value)}
                  disabled={!canEditLabour}
                />
                {/* <FieldHint>
                  Current licence: {initialLabour || 0} workmen. You cannot reduce this number
                  {peMaxLabour > 0
                    ? `, and you cannot exceed ${peMaxLabour} workmen as mentioned in Form-V.`
                    : "."}
                </FieldHint> */}
                {labourBelowLicense ? (
                  <p className="mt-1 text-xs text-red-600">
                    Enter at least {initialLabour} workmen as on your licence.
                  </p>
                ) : null}
                {labourAbovePe ? (
                  <p className="mt-1 text-xs text-red-600">
                    Enter at most {peMaxLabour} workmen as allowed in Form-V.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border border-gray-200 bg-[#f7f9fb]">
              <div className="border-b border-gray-200 bg-[#e8eef3] px-3 py-2">
                <h2 className="text-sm font-semibold text-gray-800">Fee breakdown</h2>
              </div>
              <div className="grid gap-4 p-3 md:grid-cols-2">
                <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
                  <h3 className="text-sm font-semibold text-[#1d5f8d]">
                    License amendment fee
                  </h3>
                  <div>
                    <label htmlFor="applicable-amendment-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Applicable amendment fee
                    </label>
                    <ReadonlyFieldWithTick
                      id="applicable-amendment-fees"
                      value={formatFee(applicableAmendmentFee)}
                    />
                    <FieldHint>Slab fee for the labour count you entered.</FieldHint>
                  </div>
                  <div>
                    <label htmlFor="already-paid-license-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Already paid (highest licence fee)
                    </label>
                    <ReadonlyFieldWithTick
                      id="already-paid-license-fees"
                      value={formatFee(alreadyPaidLicenseFees)}
                    />
                    <FieldHint>
                      Highest licence fee already paid on this licence / later amendments.
                    </FieldHint>
                  </div>
                  <div>
                    <label htmlFor="payable-amendment-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Payable amendment fee
                    </label>
                    <ReadonlyFieldWithTick
                      id="payable-amendment-fees"
                      value={formatFee(payableAmendmentFees)}
                      emphasize
                    />
                    <FieldHint>Applicable − already paid (₹0 if you stay in the same slab).</FieldHint>
                  </div>
                </div>

                <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
                  <h3 className="text-sm font-semibold text-[#1d5f8d]">
                    Security deposit
                  </h3>
                  <div>
                    <label htmlFor="applicable-security-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Applicable security fees
                    </label>
                    <ReadonlyFieldWithTick
                      id="applicable-security-fees"
                      value={formatFee(applicableSecurityFees)}
                    />
                    <FieldHint>
                      {labour || 0} workmen × ₹{isCoparative === "1" ? "25" : "100"}.
                    </FieldHint>
                  </div>
                  <div>
                    <label htmlFor="already-paid-security-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Already paid (highest security deposited)
                    </label>
                    <ReadonlyFieldWithTick
                      id="already-paid-security-fees"
                      value={formatFee(alreadyPaidSecurityFees)}
                    />
                    <FieldHint>
                      Highest security already deposited on this licence / later amendments.
                    </FieldHint>
                  </div>
                  <div>
                    <label htmlFor="due-security-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Due security fees
                    </label>
                    <ReadonlyFieldWithTick
                      id="due-security-fees"
                      value={formatFee(dueSecurityFees)}
                    />
                    <FieldHint>Outstanding security, if any, added to what you pay now.</FieldHint>
                  </div>
                  <div>
                    <label htmlFor="payable-amendment-security-fees" className="mb-1 block text-sm font-medium text-gray-800">
                      Payable amendment security fees
                    </label>
                    <ReadonlyFieldWithTick
                      id="payable-amendment-security-fees"
                      value={formatFee(payableAmendmentSecurityFees)}
                      emphasize
                    />
                    <FieldHint>Applicable − already paid, plus due security.</FieldHint>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-3">
                <span className="text-sm font-medium text-gray-800">Total payable now</span>
                <span className="text-base font-semibold text-[#1d5f8d]">
                  ₹ {formatFee(totalPayable)}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-6 py-2 text-sm font-semibold text-white hover:bg-[#286090]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving || !canEditLabour || labourInvalid}
                className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-8 py-2 text-sm font-semibold text-white hover:bg-[#286090] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentWorksite;
