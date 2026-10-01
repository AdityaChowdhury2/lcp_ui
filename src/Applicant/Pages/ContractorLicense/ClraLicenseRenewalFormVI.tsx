import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import type { RootState } from "@/store/store";
import { getAuthToken, getUserId } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";

const ALC_ROLE_ID = 4;

const ClraLicenseRenewalFormVI: React.FC = () => {
  const navigate = useNavigate();
  const { renewalIdEnc, licenseIdEnc, serialNoEnc, flag } = useParams<{ renewalIdEnc: string, licenseIdEnc: string, serialNoEnc: string, flag: string }>();
  const userId = getUserId();
  const role = useSelector((s: RootState) => s.auth.user?.role);

  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const pdfUrl = useMemo(() => {
    if (!renewalIdEnc) return null;
    return `${API_BASE}certificate/formVI/contractor-license`;
  }, [renewalIdEnc]);

  useEffect(() => {
    let revoked = false;
    const run = async () => {
      if (!pdfUrl) return;
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      setLoading(true);
      try {
        const resp = await axios.get(pdfUrl, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            serialEnc: serialNoEnc,
            renewalAmendIdEnc: renewalIdEnc,
            createdByEnc: encryptionDecryptionFun("encrypt", String(userId)),
            licenseIdEnc: licenseIdEnc,
            flagEnc: encryptionDecryptionFun("encrypt", flag),
          },
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(resp.data);
        if (revoked) {
          window.URL.revokeObjectURL(url);
          return;
        }
        setBlobUrl((prev) => {
          if (prev) window.URL.revokeObjectURL(prev);
          return url;
        });
      } catch (e) {
        toast.error("Unable to load FORM‑VI certificate.");
      } finally {
        setLoading(false);
      }
    };
    run();

    return () => {
      revoked = true;
      setBlobUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [pdfUrl]);

  return (
    <div className="w-screen h-screen flex flex-col bg-white font-sans">
      {/* <div className="shrink-0 flex flex-wrap gap-2 items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <span className="text-sm font-medium text-[#0B2C48]">Renewal certificate (FORM‑VI)</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (role === ALC_ROLE_ID) {
                navigate(-1);
              } else {
                navigate("/license-renewal-amendment-list");
              }
            }}
            className="px-3 py-1.5 rounded border border-gray-300 text-sm"
          >
            Back
          </button>
          {blobUrl ? (
            <a
              href={blobUrl}
              download="FORM-VI.pdf"
              className="px-3 py-1.5 rounded bg-sky-700 text-white text-sm"
            >
              Download
            </a>
          ) : null}
        </div>
      </div> */}

      <div className="flex-1 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 bg-white z-10">
            Loading certificate…
          </div>
        )}
        {!loading && !blobUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-red-700 p-4">
            Certificate is not available right now.
          </div>
        )}
        {blobUrl ? (
          <iframe
            title="FORM-VI Renewal Certificate"
            src={blobUrl}
            className="w-full h-full border-0"
          />
        ) : null}
      </div>
    </div>
  );
};

export default ClraLicenseRenewalFormVI;

