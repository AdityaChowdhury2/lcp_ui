import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable, { TableColumn } from "react-data-table-component";
import { annualReturnLLApi, ArListRow } from "./annualReturnLLApi";

type ArRow = ArListRow;

/**
 * Applicant listing of submitted "Annual Return under various Labour Laws".
 */
const AnnualReturnLLList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ArRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingAck, setDownloadingAck] = useState<string | null>(null);

  // Open a PDF blob in a new tab. The tab is opened synchronously (within the
  // click gesture) so the popup blocker allows it, then pointed at the blob.
  const openPdfInNewTab = async (
    fetchBlob: () => Promise<Blob>,
    onError: string,
    setBusy: (v: string | null) => void,
    busyKey: string,
  ) => {
    const tab = window.open("", "_blank");
    setBusy(busyKey);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      toast.error(onError);
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadPdf = (encWizardId: string) =>
    openPdfInNewTab(
      () => annualReturnLLApi.downloadPdf(encWizardId),
      "Failed to generate the annual return PDF.",
      setDownloading,
      encWizardId,
    );

  const handleDownloadAck = (encWizardId: string) =>
    openPdfInNewTab(
      () => annualReturnLLApi.downloadAcknowledgement(encWizardId),
      "Failed to generate the acknowledgement.",
      setDownloadingAck,
      encWizardId,
    );

  useEffect(() => {
    let active = true;
    annualReturnLLApi
      .getList()
      .then((rows) => active && setData(rows))
      .catch(() => active && setData([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Only submitted returns are listed here.
  const submittedRows = data.filter((r) => r.status === "Submitted");

  const columns: TableColumn<ArRow>[] = [
    {
      name: "Sl. No",
      selector: (r) => r.slno,
      width: "80px",
      center: true,
    },
    { name: "Year", selector: (r) => r.year, width: "100px", center: true },
    {
      name: "Name of Services",
      cell: (r) => (
        <ul className="list-decimal py-2 pl-4 text-[12px] leading-relaxed">
          {r.services.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ),
      grow: 2,
      wrap: true,
    },
    {
      name: "Action",
      cell: (r) => (
        <button
          onClick={() => handleDownloadPdf(r.id)}
          disabled={downloading === r.id}
          className="rounded bg-[#1D5A89] px-3 py-1 text-[12px] font-semibold text-white hover:bg-[#164a72] disabled:opacity-50"
        >
          {downloading === r.id ? "Generating…" : "Download PDF"}
        </button>
      ),
      width: "180px",
    },
    {
      name: "Acknowledgement",
      cell: (r) => (
        <button
          onClick={() => handleDownloadAck(r.id)}
          disabled={downloadingAck === r.id}
          className="rounded border border-[#1D5A89] px-3 py-1 text-[12px] font-semibold text-[#1D5A89] hover:bg-[#1D5A89] hover:text-white disabled:opacity-50"
        >
          {downloadingAck === r.id ? "Generating…" : "Download"}
        </button>
      ),
      width: "160px",
    },
  ];

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1D5A89] px-4 py-3">
          <h1 className="text-[16px] font-semibold text-white">
            Submitted Return List
          </h1>
          <button
            onClick={() => navigate("/annual-return/wizard")}
            className="rounded bg-white px-4 py-2 text-[13px] font-semibold text-[#1D5A89] transition hover:bg-slate-100"
          >
            + Submission of Return
          </button>
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            data={submittedRows}
            pagination
            striped
            highlightOnHover
            dense
            progressPending={loading}
            noDataComponent={
              <div className="py-6 text-[13px] text-gray-500">No data found!</div>
            }
            customStyles={{
              headCells: {
                style: {
                  background: "#1E73BE",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "12px",
                  borderRight: "1px solid #c9c9c9",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: "1.2",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
              },
              rows: {
                style: {
                  fontSize: "12px",
                  borderBottom: "1px solid #e5e7eb",
                },
              },
              cells: {
                style: {
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderRight: "1px solid #e5e7eb",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnualReturnLLList;
