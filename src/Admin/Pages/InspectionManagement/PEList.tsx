import React, { FC, useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaRegEdit } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ViewDetailsModal from "./ViewDetailsModal";
import { DetailData } from "./types";

interface PEListRow extends DetailData {
    reg_no_date?: string;
}

const PEList: FC = () => {
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<DetailData | null>(null);

    // 🔍 Search state
    const [searchText, setSearchText] = useState<string>("");

    const demoTableData: PEListRow[] = [
        {
            registrationNumber: "BKP/CON/R-07/2015/DLC",
            registrationDate: "03/02/2015",
            establishmentName: "SPENCERS RETAIL LIMITED",
            establishmentAddress: "14 B T ROAD",
            principalEmployerName: "SPENCERS RETAIL LIMITED",
            principalEmployerAddress: "14 B. T. ROAD KOLKATA-700056",
            maxContractLabours: 35,
            fees: 1000,
            status: "invalid",
            reg_no_date: "BKP/CON/R-07/2015/DLC\n03/02/2015",
        },
        {
            registrationNumber: "BKP/CON/R-21/2015/DLC",
            registrationDate: "11/03/2015",
            establishmentName: "SENCO GOLD LTD.",
            establishmentAddress: "Some Address",
            principalEmployerName: "SANKAR SEN",
            principalEmployerAddress: "Another Address",
            maxContractLabours: 20,
            fees: 1000,
            status: "valid",
            reg_no_date: "BKP/CON/R-21/2015/DLC\n11/03/2015",
        },
    ];

    // ----------------------------------------
    // 🔍 SEARCH FILTERING
    // ----------------------------------------
    const filteredData = useMemo(() => {
        if (!searchText.trim()) return demoTableData;

        const lower = searchText.toLowerCase();

        return demoTableData.filter((row) =>
            row.registrationNumber.toLowerCase().includes(lower) ||
            row.registrationDate.toLowerCase().includes(lower) ||
            row.establishmentName.toLowerCase().includes(lower) ||
            row.principalEmployerName.toLowerCase().includes(lower) ||
            String(row.maxContractLabours).includes(lower) ||
            String(row.fees).includes(lower)
        );
    }, [searchText, demoTableData]);

    // ----------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------
    const tableColumns: TableColumn<PEListRow>[] = [
        {
            name: <div className="text-center w-full">SL. NO</div>,
            selector: (_row, index) => (index ?? 0) + 1,
            sortable: true,
            center: true,
            width: "80px",
        },
        {
            name: <div className="text-center w-full">REG. NUMBER & DATE</div>,
            selector: (row) => row.reg_no_date ?? "",
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            name: <div className="text-center w-full">NAME OF THE EST.</div>,
            selector: (row) => row.establishmentName,
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            name: <div className="text-center w-full">NAME OF THE P.E.</div>,
            selector: (row) => row.principalEmployerName,
            sortable: true,
            wrap: true,
            center: true,
        },
        {
            name: <div className="text-center w-full">LABOUR(CL)</div>,
            selector: (row) => String(row.maxContractLabours),
            sortable: true,
            center: true,
            width: "125px",
        },
        {
            name: <div className="text-center w-full">FEES</div>,
            selector: (row) => `₹${row.fees}`,
            sortable: true,
            center: true,
            width: "100px",
        },
        {
            name: <div className="text-center w-full">ACTION</div>,
            center: true,
            width: "180px",
            cell: (row) => (
                <div className="flex items-center gap-3 justify-center">
                    <button
                        className="text-blue-600 underline flex items-center gap-1"
                        onClick={() => navigate("/edit-data")}
                    >
                        <FaRegEdit className="text-base" /> Edit
                    </button>

                    <button
                        className="bg-[#00c0ef] border-[#00acd6] text-white rounded px-3 py-1 text-sm flex items-center gap-1"
                        onClick={() => {
                            setSelectedRow(row);
                            setShowModal(true);
                        }}
                    >
                        <FaCircleInfo className="text-base" /> More
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full pl-5 pt-5 pb-5 pr-5 bg-[#ededed]">
            <h1 className="text-2xl mb-4 text-gray-800">
                Registrar principal employer (manual/offline) under CLRA
            </h1>

            {/* SEARCH BOX */}
            <div className="mb-3 flex">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded w-64"
                />
            </div>

            <div style={{ backgroundColor: "#fff", padding: "10px" }}>
                <DataTable
                    columns={tableColumns}
                    data={filteredData}
                    pagination
                    striped
                    highlightOnHover
                    dense
                    responsive
                    customStyles={{
                        headCells: {
                            style: {
                                background: "#1E73BE",
                                color: "white",
                                fontWeight: "200",
                                fontSize: "12px",
                                textAlign: "center",
                                justifyContent: "center",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                borderRight: "1px solid #c9c9c9",
                            },
                        },
                        cells: {
                            style: {
                                textAlign: "center",
                                justifyContent: "center",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                paddingTop: "12px",
                                paddingBottom: "12px",
                                borderRight: "1px solid #e5e7eb",
                            },
                        },
                    }}
                />
            </div>

            {showModal && selectedRow && (
                <ViewDetailsModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    data={selectedRow}
                />
            )}
        </div>
    );
};

export default PEList;
