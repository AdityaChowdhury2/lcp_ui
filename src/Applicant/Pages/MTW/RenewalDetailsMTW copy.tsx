import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { SubmitHandler } from "react-hook-form";
import { Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DataTable, { TableColumn } from "react-data-table-component";
import { Pencil } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import axios from "axios";
import { toast } from "react-toastify";
import { encryptionDecryptionFun } from "@/utils/encryption";

/* ============================================================
   TAB BUTTON COMPONENT (Same Pattern as BOCWA)
============================================================ */

const TabButton: React.FC<{
    active?: boolean;
    label: string;
    onClick?: () => void;
}> = ({ active, label, onClick }) => (
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

/* ============================================================
   FORM TYPES
============================================================ */




interface Route {
    route_details: string;
    route_mileage: string;
}

interface Vehicle {
    registration_number: string;
}

// Add Owner Types
interface Owner {
    personId: string;
    name: string;
    designation: string;
    designation_other?: string;
    addedDate: string;
    companyName: string;

    address?: string;
    country?: string;
    state?: string;
    district?: string;
    subdivision?: string;
    municipality?: string;
    ward?: string;
    policestation?: string;
    pincode?: string;
}

/* ============================================================
   VALIDATION
============================================================ */

const schema = yup.object({
    mtw_name: yup.string().required("Required"),
    mtw_location: yup.string().required("Required"),
    mtw_district: yup.string().required("Required"),
    mtw_subdivision: yup.string().required("Required"),
    mtw_areatype: yup.string().optional(),
    mtw_block: yup.string().required("Required"),
    mtw_ward: yup.string().required("Required"),
    mtw_policestation: yup.string().required("Required"),
    mtw_pincode: yup
        .string()
        .matches(/^[0-9]{6}$/, "Enter valid 6 digit PIN")
        .required("Required"),

    mtw_nature: yup.string().optional(),

    mtw_totalroute: yup
        .number()
        .typeError("Enter number")
        .required("Required"),

    routes: yup.array().of(
        yup.object({
            route_details: yup.string().required(),
            route_mileage: yup.string().required(),
        })
    ).default([]),

    mtw_totalmilage: yup.string().optional(),

    mtw_totalvehicle: yup
        .number()
        .typeError("Enter number")
        .required("Required"),

    vehicles: yup.array().of(
        yup.object({
            registration_number: yup.string().required(),
        })
    ).default([]),

    mtw_maxworkers: yup
        .number()
        .typeError("Enter number")
        .required("Required"),
});

/* ============================================================
   Ownership Validation Schema
============================================================ */
const ownershipSchema = yup.object({
    designation: yup.string().required("Required"),
    designation_other: yup.string().when("designation", {
        is: "other",
        then: (schema) => schema.required("Required"),
        otherwise: (schema) => schema.optional()
    }),
    companyName: yup.string().required("Required"),
    directorName: yup.string().required("Required"),
    address: yup.string().required("Required"),
    country: yup.string().required("Required"),
    state: yup.string().required("Required"),
    district: yup.string().required("Required"),
    subdivision: yup.string().required("Required"),
    areaType: yup.string().required("Required"),
    block: yup.string().required("Required"),
    ward: yup.string().required("Required"),
    policeStation: yup.string().required("Required"),
    pincode: yup
        .string()
        .matches(/^[0-9]{6}$/, "Enter valid 6 digit PIN")
        .required("Required"),
});

// Generate Type FROM Schema
type MTWFormData = yup.InferType<typeof schema>;

// Create Ownership Form Type
type OwnershipFormData = yup.InferType<typeof ownershipSchema>;

// Add Document Configuration
// Document Code Mapping (For Upload API)
const documentUploadCodeMap: Record<string, string> = {
    "Trade License": "TL",
    "Article of Association / Partnership Deed": "AOA",
    "Blue Book / Smart Card issued by Motor Vehicles": "BB",
    "Insurance Certificate of Motor Vehicles": "IC",
    "Address Proof": "AP",
    "Other Documents in Support of Correctness of Particulars of Application": "ODSC"
};

/* ============================================================
   Create Preview Table Component
============================================================ */
const PreviewTable: React.FC<{ rows: { sl: string; param: string; value?: string }[] }> = ({ rows }) => (
    <div className="overflow-x-auto">
        <table className="w-full border text-sm">
            <thead>
                <tr className="bg-gray-200">
                    <th className="border px-3 py-2 w-20">Sl No.</th>
                    <th className="border px-3 py-2 w-[40%]">Parameters</th>
                    <th className="border px-3 py-2">Inputs</th>
                </tr>
            </thead>

            <tbody>
                {rows.map((row) => {

                    const isNoData =
                        !row.value ||
                        row.value === "-" ||
                        row.value.toLowerCase() === "no data available";

                    return (
                        <tr key={row.sl}>
                            <td className="border text-center px-2 py-2">
                                {row.sl}
                            </td>

                            <td className="border px-3 py-2">
                                {row.param}
                            </td>

                            <td className="border px-3 py-2">
                                {isNoData ? (
                                    <span className="text-red-600 font-medium">
                                        No Data Available
                                    </span>
                                ) : (
                                    row.value
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);




/* ============================================================
   Add Fee Calculation Function
============================================================ */
const calculateFee = (workers?: number) => {
    if (!workers) return 0;

    if (workers <= 20) return 25;
    if (workers <= 50) return 50;
    if (workers <= 100) return 100;
    if (workers <= 250) return 200;
    if (workers <= 500) return 300;

    return 500;
};

// Mapping Function (GET → FORM)
const mapPreviewToForm = (data: any) => ({

    mtw_name: data?.mtw_name ?? "",
    mtw_location: data?.mtw_loc_address ?? "",

    mtw_district: data?.mtw_loc_dist ?? "",
    mtw_subdivision: data?.mtw_loc_subdivision?.toString() ?? "",
    mtw_areatype: data?.mtw_loc_areatype ?? "",
    mtw_block: data?.mtw_loc_areatype_code?.toString() ?? "",
    mtw_ward: data?.mtw_loc_vill_ward?.toString() ?? "",

    mtw_policestation: data?.mtw_loc_ps ?? "",
    mtw_pincode: data?.mtw_loc_pincode ?? "",

    mtw_nature: data?.mtw_nature ?? "",

    mtw_totalroute: data?.total_routes ?? 0,
    routes: data?.routes ?? [],
    total_route_milage: data?.total_route_milage ?? "",

    mtw_totalvehicle: data?.total_mtw_vehicle ?? 0,
    vehicles: data?.vehicles ?? [],

    mtw_maxworkers: data?.mtw_maxworkers ?? "",
});

// Payload Mapping (FORM → POST)
const mapFormToPayload = (formData: any) => ({
    mtw_name: formData.mtw_name,
    mtw_location: formData.mtw_location,
    mtw_district: formData.mtw_district,
    mtw_subdivision: Number(formData.mtw_subdivision),
    mtw_areatype: formData.mtw_areatype,
    mtw_block: Number(formData.mtw_block),
    mtw_panchyat: Number(formData.mtw_ward),
    mtw_policestation: formData.mtw_policestation,
    mtw_pincode: Number(formData.mtw_pincode),
    mtw_nature: formData.mtw_nature,

    mtw_totalroute: Number(formData.mtw_totalroute),
    mtw_totalvehicle: Number(formData.mtw_totalvehicle),
    mtw_maxworkers: Number(formData.mtw_maxworkers),

    routes: formData.routes,
    vehicles: formData.vehicles
});

/* ============================================================
   MAIN COMPONENT
============================================================ */

const RenewalDetailsMTW: React.FC = () => {

    const navigate = useNavigate();

    const { encAppId, mode, status } = useParams<{
        encAppId: string;
        mode: string;
        status: string;
    }>();

    // Application ID resource from session storage
    const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);

    useEffect(() => {
        const ctx = JSON.parse(sessionStorage.getItem("MTW_RENEWAL_CTX") || "{}");
        if (ctx?.applicationID) {
            setCurrentApplicationId(ctx.applicationID);
        }
    }, []);

    useEffect(() => {
        if (encAppId) {
            setCurrentApplicationId(encAppId);

            // sessionStorage.setItem(
            //     "MTW_RENEWAL_CTX",
            //     JSON.stringify({ applicationID: encAppId })
            // );
        }
    }, [encAppId]);

    useEffect(() => {
        if (mode === "preview") {
            setActiveTab(3);
        }
    }, [mode]);

    const isPreviewMode = mode === "preview";
    // const isIssued = status === "I";
    // const verifiedForPayment = status === "V";

    /* ================= TAB STATE (URL SYNCED) ================= */

    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = Number(searchParams.get("tab") || 0);
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    // Add a flag to detect API load
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Store the mapped values in a state and reapply them after dropdown data loads
    const [initialFormData, setInitialFormData] = useState<any>(null);

    /* ================= Disable print until declaration checked ================= */
    const [isDeclared, setIsDeclared] = useState(false);


    /* ================= States for handling form data, districs, subdivisions, wards, policestation, pincode, etc ================= */

    const [readonlyFields, setReadonlyFields] = useState<string[]>([]);

    const [districtList, setDistrictList] = useState<any[]>([]);
    const [subdivisionList, setSubdivisionList] = useState<any[]>([]);
    const [blockList, setBlockList] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [policeStations, setPoliceStations] = useState<any[]>([]);

    // Owner states
    const [owners, setOwners] = useState<Owner[]>([]);
    const [identificationNumber, setIdentificationNumber] = useState("");
    const [canAddPerson, setCanAddPerson] = useState(false);
    const [ownershipOptions, setOwnershipOptions] = useState<any[]>([]);

    const [ownershipType, setOwnershipType] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

    // Add new state for add new person form open
    const [formMode, setFormMode] = useState<"add" | "edit">("add");

    /* ============= Add Required States for Documents ============== */
    const documents = [
        "Trade License",
        "Article of Association / Partnership Deed",
        "Blue Book / Smart Card issued by Motor Vehicles",
        "Insurance Certificate of Motor Vehicles",
        "Address Proof",
        "Other Documents in Support of Correctness of Particulars of Application"
    ];

    const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

    const [previewAddressData, setPreviewAddressData] = useState<any>({});

    // Add Toggle Function for upload documents
    const toggleCheck = (doc: string) => {
        setCheckedDocs(prev => ({
            ...prev,
            [doc]: !prev[doc]
        }));
    };

    // File → Base64 Helper
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Document Submit Function
    const handleDocumentSubmit = async () => {
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

            // 🔥 FIX: Sequential upload instead of Promise.all
            for (const [label, file] of Object.entries(uploadedFiles)) {

                if (!file) continue;

                const base64 = await fileToBase64(file as File);

                const payload = {
                    act: "MTW",
                    applicationType: "RENEWAL",
                    applicationId: currentApplicationId,
                    newIdentificationNumber: newIdentificationNumber,
                    userID: sessionStorage.getItem("USER_ID_ENC"),
                    documentCode: documentUploadCodeMap[label],
                    filename: (file as File).name,
                    filecontent: base64,
                };

                console.log("Uploading Document:", payload);

                await axios.post(
                    `${API_BASE}documents/mtw-renewal-doc-upload`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            toast.success("Documents saved successfully");

            setActiveTab(3);

        } catch (error) {
            console.error(error);
            toast.error("Document submission failed");
        }
    };

    // Final Submit Function (Tab 3 only)
    const handleFinalSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();

        try {
            const authData = localStorage.getItem("lc_portal_auth");
            const auth = JSON.parse(authData || "{}");
            const token = auth?.token;

            if (!token) {
                toast.error("Authentication failed");
                return;
            }

            const ctx = JSON.parse(sessionStorage.getItem("MTW_RENEWAL_CTX") || "{}");

            const body = {
                user_id: auth?.user_id ?? auth?.userId ?? auth?.id,
                enapplication_id: ctx?.applicationID ?? currentApplicationId,
                // backlog_id: ctx?.backlog_id ?? ctx?.backlogId,   // To be done
                // renewal_id: ctx?.renewal_id ?? ctx?.renewalId,   // To be done
                // renewal_ref_number: ctx?.renewal_ref_number ?? ctx?.renewalRefNumber ?? ctx?.renewal_reference_number,  // To be done
            };

            const res = await axios.post(
                `${API_BASE}mtw/applications/final-preview-submit`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success(res?.data?.message || "Submitted successfully");

            // Navigating to dashboard after submission
            navigate("/applicant-dashboard");

        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Final submission failed");
        }
    };

    const handlePayNow = () => {
        if (!currentApplicationId) {
            toast.error("Application ID missing");
            return;
        }

        const encApp = encryptionDecryptionFun("encrypt", String(currentApplicationId)) ?? "";
        const encAct = encryptionDecryptionFun("encrypt", "3") ?? "";
        if (!encApp || !encAct) {
            toast.error("Unable to prepare payment link");
            return;
        }

        navigate(
            `/epayments-preview?applicationId=${encodeURIComponent(encApp)}&actId=${encodeURIComponent(encAct)}`
        );
    };


    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", String(activeTab));
        setSearchParams(params);
    }, [activeTab]);

    /* ================= FORM ================= */

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<MTWFormData>({
        resolver: yupResolver(schema) as Resolver<MTWFormData>,
        defaultValues: {
            routes: [{ route_details: "", route_mileage: "" }],
            vehicles: [{ registration_number: "" }],
        },
    });

    const district = watch("mtw_district");
    const subdivision = watch("mtw_subdivision");
    const areaType = watch("mtw_areatype");
    const block = watch("mtw_block");

    const routes = useWatch({
        control,
        name: "routes"
    });

    const totalRoutes = watch("mtw_totalroute");
    const totalVehicles = watch("mtw_totalvehicle");

    const vehiclesWatch = watch("vehicles");

    // Fix Routes Fields Auto Generate based on counts
    useEffect(() => {

        const count = Number(totalRoutes);

        if (!count || count <= 0) return; // do nothing when 0 or empty

        const existing = routes || [];

        const newRoutes = Array.from({ length: count }, (_, i) => {
            if (existing[i]) return existing[i];

            return {
                route_details: "",
                route_mileage: ""
            };
        });

        replaceRoutes(newRoutes);

    }, [totalRoutes]);

    // Fix Vehicles Fields Auto Generate based on counts

    useEffect(() => {

        const count = Number(totalVehicles);

        if (!count || count <= 0) return;

        const existing = vehiclesWatch || [];

        const newVehicles = Array.from({ length: count }, (_, i) => {
            if (existing[i]) return existing[i];

            return {
                registration_number: ""
            };
        });

        replaceVehicles(newVehicles);

    }, [totalVehicles]);


    // useEffect to calculate total mileage
    useEffect(() => {

        if (!routes) return;

        const total = routes.reduce((sum, r) => {
            return sum + Number(r?.route_mileage || 0);
        }, 0);

        setValue("mtw_totalmilage", String(total), {
            shouldDirty: false,
            shouldValidate: false
        });

    }, [routes]);

    /* ============== Ownership Form Hook =============== */
    const {
        register: registerOwner,
        handleSubmit: handleOwnerSubmit,
        watch: watchOwner,
        setValue: setOwnerValue,
        formState: { errors: ownerErrors },
        reset: resetOwnerForm
    } = useForm<OwnershipFormData>({
        resolver: yupResolver(ownershipSchema) as Resolver<OwnershipFormData>,
        defaultValues: {
            designation: ""
        }
    });

    // Create Separate Location States (Ownership Form)
    // Ownership location dropdown states
    const [stateList, setStateList] = useState<any[]>([]);
    const [ownerDistrictList, setOwnerDistrictList] = useState<any[]>([]);
    const [ownerSubdivisionList, setOwnerSubdivisionList] = useState<any[]>([]);
    const [ownerBlockList, setOwnerBlockList] = useState<any[]>([]);
    const [ownerWardList, setOwnerWardList] = useState<any[]>([]);
    const [ownerPoliceStationList, setOwnerPoliceStationList] = useState<any[]>([]);

    // Add watchers for the ownership form only.
    const ownerState = watchOwner("state");
    const ownerDistrict = watchOwner("district");
    const ownerSubdivision = watchOwner("subdivision");
    const ownerAreaType = watchOwner("areaType");
    const ownerBlock = watchOwner("block");

    const designationValue = watchOwner("designation");

    const {
        fields: routeFields,
        replace: replaceRoutes,
    } = useFieldArray({
        control,
        name: "routes",
    });

    const {
        fields: vehicleFields,
        replace: replaceVehicles,
    } = useFieldArray({
        control,
        name: "vehicles",
    });

    // Fetch Initial Data (GET API) for Application Details tab
    useEffect(() => {

        if (!currentApplicationId) return;

        const fetchData = async () => {
            try {

                const authData = localStorage.getItem("lc_portal_auth");
                const token = JSON.parse(authData || "{}")?.token;

                const res = await axios.get(
                    `${API_BASE}applicant-module/mtw/applications/final-preview/${encodeURIComponent(currentApplicationId)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = res.data;

                const mapped = mapPreviewToForm(data.formData);

                setInitialFormData(mapped);

                setPreviewAddressData(data?.previewAddress);

                // Store fee from API
                setApiFee(data?.finalfees ?? data?.fees ?? null);

                // Store initial worker count for comparison
                setInitialWorkers(Number(data?.formData?.mtw_maxworkers ?? 0));
                setApplicationStatus(String(data?.formData?.status ?? ""));

                reset({
                    ...mapped,
                    routes: mapped.routes ?? [],
                    vehicles: mapped.vehicles ?? []
                });

                setReadonlyFields(data.readonlyFields || []);

                setIsInitialLoad(false);

            } catch (err) {
                console.error(err);
                toast.error("Failed to load application data");
            }
        };

        fetchData();

    }, [currentApplicationId]);

    /* =============================================
     Location useEffects for Application Details
    ============================================== */

    // Load Districts
    useEffect(() => {

        axios.get(`${API_BASE}district`)
            .then(res => {
                setDistrictList(res.data || []);
            })
            .catch(() => toast.error("Failed to load districts"));

    }, []);

    // District → Subdivision → Police Station
    useEffect(() => {

        if (!district) return;

        axios.get(`${API_BASE}subdivision/${district}`)
            .then(res => setSubdivisionList(res.data || []));

        axios.get(`${API_BASE}policestation/${district}`)
            .then(res => setPoliceStations(res.data || []));

    }, [district]);

    // Subdivision → Block
    useEffect(() => {

        if (!district || !subdivision || !areaType) return;

        axios.get(`${API_BASE}block/${district}/${subdivision}/${areaType}`)
            .then(res => setBlockList(res.data || []));

    }, [district, subdivision, areaType]);

    // Block → Ward
    useEffect(() => {

        if (!block) return;

        axios.get(`${API_BASE}villageward/${block}`)
            .then(res => {

                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name
                }));

                setWards(mapped);

            });

    }, [block]);

    // FINAL APPLICATION PREFILL FIX
    useEffect(() => {

        if (!initialFormData) return;

        const run = async () => {

            // 1️⃣ District list already loaded globally

            setValue("mtw_district", initialFormData.mtw_district);

            // 2️⃣ Subdivision + PS
            const [subRes, psRes] = await Promise.all([
                axios.get(`${API_BASE}subdivision/${initialFormData.mtw_district}`),
                axios.get(`${API_BASE}policestation/${initialFormData.mtw_district}`)
            ]);

            setSubdivisionList(subRes.data || []);
            setPoliceStations(psRes.data || []);

            setValue("mtw_subdivision", initialFormData.mtw_subdivision);
            setValue("mtw_policestation", initialFormData.mtw_policestation);

            setValue("mtw_areatype", initialFormData.mtw_areatype);

            // 3️⃣ Block (Municipality)
            const blockRes = await axios.get(
                `${API_BASE}block/${initialFormData.mtw_district}/${initialFormData.mtw_subdivision}/${initialFormData.mtw_areatype}`
            );

            setBlockList(blockRes.data || []);

            await new Promise(r => setTimeout(r, 50)); // 🔥 ensure render

            setValue("mtw_block", initialFormData.mtw_block);

            // 4️⃣ Ward
            const wardRes = await axios.get(
                `${API_BASE}villageward/${initialFormData.mtw_block}`
            );

            const mappedWard = (wardRes.data || []).map((w: any) => ({
                code: w.village_code,
                name: w.village_name
            }));

            setWards(mappedWard);

            await new Promise(r => setTimeout(r, 50)); // 🔥 ensure render

            setValue("mtw_ward", initialFormData.mtw_ward);

        };

        run();

    }, [initialFormData]);


    const [isPrefilling, setIsPrefilling] = useState(false);

    // Add a state variable to store the fee received from the backend.
    const [apiFee, setApiFee] = useState<number | null>(null);
    const [initialWorkers, setInitialWorkers] = useState<number | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<string>("");

    /* =============================================
     Location useEffects for Ownership Details
    ============================================== */

    // Load States
    useEffect(() => {

        axios.get(`${API_BASE}states`)
            .then(res => {
                setStateList(res.data.data || []);
            })
    }, []);

    // Load Districts
    useEffect(() => {

        if (!ownerState) return;

        if (isPrefilling) return; // 🔥 ADD THIS

        setOwnerValue("district", "");
        setOwnerValue("subdivision", "");
        setOwnerValue("block", "");
        setOwnerValue("ward", "");
        setOwnerValue("policeStation", "");

        axios.get(`${API_BASE}district`)
            .then(res => setOwnerDistrictList(res.data || []));

    }, [ownerState]);

    // District → Subdivision + Police Station
    useEffect(() => {

        if (!ownerDistrict) return;

        if (isPrefilling) return; // 🔥 ADD THIS

        setOwnerValue("subdivision", "");
        setOwnerValue("areaType", "");
        setOwnerValue("block", "");
        setOwnerValue("ward", "");
        setOwnerValue("policeStation", "");

        setOwnerSubdivisionList([]);
        setOwnerBlockList([]);
        setOwnerWardList([]);

        axios.get(`${API_BASE}subdivision/${ownerDistrict}`)
            .then(res => setOwnerSubdivisionList(res.data || []));

        axios.get(`${API_BASE}policestation/${ownerDistrict}`)
            .then(res => setOwnerPoliceStationList(res.data || []));

    }, [ownerDistrict]);

    // Fix Subdivision Change Logic
    useEffect(() => {

        if (!ownerSubdivision) return;

        if (isPrefilling) return; // 🔥 ADD THIS

        setOwnerValue("block", "");
        setOwnerValue("ward", "");

        setOwnerBlockList([]);
        setOwnerWardList([]);

    }, [ownerSubdivision]);

    // Subdivision + AreaType → Block
    useEffect(() => {

        if (!ownerDistrict || !ownerSubdivision || !ownerAreaType) return;

        setOwnerBlockList([]);
        setOwnerWardList([]);

        axios.get(`${API_BASE}block/${ownerDistrict}/${ownerSubdivision}/${ownerAreaType}`)
            .then(res => setOwnerBlockList(res.data || []));

    }, [ownerDistrict, ownerSubdivision, ownerAreaType]);

    // Block → Ward
    useEffect(() => {

        if (!ownerBlock) return;

        if (isPrefilling) return; // 🔥 ADD THIS

        setOwnerValue("ward", "");
        setOwnerWardList([]);

        axios.get(`${API_BASE}villageward/${ownerBlock}`)
            .then(res => {

                const mapped = (res.data || []).map((w: any) => ({
                    code: w.village_code,
                    name: w.village_name
                }));

                setOwnerWardList(mapped);
            });

    }, [ownerBlock]);

    // Defining two strings for storing newly created renewal identification number for further use in document upload
    const [newIdentificationNumber, setNewIdentificationNumber] = useState("");

    // Save Application Details
    const onSubmit: SubmitHandler<MTWFormData> = async (data) => {

        try {
            if (!currentApplicationId) return;

            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            const payload = mapFormToPayload(data);

            const res = await fetch(
                `${API_BASE}applicant-module/mtw/applications/renewal-details-submit/${encodeURIComponent(currentApplicationId)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                },
            );

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message);
                return;
            }

            toast.success("Renewal application created successfully");

            const newApplicationId = result.newApplicationId;

            setNewIdentificationNumber(result.newIdentificationNumber);

            // Store userID in sessionStorage
            sessionStorage.setItem("USER_ID_ENC", result.userID);


            // Adding the new application id in the sessionStorage for further use in the next page

            if (newApplicationId) {
                const existingCtx = JSON.parse(
                    sessionStorage.getItem("MTW_RENEWAL_CTX") || "{}"
                );

                sessionStorage.setItem(
                    "MTW_RENEWAL_CTX",
                    JSON.stringify({
                        ...existingCtx,
                        applicationID: newApplicationId,
                    })
                );

                setCurrentApplicationId(newApplicationId);
            }

            setActiveTab(1);

        } catch (err) {

            console.error(err);
            toast.error("Failed to save");

        }
    };

    // Data Table Columns for view or add information under Ownership Details tab
    const columns: TableColumn<Owner>[] = [
        {
            name: "Sl. No",
            selector: (row, index) => String(index! + 1),
            width: "80px",
            center: true,
        },
        {
            name: "Name",
            selector: row => row.name,
        },
        {
            name: "Designation",
            selector: row => row.designation,
            wrap: true,
        },
        {
            name: "Added Date",
            selector: row => row.addedDate,
            width: "150px",
        },
        {
            name: "Company's Name",
            selector: row => row.companyName,
        },
        {
            name: "Action",
            cell: row => (
                <button
                    onClick={() => fetchPersonDetails(row.personId)}
                    className="text-blue-600 hover:text-black"
                >
                    <img
                        title="View Or Edit Information"
                        alt="View Or Edit Information"
                        src={`${IMAGE_BASE}edit_icon.png`}
                    />
                </button>
            ),
            width: "80px",
            center: true,
        }
    ];

    // Nature of Motor Transport Undertaking mapping
    const natureMap: Record<string, string> = {
        city_service: "City Service",
        long_distance: "Long Distance",
        passenger_service: "Passenger Service",
        long_distance_freight_service: "Long Distance Freight Service",
        other: "Other"
    };

    const formValues = watch();

    /* ================= Create Registration Data Builder ================= */
    // For Tab 3 preview, prefer the GET API data loaded in Tab 0 (stored in `initialFormData`).
    // Fallback to current form values if needed (e.g. before API load finishes).
    const registrationSource: any = initialFormData ?? formValues;

    const previewText = (v: any) => {
        if (v === null || v === undefined) return "-";
        if (typeof v === "string" && v.trim() === "") return "-";
        return String(v);
    };

    // Pick any key easily using dot-paths, e.g. "foo.bar.baz"
    const pick = (path: string) => {
        const value = path
            .split(".")
            .filter(Boolean)
            .reduce((acc: any, key) => acc?.[key], registrationSource);
        return previewText(value);
    };


    /* ================================
    Compute the Correct Fee Dynamically
    =================================== */
    const currentWorkers = Number(watch("mtw_maxworkers") ?? 0);

    // Determine whether the user has modified the worker count
    const isWorkersChanged =
        initialWorkers !== null &&
        currentWorkers !== Number(initialWorkers);

    // Decide which fee to display
    const calculatedFee = calculateFee(currentWorkers);

    const feeToDisplay =
        isWorkersChanged
            ? calculatedFee
            : apiFee ?? calculatedFee;


    /* ============================================================
    Generate dynamic rows for multiple directors
    ============================================================= */
    const directorRows = (
        previewAddressData?.est_directors || []
    ).flatMap((director: any, index: number) => {
        const base = `9.${index + 1}`;

        return [
            {
                sl: base,
                param: `Name of the Director ${index + 1} of Motor Transport undertaking when firm is registered under the companies Act, 1956`,
                value: director?.name || "-",
            },
            {
                sl: `${base}.1`,
                param: "Location of Director",
                value: director?.address || "-",
            },
            {
                sl: `${base}.2`,
                param: "Country",
                value: director?.country || "-",
            },
            {
                sl: `${base}.3`,
                param: "State",
                value: director?.state || "-",
            },
            {
                sl: `${base}.4`,
                param: "District",
                value: director?.district || "-",
            },
            {
                sl: `${base}.5`,
                param: "Subdivision",
                value: director?.subdivision || "-",
            },
            {
                sl: `${base}.6`,
                param: "Municipality",
                value: director?.municipality || "-",
            },
            {
                sl: `${base}.7`,
                param: "Ward",
                value: director?.village_ward || "-",
            },
            {
                sl: `${base}.8`,
                param: "Police Station",
                value: director?.police_station || "-",
            },
            {
                sl: `${base}.9`,
                param: "Pin Code",
                value: director?.pincode || "-",
            },
        ];
    });

    /* =====================================================
    Generate dynamic rows for multiple propetors or partners
    ======================================================== */
    const proprietorPartnerRows = (() => {
        const list = previewAddressData?.est_proprietor_partners || [];

        let proprietorCount = 0;
        let partnerCount = 0;

        return list.map((person: any) => {
            let label = "";
            let number = 0;

            if (person.designation === "proprietor") {
                proprietorCount++;
                label = "Proprietor";
                number = proprietorCount;
            } else if (person.designation === "partner") {
                partnerCount++;
                label = "Partner";
                number = partnerCount;
            }

            return {
                sl: `8.${proprietorCount + partnerCount}`, // overall row numbering
                param: `Name and Address of ${label} ${number} of Motor Transport undertaking in the case of firm not registered under the companies Act, 1956`,
                value: person?.name && person?.address
                    ? `${person.name}, ${person.address}`
                    : person?.name || person?.address || "-",
            };
        });
    })();


    /* ==========================================================
    Defining the registration rows for the preview table in Tab 3
    ============================================================= */
    const registrationRows = [
        { sl: "1", param: "Name of Motor Transport Undertaking", value: pick("mtw_name") },

        { sl: "2", param: "Location of Motor Transport Undertaking", value: pick("mtw_location") },

        {
            sl: "2.1",
            param: "District",
            // value:
            //     districtList.find(d => d.district_code === registrationSource?.mtw_district)?.district_name || "-"
            value: previewAddressData?.est_dist_name?.district_name || "-",
        },

        {
            sl: "2.2",
            param: "Subdivision",
            // value:
            //     subdivisionList.find(s => String(s.sub_div_code) === String(registrationSource?.mtw_subdivision))?.subdivision_name || "-"
            value: previewAddressData?.est_subdiv_name?.sub_div_name || "-",
        },

        {
            sl: "2.3",
            param: "Municipality",
            // value: blockList.find(b => b.block_code === registrationSource?.mtw_block)?.block_name || "-"
            value: previewAddressData?.est_areatype_name?.block_mun_name || "-",
        },

        {
            sl: "2.4",
            param: "Ward",
            // value: wards.find(w => w.code === registrationSource?.mtw_ward)?.name || "-"
            value: previewAddressData?.est_villward_name?.village_name || "-",
        },

        {
            sl: "2.5",
            param: "Police Station",
            // value:
            //     policeStations.find(ps => String(ps.police_station_code) === String(registrationSource?.mtw_policestation))
            //         ?.police_station_name || "-"
            value: previewAddressData?.est_ps_name?.name_of_police_station || "-",
        },

        { sl: "2.6", param: "Pin Code", value: pick("mtw_pincode") },

        {
            sl: "3",
            param: "Nature of Motor Transport Undertaking",
            value: registrationSource?.mtw_nature ? (natureMap[registrationSource.mtw_nature as keyof typeof natureMap] ?? "-") : "-"
        },

        { sl: "4", param: "Total Number Of Routes", value: pick("mtw_totalroute") },

        {
            sl: "5",
            param: "Route Details - Mileage",
            value:
                (registrationSource?.routes || watch("routes") || [])
                    .map((r: any) => `${r?.route_details ?? ""} - ${r?.route_mileage ?? ""}`)
                    .filter((x: string) => x !== "-")
                    .join(", ") || "-"
        },

        {
            sl: "5.1",
            param: "Total Routes Mileage",
            value: pick("total_route_milage")
        },

        {
            sl: "6",
            param: "Total Number of MT Vehicles on the last date or the preceding year",
            value: pick("mtw_totalvehicle")
        },

        {
            sl: "7",
            param: "Maximum Number of MTW Employed on any day during the preceding year",
            value: pick("mtw_maxworkers")
        },

        ...proprietorPartnerRows,

        {
            sl: "8.2",
            param: "Name and Address of the General Manager in case of a public sector undertaking",
            // value: "No data available"
            value: previewAddressData?.est_gm_details || "-",
        },

        // ✅ Dynamic Directors Section
        ...directorRows,

        {
            sl: "10",
            param: "Fees (*This is system generated fees depends on point 7)",
            value: feeToDisplay
                ? `₹${feeToDisplay} FEES CHART (in ₹)`
                : "-"
        }
    ];

    /* ============================================================
       Create Documents Preview Table
    ============================================================ */
    const documentRows = [
        { sl: "1", name: "Uploaded Trade License", key: "Trade License" },
        { sl: "2", name: "Uploaded Articles of Association / Partnership Deed", key: "Article of Association / Partnership Deed" },
        { sl: "3", name: "Uploaded Blue Book / Smart Card Issued by Motor Vehicles", key: "Blue Book / Smart Card issued by Motor Vehicles" },
        { sl: "4", name: "Uploaded Insurance Certificate of Motor Vehicles", key: "Insurance Certificate of Motor Vehicles" },
        { sl: "5", name: "Uploaded Documents in support of correctness of the application", key: "Other Documents in Support of Correctness of Particulars of Application" },
        { sl: "6", name: "Uploaded Address Proof", key: "Address Proof" },
        { sl: "7", name: "Form - I", key: "FORM1" }
    ];

    // Create a designation label map
    const designationLabelMap: Record<string, string> = {
        director: "Name of Director",
        proprietor: "Name of Proprietor",
        partner: "Name of Partner",
        general_manager: "Name of General Manager",
        other: "Name of Person"
    };

    const directorLabel =
        designationLabelMap[designationValue] || "Name of Person";

    const companyLabelMap: Record<string, string> = {
        director: "Name of The Company",
        proprietor: "Name of The Firm",
        partner: "Name of The Firm",
        general_manager: "Name of The PSU",
        other: "Name of The Organization"
    };

    const companyLabel =
        companyLabelMap[designationValue] || "Name of The Organization";


    // Create a designation reverse mapping function
    const getDesignationValue = (designation?: string) => {

        if (!designation) return "";

        const d = designation.toLowerCase();

        if (d.includes("director")) return "director";
        if (d.includes("proprietor")) return "proprietor";
        if (d.includes("partner")) return "partner";
        if (d.includes("general manager")) return "general_manager";

        return "other";
    };

    // Create a state to store API values
    const [ownerInitialData, setOwnerInitialData] = useState<any>(null);

    // GET API — Load Ownership Tab
    const fetchOwnershipTab = async () => {
        try {
            if (!currentApplicationId) return;

            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            const res = await fetch(
                `${API_BASE}applicant-module/mtw/ownership/${encodeURIComponent(currentApplicationId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            setOwners(data.persons || []);
            setIdentificationNumber(data.identificationNumber || "");
            setCanAddPerson(data.canAddPerson);
            setOwnershipOptions(data.ownershipTypes || []);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load ownership data");
        }
    };

    // Call GET API when Tab Opens
    useEffect(() => {

        if (activeTab === 1 && currentApplicationId) {
            fetchOwnershipTab();
        }

    }, [activeTab, currentApplicationId]);

    // Edit Button — Load Person Details
    const fetchPersonDetails = async (personId: string) => {

        try {

            setOwnerInitialData(null); // ✅ IMPORTANT RESET

            if (!currentApplicationId || !personId) return;

            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            const res = await fetch(
                `${API_BASE}applicant-module/mtw/person/${encodeURIComponent(currentApplicationId)}/${encodeURIComponent(personId)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const data = await res.json();

            const mapped = {
                designation: getDesignationValue(data.designation),
                companyName: data.company_name || "",
                directorName: data.person_name || "",
                address: data.person_address || "",
                country: data.person_country?.toString() || "",
                state: data.person_state?.toString() || "",
                district: data.person_district?.toString() || "",
                subdivision: data.person_subdivision?.toString() || "",
                areaType: data.person_areatype || "",
                block: data.person_areatype_code?.toString() || "",
                ward: data.person_vill_ward?.toString() || "",
                policeStation: data.person_ps?.toString() || "",
                pincode: data.person_pincode || ""
            };

            setOwnerInitialData(mapped);

            resetOwnerForm({
                ...mapped,
                block: "",
                ward: "",
                policeStation: ""
            });

            setSelectedOwner(data);
            setFormMode("edit");
            setIsEditing(true);

        } catch {
            toast.error("Failed to load person details");
        }
    };

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Apply dropdown values AFTER options load for ownership tab
    // ONE MASTER EFFECT
    useEffect(() => {

        if (!ownerInitialData) return;

        const run = async () => {

            setIsPrefilling(true);

            setOwnerValue("state", ownerInitialData.state);

            const distRes = await axios.get(`${API_BASE}district`);
            setOwnerDistrictList(distRes.data || []);

            setOwnerValue("district", ownerInitialData.district);

            const [subRes, psRes] = await Promise.all([
                axios.get(`${API_BASE}subdivision/${ownerInitialData.district}`),
                axios.get(`${API_BASE}policestation/${ownerInitialData.district}`)
            ]);

            setOwnerSubdivisionList(subRes.data || []);
            setOwnerPoliceStationList(psRes.data || []);

            setOwnerValue("subdivision", ownerInitialData.subdivision);
            setOwnerValue("areaType", ownerInitialData.areaType);

            // BLOCK
            const blockRes = await axios.get(
                `${API_BASE}block/${ownerInitialData.district}/${ownerInitialData.subdivision}/${ownerInitialData.areaType}`
            );

            setOwnerBlockList(blockRes.data || []);

            await wait(50); // 🔥 IMPORTANT

            setOwnerValue("block", ownerInitialData.block);

            // WARD
            const wardRes = await axios.get(
                `${API_BASE}villageward/${ownerInitialData.block}`
            );

            const mappedWard = (wardRes.data || []).map((w: any) => ({
                code: w.village_code,
                name: w.village_name
            }));

            setOwnerWardList(mappedWard);

            await wait(50); // 🔥 IMPORTANT

            setOwnerValue("ward", ownerInitialData.ward);

            setOwnerValue("policeStation", ownerInitialData.policeStation);
            setOwnerValue("pincode", ownerInitialData.pincode);

            setIsPrefilling(false);

        };

        run();

    }, [ownerInitialData]);

    // CREATE PROPER PAYLOAD MAPPER FOR ADDING/EDITING PERSON DETAILS FOR OWNERSHIP TAB
    const mapOwnerPayload = (data: OwnershipFormData, designationFinal: string) => ({
        designation: designationFinal,
        person_name: data.directorName,
        company_name: data.companyName,
        person_address: data.address,
        person_country: data.country,
        person_state: Number(data.state),

        // ✅ Convert to NUMBER where required
        person_district: data.district,
        person_subdivision: Number(data.subdivision),
        person_areatype: data.areaType,
        person_areatype_code: Number(data.block),
        person_vill_ward: Number(data.ward),

        // ✅ keep string
        person_ps: data.policeStation,

        // ✅ convert to number
        person_pincode: Number(data.pincode),
    });


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div className="bg-gray-100 min-h-screen mb-5">

            <h1 className="text-lg bg-white font-semibold p-4 mb-4">
                RENEWAL OF MOTOR TRANSPORT UNDERTAKING REGISTRATION
            </h1>

            {/* ================= TAB HEADER ================= */}
            <div className="flex gap-2 border-b mb-4 px-4">
                {!isPreviewMode && (
                    <>
                        <TabButton label="APPLICATION DETAILS" active={activeTab === 0} onClick={() => setActiveTab(0)} />
                        <TabButton label="OWNERSHIP DETAILS" active={activeTab === 1} onClick={() => setActiveTab(1)} />
                        <TabButton label="UPLOAD DOCUMENTS" active={activeTab === 2} onClick={() => setActiveTab(2)} />
                    </>
                )}

                <TabButton
                    label="PREVIEW APPLICATION"
                    active={activeTab === 3}
                    onClick={() => setActiveTab(3)}
                />
            </div>

            {/* ============================================================
         TAB 0 → APPLICATION DETAILS
      ============================================================ */}

            {activeTab === 0 && (
                <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-15 space-y-6">

                    {/* SECTION 1 */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            Name and Address to which communications relating to the Motor Transport undertaking should be sent
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 p-4">

                            <div>
                                <label className="label">1) Name of Motor Transport Undertaking <span className="text-red-600">*</span></label>
                                <input {...register("mtw_name")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                <p className="error">{errors.mtw_name?.message}</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label">2.1) Address Line1 <span className="text-red-600">*</span></label>
                                <textarea {...register("mtw_location")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24" />
                            </div>

                            {/* District */}
                            <div>
                                <label className="label">2.2) Select District <span className="text-red-600">*</span></label>
                                <select {...register("mtw_district")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                    <option value="">Select</option>

                                    {districtList.map((district) => (
                                        <option key={district.district_code} value={district.district_code}>
                                            {district.district_name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* Subdivision */}
                            <div>
                                <label className="label">2.3) Select Subdivision <span className="text-red-600">*</span></label>
                                <select {...register("mtw_subdivision")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                                    <option value="">Select</option>

                                    {subdivisionList.map((sub) => (
                                        <option key={sub.sub_div_code} value={String(sub.sub_div_code)}>
                                            {sub.sub_div_name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* Area Type */}
                            <div>
                                <label className="label">2.4) Select Block/Municipality/Corporation/SEZ/Notified Area <span className="text-red-600">*</span></label>
                                <select {...register("mtw_areatype")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                    <option value="">Select</option>
                                    <option value="B">Block</option>
                                    <option value="M">Municipality</option>
                                    <option value="C">Corporation</option>
                                    <option value="S">SEZ</option>
                                    <option value="N">Notified Area</option>

                                </select>
                            </div>

                            {/* Block */}
                            <div>
                                <label className="label">2.5) Name of Municipality <span className="text-red-600">*</span></label>
                                <select {...register("mtw_block")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                                    <option value="">Select</option>

                                    {blockList.map((block) => (
                                        <option key={block.block_code} value={String(block.block_code)}>
                                            {block.block_mun_name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* Ward */}
                            <div>
                                <label className="label">2.6) Ward Number <span className="text-red-600">*</span></label>
                                <select {...register("mtw_ward")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                                    <option value="">Select</option>

                                    {wards.map((ward) => (
                                        <option key={ward.code} value={String(ward.code)}>
                                            {ward.name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            {/* Police Station */}
                            <div>
                                <label className="label">2.7) Select Police Station <span className="text-red-600">*</span></label>
                                <select {...register("mtw_policestation")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                                    <option value="">Select</option>

                                    {policeStations.map((ps) => (
                                        <option key={ps.police_station_code} value={String(ps.police_station_code)}>
                                            {ps.name_of_police_station}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <div>
                                <label className="label">2.8) Pin Code <span className="text-red-600">*</span></label>
                                <input {...register("mtw_pincode")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                <p className="error">{errors.mtw_pincode?.message}</p>
                            </div>

                        </div>
                    </div>

                    {/* SECTION 2 */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            Nature of Motor Transport Service
                        </div>

                        <div className="p-4">
                            <select {...register("mtw_nature")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3">
                                <option value="">Select</option>
                                <option value="city_service">City Service</option>
                                <option value="long_distance">Long Distance</option>
                                <option value="passenger_service">Passenger Service</option>
                                <option value="long_distance_freight_service">Long Distance Freight Service</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* SECTION 3 ROUTE INFO */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            Route Information Details
                        </div>

                        <div className="p-4 space-y-4">

                            <div>
                                <label className="label">4) Total Number Of Routes</label>
                                <input
                                    type="number"
                                    {...register("mtw_totalroute", { valueAsNumber: true })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3"
                                />
                            </div>

                            {routeFields.map((field, index) => (
                                <div key={field.id} className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">
                                            4.1.{index + 1}) Route Details
                                        </label>
                                        <input {...register(`routes.${index}.route_details`)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                    </div>

                                    <div>
                                        <label className="label">
                                            4.2.{index + 1}) Route Mileage (in km)
                                        </label>
                                        <input {...register(`routes.${index}.route_mileage`)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                    </div>
                                </div>
                            ))}

                            <div>
                                <label className="label">5) Total Routes Mileage</label>
                                <input {...register("mtw_totalmilage")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3" readOnly />
                            </div>

                        </div>
                    </div>

                    {/* SECTION 4 VEHICLES */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            Number of Motor Transport/ Vehicles on the last date of the preceeding year
                        </div>

                        <div className="p-4 space-y-4">

                            <div>
                                <label className="label">6) Total Number of Motor Transport / Vehicles on the last date of the preceeding year <span className="text-red-600">*</span></label>
                                <input
                                    type="number"
                                    {...register("mtw_totalvehicle", { valueAsNumber: true })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3"
                                />
                            </div>

                            {vehicleFields.map((field, index) => (
                                <div key={field.id}>
                                    <label className="label">
                                        6.{index + 1}) Motor Vehicle Registration Number
                                    </label>
                                    <input
                                        {...register(`vehicles.${index}.registration_number`)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3"
                                    />
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* SECTION 5 WORKERS */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            Number of Motor Transport Worker employed on any day during the preceeding year
                        </div>

                        <div className="p-4">
                            <label className="label">
                                7) Maximum number motor transport workers employed on any day during the preceeding year <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("mtw_maxworkers", { valueAsNumber: true })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm w-1/3"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="submit" className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black">
                            Save
                        </button>
                        <button type="button" className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black"
                            onClick={() => setActiveTab(1)}>
                            Next
                        </button>
                    </div>

                </form>
            )}

            {/* ============================================================
                TAB 1 → OWNERSHIP DETAILS
            ============================================================ */}
            {activeTab === 1 && (
                <div className="px-4 pb-10">

                    {!isEditing ? (
                        <>
                            {/* OWNERSHIP TYPE PANEL */}
                            <div className="border bg-white mb-6">
                                <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                                    Ownership Information of the Motor Transport Undertaking
                                </div>

                                <div className="p-4 space-y-4">
                                    <p className="text-sm">
                                        <b>Note:</b> For Point number 8.(i), 8.(ii), and 9 of FORM-I Select ownership type of the Motor Transport Undertaking and then click on Add Details button to add person's details.
                                    </p>

                                    <div className="w-full md:w-1/3">
                                        <label className="label">Ownership Type <span className="text-red-600">*</span></label>
                                        <select
                                            value={ownershipType}
                                            onChange={(e) => setOwnershipType(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        >
                                            <option value="">-Select-</option>

                                            {ownershipOptions.map((opt: any) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}

                                        </select>

                                        {/* + Add Details */}
                                        {ownershipType && canAddPerson && !isEditing && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => {

                                                        setFormMode("add");

                                                        resetOwnerForm({
                                                            designation: ownershipType || "",
                                                            companyName: "",
                                                            directorName: "",
                                                            address: "",
                                                            country: "",
                                                            state: "",
                                                            district: "",
                                                            subdivision: "",
                                                            areaType: "",
                                                            block: "",
                                                            ward: "",
                                                            policeStation: "",
                                                            pincode: "",
                                                        });

                                                        setSelectedOwner(null);
                                                        setIsEditing(true);
                                                    }}
                                                    className="bg-[#2A628C] text-white px-4 py-2 rounded hover:bg-black"
                                                >
                                                    + Add Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* LIST OF OWNERS */}
                            <div className="border bg-white">
                                <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                                    List of Owners
                                </div>

                                <div className="p-4">
                                    <DataTable
                                        columns={columns}
                                        data={owners}
                                        striped
                                        highlightOnHover
                                        responsive
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setActiveTab(0)}
                                    className="bg-[#2A628C] text-white px-4 py-2 rounded"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setActiveTab(2)}
                                    className="bg-[#2A628C] text-white px-4 py-2 rounded"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        /* ================= ADD AND EDIT FORM ================= */

                        <form
                            onSubmit={handleOwnerSubmit(async (data) => {

                                const designationFinal =
                                    data.designation === "other"
                                        ? data.designation_other || ""
                                        : data.designation;

                                if (formMode === "add") {
                                    if (!currentApplicationId) return;

                                    const authData = localStorage.getItem("lc_portal_auth");
                                    const token = JSON.parse(authData || "{}")?.token;

                                    const res = await fetch(
                                        `${API_BASE}applicant-module/mtw/add-person/${encodeURIComponent(currentApplicationId)}`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`
                                            },
                                            body: JSON.stringify(
                                                mapOwnerPayload(data, designationFinal)
                                            )
                                        }
                                    );

                                    const result = await res.json();

                                    if (!res.ok) {
                                        toast.error(result.message || "Failed to add person");
                                        return;
                                    }

                                    toast.success(result.message || "Person added successfully");

                                    setIsEditing(false);
                                    fetchOwnershipTab();

                                } else if (formMode === "edit" && selectedOwner) {
                                    if (!currentApplicationId || !selectedOwner.personId) return;

                                    const authData = localStorage.getItem("lc_portal_auth");
                                    const token = JSON.parse(authData || "{}")?.token;

                                    const res = await fetch(
                                        `${API_BASE}applicant-module/mtw/edit-person/${encodeURIComponent(currentApplicationId)}/${encodeURIComponent(selectedOwner.personId)}`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`
                                            },
                                            body: JSON.stringify(
                                                mapOwnerPayload(data, designationFinal)
                                            )
                                        }
                                    );

                                    const result = await res.json();

                                    if (!res.ok) {
                                        toast.error(result.message || "Update failed");
                                        return;
                                    }

                                    toast.success(result.message || "Person updated successfully");

                                    setIsEditing(false);
                                    setSelectedOwner(null);
                                    fetchOwnershipTab();
                                }
                            })}
                            className="border bg-white"
                        >
                            <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                                {formMode === "add" ? "Add Ownership Details" : "Edit Ownership Details"}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 p-6">

                                <div>
                                    <label className="label">Designation <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("designation")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">-Select-</option>
                                        <option value="director">Director of the Company</option>
                                        <option value="proprietor">Proprietor of the Firm</option>
                                        <option value="partner">Partner of the Firm</option>
                                        <option value="general_manager">General Manager of Public Sector Undertaking</option>
                                        <option value="other">Other</option>
                                    </select>

                                    {/* If the selected value is "other", show the input field */}
                                    {designationValue === "other" && (
                                        <div>
                                            <label className="label mt-4">
                                                Other Designation <span className="text-red-600">*</span>
                                            </label>

                                            <input
                                                {...registerOwner("designation_other")}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                placeholder="Enter designation"
                                            />
                                        </div>
                                    )}
                                    <p className="error">{ownerErrors.designation?.message}</p>
                                </div>

                                <div>
                                    <label className="label">
                                        {companyLabel} <span className="text-red-600">*</span>
                                    </label>
                                    <input {...registerOwner("companyName")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                    <p className="error">{ownerErrors.companyName?.message}</p>
                                </div>

                                <div>
                                    <label className="label">
                                        {directorLabel} <span className="text-red-600">*</span>
                                    </label>
                                    <input {...registerOwner("directorName")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                    <p className="error">{ownerErrors.directorName?.message}</p>
                                </div>

                                <div>
                                    <label className="label">Address Line1 (if other Country/State please provide detail address) <span className="text-red-600">*</span></label>
                                    <input {...registerOwner("address")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                    <p className="error">{ownerErrors.address?.message}</p>
                                </div>

                                <div>
                                    <label className="label">Country <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("country")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="1">India</option>
                                        <option value="2">Others</option>
                                    </select>
                                </div>

                                {/* State */}
                                <div>
                                    <label className="label">Select State <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("state")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {stateList.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="label">Select District <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("district")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {ownerDistrictList.map((d) => (
                                            <option key={d.district_code} value={d.district_code}>
                                                {d.district_name}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Sub-Division */}
                                <div>
                                    <label className="label">Select Sub-Division <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("subdivision")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {ownerSubdivisionList.map((s) => (
                                            <option key={s.sub_div_code} value={s.sub_div_code}>
                                                {s.sub_div_name}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Area Type */}
                                <div>
                                    <label className="label">Select Block / Municipality / Corporation / SEZ / Notified Area <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("areaType")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="B">Block</option>
                                        <option value="M">Municipality</option>
                                        <option value="C">Corporation</option>
                                        <option value="S">SEZ</option>
                                        <option value="N">Notified Area</option>
                                    </select>
                                </div>

                                {/* Block */}
                                <div>
                                    <label className="label">Name of Municipality <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("block")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {ownerBlockList.map((b) => (
                                            <option key={b.block_code} value={b.block_code}>
                                                {b.block_mun_name}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Ward */}
                                <div>
                                    <label className="label">Ward Number <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("ward")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {ownerWardList.map((w) => (
                                            <option key={w.code} value={w.code}>
                                                {w.name}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Police Station */}
                                <div>
                                    <label className="label">Select Police Station <span className="text-red-600">*</span></label>
                                    <select {...registerOwner("policeStation")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                                        <option value="">Select</option>

                                        {ownerPoliceStationList.map((ps) => (
                                            <option key={ps.police_station_code} value={ps.police_station_code}>
                                                {ps.name_of_police_station}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                <div>
                                    <label className="label">Pin Code <span className="text-red-600">*</span></label>
                                    <input {...registerOwner("pincode")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                </div>
                            </div>

                            <div className="flex gap-3 p-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setSelectedOwner(null);
                                    }}
                                    className="bg-[#2A628C] text-white px-4 py-2 rounded"
                                >
                                    Back To List
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#2A628C] text-white px-4 py-2 rounded"
                                >
                                    {formMode === "add" ? "Save" : "Update"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* ============================================================
         TAB 2 → UPLOAD DOCUMENTS
      ============================================================ */}
            {activeTab === 2 && (
                <div className="px-4 pb-10">

                    <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                        UPLOAD SUPPORTING DOCUMENTS
                    </div>

                    <div className="divide-y bg-white border">

                        {documents.map((doc, index) => (
                            <div
                                key={index}
                                className="w-full px-4 py-3 flex items-center justify-between gap-4"
                            >
                                {/* Left Section */}
                                <label className="w-1/2 flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={!!checkedDocs[doc]}
                                        onChange={() => toggleCheck(doc)}
                                    />
                                    <span>{doc}</span>
                                </label>

                                {/* Right Section */}
                                <div className="flex-1 flex justify-end">
                                    {checkedDocs[doc] && (
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;

                                                setUploadedFiles(prev => ({
                                                    ...prev,
                                                    [doc]: file
                                                }));
                                            }}
                                            className="w-full max-w-md text-xs border rounded px-2 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2A628C] file:text-white hover:file:bg-black"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>

                    <div className="flex justify-between mt-6">

                        <button
                            onClick={() => setActiveTab(1)}
                            className="bg-[#2A628C] text-white px-4 py-2 rounded"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleDocumentSubmit}
                            className="bg-[#2A628C] text-white px-6 py-2 rounded"
                        >
                            Save & Continue
                        </button>

                    </div>

                </div>
            )}

            {/* ============================================================
         TAB 3 → PREVIEW APPLICATION (Placeholder)
      ============================================================ */}
            {activeTab === 3 && (
                <div className="px-4 pb-10 space-y-6">

                    {/* REGISTRATION DATA */}
                    <div className="border bg-white">
                        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                            REGISTRATION DATA
                        </div>

                        <div className="p-4">
                            <PreviewTable rows={registrationRows} />
                        </div>
                    </div>


                    {/* DOCUMENT TABLE */}
                    <div className="border bg-white">
                        <div className="bg-gray-600 text-white px-4 py-2 font-semibold text-sm text-center">
                            Documents Uploaded
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border text-sm">
                                <tbody>

                                    {documentRows.map((doc) => {

                                        const file = uploadedFiles[doc.key];

                                        return (
                                            <tr key={doc.sl}>
                                                <td className="border px-3 py-2 w-16 text-center">
                                                    {doc.sl}
                                                </td>

                                                <td className="border px-3 py-2">
                                                    {doc.name}
                                                </td>

                                                <td className="border px-3 py-2 w-[200px] text-center">

                                                    {doc.sl === "7" ? (

                                                        <span className="text-xs text-gray-600">
                                                            Form-I should be uploaded by the Applicant after successful payment of fees
                                                        </span>

                                                    ) : file ? (

                                                        <button
                                                            onClick={() => {
                                                                const fileURL = URL.createObjectURL(file);
                                                                window.open(fileURL, "_blank");
                                                            }}
                                                            className="text-red-600 hover:text-black flex items-center justify-center gap-1"
                                                        >
                                                            <FaFilePdf />
                                                            View
                                                        </button>

                                                    ) : (
                                                        <span className="text-gray-400 text-xs">
                                                            Not Uploaded
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DECLARATION + ACTIONS */}
                    <div className="text-sm space-y-4">

                        {/* CASE 1: ISSUED → Only BACK
                        {applicationStatus === "I" || "RN" ? (
                            <button
                                type="button"
                                className="px-5 py-2 rounded text-white bg-[#2A628C] hover:bg-black"
                                onClick={() => navigate("/applicant-dashboard")}
                            >
                                BACK
                            </button>
                        ) : ( */}
                        {/* // CASE 3: NORMAL FLOW → DECLARATION + SUBMIT */}

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={isDeclared}
                                onChange={(e) => setIsDeclared(e.target.checked)}
                            />

                            <span>
                                I hereby declare that the information furnished above is true to the best of my knowledge and belief.
                                I understand that if any information furnished by me is found to be false or incorrect,
                                my application is liable to be rejected.
                            </span>
                        </label>

                        <button
                            disabled={!isDeclared}
                            onClick={handleFinalSubmit}
                            className={`px-5 py-2 rounded text-white ${isDeclared
                                ? "bg-[#2A628C] hover:bg-black"
                                : "bg-gray-400 cursor-not-allowed"
                                }`}
                        >
                            SUBMIT
                        </button>



                    </div>


                    {/* ================= COMMON STYLES ================= */}
                    <style>{`
                    .input {
                    width: 100%;
                    border: 1px solid #ccc;
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 14px;
                    }
                    .label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 4px;
                    }
                    .error {
                    color: red;
                    font-size: 12px;
                    }
                    `}</style>

                </div>
            )}
        </div>
    );
};

export default RenewalDetailsMTW;