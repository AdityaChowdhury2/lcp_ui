import React from "react";

type RenewalActionPanelProps = {
  effectiveWorkOrderDoc: any | null;
  workOrderFile: File | null;
  uploadedWorkOrderId: number | null;
  uploadingWorkOrder: boolean;
  declaration: boolean;
  canSubmit: boolean;
  canPayFees: boolean;
  paymentApplicationId: number | null;
  hasWorkOrder: boolean;
  statusCode: string;
  canUploadSigned: boolean;
  renewalApplicationId: number | null;
  renewalCertificateUrl: string | null;
  submitting: boolean;
  formVSerialNo: number | null;
  renderManagedDocument: (doc: any, emptyText?: string) => React.ReactNode;
  onPickWorkOrder: (file: File | null) => void;
  onUploadWorkOrder: () => void;
  onDeclarationChange: (checked: boolean) => void;
  onPay: () => void;
  onDownloadFormVii: () => void;
  onUploadSignedFormVii: () => void;
  onSubmit: () => void;
};

const RenewalActionPanel: React.FC<RenewalActionPanelProps> = ({
  effectiveWorkOrderDoc,
  workOrderFile,
  uploadedWorkOrderId,
  uploadingWorkOrder,
  declaration,
  canSubmit,
  canPayFees,
  paymentApplicationId,
  hasWorkOrder,
  statusCode,
  canUploadSigned,
  renewalApplicationId,
  renewalCertificateUrl,
  submitting,
  formVSerialNo,
  renderManagedDocument,
  onPickWorkOrder,
  onUploadWorkOrder,
  onDeclarationChange,
  onPay,
  onDownloadFormVii,
  onUploadSignedFormVii,
  onSubmit,
}) => (
  <>
    <div className="border rounded-lg shadow">
      <div className="bg-blue-400 text-white px-4 py-2 font-semibold rounded-t-lg">Upload Extended Work Order</div>
      <div className="p-4 text-sm text-gray-700">
        {/* {effectiveWorkOrderDoc?.uri ? (
          <>
            Existing uploaded work order: {renderManagedDocument(effectiveWorkOrderDoc)}
            <p className="mt-2 text-xs text-gray-500">
              Renewal submit will use this uploaded work order reference.
            </p>
          </>
        ) : (
          "No work order is linked yet."
        )} */}
        <div className="mt-3">
          {/* {effectiveWorkOrderDoc?.uri ? (
            <div className="mt-2">
              <p className="text-xs text-emerald-700">
                Uploaded work-order file:{" "}
                <span className="font-mono">
                  {String(effectiveWorkOrderDoc?.filename ?? "").trim() ||
                    (uploadedWorkOrderId ? `File ID: ${uploadedWorkOrderId}` : "—")}
                </span>
              </p>
            </div>
          ) : ( */}
            <>
              <label className="block mb-1 font-medium">
                Extended Work-order PDF <span className="text-red-600">*</span>
              </label>
              <div className="rounded-lg border-2 border-dashed border-[#1D5A89]/55 bg-gradient-to-b from-[#1D5A89]/[0.08] to-white p-4 shadow-sm transition has-[input:focus-visible]:border-[#1D5A89] has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-[#1D5A89]/30 has-[input:focus-visible]:ring-inset">
                <div className="relative inline-flex overflow-hidden rounded-md border-2 border-[#1D5A89] bg-[#1D5A89] shadow-sm transition hover:bg-[#164a6e]">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-label="Browse for extended work order PDF"
                    className="absolute inset-0 z-10 min-h-[2.75rem] w-full cursor-pointer opacity-0"
                    onChange={(e) => onPickWorkOrder(e.target.files?.[0] ?? null)}
                  />
                  <span
                    className="pointer-events-none inline-flex select-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
                    aria-hidden
                  >
                    <svg
                      className="h-5 w-5 shrink-0 opacity-95"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                    </svg>
                    <span>Browse File</span>
                  </span>
                </div>
                <p className="mt-3 text-sm leading-snug text-gray-700">
                  {workOrderFile?.name ? (
                    <>
                      <span className="font-semibold text-emerald-800">Selected for upload:</span>{" "}
                      <span className="break-all font-mono text-gray-900">{workOrderFile.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-600">
                      PDF only, up to 200KB — click <span className="font-medium">Browse File</span> to choose your
                      extended work order.
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onUploadWorkOrder}
                disabled={uploadingWorkOrder || !workOrderFile}
                className="mt-2 bg-[#1D5A89] hover:bg-[#164a6e] text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {uploadingWorkOrder ? "Uploading..." : "Upload Work Order"}
              </button>
            </>
          {/* )} */}
        </div>
      </div>
    </div>

    <div className="flex gap-2 items-start">
      <input
        type="checkbox"
        checked={declaration}
        onChange={(e) => onDeclarationChange(e.target.checked)}
        className="mt-1"
      />
      <label className="font-semibold">
        Declaration: I hereby declare that the details given above are correct to the best of my knowledge and belief.
        <span className="text-red-600">*</span>
      </label>
    </div>

    {canPayFees && (
      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Renewal application is already submitted. Please pay renewal fees to continue to FORM-VII upload.
      </div>
    )}

    {canSubmit && !hasWorkOrder && (
      <div className="text-xs text-red-700">
        Extended Work Order is mandatory before submitting renewal.
      </div>
    )}

    <div className="text-right flex flex-wrap gap-2 justify-end">
      {canPayFees ? (
        <button
          type="button"
          onClick={onPay}
          disabled={paymentApplicationId == null}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
        >
          Pay renewal fees
        </button>
      ) : null}

      {canUploadSigned && renewalApplicationId ? (
        <button
          type="button"
          onClick={onDownloadFormVii}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded shadow"
        >
          Download FORM-VII
        </button>
      ) : null}

      {canUploadSigned && renewalApplicationId ? (
        <button
          type="button"
          onClick={onUploadSignedFormVii}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
        >
          Upload signed FORM-VII
        </button>
      ) : null}

      {canSubmit ? (
        <button
          type="button"
          disabled={!hasWorkOrder || !declaration || submitting || !formVSerialNo}
          onClick={onSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
        >
          {submitting ? "Submitting..." : statusCode === "B" ? "Resubmit" : "Submit"}
        </button>
      ) : null}
    </div>
  </>
);

export default RenewalActionPanel;
