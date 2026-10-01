import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { FaFilePdf } from "react-icons/fa";

import { API_BASE } from "@/constants/constants";
import {
  BOCWA_AMENDMENT_DOCUMENT_RULE,
  describeRule,
  toAcceptAttribute,
  validateFile,
} from "@/utils/fileUpload";

const backendToUIMap: Record<string, string[]> = {
  /** ---------------------------------------
   Full name and address of the employer (including country, state, district, subdivision, area type, area code, village/ward, police station and pin code)
   * --------------------------------------*/
  emp_info: ["emp_name", "emp_gender", "emp_country", "emp_state", "emp_address", "emp_dist", "emp_subdv", "emp_areatype", "emp_areacode", "emp_vill_ward", "emp_ps", "emp_pin"],

  /** ---------------------------------------
   Full Name and permanent address of the Establishment (including country, state, district, subdivision, area type, area code, village/ward, police station and pin code)
   * --------------------------------------*/
  e_permanent_address: ["estName", "estType", "estLocation", "distCode", "subDivCode", "areaTypeCode", "blockCode", "villageWardCode", "policeStationCode", "pin", "e_full_name", "est_address", "est_dist", "est_subdivision", "est_areatype", "est_areacode", "est_villward", "est_ps", "est_pin"],

  /** ---------------------------------------
   Registered Office address of the Establishment (including country, state, district, subdivision, area type, area code, village/ward, police station and pin code)
   * --------------------------------------*/
  postal_address: ["estRegOfcLoc", "postalDistCode", "postalSubDivCode", "postalAreaTypeCode", "postalBlockCode", "postalVillageWardCode", "postalPoliceStationCode", "postalPin"],

  /** ---------------------------------------
   Full name and address of the Manager or Person responsible for the supervision and control of the Establishment (including country, state, district, subdivision, area type, area code, village/ward, police station and pin code)
   * --------------------------------------*/
  manager_info: [
    "full_name_manager",
    "manager_country",
    "address_manager",
    "manager_state",
    "manager_dist",
    "manager_subdv",
    "manager_areatype",
    "manager_areacode",
    "manager_vill_ward",
    "manager_ps",
    "manager_pin",
  ],

  /** ---------------------------------------
   Nature of building or other construction work is to be carried on
   * --------------------------------------*/
  e_nature_of_work: [
    "nature_of_build_const"
  ],

  /** ---------------------------------------
   Maximum number of building workers to be employed on any day
   * --------------------------------------*/
  max_num_of_workmen: [
    "max_no_workers",
  ],

  /** ---------------------------------------
   Estimated date of commencement and completion of building or other construction work
   * --------------------------------------*/
  est_date_comm: [
    "est_date_of_commencement_building",
    "est_date_of_completion_building"
  ],
};

interface Option {
  code: string;
  name: string;
}

const TabButton: React.FC<{ active?: boolean; label: string; onClick?: () => void }> = ({
  active,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-md border text-sm font-medium ${active
      ? "bg-[#2A628C] text-white border-gray-700"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
      }`}
  >
    {label}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border border-gray-300 rounded mb-6 bg-white">
    <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">{title}</div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
  </div>
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  name: string;
  editableFields?: Set<string>;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  editableFields,
  required,
  ...props
}) => {

  const isEditable = editableFields?.has(name);

  return (
    <div className="flex flex-col relative">
      <label className="text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        {...props}
        name={name}
        readOnly={!isEditable}
        className={`border rounded px-3 py-2 pr-10 text-sm
                    ${isEditable ? "bg-white" : "bg-gray-100 cursor-not-allowed"}
                `}
      />

      {/* STATUS ICON */}
      <div className="absolute right-2 top-[33px]">
        {isEditable ? (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            ✕
          </div>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------
   OTHER INFORMATION FIELDS INPUT
-------------------------------------------------- */

interface OtherInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  name: string;
  editableFields?: Set<string>;
  required?: boolean;
}

export const OtherInput: React.FC<OtherInputProps> = ({
  label,
  name,
  editableFields,
  required,
  ...props
}) => {

  const isEditable = editableFields?.has(name);

  return (
    <div className="flex flex-col relative">
      <label className="text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        {...props}
        name={name}
        readOnly={!isEditable}
        className={`border rounded px-3 py-2 pr-10 text-sm
                    ${isEditable ? "bg-white" : "bg-gray-100 cursor-not-allowed"}
                `}
      />

      {/* STATUS ICON */}
      <div className="absolute right-2 top-[53px]">
        {isEditable ? (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            ✕
          </div>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};


/* --------------------------------------------------
   NORMAL INPUT (No amendment logic)
   Used for Trade Union / Contractor forms
-------------------------------------------------- */

interface PlainInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const PlainInput: React.FC<PlainInputProps> = ({
  label,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>

      <input
        {...props}
        className="border rounded px-3 py-2 text-sm bg-white"
      />
    </div>
  );
};

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode;
  name: string;
  editableFields?: Set<string>;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  editableFields,
  required,
  children,
  ...props
}) => {
  const isEditable = editableFields?.has(name);

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    // Keep the field controlled to avoid React warnings, but ignore changes
    // when not editable (matches read-only visual state).
    if (!isEditable) {
      event.preventDefault();
      return;
    }
    if (props.onChange) {
      props.onChange(event);
    }
  };

  return (
    <div className="flex flex-col relative">
      <label className="text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        {...props}
        name={name}
        value={props.value}
        // onChange={isEditable ? props.onChange : undefined}
        onChange={handleSelectChange}
        className={`border rounded px-3 py-2 pr-10 text-sm
        ${isEditable ? "bg-white" : "bg-gray-100 pointer-events-none"}
    `}
      >
        {children}
      </select>

      {/* STATUS ICON */}
      <div className="absolute right-2 top-[31px] pr-4">
        {isEditable ? (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            ✕
          </div>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

// Create Document → Payload Key Map
const documentUploadCodeMap: Record<string, string> = {
  "Trade License": "TL",
  "Articles of Association and Memorandum of Association / Partnership Deed": "AOA",
  "Any other document in support of correctness of the particulars mentioned in the application if required": "MOC",
  "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": "PD",
  // "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": "CR",
  "Challan": "CH",
  "Work Order": "WO",
  "Form I for assessment of CESS": "AC",
  "Documents in Support of Payment of CESS": "PC",
  "Documents in Support of Correctness of Application": "ODSC",
  "Address Proof": "AP"
};

const cleanPayload = (value: any): any => {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return value.map(cleanPayload);
  }

  if (typeof value === "object" && value !== null) {
    const newObj: any = {};
    Object.keys(value).forEach((key) => {
      newObj[key] = cleanPayload(value[key]);
    });
    return newObj;
  }

  return value;
};

const mapFormToPayload = (
  formData: any,
  application_id: string,
  metaIds: any,
) => {

  return cleanPayload({
    application_id: application_id,
    act_id: "2",
    identification_number: metaIds.identification_number,
    amendment_parent_id: metaIds.amendment_parent_id,

    /* Establishment (Work Site) */
    e_name: formData.estName,
    est_type: formData.estType,
    loc_e_name: formData.estLocation,
    loc_e_dist: formData.distCode,
    loc_e_subdivision: formData.subDivCode,
    loc_e_areatype: formData.areaTypeCode,
    loc_e_areatype_code: formData.blockCode,
    loc_e_vill_ward: formData.villageWardCode,
    loc_e_ps: formData.policeStationCode,
    loc_e_pin_number: formData.pin,

    /* Establishment (Registered) */
    e_postal_address: formData.estRegOfcLoc,
    e_postal_dist: formData.postalDistCode,
    e_postal_subdivision: formData.postalSubDivCode,
    e_postal_areatype: formData.postalAreaTypeCode,
    e_postal_areatype_code: formData.postalBlockCode,
    e_postal_vill_ward: formData.postalVillageWardCode,
    e_postal_ps: formData.postalPoliceStationCode,
    e_postal_pin_number: formData.postalPin,

    /* Establishment (Full) */
    e_full_name: formData.e_full_name,
    e_permanent_address: formData.est_address,
    e_permanent_add_dist: formData.est_dist,
    e_permanent_add_subdivision: formData.est_subdivision,
    e_permanent_add_areatype: formData.est_areatype,
    e_permanent_add_areatype_code: formData.est_areacode,
    e_permanent_add_vill_ward: formData.est_villward,
    e_permanent_add_ps: formData.est_ps,
    e_permanent_add_pin_number: formData.est_pin,

    /* Manager */
    full_name_manager: formData.full_name_manager,
    manager_country: formData.manager_country,
    address_manager: formData.address_manager,
    manager_state: formData.manager_state,
    address_manager_dist: formData.manager_dist,
    address_manager_subdivision: formData.manager_subdv,
    address_manager_areatype: formData.manager_areatype,
    address_manager_areatype_code: formData.manager_areacode,
    address_manager_vill_ward: formData.manager_vill_ward,
    address_manager_ps: formData.manager_ps,
    address_manager_pin_number: formData.manager_pin,

    /* Employer */
    emp_name: formData.emp_name,
    emp_gender: formData.emp_gender,
    emp_country: formData.emp_country,
    emp_address: formData.emp_address,
    emp_state: formData.emp_state,
    emp_dist: formData.emp_dist,
    emp_subdivision: formData.emp_subdv,
    emp_areatype: formData.emp_areatype,
    emp_areatype_code: formData.emp_areacode,
    emp_vill_ward: formData.emp_vill_ward,
    emp_ps: formData.emp_ps,
    emp_pin_number: formData.emp_pin,

    /* Other */
    nature_of_build_const: formData.nature_of_build_const,
    max_no_of_building_workers_employed: formData.max_no_workers,
    est_date_of_commencement_building: formData.est_date_of_commencement_building,
    est_date_of_completion_building: formData.est_date_of_completion_building,
  });
};

const formatToDateInput = (isoString?: string) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const mapPreviewToForm = (est: any) => ({

  /* =========================
     Establishment (Work Site)
  ========================== */
  estName: est?.e_name ?? "",
  estType: est?.est_type ?? "",
  estLocation: est?.loc_e_name ?? "",
  distCode: est?.loc_e_dist?.toString() ?? "",
  subDivCode: est?.loc_e_subdivision?.toString() ?? "",
  areaTypeCode: est?.loc_e_areatype?.toString() ?? "",
  blockCode: est?.loc_e_areatype_code?.toString() ?? "",
  villageWardCode: est?.loc_e_vill_ward?.toString() ?? "",
  policeStationCode: est?.loc_e_ps?.toString() ?? "",
  pin: est?.loc_e_pin_number ?? "",

  /* =========================
     Establishment (Registered)
  ========================== */
  estRegOfcLoc: est?.e_postal_address ?? "",
  postalDistCode: est?.e_postal_dist?.toString() ?? "",
  postalSubDivCode: est?.e_postal_subdivision?.toString() ?? "",
  postalAreaTypeCode: est?.e_postal_areatype?.toString() ?? "",
  postalBlockCode: est?.e_postal_areatype_code?.toString() ?? "",
  postalVillageWardCode: est?.e_postal_vill_ward?.toString() ?? "",
  postalPoliceStationCode: est?.e_postal_ps?.toString() ?? "",
  postalPin: est?.e_postal_pin_number ?? "",

  /* =========================
     Establishment (Full / Permanent)
  ========================== */
  e_full_name: est?.e_full_name ?? "",
  est_address: est?.e_permanent_address ?? "",
  est_dist: est?.e_permanent_add_dist?.toString() ?? "",
  est_subdivision: est?.e_permanent_add_subdivision?.toString() ?? "",
  est_areatype: est?.e_permanent_add_areatype?.toString() ?? "",
  est_areacode: est?.e_permanent_add_areatype_code?.toString() ?? "",
  est_villward: est?.e_permanent_add_vill_ward?.toString() ?? "",
  est_ps: est?.e_permanent_add_ps?.toString() ?? "",
  est_pin: est?.e_permanent_add_pin_number ?? "",

  /* =========================
     Manager
  ========================== */
  full_name_manager: est?.full_name_manager ?? "",
  manager_country: est?.manager_country?.toString() ?? "",
  address_manager: est?.address_manager ?? "",
  manager_state: est?.manager_state?.toString() ?? "",
  manager_dist: est?.address_manager_dist?.toString() ?? "",
  manager_subdv: est?.address_manager_subdivision?.toString() ?? "",
  manager_areatype: est?.address_manager_areatype?.toString() ?? "",
  manager_areacode: est?.address_manager_areatype_code?.toString() ?? "",
  manager_vill_ward: est?.address_manager_vill_ward?.toString() ?? "",
  manager_ps: est?.address_manager_ps?.toString() ?? "",
  manager_pin: est?.address_manager_pin_number ?? "",

  /* =========================
     Employer
  ========================== */
  emp_name: est?.emp_name ?? "",
  emp_gender: est?.emp_gender ?? "",
  emp_country: est?.emp_country?.toString() ?? "",
  emp_address: est?.emp_address ?? "",
  emp_state: est?.emp_state?.toString() ?? "",
  emp_dist: est?.emp_dist?.toString() ?? "",
  emp_subdv: est?.emp_subdivision?.toString() ?? "",
  emp_areatype: est?.emp_areatype?.toString() ?? "",
  emp_areacode: est?.emp_areatype_code?.toString() ?? "",
  emp_vill_ward: est?.emp_vill_ward?.toString() ?? "",
  emp_ps: est?.emp_ps?.toString() ?? "",
  emp_pin: est?.emp_pin_number ?? "",

  /* =========================
     Other
  ========================== */
  nature_of_build_const: est?.nature_of_build_const ?? "",
  max_no_workers: est?.max_no_of_building_workers_employed ?? "",
  est_date_of_commencement_building:
    formatToDateInput(est?.est_date_of_commencement_building),
  est_date_of_completion_building:
    formatToDateInput(est?.est_date_of_completion_building),
});

// Convert File → Base64 Helper
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

function openNativeDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget as HTMLInputElement & {
    showPicker?: () => void;
  };
  input.showPicker?.();
}

// Create Mapping For 1st API Call (Document Upload)
const documentNameKeyMap: Record<string, string> = {
  "Trade License": "trade_license",
  "Articles of Association and Memorandum of Association / Partnership Deed": "article_of_assoc",
  "Any other document in support of correctness of the particulars mentioned in the application if required": "memorandum_of_cert",
  "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": "partnership_deed",
  "Challan": "challan",
  "Work Order": "work_order",
  "Form I for assessment of CESS": "form_one_asses_ses",
  "Documents in Support of Payment of CESS": "supp_asses_ses",
  "Documents in Support of Correctness of Application": "other_doc",
  "Address Proof": "address_proof"
};

// Document Mapping for preview in the Application Preview tab
const previewDocumentKeyMap: Record<string, string> = {
  "Trade License": "trade_license_file",
  "Articles of Association and Memorandum of Association / Partnership Deed":
    "article_of_assoc_file",
  "Any other document in support of correctness of the particulars mentioned in the application if required":
    "memorandum_of_cert_file",
  "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.":
    "partnership_deed_file",
  "Challan": "challan_file",
  "Work Order": "work_order_file",
  "Form I for assessment of CESS": "form_one_asses_ses_file",
  "Documents in Support of Payment of CESS": "supp_asses_ses_file",
  "Documents in Support of Correctness of Application": "other_doc_file",
  "Address Proof": "address_proof_file",
};

const BOCWAAmendmentForm: React.FC = () => {

  const location = useLocation();

  const [searchParamsParentID] = useSearchParams();

  const parentID = searchParamsParentID.get("id");
  const isView = Boolean(searchParamsParentID.get("isView") ?? false);

  // Global hydration lock

  const hydrationDone = useRef(false);

  const hasFetched = useRef(false);

  const [metaIds, setMetaIds] = useState({
    identification_number: "",
    amendment_parent_id: "",
    numeric_application_id: 0,   // 👈 needed for upload API
  });


  const { applicationId: applicationIdParam, id } = useParams<{ applicationId?: string; id?: string }>();

  // const encryptID = applicationIdParam ?? id ?? undefined;

  const amendmentEncryptId = JSON.parse(
    sessionStorage.getItem("BOCWA_AMENDMENT_ENCRYPT_ID") || "{}"
  );

  const amendmentCtx = JSON.parse(
    sessionStorage.getItem("BOCWA_AMENDMENT_CTX") || "{}"
  );

  const bocwaCtx = JSON.parse(
    sessionStorage.getItem("BOCWA_CTX") || "{}"
  );

  const encryptID = amendmentEncryptId.encryptID;

  // 🔥 SOURCE OF TRUTH STATE
  const queryId = searchParamsParentID.get("id");

  const [currentApplicationId, setCurrentApplicationId] = useState(
    amendmentCtx.applicationID ||         // amendment flow
    queryId ||                            // URL fallback
    bocwaCtx.encryptedApplicationId ||    // dashboard flow
    ""
  );

  const amendmentSession = sessionStorage.getItem("BOCWA_AMENDMENT_FIELDS");

  const amendedFields: string[] = amendmentSession
    ? JSON.parse(amendmentSession).amendedFields
    : [];

  /* ---------------------------------------------
         Build Editable Fields ONLY from real amendments
      ---------------------------------------------- */

  const editableFields = React.useMemo(() => {
    const set = new Set<string>();

    amendedFields.forEach((backendKey) => {
      backendToUIMap[backendKey]?.forEach((uiField) => {
        set.add(uiField);
      });
    });

    return set;
  }, [amendedFields]);

  // Modify your tab state, using query params for tab switching
  const [searchParamsTab, setSearchParamsTab] = useSearchParams();

  const tabFromUrl = Number(searchParamsTab.get("tab") || 0);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Store API data separately
  const [initialData, setInitialData] = useState<any>(null);

  const isReadOnlyStatus = React.useMemo(() => {
    const s = (initialData?.status ?? "").trim().toUpperCase();
    const isView = Boolean(searchParamsParentID.get("isView") ?? false);
    if (isView && ["I", "S", "VA", "V", "U", "0"].includes(s)) return true;
    return false;
  }, [initialData?.status]);

  useEffect(() => {
    if (isReadOnlyStatus) {
      setActiveTab(2);
    }
  }, [isReadOnlyStatus]);

  // Create Form Type
  interface BOCWAFormData {
    [key: string]: string;
  }

  const [formData, setFormData] = useState<BOCWAFormData>({});
  const [lastIssuedCommencementDate, setLastIssuedCommencementDate] = useState("");

  const documents = [
    "Trade License",
    "Articles of Association and Memorandum of Association / Partnership Deed",
    "Any other document in support of correctness of the particulars mentioned in the application if required",
    "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.",
    "Challan",
    "Work Order",
    "Form I for assessment of CESS",
    "Documents in Support of Payment of CESS",
    "Documents in Support of Correctness of Application",
    "Address Proof",
  ];

  /* ==========================================================
     SECTION-WISE LOCATION STATE (ISOLATED)
     ========================================================== */

  /* Section 1 — Establishment (Work Site) */
  const [subdivisionListEst, setSubdivisionListEst] = useState<any[]>([]);
  const [blockListEst, setBlockListEst] = useState<any[]>([]);
  const [wardsEst, setWardsEst] = useState<Option[]>([]);
  const [policeStationListEst, setPoliceStationListEst] = useState<any[]>([]);

  /* Section 2 — Establishment (Registered) */
  const [subdivisionListPostal, setSubdivisionListPostal] = useState<any[]>([]);
  const [blockListPostal, setBlockListPostal] = useState<any[]>([]);
  const [wardsPostal, setWardsPostal] = useState<Option[]>([]);
  const [policeStationListPostal, setPoliceStationListPostal] = useState<any[]>([]);

  /* Section 3 — Establishment (Full) */
  const [subdivisionListPE, setSubdivisionListPE] = useState<any[]>([]);
  const [blockListPE, setBlockListPE] = useState<any[]>([]);
  const [wardsPE, setWardsPE] = useState<Option[]>([]);
  const [policeStationListPE, setPoliceStationListPE] = useState<any[]>([]);

  /* Section 4 — Manager */
  const [subdivisionListMgr, setSubdivisionListMgr] = useState<any[]>([]);
  const [blockListMgr, setBlockListMgr] = useState<any[]>([]);
  const [wardsMgr, setWardsMgr] = useState<Option[]>([]);
  const [policeStationListMgr, setPoliceStationListMgr] = useState<any[]>([]);

  /* Section 5 — Employer */
  const [subdivisionListEmp, setSubdivisionListEmp] = useState<any[]>([]);
  const [blockListEmp, setBlockListEmp] = useState<any[]>([]);
  const [wardsEmp, setWardsEmp] = useState<Option[]>([]);
  const [policeStationListEmp, setPoliceStationListEmp] = useState<any[]>([]);


  /* ================= MASTER LISTS (SECTION-WISE) ================= */

  const [stateListMgr, setStateListMgr] = useState<any[]>([]);
  const [stateListEmp, setStateListEmp] = useState<any[]>([]);

  const [districtListEst, setDistrictListEst] = useState<any[]>([]);
  const [districtListPostal, setDistrictListPostal] = useState<any[]>([]);
  const [districtListPE, setDistrictListPE] = useState<any[]>([]);
  const [districtListMgr, setDistrictListMgr] = useState<any[]>([]);
  const [districtListEmp, setDistrictListEmp] = useState<any[]>([]);

  // Add Proper File State
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [docUploadErrors, setDocUploadErrors] = useState<Record<string, string | null>>({});

  // Documents already on record for this amendment (own + inherited from parent)
  const [savedDocuments, setSavedDocuments] = useState<Record<string, string | null>>({});
  const [isLoadingSavedDocuments, setIsLoadingSavedDocuments] = useState(false);

  // Loading flags
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDocuments, setIsSavingDocuments] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  // Add State for Preview Documents
  const [uploadedDocumentPreview, setUploadedDocumentPreview] = useState<
    {
      documentName: string;
      fileName: string;
      fileContent: string; // base64
    }[]
  >([]);

  // Add Preview State for Application Preview tab
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewDocuments, setPreviewDocuments] = useState<any>({});

  // Build Two Tables Dynamically for Application Preview tab

  const estb = previewData?.establishment || {};
  const addresses = estb?.addresses || {};
  const fees = previewData?.fees || {};

  const establishmentDetails: Record<string, string> = {
    "Name of the Establishment": estb?.e_name || "",
    "Establishment Type": estb?.est_type || "",
    "Location of the Establishment": addresses?.establishment || "",
    "Postal Address of the Establishment": addresses?.postal || "",
    "Full Name of the Establishment": estb?.e_full_name || "",
    "Permanent Address of the Establishment": addresses?.permanent || "",
    "Nature of building or other construction work is to be carried on":
      estb?.nature_of_build_const || "",
    "Maximum number of building workers to be employed on any day":
      estb?.max_no_of_building_workers_employed || "",
  };

  const employerDetails: Record<string, string> = {
    "Full Name of the Employer": estb?.emp_name || "",
    "Gender": previewData?.gender || "",
    "Address of the Employer": estb?.emp_address || "",
    "Full name of the Manager or Person Responsible for the Supervision and control of the Establishment":
      estb?.full_name_manager || "",
    "Address of the Manager or Person Responsible for the Supervision and control of the Establishment":
      addresses?.manager || "",
    "Estimated date of commencement of building or other construction work":
      formatToDateInput(estb?.est_date_of_commencement_building),
    "Estimated date of the completion of building or other construction work":
      formatToDateInput(estb?.est_date_of_completion_building),
    "Total Fees": fees?.total?.toString() || "0",
  };

  const navigate = useNavigate();

  const { selectedFields } = location.state || {};

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggleCheck = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const [checkedFinal, setCheckedFinal] = useState<boolean>(false);

  useEffect(() => {
    if (!currentApplicationId) return;
    if (hasFetched.current) return;

    hasFetched.current = true;

    const fetchPreview = async () => {
      setIsPageLoading(true);

      try {
        const authData = localStorage.getItem("lc_portal_auth");
        const token = JSON.parse(authData || "{}")?.token;

        const res = await fetch(
          `${API_BASE}applicant-module/bocwa-amendment/form-data?appId=${encodeURIComponent(currentApplicationId)}`, // Should be new applicantId
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        console.log("✅ Preview API Response:", data);

        const est = data.establishment;

        // ✅ STORE DATA ONLY (do NOT set form yet)
        setInitialData(est);
        setLastIssuedCommencementDate(
          formatToDateInput(
            data.lastIssuedCommencementDate ??
              est?.est_date_of_commencement_building,
          ),
        );

        /* ------------------------------
           Similar Work Radio
        ------------------------------ */
        // We will handle it in next step.

        /* ------------------------------
           Meta IDs Needed For Submit
        ------------------------------ */
        setMetaIds({
          identification_number: est?.identification_number,
          amendment_parent_id: est?.amendment_parent_id,
          numeric_application_id: est?.id
        });

        setSavedDocuments(data?.documents ?? {});

      } catch (e) {
        console.error("❌ Preview Load Crash:", e);
        toast.error("Failed to load preview data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchPreview();
  }, [currentApplicationId]);

  // Load districts one time for all sections since they use the same list (can optimize later if needed)
  useEffect(() => {
    axios.get(`${API_BASE}district`)
      .then(res => {
        const districts = res.data || [];   // ✅ direct array

        setDistrictListEst(districts);
        setDistrictListPostal(districts);
        setDistrictListPE(districts);
        setDistrictListMgr(districts);
        setDistrictListEmp(districts);
      })
      .catch(() => toast.error("Failed to load districts"));
  }, []);


  // Load States (Only for Section 4 & 5 dropdowns, but we can load once since same list is used)
  useEffect(() => {
    axios.get(`${API_BASE}states`)
      .then(res => {
        const states = res.data?.data || [];   // ✅ IMPORTANT

        setStateListMgr(states);
        setStateListEmp(states);
      })
      .catch(() => toast.error("Failed to load states"));
  }, []);

  /* ================= SECTION 1 — ESTABLISHMENT ================= */

  useEffect(() => {
    if (!formData.distCode) return;

    axios.get(`${API_BASE}subdivision/${formData.distCode}`)
      .then(res => setSubdivisionListEst(res.data || []));

    axios.get(`${API_BASE}policestation/${formData.distCode}`)
      .then(res => setPoliceStationListEst(res.data || []));
  }, [formData.distCode]);

  useEffect(() => {
    if (!formData.distCode || !formData.subDivCode || !formData.areaTypeCode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      blockCode: "",
      villageWardCode: "",
    }));


    axios.get(
      `${API_BASE}block/${formData.distCode}/${formData.subDivCode}/${formData.areaTypeCode}`
    ).then(res => setBlockListEst(res.data || []));
  }, [formData.subDivCode, formData.areaTypeCode]);

  useEffect(() => {
    if (!formData.blockCode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      villageWardCode: "",
    }));


    axios.get(`${API_BASE}villageward/${formData.blockCode}`)
      .then(res => {
        const mapped = (res.data || []).map((w: any): Option => ({
          code: String(w.village_code),
          name: w.village_name,
        }));
        setWardsEst(mapped);
      });
  }, [formData.blockCode]);

  /* ================= SECTION 2 — POSTAL ================= */

  useEffect(() => {
    if (!formData.postalDistCode) return;

    axios.get(`${API_BASE}subdivision/${formData.postalDistCode}`)
      .then(res => setSubdivisionListPostal(res.data || []));

    axios.get(`${API_BASE}policestation/${formData.postalDistCode}`)
      .then(res => setPoliceStationListPostal(res.data || []));
  }, [formData.postalDistCode]);

  useEffect(() => {
    if (!formData.postalDistCode || !formData.postalSubDivCode || !formData.postalAreaTypeCode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      postalBlockCode: "",
      postalVillageWardCode: "",
    }));


    axios.get(
      `${API_BASE}block/${formData.postalDistCode}/${formData.postalSubDivCode}/${formData.postalAreaTypeCode}`
    ).then(res => setBlockListPostal(res.data || []));
  }, [formData.postalSubDivCode, formData.postalAreaTypeCode]);

  useEffect(() => {
    if (!formData.postalBlockCode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      postalVillageWardCode: "",
    }));


    axios.get(`${API_BASE}villageward/${formData.postalBlockCode}`)
      .then(res => {
        const mapped = (res.data || []).map((w: any): Option => ({
          code: String(w.village_code),
          name: w.village_name,
        }));
        setWardsPostal(mapped);
      });
  }, [formData.postalBlockCode]);

  /* ================= SECTION 3 — PRINCIPAL EMPLOYER ================= */

  useEffect(() => {
    if (!formData.est_dist) return;

    axios.get(`${API_BASE}subdivision/${formData.est_dist}`)
      .then(res => setSubdivisionListPE(res.data || []));

    axios.get(`${API_BASE}policestation/${formData.est_dist}`)
      .then(res => setPoliceStationListPE(res.data || []));
  }, [formData.est_dist]);

  useEffect(() => {
    if (!formData.est_dist || !formData.est_subdivision || !formData.est_areatype) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      est_areacode: "",
      est_villward: "",
    }));


    axios.get(
      `${API_BASE}block/${formData.est_dist}/${formData.est_subdivision}/${formData.est_areatype}`
    ).then(res => setBlockListPE(res.data || []));
  }, [formData.est_subdivision, formData.est_areatype]);

  useEffect(() => {
    if (!formData.est_areacode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      est_villward: "",
    }));


    axios.get(`${API_BASE}villageward/${formData.est_areacode}`)
      .then(res => {
        const mapped = (res.data || []).map((w: any): Option => ({
          code: String(w.village_code),
          name: w.village_name,
        }));
        setWardsPE(mapped);
      });
  }, [formData.est_areacode]);

  /* ================= SECTION 4 — MANAGER ================= */

  useEffect(() => {
    if (!formData.manager_dist) return;

    axios.get(`${API_BASE}subdivision/${formData.manager_dist}`)
      .then(res => setSubdivisionListMgr(res.data || []));

    axios.get(`${API_BASE}policestation/${formData.manager_dist}`)
      .then(res => setPoliceStationListMgr(res.data || []));
  }, [formData.manager_dist]);

  useEffect(() => {
    if (!formData.manager_dist || !formData.manager_subdv || !formData.manager_areatype) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      manager_areacode: "",
      manager_vill_ward: "",
    }));


    axios.get(
      `${API_BASE}block/${formData.manager_dist}/${formData.manager_subdv}/${formData.manager_areatype}`
    ).then(res => setBlockListMgr(res.data || []));
  }, [formData.manager_subdv, formData.manager_areatype]);

  useEffect(() => {
    if (!formData.manager_areacode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      manager_vill_ward: "",
    }));


    axios.get(`${API_BASE}villageward/${formData.manager_areacode}`)
      .then(res => {
        const mapped = (res.data || []).map((w: any): Option => ({
          code: String(w.village_code),
          name: w.village_name,
        }));
        setWardsMgr(mapped);
      });
  }, [formData.manager_areacode]);

  /* ================= SECTION 5 — EMPLOYER ================= */

  useEffect(() => {
    if (!formData.emp_dist) return;

    axios.get(`${API_BASE}subdivision/${formData.emp_dist}`)
      .then(res => setSubdivisionListEmp(res.data || []));

    axios.get(`${API_BASE}policestation/${formData.emp_dist}`)
      .then(res => setPoliceStationListEmp(res.data || []));
  }, [formData.emp_dist]);

  useEffect(() => {
    if (!formData.emp_dist || !formData.emp_subdv || !formData.emp_areatype) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      emp_areacode: "",
      emp_vill_ward: "",
    }));


    axios.get(
      `${API_BASE}block/${formData.emp_dist}/${formData.emp_subdv}/${formData.emp_areatype}`
    ).then(res => setBlockListEmp(res.data || []));
  }, [formData.emp_subdv, formData.emp_areatype]);

  useEffect(() => {
    if (!formData.emp_areacode) return;

    if (!hydrationDone.current) return;
    setFormData(prev => ({
      ...prev,
      emp_vill_ward: "",
    }));


    axios.get(`${API_BASE}villageward/${formData.emp_areacode}`)
      .then(res => {
        const mapped = (res.data || []).map((w: any): Option => ({
          code: String(w.village_code),
          name: w.village_name,
        }));
        setWardsEmp(mapped);
      });
  }, [formData.emp_areacode]);



  /* ================= useEffect - Hydrate ONLY after dropdowns are ready ================= */
  useEffect(() => {
    if (!initialData) return;

    const hydrateForm = async () => {
      hydrationDone.current = false;

      const mapped = mapPreviewToForm(initialData);

      // ✅ create safe copy (IMPORTANT)
      const safeMapped = { ...mapped };

      /* =====================================================
        FINAL FORM SET
        ===================================================== */

      setFormData({
        ...mapped,
        workmen_if_same_similar_kind_of_work:
          initialData?.similarKindOfWork === "Yes" ? "yes" : "no",
      });

      try {
        /* =====================================================
           SECTION 1 — ESTABLISHMENT (WORK SITE)
        ===================================================== */
        if (mapped.distCode) {
          const [subDivRes, psRes] = await Promise.all([
            axios.get(`${API_BASE}subdivision/${mapped.distCode}`),
            axios.get(`${API_BASE}policestation/${mapped.distCode}`),
          ]);

          setSubdivisionListEst(subDivRes.data || []);
          setPoliceStationListEst(psRes.data || []);
        }

        if (mapped.distCode && mapped.subDivCode && mapped.areaTypeCode) {
          const blockRes = await axios.get(
            `${API_BASE}block/${mapped.distCode}/${mapped.subDivCode}/${mapped.areaTypeCode}`
          );

          const blocks = blockRes.data || [];
          setBlockListEst(blocks);

          if (!blocks.find((b: any) => String(b.block_code) === String(mapped.blockCode))) {
            safeMapped.blockCode = "";
          }
        }

        if (mapped.blockCode) {
          const wardRes = await axios.get(`${API_BASE}villageward/${mapped.blockCode}`);

          const mappedWards = (wardRes.data || []).map((w: any): Option => ({
            code: String(w.village_code),
            name: w.village_name,
          }));

          setWardsEst(mappedWards);

          if (!mappedWards.find((w: Option) => w.code === mapped.villageWardCode)) {
            safeMapped.villageWardCode = "";
          }
        }

        /* =====================================================
           SECTION 2 — POSTAL
        ===================================================== */
        if (mapped.postalDistCode) {
          const [subDivRes, psRes] = await Promise.all([
            axios.get(`${API_BASE}subdivision/${mapped.postalDistCode}`),
            axios.get(`${API_BASE}policestation/${mapped.postalDistCode}`),
          ]);

          setSubdivisionListPostal(subDivRes.data || []);
          setPoliceStationListPostal(psRes.data || []);
        }

        if (
          mapped.postalDistCode &&
          mapped.postalSubDivCode &&
          mapped.postalAreaTypeCode
        ) {
          const blockRes = await axios.get(
            `${API_BASE}block/${mapped.postalDistCode}/${mapped.postalSubDivCode}/${mapped.postalAreaTypeCode}`
          );

          const blocks = blockRes.data || [];
          setBlockListPostal(blocks);

          if (!blocks.find((b: any) => String(b.block_code) === String(mapped.postalBlockCode))) {
            safeMapped.postalBlockCode = "";
          }
        }

        if (mapped.postalBlockCode) {
          const wardRes = await axios.get(
            `${API_BASE}villageward/${mapped.postalBlockCode}`
          );

          const mappedWards = (wardRes.data || []).map((w: any): Option => ({
            code: String(w.village_code),
            name: w.village_name,
          }));

          setWardsPostal(mappedWards);

          if (!mappedWards.find((w: Option) => String(w.code) === String(mapped.postalVillageWardCode))) {
            safeMapped.postalVillageWardCode = "";
          }
        }

        /* =====================================================
           SECTION 3 — PERMANENT
        ===================================================== */
        if (mapped.est_dist) {
          const [subDivRes, psRes] = await Promise.all([
            axios.get(`${API_BASE}subdivision/${mapped.est_dist}`),
            axios.get(`${API_BASE}policestation/${mapped.est_dist}`),
          ]);

          setSubdivisionListPE(subDivRes.data || []);
          setPoliceStationListPE(psRes.data || []);
        }

        if (mapped.est_dist && mapped.est_subdivision && mapped.est_areatype) {
          const blockRes = await axios.get(
            `${API_BASE}block/${mapped.est_dist}/${mapped.est_subdivision}/${mapped.est_areatype}`
          );

          const blocks = blockRes.data || [];
          setBlockListPE(blocks);

          if (!blocks.find((b: any) => String(b.block_code) === String(mapped.est_areacode))) {
            safeMapped.est_areacode = "";
          }
        }

        if (mapped.est_areacode) {
          const wardRes = await axios.get(
            `${API_BASE}villageward/${mapped.est_areacode}`
          );

          const mappedWards = (wardRes.data || []).map((w: any): Option => ({
            code: String(w.village_code),
            name: w.village_name,
          }));

          setWardsPE(mappedWards);

          if (!mappedWards.find((w: Option) => w.code === mapped.est_villward)) {
            safeMapped.est_villward = "";
          }
        }

        /* =====================================================
           SECTION 4 — MANAGER
        ===================================================== */
        if (mapped.manager_dist) {
          const [subDivRes, psRes] = await Promise.all([
            axios.get(`${API_BASE}subdivision/${mapped.manager_dist}`),
            axios.get(`${API_BASE}policestation/${mapped.manager_dist}`),
          ]);

          setSubdivisionListMgr(subDivRes.data || []);
          setPoliceStationListMgr(psRes.data || []);
        }

        if (
          mapped.manager_dist &&
          mapped.manager_subdv &&
          mapped.manager_areatype
        ) {
          const blockRes = await axios.get(
            `${API_BASE}block/${mapped.manager_dist}/${mapped.manager_subdv}/${mapped.manager_areatype}`
          );

          const blocks = blockRes.data || [];
          setBlockListMgr(blocks);

          if (!blocks.find((b: any) => String(b.block_code) === String(mapped.manager_areacode))) {
            safeMapped.manager_areacode = "";
          }
        }

        if (mapped.manager_areacode) {
          const wardRes = await axios.get(
            `${API_BASE}villageward/${mapped.manager_areacode}`
          );

          const mappedWards = (wardRes.data || []).map((w: any): Option => ({
            code: String(w.village_code),
            name: w.village_name,
          }));

          setWardsMgr(mappedWards);

          if (!mappedWards.find((w: Option) => w.code === mapped.manager_vill_ward)) {
            safeMapped.manager_vill_ward = "";
          }
        }

        /* =====================================================
           SECTION 5 — EMPLOYER
        ===================================================== */
        if (mapped.emp_dist) {
          const [subDivRes, psRes] = await Promise.all([
            axios.get(`${API_BASE}subdivision/${mapped.emp_dist}`),
            axios.get(`${API_BASE}policestation/${mapped.emp_dist}`),
          ]);

          setSubdivisionListEmp(subDivRes.data || []);
          setPoliceStationListEmp(psRes.data || []);
        }

        if (
          mapped.emp_dist &&
          mapped.emp_subdv &&
          mapped.emp_areatype
        ) {
          const blockRes = await axios.get(
            `${API_BASE}block/${mapped.emp_dist}/${mapped.emp_subdv}/${mapped.emp_areatype}`
          );

          const blocks = blockRes.data || [];
          setBlockListEmp(blocks);

          if (!blocks.find((b: any) => String(b.block_code) === String(mapped.emp_areacode))) {
            safeMapped.emp_areacode = "";
          }
        }

        if (mapped.emp_areacode) {
          const wardRes = await axios.get(
            `${API_BASE}villageward/${mapped.emp_areacode}`
          );

          const mappedWards = (wardRes.data || []).map((w: any): Option => ({
            code: String(w.village_code),
            name: w.village_name,
          }));

          setWardsEmp(mappedWards);

          if (!mappedWards.find((w: Option) => w.code === mapped.emp_vill_ward)) {
            safeMapped.emp_vill_ward = "";
          }
        }

      } catch (err) {
        console.error("❌ Hydration failed:", err);
      } finally {
        hydrationDone.current = true;
      }
    };

    hydrateForm();
  }, [initialData]);




  // Read Parent Application ID From Session - Helper function
  const getAmendmentApplicationId = () => {
    const parentCtx = JSON.parse(
      sessionStorage.getItem("BOCWA_AMENDMENT_PARENT_CTX") || "{}"
    );

    return parentCtx?.parentApplicationID || currentApplicationId;

  };



  // Fetch Preview Data (When Tab = 2)
  useEffect(() => {
    if (activeTab !== 2) return;
    if (!currentApplicationId) return;

    const fetchPreviewTabData = async () => {
      setIsPreviewLoading(true);

      try {
        const authData = localStorage.getItem("lc_portal_auth");
        const token = JSON.parse(authData || "{}")?.token;

        const res = await axios.get(
          `${API_BASE}applicant-module/bocwa-amendment/form-data?appId=${encodeURIComponent(currentApplicationId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPreviewData(res.data);
        setPreviewDocuments(res.data?.documents || {});
        setSavedDocuments(res.data?.documents || {});
      } catch (error) {
        console.error(error);
        toast.error("Failed to load preview");
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchPreviewTabData();
  }, [activeTab, currentApplicationId]);

  // Sync Tab to URL When Changed
  useEffect(() => {
    const params = new URLSearchParams(searchParamsTab);
    params.set("tab", String(activeTab));
    setSearchParamsTab(params);
  }, [activeTab]);

  // Hydration effect for amendment from both dashboard and starting
  useEffect(() => {
    const queryId = searchParamsParentID.get("id");

    if (!queryId) return;

    const amendmentCtx = JSON.parse(
      sessionStorage.getItem("BOCWA_AMENDMENT_CTX") || "{}"
    );

    // if already inside amendment flow, don't overwrite
    if (amendmentCtx?.applicationID) return;

    sessionStorage.setItem(
      "BOCWA_CTX",
      JSON.stringify({
        encryptedApplicationId: queryId,
      })
    );

    setCurrentApplicationId(queryId);
  }, [searchParamsParentID]);

  // Load the documents already on record so the applicant can see what was
  // uploaded before, instead of an empty form after a send-back.
  const fetchSavedDocuments = async () => {
    if (!currentApplicationId) return;

    setIsLoadingSavedDocuments(true);

    try {
      const authData = localStorage.getItem("lc_portal_auth");
      const token = JSON.parse(authData || "{}")?.token;

      // Encrypted ids can contain "/" and "=", so keep them in the query string
      // rather than a path segment.
      const res = await axios.get(
        `${API_BASE}applicant-module/bocwa-amendment/form-data?appId=${encodeURIComponent(currentApplicationId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedDocuments(res.data?.documents ?? {});
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSavedDocuments(false);
    }
  };

  // Refresh the uploaded-document list whenever the documents tab opens
  useEffect(() => {
    if (activeTab !== 1) return;
    fetchSavedDocuments();
  }, [activeTab, currentApplicationId]);

  // Create Document Upload Function
  const handleDocumentSubmit = async () => {
    const authData = localStorage.getItem("lc_portal_auth");
    const token = JSON.parse(authData || "{}")?.token;

    if (!token) {
      toast.error("Authentication failed");
      return;
    }

    if (!currentApplicationId) {
      toast.error("Application ID missing");
      return;
    }

    const pickedFiles = Object.entries(uploadedFiles).filter(
      ([, file]) => file !== null
    ) as [string, File][];

    // if (pickedFiles.length === 0) {
    //   toast.error("Please choose at least one document to upload");
    //   return;
    // }

    for (const [, file] of pickedFiles) {
      const validationError = validateFile(file, BOCWA_AMENDMENT_DOCUMENT_RULE);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setIsSavingDocuments(true);

    try {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      /* ---------------------------------------------------
         1️⃣ Upload the bytes first

         This used to run in parallel with the filename save below. Both write
         the same columns, so whichever landed last won — and after a send-back
         the two calls disagreed, leaving the DB naming a file that was never
         written to disk. The ALC then got "file not found". Uploading first and
         recording the names afterwards keeps the two in step.
      --------------------------------------------------- */

      await Promise.all(
        pickedFiles.map(async ([label, file]) => {
          const base64 = await fileToBase64(file);

          const payload = {
            act: "BOCWA",
            applicationType: "AMENDMENT",
            applicationId: metaIds.numeric_application_id,
            documentCode: documentUploadCodeMap[label],
            filename: file.name,
            filecontent: base64,
          };

          return axios.post(`${API_BASE}documents`, payload, {
            headers: authHeaders,
          });
        })
      );

      /* ---------------------------------------------------
         2️⃣ Record the filenames

         Only the documents actually chosen in this session are sent. Sending ""
         for the untouched ones blanked names saved on an earlier pass.
      --------------------------------------------------- */

      const fileNamePayload: any = {
        encryptedId: currentApplicationId,
      };

      pickedFiles.forEach(([label, file]) => {
        fileNamePayload[documentNameKeyMap[label]] = file.name;
      });

      await axios.post(
        `${API_BASE}applicant-module/applications/amendment/bocwa-document-submit`,
        fileNamePayload,
        { headers: authHeaders }
      );

      toast.success("Documents submitted successfully");

      // go to next tab
      setActiveTab(2);
      // Reflect what is now on record and clear the pickers
      setUploadedFiles({});
      setChecked({});
      setDocUploadErrors({});
      await fetchSavedDocuments();

    } catch (error) {
      console.error(error);
      toast.error("Document submission failed");
    } finally {
      setIsSavingDocuments(false);
    }
  };

  // Base64 → Open PDF Function
  const handlePreviewDocumentClick = async (docLabel: string) => {
    if (openingDocument) return;

    setOpeningDocument(docLabel);

    try {
      const authData = localStorage.getItem("lc_portal_auth");
      const token = JSON.parse(authData || "{}")?.token;

      const documentCode = documentUploadCodeMap[docLabel];

      const res = await axios.get(`${API_BASE}documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          enapplicationId: String(currentApplicationId),
          documentCode: String(documentCode),
          source: "F",
          // The numeric application id is not unique across acts — without this
          // the API can resolve a CLRA application carrying the same id.
          act: "BOCWA",
        },
      });

      const { filename, filecontent } = res.data;

      if (!filecontent) {
        toast.error("Document is not available");
        return;
      }

      const byteCharacters = atob(filecontent);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));

      const byteArray = new Uint8Array(byteNumbers);
      const isPdf = String(filename ?? "").toLowerCase().endsWith(".pdf");

      const blob = new Blob([byteArray], {
        type: isPdf ? "application/pdf" : "application/octet-stream",
      });

      const blobUrl = URL.createObjectURL(blob);
      const opened = window.open(blobUrl, "_blank");

      if (!opened) {
        // Popup blocked — fall back to a download so the file is still reachable
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || `${documentCode}.pdf`;
        link.click();
      }

      // Give the new tab time to claim the blob before releasing it
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.status === 404
          ? "The uploaded file could not be found. Please upload it again."
          : "Failed to open document"
      );
    } finally {
      setOpeningDocument(null);
    }
  };


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === "est_date_of_commencement_building" &&
      lastIssuedCommencementDate &&
      value &&
      value < lastIssuedCommencementDate
    ) {
      toast.error(
        `Estimated commencement date cannot be earlier than the last issued application date (${lastIssuedCommencementDate}).`,
      );
      return;
    }

    setFormData((prev: any) => {
      let updated = { ...prev, [name]: value };

      /* =====================================================
         SECTION 1 — ESTABLISHMENT (WORK SITE)
      ===================================================== */
      if (name === "distCode") {
        updated.subDivCode = "";
        updated.areaTypeCode = "";
        updated.blockCode = "";
        updated.villageWardCode = "";
        updated.policeStationCode = "";
      }

      if (name === "subDivCode" || name === "areaTypeCode") {
        updated.blockCode = "";
        updated.villageWardCode = "";
      }

      if (name === "blockCode") {
        updated.villageWardCode = "";
      }

      /* =====================================================
         SECTION 2 — POSTAL
      ===================================================== */
      if (name === "postalDistCode") {
        updated.postalSubDivCode = "";
        updated.postalAreaTypeCode = "";
        updated.postalBlockCode = "";
        updated.postalVillageWardCode = "";
        updated.postalPoliceStationCode = "";
      }

      if (name === "postalSubDivCode" || name === "postalAreaTypeCode") {
        updated.postalBlockCode = "";
        updated.postalVillageWardCode = "";
      }

      if (name === "postalBlockCode") {
        updated.postalVillageWardCode = "";
      }

      /* =====================================================
         SECTION 3 — PERMANENT
      ===================================================== */
      if (name === "est_dist") {
        updated.est_subdivision = "";
        updated.est_areatype = "";
        updated.est_areacode = "";
        updated.est_villward = "";
        updated.est_ps = "";
      }

      if (name === "est_subdivision" || name === "est_areatype") {
        updated.est_areacode = "";
        updated.est_villward = "";
      }

      if (name === "est_areacode") {
        updated.est_villward = "";
      }

      /* =====================================================
         SECTION 4 — MANAGER
      ===================================================== */
      if (name === "manager_dist") {
        updated.manager_subdv = "";
        updated.manager_areatype = "";
        updated.manager_areacode = "";
        updated.manager_vill_ward = "";
        updated.manager_ps = "";
      }

      if (name === "manager_subdv" || name === "manager_areatype") {
        updated.manager_areacode = "";
        updated.manager_vill_ward = "";
      }

      if (name === "manager_areacode") {
        updated.manager_vill_ward = "";
      }

      /* =====================================================
         SECTION 5 — EMPLOYER
      ===================================================== */
      if (name === "emp_dist") {
        updated.emp_subdv = "";
        updated.emp_areatype = "";
        updated.emp_areacode = "";
        updated.emp_vill_ward = "";
        updated.emp_ps = "";
      }

      if (name === "emp_subdv" || name === "emp_areatype") {
        updated.emp_areacode = "";
        updated.emp_vill_ward = "";
      }

      if (name === "emp_areacode") {
        updated.emp_vill_ward = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      const authData = localStorage.getItem("lc_portal_auth");
      const token = JSON.parse(authData || "{}")?.token;

      if (!token) {
        toast.error("Authentication failed");
        return;
      }

      if (
        lastIssuedCommencementDate &&
        formData.est_date_of_commencement_building &&
        formData.est_date_of_commencement_building < lastIssuedCommencementDate
      ) {
        toast.error(
          `Estimated commencement date cannot be earlier than the last issued application date (${lastIssuedCommencementDate}).`,
        );
        return;
      }

      setIsSubmitting(true);

      /* ----------------------------------
         1️⃣ SUBMIT AMENDMENT FORM
      ----------------------------------- */
      const payload = mapFormToPayload(
        formData,
        getAmendmentApplicationId(),
        metaIds,
      );

      const response = await axios.post(
        `${API_BASE}bocwa/amendment/add-edit`,
        // `${API_BASE}applicant-module/bocwa/amendment-form-submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newApplicationId = response.data?.applicationId;

      if (newApplicationId) {
        const existingCtx = JSON.parse(
          sessionStorage.getItem("BOCWA_AMENDMENT_CTX") || "{}"
        );

        sessionStorage.setItem(
          "BOCWA_AMENDMENT_CTX",
          JSON.stringify({
            ...existingCtx,
            applicationID: newApplicationId,
          })
        );

        setCurrentApplicationId(newApplicationId);
      }

      toast.success("Amendment Submitted Successfully");
      setActiveTab(1);

    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function for submitting the amendment finally from the Application Preview tab
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  const handleFinalAmendmentSubmit = async () => {
    try {
      const authData = localStorage.getItem("lc_portal_auth");
      const token = JSON.parse(authData || "{}")?.token;

      if (!token) {
        toast.error("Authentication failed");
        return;
      }

      if (!currentApplicationId) {
        toast.error("Application ID missing");
        return;
      }

      if (!checkedFinal) {
        toast.error("Please accept the declaration before submitting");
        return;
      }

      setIsFinalSubmitting(true);

      const payload = {
        application_id: currentApplicationId,
        backlog_id: "",
        retFees: fees?.total?.toString() || "0",
      };

      const response = await axios.post(
        `${API_BASE}bocwa/amendment/final-submit`,
        // `${API_BASE}applicant-module/applications/amendment/bocwa-registration/preview-submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data?.message || "Amendment submitted successfully");

      // ✅ Redirect to Dashboard after short delay (better UX)
      setTimeout(() => {
        navigate("/applicant-dashboard");
      }, 1200);

    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Final submission failed");
      }
    } finally {
      setIsFinalSubmitting(false);
    }
  };


  function ApplicationPreviewTable({ data }: { data: Record<string, string> }) {
    return (
      <Table className="border">
        <TableHeader>
          <TableRow className="bg-slate-600 hover:bg-slate-600">
            <TableHead className="text-white font-semibold w-1/2">
              Parameters
            </TableHead>
            <TableHead className="text-white font-semibold w-1/2">
              Inputs
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="align-top font-medium border-r">
                <p className="text-wrap wrap-break-word">{key}</p>
              </TableCell>
              <TableCell className="whitespace-pre-line">
                <p className="whitespace-pre-line wrap-break-word">
                  {typeof value === "string"
                    ? value.replace(/<br\s*\/?>/gi, "\n")
                    : value}
                </p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (isPageLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <h1 className="text-lg bg-white font-semibold p-4 mb-4">
          AMENDMENT OF REGISTRATION CERTIFICATE FOR BOCWA
        </h1>

        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <span className="h-10 w-10 border-4 border-gray-300 border-t-[#2A628C] rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading application…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-lg bg-white font-semibold p-4 mb-4">
        AMENDMENT OF REGISTRATION CERTIFICATE FOR BOCWA
      </h1>

      {activeTab === 0 && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="text-[#2A628C] border border-[#2A628C] px-4 py-2 rounded hover:bg-gray-200"
            onClick={() => {
              sessionStorage.removeItem("BOCWA_AMENDMENT_FIELDS");

              navigate(
                `/apply-bocwa?id=${sessionStorage.getItem("BOCWA_AMENDMENT_PARENT_CTX") ? JSON.parse(sessionStorage.getItem("BOCWA_AMENDMENT_PARENT_CTX") || "{}").parentApplicationID : ""}`,
                { replace: true }
              );
            }}
          >
            Reset Amendment Fields
          </button>
        </div>
      )}

      <div className="flex gap-2 border-b mb-4">
        {isReadOnlyStatus ? (
          <TabButton label="APPLICATION PREVIEW" active={true} />
        ) : (
          <>
            <TabButton label="APPLICATION DETAILS" active={activeTab === 0} onClick={() => setActiveTab(0)} />
            <TabButton label="UPLOAD DOCUMENTS" active={activeTab === 1} onClick={() => setActiveTab(1)} />
            <TabButton label="APPLICATION PREVIEW" active={activeTab === 2} onClick={() => setActiveTab(2)} />
          </>
        )}
      </div>

      {activeTab === 0 && (
        <form onSubmit={handleSubmit} className="">
          <Section title="1. NAME AND LOCATION (WORK SITE) OF THE ESTABLISHMENT">
            <Input label="Name of the Establishment" required name="estName" value={formData.estName || ""} onChange={handleChange} editableFields={editableFields} />
            <Select label="Establishment Type" required name="estType" value={formData.estType || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="micro">Micro</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
            <Input label="Location of the Establishment" required name="estLocation" value={formData.estLocation || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="Select District" required name="distCode" value={formData.distCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {districtListEst.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </Select>

            <Select label="Select Subdivision" required name="subDivCode" value={formData.subDivCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {subdivisionListEst.map((s) => (
                <option key={s.sub_div_code} value={s.sub_div_code}>
                  {s.sub_div_name}
                </option>
              ))}
            </Select>

            <Select label="Select Block/Municipality/Corporation/SEZ/NA" required name="areaTypeCode" value={formData.areaTypeCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="B">Block</option>
              <option value="M">Municipality</option>
              <option value="C">Corporation</option>
              <option value="S">SEZ</option>
              <option value="N">Notified Area</option>
            </Select>

            <Select label="Select Municipality" required name="blockCode" value={formData.blockCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {blockListEst.map((b) => (
                <option key={b.block_code} value={b.block_code}>
                  {b.block_mun_name}
                </option>
              ))}
            </Select>

            <Select label="Select Ward" required name="villageWardCode" value={formData.villageWardCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {wardsEst.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </Select>

            <Select label="Select Police Station" required name="policeStationCode" value={formData.policeStationCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {policeStationListEst.map((p) => (
                <option key={p.police_station_code} value={p.police_station_code}>
                  {p.name_of_police_station}
                </option>
              ))}
            </Select>

            <Input label="PIN Code" required name="pin" value={formData.pin || ""} onChange={handleChange} editableFields={editableFields} />
          </Section>

          <Section title="2. REGISTERED OFFICE ADDRESS OF THE ESTABLISHMENT">
            <Input label="2.(a) Location" required name="estRegOfcLoc" value={formData.estRegOfcLoc || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="2.(b) Select District" required name="postalDistCode" value={formData.postalDistCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {districtListPostal.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </Select>

            <Select label="2.(c) Select Subdivision" required name="postalSubDivCode" value={formData.postalSubDivCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {subdivisionListPostal.map((s) => (
                <option key={s.sub_div_code} value={s.sub_div_code}>
                  {s.sub_div_name}
                </option>
              ))}
            </Select>

            <Select label="2.(d) Select Block/ Municipality / Corporation / SEZ / Notified Area" required name="postalAreaTypeCode" value={formData.postalAreaTypeCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="B">Block</option>
              <option value="M">Municipality</option>
              <option value="C">Corporation</option>
              <option value="S">SEZ</option>
              <option value="N">Notified Area</option>
            </Select>

            <Select label="2.(e) Select Municipality" required name="postalBlockCode" value={formData.postalBlockCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {blockListPostal.map((b) => (
                <option key={b.block_code} value={b.block_code}>
                  {b.block_mun_name}
                </option>
              ))}
            </Select>

            <Select label="Select Ward" required name="postalVillageWardCode" value={formData.postalVillageWardCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {wardsPostal.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </Select>

            <Select label="2.(f) Select Police Station" required name="postalPoliceStationCode" value={formData.postalPoliceStationCode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {policeStationListPostal.map((p) => (
                <option key={p.police_station_code} value={p.police_station_code}>
                  {p.name_of_police_station}
                </option>
              ))}
            </Select>

            <Input label="2.(g) PIN Number" required name="postalPin" value={formData.postalPin || ""} onChange={handleChange} editableFields={editableFields} />
          </Section>

          <Section title="3. FULL NAME AND PERMANENT ADDRESS OF THE ESTABLISHMENT">
            <Input label="3.(a) Full Name of the Establishment" required name="e_full_name" value={formData.e_full_name || ""} onChange={handleChange} editableFields={editableFields} />
            <Input label="3.(b) Permanent Address of the Establishment" required name="est_address" value={formData.est_address || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="3.(c) Select District" required name="est_dist" value={formData.est_dist || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {districtListPE.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </Select>

            <Select label="3.(d) Select Subdivision" required name="est_subdivision" value={formData.est_subdivision || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {subdivisionListPE.map((s) => (
                <option key={s.sub_div_code} value={s.sub_div_code}>
                  {s.sub_div_name}
                </option>
              ))}
            </Select>

            <Select label="3.(e) Select Block/ Municipality / Corporation / SEZ / Notified Area" required name="est_areatype" value={formData.est_areatype || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="B">Block</option>
              <option value="M">Municipality</option>
              <option value="C">Corporation</option>
              <option value="S">SEZ</option>
              <option value="N">Notified Area</option>
            </Select>

            <Select label="3.(f) Select Municipality" required name="est_areacode" value={formData.est_areacode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {blockListPE.map((b) => (
                <option key={b.block_code} value={b.block_code}>
                  {b.block_mun_name}
                </option>
              ))}
            </Select>

            <Select label="3.(g) Select Ward" required name="est_villward" value={formData.est_villward || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {wardsPE.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </Select>

            <Select label="3.(h) Select Police Station" required name="est_ps" value={formData.est_ps || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {policeStationListPE.map((p) => (
                <option key={p.police_station_code} value={p.police_station_code}>
                  {p.name_of_police_station}
                </option>
              ))}
            </Select>

            <Input label="3.(i) PIN Number" required name="est_pin" value={formData.est_pin || ""} onChange={handleChange} editableFields={editableFields} />
          </Section>

          <Section title="4. FULL NAME AND ADDRESS OF THE MANAGER OR PERSON RESPONSIBLE FOR THE SUPERVISION AND CONTROL OF THE ESTABLISHMENT">
            <Input label="4.(a) Full name of the Manager or Person Responsible" required name="full_name_manager" value={formData.full_name_manager || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="4.(b) Select Country" required name="manager_country" value={formData.manager_country || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="1">India</option>
              <option value="2">Others</option>
            </Select>

            <Input label="4.(c) Address Line 1 of the Manager or Person responsible" required name="address_manager" value={formData.address_manager || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="4.(d) Select State" required name="manager_state" value={formData.manager_state || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {stateListMgr.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </Select>

            <Select label="4.(e) Select District" required name="manager_dist" value={formData.manager_dist || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {districtListMgr.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </Select>

            <Select label="4.(f) Select Subdivision" required name="manager_subdv" value={formData.manager_subdv || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {subdivisionListMgr.map((s) => (
                <option key={s.sub_div_code} value={s.sub_div_code}>
                  {s.sub_div_name}
                </option>
              ))}
            </Select>

            <Select label="4.(g) Select Areatype" required name="manager_areatype" value={formData.manager_areatype || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="B">Block</option>
              <option value="M">Municipality</option>
              <option value="C">Corporation</option>
              <option value="S">SEZ</option>
              <option value="N">Notified Area</option>
            </Select>

            <Select label="4.(h) Select Municipality" required name="manager_areacode" value={formData.manager_areacode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {blockListMgr.map((b) => (
                <option key={b.block_code} value={b.block_code}>
                  {b.block_mun_name}
                </option>
              ))}
            </Select>

            <Select label="4.(i) Select Ward" required name="manager_vill_ward" value={formData.manager_vill_ward || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {wardsMgr.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </Select>

            <Select label="4.(j) Select Police Station" required name="manager_ps" value={formData.manager_ps || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {policeStationListMgr.map((p) => (
                <option key={p.police_station_code} value={p.police_station_code}>
                  {p.name_of_police_station}
                </option>
              ))}
            </Select>

            <Input label="4.(k) PIN Number" required name="manager_pin" value={formData.manager_pin || ""} onChange={handleChange} editableFields={editableFields} />
          </Section>

          <Section title="5. NAME AND ADDRESS OF THE EMPLOYER">
            <Input label="5.(a) Name of the Employer" required name="emp_name" value={formData.emp_name || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="5.(b) Gender" required name="emp_gender" value={formData.emp_gender || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </Select>

            <Select label="5.(c) Select Country" required name="emp_country" value={formData.emp_country || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="1">India</option>
              <option value="2">Others</option>
            </Select>

            <Input label="5.(d) Address Line 1 of the Employer" required name="emp_address" value={formData.emp_address || ""} onChange={handleChange} editableFields={editableFields} />

            <Select label="5.(e) Select State" required name="emp_state" value={formData.emp_state || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {stateListEmp.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </Select>

            <Select label="5.(f) Select District" required name="emp_dist" value={formData.emp_dist || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {districtListEmp.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </Select>

            <Select label="5.(g) Select Subdivision" required name="emp_subdv" value={formData.emp_subdv || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {subdivisionListEmp.map((s) => (
                <option key={s.sub_div_code} value={s.sub_div_code}>
                  {s.sub_div_name}
                </option>
              ))}
            </Select>

            <Select label="5.(h) Select Areatype" required name="emp_areatype" value={formData.emp_areatype || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              <option value="B">Block</option>
              <option value="M">Municipality</option>
              <option value="C">Corporation</option>
              <option value="S">SEZ</option>
              <option value="N">Notified Area</option>
            </Select>

            <Select label="5.(i) Select Municipality" required name="emp_areacode" value={formData.emp_areacode || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {blockListEmp.map((b) => (
                <option key={b.block_code} value={b.block_code}>
                  {b.block_mun_name}
                </option>
              ))}
            </Select>

            <Select label="5.(j) Select Ward" required name="emp_vill_ward" value={formData.emp_vill_ward || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {wardsEmp.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </Select>

            <Select label="5.(k) Select Police Station" required name="emp_ps" value={formData.emp_ps || ""} onChange={handleChange} editableFields={editableFields}>
              <option value="">Select</option>
              {policeStationListEmp.map((p) => (
                <option key={p.police_station_code} value={p.police_station_code}>
                  {p.name_of_police_station}
                </option>
              ))}
            </Select>

            <Input label="5.(l) PIN Number" required name="emp_pin" value={formData.emp_pin || ""} onChange={handleChange} editableFields={editableFields} />
          </Section>

          <Section title="6. OTHER INFORMATION">
            <OtherInput label="6.(a) Nature of building or other construction work is to be carried on" required name="nature_of_build_const" value={formData.nature_of_build_const || ""} onChange={handleChange} editableFields={editableFields} />
            <OtherInput label="6.(b) Maximum number of building workers to be employed on any day" required name="max_no_workers" value={formData.max_no_workers || ""} onChange={handleChange} editableFields={editableFields} />

            <OtherInput
              type="date"
              label="6.(c) Estimated date of commencement of building or other construction work"
              required
              name="est_date_of_commencement_building"
              value={formData.est_date_of_commencement_building || ""}
              min={lastIssuedCommencementDate || undefined}
              onChange={handleChange}
              onClick={openNativeDatePicker}
              editableFields={editableFields}
            />
            {lastIssuedCommencementDate && editableFields.has("est_date_of_commencement_building") && (
              <p className="text-xs text-gray-600 md:col-span-3 -mt-2">
                Cannot be earlier than last issued commencement date: {lastIssuedCommencementDate}
              </p>
            )}

            <OtherInput type="date" label="6.(d) Estimated date of the completion of building or other construction work" required name="est_date_of_completion_building" value={formData.est_date_of_completion_building || ""} onChange={handleChange} onClick={openNativeDatePicker} editableFields={editableFields} />
          </Section>

          <div className="flex justify-end mt-6 mb-15">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? "SAVING..." : "Save And Next"}
            </button>
          </div>
        </form>
      )}

      {activeTab === 1 && (<>
        {/* <form onSubmit={handleSubmit} className="max-w-7xl w-full">
          <Section title="UPLOAD SUPPORTING DOCUMENTS"> */}
        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">UPLOAD SUPPORTING DOCUMENTS</div>
        <div className="divide-y bg-white">
          {documents.map((doc, idx) => {
            const savedFileName = savedDocuments?.[previewDocumentKeyMap[doc]];

            return (
              <div
                key={idx}
                className="w-full px-4 py-3 flex items-center justify-between gap-4"
              >
                {/* Left: Checkbox + Label */}
                <label className="w-1/2 flex items-start gap-2 text-sm font-medium shrink-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-0.5"
                    checked={!!checked[doc]}
                    onChange={() => toggleCheck(doc)}
                  />
                  <span className="leading-snug text-wrap wrap-break-word">
                    {doc}

                    {/* Show what is already on record for this document */}
                    {isLoadingSavedDocuments ? (
                      <span className="block mt-1 text-xs font-normal text-gray-400">
                        Checking uploaded file…
                      </span>
                    ) : savedFileName ? (
                      <span className="mt-1 flex items-center gap-2 text-xs font-normal text-gray-600">
                        <FaFilePdf className="text-red-600 shrink-0" />
                        <span className="wrap-break-word">{savedFileName}</span>
                        <button
                          type="button"
                          onClick={() => handlePreviewDocumentClick(doc)}
                          disabled={openingDocument === doc}
                          className="text-[#2A628C] underline hover:text-black disabled:opacity-60 shrink-0"
                        >
                          {openingDocument === doc ? "Opening…" : "View"}
                        </button>
                      </span>
                    ) : (
                      <span className="block mt-1 text-xs font-normal text-gray-400">
                        Not uploaded yet
                      </span>
                    )}
                  </span>
                </label>

                {/* Right: File Upload */}
                <div className="flex-1 flex flex-col items-end gap-1">
                  {checked[doc] && (
                    <>
                      <input
                        type="file"
                        name={doc}
                        accept={toAcceptAttribute(BOCWA_AMENDMENT_DOCUMENT_RULE)}
                        disabled={isSavingDocuments}
                        onChange={(e) => {
                          const input = e.currentTarget;
                          const file = input.files?.[0] || null;

                          if (file) {
                            const validationError = validateFile(
                              file,
                              BOCWA_AMENDMENT_DOCUMENT_RULE,
                            );
                            if (validationError) {
                              toast.error(validationError);
                              setDocUploadErrors((prev) => ({
                                ...prev,
                                [doc]: validationError,
                              }));
                              setUploadedFiles((prev) => ({
                                ...prev,
                                [doc]: null,
                              }));
                              input.value = "";
                              return;
                            }
                          }

                          setDocUploadErrors((prev) => ({ ...prev, [doc]: null }));
                          setUploadedFiles((prev) => ({
                            ...prev,
                            [doc]: file,
                          }));
                        }}
                        className="w-full max-w-md text-xs border rounded px-2 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2A628C] file:text-white hover:file:bg-[#2A625C] disabled:opacity-60"
                      />
                      <span className="text-[11px] text-gray-600 max-w-md text-right">
                        {describeRule(BOCWA_AMENDMENT_DOCUMENT_RULE)}
                      </span>
                      {docUploadErrors[doc] && (
                        <p className="text-red-600 text-[11px] max-w-md text-right" role="alert">
                          {docUploadErrors[doc]}
                        </p>
                      )}
                      {savedFileName && uploadedFiles[doc] && (
                        <span className="text-[11px] text-amber-700 max-w-md text-right">
                          This will replace the existing file.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* </Section> */}

        <div className="flex justify-end mt-4 mb-15">
          <button
            type="button"
            onClick={handleDocumentSubmit}
            disabled={isSavingDocuments}
            className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-[#2A625C] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSavingDocuments && (
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isSavingDocuments ? "SAVING..." : "SAVE AND NEXT"}
          </button>
        </div>
        {/* </form> */}
      </>)}

      {activeTab === 2 && isPreviewLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 bg-white">
          <span className="h-10 w-10 border-4 border-gray-300 border-t-[#2A628C] rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading preview…</p>
        </div>
      )}

      {activeTab === 2 && !isPreviewLoading && (
        <>
          <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">ESTABLISHMENT DETAILS</div>
          <div className="bg-white">
            {/* <div className="flex gap-2 p-4">
              <p><span className="font-semibold">Authorized Registering office for this application:</span> Regional Labour Office, Jhargram, Jhargram</p>
              <button
                className="px-3 py-1 bg-sky-500 text-xs rounded-md text-white hover:bg-sky-600"
                onClick={() => navigate("/rlo-details/jhargram/10")}>
                MORE INFO
              </button>
            </div> */}

            <div className="max-w-7xl mx-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApplicationPreviewTable data={establishmentDetails} />
                <ApplicationPreviewTable data={employerDetails} />
              </div>
            </div>

            <div className="bg-slate-600 hover:bg-slate-600 text-white mx-4 p-2">
              Documents Uploaded
            </div>
            <div className="bg-white p-4">
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-slate-600 hover:bg-slate-600">
                    <TableHead className="text-white font-semibold w-1/2">
                      Document Name
                    </TableHead>
                    <TableHead className="text-white font-semibold w-1/2">
                      Files
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {documents.map((docName) => {
                    const key = previewDocumentKeyMap[docName];
                    const fileName = previewDocuments?.[key];

                    return (
                      <TableRow key={docName}>
                        <TableCell className="font-medium border-r">
                          {docName}
                        </TableCell>

                        <TableCell>
                          {fileName ? (
                            <button
                              onClick={() => handlePreviewDocumentClick(docName)}
                              disabled={openingDocument === docName}
                              className="text-red-600 hover:text-red-800 flex items-center gap-2 disabled:opacity-60 text-left"
                            >
                              <FaFilePdf className="text-red-600 text-lg shrink-0" />
                              <span className="text-sm text-gray-700 wrap-break-word">
                                {fileName}
                              </span>
                              {openingDocument === docName && (
                                <span className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin shrink-0" />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Not Uploaded
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {!isReadOnlyStatus && (
              <div className="flex gap-2 items-center mx-4 mt-2 pb-4">
                <input
                  type="checkbox"
                  className="h-3 w-3"
                  checked={checkedFinal}
                  onChange={() => setCheckedFinal(!checkedFinal)}
                />
                <p className="leading-snug text-wrap wrap-break-word">
                  <span className="text-red-500">*</span>I hereby declare that the particulars given above are true to the best of my knowledge and belief.
                </p>
              </div>
            )}
          </div>

          {!isReadOnlyStatus && (
            <div className="flex justify-end mt-4 mb-15">
              <button
                type="button"
                className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!checkedFinal || isFinalSubmitting}
                onClick={handleFinalAmendmentSubmit}
              >
                {isFinalSubmitting && (
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isFinalSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BOCWAAmendmentForm;
