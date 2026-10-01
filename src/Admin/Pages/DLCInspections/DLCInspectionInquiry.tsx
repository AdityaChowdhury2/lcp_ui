import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import axios from "axios";
import {
  AlertCircle,
  Building,
  CheckCircle,
  MapPin,
  Search,
  Send,
  Shield
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface DistrictOption {
  districtCode: string;
  districtName: string;
}

interface Factory {
  id?: number | string;
  factory_id?: number | string;
  s_factory_name: string;
  s_addrline: string;
  license_no: string | null;
  registration_no: string | null;
  district_name: string;
  district_code: string;
  state_name: string;
  state_code: number;
  country_name: string;
  country_code: number;
  sub_division_name: string;
  sub_division_code: string;
  police_station_name: string;
  police_station_code: string;
  block_name: string;
  block_type: string;
  block_code: number;
}

export const DLCInspectionInquiry: React.FC = () => {
  const token = getAuthToken() ?? "";
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("");

  const [factories, setFactories] = useState<Factory[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingFactories, setLoadingFactories] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>("");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Submit modal states
  const [submittingRow, setSubmittingRow] = useState<Factory | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Load districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch(`${API_BASE}trade-union/master-list/districts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("API server responded with error status");
        }

        const data = await response.json();
        const result = Array.isArray(data?.result) ? data.result : [];

        // Clean district code casing and remove "all" / "24" / "99" codes if present
        const mappedDistricts = result
          .map((d: any) => ({
            districtCode: String(d.districtCode),
            districtName: String(d.districtName)
          }))
          .filter((d: DistrictOption) => {
            const code = String(d.districtCode).trim().toLowerCase();
            const name = String(d.districtName).trim().toLowerCase();
            return !["24", "99", "all", "0"].includes(code) && !name.includes("all");
          });

        if (mappedDistricts.length > 0) {
          setDistricts(mappedDistricts);
        }
      } catch (err) {
        console.warn("Failed to load districts from API", err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [token]);

  // Load factories when district changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setFactories([]);
      return;
    }

    const loadFactories = async () => {
      setLoadingFactories(true);
      setFetchError("");
      setIsDemoMode(false);

      try {
        // Attempt POST to live labour portal endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL}/api/v1/getFactoriesByDistrict`,
          { districtCode: selectedDistrictCode },
          {
            headers: {
              "Content-Type": "application/json"
            },
            timeout: 10000 // 5 seconds timeout
          }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          setFactories(response.data);
          toast.success(`Successfully loaded ${response.data.length} factories from live server.`);
        } else {
          throw new Error("Empty response or invalid payload format from live server");
        }
      } catch (err: any) {
        console.warn("Live API post failed (CORS restriction or network offline)", err);
      } finally {
        setLoadingFactories(false);
      }
    };

    loadFactories();
  }, [selectedDistrictCode, districts]);

  // Filter factories based on search term
  const filteredFactories = factories.filter(factory => {
    const search = searchTerm.toLowerCase();
    return (
      factory.s_factory_name.toLowerCase().includes(search) ||
      (factory.s_addrline && factory.s_addrline.toLowerCase().includes(search)) ||
      (factory.license_no && factory.license_no.toLowerCase().includes(search)) ||
      (factory.registration_no && factory.registration_no.toLowerCase().includes(search)) ||
      (factory.police_station_name && factory.police_station_name.toLowerCase().includes(search))
    );
  });

  // Handle final row submission
  const triggerRowSubmission = (factory: Factory) => {
    setSubmittingRow(factory);
  };

  const confirmRowSubmission = async () => {
    if (!submittingRow) return;

    setIsSubmittingAction(true);
    const payload = {
      factory_id: Number(submittingRow.factory_id ?? submittingRow.id ?? submittingRow.license_no ?? 0),
      lc_inspection_status: "I",
      lc_scheduled_date: new Date().toISOString().split("T")[0],
      source: "I"
    };

    try {
      let response;
      try {
        response = await axios.post(
          `${import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL}/bb-inspections`,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      } catch (err: any) {
        if (err.response?.status === 404) {
          response = await axios.post(
            `${import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL}/bb-inspections`,
            payload,
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        } else {
          throw err;
        }
      }

      toast.success(`Inquiry for "${submittingRow.s_factory_name}" submitted successfully!`);
      setSubmittingRow(null);
    } catch (e: any) {
      console.error("Submission error:", e);
      toast.error(e.response?.data?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#ededed] p-4 md:p-6 font-sans select-none">

      {/* -------------------- HEADER -------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-[#1E73BE]" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Generate Inspection Order</h1>
          </div>
        </div>
      </div>

      {/* -------------------- SELECTION AND FILTERS -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">

        {/* District Selector Panel */}
        <div className="md:col-span-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            Select West Bengal District:
          </label>
          <div className="relative">
            <select
              value={selectedDistrictCode}
              onChange={(e) => setSelectedDistrictCode(e.target.value)}
              disabled={loadingDistricts}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-800 cursor-pointer shadow-sm hover:border-gray-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">- Choose District -</option>
              {districts.map(d => (
                <option key={d.districtCode} value={d.districtCode}>
                  {d.districtName} (Code {d.districtCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Local Search and Indicator Panel */}
        <div className="md:col-span-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">

          {/* Search Box */}
          <div className="w-full md:flex-1 relative">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Filter List Results:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search factory name, license, address, police station..."
                disabled={!selectedDistrictCode}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="w-full md:w-56 h-12 flex items-center justify-center border border-dashed rounded px-3 py-1 bg-gray-50/50">
            {loadingFactories ? (
              <span className="text-xs text-[#1E73BE] font-medium flex items-center gap-2">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1E73BE] border-t-transparent" />
                Loading factories...
              </span>
            ) : selectedDistrictCode ? (
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-800">
                  {filteredFactories.length} Records Found
                </span>
                {isDemoMode && (
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    Demo Mode Active
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                Please select a district to load factory records.
              </span>
            )}
          </div>

        </div>

      </div>

      {/* -------------------- FACTORIES LIST TABLE -------------------- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[350px]">
        {loadingFactories ? (
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <span className="animate-spin rounded-full h-10 w-10 border-4 border-[#1E73BE] border-t-transparent mb-4" />
            <p className="text-xs font-medium text-gray-500">Querying Factory database...</p>
          </div>
        ) : !selectedDistrictCode ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] p-6 text-center text-gray-400">
            <Building className="w-16 h-16 text-gray-300 mb-3" />
            <p className="font-semibold text-sm">No District Selected</p>
            <p className="text-xs max-w-xs mt-1 text-gray-400">Select a district from the dropdown menu above to search for registered factory listings.</p>
          </div>
        ) : filteredFactories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] p-6 text-center text-gray-400">
            <AlertCircle className="w-12 h-12 text-stone-300 mb-3" />
            <p className="font-semibold text-sm">No Records Match Search Query</p>
            <p className="text-xs max-w-xs mt-1 text-gray-400">Try modifying your search filter keywords or select another district.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E73BE] text-white uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-3 border-r border-blue-600/40 w-12 text-center">SL</th>
                  <th className="p-3 border-r border-blue-600/40 w-1/4">Factory Profile</th>
                  <th className="p-3 border-r border-blue-600/40 w-1/3">Address & Jurisdiction</th>
                  <th className="p-3 border-r border-blue-600/40 w-44">Identifiers</th>
                  <th className="p-3 border-r border-blue-600/40 w-40">Regional Blocks</th>
                  <th className="p-3 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFactories.map((factory, index) => {
                  const sl = index + 1;
                  return (
                    <tr key={factory.s_factory_name + index} className="hover:bg-gray-50/70 transition">

                      {/* SL */}
                      <td className="p-3 text-center border-r border-gray-100 text-gray-400 font-mono">
                        {sl}
                      </td>

                      {/* Factory Profile */}
                      <td className="p-3 border-r border-gray-100">
                        <span className="block font-bold text-gray-800 text-xs tracking-tight">
                          {factory.s_factory_name}
                        </span>
                        <span className="inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded mt-1 bg-sky-50 text-sky-800 border border-sky-100">
                          {factory.state_name} ({factory.country_name})
                        </span>
                      </td>

                      {/* Address & Jurisdiction */}
                      <td className="p-3 border-r border-gray-100 space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 leading-normal">{factory.s_addrline}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 pl-5">
                          <span>Police Station: {factory.police_station_name || "N/A"}</span>
                          <span className="text-gray-300">|</span>
                          <span>Sub-Division: {factory.sub_division_name || "N/A"}</span>
                        </div>
                      </td>

                      {/* Identifiers */}
                      <td className="p-3 border-r border-gray-100 space-y-1 font-mono text-[10px]">
                        <div>
                          <span className="text-gray-400 font-sans text-[9px] font-bold uppercase block">License Number:</span>
                          <span className={factory.license_no ? "text-gray-800 font-bold" : "text-stone-400 italic"}>
                            {factory.license_no || "Not Issued"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-sans text-[9px] font-bold uppercase block">Registration Number:</span>
                          <span className={factory.registration_no ? "text-[#1E73BE] font-bold" : "text-stone-400 italic"}>
                            {factory.registration_no || "Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Regional Blocks */}
                      <td className="p-3 border-r border-gray-100 space-y-1">
                        <div>
                          <span className="text-gray-400 text-[9px] font-bold uppercase block">Block Name:</span>
                          <span className="font-semibold text-gray-800">
                            {factory.block_name} ({factory.block_type === "M" ? "Municipality" : "Panchayat"})
                          </span>
                        </div>
                        <div className="font-mono text-[10px]">
                          <span className="text-gray-400 font-sans text-[9px] font-bold uppercase block">Block Code:</span>
                          <span>{factory.block_code}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => triggerRowSubmission(factory)}
                          className="flex items-center justify-center gap-1 w-full py-2 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs active:scale-95 duration-100"
                        >
                          <Send className="w-3 h-3" />
                          Submit
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------- INQUIRY SUBMISSION OVERLAY DIALOG -------------------- */}
      {submittingRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#1E73BE] text-white px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-sm leading-none">Confirm Inspection Inquiry</h3>
              </div>
              <button
                onClick={() => setSubmittingRow(null)}
                className="text-white/80 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-2 border-t pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Factory Name</p>
                <p className="text-sm font-bold text-gray-800">{submittingRow.s_factory_name}</p>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Address</p>
                <p className="text-xs text-gray-600 leading-normal">{submittingRow.s_addrline}</p>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Status</p>
                    <p className="text-xs font-semibold text-gray-800">{submittingRow.license_no || "Pending Approval"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">District</p>
                    <p className="text-xs font-semibold text-gray-800">{submittingRow.district_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3.5 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubmittingRow(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-55 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRowSubmission}
                disabled={isSubmittingAction}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-55 cursor-pointer shadow-sm"
              >
                {isSubmittingAction ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DLCInspectionInquiry;
