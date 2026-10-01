import React, { useEffect, useState } from "react";
import { ACTS, API_BASE, IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from '../../../utils/auth'
// import DataTable from "react-data-table-component";
import DataTable, { TableColumn } from "react-data-table-component";
// import * as XLSX from "xlsx";
import * as XLSX from "xlsx-js-style";
import { saveAs } from 'file-saver';

interface ContractorVData {
  id: number;
  contractor_name: string;
  nature_of_work: string;
  duration_from_date: string;
  duration_to_date: string;
  status: string;
  email: string;
  address_line1: string;
  subdivision: string;
  district: string;
  state: string;
  no_of_contract_labour?: number | string;
  formv_serial_number?: string;
  /** Null for contractors that were never amended. */
  contractor_parent_id?: number | string | null;
  /** True when the contractor predates the amendment and already holds a Form-V. */
  existed_before_amendment?: boolean;
  formv_reference_number?: string;
  /** Server verdict: issued application + contractor not carried over. */
  can_download_form_v?: boolean;
  /** A license application exists in l_contractor_license_application for this serial. */
  has_license_application?: boolean;
  /** Date this contractor was first added (amendment date or reg date). */
  added_date?: string | null;
  /** "AMENDMENT" | "REGISTRATION" — which kind of date added_date is. */
  added_date_type?: string;
}

function ContractorFormV() {
  const [allTableData, setAllTableData] = useState<ContractorVData[]>([]);
  const [tableData, setTableData] = useState<ContractorVData[]>([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate()

  const location = useLocation()

  const appId = location.state?.appId;
  const isIsmwAct = location.state?.isIsmwAct;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();

    const getSuffix = (d: number) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${day}${getSuffix(day)} ${month}, ${year}`;
  };

  const isFormVApplicable = (row: ContractorVData) => {
    const labour = Number(row.no_of_contract_labour);
    return !isNaN(labour) && labour > 10;
  };

  const columns: TableColumn<any>[] = [
    {
      name: "Sl No.",
      cell: (_row, index) => index + 1,
      width: "80px",
    },
    {
      name: <div>Contractor Name</div>,
      selector: row => row.contractor_name,
      wrap: true,
    },
    {
      name: <div>Nature of Work</div>,
      selector: row => row.nature_of_work || "-",
      wrap: true,
    },
    {
      name: <div>Duration of Contract</div>,
      cell: row => (
        <div className="text-center">
          {formatDate(row.duration_from_date)} <br />
          To <br />
          {formatDate(row.duration_to_date)}
        </div>
      ),
      wrap: true,
    },
    {
      name: <div>No. of Contract Labour</div>,
      selector: row => row.no_of_contract_labour || "-",
      center: true,
      wrap: true,
    },
    {
      name: "Status",
      cell: (row) => {
        const noOfLabour = Number(row.no_of_contract_labour);

        const isFormVApplicable =
          !isNaN(noOfLabour) && noOfLabour >= 10;

        return (
          <span
            className={
              isFormVApplicable
                ? "text-orange-600 font-medium"
                : "text-gray-500 font-medium"
            }
          >
            {isFormVApplicable
              ? (row.status || "IN PROCESS")
              : "Not Applicable"}
          </span>
        );
      },
    },
    {
      name: "View & Download",
      cell: (row) => {
        const noOfLabour = Number(row.no_of_contract_labour);

        // If a license application has been filed against this Form-V serial we
        // show its reference number (the Form-V has been consumed); if none
        // exists the contractor can still download the Form-V.
        const hasLicenseApplication = !!row.has_license_application;

        // ISMW (Form-VI) keeps its existing rule; the labour threshold still
        // decides whether a fresh Form-V is applicable at all.
        const isFormVApplicable =
          isIsmwAct
            ? true
            : (!isNaN(noOfLabour) && noOfLabour >= 10);

        return (
          <div className="flex flex-col gap-1 text-blue-600 text-xs">
            <p
              onClick={() => navigate(`/view-contractor-details/${row.id}`)}
              className="flex items-center gap-1 cursor-pointer hover:text-blue-800"
            >
              <IoIosArrowDroprightCircle />
              View Details
            </p>

            <p className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
              <IoIosArrowDroprightCircle />
              Edit Details
            </p>

            {/* A license application exists for this Form-V serial -> show its
                ref no on the list. Otherwise offer the download when the labour
                threshold applies. */}
            {!isIsmwAct && hasLicenseApplication ? (
              <p className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-gray-700">
                <span className="flex items-center gap-1">
                  <IoIosArrowDroprightCircle />
                  Ref. No.:{" "}
                  <span className="font-semibold">
                    {row.formv_reference_number ??
                      String(row.formv_serial_number ?? "").padStart(7, "0")}
                  </span>
                </span>
                {row.added_date && (
                  <span className="text-gray-600">
                    {row.added_date_type === "AMENDMENT"
                      ? "Amendment Date"
                      : "Reg. Date"}
                    :{" "}
                    <span className="font-semibold">
                      {formatDate(row.added_date)}
                    </span>
                  </span>
                )}
              </p>
            ) : isFormVApplicable ? (
              <p
                onClick={() =>
                  navigate(isIsmwAct ? "/form-VI-pdf" : "/form-V-pdf", {
                    state: {
                      appId,
                      formVSerialNo: row.formv_serial_number,
                    },
                  })
                }
                className="flex items-center gap-1 cursor-pointer hover:text-blue-800"
              >
                <IoIosArrowDroprightCircle />
                Download {isIsmwAct ? "Form-VI" : "Form-V"}
              </p>
            ) : (
              <p className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
                <IoIosArrowDroprightCircle />
                Download Form-V (N/A)
              </p>
            )}

            <p className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
              <IoIosArrowDroprightCircle />
              Download License
            </p>
          </div>
        );
      },
      width: "220px",
    },
  ];

  useEffect(() => {
    const getallTableData = async () => {
      const url = isIsmwAct
        ? `${API_BASE}ismw/contractor-list?enPeAppId=${encodeURIComponent(appId)}`
        : `${API_BASE}contractor-license/contractor-list?enPeAppId=${encodeURIComponent(appId)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        }
      },)

      const result = await res.json()

      console.log(result);
      setAllTableData(result.data)
      setTableData(result.data)
      // setFormVSerialNo(result.data?.formv_serial_number)
    }
    getallTableData()
  }, [appId, isIsmwAct])

  useEffect(() => {
    if (!searchText?.trim()) {
      setTableData(allTableData);
      return;
    }

    const filtered = allTableData?.filter((row) =>
      row.contractor_name?.toLowerCase().includes(searchText?.toLowerCase()) ||
      row.nature_of_work?.toLowerCase().includes(searchText?.toLowerCase()) ||
      row.duration_from_date?.toLowerCase().includes(searchText?.toLowerCase()) ||
      row.duration_to_date?.toLowerCase().includes(searchText?.toLowerCase()) ||
      // row.no_of_contract_labour??.toLowerCase().includes(searchText?.toLowerCase()) ||
      row.status?.toLowerCase().includes(searchText?.toLowerCase())
    );

    setTableData(filtered);
  }, [searchText, allTableData]);
  console.log(allTableData);

  const handleDownloadExcel = () => {
    if (!allTableData.length) return;

    // 🔹 Build Sheet Data (AOA)
    const wsData: any[] = [];

    // Row 1 → Title
    wsData.push([
      "LIST OF CONTRACTORS (TEST SUCHINTA)",
      "", "", "", "", "", ""
    ]);

    // Row 2 → Main Headers
    wsData.push([
      "Sl.No.",
      "Contractor Name License Number",
      "Email",
      "Address Line 1",
      "Sub-division",
      "District",
      "State",
    ]);

    // 🔹 Data Rows
    allTableData.forEach((row, index) => {
      wsData.push([
        index + 1,
        row.contractor_name || "-",
        row.email || "-",
        row.address_line1 || "-",
        row.subdivision || "-",
        row.district || "-",
        row.state || "-",
      ]);
    });

    // 🔹 Create Sheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 🔥 Merge Title Row
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    ];

    // 🔥 Column Widths
    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    // 🔥 FORCE CREATE CELLS + APPLY STYLES
    const range = XLSX.utils.decode_range(ws["!ref"] || "");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

        // ✅ Ensure cell exists
        if (!ws[cellRef]) {
          ws[cellRef] = { t: "s", v: "" };
        }

        // 🔥 Apply Styles
        ws[cellRef].s = {
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };

        // 🔥 Yellow Header Rows (Row 0 & 1)
        if (R === 0 || R === 1) {
          ws[cellRef].s.fill = {
            fgColor: { rgb: "FFFF00" },
          };
          ws[cellRef].s.font = {
            bold: true,
          };
        }
      }
    }

    // 🔥 Ensure Title only in A1
    ws["A1"].v = "LIST OF CONTRACTORS (TEST SUCHINTA)";

    // 🔹 Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contractors");

    // 🔹 Export
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "Contractor_List.xlsx");
  };

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">

      {/* Page Title */}
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        CONTRACTOR {isIsmwAct ? "FORM VI" : "FORM V"} LIST
      </h1>

      {/* Card */}
      <div className="bg-white rounded shadow border">

        {/* Header */}
        <div className="bg-[#2f5d7c] text-white px-4 py-2 font-semibold">
          CONTRACTOR LIST
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-3">
          <button
            onClick={handleDownloadExcel}
            className="border px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
          >
            📥 Download Excel
          </button>
          <button className="border px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
            🖨 Print
          </button>
        </div>

        {allTableData?.length > 0 &&
          <input
            type="text"
            placeholder="Search..."
            className="border p-1 ml-3 mb-3 w-80"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />}
        {/* Table */}
        <DataTable
          columns={columns}
          data={tableData}
          striped
          highlightOnHover
          responsive
          pagination
          customStyles={{
            headCells: {
              style: {
                whiteSpace: "normal",   // ✅ allow wrapping
                overflow: "visible",    // ✅ no hiding
                textOverflow: "unset",
                border: '1px solid #0c3e52'  // ✅ remove ...
              },
            },
            rows: {
              style: {
                // margin: '0 10px',
              }
            },
            cells: {
              style: {
                borderTop: '0 !important',
                border: '1px solid #093647'  // 
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default ContractorFormV;