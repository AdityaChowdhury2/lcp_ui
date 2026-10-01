import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { toast } from "react-toastify";
import {
  AlertCircle,
  ChevronRight,
  CreditCard,
  FilePlus2,
  FileSignature,
  Info,
  PencilLine,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  Wallet,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import {
  canUploadSignedAmendment,
  fetchContractorLicenseRenewalAmendmentList,
  mapContractorLicenseStatusCodeToLabel,
  selectClraLicenseRenewalAmendmentList,
  type ClraLicenseListItem,
} from "@/store/clraLicenseRenewalSlice";
import { IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { syncAmendmentReduxFromSession } from "@/store/syncAmendmentReduxFromSession";
import {
  buildAmendmentDetailsPath,
  buildAmendmentReSubmitPath,
  resolveUpdatedFormV,
} from "@/utils/contractorLicenseRouteLinks";
import { encryptionDecryptionFun } from "@/utils/encryption";
import FeesPendingGrnModal from "./FeesPendingGrnModal";

/** Map legacy single-letter status codes to STATUS_IMAGE_MAP keys (labels or codes). */
function resolveStatusImageFile(code: string | null | undefined): string | null {
  const c = (code ?? "").trim();
  if (!c) return null;
  // if (STATUS_IMAGE_MAP[c]) return STATUS_IMAGE_MAP[c];
  const alias: Record<string, string> = {
    P: "Fees Paid",
    A: "Fees Pending",
    F: "Applied",
    I: "Issued",
    R: "Rejected",
    B: "Rectification",
    U: "Final Submitted",
    S: "Final Submitted",
    AW: "Approved",
    BI: "BI",
    FW: "Pending",
    C: "Pending",
    BF: "U",
  };
  const mapped = alias[c];
  if (mapped && STATUS_IMAGE_MAP[mapped]) return STATUS_IMAGE_MAP[mapped];
  return null;
}

/** Colours for the text badge shown when a status code has no legacy image. */
const STATUS_BADGE_TONE: Record<string, string> = {
  I: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  AW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  P: "bg-sky-50 text-sky-700 ring-sky-200",
  A: "bg-amber-50 text-amber-700 ring-amber-200",
  B: "bg-orange-50 text-orange-700 ring-orange-200",
  BF: "bg-orange-50 text-orange-700 ring-orange-200",
  R: "bg-rose-50 text-rose-700 ring-rose-200",
};

/** Pill colours per application type, so the three flows stay visually distinct. */
const APPLICATION_TYPE_TONE: Record<ClraLicenseListItem["applicationType"], string> = {
  License: "bg-sky-50 text-sky-700 ring-sky-200",
  Renewal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Amendment: "bg-violet-50 text-violet-700 ring-violet-200",
};

/**
 * The API sends these cells as newline joined `Label: value` text. Split each line
 * back apart so the label can be de-emphasised and the value can carry the weight.
 */
function splitLabelledLine(line: string): { label: string | null; value: string } {
  const idx = line.indexOf(":");
  if (idx > 0 && idx <= 40) {
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  }
  return { label: null, value: line.trim() };
}

const LabelledLines: React.FC<{ text: string; highlightFirst?: boolean }> = ({
  text,
  highlightFirst = false,
}) => {
  const lines = (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return <span className="text-slate-400">—</span>;

  return (
    <div className="flex flex-col gap-1 py-1">
      {lines.map((line, index) => {
        const { label, value } = splitLabelledLine(line);
        const isPrimary = highlightFirst && index === 0;
        return (
          <div key={`${line}-${index}`} className="leading-snug">
            {label && (
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
              </span>
            )}
            <span
              className={
                isPrimary
                  ? "block text-[13.5px] font-bold text-[#0B2C48]"
                  : "block text-[12.5px] text-slate-700"
              }
            >
              {value || "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ACTION_TONES = {
  amber: "bg-amber-500 hover:bg-amber-600 focus-visible:outline-amber-500",
  indigo: "bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600",
  green: "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600",
  sky: "bg-sky-600 hover:bg-sky-700 focus-visible:outline-sky-600",
} as const;

const RowAction: React.FC<{
  tone: keyof typeof ACTION_TONES;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ tone, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${ACTION_TONES[tone]}`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="leading-tight">{label}</span>
  </button>
);

const ListofLicense: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, items } = useSelector((state: RootState) =>
    selectClraLicenseRenewalAmendmentList(state)
  );

  useEffect(() => {
    dispatch(fetchContractorLicenseRenewalAmendmentList());
  }, [dispatch]);

  useEffect(() => {
    syncAmendmentReduxFromSession(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  /** Row whose GRN-verification modal is open, if any. */
  const [grnModalRow, setGrnModalRow] = useState<ClraLicenseListItem | null>(null);

  /**
   * Applications the portal still shows as "Fees Pending" (status `A`). These are the
   * rows an applicant may have already paid for without the portal recording it, so they
   * get the GRN re-check. Derived from the list already in the store — no extra request.
   */
  const feesPendingRows = useMemo(
    () => items.filter((row) => (row.statusCode ?? "").trim() === "A"),
    [items]
  );

  const setContextAndNavigate = (row: ClraLicenseListItem, target: "renewal" | "amendment") => {
    sessionStorage.setItem(
      "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
      JSON.stringify({
        formVSerialNo: row.formVSerialNo,
        updatedFormV: resolveUpdatedFormV(row.updatedFormV, row.formVSerialNo),
        legacyLicenseId: row.licenseApplicationId,
        paymentApplicationId: row.paymentApplicationId ?? null,
        renewalApplicationId: row.renewalApplicationId ?? null,
        contractorParticularId: row.contractorParticularId,
        tagFlag: row.flag,
        statusCode: row.statusCode,
        payActId: row.payActId,
      })
    );
    syncAmendmentReduxFromSession(dispatch);
    if (target === "amendment") {
      const applyPath =
        row.licenseApplicationId != null
          ? buildAmendmentDetailsPath({
            formVSerialNo: row.formVSerialNo,
            licenseId: row.licenseApplicationId,
            updatedFormV: row.formVSerialNo,
          })
          : null;
      navigate(applyPath ?? "/license-renewal-amendment-list");
    } else {
      navigate("/contractor-license/renewal");
    }
  };

  const handleView = (row: ClraLicenseListItem) => {
    if (row.applicationType === "Amendment") {
      setContextAndNavigate(row, "amendment");
      return;
    }
    if (row.applicationType === "Renewal" || row.applicationType === "License") {
      setContextAndNavigate(row, "renewal");
      return;
    }
    setContextAndNavigate(row, "renewal");
  };

  const handleViewDetails = (row: ClraLicenseListItem) => {
    const { flag, applicationType, statusCode, licenseApplicationId } = row;

    if (!row.licenseApplicationId) {
      toast.error("License reference is not available for this row.");
      return;
    }

    switch (flag) {
      case "A":
        setContextAndNavigate(row, "amendment");

        // Fees Paid - Go to details
        // if (statusCode === 'P') navigate(`/contractor-license/details/${encodeURIComponent('abc')}?formVSerialNo=${encodeURIComponent('abc')}`);

        // Fees Paid - Go to Re-Submit
        if (statusCode === 'B') navigate(`/contractor-license/details/${encodeURIComponent('abc')}?formVSerialNo=${encodeURIComponent('abc')}`);

        return;
      case "R":
        setContextAndNavigate(row, "renewal");
        return;
      case "L":
        // setContextAndNavigate(row, "license");
        return;
      default:
        break;
    }

    // if (row.applicationType === "Amendment") {
    //   setContextAndNavigate(row, "amendment");
    //   return;
    // }

    const encryptedLicenseId = encryptionDecryptionFun("encrypt", String(row.licenseApplicationId)) ?? "";
    const encryptedFormVSerialNo = encryptionDecryptionFun("encrypt", String(row.formVSerialNo)) ?? "";
    // if (!encryptedLicenseId || !encryptedFormVSerialNo) {
    //   toast.error("Unable to prepare license details link.");
    //   return;
    // }

    navigate(
      `/contractor-license/details/${encodeURIComponent(
        encryptedLicenseId
      )}?formVSerialNo=${encodeURIComponent(encryptedFormVSerialNo)}`
    );
  };

  // Funtion to handle the re-submit -->
  const handleReSubmit = (row: ClraLicenseListItem) => {

    const { flag, statusCode } = row;

    if (flag !== "A" || statusCode !== "B") return;

    const resubmitPath = buildAmendmentReSubmitPath({
      formVSerialNo: row.formVSerialNo,
      updatedFormV: row.updatedFormV,
      amendmentId: row.renewalApplicationId,
    });

    if (!resubmitPath) {
      toast.error("Amendment reference is not available for this row.");
      return;
    }

    // The re-submit page edits the same amendment draft as the apply flow, so it needs the
    // row's own context — not whatever row was opened last.
    sessionStorage.setItem(
      "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
      JSON.stringify({
        formVSerialNo: row.formVSerialNo,
        updatedFormV: resolveUpdatedFormV(row.updatedFormV, row.formVSerialNo),
        legacyLicenseId: row.licenseApplicationId,
        paymentApplicationId: row.paymentApplicationId ?? null,
        renewalApplicationId: row.renewalApplicationId ?? null,
        amendmentDraftId: row.renewalApplicationId ?? null,
        contractorParticularId: row.contractorParticularId,
        tagFlag: row.flag,
        statusCode: row.statusCode,
        payActId: row.payActId,
      })
    );
    syncAmendmentReduxFromSession(dispatch);

    navigate(resubmitPath);
  }

  /**
   * An amendment whose fields were picked but which was never finally submitted sits at
   * "Incomplete". Drop the applicant back on the apply screen to finish and submit it.
   */
  const handleCompleteAmendment = (row: ClraLicenseListItem) => {
    const updatedFormV = resolveUpdatedFormV(row.updatedFormV, row.formVSerialNo);
    const applyPath =
      row.licenseApplicationId != null && updatedFormV != null
        ? buildAmendmentDetailsPath({
          formVSerialNo: row.formVSerialNo,
          licenseId: row.licenseApplicationId,
          updatedFormV,
        })
        : null;

    if (!applyPath) {
      toast.error("License reference is not available for this amendment.");
      return;
    }

    // The apply screen loads its snapshot from this context, so it has to describe *this*
    // row — including the amendment row it must fetch and submit against.
    sessionStorage.setItem(
      "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
      JSON.stringify({
        formVSerialNo: row.formVSerialNo,
        updatedFormV,
        legacyLicenseId: row.licenseApplicationId,
        paymentApplicationId: row.paymentApplicationId ?? null,
        renewalApplicationId: row.renewalApplicationId ?? null,
        amendmentDraftId: row.renewalApplicationId ?? null,
        contractorParticularId: row.contractorParticularId,
        tagFlag: row.flag,
        statusCode: row.statusCode,
        payActId: row.payActId,
      })
    );
    syncAmendmentReduxFromSession(dispatch);

    navigate(applyPath);
  };

  const handleViewRemarks = (row: ClraLicenseListItem) => {
    if (row.contractorParticularId == null) {
      toast.error("Particular reference is not available for remarks on this row.");
      return;
    }
    const flag = (row.flag ?? "L").trim() || "L";
    navigate(
      `/contractor-license/remarks?formVSerialNo=${encodeURIComponent(
        String(row.formVSerialNo)
      )}&particularId=${encodeURIComponent(
        String(row.contractorParticularId)
      )}&flag=${encodeURIComponent(flag)}`
    );
  };

  const handlePayNow = (row: ClraLicenseListItem) => {
    const paymentAppId = row.paymentApplicationId ?? null;
    if (!paymentAppId) {
      toast.error("Application reference missing for payment.");
      return;
    }
    const encApp =
      encryptionDecryptionFun("encrypt", String(paymentAppId)) ?? "";
    const encAct = encryptionDecryptionFun("encrypt", String(row.payActId)) ?? "";
    if (!encApp || !encAct) {
      toast.error("Unable to prepare payment link.");
      return;
    }
    navigate(
      `/epayments-preview?applicationId=${encodeURIComponent(encApp)}&actId=${encodeURIComponent(encAct)}`
    );
  };

  const handleViewCertificate = (row: ClraLicenseListItem) => {
    const encRenewalId = encryptionDecryptionFun("encrypt", String(row.renewalApplicationId)) ?? "";
    const encLicenseId = encryptionDecryptionFun("encrypt", String(row.licenseApplicationId)) ?? "";
    const encSerialNo = encryptionDecryptionFun("encrypt", String(row.formVSerialNo)) ?? "";
    if (!encRenewalId || !encLicenseId || !encSerialNo) {
      toast.error("Application reference missing for certificate.");
      return;
    }
    navigate(`/contractor-license/renewal/form-vi/${encodeURIComponent(encRenewalId)}/${encodeURIComponent(encLicenseId)}/${encodeURIComponent(encSerialNo)}/${row.flag}`)
  };

  const handleUploadFormVii = (row: ClraLicenseListItem) => {
    sessionStorage.setItem(
      "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
      JSON.stringify({
        formVSerialNo: row.formVSerialNo,
        legacyLicenseId: row.licenseApplicationId,
        paymentApplicationId: row.paymentApplicationId ?? null,
        renewalApplicationId: row.renewalApplicationId ?? null,
        contractorParticularId: row.contractorParticularId,
        tagFlag: row.flag,
        statusCode: row.statusCode,
        payActId: row.payActId,
      })
    );
    syncAmendmentReduxFromSession(dispatch);
    navigate("/contractor-license/renewal/upload-form-vii");
  };

  const handleUploadAmendmentSignedForm = (row: ClraLicenseListItem) => {
    sessionStorage.setItem(
      "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
      JSON.stringify({
        formVSerialNo: row.formVSerialNo,
        legacyLicenseId: row.licenseApplicationId,
        paymentApplicationId: row.paymentApplicationId ?? null,
        renewalApplicationId: row.renewalApplicationId ?? null,
        contractorParticularId: row.contractorParticularId,
        tagFlag: row.flag,
        statusCode: row.statusCode,
        payActId: row.payActId,
      })
    );
    syncAmendmentReduxFromSession(dispatch);
    navigate("/contractor-license/amendment/upload-signed-form");
  };

  const columns: TableColumn<ClraLicenseListItem>[] = [
    {
      name: "Sl. No",
      width: "70px",
      center: true,
      sortable: false,
      cell: (_row, index) => (
        <span className="text-[12px] font-semibold tabular-nums text-slate-500">
          {index !== undefined ? index + 1 : "—"}
        </span>
      ),
    },
    {
      name: (
        <span className="leading-tight">
          Form-V / Ref. No.
          <br />
          P.E. Registration Details
        </span>
      ),
      minWidth: "230px",
      grow: 2,
      wrap: true,
      cell: (row) => <LabelledLines text={row.formRef} highlightFirst />,
    },
    {
      name: "License Details",
      minWidth: "215px",
      grow: 2,
      wrap: true,
      cell: (row) => (
        <div className="py-1">
          <LabelledLines text={row.licenseDetails} highlightFirst />
          <button
            type="button"
            onClick={() =>
              navigate(
                `/license-more-details?formVSerialNo=${encodeURIComponent(
                  String(row.formVSerialNo)
                )}`
              )
            }
            className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#1D5A89] hover:text-[#0B2C48] hover:underline"
          >
            <Info className="h-3.5 w-3.5" />
            More Information
          </button>
        </div>
      ),
    },
    {
      name: (
        <span className="leading-tight">
          Applied For
          <br />
          Application Date
        </span>
      ),
      minWidth: "150px",
      wrap: true,
      cell: (row) => (
        <div className="flex flex-col items-start gap-1.5 py-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${APPLICATION_TYPE_TONE[row.applicationType] ??
              "bg-slate-50 text-slate-700 ring-slate-200"
              }`}
          >
            {row.applicationType}
          </span>
          <span className="text-[12px] text-slate-600">
            {row.applicationDate || "—"}
          </span>
        </div>
      ),
    },
    {
      name: "Status",
      width: "140px",
      center: true,
      cell: (row) => {
        const code = row.statusCode?.trim() ?? "";
        const label = row.statusLabel || mapContractorLicenseStatusCodeToLabel(code);
        const img = resolveStatusImageFile(code);
        if (img) {
          return (
            <img
              src={`${IMAGE_BASE}${img}`}
              alt={label}
              title={label}
              className="max-h-8 object-contain"
            />
          );
        }
        return (
          <span
            title={label}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-center text-[11px] font-semibold ring-1 ring-inset ${STATUS_BADGE_TONE[code] ?? "bg-slate-50 text-slate-600 ring-slate-200"
              }`}
          >
            {label}
          </span>
        );
      },
    },
    {
      name: "Action",
      width: "205px",
      cell: (row) => {
        const flag = (row.flag ?? "L").trim().toUpperCase();
        const actId = flag === "R" ? "13" : flag === "A" ? "14" : "12";
        const appId = String(row.contractorParticularId ?? "");

        const encActId = encryptionDecryptionFun("encrypt", actId) ?? "";
        const encAppId = encryptionDecryptionFun("encrypt", appId) ?? "";

        const statusCode = row.statusCode?.trim() ?? "";
        const actions: React.ReactNode[] = [];

        // Blank status = saved as a draft, never finally submitted.
        if (row.applicationType === "Amendment" && statusCode === "") {
          actions.push(
            <RowAction
              key="complete-amendment"
              tone="sky"
              icon={<PencilLine className="h-3.5 w-3.5" />}
              label="Complete Application"
              onClick={() => handleCompleteAmendment(row)}
            />
          );
        }

        if (row.flag === "A" && statusCode === "B" && row.licenseApplicationId != null) {
          actions.push(
            <RowAction
              key="resubmit"
              tone="amber"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Re-Submit"
              onClick={() => handleReSubmit(row)}
            />
          );
        }

        if (statusCode === "A" && row.licenseApplicationId != null) {
          actions.push(
            <RowAction
              key="pay"
              tone="amber"
              icon={<CreditCard className="h-3.5 w-3.5" />}
              label="Pay Now"
              onClick={() => handlePayNow(row)}
            />
          );
          // The applicant may already have paid without the portal recording it. Offer
          // the GRIPS re-check next to "Pay Now" so they do not pay a second time.
          actions.push(
            <RowAction
              key="already-paid"
              tone="sky"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Already paid? Verify GRN"
              onClick={() => setGrnModalRow(row)}
            />
          );
        }

        if (row.applicationType === "Renewal" && statusCode === "P") {
          actions.push(
            <RowAction
              key="form-vii"
              tone="indigo"
              icon={<UploadCloud className="h-3.5 w-3.5" />}
              label="Download & Upload FORM-VII"
              onClick={() => handleUploadFormVii(row)}
            />
          );
        }

        if (row.applicationType === "Amendment" && canUploadSignedAmendment(row.statusCode)) {
          actions.push(
            <RowAction
              key="signed-form"
              tone="indigo"
              icon={<FileSignature className="h-3.5 w-3.5" />}
              label="Upload signed application"
              onClick={() => handleUploadAmendmentSignedForm(row)}
            />
          );
        }

        if (
          statusCode === "I" &&
          (row.applicationType === "License" ||
            row.applicationType === "Amendment" ||
            row.applicationType === "Renewal")
        ) {
          actions.push(
            <RowAction
              key="certificate"
              tone="green"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="View Certificate"
              onClick={() => handleViewCertificate(row)}
            />
          );
        }

        if (!actions.length) {
          return <span className="text-[11.5px] text-slate-400">No action required</span>;
        }

        return <div className="flex w-full flex-col gap-1.5 py-2">{actions}</div>;
      },
    },
  ];

  const tableStyles: TableStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#1D5A89",
        minHeight: "54px",
        borderBottomWidth: "0",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#1D5A89",
        color: "#ffffff",
        fontSize: "11.5px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.045em",
        whiteSpace: "normal",
        lineHeight: "15px",
        paddingTop: "12px",
        paddingBottom: "12px",
        paddingLeft: "12px",
        paddingRight: "12px",
        borderRight: "1px solid rgba(255,255,255,0.16)",
      },
    },
    rows: {
      style: {
        minHeight: "78px",
        fontSize: "13px",
        color: "#334155",
        borderBottomColor: "#e2e8f0",
      },
      stripedStyle: {
        backgroundColor: "#f8fafc",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#eaf4fb",
        borderBottomColor: "#cfe4f2",
        outline: "none",
        transitionDuration: "0.15s",
        transitionProperty: "background-color",
      },
    },
    cells: {
      style: {
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "12px",
        paddingRight: "12px",
        borderRight: "1px solid #eef2f7",
      },
    },
    pagination: {
      style: {
        fontSize: "12.5px",
        color: "#475569",
        borderTopColor: "#e2e8f0",
      },
    },
    noData: {
      style: {
        padding: "20px",
        fontSize: "13px",
      },
    },
  };

  return (
    <div className="w-full px-2 py-4 md:px-8">
      {/* Page heading */}
      <div className="mb-5 border-l-4 border-[#52C7EA] pl-3">
        <h1 className="text-lg font-bold uppercase leading-snug tracking-tight text-[#0B2C48] md:text-xl">
          Application list for License, Amendment of License and Renewal of
          License under CLRA
        </h1>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Track every application raised against your Form-V references and act
          on the ones that need you.
        </p>
      </div>

      {/* Primary actions */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/check_fromv_no")}
          className="group flex items-center gap-3 rounded-xl bg-linear-to-r from-[#1D5A89] to-[#2E82B8] px-4 py-3.5 text-left text-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5A89]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15">
            <FilePlus2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Apply New Licence</span>
            <span className="block text-[11.5px] text-white/75">
              Fresh CLRA contractor licence against a Form-V
            </span>
          </span>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/renewal/old_renewal")}
          className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#2BB8DF] to-[#52C7EA] px-4 py-3.5 text-left text-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2BB8DF]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/20">
            <RefreshCw className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              Apply Renewal / Amendment of Licence
            </span>
            <span className="block text-[11.5px] text-white/85">
              Check eligibility with your Form-V and licence number
            </span>
          </span>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {error && status !== "loading" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fees pending — payments the portal has not confirmed yet.
          Shown above the table because an applicant who has already paid needs to find
          the GRN re-check before they reach for "Pay Now" a second time. */}
      {status !== "loading" && feesPendingRows.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm">
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-100/70 px-4 py-2.5">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="min-w-0">
              <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-amber-800">
                Fees pending ({feesPendingRows.length})
              </h2>
              <p className="text-[11.5px] text-amber-800/80">
                Already paid but still showing as pending? Enter the GRN from your GRIPS
                challan and we will confirm it with GRIPS — do not pay again.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-amber-200/70">
            {feesPendingRows.map((row) => (
              <li
                key={`fees-pending-${row.tagId}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#0B2C48]">
                    {row.formRef || `Form-V ${row.formVSerialNo}`}
                  </p>
                  <p className="text-[11.5px] text-slate-600">
                    {row.applicationType} · Form-V {row.formVSerialNo}
                    {row.applicationDate ? ` · applied ${row.applicationDate}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setGrnModalRow(row)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1D5A89] px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#17486e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5A89]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Already paid? Verify GRN
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePayNow(row)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Pay Now
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FeesPendingGrnModal
        row={grnModalRow}
        open={grnModalRow !== null}
        onOpenChange={(next) => {
          if (!next) setGrnModalRow(null);
        }}
        onReconciled={() => {
          dispatch(fetchContractorLicenseRenewalAmendmentList());
        }}
      />

      {/* Applications table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-600">
            Your applications
          </h2>
          {status !== "loading" && (
            <span className="rounded-full bg-[#1D5A89]/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1D5A89]">
              {items.length} {items.length === 1 ? "record" : "records"}
            </span>
          )}
        </div>

        {status === "loading" ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
            <p className="pt-1 text-center text-[12.5px] text-slate-500">
              Loading applications…
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            customStyles={tableStyles}
            responsive
            striped
            highlightOnHover
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            noDataComponent={
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No applications yet
                </p>
                <p className="mt-1 text-[12.5px] text-slate-500">
                  Use “Apply New Licence” above to start your first CLRA licence
                  application.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ListofLicense;
