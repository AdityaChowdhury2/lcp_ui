import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchContractorLicenseRemarks,
  type ContractorLicenseRemarkRow,
} from "@/store/clraLicenseRenewalSlice";
import { IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";

function remarkStatusImage(remarkType: string): string | null {
  const t = remarkType.trim();
  if (!t) return null;
  if (STATUS_IMAGE_MAP[t]) return STATUS_IMAGE_MAP[t];
  const alias: Record<string, string> = {
    I: "Issued",
    B: "Rectification",
    C: "Pending",
    R: "Rejected",
    A: "Fees Pending",
    P: "Fees Paid",
    U: "Final Submitted",
  };
  const mapped = alias[t];
  return mapped && STATUS_IMAGE_MAP[mapped] ? STATUS_IMAGE_MAP[mapped] : null;
}

const ContractorLicenseRemarks: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<ContractorLicenseRemarkRow[]>([]);
  const [loading, setLoading] = useState(true);

  const formVSerialNo = Number(searchParams.get("formVSerialNo"));
  const particularId = Number(searchParams.get("particularId"));
  const flag = (searchParams.get("flag") ?? "L").trim() || "L";

  useEffect(() => {
    if (!Number.isFinite(formVSerialNo) || formVSerialNo <= 0) {
      toast.error("Missing or invalid Form‑V serial.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(particularId) || particularId <= 0) {
      toast.error("Missing or invalid particular reference.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchContractorLicenseRemarks({
          formVSerialNo,
          particularId,
          flag,
        });
        if (!cancelled) setRows(data.remarks);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          toast.error(e instanceof Error ? e.message : "Unable to load remarks.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formVSerialNo, particularId, flag]);

  return (
    <div className="w-full min-h-screen font-sans px-2 md:px-6 py-4">
      <div className="bg-white p-4 mb-4 rounded border shadow-sm">
        <h1 className="text-xl md:text-2xl font-semibold text-[#0B2C48] mb-1">
          Licence application remarks
        </h1>
        <p className="text-sm text-gray-600">
          Form‑V serial: <span className="font-mono font-medium">{formVSerialNo}</span>
          {" · "}
          Particular ID: <span className="font-mono font-medium">{particularId}</span>
          {" · "}
          Flag: <span className="font-mono font-medium">{flag}</span>
        </p>
      </div>

      <div className="bg-white rounded border shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#1D5A89] text-white text-left">
              <th className="px-3 py-3 w-12">Sl.</th>
              <th className="px-3 py-3 w-40">Date</th>
              <th className="px-3 py-3">Remark</th>
              <th className="px-3 py-3 w-28 text-center">Status</th>
              <th className="px-3 py-3 w-44">Remark by</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-600">
                  Loading remarks…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-600">
                  No remarks found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r, i) => {
                const img = remarkStatusImage(r.remarkType);
                const dateStr = r.remarkDate
                  ? new Date(r.remarkDate).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                return (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 align-top text-center">{i + 1}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{dateStr}</td>
                    <td className="px-3 py-2 align-top">{r.remarkText}</td>
                    <td className="px-3 py-2 align-middle text-center">
                      {img ? (
                        <img
                          src={`${IMAGE_BASE}${img}`}
                          alt={r.remarkType}
                          title={r.remarkType}
                          className="inline-block max-h-9 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-600">{r.remarkType || "—"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">{r.remarkByName}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => navigate("/license-renewal-amendment-list")}
          className="px-4 py-2 text-sm rounded bg-[#52C7EA] hover:bg-[#2bb8df] text-white"
        >
          Application list
        </button>
      </div>
    </div>
  );
};

export default ContractorLicenseRemarks;
