import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useState } from "react";
import { FaSearch, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const ViewInspectionReport: React.FC = () => {
  const navigate = useNavigate();
  const [fileNo, setFileNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const value = fileNo.trim();
    if (!value) {
      toast.warn("Please enter an inspection file number.");
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);

      const res = await axios.get(
        `${API_BASE}inspections/normal-preview/${encodeURIComponent(value)}`,
      );

      // normal-preview returns { locked, submitted, data }
      if (res.data?.locked && res.data?.data) {
        navigate(
          `/view-inspection-report/preview?inspectionId=${encodeURIComponent(
            value,
          )}&source=ins&public=true`,
        );
      } else {
        setNotFound(true);
        toast.error("No inspection note found for this file number.");
      }
    } catch (error) {
      console.error("Failed to search inspection note", error);
      setNotFound(true);
      toast.error("No inspection note found for this file number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#f4f7fb] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-[#d7e0ea] bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f1f8] text-[#3b8dbc]">
              <FaFileAlt size={24} />
            </div>
            <h1 className="text-2xl font-bold text-[#203040]">
              View &amp; Download Inspection Note
            </h1>
            <p className="mt-2 text-sm text-[#607080]">
              Enter your inspection file number to view and download the
              inspection note.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FaSearch
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={fileNo}
                onChange={(e) => {
                  setFileNo(e.target.value);
                  setNotFound(false);
                }}
                placeholder="e.g. WBLC-INSP-27520"
                className="w-full rounded-lg border border-[#d7e0ea] px-9 py-3 text-sm focus:border-[#3b8dbc] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#3b8dbc] px-6 py-3 text-sm font-semibold text-white hover:bg-[#327aa5] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {notFound && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              No inspection note found for this file number. Please check the
              number and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewInspectionReport;
