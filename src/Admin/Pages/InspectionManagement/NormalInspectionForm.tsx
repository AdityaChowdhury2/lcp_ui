import { API_BASE } from "@/constants/constants";
import { getUserId, getUserRole } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import CaseTimeline, {
  StatusBadge,
  type CaseStatus,
  type TimelineEvent,
} from "./CaseTimeline";
import { CourtCaseProcedurePanel } from "./CourtCaseProceedingPage";
import { FaTrash } from "react-icons/fa";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Employer {
  id: number;
  name: string;
  employer_type: string;
  gender: string;
  other_name: string;
  contractor_office_name: string;
  contractor_nature_of_job: string;
  contractor_nature_other: string;
  country: string;
  other_country: string;
  state: string;
  address: string;
  district: string;
  districtName?: string;
  sub_division: string;
  subDivisionName?: string;
  block: string;
  blockName?: string;
  gp_ward: string;
  gpWardName?: string;
  police: string;
  policeName?: string;
  pin_number: string;
  mobile: string;
  email: string;
}

interface AddedAct {
  id: number;
  act: string;
  selections: Record<number, string>; // lawId -> edited text
}

interface Props {
  randId: string | null;
  source: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
export const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getFourteenDaysAgoDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const minInspectionDate = getFourteenDaysAgoDateStr();
export const maxInspectionDate = getTodayDateStr();

export const validateInspectionDate = (dateVal: string): string | null => {
  if (!dateVal) return "Please choose Date of Inspection";
  const minDate = getFourteenDaysAgoDateStr();
  const maxDate = getTodayDateStr();
  if (dateVal > maxDate) {
    return "Date of Inspection cannot be in the future";
  }
  if (dateVal < minDate) {
    return "Date of Inspection must be within the last 14 days (cannot choose past 14 days)";
  }
  return null;
};

export const MIN_INSPECTION_TIME = "09:00";
export const MAX_INSPECTION_TIME = "21:00";

export const validateInspectionTime = (
  timeStr: string,
  fieldLabel = "Time",
): string | null => {
  if (!timeStr) return `Please select ${fieldLabel}`;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return `Invalid ${fieldLabel} format`;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const totalMinutes = hours * 60 + minutes;
  // 9:00 AM (540 mins) to 9:00 PM (1260 mins)
  if (totalMinutes < 540 || totalMinutes > 1260) {
    return `${fieldLabel} must be between morning 9:00 AM and 9:00 PM`;
  }
  return null;
};

export const validateInspectionTimeRange = (
  from: string,
  to: string,
): string | null => {
  const fromErr = validateInspectionTime(from, "From Time");
  if (fromErr) return fromErr;
  const toErr = validateInspectionTime(to, "To Time");
  if (toErr) return toErr;

  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  const fromTotal = fromH * 60 + fromM;
  const toTotal = toH * 60 + toM;

  if (toTotal <= fromTotal) {
    return "From Time must be earlier than To Time (To Time must be after From Time)";
  }
  return null;
};

export const validateComplianceDate = (
  compDate: string,
  insDate?: string,
): string | null => {
  if (!compDate) return "Please choose Compliance Date";
  if (insDate) {
    const dComp = new Date(compDate);
    const dIns = new Date(insDate);
    dComp.setHours(0, 0, 0, 0);
    dIns.setHours(0, 0, 0, 0);
    if (dComp <= dIns) {
      return "Compliance Date (To Date) must be after Date of Inspection (From Date)";
    }
  }
  return null;
};

const getDefaultInspectionTime = () => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 9 || hours >= 20) {
    return "09:00";
  }
  return `${String(hours).padStart(2, "0")}:00`;
};

const getDefaultEndTime = (startTime: string) => {
  const [h] = startTime.split(":").map(Number);
  const endH = Math.min(h + 1, 21);
  return `${String(endH).padStart(2, "0")}:00`;
};

const todayStr = getTodayDateStr();
const defaultFromTimeStr = getDefaultInspectionTime();
const defaultToTimeStr = getDefaultEndTime(defaultFromTimeStr);

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const NATURE_OF_INDUSTRY = [
  { value: "water_treatment_operation", label: "Water Treatment Operation" },
  {
    value: "maintenance_managerial_jobs",
    label: "Maintenance and Managerial Jobs",
  },
  { value: "restaurant_service", label: "Restaurant Service" },
  { value: "ac_maintenance", label: "AC Maintenance" },
  { value: "security_service", label: "Security Service" },
  { value: "manpower_supply", label: "Manpower Supply" },
  {
    value: "engineering_maintenance_service",
    label: "Engineering & Maintenance Service",
  },
  {
    value: "housekeeping_maintenance_service",
    label: "Housekeeping and Maintenance Service",
  },
  { value: "security_guard", label: "Security Guard" },
  { value: "operation_maintenance", label: "Operation & Maintenance" },
  {
    value: "horticulture_gardening_nursery_maintenance",
    label: "Horticulture, Gardening & Nursery Maintenance",
  },
  {
    value: "civil_works_construction_maintenance",
    label: "Civil Works, Construction & Maintenance",
  },
  { value: "store_maintenance", label: "Store Maintenance" },
  { value: "painting_maintenance", label: "Painting Maintenance" },
  {
    value: "electrical_works_maintenance",
    label: "Electrical Works Maintenance",
  },
  { value: "mechanical_maintenance", label: "Mechanical Maintenance" },
  { value: "crane_operation", label: "Crane Operation" },
  { value: "loading_unloading", label: "Loading & Unloading" },
  { value: "fire_operation", label: "Fire Operation" },
  { value: "bagging_operation", label: "Bagging Operation" },
  { value: "heavy_vehicle", label: "Heavy Vehicle" },
  { value: "canteen_service", label: "Canteen Service" },
  { value: "house_keeping", label: "House Keeping" },
  { value: "guest_house_services", label: "Guest House Services" },
  { value: "laboratory_works", label: "Laboratory Works" },
  { value: "fabrication_work", label: "Fabrication Work" },
  { value: "hotel", label: "Hotel" },
  { value: "trading_and_services", label: "TRADING AND SERVICES" },
  { value: "others", label: "Others" },
];

const CONTRACTOR_NATURE = [
  "Security Service",
  "Housekeeping",
  "Catering",
  "Civil Work",
  "Electrical",
  "Mechanical",
  "IT Services",
  "Manpower Supply",
  "Other",
];

// ─────────────────────────────────────────────
// SMALL UI HELPERS
// ─────────────────────────────────────────────
const Lbl: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className="block text-sm font-semibold text-gray-700">
    {children} {required && <span className="text-red-600">*</span>}
  </label>
);

const SecHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-[#2c88b9] text-white px-4 py-2 rounded-t flex items-center gap-2">
    <span className="font-semibold">{children}</span>
  </div>
);

const ic = (disabled?: boolean, err?: boolean) =>
  `w-full border rounded px-2 py-2 mt-1 text-sm focus:outline-none focus:border-[#2c88b9] ${
    err ? "border-red-500" : "border-gray-300"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const NormalInspectionForm: React.FC<Props> = ({ randId }) => {
  // ── meta ──
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [inspectionNoteId, setInspectionNoteId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [realIsSubmitted, setIsSubmitted] = useState(false);
  const [insUserId, setInsUserId] = useState<string | null>(null);
  const [insUserRoleId, setInsUserRoleId] = useState<number | null>(null);

  // ── Case timeline / normalized status ──
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [caseTimeline, setCaseTimeline] = useState<TimelineEvent[]>([]);
  const [hasAlcAction, setHasAlcAction] = useState(false);
  const [courtProcedure, setCourtProcedure] = useState<{
    remark: string;
    fileName: string;
    fileUrl: string;
  } | null>(null);

  const currentUserId = getUserId();
  const currentUserRole = Number(getUserRole());
  const isInspector = currentUserRole === 7;
  const hasEditPermission =
    isInspector &&
    (!isLocked ||
      !insUserId ||
      insUserRoleId !== 7 ||
      String(insUserId) === String(currentUserId));
  const isSubmitted = realIsSubmitted || !hasEditPermission;

  // Public "View & Download" preview — hide ALC case timeline tab
  const isPublicView =
    new URLSearchParams(window.location.search).get("public") === "true";
  const showTimelineTab =
    (hasAlcAction || realIsSubmitted || caseTimeline.length > 0) &&
    !isPublicView;
  const showProcedureTab = !!courtProcedure?.fileUrl && !isPublicView;
  const TABS = [
    "ESTABLISHMENT DETAILS",
    "OWNER/EMPLOYER DETAILS",
    "INFRINGEMENTS",
    "VERIFY & SUBMIT",
    ...(showTimelineTab ? ["CASE TIMELINE"] : []),
    ...(showProcedureTab ? ["COURT CASE PROCEDURE"] : []),
  ];
  const TIMELINE_TAB = 5;
  const PROCEDURE_TAB = showTimelineTab ? 6 : 5;

  const [uploadFiles, setUploadFiles] = useState<Record<string, File>>({});
  const [uploadedFilePaths, setUploadedFilePaths] = useState<
    Record<string, string>
  >({});
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [tab1Loading, setTab1Loading] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const isSourceDlc = queryParams.get("source") === "dlc";
  const isSourceIns = queryParams.get("source") === "ins";
  const source = queryParams.get("source") || "";

  console.log("source", source);

  // ══ TAB 1 ══
  const [typeOfInspection, setTypeOfInspection] = useState("");
  const [randomizationOrderNum, setRandomizationOrderNum] = useState("");
  const [inspectionDate, setInspectionDate] = useState(todayStr);
  const [inspectionDateError, setInspectionDateError] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState(defaultFromTimeStr);
  const [toTime, setToTime] = useState(defaultToTimeStr);
  const [fromTimeError, setFromTimeError] = useState<string | null>(null);
  const [toTimeError, setToTimeError] = useState<string | null>(null);
  const [complianceDateError, setComplianceDateError] = useState<string | null>(null);
  const [complianceTimeError, setComplianceTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (isSourceDlc) {
      setTypeOfInspection("central_routine");
    }
  }, [isSourceDlc]);

  const [natureOfIndustry, setNatureOfIndustry] = useState("");
  const [natureOfIndustryOther, setNatureOfIndustryOther] = useState("");
  const [estName, setEstName] = useState("");
  const [typeOfEst, setTypeOfEst] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  // Logged-in user's own district_code — used to lock the district field
  const [userDistrictCode, setUserDistrictCode] = useState<string | null>(null);
  const [subdivisions, setSubdivisions] = useState<any[]>([]);
  const [selectedSubdivision, setSelectedSubdivision] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [gpWards, setGpWards] = useState<any[]>([]);
  const [selectedGPWard, setSelectedGPWard] = useState("");
  const [policeStations, setPoliceStations] = useState<any[]>([]);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [personName, setPersonName] = useState("");
  const [personDesignation, setPersonDesignation] = useState("");
  const [personMobile, setPersonMobile] = useState("");
  const [directMale, setDirectMale] = useState("");
  const [directFemale, setDirectFemale] = useState("");
  const [contractMale, setContractMale] = useState("");
  const [contractFemale, setContractFemale] = useState("");
  const [otherMale, setOtherMale] = useState("");
  const [otherFemale, setOtherFemale] = useState("");
  const [workerSpec, setWorkerSpec] = useState("");

  const directTotal = (Number(directMale) || 0) + (Number(directFemale) || 0);
  const contractTotal =
    (Number(contractMale) || 0) + (Number(contractFemale) || 0);
  const otherTotal = (Number(otherMale) || 0) + (Number(otherFemale) || 0);

  // ══ TAB 2 ══
  const emptyEmp = (): Omit<Employer, "id"> => ({
    name: "",
    employer_type: "",
    gender: "",
    other_name: "",
    contractor_office_name: "",
    contractor_nature_of_job: "",
    contractor_nature_other: "",
    country: "",
    other_country: "",
    state: "",
    address: "",
    district: "",
    sub_division: "",
    block: "",
    gp_ward: "",
    police: "",
    pin_number: "",
    mobile: "",
    email: "",
  });
  const [empForm, setEmpForm] = useState<Omit<Employer, "id">>(emptyEmp());
  const setEmp = (f: keyof Omit<Employer, "id">, v: string) =>
    setEmpForm((p) => ({ ...p, [f]: v }));

  // Which conditional employer fields to show, driven by the dropdowns
  const empIsContractor = empForm.employer_type === "contractor";
  const empIsOtherType = empForm.employer_type === "other";
  const empIsNatureOther = empForm.contractor_nature_of_job === "Other";
  const empIsOtherCountry = empForm.country === "Other";
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [savingEmp, setSavingEmp] = useState(false);
  const [empSubdivisions, setEmpSubdivisions] = useState<any[]>([]);
  const [empBlocks, setEmpBlocks] = useState<any[]>([]);
  const [empGpWards, setEmpGpWards] = useState<any[]>([]);
  const [empPoliceStations, setEmpPoliceStations] = useState<any[]>([]);

  // ══ TAB 3 ══
  const [laws, setLaws] = useState<any[]>([]);
  const [lawsLoading, setLawsLoading] = useState(false);
  const [actOptions, setActOptions] = useState<string[]>([]);
  const [selectedAct, setSelectedAct] = useState("");
  const [currentActItems, setCurrentActItems] = useState<any[]>([]);
  const [currentSelections, setCurrentSelections] = useState<
    Record<number, string>
  >({});
  const [addedActs, setAddedActs] = useState<AddedAct[]>([]);
  const [savingInfr, setSavingInfr] = useState(false);

  // ══ TAB 4 ══
  const [submitting, setSubmitting] = useState(false);
  const [complianceText, setComplianceText] = useState("");
  const [compliancePlace, setCompliancePlace] = useState("");
  const [complianceDate, setComplianceDate] = useState("");
  const [complianceTime, setComplianceTime] = useState("");
  // Compliance extension states
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extNewDate, setExtNewDate] = useState("");
  const [extNewTime, setExtNewTime] = useState("");
  const [extReason, setExtReason] = useState("");
  const [extSubmitting, setExtSubmitting] = useState(false);
  // per-act additional info: actId -> {licenseNo, dateOfLicense, totalBeediWorkers, homeWorkers}
  const [actAdditionalInfo, setActAdditionalInfo] = useState<
    Record<
      number,
      {
        licenseNo: string;
        dateOfLicense: string;
        totalBeediWorkers: string;
        homeWorkers: string;
      }
    >
  >({});
  const setActInfo = (actId: number, field: string, value: string) =>
    setActAdditionalInfo((prev) => {
      const existing = prev[actId] || {
        licenseNo: "",
        dateOfLicense: "",
        totalBeediWorkers: "",
        homeWorkers: "",
      };
      return {
        ...prev,
        [actId]: {
          ...existing,
          [field]: value,
        },
      };
    });

  // ─── LOOKUP HELPERS ───
  const dName = (id: string) =>
    districts.find((d) => String(d.id) === String(id))?.district_name ||
    districts.find((d) => String(d.id) === String(id))?.name ||
    "";
  const sdName = (c: string) =>
    subdivisions.find((s) => String(s.sub_div_code) === String(c))
      ?.sub_div_name || "";
  const bName = (c: string) =>
    blocks.find((b) => String(b.block_code) === String(c))?.block_mun_name ||
    "";
  const gpName = (c: string) =>
    gpWards.find((g) => String(g.village_code) === String(c))?.village_name ||
    "";
  const psName = (c: string) =>
    policeStations.find((p) => String(p.police_station_code) === String(c))
      ?.name_of_police_station || "";
  const empDName = (id: string) =>
    districts.find((d) => String(d.id) === String(id))?.district_name ||
    districts.find((d) => String(d.id) === String(id))?.name ||
    "";
  const empSDName = (c: string) =>
    empSubdivisions.find((s) => String(s.sub_div_code) === String(c))
      ?.sub_div_name || "";
  const empBName = (c: string) =>
    empBlocks.find((b) => String(b.block_code) === String(c))?.block_mun_name ||
    "";
  const empGPName = (c: string) =>
    empGpWards.find((g) => String(g.village_code) === String(c))
      ?.village_name || "";
  const empPSName = (c: string) =>
    empPoliceStations.find((p) => String(p.police_station_code) === String(c))
      ?.name_of_police_station || "";

  // ─── EFFECTS: TAB 1 LOCATION ───
  useEffect(() => {
    axios
      .get(`${API_BASE}district`)
      .then((r) => setDistricts(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, []);

  // Fetch the logged-in user's district_code (to lock the district field)
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    axios
      .get(`${API_BASE}user-district-subdiv`)
      .then((r) => {
        const code = r.data?.result?.district_code;
        if (code !== undefined && code !== null && code !== "") {
          setUserDistrictCode(String(code));
        }
      })
      .catch(console.error);
  }, []);

  // Once districts + user's district are known, lock the district to the
  // user's own district for a new inspection (don't override a saved value).
  useEffect(() => {
    if (!userDistrictCode || districts.length === 0 || selectedDistrict) return;
    const match = districts.find(
      (d) => String(d.district_code) === String(userDistrictCode),
    );
    if (match) setSelectedDistrict(String(match.id));
  }, [userDistrictCode, districts, selectedDistrict]);

  // The district field is locked whenever we know the user's district.
  const districtLocked = !!userDistrictCode;

  useEffect(() => {
    if (!selectedDistrict) return;
    axios
      .get(`${API_BASE}subdivision/${selectedDistrict}`)
      .then((r) => setSubdivisions(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
    axios
      .get(`${API_BASE}policestation/${selectedDistrict}`)
      .then((r) => setPoliceStations(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedDistrict || !selectedSubdivision) return;
    axios
      .get(`${API_BASE}block/${selectedDistrict}/${selectedSubdivision}`)
      .then((r) => setBlocks(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [selectedDistrict, selectedSubdivision]);

  useEffect(() => {
    if (!selectedBlock) return;
    axios
      .get(`${API_BASE}villageward/${selectedBlock}`)
      .then((r) => 
        {
          console.log(r.data);
          setGpWards(Array.isArray(r.data) ? r.data : []);
        }
      )
      .catch(console.error);
  }, [selectedBlock]);

  // ─── EFFECTS: TAB 2 LOCATION ───
  useEffect(() => {
    if (!empForm.district) return;
    setEmpForm((p) => ({
      ...p,
      sub_division: "",
      block: "",
      gp_ward: "",
      police: "",
    }));
    setEmpSubdivisions([]);
    setEmpBlocks([]);
    setEmpGpWards([]);
    setEmpPoliceStations([]);
    axios
      .get(`${API_BASE}subdivision/${empForm.district}`)
      .then((r) => setEmpSubdivisions(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
    axios
      .get(`${API_BASE}policestation/${empForm.district}`)
      .then((r) => setEmpPoliceStations(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [empForm.district]);

  useEffect(() => {
    if (!empForm.district || !empForm.sub_division) return;
    setEmpForm((p) => ({ ...p, block: "", gp_ward: "" }));
    setEmpBlocks([]);
    setEmpGpWards([]);
    axios
      .get(`${API_BASE}block/${empForm.district}/${empForm.sub_division}`)
      .then((r) => setEmpBlocks(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [empForm.district, empForm.sub_division]);

  useEffect(() => {
    if (!empForm.block) return;
    setEmpForm((p) => ({ ...p, gp_ward: "" }));
    setEmpGpWards([]);
    axios
      .get(`${API_BASE}villageward/${empForm.block}`)
      .then((r) => setEmpGpWards(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [empForm.block]);

  // ─── EFFECT: LAWS ───
  useEffect(() => {
    setLawsLoading(true);
    axios
      .get(`${API_BASE}inspections/law/get-laws`)
      .then((r) => {
        const data: any[] = r.data?.data || [];
        setLaws(data);
        const unique = [
          ...new Set(data.map((l: any) => l.inspection_name).filter(Boolean)),
        ] as string[];
        setActOptions(unique);
      })
      .catch(() => toast.error("Failed to load laws"))
      .finally(() => setLawsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAct) {
      setCurrentActItems([]);
      setCurrentSelections({});
      return;
    }
    setCurrentActItems(laws.filter((l) => l.inspection_name === selectedAct));
    const existing = addedActs.find((a) => a.act === selectedAct);
    setCurrentSelections(existing ? existing.selections : {});
  }, [selectedAct, laws]);

  // Loads an already-started inspection. `randId` is either an ins_file_number
  // (resuming a draft) or a randomization assignment id (opened from the order
  // list) — the backend resolves both and always answers with the real file
  // number, so nothing here needs to tell them apart.
  useEffect(() => {
    if (!randId || laws.length === 0 || previewLoaded) return;

    axios
      .get(`${API_BASE}inspections/normal-preview/${randId}`)
      .then((res) => {
        const {
          locked,
          submitted,
          inspectionNoteId: loadedNoteId,
          insUserId: loadedInsUserId,
          insUserRoleId: loadedInsUserRoleId,
          data,
        } = res.data;
        setPreviewLoaded(true);
        if (!locked) return;

        setInspectionNoteId(loadedNoteId);
        setIsLocked(locked);
        setIsSubmitted(submitted);
        setInsUserId(loadedInsUserId || null);
        setInsUserRoleId(loadedInsUserRoleId || null);

        if (data) {
          if (data.typeOfInspection) setTypeOfInspection(data.typeOfInspection);
          if (data.randomizationOrderNum)
            setRandomizationOrderNum(data.randomizationOrderNum);
          if (data.inspectionDate) setInspectionDate(data.inspectionDate);
          if (data.fromTime) setFromTime(data.fromTime);
          if (data.toTime) setToTime(data.toTime);
          if (data.natureOfIndustry) setNatureOfIndustry(data.natureOfIndustry);
          if (data.natureOfIndustryOther)
            setNatureOfIndustryOther(data.natureOfIndustryOther);
          if (data.estName) setEstName(data.estName);
          if (data.typeOfEst) setTypeOfEst(data.typeOfEst);
          if (data.addressLine1) setAddressLine1(data.addressLine1);

          if (data.selectedDistrict) setSelectedDistrict(data.selectedDistrict);
          if (data.selectedSubdivision)
            setSelectedSubdivision(data.selectedSubdivision);
          if (data.selectedBlock) setSelectedBlock(data.selectedBlock);
          if (data.selectedGPWard) setSelectedGPWard(data.selectedGPWard);
          if (data.selectedPoliceStation)
            setSelectedPoliceStation(data.selectedPoliceStation);
          if (data.pinCode) setPinCode(data.pinCode);

          if (data.personPresent) {
            setPersonName(data.personPresent.name || "");
            setPersonDesignation(data.personPresent.designation || "");
            setPersonMobile(data.personPresent.mobile || "");
          }

          if (data.employmentDetails) {
            setDirectMale(data.employmentDetails.direct_male || 0);
            setDirectFemale(data.employmentDetails.direct_female || 0);
            setContractMale(data.employmentDetails.contract_male || 0);
            setContractFemale(data.employmentDetails.contract_female || 0);
            setOtherMale(data.employmentDetails.other_male || 0);
            setOtherFemale(data.employmentDetails.other_female || 0);
            setWorkerSpec(data.employmentDetails.worker_spec || "");
          }

          if (Array.isArray(data.employers)) {
            setEmployers(data.employers);
          }

          if (Array.isArray(data.infringements)) {
            const tempActs: Record<string, Record<number, string>> = {};
            const pathMap: Record<string, string> = {};
            data.infringements.forEach((inf: any, infIdx: number) => {
              const matchedLaw = laws.find(
                (l) => l.ispection_id === inf.infra_id,
              );
              const actName = (
                matchedLaw?.inspection_name ||
                inf.infring_name ||
                inf.act ||
                "General Labour Law"
              ).trim();

              if (!tempActs[actName]) {
                tempActs[actName] = {};
              }
              const key = inf.infra_id || (inf.cust_infring_id ? inf.cust_infring_id : infIdx + 1);
              tempActs[actName][key] =
                inf.ins_remark || matchedLaw?.inspection_txt || inf.infring_name || "";

              if (inf.uploaded_file_path) {
                pathMap[String(key)] = inf.uploaded_file_path;
              }
            });

            const reconstructedAddedActs = Object.entries(tempActs).map(
              ([actName, selections], idx) => ({
                id: Date.now() + idx,
                act: actName,
                selections,
              }),
            );
            setAddedActs(reconstructedAddedActs);
            setUploadedFilePaths(pathMap);
          }

          if (data.compliance_text) setComplianceText(data.compliance_text);
          if (data.compliance_place) setCompliancePlace(data.compliance_place);
          if (data.compliance_date) setComplianceDate(data.compliance_date);
          if (data.compliance_time) setComplianceTime(data.compliance_time);
        }
        setPreviewLoaded(true);
      })
      .catch(console.error);
  }, [randId, laws, previewLoaded]);

  // ─── CASE TIMELINE + NORMALIZED STATUS ───
  const fetchCaseTimeline = React.useCallback(() => {
    if (!randId || isPublicView) return;
    axios
      .get(
        `${API_BASE}inspections/case-timeline?fileNo=${encodeURIComponent(randId)}`,
      )
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;
        setCaseStatus(data.currentStatus || null);
        setCaseTimeline(Array.isArray(data.timeline) ? data.timeline : []);
        setHasAlcAction(!!data.hasAlcAction);
      })
      .catch(console.error);
  }, [randId, isPublicView]);

  useEffect(() => {
    fetchCaseTimeline();
  }, [fetchCaseTimeline]);

  useEffect(() => {
    if (!randId || isPublicView || caseStatus?.code !== "COURT_CASE") return;
    axios
      .get(`${API_BASE}inspections/court-case-proceeding`, { params: { fileNo: randId } })
      .then((res) => {
        const data = res.data?.data;
        if (data?.fileUrl) {
          setCourtProcedure({
            remark: data.remark || "",
            fileName: data.fileName || "",
            fileUrl: data.fileUrl,
          });
        }
      })
      .catch(() => {});
  }, [randId, isPublicView, caseStatus?.code]);

  // ─── EXTEND COMPLIANCE DATE & TIME ───
  const handleExtendCompliance = async () => {
    if (!extNewDate) {
      toast.error("Please select a new compliance date");
      return;
    }
    if (inspectionDate && extNewDate <= inspectionDate) {
      toast.error("Extended compliance date must be after original inspection date");
      return;
    }

    setExtSubmitting(true);
    try {
      const activeFileNo = inspectionNoteId || randId;
      const res = await axios.post(
        `${API_BASE}inspections/extend-compliance-date`,
        {
          fileNo: activeFileNo,
          newComplianceDate: extNewDate,
          newComplianceTime: extNewTime,
          reason: extReason,
          userId: currentUserId ? Number(currentUserId) : undefined,
        },
      );

      if (res.data?.status || res.status === 200 || res.status === 201) {
        toast.success(
          "Compliance date extended successfully. Recorded in Case Timeline.",
        );
        setComplianceDate(extNewDate);
        if (extNewTime) setComplianceTime(extNewTime);
        setShowExtendModal(false);
        setExtReason("");
        fetchCaseTimeline();
      } else {
        toast.error(res.data?.message || "Failed to extend compliance date");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to extend compliance date",
      );
    } finally {
      setExtSubmitting(false);
    }
  };

  // ─── TAB 1: SAVE ───
  const handleTab1Save = async () => {
    if (!typeOfInspection) {
      toast.error("Please select type of inspection");
      return;
    }
    const dateErr = validateInspectionDate(inspectionDate);
    if (dateErr) {
      toast.error(dateErr);
      setInspectionDateError(dateErr);
      return;
    }
    const timeRangeErr = validateInspectionTimeRange(fromTime, toTime);
    if (timeRangeErr) {
      toast.error(timeRangeErr);
      if (timeRangeErr.includes("From Time")) setFromTimeError(timeRangeErr);
      if (timeRangeErr.includes("To Time")) setToTimeError(timeRangeErr);
      return;
    }
    if (!natureOfIndustry) {
      toast.error("Please select nature of industry/business");
      return;
    }
    if (natureOfIndustry === "others" && !natureOfIndustryOther.trim()) {
      toast.error("Please specify other nature of industry/business");
      return;
    }
    if (!estName.trim()) {
      toast.error("Please enter establishment name");
      return;
    }
    if (!typeOfEst) {
      toast.error("Please select type of establishment");
      return;
    }
    if (!addressLine1.trim()) {
      toast.error("Please enter address");
      return;
    }
    if (!selectedDistrict) {
      toast.error("Please select district");
      return;
    }
    if (!selectedSubdivision) {
      toast.error("Please select sub-division");
      return;
    }
    if (!selectedBlock) {
      toast.error("Please select block");
      return;
    }
    if (!selectedPoliceStation) {
      toast.error("Please select police station");
      return;
    }
    if (!pinCode.trim()) {
      toast.error("Please enter pin code");
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pinCode.trim())) {
      toast.error("Pin code must be a valid 6-digit number");
      return;
    }
    if (!personMobile.trim()) {
      toast.error("Please enter the person present mobile number");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(personMobile.trim())) {
      toast.error("Person present mobile number must be a valid 10-digit number");
      return;
    }
    try {
      setTab1Loading(true);
      const res = await axios.post(`${API_BASE}inspections/save-normal-tab1`, {
        userId: getUserId(),
        randId: inspectionNoteId || randId || null,
        type_of_inspection: typeOfInspection,
        randomization_order_no: randomizationOrderNum,
        inspection_date: inspectionDate,
        from_time: fromTime,
        to_time: toTime,
        nature_of_industry: natureOfIndustry,
        nature_of_industry_other: natureOfIndustryOther,
        establishment_name: estName,
        est_type: typeOfEst,
        est_address: addressLine1,
        district: selectedDistrict,
        sub_div: selectedSubdivision,
        block: selectedBlock,
        ward: selectedGPWard,
        police_station: selectedPoliceStation,
        pin: pinCode ? Number(pinCode) : null,
        person_present: {
          name: personName,
          designation: personDesignation,
          mobile: personMobile,
        },
        employment_details: {
          direct_male: Number(directMale) || 0,
          direct_female: Number(directFemale) || 0,
          contract_male: Number(contractMale) || 0,
          contract_female: Number(contractFemale) || 0,
          other_male: Number(otherMale) || 0,
          other_female: Number(otherFemale) || 0,
          worker_spec: workerSpec,
        },
      });
      if (res.data?.status) {
        // Switch over to the real file number: `randId` may still be the
        // randomization assignment id we were opened with.
        setInspectionNoteId(res.data.data.id);
        if (res.data.data.randomizationOrderNum) {
          setRandomizationOrderNum(res.data.data.randomizationOrderNum);
        }
        setIsLocked(true);
        setInsUserId(currentUserId);
        setInsUserRoleId(currentUserRole);
        toast.success(res.data.message || "Establishment details saved!");
        setActiveTab(2);
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to save establishment details",
      );
    } finally {
      setTab1Loading(false);
    }
  };

  // ─── TAB 2: SAVE EMPLOYER ───
  const handleSaveEmployer = async (addMore = false) => {
    if (!empForm.name.trim()) {
      toast.error("Please enter employer name");
      return;
    }
    if (!empForm.gender) {
      toast.error("Please select gender");
      return;
    }
    if (!empForm.employer_type) {
      toast.error("Please select employer type");
      return;
    }
    if (empForm.employer_type === "other" && !empForm.other_name.trim()) {
      toast.error("Please specify other employer name");
      return;
    }
    if (
      empForm.employer_type === "contractor" &&
      !empForm.contractor_office_name.trim()
    ) {
      toast.error("Please enter contractor office name");
      return;
    }
    if (
      empForm.employer_type === "contractor" &&
      !empForm.contractor_nature_of_job
    ) {
      toast.error("Please select contractor nature of job");
      return;
    }
    if (
      empForm.employer_type === "contractor" &&
      empForm.contractor_nature_of_job === "Other" &&
      !empForm.contractor_nature_other.trim()
    ) {
      toast.error("Please specify other contractor nature of job");
      return;
    }
    if (!empForm.country) {
      toast.error("Please select country");
      return;
    }
    if (empForm.country === "Other" && !empForm.other_country.trim()) {
      toast.error("Please specify other country name");
      return;
    }
    if (!empForm.state) {
      toast.error("Please select state");
      return;
    }
    if (!empForm.address.trim()) {
      toast.error("Please enter address");
      return;
    }
    if (!empForm.pin_number.trim()) {
      toast.error("Please enter pin number");
      return;
    }
    if (!/^[1-9]\d{5}$/.test(empForm.pin_number.trim())) {
      toast.error("Pin number must be a valid 6-digit number");
      return;
    }
    if (!empForm.mobile.trim()) {
      toast.error("Please enter employer mobile number");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(empForm.mobile.trim())) {
      toast.error("Employer mobile number must be a valid 10-digit number");
      return;
    }
    if (
      empForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empForm.email.trim())
    ) {
      toast.error("Please enter a valid email address");
      return;
    }
    const newEmp: Employer = {
      id: Date.now(),
      ...empForm,
      district: empDName(empForm.district),
      sub_division: empSDName(empForm.sub_division),
      block: empBName(empForm.block),
      gp_ward: empGPName(empForm.gp_ward),
      police: empPSName(empForm.police),
    };
    setSavingEmp(true);
    try {
      const res = await axios.post(`${API_BASE}inspections/save-employer`, {
        ...newEmp,
        inspection_note_id: inspectionNoteId,
      });
      if (res.data?.status && res.data.data?.workerId) {
        newEmp.id = res.data.data.workerId;
      }
    } catch {
      /* save locally even if API absent */
    } finally {
      setSavingEmp(false);
    }
    setEmployers((prev) => [...prev, newEmp]);
    toast.success("Employer saved!");
    if (addMore) setEmpForm(emptyEmp());
  };

  const handleDeleteEmployer = async (empId: number) => {
    setEmployers((prev) => prev.filter((e) => e.id !== empId));
    if (empId < 1000000 && inspectionNoteId) {
      try {
        await axios.delete(
          `${API_BASE}inspections/delete-employer/${inspectionNoteId}/${empId}`,
        );
        toast.success("Employer deleted!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete employer");
      }
    } else {
      toast.success("Employer removed!");
    }
  };

  // ─── TAB 3: INFRINGEMENTS ───
  const toggleInfringement = (lawId: number, defaultText: string) => {
    setCurrentSelections((prev) => {
      if (prev[lawId] !== undefined) {
        const c = { ...prev };
        delete c[lawId];
        return c;
      }
      return { ...prev, [lawId]: defaultText };
    });
  };

  const handleAddAct = () => {
    if (!selectedAct) {
      toast.error("Please select an act");
      return;
    }
    const existIdx = addedActs.findIndex((a) => a.act === selectedAct);
    if (existIdx >= 0) {
      setAddedActs((prev) => {
        const c = [...prev];
        c[existIdx] = { ...c[existIdx], selections: { ...currentSelections } };
        return c;
      });
      toast.success("Act updated!");
    } else {
      setAddedActs((prev) => [
        ...prev,
        {
          id: Date.now(),
          act: selectedAct,
          selections: { ...currentSelections },
        },
      ]);
      toast.success("Act added!");
    }
    setSelectedAct("");
    setCurrentActItems([]);
    setCurrentSelections({});
  };

  const handleSaveInfringements = async () => {
    const allSelected: any[] = [];
    const combinedActs: Record<string, Record<number, string>> = {};

    addedActs.forEach((aa) => {
      combinedActs[aa.act] = { ...aa.selections };
    });

    if (selectedAct) {
      combinedActs[selectedAct] = { ...currentSelections };
    }

    Object.entries(combinedActs).forEach(([actName, selections]) => {
      Object.entries(selections).forEach(([idStr, text]) => {
        const law = laws.find((l) => l.ispection_id === Number(idStr));
        allSelected.push({
          inspectorId: getUserId(),
          infringId: Number(idStr),
          infringText: text || law?.inspection_txt || "",
          remark: text || "",
          fileNo: inspectionNoteId,
          inspectionId: inspectionNoteId,
          ins_file_number: inspectionNoteId,
          act: actName,
          infringType: law?.inspection_txt_type || "",
          isCentral: false,
        });
      });
    });

    if (allSelected.length === 0) {
      toast.error(
        "Please select at least one statutory infringement under an Act before proceeding to Verify & Submit",
      );
      return;
    }

    try {
      setSavingInfr(true);
      const res = await axios.post(
        `${API_BASE}inspections/infringments`,
        allSelected,
      );
      if (res.data?.success || res.data?.status) {
        toast.success("Infringements saved!");
        const newAddedActs = Object.entries(combinedActs)
          .map(([act, selections]) => ({
            id: Date.now() + Math.random(),
            act,
            selections,
          }))
          .filter((aa) => Object.keys(aa.selections).length > 0);
        setAddedActs(newAddedActs);
        setActiveTab(4);
      }
    } catch {
      toast.error("Failed to save infringements");
    } finally {
      setSavingInfr(false);
    }
  };

  // ─── TAB 4: FINAL SUBMIT ───
  const handleFinalSubmit = async () => {
    const dateErr = validateInspectionDate(inspectionDate);
    if (dateErr) {
      toast.error(dateErr);
      setActiveTab(1);
      return;
    }

    if (!isSubmitted && addedActs.length > 0) {
      for (const act of addedActs) {
        const entries = Object.entries(act.selections || {});
        for (let i = 0; i < entries.length; i++) {
          const [lawIdStr] = entries[i];
          const picked = uploadFiles[lawIdStr];
          const hasFile = !!picked || !!uploadedFilePaths[lawIdStr];
          if (!hasFile) {
            toast.error(
              `Please upload the inspection note for infringement #${i + 1} under ${act.act}`,
            );
            return;
          }
          if (picked) {
            const isPdf =
              picked.type === "application/pdf" ||
              picked.name.toLowerCase().endsWith(".pdf");
            if (!isPdf) {
              toast.error("Infringement documents must be PDF only.");
              return;
            }
            if (picked.size > 200 * 1024) {
              toast.error("Infringement PDF must not exceed 200 KB.");
              return;
            }
          }
        }
      }
    }
    if (!compliancePlace.trim()) {
      toast.error("Please enter compliance place");
      return;
    }
    if (!complianceDate) {
      toast.error("Please select compliance date");
      return;
    }
    const compDateErr = validateComplianceDate(complianceDate, inspectionDate);
    if (compDateErr) {
      toast.error(compDateErr);
      setComplianceDateError(compDateErr);
      return;
    }
    const timeRangeErr = validateInspectionTimeRange(fromTime, toTime);
    if (timeRangeErr) {
      toast.error(timeRangeErr);
      setActiveTab(1);
      return;
    }
    if (!complianceTime) {
      toast.error("Please enter compliance time");
      return;
    }
    const compTimeErr = validateInspectionTime(complianceTime, "Compliance Time");
    if (compTimeErr) {
      toast.error(compTimeErr);
      return;
    }
    try {
      setSubmitting(true);
      const infringementsPayload: any[] = [];
      addedActs.forEach((aa) => {
        Object.entries(aa.selections).forEach(([idStr, text]) => {
          const law = laws.find((l) => l.ispection_id === Number(idStr));
          infringementsPayload.push({
            infringId: Number(idStr),
            infringText: text || law?.inspection_txt || "",
            remark: text || "",
            act: aa.act,
            infringType: law?.inspection_txt_type || "",
          });
        });
      });

      const payload = {
        userId: getUserId(),
        fileNo: inspectionNoteId,
        establishment_name: estName,
        type_of_inspection: typeOfInspection,
        randomization_order_no: randomizationOrderNum,
        inspection_date: inspectionDate,
        from_time: fromTime,
        to_time: toTime,
        nature_of_industry: natureOfIndustry,
        nature_of_industry_other: natureOfIndustryOther,
        est_type: typeOfEst,
        est_address: addressLine1,
        district: selectedDistrict,
        sub_div: selectedSubdivision,
        block: selectedBlock,
        ward: selectedGPWard,
        police_station: selectedPoliceStation,
        pin: pinCode ? Number(pinCode) : null,
        person_present: {
          name: personName,
          designation: personDesignation,
          mobile: personMobile,
        },
        employment_details: {
          direct_male: Number(directMale) || 0,
          direct_female: Number(directFemale) || 0,
          contract_male: Number(contractMale) || 0,
          contract_female: Number(contractFemale) || 0,
          other_male: Number(otherMale) || 0,
          other_female: Number(otherFemale) || 0,
          worker_spec: workerSpec,
        },
        employers: employers.map((emp) => ({
          name: emp.name,
          employer_type: emp.employer_type,
          gender: emp.gender,
          other_name: emp.other_name,
          contractor_office_name: emp.contractor_office_name,
          contractor_nature_of_job: emp.contractor_nature_of_job,
          contractor_nature_other: emp.contractor_nature_other,
          country: emp.country,
          other_country: emp.other_country,
          state: emp.state,
          address: emp.address,
          district: emp.district,
          sub_division: emp.sub_division,
          block: emp.block,
          gp_ward: emp.gp_ward,
          police: emp.police,
          pin_number: emp.pin_number,
          mobile: emp.mobile,
          email: emp.email,
        })),
        infringements: infringementsPayload,
        compliance_text: complianceText,
        compliance_place: compliancePlace,
        compliance_date: complianceDate,
        compliance_time: complianceTime,
      };
      const res = await axios.post(
        `${API_BASE}inspections/normal-submit`,
        payload,
      );
      if (res.data?.success || res.data?.status) {
        if (Object.keys(uploadFiles).length > 0) {
          try {
            const formData = new FormData();
            formData.append("fileNo", String(inspectionNoteId || ""));

            Object.entries(uploadFiles).forEach(([lawIdStr, file]) => {
              formData.append("files", file);
              formData.append("infraIds", lawIdStr);
              const law = laws.find((l) => l.ispection_id === Number(lawIdStr));
              const typeOfInfring = law?.inspection_txt_type || "1";
              formData.append("types", typeOfInfring);
            });

            const uploadRes = await axios.post(
              `${API_BASE}inspections/final-submit`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } },
            );
            if (uploadRes.data?.success || uploadRes.data?.status) {
              const paths = uploadRes.data?.data?.filePaths || [];
              const pathMap: Record<string, string> = { ...uploadedFilePaths };
              Object.keys(uploadFiles).forEach((lawIdStr, index) => {
                if (paths[index]) {
                  pathMap[lawIdStr] = paths[index];
                }
              });
              setUploadedFilePaths(pathMap);
              toast.success("Inspection documents uploaded!");
            }
          } catch (err) {
            console.error(err);
            toast.error("Failed to upload inspection documents");
          }
        }
        toast.success("Inspection submitted successfully!");
        setIsSubmitted(true);
      }
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const canAccess = (t: number) =>
    t === 1 || isLocked || isSubmitted || !!inspectionNoteId;

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl text-gray-800">Generate New Inspection Note</h1>
        {caseStatus && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Status
            </span>
            <StatusBadge status={caseStatus} />
          </div>
        )}
      </div>
      <div className="bg-white shadow-sm">
        {/* ── TAB BAR ── */}
        <div className="flex border-b border-gray-300 overflow-x-auto">
          {TABS.map((t, i) => {
            const n = i + 1;
            const active = activeTab === n;
            const accessible = canAccess(n);
            return (
              <button
                key={t}
                onClick={() => accessible && setActiveTab(n)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0
                  ${
                    active
                      ? "border-[#1E73BE] text-gray-800"
                      : accessible
                        ? "border-transparent text-[#F2A33C] hover:text-blue-500 cursor-pointer"
                        : "border-transparent text-gray-400 cursor-not-allowed opacity-60"
                  }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {/* ═══════════════════════════════════════
              TAB 1 — ESTABLISHMENT DETAILS
          ═══════════════════════════════════════ */}
          {activeTab === 1 && (
            <div className="space-y-5">
              {/* Inspection Information */}
              <section className="border rounded border-gray-200">
                <SecHead>Inspection Information</SecHead>
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-3">
                      <Lbl required>Type of Inspection</Lbl>
                      <select
                        value={typeOfInspection}
                        onChange={(e) => setTypeOfInspection(e.target.value)}
                        disabled={isSubmitted || isSourceDlc}
                        className={ic(isSubmitted || isSourceDlc)}
                      >
                        <option value="">- Select -</option>
                        {!isSourceIns && (
                          <option value="central_routine">
                            Central/Routine Base
                          </option>
                        )}
                        <option value="complain_base">Complain Base</option>
                        <option value="surprise">Surprise</option>
                        <option value="special_drive">Special Drive</option>
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <Lbl>Randomization Order Number</Lbl>
                      <input
                        type="text"
                        value={randomizationOrderNum}
                        onChange={(e) =>
                          setRandomizationOrderNum(e.target.value)
                        }
                        disabled={isSubmitted || isSourceDlc || isSourceIns}
                        className={ic(
                          isSubmitted || isSourceDlc || isSourceIns,
                        )}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <Lbl required>Date of Inspection</Lbl>
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInspectionDate(val);
                          setInspectionDateError(validateInspectionDate(val));
                          if (complianceDate) {
                            setComplianceDateError(validateComplianceDate(complianceDate, val));
                          }
                        }}
                        min={minInspectionDate}
                        max={maxInspectionDate}
                        disabled={isSubmitted}
                        className={ic(isSubmitted, !!inspectionDateError)}
                      />
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Allowed: within last 14 days up to today
                      </span>
                      {inspectionDateError && (
                        <span className="text-[11px] text-red-600 font-semibold block mt-0.5 leading-tight">
                          {inspectionDateError}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Lbl required>From Time</Lbl>
                      <input
                        type="time"
                        value={fromTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFromTime(val);
                          const fErr = validateInspectionTime(val, "From Time");
                          setFromTimeError(fErr);
                          if (!fErr && toTime) {
                            const rangeErr = validateInspectionTimeRange(val, toTime);
                            setToTimeError(rangeErr);
                          }
                        }}
                        min={MIN_INSPECTION_TIME}
                        max={toTime && toTime <= MAX_INSPECTION_TIME ? toTime : MAX_INSPECTION_TIME}
                        disabled={isSubmitted}
                        className={ic(isSubmitted, !!fromTimeError)}
                      />
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Allowed: 9:00 AM to 9:00 PM (earlier than To Time)
                      </span>
                      {fromTimeError && (
                        <span className="text-[11px] text-red-600 font-semibold block mt-0.5 leading-tight">
                          {fromTimeError}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Lbl required>To Time</Lbl>
                      <input
                        type="time"
                        value={toTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setToTime(val);
                          const tErr = validateInspectionTime(val, "To Time");
                          if (tErr) {
                            setToTimeError(tErr);
                          } else if (fromTime) {
                            setToTimeError(validateInspectionTimeRange(fromTime, val));
                          } else {
                            setToTimeError(null);
                          }
                        }}
                        min={fromTime && fromTime >= MIN_INSPECTION_TIME ? fromTime : MIN_INSPECTION_TIME}
                        max={MAX_INSPECTION_TIME}
                        disabled={isSubmitted}
                        className={ic(isSubmitted, !!toTimeError)}
                      />
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Allowed: 9:00 AM to 9:00 PM (later than From Time)
                      </span>
                      {toTimeError && (
                        <span className="text-[11px] text-red-600 font-semibold block mt-0.5 leading-tight">
                          {toTimeError}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Lbl required>Nature of Industry/Business</Lbl>
                      <select
                        value={natureOfIndustry}
                        onChange={(e) => setNatureOfIndustry(e.target.value)}
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                      >
                        <option value="">SELECT</option>
                        {NATURE_OF_INDUSTRY.map((n) => (
                          <option key={n.value} value={n.value}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl>
                        If nature of industry/business other, please specify
                      </Lbl>
                      <input
                        type="text"
                        value={natureOfIndustryOther}
                        onChange={(e) =>
                          setNatureOfIndustryOther(e.target.value)
                        }
                        disabled={natureOfIndustry !== "others" || isSubmitted}
                        className={ic(
                          natureOfIndustry !== "others" || isSubmitted,
                        )}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Establishment Details */}
              <section className="border rounded border-gray-200">
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Lbl required>
                        Name of the Establishment/Industry/Shop
                      </Lbl>
                      <input
                        type="text"
                        value={estName}
                        onChange={(e) => setEstName(e.target.value)}
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                      />
                    </div>
                    <div>
                      <Lbl required>Type of The Establishment</Lbl>
                      <select
                        value={typeOfEst}
                        onChange={(e) => setTypeOfEst(e.target.value)}
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                      >
                        <option value="">- Select -</option>
                        <option value="micro">Micro</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Lbl required>Address Line1</Lbl>
                    <textarea
                      rows={4}
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      disabled={isSubmitted}
                      className={`${ic(isSubmitted)} resize-none`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl required>District</Lbl>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedDistrict(val);
                          setSelectedSubdivision("");
                          setBlocks([]);
                          setSelectedBlock("");
                          setGpWards([]);
                          setSelectedGPWard("");
                          setSelectedPoliceStation("");
                        }}
                        disabled={isSubmitted || districtLocked}
                        className={ic(isSubmitted || districtLocked)}
                      >
                        <option value="">- Select District -</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.district_name || d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl required>Sub-division</Lbl>
                      <select
                        value={selectedSubdivision}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedSubdivision(val);
                          setBlocks([]);
                          setSelectedBlock("");
                          setGpWards([]);
                          setSelectedGPWard("");
                        }}
                        disabled={!selectedDistrict || isSubmitted}
                        className={ic(!selectedDistrict || isSubmitted)}
                      >
                        <option value="">- Select Sub-division -</option>
                        {subdivisions.map((sd) => (
                          <option key={sd.sub_div_code} value={sd.sub_div_code}>
                            {sd.sub_div_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl required>Block/Municipality/Corporation/SEZ/NA</Lbl>
                      <select
                        value={selectedBlock}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedBlock(val);
                          setGpWards([]);
                          setSelectedGPWard("");
                        }}
                        disabled={!selectedSubdivision || isSubmitted}
                        className={ic(!selectedSubdivision || isSubmitted)}
                      >
                        <option value="">
                          Block/Municipality/Corporation/SEZ/NA
                        </option>
                        {blocks.map((b) => (
                          <option key={b.block_code} value={b.block_code}>
                            {b.block_mun_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl>GP / Ward</Lbl>
                      <select
                        value={selectedGPWard}
                        onChange={(e) => setSelectedGPWard(e.target.value)}
                        disabled={!selectedBlock || isSubmitted}
                        className={ic(!selectedBlock || isSubmitted)}
                      >
                        <option value="">GP/Ward</option>
                        {gpWards.map((v) => (
                          <option key={v.village_code} value={v.village_code}>
                            {v.village_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl required>Police Station</Lbl>
                      <select
                        value={selectedPoliceStation}
                        onChange={(e) =>
                          setSelectedPoliceStation(e.target.value)
                        }
                        disabled={!selectedDistrict || isSubmitted}
                        className={ic(!selectedDistrict || isSubmitted)}
                      >
                        <option value="">select police station</option>
                        {policeStations.map((ps) => (
                          <option
                            key={ps.police_station_code}
                            value={ps.police_station_code}
                          >
                            {ps.name_of_police_station}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl required>Pin Code</Lbl>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) =>
                          setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                        placeholder="6-digit pin code"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Person Present */}
              <section className="border rounded border-gray-200">
                <SecHead>
                  Details of Person Present at the time of Inspection
                </SecHead>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl>Name</Lbl>
                      <input
                        type="text"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                      />
                    </div>
                    <div>
                      <Lbl>Designation and other particular</Lbl>
                      <input
                        type="text"
                        value={personDesignation}
                        onChange={(e) => setPersonDesignation(e.target.value)}
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                      />
                    </div>
                    <div>
                      <Lbl required>Mobile Number</Lbl>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={personMobile}
                        onChange={(e) =>
                          setPersonMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        disabled={isSubmitted}
                        className={ic(isSubmitted)}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Workers */}
              <section className="border rounded border-gray-200">
                <SecHead>No. of workers employed</SecHead>
                <div className="p-4 space-y-5">
                  <div className="grid grid-cols-12 gap-x-6">
                    <div className="col-span-3" />
                    <div className="col-span-3 font-semibold text-sm">Male</div>
                    <div className="col-span-3 font-semibold text-sm">
                      Female
                    </div>
                    <div className="col-span-3 font-semibold text-sm">
                      Total
                    </div>
                  </div>
                  {[
                    {
                      label: "No of workman/employed directly",
                      m: directMale,
                      f: directFemale,
                      t: directTotal,
                      sm: setDirectMale,
                      sf: setDirectFemale,
                    },
                    {
                      label: "No of contract labour",
                      m: contractMale,
                      f: contractFemale,
                      t: contractTotal,
                      sm: setContractMale,
                      sf: setContractFemale,
                    },
                    {
                      label: "No of other worker if engaged",
                      m: otherMale,
                      f: otherFemale,
                      t: otherTotal,
                      sm: setOtherMale,
                      sf: setOtherFemale,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-12 gap-x-6 items-center"
                    >
                      <div className="col-span-3 text-sm font-medium text-gray-700">
                        {row.label}
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={row.m}
                        onChange={(e) => row.sm(e.target.value)}
                        disabled={isSubmitted}
                        className={`col-span-3 border rounded px-2 py-2 text-sm border-gray-300 focus:outline-none ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      <input
                        type="number"
                        min={0}
                        value={row.f}
                        onChange={(e) => row.sf(e.target.value)}
                        disabled={isSubmitted}
                        className={`col-span-3 border rounded px-2 py-2 text-sm border-gray-300 focus:outline-none ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      <input
                        value={row.t}
                        readOnly
                        className="col-span-3 border bg-gray-100 rounded px-2 py-2 text-sm border-gray-300"
                      />
                    </div>
                  ))}
                  <div>
                    <Lbl>Please specify whether ISMW/Cineworkers etc.</Lbl>
                    <input
                      type="text"
                      value={workerSpec}
                      onChange={(e) => setWorkerSpec(e.target.value)}
                      disabled={isSubmitted}
                      className={`w-1/2 border rounded px-2 py-2 mt-1 text-sm border-gray-300 focus:outline-none ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-start">
                <button
                  onClick={isSubmitted ? () => setActiveTab(2) : handleTab1Save}
                  disabled={tab1Loading}
                  className="bg-[#1E73BE] hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  {tab1Loading
                    ? "Saving..."
                    : isSubmitted
                      ? "Next"
                      : "Save & Continue"}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 2 — OWNER / EMPLOYER DETAILS
          ═══════════════════════════════════════ */}
          {activeTab === 2 && (
            <div className="space-y-5">
              {!isSubmitted && (
                <div className="border rounded border-gray-200 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl required>Name</Lbl>
                      <input
                        type="text"
                        value={empForm.name}
                        onChange={(e) => setEmp("name", e.target.value)}
                        className={ic()}
                      />
                    </div>

                    <div>
                      <Lbl required>Gender</Lbl>
                      <select
                        value={empForm.gender}
                        onChange={(e) => setEmp("gender", e.target.value)}
                        className={ic()}
                      >
                        <option value="">- Select -</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Lbl required>Employer Type</Lbl>
                      <select
                        value={empForm.employer_type}
                        onChange={(e) =>
                          setEmp("employer_type", e.target.value)
                        }
                        className={ic()}
                      >
                        <option value="">- Select -</option>
                        <option value="owner">Owner</option>
                        <option value="contractor">Contractor</option>
                        <option value="manager">Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional fields — shown only for the relevant
                      employer type / country selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {empIsOtherType && (
                      <div>
                        <Lbl required>Please specify other name</Lbl>
                        <input
                          type="text"
                          value={empForm.other_name}
                          onChange={(e) => setEmp("other_name", e.target.value)}
                          className={ic()}
                        />
                      </div>
                    )}
                    {empIsContractor && (
                      <div>
                        <Lbl required>Contractor office name</Lbl>
                        <input
                          type="text"
                          value={empForm.contractor_office_name}
                          onChange={(e) =>
                            setEmp("contractor_office_name", e.target.value)
                          }
                          className={ic()}
                        />
                      </div>
                    )}
                    {empIsContractor && (
                      <div>
                        <Lbl required>Contractor nature of job</Lbl>
                        <select
                          value={empForm.contractor_nature_of_job}
                          onChange={(e) =>
                            setEmp("contractor_nature_of_job", e.target.value)
                          }
                          className={ic()}
                        >
                          <option value="">SELECT</option>
                          {CONTRACTOR_NATURE.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {empIsContractor && empIsNatureOther && (
                      <div>
                        <Lbl required>Specify other nature of job</Lbl>
                        <input
                          type="text"
                          value={empForm.contractor_nature_other}
                          onChange={(e) =>
                            setEmp("contractor_nature_other", e.target.value)
                          }
                          className={ic()}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Lbl required>Address</Lbl>
                    <textarea
                      rows={4}
                      value={empForm.address}
                      onChange={(e) => setEmp("address", e.target.value)}
                      className={`${ic()} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl required>Country</Lbl>
                      <select
                        value={empForm.country}
                        onChange={(e) => setEmp("country", e.target.value)}
                        className={ic()}
                      >
                        <option value="">- Select -</option>
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Lbl required>State</Lbl>
                      <select
                        value={empForm.state}
                        onChange={(e) => setEmp("state", e.target.value)}
                        className={ic()}
                      >
                        <option value="">Select State</option>
                        {[...INDIA_STATES]
                          .sort((a, b) => a.localeCompare(b))
                          .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl>District</Lbl>
                      <select
                        value={empForm.district}
                        onChange={(e) => setEmp("district", e.target.value)}
                        className={ic()}
                      >
                        <option value="">- Select District -</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.district_name || d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {empIsOtherCountry && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Lbl required>Specify other country name</Lbl>
                        <input
                          type="text"
                          value={empForm.other_country}
                          onChange={(e) =>
                            setEmp("other_country", e.target.value)
                          }
                          className={ic()}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl>Sub-Division</Lbl>
                      <select
                        value={empForm.sub_division}
                        onChange={(e) => setEmp("sub_division", e.target.value)}
                        disabled={!empForm.district}
                        className={ic(!empForm.district)}
                      >
                        <option value="">- Select Sub-Division -</option>
                        {empSubdivisions.map((sd) => (
                          <option key={sd.sub_div_code} value={sd.sub_div_code}>
                            {sd.sub_div_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl>Block/Municipality</Lbl>
                      <select
                        value={empForm.block}
                        onChange={(e) => setEmp("block", e.target.value)}
                        disabled={!empForm.sub_division}
                        className={ic(!empForm.sub_division)}
                      >
                        <option value="">- Select Block -</option>
                        {empBlocks.map((b) => (
                          <option key={b.block_code} value={b.block_code}>
                            {b.block_mun_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl>GP / Ward</Lbl>
                      <select
                        value={empForm.gp_ward}
                        onChange={(e) => setEmp("gp_ward", e.target.value)}
                        disabled={!empForm.block}
                        className={ic(!empForm.block)}
                      >
                        <option value="">- Select GP/Ward -</option>
                        {empGpWards.map((v) => (
                          <option key={v.village_code} value={v.village_code}>
                            {v.village_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Lbl>Police</Lbl>
                      <select
                        value={empForm.police}
                        onChange={(e) => setEmp("police", e.target.value)}
                        disabled={!empForm.district}
                        className={ic(!empForm.district)}
                      >
                        <option value="">- Select Police Station -</option>
                        {empPoliceStations.map((ps) => (
                          <option
                            key={ps.police_station_code}
                            value={ps.police_station_code}
                          >
                            {ps.name_of_police_station}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Lbl required>Pin Number</Lbl>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={empForm.pin_number}
                        onChange={(e) =>
                          setEmp("pin_number", e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className={ic()}
                        placeholder="6-digit pin code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Lbl required>Mobile Number</Lbl>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={empForm.mobile}
                        onChange={(e) =>
                          setEmp("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className={ic()}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div>
                      <Lbl>E-mail</Lbl>
                      <input
                        type="email"
                        value={empForm.email}
                        onChange={(e) => setEmp("email", e.target.value)}
                        className={ic()}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                    <span className="text-sm text-orange-600 italic">
                      (Click Save to add the employer. You can add more than one
                      employer.)
                    </span>
                    <button
                      onClick={() => handleSaveEmployer(true)}
                      disabled={savingEmp}
                      className="bg-[#1E73BE] hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-md text-sm font-semibold cursor-pointer"
                    >
                      {savingEmp ? "Saving..." : "SAVE"}
                    </button>
                  </div>
                </div>
              )}

              {/* Employers list */}
              {employers.length > 0 && (
                <div className="border rounded border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left font-semibold w-16">
                          Sl.No.
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Address
                        </th>
                        <th className="px-3 py-2 text-left font-semibold w-20">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.map((emp, idx) => (
                        <tr key={emp.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">
                            {emp.name}
                            {emp.employer_type && (
                              <span className="text-gray-500">
                                {" "}
                                (
                                {emp.employer_type.charAt(0).toUpperCase() +
                                  emp.employer_type.slice(1)}
                                )
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs leading-5">
                            <div>{emp.address},</div>
                            {(emp.blockName || emp.block) && (
                              <div>{emp.blockName || emp.block},</div>
                            )}
                            {(emp.subDivisionName || emp.sub_division) && (
                              <div>
                                {emp.subDivisionName || emp.sub_division},
                              </div>
                            )}
                            {(emp.districtName || emp.district) && (
                              <div>{emp.districtName || emp.district}</div>
                            )}
                            {emp.state && (
                              <div>
                                {emp.state}
                                {emp.pin_number
                                  ? `, Pin Code:${emp.pin_number}`
                                  : ""}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {!isSubmitted && (
                              <button
                                onClick={() => handleDeleteEmployer(emp.id)}
                                title="Delete"
                                className="text-red-500 hover:text-red-700 text-lg"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab(1)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (employers.length === 0 && !isSubmitted) {
                      toast.error(
                        "Please add and save at least one owner/employer before proceeding",
                      );
                      return;
                    }
                    if (empForm.name.trim() && !isSubmitted) {
                      toast.error(
                        "You have entered employer details that have not been saved yet. Click SAVE or clear the form.",
                      );
                      return;
                    }
                    setActiveTab(3);
                  }}
                  className="bg-[#1E73BE] hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 3 — INFRINGEMENTS
          ═══════════════════════════════════════ */}
          {activeTab === 3 && (
            <div className="space-y-5">
              {!isSubmitted && (
                <div>
                  <Lbl required>
                    Select any Act from dropdown for infringements details
                  </Lbl>
                  <select
                    value={selectedAct}
                    onChange={(e) => setSelectedAct(e.target.value)}
                    className="w-full max-w-2xl border rounded px-2 py-2 mt-1 text-sm border-gray-300 focus:outline-none focus:border-[#2c88b9]"
                  >
                    <option value="">-- Select Act --</option>
                    {actOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  {lawsLoading && (
                    <p className="text-xs text-gray-500 mt-1">
                      Loading acts...
                    </p>
                  )}
                </div>
              )}

              {addedActs.length > 0 && (
                <div className="border rounded border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#2c88b9] text-white">
                        <th className="px-3 py-2 text-left w-16">SL.NO.</th>
                        <th className="px-3 py-2 text-left">ACT</th>
                        <th className="px-3 py-2 text-center w-24">
                          VIEW/EDIT
                        </th>
                        <th className="px-3 py-2 text-center w-20">DELETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedActs.map((act, idx) => (
                        <tr key={act.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{act.act}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => setSelectedAct(act.act)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View/Edit
                            </button>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {!isSubmitted && (
                              <button
                                onClick={() =>
                                  setAddedActs((prev) =>
                                    prev.filter((a) => a.id !== act.id),
                                  )
                                }
                                className="text-red-500 hover:text-red-700 text-lg"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isSubmitted && (
                <div className="flex justify-end">
                  <button
                    onClick={handleAddAct}
                    disabled={!selectedAct}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer"
                  >
                    ✚ Click here to add additional information regarding the Act
                    &amp; Rule
                  </button>
                </div>
              )}

              {currentActItems.length > 0 && (
                <div className="border rounded border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#2c88b9] text-white">
                        <th className="px-3 py-2 text-left w-16">SL.NO.</th>
                        <th className="px-3 py-2 w-12">
                          <input
                            type="checkbox"
                            disabled={isSubmitted}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const all: Record<number, string> = {};
                                currentActItems.forEach((l) => {
                                  all[l.ispection_id] = l.inspection_txt || "";
                                });
                                setCurrentSelections(all);
                              } else {
                                setCurrentSelections({});
                              }
                            }}
                            checked={
                              currentActItems.length > 0 &&
                              currentActItems.every(
                                (l) =>
                                  currentSelections[l.ispection_id] !==
                                  undefined,
                              )
                            }
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="px-3 py-2 text-left">INFRINGEMENTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentActItems.map((item, idx) => {
                        const checked =
                          currentSelections[item.ispection_id] !== undefined;
                        return (
                          <tr
                            key={item.ispection_id}
                            className={`border-t ${checked ? "bg-orange-50" : ""}`}
                          >
                            <td className="px-3 py-3 align-top text-gray-600">
                              {idx + 1}.
                            </td>
                            <td className="px-3 py-3 align-top">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isSubmitted}
                                onChange={() =>
                                  toggleInfringement(
                                    item.ispection_id,
                                    item.inspection_txt || "",
                                  )
                                }
                                className="cursor-pointer mt-1"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <textarea
                                rows={2}
                                value={
                                  checked
                                    ? currentSelections[item.ispection_id]
                                    : item.inspection_txt || ""
                                }
                                onChange={(e) => {
                                  if (checked)
                                    setCurrentSelections((p) => ({
                                      ...p,
                                      [item.ispection_id]: e.target.value,
                                    }));
                                }}
                                readOnly={!checked || isSubmitted}
                                className={`w-full border rounded px-2 py-1 text-sm border-gray-300 resize-none focus:outline-none
                                  ${!checked || isSubmitted ? "bg-gray-50 cursor-default" : "bg-white focus:border-[#2c88b9]"}`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab(2)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                >
                  Previous
                </button>
                {isSubmitted ? (
                  <button
                    onClick={() => setActiveTab(4)}
                    className="bg-[#1E73BE] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSaveInfringements}
                    disabled={savingInfr}
                    className="bg-[#1E73BE] hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                  >
                    {savingInfr ? "Saving..." : "Save & Next"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 4 — VERIFY & SUBMIT
          ═══════════════════════════════════════ */}
          {activeTab === 4 && (
            <div className="space-y-5">
              {/* Establishment preview */}
              <section className="border rounded border-gray-200 overflow-hidden">
                <SecHead>Establishment / Employment / Shop Details</SecHead>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2c88b9] text-white">
                      <th className="px-4 py-2 text-left w-1/3 font-semibold">
                        PARAMETERS
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        INPUTS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Type of Inspection
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {typeOfInspection === "central_routine"
                          ? "Central/Routine Base"
                          : typeOfInspection === "complain_base"
                            ? "Complain Base"
                            : typeOfInspection === "surprise"
                              ? "Surprise"
                              : typeOfInspection === "special_drive"
                                ? "Special Drive"
                                : typeOfInspection || "-"}
                      </td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Date of Inspection
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-900">
                        {inspectionDate || "-"}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Inspection Time
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {fromTime || "-"} to {toTime || "-"}
                      </td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Name of the Establishment/Employment/Shop
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{estName || "-"}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Type of Establishment
                      </td>
                      <td className="px-4 py-3 capitalize">{typeOfEst || "-"}</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Total Workers Employed
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">
                          {Number(directTotal || 0) +
                            Number(contractTotal || 0) +
                            Number(otherTotal || 0)}
                        </span>{" "}
                        <span className="text-xs text-gray-500">
                          (Direct: {directTotal || 0}, Contract: {contractTotal || 0}, Other: {otherTotal || 0})
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Nature of industry/business
                      </td>
                      <td className="px-4 py-3">
                        {NATURE_OF_INDUSTRY.find(
                          (n) => n.value === natureOfIndustry,
                        )?.label ||
                          natureOfIndustry ||
                          "-"}
                      </td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        Address
                      </td>
                      <td className="px-4 py-3 leading-6">
                        {addressLine1 && <div>{addressLine1},</div>}
                        {(gpName(selectedGPWard) || bName(selectedBlock)) && (
                          <div>
                            {[
                              gpName(selectedGPWard),
                              bName(selectedBlock) &&
                                `${bName(selectedBlock)} Block`,
                              dName(selectedDistrict),
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                        {!gpName(selectedGPWard) &&
                          !bName(selectedBlock) &&
                          dName(selectedDistrict) && (
                            <div>{dName(selectedDistrict)}</div>
                          )}
                        {(psName(selectedPoliceStation) || pinCode) && (
                          <div>
                            {psName(selectedPoliceStation) && (
                              <>
                                <strong>Police Station:</strong>
                                {psName(selectedPoliceStation)},{" "}
                              </>
                            )}
                            {pinCode && (
                              <>
                                <strong>Pin Code:</strong>
                                {pinCode}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Person present */}
              {personName && (
                <section className="border rounded border-gray-200 overflow-hidden">
                  <SecHead>
                    Person present during this inspection Details
                  </SecHead>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#2c88b9] text-white">
                        <th className="px-4 py-2 text-left font-semibold">
                          NAME
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          DESIGNATION
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          MOBILE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3 uppercase">{personName}</td>
                        <td className="px-4 py-3 uppercase">
                          {personDesignation}
                        </td>
                        <td className="px-4 py-3">{personMobile}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              )}

              {/* Owner Details */}
              {employers.length > 0 && (
                <section className="border rounded border-gray-200 overflow-hidden">
                  <SecHead>Owner Details</SecHead>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#2c88b9] text-white">
                        <th className="px-4 py-2 text-left font-semibold">
                          NAME
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          ADDRESS
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          MOBILE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.map((emp, idx) => (
                        <tr
                          key={emp.id}
                          className={`border-t ${idx % 2 !== 0 ? "bg-gray-50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            {emp.name}
                            {emp.employer_type && (
                              <span className="text-gray-500">
                                {" "}
                                (
                                {emp.employer_type.charAt(0).toUpperCase() +
                                  emp.employer_type.slice(1)}
                                )
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">{emp.address}</td>
                          <td className="px-4 py-3">{emp.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Infringements Detected & Documents Upload per Act */}
              {addedActs.length > 0 && (
                <section className="border rounded border-gray-200 overflow-hidden space-y-4">
                  <SecHead>Infringements Detected &amp; Documents Upload Under Acts</SecHead>
                  <div className="p-4 space-y-4 bg-gray-50">
                    {addedActs.map((act, actIdx) => {
                      const selectionEntries = Object.entries(act.selections || {});
                      const infringCount = selectionEntries.length;

                      return (
                        <div
                          key={act.id || actIdx}
                          className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
                        >
                          {/* Act Header */}
                          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">
                                {act.act}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                                {infringCount} {infringCount === 1 ? "Infringement" : "Infringements"} Detected
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              Act #{actIdx + 1}
                            </span>
                          </div>

                          {/* Infringements List / Table */}
                          <div className="p-4 space-y-3">
                            {selectionEntries.length > 0 ? (
                              <div className="overflow-x-auto rounded border border-gray-200">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                      <th className="py-2.5 px-3 w-14 text-center">SL.NO.</th>
                                      <th className="py-2.5 px-3">INFRINGEMENTS DETECTED</th>
                                      <th className="py-2.5 px-3 w-[260px]">INSPECTION REMARK / DETAILS</th>
                                      <th className="py-2.5 px-3 w-[220px]">DOCUMENT UPLOAD</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {selectionEntries.map(([lawIdStr, remarkOrText], idx) => {
                                      const law = laws.find((l) => l.ispection_id === Number(lawIdStr));
                                      const statutoryClause = law?.inspection_txt || remarkOrText;
                                      const hasCustomRemark = remarkOrText && remarkOrText !== law?.inspection_txt;

                                      return (
                                        <tr key={lawIdStr} className="hover:bg-gray-50/70 transition-colors">
                                          <td className="py-2.5 px-3 text-center font-semibold text-gray-500 align-top">
                                            {idx + 1}.
                                          </td>
                                          <td className="py-2.5 px-3 text-gray-800 font-medium leading-relaxed align-top">
                                            {statutoryClause}
                                          </td>
                                          <td className="py-2.5 px-3 text-gray-700 align-top">
                                            {hasCustomRemark ? (
                                              <span className="text-blue-900 bg-blue-50 border border-blue-100 rounded px-2 py-1 block leading-normal">
                                                {remarkOrText}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 italic">
                                                Detected as per statutory provisions
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 align-top">
                                            {isSubmitted ? (
                                              uploadedFilePaths[lawIdStr] ? (
                                                <a
                                                  href={`${API_BASE.replace(/\/$/, "")}${uploadedFilePaths[lawIdStr]}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-sm"
                                                >
                                                  View Document
                                                </a>
                                              ) : (
                                                <span className="text-xs text-gray-400 italic">No document</span>
                                              )
                                            ) : (
                                              <div className="flex flex-col gap-1">
                                                <label className="inline-flex items-center gap-1.5 cursor-pointer bg-[#1E73BE] hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm w-fit">
                                                  <span>📂 Choose File</span>
                                                  <input
                                                    type="file"
                                                    accept="application/pdf,.pdf"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (!file) return;
                                                      const isPdf =
                                                        file.type === "application/pdf" ||
                                                        file.name.toLowerCase().endsWith(".pdf");
                                                      if (!isPdf) {
                                                        toast.error("Only PDF files are allowed.");
                                                        e.target.value = "";
                                                        return;
                                                      }
                                                      if (file.size > 200 * 1024) {
                                                        toast.error("PDF size must not exceed 200 KB.");
                                                        e.target.value = "";
                                                        return;
                                                      }
                                                      setUploadFiles((prev) => ({
                                                        ...prev,
                                                        [lawIdStr]: file,
                                                      }));
                                                    }}
                                                    className="hidden"
                                                  />
                                                </label>
                                                <span className="text-[10px] text-gray-500">PDF only, max 200 KB</span>
                                                {uploadFiles[lawIdStr] && (
                                                  <span className="text-[11px] text-green-700 font-semibold truncate max-w-[200px] bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                                    Selected: {uploadFiles[lawIdStr].name}
                                                  </span>
                                                )}
                                                {!uploadFiles[lawIdStr] && uploadedFilePaths[lawIdStr] && (
                                                  <a
                                                    href={`${API_BASE.replace(/\/$/, "")}${uploadedFilePaths[lawIdStr]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-blue-600 hover:underline"
                                                  >
                                                    View existing file
                                                  </a>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
                                No specific statutory clauses selected under this Act.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Compliance text + fields */}
              {/* <div className="border rounded border-gray-200 p-0 overflow-hidden">
                <textarea
                  rows={5}
                  value={complianceText}
                  onChange={(e) => setComplianceText(e.target.value)}
                  readOnly={isSubmitted}
                  className={`w-full p-4 text-sm text-[#1E73BE] resize-none focus:outline-none border-0 ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div> */}

              {/* Compliance schedule header for submitted inspections */}
              {realIsSubmitted && isInspector && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-teal-900 font-semibold text-xs flex items-center gap-1.5">
                      <span>📅 Compliance Schedule</span>
                    </span>
                    {caseTimeline.some((e) =>
                      e.key.startsWith("compliance_extension"),
                    ) && (
                      <span className="text-[11px] bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-full border border-teal-300">
                        Extended{" "}
                        {
                          caseTimeline.filter((e) =>
                            e.key.startsWith("compliance_extension"),
                          ).length
                        }{" "}
                        time(s)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setExtNewDate(complianceDate || "");
                        setExtNewTime(complianceTime || "");
                        setShowExtendModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>⏱️ Extend Compliance Date &amp; Time</span>
                    </button>
                    {showTimelineTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(TIMELINE_TAB)}
                        className="text-xs text-teal-700 hover:text-teal-900 underline font-medium cursor-pointer"
                      >
                        View Timeline
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Lbl required>Compliance Place</Lbl>
                  <input
                    type="text"
                    placeholder="Enter compliance place"
                    value={compliancePlace}
                    onChange={(e) => setCompliancePlace(e.target.value)}
                    disabled={isSubmitted}
                    className={ic(isSubmitted)}
                  />
                </div>
                <div>
                  <Lbl required>Compliance Date</Lbl>
                  <input
                    type="date"
                    value={complianceDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComplianceDate(val);
                      setComplianceDateError(validateComplianceDate(val, inspectionDate));
                    }}
                    disabled={isSubmitted}
                    min={inspectionDate || minInspectionDate}
                    className={ic(isSubmitted, !!complianceDateError)}
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Must be after Date of Inspection
                  </span>
                  {complianceDateError && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-0.5 leading-tight">
                      {complianceDateError}
                    </span>
                  )}
                </div>
                <div>
                  <Lbl required>Time</Lbl>
                  <input
                    type="time"
                    value={complianceTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComplianceTime(val);
                      setComplianceTimeError(validateInspectionTime(val, "Compliance Time"));
                    }}
                    min={MIN_INSPECTION_TIME}
                    max={MAX_INSPECTION_TIME}
                    disabled={isSubmitted}
                    className={ic(isSubmitted, !!complianceTimeError)}
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Allowed: 9:00 AM to 9:00 PM
                  </span>
                  {complianceTimeError && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-0.5 leading-tight">
                      {complianceTimeError}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveTab(3)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex items-center gap-3">
                  {/* Extension action for inspector when submitted */}
                  {isInspector && realIsSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        setExtNewDate(complianceDate || "");
                        setExtNewTime(complianceTime || "");
                        setShowExtendModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer shadow-sm transition-colors"
                    >
                      Extend Compliance Date
                    </button>
                  )}
                  {/* Show cause is issued and verified by the inspector */}
                  {isInspector && realIsSubmitted && (
                    <button
                      onClick={() =>
                        navigate(
                          `/inspection-list/show-cause/${inspectionNoteId || randId}`,
                        )
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-semibold cursor-pointer"
                    >
                      Show Cause
                    </button>
                  )}
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitted || submitting}
                    className="bg-[#1E73BE] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-semibold cursor-pointer"
                  >
                    {realIsSubmitted
                      ? "Inspection Submitted"
                      : submitting
                        ? "Submitting..."
                        : !hasEditPermission
                          ? "Read-Only Mode"
                          : "SUBMIT"}
                  </button>
                </div>
              </div>

              {/* ─── MODAL: EXTEND COMPLIANCE DATE & TIME ─── */}
              {showExtendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                  <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span>📅 Extend Compliance Schedule</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Previous compliance schedule will be recorded in the Case Timeline.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExtendModal(false)}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Current schedule display */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                      <span className="text-gray-500 font-semibold block uppercase tracking-wider text-[10px]">
                        Current / Previous Schedule
                      </span>
                      <div className="flex items-center gap-4 text-gray-800 font-medium">
                        <span>
                          Date: <strong>{complianceDate || "Not recorded"}</strong>
                        </span>
                        <span>
                          Time: <strong>{complianceTime || "Not recorded"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Lbl required>New Extended Date</Lbl>
                        <input
                          type="date"
                          value={extNewDate}
                          onChange={(e) => setExtNewDate(e.target.value)}
                          min={
                            inspectionDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          className={ic(false)}
                          required
                        />
                      </div>
                      <div>
                        <Lbl>New Extended Time</Lbl>
                        <input
                          type="time"
                          value={extNewTime}
                          onChange={(e) => setExtNewTime(e.target.value)}
                          min={MIN_INSPECTION_TIME}
                          max={MAX_INSPECTION_TIME}
                          className={ic(false)}
                        />
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Allowed: 9:00 AM to 9:00 PM
                        </span>
                      </div>
                    </div>

                    <div>
                      <Lbl>Reason / Remarks for Extension</Lbl>
                      <textarea
                        rows={3}
                        value={extReason}
                        onChange={(e) => setExtReason(e.target.value)}
                        placeholder="e.g. Employer requested time extension to present employment records and muster roll."
                        className="w-full rounded border border-gray-300 p-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowExtendModal(false)}
                        disabled={extSubmitting}
                        className="px-4 py-2 rounded text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExtendCompliance}
                        disabled={extSubmitting}
                        className="px-5 py-2 rounded text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {extSubmitting
                          ? "Saving Extension..."
                          : "Confirm & Save Extension"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 5 — CASE TIMELINE (visible after any ALC action)
          ═══════════════════════════════════════ */}
          {activeTab === TIMELINE_TAB && showTimelineTab && (
            <CaseTimeline currentStatus={caseStatus} timeline={caseTimeline} />
          )}

          {activeTab === PROCEDURE_TAB && showProcedureTab && courtProcedure && (
            <CourtCaseProcedurePanel
              remark={courtProcedure.remark}
              fileName={courtProcedure.fileName}
              fileUrl={courtProcedure.fileUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NormalInspectionForm;
