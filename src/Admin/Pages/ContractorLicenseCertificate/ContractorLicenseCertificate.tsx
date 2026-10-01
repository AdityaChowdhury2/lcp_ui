import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

type CertServiceType = "clra" | "bocwa";

interface CertLookup {
  found: boolean;
  service: CertServiceType;
  caf_id_no: string;
  application_id?: number;
  eodb_app_id?: string | null;
  form_v_no?: string | null;
  status?: string | null;
  status_txt?: string;
  license_number?: string | null;
  license_date?: string | null;
  valid_to?: string | null;
  available: boolean;
  source?: "local" | "generated";
  message?: string;
}

const authHeader = () => ({ Authorization: `Bearer ${getAuthToken()}` });

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? "—"
    : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const SERVICE_LABEL: Record<CertServiceType, string> = {
  clra: "Contractor License",
  bocwa: "BOCWA Registration",
};

function ContractorLicenseCertificate() {
  const [clraCaf, setClraCaf] = useState("");
  const [bocwaCaf, setBocwaCaf] = useState("");
  const [loadingService, setLoadingService] = useState<CertServiceType | null>(null);
  const [info, setInfo] = useState<CertLookup | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetView = () => {
    setInfo(null);
    setError(null);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const fetchPdfBlob = async (
    id: string,
    service: CertServiceType,
  ): Promise<string> => {
    const res = await axios.get(`${API_BASE}contractor-license-certificate/pdf`, {
      headers: authHeader(),
      params: { cafId: id, type: service },
      responseType: "blob",
    });
    return window.URL.createObjectURL(res.data as Blob);
  };

  const handleSearch = async (service: CertServiceType, rawId: string) => {
    const id = rawId.trim();
    if (!id) {
      toast.warn("Please enter a CAF id.");
      return;
    }
    resetView();
    setLoadingService(service);
    try {
      const res = await axios.get<CertLookup>(
        `${API_BASE}contractor-license-certificate/lookup`,
        { headers: authHeader(), params: { cafId: id, type: service } },
      );
      const data = res.data;
      setInfo(data);

      if (!data.found) {
        setError(data.message || "No application found for this CAF id.");
      } else if (data.available) {
        try {
          const url = await fetchPdfBlob(id, data.service);
          setPdfUrl(url);
        } catch {
          setError("Could not load the certificate PDF. Please try again.");
        }
      } else {
        setError(data.message || "Certificate is not available for this CAF id.");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) setError("You do not have permission to view this.");
      else if (status === 400) setError("Invalid CAF id.");
      else setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingService(null);
    }
  };

  const handleDownload = async () => {
    if (!info?.found) return;
    const id = info.caf_id_no;
    try {
      const res = await axios.get(`${API_BASE}contractor-license-certificate/pdf`, {
        headers: authHeader(),
        params: { cafId: id, type: info.service, download: 1 },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download the certificate.");
    }
  };

  const isBocwa = info?.service === "bocwa";

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Contractor License / BOCWA Certificate
        </h1>
        <p className="text-sm text-gray-500">
          Look up an issued contractor license or BOCWA registration certificate
          by CAF id.
        </p>
      </div>

      {/* Search bars */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SearchCard
          title="Contractor License (CLRA)"
          placeholder="Enter CAF id"
          value={clraCaf}
          onChange={setClraCaf}
          onSubmit={() => handleSearch("clra", clraCaf)}
          loading={loadingService === "clra"}
          disabled={loadingService !== null}
          autoFocus
        />
        <SearchCard
          title="BOCWA Registration"
          placeholder="Enter CAF id"
          value={bocwaCaf}
          onChange={setBocwaCaf}
          onSubmit={() => handleSearch("bocwa", bocwaCaf)}
          loading={loadingService === "bocwa"}
          disabled={loadingService !== null}
        />
      </div>

      {/* Error / status */}
      {error && (
        <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Details + certificate */}
      {info?.found && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Details card */}
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
            <h2 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-700">
              {SERVICE_LABEL[info.service]} Details
            </h2>
            <dl className="space-y-2 text-sm">
              <Detail label="CAF Id" value={info.caf_id_no} />
              <Detail label="EODB App Id" value={info.eodb_app_id ?? "—"} />
              {!isBocwa && <Detail label="Form V No" value={info.form_v_no ?? "—"} />}
              <Detail
                label="Status"
                value={
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      info.available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {info.status_txt || info.status || "—"}
                  </span>
                }
              />
              <Detail
                label={isBocwa ? "Registration No" : "License No"}
                value={info.license_number ?? "—"}
              />
              <Detail
                label={isBocwa ? "Registration Date" : "License Date"}
                value={formatDate(info.license_date)}
              />
              {!isBocwa && (
                <Detail label="Valid Upto" value={formatDate(info.valid_to)} />
              )}
            </dl>

            {info.available && (
              <button
                onClick={handleDownload}
                className="mt-4 w-full rounded bg-[#00a65a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#008d4c]"
              >
                Download PDF
              </button>
            )}
          </div>

          {/* PDF preview */}
          <div className="min-h-[500px] rounded-md border border-gray-200 bg-white p-2 shadow-sm lg:col-span-2">
            {pdfUrl ? (
              <iframe
                title={`${SERVICE_LABEL[info.service]} Certificate`}
                src={pdfUrl}
                className="h-[70vh] w-full rounded"
              />
            ) : (
              <div className="flex h-full min-h-[500px] items-center justify-center text-sm text-gray-400">
                {info.available
                  ? "Loading certificate…"
                  : "No certificate to preview."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchCard({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
  autoFocus,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {title} — CAF Id
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#32dff3] focus:outline-none focus:ring-1 focus:ring-[#32dff3]"
          autoFocus={autoFocus}
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-[#367fa9] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#2c6a8e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-800">{value}</dd>
    </div>
  );
}

export default ContractorLicenseCertificate;
