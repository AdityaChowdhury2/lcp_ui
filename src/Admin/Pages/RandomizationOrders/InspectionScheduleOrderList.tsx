import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";

/* ============================
   TYPES
============================ */
interface OrderDetail {
  id: number;
  inspector_id: number;
  inspector_name: string | null;
  inspector_mobile: string | null;
  inspector_department: string | null;
  assigned_block_id: number;
  assigned_block_name: string | null;
  alc_ins_date: string | null;
  alc_order_uploaded_path: string | null;
  alc_order_uploaded_file: string | null;
  date: string | null;
  created_at: string;
  updated_at: string;
  inspection_note_id: number | null;
  note_id: number | null;
  is_central?: number;
}

interface RandomizationOrder {
  id: number;
  dist_id: number;
  district_name: string;
  sub_id: number;
  subdivision_name: string;
  alc_id: number;
  alc_name: string | null;
  alc_mobile: string | null;
  dlc_id: number;
  dlc_name: string;
  dlc_mobile: string | null;
  randomization_date: string;
  file_name: string | null;
  uploaded_by: number;
  uploaded_date: string;
  created_at: string;
  details: OrderDetail[];
}

interface ApiResponse {
  data: RandomizationOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TableRow {
  sl: number;
  id: number;
  districtName: string;
  subdivisionName: string;
  alcName: string;
  dlcName: string;
  randomizationDate: string;
  details: OrderDetail[];
}

/* ============================
   TABLE COLUMNS
============================ */

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

const PAGE_LIMIT = 20;

/* ============================
   EXPANDED ACCORDION COMPONENT
============================ */
const ExpandedDetails: React.FC<{ data: TableRow }> = ({ data }) => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleViewInternalOrder = async (assignmentId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}inspections/generate-internal-inspection-order/${assignmentId}/pdf`,
        {
          responseType: "blob",
        },
      );

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Failed to open internal order PDF:", error);
    }
  };

  if (!data.details || data.details.length === 0) {
    return (
      <div className="p-4 text-xs font-semibold text-[#607080] bg-slate-50 border-t border-b border-slate-200">
        No inner details found for this order.
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border-t border-b border-slate-200 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
        Inspection Details & Inspector Assignments
      </h3>
      <div className="space-y-2 max-w-4xl">
        {data.details.map((detail, idx) => {
          const isOpen = openIndex === idx;
          const caseId = detail.inspection_note_id || detail.note_id || detail.id;
          const hasInspectionNote = !!(detail.inspection_note_id || detail.note_id);

          return (
            <div
              key={detail.id}
              className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
            >
              {/* Header */}
              <div
                onClick={() => toggleAccordion(idx)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">
                      {detail.assigned_block_name || "Unknown Block"}
                    </span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-xs text-slate-600 font-medium">
                      Inspector: {detail.inspector_name || "Not Assigned"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${hasInspectionNote
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                  >
                    {hasInspectionNote ? "Report Submitted" : "Pending Report"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Body */}
              {isOpen && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/20 text-xs text-slate-600 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-400">Inspector Dept:</span>{" "}
                        <span className="font-bold text-slate-700">
                          {detail.inspector_department || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Inspector Mobile:</span>{" "}
                        {detail.inspector_mobile ? (
                          <span className="font-bold text-indigo-600 font-mono">
                            {detail.inspector_mobile}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-700">-</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-400">ALC Inspection Date:</span>{" "}
                        <span className="font-bold text-slate-700">
                          {detail.alc_ins_date
                            ? new Date(detail.alc_ins_date).toLocaleDateString("en-IN")
                            : "TBD"}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Case ID:</span>{" "}
                        <span className="font-bold text-slate-700 font-mono">#{caseId}</span>
                      </div>
                    </div>
                  </div>

                  {(detail.is_central === 0 || hasInspectionNote) && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      {/* {detail.is_central === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInternalOrder(detail.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer"
                        >
                          Inspection Order
                        </button>
                      )} */}
                      {hasInspectionNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (detail.is_central === 1) {
                              navigate(`/alc-orders-list/${caseId}`);
                            } else {
                              navigate(`/inspection-list/final-submit?inspectionId=${detail.id}&source=dlc`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                          Inspect
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================
   COMPONENT
============================ */
const InspectionScheduleOrderList: React.FC = () => {
  const navigate = useNavigate();
  const columns: TableColumn<TableRow>[] = [
    { name: "SL NO", selector: (r) => r.sl, width: "80px", center: true },
    { name: "DISTRICT NAME", selector: (r) => r.districtName, grow: 1.5 },
    { name: "SUBDIVISION NAME", selector: (r) => r.subdivisionName, grow: 1.5 },
    { name: "ALC NAME", selector: (r) => r.alcName, grow: 1.5, wrap: true },
    { name: "DLC NAME", selector: (r) => r.dlcName, grow: 1.5, wrap: true },
    {
      name: "DATE",
      selector: (r) => r.randomizationDate,
      width: "160px",
    },
    {
      name: "ACTION",
      cell: (r) => (
        <div className="flex gap-2 item-center">
          <button
            onClick={() => handleView(r.id)}
            className="rounded bg-[#3b8dbc] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#2d6fa3]"
          >
            Order
          </button>
        </div>
      ),
      width: "120px",
      center: true,
    },
  ];

  const [rows, setRows] = useState<TableRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleView = async (id: number) => {
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

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await axios.get<ApiResponse>(
        `${API_BASE}inspections/randomization-orders?page=${page}&limit=${PAGE_LIMIT}`,
      );
      const { data, pagination } = res.data;
      setTotalRows(pagination.total);
      setRows(
        data.map((order, index) => ({
          sl: (page - 1) * PAGE_LIMIT + index + 1,
          id: order.id,
          districtName: order.district_name || "-",
          subdivisionName: order.subdivision_name || "-",
          alcName: order.alc_name || "-",
          dlcName: order.dlc_name || "-",
          randomizationDate: order.randomization_date
            ? new Date(order.randomization_date).toLocaleDateString("en-IN")
            : "-",
          details: order.details || [],
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto  space-y-6">
        <div className="rounded-xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-sm">
          <h1 className="text-[24px] font-semibold text-[#203040]">
            Randomized Order List
          </h1>
          <p className="mt-1 text-sm text-[#607080]">
            List of all submitted randomization inspection orders.
          </p>
        </div>

        <div className="rounded-xl border border-[#d7e0ea] bg-white shadow-sm overflow-x-auto">
          <DataTable
            columns={columns}
            data={rows}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={PAGE_LIMIT}
            paginationRowsPerPageOptions={[PAGE_LIMIT]}
            onChangePage={(page) => setCurrentPage(page)}
            striped
            customStyles={customStyles}
            expandableRows
            expandableRowsComponent={ExpandedDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default InspectionScheduleOrderList;
