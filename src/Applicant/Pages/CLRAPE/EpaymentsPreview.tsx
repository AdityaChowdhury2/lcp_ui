import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store/store";
import {
  fetchEpaymentsPreview,
  initiateEpayment,
  setPaymentMode,
  clearEpayments,
  selectEpaymentsPreview,
  selectEpaymentsLoading,
  selectEpaymentsSubmitting,
  selectEpaymentsError,
  selectEpaymentsPaymentMode,
} from "@/store/epaymentsSlice";

export default function EpaymentsPreview() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const applicationIdEnc = searchParams.get("applicationId");
  const actIdEnc = searchParams.get("actId");

  const preview = useSelector(selectEpaymentsPreview);
  const loading = useSelector(selectEpaymentsLoading);
  const submitting = useSelector(selectEpaymentsSubmitting);
  const error = useSelector(selectEpaymentsError);
  const paymentMode = useSelector(selectEpaymentsPaymentMode);

  useEffect(() => {
    if (!applicationIdEnc || !actIdEnc) {
      toast.error("Missing application or act parameters.");
      dispatch(clearEpayments());
      return;
    }
    dispatch(
      fetchEpaymentsPreview({
        applicationIdEnc,
        actIdEnc,
      })
    );
    return () => {
      dispatch(clearEpayments());
    };
  }, [dispatch, applicationIdEnc, actIdEnc]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handlePayNow = () => {
    if (!preview) return;
    dispatch(
      initiateEpayment({
        applicationId: preview.applicationId,
        actId: preview.actId,
        paymentMode,
      })
    ).then((result) => {
      if (initiateEpayment.fulfilled.match(result)) {
        const { actionUrl, formData } = result.payload;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = actionUrl;
        form.target = "_self";
        form.enctype = "multipart/form-data";
        Object.entries(formData).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-600 mb-4">Unable to load payment preview.</p>
        <button
          type="button"
          onClick={() => navigate("/applicant-dashboard")}
          className="px-4 py-2 bg-[#2b5f88] text-white rounded hover:opacity-90"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded border">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Payment Preview
      </h1>
      <div className="space-y-3 text-sm">
        <p>
          <span className="font-medium text-gray-700">Service:</span>{" "}
          {preview.serviceName}
        </p>
        <p>
          <span className="font-medium text-gray-700">Applicant:</span>{" "}
          {preview.applicantName}
        </p>
        <p>
          <span className="font-medium text-gray-700">Payable amount:</span> ₹{" "}
          {preview.payableAmount}
        </p>
        {preview.securityDeposit != null && (
          <p className="text-gray-600">
            Licence fee: ₹ {preview.licenceFees ?? 0} + Security deposit: ₹{" "}
            {preview.securityDeposit}
          </p>
        )}
        {preview.preFees > 0 && (
          <p className="text-gray-600">
            Already paid: ₹ {preview.preFees} (Total fee: ₹ {preview.totalFees})
          </p>
        )}
      </div>

      <div className="mt-6">
        <label className="block font-medium text-gray-700 mb-2">
          Payment mode
        </label>
        <div className="space-y-2">
          {preview.paymentModes.map((m) => (
            <label
              key={m.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="paymentMode"
                value={m.value}
                checked={paymentMode === m.value}
                onChange={() => dispatch(setPaymentMode(m.value))}
                className="rounded border-gray-300"
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handlePayNow}
            disabled={submitting || preview.payableAmount <= 0}
            className="px-4 py-2 bg-[#2b5f88] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Redirecting..." : "Pay Now"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/applicant-dashboard")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
