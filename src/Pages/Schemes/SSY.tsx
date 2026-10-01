import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn, ConditionalStyles } from "react-data-table-component";

interface SSYItem {
  id?: number;
  title?: string;
  view?: string;
  [key: string]: any;
  _rowIndex: number;
}

const SSY: React.FC = () => {
  const [data, setData] = useState<SSYItem[]>([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}samajik-suraksha-yojana`)
      .then((res) => {
        const arr = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data ?? [];

        const withIndex = arr.map((item: any, idx: number) => ({
          ...item,
          _rowIndex: idx,
        }));

        setData(withIndex);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      });
  }, []);

  const columns: TableColumn<SSYItem>[] = useMemo(
    () => [
      {
        name: "SL NO.",
        selector: (row) => row._rowIndex + 1,
        width: "80px",
        cell: (row) => (
          <div className="text-center w-20 px-2 py-3">
            {row._rowIndex + 1}.
          </div>
        ),
        sortable: true,
      },
      {
        name: "TITLE",
        selector: (row) => row.title || "",
        grow: 2,
        cell: (row) => (
          <div className="px-4 py-3 break-words">
            {row.title}
          </div>
        ),
        sortable: true,
      },
      {
        name: "VIEW",
        selector: (row) => row.view || "",
        width: "140px",
        cell: () => (
          <div className="px-4 py-3 flex items-center justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="pdf" />
          </div>
        ),
      },
    ],
    []
  );

  const conditionalRowStyles: ConditionalStyles<SSYItem>[] = [
    {
      when: (row) => row._rowIndex % 2 === 0,
      style: { backgroundColor: "#ffffff" },
    },
    {
      when: (row) => row._rowIndex % 2 !== 0,
      style: { backgroundColor: "#e1ddd6" },
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 bg-white">
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm">
        <h2 className="text-center text-2xl font-semibold text-[#5b3f2f] mb-4">
          Samajik Suraksha Yojana
        </h2>

        <div className="w-full overflow-hidden border border-[#e7dfd6] rounded">
          <div className="h-[500px] overflow-y-auto">
            <DataTable
              columns={columns}
              data={data}
              customStyles={{
                tableWrapper: {
                  style: { border: "1px solid #c6b8ae" },
                },
                headRow: {
                  style: {
                    backgroundColor: "#4b3022",
                    color: "#fff",
                    borderBottom: "2px solid #c6b8ae",
                  },
                },
                headCells: {
                  style: {
                    padding: "12px 10px",
                    fontWeight: "700",
                    borderRight: "1px solid #c6b8ae",
                  },
                },
                rows: {
                  style: {
                    minHeight: "48px",
                    borderBottom: "1px solid #c6b8ae",
                  },
                },
                cells: {
                  style: {
                    padding: "0",
                    borderRight: "1px solid #c6b8ae",
                  },
                },
              }}
              conditionalRowStyles={conditionalRowStyles}
              noHeader
              pagination
              responsive
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSY;
