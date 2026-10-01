import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";

/* ===============================
   TYPES
================================ */
interface RowData {
    parameter: string;
    input: string;
}

/* ===============================
   SAMPLE DATA
   👉 Replace with API later
================================ */
const data: RowData[] = [
    { parameter: "Registration Number", input: "1/R-BOCW/247/06/ALC/D.Hr." },
    { parameter: "Registration Date", input: "13th Dec, 2006" },
    { parameter: "Name of the Establishment", input: "Seba Nursing Home" },
    {
        parameter: "Address of the Establishment",
        input:
            "New Town, P.O. + P.S. - Diamond Harbour Dist.- South 24 Parganas",
    },
    { parameter: "District of the Establishment", input: "South 24 Parganas" },
    { parameter: "Subdivision of the Establishment", input: "Diamond Harbour" },
    { parameter: "Block of the Establishment", input: "Diamond Harbour - I" },
    {
        parameter: "Permanent Address of the Establishment",
        input:
            "New Town, P.O. + P.S. - Diamond Harbour Dist.- South 24 Parganas",
    },
    { parameter: "Full Name of the Principal Employer", input: "Sk. Ansar Ali" },
    {
        parameter: "Address Of the Principal Employer",
        input:
            "C/O - Seba Nursing Home P.O. + P.S.- Diamond Harbour Dist.- South 24 Parganas",
    },
];

/* ===============================
   COLUMNS
================================ */
const columns: TableColumn<RowData>[] = [
    {
        name: "Parameters",
        selector: row => row.parameter,
        wrap: true,
    },
    {
        name: "Inputs",
        selector: row => row.input,
        wrap: true,
    },
];

/* ===============================
   NIC TABLE STYLES
================================ */
const customStyles = {
    table: {
        style: {
            border: "1px solid #006595",
            fontSize: "15px",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#008BD1",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "17px",
            minHeight: "45px",
        },
    },
    headCells: {
        style: {
            justifyContent: "center",
            borderRight: "1px solid #006595",
        },
    },
    rows: {
        style: {
            minHeight: "40px",
            borderBottom: "1px solid #006595",
            cursor: "default",
        },
        stripedStyle: {
            backgroundColor: "#DBE5F0",
        },
        highlightOnHoverStyle: {
            backgroundColor: "#d4e3e5",
        },
    },
    cells: {
        style: {
            paddingLeft: "13px",
            borderRight: "1px solid #006595",
        },
    },
};

/* ===============================
   COMPONENT
================================ */
const ViewOldBocwaDetails: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen px-6 py-4 w-full overflow-auto">

            {/* Page Title */}
            <h1 className="text-[20px] mb-4 text-[#333] font-semibold">
                VIEW OFFLINE BOCWA APPLICATION DETAILS
            </h1>

            {/* Blue Header Title */}
            <div className="border border-[#006595] bg-white">

                <div className="text-center py-2 border-b border-[#006595]">
                    <span className="text-[#3366FF] font-bold text-[17px]">
                        APPLICATION OF REGISTRATION UNDER BOCWA ACT
                    </span>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={data}
                    striped
                    customStyles={customStyles}
                    noHeader
                />
            </div>

            {/* Back Link */}
            <button
                onClick={() => navigate("/official/old-list-of-bocwa")}
                className="mt-3 text-orange-600 text-sm hover:underline"
            >
                Back to OFFLINE APPLICATION LIST
            </button>
        </div>
    );
};

export default ViewOldBocwaDetails;
