import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";

// Backend field → UI checkbox key mapping
const fieldKeyMap: Record<string, string> = {
    e_name: "establishment_name",
    e_location: "location_establishment_admin",
    location: "location_establishment_address",
    e_postal_address: "postal_address",
    pe_details: "principal_employer",
    man_details: "manager_details",
    e_nature_of_work: "nature_of_work",
    max_num_wrkmen: "max_workmen_direct",
    e_num_of_workmen_per_or_reg: "permanent_workmen",
    e_num_of_workmen_temp_or_reg: "temporary_workmen",
    workmen_if_same_similar_kind_of_work: "similar_work",
    con_lab_job_desc: "job_description",
    con_lab_wage_rate_other_benefits: "wage_rates",
    con_lab_cat_desig_nom: "job_category",
    e_settlement_award_judgement_min_wage: "settlement_award",
    e_any_day_max_num_of_workmen: "max_contract_labour",
    add_trade_union: "trade_union_info",
    add_contractor: "contractor_info",
};

// UI checkbox key → Backend field mapping (reverse mapping)
const reverseFieldKeyMap: Record<string, string> = Object.fromEntries(
    Object.entries(fieldKeyMap).map(([backendKey, uiKey]) => [uiKey, backendKey])
);

const AmmendmentCLRAPE: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as any;
    let applicationID = locationState?.applicationID;
    let applicantSubdivisionCode = locationState?.applicantSubdivisionCode;
    let applicantBlockCode = locationState?.applicantBlockCode;

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const hasFetched = useRef(false);

    /* ✅ Fallback if page refreshed OR came from Reset */
    if (!applicationID) {
        const stored = sessionStorage.getItem("CLRA_AMENDMENT_CTX");
        if (stored) {
            const parsed = JSON.parse(stored);
            applicationID = parsed.applicationID;
            applicantSubdivisionCode = parsed.applicantSubdivisionCode;
            applicantBlockCode = parsed.applicantBlockCode;
        }
    }

    /* ✅ Persist Amendment Context (survives refresh/reset/navigation) */
    useEffect(() => {
        if (!applicationID) return;

        sessionStorage.setItem(
            "CLRA_AMENDMENT_CTX",
            JSON.stringify({
                applicationID,
                applicantSubdivisionCode,
                applicantBlockCode,
            })
        );
    }, [applicationID, applicantSubdivisionCode, applicantBlockCode]);

    /** From previous step (AmendmentRegCertificateCLRA): API returns referenceId for final-preview */
    const referenceId = (location.state as { referenceId?: string } | null)?.referenceId;
    const effectiveApplicationId = applicationID ?? referenceId;

    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const toggleCheck = (name: string) => {
        setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const [checkedFinal, setCheckedFinal] = useState<boolean>(false);

    const fields = [
        {
            key: "establishment_name",
            label: "1. Name of the Establishment",
        },
        {
            key: "location_establishment_admin",
            label:
                "1a. Location of the Establishment (District, Subdivision, Block/Municipality/Corporation/SEZ/Notified Area) NEED ALC's APPROVAL",
        },
        {
            key: "location_establishment_address",
            label:
                "1b. Location of the Establishment (Address Line, Gram Panchayat / Ward / Sector / Notified Area, Police Station, PIN Code)",
        },
        {
            key: "postal_address",
            label: "2. Postal Address of the Establishment",
        },
        {
            key: "principal_employer",
            label: "3. Name and Address of Principal Employer",
        },
        {
            key: "manager_details",
            label:
                "4. Name and Address of Manager or person responsible",
        },
        {
            key: "nature_of_work",
            label:
                "5. Nature of Work Carried on in the Establishment",
        },
        {
            key: "max_workmen_direct",
            label:
                "5a. Maximum Number of Workmen Employed Directly on any day in the Establishment",
        },
        {
            key: "permanent_workmen",
            label:
                "5b. Number of Workmen Engaged as Permanent/Regular Workmen",
        },
        {
            key: "temporary_workmen",
            label:
                "5c. Number of Workmen Engaged as Temporary/Casual Workmen",
        },
        {
            key: "similar_work",
            label:
                "5d. Whether the Workmen employed/intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer (if yes, please give here information as detailed below)",
        },
        {
            key: "job_description",
            label:
                "5d.i A complete job description of the contractor labour",
        },
        {
            key: "wage_rates",
            label:
                "5d.ii Wage rates and other cash benefits paid/to be paid",
        },
        {
            key: "job_category",
            label:
                "5d.iii Category/designation/nomenclature of the job",
        },
        {
            key: "settlement_award",
            label:
                "5d.iv Settlement or award or judgement or minimum wages (if any applicable in the establishment)",
        },
        {
            key: "max_contract_labour",
            label:
                "6. Maximum number of contract labour to be employed on any day through each contractor",
        },
        {
            key: "trade_union_info",
            label: "Add/Modify Trade Union Information",
        },
        {
            key: "contractor_info",
            label: "Add/Modify Contractor Information",
        },
    ];

    // For fetching the existing amendment fields and pre-checking the checkboxes
    useEffect(() => {
        if (hasFetched.current) return; // 🚀 prevents second call
        hasFetched.current = true;

        const fetchAmendmentFields = async () => {
            try {
                if (!id) return;

                const authData = localStorage.getItem("lc_portal_auth");
                if (!authData) return;

                const token = JSON.parse(authData)?.token;

                const response = await fetch(
                    `${API_BASE}applicant-module/amendment/${encodeURIComponent(id)}/fields`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) return;

                const result: string[] = await response.json();

                const preChecked: Record<string, boolean> = {};

                result.forEach((backendKey) => {
                    const uiKey = fieldKeyMap[backendKey];
                    if (uiKey) preChecked[uiKey] = true;
                });

                setChecked(preChecked);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAmendmentFields();
    }, [id]);

    // Handle final submission of selected fields for amendment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const regNo = localStorage.getItem("NEW_CLRA_AMENDMENT_REG_NO") || "";
        if (!regNo) {
            toast.error("Registration number not found. Please start the amendment process again.");
            return;
        }
        const selectedUIFields = Object.keys(checked).filter((key) => checked[key]);

        if (selectedUIFields.length === 0) {
            setCheckedFinal(true);
            return;
        }
        setCheckedFinal(false);

        const amendedFields = selectedUIFields
            .map((uiKey) => reverseFieldKeyMap[uiKey])
            .filter(Boolean);

        sessionStorage.setItem(
            "CLRA_AMENDMENT_FIELDS",
            JSON.stringify({ amendedFields })
        );

        if (effectiveApplicationId) {
            try {
                const authData = localStorage.getItem("lc_portal_auth");
                if (!authData) {
                    toast.error("Authentication error. Please login again.");
                    return;
                }
                const token = JSON.parse(authData)?.token;
                const payload = {
                    application_id: effectiveApplicationId,
                    applicant_subdivision_code: applicantSubdivisionCode,
                    applicant_block_code: applicantBlockCode,
                    amended_fields: amendedFields,
                    regNo: regNo
                };
                const response = await fetch(
                    `${API_BASE}applicant-module/applications/amendment/clra-registration/step-two`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
                const result = await response.json();
                if (!response.ok || result.error) {
                    toast.error(result.message || "Something went wrong");
                    return;
                }

                const encryptID = result.encryptID;

                sessionStorage.setItem(
                    "CLRA_AMENDMENT_ENCRYPT_ID",
                    JSON.stringify({
                        encryptID: encryptID
                    })
                );

                toast.success(result.message);

                navigate(`/clra-reg-amendment/view-clra-application?id=${effectiveApplicationId}`);
            } catch (err) {
                console.error(err);
                toast.error("Server error. Please try again.");
            }
        } else {
            if (referenceId) {
                navigate(`/clra-reg-amendment/view-clra-application?id=${referenceId}`);
            } else {
                navigate("/clra-reg-amendment/view-clra-application");
            }
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen mb-20">
            <h1 className="text-lg bg-white font-semibold p-4 mb-4">
                Amendment of CLRA registration certificate for principal employers
            </h1>

            <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
                Fields For Amendment in Application of Registration under CLRA, Act 1970
            </div>

            <form onSubmit={handleSubmit} className="bg-white pb-6">
                <div className="p-4 text-sm">
                    <span className="font-semibold">
                        Note : Tick the fields which is to be amended by the Principal Employer for Registration Number : issued on Date: 01st Jan, 1970
                    </span>
                </div>

                <div className="px-6 space-y-4">
                    {fields.map((field) => (
                        <label
                            key={field.key}
                            className="flex items-start gap-3 text-sm cursor-pointer leading-relaxed"
                        >
                            <input
                                type="checkbox"
                                checked={!!checked[field.key]}
                                onChange={() => toggleCheck(field.key)}
                                className="mt-1 h-4 w-4 border-gray-400"
                            />
                            <span>{field.label}</span>
                        </label>
                    ))}

                    {checkedFinal && (
                        <p className="text-red-600 text-sm mt-2">
                            Please select at least one field to amend.
                        </p>
                    )}
                </div>
                <div className="flex justify-end mt-6 pr-6">
                    <button
                        type="submit"
                        className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black"
                    >
                        APPLY
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AmmendmentCLRAPE;
