import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import type { ClraLicenseListItem } from "@/store/clraLicenseRenewalSlice";
import {
  reconcileFeesPendingByGrn,
  type ReconcileOutcome,
  type ReconcileResult,
} from "./gripsReconcileApi";

/**
 * How each outcome is presented. Only `updated` is a success; `manual_review` is a
 * neutral "we've taken it from here", and the rest are plain failures that leave the
 * application where it was. Keeping this as data rather than nested conditionals means
 * a new backend outcome shows up as a missing key rather than a silently wrong tone.
 */
const OUTCOME_TONE: Record<
  ReconcileOutcome,
  { tone: "success" | "info" | "error"; title: string }
> = {
  updated: { tone: "success", title: "Payment verified" },
  already_paid: { tone: "success", title: "Already recorded" },
  manual_review: { tone: "info", title: "Sent for manual check" },
  not_paid: { tone: "error", title: "Not confirmed by GRIPS" },
  no_record: { tone: "error", title: "No payment found" },
  grn_mismatch: { tone: "error", title: "GRN does not match" },
  unavailable: { tone: "error", title: "Could not check right now" },
};

const TONE_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
} as const;

interface Props {
  row: ClraLicenseListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after an outcome that changed the application, so the list can refetch. */
  onReconciled: () => void;
}

export default function FeesPendingGrnModal({
  row,
  open,
  onOpenChange,
  onReconciled,
}: Props) {
  const [grn, setGrn] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset whenever a different row opens the modal, so a previous row's verdict is never
  // shown against a new application.
  useEffect(() => {
    if (open) {
      setGrn("");
      setPaymentDate("");
      setResult(null);
      setError(null);
      setSubmitting(false);
    }
  }, [open, row?.tagId]);

  const digits = grn.replace(/\D/g, "");
  const grnValid = digits.length >= 18 && digits.length <= 20;
  const paymentAppId = row?.paymentApplicationId ?? null;

  // The date input hands back `yyyy-MM-dd`; GRIPS wants `dd/MM/yyyy`.
  const paymentDateForApi = paymentDate
    ? paymentDate.split("-").reverse().join("/")
    : undefined;

  const handleSubmit = async () => {
    if (!row || !paymentAppId || !grnValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await reconcileFeesPendingByGrn({
        applicationId: paymentAppId,
        actId: row.payActId,
        grn: digits,
        paymentDate: paymentDateForApi,
      });
      setResult(res);
      if (res.outcome === "updated" || res.outcome === "already_paid") {
        onReconciled();
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Could not reach the verification service. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const verdict = result ? OUTCOME_TONE[result.outcome] : null;
  const settled =
    result?.outcome === "updated" || result?.outcome === "already_paid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1D5A89]" />
            Verify payment with GRIPS
          </DialogTitle>
          <DialogDescription>
            If you have already paid but this application still shows{" "}
            <span className="font-medium">Fees Pending</span>, enter the GRN from your
            GRIPS challan. We will check it directly with GRIPS and move the application
            forward if the payment is confirmed.
          </DialogDescription>
        </DialogHeader>

        {row && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] text-slate-700">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Application</span>
              <span className="font-medium">{row.formRef || `#${paymentAppId}`}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Type</span>
              <span className="font-medium">{row.applicationType}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Form-V serial</span>
              <span className="font-medium">{row.formVSerialNo}</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="grn-input">GRN (Government Reference Number)</Label>
          <Input
            id="grn-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 192026270112345678"
            value={grn}
            disabled={submitting || settled}
            onChange={(e) => setGrn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <p className="text-[11.5px] text-slate-500">
            18–20 digits, printed at the top of the challan you downloaded from GRIPS.
            {digits.length > 0 && !grnValid && (
              <span className="ml-1 text-amber-600">
                Currently {digits.length} digit{digits.length === 1 ? "" : "s"}.
              </span>
            )}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-date-input">
            Payment date{" "}
            <span className="font-normal text-slate-500">(recommended)</span>
          </Label>
          <Input
            id="payment-date-input"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={paymentDate}
            disabled={submitting || settled}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          <p className="text-[11.5px] text-slate-500">
            The date the payment was actually made, as shown on the challan. GRIPS can only
            confirm a payment when it is asked for the right date — giving it here makes the
            check exact, especially if you paid on a later day than you generated the challan.
          </p>
        </div>

        {!paymentAppId && (
          <div className={`flex gap-2 rounded-md border px-3 py-2 text-[12.5px] ${TONE_STYLES.error}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This application has no payment reference, so it cannot be verified here.
              Please contact the department.
            </span>
          </div>
        )}

        {error && (
          <div className={`flex gap-2 rounded-md border px-3 py-2 text-[12.5px] ${TONE_STYLES.error}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && verdict && (
          <div className={`space-y-1 rounded-md border px-3 py-2 text-[12.5px] ${TONE_STYLES[verdict.tone]}`}>
            <div className="flex items-center gap-2 font-semibold">
              {verdict.tone === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : verdict.tone === "info" ? (
                <Info className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {verdict.title}
            </div>
            <p>{result.message}</p>
            {result.data?.grn && (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11.5px] opacity-90">
                <dt>GRN</dt>
                <dd className="font-medium">{result.data.grn}</dd>
                {result.data.amount && (
                  <>
                    <dt>Amount</dt>
                    <dd className="font-medium">₹ {result.data.amount}</dd>
                  </>
                )}
                {result.data.bank && (
                  <>
                    <dt>Bank</dt>
                    <dd className="font-medium">{result.data.bank}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {settled ? "Close" : "Cancel"}
          </Button>
          {!settled && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!grnValid || submitting || !paymentAppId}
              className="bg-[#1D5A89] hover:bg-[#17486e]"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Checking with GRIPS…" : "Verify payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
