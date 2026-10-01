"use client";

import React, { useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import ClraRegDashboardTabs from "./ClraRegDashboardTabs";

interface TradeUnion {
    registrationNumber?: string;
    name?: string;
    address?: string;
}

interface TableRow {
    establishment_name: string;
    service_name: string;
    apply_year: string;
    highlight?: boolean;
}

const ClraRegViewTUApplication: React.FC = () => {
    const [hasTradeUnion, setHasTradeUnion] = useState<"no" | "yes">("no");

    // Mock data - replace with real API data later
    const tradeUnions: TradeUnion[] = [];

    // Define columns for DataTable
    const demoTableData: TableRow[] = [
        {
            establishment_name: "HEINEN & HOPMAN ENGG (I) PVT. LTD.",
            service_name: "1) Contract Labour (R & A) Act, 1970",
            apply_year: "2024",
        },
        {
            establishment_name: "HEINEN & HOPMAN ENGG (I) PVT. LTD.",
            service_name: "1) Contract Labour (R & A) Act, 1970",
            apply_year: "2023",
        },
        {
            establishment_name: "HEINEN & HOPMAN ENGG (I) PVT. LTD.",
            service_name: "1) Contract Labour (R & A) Act, 1970",
            apply_year: "2022",
        },
    ];

    // ------------------------------------
    // TABLE COLUMNS (typed)
    // ------------------------------------
    const tableColumns: TableColumn<TableRow>[] = [
        {
            name: "SL NO.",
            width: "100px",
            selector: (_row: TableRow, index?: number) => (index ?? 0) + 1,
            cell: (_row: TableRow, index?: number) => (
                <div className="w-full">{(index ?? 0) + 1}</div>
            ),
            sortable: true,
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Trade Union Registration Number</div>,
            width: "250px",
            selector: (row: TableRow) => row.establishment_name,
            sortable: true,
            cell: (row: TableRow) => <div>{row.establishment_name}</div>,
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Trade Union Name</div>,
            selector: (row: TableRow) => row.service_name,
            sortable: true,
            cell: (row: TableRow) => <div>{row.service_name}</div>,
        },
        {
            name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>Address</div>,
            width: "130px",
            selector: (row: TableRow) => row.apply_year,
            sortable: true,
            cell: (row: TableRow) => <div>{row.apply_year}</div>,
        },
        {
            name: "Operation",
            width: "150px",
            cell: () => (
                <button
                    className="text-blue-600 hover:text-blue-900 py-1 text-sm font-medium flex whitespace-nowrap"
                    onClick={() => console.log("PDF Downloader")}>
                    View Details
                </button>
            ),
        },
    ];


    // Custom "No data" message
    const NoDataComponent = () => (
        <div className="text-center py-8 text-gray-500 bg-gray-50">
            No data found!
        </div>
    );

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Title */}
            <div className="bg-white p-4 border-b">
                <h1 className="text-xl font-semibold text-gray-900">
                    APPLICATION DETAILS FOR AMENDMENT
                </h1>
            </div>

            {/* Tabs */}
            <ClraRegDashboardTabs />

            {/* Main Content */}
            <div className="p-6">
                {/* Header Text */}
                <p className="text-sm font-medium text-gray-700 mb-4">
                    Click <strong>YES</strong> to add trade union
                </p>

                {/* Radio Buttons */}
                <div className="flex items-center gap-8 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tradeUnion"
                            value="no"
                            checked={hasTradeUnion === "no"}
                            onChange={(e) => setHasTradeUnion(e.target.value as "no" | "yes")}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">No</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tradeUnion"
                            value="yes"
                            checked={hasTradeUnion === "yes"}
                            onChange={(e) => setHasTradeUnion(e.target.value as "no" | "yes")}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-blue-600">Yes</span>
                    </label>
                </div>

                {/* Add Button - Only when Yes */}
                {hasTradeUnion === "yes" && (
                    <div className="mb-8">
                        <button className="bg-[#40a9ff] hover:bg-[#1890ff] text-white font-medium py-2 px-6 rounded-lg shadow transition-colors">
                            + Add New Trade Union
                        </button>
                    </div>
                )}

                {/* DataTable */}
                <DataTable
                    columns={tableColumns}
                    data={demoTableData || []}
                    pagination
                    striped
                    highlightOnHover
                    dense
                    customStyles={{
                        headCells: {
                            style: {
                                background: "#1E73BE",
                                color: "white",
                                fontWeight: "200",
                                fontSize: "12px",
                                borderRight: "1px solid #c9c9c9",
                                whiteSpace: "normal",      // allow wrapping
                                wordBreak: "break-word",   // break long words
                                overflow: "visible",       // no clipping
                                lineHeight: "1.2",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                            },
                        },
                        rows: {
                            style: {
                                fontSize: "12px",
                                borderBottom: "1px solid #e5e7eb",
                            },
                        },
                        cells: {
                            style: {
                                paddingTop: "12px",
                                paddingBottom: "12px",
                                borderRight: "1px solid #e5e7eb",
                            },
                        },
                    }}
                    conditionalRowStyles={[
                        {
                            when: (row) => row.highlight === true,
                            style: {
                                backgroundColor: "#e3994bff",
                            },
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default ClraRegViewTUApplication;