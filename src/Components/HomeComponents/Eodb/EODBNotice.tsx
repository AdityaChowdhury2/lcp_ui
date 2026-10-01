import { FC, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

interface EodbFile {
    id: number;
    title: string;
    fileName: string;
    fileUrl: string;
    createdDate: string;
}

const EodbNotice: FC = () => {
    const [files, setFiles] = useState<EodbFile[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const getFiles = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}eodb/eodb_notice`);

            if (!response.ok) {
                throw new Error("Failed to fetch files");
            }

            const data = await response.json();

            if (data?.code === 200) {
                setFiles(data.result || []);
            }
        } catch (error) {
            console.error("Error fetching EODB files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFiles();
    }, []);

    const columns: TableColumn<EodbFile>[] = [
        {
            name: "SL NO.",
            width: "100px",
            cell: (_row, index) => (page - 1) * limit + ((index ?? 0) + 1),
        },
        {
            name: "TITLE",
            selector: (row) => row.title,
            wrap: true,
            grow: 4,
        },
        {
            name: "CREATED DATE",
            selector: (row) =>
                new Date(row.createdDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            width: "180px",
        },
        {
            name: "ACTION",
            width: "120px",
            center: true,
            cell: (row) => (
                <button
                    onClick={() => window.open(row.fileUrl, "_blank")}
                    className="flex justify-center w-full"
                >
                    <img
                        src={`${IMAGE_BASE}pdf.png`}
                        alt="pdf"
                        className="w-6 cursor-pointer"
                    />
                </button>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
            <h1 className="text-3xl italic text-gray-700 mb-4">
                EODB Notice
            </h1>

            <DataTable
                columns={columns}
                data={files}
                progressPending={loading}
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
                noDataComponent="No records found"
                customStyles={{
                    headCells: {
                        style: {
                            fontWeight: "bold",
                            fontSize: "13px",
                            backgroundColor: "#3a2310",
                            color: "#fff",
                        },
                    },
                    cells: {
                        style: {
                            width: "100%",
                            position: "relative",
                            borderRight: "1px solid #3a2310",
                            borderBottom: "1px solid #55351a",
                        },
                    },
                    rows: {
                        style: {
                            fontSize: "13px",
                            borderLeft: "1px solid #55351a",
                        },
                    },
                }}
            />
        </div>
    );
};

export default EodbNotice;