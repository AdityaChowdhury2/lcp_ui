import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCommentAlt,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { API_BASE, IMAGE_BASE } from "../../constants/constants";
import { getAuthToken } from "../../utils/auth";
import { encryptionDecryptionFun } from "../../utils/encryption";

interface RemarkItem {
  id: number;
  remarkText: string;
  remarkBy: number | null;
  remarkTo: number | null;
  remarkDate: string | null;
  remarkByName: string | null;
  remarkType: string | null;
  remarkByRole: number | null;
}

const getRemarkTypeBadge = (type: string | null, actId: string | null) => {
  if (!type) {
    return <span className="text-gray-500">-</span>;
  }
  const t = type.toUpperCase().trim();
  let imageName = "";
  let altText = t;

  switch (t) {
    case "I":
      imageName = "btn-issued.png";
      altText = "Issued";
      break;
    case "VA":
      imageName = "btn-approved.png";
      altText = "Approved";
      break;
    case "B":
      imageName = "btn-rectification.png";
      altText = "Rectification";
      break;
    case "BI":
      imageName = "btn-inspector.png";
      altText = "Back to Inspector";
      break;
    case "R":
      imageName = "btn-reject.png";
      altText = "Rejected";
      break;
    case "N":
    case "F":
      imageName = "btn-to-alc.png";
      altText = "Forwarded";
      break;
    case "V":
      if (actId === "4" || actId === "42" || actId === "43") {
        imageName = "btn-approved.png";
        altText = "Approved";
      } else {
        imageName = "btn-fees-pending.png";
        altText = "Fees Pending";
      }
      break;
    case "T":
      imageName = "btn-fees-paid.png";
      altText = "Fees Paid";
      break;
    case "S":
      imageName = "btn-final-submit.png";
      altText = "Final Submitted";
      break;
    case "U":
      imageName = "btn-rectify-signed-form.png";
      altText = "FORM-I Backed";
      break;
    case "0":
    case "P":
      imageName = "btn-applied.png";
      altText = "Applied / Pending";
      break;
    case "RN":
      imageName = "btn-applied.png";
      altText = "Applied";
      break;
    default:
      return <span className="text-gray-500">{t}</span>;
  }

  return (
    <img
      src={`${IMAGE_BASE}${imageName}`}
      alt={altText}
      className="object-contain w-auto h-auto max-w-none max-h-none"
    />
  );
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ApplicantRemarksHistory = () => {
  const navigate = useNavigate();
  const { encActId, encAppId } = useParams<{ encActId: string; encAppId: string }>();

  const [remarks, setRemarks] = useState<RemarkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Debounced search trigger helper
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const decryptedActId = encActId ? encryptionDecryptionFun("decrypt", encActId) : null;
  const actName = getActName();

  function getActName() {
    try {
      switch (decryptedActId) {
        case "1":
          return "Contract Labour (Regulation & Abolition) Act, 1970 - Registration";
        case "2":
          return "Building and Other Construction Workers (RECS) Act, 1996 - Registration";
        case "3":
          return "Motor Transport Workers Act, 1961 - Registration";
        case "4":
          return "Inter-State Migrant Workmen (RECS) Act, 1979 - Registration";
        case "12":
        case "13":
        case "14":
          return "Contract Labour (Regulation & Abolition) Act, 1970 - License";
        case "42":
        case "43":
          return "Inter-State Migrant Workmen (RECS) Act, 1979 - License";
        default:
          return "Labour Department Application";
      }
    } catch {
      return "Labour Department Application";
    }
  }

  useEffect(() => {
    const fetchRemarks = async () => {
      if (!encActId || !encAppId) return;
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (debouncedSearch) queryParams.append("search", debouncedSearch);
        if (filterType) queryParams.append("remarkType", filterType);

        const response = await axios.get(
          `${API_BASE}misc/remarks/${encodeURIComponent(encActId)}/${encodeURIComponent(
            encAppId
          )}?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        if (response.data) {
          setRemarks(response.data.data || []);
          setTotalCount(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (err: any) {
        console.error("Failed to load remarks:", err);
        setError("Unable to load remarks history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRemarks();
  }, [encActId, encAppId, page, limit, debouncedSearch, filterType]);

  const skip = (page - 1) * limit;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* BACK ACTION & HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center bg-white border hover:bg-gray-100 p-2.5 rounded-lg shadow-sm transition duration-200"
            title="Go Back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Remarks History</h1>
            <p className="text-sm text-[#1e7aa5] font-medium mt-0.5">{actName}</p>
          </div>
        </div>

        {/* FILTERS & SEARCH ROW */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm" />
            </span>
            <input
              type="text"
              placeholder="Search remarks, officers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7aa5]/50 focus:border-[#1e7aa5] transition"
            />
          </div>

          {/* Type Filter Dropdown - Uncomment after full testing*/}
          {/* <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
              <FaFilter className="text-xs text-gray-400" /> Filter:
            </span>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="text-sm border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1e7aa5]/50 focus:border-[#1e7aa5] bg-white transition min-w-[160px]"
            >
              <option value="">All Remarks</option>
              <option value="I">Approved / Issued</option>
              <option value="B">Send Back / Correction</option>
              <option value="R">Rejected</option>
              <option value="F">Forwarded</option>
              <option value="V">Fees Pending</option>
              <option value="T">Fees Paid</option>
              <option value="S">Form-I Submitted</option>
            </select>
          </div> */}
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FaSpinner className="animate-spin text-[#1e7aa5] text-4xl" />
              <p className="text-sm text-gray-500 font-medium">Loading remarks history...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-medium">{error}</div>
          ) : remarks.length === 0 ? (
            <div className="p-16 text-center text-gray-500 font-medium flex flex-col items-center gap-2">
              <FaCommentAlt className="text-gray-300 text-4xl mb-1" />
              <p>No remarks history found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-gray-200 rounded-md">
                  <thead className="bg-[#3C8DBC] text-white font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 text-center border-r border-[#3C8DBC]/20 w-[8%]">
                        Sl. No.
                      </th>
                      <th className="p-4 border-r border-[#3C8DBC]/20 w-[18%]">
                        Date
                      </th>
                      <th className="p-4 border-r border-[#3C8DBC]/20 w-[45%]">
                        Remark
                      </th>
                      <th className="p-4 border-r border-[#3C8DBC]/20 w-[15%]">
                        Status
                      </th>
                      <th className="p-4 w-[14%]">
                        Remark By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {remarks.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/80 transition duration-150 border-b border-gray-100"
                      >
                        <td className="p-4 text-center font-medium text-gray-500 border-r border-gray-200">
                          {skip + index + 1}
                        </td>
                        <td className="p-4 font-medium text-gray-600 whitespace-nowrap border-r border-gray-200">
                          {formatDate(item.remarkDate)}
                        </td>
                        <td className="p-4 font-normal text-gray-800 leading-relaxed break-words max-w-[400px] border-r border-gray-200">
                          {item.remarkText}
                        </td>
                        <td className="p-4 border-r border-gray-200">
                          {getRemarkTypeBadge(item.remarkType, decryptedActId)}
                        </td>
                        <td className="p-4 font-semibold text-gray-600">
                          {item.remarkByName || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4 bg-gray-50 text-gray-600">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">
                      Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} remarks
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 font-medium">Rows per page:</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="text-xs border rounded py-1 px-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1e7aa5] cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="flex items-center justify-center p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition cursor-pointer"
                    >
                      <FaChevronLeft className="text-xs text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-600 font-semibold px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="flex items-center justify-center p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition cursor-pointer"
                    >
                      <FaChevronRight className="text-xs text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantRemarksHistory;
