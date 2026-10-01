import { API_BASE } from "@/constants/constants";
import React, { FC, useEffect, useState, useCallback } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Eye } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../Components/ui/select";
import { useNavigate } from "react-router-dom";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { getAuthToken } from "@/utils/auth";


interface AnnualReturnRow {
    id: string;
    reg_no: string;
    year: string;
    name: string;
    district: string;
    submission_date: string;
    status: string;

    en_reg_id: string;
    en_wizard_id: string;
    en_row_id: string;
    val: string;
}

const tabToStatusMap: Record<string, string> = {
    All: "ALL",
    Pending: "N",
    Approved: "Y",
    "Send Back": "B",
    Reject: "R",
};

const CTUAnnualReturnList: FC = () => {
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState<string>("Pending");
    const [unionType, setUnionType] = useState<"T" | "F">("T");
    const [tableData, setTableData] = useState<AnnualReturnRow[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const tabHeaders: Record<string, string> = {
        All: "Annual Return Submission Information",
        Pending: "Pending Annual Returns",
        Approved: "Approved Annual Returns",
        "Send Back": "Returned Annual Returns",
        Reject: "Rejected Annual Returns",
    };

    const columns: TableColumn<AnnualReturnRow>[] = [
        {
            name: "SL NO.",
            width: "90px",
            cell: (_row, index) => ((page - 1) * limit) + ((index ?? 0) + 1),
        },
        {
            name: <div>REG. NO.</div>,
            selector: (row) =>
                encryptionDecryptionFun("decrypt", row.en_reg_id) || row.reg_no || "",
            sortable: true,
        },
        {
            name: <div>YEAR OF SUBMISSION</div>,
            selector: (row) => row.year,
            sortable: true,
            minWidth: "100px",
        },
        {
            name: <div>NAME</div>,
            selector: (row) => row.name,
            sortable: true,
            minWidth: "120px",
            wrap: true,
        },
        {
            name: <div>DISTRICT NAME</div>,
            selector: (row) => row.district || "-",
            sortable: true,
            minWidth: "120px",
            wrap: true,
        },
        {
            name: <div style={{ whiteSpace: 'nowrap' }}>SUBMISSION DATE</div>,
            selector: (row) => row.submission_date,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "STATUS",
            selector: (row) => row.status,
            width: "130px",
            cell: (row) => (
                <span
                    className={`font-medium ${row.status === "Pending"
                        ? "text-blue-600"
                        : row.status === "Approved"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            name: "ACTION",
            width: "140px",
            cell: (row) => (
                <button
                    className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                    onClick={() =>
                        navigate("/trade-union/tu-fed-final-pdf-central-admin-end", {
                            state: {
                                en_reg_id: row.en_reg_id,
                                en_wizard_id: row.en_wizard_id,
                                en_row_id: row.en_row_id,
                                val: row.val,
                                status: row.status
                            },
                        })
                    }
                >
                    <Eye size={14} /> View
                </button>
            ),
        }
    ];

    const fetchAnnualReturns = useCallback(async () => {
        try {
            setLoading(true);

            const status = tabToStatusMap[tabValue] || "ALL";
            const params = new URLSearchParams({
                status,
                val: unionType,
                page: String(page),
                limit: String(limit),
            });

            if (searchText.trim()) {
                params.set("search", searchText.trim());
            }

            const response = await fetch(
                `${API_BASE}ctu/annual-returns?${params.toString()}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );

            const result = await response.json();

            const formattedData = result.data?.map((item: any) => {
                const decryptedRegNo = encryptionDecryptionFun("decrypt", item.en_reg_id);
                const decryptedWizardId = encryptionDecryptionFun("decrypt", item.en_wizard_id);

                return {
                    id: String(item.id),
                    reg_no: decryptedRegNo || String(item.regNo ?? ""),
                    year: decryptedWizardId || String(item.year ?? ""),
                    name: item.name || "-",
                    district: item.district || "-",
                    submission_date: item.submissionDate
                        ? new Date(item.submissionDate).toLocaleDateString("en-GB")
                        : "-",
                    status: item.status,

                    en_reg_id: item.en_reg_id,
                    en_wizard_id: item.en_wizard_id,
                    en_row_id: item.en_row_id,
                    val: item.val || unionType,
                };
            }) || [];

            setTableData(formattedData);
            setTotalRows(result.pagination?.total || 0);
        } catch (error) {
            console.error("API Error:", error);
            setTableData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    }, [tabValue, unionType, page, limit, searchText]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAnnualReturns();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchAnnualReturns]);

    const handleTabChange = (tab: string) => {
        setTabValue(tab);
        setPage(1);
    };

    const handleUnionTypeChange = (type: "T" | "F") => {
        setUnionType(type);
        setPage(1);
    };

    return (
        <div className="w-full px-4 md:px-6 py-4">
            <div className="bg-white border border-slate-200 border-t-[3px] border-t-[#3c8dbc] rounded-md shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between bg-slate-50 items-center px-4 py-3 border-b border-slate-200 flex-wrap gap-2">
                    <h2 className="text-sm md:text-base font-semibold text-slate-700">
                        {tabHeaders[tabValue]}
                    </h2>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleUnionTypeChange(unionType === "T" ? "F" : "T")}
                            className="bg-[#f39c12] hover:bg-[#e08e0b] text-white px-3 py-1 text-xs rounded font-medium transition-colors"
                        >
                            {unionType === "T" ? "View Federation List" : "View Trade Union List"}
                        </button>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="flex justify-between items-center px-4 py-3 flex-wrap gap-3 border-b border-slate-100">

                    <input
                        type="text"
                        placeholder="Search by Reg. No., Name, District..."
                        className="h-[36px] w-full max-w-[320px] rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                    />

                    <div className="w-full max-w-[220px]">
                        <Select
                            value={unionType}
                            onValueChange={(val: "T" | "F") => handleUnionTypeChange(val)}
                        >
                            <SelectTrigger className="h-[36px] text-sm border-slate-300">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="T">Trade Union List</SelectItem>
                                <SelectItem value="F">Federation List</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                {/* TABS */}
                <div className="flex border-b border-slate-200 px-2 md:px-4 overflow-x-auto">
                    {Object.keys(tabHeaders).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${tabValue === tab
                                ? "border-[#3c8dbc] text-[#3c8dbc] font-medium"
                                : "border-transparent text-slate-500 hover:text-[#3c8dbc]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TABLE */}
                <div className="p-3 md:p-4 bg-slate-50">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        progressPending={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangePage={(p) => setPage(p)}
                        onChangeRowsPerPage={(newLimit) => {
                            setLimit(newLimit);
                            setPage(1);
                        }}
                        striped
                        highlightOnHover
                        dense
                        customStyles={{
                            headCells: {
                                style: {
                                    minWidth: '150px',
                                    color: "#333333",
                                    fontSize: "12px",
                                    fontWeight: 'bold',
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",

                                },
                            },

                            rows: {
                                style: {
                                    fontSize: "12px",
                                    minHeight: "52px",
                                    borderBottom: "1px solid #f1f5f9",
                                },
                            },
                            cells: {
                                style: {
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CTUAnnualReturnList;