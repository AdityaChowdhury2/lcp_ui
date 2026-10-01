import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store/store";
import { fetchContractorLicenseRenewalPreviewApi } from "@/store/clraLicenseRenewalSlice";
import { fetchContractorLicenseAmendmentFileManagedDocument } from "@/store/contractorLicenseAmendmentSlice";
import { encryptionDecryptionFun } from "@/utils/encryption";
import ContractorLicenseDetailsView from "./components/ContractorLicenseDetailsView";

function decryptRouteNumber(value: string | null | undefined): number {
  const decrypted = encryptionDecryptionFun("decrypt", value ?? "");
  const parsed = Number(decrypted);
  return Number.isFinite(parsed) ? parsed : NaN;
}

const ContractorLicenseDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const routeLicenseId = decryptRouteNumber(id);
  const routeFormVSerialNo = decryptRouteNumber(
    searchParams.get("formVSerialNo"),
  );
  const updatedFormV = decryptRouteNumber(searchParams.get("updatedFormV"));
  const isRouteIdValid = Number.isFinite(routeLicenseId) && routeLicenseId > 0;
  const isFormVSerialNoValid =
    Number.isFinite(routeFormVSerialNo) && routeFormVSerialNo > 0;

  useEffect(() => {
    if (!isRouteIdValid) {
      toast.error("Invalid license reference.");
      return;
    }
    if (!isFormVSerialNoValid) {
      toast.error("Form-V reference is missing.");
      return;
    }

    let closed = false;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await fetchContractorLicenseRenewalPreviewApi({
          formVSerialNo: routeFormVSerialNo,
          licenseId: routeLicenseId,
          updatedFormV: updatedFormV ?? 0,
        });

        if (!closed) setPreview(res);
      } catch (err) {
        if (!closed) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Unable to load license details.",
          );
        }
      } finally {
        if (!closed) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      closed = true;
    };
  }, [
    isFormVSerialNoValid,
    isRouteIdValid,
    routeFormVSerialNo,
    routeLicenseId,
  ]);

  const formVSerialNo = isFormVSerialNoValid
    ? routeFormVSerialNo
    : (preview?.formVSerialNo ?? null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/license-renewal-amendment-list");
  };

  const handleOpenPdfDoc = async (fid: string) => {
    if (!fid) {
      toast.error("No Document uploaded");
      return;
    }
    try {
      const { blobUrl } = await dispatch(
        fetchContractorLicenseAmendmentFileManagedDocument({ fid }),
      ).unwrap();
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to fetch document.",
      );
    }
  };

  return (
    <div className="min-h-0 w-full bg-gray-100 p-4">
      <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 bg-white p-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Contractor License Details
          </h1>
          <button
            type="button"
            onClick={handleBack}
            className="rounded bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back
          </button>
        </div>

        {loading && (
          <div className="mb-4 text-sm text-gray-700">
            Loading license details...
          </div>
        )}
        {!loading && !preview && (
          <div className="mb-4 text-sm text-red-700">
            License details are not available.
          </div>
        )}

        <ContractorLicenseDetailsView
          preview={preview}
          formVSerialNo={formVSerialNo}
          onOpenManagedDocument={(fid) => {
            void handleOpenPdfDoc(fid);
          }}
        />
      </div>
    </div>
  );
};

export default ContractorLicenseDetails;
