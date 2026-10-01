import React, { useEffect, useRef, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaDownload, FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimes, FaSpinner, FaUpload } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

/* =======================
   TYPES
======================= */
interface FormRow {
    sl: number;
    name: string;
    actionLabel: string;
    path: string;
    hasDownload: boolean;
    isMandatory?: boolean;
    hasData?: boolean;
}

interface DocRow {
    documentName: string;
    isUploaded: boolean;
    isVerified: boolean;
    canUpload: boolean;
    actionLabel: string;
    lastFileName: string;
}

/* =======================
   DATA
======================= */
const formRows: FormRow[] = [
    {
        sl: 1,
        name: "Application Details (Generated FORM-H)",
        actionLabel: "Edit",
        path: "/trade-union/trade_union",
        hasDownload: true,
        isMandatory: true,
        hasData: true,
    },
    {
        sl: 2,
        name: "Statement of Liabilities and Assets (PART--B)",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/schedule3/liabilities-and-assets",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
    {
        sl: 3,
        name: "List of Securities",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/annual-list-securities",
        hasDownload: false,
        isMandatory: false,
        hasData: false,
    },
    {
        sl: 4,
        name: "General Fund Account",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/general-fund-account",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
    {
        sl: 5,
        name: "Political Fund Account",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/political-fund-account",
        hasDownload: false,
        isMandatory: false,
        hasData: false,
    },
    {
        sl: 6,
        name: "Officers Relinquishing Office",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/annual-retern-officers-reliquising",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
    {
        sl: 7,
        name: "Officers Appointed",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/annual-retern-officers-appointed",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
    {
        sl: 8,
        name: "Elected Member",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/federation-election",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
    {
        sl: 9,
        name: "Consent of Officers",
        actionLabel: "Click To Provide Details",
        path: "/trade-union/annual-return-consent-officers",
        hasDownload: false,
        isMandatory: true,
        hasData: false,
    },
];



/* =======================
   COMPONENT
======================= */
const RectifyData: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const regNo = location.state?.regNo;
    const returnYear = location.state?.returnYear;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [auditorTableData, setAuditorTableData] = useState<DocRow[]>([]);
    const [formTableData, setFormTableData] = useState<FormRow[]>(formRows);
    const [downloadingSl, setDownloadingSl] = useState<number | string | null>(null);

    const [showAuditorModal, setShowAuditorModal] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error" | null; message: string }>({
        type: null,
        message: "",
    });

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => {
            if (notificationRef.current) {
                notificationRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }, 50);
        setTimeout(() => {
            setNotification({ type: null, message: "" });
        }, 10000);
    };

    const encryptedRegId = regNo ? (encryptionDecryptionFun("encrypt", String(regNo)) ?? '') : '';
    const encryptedReturnYear = returnYear ? (encryptionDecryptionFun("encrypt", String(returnYear)) ?? '') : '';

    const safeRegId = encryptedRegId ? encodeURIComponent(encryptedRegId) : '';
    const safeReturnYear = encryptedReturnYear ? encodeURIComponent(encryptedReturnYear) : '';

    // assuming wizardId = returnYear (very common in your flow)
    // if backend gives separate wizardId, replace this
    const encryptedWizardId = encryptedReturnYear;

    const token = getAuthToken();
    const userId = getUserId();

    // Backend expects encrypted uid for these endpoints.
    const encryptedUserId = userId
        ? encryptionDecryptionFun("encrypt", String(userId)) ?? ""
        : "";

    const docRows: DocRow[] = [
        {
            documentName: "Auditors Declaration",
            isUploaded: false,
            isVerified: false,
            canUpload: false,
            actionLabel: "",
            lastFileName: "No Document Uploaded",
        },
    ];

    const downloadPdfFile = async (endpoint: string, fileName: string, stepId: number | string) => {
        if (downloadingSl !== null) return;
        try {
            if (!token) {
                showNotification("error", "Authentication error. Please login again.");
                return;
            }
            setDownloadingSl(stepId);
            const res = await axios.get(`${API_BASE}${endpoint}`, {
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    encryptedRegId,
                    encryptedWizardId,
                    encryptedUserId
                }
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Download Error (${fileName}):`, error);
            showNotification("error", `Failed to download ${fileName}`);
        } finally {
            setDownloadingSl(null);
        }
    };

    const handleDownloadFormH = () => downloadPdfFile("trade-union/annual-return/federation-form/pdf", "FORM-H.pdf", 1);
    const handleDownloadLiabAssetsForm = () => downloadPdfFile("trade-union/annual-return/schedule-iii/pdf", "Statement of Liabilities and Assets (PART--B).pdf", 2);
    const handleDownloadListOfSecuritiesForm = () => downloadPdfFile("trade-union/annual-return/list-of-securities/pdf", "List of Securities.pdf", 3);
    const handleDownloadGeneralFAccForm = () => downloadPdfFile("trade-union/annual-return/profit-loss/pdf", "General Fund Account.pdf", 4);
    const handleDownloadPoliticalFundForm = () => downloadPdfFile("trade-union/annual-return/political-fund/pdf", "Political Fund Account.pdf", 5);
    const handleDownloadRelinquishingForm = () => downloadPdfFile("trade-union/annual-return/officers-relinquishing/pdf", "Officers Relinquishing Office.pdf", 6);
    const handleDownloadOfficersApppointedForm = () => downloadPdfFile("trade-union/annual-return/officers-appointed/pdf", "Officers Appointed.pdf", 7);
    const handleDownloadElectedForm = () => downloadPdfFile("trade-union/annual-return/federation-election/pdf", "Elected Member.pdf", 8);
    const handleDownloadConsentOfficersForm = () => downloadPdfFile("trade-union/annual-return/consent-officers/pdf", "Consent of Officers.pdf", 9);
    const handleDownloadAuditorsDeclarations = () => downloadPdfFile("trade-union/annual-return/auditors-declaration/pdf", "auditors_declaration.pdf", "auditor_declaration");

    const [isUploadingAuditor, setIsUploadingAuditor] = useState<boolean>(false);

    const submitAuditorDeclaration = async (file: File) => {
        try {
            if (!token) {
                showNotification("error", "Authentication error. Please login again.");
                return;
            }
            setIsUploadingAuditor(true);
            const formData = new FormData();
            formData.append("file", file); // must match FileInterceptor('file')

            const res = await axios.post(
                `${API_BASE}trade-union/auditor-declaration/${safeRegId}/${safeReturnYear}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Upload success:", res.data);
            showNotification("success", res?.data?.message || "Auditor declaration uploaded successfully");
            setSelectedFile(null);
            getAuditorDeclarationTable();
        } catch (error) {
            console.error("Upload failed:", error);
            showNotification("error", "Failed to upload auditor declaration file");
        } finally {
            setIsUploadingAuditor(false);
        }
    };

    const getAuditorDeclarationTable = async () => {
        try {
            if (!token || !safeRegId || !safeReturnYear) {
                return;
            }

            const res = await axios.get(
                `${API_BASE}trade-union/auditor-declaration/${safeRegId}/${safeReturnYear}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Upload success:", res.data);
            setAuditorTableData([res?.data]);

        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const getWorkflowData = async () => {
        try {
            if (!token || !safeRegId || !safeReturnYear) return;
            const res = await axios.get(
                `${API_BASE}trade-union/${safeRegId}/${safeReturnYear}/workflow`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (Array.isArray(res.data) && res.data.length > 0) {
                const updatedRows = formRows.map((row) => {
                    const matchedStep = res.data.find((s: any) => s.stepNo === row.sl);
                    if (matchedStep) {
                        return {
                            ...row,
                            actionLabel: row.sl === 1 ? "Edit" : (matchedStep.hasData ? "Edit" : "Click To Provide Details"),
                            hasDownload: !!(matchedStep.hasData || matchedStep.hasPdf),
                            hasData: !!matchedStep.hasData,
                            isMandatory: matchedStep.isMandatory !== undefined ? matchedStep.isMandatory : (row.sl !== 3 && row.sl !== 5),
                        };
                    }
                    return row;
                });
                setFormTableData(updatedRows);
            }
        } catch (error) {
            console.error("Failed to fetch workflow state:", error);
        }
    };

    useEffect(() => {
        getAuditorDeclarationTable();
        getWorkflowData();
    }, []);


    /* =======================
       TABLE 1 COLUMNS
    ======================= */
    const formColumns: TableColumn<FormRow>[] = [
        {
            name: "Sl. No.",
            selector: (row) => row.sl,
            width: "80px",
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Form to be filled up</div>,
            cell: (row) => (
                <span>
                    {row.isMandatory && <span className="text-red-600">* </span>}
                    {row.name}
                </span>
            ),
            wrap: true,
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Click to Filled up Data</div>,
            cell: (row) => (
                <button
                    type="button"
                    onClick={() =>
                        navigate(row.path, {
                            state: {
                                regNo,
                                returnYear,
                            },
                        })
                    }

                    className="text-blue-600 underline cursor-pointer bg-transparent border-none p-0"
                >
                    {row.actionLabel}
                </button>
            ),
        },
        {
            name: "View File",
            cell: (row) =>
                row.hasDownload ? (
                    <button
                        disabled={downloadingSl !== null}
                        className={`border border-blue-500 text-blue-600 px-3 py-0.5 text-xs rounded-full flex items-center gap-1.5 transition-all ${
                            downloadingSl === row.sl ? "opacity-75 cursor-not-allowed bg-blue-50" : "hover:bg-blue-50 cursor-pointer"
                        }`}
                        onClick={() => {
                            if (row.sl === 1) handleDownloadFormH();
                            if (row.sl === 2) handleDownloadLiabAssetsForm();
                            if (row.sl === 3) handleDownloadListOfSecuritiesForm();
                            if (row.sl === 4) handleDownloadGeneralFAccForm();
                            if (row.sl === 5) handleDownloadPoliticalFundForm();
                            if (row.sl === 6) handleDownloadRelinquishingForm();
                            if (row.sl === 7) handleDownloadOfficersApppointedForm();
                            if (row.sl === 8) handleDownloadElectedForm();
                            if (row.sl === 9) handleDownloadConsentOfficersForm();
                        }}
                    >
                        {downloadingSl === row.sl ? (
                            <>
                                <FaSpinner className="animate-spin text-blue-600" /> Downloading...
                            </>
                        ) : (
                            <>
                                <FaDownload /> Download
                            </>
                        )}
                    </button>
                ) : (
                    <span>Provide Details</span>
                ),
        }

    ];

    /* =======================
       TABLE 2 COLUMNS
    ======================= */
    const docColumns: TableColumn<DocRow>[] = [
        {
            name: "Document(s)",
            cell: (row) => (
                <span>
                    <span className="text-red-600">*</span> {row.documentName}
                </span>
            ),
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Form to be filled up</div>,
            minWidth: "150px",
            cell: () => (
                <button className="bg-[#5bc0de] text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                    onClick={() => {
                        setShowAuditorModal(true);
                    }}>
                    <FaInfoCircle /> Auditor Rule
                </button>
            ),
        },
        {
            name: "Generate",
            cell: () => (
                <button
                    disabled={downloadingSl !== null}
                    className={`border border-blue-500 text-blue-600 px-3 py-0.5 text-xs rounded-full flex items-center gap-1.5 transition-all ${
                        downloadingSl === "auditor_declaration" ? "opacity-75 cursor-not-allowed bg-blue-50" : "hover:bg-blue-50 cursor-pointer"
                    }`}
                    onClick={() => { handleDownloadAuditorsDeclarations() }}
                >
                    {downloadingSl === "auditor_declaration" ? (
                        <>
                            <FaSpinner className="animate-spin text-blue-600" /> Downloading...
                        </>
                    ) : (
                        <>
                            <FaDownload /> Download
                        </>
                    )}
                </button>
            ),
        },
        {
            name: "Choose File",
            minWidth: "220px",
            cell: (row) => (
                row.canUpload ? (
                    <div className="flex items-center gap-2 max-w-full overflow-hidden py-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setSelectedFile(file);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-3 py-1 text-xs rounded shadow-sm flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap transition-all shrink-0"
                        >
                            <FaUpload className="w-3 h-3 text-gray-500" /> Choose File
                        </button>
                        {selectedFile ? (
                            <span
                                className="text-xs text-blue-600 font-medium truncate max-w-[130px] inline-block"
                                title={selectedFile.name}
                            >
                                {selectedFile.name}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400 italic whitespace-nowrap">No file chosen</span>
                        )}
                    </div>
                ) : (
                    <></>
                )
            ),
        },
        {
            name: "Action",
            minWidth: "245px",
            cell: (row) => (
                <button
                    disabled={isUploadingAuditor}
                    className={`text-white px-3 py-1 text-sm rounded my-1 font-medium flex items-center gap-1.5 transition-all ${
                        isUploadingAuditor
                            ? "bg-[#5bc0de]/70 cursor-not-allowed"
                            : "bg-[#5bc0de] hover:bg-[#46b8da] cursor-pointer"
                    }`}
                    onClick={() => {
                        if (!selectedFile) {
                            showNotification("error", "Please choose a file first");
                            return;
                        }
                        submitAuditorDeclaration(selectedFile);
                    }}
                >
                    {isUploadingAuditor ? (
                        <>
                            <FaSpinner className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                    ) : (
                        row.actionLabel
                    )}
                </button>
            ),
        },
        {
            name: "Last Uploaded File",
            minWidth: "180px",
            cell: (row) => {
                if (!row.isUploaded) {
                    return <span className="text-xs text-gray-500 font-medium">No Document Uploaded</span>;
                }

                return (
                    <button
                        type="button"
                        title={row.lastFileName || "View Uploaded PDF"}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer max-w-[170px] group text-left"
                        onClick={async () => {
                            try {
                                if (!token) {
                                    showNotification("error", "Authentication error. Please login again.");
                                    return;
                                }

                                const res = await axios.get(
                                    `${API_BASE}trade-union/auditor-declaration?regId=${safeRegId}&wizardId=${safeReturnYear}&userId=${encryptedUserId}`,
                                    {
                                        responseType: "blob",
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                );

                                const blob = new Blob([res.data], { type: "application/pdf" });
                                const url = window.URL.createObjectURL(blob);
                                window.open(url, "_blank");

                                setTimeout(() => URL.revokeObjectURL(url), 5000);
                            } catch (err) {
                                console.error("Failed to open PDF", err);
                                showNotification("error", "Unable to open PDF file");
                            }
                        }}
                    >
                        <img src={`${IMAGE_BASE}pdfred.png`} alt="PDF" className="w-4 h-4 shrink-0" />
                        <span className="text-xs text-blue-600 group-hover:underline truncate max-w-[140px] font-medium">
                            {row.lastFileName}
                        </span>
                    </button>
                );
            },
        },
    ];

    /* =======================
       STYLES
    ======================= */
    const customStyles = {
        table: { style: { border: "1px solid #ddd" } },
        headRow: {
            style: {
                backgroundColor: "#2c5f8a",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
            },
        },
        headCells: { style: { borderRight: "1px solid #ddd" } },
        rows: { style: { fontSize: "13px", minHeight: "36px" } },
        cells: {
            style: {
                borderRight: "1px solid #ddd",
                paddingLeft: "10px",
                paddingRight: "10px",
            },
        },
    };

    return (
        <div className="bg-[#eef1f4] min-h-screen p-6">
            <h2 className="text-sm font-semibold mb-3">APPLICATION DETAILS</h2>

            {notification.type && (
                <div
                    ref={notificationRef}
                    className={`mb-4 px-4 py-3 rounded flex items-center justify-between shadow-sm transition-all ${notification.type === "success"
                            ? "bg-[#00a65a] text-white"
                            : "bg-[#dd4b39] text-white"
                        }`}
                >
                    <div className="flex items-center gap-2 font-medium text-[13px]">
                        {notification.type === "success" ? (
                            <FaCheckCircle className="w-4 h-4" />
                        ) : (
                            <FaExclamationCircle className="w-4 h-4" />
                        )}
                        <span>{notification.message}</span>
                    </div>
                    <button
                        onClick={() => setNotification({ type: null, message: "" })}
                        className="text-white hover:opacity-75 focus:outline-none"
                    >
                        <FaTimes className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="bg-white border border-[#ddd] rounded">
                <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm">
                    FILLUP OTHER DETAILS
                </div>

                <div className="p-4 space-y-6">
                    <DataTable
                        columns={formColumns}
                        data={formTableData}
                        customStyles={customStyles}
                        pagination={false}
                    />

                    <DataTable
                        columns={docColumns}
                        data={auditorTableData}
                        customStyles={customStyles}
                        pagination={false}
                    />

                    {/* ================= AUDITOR RULE MODAL ================= */}
                    {showAuditorModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-white w-[600px] rounded shadow-lg">

                                {/* MODAL HEADER */}
                                <div className="flex justify-between items-center bg-[#5bc0de] text-white px-4 py-2 rounded-t">
                                    <span className="font-semibold text-sm">
                                        Allowing Auditor's Chart
                                    </span>
                                    <button
                                        onClick={() => setShowAuditorModal(false)}
                                        className="text-white text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* MODAL BODY */}
                                <div className="p-4">
                                    <table className="w-full border border-[#ddd] text-sm">
                                        <thead className="bg-[#2c5f8a] text-white">
                                            <tr>
                                                <th className="border border-[#ddd] px-2 py-1 w-[60px]">SL.NO.</th>
                                                <th className="border border-[#ddd] px-2 py-1">
                                                    NUMBER OF MEMBERS
                                                </th>
                                                <th className="border border-[#ddd] px-2 py-1">
                                                    AUDITORS
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border px-2 py-1 text-center">1</td>
                                                <td className="border px-2 py-1">
                                                    Members less than 250
                                                </td>
                                                <td className="border px-2 py-1">
                                                    Two general members of the union or by CA
                                                </td>
                                            </tr>
                                            <tr className="bg-[#f5f5f5]">
                                                <td className="border px-2 py-1 text-center">2</td>
                                                <td className="border px-2 py-1">
                                                    Members from 250 to 749
                                                </td>
                                                <td className="border px-2 py-1">
                                                    Audit should be done by 2 Panchayet Pradhan /
                                                    2 Councillor of Municipality / 2 MLAs / 2 MPs or by CA
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-2 py-1 text-center">3</td>
                                                <td className="border px-2 py-1">
                                                    Members from 750 and above
                                                </td>
                                                <td className="border px-2 py-1">
                                                    Chartered Accountant (CA) mandatory
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* MODAL FOOTER */}
                                <div className="flex justify-end px-4 pb-4">
                                    <button
                                        onClick={() => setShowAuditorModal(false)}
                                        className="border border-gray-400 px-4 py-1 rounded text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button className="bg-[#337ab7] text-white px-6 py-2 rounded text-sm cursor-pointer"
                            onClick={() => {
                                for (const row of formTableData) {
                                    if (row.isMandatory && !row.hasData) {
                                        if (row.sl === 6) {
                                            showNotification(
                                                "error",
                                                "Please fill up Officers Relinquishing Office details as you selected 'Yes' for office bearers resigned during this year."
                                            );
                                            return;
                                        }
                                        if (row.sl === 7) {
                                            showNotification(
                                                "error",
                                                "Please fill up Officers Appointed details as you selected 'Yes' for Consent of Officers joined during this year."
                                            );
                                            return;
                                        }
                                        if (row.sl === 9) {
                                            showNotification(
                                                "error",
                                                "Please fill up Consent of Officers details as you selected 'Yes' for Consent of Officers joined during this year."
                                            );
                                            return;
                                        }
                                        showNotification(
                                            "error",
                                            `Please fill up mandatory form: ${row.name}`
                                        );
                                        return;
                                    }
                                }
                                navigate(`/trade-union/annual-return-preview`,
                                    {
                                        state: {
                                            regNo: regNo,
                                            returnYear: Number(returnYear),
                                        }
                                    }
                                );
                            }}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RectifyData;