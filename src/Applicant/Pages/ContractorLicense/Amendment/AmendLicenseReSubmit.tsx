import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { fetchContractorLicenseAmendmentFileManagedDocument } from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch } from "@/store/store";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";
import {
    parseAmendmentReSubmitRouteParams,
    resolveUpdatedFormV,
} from "@/utils/contractorLicenseRouteLinks";

function DetailRow({
    label,
    value,
    odd,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    odd?: boolean;
}) {
    return (
        <div
            className={`grid grid-cols-[42%_58%] border-b border-gray-300 ${odd ? "bg-[#f5f5f5]" : "bg-white"
                }`}
        >
            <div className="px-3 py-2 text-[12px] text-[#333] border-r border-gray-300">
                {label}
            </div>

            <div className="px-3 py-2 text-[12px] text-[#333] whitespace-pre-wrap">
                {value}
            </div>
        </div>
    );
}

function DarkBanner({ title }: { title: string }) {
    return (
        <div className="bg-[#2f4350] text-white text-[12px] font-bold text-center py-2 border-y border-gray-300">
            {title}
        </div>
    );
}

// EditLink component
function EditLink({ to }: { to: string }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1 text-[#337ab7] hover:underline"
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
            >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>

            <span className="text-sm font-semibold">Edit</span>
        </Link>
    );
}

/** An upload already stored against the amendment draft. */
type StoredDoc = {
    fid: number;
    filename: string | null;
    uri: string | null;
} | null;

function PdfUpload({
    label,
    file,
    onChange,
    stored,
    onViewStored,
}: {
    label: string;
    file: File | null;
    onChange: (file: File | null) => void;
    stored?: StoredDoc;
    onViewStored?: (fid: number) => void;
}) {
    return (
        <div>
            <span className="mb-1 block text-sm font-medium text-gray-800">
                {label}
            </span>

            <div className="rounded-md border border-dashed border-[#1D5A89]/55 bg-[#f8fbfd] p-3">
                {/* A rectified application keeps its earlier uploads, so show what is on
                    file — the applicant only browses again to replace it. */}
                {stored && (
                    <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-[#1D5A89]/25 bg-white px-2.5 py-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D5A89]">
                            Already uploaded
                        </span>

                        <span
                            className="min-w-0 flex-1 truncate text-xs text-gray-800"
                            title={stored.filename ?? undefined}
                        >
                            {stored.filename || `Document #${stored.fid}`}
                        </span>

                        <button
                            type="button"
                            onClick={() => onViewStored?.(stored.fid)}
                            className="shrink-0 rounded-sm border border-[#1D5A89] px-2 py-1 text-[11px] font-semibold text-[#1D5A89] hover:bg-[#1D5A89] hover:text-white"
                        >
                            View
                        </button>
                    </div>
                )}

                <div className="relative inline-flex overflow-hidden rounded-md border-2 border-[#1D5A89] bg-[#1D5A89]">
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="absolute inset-0 w-full cursor-pointer opacity-0"
                        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                    />

                    <span className="pointer-events-none px-3 py-2 text-xs font-semibold text-white">
                        {stored ? "Replace File" : "Browse File"}
                    </span>
                </div>

                <p className="mt-2 text-xs text-gray-700">
                    {file?.name ||
                        (stored
                            ? "No new file selected — the uploaded document above will be kept."
                            : "No file selected")}
                </p>
            </div>
        </div>
    );
}

function AmendmentLicenseReSubmit() {

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [searchParams] = useSearchParams();

    const [workOrderFile, setWorkOrderFile] = useState<File | null>(null);
    const [formVFile, setFormVFile] = useState<File | null>(null);
    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [otherDocFile, setOtherDocFile] = useState<File | null>(null);
    const [declared, setDeclared] = useState(false);

    const [details, setDetails] = useState<any>(null);
    const [ctxData, setCtxData] = useState<any>(null);

    // Add saving state
    const [saving, setSaving] = useState(false);



    useEffect(() => {
        const loadDetails = async () => {
            try {
                const sessionCtx = JSON.parse(
                    sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX") || "{}"
                );

                // The link carries the row that was clicked, so it wins over whatever the
                // session still holds from an earlier row.
                const routeParams = parseAmendmentReSubmitRouteParams(searchParams);

                const formVSerialNo =
                    routeParams?.formVSerialNo ?? sessionCtx?.formVSerialNo;

                // An amendment of an older licence has no newer Form-V revision — it amends
                // against its own serial.
                const updatedFormV = resolveUpdatedFormV(
                    routeParams?.updatedFormV ?? sessionCtx?.updatedFormV,
                    formVSerialNo
                );

                const amendmentDraftId =
                    routeParams?.amendmentId ??
                    sessionCtx?.amendmentDraftId ??
                    sessionCtx?.renewalApplicationId;

                if (!formVSerialNo || !updatedFormV || !amendmentDraftId) {
                    toast.error("Required amendment context missing.");
                    return;
                }

                const updatedCtx = {
                    ...sessionCtx,
                    formVSerialNo,
                    updatedFormV,
                    amendmentDraftId,
                    // Section-edit pages read either key for the same amendment row.
                    renewalApplicationId: amendmentDraftId,
                };

                sessionStorage.setItem(
                    "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
                    JSON.stringify(updatedCtx)
                );

                setCtxData(updatedCtx);

                const res = await fetch(
                    `${API_BASE}contractor-license/amendment/details-new?formVNo=${formVSerialNo}&updatedFormVNo=${updatedFormV}&amendId=${amendmentDraftId}`,
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

                setDetails(json.data);
            } catch (err) {
                toast.error("Unable to load amendment details");
            }
        };

        loadDetails();
    }, [searchParams]);

    const amendmentDraft = details?.amendmentDraft;
    const licenseData = details?.LicenseData;
    const clraRegData = details?.clraRegData;
    const contractorInfoData = details?.contractorInfoData;
    const context = details?.context;
    const peMaxLabour = Number(
        contractorInfoData?.contractor_max_no_of_labours_on_any_day ?? 0
    );
    const draftMaxLabour = Number(amendmentDraft?.max_of_contract_labour ?? 0);
    const labourExceedsFormV = peMaxLabour > 0 && draftMaxLabour > peMaxLabour;

    // Documents carried over from the earlier submit of this amendment.
    const storedWorkOrder: StoredDoc = details?.documents?.workOrder ?? null;
    const storedOtherDoc: StoredDoc = details?.documents?.other ?? null;

    const handleViewStoredDoc = async (fid: number) => {
        try {
            const { blobUrl } = await dispatch(
                fetchContractorLicenseAmendmentFileManagedDocument({ fid: String(fid) })
            ).unwrap();

            window.open(blobUrl, "_blank");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error instanceof Error
                        ? error.message
                        : "Unable to open the document."
            );
        }
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "—";

        return new Date(value).toLocaleDateString("en-GB");
    };

    const valueOrDash = (value: any) => {
        return value === null ||
            value === undefined ||
            value === ""
            ? "—"
            : String(value);
    };


    // Build query string
    const sectionQueryString = (() => {
        if (!ctxData) return "";

        const q = new URLSearchParams();

        if (ctxData?.formVSerialNo) {
            const encrypted = encryptionDecryptionFun(
                "encrypt",
                String(ctxData.formVSerialNo)
            );

            if (encrypted) {
                q.set("formVSerialNo", encrypted);
            }
        }

        if (ctxData?.updatedFormV) {
            const encrypted = encryptionDecryptionFun(
                "encrypt",
                String(ctxData.updatedFormV)
            );

            if (encrypted) {
                q.set("updatedFormV", encrypted);
            }
        }

        if (ctxData?.amendmentDraftId) {
            const encrypted = encryptionDecryptionFun(
                "encrypt",
                String(ctxData.amendmentDraftId)
            );

            if (encrypted) {
                q.set("amendmentId", encrypted);
            }
        }

        const query = q.toString();
        return query ? `?${query}` : "";
    })();

    // Create section paths
    const contractorPath =
        `/contractor-license/amendment/apply/contractor${sectionQueryString}`;

    const worksitePath =
        `/contractor-license/amendment/apply/worksite${sectionQueryString}`;

    const particularInfoPath =
        `/contractor-license/amendment/particular-info${sectionQueryString}`;

    const view = {
        section1: [],
        section2: [],
        section3: [],
        section4BeforeWages: [],
        wageRows: [],
        leaveRows: [],
        documents: [],
        wagesBannerTitle: "Wages Details",
        leaveBannerTitle: "Leave Details",
    };

    // ==================
    // Submit handler
    // ==================
    const handleFinalSubmit = async () => {
        try {
            if (!declared) {
                toast.error("Please accept the declaration.");
                return;
            }

            if (!details?.amendmentDraft?.id) {
                toast.error("Amendment draft not found.");
                return;
            }

            if (labourExceedsFormV) {
                toast.error(
                    `Max Contract Labour on any day cannot be greater than ${peMaxLabour} as mentioned in Form-V.`
                );
                return;
            }

            setSaving(true);

            const formData = new FormData();

            formData.append(
                "amendId",
                String(details.amendmentDraft.id)
            );

            formData.append(
                "formVSerialNo",
                String(licenseData?.serial_no_from_v ?? "")
            );

            formData.append("selfDeclaration", declared ? "Y" : "N");

            formData.append("comment", "");

            if (workOrderFile) {
                formData.append("workOrder", workOrderFile);
            }

            if (otherDocFile) {
                formData.append("otherDocument", otherDocFile);
            }

            // Backend supports these, but UI currently doesn't
            // if (formVFile) {
            //   formData.append("formV", formVFile);
            // }

            // if (tradeLicenseFile) {
            //   formData.append("tradeLicense", tradeLicenseFile);
            // }

            const response = await fetch(
                `${API_BASE}contractor-license/amendment/final-submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok || !result?.success) {
                toast.error(
                    result?.message ||
                    "Failed to submit amendment application"
                );
                return;
            }

            toast.success(
                result?.message ||
                "Amendment application submitted successfully"
            );

            // sessionStorage.removeItem(
            //   "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX"
            // );

            navigate("/license-renewal-amendment-list");
        } catch (error) {
            toast.error("Unable to submit amendment application");
        } finally {
            setSaving(false);
        }
    };

    if (!details) {
        return (
            <div className="p-6 text-sm text-gray-600">
                Loading...
            </div>
        );
    }

    return (
        <div className="w-full bg-[#ececec] px-2 py-4 font-sans md:px-6">
            <div className="mx-auto w-full max-w-[1200px]">

                {/* Header Section */}

                <div className="mx-auto w-full max-w-[1200px] border border-gray-300 bg-white shadow-sm">
                    <h1 className="border-b border-gray-300 bg-white px-3 py-3 text-center text-sm font-bold uppercase leading-snug text-[#0b2c48] md:text-base">
                        APPLICATION FOR AMMENDMENT OF LICENSE UNDER THE CONTRACT LABOUR (R&A) ACT, 1970
                    </h1>

                    <div className="border-b border-gray-300 bg-[#337ab7] px-4 py-4 text-center text-sm text-white md:text-base">
                        <div>
                            <span>Form-V/Reference Number: </span>
                            <span className="font-semibold text-[#d3e1ec]">{`00${valueOrDash(licenseData?.serial_no_from_v)}`}</span>
                        </div>

                        <div className="mt-1">
                            <span>License Number: </span>
                            <span className="font-semibold text-[#d3e1ec]">
                                {valueOrDash(licenseData?.contractor_license_number)}
                            </span>
                        </div>

                        <div className="mt-1">
                            <span>Issue Date: </span>
                            <span className="font-semibold text-[#d3e1ec]">{formatDate(contractorInfoData.est_date_of_work_of_each_labour_from_date)}</span>

                            <span className="mx-2">&nbsp;</span>

                            <span>Valid Upto: </span>
                            <span className="font-semibold text-[#d3e1ec]">{formatDate(contractorInfoData.est_date_of_work_of_each_labour_to_date)}</span>
                        </div>
                    </div>

                    {/* Section 1 */}

                    <div className="con-dtls-view-main">
                        <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
                            <span>1. Information Given by Principal Employeer.</span>
                        </h3>

                        <div className="border border-t-0 border-gray-300">
                            <DetailRow
                                label="Name & address of the establishment of Principal Employer"
                                value={
                                    <>
                                        {clraRegData.e_name}
                                        <br />
                                        {clraRegData.loc_e_name}
                                    </>}
                            />

                            <DetailRow
                                odd
                                label="Type of Business, trade, industry, manufacture or occupation which is carried on in the establishment(P.E)"
                                value="—"
                            />

                            <DetailRow
                                label="Number and date of Certificate"
                                value={
                                    <>
                                        Registration Number: — {clraRegData.registration_number}
                                        <br />
                                        Date of Certificate: — {formatDate(clraRegData.registration_date)}
                                        <br />
                                        Under The CLRA Act
                                    </>
                                }
                            />

                            <DetailRow
                                odd
                                label="Name & Address of the Principal Employer"
                                value={
                                    <>
                                        {clraRegData.full_name_principal_emp}
                                        <br />
                                        {clraRegData.address_principal_emp}
                                    </>}
                            />

                            <DetailRow
                                label="Name & Address of Contractor"
                                value={
                                    <>
                                        {contractorInfoData.name_of_contractor}
                                        <br />
                                        {contractorInfoData.address_of_contractor}
                                    </>}
                            />

                            <DetailRow
                                odd
                                label="Maximum number of Contract Labour proposed to be employed in the establishment on any date"
                                value={contractorInfoData.contractor_max_no_of_labours_on_any_day}
                            />

                            <DetailRow
                                label="Nature of work in which Contract Labour is employed or is to be employed in the establishment"
                                value={contractorInfoData.other_nature_work}
                            />

                            <DetailRow
                                odd
                                label="Duration of the proposed contract work (give particulars of proposed date of ending)"
                                value={contractorInfoData.est_date_of_work_of_each_labour_total_months}
                            />
                        </div>
                    </div>

                    {/* Section 2 */}

                    <div className="con-dtls-view-main">
                        <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
                            <span>
                                2. Name & address of the contractor (Official Information)
                            </span>

                            <EditLink to={contractorPath} />
                        </h3>

                        <div className="border border-t-0 border-gray-300">
                            <DetailRow
                                label="Name"
                                value={valueOrDash(amendmentDraft?.name_of_contractor)}
                            />

                            <DetailRow
                                odd
                                label="Address of Contractor"
                                value={valueOrDash(amendmentDraft?.address_of_contractor)}
                            />

                            <DetailRow
                                label="Father name of contractor"
                                value={valueOrDash(amendmentDraft?.father_contarctor_name)}
                            />

                            <DetailRow
                                odd
                                label="Category of Contractor"
                                value={
                                    amendmentDraft?.category_of_contractor === 1
                                        ? "Company"
                                        : "Individual"
                                }
                            />

                            <DetailRow
                                label="Date of Birth / Age"
                                value={`${formatDate(amendmentDraft?.dob_contractor)} / ${valueOrDash(
                                    amendmentDraft?.age_contractor
                                )}`}
                            />
                        </div>
                    </div>

                    {/* Section 3 */}

                    <div className="con-dtls-view-main">
                        <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
                            <span>3. Contractor Labour and Worksite Details</span>

                            <EditLink to={worksitePath} />
                        </h3>

                        <div className="border border-t-0 border-gray-300">
                            <DetailRow
                                label="Work site Address"
                                value={valueOrDash(amendmentDraft?.worksite_address_line)}
                            />

                            <DetailRow
                                odd
                                label="Maximum number of Contract Labour proposed to be employed in the establishment on any date"
                                value={valueOrDash(amendmentDraft?.max_of_contract_labour)}
                            />
                        </div>
                    </div>

                    {/* Section 4 */}

                    <div className="con-dtls-view-main">
                        <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
                            <span>4. Particular of Contract Labour</span>

                            <EditLink to={particularInfoPath} />
                        </h3>

                        <div className="border border-t-0 border-gray-300">
                            <DetailRow
                                label="Name & address of the agent or Manager of Contractor at the work site"
                                value={
                                    <>
                                        {valueOrDash(amendmentDraft?.name_of_agent)}
                                        <br />
                                        {valueOrDash(amendmentDraft?.address_of_manager)}
                                    </>
                                }
                            />

                            <DetailRow
                                odd
                                label="Category/designation/nomenclature of the contractor labour, namely, fitter,welder,carpenter,mazdoor etc"
                                value={valueOrDash(amendmentDraft?.category_designation)}
                            />

                            <DarkBanner
                                title="Rate of Wages,DA and other cash benefits paid/to be paid to each category of contract labour i.e.(a)Unskilled (b)Semi Skilled (c)Skilled (d)Highly Skilled etc.)"
                            />

                            <DetailRow
                                label="(a)Rate of Wages,DA and other cash benefits paid / to be paid to Unskilled contract labour"
                                value={valueOrDash(amendmentDraft?.unskilled_rate_wages)}
                            />

                            <DetailRow
                                odd
                                label="(b)Rate of Wages,DA and other cash benefits paid / to be paid to Semi-skilled contract labour"
                                value={valueOrDash(amendmentDraft?.semiskilled_rate_wages)}
                            />

                            <DetailRow
                                label="(c)Rate of Wages,DA and other cash benefits paid / to be paid to Skilled contract labour"
                                value={valueOrDash(amendmentDraft?.skilled_rate_wages)}
                            />

                            <DetailRow
                                odd
                                label="(d)Rate of Wages,DA and other cash benefits paid / to be paid to Highly-skilled contract labour"
                                value={valueOrDash(amendmentDraft?.highlyskilled_rate_wages)}
                            />

                            <DetailRow
                                label="(e)Hours of Work, Spread over time, Overtime and Overtime Wages"
                                value={
                                    <>
                                        Hours of Work: {valueOrDash(amendmentDraft?.hours_work)} hr(s)
                                        <br />
                                        Spread over time: {valueOrDash(amendmentDraft?.spred_over)} hr(s)
                                        <br />
                                        Overtime: {valueOrDash(amendmentDraft?.overtime)} hr(s)
                                        <br />
                                        Overtime Wages: ₹ {valueOrDash(amendmentDraft?.overtime_wages)}
                                    </>
                                }
                            />


                            <DetailRow
                                odd
                                label="(b)Rate of Wages,DA and other cash benefits paid / to be paid to Semi-skilled contract labour"
                                value={valueOrDash(amendmentDraft?.semiskilled_rate_wages)}
                            />

                            <DetailRow
                                label="(c)Rate of Wages,DA and other cash benefits paid / to be paid to Skilled contract labour"
                                value={valueOrDash(amendmentDraft?.skilled_rate_wages)}
                            />

                            <DetailRow
                                odd
                                label="(d)Rate of Wages,DA and other cash benefits paid / to be paid to Highly-skilled contract labour"
                                value={valueOrDash(amendmentDraft?.highlyskilled_rate_wages)}
                            />

                            <DetailRow
                                label="(e)Hours of Work, Spread over time, Overtime and Overtime Wages"
                                value={
                                    <>
                                        Hours of Work: {valueOrDash(amendmentDraft?.hours_work)} hr(s)
                                        <br />
                                        Spread over time: {valueOrDash(amendmentDraft?.spred_over)} hr(s)
                                        <br />
                                        Overtime: {valueOrDash(amendmentDraft?.overtime)} hr(s)
                                        <br />
                                        Overtime Wages: ₹ {valueOrDash(amendmentDraft?.overtime_wages)}
                                    </>
                                }
                            />

                            {/* Leave Section */}
                            <DetailRow
                                label="(a)Number of Annual leave"
                                value={valueOrDash(amendmentDraft?.annual_leave_no)}
                            />

                            <DetailRow
                                odd
                                label="(b)Number of Casual leave"
                                value={valueOrDash(amendmentDraft?.casual_leave_no)}
                            />

                            <DetailRow
                                label="(c)Number of Earned leave"
                                value={valueOrDash(amendmentDraft?.earned_leave_no)}
                            />

                            <DetailRow
                                odd
                                label="(d)Number of Sick leave"
                                value={valueOrDash(amendmentDraft?.sick_leave_no)}
                            />

                            <DetailRow
                                label="(e)Number of Maternity leave"
                                value={valueOrDash(amendmentDraft?.maternity_leave_no)}
                            />

                            <DetailRow
                                odd
                                label="(f)Number of Other leave"
                                value={valueOrDash(amendmentDraft?.other_leave_no)}
                            />

                            {/* Weekly Holiday */}
                            <DetailRow
                                label="Whether weekly holiday(s) observed and on which day"
                                value={
                                    amendmentDraft?.weekly_holiday
                                        ? `${String(amendmentDraft.no_holiday || "")
                                            .split(",")
                                            .filter(Boolean).length} day(s)`
                                        : "—"
                                }
                            />

                            <DetailRow
                                odd
                                label="Whether weekly holiday(s) so observed was paid holiday(s)"
                                value={valueOrDash(amendmentDraft?.holiday_wages)}
                            />

                            {/* Compliance History */}

                            <DetailRow
                                label="Whether the contractor was convicted of any offence within the preceding five years. If so, give details"
                                value={
                                    amendmentDraft?.contractor_convicted === 1
                                        ? valueOrDash(amendmentDraft?.details_contractor_convicted) ? valueOrDash(amendmentDraft?.details_contractor_convicted) : "Yes"
                                        : "No"
                                }
                            />

                            <DetailRow
                                odd
                                label="Whether there was any order against the contractor or revoking or suspending license or forfeiting security deposit in respect of an earlier contract. If so, the date of such order"
                                value={
                                    amendmentDraft?.contractor_revoking === 1
                                        ? valueOrDash(amendmentDraft?.details_contractor_revoking) ? valueOrDash(amendmentDraft?.details_contractor_revoking) : "Yes"
                                        : "No"
                                }
                            />

                            <DetailRow
                                label="Whether the contractor has worked in any other establishment within the past five years. If so, give details of the principal employer, establishment and nature of work"
                                value={
                                    amendmentDraft?.contractor_previous_employer === 1
                                        ? valueOrDash(amendmentDraft?.details_previous_employer) ? valueOrDash(amendmentDraft?.details_previous_employer) : "Yes"
                                        : "No"
                                }
                            />

                            {/* Final Benefit Section */}
                            <DetailRow
                                odd
                                label="Special benefits provided, if any"
                                value={valueOrDash(amendmentDraft?.special_benifites)}
                            />

                            <DetailRow
                                label="Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952"
                                value={valueOrDash(amendmentDraft?.miscellaneous_provisions)}
                            />

                            <DetailRow
                                odd
                                label="Contribution made under the Employees State Insurance Act,1948"
                                value={valueOrDash(amendmentDraft?.state_insurance)}
                            />

                            {/* Upload Section */}

                            <DarkBanner title="Uploaded Documents" />
                            <div className="border border-t-0 border-gray-300 bg-white px-3 py-3 md:px-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <PdfUpload
                                        label="Work-order Document"
                                        file={workOrderFile}
                                        onChange={setWorkOrderFile}
                                        stored={storedWorkOrder}
                                        onViewStored={handleViewStoredDoc}
                                    />

                                    {/* <PdfUpload
                    label="Form V"
                    file={formVFile}
                    onChange={setFormVFile}
                  />

                  <PdfUpload
                    label="Trade License"
                    file={tradeLicenseFile}
                    onChange={setTradeLicenseFile}
                  /> */}

                                    <PdfUpload
                                        label="Other Document"
                                        file={otherDocFile}
                                        onChange={setOtherDocFile}
                                        stored={storedOtherDoc}
                                        onViewStored={handleViewStoredDoc}
                                    />

                                </div>

                                <label className="mt-4 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={declared}
                                        onChange={(e) => setDeclared(e.target.checked)}
                                        className="mt-0"
                                    />

                                    <span className="text-sm font-bold text-gray-900 leading-none">
                                        Declaration: I hereby declare that the details given above are correct to
                                        the best of my knowledge and belief.
                                    </span>
                                </label>

                                {labourExceedsFormV ? (
                                    <p className="mt-3 text-xs text-red-700">
                                        Max Contract Labour on any day cannot be greater than {peMaxLabour} as mentioned
                                        in Form-V. Open Worksite and Contract Labour Details and correct it before save.
                                    </p>
                                ) : null}

                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="rounded-sm border border-gray-400 bg-[#f5f5f5] px-8 py-2 text-sm font-semibold text-gray-800"
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFinalSubmit}
                                        disabled={saving || !declared || labourExceedsFormV}
                                        className="rounded-sm border border-[#46b8da] bg-[#1D5A89] px-8 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        {saving ? "Submitting..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AmendmentLicenseReSubmit;