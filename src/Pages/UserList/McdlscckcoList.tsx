// src/Pages/ActsRules.tsx (or wherever you keep it)
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import DataTable, {
  type TableColumn,
  type ConditionalStyles,
} from "react-data-table-component";
import { Button } from "../../Components/ui/button";
import { Input } from  "../../Components/ui/input"
import { Search } from "lucide-react";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

type ApiActRule = {
  act_title: string;
  act?: string;
  rules?: string;
  notification?: string;
  [key: string]: unknown;
};

interface ActRuleRow extends ApiActRule {
  _rowIndex: number;
}

const McdlscckcoList: React.FC = () => {
  const [data, setData] = useState<ActRuleRow[]>([]);

  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}actsandrules`)
      .then((res) => {
        const raw = Array.isArray(res?.data)
          ? (res.data as ApiActRule[])
          : ((res?.data?.data ?? []) as ApiActRule[]);

        const withIndex: ActRuleRow[] = raw.map((item, idx) => ({
          ...item,
          _rowIndex: idx,
        }));

        setData(withIndex);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      });
  }, [API_BASE]);

  const columns: TableColumn<ActRuleRow>[] = useMemo(
    () => [
      {
        name: "SL. NO.",
        selector: (row) => row._rowIndex + 1,

        cell: (row) => <div className=" text-center">{row._rowIndex + 1}.</div>,
        sortable: true,
      },
      {
        name: "USERNAME",
        selector: (row) => row.act_title,

        cell: (row) => <div className=" break-words">{row.act_title}</div>,
        sortable: true,
      },
      {
        name: "AREA",
        selector: (row) => row.rules ?? "",

        center: true,
        cell: () => (
          <div className="flex items-center  justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="Rules PDF" />
          </div>
        ),
      },
      {
        name: "NAME",
        selector: (row) => row.notification ?? "",

        cell: () => (
          <div className="flex items-center  justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="Notification PDF" />
          </div>
        ),
      },
      {
        name: "EMAIL ADDRESS",
        selector: (row) => row.notification ?? "",

        cell: () => (
          <div className="flex items-center  justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="Notification PDF" />
          </div>
        ),
      },
      {
        name: "PHONE",
        selector: (row) => row.notification ?? "",

        cell: () => (
          <div className="flex items-center  justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="Notification PDF" />
          </div>
        ),
      },
      {
        name: "LAST LOGIN TIME",
        selector: (row) => row.notification ?? "",

        cell: () => (
          <div className="flex items-center  justify-center">
            <img src={`${IMAGE_BASE}pdf.png`} alt="Notification PDF" />
          </div>
        ),
      },
      {
        name: "ACTION",
        selector: (row) => row.notification ?? "",

        cell: () => (
          <div className="w-full">
            <Button className="h-5 bg-[#3d9970] px-[5px] py-[1px] block w-full text-[12px] leading-1.5 mb-[5px] rounded-[3px] shadow-none border border-transparent">
              Edit Info
            </Button>
          
          </div>
        ),
      },
    ],
    []
  );

  const conditionalRowStyles: ConditionalStyles<ActRuleRow>[] = [
    {
      when: (row) => row._rowIndex % 2 === 0,
      style: { backgroundColor: "#ffffff" },
    },
    {
      when: (row) => row._rowIndex % 2 !== 0,
      style: { backgroundColor: "#eee" },
    },
  ];

  const filteredItems = data.filter(
  item => item.act_title && item.act_title.toLowerCase().includes(filterText.toLowerCase())
);

  const subHeaderComponentMemo = useMemo(() => {
  return (
    <div className="flex justify-between items-center mb-2 mt-3">
      <Input
        type="text"
        placeholder="Search MCDLSCCKCO..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        className="px-4 py-2 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
      />
    </div>
  );
}, [filterText]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto bg-white shadow-sm">
        

        <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#3c8dbc] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
          <div className="h-[500px] overflow-y-auto">
            <DataTable
              columns={columns}
           data={filteredItems}                          // ← important: filtered data
           subHeader
          subHeaderComponent={subHeaderComponentMemo}
              customStyles={{
                tableWrapper: {
                  style: {
                    border: "1px solid #c6b8ae",
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: "#3c8dbc",
                    color: "#fff",
                    borderBottom: "2px solid #c6b8ae",
                  },
                },
                headCells: {
                  style: {
                    padding: "12px 10px",
                 
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
                    padding: "8px",
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

export default McdlscckcoList;
