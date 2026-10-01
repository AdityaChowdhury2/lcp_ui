import { FRONTEND_BASE } from "@/constants/constants";
import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";

/* ===========================
   TYPES
=========================== */
interface OrderRow {
    sl: number;
    district: string;
    subdivision: string;
    confirmDate: string;
    designation: string;
    file?: string;
    upload?: boolean;
}

/* ===========================
   DATA (sample from screenshot)
=========================== */
const rows: OrderRow[] = [
    {
        sl: 1,
        district: "Paschim Medinipur",
        subdivision: "Medinipur Sadar",
        confirmDate: "04-09-2018",
        designation: "Deputy Labour Commissioner (DLC)",
        file: `${FRONTEND_BASE}/sites/default/files/upload/randomizationorder/ORDER-1536046871.pdf`,
    },
    {
        sl: 2,
        district: "Paschim Medinipur",
        subdivision: "Medinipur Sadar",
        confirmDate: "04-09-2018",
        designation: "Assistant labour Commissioner (ALC)",
        file: `${FRONTEND_BASE}/sites/default/files/upload/randomizationalcorder/ALC-ORDER-OTHERS-20180912112756.pdf`,
    },
    {
        sl: 21,
        district: "Paschim Medinipur",
        subdivision: "Ghatal",
        confirmDate: "11-05-2017",
        designation: "Deputy Labour Commissioner (DLC)",
        upload: true,
    },
];

/* ===========================
   COLUMNS
=========================== */
const columns: TableColumn<OrderRow>[] = [
    {
        name: "SL. NO",
        selector: (row) => row.sl,
        width: "90px",
        center: true,
    },
    {
        name: "DISTRICT",
        selector: (row) => row.district,
    },
    {
        name: "SUBDIVISION",
        selector: (row) => row.subdivision,
    },
    {
        name: "CONFIRM DATE",
        selector: (row) => row.confirmDate,
        width: "140px",
    },
    {
        name: "OFFICER DESIGNATION",
        selector: (row) => row.designation,
        wrap: true,
    },
    {
        name: "UPLOADED ORDER",
        cell: (row) =>
            row.upload ? (
                <a className="text-red-600 font-bold text-sm underline cursor-pointer"
                    href="/upload-previous-order">
                    Click Here to Upload
                </a>
            ) : (
                <a
                    href={row.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0066cc] text-sm underline cursor-pointer"
                >
                    Download Order
                </a>
            ),
        width: "180px",
    },
];

/* ===========================
   NIC STYLE
=========================== */
const customStyles = {
    table: {
        style: {
            border: "1px solid #cfcfcf",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#3c8dbc",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            minHeight: "36px",
        },
    },
    rows: {
        style: {
            fontSize: "13px",
            minHeight: "34px",
        },
        stripedStyle: {
            backgroundColor: "#f2f2f2",
        },
    },
    cells: {
        style: {
            borderRight: "1px solid #ddd",
            paddingLeft: "10px",
            paddingRight: "10px",
        },
    },
};

/* ===========================
   PAGE
=========================== */
const RandomizationPreviousList: React.FC = () => {
    return (
        <div className="min-h-screen p-4">

            {/* TITLE */}
            <h1 className="text-xl font-semibold mb-3">
                Generated randomization order list for inspection
            </h1>

            {/* NIC PANEL */}
            <div className="bg-white border border-[#ccc] rounded">

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={rows}
                        striped
                        pagination
                        customStyles={customStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default RandomizationPreviousList;
