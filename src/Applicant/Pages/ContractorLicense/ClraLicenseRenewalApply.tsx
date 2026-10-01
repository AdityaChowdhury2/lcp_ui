import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { encryptionDecryptionFun } from "@/utils/encryption";
// import { toast } from "react-toastify";
// import { encryptionDecryptionFun } from "@/utils/encryption";
// import {
//   // canUploadSignedRenewal,
//   parseClraLicenseRenewalAmendmentCtx,
// } from "@/store/clraLicenseRenewalSlice";
// import { downloadRenewalFormVii } from "./downloadRenewalFormVii";

function readRouteNumber(value: string | null): number | null {
  const plain = Number(value);
  if (Number.isFinite(plain) && plain > 0) return plain;

  const decrypted = encryptionDecryptionFun("decrypt", value ?? "");
  const parsed = Number(decrypted);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const ClraLicenseRenewalApply: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formVSerialNo = readRouteNumber(searchParams.get("formVSerialNo"));
  const licenseId = readRouteNumber(searchParams.get("licenseId"));
  // const updateFormV = readRouteNumber(searchParams.get("updatedFormV"));
  const renewalPath =
    searchParams.get("formVSerialNo") && searchParams.get("licenseId")
      ? `/contractor-license/renewal?formVSerialNo=${encodeURIComponent(
          String(searchParams.get("formVSerialNo"))
        )}&licenseId=${encodeURIComponent(String(searchParams.get("licenseId")))}&updatedFormV=${encodeURIComponent(String(searchParams.get("updatedFormV")))}`
      : "/contractor-license/renewal";
  // const statusCode = (ctx?.statusCode ?? "").trim();

  // const legacyLicenseId = ctx?.legacyLicenseId ?? null;
  // const paymentApplicationId = ctx?.paymentApplicationId ?? null;
  // const renewalApplicationId = ctx?.renewalApplicationId ?? null;
  // const particularId = ctx?.contractorParticularId ?? null;
  // const tagFlag = (ctx?.tagFlag ?? "R").trim() || "R";
  // const payActId = ctx?.payActId ?? 1;
  // const canUploadNow = canUploadSignedRenewal(statusCode);

  // const goPay = () => {
  //   if (paymentApplicationId == null) {
  //     toast.error("Application reference missing for payment.");
  //     return;
  //   }
  //   const encApp = encryptionDecryptionFun("encrypt", String(paymentApplicationId)) ?? "";
  //   const encAct = encryptionDecryptionFun("encrypt", String(payActId)) ?? "";
  //   if (!encApp || !encAct) {
  //     toast.error("Unable to prepare payment link.");
  //     return;
  //   }
  //   navigate(
  //     `/epayments-preview?applicationId=${encodeURIComponent(encApp)}&actId=${encodeURIComponent(encAct)}`
  //   );
  // };

  // const goRemarks = () => {
  //   if (formVSerialNo == null || particularId == null) {
  //     toast.error("Remarks reference is missing. Open from application list if needed.");
  //     return;
  //   }
  //   navigate(
  //     `/contractor-license/remarks?formVSerialNo=${encodeURIComponent(
  //       String(formVSerialNo)
  //     )}&particularId=${encodeURIComponent(String(particularId))}&flag=${encodeURIComponent(tagFlag)}`
  //   );
  // };

  return (
    <div className="w-full min-h-screen font-sans px-2 md:px-6 py-4">
      <div className="bg-white p-4 mb-5 rounded border shadow-sm">
        <h1 className="text-xl md:text-2xl font-semibold text-[#0B2C48] mb-1">
          Renewal application
        </h1>
        <p className="text-sm text-gray-600">
          Form-V serial: <span className="font-mono font-medium">{formVSerialNo ?? "-"}</span>
        </p>
      </div>

      <div className="bg-white rounded border shadow p-5 max-w-3xl">
        <ol className="space-y-3 text-sm">
          <li className="border rounded p-3">
            <div className="font-medium text-gray-900">Submit Renewal Application</div>
            {/* <p className="text-gray-600 mt-1">Verify PE, license and contractor particulars before proceeding.</p> */}
            <button
              type="button"
              onClick={() => navigate(renewalPath)}
              disabled={!formVSerialNo || !licenseId}
              className="mt-2 px-3 py-1.5 rounded bg-[#1D5A89] text-white text-xs"
            >
              Submit
            </button>
          </li>

          {/* <li className="border rounded p-3">
            <div className="font-medium text-gray-900">2. Payment (if fees pending)</div>
            <p className="text-gray-600 mt-1">
              Current status code: <span className="font-mono">{statusCode || "-"}</span>
            </p>
            {statusCode === "A" ? (
              <button
                type="button"
                onClick={goPay}
                className="mt-2 px-3 py-1.5 rounded bg-amber-600 text-white text-xs"
              >
                Pay now
              </button>
            ) : (
              <p className="text-xs text-gray-500 mt-2">Payment step is available when status is Fees Pending (A).</p>
            )}
          </li>

          <li className="border rounded p-3">
            <div className="font-medium text-gray-900">3. Download FORM-VII, sign and upload</div>
            {canUploadNow ? (
              <>
                <p className="text-xs text-gray-600 mt-1">
                  First download generated FORM-VII, sign it, then upload the signed PDF.
                </p>
                <button
                  type="button"
                  onClick={() => downloadRenewalFormVii(renewalApplicationId, toast.error)}
                  disabled={renewalApplicationId == null}
                  className="mt-2 mr-2 px-3 py-1.5 rounded bg-sky-600 text-white text-xs"
                >
                  Download FORM-VII
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contractor-license/renewal/upload-form-vii")}
                  className="mt-2 px-3 py-1.5 rounded bg-indigo-600 text-white text-xs"
                >
                  Upload signed FORM-VII
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                This step is available when status is Fees Paid (P).
              </p>
            )}
          </li>

          <li className="border rounded p-3">
            <div className="font-medium text-gray-900">4. Track remarks / status</div>
            <button
              type="button"
              onClick={goRemarks}
              className="mt-2 px-3 py-1.5 rounded bg-slate-600 text-white text-xs"
            >
              View remarks
            </button>
          </li> */}
        </ol>

        {/* <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/renewal/old_renewal")}
            className="px-4 py-2 rounded bg-gray-200 text-sm"
          >
            Back to eligibility
          </button>
          <button
            type="button"
            onClick={() => navigate("/license-renewal-amendment-list")}
            className="px-4 py-2 rounded bg-[#52C7EA] text-white text-sm"
          >
            Back to list
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ClraLicenseRenewalApply;
