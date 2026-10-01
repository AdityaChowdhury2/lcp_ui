import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";

interface OrderRow {
  sl: number;
  randomizationId: number;
  randomizationDate: string;
  dlcName: string;
}

interface OrderResponse {
  code: number;
  data: {
    sl_no: number;
    randomization_id: number;
    randomization_date: string;
    dlc_name: string;
  }[];
  total: number;
}

const customStyles = {
  table: { style: { border: "1px solid #ccc" } },
  headRow: {
    style: {
      backgroundColor: "#3b8dbc",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      minHeight: "36px",
    },
  },
  headCells: { style: { borderRight: "1px solid #ccc" } },
  rows: {
    style: { fontSize: "13px", minHeight: "34px" },
    stripedStyle: { backgroundColor: "#f2f2f2" },
  },
  cells: { style: { borderRight: "1px solid #ddd" } },
};

const InspectionOrderListForAlc: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async (userId: number) => {
    try {
      setLoading(true);

      const res = await axios.get<OrderResponse>(
        `${API_BASE}inspections/alc/orders?userId=${userId}`,
      );

      const rows = res.data.data.map((item, index) => ({
        sl: index + 1,
        randomizationId: item.randomization_id,
        randomizationDate: item.randomization_date
          ? new Date(item.randomization_date).toLocaleDateString("en-IN")
          : "-",
        dlcName: item.dlc_name || "-",
      }));

      setOrders(rows);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();

    if (userId) {
      fetchOrders(Number(userId));
    }
  }, []);

  const columns: TableColumn<OrderRow>[] = [
    {
      name: "SL NO",
      selector: (row) => row.sl,
      width: "100px",
    },
    {
      name: "DLC NAME",
      selector: (row) => row.dlcName,
    },
    {
      name: "DATE",
      selector: (row) => row.randomizationDate,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(`/inspection-submission-list/${row.randomizationId}`)
            }
            className="rounded bg-[#3b8dbc] px-3 py-1 text-white"
          >
            View
          </button>

          <button
            onClick={() => handleGenerate(row.randomizationId)}
            className="rounded bg-[#28a745] px-3 py-1 text-white"
          >
            Inspection Order
          </button>
        </div>
      ),
    },
  ];

  const handleGenerate = async (id: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}inspections/randomization-orders/${id}/pdf`,
        {
          responseType: "blob",
        },
      );

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");

      // Optional cleanup after some time
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to open PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="text-xl font-semibold mb-5">Randomization Orders</h2>

        <DataTable
          columns={columns}
          data={orders}
          progressPending={loading}
          pagination
          striped
          customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default InspectionOrderListForAlc;
