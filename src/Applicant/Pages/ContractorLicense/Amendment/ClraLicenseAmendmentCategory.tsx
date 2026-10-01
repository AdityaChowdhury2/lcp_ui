import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAmendmentFieldSelectionApi,
  parseClraLicenseRenewalAmendmentCtx,
  saveAmendmentCategoryApi,
} from "@/store/clraLicenseRenewalSlice";
import {
  fetchContractorLicenseAmendmentDetails,
  replaceContractorLicenseAmendmentContext,
  selectContractorLicenseAmendmentDetails,
} from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { navigateToAmendmentApply } from "@/utils/amendmentApplyRoute";

const ClraLicenseAmendmentCategory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector((state: RootState) => selectContractorLicenseAmendmentDetails(state));

  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryOfContractor, setCategoryOfContractor] = useState("");
  const [categoryDesignation, setCategoryDesignation] = useState("");

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
        if (!sel.saved || !sel.selection.category) {
          toast.error('Enable "Category" in field selection first.');
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
    setCategoryOfContractor((p) =>
      p.trim() ? p : details.category_of_contractor != null ? String(details.category_of_contractor) : ""
    );
    setCategoryDesignation((p) =>
      p.trim() ? p : String(details.category_designation ?? "")
    );
  }, [details]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formVSerialNo == null) return;
    try {
      setSaving(true);
      const payload = {
        formVSerialNo,
        categoryOfContractor: categoryOfContractor.trim() ? Number(categoryOfContractor) : undefined,
        categoryDesignation: categoryDesignation.trim() || undefined,
      };
      const res = await saveAmendmentCategoryApi(payload);
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
    <div className="w-full min-h-screen font-sans px-2 md:px-6 py-4 max-w-3xl">
      <button
        type="button"
        onClick={() => navigateToAmendmentApply(navigate, (m) => toast.error(m))}
        className="text-sm text-[#1D5A89] mb-4 hover:underline"
      >
        ← Back to sections
      </button>
      <div className="bg-white rounded border shadow p-6">
        <h1 className="text-lg font-semibold text-[#0B2C48] mb-1">Category / designation</h1>
        <p className="text-sm text-gray-600 mb-4">
          Form‑V <span className="font-mono">{formVSerialNo}</span> — update category and designation details.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Category code"
            value={categoryOfContractor}
            onChange={(e) => setCategoryOfContractor(e.target.value)}
          />
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Category/Designation details"
            value={categoryDesignation}
            onChange={(e) => setCategoryDesignation(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-md bg-[#1D5A89] text-white font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigateToAmendmentApply(navigate, (m) => toast.error(m))}
              className="px-5 py-2 rounded-md border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentCategory;
