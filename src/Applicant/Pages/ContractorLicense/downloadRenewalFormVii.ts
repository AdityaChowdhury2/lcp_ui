import { API_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";

export function downloadRenewalFormVii(
  renewalApplicationId: string | number | null | undefined,
  onError: (message: string) => void
): void {
  if (renewalApplicationId == null) {
    onError("Renewal application reference missing for FORM-VII download.");
    return;
  }

  const encRenewalId = encryptionDecryptionFun("encrypt", String(renewalApplicationId)) ?? "";
  const encZero = encryptionDecryptionFun("encrypt", "0") ?? "";

  if (!encRenewalId || !encZero) {
    onError("Unable to prepare FORM-VII download link.");
    return;
  }

  const url =
    `${API_BASE}pdf-form-vii` +
    `?licenserenewalid=${encodeURIComponent(encRenewalId)}` +
    `&contractorid=${encodeURIComponent(encZero)}` +
    `&docType=${encodeURIComponent("FORM-VII")}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

export function downloadAmendmentApplicationForm(
  amendmentApplicationId: string | number | null | undefined,
  onError: (message: string) => void,
  formVSerialNo?: string | number | null,
): void {
  if (amendmentApplicationId == null) {
    onError("Amendment application reference missing for application form download.");
    return;
  }

  const encAmendmentId = encryptionDecryptionFun("encrypt", String(amendmentApplicationId)) ?? "";
  const encZero = encryptionDecryptionFun("encrypt", "0") ?? "";

  if (!encAmendmentId || !encZero) {
    onError("Unable to prepare amendment application download link.");
    return;
  }

  const q = new URLSearchParams({
    amendmentid: encAmendmentId,
    contractorid: encZero,
    docType: "Application Form",
  });
  const serial = formVSerialNo != null ? Number(formVSerialNo) : NaN;
  if (Number.isFinite(serial) && serial > 0) {
    q.set("formvserialno", String(Math.trunc(serial)));
  }

  const url = `${API_BASE}pdf-form-vii-amendment?${q.toString()}`;

  window.open(url, "_blank", "noopener,noreferrer");
}
