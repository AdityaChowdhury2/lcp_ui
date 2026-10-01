import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store/store";
import { syncAmendmentReduxFromSession } from "@/store/syncAmendmentReduxFromSession";
import { IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { API_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { getAuthToken } from "@/utils/auth";

/** Type */
type LicenseHistoryItem = {
    formVSerialNo: number;
    applicationType?: "License" | "Renewal" | "Amendment";
    tagFlag?: string;
    licenseApplicationId?: number | null;
    paymentApplicationId?: number | null;
    renewalApplicationId?: number | null;
    contractorParticularId?: number | null;
    payActId?: number;
    formDetails: string;
    licenseDetails: string;
    appliedFor: string;
    statusCode: string;
    statusLabel: string;
    viewUrl?: string;
    remarkUrl?: string;
    paymentUrl?: string;
    certificateUrl?: string;
};

/** SAME helper */
function resolveStatusImageFile(code: string | null | undefined): string | null {
    const c = (code ?? "").trim();
    if (!c) return null;

    if (STATUS_IMAGE_MAP[c]) return STATUS_IMAGE_MAP[c];

    const alias: Record<string, string> = {
        P: "Fees Paid",
        A: "Fees Pending",
        F: "Applied",
        I: "Issued",
        R: "Rejected",
        B: "Rectification",
        U: "Final Submitted",
        AW: "Approved",
        BI: "BI",
        FW: "Pending",
        C: "Pending",
    };

    const mapped = alias[c];
    if (mapped && STATUS_IMAGE_MAP[mapped]) return STATUS_IMAGE_MAP[mapped];

    return null;
}

const LicenseMoreDetails: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();
    const formVSerialNo = searchParams.get("formVSerialNo");

    const [items, setItems] = useState<LicenseHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!formVSerialNo) return;
        const token = getAuthToken();
        if (!token) {
            toast.error("Authentication error. Please login again.");
            return;
        }

        let closed = false;
        const load = async () => {
            try {
                setLoading(true);
                let res = await fetch(
                    `${API_BASE}contractor-license/license-history-list?formVSerialNo=${encodeURIComponent(
                        String(formVSerialNo)
                    )}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                let data = await res.json().catch(() => ({}));

                // Fallback for older backend instances where endpoint is not yet available.
                if (!res.ok || data?.success !== true || !Array.isArray(data?.items)) {
                    res = await fetch(`${API_BASE}contractor-license/renewal-amendment-list`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    data = await res.json().catch(() => ({}));
                    if (!res.ok || data?.success !== true || !Array.isArray(data?.items)) {
                        throw new Error(data?.message || "Unable to load previous history.");
                    }
                    data.items = (data.items as any[]).filter(
                        (row) => Number(row?.formVSerialNo ?? 0) === Number(formVSerialNo)
                    );
                }

                if (closed) return;

                const mapped: LicenseHistoryItem[] = (data.items as any[]).map((row) => {
                    const status = String(row?.statusCode ?? "").trim().toUpperCase();
                    const formNo = Number(row?.formVSerialNo ?? 0);
                    const flag = String(row?.flag ?? "").trim().toUpperCase();
                    const particularId = row?.contractorParticularId;
                    const payActId = Number(row?.payActId ?? 1);
                    // Each act has its own payment identifier — 12 (licence) uses the
                    // Form-V serial, 13/14 use the renewal/amendment row id. Falling
                    // back to the licence application id sends the wrong one, so only
                    // the act's own reference is used for the payment link.
                    const paymentAppId =
                        row?.paymentApplicationId ??
                        (payActId === 12 && formNo > 0 ? formNo : null);
                    const appId = paymentAppId ?? row?.licenseApplicationId;

                    const remarkUrl =
                        formNo > 0 && particularId != null
                            ? `/contractor-license/remarks?formVSerialNo=${encodeURIComponent(
                                String(formNo)
                            )}&particularId=${encodeURIComponent(String(particularId))}&flag=${encodeURIComponent(
                                flag || "L"
                            )}`
                            : undefined;
                    const paymentUrl =
                        status === "A" && paymentAppId != null
                            ? (() => {
                                const encApp = encryptionDecryptionFun("encrypt", String(paymentAppId)) ?? "";
                                const encAct = encryptionDecryptionFun("encrypt", String(payActId)) ?? "";
                                if (encApp && encAct) {
                                    return `/epayments-preview?applicationId=${encodeURIComponent(
                                        encApp
                                    )}&actId=${encodeURIComponent(encAct)}`;
                                }
                                return undefined;
                            })()
                            : undefined;

                    return {
                        formVSerialNo: formNo,
                        applicationType: row?.applicationType,
                        tagFlag: flag || "L",
                        licenseApplicationId: row?.licenseApplicationId ?? appId ?? null,
                        paymentApplicationId: paymentAppId,
                        renewalApplicationId: row?.renewalApplicationId ?? null,
                        contractorParticularId: particularId ?? null,
                        payActId,
                        formDetails: String(row?.formRef ?? "").trim(),
                        licenseDetails: String(row?.licenseDetails ?? "").trim(),
                        appliedFor: String(row?.appliedFor ?? "").trim(),
                        statusCode: status,
                        statusLabel: String(row?.statusLabel ?? "").trim() || status || "—",
                        viewUrl:
                            row?.applicationType === "Amendment"
                                ? "/license-renewal-amendment-list"
                                : "/contractor-license/renewal",
                        remarkUrl,
                        paymentUrl,
                        certificateUrl: row?.certificateUrl ? String(row.certificateUrl) : undefined,
                    };
                });

                setItems(mapped);
            } catch (err: any) {
                if (!closed) toast.error(err?.message || "Error loading history");
            } finally {
                if (!closed) setLoading(false);
            }
        };

        load();
        return () => {
            closed = true;
        };
    }, [formVSerialNo]);

    const columns: TableColumn<LicenseHistoryItem>[] = [
        {
            name: <span className="font-semibold">Sl. No</span>,
            width: "80px",
            cell: (_row, index) => index + 1,
        },
        {
            name: (
                <span className="font-semibold leading-tight">
                    Form-V/Ref.No <br /> P.E. Registration Details
                </span>
            ),
            wrap: true,
            cell: (row) => (
                <span className="whitespace-pre-line text-[13px]">
                    {row.formDetails}
                </span>
            ),
        },
        {
            name: <span className="font-semibold">License Details</span>,
            wrap: true,
            cell: (row) => (
                <span className="whitespace-pre-line text-[13px]">
                    {row.licenseDetails}
                </span>
            ),
        },
        {
            name: (
                <span className="font-semibold leading-tight">
                    Applied For <br /> Application Date
                </span>
            ),
            wrap: true,
            cell: (row) => (
                <span className="whitespace-pre-line text-[13px]">
                    {row.appliedFor}
                </span>
            ),
        },
        {
            name: <span className="font-semibold">Status</span>,
            width: "120px",
            cell: (row) => {
                if (row.statusCode === "I") {
                    return (
                        <img
                            src={`${IMAGE_BASE}btn-issued.png`}
                            alt="Issued"
                            className="max-h-8"
                        />
                    );
                }

                const img = resolveStatusImageFile(row.statusCode);

                if (img) {
                    return (
                        <img
                            src={`${IMAGE_BASE}${img}`}
                            alt={row.statusLabel}
                            className="max-h-8"
                        />
                    );
                }

                return <span className="text-xs">{row.statusLabel}</span>;
            },
        },
        {
            name: <span className="font-semibold">Action</span>,
            minWidth: "220px",
            cell: (row) => {
                const status = String(row.statusCode ?? "").trim().toUpperCase();
                const setCtx = () => {
                    sessionStorage.setItem(
                        "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
                        JSON.stringify({
                            formVSerialNo: row.formVSerialNo,
                            legacyLicenseId: row.licenseApplicationId ?? null,
                            paymentApplicationId: row.paymentApplicationId ?? null,
                            renewalApplicationId: row.renewalApplicationId ?? null,
                            contractorParticularId: row.contractorParticularId ?? null,
                            tagFlag: row.tagFlag ?? "L",
                            statusCode: row.statusCode ?? null,
                            payActId: row.payActId ?? 1,
                        })
                    );
                    syncAmendmentReduxFromSession(dispatch);
                };

                return (
                    <div className="flex flex-col gap-1 text-[12px]">
                        {row.viewUrl && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCtx();
                                    if (row.applicationType === "Amendment") {
                                        navigate("/license-renewal-amendment-list");
                                    } else {
                                        navigate("/contractor-license/renewal");
                                    }
                                }}
                                className="flex items-center gap-1 text-blue-700 hover:underline text-left"
                            >
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                View Details
                            </button>
                        )}
                        {row.remarkUrl && !["F", "BI", "FW"].includes(status) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCtx();
                                    navigate(row.remarkUrl as string);
                                }}
                                className="flex items-center gap-1 text-blue-700 hover:underline text-left"
                            >
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                View Remark
                            </button>
                        )}
                        {row.paymentUrl && status === "A" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCtx();
                                    navigate(row.paymentUrl as string);
                                }}
                                className="flex items-center gap-1 text-blue-700 hover:underline text-left"
                            >
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Payment Details
                            </button>
                        )}
                        {row.applicationType === "Renewal" && status === "P" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCtx();
                                    navigate("/contractor-license/renewal/upload-form-vii");
                                }}
                                className="flex items-center gap-1 text-blue-700 hover:underline text-left"
                            >
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Download & Upload FORM-VII
                            </button>
                        )}
                        {row.certificateUrl && (
                            <a
                                href={row.certificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-700 hover:underline"
                            >
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Download Certificate
                            </a>
                        )}
                    </div>
                );
            },
        },
    ];

    /* ============= CUSTOM DATA TABLE STYLES =============== */
    const customStyles = {
        table: {
            style: {
                border: "1px solid #d1d5db",
            },
        },
        headCells: {
            style: {
                backgroundColor: "#2C7FB8",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                borderRight: "1px solid #cbd5e1",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                borderRight: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                paddingTop: "10px",
                paddingBottom: "10px",
            },
        },
        rows: {
            style: {
                minHeight: "60px",
            },
        },
    };

    return (
        <div className="w-full px-2 md:px-10 py-4">
            <div className="bg-[#f1f1f1] border border-gray-300 rounded shadow-sm">
                <div className="px-4 py-3 border-b">
                    <h2 className="text-[16px] font-semibold text-gray-800 uppercase tracking-wide">
                        Previous History for Form-V/ Ref. Number-{formVSerialNo}
                    </h2>
                </div>

                <div className="p-3 md:p-4 bg-white">
                    {loading ? (
                        <div className="p-6 text-sm">Loading history...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={items}
                            customStyles={customStyles}
                            responsive
                            highlightOnHover
                            striped   // ✅ important (Drupal-like rows)
                            noDataComponent={
                                <div className="p-6 text-center text-sm">
                                    No history found
                                </div>
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LicenseMoreDetails;