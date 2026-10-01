import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import React, { useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaPrint } from "react-icons/fa";

interface AnnualReturnRow {
  slNo: number;
  regNo: number;
  name: string;
  address: string;
  returnYear: number;
  submissionDate: string | null;
  status: string;
  encRegId?: string;
  encWizardId?: string;
  encUserId?: string;
  encRowId?: string;
}

interface TradeUnionViewData {
  id: number;
  registrationNo: number;
  registrationDate: string;
  eTradeUnionName: string;
  eTradeUnionAddress: string;
  districtCode: number | null;
  pin: string;
  unionType: string;
  isCanceled: number;
  statusText: string;
  cancelDateFormatted?: string;
  authorityOfficer: string;
  cpFileUrl: string | null;
  nspFileUrl: string | null;
  regFileUrl: string | null;
  remarks: string;
  canEdit: boolean;
  annualReturns: AnnualReturnRow[];
}

const formatRegDate = (val?: string) => {
  if (!val) return "-";
  const num = Number(val);
  if (!isNaN(num) && num > 0) {
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return val;
};

const ViewTradeUnion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = getAuthToken() ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<TradeUnionViewData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Invalid trade union id.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}trade-union/master-list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load trade union details.");
        }
        setData(payload?.result ?? null);
      } catch (err: any) {
        setError(err?.message || "Failed to load trade union details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token]);

  const handlePrintPdf = () => {
    if (!data) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            *, *:before, *:after {
              box-sizing: border-box;
            }
            body {
              font-family: 'Source Sans Pro', Arial, sans-serif;
              color: #222;
              margin: 0;
              padding: 15mm;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-container {
              text-align: center;
              padding-bottom: 12px;
              border-bottom: 2px solid #3c8dbc;
              margin-bottom: 20px;
            }
            .govt-title {
              font-size: 20px;
              font-weight: bold;
              text-transform: uppercase;
              color: #1a365d;
              margin: 0 0 4px 0;
            }
            .sub-title {
              font-size: 15px;
              color: #4a5568;
              margin: 0 0 10px 0;
              font-weight: 600;
            }
            .page-title {
              display: inline-block;
              background-color: #3c8dbc;
              color: #ffffff;
              font-size: 14px;
              font-weight: bold;
              padding: 4px 16px;
              border-radius: 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 5px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 13px;
            }
            .details-table th, .details-table td {
              border: 1px solid #d2d6de;
              padding: 9px 12px;
              text-align: left;
              vertical-align: top;
            }
            .details-table th {
              background-color: #f4f6f9;
              color: #333;
              font-weight: 700;
              width: 35%;
            }
            .details-table td {
              color: #222;
            }
            .details-table tr:nth-child(even) {
              background-color: #fafafa;
            }
            .status-canceled {
              color: #ff0000;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="govt-title">Labour Commissionerate</div>
            <div class="sub-title">Government of West Bengal</div>
            <div class="page-title">Trade Union Details</div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Inputs</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Registration Number</td><td><strong>${data.registrationNo ?? ''}</strong></td></tr>
              <tr><td>Name</td><td>${data.eTradeUnionName ?? ''}</td></tr>
              <tr><td>Address</td><td>${data.eTradeUnionAddress ?? ''}</td></tr>
              <tr><td>Pin Number</td><td>${data.pin ?? ''}</td></tr>
              <tr><td>Status</td><td><span class="${data.isCanceled === 1 ? 'status-canceled' : ''}">${data.statusText ?? ''}</span></td></tr>
              <tr><td>Authority Officer</td><td>${data.authorityOfficer || '-'}</td></tr>
              <tr><td>Corresponding Part of Mannual File</td><td>${data.cpFileUrl ? 'Uploaded' : 'NOT UPLOAD'}</td></tr>
              <tr><td>Notesheet Part of Mannual File</td><td>${data.nspFileUrl ? 'Uploaded' : 'NOT UPLOAD'}</td></tr>
              <tr><td>Regiter File</td><td>${data.regFileUrl ? 'Uploaded' : 'NOT UPLOAD'}</td></tr>
              <tr><td>Remarks</td><td>${data.remarks || '-'}</td></tr>
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleViewAnnualReturnPdf = async (row: AnnualReturnRow) => {
    if (!row.encRegId || !row.encWizardId || !row.encUserId) return;
    try {
      const url = `${API_BASE}trade-union/annual-return/combined/pdf?encryptedRegId=${encodeURIComponent(row.encRegId)}&encryptedWizardId=${encodeURIComponent(row.encWizardId)}&encryptedUserId=${encodeURIComponent(row.encUserId)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load PDF");
      const blob = await res.blob();
      const pdfBlobUrl = URL.createObjectURL(blob);
      window.open(pdfBlobUrl, "_blank");
    } catch (err) {
      console.error("View annual return failed", err);
      alert("Unable to view annual return PDF");
    }
  };

  const annualColumns: TableColumn<AnnualReturnRow>[] = useMemo(
    () => [
      { name: "SL. NO", selector: (row) => row.slNo, width: "90px" },
      { name: "REG. NO.", selector: (row) => row.regNo, width: "130px" },
      { name: "NAME", selector: (row) => row.name, sortable: true },
      { name: "ADDRESS", selector: (row) => row.address, sortable: true },
      { name: "YEAR", selector: (row) => row.returnYear, sortable: true, width: "110px" },
      {
        name: "ACTION",
        width: "120px",
        cell: (row) => (
          <button
            type="button"
            onClick={() => handleViewAnnualReturnPdf(row)}
            className="text-[#1d6fa5] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span className="text-[14px]">👁</span> View
          </button>
        ),
      },
    ],
    [token],
  );

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading trade union details...</div>;
  }

  if (error || !data) {
    return <div className="p-4 text-sm text-red-600">{error || "No data found."}</div>;
  }

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      <h1 className="max-w-6xl mx-auto mt-1 mb-2 text-[24px] font-medium opacity-90">
        {data.eTradeUnionName},[{data.registrationNo}]
      </h1>

      <div className="max-w-6xl mx-auto py-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-4 text-sm font-medium">
          <button
            type="button"
            className="pb-2 text-[#3c8dbc] border-b-2 border-[#3c8dbc] font-semibold"
          >
            Trade Union Details
          </button>
          <Link
            to={`/trade-union/b-register/${data.id}`}
            className="pb-2 text-[#f39c12] hover:text-[#d3820d] transition-colors"
          >
            View &amp; Generate Register
          </Link>
          <Link
            to={`/trade-union/register-b-upload/${data.id}`}
            className="pb-2 text-[#f39c12] hover:text-[#d3820d] transition-colors"
          >
            Upload Register
          </Link>
        </div>

        <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
          <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
            <table className="w-full table-auto border border-[#d2d6de] text-sm">
              <thead className="bg-[#f5f5f5]">
                <tr>
                  <th className="border p-2 text-left w-[30%]">Parameters</th>
                  <th className="border p-2 text-left">Inputs</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-2">Registration Number</td><td className="border p-2">{data.registrationNo}</td></tr>
                <tr><td className="border p-2">Registration Date</td><td className="border p-2">{formatRegDate(data.registrationDate)}</td></tr>
                <tr><td className="border p-2">Name</td><td className="border p-2">{data.eTradeUnionName}</td></tr>
                <tr><td className="border p-2">Address</td><td className="border p-2">{data.eTradeUnionAddress}</td></tr>
                <tr><td className="border p-2">Pin Number</td><td className="border p-2">{data.pin}</td></tr>
                <tr>
                  <td className="border p-2">Status</td>
                  <td className="border p-2">
                    {data.isCanceled === 1 ? (
                      <>
                        <span className="text-[#ff0000] font-bold">Canceled.</span>
                        {data.cancelDateFormatted ? (
                          <> Date:<span className="font-bold">{data.cancelDateFormatted}</span></>
                        ) : (
                          <> Date:<strong></strong></>
                        )}
                      </>
                    ) : (
                      <span className="text-[#006600] font-bold">GRANTED</span>
                    )}
                  </td>
                </tr>
                <tr><td className="border p-2">Authority Officer</td><td className="border p-2">{data.authorityOfficer || "-"}</td></tr>
                <tr>
                  <td className="border p-2">Corresponding Part of Mannual File</td>
                  <td className="border p-2">
                    {data.cpFileUrl ? (
                      <a className="text-[#1d6fa5] underline" href={data.cpFileUrl} target="_blank" rel="noreferrer">View PDF</a>
                    ) : "NOT UPLOAD"}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Notesheet Part of Mannual File</td>
                  <td className="border p-2">
                    {data.nspFileUrl ? (
                      <a className="text-[#1d6fa5] underline" href={data.nspFileUrl} target="_blank" rel="noreferrer">View PDF</a>
                    ) : "NOT UPLOAD"}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Regiter File</td>
                  <td className="border p-2">
                    {data.regFileUrl ? (
                      <a className="text-[#1d6fa5] underline" href={data.regFileUrl} target="_blank" rel="noreferrer">View PDF</a>
                    ) : "NOT UPLOAD"}
                  </td>
                </tr>
                <tr><td className="border p-2">Remarks</td><td className="border p-2">{data.remarks || "-"}</td></tr>
              </tbody>
            </table>

            <div className="pt-4 flex items-center gap-2">
              <Link to="/trade-union-master-list/add-trade-union" className="px-3 py-1 text-sm bg-[#3c8dbc] text-white rounded-[3px]">
                Add New
              </Link>
              <Link to="/trade-union-master-list" className="px-3 py-1 text-sm bg-[#f39c12] text-white rounded-[3px]">
                Back to Master List
              </Link>
              {data.canEdit ? (
                <button
                  type="button"
                  onClick={() => navigate(`/trade-union-master-list/edit-trade-union/${data.id}`)}
                  className="px-3 py-1 text-sm bg-[#00a65a] text-white rounded-[3px]"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-3 py-1 text-sm bg-[#000000] text-white rounded-[3px] flex items-center gap-1.5 hover:bg-gray-800 transition"
              >
                <FaPrint className="w-3.5 h-3.5" />
                Print / Download (PDF)
              </button>
            </div>
          </div>
        </div>

        <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
          <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
            <div className="mb-3 text-sm font-semibold text-gray-700">List of Online Submited Annual Return</div>
            <DataTable
              columns={annualColumns}
              data={Array.isArray(data.annualReturns) ? data.annualReturns : []}
              noDataComponent="No data found!"
              dense
              pagination
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTradeUnion;
