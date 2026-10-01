import { IMAGE_BASE } from "@/constants/constants";
import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router";

/* ===============================
   TYPES
================================ */
interface BocwaRow {
    sl: number;
    registration: string;
    establishment: string;
    address: string;
    employer: string;
    actionLink: string;
}

/* ===============================
   SAMPLE DATA
   👉 Replace with API response
================================ */
const data: BocwaRow[] = [
    {
        sl: 1,
        registration: "1/R-BOCW/247/06/ALC/D.Hr.\n13th Dec, 2006",
        establishment: "Seba Nursing Home",
        address:
            "New Town, P.O. + P.S. - Diamond Harbour Dist.- South 24 Parganas",
        employer: "Sk. Ansar Ali",
        actionLink: "#",
    },
    {
        sl: 2,
        registration: "2/R-BOCW/262/06/ALC/D.Hr.\n29th Dec, 2006",
        establishment: "Basu International",
        address:
            "Kellar More, Diamond Harbour Dist.- South 24 Parganas",
        employer: "Bijoy Show",
        actionLink: "#",
    },
];

/* ===============================
   COMPONENT
================================ */
const LegacyBocwaList: React.FC = () => {

    const navigate = useNavigate();

    /* ===============================
   COLUMNS
   ================================ */
    const columns: TableColumn<BocwaRow>[] = [
        {
            name: "Sl. No",
            selector: r => r.sl,
            width: "80px",
            center: true,
        },
        {
            name: "REGISTRATION NUMBER\nREGISTRATION DATE",
            cell: row => (
                <div className="whitespace-pre-line">{row.registration}</div>
            ),
            width: "240px",
        },
        {
            name: "ESTABLISHMENT NAME",
            selector: r => r.establishment,
            wrap: true,
        },
        {
            name: "ESTABLISHMENT ADDRESS",
            selector: r => r.address,
            wrap: true,
        },
        {
            name: "EMPLOYER NAME",
            selector: r => r.employer,
            wrap: true,
        },
        {
            name: "ACTIONS",
            cell: row => (
                <a onClick={() => {
                    navigate("/official/view-old-list-of-bocwa");
                }}>
                    <img
                        src={`${IMAGE_BASE}view_details.png`}
                        alt="View"
                        className="w-full h-5 cursor-pointer"
                    />
                </a>
            ),
            width: "110px",
            center: true,
        },
    ];

    /* ===============================
       NIC TABLE STYLE
    ================================ */
    const customStyles = {
        table: {
            style: {
                border: "1px solid #cfd8dc",
            },
        },
        headRow: {
            style: {
                backgroundColor: "#3794d2",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                minHeight: "38px",
            },
        },
        headCells: {
            style: {
                borderRight: "1px solid #5fa6d9",
                whiteSpace: "pre-line",
            },
        },
        rows: {
            style: {
                fontSize: "13px",
                minHeight: "36px",
                borderBottom: "1px solid #e0e0e0",
            },
            stripedStyle: {
                backgroundColor: "#f2f2f2",
            },
        },
        cells: {
            style: {
                borderRight: "1px solid #e0e0e0",
                paddingLeft: "10px",
                paddingRight: "10px",
            },
        },
    };

    return (
        <div className="min-h-screen w-full overflow-auto">

            {/* Title */}
            <div className="px-6 pt-5 pb-3">
                <h1 className="text-[20px] font-semibold text-[#333]">
                    OFFLINE BOCWA APPLICATIONS LIST
                </h1>
            </div>

            {/* Table */}
            <div className="mx-6 bg-white border border-[#cfd8dc] rounded-sm">
                <DataTable
                    columns={columns}
                    data={data}
                    striped
                    pagination
                    customStyles={customStyles}
                    fixedHeader
                    fixedHeaderScrollHeight="70vh"
                />
            </div>
        </div>
    );
};

export default LegacyBocwaList;
