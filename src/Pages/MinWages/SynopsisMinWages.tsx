import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import React, { FC, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useLocation } from "react-router-dom";

// ------------------
// TYPES
// ------------------
interface WageRow {
    id: number;
    employment: string;
    hasFile: boolean;
    fileUrl: string
}

interface LegacyRow {
    id: number;
    employment: string;
    area: string;
    unskilled: number | string;
    semiSkilled: number | string;
    skilled: number | string;
    highlySkilled: number | string;
    validUpto: string;
    fileUrl: string
}

// const data: WageRow[] = [
//     {
//         id: 1,
//         name: "Minimum Rates of Wages for Public Motor Transport Workers for the period March 2026 to August 2026 in West Bengal",
//         pdf: "/pdfs/doc1.pdf",
//     },
//     {
//         id: 2,
//         name: "Minimum Wages for Public Motor Transport Workers for the period September 2025 to February 2026 in West Bengal",
//         pdf: "/pdfs/doc2.pdf",
//     },
//     {
//         id: 3,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on January-2026",
//         pdf: "/pdfs/doc3.pdf",
//     },
//     {
//         id: 4,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on July-2025",
//         pdf: "/pdfs/doc4.pdf",
//     },
//     {
//         id: 5,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on January-2025",
//         pdf: "/pdfs/doc5.pdf",
//     },
//     {
//         id: 6,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on July-2024",
//         pdf: "/pdfs/doc6.pdf",
//     },
//     {
//         id: 7,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on January-2024",
//         pdf: "/pdfs/doc7.pdf",
//     },
//     {
//         id: 8,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on July-2023",
//         pdf: "/pdfs/doc8.pdf",
//     },
//     {
//         id: 9,
//         name: "Minimum Rates of Wages in Scheduled Employments in West Bengal as on January-2023",
//         pdf: "/pdfs/doc9.pdf",
//     },
// ];

const SynopsisMinWages: FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [allTableData, setAllTableData] = useState<WageRow[]>([]);
    const [filteredData, setFilteredData] = useState<WageRow[]>([]);
    const [allLegacyData, setAllLegacyData] = useState<LegacyRow[]>([]);
    const [filteredLegacyData, setFilteredLegacyData] = useState<LegacyRow[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);


    const columns: TableColumn<WageRow>[] = [
        {
            name: "SL NO.",
            width: "100px",
            cell: (_row, index) => {
                const isSearching = searchText.trim() !== "";

                return isSearching
                    ? (index ?? 0) + 1
                    : ((page - 1) * limit) + ((index ?? 0) + 1);
            }
        },
        {
            name: "SCHEDULED EMPLOYMENTS",
            selector: (row) => row.employment,
            wrap: true,
            grow: 4,
        },
        {
            name: "DOWNLOAD",
            center: true,
            cell: (row) => {
                if (row.hasFile) {
                    return (
                        <button
                            onClick={() => window.open(row.fileUrl)}
                            className="flex justify-center w-full"
                        >
                            <img
                                src={`${IMAGE_BASE}pdf.png`}
                                alt="pdf"
                                className="w-[24px] cursor-pointer"
                            />
                        </button>
                    );
                }

                return (
                    <span className="text-gray-500 text-sm">
                        No File Available
                    </span>
                );
            },
        }
        // {
        //     name: "",
        //     width: "100px",
        //     cell: (row) => (
        //         <button
        //             onClick={() => window.open(row.pdf)}
        //             className="flex justify-center w-full"
        //         >
        //             <img
        //                 src={`${IMAGE_BASE}pdf.png`} // 👉 your pdf icon path
        //                 alt="pdf"
        //                 className="w-[24px] cursor-pointer"
        //             />
        //         </button>
        //     ),
        //     center: true,
        // },
    ];

    const columnsForLegacy: TableColumn<LegacyRow>[] = [
        {
            name: "SL NO.",
            width: "100px",
            cell: (_row, index) => {
                const isSearching = searchText.trim() !== "";

                return isSearching
                    ? (index ?? 0) + 1
                    : ((page - 1) * limit) + ((index ?? 0) + 1);
            }
        },
        {
            name: "SCHEDULED EMPLOYMENTS",
            selector: (row) => row.employment,
            wrap: true,
            // grow: 4,
        },
        {
            name: "AREA",
            selector: (row) => row.area,
            wrap: true,
            // grow: 4,
        },
        {
            name: "UNSKILLED",
            selector: (row) => row.unskilled,
            wrap: true,
            // grow: 4,
        },
        {
            name: "SEMI-SKILLED",
            selector: (row) => row.unskilled,
            wrap: true,
            grow: 4,
        },
        {
            name: "SKILLED",
            selector: (row) => row.skilled,
            wrap: true,
            grow: 4,
        },
        {
            name: "HIGHLY SKILLED",
            selector: (row) => row.highlySkilled,
            wrap: true,
            grow: 4,
        },
        {
            name: "VALID UPTO",
            selector: (row) => row.validUpto,
            wrap: true,
            grow: 4,
        },
        // {
        //     name: "DOWNLOAD",
        //     center: true,
        //     cell: (row) => {
        //         return (
        //             <button
        //                 onClick={() => window.open(row.fileUrl)}
        //                 className="flex justify-center w-full"
        //             >
        //                 <img
        //                     src={`${IMAGE_BASE}pdf.png`}
        //                     alt="pdf"
        //                     className="w-[24px] cursor-pointer"
        //                 />
        //             </button>
        //         );
        //     }
        // },
        // {
        //     name: "",
        //     width: "100px",
        //     cell: (row) => (
        //         <button
        //             onClick={() => window.open(row.pdf)}
        //             className="flex justify-center w-full"
        //         >
        //             <img
        //                 src={`${IMAGE_BASE}pdf.png`} // 👉 your pdf icon path
        //                 alt="pdf"
        //                 className="w-[24px] cursor-pointer"
        //             />
        //         </button>
        //     ),
        //     center: true,
        // },
    ];
    const location = useLocation()

    const month = location?.state?.month;

    const year = location?.state?.year;

    const type = location?.state?.type;

    //console.log(month, year, type);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                let result;

                if (type === "legacy") {
                    response = await fetch(
                        `${API_BASE}minimum-wages/get-employment-wise-minimum-wages/2015`
                    );
                    result = await response.json();
                    setAllLegacyData(result);
                } else {
                    response = await fetch(
                        `${API_BASE}minimum-wages/get-employment-wise-minimum-wages/${month}/${year}`
                    );
                    result = await response.json();
                    setAllTableData(result);
                    setFilteredData(result);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [month, year, type]);

    useEffect(() => {
        const search = searchText?.toLowerCase().trim();

        if (type === "legacy") {
            if (!search) {
                setFilteredLegacyData(allLegacyData);
            } else {
                const filtered = allLegacyData.filter((item) =>
                    item.employment?.toLowerCase()?.includes(search) ||
                    item.area?.toLowerCase()?.includes(search) ||
                    String(item.unskilled)?.toLowerCase()?.includes(search) ||
                    String(item.semiSkilled)?.toLowerCase()?.includes(search) ||
                    String(item.skilled)?.toLowerCase()?.includes(search) ||
                    String(item.highlySkilled)?.toLowerCase()?.includes(search) ||
                    String(item.validUpto)?.toLowerCase()?.includes(search)
                );

                setFilteredLegacyData(filtered);
            }
        } else {
            if (!search) {
                setFilteredData(allTableData);
            } else {
                const filtered = allTableData.filter((item) =>
                    item.employment?.toLowerCase()?.includes(search)
                );

                setFilteredData(filtered);
            }
        }

        setPage(1); // reset page on search
    }, [searchText, type, allTableData, allLegacyData]);

    return (
        <div className="p-[20px]">
            <h1 className="text-4xl italic text-gray-700 mb-4">
               {type!=="legacy"? `The Minimum Rates of Wages in Scheduled Employments in West Bengal as on ${month}, ${year}`:"Synopsis of Minimum Rates of Wages in Scheduled Employments in West Bengal as on 01.07.2015."}
            </h1>

            <div className="flex justify-end mb-3">
                <input
                    type="text"
                    placeholder="Search..."
                    className="border px-2 py-1 w-72 border-[#111] text-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {type !== "legacy" ? (
                <DataTable<WageRow>
                    columns={columns}
                    data={filteredData}
                    striped
                    highlightOnHover
                    dense
                    pagination
                    paginationPerPage={limit}
                    onChangePage={(p) => setPage(p)}
                    onChangeRowsPerPage={(newLimit, p) => {
                        setLimit(newLimit);
                        setPage(p);
                    }}
                    customStyles={{
                        headCells: {
                            style: {
                                fontWeight: "bold",
                                fontSize: "13px",
                                backgroundColor: "#3a2310",
                                color: "#fff"
                            },
                        },
                        cells: {
                            style: {
                                borderRight: "1px solid #3a2310",
                                borderBottom: "1px solid #55351a",
                            },
                        },
                        rows: {
                            
                            style: {
                                fontSize: "13px",
                                borderLeft: '1px solid #55351a'
                            },
                        },
                    }}
                />
            ) : (
                <DataTable<LegacyRow>
                    columns={columnsForLegacy}
                    data={filteredLegacyData}
                    striped
                    highlightOnHover
                    dense
                    pagination
                    paginationPerPage={limit}
                    onChangePage={(p) => setPage(p)}
                    onChangeRowsPerPage={(newLimit, p) => {
                        setLimit(newLimit);
                        setPage(p);
                    }}
                    // paginationTotalRows={totalRows}
                    // onChangePage={(p) => setPage(p)}
                    // onChangeRowsPerPage={(newLimit, p) => {
                    //     setLimit(newLimit);
                    //     setPage(p);
                    // }}
                    customStyles={{
                        headCells: {
                            style: {
                                fontWeight: "bold",
                                fontSize: "13px",
                                backgroundColor: "#3a2310",
                                color: "#fff"
                            },
                        },
                        cells: {
                            style: {
                                borderRight: "1px solid #3a2310",
                                borderBottom: "1px solid #55351a",
                            },
                        },
                        rows: {
                            style: {
                                fontSize: "13px",
                                borderLeft: '1px solid #55351a'
                            },
                        },
                    }}
                />)}
        </div>
    );
};

export default SynopsisMinWages;