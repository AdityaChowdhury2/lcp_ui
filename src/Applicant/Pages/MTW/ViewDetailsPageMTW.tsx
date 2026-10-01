import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { toast } from "react-toastify";
import { FaFilePdf } from "react-icons/fa";

/* ================= PREVIEW TABLE ================= */
const PreviewTable: React.FC<{ rows: any[] }> = ({ rows }) => (
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
                    const isNoData = (() => {
                        if (!row.value) return true;
                        if (row.value === "-") return true;

                        if (typeof row.value === "string") {
                            return row.value.toLowerCase() === "no data available";
                        }

                        return false;
                    })();

                    return (
                        <tr key={row.sl}>
                            <td className="border text-center px-2 py-2">{row.sl}</td>

                            <td className="border px-3 py-2">{row.param}</td>

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

/* ================= COMPONENT ================= */
const ViewDetailsPageMTW: React.FC = () => {
    const [searchParams] = useSearchParams();
    const encAppId = searchParams.get("id");

    const isRenewFlag = searchParams.get("renwalStatus") === "true";

    const navigate = useNavigate();

    const [data, setData] = useState<any>(null);
    const [previewAddress, setPreviewAddress] = useState<any>({});
    const [documentsSummary, setDocumentsSummary] = useState<any>({});

    const [fee, setFee] = useState<number | null>(null);

    useEffect(() => {
        if (!encAppId) return;

        const fetchData = async () => {
            try {
                const authData = localStorage.getItem("lc_portal_auth");
                const token = JSON.parse(authData || "{}")?.token;

                const res = await axios.get(
                    `${API_BASE}applicant-module/mtw/applications/final-preview/${encodeURIComponent(encAppId)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setData(res.data.formData);
                setFee(res.data.finalfees);
                setPreviewAddress(res.data.previewAddress || {});
                setDocumentsSummary(res.data.documentsSummary || {});
            } catch (err) {
                console.error(err);
                toast.error("Failed to load details");
            }
        };

        fetchData();
    }, [encAppId]);

    if (!data) return <div className="p-4">Loading...</div>;

    /* ================= HELPERS ================= */
    const previewText = (v: any) =>
        !v || v === "" ? "-" : String(v);

    const natureMap: Record<string, string> = {
        city_service: "City Service",
        long_distance: "Long Distance",
        passenger_service: "Passenger Service",
        long_distance_freight_service: "Long Distance Freight Service",
        other: "Other",
    };

    /* ============================================================
    Generate dynamic rows for multiple directors
    ============================================================= */
    const directorRows = (
        previewAddress?.est_directors || []
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
    const proprietorRows = (() => {
        const list = previewAddress?.est_proprietor_partners || [];

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

    /* ================= REGISTRATION TABLE ================= */
    const rows = [
        { sl: "1", param: "Name of Motor Transport Undertaking", value: previewText(data.mtw_name) },

        { sl: "2", param: "Location of Motor Transport Undertaking", value: previewText(data.mtw_loc_address) },

        {
            sl: "2.1",
            param: "District",
            value: previewAddress?.est_dist_name?.district_name || "-",
        },
        {
            sl: "2.2",
            param: "Subdivision",
            value: previewAddress?.est_subdiv_name?.sub_div_name || "-",
        },
        {
            sl: "2.3",
            param: "Municipality",
            value: previewAddress?.est_areatype_name?.block_mun_name || "-",
        },
        {
            sl: "2.4",
            param: "Ward",
            value: previewAddress?.est_villward_name?.village_name || "-",
        },
        {
            sl: "2.5",
            param: "Police Station",
            value: previewAddress?.est_ps_name?.name_of_police_station || "-",
        },

        { sl: "2.6", param: "Pincode", value: data.mtw_loc_pincode },

        {
            sl: "3",
            param: "Nature of Motor Transport Undertaking",
            value: natureMap[data.mtw_nature] || "-",
        },

        { sl: "4", param: "Total Number Of Routes", value: data.total_routes },

        {
            sl: "5",
            param: "Route Details - Mileage",
            value:
                data.routes?.map((r: any) => `${r.route_details} - ${r.route_mileage}`).join(", ") ||
                "-",
        },

        { sl: "5.1", param: "Total Routes Mileage", value: data.total_route_milage },

        { sl: "6", param: "Total Number of MTW Vehicles on the last date or the preceding year", value: data.total_mtw_vehicle },

        { sl: "7", param: "Maximum Number of MTW Employed on any day during the preceding year", value: data.mtw_maxworkers },

        ...proprietorRows,

        {
            sl: "8.2",
            param: "Name and Address of the General Manager in case of a public sector undertaking",
            // value: "No data available"
            value: data.est_gm_details || "-",
        },

        ...directorRows,

        {
            sl: "10",
            param: "Fees (*This is system generated fees depends on point 7)",
            value: fee ? `₹${fee}` : "-",
        },
    ];

    /* ================= DOCUMENT TABLE ================= */
    const docMap = [
        { sl: "1", name: "Uploaded Trade License", key: "tradeLicense", code: "TL" },
        { sl: "2", name: "Uploaded Articles of Association / Partnership Deed", key: "aoaMoa", code: "AOA" },
        { sl: "3", name: "Uploaded Blue Book / Smart Card issued by Motor Vehicles", key: "blueBook", code: "BB" },
        { sl: "4", name: "Uploaded Insurance Certificate of Motor Vehicles", key: "insuranceCertificate", code: "IC" },
        { sl: "5", name: "Uploaded Documents in support of correctness of the application", key: "supportingDocs", code: "ODSC" },
        { sl: "6", name: "Uploaded Address Proof", key: "addressProof", code: "AP" },
        { sl: "7", name: "Form I", key: "formI", code: "FI" },
    ];

    const handleViewPdfDocuments = async (documentCode: string) => {
        try {
            const authData = localStorage.getItem("lc_portal_auth");
            const token = JSON.parse(authData || "{}")?.token;

            let response;  // ✅ IMPORTANT

            if (isRenewFlag) {
                response = await axios.get(
                    `${API_BASE}documents/mtw-renewal?enapplicationId=${encodeURIComponent(encAppId || "")}&documentCode=${documentCode}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                response = await axios.get(
                    `${API_BASE}documents?enapplicationId=${encodeURIComponent(encAppId || "")}&documentCode=${documentCode}&source=D`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            const { filecontent } = response.data;

            if (!filecontent) {
                alert("File not available");
                return;
            }

            const byteCharacters = atob(filecontent);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([new Uint8Array(byteNumbers)], {
                type: "application/pdf",
            });

            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");

        } catch (err) {
            console.error(err);
            alert("Unable to fetch document");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 space-y-6">

            <h1 className="text-lg font-semibold bg-white p-4">
                VIEW MTW APPLICATION DETAILS
            </h1>

            {/* REGISTRATION */}
            <div className="bg-white border p-4">
                <PreviewTable rows={rows} />
            </div>

            {/* DOCUMENTS */}
            <div className="bg-white border">
                <div className="bg-gray-600 text-white text-center py-2">
                    Documents Uploaded
                </div>

                <table className="w-full border text-sm">
                    <tbody>
                        {docMap.map((d) => {
                            const doc = documentsSummary?.[d.key];

                            return (
                                <tr key={d.sl}>
                                    <td className="border px-3 py-2 w-16 text-center">
                                        {d.sl}
                                    </td>

                                    <td className="border px-3 py-2">{d.name}</td>

                                    <td className="border px-3 py-2 text-center">
                                        {doc?.available && doc?.available !== "PENDING" ? (
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleViewPdfDocuments(d.code)}
                                                    className="text-red-600 hover:text-black flex items-center justify-center gap-1"
                                                >
                                                    <FaFilePdf />
                                                    View
                                                </button>
                                            </div>
                                        ) : doc?.available === "PENDING" ? (
                                            <span className="text-gray-400 text-xs">
                                                Pending
                                            </span>
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

            {/* BACK BUTTON */}
            <div>
                <button
                    onClick={() => navigate("/applicant-dashboard")}
                    className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black"
                >
                    Back
                </button>
            </div>
        </div >
    );
};

export default ViewDetailsPageMTW;