import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

type Option = { value: string; label: string };

type ContractorFormValues = {
  nameOfContractor: string;
  addressOfContractor: string;
  contractorDist: string;
  contractorSubdivision: string;
  contractorAreatype: string;
  contractorNameAreatype: string;
  contractorVillWard: string;
  contractorPs: string;
  contractorPin: string;
  contractorState: string;
  contrcatorCountry: string;
  fatherContarctorName: string;
  dobContractor: string;
  ageContractor: string;
  categoryOfContractor: string;
};

type ContractorFieldLocks = {
  name: boolean;
  father: boolean;
  categoryDobAge: boolean;
  addressLocation: boolean;
};

const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

function toIntOrUndefined(value: string): number | undefined {
  const v = value.trim();
  if (!/^\d+$/.test(v)) return undefined;
  return Number(v);
}

function normalizePin(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function isValidPin(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

const DEFAULT_FORM_VALUES: ContractorFormValues = {
  nameOfContractor: "",
  addressOfContractor: "",
  contractorDist: "",
  contractorSubdivision: "",
  contractorAreatype: "",
  contractorNameAreatype: "",
  contractorVillWard: "",
  contractorPs: "",
  contractorPin: "",
  contractorState: "",
  contrcatorCountry: "",
  fatherContarctorName: "",
  dobContractor: "",
  ageContractor: "",
  categoryOfContractor: "",
};

function toStr(value: unknown): string {
  return value == null ? "" : String(value);
}

function normalizeDateInput(value: unknown): string {
  const raw = toStr(value);
  return raw.includes("T") ? raw.slice(0, 10) : raw;
}

function calculateAgeFromDate(value: string): string {
  if (!value) return "";
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "";
}

async function fetchJson(url: string): Promise<unknown> {
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const ClraLicenseAmendmentContractor: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [details, setDetails] = useState<any>(null);
  const [fetchedData, setFetchedData] = useState<Partial<ContractorFormValues>>({});
  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ContractorFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const categoryOfContractor = watch("categoryOfContractor");
  // const contractorDist = watch("contractorDist");
  // const contractorSubdivision = watch("contractorSubdivision");
  // const contractorAreatype = watch("contractorAreatype");
  // const contractorNameAreatype = watch("contractorNameAreatype");
  // const contrcatorCountry = watch("contrcatorCountry");
  const [contractorDist, setContractorDist] = useState("");
  const [contractorSubdivision, setContractorSubdivision] = useState("");
  const [contractorAreatype, setContractorAreatype] = useState("");
  const [contractorNameAreatype, setContractorNameAreatype] = useState("");
  const [contrcatorCountry, setContrcatorCountry] = useState("");
  const [contractorPs, setContractorPs] = useState("");
  const [contractorVillWard, setContractorVillWard] = useState("");
  const dobContractor = watch("dobContractor");
  const isCompanyCategory = categoryOfContractor === "1";
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [districtOptions, setDistrictOptions] = useState<Option[]>([]);
  const [subdivisionOptions, setSubdivisionOptions] = useState<Option[]>([]);
  const [areaTypeOptions, setAreaTypeOptions] = useState<Option[]>([]);
  const [areaCodeOptions, setAreaCodeOptions] = useState<Option[]>([]);
  const [villageWardOptions, setVillageWardOptions] = useState<Option[]>([]);
  const [policeStationOptions, setPoliceStationOptions] = useState<Option[]>([]);
  const isIndiaContractor = contrcatorCountry === "1";

  // ======================
  // Load details initially
  // ======================
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

        setDetails(json.data);

        const formData: ContractorFormValues = {
          nameOfContractor:
            amendmentDraft?.name_of_contractor ?? "",

          addressOfContractor:
            amendmentDraft?.address_of_contractor ?? "",

          contractorDist:
            amendmentDraft?.contractor_dist
              ? String(amendmentDraft.contractor_dist)
              : "",

          contractorSubdivision:
            amendmentDraft?.contractor_subdivision
              ? String(amendmentDraft.contractor_subdivision)
              : "",

          contractorAreatype:
            amendmentDraft?.contractor_areatype ?? "",

          contractorNameAreatype:
            amendmentDraft?.contractor_name_areatype
              ? String(amendmentDraft.contractor_name_areatype)
              : "",

          contractorVillWard:
            amendmentDraft?.contractor_vill_ward
              ? String(amendmentDraft.contractor_vill_ward)
              : "",

          contractorPs:
            amendmentDraft?.contractor_ps ?? "",

          contractorPin:
            amendmentDraft?.contractor_pin
              ? String(amendmentDraft.contractor_pin)
              : "",

          contractorState:
            amendmentDraft?.contractor_state
              ? String(amendmentDraft.contractor_state)
              : "",

          contrcatorCountry:
            amendmentDraft?.contractor_country
              ? String(amendmentDraft.contractor_country)
              : "",

          fatherContarctorName:
            amendmentDraft?.father_contarctor_name ?? "",

          dobContractor:
            amendmentDraft?.dob_contractor
              ? amendmentDraft.dob_contractor.slice(0, 10)
              : "",

          ageContractor:
            amendmentDraft?.age_contractor
              ? String(amendmentDraft.age_contractor)
              : "",

          categoryOfContractor:
            amendmentDraft?.category_of_contractor != null
              ? String(amendmentDraft.category_of_contractor)
              : "",
        };

        setFetchedData(formData);

        reset(formData);

        setContrcatorCountry(formData.contrcatorCountry);
        setContractorDist(formData.contractorDist);
        setContractorSubdivision(formData.contractorSubdivision);
        setContractorAreatype(formData.contractorAreatype);
        setContractorNameAreatype(formData.contractorNameAreatype);
        setContractorVillWard(formData.contractorVillWard);
        setContractorPs(formData.contractorPs);

        setFormVSerialNo(
          json.data?.LicenseData?.serial_no_from_v ?? null
        );
      } catch (error) {
        toast.error("Unable to load amendment details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [reset]);


  useEffect(() => {
    const run = async () => {
      const data = await fetchJson(`${API_BASE}states`);
      const list = Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : [];
      setStateOptions(
        list.map((s: any, index: number) => ({
          value: String(s.id ?? s.code ?? index),
          label: String(s.name ?? s.state_name ?? s.stateName ?? s.id ?? s.code ?? "State"),
        }))
      );
      if (fetchedData?.contractorState) {
        setValue("contractorState", fetchedData.contractorState);
      }
    };
    run().catch(() => setStateOptions([]));
  }, [fetchedData?.contractorState, setValue]);

  useEffect(() => {
    if (!isIndiaContractor) {
      setDistrictOptions([]);
      setSubdivisionOptions([]);
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setPoliceStationOptions([]);
      return;
    }
    const run = async () => {
      const data = await fetchJson(`${API_BASE}district`);
      const list = Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : [];
      setDistrictOptions(
        list.map((d: any) => ({
          value: String(d.district_code),
          label: String(d.district_name ?? d.name ?? d.district_code),
        }))
      );
      // if (fetchedData?.contractorDist) {
      //   setValue("contractorDist", fetchedData.contractorDist);
      // }
    };
    run().catch(() => setDistrictOptions([]));
  }, [fetchedData?.contractorDist, isIndiaContractor, setValue]);

  useEffect(() => {
    if (!isIndiaContractor || !contractorDist) {
      setSubdivisionOptions([]);
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setPoliceStationOptions([]);
      return;
    }
    const run = async () => {
      const [subdivRes, psRes] = await Promise.all([
        fetchJson(`${API_BASE}subdivision/${contractorDist}`),
        fetchJson(`${API_BASE}policestation/${contractorDist}`),
      ]);
      const subdivList = Array.isArray((subdivRes as any)?.data)
        ? (subdivRes as any).data
        : Array.isArray(subdivRes)
          ? subdivRes
          : [];
      const psList = Array.isArray((psRes as any)?.data)
        ? (psRes as any).data
        : Array.isArray(psRes)
          ? psRes
          : [];
      setSubdivisionOptions(
        subdivList.map((s: any) => ({ value: String(s.sub_div_code), label: String(s.sub_div_name) }))
      );
      setPoliceStationOptions(
        psList.map((p: any) => ({
          value: String(p.police_station_code),
          label: String(p.name_of_police_station),
        }))
      );
      // if (fetchedData?.contractorSubdivision) {
      //   setValue("contractorSubdivision", fetchedData.contractorSubdivision);
      // }
      // if (fetchedData?.contractorPs) {
      //   setValue("contractorPs", fetchedData.contractorPs);
      // }
    };
    run().catch(() => {
      setSubdivisionOptions([]);
      setPoliceStationOptions([]);
    });
  }, [contractorDist, fetchedData?.contractorPs, fetchedData?.contractorSubdivision, isIndiaContractor, setValue]);

  useEffect(() => {
    if (!isIndiaContractor || !contractorDist || !contractorSubdivision) {
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const data = await fetchJson(`${API_BASE}areatype/${contractorDist}/${contractorSubdivision}`);
      const list = Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : [];
      const typeList: string[] = (list as any[])
        .map((a: any) => String(a?.type ?? "").toUpperCase())
        .filter((v: string) => v.length > 0);
      const uniqueTypes = [...new Set(typeList)];
      const mapped = uniqueTypes
        .filter((t) => AREA_TYPE_LABELS[t])
        .map((t) => ({ value: t, label: AREA_TYPE_LABELS[t] }));
      if (contractorAreatype && !mapped.some((m) => m.value === contractorAreatype)) {
        mapped.push({
          value: contractorAreatype,
          label: AREA_TYPE_LABELS[contractorAreatype] ?? contractorAreatype,
        });
      }
      setAreaTypeOptions(mapped);
      // if (fetchedData?.contractorAreatype) {
      //   setValue("contractorAreatype", fetchedData.contractorAreatype);
      // }
    };
    run().catch(() => setAreaTypeOptions([]));
  }, [contractorDist, contractorSubdivision, fetchedData?.contractorAreatype, isIndiaContractor, setValue]);

  useEffect(() => {
    if (!isIndiaContractor || !contractorDist || !contractorSubdivision || !contractorAreatype) {
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const data = await fetchJson(
        `${API_BASE}block/${contractorDist}/${contractorSubdivision}/${contractorAreatype.toLowerCase()}`
      );
      const list = Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : [];
      setAreaCodeOptions(
        list.map((b: any) => ({ value: String(b.block_code), label: String(b.block_mun_name) }))
      );
      // if (fetchedData?.contractorNameAreatype) {
      //   setValue("contractorNameAreatype", fetchedData.contractorNameAreatype);
      // }
    };
    run().catch(() => setAreaCodeOptions([]));
  }, [contractorAreatype, contractorDist, contractorSubdivision, fetchedData?.contractorNameAreatype, isIndiaContractor, setValue]);

  useEffect(() => {
    if (!isIndiaContractor || !contractorNameAreatype) {
      setVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const data = await fetchJson(`${API_BASE}villageward/${contractorNameAreatype}`);
      const list = Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : [];
      setVillageWardOptions(
        list.map((v: any) => ({ value: String(v.village_code), label: String(v.village_name) }))
      );
      // if (fetchedData?.contractorVillWard) {
      //   setValue("contractorVillWard", fetchedData.contractorVillWard);
      // }
    };
    run().catch(() => setVillageWardOptions([]));
  }, [contractorNameAreatype, fetchedData?.contractorVillWard, isIndiaContractor, setValue]);

  useEffect(() => {
    if (loading) return; // IMPORTANT
    if (isIndiaContractor) return;

    setValue("contractorState", "");
    setValue("contractorDist", "");
    setValue("contractorSubdivision", "");
    setValue("contractorAreatype", "");
    setValue("contractorNameAreatype", "");
    setValue("contractorVillWard", "");
    setValue("contractorPs", "");
    setValue("contractorPin", "");
  }, [isIndiaContractor, loading, setValue]);

  useEffect(() => {
    if (isCompanyCategory || false) return;
    setValue("ageContractor", calculateAgeFromDate(dobContractor));
  }, [dobContractor, false, isCompanyCategory, setValue]);

  const onSubmit = async (values: ContractorFormValues) => {
    try {
      setSaving(true);

      const payload = {
        id: details?.amendmentDraft?.id,
        flag: "FORM_1",

        categoryOfContractor:
          values.categoryOfContractor !== ""
            ? Number(values.categoryOfContractor)
            : undefined,

        fatherContarctorName:
          values.fatherContarctorName?.trim() || undefined,

        nameOfContractor:
          values.nameOfContractor?.trim() || undefined,

        dobContractor:
          values.dobContractor?.trim()
            ? new Date(values.dobContractor).toISOString()
            : undefined,

        ageContractor:
          values.ageContractor !== ""
            ? Number(values.ageContractor)
            : undefined,

        addressOfContractor:
          values.addressOfContractor?.trim() || undefined,

        contractorDist:
          values.contractorDist || undefined,

        contractorSubdivision:
          values.contractorSubdivision !== ""
            ? Number(values.contractorSubdivision)
            : undefined,

        contractorAreatype:
          values.contractorAreatype || undefined,

        contractorNameAreatype:
          values.contractorNameAreatype !== ""
            ? Number(values.contractorNameAreatype)
            : undefined,

        contractorVillWard:
          values.contractorVillWard !== ""
            ? Number(values.contractorVillWard)
            : undefined,

        contractorPs:
          values.contractorPs || undefined,

        contractorPin:
          values.contractorPin !== ""
            ? Number(values.contractorPin)
            : undefined,

        contractorState:
          values.contractorState !== ""
            ? Number(values.contractorState)
            : undefined,

        contrcatorCountry:
          values.contrcatorCountry !== ""
            ? Number(values.contrcatorCountry)
            : undefined,
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
        toast.error(
          result?.message || "Failed to save contractor details"
        );
        return;
      }

      toast.success(
        result?.message || "Contractor details saved successfully"
      );

      navigate(-1);
    } catch (error) {
      toast.error("Unable to save contractor details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-sm text-gray-600">
        Loading...
      </div>
    );
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
          Contractor Details
        </div>
        <div className="px-5 py-4">
          <div className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-[#1d5f8d]">
            Name address of the contractor(Official Information)
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Category of Contractor *</label>
                <div className="flex items-center gap-5 rounded border px-3 py-2 text-sm">
                  <label className="inline-flex items-center gap-1">
                    <input type="radio" value="0" disabled={false} {...register("categoryOfContractor")} />
                    Individual
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input type="radio" value="1" disabled={false} {...register("categoryOfContractor")} />
                    Company
                  </label>
                </div>
              </div>
              {!isCompanyCategory ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Father name of Contractor *</label>
                  <input
                    className={`w-full rounded border px-3 py-2 text-sm ${false ? "bg-gray-100 text-gray-600" : ""}`}
                    readOnly={false}
                    {...register("fatherContarctorName")}
                  />
                </div>
              ) : <div />}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">{isCompanyCategory ? "Date of commencement of business *" : "Date of birth *"}</label>
                <input
                  className={`w-full rounded border px-3 py-2 text-sm ${false ? "bg-gray-100 text-gray-600" : ""}`}
                  type="date"
                  readOnly={false}
                  {...register("dobContractor")}
                />
              </div>
              {!isCompanyCategory ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Age *</label>
                  <input
                    className={`w-full rounded border px-3 py-2 text-sm ${false ? "bg-gray-100 text-gray-600" : ""}`}
                    readOnly={false}
                    {...register("ageContractor")}
                  />
                </div>
              ) : <div />}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Select Country *</label>
                <select
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={contrcatorCountry}
                  onChange={(e) => {
                    setContrcatorCountry(e.target.value);
                    setValue("contrcatorCountry", e.target.value);
                  }}
                >
                  <option value="">Select country</option>
                  <option value="1">India</option>
                  <option value="2">Others</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Address Line1 of contractor *</label>
                <input
                  className="w-full rounded border bg-gray-100 px-3 py-2 text-sm text-gray-600"
                  readOnly
                  disabled
                  {...register("addressOfContractor")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Name of Contractor *</label>
                <input
                  className="w-full rounded border bg-gray-100 px-3 py-2 text-sm text-gray-600"
                  {...register("nameOfContractor")}
                  readOnly
                  disabled
                />
              </div>
              {isIndiaContractor ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select State *</label>
                    <select
                      className={`w-full rounded border px-3 py-2 text-sm ${false ? "bg-gray-100 text-gray-600" : ""}`}
                      disabled={false}
                      {...register("contractorState")}
                    >
                      <option value="">Select state</option>
                      {stateOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select District *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorDist}
                      onChange={(e) => {
                        setContractorDist(e.target.value);
                        setValue("contractorDist", e.target.value);
                      }}
                    >
                      <option value="">Select district</option>
                      {districtOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select Subdivision *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorSubdivision}
                      onChange={(e) => {
                        setContractorSubdivision(e.target.value);
                        setValue("contractorSubdivision", e.target.value);
                      }}
                    >
                      <option value="">Select subdivision</option>
                      {subdivisionOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select Areatype *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorAreatype}
                      onChange={(e) => {
                        setContractorAreatype(e.target.value);
                        setValue("contractorAreatype", e.target.value);
                      }}
                    >
                      <option value="">Select areatype</option>
                      {areaTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select Municipality/Block *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorNameAreatype}
                      onChange={(e) => {
                        setContractorNameAreatype(e.target.value);
                        setValue("contractorNameAreatype", e.target.value);
                      }}
                    >
                      <option value="">Select area</option>
                      {areaCodeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select Ward/Village *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorVillWard}
                      onChange={(e) => {
                        setContractorVillWard(e.target.value);
                        setValue("contractorVillWard", e.target.value);
                      }}
                    >
                      <option value="">Select village/ward</option>
                      {villageWardOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Select Police Station *</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={contractorPs}
                      onChange={(e) => {
                        setContractorPs(e.target.value);
                        setValue("contractorPs", e.target.value);
                      }}
                    >
                      <option value="">Select police station</option>
                      {policeStationOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}
              {isIndiaContractor ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">PIN Code *</label>
                  <input
                    className={`w-full rounded border px-3 py-2 text-sm ${false ? "bg-gray-100 text-gray-600" : ""}`}
                    inputMode="numeric"
                    maxLength={6}
                    pattern="\d{6}"
                    readOnly={false}
                    {...register("contractorPin", {
                      onChange: (e) => setValue("contractorPin", normalizePin(e.target.value)),
                    })}
                  />
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => navigate(-1)} className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-6 py-2 text-sm font-semibold text-white hover:bg-[#31b0d5]">
                Back
              </button>
              <button type="submit" disabled={saving} className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-6 py-2 text-sm font-semibold text-white hover:bg-[#31b0d5] disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentContractor;
