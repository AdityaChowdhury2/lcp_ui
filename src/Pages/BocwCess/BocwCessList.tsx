import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import {
  Building2,
  Search,
  FileText,
  DollarSign,
  ShieldCheck,
  Eye,
  RotateCcw,
  ArrowLeft,
  Filter,
  Calendar,
  MapPin,
  Building,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { saveAs } from "file-saver";
import { getAuthToken } from "@/utils/auth";
import { BocwCessDetailsModal } from "./BocwCessDetailsModal";
import { BocwCessMetricCard } from "./BocwCessMetricCard";

export interface ObpassCessRecord {
  id: number;
  applicant_type?: number;
  applicant_name?: string;
  applicant_mobile?: string;
  applicant_email?: string;
  applicant_address?: string;
  applicant_post_office?: string;
  applicant_pin?: number;
  applicant_police_station?: string;
  applicant_aadhar?: string;
  applicant_pan?: string;
  organisation_type?: string;
  organisation_name?: string;
  organisation_mobile?: string;
  organisation_email?: string;
  organisation_pin?: number;
  organisation_address?: string;
  organisation_aadhar?: string;
  ulb_id?: number;
  district_id?: number;
  ulb_type_id?: number;
  ulb_name?: string;
  district?: string;
  ulb_type?: string;
  ward_no?: string;
  block_name?: string;
  plot_no_type?: string;
  plot_no?: string;
  site_police_station?: string;
  premises_number?: string;
  site_post_office?: string;
  site_pin?: number;
  site_plan_status?: number;
  reference_number?: string;
  building_classification?: string;
  site_latitude?: string;
  site_longitude?: string;
  character_of_property?: string;
  estimated_cost?: number;
  total_labour_cess?: number;
  bocw_labour_cess?: number;
  ulb_labour_cess?: number;
  payment_date?: string;
  created_at?: string;
}

export interface DropdownOption {
  key: string | number;
  value: string;
}

/**
 * BOCW Cess Collection Data List View Component using DataTable
 */
export const BocwCessList: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [records, setRecords] = useState<ObpassCessRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalCess: 0,
    totalBocw: 0,
    totalUlb: 0,
  });

  const normalizeRecord = (r: any): ObpassCessRecord => {
    const estCost = Number(r.estimated_cost ?? r.estimatedCost ?? 0);
    const totalCess = Number(
      r.total_labour_cess ??
      r.totalLabourCess ??
      (estCost ? estCost * 0.01 : 0)
    );
    const bocwCess = Number(
      r.bocw_labour_cess ??
      r.bocwLabourCess ??
      (totalCess ? totalCess * 0.99 : 0)
    );
    const ulbCess = Number(
      r.ulb_labour_cess ??
      r.ulbLabourCess ??
      (totalCess ? totalCess * 0.01 : 0)
    );

    return {
      id: r.id,
      applicant_type: r.applicant_type ?? r.applicantType,
      applicant_name: r.applicant_name ?? r.applicantName ?? "N/A",
      applicant_mobile: r.applicant_mobile ?? r.applicantMobile ?? "N/A",
      applicant_email: r.applicant_email ?? r.applicantEmail ?? "N/A",
      applicant_address: r.applicant_address ?? r.applicantAddress ?? "N/A",
      applicant_post_office: r.applicant_post_office ?? r.applicantPostOffice ?? "N/A",
      applicant_pin: r.applicant_pin ?? r.applicantPin,
      applicant_police_station: r.applicant_police_station ?? r.applicantPoliceStation ?? "N/A",
      applicant_aadhar: r.applicant_aadhar ?? r.applicantAadhar ?? "N/A",
      applicant_pan: r.applicant_pan ?? r.applicantPan ?? "N/A",
      organisation_type: r.organisation_type ?? r.organisationType,
      organisation_name: r.organisation_name ?? r.organisationName,
      organisation_mobile: r.organisation_mobile ?? r.organisationMobile,
      organisation_email: r.organisation_email ?? r.organisationEmail,
      organisation_address: r.organisation_address ?? r.organisationAddress,
      ulb_id: r.ulb_id ?? r.ulbId,
      district_id: r.district_id ?? r.districtId,
      ulb_type_id: r.ulb_type_id ?? r.ulbTypeId,
      ulb_name: r.ulb_name ?? r.ulbName ?? (r.ulb_id || r.ulbId ? `ULB ID: ${r.ulb_id || r.ulbId}` : "N/A"),
      district: r.district ?? r.districtName ?? (r.district_id || r.districtId ? `District ID: ${r.district_id || r.districtId}` : "N/A"),
      ulb_type: r.ulb_type ?? r.ulbType,
      ward_no: r.ward_no ?? r.wardNo ?? "N/A",
      block_name: r.block_name ?? r.blockName ?? "N/A",
      plot_no_type: r.plot_no_type ?? r.plotNoType ?? "N/A",
      plot_no: r.plot_no ?? r.plotNo ?? "N/A",
      site_police_station: r.site_police_station ?? r.sitePoliceStation,
      premises_number: r.premises_number ?? r.premisesNumber,
      site_post_office: r.site_post_office ?? r.sitePostOffice,
      site_pin: r.site_pin ?? r.sitePin,
      site_plan_status: r.site_plan_status ?? r.sitePlanStatus,
      reference_number: r.reference_number ?? r.referenceNumber ?? "N/A",
      building_classification: r.building_classification ?? r.buildingClassification ?? "N/A",
      site_latitude: r.site_latitude ?? r.siteLatitude,
      site_longitude: r.site_longitude ?? r.siteLongitude,
      character_of_property: r.character_of_property ?? r.characterOfProperty ?? "N/A",
      estimated_cost: estCost,
      total_labour_cess: totalCess,
      bocw_labour_cess: bocwCess,
      ulb_labour_cess: ulbCess,
      payment_date: r.payment_date ?? r.paymentDate,
      created_at: r.created_at ?? r.createdAt,
    };
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [districtOptions, setDistrictOptions] = useState<DropdownOption[]>([]);
  const [selectedUlb, setSelectedUlb] = useState<string>("");
  const [ulbOptions, setUlbOptions] = useState<DropdownOption[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<ObpassCessRecord | null>(null);

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API_BASE}obpass-cess/districts`, {
        headers: getAuthHeaders(),
      });
      const list = response.data?.data;
      if (Array.isArray(list)) {
        setDistrictOptions(
          list.map((item: any) =>
            typeof item === "object" && item !== null && "key" in item
              ? { key: item.key, value: String(item.value) }
              : { key: item, value: String(item) }
          )
        );
      }
    } catch (e) {
      console.error("Could not fetch districts from API:", e);
    }
  };

  const fetchUlbs = async (districtName?: string | number) => {
    try {
      const params: Record<string, string | number> = {};
      if (districtName !== undefined && districtName !== null && String(districtName).trim()) {
        params.district = String(districtName).trim();
      }
      const response = await axios.get(`${API_BASE}obpass-cess/ulbs`, {
        params,
        headers: getAuthHeaders(),
      });
      const list = response.data?.data;
      if (Array.isArray(list)) {
        setUlbOptions(
          list.map((item: any) =>
            typeof item === "object" && item !== null && "key" in item
              ? { key: item.key, value: String(item.value) }
              : { key: item, value: String(item) }
          )
        );
      }
    } catch (e) {
      console.error("Could not fetch ULBs from API:", e);
    }
  };

  const fetchRecords = async (
    page: number = currentPage,
    limit: number = perPage,
    filters?: {
      search?: string;
      district?: string;
      ulb?: string;
      fromDate?: string;
      toDate?: string;
    }
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      const activeSearch = filters?.search !== undefined ? filters.search : searchTerm;
      const activeDistrict = filters?.district !== undefined ? filters.district : selectedDistrict;
      const activeUlb = filters?.ulb !== undefined ? filters.ulb : selectedUlb;
      const activeFromDate = filters?.fromDate !== undefined ? filters.fromDate : fromDate;
      const activeToDate = filters?.toDate !== undefined ? filters.toDate : toDate;

      if (activeSearch.trim()) params.search = activeSearch.trim();
      if (activeDistrict.trim()) params.district = activeDistrict.trim();
      if (activeUlb.trim()) params.ulb = activeUlb.trim();
      if (activeFromDate) params.fromDate = activeFromDate;
      if (activeToDate) params.toDate = activeToDate;

      const response = await axios.get(`${API_BASE}obpass-cess`, {
        params,
        headers: getAuthHeaders(),
      });
      const resp = response.data;
      const rawData = Array.isArray(resp)
        ? resp
        : resp?.data ?? [];

      const normalized = rawData.map(normalizeRecord);
      setRecords(normalized);

      const total = resp?.total ?? resp?.summary?.totalCount ?? normalized.length;
      setTotalRows(total);

      if (resp?.summary) {
        setStats({
          totalCount: Number(resp.summary.totalCount || 0),
          totalCess: Number(resp.summary.totalCess || 0),
          totalBocw: Number(resp.summary.totalBocw || 0),
          totalUlb: Number(resp.summary.totalUlb || 0),
        });
      } else {
        const totalCess = normalized.reduce((acc: number, r: ObpassCessRecord) => acc + (Number(r.total_labour_cess) || 0), 0);
        const totalBocw = normalized.reduce((acc: number, r: ObpassCessRecord) => acc + (Number(r.bocw_labour_cess) || 0), 0);
        const totalUlb = normalized.reduce((acc: number, r: ObpassCessRecord) => acc + (Number(r.ulb_labour_cess) || 0), 0);
        setStats({ totalCount: total, totalCess, totalBocw, totalUlb });
      }
    } catch (error) {
      console.error("Failed to fetch OBPASS Cess records:", error);
      setRecords([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1, perPage);
    fetchDistricts();
    fetchUlbs();
  }, []);

  useEffect(() => {
    fetchUlbs(selectedDistrict);
  }, [selectedDistrict]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRecords(1, perPage, {
      search: searchTerm,
      district: selectedDistrict,
      ulb: selectedUlb,
      fromDate,
      toDate,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedDistrict("");
    setSelectedUlb("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    fetchRecords(1, perPage, {
      search: "",
      district: "",
      ulb: "",
      fromDate: "",
      toDate: "",
    });
    fetchUlbs("");
  };

  const [exporting, setExporting] = useState<boolean>(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedDistrict.trim()) params.district = selectedDistrict.trim();
      if (selectedUlb.trim()) params.ulb = selectedUlb.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await axios.get(`${API_BASE}obpass-cess/export-excel`, {
        params,
        headers: getAuthHeaders(),
        responseType: "blob",
      });

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateTimeStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const fileName = `UDMA_Cess_Collection_Report_${dateTimeStr}.xls`;

      saveAs(new Blob([response.data], { type: "application/vnd.ms-excel" }), fileName);
    } catch (error) {
      console.error("Failed to download Excel report from API:", error);
    } finally {
      setExporting(false);
    }
  };



  const columns: TableColumn<ObpassCessRecord>[] = [
    {
      name: "Sl No",
      cell: (_row, index) => (currentPage - 1) * perPage + index + 1,
      width: "75px",
      center: true,
    },
    {
      name: "Reference No",
      selector: (row) => row.reference_number || "N/A",
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-blue-700 font-mono">
          {row.reference_number || "N/A"}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Applicant Name",
      selector: (row) => row.applicant_name || "",
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="font-medium text-gray-900">{row.applicant_name || "N/A"}</div>
          {row.applicant_mobile && row.applicant_mobile !== "N/A" && (
            <div className="text-xs text-gray-500">{row.applicant_mobile}</div>
          )}
        </div>
      ),
      grow: 1,
      minWidth: "180px",
    },
    {
      name: "ULB & District",
      selector: (row) => row.ulb_name || row.district || "",
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="text-gray-900 font-medium">
            {row.ulb_name || `ULB ID: ${row.ulb_id || "N/A"}`}
          </div>
          <div className="text-xs text-gray-500">
            {row.district || `District ID: ${row.district_id || "N/A"}`}
          </div>
        </div>
      ),
      grow: 1,
      minWidth: "180px",
    },
    {
      name: "Est. Cost (₹)",
      selector: (row) => row.estimated_cost ?? 0,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-medium text-gray-800">
          {row.estimated_cost
            ? `₹${Number(row.estimated_cost).toLocaleString("en-IN")}`
            : "N/A"}
        </span>
      ),
      width: "140px",
      right: true,
    },
    {
      name: "Total Cess (₹)",
      selector: (row) => row.total_labour_cess ?? 0,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-700">
          {row.total_labour_cess
            ? `₹${Number(row.total_labour_cess).toLocaleString("en-IN")}`
            : "N/A"}
        </span>
      ),
      width: "135px",
      right: true,
    },
    {
      name: "BOCW Share (99%)",
      selector: (row) => row.bocw_labour_cess ?? 0,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-semibold text-purple-700">
          {row.bocw_labour_cess
            ? `₹${Number(row.bocw_labour_cess).toLocaleString("en-IN")}`
            : "N/A"}
        </span>
      ),
      width: "145px",
      right: true,
    },
    {
      name: "ULB Share (1%)",
      selector: (row) => row.ulb_labour_cess ?? 0,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-semibold text-amber-700">
          {row.ulb_labour_cess
            ? `₹${Number(row.ulb_labour_cess).toLocaleString("en-IN")}`
            : "N/A"}
        </span>
      ),
      width: "135px",
      right: true,
    },
    {
      name: "Payment Date",
      selector: (row) => (row.payment_date ? new Date(row.payment_date).getTime() : 0),
      sortable: true,
      cell: (row) => (
        <span className="text-gray-600 text-xs">
          {row.payment_date
            ? new Date(row.payment_date).toLocaleDateString("en-IN")
            : "N/A"}
        </span>
      ),
      width: "125px",
    },
    {
      name: "Action",
      center: true,
      width: "110px",
      cell: (row) => (
        <button
          onClick={() => setSelectedRecord(row)}
          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-md text-xs transition-all border border-blue-200 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#0f172a",
        color: "#ffffff",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        minHeight: "46px",
      },
    },
    headCells: {
      style: {
        color: "#ffffff",
        paddingLeft: "14px",
        paddingRight: "14px",
      },
    },
    cells: {
      style: {
        paddingLeft: "14px",
        paddingRight: "14px",
        fontSize: "0.875rem",
      },
    },
    rows: {
      style: {
        minHeight: "52px",
        "&:hover": {
          backgroundColor: "#f0f9ff",
          transition: "all 0.15s ease",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        fontSize: "0.75rem",
      },
    },
  };

  return (
    <div className="w-full max-w-full">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <BocwCessMetricCard
          title="Total Applications"
          value={stats.totalCount}
          icon={<FileText className="w-6 h-6" />}
          iconBgClass="bg-blue-50 text-blue-600"
          valueColorClass="text-gray-900"
        />

        <BocwCessMetricCard
          title="Total Cess Collected"
          value={`₹${stats.totalCess.toLocaleString("en-IN")}`}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgClass="bg-emerald-50 text-emerald-600"
          valueColorClass="text-emerald-700"
        />

        <BocwCessMetricCard
          title="BOCW Share (99%)"
          value={`₹${stats.totalBocw.toLocaleString("en-IN")}`}
          icon={<ShieldCheck className="w-6 h-6" />}
          iconBgClass="bg-purple-50 text-purple-600"
          valueColorClass="text-purple-700"
        />

        <BocwCessMetricCard
          title="ULB Share (1%)"
          value={`₹${stats.totalUlb.toLocaleString("en-IN")}`}
          icon={<Building2 className="w-6 h-6" />}
          iconBgClass="bg-amber-50 text-amber-600"
          valueColorClass="text-amber-700"
        />
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        {/* Filter Header Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" /> Filter & Search Records
          </div>
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            Apply parameters below to filter Cess records
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Hero Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Reference Number, Applicant Name, Mobile or ULB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Grid of Selectors & Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* District Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDistrict(val);
                  setSelectedUlb("");
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">All Districts</option>
                {districtOptions.map((dist) => (
                  <option key={String(dist.value)} value={String(dist.value)}>
                    {dist.key}
                  </option>
                ))}
              </select>
            </div>

            {/* ULB Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-600" /> ULB
              </label>
              <select
                value={selectedUlb}
                onChange={(e) => setSelectedUlb(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">All ULBs</option>
                {ulbOptions.map((ulbItem) => (
                  <option key={String(ulbItem.value)} value={String(ulbItem.value)}>
                    {ulbItem.key}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs text-blue-900 font-semibold">
                Total Records Found: <span className="font-bold text-blue-950">{totalRows}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-5 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" /> Apply Filters
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs border border-gray-300 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All
              </button>

              <button
                onClick={exportToExcel}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {exporting ? "Exporting..." : "Download Excel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={records}
          progressPending={loading}
          progressComponent={
            <div className="py-16 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              Loading Cess collection records...
            </div>
          }
          noDataComponent={
            <div className="py-16 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">No records found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search criteria or reset filters.
              </p>
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={currentPage}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 20, 50, 100, 500]}
          onChangePage={(page) => {
            setCurrentPage(page);
            fetchRecords(page, perPage);
          }}
          onChangeRowsPerPage={(newPerPage, page) => {
            setPerPage(newPerPage);
            setCurrentPage(page);
            fetchRecords(page, newPerPage);
          }}
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
        />
      </div>

      {/* Details Modal Component */}
      <BocwCessDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};

export default BocwCessList;

