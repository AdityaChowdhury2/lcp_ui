import React, { useState, ChangeEvent } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { IMAGE_BASE } from "@/constants/constants";

/* AUTO DETECTION LOGIC */

const GREEN_BULLET =
    `${IMAGE_BASE}bullet-green.png`;
const ALERT_ICON =
    `${IMAGE_BASE}alert-icon.png`;

function getColor(label: string): string {
    const t = label.toLowerCase();

    if (
        t.includes("completed") ||
        t.includes("generate") ||
        t.includes("full compliance") ||
        t.includes("verification")
    )
        return "green";

    if (t.includes("partial/no compliance") || t.includes("courtcase"))
        return "pink";

    if (t.includes("not properly") || t.includes("over") || t.includes("allow"))
        return "red";

    return "black";
}

function getIcon(label: string): string {
    const t = label.toLowerCase();
    if (t.includes("not properly") || t.includes("over") || t.includes("allow"))
        return ALERT_ICON;
    return GREEN_BULLET;
}

/* DEMO DATA */

export type Row = {
    id: string;
    date: string;
    establishment: string;
    owner: string;
    inspectionNote: string[];
    showCause: string[];
    courtCase: string[];
};

const demoRows: Row[] = [
    {
        id: "WBLC-INSP-45704",
        date: "02/09/2025",
        establishment: "Lopamudra Jana Test",
        owner: "test",
        inspectionNote: ["INSPECTION NOTE NOT PROPERLY SUBMIT"],
        showCause: [],
        courtCase: [],
    },
    {
        id: "WBLC-INSP-9192",
        date: "29/06/2017",
        establishment: "BAIDYANATH STORES",
        owner: "MUKESH AGARWAL",
        inspectionNote: ["INSPECTION NOTE NOT PROPERLY SUBMIT"],
        showCause: [],
        courtCase: [],
    },
    {
        id: "WBLC-INSP-25179",
        date: "19/07/2018",
        establishment: "Airplaza Retail Holdings Pvt. Ltd.",
        owner: "Mr. Sangit Banerjee",
        inspectionNote: ["Completed/View", "Generate & Upload"],
        showCause: ["FULL COMPLIANCE FWD ALC"],
        courtCase: [],
    },
    {
        id: "WBLC-INSP-27520",
        date: "06/09/2018",
        establishment: "KALIKA TILES",
        owner: "NILANJAN NEOGI",
        inspectionNote: ["Completed/View", "Generate & Upload"],
        showCause: ["PARTIAL/NO COMPLIANCE (SHOWCAUSE)"],
        courtCase: ["COURTCASE APPROVED"],
    },
    {
        id: "WBLC-INSP-27532",
        date: "06/09/2018",
        establishment: "ROCKS - N - TILES",
        owner: "Smt. ISHITA BHATTACHARYA",
        inspectionNote: ["Completed/View", "Generate & Upload"],
        showCause: ["PARTIAL/NO COMPLIANCE (SHOWCAUSE)"],
        courtCase: ["COURTCASE APPROVED"],
    },
];

/* UPDATED COLUMN WIDTHS + SORTING */

const columns: TableColumn<Row>[] = [
    {
        name: "FILE NO./ DATE",
        sortable: true,
        grow: 1.2,
        wrap: true,
        selector: (row) => row.id,
        cell: (row) => (
            <div className="text-xs whitespace-pre-line">
                <div>{row.id}</div>
                <div className="text-gray-600">{row.date}</div>
            </div>
        ),
    },
    {
        name: "NAME OF THE EST./ INDUSTRY/ SHOP",
        sortable: true,
        selector: (row) => row.establishment,
        wrap: true,
        grow: 2.6,
    },
    {
        name: "NAME OF THE OWNER",
        sortable: true,
        selector: (row) => row.owner,
        wrap: true,
        grow: 1.8,
    },
    {
        name: "INSPECTION NOTE",
        wrap: true,
        grow: 1.5,
        cell: (r) =>
            r.inspectionNote.length === 0 ? (
                <span className="text-gray-400 text-xs">—</span>
            ) : (
                <div className="flex flex-col gap-1.5 text-xs">
                    {r.inspectionNote.map((label, i) => (
                        <div key={i} className="flex items-start">
                            <img src={getIcon(label)} className="w-3 h-3 mr-2 mt-0.5" />
                            <span
                                className={`font-semibold ${getColor(label) === "green"
                                    ? "text-green-700"
                                    : getColor(label) === "pink"
                                        ? "text-pink-700"
                                        : getColor(label) === "red"
                                            ? "text-red-700"
                                            : "text-gray-800"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            ),
    },
    {
        name: "SHOW-CAUSE/LET-OFF",
        wrap: true,
        grow: 1.5,
        cell: (r) =>
            r.showCause.length === 0 ? (
                <span className="text-gray-400 text-xs">—</span>
            ) : (
                <div className="flex flex-col gap-1.5 text-xs">
                    {r.showCause.map((label, i) => (
                        <div key={i} className="flex items-start">
                            <img src={getIcon(label)} className="w-3 h-3 mr-2 mt-0.5" />
                            <span
                                className={`font-semibold ${getColor(label) === "green"
                                    ? "text-green-700"
                                    : getColor(label) === "pink"
                                        ? "text-pink-700"
                                        : getColor(label) === "red"
                                            ? "text-red-700"
                                            : "text-gray-800"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            ),
    },
    {
        name: "COURT-CASE/LET-OFF",
        wrap: true,
        grow: 1.5,
        cell: (r) =>
            r.courtCase.length === 0 ? (
                <span className="text-gray-400 text-xs">—</span>
            ) : (
                <div className="flex flex-col gap-1.5 text-xs">
                    {r.courtCase.map((label, i) => (
                        <div key={i} className="flex items-start">
                            <img src={getIcon(label)} className="w-3 h-3 mr-2 mt-0.5" />
                            <span
                                className={`font-semibold ${getColor(label) === "green"
                                    ? "text-green-700"
                                    : getColor(label) === "pink"
                                        ? "text-pink-700"
                                        : getColor(label) === "red"
                                            ? "text-red-700"
                                            : "text-gray-800"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            ),
    },
];

const customStyles = {
    headRow: { style: { backgroundColor: "#1E73BE", minHeight: "36px" } },
    headCells: {
        style: { color: "white", fontSize: "11px", fontWeight: 600, borderRight: "1px solid #c9c9c9" },
    },
    rows: {
        style: { minHeight: "42px" },
    },
    cells: {
        style: {
            fontSize: "12px",
            borderRight: "1px solid #c9c9c9",
            paddingTop: "8px",
            paddingBottom: "8px",
        },
    },
};

/* MAIN COMPONENT */

export default function InspectionList() {
    const [search, setSearch] = useState<string>("");
    const [filteredRows, setFilteredRows] = useState<Row[]>(demoRows);

    const handleSearch = (value: string) => {
        setSearch(value);
        const lower = value.toLowerCase();

        setFilteredRows(
            demoRows.filter((row) =>
                row.id.toLowerCase().includes(lower) ||
                row.date.toLowerCase().includes(lower) ||
                row.establishment.toLowerCase().includes(lower) ||
                row.owner.toLowerCase().includes(lower) ||
                row.inspectionNote.some((x) => x.toLowerCase().includes(lower)) ||
                row.showCause.some((x) => x.toLowerCase().includes(lower)) ||
                row.courtCase.some((x) => x.toLowerCase().includes(lower))
            )
        );
    };

    return (
        <div className="bg-white border rounded shadow-sm overflow-hidden p-3">
            {/* Search Box */}
            <div className="mb-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="border px-3 py-1.5 rounded w-64 text-sm"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredRows}
                striped
                dense
                pagination
                highlightOnHover
                responsive
                customStyles={customStyles}
                paginationRowsPerPageOptions={[5, 10, 20, 50]}
            />
        </div>
    );
}
