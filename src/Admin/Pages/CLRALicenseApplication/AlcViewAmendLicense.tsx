import React, { ReactElement, useEffect, useState } from "react";
import { GrDocument, GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdWarning } from "react-icons/io";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../Components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";

import { Card, CardHeader } from "../../../Components/ui/card";
import { Button } from "../../../Components/ui/button";
import { Checkbox } from "../../../Components/ui/checkbox";
import axios from "axios";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { Eye } from "lucide-react";
import { IoDocument, IoDownload, IoInformationCircle, IoRemove } from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { mapWorkflowAction } from "@/utils/helper-functions/mapWorkflowAction";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { toast } from "react-toastify";

interface AppData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  previousInputs?: string | ReactElement;
  verified: ReactElement;
  hidePreviousColumn?: boolean;
}

// Seperate interface for docData
interface DocData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  verified: ReactElement;
}

interface ContractorData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  status: ReactElement;
}

interface DocData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  previousInputs: string | ReactElement;
  icon1: ReactElement | string;
  // icon2: ReactElement | string;
  verified: ReactElement;
}
interface RemarkData {
  id: string;
  remarkDate: string;
  remarkText: string;
  remarkType: string;
  statusLabel: ReactElement | string;
  formv_serialno: string;
  remarkByName: string;
  remarkByRoleId: ReactElement | string;
  act: ReactElement;
  canDelete: boolean;
}

interface FeeRow {
  slNo: number;
  description: string;
  fee: string;
}

interface AvailableAction {
  value: string;
  label: string;
}

interface PaymentTransaction {
  transactionId?: string;
  amount?: string | number;
  bankCode?: string;
  status?: string;
  paymentStatus?: string;
  grnNumber?: string;
  challanDate?: string;
  departmentReferenceNo?: string;
}

interface ApiRemark {
  id: number;
  remarkText: string;
  remarkType: string;
  statusLabel: string;
  remarkDate: string;
  remarkByName: string;
  remarkByRoleId: number;
  canDelete?: boolean;
}

type Option = {
  value: string;
  label: string;
};

const feeData: FeeRow[] = [
  { slNo: 1, description: "Is upto 100", fee: "₹500.00" },
  { slNo: 2, description: "Exceeds 100 but does not exceed 500", fee: "₹2000.00" },
  { slNo: 3, description: "Exceeds 500", fee: "₹10000.00" },
];

// --------------------- Main Component ---------------------

const AlcViewAmendLicense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // const { ammendIdParam } = useParams<{ ammendIdParam: string }>();
  // const { createdByParam } = useParams<{ createdByParam: string }>();
  const alcUserId = getUserId();


  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<any>();
  const [modalOpen, setModalOpen] = useState(false);

  const [applicationStatus, setApplicationStatus] = useState<string>("");
  const [applicationStatusType, setApplicationStatusType] =
    useState<"warning" | "info" | "success">("info");
  const [applicationStatusMsg, setApplicationStatusMsg] =
    useState<string>("");
  const [registrationNo, setRegistrationNo] = useState();
  const [registrationDate, setRegistrationDate] = useState();
  const [qrCode, setQrCode] = useState();
  const [certificate, setCertificate] = useState();
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [remarkOptions, setRemarkOptions] = useState<Record<string, string>>({});
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [remarkIdToDelete, setRemarkIdToDelete] = useState<number | null>(null);
  const [isDeletingRemark, setIsDeletingRemark] = useState(false);

  const showLoadingOverlay = isInitialLoad && isLoading;

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, isLoading]);

  useEffect(() => {
    document.body.style.overflow = showLoadingOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLoadingOverlay]);

  const formVEnc = searchParams.get("formVNo") ?? "";
  const amendIdEnc = searchParams.get("amendId") ?? "";
  const updatedFormVEnc = searchParams.get("updatedFormVNo") ?? "";
  const createdByEnc = searchParams.get("createdBy") ?? "";

  const formVNo = formVEnc
    ? encryptionDecryptionFun("decrypt", formVEnc)
    : "";

  const amendId = amendIdEnc
    ? encryptionDecryptionFun("decrypt", amendIdEnc)
    : "";

  const updatedFormVNo = updatedFormVEnc
    ? encryptionDecryptionFun("decrypt", updatedFormVEnc)
    : "";

  const createdBy = createdByEnc
    ? encryptionDecryptionFun("decrypt", createdByEnc)
    : "";

  const flagParam = searchParams.get("flag") ?? "";
  const renewalAmmendmentIdParam = searchParams.get("license_renewal_ammendment_id") ?? "";

  const safeRows = applicationData?.applicationComparison?.rows ?? [];
  const safeUploadedDocuments = applicationData?.uploadedDocuments ?? {};
  const safeCurrentDocuments = safeUploadedDocuments?.current ?? {};
  const safePreviousDocuments = safeUploadedDocuments?.previous ?? {};
  const safeCurrentPayment = applicationData?.paymentDetails?.current ?? {};
  const safePreviousPayment = applicationData?.paymentDetails?.previous ?? {};
  const previousSource = applicationData?.applicationComparison?.previousSource;

  const currentApplication =
    applicationData?.applicationDetails?.current ?? {};

  const previousApplication =
    applicationData?.applicationDetails?.previous ?? {};

  const currentWorksite =
    currentApplication?.worksiteDetails ?? {};

  const previousWorksite =
    previousApplication?.worksiteDetails ?? {};

  const formV = applicationData?.licenseInformation?.formVNumber;

  console.log("applicationData", applicationData)

  // ===============
  // STATUS MAPPING
  //================
  const statusImageMap: Record<string, string> = {
    Approved: `${IMAGE_BASE}btn-approved.png`,
    'Approved Without Fees': `${IMAGE_BASE}btn-approved.png`,
    Applied: `${IMAGE_BASE}btn-applied.png`,
    "Fees Paid": `${IMAGE_BASE}btn-fees-paid.png`,
    "Fees Pending": `${IMAGE_BASE}btn-fees-pending.png`,
    "Approved for Fees Submission": `${IMAGE_BASE}btn-fees-pending.png`,
    Pending: `${IMAGE_BASE}btn-applied.png`,
    "Final Submitted": `${IMAGE_BASE}btn-final-submit.png`,
    "Signed Amendment Uploaded": `${IMAGE_BASE}btn-final-submit.png`,
    Issued: `${IMAGE_BASE}btn-issued.png`,
    "Certificate Issued": `${IMAGE_BASE}btn-issued.png`,
    Rectification: `${IMAGE_BASE}btn-rectification.png`,
    "Rectify Application": `${IMAGE_BASE}btn-rectification.png`,
    Backed: `${IMAGE_BASE}btn-rectification.png`,
    "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
    "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
    Rejected: `${IMAGE_BASE}btn-reject.png`,
    Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
    "FORM VII Backed": `${IMAGE_BASE}btn-rectify-signed-form.png`,
  };

  const applicationStatusDetailMsgMap: Record<string, string> = {
    "B": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "BI": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "T": "Applicant is CALLED BY ALC",
    "I": "Certificate is issued. For any changes in the FORM-VI(Certificate), Applicant can opt for Amendment of Registration Certificate. If you want to get back to the previous remark and re-upload FORM-VI(Certificate), delete the current remark by clicking the delete option.",
    "FW": "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    "P": "Payment successful for this application. Form-IV is not uploaded by the applicant. After submission of signed FORM-IV by the applicant, the application can be further accessible .",
    "A": "Application is approved and directed to pay fees. After fees payment and submission of signed FORM-IV by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "R": "Application is rejected. This remark cannot be deleted.",
    "AW": "Application is approved without fees. After submission of signed FORM-IV by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "S": "FORM-IV is submitted by the Applicant. After verification of uploaded FORM-IV, Issue of Registration Certificate can be generated now or back to rectification FORM-IV.",
    // "U": "Application is sent back for rectification of Form-IV. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "U": "FORM-IV is submitted by the Applicant. After verification of uploaded FORM-IV, Issue of Registration Certificate can be generated now or back to rectification FORM-IV.",
    "F": "Application is applied by the Applicant. Any action can be taken for the application.",
    "": "",
  };

  // =================
  // Add status mapper
  // =================
  type StatusType = "warning" | "info" | "success";

  const getStatusMeta = (
    status?: string
  ): { label: string; type: StatusType } => {
    switch (status) {
      case "B":
        return {
          label: "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
          type: "warning",
        };

      case "BI":
        return {
          label: "Application is sent back to Inspector.",
          type: "warning",
        };

      case "FW":
        return {
          label: "Forwarded",
          type: "info",
        };

      case "A":
        return {
          label: "Application is verified, applicant is allowed to pay the fees.",
          type: "warning",
        };

      case "AW":
        return {
          label: "Application is approved.",
          type: "success",
        };

      case "S":
        return {
          label: "Final submitted.",
          type: "warning",
        };

      case "I":
        return {
          label: "Congratulations! Certificate is issued.",
          type: "success",
        };

      case "R":
        return {
          label: "Application is rejected due to discrepancies.",
          type: "warning",
        };

      case "P":
        return {
          label: "Application is sent back for rectification of Form-IV. Kindly modify, sign and re-upload the Form-IV.",
          type: "warning",
        };

      // case "U":
      //   return {
      //     label: "FORM VII Backed",
      //     type: "warning",
      //   };

      case "U":
        return {
          label: "Final submitted.",
          type: "warning",
        };

      case "F":
      default:
        return {
          label: "Applied",
          type: "info",
        };
    }
  };

  const getComparisonRow = (index: number) => safeRows[index] ?? {};
  const getDocumentStatus = (document: any) => {
    if (!document) return "Not available";

    // old API object format
    if (typeof document === "object") {
      return document.available || document.fid
        ? "Available"
        : "Not available";
    }

    // new API numeric fid format
    if (typeof document === "number" || typeof document === "string") {
      return "Available";
    }

    return "Not available";
  };
  const renderPreviousDocumentInput = (document: any, legacyDocumentCode: string) =>
    getDocumentStatus(document) === "Available" ? (
      <div className="flex gap-1">
        <button
          onClick={() =>
            previousSource === "license"
              ? handleOpenPdfDocLegacy(legacyDocumentCode)
              : handleOpenPdfDocFileManaged(String(document?.fid))
          }
        >
          <FaRegNoteSticky className="text-yellow-500 text-2xl" />
        </button>
        <FaMagnifyingGlass className="text-2xl text-black" />
      </div>
    ) : (
      // <p>No Document Uploaded</p>
      <p></p>
    );
  const getTransactionSummary = (paymentBlock: any): PaymentTransaction[] => {
    const transactions = paymentBlock?.transactions;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    return transactions;
  };
  const renderPaymentDetails = (paymentBlock: any) => {
    const transactions = getTransactionSummary(paymentBlock);

    if (transactions.length === 0) {
      return <p>No transaction available</p>;
    }

    return (
      <div className="space-y-3">
        <p>GRIPS Payment [Online / Counter]</p>
        {transactions.map((transaction, index) => {
          const transactionStatus =
            transaction?.status ??
            transaction?.paymentStatus ??
            "Transaction available";

          return (
            <div
              key={transaction?.transactionId ?? `${paymentBlock?.applicationId ?? "payment"}-${index}`}
              className=""
            >
              <p>
                <span className="font-medium">Transaction {index + 1}:</span>{" "}
                {transactionStatus}
              </p>
              {transaction?.transactionId && (
                <p>Transaction ID: {transaction.transactionId}</p>
              )}
              {transaction?.amount !== undefined && transaction?.amount !== null && (
                <p>Amount: {transaction.amount}</p>
              )}
              {transaction?.bankCode && <p>Bank: {transaction.bankCode}</p>}
              {transaction?.grnNumber && <p>GRN Number: {transaction.grnNumber}</p>}
              {transaction?.challanDate && <p>Challan Date: {transaction.challanDate}</p>}
              {transaction?.departmentReferenceNo && (
                <p>Department Ref. No.: {transaction.departmentReferenceNo}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  const formatRemarkDate = (value: string) => {
    if (!value) return "";
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString();
  };

  /**
   * `window.open` called after an `await` has lost the user-gesture context, so
   * browsers block it as a popup and the click silently does nothing. Fall back
   * to a same-tab anchor click, which is never blocked.
   */
  const openBlobInNewTab = (blobUrl: string, filename?: string) => {
    const opened = window.open(blobUrl, "_blank");
    if (opened && !opened.closed) return;

    const link = document.createElement("a");
    link.href = blobUrl;
    link.target = "_blank";
    link.rel = "noopener";
    if (filename) link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const toggleVerifiedField = async (fieldName: string) => {
    setVerifiedFields((prev) => {
      const updated = new Set(prev);
      if (updated.has(fieldName)) {
        updated.delete(fieldName);
      } else {
        updated.add(fieldName);
      }
      return updated;
    });
  };

  console.log("verifiedFelds", verifiedFields)

  const handleDownloadLicense = async () => {
    if (!amendId) return;
    try {
      const response = await axios.get(
        `${API_BASE}certificate/formVI/contractor-license`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            serialEnc: encryptionDecryptionFun("encrypt", String(applicationData?.meta?.serial)),
            renewalAmendIdEnc: applicationData?.meta?.amendId,
            createdByEnc: encryptionDecryptionFun("encrypt", String(createdBy)),
            licenseIdEnc: applicationData?.meta?.licenseId,
            flagEnc: encryptionDecryptionFun("encrypt", "A"),
            contractorNameEnc: applicationData?.meta?.contractorName,
          },
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(response.data);

      // Open in new tab
      openBlobInNewTab(blobUrl);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  }

  const handleOpenPdfDocLegacy = async (documentCode: string) => {
    try {
      const safeSerialNo = encodeURIComponent(encryptionDecryptionFun("encrypt", String(formVNo)) ?? "");
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${safeSerialNo}&documentCode=${documentCode}&source=D`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const { filecontent, filename } = response.data;

      if (!filecontent) {
        alert("File content not available");
        return;
      }

      // 🔥 Convert Base64 → Blob
      const byteCharacters = atob(filecontent);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // 🔥 Create URL
      const blobUrl = window.URL.createObjectURL(blob);

      // 🔥 Open in new tab
      openBlobInNewTab(blobUrl);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  }

  const handleOpenPdfDocFileManaged = async (fid: string) => {
    try {
      if (!fid || fid === "null" || fid === "undefined") {
        alert("This document has no file reference on the application.");
        return;
      }

      const response = await fetch(
        `${API_BASE}documents/file-managed/${fid}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      if (!response.ok) {
        // Surface what the server actually said. "Physical file missing" means
        // the row exists but the upload is not on this server's disk, which is
        // a very different problem from a bad id or an expired session.
        let serverMessage = "";
        try {
          serverMessage = (await response.json())?.message ?? "";
        } catch {
          /* non-JSON error body */
        }
        throw new Error(
          serverMessage || `Unable to fetch document (HTTP ${response.status}).`
        );
      }
      const data = await response.json();
      const { filecontent, filename } = data;

      if (!filecontent) {
        alert("File content not available");
        return;
      }

      // 🔥 Convert Base64 → Blob
      const byteCharacters = atob(filecontent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      // 🔥 Create URL
      const blobUrl = window.URL.createObjectURL(blob);
      // 🔥 Open in new tab
      openBlobInNewTab(blobUrl);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error && error.message
          ? error.message
          : "Unable to fetch document."
      );
    }
  };

  const handleOpenFormIvViiPdf = async () => {
    try {
      const safeAmmendId = encodeURIComponent(encryptionDecryptionFun("encrypt", String(amendId)) ?? "");
      const response = await axios.get(
        // Lives on the `certificate` controller; without the prefix this 404s.
        `${API_BASE}certificate/pdf-form-iv-vii`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            licenserenewalid: renewalAmmendmentIdParam,
            contractorid: createdBy,
          },
        }
      );

      const { filecontent, filename } = response.data;

      if (!filecontent) {
        alert("File content not available");
        return;
      }

      // 🔥 Convert Base64 → Blob
      const byteCharacters = atob(filecontent);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // 🔥 Create URL
      const blobUrl = window.URL.createObjectURL(blob);

      // 🔥 Open in new tab
      openBlobInNewTab(blobUrl);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  }

  const contractorData: ContractorData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Name & address of the establishment
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.establishmentNameAndAddress ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Type of Business, trade, industry, manufacture or occupation which is carried on in the establishment
        </p>,
      inputs:
        "",
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number and date of Certificate
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.principalEmployerRegistration ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "4.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Name & Address of the Principal Employer
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.principalEmployerNameAndAddress ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "5.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Nature of work in which Contract Labour is employed or is to be employed in the establishment
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.natureOfWorkInEstablishment ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "6.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Address of the contractor(provided by principal employer)
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.contractorAddressProvidedByPe ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "7.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Maximum number of Contract Labour proposed to he employed in the establishment on any date
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.maxContractLabourByPe ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "8.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Duration of the proposed contract work(give particulars of proposed date of ending)
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">
          {applicationData?.principalEmployerSection?.proposedDuration ?? ""}
        </p>,
      status:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
  ];

  const contractorNameAddressData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Name of the contractor
        </p>,
      inputs:
        getComparisonRow(0)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(0)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("name_of_contractor")}
          onCheckedChange={() => toggleVerifiedField("name_of_contractor")}
        />,
    },
    // {
    //   id: "2.",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Father s name of the contractor (including his father s name incase of individuals)
    //     </p>,
    //   inputs:
    //     getComparisonRow(1)?.currentValue ?? "",
    //   previousInputs:
    //     getComparisonRow(1)?.previousValue ?? "",
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("father_name_of_contarctor")}
    //       onCheckedChange={() => toggleVerifiedField("father_name_of_contarctor")}
    //     />,
    // },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Address of the contractor
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">{getComparisonRow(2)?.currentValue ?? ""}</p>,
      previousInputs:
        getComparisonRow(2)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_dist")}
          onCheckedChange={() => toggleVerifiedField("contractor_dist")}
        />,
    },
    {
      id: "4.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Category of Contractor <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(3)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(3)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("category_of_contractor")}
          onCheckedChange={() => toggleVerifiedField("category_of_contractor")}
        />,
    },
  ];

  const worksiteData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Work Site Address Details <span className="text-red-500">**</span>
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">{getComparisonRow(4)?.currentValue ?? ""}</p>,
      previousInputs:
        getComparisonRow(4)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("worksite_address")}
          onCheckedChange={() => toggleVerifiedField("worksite_address")}
        />,
      hidePreviousColumn: true,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Maximum number of Contract Labour proposed to he employed in the establishment on any day <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(5)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(5)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_max_no_of_labours_on_any_day")}
          onCheckedChange={() => toggleVerifiedField("contractor_max_no_of_labours_on_any_day")}
        />,
      hidePreviousColumn: true,
    },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Co-oparative Society <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(6)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(6)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("co_oparative")}
          onCheckedChange={() => toggleVerifiedField("co_oparative")}
        />,
      hidePreviousColumn: true,
    },
    // {
    //   id: "4.",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Applicable Ammended Fees <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     "",
    //   previousInputs:
    //     "",
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("fees_details")}
    //       onCheckedChange={() => toggleVerifiedField("fees_details")}
    //     />,
    // },
    // {
    //   id: "5.",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Payble Ammendment Fees <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     "",
    //   previousInputs:
    //     "",
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("fees_details")}
    //       onCheckedChange={() => toggleVerifiedField("fees_details")}
    //     />,
    // },
    // {
    //   id: "5.",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Applicable Security Fees <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     "",
    //   previousInputs:
    //     "",
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("fees_details")}
    //       onCheckedChange={() => toggleVerifiedField("fees_details")}
    //     />,
    // },
    // {
    //   id: "6.",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Payable Ammended Security Fees <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     "",
    //   previousInputs:
    //     "",
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("fees_details")}
    //       onCheckedChange={() => toggleVerifiedField("fees_details")}
    //     />,
    // },
    {
      id: "4.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Applicable Ammended Fees <span className="text-red-500">**</span>
        </p>
      ),
      inputs: currentWorksite?.applicableAmendmentFee ?? 0,
      previousInputs: previousWorksite?.applicableAmendmentFee ?? "",
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("fees_details")}
          onCheckedChange={() => toggleVerifiedField("fees_details")}
        />
      ),
      hidePreviousColumn: true,
    },
    {
      id: "5.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Payble Ammendment Fees <span className="text-red-500">**</span>
        </p>
      ),
      inputs: currentWorksite?.payableAmendmentFees ?? 0,
      previousInputs: previousWorksite?.payableAmendmentFees ?? "",
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("fees_details")}
          onCheckedChange={() => toggleVerifiedField("fees_details")}
        />
      ),
      hidePreviousColumn: true,
    },
    {
      id: "6.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Applicable Security Fees <span className="text-red-500">**</span>
        </p>
      ),
      inputs: currentWorksite?.applicableSecurityFees ?? 0,
      previousInputs: previousWorksite?.applicableSecurityFees ?? "",
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("fees_details")}
          onCheckedChange={() => toggleVerifiedField("fees_details")}
        />
      ),
      hidePreviousColumn: true,
    },
    {
      id: "7.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Payable Ammended Security Fees <span className="text-red-500">**</span>
        </p>
      ),
      inputs: currentWorksite?.payableAmendmentSecurityFees ?? 0,
      previousInputs: previousWorksite?.payableAmendmentSecurityFees ?? "",
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("fees_details")}
          onCheckedChange={() => toggleVerifiedField("fees_details")}
        />
      ),
      hidePreviousColumn: true,
    }
  ];

  const particularOfContractLabourData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Name & address of the agent or Manager of Contractor at the work site <span className="text-red-500">**</span>
        </p>,
      inputs:
        <p className="whitespace-pre-line text-wrap wrap-break-word">{getComparisonRow(7)?.currentValue ?? ""}</p>,
      previousInputs:
        getComparisonRow(7)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("address_of_manager")}
          onCheckedChange={() => toggleVerifiedField("address_of_manager")}
        />,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Category/designation/ nomenclature of the contractor labour, namely, fitter, welder, carpenter, mazdor etc. <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(8)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(8)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("category")}
          onCheckedChange={() => toggleVerifiedField("category")}
        />,
    },
  ];

  const rateOfWagesData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Rate of wages,DA and Other cash benefits paid/ to be paid to Unskilled of contract labour: </p>,
      inputs:
        getComparisonRow(9)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(9)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("unskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("unskilled_rate_wages")}
        />,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Rate of wages,DA and Other cash benefits paid/ to be paid to Semi-skilled of contract labour: </p>,
      inputs:
        getComparisonRow(10)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(10)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("semiskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("semiskilled_rate_wages")}
        />,
    },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Rate of Wages,DA and Other cash benefits paid/ to be paid to Skilled of contract labour: </p>,
      inputs:
        getComparisonRow(11)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(11)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("skilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("skilled_rate_wages")}
        />,
    },
    {
      id: "4.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Rate of Wages,DA and Other cash benefits paid/ to be paid to Highly-skilled of contract labour:	</p>,
      inputs:
        getComparisonRow(12)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(12)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("highlyskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("highlyskilled_rate_wages")}
        />,
    },
  ];

  const hoursOfWorkOvertimeData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Hours of Work </p>,
      inputs:
        getComparisonRow(13)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(13)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("hour_details")}
          onCheckedChange={() => toggleVerifiedField("hour_details")}
        />,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Spred over time </p>,
      inputs:
        getComparisonRow(14)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(14)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("spred_over")}
          onCheckedChange={() => toggleVerifiedField("spred_over")}
        />,
    },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Overtime </p>,
      inputs:
        getComparisonRow(15)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(15)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("overtime")}
          onCheckedChange={() => toggleVerifiedField("overtime")}
        />,
    },
    {
      id: "4.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Overtime Wages </p>,
      inputs:
        getComparisonRow(16)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(16)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("overtime_wages")}
          onCheckedChange={() => toggleVerifiedField("overtime_wages")}
        />,
    },
  ];

  const otherConditionOfServiceData: AppData[] = [
    {
      id: "1.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of annual leave
        </p>,
      inputs:
        getComparisonRow(17)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(17)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("annual_leave")}
          onCheckedChange={() => toggleVerifiedField("annual_leave")}
        />,
    },
    {
      id: "1.(a)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of casual leave
        </p>,
      inputs:
        getComparisonRow(18)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(18)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("casual_leave")}
          onCheckedChange={() => toggleVerifiedField("casual_leave")}
        />,
    },
    {
      id: "1.(b)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of sick leave
        </p>,
      inputs:
        getComparisonRow(19)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(19)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("sick_leave")}
          onCheckedChange={() => toggleVerifiedField("sick_leave")}
        />,
    },
    {
      id: "2.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of earned leave
        </p>,
      inputs:
        getComparisonRow(20)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(20)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("eraned_leave")}
          onCheckedChange={() => toggleVerifiedField("eraned_leave")}
        />,
    },
    {
      id: "3.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of maternity leave
        </p>,
      inputs:
        getComparisonRow(21)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(21)?.previousValue ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("maternity_leave")}
          onCheckedChange={() => toggleVerifiedField("maternity_leave")}
        />,
    },
    {
      id: "4.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of other leave
        </p>,
      inputs:
        getComparisonRow(22)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(22)?.previousValue ?? "",
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_leave")}
          onCheckedChange={() => toggleVerifiedField("other_leave")}
        />,
    },
    {
      id: "5.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Holiday(s) and Holiday wages
        </p>,
      inputs:
        getComparisonRow(23)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(23)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("weekly_holiday")}
          onCheckedChange={() => toggleVerifiedField("weekly_holiday")}
        />,
    },
    {
      id: "6.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Special benifites provied, if any
        </p>,
      inputs:
        getComparisonRow(24)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(24)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("special_benifites")}
          onCheckedChange={() => toggleVerifiedField("special_benifites")}
        />,
    },
    {
      id: "7.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Contribution made under the Employees State Insurance Act,1984:
        </p>,
      inputs:
        getComparisonRow(25)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(25)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("state_insurance")}
          onCheckedChange={() => toggleVerifiedField("state_insurance")}
        />,
    },
    {
      id: "8.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952 :
        </p>,
      inputs:
        getComparisonRow(26)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(26)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("miscellaneous")}
          onCheckedChange={() => toggleVerifiedField("miscellaneous")}
        />,
    },
    {
      id: "9.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Whether the contractor was convicted of any offence within the preceding five years. If so, give details <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(27)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(27)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("offence")}
          onCheckedChange={() => toggleVerifiedField("offence")}
        />,
    },
    {
      id: "9.(a)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Whether there was any order against the contract or revoking or suspending license or forfeiting security deposit in respect of an earlier contract. If so, the date of such order. <span className="text-red-500">**</span>
        </p>,
      inputs:
        getComparisonRow(28)?.currentValue ?? "",
      previousInputs:
        getComparisonRow(28)?.previousValue ?? "",
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("revoking")}
          onCheckedChange={() => toggleVerifiedField("revoking")}
        />,
    },
    // {
    //   id: "9.(a)",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Whether the contractor has worked in any other establishment within the past five years. If so. give details of the principal employer, establishment and nature of work <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     <button className="text-amber-500" onClick={() => { navigate(`/amendment_license_renewal/view_pe_details/${amendId}/${createdBy}`) }}>
    //       View Details
    //     </button>,
    //   previousInputs:
    //     <button className="text-amber-500" onClick={() => { navigate(`/amendment_license_renewal/view_pe_details/${amendId}/${createdBy}`) }}>
    //       View Details
    //     </button>,
    //   // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("pervious_license")}
    //       onCheckedChange={() => toggleVerifiedField("pervious_license")}
    //     />,
    // },
    // {
    //   id: "9.(a)",
    //   parameters:
    //     <p className="text-wrap wrap-break-word">
    //       Whether a certificate by the principal employer in Form V is Enclosed <span className="text-red-500">**</span>
    //     </p>,
    //   inputs:
    //     <div className="flex gap-4">
    //     </div>,
    //   previousInputs:
    //     <div className="flex gap-4">
    //     </div>,
    //   // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
    //   verified:
    //     <Checkbox
    //       className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
    //                   data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
    //       checked={verifiedFields.has("pervious_license")}
    //       onCheckedChange={() => toggleVerifiedField("pervious_license")}
    //     />,
    // },
  ];

  // const docData: AppData[] = [
  //   {
  //     id: "1.",
  //     parameters:
  //       <p className="text-wrap wrap-break-word">
  //         Work Order <span className="text-red-500">**</span>
  //       </p>,
  //     inputs:
  //       getDocumentStatus(safeCurrentDocuments?.workOrder) === "Available" ?
  //         <div className="flex gap-1">
  //           <button onClick={() => handleOpenPdfDocFileManaged(String(safeCurrentDocuments?.workOrder?.fid))}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
  //           <FaMagnifyingGlass className="text-2xl text-black" />
  //         </div>
  //         // : <p>No Document Uploaded</p>,
  //         : <p></p>,
  //     previousInputs: renderPreviousDocumentInput(safePreviousDocuments?.workOrder, "WO"),
  //     // previousInputs: null,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("work_order_file_id")}
  //         onCheckedChange={() => toggleVerifiedField("work_order_file_id")}
  //       />,
  //   },

  //   {
  //     id: "6.",
  //     parameters:
  //       <p className="text-wrap wrap-break-word">
  //         Other Document
  //       </p>,
  //     inputs:
  //       getDocumentStatus(safeCurrentDocuments?.otherDocument) === "Available" ?
  //         <div className="flex gap-1">
  //           <button onClick={() => handleOpenPdfDocFileManaged(String(safeCurrentDocuments?.otherDocument?.fid))}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
  //           <FaMagnifyingGlass className="text-2xl text-black" />
  //         </div>
  //         // : <p>No Document Uploaded</p>,
  //         : <p></p>,
  //     previousInputs: renderPreviousDocumentInput(safePreviousDocuments?.otherDocument, "ODSC"),
  //     // previousInputs: null,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("other_doc_id")}
  //         onCheckedChange={() => toggleVerifiedField("other_doc_id")}
  //       />,
  //   },

  //   {
  //     id: "8.",
  //     parameters:
  //       <p className="text-wrap wrap-break-word">
  //         Amendment Certificate
  //       </p>,
  //     inputs: getDocumentStatus(safeCurrentDocuments?.amendmentCertificate),
  //     previousInputs: renderPreviousDocumentInput(safePreviousDocuments?.amendmentCertificate, "ACSC"),
  //     // previousInputs: null,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("amend_cert_file")}
  //         onCheckedChange={() => toggleVerifiedField("amend_cert_file")}
  //       />,
  //   },
  // ];

  const currentDocs = currentApplication?.documents ?? {};

  const docData: AppData[] = [
    {
      id: "1.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Work Order <span className="text-red-500">**</span>
        </p>
      ),
      inputs:
        getDocumentStatus(currentDocs?.workOrder) === "Available" ? (
          <div className="flex gap-1">
            <button
              onClick={() =>
                handleOpenPdfDocFileManaged(
                  String(currentDocs?.workOrder)
                )
              }
            >
              <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            </button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : (
          <p></p>
        ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
        data-[state=checked]:border-sky-500 data-[state=checked]:text-white flex"
          checked={verifiedFields.has("work_order_file_id")}
          onCheckedChange={() =>
            toggleVerifiedField("work_order_file_id")
          }
        />
      ),
      hidePreviousColumn: true,
    },

    {
      id: "2.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Other Document
        </p>
      ),
      inputs:
        getDocumentStatus(currentDocs?.other) === "Available" ? (
          <div className="flex gap-1">
            <button
              onClick={() =>
                handleOpenPdfDocFileManaged(
                  String(currentDocs?.other)
                )
              }
            >
              <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            </button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : (
          <p></p>
        ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
        data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_id")}
          onCheckedChange={() =>
            toggleVerifiedField("other_doc_id")
          }
        />
      ),
      hidePreviousColumn: true,
    },

    {
      id: "3.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Uploaded Form IV <span className="text-red-500">**</span>
        </p>
      ),
      inputs:
        getDocumentStatus(currentDocs?.uploadedSignedForm) === "Available" ? (
          <div className="flex gap-1">
            <button
              onClick={() =>
                handleOpenPdfDocFileManaged(
                  String(currentDocs?.uploadedSignedForm)
                )
              }
            >
              <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            </button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : (
          <p></p>
        ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
        data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("prev_formiv_file")}
          onCheckedChange={() =>
            toggleVerifiedField("prev_formiv_file")
          }
        />
      ),
      hidePreviousColumn: true,
    },

    {
      id: "4.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Amendment Certificate
        </p>
      ),
      inputs: (
        <p>
          {getDocumentStatus(
            safeCurrentDocuments?.amendmentCertificate
          )}
        </p>
      ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
        data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("amend_cert_file")}
          onCheckedChange={() =>
            toggleVerifiedField("amend_cert_file")
          }
        />
      ),
      hidePreviousColumn: true,
    },
  ];

  const paymentData = [
    {
      id: "9.",
      parameters: (
        <p>
          Payment Details <span className="text-red-600">**</span>
        </p>
      ),
      inputs: renderPaymentDetails(safeCurrentPayment),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
        data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("payment_details")}
          onCheckedChange={() => toggleVerifiedField("payment_details")}
        />
      ),
      hidePreviousColumn: true,
    },
  ];

  const renderStatusImage = (
    status: string
  ): ReactElement | null => {
    const src = status ? statusImageMap[status] : null;
    if (!src) {
      return <span className="text-gray-500">{status}</span>;
    }
    return (
      <img
        src={src}
        alt={status}
        className="object-contain w-auto h-auto max-w-none max-h-none"
      />
    );
  };

  // --------------------- Auto Fill Rules ---------------------
  const remarkRules: Record<string, string> = {
    "B": "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
    "A": "Application is verified, applicant is allowed to pay the fees.",
    "AW": "Application is approved.",
    "R": "Application is rejected due to discrepancies.",
    "BI": "Application is sent back to Inspector.",
    "P": "Application is sent back for rectification of Application Form. Kindly sign the form properly and re-upload the signed form.",
    "I": "Congratulations! Certificate is issued.",
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    if (value !== "I") {
      setFile(null);
      setFileInputKey((prev) => prev + 1);
    }

    if (remarkData.length > 1 && remarkData[0]?.remarkType === "U" && value === "AW") {
      setRemark("Application is sent back for rectification of Application Form. Kindly sign the form properly and re-upload the signed form.");
    }
    else if (remarkRules[value]) {
      setRemark(remarkRules[value]);
    } else {
      setRemark("");
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files?.length) {
  //     setFile(null);
  //     return;
  //   }

  //   const selectedFile = e.target.files[0];

  //   if (selectedFile.type !== "application/pdf") {
  //     alert("Only PDF files are allowed.");
  //     e.target.value = "";
  //     setFile(null);
  //     return;
  //   }

  //   setFile(selectedFile);
  // };

  const convertFileToBase64 = (selectedFile: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64File = base64String.split(",")[1];

        if (!base64File) {
          reject(new Error("File content could not be processed."));
          return;
        }

        resolve(base64File);
      };

      reader.onerror = () => reject(new Error("File reading failed."));
    });

  // const applicationStatusDetailMsgMap = {
  //   "B" : "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
  //   "BI" : "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
  //   "C" : "Applicant is CALLED BY ALC",
  //   "I" : "Certificate is issued. For any changes in the FORM-II(Certificate), Applicant can opt for Amendment of Registration Certificate. If you want to get back to the previous remark and re-upload FORM-II(Certificate), delete the current remark by clicking the delete option.",
  //   "F" : "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
  //   "T" : "Payment successful for this application. Form-I is not uploaded by the applicant. After submission of signed FORM-I by the applicant, the application can be further accessible .",
  //   "V" : "Application is approved and directed to pay fees. After fees payment and submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
  //   "R" : "If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
  //   "VA" : "Application is approved without fees. After submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
  //   "S" : "FORM-I is submitted by the Applicant. After verification of uploaded FORM-I, Issue of Registration Certificate can be generated now or back to rectification FORM-I.",
  //   "U" : "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
  //   "O" : "Application is applied by the Applicant. Any action can be taken for the application.",
  //   "" : "",
  // };

  useEffect(() => {
    if (!applicationData) return;

    const initialVerified = new Set<string>();

    // -------- Establishment --------
    initialVerified.add("e_name");
    // -------- Application Details --------
    if (getComparisonRow(0)?.isVerified)
      initialVerified.add("name_of_contractor");
    if (getComparisonRow(1)?.isVerified)
      initialVerified.add("father_name_of_contarctor");
    if (getComparisonRow(2)?.isVerified)
      initialVerified.add("contractor_dist");
    if (getComparisonRow(3)?.isVerified)
      initialVerified.add("category_of_contractor");
    if (getComparisonRow(4)?.isVerified)
      initialVerified.add("worksite_address");
    if (getComparisonRow(5)?.isVerified)
      initialVerified.add("contractor_max_no_of_labours_on_any_day");
    if (getComparisonRow(6)?.isVerified)
      initialVerified.add("co_oparative");
    if (getComparisonRow(7)?.isVerified)
      initialVerified.add("address_of_manager");
    if (getComparisonRow(8)?.isVerified)
      initialVerified.add("category");
    if (getComparisonRow(9)?.isVerified)
      initialVerified.add("unskilled_rate_wages");
    if (getComparisonRow(10)?.isVerified)
      initialVerified.add("semiskilled_rate_wages");
    if (getComparisonRow(11)?.isVerified)
      initialVerified.add("skilled_rate_wages");
    if (getComparisonRow(12)?.isVerified)
      initialVerified.add("highlyskilled_rate_wages");
    if (getComparisonRow(13)?.isVerified)
      initialVerified.add("hour_details");
    if (getComparisonRow(14)?.isVerified)
      initialVerified.add("spred_over");
    if (getComparisonRow(15)?.isVerified)
      initialVerified.add("overtime");
    if (getComparisonRow(16)?.isVerified)
      initialVerified.add("overtime_wages");
    if (getComparisonRow(17)?.isVerified)
      initialVerified.add("annual_leave");
    if (getComparisonRow(18)?.isVerified)
      initialVerified.add("casual_leave");
    if (getComparisonRow(19)?.isVerified)
      initialVerified.add("sick_leave");
    if (getComparisonRow(20)?.isVerified)
      initialVerified.add("eraned_leave");
    if (getComparisonRow(21)?.isVerified)
      initialVerified.add("maternity_leave");
    if (getComparisonRow(22)?.isVerified)
      initialVerified.add("other_leave");
    if (getComparisonRow(23)?.isVerified)
      initialVerified.add("weekly_holiday");
    if (getComparisonRow(24)?.isVerified)
      initialVerified.add("special_benifites");
    if (getComparisonRow(25)?.isVerified)
      initialVerified.add("state_insurance");
    if (getComparisonRow(26)?.isVerified)
      initialVerified.add("miscellaneous");
    if (getComparisonRow(27)?.isVerified)
      initialVerified.add("offence");
    if (getComparisonRow(28)?.isVerified)
      initialVerified.add("revoking");

    // -------- Documents --------
    const docs = applicationData?.documentsSummary ?? {};

    if (docs?.workOrder?.isVerified)
      initialVerified.add("work_order_file_id");

    if (docs?.formV?.isVerified)
      initialVerified.add("frm_v_file_id");

    if (docs?.residentialCertificate?.isVerified)
      initialVerified.add("residential_file_id");

    if (docs?.previousFormIvViiOrAmendmentForm?.isVerified)
      initialVerified.add("prev_formiv_file");

    if (docs?.otherDocument?.isVerified)
      initialVerified.add("other_doc_id");

    if (docs?.signedAmendmentApplication?.isVerified)
      initialVerified.add("upload_singed_from");

    if (docs?.previousCertificate?.isVerified)
      initialVerified.add("prev_cert_file");

    setVerifiedFields(initialVerified);
  }, [applicationData]);



  const handleFirstSubmitButton = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    if (remarkData.length > 0 && remarkData[0]?.remarkType === "U" && action === "AW") {
      handleSubmit(e);
    } else if (action === "A" || action === "AW" || action === "I") {
      setShowSubmitModal(true);   // If Verify selected
    } else {
      handleSubmit(e);    // For other actions
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    const initialVerified = new Set<string>();

    if (action === "A" || action === "AW" || action === "I") {
      [
        'e_name',
        'name_of_contractor',
        'father_name_of_contarctor',
        'contractor_dist',
        'category_of_contractor',
        'worksite_address',
        'contractor_max_no_of_labours_on_any_day',
        'co_oparative',
        'address_of_manager',
        'category',
        'unskilled_rate_wages',
        'semiskilled_rate_wages',
        'skilled_rate_wages',
        'highlyskilled_rate_wages',
        'hour_details',
        'spred_over',
        'overtime',
        'overtime_wages',
        'annual_leave',
        'casual_leave',
        'sick_leave',
        'eraned_leave',
        'maternity_leave',
        'other_leave',
        'weekly_holiday',
        'special_benifites',
        'state_insurance',
        'miscellaneous',
        'offence',
        'revoking',
        'pervious_license',
        'payment_details',
      ].forEach((f) => initialVerified.add(f));

      // -------- Documents --------
      const docs = applicationData?.documentsSummary ?? {};

      if (docs?.workOrder?.available) initialVerified.add("work_order_file_id");
      if (docs?.formV?.available) initialVerified.add("frm_v_file_id");
      if (docs?.residentialCertificate?.available) initialVerified.add("residential_file_id");
      if (docs?.previousFormIvViiOrAmendmentForm?.available) initialVerified.add("prev_formiv_file");
      if (docs?.otherDocument?.available) initialVerified.add("other_doc_id");
      if (docs?.signedAmendmentApplication?.available && action === "I") initialVerified.add("upload_singed_from");
      if (docs?.previousCertificate?.available) initialVerified.add("prev_cert_file");
    }

    setVerifiedFields(initialVerified);

    const amendmentCheckFieldSource =
      action === "A" || action === "AW" || action === "I"
        ? initialVerified
        : verifiedFields;

    // if (action === "I" && !file) {
    //   alert("Please upload Signed Certificate file before submitting.");
    //   return;
    // }
    const enRemarkParticularId: string = encryptionDecryptionFun("encrypt", String(applicationData?.licenseInfo?.referenceNo)) ?? "";
    const enLicenseId: string = encryptionDecryptionFun("encrypt", String(applicationData?.licenseInfo?.fastIssuedLicense?.id)) ?? "";

    const payload = {
      ammend_id: amendIdEnc, // from URL/search param or state
      contrcator_name:
        applicationData?.applicationDetails?.current?.contractorDetails?.Name ?? "",
      action_type: action,
      remarks_text: remark,
      serial: formVEnc,

      editable_fields_ammend:
        amendmentCheckFieldSource.size > 0
          ? Array.from(amendmentCheckFieldSource).join(",")
          : "",

      particular_id: enRemarkParticularId,

      license_id: enLicenseId,

      applicant_user_id: createdByEnc,

      not_amendment_check_field: "",

      amendment_check_field:
        amendmentCheckFieldSource.size > 0
          ? Array.from(amendmentCheckFieldSource).join(",")
          : "",

      certificates: "",
    };

    try {
      setIsSubmitting(true);
      const headers = {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      };

      const submitApi = axios.post(
        `${API_BASE}contractor-license/alc/amendment/action-taken`,
        payload,
        { headers }
      );

      let res;

      res = await submitApi;  // Testing without File Upload
      setAfterSubmitRes(res.data);
      if (!res.data?.success) {
        const message = res?.data?.message;
        alert(`Failed to submit remark: ${message}`);
        return;
      }

      // Refresh remark list after submit
      setRemark("");
      setAction("");
      setFile(null);
      setFileInputKey((prev) => prev + 1);
      setVerifiedFields(new Set());

      await fetchData();

      alert("Action submitted successfully");
    } catch (error) {
      console.error("Submit failed", error);
      alert("Failed to submit remark");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRemark = async () => {
    if (isDeletingRemark || remarkIdToDelete == null) return;

    setIsDeletingRemark(true);

    try {
      await axios.delete(
        `${API_BASE}contractor-license/alc/amendment/remarks/${remarkIdToDelete}/${amendId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRemarkIdToDelete(null);
      toast.success("Remark deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("Remark delete failed", error);

      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      const messageText = Array.isArray(apiMessage)
        ? apiMessage.join(" ")
        : typeof apiMessage === "string"
          ? apiMessage
          : "";

      if (status === 403 && messageText.includes("latest remark")) {
        toast.warning(
          "The latest remark may have changed. Please refresh — only the current latest remark can be deleted.",
        );
        await fetchData();
      } else if (messageText) {
        toast.error(messageText);
        if (status === 403) {
          await fetchData();
        }
      } else {
        toast.error("Failed to delete remark");
      }
    } finally {
      setIsDeletingRemark(false);
      setRemarkIdToDelete(null);
    }
  };

  const mapAlcViewDetailsResponse = (data: any) => {
    const current = data?.applicationDetails?.current ?? {};
    const previous = data?.applicationDetails?.previous ?? {};

    const comparisonRows = [
      {
        currentValue: current?.contractorDetails?.Name ?? "",
        previousValue: previous?.contractorDetails?.Name ?? "",
      },
      {
        currentValue: "", // father name not available in new API
        previousValue: "",
      },
      {
        currentValue: current?.contractorDetails?.address ?? "",
        previousValue: previous?.contractorDetails?.address ?? "",
      },
      {
        currentValue: String(current?.contractorDetails?.categoryOfContractor === 0 ? "Individual" : current?.contractorDetails?.categoryOfContractor === 1 ? "Company" : ""),
        // The "Company" branch used to read `current` here, so the previous column echoed the
        // current category instead of the one being amended away from.
        previousValue: String(previous?.contractorDetails?.categoryOfContractor === 0 ? "Individual" : previous?.contractorDetails?.categoryOfContractor === 1 ? "Company" : ""),
      },
      {
        currentValue: current?.worksiteDetails?.fullAddress ?? "",
        previousValue: previous?.worksiteDetails?.fullAddress ?? "",
      },
      {
        currentValue: String(current?.worksiteDetails?.maxContractLabour ?? ""),
        previousValue: String(previous?.worksiteDetails?.maxContractLabour ?? ""),
      },
      {
        currentValue:
          current?.worksiteDetails?.co_oparative === 1 ? "Yes" : "No",
        previousValue:
          previous?.worksiteDetails?.co_oparative === 1 ? "Yes" : "No",
      },
      {
        currentValue:
          `${current?.particulars?.name_of_agent ?? ""} & ${current?.particulars?.address_of_manager ?? ""}`,
        previousValue:
          `${previous?.particulars?.name_of_agent ?? ""} & ${previous?.particulars?.address_of_manager ?? ""}`,
      },
      {
        currentValue: current?.particulars?.category_designation ?? "",
        previousValue: previous?.particulars?.category_designation ?? "",
      },

      // wages
      {
        currentValue: current?.wagesDetails?.unskilledWages ?? "",
        previousValue: previous?.wagesDetails?.unskilledWages ?? "",
      },
      {
        currentValue: current?.wagesDetails?.semiSkilledWages ?? "",
        previousValue: previous?.wagesDetails?.semiSkilledWages ?? "",
      },
      {
        currentValue: current?.wagesDetails?.skilledWages ?? "",
        previousValue: previous?.wagesDetails?.skilledWages ?? "",
      },
      {
        currentValue: current?.wagesDetails?.highlySkilledWages ?? "",
        previousValue: previous?.wagesDetails?.highlySkilledWages ?? "",
      },
      {
        currentValue: current?.wagesDetails?.hoursOfWork ?? "",
        previousValue: previous?.wagesDetails?.hoursOfWork ?? "",
      },
      {
        currentValue: current?.wagesDetails?.spredOver ?? "",
        previousValue: previous?.wagesDetails?.spredOver ?? "",
      },
      {
        currentValue: current?.wagesDetails?.overtime ?? "",
        previousValue: previous?.wagesDetails?.overtime ?? "",
      },
      {
        currentValue: current?.wagesDetails?.overtimeWages ?? "",
        previousValue: previous?.wagesDetails?.overtimeWages ?? "",
      },

      // leaves
      {
        currentValue: current?.leaveDetails?.annualLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.annualLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.casualLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.casualLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.sickLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.sickLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.earnedLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.earnedLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.maternityLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.maternityLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.otherLeaveNo ?? "",
        previousValue: previous?.leaveDetails?.otherLeaveNo ?? "",
      },
      {
        currentValue: current?.leaveDetails?.weeklyHoliday ?? "",
        previousValue: previous?.leaveDetails?.weeklyHoliday ?? "",
      },

      // others
      {
        currentValue: current?.otherDetails?.specialBenifits ?? "",
        previousValue: previous?.otherDetails?.specialBenifits ?? "",
      },
      {
        currentValue: current?.otherDetails?.stateInsurance ?? "",
        previousValue: previous?.otherDetails?.stateInsurance ?? "",
      },
      {
        currentValue: current?.otherDetails?.miscellaneousProvisions ?? "",
        previousValue: previous?.otherDetails?.miscellaneousProvisions ?? "",
      },
      {
        currentValue: current?.otherDetails?.contractorConvicted ?? "",
        previousValue: previous?.otherDetails?.contractorConvicted ?? "",
      },
      {
        currentValue: current?.otherDetails?.contractorRevoking ?? "",
        previousValue: previous?.otherDetails?.contractorRevoking ?? "",
      },
    ];

    // Remarks mapping
    const mappedRemarks: RemarkData[] = (data?.remarksList ?? []).map(
      (item: ApiRemark, index: number) => ({
        id: String(item.id ?? index + 1),
        remarkDate: formatRemarkDate(item.remarkDate),
        remarkText: item.remarkText ?? "",
        remarkType: item.remarkType ?? "",
        statusLabel: renderStatusImage(item.statusLabel),
        formv_serialno: data?.licenseInfo?.formVNumber
          ? `00${data.licenseInfo.formVNumber}`
          : "",
        remarkByName: item.remarkByName ?? "",
        remarkByRoleId: String(item.remarkByRoleId ?? ""),
        act: <></>,
        canDelete: !!item.canDelete,
      })
    );

    const currentWorksite =
      applicationData?.applicationDetails?.current?.worksiteDetails ?? {};

    return {
      principalEmployerSection: {
        establishmentNameAndAddress:
          `${data?.peInfo?.estName ?? ""} & ${data?.peInfo?.estAddress ?? ""}`,
        principalEmployerRegistration:
          `${data?.peInfo?.peRegNo ?? ""} (${data?.peInfo?.peRegDate ?? ""})`,
        principalEmployerNameAndAddress:
          `${data?.peInfo?.peName ?? ""} & ${data?.peInfo?.peAddress ?? ""}`,
        contractorAddressProvidedByPe:
          data?.peInfo?.contractorAddressProvidedByPe ?? "",
        maxContractLabourByPe:
          data?.peInfo?.maxContractLabour ?? "",
        proposedDuration:
          data?.peInfo?.proposedDuration ?? "",
        natureOfWorkInEstablishment: data?.peInfo?.estType ?? "",
      },

      ...data,
      applicationComparison: {
        rows: comparisonRows,
        previousSource: "amendment",
      },

      uploadedDocuments: {
        current: {
          workOrder: current?.documents?.workOrder
            ? { available: true, fid: current.documents.workOrder }
            : null,
          otherDocument: current?.documents?.other
            ? { available: true, fid: current.documents.other }
            : null,
        },
        previous: {
          workOrder: previous?.documents?.workOrder
            ? { available: true, fid: previous.documents.workOrder }
            : null,
          otherDocument: previous?.documents?.other
            ? { available: true, fid: previous.documents.other }
            : null,
        },
      },

      paymentDetails: {
        current: current?.paymentDetails ?? {},
        previous: previous?.paymentDetails ?? {},
      },

      licenseInformation: data?.licenseInfo,
      fastIssuedLicense: data?.fastIssuedLicense,
      availableActions: data?.availableActions ?? [],

      remarks: mappedRemarks,
    };
  };

  // ========================
  // Fetch details page data
  // ========================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}contractor-license/alc/amend/view-details`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            amendId: amendId,
            formVNo: formVNo,
            updatedFormVNo: updatedFormVNo,
            createdBy: createdBy,
          },
        }
      );

      const mapped = mapAlcViewDetailsResponse(res.data);

      setApplicationData(mapped);

      const status = res.data?.licenseInfo?.amendStatus ?? "";

      const statusMeta = getStatusMeta(status);

      setApplicationStatus(status);
      setApplicationStatusType(statusMeta.type);
      setApplicationStatusMsg(statusMeta.label);

      setRemarkData(mapped.remarks || []);

      const actions = res.data?.availableActions ?? [];
      setRemarkOptions(
        actions.reduce((acc: any, item: any) => {
          acc[item.value] = item.label;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div className="min-h-[250px] mb-15">

      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">Application for Amendment of License under the Contract Labour (R&A) Act, 1970</h1>

      {showLoadingOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-2 bg-white rounded-lg shadow-lg p-6">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E73BE] border-t-transparent" />
            <p className="text-xs font-semibold mt-1 text-gray-600">Loading application details...</p>
          </div>
        </div>
      )}

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> License Information
          </CardHeader>

          <div>
            <Table className="border border-gray-400 rounded-md text-black">
              <TableBody>
                <TableRow>
                  <TableCell className="w-1/4 border-r font-semibold">Form-V Number</TableCell>
                  <TableCell className="w-1/4 border-r">
                    {formV ? `00${formV}` : ""}
                  </TableCell>
                  <TableCell className="w-1/4 border-r font-semibold">License Number</TableCell>
                  <TableCell className="w-1/4">{applicationData?.licenseInformation?.licenseNumber ?? ""}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="border-r font-semibold">Issue Date</TableCell>
                  <TableCell className="border-r">{applicationData?.licenseInformation?.issueDate ?? ""}</TableCell>
                  <TableCell className="border-r font-semibold">Valid Upto</TableCell>
                  <TableCell>{applicationData?.licenseInformation?.validUpto ?? ""}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-3 text-white mt-4">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> Contractor Information From Principal Employer
          </CardHeader>

          <div>
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="border-r font-semibold">Sl. No.</TableHead> */}
                  <TableHead className="border-r font-semibold">Parameters</TableHead>
                  <TableHead className="border-r font-semibold">Inputs</TableHead>
                  <TableHead className="w-30 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {contractorData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-3 text-white mt-4">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> Application Details
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="border-r font-semibold">Sl. No.</TableHead> */}
                  <TableHead className="border-r font-semibold">Parameters</TableHead>
                  <TableHead className="border-r font-semibold">Current Application</TableHead>
                  <TableHead className="font-semibold">License Application</TableHead>
                  <TableHead className="w-30"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Name & address of the contractor (Official Information)</span>
                    </div>
                  </TableHead>
                </TableRow>

                {contractorNameAddressData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell className="border-r">{item.previousInputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Worksite Address/ Number of Worker & Fees Details</span>
                    </div>
                  </TableHead>
                </TableRow>

                {worksiteData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    {item.hidePreviousColumn === true ? (
                      <>
                        <TableCell className="border-r">{item.inputs}</TableCell>
                        <TableCell className="border-r">{item.previousInputs}</TableCell>
                        <TableCell>{item.verified}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell colSpan={2}>{item.inputs}</TableCell>
                        <TableCell>{item.verified}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Particular of Contract Labour</span>
                    </div>
                  </TableHead>
                </TableRow>

                {particularOfContractLabourData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell className="border-r">{item.previousInputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Rate of Wages, DA and other cash benefits paid/ to be paid to each category(i.e (a):Unskilled (b)Semi-Skilled (c)Skilled (d)Highly-Skilled etc.)of contract labour</span>
                    </div>
                  </TableHead>
                </TableRow>

                {rateOfWagesData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell className="border-r">{item.previousInputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Hours of Work, Overtime and Overtime Wages</span>
                    </div>
                  </TableHead>
                </TableRow>

                {hoursOfWorkOvertimeData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell className="border-r">{item.previousInputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>Other Condition of service like leave (annual leave,casual leave,sick leave,maternity leave etc.)Holidays etc.of the contract labour</span>
                    </div>
                  </TableHead>
                </TableRow>

                {otherConditionOfServiceData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell className="border-r">{item.previousInputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Document Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4}>
                    <div className="flex gap-1 items-center py-3 font-semibold">
                      <GrNotes /> <span>UPLOADED DOCUMENTS</span>
                    </div>
                  </TableHead>
                </TableRow>

                {docData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    {item.hidePreviousColumn ? (
                      <>
                        <TableCell colSpan={2}>{item.inputs}</TableCell>
                        <TableCell>{item.verified}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.inputs}</TableCell>
                        <TableCell>{item.previousInputs}</TableCell>
                        <TableCell>{item.verified}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                {paymentData.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell className="border-r">{item.id}</TableCell> */}
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    {item.hidePreviousColumn ? (
                      <>
                        <TableCell colSpan={2}>{item.inputs}</TableCell>
                        <TableCell>{item.verified}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.inputs}</TableCell>
                        {/* <TableCell>{item.previousInputs}</TableCell> */}
                        <TableCell>{item.verified}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </div>
        </Card>

        {/* --------------------- CONTRACTORS SECTION --------------------- */}

        <div className="flex flex-wrap mt-5">
          <div className="w-full sm:w-1/2 lg:w-1/4 p-2">
            <Button className="w-full bg-sky-600 text-white">
              <TiArrowLeft /> Back to list
            </Button>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/4 p-2">
            <Button className="w-full bg-sky-600 text-white"
              disabled
              onClick={() => { navigate("/view-applicant-profile") }}
            >
              <FaUser /> View applicant profile (Coming Soon)
            </Button>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/4 p-2">
            <Button className="w-full bg-sky-600 text-white">
              <FaInfo /> Instructions to give remarks
            </Button>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/4 p-2">
            <Button className="w-full bg-sky-600 text-white" onClick={() => { navigate("/digitally-sign-process") }}>
              <MdQuestionMark /> How to digitally sign using USB token
            </Button>
          </div>
        </div>
      </div>

      {/* --------------------- CURRENT STATUS --------------------- */}
      <div className="mt-5">
        {applicationData?.statusBanner?.type === "warning" || applicationData?.statusBanner?.type === "info" ?
          <Card className="bg-amber-500 p-5">
            <p className="flex items-start gap-2 text-white">
              <IoMdWarning className="text-2xl" />
              <span>
                <strong>{applicationData?.statusBanner?.title ?? ""}</strong>
                <br />
                {applicationData?.statusBanner?.message ?? ""}
              </span>
            </p>
          </Card> :
          applicationData?.statusBanner?.type === "success" &&
          <Card className="bg-green-700 p-5">
            <p className="flex items-start gap-2 text-white">
              <MdDone className="text-2xl" />
              <span>
                <strong>{applicationData?.statusBanner?.title ?? ""}</strong>
                <br />
                {applicationData?.statusBanner?.message ?? ""}
              </span>
            </p>
          </Card>}
      </div>

      {/* ---------------- Render Current Status card --------------- */}
      <div className="mt-5">
        {(applicationStatusType === "warning" ||
          applicationStatusType === "info") ? (
          <Card className="bg-amber-500 p-5">
            <p className="flex items-start gap-2 text-white">
              <IoMdWarning className="text-2xl shrink-0 mt-1" />
              <span>
                <strong>Current status: {applicationStatusMsg}</strong>
                <br />
                {applicationStatusDetailMsgMap[
                  applicationStatus ?? ""
                ] ?? ""}
              </span>
            </p>
          </Card>
        ) : (
          applicationStatusType === "success" && (
            <Card className="bg-green-700 p-5">
              <p className="flex items-start gap-2 text-white">
                <MdDone className="text-2xl shrink-0 mt-1" />
                <span>
                  <strong>Current status: {applicationStatusMsg}</strong>
                  <br />
                  {applicationStatusDetailMsgMap[
                    applicationStatus ?? ""
                  ] ?? ""}
                </span>
              </p>
            </Card>
          )
        )}
      </div>

      {/* --------------------- ACTION & REMARK --------------------- */}
      {`${remarkData[0]?.remarkByRoleId}` !== `4` &&
        <div className="mt-5">
          <Card className="p-3 text-black">
            <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
              <GrNotes /> <span>ACTIONS AND REMARK</span>
            </CardHeader>

            <form className="m-auto w-full sm:w-2/3 lg:w-1/3 p-5" onSubmit={handleFirstSubmitButton}>
              {/* ---- Dropdown ---- */}
              <div className="mb-5">
                <label className="block mb-2 text-sm text-black">
                  <b>Please Select Action</b> <span className="text-red-600">*</span>
                </label>

                <select
                  className="block w-full p-2.5 border text-black rounded"
                  value={action}
                  onChange={(e) => handleActionChange(e.target.value)}
                >
                  <option value="">-- Select Action --</option>
                  {Object.entries(remarkOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* {action === "I" &&
                <div className="mb-5 space-y-3">
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1"
                    onClick={handleDownloadLicense}
                  >
                    <IoDownload /> Download License Certificate
                  </button>

                  <div>
                    <label className="block mb-2 text-sm text-black">
                      <b>Upload Signed PDF</b> <span className="text-red-600">*</span>
                    </label>

                    <input
                      key={fileInputKey}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="block w-full rounded border p-2 text-sm text-black file:mr-4 file:rounded file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                    />

                    {file && (
                      <p className="mt-2 text-sm text-green-700">
                        Selected file: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              } */}

              {/* ---- Textarea ---- */}
              <div>
                <label className="block mb-2 text-sm text-black">
                  <b>Remark </b><span className="text-red-600">*</span>
                </label>

                <textarea
                  rows={4}
                  className="block w-full p-3 border text-black rounded"
                  placeholder="Type remark..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 text-white rounded px-2 py-1 mt-2"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </Card>
        </div>
      }

      {/* --------------------- REMARK SUMMARY --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-black">
          <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
            <GrNotes /> <span>REMARK DETAILS</span>
          </CardHeader>

          {applicationData?.statusBanner?.code === "I" &&
            <button className="flex gap-1 items-center ml-2" onClick={handleDownloadLicense}>
              <span className="text-blue-800 font-semibold">View Certificate of Amendment </span>
              <span className="text-amber-600"><IoDocument size={20} /> </span>
            </button>
          }

          <Table className="border rounded-md text-black">
            <TableHeader className="bg-[#3C8DBC]">
              <TableRow>
                <TableHead className="border-r text-white">Sl. No.</TableHead>
                <TableHead className="border-r text-white">Serial Number(Form V)</TableHead>
                <TableHead className="border-r text-white">Remark</TableHead>
                <TableHead className="border-r text-white">Date</TableHead>
                <TableHead className="border-r text-white">Status</TableHead>
                <TableHead className="border-r text-white">Remark By</TableHead>
                <TableHead className="text-white">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {remarkData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.formv_serialno}</TableCell>
                  <TableCell>{row.remarkText}</TableCell>
                  <TableCell>{row.remarkDate}</TableCell>
                  <TableCell>{row.statusLabel}</TableCell>
                  <TableCell>{row.remarkByName}</TableCell>
                  <TableCell>
                    <button
                      disabled={!row.canDelete || isDeletingRemark}
                      onClick={() => {
                        if (isDeletingRemark) return;
                        setRemarkIdToDelete(Number(row.id));
                      }}
                      className={`p-1 ${
                        row.canDelete && !isDeletingRemark
                          ? "text-red-600 hover:text-red-800"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title={row.canDelete ? "Delete Remark" : "Not Allowed"}
                    >
                      <MdDelete size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Fees Chart Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
            <h2 className="text-sm font-semibold uppercase">Fees Chart</h2>
          </div>

          {/* TABLE */}
          <div className="px-4 py-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#3f8fbf] hover:bg-[#3f8fbf]">
                  <TableHead className="text-white w-[100px]">
                    SL.NO.
                  </TableHead>
                  <TableHead className="text-white">#</TableHead>
                  <TableHead className="text-white text-right w-[120px]">
                    FEES
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {feeData.map((row, index) => (
                  <TableRow
                    key={row.slNo}
                    className={index % 2 === 1 ? "bg-gray-100" : ""}
                  >
                    <TableCell>{row.slNo}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {row.fee}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end px-4 py-4 border-t">
            <button
              onClick={() => setModalOpen(false)}
              className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={remarkIdToDelete != null}
        onOpenChange={(open) => {
          if (!open && !isDeletingRemark) setRemarkIdToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Delete this remark? The application status will revert to the
              previous remark&apos;s status.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <button
              type="button"
              disabled={isDeletingRemark}
              onClick={() => setRemarkIdToDelete(null)}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingRemark}
              onClick={handleDeleteRemark}
              className={`px-4 py-2 rounded text-white ${
                isDeletingRemark
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isDeletingRemark ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[420px]">

          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Please confirm before submitting the action.
            </DialogDescription>
          </DialogHeader>

          {/* Checkbox */}
          <div className="flex items-start space-x-2 py-2">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-1"
            />
            {action === "A" || action === "AW" ?
              <label className="text-sm text-gray-700">
                Are you confirm that all data fields are checked which are given by the applicant?
              </label>
              : action === "I" ?
                <label className="text-sm text-gray-700">
                  Are you confirm that Signed Application Form is uploaded correctly by the applicant and checked?
                </label>
                : <></>}
          </div>

          <DialogFooter className="gap-2">

            <button
              onClick={() => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              disabled={!confirmChecked}
              onClick={(e) => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
                if (action === "A" || action === "AW" || action === "I") handleSubmit(e);
                // else if (action === "I") handleSubmitForIssue(e);
              }}
              className={`px-4 py-2 rounded text-white ${confirmChecked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Submit
            </button>

          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AlcViewAmendLicense;
