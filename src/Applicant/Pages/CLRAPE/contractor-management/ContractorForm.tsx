import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import type { AppDispatch } from "@/store/store";
import type { Contractor } from "./constants";
import { ROUTE_CONTRACTOR_LIST } from "./constants";
import { createContractor, editContractor, fetchContractorList } from "./contractorApi";
import {
  fetchContractorDetails,
  clearCurrentContractor,
  selectCurrentContractor,
  selectContractorsLoading,
  selectContractorsError,
} from "@/store/contractorsSlice";
import { fetchStates, selectStates } from "@/store/statesSlice";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { fetchFinalPreview } from "../application-preview/previewApi";
import { toast } from "react-toastify";
import { selectContractors } from "@/store/contractorsSlice";

const Spinner: React.FC<{ className?: string }> = ({ className = "h-4 w-4 border-2" }) => (
  <span
    className={`inline-block animate-spin rounded-full border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
);

export type FormData = {
  contractorName: string;
  email: string;
  state: string;
  address: string;
  district: string;
  subdivision: string;
  areaType: string;
  areaCode: string;
  villageWard: string;
  policeStation: string;
  pinCode: string;
  natureOfWork: string[];
  otherNature?: string;
  maxLabour: string;
  fromDate: string;
  toDate: string;
  totalDays: string;
  // Worksite address
  worksiteAddress: string;
  worksiteDistrict: string;
  worksiteSubdivision: string;
  worksiteAreaType: string;
  worksiteAreaCode: string;
  worksiteVillageWard: string;
  worksitePoliceStation: string;
  worksitePinCode: string;
};

export const natureOptions = [
  { value: "5", label: "AC Maintenance" },
  { value: "21", label: "Bagging Operation" },
  { value: "23", label: "Canteen Service" },
  { value: "13", label: "Civil Works" },
  { value: "16", label: "Electrical Works" },
  { value: "6", label: "Security Service" },
  { value: "28", label: "Others" },
];

type Option = { value: string; label: string };

const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

const requiredWhenWestBengal = (label: string) =>
  yup
    .string()
    .default("")
    .test("required-when-wb", "Required", function (value) {
      const state = String((this.parent as FormData)?.state ?? "");
      if (state === "1" && (!value || !String(value).trim())) return false;
      return true;
    })
    .label(label);

const schema: yup.ObjectSchema<FormData> = yup.object({
  contractorName: yup.string().required("Required"),
  email: yup.string().email("Invalid email").required("Required"),
  state: yup.string().required("Required"),
  address: yup.string().required("Required"),
  district: requiredWhenWestBengal("District"),
  subdivision: requiredWhenWestBengal("Subdivision"),
  areaType: requiredWhenWestBengal("Area Type"),
  areaCode: requiredWhenWestBengal("Area"),
  villageWard: requiredWhenWestBengal("Village/Ward"),
  policeStation: requiredWhenWestBengal("Police Station"),
  pinCode: yup
    .string()
    .default("")
    .test("pin-when-wb", "PIN must be 6 digits", function (value) {
      const state = String((this.parent as FormData)?.state ?? "");
      if (state !== "1") return true;
      return /^\d{6}$/.test(String(value ?? ""));
    }),
  natureOfWork: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one option")
    .required(),
  otherNature: yup.string().when("natureOfWork", {
    is: (values: string[] | undefined) =>
      Array.isArray(values) && values.includes("28"),
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.optional(),
  }),
  maxLabour: yup
    .string()
    .required("Required")
    .matches(/^[0-9]+$/, "Must be a number"),
  fromDate: yup
    .string()
    .required("Required")
    .matches(/^(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})$/, "Use valid date"),
  toDate: yup
    .string()
    .required("Required")
    .matches(/^(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})$/, "Use valid date"),
  totalDays: yup
    .string()
    .required("Required")
    .matches(/^[0-9]+$/, "Must be a number"),
  // Worksite address (validation to be finalised with backend wiring)
  worksiteAddress: yup.string().default(""),
  worksiteDistrict: yup.string().default(""),
  worksiteSubdivision: yup.string().default(""),
  worksiteAreaType: yup.string().default(""),
  worksiteAreaCode: yup.string().default(""),
  worksiteVillageWard: yup.string().default(""),
  worksitePoliceStation: yup.string().default(""),
  worksitePinCode: yup.string().default(""),
});

const emptyFormValues: FormData = {
  contractorName: "",
  email: "",
  state: "1",
  address: "",
  district: "",
  subdivision: "",
  areaType: "",
  areaCode: "",
  villageWard: "",
  policeStation: "",
  pinCode: "",
  natureOfWork: [],
  otherNature: "",
  maxLabour: "",
  fromDate: "",
  toDate: "",
  totalDays: "",
  worksiteAddress: "",
  worksiteDistrict: "",
  worksiteSubdivision: "",
  worksiteAreaType: "",
  worksiteAreaCode: "",
  worksiteVillageWard: "",
  worksitePoliceStation: "",
  worksitePinCode: "",
};

function mapEditFormData(c: Contractor): FormData {
  return {
    contractorName: c.name,
    email: c.email ?? "",
    state: c.state != null ? String(c.state) : String(c.stateOpts ?? 1),
    address: c.address,
    district: c.districtCode ?? "",
    subdivision: c.subdivisionCode ?? "",
    // Area type codes are stored as single letters ("B", "M", …); the dropdown
    // options are uppercase, so normalise to keep the saved value selectable.
    areaType: (c.areaType ?? "").toUpperCase(),
    areaCode: c.areaCode ?? "",
    villageWard: c.villageWardCode ?? "",
    policeStation: c.policeStationCode ?? "",
    pinCode: c.pinCode ?? "",
    natureOfWork: c.natureOfWork ?? [],
    otherNature: c.otherNatureWork ?? "",
    maxLabour: String(c.maxLabour),
    fromDate: toIsoDateInput(c.employmentFrom ?? ""),
    toDate: toIsoDateInput(c.employmentTo ?? ""),
    totalDays: c.totalDays != null ? String(c.totalDays) : "",
    worksiteAddress: c.worksiteAddress ?? "",
    worksiteDistrict: c.worksiteDistrictCode ?? "",
    worksiteSubdivision: c.worksiteSubdivisionCode ?? "",
    worksiteAreaType: (c.worksiteAreaType ?? "").toUpperCase(),
    worksiteAreaCode: c.worksiteAreaCode ?? "",
    worksiteVillageWard: c.worksiteVillageWardCode ?? "",
    worksitePoliceStation: c.worksitePoliceStationCode ?? "",
    worksitePinCode: c.worksitePinCode ?? "",
  };
}

function toIsoDateInput(value: string): string {
  const raw = String(value || "").trim();
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
  const m = raw.match(ddmmyyyy);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  return raw;
}

/** Format an ISO (yyyy-mm-dd) date as dd-mm-yyyy for display. */
function toDisplayDate(value: string): string {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}-${mo}-${y}`;
  }
  return String(value || "");
}

/**
 * Village/Ward options arrive sorted alphabetically, so wards read as
 * "Ward - 1, Ward - 10, Ward - 2 ...". Re-sort numerically when both labels
 * carry a ward number, otherwise keep the alphabetical order.
 */
function sortVillageWardOptions(options: Option[]): Option[] {
  const wardNumber = (label: string): number => {
    const m = String(label).match(/(\d+)/);
    return m ? Number(m[1]) : NaN;
  };
  return [...options].sort((a, b) => {
    const na = wardNumber(a.label);
    const nb = wardNumber(b.label);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.label.localeCompare(b.label);
  });
}

function openNativeDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget as HTMLInputElement & {
    showPicker?: () => void;
  };
  input.showPicker?.();
}

const ContractorForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const states = useSelector(selectStates);
  const currentContractor = useSelector(selectCurrentContractor);
  const loading = useSelector(selectContractorsLoading);
  const loadError = useSelector(selectContractorsError);

  const contractors = useSelector(selectContractors);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  console.log("Route ID:", id);

  const isEdit = Boolean(id);

  console.log("isEdit:", isEdit);
  // const applicationIdFromState = (location.state as { applicationId?: string; referenceId?: string } | null)?.applicationId
  //   ?? (location.state as { applicationId?: string; referenceId?: string } | null)?.referenceId
  //   ?? null;
  // const applicationIdFromQuery = searchParams.get("applicationId");
  const amendmentApplicationIdFromSession = (() => {
    try {
      const raw = sessionStorage.getItem("CLRA_AMENDMENT_CTX");
      if (!raw) return null;
      return (JSON.parse(raw) as { applicationID?: string })?.applicationID ?? null;
    } catch {
      return null;
    }
  })();
  const amendmentApplicationIdFromSessionForViewDetails = (() => {
    try {
      const raw = sessionStorage.getItem("CLRA_CTX");
      if (!raw) return null;
      return (JSON.parse(raw) as { encryptedApplicationId?: string })?.encryptedApplicationId ?? null;
    } catch {
      return null;
    }
  })();
  const parentApplicationIdFromSession = (() => {
    try {
      const raw = sessionStorage.getItem("CLRA_AMENDMENT_PARENT_CTX");
      if (!raw) return null;
      return (JSON.parse(raw) as { parentApplicationID?: string })?.parentApplicationID ?? null;
    } catch {
      return null;
    }
  })();

  const encryptedApplicationId = parentApplicationIdFromSession ?? amendmentApplicationIdFromSession ?? amendmentApplicationIdFromSessionForViewDetails ?? null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    // always ensure states are loaded for the dropdown
    dispatch(fetchStates());

    if (!id) {
      reset(emptyFormValues);
      return;
    }
    dispatch(fetchContractorDetails(id));
  }, [id, dispatch, reset]);

  useEffect(() => {
    if (isEdit && id && currentContractor && currentContractor.id === Number(id)) {
      reset(mapEditFormData(currentContractor));
    }
  }, [currentContractor, id, isEdit, reset]);

  useEffect(() => {
    return () => {
      if (isEdit) {
        dispatch(clearCurrentContractor());
      }
    };
  }, [isEdit, dispatch]);

  const selectedNature = watch("natureOfWork");
  const showOther = selectedNature?.includes("28");
  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const selectedSubdivision = watch("subdivision");
  const selectedAreaType = watch("areaType");
  const selectedAreaCode = watch("areaCode");
  const selectedFromDate = watch("fromDate");
  const selectedToDate = watch("toDate");

  const worksiteDistrict = watch("worksiteDistrict");
  const worksiteSubdivision = watch("worksiteSubdivision");
  const worksiteAreaType = watch("worksiteAreaType");
  const worksiteAreaCode = watch("worksiteAreaCode");

  // Registration certificate issue date (ISO yyyy-mm-dd). A newly added
  // contractor cannot start work before the certificate was issued.
  const [regCertIssueDate, setRegCertIssueDate] = useState<string>("");

  // A contractor carried over from before the amendment (already issued) may
  // not have its Starting Date of Work changed.
  const isIssuedContractor =
    isEdit &&
    !!currentContractor &&
    currentContractor.id === Number(id) &&
    (currentContractor.existedBeforeAmendment === true ||
      (currentContractor.contractorParentId != null &&
        String(currentContractor.contractorParentId).trim() !== "" &&
        String(currentContractor.contractorParentId).trim() !== "0"));

  const [districtOptions, setDistrictOptions] = useState<Option[]>([]);
  const [subdivisionOptions, setSubdivisionOptions] = useState<Option[]>([]);
  const [areaTypeOptions, setAreaTypeOptions] = useState<Option[]>([]);
  const [areaCodeOptions, setAreaCodeOptions] = useState<Option[]>([]);
  const [villageWardOptions, setVillageWardOptions] = useState<Option[]>([]);
  const [policeStationOptions, setPoliceStationOptions] = useState<Option[]>([]);

  const [worksiteDistrictOptions, setWorksiteDistrictOptions] = useState<Option[]>([]);
  const [worksiteSubdivisionOptions, setWorksiteSubdivisionOptions] = useState<Option[]>([]);
  const [worksiteAreaTypeOptions, setWorksiteAreaTypeOptions] = useState<Option[]>([]);
  const [worksiteAreaCodeOptions, setWorksiteAreaCodeOptions] = useState<Option[]>([]);
  const [worksiteVillageWardOptions, setWorksiteVillageWardOptions] = useState<Option[]>([]);
  const [worksitePoliceStationOptions, setWorksitePoliceStationOptions] = useState<Option[]>([]);

  const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load the registration certificate issue date so new contractors can be
  // constrained to start on/after it.
  useEffect(() => {
    if (!encryptedApplicationId) {
      setRegCertIssueDate("");
      return;
    }
    const previewId = amendmentApplicationIdFromSession ?? encryptedApplicationId;
    let cancelled = false;
    fetchFinalPreview(previewId)
      .then((preview) => {
        if (cancelled) return;
        const raw = preview?.establishment?.reg_certificate_issue_date;
        setRegCertIssueDate(raw ? String(raw).slice(0, 10) : "");
      })
      .catch(() => {
        if (!cancelled) setRegCertIssueDate("");
      });
    return () => {
      cancelled = true;
    };
  }, [encryptedApplicationId, amendmentApplicationIdFromSession]);

  // When editing, re-apply a saved dropdown value once its options have loaded.
  // register() makes these <select>s uncontrolled, so a value set by reset()
  // before the options existed gets dropped by the browser and is never
  // restored on its own — the cascaded child dropdowns always load after reset.
  const reapplySavedSelection = (field: keyof FormData, options: Option[]) => {
    if (!isEdit) return;
    const saved = getValues(field);
    if (saved && options.some((o) => o.value === String(saved))) {
      setValue(field, saved as FormData[typeof field], {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  };

  // Re-apply saved dropdown values once the option lists have actually rendered.
  // These run after paint (unlike an inline call right after setOptions), so the
  // <option> the value points at exists in the DOM and the selection sticks.
  useEffect(() => {
    reapplySavedSelection("district", districtOptions);
  }, [districtOptions]);
  useEffect(() => {
    reapplySavedSelection("subdivision", subdivisionOptions);
  }, [subdivisionOptions]);
  useEffect(() => {
    reapplySavedSelection("areaType", areaTypeOptions);
  }, [areaTypeOptions]);
  useEffect(() => {
    reapplySavedSelection("areaCode", areaCodeOptions);
  }, [areaCodeOptions]);
  useEffect(() => {
    reapplySavedSelection("villageWard", villageWardOptions);
  }, [villageWardOptions]);
  useEffect(() => {
    reapplySavedSelection("policeStation", policeStationOptions);
  }, [policeStationOptions]);
  useEffect(() => {
    reapplySavedSelection("worksiteDistrict", worksiteDistrictOptions);
  }, [worksiteDistrictOptions]);
  useEffect(() => {
    reapplySavedSelection("worksiteSubdivision", worksiteSubdivisionOptions);
  }, [worksiteSubdivisionOptions]);
  useEffect(() => {
    reapplySavedSelection("worksiteAreaType", worksiteAreaTypeOptions);
  }, [worksiteAreaTypeOptions]);
  useEffect(() => {
    reapplySavedSelection("worksiteAreaCode", worksiteAreaCodeOptions);
  }, [worksiteAreaCodeOptions]);
  useEffect(() => {
    reapplySavedSelection("worksiteVillageWard", worksiteVillageWardOptions);
  }, [worksiteVillageWardOptions]);
  useEffect(() => {
    reapplySavedSelection("worksitePoliceStation", worksitePoliceStationOptions);
  }, [worksitePoliceStationOptions]);

  useEffect(() => {
    if (selectedState !== "1") {
      setDistrictOptions([]);
      setSubdivisionOptions([]);
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setPoliceStationOptions([]);
      setValue("district", "");
      setValue("subdivision", "");
      setValue("areaType", "");
      setValue("areaCode", "");
      setValue("villageWard", "");
      setValue("policeStation", "");
      setValue("pinCode", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(`${API_BASE}district`, { headers: authHeaders() });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = list.map((d: any) => ({
        value: String(d.district_code),
        label: String(d.district_name ?? d.name ?? d.district_code),
      }));
      setDistrictOptions(opts);
    };
    run().catch(() => setDistrictOptions([]));
  }, [selectedState, setValue]);

  useEffect(() => {
    if (selectedState !== "1" || !selectedDistrict) {
      setSubdivisionOptions([]);
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setPoliceStationOptions([]);
      setValue("subdivision", "");
      setValue("areaType", "");
      setValue("areaCode", "");
      setValue("villageWard", "");
      setValue("policeStation", "");
      return;
    }
    const run = async () => {
      const [subdivRes, psRes] = await Promise.all([
        axios.get(`${API_BASE}subdivision/${selectedDistrict}`, { headers: authHeaders() }),
        axios.get(`${API_BASE}policestation/${selectedDistrict}`, { headers: authHeaders() }),
      ]);
      const subdiv = Array.isArray(subdivRes.data?.data)
        ? subdivRes.data.data
        : Array.isArray(subdivRes.data)
          ? subdivRes.data
          : [];
      const ps = Array.isArray(psRes.data?.data)
        ? psRes.data.data
        : Array.isArray(psRes.data)
          ? psRes.data
          : [];
      const subdivOpts = subdiv.map((s: any) => ({
        value: String(s.sub_div_code),
        label: String(s.sub_div_name),
      }));
      const psOpts = ps.map((p: any) => ({
        value: String(p.police_station_code),
        label: String(p.name_of_police_station),
      }));
      setSubdivisionOptions(subdivOpts);
      setPoliceStationOptions(psOpts);
    };
    run().catch(() => {
      setSubdivisionOptions([]);
      setPoliceStationOptions([]);
    });
  }, [selectedDistrict, selectedState, setValue]);

  useEffect(() => {
    if (selectedState !== "1" || !selectedDistrict || !selectedSubdivision) {
      setAreaTypeOptions([]);
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setValue("areaType", "");
      setValue("areaCode", "");
      setValue("villageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(`${API_BASE}areatype/${selectedDistrict}/${selectedSubdivision}`, {
        headers: authHeaders(),
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const typeList: string[] = (list as any[])
        .map((a: any) => String(a?.type ?? "").toUpperCase())
        .filter((v: string) => v.length > 0);
      const uniqueTypes: string[] = [...new Set<string>(typeList)];
      const opts = uniqueTypes
        .filter((t) => AREA_TYPE_LABELS[t])
        .map((t) => ({ value: t, label: AREA_TYPE_LABELS[t] }));
      setAreaTypeOptions(opts);
    };
    run().catch(() => setAreaTypeOptions([]));
  }, [selectedDistrict, selectedSubdivision, selectedState, setValue]);

  useEffect(() => {
    if (selectedState !== "1" || !selectedDistrict || !selectedSubdivision || !selectedAreaType) {
      setAreaCodeOptions([]);
      setVillageWardOptions([]);
      setValue("areaCode", "");
      setValue("villageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(
        `${API_BASE}block/${selectedDistrict}/${selectedSubdivision}/${selectedAreaType.toLowerCase()}`,
        { headers: authHeaders() }
      );
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = list.map((b: any) => ({
        value: String(b.block_code),
        label: String(b.block_mun_name),
      }));
      setAreaCodeOptions(opts);
    };
    run().catch(() => setAreaCodeOptions([]));
  }, [selectedAreaType, selectedDistrict, selectedSubdivision, selectedState, setValue]);

  useEffect(() => {
    if (selectedState !== "1" || !selectedAreaCode) {
      setVillageWardOptions([]);
      setValue("villageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(`${API_BASE}villageward/${selectedAreaCode}`, {
        headers: authHeaders(),
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = sortVillageWardOptions(
        list.map((v: any) => ({ value: String(v.village_code), label: String(v.village_name) }))
      );
      setVillageWardOptions(opts);
    };
    run().catch(() => setVillageWardOptions([]));
  }, [selectedAreaCode, selectedState, setValue]);

  // ---- Worksite address cascade (West Bengal) ----
  useEffect(() => {
    const run = async () => {
      const { data } = await axios.get(`${API_BASE}district`, { headers: authHeaders() });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = list.map((d: any) => ({
        value: String(d.district_code),
        label: String(d.district_name ?? d.name ?? d.district_code),
      }));
      setWorksiteDistrictOptions(opts);
    };
    run().catch(() => setWorksiteDistrictOptions([]));
  }, []);

  useEffect(() => {
    if (!worksiteDistrict) {
      setWorksiteSubdivisionOptions([]);
      setWorksiteAreaTypeOptions([]);
      setWorksiteAreaCodeOptions([]);
      setWorksiteVillageWardOptions([]);
      setWorksitePoliceStationOptions([]);
      setValue("worksiteSubdivision", "");
      setValue("worksiteAreaType", "");
      setValue("worksiteAreaCode", "");
      setValue("worksiteVillageWard", "");
      setValue("worksitePoliceStation", "");
      return;
    }
    const run = async () => {
      const [subdivRes, psRes] = await Promise.all([
        axios.get(`${API_BASE}subdivision/${worksiteDistrict}`, { headers: authHeaders() }),
        axios.get(`${API_BASE}policestation/${worksiteDistrict}`, { headers: authHeaders() }),
      ]);
      const subdiv = Array.isArray(subdivRes.data?.data)
        ? subdivRes.data.data
        : Array.isArray(subdivRes.data)
          ? subdivRes.data
          : [];
      const ps = Array.isArray(psRes.data?.data)
        ? psRes.data.data
        : Array.isArray(psRes.data)
          ? psRes.data
          : [];
      const subdivOpts = subdiv.map((s: any) => ({
        value: String(s.sub_div_code),
        label: String(s.sub_div_name),
      }));
      const psOpts = ps.map((p: any) => ({
        value: String(p.police_station_code),
        label: String(p.name_of_police_station),
      }));
      setWorksiteSubdivisionOptions(subdivOpts);
      setWorksitePoliceStationOptions(psOpts);
    };
    run().catch(() => {
      setWorksiteSubdivisionOptions([]);
      setWorksitePoliceStationOptions([]);
    });
  }, [worksiteDistrict, setValue]);

  useEffect(() => {
    if (!worksiteDistrict || !worksiteSubdivision) {
      setWorksiteAreaTypeOptions([]);
      setWorksiteAreaCodeOptions([]);
      setWorksiteVillageWardOptions([]);
      setValue("worksiteAreaType", "");
      setValue("worksiteAreaCode", "");
      setValue("worksiteVillageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(
        `${API_BASE}areatype/${worksiteDistrict}/${worksiteSubdivision}`,
        { headers: authHeaders() }
      );
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const typeList: string[] = (list as any[])
        .map((a: any) => String(a?.type ?? "").toUpperCase())
        .filter((v: string) => v.length > 0);
      const uniqueTypes: string[] = [...new Set<string>(typeList)];
      const opts = uniqueTypes
        .filter((t) => AREA_TYPE_LABELS[t])
        .map((t) => ({ value: t, label: AREA_TYPE_LABELS[t] }));
      setWorksiteAreaTypeOptions(opts);
    };
    run().catch(() => setWorksiteAreaTypeOptions([]));
  }, [worksiteDistrict, worksiteSubdivision, setValue]);

  useEffect(() => {
    if (!worksiteDistrict || !worksiteSubdivision || !worksiteAreaType) {
      setWorksiteAreaCodeOptions([]);
      setWorksiteVillageWardOptions([]);
      setValue("worksiteAreaCode", "");
      setValue("worksiteVillageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(
        `${API_BASE}block/${worksiteDistrict}/${worksiteSubdivision}/${worksiteAreaType.toLowerCase()}`,
        { headers: authHeaders() }
      );
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = list.map((b: any) => ({
        value: String(b.block_code),
        label: String(b.block_mun_name),
      }));
      setWorksiteAreaCodeOptions(opts);
    };
    run().catch(() => setWorksiteAreaCodeOptions([]));
  }, [worksiteDistrict, worksiteSubdivision, worksiteAreaType, setValue]);

  useEffect(() => {
    if (!worksiteAreaCode) {
      setWorksiteVillageWardOptions([]);
      setValue("worksiteVillageWard", "");
      return;
    }
    const run = async () => {
      const { data } = await axios.get(`${API_BASE}villageward/${worksiteAreaCode}`, {
        headers: authHeaders(),
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const opts = sortVillageWardOptions(
        list.map((v: any) => ({ value: String(v.village_code), label: String(v.village_name) }))
      );
      setWorksiteVillageWardOptions(opts);
    };
    run().catch(() => setWorksiteVillageWardOptions([]));
  }, [worksiteAreaCode, setValue]);

  // Auto-calculate total days from employment dates (inclusive).
  useEffect(() => {
    if (!selectedFromDate || !selectedToDate) {
      setValue("totalDays", "");
      return;
    }

    const from = new Date(`${selectedFromDate}T00:00:00`);
    const to = new Date(`${selectedToDate}T00:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) {
      setValue("totalDays", "");
      return;
    }

    const diffMs = to.getTime() - from.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    setValue("totalDays", String(days));
  }, [selectedFromDate, selectedToDate, setValue]);

  // const onSubmit: SubmitHandler<FormData> = async (data) => {

  //   console.log("ON SUBMIT HIT");

  //   if (!encryptedApplicationId) return;

  //   const enteredMaxLabour = Number(data.maxLabour);
  //   const editingContractorId = id ? Number(id) : null;
  //   const previewApplicationId = amendmentApplicationIdFromSession ?? encryptedApplicationId;
  //   let contractorIdentificationNumber = "";

  //   try {
  //     const previewData = await fetchFinalPreview(previewApplicationId);
  //     contractorIdentificationNumber = String(
  //       previewData?.establishment?.identification_number ?? ""
  //     );

  //     console.log(
  //       "Validation Contractor List",
  //       contractors.map((c) => ({
  //         id: c.id,
  //         status: c.status,
  //         maxLabour: c.maxLabour,
  //       }))
  //     );

  //     const maxContractLabourLimit = Number(
  //       previewData?.establishment?.e_any_day_max_num_of_workmen ?? NaN
  //     );

  //     if (Number.isFinite(maxContractLabourLimit)) {
  //       const existingTotal = contractors
  //         .filter(
  //           (contractor) =>
  //             contractor.id !== editingContractorId &&
  //             Number(contractor.status) === 1
  //         )
  //         .reduce(
  //           (sum, contractor) => sum + Number(contractor.maxLabour || 0),
  //           0
  //         );

  //       // const proposedTotal = existingTotal + enteredMaxLabour;

  //       console.log("Max Labour Limit:", maxContractLabourLimit);

  //       console.log(
  //         "Active Contractors:",
  //         contractors.filter(
  //           (c) =>
  //             c.id !== editingContractorId &&
  //             Number(c.status) === 1
  //         )
  //       );

  //       console.log("Existing Total:", existingTotal);
  //       console.log("Entered Labour:", enteredMaxLabour);

  //       const proposedTotal = existingTotal + enteredMaxLabour;

  //       console.log("Proposed Total:", proposedTotal);

  //       if (proposedTotal > maxContractLabourLimit) {
  //         toast.error(
  //           `Total Maximum Number of Contractor Labour cannot exceed ${maxContractLabourLimit}.`
  //         );
  //         return;
  //       }
  //     }
  //   } catch {
  //     toast.error("Unable to validate contractor labour limit right now.");
  //     return;
  //   }

  //   const fromDate = toIsoDateInput(data.fromDate);
  //   const toDate = toIsoDateInput(data.toDate);
  //   const stateTypeNum = Number(data.state) === 1 ? 1 : 2;
  //   const trimmedOther = data.otherNature?.trim() ?? "";

  //   const payload = {
  //     application_id: encryptedApplicationId,
  //     ...(contractorIdentificationNumber
  //       ? { identification_number: contractorIdentificationNumber }
  //       : {}),
  //     amendment_id: previewApplicationId,
  //     name_of_contractor: data.contractorName,
  //     email_of_contractor: data.email,
  //     address_of_contractor: data.address,
  //     state_opts: stateTypeNum,
  //     state: Number(data.state) || 0,
  //     state_others: stateTypeNum === 2 ? data.address : "",
  //     con_loc_e_dist: stateTypeNum === 1 ? data.district : undefined,
  //     con_loc_e_subdivision: stateTypeNum === 1 ? Number(data.subdivision) : undefined,
  //     con_loc_e_areatype: stateTypeNum === 1 ? data.areaType : undefined,
  //     con_name_areatype: stateTypeNum === 1 ? Number(data.areaCode) : undefined,
  //     con_loc_e_vill_ward: stateTypeNum === 1 ? Number(data.villageWard) : undefined,
  //     con_l_e_ps: stateTypeNum === 1 ? data.policeStation : undefined,
  //     contractor_pin: stateTypeNum === 1 ? Number(data.pinCode) : undefined,
  //     contractor_type: 2,
  //     act_id: 1,
  //     status: 1,
  //     natureOfWork: data.natureOfWork,
  //     other_nature_work: showOther ? trimmedOther : "",
  //     contractor_max_no_of_labours_on_any_day: enteredMaxLabour,
  //     est_date_of_work_of_each_labour_from_date: fromDate,
  //     est_date_of_work_of_each_labour_to_date: toDate,
  //     est_date_of_work_of_each_labour_total_months: Number(data.totalDays),
  //   };

  //   try {
  //     if (isEdit && id) {
  //       await editContractor(id, payload);
  //     } else {
  //       await createContractor(payload);
  //     }
  //     navigate(ROUTE_CONTRACTOR_LIST);
  //   } catch (err) {
  //     console.error("Failed to save contractor:", err);
  //     const message =
  //       (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  //       (err as Error)?.message ??
  //       "Failed to save contractor.";
  //     toast.error(message);
  //   }
  // };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("=================================");
    console.log("ON SUBMIT HIT");
    console.log("isEdit:", isEdit);
    console.log("id:", id);
    console.log("encryptedApplicationId:", encryptedApplicationId);
    console.log(
      "amendmentApplicationIdFromSession:",
      amendmentApplicationIdFromSession
    );
    console.log("=================================");

    if (!encryptedApplicationId) {
      console.error("RETURNING: encryptedApplicationId missing");
      return;
    }

    const enteredMaxLabour = Number(data.maxLabour);
    const editingContractorId = id ? Number(id) : null;
    const previewApplicationId =
      amendmentApplicationIdFromSession ?? encryptedApplicationId;

    console.log("previewApplicationId:", previewApplicationId);

    let contractorIdentificationNumber = "";
    let regCertIsoFromPreview = "";

    try {
      console.log("BEFORE fetchFinalPreview");

      const previewData = await fetchFinalPreview(previewApplicationId);

      console.log("AFTER fetchFinalPreview");
      console.log("previewData:", previewData);

      contractorIdentificationNumber = String(
        previewData?.establishment?.identification_number ?? ""
      );

      regCertIsoFromPreview = String(
        previewData?.establishment?.reg_certificate_issue_date ?? ""
      ).slice(0, 10);

      console.log(
        "Validation Contractor List",
        contractors.map((c) => ({
          id: c.id,
          status: c.status,
          maxLabour: c.maxLabour,
        }))
      );

      const maxContractLabourLimit = Number(
        previewData?.establishment?.e_any_day_max_num_of_workmen ?? NaN
      );

      console.log("maxContractLabourLimit:", maxContractLabourLimit);

      // if (Number.isFinite(maxContractLabourLimit)) {
      //   console.log(
      //     "Current contractor exists in list?",
      //     contractors.find(c => Number(c.id) === Number(editingContractorId))
      //   );
      //   const existingTotal = contractors
      //     .filter(
      //       (contractor) =>
      //         contractor.id !== editingContractorId &&
      //         Number(contractor.status) === 1
      //     )
      //     .reduce(
      //       (sum, contractor) => sum + Number(contractor.maxLabour || 0),
      //       0
      //     );

      //   console.log(
      //     "Active Contractors:",
      //     contractors.filter(
      //       (c) =>
      //         c.id !== editingContractorId &&
      //         Number(c.status) === 1
      //     )
      //   );

      //   console.log("Existing Total:", existingTotal);
      //   console.log("Entered Labour:", enteredMaxLabour);

      //   const proposedTotal = existingTotal + enteredMaxLabour;

      //   console.log("Proposed Total:", proposedTotal);

      //   if (proposedTotal > maxContractLabourLimit) {
      //     console.error(
      //       "RETURNING: proposedTotal exceeds maxContractLabourLimit"
      //     );

      //     toast.error(
      //       `Total Maximum Number of Contractor Labour cannot exceed ${maxContractLabourLimit}.`
      //     );

      //     return;
      //   }
      // }

      if (Number.isFinite(maxContractLabourLimit)) {

        console.log(
          "Current contractor exists in list?",
          contractors.find(
            c => Number(c.id) === Number(editingContractorId)
          )
        );

        // ADD HERE

        const filteredContractors = contractors.filter(
          contractor =>
            Number(contractor.id) !== Number(editingContractorId) &&
            Number(contractor.status) === 1
        );

        console.log(
          "Count of current contractor in store:",
          contractors.filter(
            c => Number(c.id) === Number(editingContractorId)
          ).length
        );

        console.log(
          "Current contractor records:",
          contractors.filter(
            c => Number(c.id) === Number(editingContractorId)
          )
        );

        console.log(
          "Filtered contains edited contractor?",
          filteredContractors.some(
            c => Number(c.id) === Number(editingContractorId)
          )
        );

        const existingTotal = filteredContractors.reduce(
          (sum, contractor) =>
            sum + Number(contractor.maxLabour || 0),
          0
        );

        console.log("Existing Total:", existingTotal);
      }
    } catch (error) {
      console.error("fetchFinalPreview FAILED");
      console.error(error);

      toast.error(
        "Unable to validate contractor labour limit right now."
      );

      return;
    }

    console.log("BEFORE PAYLOAD BUILD");

    const fromDate = toIsoDateInput(data.fromDate);
    const toDate = toIsoDateInput(data.toDate);

    // A newly added contractor's Starting Date of Work must not predate the
    // registration certificate issue date. (ISO yyyy-mm-dd compares lexically.)
    const regCertIso = regCertIsoFromPreview || regCertIssueDate;
    if (!isEdit && regCertIso && fromDate && fromDate < regCertIso) {
      toast.error(
        `Starting Date of Work cannot be earlier than the registration certificate issue date (${toDisplayDate(
          regCertIso
        )}).`
      );
      return;
    }

    const stateTypeNum = Number(data.state) === 1 ? 1 : 2;
    const trimmedOther = data.otherNature?.trim() ?? "";

    const payload = {
      application_id: encryptedApplicationId,
      ...(contractorIdentificationNumber
        ? { identification_number: contractorIdentificationNumber }
        : {}),
      amendment_id: previewApplicationId,
      name_of_contractor: data.contractorName,
      email_of_contractor: data.email,
      address_of_contractor: data.address,
      state_opts: stateTypeNum,
      state: Number(data.state) || 0,
      state_others: stateTypeNum === 2 ? data.address : "",
      con_loc_e_dist:
        stateTypeNum === 1 ? data.district : undefined,
      con_loc_e_subdivision:
        stateTypeNum === 1
          ? Number(data.subdivision)
          : undefined,
      con_loc_e_areatype:
        stateTypeNum === 1 ? data.areaType : undefined,
      con_name_areatype:
        stateTypeNum === 1
          ? Number(data.areaCode)
          : undefined,
      con_loc_e_vill_ward:
        stateTypeNum === 1
          ? Number(data.villageWard)
          : undefined,
      con_l_e_ps:
        stateTypeNum === 1
          ? data.policeStation
          : undefined,
      contractor_pin:
        stateTypeNum === 1
          ? Number(data.pinCode)
          : undefined,
      contractor_type: 2,
      act_id: 1,
      status: 1,
      natureOfWork: data.natureOfWork,
      other_nature_work: showOther ? trimmedOther : "",
      contractor_max_no_of_labours_on_any_day:
        enteredMaxLabour,
      est_date_of_work_of_each_labour_from_date:
        fromDate,
      est_date_of_work_of_each_labour_to_date:
        toDate,
      est_date_of_work_of_each_labour_total_months:
        Number(data.totalDays),
      // Worksite address
      worksite_address: data.worksiteAddress || "",
      worksite_dist: data.worksiteDistrict || "",
      worksite_subdivision: data.worksiteSubdivision
        ? Number(data.worksiteSubdivision)
        : undefined,
      worksite_areatype: data.worksiteAreaType || "",
      worksite_area_code: data.worksiteAreaCode
        ? Number(data.worksiteAreaCode)
        : undefined,
      worksite_vill_ward: data.worksiteVillageWard
        ? Number(data.worksiteVillageWard)
        : undefined,
      worksite_ps: data.worksitePoliceStation || "",
      worksite_pin: data.worksitePinCode
        ? Number(data.worksitePinCode)
        : undefined,
    };

    console.log("PAYLOAD:", payload);

    try {
      if (isEdit && id) {
        console.log("CALLING EDIT API");
        console.log("EDIT ID:", id);

        const response = await editContractor(id, payload);

        console.log("EDIT API SUCCESS");
        console.log("EDIT RESPONSE:", response);
      } else {
        console.log("CALLING CREATE API");

        const response = await createContractor(payload);

        console.log("CREATE API SUCCESS");
        console.log("CREATE RESPONSE:", response);
      }

      console.log("NAVIGATING TO LIST");

      navigate(ROUTE_CONTRACTOR_LIST);
    } catch (err) {
      console.error("EDIT/CREATE API FAILED");
      console.error(err);

      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save contractor.";

      toast.error(message);
    }
  };

  const handleBack = () => navigate(ROUTE_CONTRACTOR_LIST);

  if (isEdit && loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <h1 className="text-xl font-semibold mb-4">EDIT CONTRACTOR</h1>
        <div className="flex items-center justify-center py-12 text-gray-500">
          Loading contractor...
        </div>
        <button type="submit" className="text-blue-600 text-sm hover:underline" onClick={handleBack}>
          BACK TO CONTRACTOR LIST
        </button>
      </div>
    );
  }

  if (isEdit && loadError) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <h1 className="text-xl font-semibold mb-4">EDIT CONTRACTOR</h1>
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {loadError}
        </div>
        <div className="mt-4">
          <button type="submit" className="text-blue-600 text-sm hover:underline" onClick={handleBack}>
            BACK TO CONTRACTOR LIST
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-gray-100 min-h-screen p-6">
        <h1 className="text-xl font-semibold mb-4">
          {isEdit ? "EDIT CONTRACTOR" : "ADD NEW CONTRACTOR"}
        </h1>

        <div className="bg-white border rounded shadow-sm">
          <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
            PARTICULARS OF CONTRACTORS AND CONTRACT LABOUR
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                1. Name of the Contractor <span className="text-red-500">*</span>
              </label>
              <input
                {...register("contractorName")}
                className="border px-3 py-2 rounded text-sm"
              />
              <p className="text-red-500 text-xs">{errors.contractorName?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                2. Email of the Contractor <span className="text-red-500">*</span>
              </label>
              <input {...register("email")} className="border px-3 py-2 rounded text-sm" />
              <p className="text-red-500 text-xs">{errors.email?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                3. Select State <span className="text-red-500">*</span>
              </label>
              <select {...register("state")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select State -</option>
                {states.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.state?.message}</p>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <label className="text-sm font-medium mb-1">
                5.(a) Address Line1 {watch("state") !== "1" ? "[ If other State please provide detail address ] " : ""}<span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className="border px-3 py-2 rounded text-sm resize-none"
              />
              <p className="text-red-500 text-xs">{errors.address?.message}</p>
            </div>

            {selectedState === "1" && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(b) Select District <span className="text-red-500">*</span></label>
                  <select {...register("district")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select District -</option>
                    {districtOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.district?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(c) Select Subdivision <span className="text-red-500">*</span></label>
                  <select {...register("subdivision")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select Subdivision -</option>
                    {subdivisionOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.subdivision?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(d) Select Area Type <span className="text-red-500">*</span></label>
                  <select {...register("areaType")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select Area Type -</option>
                    {areaTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.areaType?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(e) Select {AREA_TYPE_LABELS[selectedAreaType] || "Area"} <span className="text-red-500">*</span></label>
                  <select {...register("areaCode")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select -</option>
                    {areaCodeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.areaCode?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(f) Select Village/Ward <span className="text-red-500">*</span></label>
                  <select {...register("villageWard")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select -</option>
                    {villageWardOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.villageWard?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(g) Select Police Station <span className="text-red-500">*</span></label>
                  <select {...register("policeStation")} className="border px-3 py-2 rounded text-sm">
                    <option value="">- Select Police Station -</option>
                    {policeStationOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-red-500 text-xs">{errors.policeStation?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">5.(h) PIN Code <span className="text-red-500">*</span></label>
                  <input {...register("pinCode")} className="border px-3 py-2 rounded text-sm" maxLength={6} />
                  <p className="text-red-500 text-xs">{errors.pinCode?.message}</p>
                </div>
              </>
            )}

            <div className="md:col-span-2 flex flex-col">
              <label className="text-sm font-medium mb-1">
                6. Nature of Work <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                {...register("natureOfWork")}
                className="border px-3 py-2 rounded text-sm h-[90px]"
              >
                {natureOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.natureOfWork?.message}</p>
            </div>

            {showOther && (
              <div className="md:col-span-2 flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Other Option for Nature of Work <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("otherNature")}
                  className="border px-3 py-2 rounded text-sm"
                />
                <p className="text-red-500 text-xs">{errors.otherNature?.message}</p>
              </div>
            )}

            <div className="md:col-span-2 flex flex-col">
              <label className="text-sm font-medium mb-1">
                7. Maximum Number of Contractor Labour <span className="text-red-500">*</span>
              </label>
              <input
                {...register("maxLabour")}
                className="border px-3 py-2 rounded text-sm"
              />
              <p className="text-red-500 text-xs">{errors.maxLabour?.message}</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                8. Estimated Date of Employment <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <input
                    type="date"
                    {...register("fromDate")}
                    onClick={isIssuedContractor ? undefined : openNativeDatePicker}
                    readOnly={isIssuedContractor}
                    min={
                      !isIssuedContractor && regCertIssueDate
                        ? regCertIssueDate
                        : undefined
                    }
                    className={`border px-3 py-2 rounded text-sm ${
                      isIssuedContractor
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {isIssuedContractor
                      ? "Starting Date of Work cannot be changed for an already issued contractor."
                      : regCertIssueDate
                        ? `Pick from date: dd-mm-yyyy (on/after ${toDisplayDate(regCertIssueDate)})`
                        : "Pick from date: dd-mm-yyyy"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <input
                    type="date"
                    {...register("toDate")}
                    onClick={openNativeDatePicker}
                    className="border px-3 py-2 rounded text-sm"
                  />
                  <span className="text-xs text-gray-500 mt-1">Pick to date: dd-mm-yyyy</span>
                </div>
                <div className="flex flex-col">
                  <input
                    {...register("totalDays")}
                    className="border px-3 py-2 rounded text-sm"
                    readOnly
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {/* Kindly Provide the no of days manually. */}
                    Auto-calculated from from/to dates.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded shadow-sm mt-6">
          <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
            WORKSITE ADDRESS
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex flex-col">
              <label className="text-sm font-medium mb-1">
                1. Full Address
              </label>
              <textarea
                {...register("worksiteAddress")}
                rows={2}
                className="border px-3 py-2 rounded text-sm resize-none"
              />
              <p className="text-red-500 text-xs">{errors.worksiteAddress?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">2. Select District</label>
              <select {...register("worksiteDistrict")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select District -</option>
                {worksiteDistrictOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksiteDistrict?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">3. Select Subdivision</label>
              <select {...register("worksiteSubdivision")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select Subdivision -</option>
                {worksiteSubdivisionOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksiteSubdivision?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">4. Select Area Type <span className="text-red-500">*</span></label>
              <select {...register("worksiteAreaType")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select Area Type -</option>
                {worksiteAreaTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksiteAreaType?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">5. Select {AREA_TYPE_LABELS[worksiteAreaType] || "Area"} <span className="text-red-500">*</span></label>
              <select {...register("worksiteAreaCode")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select -</option>
                {worksiteAreaCodeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksiteAreaCode?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">6. Select Village/Ward <span className="text-red-500">*</span></label>
              <select {...register("worksiteVillageWard")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select -</option>
                {worksiteVillageWardOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksiteVillageWard?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">7. Select Police Station <span className="text-red-500">*</span></label>
              <select {...register("worksitePoliceStation")} className="border px-3 py-2 rounded text-sm">
                <option value="">- Select Police Station -</option>
                {worksitePoliceStationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-red-500 text-xs">{errors.worksitePoliceStation?.message}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">8. PIN</label>
              <input {...register("worksitePinCode")} className="border px-3 py-2 rounded text-sm" maxLength={6} />
              <p className="text-red-500 text-xs">{errors.worksitePinCode?.message}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 pb-6">
          <button
            type="button"
            className="text-blue-600 text-sm hover:underline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            BACK TO CONTRACTOR LIST
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#2A628C]"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting
              ? isEdit
                ? "UPDATING..."
                : "SAVING..."
              : isEdit
                ? "UPDATE"
                : "SAVE"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContractorForm;
