import { API_BASE } from "@/constants/constants";
import axios from "axios";
import { FC, useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaClipboardCheck, FaEdit, FaEye, FaRegBuilding, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthToken, getUserId, getUserName, getUserRole } from "../../../utils/auth";

interface InspectionRow {
  id: string;
  factory_id: number | string;
  name: string;
  reg_no: string;
  district: string;
  sub_division: string;
  block_name: string;
  address: string;
  status: string; // generic string to support raw workflow status codes
  priority?: number | null;
  noc_no?: string | null;
}

const statusMetadata: Record<string, { label: string; colorClass: string }> = {
  I: {
    label: "Initiated & Forwarded To Deputy Labour Commissioner",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200"
  },
  ALC: {
    label: "Lying With Assistant Labour Commissioner",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  DLC: {
    label: "Inspection Submitted To Deputy Labour Commissioner",
    colorClass: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  LC: {
    label: "Inspection Submitted To Labour Commissioner",
    colorClass: "bg-sky-50 text-sky-700 border-sky-200"
  },
  BDLC: {
    label: "Sent Back To Deputy Labour Commissioner",
    colorClass: "bg-orange-50 text-orange-700 border-orange-200"
  },
  BALC: {
    label: "Sent Back To Assistant Labour Commissioner",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200"
  },
  JSLD: {
    label: "Forwarded To Joint Secretary",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200"
  },
  C: {
    label: "Joint Secretary Approved",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  BLC: {
    label: "Sent Back To Labour Commissioner",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200"
  },
  NOC: {
    label: "No Objection Certificate Given",
    colorClass: "bg-green-50 text-green-700 border-green-200"
  }
};


const getStatusDetails = (status: string | null | undefined) => {
  const code = String(status || "").trim().toUpperCase();
  return statusMetadata[code] || {
    label: status || "N/A",
    colorClass: "bg-gray-50 text-gray-700 border-gray-200"
  };
};

const isPendingStatus = (status: string): boolean => {
  const s = status.toUpperCase();
  return s === "I" || s === "BDLC" || s === "PENDING";
};

const isSubmittedStatus = (status: string): boolean => {
  const s = status.toUpperCase();
  return s !== "I" && s !== "BDLC" && s !== "PENDING";
};

const DLCInspections: FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [role, setRole] = useState<number | null>(null);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  console.log("selectedStatus", selectedStatus);
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const role = Number(getUserRole());
    if (role === 4) {
      setSelectedStatus("ALC");
    } else if (role === 5) {
      setSelectedStatus("DLC");
    } else if (role === 12) {
      setSelectedStatus("LC");
    }
  }, [])

  // Debounce search text changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Reset page to 1 when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, debouncedSearchText]);

  // User geographical profile state
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loadingLoc, setLoadingLoc] = useState<boolean>(true);

  // Modal states for forwarding to ALC
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [activeRow, setActiveRow] = useState<InspectionRow | null>(null);

  // 1. Fetch user geographical profile on mount
  useEffect(() => {
    const currentRole = Number(getUserRole());
    setRole(currentRole);

    const loadUserLoc = async () => {
      if (currentRole === 12) {
        setLoadingLoc(false);
        return;
      }
      try {
        if (getAuthToken()) {
          const response = await axios.get<any>(
            `${API_BASE}dashboard/rlo-details`,
          );
          if (response.data?.result) {
            setUserLocation(response.data.result);
          }
        }
      } catch (err) {
        console.error("Failed to load user location details:", err);
      } finally {
        setLoadingLoc(false);
      }
    };

    loadUserLoc();
  }, []);

  // 2. Query /bb-inspections/list whenever location, role, selectedStatus, or debouncedSearchText changes
  useEffect(() => {
    if (loadingLoc) return;

    const loadInspectionsList = async () => {
      setLoading(true);
      try {
        let districtCode: string | undefined;
        let subDivCode: string | undefined;
        let blockCode: string | undefined;

        if (userLocation) {
          districtCode = userLocation.district_code ? String(userLocation.district_code) : undefined;
          subDivCode = userLocation.subdivision_code ? String(userLocation.subdivision_code) : undefined;
          blockCode = userLocation.block_code ? String(userLocation.block_code) : undefined;
        }

        // Build Payload with pagination
        const payload: any = {
          page,
          limit
        };
        if (role === 12) {
          // no location filter
        } else if (role === 5) {
          payload.district_code = districtCode;
        } else if (role === 4) {
          payload.district_code = districtCode;
          payload.sub_division_code = subDivCode;
        } else if (role === 7) {
          payload.block_code = blockCode;
        }

        // Add selected status to payload if present
        if (selectedStatus) {
          payload.lc_inspection_status = selectedStatus;
        }

        // Add search key to payload if present
        if (debouncedSearchText.trim()) {
          payload.search = debouncedSearchText.trim();
        }

        // Fetch Inspections List
        const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
        const response = await axios.post(
          `${base_url}/bb-inspections/list`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success && Array.isArray(response.data?.data)) {
          const apiRows = response.data.data;
          const mapped: InspectionRow[] = apiRows.map((item: any) => ({
            id: String(item.id),
            factory_id: item.factory_id,
            name: String(item.s_factory_name || "N/A"),
            reg_no: String(item.registration_no || item.license_no || "N/A"),
            district: String(item.district_name || "N/A"),
            sub_division: String(item.sub_division_name || "N/A"),
            block_name: String(item.block_name || "N/A"),
            address: String(item.s_addrline || "N/A"),
            status: String(item.lc_inspection_status || "N/A"),
            priority: item.priority !== undefined && item.priority !== null ? Number(item.priority) : null,
            noc_no: item.noc_no ? String(item.noc_no) : null,
          }));
          setInspections(mapped);

          const total = response.data?.pagination?.total ?? mapped.length;
          setTotalRows(total);
        } else {
          setInspections([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Failed to load inspections list:", err);
        setInspections([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    loadInspectionsList();
  }, [role, userLocation, loadingLoc, selectedStatus, debouncedSearchText, refreshTrigger, page, limit]);

  const filteredInspections = useMemo(() => {
    return inspections;
  }, [inspections]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setLimit(newPerPage);
    setPage(page);
  };

  const handleAction = (id: string, mode: "view" | "inspect") => {
    navigate(`/closure-verification/${id}`);
  };

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleForwardToALC = (row: InspectionRow) => {
    setActiveRow(row);
    setRemarks("");
    setShowForwardModal(true);
  };

  const handleForwardSubmit = async () => {
    if (!activeRow) return;

    const remarksText = remarks.trim() || "Lying With Assistant Labour Commissioner";

    setUpdatingId(activeRow.id);
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;

      const payload = {
        id: Number(activeRow.id),
        factory_id: Number(activeRow.factory_id),
        lc_inspection_status: "ALC",
        remarks: [
          {
            source: "LC",
            remarks: remarksText,
            remarks_by_id: Number(getUserId() || 0),
            remarks_by_name: getUserName() ?? "",
            remarks_by_role_id: Number(getUserRole() || 5),
            remarks_to_role_id: 4,
            inspection_status: "ALC"
          }
        ]
      };

      const response = await axios.post(
        `${base_url}/bb-inspections/update`,
        payload,
        { headers }
      );

      if (response.data?.success || response.data?.code === 200) {
        toast.success("Inspection successfully forwarded to ALC!");
        setShowForwardModal(false);
        setActiveRow(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(response.data?.message || "Failed to forward inspection to ALC.");
      }
    } catch (err: any) {
      console.error("Error forwarding to ALC:", err);
      toast.error(err.response?.data?.message || "An error occurred while forwarding.");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: TableColumn<InspectionRow>[] = [
    {
      name: "SL",
      width: "60px",
      cell: (_row, index) => <div className="font-semibold text-gray-500">{(index ?? 0) + 1}</div>,
    },
    {
      name: "NAME OF ESTABLISHMENT",
      selector: (row) => row.name,
      sortable: true,
      width: "250px",
      cell: (row) => (
        <div className="flex items-center gap-2 py-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
            <FaRegBuilding className="text-sm" />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{row.name}</div>
            <div className="text-[11px] text-gray-400">{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      name: "REGISTRATION NO",
      selector: (row) => row.reg_no,
      sortable: true,
      width: "180px",
      cell: (row) => <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{row.reg_no}</span>,
    },
    {
      name: "NOC NO",
      selector: (row) => row.noc_no || "N/A",
      sortable: true,
      width: "150px",
      cell: (row) => <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{row.noc_no || "N/A"}</span>,
    },
    {
      name: "DISTRICT / SUB-DIVISION",
      selector: (row) => row.district,
      sortable: true,
      width: "180px",
      cell: (row) => (
        <div>
          <div className="text-gray-700 font-medium">{row.district}</div>
          <div className="text-[11px] text-gray-400">{row.sub_division}</div>
        </div>
      ),
    },
    {
      name: "BLOCK NAME",
      selector: (row) => row.block_name,
      sortable: true,
      width: "130px",
      cell: (row) => <span className="text-gray-700">{row.block_name}</span>,
    },
    {
      name: "ADDRESS",
      selector: (row) => row.address,
      width: "200px",
      cell: (row) => <span className="text-gray-600 text-xs line-clamp-2">{row.address}</span>,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      sortable: true,
      width: "350px",
      cell: (row) => {
        const details = getStatusDetails(row.status);
        return (
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded border ${details.colorClass}`}>
            {details.label}
          </span>
        );
      },
    },
    {
      name: "ACTIONS",
      width: "130px",
      cell: (row) => {
        const isSuperAdmin = role === 12;
        const isDLC = role === 5;
        const isALC = role === 4;

        if (isSuperAdmin) {
          const s = row.status.toUpperCase();
          if (s === "LC") {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "inspect")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <FaEdit className="text-xs" /> Verify
              </button>
            );
          } else if (isSubmittedStatus(row.status)) {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "view")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
              >
                <FaEye className="text-xs" /> View
              </button>
            );
          }
          return <button
            onClick={() => handleAction(String(row.factory_id), "view")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <FaEye className="text-xs" /> View
          </button>
        }

        if (isDLC) {
          const s = row.status.toUpperCase();
          if (s === "I" || s === "BDLC") {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "view")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <FaEye className="text-xs" /> View
              </button>
            );
          } else if (s === "DLC") {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "inspect")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <FaEdit className="text-xs" /> Verify
              </button>
            );
          } else {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "view")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <FaEye className="text-xs" /> View
              </button>
            );
          }
        }

        if (isALC) {
          const s = row.status.toUpperCase();
          if (s === "ALC" || s === "BALC") {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "inspect")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs transition-colors"
              >
                <FaEdit className="text-xs" /> Inspect
              </button>
            );
          } else {
            return (
              <button
                onClick={() => handleAction(String(row.factory_id), "view")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
              >
                <FaEye className="text-xs" /> View
              </button>
            );
          }
        }

        // Default / Fallback for developer review/inspect
        return (
          <div className="flex gap-1">
            <button
              onClick={() => handleAction(String(row.factory_id), "view")}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="View"
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleAction(String(row.factory_id), "inspect")}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
              title="Inspect"
            >
              <FaEdit />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaClipboardCheck className="text-blue-600" /> Inspection List
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage, review, and process establishment inspections assigned to District Labour Commissioners.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="relative w-full sm:w-64">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 cursor-pointer shadow-xs"
            >
              {role === 4 ? (
                <>
                  <option value="ALC">Lying With Assistant Labour Commissioner</option>
                  <option value="BALC">Sent Back To Assistant Labour Commissioner</option>
                  <option value="I">Initiated & Forwarded To Deputy Labour Commissioner</option>
                  <option value="DLC">Inspection Submitted To Deputy Labour Commissioner</option>
                  <option value="LC">Inspection Submitted To Labour Commissioner</option>
                  <option value="BDLC">Send Back To Deputy Labour Commissioner</option>
                  <option value="JSLD">Forwarded To Joint Secretary</option>
                  <option value="C">Joint Secretary Approved</option>
                  <option value="BLC">Sent Back To Labour Commissioner</option>
                  <option value="NOC">No Objection Certificate Given</option>
                </>
              ) : role === 5 ? (
                <>
                  <option value="DLC">Inspection Submitted To Deputy Labour Commissioner</option>
                  <option value="I">Initiated & Forwarded To Deputy Labour Commissioner</option>
                  <option value="BDLC">Send Back To Deputy Labour Commissioner</option>
                  <option value="ALC">Lying With Assistant Labour Commissioner</option>
                  <option value="LC">Inspection Submitted To Labour Commissioner</option>
                  <option value="BALC">Sent Back To Assistant Labour Commissioner</option>
                  <option value="JSLD">Forwarded To Joint Secretary</option>
                  <option value="C">Joint Secretary Approved</option>
                  <option value="BLC">Sent Back To Labour Commissioner</option>
                  <option value="NOC">No Objection Certificate Given</option>
                </>
              ) : role === 12 ? (
                <>
                  <option value="LC">Inspection Submitted To Labour Commissioner</option>
                  <option value="BLC">Sent Back To Labour Commissioner</option>
                  <option value="I">Initiated & Forwarded To Deputy Labour Commissioner</option>
                  <option value="ALC">Lying With Assistant Labour Commissioner</option>
                  <option value="DLC">Inspection Submitted To Deputy Labour Commissioner</option>
                  <option value="BDLC">Send Back To Deputy Labour Commissioner</option>
                  <option value="BALC">Sent Back To Assistant Labour Commissioner</option>
                  <option value="JSLD">Forwarded To Joint Secretary</option>
                  <option value="C">Joint Secretary Approved</option>
                  <option value="NOC">No Objection Certificate Given</option>
                </>
              ) : (
                <>
                  <option value="I">Initiated & Forwarded To Deputy Labour Commissioner</option>
                  <option value="ALC">Lying With Assistant Labour Commissioner</option>
                  <option value="DLC">Inspection Submitted To Deputy Labour Commissioner</option>
                  <option value="LC">Inspection Submitted To Labour Commissioner</option>
                  <option value="BDLC">Send Back To Deputy Labour Commissioner</option>
                  <option value="BALC">Sent Back To Assistant Labour Commissioner</option>
                  <option value="JSLD">Forwarded To Joint Secretary</option>
                  <option value="C">Joint Secretary Approved</option>
                  <option value="BLC">Sent Back To Labour Commissioner</option>
                  <option value="NOC">No Objection Certificate Given</option>
                </>
              )}
              <option value="">- All Statuses -</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-80 shadow-xs">
            <input
              type="text"
              placeholder="Search by name, reg no, district..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
            <FaSearch className="absolute left-4 top-2.5 text-slate-400 text-sm" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredInspections}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          highlightOnHover
          responsive
          progressPending={loading}
          conditionalRowStyles={[
            {
              when: (row) => row.priority === 1,
              style: {
                backgroundColor: "#fee2e2",
                "&:hover": {
                  backgroundColor: "#fecaca",
                },
              },
            },
          ]}
          progressComponent={
            <div className="flex flex-col items-center justify-center p-12 gap-2 text-gray-500">
              <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E73BE] border-t-transparent" />
              <p className="text-xs font-semibold mt-1">Querying Factory Database...</p>
            </div>
          }
          noDataComponent={
            <div className="p-8 text-center text-gray-500">
              No matching inspections found.
            </div>
          }
          customStyles={{
            headCells: {
              style: {
                background: "linear-gradient(135deg, #1E73BE 0%, #175D9C 100%)",
                color: "white",
                fontWeight: "600",
                fontSize: "12px",
                letterSpacing: "0.05em",
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                paddingTop: "14px",
                paddingBottom: "14px",
                textTransform: "uppercase",
              },
            },
            rows: {
              style: {
                fontSize: "13px",
                borderBottom: "1px solid #f1f5f9",
                minHeight: "56px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                },
              },
            },
            cells: {
              style: {
                paddingTop: "8px",
                paddingBottom: "8px",
                borderRight: "1px solid #f1f5f9",
              },
            },
          }}
        />
      </div>

      {/* Modal for Forwarding to ALC */}
      {showForwardModal && activeRow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Forward to ALC
              </h3>

              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setActiveRow(null);
                }}
                disabled={updatingId !== null}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                You are forwarding <strong className="text-slate-900">{activeRow.name}</strong> to the Assistant Labour Commissioner (ALC).
              </p>
              <div className="mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Lying With Assistant Labour Commissioner"
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none bg-white text-slate-800 placeholder-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If left blank, remarks will default to &quot;Lying With Assistant Labour Commissioner&quot;.
                </p>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForwardModal(false);
                  setActiveRow(null);
                }}
                disabled={updatingId !== null}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForwardSubmit}
                disabled={updatingId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer disabled:bg-indigo-400 shadow-sm flex items-center gap-1.5"
              >
                {updatingId === activeRow.id ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    Forwarding...
                  </>
                ) : (
                  "Confirm Forward"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DLCInspections;
