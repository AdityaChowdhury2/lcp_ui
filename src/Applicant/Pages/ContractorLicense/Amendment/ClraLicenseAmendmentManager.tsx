import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  getAmendmentFieldSelectionApi,
  parseClraLicenseRenewalAmendmentCtx,
  saveAmendmentManagerApi,
} from "@/store/clraLicenseRenewalSlice";
import {
  fetchContractorLicenseAmendmentDetails,
  replaceContractorLicenseAmendmentContext,
  selectContractorLicenseAmendmentDetails,
} from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { navigateToAmendmentApply } from "@/utils/amendmentApplyRoute";

type ManagerFormValues = {
  nameOfAgent: string;
  addressOfManager: string;
  contractorManagerDist: string;
  contractorManagerSubdivision: string;
  contractorManagerPs: string;
  managerPin: string;
};

const ClraLicenseAmendmentManager: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector((state: RootState) => selectContractorLicenseAmendmentDetails(state));

  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, getValues, setValue } = useForm<ManagerFormValues>({
    defaultValues: {
      nameOfAgent: "",
      addressOfManager: "",
      contractorManagerDist: "",
      contractorManagerSubdivision: "",
      contractorManagerPs: "",
      managerPin: "",
    },
  });

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
        if (!sel.saved || !sel.selection.managerDetails) {
          toast.error('Enable "Manager details" in field selection first.');
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
    const name = String(details.name_of_agent ?? details.name_of_manager ?? details.manager_name ?? "");
    if (!getValues("nameOfAgent").trim() && name.trim()) {
      setValue("nameOfAgent", name);
    }
    const address = String(details.address_of_manager ?? "");
    if (!getValues("addressOfManager").trim() && address.trim()) {
      setValue("addressOfManager", address);
    }
    const dist = String(details.contractor_manager_dist ?? "");
    if (!getValues("contractorManagerDist").trim() && dist.trim()) {
      setValue("contractorManagerDist", dist);
    }
    const subdivision = details.contractor_manager_subdivision != null ? String(details.contractor_manager_subdivision) : "";
    if (!getValues("contractorManagerSubdivision").trim() && subdivision.trim()) {
      setValue("contractorManagerSubdivision", subdivision);
    }
    const ps = String(details.contractor_manager_ps ?? "");
    if (!getValues("contractorManagerPs").trim() && ps.trim()) {
      setValue("contractorManagerPs", ps);
    }
    const pin = details.manager_pin != null ? String(details.manager_pin) : "";
    if (!getValues("managerPin").trim() && pin.trim()) {
      setValue("managerPin", pin);
    }
  }, [details, getValues, setValue]);

  const onSubmit = async (values: ManagerFormValues) => {
    if (formVSerialNo == null) return;
    try {
      setSaving(true);
      const payload = {
        formVSerialNo,
        nameOfAgent: values.nameOfAgent.trim() || undefined,
        addressOfManager: values.addressOfManager.trim() || undefined,
        contractorManagerDist: values.contractorManagerDist.trim() || undefined,
        contractorManagerSubdivision: values.contractorManagerSubdivision.trim()
          ? Number(values.contractorManagerSubdivision)
          : undefined,
        contractorManagerPs: values.contractorManagerPs.trim() || undefined,
        managerPin: values.managerPin.trim() ? Number(values.managerPin) : undefined,
      };
      const res = await saveAmendmentManagerApi(payload);
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
        <h1 className="text-lg font-semibold text-[#0B2C48] mb-1">Manager details</h1>
        <p className="text-sm text-gray-600 mb-4">
          Form‑V <span className="font-mono">{formVSerialNo}</span> — update manager details.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Agent/Manager name"
            {...register("nameOfAgent")}
          />
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Manager address"
            {...register("addressOfManager")}
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Manager district"
            {...register("contractorManagerDist")}
          />
          <div className="grid md:grid-cols-3 gap-3">
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Subdivision code"
              {...register("contractorManagerSubdivision")}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Police station"
              {...register("contractorManagerPs")}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Manager PIN"
              {...register("managerPin")}
            />
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

export default ClraLicenseAmendmentManager;
