import React from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

/* ===============================
   TYPES
================================ */
interface ClraRow {
    sl: number;
    regNo: string;
    establishment: string;
    estAddress: string;
    employer: string;
    employerAddress: string;
    maxLabour: number;
}

/* ===============================
   DATA (sample – replace with API later)
================================ */
const rows: ClraRow[] = [
    {
        sl: 1,
        regNo: "KOL01/CLR/000284",
        establishment: "M/s Pankaj International",
        estAddress: "45, Radhanath Chowdhury Road",
        employer: "PANKAJ KUMAR BUBNA",
        employerAddress: "45, Radhanath Chowdhury Road",
        maxLabour: 50,
    },
    {
        sl: 2,
        regNo: "ABC/CLR/88999",
        establishment: "est1",
        estAddress: "drgdfgfg",
        employer: "ABC",
        employerAddress: "fgffgfg",
        maxLabour: 686,
    },
    {
        sl: 3,
        regNo: "BAN01/CLR/000045",
        establishment: "WBSEB, Bankura",
        estAddress: "LABAZAR",
        employer: "DUMMY",
        employerAddress: "NOT AVAILABLE",
        maxLabour: 274,
    },
];

/* ===============================
   COLUMNS
================================ */
const columns: TableColumn<ClraRow>[] = [
    { name: "Sl. No", selector: r => r.sl, width: "80px", center: true },
    { name: "Registration Number", selector: r => r.regNo, width: "200px" },
    {
        name: "Name of the Establishment",
        selector: r => r.establishment,
        wrap: true,
    },
    {
        name: "Address of the Establishment",
        selector: r => r.estAddress,
        wrap: true,
        width: "250px"
    },
    {
        name: "Name of the Principal Employer",
        selector: r => r.employer,
        wrap: true,
        width: "250px"
    },
    {
        name: "Address of the Principal Employer",
        selector: r => r.employerAddress,
        wrap: true,
        width: "250px"
    },
    {
        name: "Maximum No. of Contract Labour",
        selector: r => r.maxLabour,
        width: "250px",
        center: true,
        wrap: true,
    },
];

/* ===============================
   NIC STYLE
================================ */
const customStyles: TableStyles = {
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
            borderBottom: "1px solid #2e7cb6",
        },
    },
    headCells: {
        style: {
            borderRight: "1px solid #5fa6d9",
            textTransform: "none",
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

/* ===============================
   COMPONENT
================================ */
const OfflineCLRAApplications: React.FC = () => {
    return (
        <div className="min-h-screen w-full overflow-auto">

            {/* Page Title */}
            <div className="px-6 pt-5 pb-3">
                <h1 className="text-[20px] font-semibold text-[#333]">
                    OFFLINE CLRA APPLICATIONS LIST
                </h1>
            </div>

            {/* Table Container */}
            <div className=" bg-white border mx-6 border-[#cfd8dc] rounded-sm">
                <DataTable
                    columns={columns}
                    data={rows}
                    striped
                    pagination
                    customStyles={customStyles}
                // fixedHeader
                // fixedHeaderScrollHeight="70vh"
                />
            </div>
        </div>
    );
};

export default OfflineCLRAApplications;
