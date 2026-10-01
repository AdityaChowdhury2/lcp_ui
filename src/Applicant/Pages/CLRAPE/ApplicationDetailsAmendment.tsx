import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ApplicationPreview from "./application-preview/ApplicationPreview";
import { ContractorInformationTab } from "./contractor-management/ContractorInformationTab";
import { ROUTE_ADD_CONTRACTOR } from "./contractor-management/constants";
import {
    selectContractors,
    fetchContractorsList,
    selectContractorsListLoading,
    selectContractorsListError,
} from "@/store/contractorsSlice";
import { toast } from "react-toastify";
import { encryptionDecryptionFun } from "../../../utils/encryption";

import { API_BASE } from "@/constants/constants";
import {
    CLRA_AMENDMENT_DOCUMENT_RULE,
    describeRule,
    toAcceptAttribute,
    validateFile,
} from "@/utils/fileUpload";

const backendToUIMap: Record<string, string[]> = {
    /** ---------------------------------------
     * 1. Name of Establishment
     * Now controls BOTH name + type
     * --------------------------------------*/
    e_name: ["estName", "estType"],

    /** ---------------------------------------
     * 1a. Admin Location (ALC approval)
     * I mapped ONLY district/subdivision/block
     * (You may adjust later)
     * --------------------------------------*/
    e_location: ["distCode", "subDivCode", "areaTypeCode", "blockCode"],

    /** ---------------------------------------
     * 1b. Address Part
     * --------------------------------------*/
    location: ["estLocation", "villageWardCode", "policeStationCode", "pin"],

    /** ---------------------------------------
     * 2. Postal Address (Full Section Editable)
     * --------------------------------------*/
    e_postal_address: [
        "estRegOfcLoc",
        "postalDistCode",
        "postalSubDivCode",
        "postalAreaTypeCode",
        "postalBlockCode",
        "postalVillageWardCode",
        "postalPoliceStationCode",
        "postalPin",
    ],

    /** ---------------------------------------
     * 3. Principal Employer (FULL SECTION)
     * --------------------------------------*/
    pe_details: [
        "full_name_principal_emp",
        "gender_pe",
        "emp_country",
        "emp_state",
        "address_principal_emp",
        "emp_dist",
        "loc_emp_subdv",
        "loc_emp_areatype",
        "emp_name_areatype",
        "loc_emp_vill_ward",
        "loc_emp_ps",
        "loc_emp_pin_number",
    ],

    /** ---------------------------------------
     * 4. Manager Details (FULL SECTION)
     * --------------------------------------*/
    man_details: [
        "full_name_manager",
        "manager_country",
        "address_manager",
        "manager_state",
        "manager_dist",
        "loc_manager_subdv",
        "loc_manager_areatype",
        "manager_name_areatype",
        "loc_manager_vill_ward",
        "loc_manager_ps",
        "loc_manager_pin_number",
    ],

    /** ---------------------------------------
     * 5. Nature of Work (FULL SECTION)
     * --------------------------------------*/
    e_nature_of_work: [
        "natureOfWork",
        "other_nature_of_work_value",
        "max_num_wrkmen",
        "e_num_of_workmen_per_or_reg",
        "e_num_of_workmen_temp_or_reg",
        "workmen_if_same_similar_kind_of_work",
        "con_lab_job_desc",
        "con_lab_wage_rate_other_benefits",
        "con_lab_cat_desig_nom",
        "e_settlement_award_judgement_min_wage",
    ],

    /** ---------------------------------------
     * Individual 5a–5d Controls (Granular)
     * --------------------------------------*/
    max_num_wrkmen: ["max_num_wrkmen"],
    e_num_of_workmen_per_or_reg: ["e_num_of_workmen_per_or_reg"],
    e_num_of_workmen_temp_or_reg: ["e_num_of_workmen_temp_or_reg"],
    workmen_if_same_similar_kind_of_work: ["workmen_if_same_similar_kind_of_work"],
    con_lab_job_desc: ["con_lab_job_desc"],
    con_lab_wage_rate_other_benefits: ["con_lab_wage_rate_other_benefits"],
    con_lab_cat_desig_nom: ["con_lab_cat_desig_nom"],
    e_settlement_award_judgement_min_wage: ["e_settlement_award_judgement_min_wage"],

    /** ---------------------------------------
     * 6. Contract Labour Count
     * --------------------------------------*/
    e_any_day_max_num_of_workmen: ["e_any_day_max_num_of_workmen"],

    /** ---------------------------------------
     * Trade Union Tab Trigger
     * --------------------------------------*/
    add_trade_union: ["tradeUnion"],

    /** ---------------------------------------
     * Contractor Tab Trigger
     * --------------------------------------*/
    add_contractor: ["contractor"],
};

// Validation schema for trade unions
const tradeUnionSchema = yup.object({
    tradeUnions: yup
        .array()
        .of(
            yup.object({
                regNumber: yup
                    .string()
                    .required("Registration number is required"),
                name: yup
                    .string()
                    .required("Trade union name is required"),
                address: yup
                    .string()
                    .required("Address is required"),
            })
        )
        .min(1, "At least one trade union is required"),
});


interface Option {
    code: string;
    name: string;
}

type NatureOfWorkOption = {
    value: string;
    label: string;
};

const Spinner: React.FC<{ className?: string }> = ({ className = "h-4 w-4 border-2" }) => (
    <span
        className={`inline-block animate-spin rounded-full border-current border-t-transparent ${className}`}
        aria-hidden="true"
    />
);

/* Shared look for an action button that can be busy/disabled. */
const actionButtonClass =
    "bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black flex items-center justify-center gap-2 " +
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#2A628C]";

const TabButton: React.FC<{
    active?: boolean;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ active, label, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-t-md border text-sm font-medium
            ${active
                ? "bg-[#2A628C] text-white border-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
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

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
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

// Trade Union Data Table Columns
const tradeUnionColumns: TableColumn<any>[] = [
    {
        name: "Sl. No",
        cell: (_, index) => index + 1,
        width: "100px",
    },
    {
        name: "Trade Union Registration Number",
        selector: (row) => row.regNumber,
    },
    {
        name: "Trade Union Name",
        selector: (row) => row.name,
    },
    {
        name: "Address",
        selector: (row) => row.address,
        wrap: true,
    },
    {
        name: "Operations",
        selector: (row) => row.operations,
        wrap: true,
    },
];

const dataTableCustomStyles = {
    headRow: {
        style: {
            backgroundColor: "#2A628C",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "14px",
            minHeight: "45px",
        },
    },
    headCells: {
        style: {
            color: "#ffffff",
        },
    },
    rows: {
        style: {
            minHeight: "42px",
        },
    },
};

// Create Document → Payload Key Map
const documentUploadCodeMap: Record<string, string> = {
    "Trade License": "TL",
    "Articles of Association and Memorandum of Association / Partnership Deed": "AOA",
    "Factory License if any": "FL",
    "Any other document in support of correctness of the particulars mentioned in the application if required": "ODSC",
    "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": "CR",
};

// Dcoument DB column names mapping object
const documentUploadColumnMap: Record<string, string> = {
    "Trade License": "trade_license_file",
    "Articles of Association and Memorandum of Association / Partnership Deed":
        "article_of_assoc_file",
    "Factory License if any": "factory_license_file",
    "Any other document in support of correctness of the particulars mentioned in the application if required":
        "other_doc_file",
    "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.":
        "certificate_other_states",
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

/**
 * Filename already stored against a document column, if any. `documents` comes
 * back from final-preview either as the column-keyed row (amendments) or as a
 * list of uploaded-document records.
 */
const existingDocumentName = (
    documentsSummary: any,
    columnName: string,
    documentCode: string
): string | null => {
    if (!documentsSummary) return null;

    if (Array.isArray(documentsSummary)) {
        const match = documentsSummary.find(
            (d: any) =>
                d.documentCode === documentCode ||
                d.document_code === documentCode ||
                d.document_type_code === documentCode
        );
        return match?.file_name ?? match?.filename ?? match?.document_name ?? null;
    }

    const value = documentsSummary[columnName];
    return typeof value === "string" && value.trim() !== "" ? value : null;
};

const mapFormToPayload = (
    formData: any,
    application_id: string,
    metaIds: any,
    natureOfWork: string[],
    uploadedFiles: Record<string, File | null>,
    documentsSummary: any
) => {
    const documentPayload: Record<string, string | null> = {};

    // A document the user did not re-upload keeps whatever is already on file;
    // sending null here would wipe the stored attachment.
    Object.entries(documentUploadColumnMap).forEach(([label, columnName]) => {
        documentPayload[columnName] = uploadedFiles[label]
            ? uploadedFiles[label]!.name
            : existingDocumentName(
                documentsSummary,
                columnName,
                documentUploadCodeMap[label]
            );
    });



    return cleanPayload({
        regNo: localStorage.getItem("NEW_CLRA_AMENDMENT_REG_NO") || "",
        application_id: application_id,
        act_id: "1",
        identification_number: metaIds.identification_number,
        amendment_parent_id: metaIds.amendment_parent_id,

        /* Establishment */
        e_name: formData.estName,
        est_type: formData.estType,
        loc_e_name: formData.estLocation,
        loc_e_dist: formData.distCode,
        loc_e_subdivision: formData.subDivCode,
        loc_e_areatype: formData.areaTypeCode,
        name_areatype: formData.blockCode,
        loc_e_vill_ward: formData.villageWardCode,
        loc_e_ps: formData.policeStationCode,
        loc_e_pin_number: formData.pin,

        /* Postal */
        e_postal_address: formData.estRegOfcLoc,
        e_postal_dist: formData.postalDistCode,
        e_postal_subdivision: formData.postalSubDivCode,
        e_postal_areatype: formData.postalAreaTypeCode,
        e_postal_name_areatype: formData.postalBlockCode,
        e_postal_vill_ward: formData.postalVillageWardCode,
        e_postal_ps: formData.postalPoliceStationCode,
        e_postal_pin_number: formData.postalPin,

        /* Principal Employer */
        full_name_principal_emp: formData.full_name_principal_emp,
        gender_pe: formData.gender_pe,
        address_principal_emp: formData.address_principal_emp,
        emp_country: formData.emp_country,
        emp_state: formData.emp_state,
        emp_dist: formData.emp_dist,
        loc_emp_subdv: formData.loc_emp_subdv,
        loc_emp_areatype: formData.loc_emp_areatype,
        emp_name_areatype: formData.emp_name_areatype,
        loc_emp_vill_ward: formData.loc_emp_vill_ward,
        loc_emp_ps: formData.loc_emp_ps,
        loc_emp_pin_number: formData.loc_emp_pin_number,

        /* Manager */
        full_name_manager: formData.full_name_manager,
        address_manager: formData.address_manager,
        manager_country: formData.manager_country,
        manager_state: formData.manager_state,
        manager_dist: formData.manager_dist,
        loc_manager_subdv: formData.loc_manager_subdv,
        loc_manager_areatype: formData.loc_manager_areatype,
        manager_name_areatype: formData.manager_name_areatype,
        loc_manager_vill_ward: formData.loc_manager_vill_ward,
        loc_manager_ps: formData.loc_manager_ps,
        loc_manager_pin_number: formData.loc_manager_pin_number,

        /* Labour */
        max_num_wrkmen: formData.max_num_wrkmen,
        e_num_of_workmen_per_or_reg: formData.e_num_of_workmen_per_or_reg,
        e_num_of_workmen_temp_or_reg: formData.e_num_of_workmen_temp_or_reg,
        workmen_if_same_similar_kind_of_work:
            formData.workmen_if_same_similar_kind_of_work === "yes" ? 1 : 0,

        con_lab_job_desc: formData.con_lab_job_desc,
        con_lab_wage_rate_other_benefits: formData.con_lab_wage_rate_other_benefits,
        con_lab_cat_desig_nom: formData.con_lab_cat_desig_nom,
        e_settlement_award_judgement_min_wage:
            formData.e_settlement_award_judgement_min_wage,

        e_any_day_max_num_of_workmen: formData.e_any_day_max_num_of_workmen,

        e_nature_of_work: natureOfWork,
        other_nature_of_work_value: formData.other_nature_of_work_value,
        ...documentPayload,
    });

};

const mapPreviewToForm = (est: any) => ({
    estName: est?.e_name ?? "",
    estType: est?.est_type ?? "",
    estLocation: est?.loc_e_name ?? "",
    distCode: est?.loc_e_dist ?? "",
    subDivCode: est?.loc_e_subdivision ?? "",
    areaTypeCode: est?.loc_e_areatype ?? "",
    blockCode: est?.name_areatype ?? "",
    villageWardCode: est?.loc_e_vill_ward ?? "",
    policeStationCode: est?.l_e_ps ?? "",   // ✅ correct key from API
    pin: est?.loc_e_pin_number ?? "",

    estRegOfcLoc: est?.e_postal_address ?? "",
    postalDistCode: est?.e_postal_dist ?? "",
    postalSubDivCode: est?.e_postal_subdivision ?? "",
    postalAreaTypeCode: est?.e_postal_areatype ?? "",
    postalBlockCode: est?.e_postal_name_areatype ?? "",
    postalVillageWardCode: est?.e_postal_vill_ward ?? "",
    postalPoliceStationCode: est?.e_postal_ps ?? "",
    postalPin: est?.e_postal_pin_number ?? "",

    full_name_principal_emp: est?.full_name_principal_emp ?? "",
    gender_pe: est?.gender_pe ?? "",
    address_principal_emp: est?.address_principal_emp ?? "",
    emp_country: est?.loc_emp_country ?? "",
    emp_state: est?.loc_emp_state ?? "",
    emp_dist: est?.loc_emp_dist ?? "",
    loc_emp_subdv: est?.loc_emp_subdivision ?? "",
    loc_emp_areatype: est?.loc_emp_areatype ?? "",
    emp_name_areatype: est?.emp_name_areatype ?? "",
    loc_emp_vill_ward: est?.loc_emp_vill_ward ?? "",
    loc_emp_ps: est?.l_emp_ps ?? "",   // ✅ correct key
    loc_emp_pin_number: est?.loc_emp_pin_number ?? "",

    full_name_manager: est?.full_name_manager ?? "",
    address_manager: est?.address_manager ?? "",
    manager_country: est?.loc_manager_country ?? "",
    manager_state: est?.loc_manager_state ?? "",
    manager_dist: est?.loc_manager_dist ?? "",
    loc_manager_subdv: est?.loc_manager_subdivision ?? "",
    loc_manager_areatype: est?.loc_manager_areatype ?? "",
    manager_name_areatype: est?.manager_name_areatype ?? "",
    loc_manager_vill_ward: est?.loc_manager_vill_ward ?? "",
    loc_manager_ps: est?.l_manager_ps ?? "",  // ✅ correct key
    loc_manager_pin_number: est?.loc_manager_pin_number ?? "",

    max_num_wrkmen: est?.max_num_wrkmen ?? "",
    e_num_of_workmen_per_or_reg: est?.e_num_of_workmen_per_or_reg ?? "",
    e_num_of_workmen_temp_or_reg: est?.e_num_of_workmen_temp_or_reg ?? "",
    e_any_day_max_num_of_workmen: est?.e_any_day_max_num_of_workmen ?? "",

    con_lab_job_desc: est?.con_lab_job_desc ?? "",
    con_lab_wage_rate_other_benefits: est?.con_lab_wage_rate_other_benefits ?? "",
    con_lab_cat_desig_nom: est?.con_lab_cat_desig_nom ?? "",
    e_settlement_award_judgement_min_wage:
        est?.e_settlement_award_judgement_min_wage ?? "",
});

const ApplicationDetailsAmendment: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const contractors = useSelector(selectContractors);
    const contractorsListLoading = useSelector(selectContractorsListLoading);
    const contractorsListError = useSelector(selectContractorsListError);

    const location = useLocation();
    const fetchedPreviewApplicationId = useRef<string | null>(null);

    // Add State For API Trade Union Data
    const [existingTradeUnions, setExistingTradeUnions] = useState<TradeUnionRow[]>([]);

    const [metaIds, setMetaIds] = useState({
        identification_number: "",
        amendment_parent_id: "",
        numeric_application_id: 0,   // 👈 needed for upload API
    });

    const { applicationId: applicationIdParam, id } = useParams<{ applicationId?: string; id?: string }>();

    const [searchParams, setSearchParams] = useSearchParams();

    const amendmentCtx = JSON.parse(
        sessionStorage.getItem("CLRA_AMENDMENT_CTX") || "{}"
    );

    const clraCtx = JSON.parse(
        sessionStorage.getItem("CLRA_CTX") || "{}"
    );

    const queryId = searchParams.get("id");

    const [currentApplicationId, setCurrentApplicationId] = useState(
        amendmentCtx.applicationID ||          // Existing amendment flow
        queryId ||                             // URL fallback
        clraCtx.encryptedApplicationId ||     // Dashboard flow
        ""
    );

    const amendmentSession = sessionStorage.getItem("CLRA_AMENDMENT_FIELDS");

    const amendedFields: string[] = amendmentSession
        ? JSON.parse(amendmentSession).amendedFields
        : [];


    /* ---------------------------------------------
   Amendment Mode Detection (CORE LOGIC)
---------------------------------------------- */

    const isTradeUnionSelected = amendedFields.includes("add_trade_union");

    const otherAmendments = amendedFields.filter(
        (f) => f !== "add_trade_union" && f !== "add_contractor"
    );

    const hasOtherAmendments = otherAmendments.length > 0;

    /*
    Trade union editing allowed ONLY when:
    Trade union selected + at least one real amendment selected
    */
    const allowTradeUnionEditing = isTradeUnionSelected && hasOtherAmendments;

    /* ---------------------------------------------
       Build Editable Fields ONLY from real amendments
    ---------------------------------------------- */

    const editableFields = React.useMemo(() => {
        const set = new Set<string>();

        otherAmendments.forEach((backendKey) => {
            backendToUIMap[backendKey]?.forEach((uiField) => {
                set.add(uiField);
            });
        });

        return set;
    }, [amendedFields]);


    // React Hook Form (Trade Union)
    const {
        control,
        register,
        handleSubmit: handleTradeUnionSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(tradeUnionSchema),
        defaultValues: {
            tradeUnions: [
                { regNumber: "", name: "", address: "" },
            ],
        },
    });

    // Initialize React Hook Form
    const { fields, append, remove } = useFieldArray({
        control,
        name: "tradeUnions",
    });


    interface TradeUnion {
        regNumber: string;
        name: string;
        address: string;
    }

    interface ApiTradeUnion {
        id: number;
        application_id: string;
        e_trade_union_regn_no: string | null;
        e_trade_union_name: string | null;
        e_trade_union_address: string | null;
    }
    interface TradeUnionRow {
        regNumber: string;
        name: string;
        address: string;
    }

    const [showTradeUnion, setShowTradeUnion] = useState<"no" | "yes">("no");

    // Master data source
    const [tradeUnions, setTradeUnions] = useState<TradeUnion[]>([]);

    // Controls whether form is visible
    const [isEditing, setIsEditing] = useState(false);

    const [isDetailsSubmitted, setIsDetailsSubmitted] = useState(
        sessionStorage.getItem("CLRA_AMENDMENT_DETAILS_SUBMITTED") === "true"
    );

    /* In-flight guards. Each async action owns one so the button can be
       disabled and the handler can bail out on a duplicate click. */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingTradeUnion, setIsSubmittingTradeUnion] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const TAB_KEYS = {
        DETAILS: "details",
        TRADE_UNION: "trade-union",
        CONTRACTOR: "contractor",
        PREVIEW: "preview",
    } as const;

    const activeTab = searchParams.get("tab") ?? TAB_KEYS.DETAILS;

    const fromDashboard = searchParams.get("fromDashboard") === "true";

    // useEffect to prevent tab switching to trade union and contractor information tab through manually changing the URL as well
    useEffect(() => {
        const blockedTabs = [
            TAB_KEYS.TRADE_UNION,
            TAB_KEYS.CONTRACTOR,
        ];

        if (
            !isDetailsSubmitted &&
            !fromDashboard &&
            blockedTabs.includes(activeTab as any)
        ) {
            toast.warning("Please submit Application Details first.");

            const next = new URLSearchParams(searchParams);
            next.set("tab", TAB_KEYS.DETAILS);
            setSearchParams(next, { replace: true });
        }
    }, [activeTab, isDetailsSubmitted, searchParams, setSearchParams]);

    /**
     * applicationId for final-preview API. Resolution order:
     * 1. Route path (:applicationId or :id) 2. Query ?applicationId=
     * 3. location.state (referenceId/applicationId) 4. When on Preview tab: env or dev fallback
     */
    const applicationIdFromUrl = applicationIdParam ?? id ?? searchParams.get("applicationId") ?? null;
    const applicationIdFromState = (location.state as { applicationId?: string; referenceId?: string } | null)?.applicationId
        ?? (location.state as { referenceId?: string } | null)?.referenceId
        ?? null;
    const defaultPreviewId =
        typeof import.meta.env.VITE_DEFAULT_PREVIEW_APPLICATION_ID === "string" &&
            import.meta.env.VITE_DEFAULT_PREVIEW_APPLICATION_ID.trim() !== ""
            ? import.meta.env.VITE_DEFAULT_PREVIEW_APPLICATION_ID.trim()
            : "";
    // : "mom9ppUh1Cu6kCKDqiv20w==";
    const applicationId =
        applicationIdFromUrl ??
        applicationIdFromState ??
        (activeTab === TAB_KEYS.PREVIEW ? defaultPreviewId : null);

    const setActiveTab = (tab: string) => {
        if (
            !isDetailsSubmitted &&
            !fromDashboard &&
            (tab === TAB_KEYS.TRADE_UNION ||
                tab === TAB_KEYS.CONTRACTOR)
        ) {
            toast.warning("Please submit Application Details first.");
            return;
        }

        const next = new URLSearchParams(searchParams);
        next.set("tab", tab);
        setSearchParams(next);
    };

    /** Tab order behind the "Save & Next" buttons; Preview holds the final Submit. */
    const TAB_ORDER = [
        TAB_KEYS.DETAILS,
        TAB_KEYS.TRADE_UNION,
        TAB_KEYS.CONTRACTOR,
        TAB_KEYS.PREVIEW,
    ] as const;

    /**
     * Advances after a successful save. Skips the `setActiveTab` gate on purpose:
     * `isDetailsSubmitted` was only just set and is still stale in this tick.
     */
    const goToNextTab = (currentTab: string) => {
        const nextTab = TAB_ORDER[TAB_ORDER.indexOf(currentTab as any) + 1];
        if (!nextTab) return;

        const next = new URLSearchParams(searchParams);
        next.set("tab", nextTab);
        setSearchParams(next);
    };

    const [formData, setFormData] = useState<any>({});
    const [appStatus, setAppStatus] = useState<string | null>(null);

    const isEditable = appStatus === null || appStatus === "U" || appStatus === "B" || appStatus === "I";

    console.log(appStatus, "appstatus");
    console.log(isEditable, "isEditable");

    const [natureOfWork, setNatureOfWork] = useState<string[]>([]);
    const [otherNature, setOtherNature] = useState("");

    /* ==========================================================
   SECTION-WISE LOCATION STATE (ISOLATED)
   ========================================================== */

    /* Section 1 — Establishment */
    const [subdivisionListEst, setSubdivisionListEst] = useState<any[]>([]);
    const [blockListEst, setBlockListEst] = useState<any[]>([]);
    const [wardsEst, setWardsEst] = useState<Option[]>([]);
    const [policeStationListEst, setPoliceStationListEst] = useState<any[]>([]);

    /* Section 2 — Postal */
    const [subdivisionListPostal, setSubdivisionListPostal] = useState<any[]>([]);
    const [blockListPostal, setBlockListPostal] = useState<any[]>([]);
    const [wardsPostal, setWardsPostal] = useState<Option[]>([]);
    const [policeStationListPostal, setPoliceStationListPostal] = useState<any[]>([]);

    /* Section 3 — Principal Employer */
    const [subdivisionListPE, setSubdivisionListPE] = useState<any[]>([]);
    const [blockListPE, setBlockListPE] = useState<any[]>([]);
    const [wardsPE, setWardsPE] = useState<Option[]>([]);
    const [policeStationListPE, setPoliceStationListPE] = useState<any[]>([]);

    /* Section 4 — Manager */
    const [subdivisionListMgr, setSubdivisionListMgr] = useState<any[]>([]);
    const [blockListMgr, setBlockListMgr] = useState<any[]>([]);
    const [wardsMgr, setWardsMgr] = useState<Option[]>([]);
    const [policeStationListMgr, setPoliceStationListMgr] = useState<any[]>([]);


    /* ================= MASTER LISTS (SECTION-WISE) ================= */

    const [stateListPE, setStateListPE] = useState<any[]>([]);
    const [stateListMgr, setStateListMgr] = useState<any[]>([]);

    const [districtListEst, setDistrictListEst] = useState<any[]>([]);
    const [districtListPostal, setDistrictListPostal] = useState<any[]>([]);
    const [districtListPE, setDistrictListPE] = useState<any[]>([]);
    const [districtListMgr, setDistrictListMgr] = useState<any[]>([]);



    useEffect(() => {
        const queryId = searchParams.get("id");

        if (!queryId) return;

        // if already inside amendment flow, don't overwrite
        const amendmentCtx = JSON.parse(
            sessionStorage.getItem("CLRA_AMENDMENT_CTX") || "{}"
        );

        if (amendmentCtx?.applicationID) return;

        sessionStorage.setItem(
            "CLRA_CTX",
            JSON.stringify({
                encryptedApplicationId: queryId,
            })
        );

        setCurrentApplicationId(queryId);
    }, [searchParams]);


    // const [currentApplicationId, setCurrentApplicationId] = useState(application_id);


    // Load contractor list from API when contractor tab is active.
    // Contractor data belongs to the parent registration, so prefer the
    // parent id stored before the amendment submit updates currentApplicationId.
    // useEffect(() => {
    //     if (activeTab !== TAB_KEYS.CONTRACTOR) return;

    //     const parentCtx = JSON.parse(
    //         sessionStorage.getItem("CLRA_AMENDMENT_PARENT_CTX") || "{}"
    //     );
    //     const contractorApplicationId = parentCtx?.parentApplicationID || currentApplicationId;
    //     const contractorIdentificationNumber = metaIds.identification_number;

    //     if (contractorApplicationId && !contractorIdentificationNumber) return;

    //     if (contractorApplicationId && contractorIdentificationNumber) {
    //         dispatch(fetchContractorsList({
    //             applicationId: contractorApplicationId,
    //             identificationNumber: contractorIdentificationNumber,
    //         }));
    //     } else {
    //         // Fallback: load unscoped list if we somehow don't have an id yet
    //         dispatch(fetchContractorsList());
    //     }
    // }, [activeTab, currentApplicationId, dispatch, metaIds.identification_number]);


    useEffect(() => {
        if (activeTab !== TAB_KEYS.CONTRACTOR) return;

        const contractorApplicationId = currentApplicationId;
        const contractorIdentificationNumber = metaIds.identification_number;

        if (contractorApplicationId && !contractorIdentificationNumber) return;

        if (contractorApplicationId && contractorIdentificationNumber) {
            dispatch(
                fetchContractorsList({
                    applicationId: contractorApplicationId,
                    identificationNumber: contractorIdentificationNumber,
                })
            );
        } else {
            dispatch(fetchContractorsList());
        }
    }, [activeTab, currentApplicationId, dispatch, metaIds.identification_number]);


    // Save logic (core brain) (Trade Union)
    const onSaveTradeUnions = (data: any) => {
        setTradeUnions(data.tradeUnions);
        setIsEditing(false);
    };

    // Edit logic (Trade Union)
    const handleEdit = () => {
        reset({ tradeUnions });
        setIsEditing(true);
    };

    const handleNatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
            (o) => o.value   // keep as string for UI
        );

        setNatureOfWork(selectedValues);
    };


    const documents = [
        "Trade License",
        "Articles of Association and Memorandum of Association / Partnership Deed",
        "Any other document in support of correctness of the particulars mentioned in the application if required",
        "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.",
        "Factory License if any",
    ];

    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const toggleCheck = (name: string) => {
        setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
    const [docUploadErrors, setDocUploadErrors] = useState<Record<string, string | null>>({});
    const [documentsSummary, setDocumentsSummary] = useState<any>(null);

    const handleViewServerPdf = async (documentCode: string) => {
        try {
            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            const res = await axios.get(`${API_BASE}documents`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    enapplicationId: String(currentApplicationId),
                    documentCode,
                    source: fileSource,
                }
            });

            const { filecontent } = res.data;
            if (!filecontent) {
                toast.error("File not available");
                return;
            }

            const cleanedBase64 = filecontent.includes(",")
                ? filecontent.split(",")[1]
                : filecontent;

            const byteCharacters = atob(cleanedBase64.replace(/\s/g, ""));
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([new Uint8Array(byteNumbers)], {
                type: "application/pdf",
            });
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to view document");
        }
    };

    const isDocumentAvailableOnServer = (docName: string) => {
        if (!documentsSummary) return false;

        if (Array.isArray(documentsSummary)) {
            const code = documentUploadCodeMap[docName];
            return documentsSummary.some(d => d.documentCode === code || d.document_code === code || d.document_type_code === code);
        } else if (typeof documentsSummary === "object") {
            const keys = {
                "Trade License": ["trade_license_file"],
                "Articles of Association and Memorandum of Association / Partnership Deed": ["article_of_assoc_file", "partnership_deed_file"],
                "Any other document in support of correctness of the particulars mentioned in the application if required": ["other_doc_file", "memorandum_of_cert_file", "meomorandum_of_cert_file"],
                "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": ["certificate_other_states", "backlog_certificate"],
                "Factory License if any": ["factory_license_file"]
            }[docName] || [];

            return keys.some(k => !!documentsSummary[k]);
        }
        return false;
    };

    const toggleDocument = (doc: string) => {
        setSelectedDocs(prev => ({
            ...prev,
            [doc]: !prev[doc]
        }));
    };

    const handleFileUpload = (doc: string, file: File | null) => {
        if (file) {
            // Mirrors the server rule on POST documents/upload/clra-amendment.
            const validationError = validateFile(file, CLRA_AMENDMENT_DOCUMENT_RULE);
            if (validationError) {
                setDocUploadErrors((prev) => ({ ...prev, [doc]: validationError }));
                setUploadedFiles((prev) => ({ ...prev, [doc]: null }));
                return;
            }
        }

        setDocUploadErrors((prev) => ({ ...prev, [doc]: null }));
        setUploadedFiles((prev) => ({
            ...prev,
            [doc]: file,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        /* CASE-1 → Only trade union selected → force NO */
        if (isTradeUnionSelected && !hasOtherAmendments) {
            setShowTradeUnion("no");
            setIsEditing(false);
        }
    }, [isTradeUnionSelected, hasOtherAmendments]);

    const [fileSource, setFileSource] = useState("F");

    useEffect(() => {
        if (!currentApplicationId) return;
        if (fetchedPreviewApplicationId.current === currentApplicationId) return;

        fetchedPreviewApplicationId.current = currentApplicationId;

        const fetchPreview = async () => {
            setIsPreviewLoading(true);
            try {
                const authData = localStorage.getItem("lc_portal_auth");
                const token = JSON.parse(authData || "{}")?.token;

                const res = await fetch(
                    `${API_BASE}clra/applications/final-preview?enapplicationId=${encodeURIComponent(currentApplicationId)}`, // Should be new applicantId
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = await res.json();

                console.log("✅ Preview API Response:", data);

                const est = data.establishment;
                localStorage.setItem("NEW_CLRA_AMENDMENT_REG_NO", est?.registration_number ?? "");
                
                setAppStatus(est?.status ?? null);
                setFileSource(est?.identification_number?.includes("CLRA-AMEND") ? "F" : "D");

                // 🔥 Store numeric application id for document upload
                setMetaIds(prev => ({
                    ...prev,
                    numeric_application_id: est?.id
                }));

                /* ------------------------------
                   SET FORM DATA (MAIN)
                ------------------------------ */
                setFormData(mapPreviewToForm(est));

                /* ------------------------------
                   Nature Of Work (NOW CORRECT)
                ------------------------------ */
                setNatureOfWork(data.natureOfWork || []);

                setOtherNature(data.otherNatureOfWork || "");

                setFormData((prev: any) => ({
                    ...prev,
                    other_nature_of_work_value: data.otherNatureOfWork || "",
                }));

                /* ------------------------------
                   Similar Work Radio
                ------------------------------ */
                setFormData((prev: any) => ({
                    ...prev,
                    workmen_if_same_similar_kind_of_work:
                        data.similarKindOfWork === "Yes" ? "yes" : "no",
                }));

                /* ------------------------------
                   Trade Union Table (if exists)
                ------------------------------ */
                if (Array.isArray(data.tradeUnions)) {
                    const mappedTU = data.tradeUnions.map((tu: any) => ({
                        regNumber: tu.e_trade_union_regn_no ?? "-",
                        name: tu.e_trade_union_name ?? "-",
                        address: tu.e_trade_union_address ?? "-",
                    }));

                    setExistingTradeUnions(mappedTU);
                }

                /* ------------------------------
                   Meta IDs Needed For Submit
                ------------------------------ */
                setMetaIds({
                    identification_number: est?.identification_number,
                    amendment_parent_id: est?.amendment_parent_id,
                    numeric_application_id: est?.id
                });

                if (data.documents) {
                    setDocumentsSummary(data.documents);
                    const initialSelected: Record<string, boolean> = {};
                    const docsList = [
                        "Trade License",
                        "Articles of Association and Memorandum of Association / Partnership Deed",
                        "Any other document in support of correctness of the particulars mentioned in the application if required",
                        "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.",
                        "Factory License if any",
                    ];

                    const tempDocsSummary = data.documents;
                    const isAvailable = (docName: string) => {
                        if (Array.isArray(tempDocsSummary)) {
                            const code = {
                                "Trade License": "TL",
                                "Articles of Association and Memorandum of Association / Partnership Deed": "AOA",
                                "Any other document in support of correctness of the particulars mentioned in the application if required": "ODSC",
                                "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": "CR",
                                "Factory License if any": "FL"
                            }[docName];
                            return tempDocsSummary.some(d => d.documentCode === code || d.document_code === code || d.document_type_code === code);
                        } else if (typeof tempDocsSummary === "object") {
                            const keys = {
                                "Trade License": ["trade_license_file"],
                                "Articles of Association and Memorandum of Association / Partnership Deed": ["article_of_assoc_file", "partnership_deed_file"],
                                "Any other document in support of correctness of the particulars mentioned in the application if required": ["other_doc_file", "memorandum_of_cert_file", "meomorandum_of_cert_file"],
                                "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.": ["certificate_other_states", "backlog_certificate"],
                                "Factory License if any": ["factory_license_file"]
                            }[docName] || [];
                            return keys.some(k => !!tempDocsSummary[k]);
                        }
                        return false;
                    };

                    docsList.forEach(docName => {
                        if (isAvailable(docName)) {
                            initialSelected[docName] = true;
                        }
                    });
                    setSelectedDocs(initialSelected);
                }

            } catch (e) {
                fetchedPreviewApplicationId.current = null;
                console.error("❌ Preview Load Crash:", e);
                toast.error("Failed to load preview data");
            } finally {
                setIsPreviewLoading(false);
            }
        };

        fetchPreview();
    }, [currentApplicationId]);

    // Load districts one time
    useEffect(() => {
        axios.get(`${API_BASE}district`)
            .then(res => {
                const districts = res.data || [];   // ✅ direct array

                setDistrictListEst(districts);
                setDistrictListPostal(districts);
                setDistrictListPE(districts);
                setDistrictListMgr(districts);
            })
            .catch(() => toast.error("Failed to load districts"));
    }, []);


    // Load States (Only for Section 3 & 4)
    useEffect(() => {
        axios.get(`${API_BASE}states`)
            .then(res => {
                const states = res.data?.data || [];   // ✅ IMPORTANT

                setStateListPE(states);
                setStateListMgr(states);
            })
            .catch(() => toast.error("Failed to load states"));
    }, []);





    /* ================= SECTION 1 — ESTABLISHMENT ================= */

    useEffect(() => {
        if (!formData.distCode) return;

        axios.get(`${API_BASE}subdivision/${formData.distCode}`)
            .then(res => setSubdivisionListEst(res.data || []));
    }, [formData.distCode]);

    useEffect(() => {
        if (!formData.distCode || !formData.subDivCode || !formData.areaTypeCode) return;

        axios.get(`${API_BASE}block/${formData.distCode}/${formData.subDivCode}/${formData.areaTypeCode}`)
            .then(res => setBlockListEst(res.data || []));
    }, [formData.distCode, formData.subDivCode, formData.areaTypeCode]);

    useEffect(() => {
        if (!formData.blockCode) return;

        axios.get(`${API_BASE}villageward/${formData.blockCode}`)
            .then(res => {
                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name,
                }));
                setWardsEst(mapped);
            });
    }, [formData.blockCode]);

    useEffect(() => {
        if (!formData.distCode) return;

        axios.get(`${API_BASE}policestation/${formData.distCode}`)
            .then(res => setPoliceStationListEst(res.data || []));
    }, [formData.distCode]);


    /* ================= SECTION 2 — POSTAL ================= */

    useEffect(() => {
        if (!formData.postalDistCode) return;

        axios.get(`${API_BASE}subdivision/${formData.postalDistCode}`)
            .then(res => setSubdivisionListPostal(res.data || []));
    }, [formData.postalDistCode]);

    useEffect(() => {
        if (!formData.postalDistCode || !formData.postalSubDivCode || !formData.postalAreaTypeCode) return;

        axios.get(`${API_BASE}block/${formData.postalDistCode}/${formData.postalSubDivCode}/${formData.postalAreaTypeCode}`)
            .then(res => setBlockListPostal(res.data || []));
    }, [formData.postalDistCode, formData.postalSubDivCode, formData.postalAreaTypeCode]);

    useEffect(() => {
        if (!formData.postalBlockCode) return;

        axios.get(`${API_BASE}villageward/${formData.postalBlockCode}`)
            .then(res => {
                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name,
                }));
                setWardsPostal(mapped);
            });
    }, [formData.postalBlockCode]);

    useEffect(() => {
        if (!formData.postalDistCode) return;

        axios.get(`${API_BASE}policestation/${formData.postalDistCode}`)
            .then(res => setPoliceStationListPostal(res.data || []));
    }, [formData.postalDistCode]);



    /* ================= SECTION 3 — PRINCIPAL EMPLOYER ================= */

    useEffect(() => {
        if (!formData.emp_dist) return;

        axios.get(`${API_BASE}subdivision/${formData.emp_dist}`)
            .then(res => setSubdivisionListPE(res.data || []));
    }, [formData.emp_dist]);

    useEffect(() => {
        if (!formData.emp_dist || !formData.loc_emp_subdv || !formData.loc_emp_areatype) return;

        axios.get(`${API_BASE}block/${formData.emp_dist}/${formData.loc_emp_subdv}/${formData.loc_emp_areatype}`)
            .then(res => setBlockListPE(res.data || []));
    }, [formData.emp_dist, formData.loc_emp_subdv, formData.loc_emp_areatype]);

    useEffect(() => {
        if (!formData.emp_name_areatype) return;

        axios.get(`${API_BASE}villageward/${formData.emp_name_areatype}`)
            .then(res => {
                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name,
                }));
                setWardsPE(mapped);
            });
    }, [formData.emp_name_areatype]);

    useEffect(() => {
        if (!formData.emp_dist) return;

        axios.get(`${API_BASE}policestation/${formData.emp_dist}`)
            .then(res => setPoliceStationListPE(res.data || []));
    }, [formData.emp_dist]);


    /* ================= SECTION 4 — MANAGER ================= */

    useEffect(() => {
        if (!formData.manager_dist) return;

        axios.get(`${API_BASE}subdivision/${formData.manager_dist}`)
            .then(res => setSubdivisionListMgr(res.data || []));
    }, [formData.manager_dist]);

    useEffect(() => {
        if (!formData.manager_dist || !formData.loc_manager_subdv || !formData.loc_manager_areatype) return;

        axios.get(`${API_BASE}block/${formData.manager_dist}/${formData.loc_manager_subdv}/${formData.loc_manager_areatype}`)
            .then(res => setBlockListMgr(res.data || []));
    }, [formData.manager_dist, formData.loc_manager_subdv, formData.loc_manager_areatype]);

    useEffect(() => {
        if (!formData.manager_name_areatype) return;

        axios.get(`${API_BASE}villageward/${formData.manager_name_areatype}`)
            .then(res => {
                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name,
                }));
                setWardsMgr(mapped);
            });
    }, [formData.manager_name_areatype]);

    useEffect(() => {
        if (!formData.manager_dist) return;

        axios.get(`${API_BASE}policestation/${formData.manager_dist}`)
            .then(res => setPoliceStationListMgr(res.data || []));
    }, [formData.manager_dist]);



    useEffect(() => {
        setShowTradeUnion("no");
        setIsEditing(false);
    }, []);

    // Read Parent Application ID From Session - Helper function
    const getAmendmentApplicationId = () => {
        const parentCtx = JSON.parse(
            sessionStorage.getItem("CLRA_AMENDMENT_PARENT_CTX") || "{}"
        );

        return parentCtx?.parentApplicationID || currentApplicationId;
    };

    // Create Upload Function
    const uploadDocuments = async (
        uploadedFiles: Record<string, File | null>,
        numericApplicationId: number,
        token: string
    ) => {
        const uploadPromises = Object.entries(uploadedFiles)
            .filter(([_, file]) => file !== null)
            .map(async ([label, file]) => {
                // Multipart route so the server enforces the PDF / 200 KB rule.
                const formData = new FormData();
                formData.append("file", file as File);
                formData.append("applicationId", String(numericApplicationId));
                formData.append("documentCode", documentUploadCodeMap[label]);
                formData.append("filename", (file as File).name);

                return axios.post(
                    `${API_BASE}documents/upload/clra-amendment`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            });

        return Promise.all(uploadPromises);
    };

    const handleMainSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ignore repeat submits while the first one is still in flight.
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            if (!token) {
                toast.error("Authentication failed");
                return;
            }

            /* ----------------------------------
               1️⃣ SUBMIT AMENDMENT FORM
            ----------------------------------- */
            const payload = mapFormToPayload(
                formData,
                getAmendmentApplicationId(),
                metaIds,
                natureOfWork,
                uploadedFiles,
                documentsSummary,
            );

            const response = await axios.post(
                `${API_BASE}applicant-module/applications/amendment/clra-registration/submit`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const newApplicationId = response.data?.applicationIdEnc;

            if (newApplicationId) {
                setMetaIds(prev => ({
                    ...prev,
                    identification_number: "",
                }));

                const existingCtx = JSON.parse(
                    sessionStorage.getItem("CLRA_AMENDMENT_CTX") || "{}"
                );

                sessionStorage.setItem(
                    "CLRA_AMENDMENT_CTX",
                    JSON.stringify({
                        ...existingCtx,
                        applicationID: newApplicationId,
                    })
                );

                setCurrentApplicationId(newApplicationId);
            }

            const numericApplicationId = Number(encryptionDecryptionFun("decrypt", String(newApplicationId)));

            /* ----------------------------------
               2️⃣ IF USER UPLOADED FILES → UPLOAD
            ----------------------------------- */

            const hasFiles = Object.values(uploadedFiles).some(f => f !== null);

            if (hasFiles) {
                await uploadDocuments(
                    uploadedFiles,
                    numericApplicationId,   // 🔥 decrypted application ID
                    token
                );
            }

            /* ----------------------------------
               3️⃣ SUCCESS ONLY AFTER BOTH DONE
            ----------------------------------- */
            if (response?.data?.message){
                toast.success(response.data.message);
            } else {
                toast.success("Amendment data saved successfully");
            }
            console.log('response', response)

            setIsDetailsSubmitted(true);

            sessionStorage.setItem(
                "CLRA_AMENDMENT_DETAILS_SUBMITTED",
                "true"
            );

            goToNextTab(TAB_KEYS.DETAILS);

        } catch (err) {
            console.error(err);
            toast.error("Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };


    const natureOfWorkOptions: NatureOfWorkOption[] = [
        { value: "AC Maitenance", label: "AC Maintenance" },
        { value: "Bagging Operation", label: "Bagging Operation" },
        { value: "Canteen Service", label: "Canteen Service" },
        { value: "Civil Works", label: "Civil Works, Construction & Maintenance" },
        { value: "Crane Operation", label: "Crane Operation" },
        { value: "Electrical Works Maintenance", label: "Electrical Works Maintenance" },
        { value: "Engineering & Maintenance Service", label: "Engineering & Maintenance Service" },
        { value: "Fabrication Work", label: "Fabrication Work" },
        { value: "Fire Operation", label: "Fire Operation" },
        { value: "Guest House Services", label: "Guest House Services" },
        { value: "Heavy Vehicle", label: "Heavy Vehicle" },
        { value: "Hotel", label: "Hotel" },
        { value: "Hotriculture", label: "Hotriculture, Gardening & Nursery Maintenance" },
        { value: "House Keeping", label: "House Keeping" },
        { value: "Housekeeping and Maintenance Service", label: "Housekeeping and Maintenance Service" },
        { value: "Laboratory Works", label: "Laboratory Works" },
        { value: "Loading & Unloading", label: "Loading & Unloading" },
        { value: "Maintenance and Managerial Jobs", label: "Maintenance and Managerial Jobs" },
        { value: "Manpower Supply", label: "Manpower Supply" },
        { value: "Mechanical Maintenance", label: "Mechanical Maintenance" },
        { value: "Operation &  Maintenance", label: "Operation &  Maintenance" },
        { value: "Painting Maintenance", label: "Painting Maintenance" },
        { value: "Restaurant Service", label: "Restaurant Service" },
        { value: "Security Guard", label: "Security Guard" },
        { value: "Security Service", label: "Security Service" },
        { value: "Store Maintenance", label: "Store Maintenance" },
        { value: "TRADING AND SERVICES", label: "TRADING AND SERVICES" },
        { value: "Water Treatment Operation", label: "Water Treatment Operation" },
        { value: "Others", label: "Others" },
    ];

    // Payload Builder Function for trade union
    const buildTradeUnionPayload = () => {
        let trade_union_rows: any[] = [];

        /* -----------------------------------------
           CASE 1 → YES (user entered new data)
        ------------------------------------------ */
        if (showTradeUnion === "yes") {
            trade_union_rows = tradeUnions.map((tu) => ({
                e_trade_union_name: tu.name,
                e_trade_union_regn_no: tu.regNumber,
                e_trade_union_address: tu.address,
            }));
        }

        /* -----------------------------------------
           CASE 2 → NO (send existing GET data)
        ------------------------------------------ */
        if (showTradeUnion === "no") {
            trade_union_rows = existingTradeUnions.map((tu) => ({
                e_trade_union_name: tu.name === "-" ? null : tu.name,
                e_trade_union_regn_no: tu.regNumber === "-" ? null : tu.regNumber,
                e_trade_union_address: tu.address === "-" ? null : tu.address,
            }));
        }

        return {
            application_id: currentApplicationId,
            identification_number: metaIds.identification_number,
            // identification_number: "J3xaoLEACPESIOAHC8X7YQ==",
            status: showTradeUnion, // 🔥 required by backend
            trade_unions: trade_union_rows,
        };
    };

    // Handler for submitting trade union data separately
    const submitTradeUnions = async () => {
        // Ignore repeat submits while the first one is still in flight.
        if (isSubmittingTradeUnion) return;
        setIsSubmittingTradeUnion(true);

        try {
            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            if (!token) {
                toast.error("Authentication failed");
                return;
            }

            const payload = buildTradeUnionPayload();

            console.log("Trade Union Payload →", payload);

            // return; // TEMPORARY STOP

            if (showTradeUnion === "yes" && tradeUnions.length === 0) {
                toast.error("Please add at least one trade union before submitting.");
                return;
            }

            await axios.post(
                `${API_BASE}applicant-module/applications/clra-trade-union/add`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("Trade union information saved successfully.");

            goToNextTab(TAB_KEYS.TRADE_UNION);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit trade union data.");
        } finally {
            setIsSubmittingTradeUnion(false);
        }
    };


    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Blocks interaction with a half-populated form while it loads. */}
            {isPreviewLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="flex items-center gap-3 rounded bg-white px-6 py-4 shadow-lg">
                        <Spinner className="h-6 w-6 border-4 text-[#2A628C]" />
                        <span className="text-sm font-medium text-gray-600">Loading application details...</span>
                    </div>
                </div>
            )}

            <h1 className="text-lg bg-white font-semibold p-4 mb-4">
                Application Details for Amendment
            </h1>

            {/* Reset Ammendenment button  */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="text-[#2A628C] border border-[#2A628C] px-4 py-2 rounded hover:bg-gray-200"
                    onClick={() => {
                        sessionStorage.removeItem("CLRA_AMENDMENT_FIELDS");

                        const amendmentParentCtx = JSON.parse(
                            sessionStorage.getItem("CLRA_AMENDMENT_PARENT_CTX") || "{}"
                        );

                        const clraCtx = JSON.parse(
                            sessionStorage.getItem("CLRA_CTX") || "{}"
                        );

                        const appId =
                            amendmentParentCtx?.parentApplicationID ||
                            clraCtx?.encryptedApplicationId ||
                            "";

                        navigate(
                            `/apply-clra-reg-amendment?id=${appId}`,
                            { replace: true }
                        );
                    }}
                >
                    Reset Amendment Fields
                </button>
            </div>

            <div className="flex gap-2 border-b mb-4 w-full">
                <TabButton
                    label="Application Details for Amendment"
                    active={activeTab === TAB_KEYS.DETAILS}
                    onClick={() => setActiveTab(TAB_KEYS.DETAILS)}
                />

                <TabButton
                    label="Trade Union Details"
                    active={activeTab === TAB_KEYS.TRADE_UNION}
                    disabled={!isDetailsSubmitted && !fromDashboard}
                    onClick={() => setActiveTab(TAB_KEYS.TRADE_UNION)}
                />

                <TabButton
                    label="Contractor Information"
                    active={activeTab === TAB_KEYS.CONTRACTOR}
                    disabled={!isDetailsSubmitted && !fromDashboard}
                    onClick={() => setActiveTab(TAB_KEYS.CONTRACTOR)}
                />

                <TabButton
                    label="Application Preview"
                    active={activeTab === TAB_KEYS.PREVIEW}
                    onClick={() => setActiveTab(TAB_KEYS.PREVIEW)}
                />
            </div>

            {activeTab === TAB_KEYS.DETAILS && (
                <form onSubmit={handleMainSubmit} className="w-full">
                    <Section title="1. NAME AND LOCATION OF THE ESTABLISHMENT">
                        <Input
                            label="Establishment Name"
                            name="estName"
                            required
                            value={formData.estName || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Select
                            label="Type of The Establishment"
                            name="estType"
                            required
                            value={formData.estType || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="micro">Micro</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </Select>

                        <Input
                            label="Location"
                            name="estLocation"
                            required
                            value={formData.estLocation || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Select
                            label="Select District"
                            name="distCode"
                            required
                            value={formData.distCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {districtListEst.map(d => (
                                <option key={d.district_code} value={d.district_code}>
                                    {d.district_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Select Subdivision"
                            name="subDivCode"
                            required
                            value={formData.subDivCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {subdivisionListEst.map(s => (
                                <option key={s.sub_div_code} value={s.sub_div_code}>
                                    {s.sub_div_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Select Block / Municipality / Corporation / SEZ / Notified Area"
                            name="areaTypeCode"
                            required
                            value={formData.areaTypeCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="B">Block</option>
                            <option value="M">Municipality</option>
                            <option value="C">Corporation</option>
                            <option value="S">SEZ</option>
                            <option value="N">Notified Area</option>
                        </Select>

                        <Select
                            label="Select Municipality"
                            name="blockCode"
                            required
                            value={formData.blockCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {blockListEst.map(b => (
                                <option key={b.block_code} value={b.block_code}>
                                    {b.block_mun_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Select Ward"
                            name="villageWardCode"
                            required
                            value={formData.villageWardCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {wardsEst.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Select Police Station"
                            name="policeStationCode"
                            required
                            value={formData.policeStationCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {policeStationListEst.map(ps => (
                                <option key={ps.police_station_code} value={ps.police_station_code}>
                                    {ps.name_of_police_station}
                                </option>
                            ))}
                        </Select>

                        <Input
                            label="PIN Code"
                            name="pin"
                            required
                            value={formData.pin || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />
                    </Section>

                    <Section title="2. REGISTERED OFFICE ADDRESS OF THE ESTABLISHMENT">
                        <Input
                            label="2.(a) Address Line 1"
                            name="estRegOfcLoc"
                            required
                            value={formData.estRegOfcLoc || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Select
                            label="2.(b) Select District"
                            name="postalDistCode"
                            required
                            value={formData.postalDistCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {districtListPostal.map(d => (
                                <option key={d.district_code} value={d.district_code}>
                                    {d.district_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="2.(c) Select Subdivision"
                            name="postalSubDivCode"
                            required
                            value={formData.postalSubDivCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {subdivisionListPostal.map(s => (
                                <option key={s.sub_div_code} value={s.sub_div_code}>
                                    {s.sub_div_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="2.(d) Select Block / Municipality / Corporation / SEZ / Notified Area"
                            name="postalAreaTypeCode"
                            required
                            value={formData.postalAreaTypeCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="B">Block</option>
                            <option value="M">Municipality</option>
                            <option value="C">Corporation</option>
                            <option value="S">SEZ</option>
                            <option value="N">Notified Area</option>
                        </Select>

                        <Select
                            label="2.(e) Select Municipality"
                            name="postalBlockCode"
                            required
                            value={formData.postalBlockCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {blockListPostal.map(b => (
                                <option key={b.block_code} value={b.block_code}>
                                    {b.block_mun_name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Select Ward"
                            name="postalVillageWardCode"
                            required
                            value={formData.postalVillageWardCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {wardsPostal.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="2.(f) Select Police Station"
                            name="postalPoliceStationCode"
                            required
                            value={formData.postalPoliceStationCode || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {policeStationListPostal.map(ps => (
                                <option key={ps.police_station_code} value={ps.police_station_code}>
                                    {ps.name_of_police_station}
                                </option>
                            ))}
                        </Select>

                        <Input
                            label="2.(g) PIN Code"
                            name="postalPin"
                            required
                            value={formData.postalPin || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />
                    </Section>

                    <Section title="3. FULL NAME AND ADDRESS OF THE PRINCIPAL EMPLOYER">

                        {/* Principal Employer Name */}
                        <Input
                            label="Principal Employer Name"
                            name="full_name_principal_emp"
                            required
                            value={formData.full_name_principal_emp || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        {/* Gender */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>

                            <div className="flex gap-6 mt-2">
                                {[
                                    { label: "Male", value: "M" },
                                    { label: "Female", value: "F" },
                                    { label: "Transgender", value: "O" },
                                ].map((g) => {
                                    const isEditable = editableFields?.has("gender_pe");

                                    return (
                                        <label key={g.value} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="gender_pe"
                                                value={g.value}
                                                checked={formData.gender_pe === g.value}
                                                onChange={handleChange}
                                                disabled={!isEditable}
                                            />
                                            {g.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Country */}
                        <Select
                            label="Select Country"
                            name="emp_country"
                            required
                            value={formData.emp_country || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="1">India</option>
                            <option value="2">Others</option>
                        </Select>

                        {/* State */}
                        <Select
                            label="Select State"
                            name="emp_state"
                            required
                            value={formData.emp_state || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select State</option>
                            {stateListPE.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>

                        {/* Address */}
                        <Input
                            label="Address Line 1"
                            name="address_principal_emp"
                            required
                            value={formData.address_principal_emp || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                            className="md:col-span-2"
                        />

                        {/* District */}
                        <Select
                            label="Select District"
                            name="emp_dist"
                            required
                            value={formData.emp_dist || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {districtListPE.map(d => (
                                <option key={d.district_code} value={d.district_code}>
                                    {d.district_name}
                                </option>
                            ))}
                        </Select>

                        {/* Subdivision */}
                        <Select
                            label="Select Subdivision"
                            name="loc_emp_subdv"
                            required
                            value={formData.loc_emp_subdv || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">- Select Sub-division -</option>
                            {subdivisionListPE.map(s => (
                                <option key={s.sub_div_code} value={s.sub_div_code}>
                                    {s.sub_div_name}
                                </option>
                            ))}
                        </Select>

                        {/* Area Type */}
                        <Select
                            label="Select Block / Municipality / Corporation / SEZ / Notified Area"
                            name="loc_emp_areatype"
                            required
                            value={formData.loc_emp_areatype || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="B">Block</option>
                            <option value="M">Municipality</option>
                            <option value="C">Corporation</option>
                            <option value="S">SEZ</option>
                            <option value="N">Notified Area</option>
                        </Select>

                        {/* Municipality / Block */}
                        <Select
                            label="Select Municipality"
                            name="emp_name_areatype"
                            required
                            value={formData.emp_name_areatype || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {blockListPE.map(b => (
                                <option key={b.block_code} value={b.block_code}>
                                    {b.block_mun_name}
                                </option>
                            ))}
                        </Select>

                        {/* Ward */}
                        <Select
                            label="Select Ward"
                            name="loc_emp_vill_ward"
                            required
                            value={formData.loc_emp_vill_ward || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {wardsPE.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </Select>

                        {/* Police Station */}
                        <Select
                            label="Select Police Station"
                            name="loc_emp_ps"
                            required
                            value={formData.loc_emp_ps || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">- Select -</option>
                            {policeStationListPE.map(ps => (
                                <option key={ps.police_station_code} value={ps.police_station_code}>
                                    {ps.name_of_police_station}
                                </option>
                            ))}
                        </Select>

                        {/* PIN */}
                        <Input
                            label="Pin Code"
                            name="loc_emp_pin_number"
                            required
                            value={formData.loc_emp_pin_number || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                    </Section>

                    <Section title="4. FULL NAME AND ADDRESS OF THE MANAGER OR PERSON RESPONSIBLE FOR THE SUPERVISION AND CONTROL OF THE ESTABLISHMENT">

                        {/* Name */}
                        <Input
                            label="4.(a) Name"
                            name="full_name_manager"
                            required
                            value={formData.full_name_manager || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        {/* Country */}
                        <Select
                            label="4.(b) Select Country"
                            name="manager_country"
                            required
                            value={formData.manager_country || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="1">India</option>
                            <option value="2">Others</option>
                        </Select>

                        {/* State */}
                        <Select
                            label="4.(c) Select State"
                            name="manager_state"
                            required
                            value={formData.manager_state || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select State</option>
                            {stateListMgr.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>

                        {/* Address */}
                        <Input
                            label="4.(d) Address Line 1"
                            name="address_manager"
                            required
                            value={formData.address_manager || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                            className="md:col-span-2"
                        />

                        {/* District */}
                        <Select
                            label="4.(e) Select District"
                            name="manager_dist"
                            required
                            value={formData.manager_dist || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {districtListMgr.map(d => (
                                <option key={d.district_code} value={d.district_code}>
                                    {d.district_name}
                                </option>
                            ))}
                        </Select>

                        {/* Subdivision */}
                        <Select
                            label="4.(f) Select Subdivision"
                            name="loc_manager_subdv"
                            required
                            value={formData.loc_manager_subdv || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {subdivisionListMgr.map(s => (
                                <option key={s.sub_div_code} value={s.sub_div_code}>
                                    {s.sub_div_name}
                                </option>
                            ))}
                        </Select>

                        {/* Area Type */}
                        <Select
                            label="4.(g) Select Block / Municipality / Corporation / SEZ / Notified Area"
                            name="loc_manager_areatype"
                            required
                            value={formData.loc_manager_areatype || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            <option value="B">Block</option>
                            <option value="M">Municipality</option>
                            <option value="C">Corporation</option>
                            <option value="S">SEZ</option>
                            <option value="N">Notified Area</option>
                        </Select>

                        {/* Block / Municipality */}
                        <Select
                            label="4.(h) Select Municipality"
                            name="manager_name_areatype"
                            required
                            value={formData.manager_name_areatype || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {blockListMgr.map(b => (
                                <option key={b.block_code} value={b.block_code}>
                                    {b.block_mun_name}
                                </option>
                            ))}
                        </Select>

                        {/* Ward */}
                        <Select
                            label="4.(i) Select Ward"
                            name="loc_manager_vill_ward"
                            required
                            value={formData.loc_manager_vill_ward || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {wardsMgr.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </Select>

                        {/* Police Station */}
                        <Select
                            label="4.(j) Select Police Station"
                            name="loc_manager_ps"
                            required
                            value={formData.loc_manager_ps || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        >
                            <option value="">Select</option>
                            {policeStationListMgr.map(ps => (
                                <option key={ps.police_station_code} value={ps.police_station_code}>
                                    {ps.name_of_police_station}
                                </option>
                            ))}
                        </Select>

                        {/* PIN */}
                        <Input
                            label="4.(k) PIN Code"
                            name="loc_manager_pin_number"
                            required
                            value={formData.loc_manager_pin_number || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                    </Section>

                    <Section title="5. Nature of work carried on in the establishment">

                        {/* Multi Select Nature of Work */}
                        <div className="md:col-span-3 flex flex-col">
                            <label className="text-sm font-medium mb-1">
                                Select Nature of Work <span className="text-red-500">*</span>
                            </label>

                            <select
                                multiple
                                name="e_nature_of_work"
                                value={natureOfWork}
                                required
                                onChange={handleNatureChange}
                                className={`border rounded px-3 py-2 h-[150px] text-sm ${editableFields?.has("natureOfWork") ? "bg-white" : "bg-gray-100"
                                    }`}
                                disabled={!editableFields?.has("natureOfWork")}
                            >
                                {natureOfWorkOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <p className="text-red-600 text-xs mt-2">
                                Note: Hold Ctrl to select multiple.
                            </p>
                        </div>

                        {/* Others Textbox */}
                        {natureOfWork.includes("Others") && (
                            <div className="md:col-span-3">
                                <Input
                                    label="Other Option for Nature of Work"
                                    name="other_nature_of_work_value"
                                    value={otherNature}
                                    onChange={(e: any) => {
                                        setOtherNature(e.target.value);
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            other_nature_of_work_value: e.target.value,
                                        }));
                                    }}
                                    editableFields={editableFields}
                                />
                            </div>
                        )}

                        {/* Workmen Counts */}
                        <Input
                            label="(a) Maximum Number of Workmen Employed Directly on any day in the Establishment"
                            name="max_num_wrkmen"
                            required
                            value={formData.max_num_wrkmen || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Input
                            label="(b) Number of Workmen Engaged as Permanent/Regular Workmen"
                            name="e_num_of_workmen_per_or_reg"
                            required
                            value={formData.e_num_of_workmen_per_or_reg || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Input
                            label="(c) Number of Workmen Engaged as Temporary/Regular Workmen"
                            name="e_num_of_workmen_temp_or_reg"
                            required
                            value={formData.e_num_of_workmen_temp_or_reg || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        {/* Similar Work Radio */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                (d) Whether the Workmen employed/intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer (if yes, please give here information as detailed below)
                                <span className="text-red-500">*</span>
                            </label>

                            <div className="flex gap-6 text-sm">
                                {["yes", "no"].map(val => (
                                    <label key={val} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="workmen_if_same_similar_kind_of_work"
                                            required
                                            value={val}
                                            checked={formData.workmen_if_same_similar_kind_of_work === val}
                                            onChange={handleChange}
                                            disabled={!editableFields?.has("workmen_if_same_similar_kind_of_work")}
                                        />
                                        {val === "yes" ? "Yes" : "No"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="relative">
                            <label className="text-sm font-medium mb-1 block">
                                i.  A complete job description of the contract labour <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                name="con_lab_job_desc"
                                rows={4}
                                value={formData.con_lab_job_desc || ""}
                                required
                                onChange={handleChange}
                                readOnly={!editableFields?.has("con_lab_job_desc")}
                                className={`border rounded px-3 py-2 pr-10 text-sm w-full
            ${editableFields?.has("con_lab_job_desc") ? "bg-white" : "bg-gray-100"}
        `}
                            />

                            <div className="absolute right-2 top-[38px]">
                                {editableFields?.has("con_lab_job_desc") ? (
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

                        <Input
                            label="ii. Wage rates and other cash benefits paid/to be paid"
                            name="con_lab_wage_rate_other_benefits"
                            required
                            value={formData.con_lab_wage_rate_other_benefits || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <Input
                            label="iii. Category/designation/nomenclature of the job "
                            name="con_lab_cat_desig_nom"
                            required
                            value={formData.con_lab_cat_desig_nom || ""}
                            onChange={handleChange}
                            editableFields={editableFields}
                        />

                        <div className="md:col-span-3">
                            <Input
                                label="(e)  Settlement or award or judgement or minimum wages ( if any applicable in the establishment )"
                                name="e_settlement_award_judgement_min_wage"
                                required
                                value={formData.e_settlement_award_judgement_min_wage || ""}
                                onChange={handleChange}
                                editableFields={editableFields}
                            />
                        </div>

                    </Section>

                    <Section title="6. Maximum number of contract labour to be employed on any day through each contractor">

                        <div className="md:col-span-2">
                            <Input
                                label="Maximum number of contract labour to be employed on any day through each contractor"
                                name="e_any_day_max_num_of_workmen"
                                required
                                value={formData.e_any_day_max_num_of_workmen || ""}
                                onChange={handleChange}
                                editableFields={editableFields}
                            />
                        </div>

                    </Section>

                    <Section title="Upload Supporting Documents">

                        <div className="md:col-span-3 w-full p-0">

                            {documents.map((doc) => (
                                <div
                                    key={doc}
                                    className="w-full border-b border-gray-300 px-4 py-3 flex items-center gap-3 bg-gray-100"
                                >
                                    <label className="flex items-center gap-2 text-sm w-full">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedDocs[doc]}
                                            onChange={() => toggleDocument(doc)}
                                            className="h-4 w-4"
                                        />
                                        <span>{doc}</span>
                                    </label>

                                    {selectedDocs[doc] && (
                                        <div className="flex flex-col items-end gap-1 w-full max-w-md">
                                            <input
                                                type="file"
                                                accept={toAcceptAttribute(CLRA_AMENDMENT_DOCUMENT_RULE)}
                                                onChange={(e) =>
                                                    handleFileUpload(doc, e.target.files?.[0] || null)
                                                }
                                                className="w-full text-xs border rounded px-2 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2A628C] file:text-white hover:file:bg-black"
                                            />
                                            <span className="text-[11px] text-gray-600">
                                                {describeRule(CLRA_AMENDMENT_DOCUMENT_RULE)}
                                            </span>
                                            {docUploadErrors[doc] && (
                                                <p className="text-red-600 text-[11px] text-right" role="alert">
                                                    {docUploadErrors[doc]}
                                                </p>
                                            )}
                                            {(() => {
                                                const code = documentUploadCodeMap[doc] || "";
                                                const isAvailable = isDocumentAvailableOnServer(doc);
                                                if (isAvailable && !uploadedFiles[doc]) {
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewServerPdf(code)}
                                                            className="text-xs text-red-600 hover:text-black flex items-center gap-1 mt-1 font-semibold"
                                                        >
                                                            <FaFilePdf /> View Uploaded File
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>

                    </Section>

                    {isEditable && (
                        <div className="flex justify-end mt-6 mb-15">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                aria-busy={isSubmitting}
                                className={actionButtonClass}
                            >
                                {isSubmitting && <Spinner />}
                                {isSubmitting ? "Saving..." : "Save & Next"}
                            </button>
                        </div>
                    )}
                </form>
            )}

            {activeTab === TAB_KEYS.TRADE_UNION && (
                <>
                    <div className="bg-white border rounded p-6 space-y-6">
                        {/* YES / NO */}
                        <div>
                            <label className="text-sm font-medium">
                                Click YES to add trade union
                            </label>

                            <div className="flex gap-6 mt-2 text-sm mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={showTradeUnion === "no"}
                                        disabled={!isEditable}
                                        onChange={() => {
                                            setShowTradeUnion("no");
                                            setIsEditing(false);
                                        }}
                                    />
                                    No
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={showTradeUnion === "yes"}
                                        disabled={!isEditable || !isTradeUnionSelected}
                                        onChange={() => {
                                            if (!isTradeUnionSelected) return;
                                            setShowTradeUnion("yes");
                                            setIsEditing(true);
                                        }}
                                    />
                                    Yes
                                </label>
                            </div>

                            {showTradeUnion === "no" && !isEditing && (
                                <DataTable
                                    columns={tradeUnionColumns}
                                    data={existingTradeUnions}
                                    customStyles={dataTableCustomStyles}
                                    striped
                                    highlightOnHover
                                    responsive
                                    noDataComponent="No Trade Union Data Available"
                                />
                            )}
                        </div>

                        {/* FORM MODE */}
                        {showTradeUnion === "yes" && isEditing && (
                            <form
                                onSubmit={handleTradeUnionSubmit(onSaveTradeUnions)}
                                className="space-y-4"
                            >
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border p-4 rounded"
                                    >
                                        {/* Registration Number */}
                                        <div>
                                            <PlainInput
                                                label="Registration Number"
                                                {...register(`tradeUnions.${index}.regNumber`)}
                                            />
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors.tradeUnions?.[index]?.regNumber?.message}
                                            </p>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <PlainInput
                                                label="Name of the Trade Union"
                                                {...register(`tradeUnions.${index}.name`)}
                                            />
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors.tradeUnions?.[index]?.name?.message}
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <PlainInput
                                                label="Address"
                                                {...register(`tradeUnions.${index}.address`)}
                                            />
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors.tradeUnions?.[index]?.address?.message}
                                            </p>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-2 pt-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    append({
                                                        regNumber: "",
                                                        name: "",
                                                        address: "",
                                                    })
                                                }
                                                className="bg-green-600 text-white px-3 py-2 rounded"
                                            >
                                                +
                                            </button>

                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="bg-red-600 text-white px-3 py-2 rounded"
                                                >
                                                    -
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                                    >
                                        SAVE
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TABLE MODE */}
                        {showTradeUnion === "yes" && !isEditing && tradeUnions.length > 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg">
                                        Saved Trade Unions
                                    </h3>

                                    {isEditable && (
                                        <button
                                            onClick={handleEdit}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded"
                                        >
                                            EDIT
                                        </button>
                                    )}
                                </div>

                                <DataTable
                                    columns={tradeUnionColumns}
                                    data={tradeUnions}
                                    customStyles={dataTableCustomStyles}
                                    striped
                                    highlightOnHover
                                    responsive
                                />
                            </>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    {isEditable && (
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={submitTradeUnions}
                                disabled={isSubmittingTradeUnion}
                                aria-busy={isSubmittingTradeUnion}
                                className={actionButtonClass}
                            >
                                {isSubmittingTradeUnion && <Spinner />}
                                {isSubmittingTradeUnion ? "SAVING..." : "SAVE & NEXT"}
                            </button>
                        </div>
                    )}
                </>
            )}

            {activeTab === TAB_KEYS.CONTRACTOR && (
                <>
                <ContractorInformationTab
                    contractors={contractors}
                    onAdd={() => navigate(ROUTE_ADD_CONTRACTOR)}
                    loading={contractorsListLoading}
                    error={contractorsListError}
                    maxContractLabourLimit={formData.e_any_day_max_num_of_workmen}
                    encryptedAppId={currentApplicationId}
                    isEditable={isEditable}
                    applicationStatus={appStatus}
                    onStatusChanged={async () => {
                        const contractorApplicationId = currentApplicationId;
                        const contractorIdentificationNumber =
                            metaIds.identification_number;

                        if (
                            contractorApplicationId &&
                            contractorIdentificationNumber
                        ) {
                            await dispatch(
                                fetchContractorsList({
                                    applicationId: contractorApplicationId,
                                    identificationNumber:
                                        contractorIdentificationNumber,
                                })
                            );
                        } else {
                            await dispatch(fetchContractorsList());
                        }
                    }}
                />

                {/* Contractors are saved from their own form, so this only advances. */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => goToNextTab(TAB_KEYS.CONTRACTOR)}
                        className={actionButtonClass}
                    >
                        SAVE &amp; NEXT
                    </button>
                </div>
                </>
            )}

            {activeTab === TAB_KEYS.PREVIEW && (
                <ApplicationPreview
                    applicationId={(currentApplicationId as string | null) ?? applicationId ?? undefined}
                    isEditable={isEditable}
                />
            )}
        </div>
    );
};

export default ApplicationDetailsAmendment;