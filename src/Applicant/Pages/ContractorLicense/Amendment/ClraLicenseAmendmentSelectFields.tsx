import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { formatLegacyBannerDate } from "./amendment-apply";
import {
  buildAmendmentDetailsPath,
  parseAmendmentRouteParams,
} from "@/utils/contractorLicenseRouteLinks";
import { persistAmendmentApplyContext } from "@/utils/amendmentApplyRoute";
import {
  defaultAmendmentSelection,
  fetchContractorLicenseRenewalPreviewApi,
  getAmendmentFieldSelectionApi,
  saveFieldsAndAmendDraftApi,
  type AmendmentFieldSelectionPayload,
} from "@/store/clraLicenseRenewalSlice";

type SelectionState = Omit<AmendmentFieldSelectionPayload, "formVSerialNo">;

type RenewalPreview = {
  license?: {
    licenseNumber?: string | null;
    licenseDate?: string | null;
    validUpto?: string | null;
  };
};

const PAGE_TITLE = "APPLICATION FOR AMMENDMENT OF LICENSE UNDER THE CONTRACT LABOUR (R&A) ACT, 1970";

const FIELD_OPTIONS: { key: keyof SelectionState; label: string }[] = [
  // { key: "worksiteAddress", label: "1.Address Line1 of the worksite" },
  { key: "contrctorDetails", label: "1.Address of the contractor" },
  {
    key: "managerDetails",
    label: "2.Name and address of the agent or manager of contractor at worksite",
  },
  {
    key: "maxLabour",
    label: "3.Maximum number of Contrct Labour proposed to be employed in the establishment on any day",
  },
  {
    key: "category",
    label: "4.Category/designation/nomenclature of the contrctor labour, namely,filtter,welder,carpanter,mazdor etc.",
  },
  {
    key: "rateWages",
    label: "5.(a).Rate of wages,DA and other cash benefites paid,to be paid to each category(i.e.(a):Unskilled(b)Semi-skilled(c)Skilled(d)Highly-Skilledetc.) of contrct labour",
  },
  {
    key: "workWages",
    label: "5.(b).Daily Hours of work, overtime,overtime wages and spread over time",
  },
  {
    key: "leaveDetails",
    label: "5.(c).Other condition of service like leave (annual leave,casual leave,sick leave, maternity leave etc) holiday etc. of the contrct labour",
  },
  {
    key: "specialBenifites",
    label: "6.Special benifites provide, if any",
  },
  {
    key: "stateInsurance",
    label: "7.Contribution made under the Employees State Insurance Act,1984",
  },
  {
    key: "miscellaneous",
    label: "8.Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952",
  },
  {
    key: "convicted",
    label: "9.Whether the contrctor was convicted of any offence within the preceding five yeras. If so, give details",
  },
];

function hasAnySelection(sel: SelectionState): boolean {
  return Object.values(sel).some(Boolean);
}

const ClraLicenseAmendmentSelectFields: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useMemo(() => parseAmendmentRouteParams(searchParams), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState<SelectionState>(defaultAmendmentSelection());
  const [preview, setPreview] = useState<RenewalPreview | null>(null);

  useEffect(() => {
    if (!params) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [fieldSelection, previewData] = await Promise.all([
          getAmendmentFieldSelectionApi(params.formVSerialNo),
          fetchContractorLicenseRenewalPreviewApi({
            formVSerialNo: params.formVSerialNo,
            licenseId: params.licenseId,
            updatedFormV: params.updatedFormV,
          }),
        ]);

        if (cancelled) return;
        setSel(fieldSelection.selection);
        setPreview(previewData as RenewalPreview);

      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Unable to load amendment page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const toggle = (key: keyof SelectionState) => {
    setSel((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params) return;

    if (!hasAnySelection(sel)) {
      toast.error("Select at least one field group to amend.");
      return;
    }

    try {
      setSaving(true);
      const res = await saveFieldsAndAmendDraftApi({
        licenseId: params.licenseId,
        orgFormVno: params.formVSerialNo,
        updatedFormV: params.updatedFormV,
        fields: sel,
      });
      toast.success(res.message);

      persistAmendmentApplyContext({
        formVSerialNo: params.formVSerialNo,
        legacyLicenseId: params.licenseId,
        updatedFormV: params.updatedFormV,
        amendmentDraftId: res.amendmentDraftId,
        tagFlag: "A",
      });

      const applyPath = buildAmendmentDetailsPath(params);
      if (!applyPath) {
        toast.error("Could not build amendment application link.");
        navigate("/license-renewal-amendment-list");
        return;
      }

      navigate(applyPath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!params && !loading) {
    return (
      <div className="w-full p-6">
        <p className="mb-4 text-sm text-red-700">
          Missing or invalid link. Open this page from the eligibility check after selecting Proceed to Amendment.
        </p>
        <button
          type="button"
          className="rounded bg-gray-200 px-4 py-2"
          onClick={() => navigate("/renewal/old_renewal")}
        >
          Back to eligibility
        </button>
      </div>
    );
  }

  const license = preview?.license;

  return (
    <div className="min-h-screen w-full bg-[#ececec] px-2 py-4 font-sans md:px-6">
      <div className="mx-auto max-w-[920px] border border-gray-300 bg-white shadow-sm">
        <h1 className="border-b border-gray-300 px-4 py-3 text-center text-sm font-bold uppercase leading-snug text-black md:text-base">
          {PAGE_TITLE}
        </h1>

        <div className="border-b border-gray-300 bg-[#1a3a5c] px-4 py-4 text-center text-sm text-white md:text-base">
          {loading ? (
            <p className="text-[#d3e1ec]">Loading licence details…</p>
          ) : (
            <>
              <div>
                <span>FORM-V/REFERENCE NUMBER: </span>
                <span className="font-semibold text-[#d3e1ec]">
                  {params ? `00${params.formVSerialNo}` : "—"}
                </span>
              </div>
              <div className="mt-1">
                <span>LICENSE NUMBER: </span>
                <span className="font-semibold text-[#d3e1ec]">
                  {license?.licenseNumber ?? "—"}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>
                  ISSUE DATE:{" "}
                  <span className="font-semibold text-[#d3e1ec]">
                    {formatLegacyBannerDate(license?.licenseDate)}
                  </span>
                </span>
                <span className="hidden sm:inline" aria-hidden>
                  &nbsp;&nbsp;
                </span>
                <span>
                  VALID UPTO:{" "}
                  <span className="font-semibold text-[#d3e1ec]">
                    {formatLegacyBannerDate(license?.validUpto)}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-600">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="border-t-0 px-4 pb-6 pt-4 md:px-6">
            <p className="mb-3 text-sm font-medium text-gray-900">
              Note : Tick the fields which is to be amended by the Contractor.
            </p>

            <div className="overflow-hidden rounded-sm border border-gray-300">
              {FIELD_OPTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 border-b border-gray-200 bg-white px-3 py-2.5 hover:bg-gray-50/80"
                >
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0"
                    checked={sel[key]}
                    onChange={() => toggle(key)}
                  />
                  <span className="text-sm leading-snug text-gray-900">{label}</span>
                </label>
              ))}
            </div>

            <p className="mt-4 text-sm font-semibold text-red-600">
              Note:- The Principal Employer may be requested to amend the contrctor list in his certificate of
              registration in case of change of Name of the contractor
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/license-renewal-amendment-list")}
                className="rounded-sm border border-gray-400 bg-[#f5f5f5] px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-sm border border-[#1D5A89] bg-[#1D5A89] px-8 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Applying…" : "Apply"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentSelectFields;
