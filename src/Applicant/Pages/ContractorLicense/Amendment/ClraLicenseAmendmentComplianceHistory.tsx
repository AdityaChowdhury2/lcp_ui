import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAmendmentFieldSelectionApi,
  parseClraLicenseRenewalAmendmentCtx,
  saveAmendmentComplianceHistoryApi,
} from "@/store/clraLicenseRenewalSlice";
import {
  fetchContractorLicenseAmendmentDetails,
  replaceContractorLicenseAmendmentContext,
  selectContractorLicenseAmendmentDetails,
} from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { navigateToAmendmentApply } from "@/utils/amendmentApplyRoute";

const ClraLicenseAmendmentComplianceHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector((state: RootState) => selectContractorLicenseAmendmentDetails(state));

  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contractorConvicted, setContractorConvicted] = useState("");
  const [detailsContractorConvicted, setDetailsContractorConvicted] = useState("");
  const [contractorPreviousEmployer, setContractorPreviousEmployer] = useState("");
  const [detailsPreviousEmployer, setDetailsPreviousEmployer] = useState("");
  const [contractorRevoking, setContractorRevoking] = useState("");
  const [detailsContractorRevoking, setDetailsContractorRevoking] = useState("");

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
        if (!sel.saved || !(sel.selection.convicted || sel.selection.pastFive || sel.selection.revoking)) {
          toast.error('Enable "Convicted / Past five years / Revoking" in field selection first.');
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
    setContractorConvicted((p) => (p.trim() ? p : details.contractor_convicted != null ? String(details.contractor_convicted) : ""));
    setDetailsContractorConvicted((p) => (p.trim() ? p : String(details.details_contractor_convicted ?? "")));
    setContractorPreviousEmployer((p) => (p.trim() ? p : details.contractor_previous_employer != null ? String(details.contractor_previous_employer) : ""));
    setDetailsPreviousEmployer((p) => (p.trim() ? p : String(details.details_previous_employer ?? "")));
    setContractorRevoking((p) => (p.trim() ? p : details.contractor_revoking != null ? String(details.contractor_revoking) : ""));
    setDetailsContractorRevoking((p) => (p.trim() ? p : String(details.details_contractor_revoking ?? "")));
  }, [details]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formVSerialNo == null) return;
    try {
      setSaving(true);
      const payload = {
        formVSerialNo,
        contractorConvicted: contractorConvicted.trim() ? Number(contractorConvicted) : undefined,
        detailsContractorConvicted: detailsContractorConvicted.trim() || undefined,
        contractorPreviousEmployer: contractorPreviousEmployer.trim()
          ? Number(contractorPreviousEmployer)
          : undefined,
        detailsPreviousEmployer: detailsPreviousEmployer.trim() || undefined,
        contractorRevoking: contractorRevoking.trim() ? Number(contractorRevoking) : undefined,
        detailsContractorRevoking: detailsContractorRevoking.trim() || undefined,
      };
      const res = await saveAmendmentComplianceHistoryApi(payload);
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
        <h1 className="text-lg font-semibold text-[#0B2C48] mb-1">Compliance history details</h1>
        <p className="text-sm text-gray-600 mb-4">
          Form‑V <span className="font-mono">{formVSerialNo}</span> — update conviction, previous-employer and revocation history.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Contractor convicted (0/1)" value={contractorConvicted} onChange={(e) => setContractorConvicted(e.target.value)} />
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="Conviction details" value={detailsContractorConvicted} onChange={(e) => setDetailsContractorConvicted(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Worked in other establishments in last 5 years (0/1)" value={contractorPreviousEmployer} onChange={(e) => setContractorPreviousEmployer(e.target.value)} />
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="Previous employer details" value={detailsPreviousEmployer} onChange={(e) => setDetailsPreviousEmployer(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Earlier revoking/suspension/security forfeiture (0/1)" value={contractorRevoking} onChange={(e) => setContractorRevoking(e.target.value)} />
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} placeholder="Revoking details" value={detailsContractorRevoking} onChange={(e) => setDetailsContractorRevoking(e.target.value)} />
          </div>
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

export default ClraLicenseAmendmentComplianceHistory;
