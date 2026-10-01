import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
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
import { Eye, EyeIcon } from "lucide-react";
import { IoDownload, IoInformationCircle } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../Components/ui/accordion";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";


// --------------------- Data Interfaces ---------------------

interface AppData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  verified: ReactElement;
}

interface AccordionData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
}

interface DocData {
  id: string;
  parameters: string | ReactElement;
  inputs: string;
  icon1: ReactElement | string;
  // icon2: ReactElement | string;
  verified: ReactElement;
}

interface RemarkData {
  id: string;
  formv_refno: string;
  remark: string;
  datetime: string;
  status: ReactElement | string;
  remarkby: string;
  remarkByUserId: string | ReactElement;
  act: ReactElement;
}

interface FeeRow {
  slNo: number;
  description: string;
  fee: string;
}


const feeData: FeeRow[] = [
  { slNo: 1, description: "Is 5 or more but does not exceed 20", fee: "₹30" },
  { slNo: 2, description: "Exceeds 20 but does not exceed 50", fee: "₹75" },
  { slNo: 3, description: "Exceeds 50 but does not exceed 100", fee: "₹150" },
  { slNo: 4, description: "Exceeds 100 but does not exceed 200", fee: "₹300" },
  { slNo: 5, description: "Exceeds 200 but does not exceed 400", fee: "₹600" },
  { slNo: 6, description: "Exceeds 400 but does not exceed 800", fee: "₹900" },
  { slNo: 7, description: "Exceeds 800 but does not exceed 1000", fee: "₹1000" },
  { slNo: 8, description: "Exceeds 1000", fee: "₹1500" },
];

// --------------------- Auto Fill Rules ---------------------

const remarkRules: Record<string, string> = {
  "B": "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
  "A": "Application is verified, applicant is allowed to pay the fees.",
  "AW": "Application is approved.",
  "R": "Application is rejected due to discrepancies.",
  "P": "Application is sent back for rectification of Form-IV. Kindly modify, sign and re-upload the Form-IV.",
  "BI": "Application is sent back to Inspector.",
  "I": "Congratulations! Certificate is issued.",
};

const statusImageMap: Record<string, string> = {
  Approved: `${IMAGE_BASE}btn-approved.png`,
  Applied: `${IMAGE_BASE}btn-applied.png`,
  "Fees Paid": `${IMAGE_BASE}btn-fees-paid.png`,
  "Fees Pending": `${IMAGE_BASE}btn-fees-pending.png`,
  Pending: `${IMAGE_BASE}btn-applied.png`,
  "Final Submitted": `${IMAGE_BASE}btn-final-submit.png`,
  Issued: `${IMAGE_BASE}btn-issued.png`,
  "Certificate Issued": `${IMAGE_BASE}btn-issued.png`,
  Rectification: `${IMAGE_BASE}btn-rectification.png`,
  Rectify: `${IMAGE_BASE}btn-rectification.png`,
  Backed: `${IMAGE_BASE}btn-rectification.png`,
  "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
  "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
  "Form-IV Backed": `${IMAGE_BASE}btn-rectify-signed-form.png`,
  Rejected: `${IMAGE_BASE}btn-reject.png`,
  Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
};

// --------------------- Main Component ---------------------

const AlcViewLicense = () => {
  const navigate = useNavigate();

  const { applicationId, applicantUserId } = useParams<{
    applicationId: string;
    applicantUserId: string;
  }>();

  const enApplicationId = encryptionDecryptionFun("encrypt", String(applicationId)) ?? "";
  const safeApplicationId = encodeURIComponent(enApplicationId);

  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [applicationData, setApplicationData] = useState<any>();
  const [establishmentData, setEstablishmentData] = useState<any>();
  const [rawApplicationData, setRawApplicationData] = useState<any>();
  const [modalOpen, setModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [verifySubmitFields, setVerifySubmitFields] = useState<Set<string>>(new Set());

  const [formV, setFormV] = useState<boolean>(false);
  const [workOrder, setWorkOrder] = useState<boolean>(false);
  const [residential, setResidential] = useState<boolean>(false);
  const [otherCertificate, setOtherCertificate] = useState<boolean>(false);
  const [formIV, setFormIV] = useState<boolean>(false);

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationStatusType, setApplicationStatusType] = useState<string | null>(null);
  const [applicationStatusMsg, setApplicationStatusMsg] = useState<string | null>(null);
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [remarkOptions, setRemarkOptions] = useState<Record<string, string>>({});
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();
  const [afterDeleteRemark, setAfterDeleteRemark] = useState<any>();

  const applicationStatusDetailMsgMap: Record<string, string> = {
    "B": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "BI": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    // ...(`${remarkData[0]?.remarkByUserId}` !== `${getUserId()}` 
    //   ? {"P": "Application is sent back for rectification of Form-IV. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option."} 
    //   : {"P": "Payment successful for this application. Form-IV is not uploaded by the applicant. After submission of signed FORM-IV by the applicant, the application can be further accessible."}
    // ),
    "T": "Applicant is CALLED BY ALC",
    "I": "Certificate is issued. For any changes in the FORM-VI(Certificate), Applicant can opt for Amendment of Registration Certificate. If you want to get back to the previous remark and re-upload FORM-VI(Certificate), delete the current remark by clicking the delete option.",
    "FW": "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    "P": "Payment successful for this application. Form-IV is not uploaded by the applicant. After submission of signed FORM-IV by the applicant, the application can be further accessible .",
    "A": "Application is approved and directed to pay fees. After fees payment and submission of signed FORM-IV by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "R": "If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "AW": "Application is approved without fees. After submission of signed FORM-IV by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "S": "FORM-IV is submitted by the Applicant. After verification of uploaded FORM-IV, Issue of Registration Certificate can be generated now or back to rectification FORM-IV.",
    "U": "Application is sent back for rectification of Form-IV. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    // "U": "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    "F": "Application is applied by the Applicant. Any action can be taken for the application.",
    "": "",
  };

  const toggleVerifiedField = (fieldName: string) => {
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

  const handleDownloadLicense = async () => {
    if (!applicationId || !applicantUserId) return;
    try {
      const response = await axios.get(
        `${API_BASE}certificate/formVI/contractor-license`,
        // `${API_BASE}certificate/formVI/clra-license`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            serialEnc: encryptionDecryptionFun("encrypt", String(remarkData[0]?.formv_refno)),
            createdByEnc: encryptionDecryptionFun("encrypt", String(applicantUserId)),
            licenseIdEnc: encryptionDecryptionFun("encrypt", String(applicationId)),
            renewalAmendIdEnc: encryptionDecryptionFun("encrypt", String(applicationId)),
            flagEnc: encryptionDecryptionFun("encrypt", "L"),

            // applicationId: safeApplicationId,
            // userId: applicantUserId,
          },
          responseType: "blob",
        }
      );
      // 🔥 Create blob directly from response
      // const blob = new Blob([response.data], { type: "application/pdf" });
      // const blobUrl = window.URL.createObjectURL(blob);

      const blobUrl = window.URL.createObjectURL(response.data);

      // Open in new tab
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  }

  const handleOpenPdfDoc = async (documentCode: string) => {
    try {
      const formv_refno: string = remarkData[0]?.formv_refno ?? "";
      const enFormVSerial: string = encryptionDecryptionFun("encrypt", formv_refno) ?? "";
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${encodeURIComponent(enFormVSerial)}&documentCode=${documentCode}&source=D`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("AUTH_STORAGE_KEY") || "{}")?.token}`,
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
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  }

  const estdData: AccordionData[] = [
    {
      id: "1.(a)",
      parameters: <p className="text-wrap wrap-break-word">Name and address of establishment</p>,
      inputs:
        <div>
          <p>{establishmentData?.name?.value ?? ""}</p>
          <p className="text-wrap break-words">{establishmentData?.location?.value ?? ""}</p>
        </div>,
    },
    {
      id: "1.(b)",
      parameters: <p className="text-wrap wrap-break-word">Type of business, trade,industry, manufacture or occupation, which is carried on in the establishment</p>,
      inputs:
        establishmentData?.type?.value ?? "",
    },
    {
      id: "1.(c)",
      parameters: <p className="text-wrap wrap-break-word">Number and date of certificate</p>,
      inputs:
        <div>
          {applicationData?.clra?.number?.value && <p>{applicationData?.clra?.number?.value ?? ""}  <br />issued on {new Date(applicationData?.clra?.date?.value ?? "").toLocaleDateString() ?? ""}</p>}
          <div className="flex flex-wrap gap-2">
            <button className="text-orange-500 hover:text-sky-700 flex gap-1 text-xs">
              Registration Certificate <FaMagnifyingGlass />
            </button>
            <button
              className="bg-sky-700 text-white flex gap-1 text-[0.7rem] rounded-lg px-1 font-semibold"
              onClick={() => { navigate(`/alc-visible-applications/${applicationData?.clraDetails?.clraID}/${applicationData?.clraDetails?.clraUserId}`) }}
            ><EyeIcon size={15} /> View More of Registration</button>
          </div>
        </div>,
    },
    {
      id: "1.(d)",
      parameters: <p className="text-wrap wrap-break-word">Name and address of the Principal Employer</p>,
      inputs:
        <div>
          <p>{applicationData?.establishment?.principalEmployerName ?? ""}</p>
          <p className="text-wrap wrap-break-word">{applicationData?.establishment?.principalEmployerAddress ?? ""}</p>
        </div>,
    },
  ];

  const contractorData: AccordionData[] = [
    {
      id: "2.(a)",
      parameters: <p className="text-wrap wrap-break-word">Name and address of Contractor</p>,
      inputs:
        <div>
          <p>{applicationData?.contractor?.name ?? ""}</p>
          <p className="text-wrap wrap-break-word">{applicationData?.contractor?.address ?? ""}</p>
        </div>,
    },
    {
      id: "2.(b)",
      parameters: "Contractor Status",
      inputs:
        <div className="flex gap-2">
          <p>New Contractor</p>
          <button className="bg-green-700 rounded-lg px-2 py-1 flex gap-1 text-white font-semibold text-xs"><MdDone size={15} />Active</button>
        </div>,
    },
    {
      id: "2.(c)",
      parameters: <p className="text-wrap wrap-break-word">Nature of work in which contract labour is employed or is to be employed in the establishment</p>,
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{applicationData?.contractor?.natureOfWork ?? ""}</p>
        </div>,
    },
    {
      id: "2.(d)",
      parameters: <p className="text-wrap wrap-break-word">Duration of the proposed contract work (give particulars of proposed date of commencing and ending)</p>,
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{new Date(applicationData?.contractor?.contractDuration?.from ?? "").toLocaleDateString() ?? ""} - {new Date(applicationData?.contractor?.contractDuration?.to ?? "").toLocaleDateString() ?? ""}</p>
        </div>,
    },
    {
      id: "2.(e)",
      parameters: <p className="text-wrap wrap-break-word">Maximum number of contract labour proposed to be employed in the establishment on any date</p>,
      inputs:
        <div>
          <p>{applicationData?.labourDetails?.maxLabour ?? ""}</p>
        </div>,
    },
  ];

  const inputsByContractorData: AppData[] = [
    {
      id: "",
      parameters: "CAF Number",
      inputs:
        applicationData?.application?.cafIdNo ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Form V Serial Number</p>,
      inputs:
        remarkData[0]?.formv_refno ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "1.(a)",
      parameters: <p className="text-wrap wrap-break-word">Father s name of the contractor (including his father s name in case of individuals)</p>,
      inputs:
        applicationData?.contractor?.fatherOrHusbandName ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "1.(b)",
      parameters: <p className="text-wrap wrap-break-word">Address of the contractor</p>,
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{applicationData?.contractor?.address ?? ""}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_dist")}
          onCheckedChange={() => toggleVerifiedField("contractor_dist")}
        />,
    },
    {
      id: "2.(a)",
      parameters: <p className="text-wrap wrap-break-word">Co-operative Society **</p>,
      inputs:
        <div>
          {applicationData?.contractor?.cooperativeSociety ?? ""}
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("cooperative_society")}
          onCheckedChange={() => toggleVerifiedField("cooperative_society")}
        />,
    },
    {
      id: "2.(b)",
      parameters:
        <div> Date of Birth and age [in case of individuals] </div>,
      inputs:
        <div>
          <p>{new Date(applicationData?.contractor?.dob ?? "").toLocaleDateString() ?? ""}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("dob_contractor")}
          onCheckedChange={() => toggleVerifiedField("dob_contractor")}
        />,
    },
    {
      id: "3.(a)",
      parameters: <p className="text-wrap wrap-break-word">Name of the agent or manager of contractor at the work site</p>,
      inputs:
        applicationData?.contractor?.managerName ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("name_of_agent")}
          onCheckedChange={() => toggleVerifiedField("name_of_agent")}
        />,
    },
    {
      id: "3.(b)",
      parameters: <p className="text-wrap wrap-break-word">Address of the agent or manager of contractor at the work site</p>,
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{applicationData?.contractor?.managerAddress ?? ""}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("address_of_manager")}
          onCheckedChange={() => toggleVerifiedField("address_of_manager")}
        />,
    },
    {
      id: "4.",
      parameters: <p className="text-wrap wrap-break-word">Category/designation/nomenclature of the contractor labour, namely,fitter,welder,carpenter,mazdor etc.</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.categoryDesignation ?? ""}</p>
          <button className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1" onClick={() => { navigate(`/view-details/directorpartner-info/${applicationId}/DIRECTOR`) }}><Eye size={15} /> View Details</button>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("category_designation")}
          onCheckedChange={() => toggleVerifiedField("category_designation")}
        />,
    },
  ];

  const rateOfWagesDaData: AppData[] = [
    {
      id: "5.(a)",
      parameters: <p className="text-wrap wrap-break-word">Rate of wages,DA and Other cash benefits paid/ to be paid to Unskilled of contract labour:</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.wages?.unskilled?.rate ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("unskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("unskilled_rate_wages")}
        />,
    },
    {
      id: "5.(b)",
      parameters: <p className="text-wrap wrap-break-word">Rate of wages,DA and Other cash benefits paid/ to be paid to Semi-skilled of contract labour:</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.wages?.semiSkilled?.rate ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("semiskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("semiskilled_rate_wages")}
        />,
    },
    {
      id: "5.(c)",
      parameters: <p className="text-wrap wrap-break-word">Rate of Wages,DA and Other cash benefits paid/ to be paid to Skilled of contract labour:</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.wages?.skilled?.rate ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("skilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("skilled_rate_wages")}
        />,
    },
    {
      id: "5.(d)",
      parameters: <p className="text-wrap wrap-break-word">Rate of Wages,DA and Other cash benefits paid/ to be paid to Highly-skilled of contract labour:</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.wages?.highlySkilled?.rate ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("highlyskilled_rate_wages")}
          onCheckedChange={() => toggleVerifiedField("highlyskilled_rate_wages")}
        />,
    },
  ];

  const hoursOfWorkData: AppData[] = [
    {
      id: "6.(a)",
      parameters: "Hours of Work",
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.workConditions?.hoursOfWork ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("hours_work")}
          onCheckedChange={() => toggleVerifiedField("hours_work")}
        />,
    },
    {
      id: "6.(b)",
      parameters: "Overtime",
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.workConditions?.overtime ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("overtime")}
          onCheckedChange={() => toggleVerifiedField("overtime")}
        />,
    },
    {
      id: "6.(c)",
      parameters: "Overtime Wages",
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.workConditions?.overtimeWages ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
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
      id: "7.(a)",
      parameters: <p className="text-wrap wrap-break-word">Number of annual leave</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.annualLeave?.days ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("annual_leave_no")}
          onCheckedChange={() => toggleVerifiedField("annual_leave_no")}
        />,
    },
    {
      id: "7.(b)",
      parameters: <p className="text-wrap wrap-break-word">Number of casual leave</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.casualLeave?.days ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("casual_leave_no")}
          onCheckedChange={() => toggleVerifiedField("casual_leave_no")}
        />,
    },
    {
      id: "7.(c)",
      parameters: <p className="text-wrap wrap-break-word">Number of sick leave</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.sickLeave?.days ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("sick_leave_no")}
          onCheckedChange={() => toggleVerifiedField("sick_leave_no")}
        />,
    },
    {
      id: "7.(d)",
      parameters: <p className="text-wrap wrap-break-word">Number of maternity leave</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.maternityLeave?.days ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("maternity_leave_no")}
          onCheckedChange={() => toggleVerifiedField("maternity_leave_no")}
        />,
    },
    {
      id: "7.(e)",
      parameters: <p className="text-wrap wrap-break-word">Number of other leave</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.otherLeave?.days ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_leave_no")}
          onCheckedChange={() => toggleVerifiedField("other_leave_no")}
        />,
    },
    {
      id: "7.(f)",
      parameters: "Holiday(s)",
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.leaveAndHolidays?.holidays?.displayText ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("holiday")}
          onCheckedChange={() => toggleVerifiedField("holiday")}
        />,
    },
    {
      id: "8.",
      parameters: <p className="text-wrap wrap-break-word">Whether the contractor was convicted of any offence within the preceeding five years. If so, give details</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.compliance?.convicted?.details ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_convicted")}
          onCheckedChange={() => toggleVerifiedField("contractor_convicted")}
        />,
    },
    {
      id: "9",
      parameters: <p className="text-wrap wrap-break-word">Whether there was any order against the contract or revoking or suspending license or forfeiting security deposit in respect of an earlier contract. If so, the date of such order.</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.compliance?.revokedOrSuspended?.details ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_revoking")}
          onCheckedChange={() => toggleVerifiedField("contractor_revoking")}
        />,
    },
    {
      id: "10.",
      parameters: <p className="text-wrap wrap-break-word">Whether the contractor has worked in any other establishment within the past five years. If so. give details of the principal employer, establishment and nature of work</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.compliance?.previousEmployer?.details ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("contractor_previous_employer")}
          onCheckedChange={() => toggleVerifiedField("contractor_previous_employer")}
        />,
    },
    {
      id: "11.",
      parameters: <p className="text-wrap wrap-break-word">Work Site Address **	</p>,
      inputs:
        <div className="flex gap-4">
          <p className="text-wrap wrap-break-word">{applicationData?.worksite?.addressLine ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("worksite_add")}
          onCheckedChange={() => toggleVerifiedField("worksite_add")}
        />,
    },
    {
      id: "12.",
      parameters: <p className="text-wrap wrap-break-word">Whether a certificate by the principal employer in FORM-V is enclosed</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.contractor?.contractorType == '1' ? `FORM-V : Not Applicable, REFERENCE NUMBER : 00${remarkData[0]?.formv_refno}` : "YES"}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("frm_v")}
          onCheckedChange={() => toggleVerifiedField("frm_v")}
        />,
    },
    {
      id: "13.",
      parameters: <p className="text-wrap wrap-break-word">Maximum number of contract labour proposed to be employed in the establishment on any date</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.labourDetails?.maxLabour ?? ""}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("max_labour")}
          onCheckedChange={() => toggleVerifiedField("max_labour")}
        />,
    },
  ];

  const docData: DocData[] = [
    {
      id: "i)",
      parameters: "FORM - V",
      inputs: "",
      icon1:
        formV ?
          <div className="flex gap-1">
            <button onClick={() => handleOpenPdfDoc("FV")}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: formV ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.formV?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("frm_v_file_id")}
          onCheckedChange={() => toggleVerifiedField("frm_v_file_id")}
        />,
    },
    {
      id: "ii)",
      parameters: "Work Order",
      inputs: "",
      icon1:
        workOrder ?
          <div className="flex gap-1">
            <button onClick={() => handleOpenPdfDoc("WO")}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: workOrder ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.workOrder?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("work_order_file_id")}
          onCheckedChange={() => toggleVerifiedField("work_order_file_id")}
        />,
    },
    {
      id: "iii)",
      parameters: <p className="text-wrap wrap-break-word">Residential Certificate / Trade Licence</p>,
      inputs: "",
      icon1:
        residential ?
          <div className="flex gap-1">
            <button onClick={() => handleOpenPdfDoc("AP")}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: residential ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.residential?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("residential_file_id")}
          onCheckedChange={() => toggleVerifiedField("residential_file_id")}
        />,
    },
    {
      id: "iv)",
      parameters: "Other Document",
      inputs: "",
      icon1:
        otherCertificate ?
          <div className="flex gap-1">
            <button onClick={() => handleOpenPdfDoc("ODSC")}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: otherCertificate ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherStateCert?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_id")}
          onCheckedChange={() => toggleVerifiedField("other_doc_id")}
        />,
    },
    {
      id: "vi)",
      parameters: "FORM-IV",
      inputs: "",
      icon1:
        formIV ?
          <div className="flex gap-1">
            <button onClick={() => handleOpenPdfDoc("FIV")}><FaRegNoteSticky className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>Form-IV will be uploaded after fees payment</p>,
      // icon2: formIV ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.formIV?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("form_iv_id")}
          onCheckedChange={() => toggleVerifiedField("form_iv_id")}
        />,
    },
    {
      id: "vii)",
      parameters: "LICENSE",
      inputs: "",
      icon1:
        applicationStatus === "I" ?
          <div className="flex gap-2">
            <button className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1" onClick={handleDownloadLicense}>
              <IoDownload /> Signed License
            </button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>Not Issued Yet</p>,
      // icon2: formIV ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.formIV?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        applicationStatus === "I" ?
          <Checkbox
            className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                        data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
            checked={true}
          // onCheckedChange={() => toggleVerifiedField("form_iv_id")}
          />
          : <></>,
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "15.i)",
      parameters: "License Fees",
      inputs:
        <div className="flex gap-3">
          <p>{applicationData?.paymentDetails?.licenseFees?.formatted ?? ""}</p>
          <button className="flex gap-1 bg-blue-400 text-white rounded-sm px-2 py-1" onClick={() => setModalOpen(true)}><IoInformationCircle size={16} /> Fees Chart</button>
        </div>,
      verified: <input type="checkbox" />,
    },
    {
      id: "15.ii)",
      parameters: "Security Fees",
      inputs:
        <div className="flex gap-3">
          <p>{applicationData?.paymentDetails?.securityFees?.formatted ?? ""}</p>
        </div>,
      verified: <input type="checkbox" />,
    },
    {
      id: "15.iii)",
      parameters: "Payment Details",
      inputs:
        <div>
          {applicationData?.paymentDetails?.paymentDetails?.status === "Success" ? (
            <>
              <p className="">GRIPS Payment [Online / Counter]</p>
              <p>GRN Number: {applicationData?.paymentDetails?.paymentDetails?.grnNumber ?? ""}</p>
              <p>Transaction Id: {applicationData?.paymentDetails?.paymentDetails?.transactionId ?? ""}</p>
              <p>Total Amount: {applicationData?.paymentDetails?.paymentDetails?.totalAmount ?? ""}</p>
              <p>Transaction Date: {applicationData?.paymentDetails?.paymentDetails?.transactionDate ?? ""}</p>
              <p>Bank Code: {applicationData?.paymentDetails?.paymentDetails?.bankCode ?? ""}</p>
              <p>Status: {applicationData?.paymentDetails?.paymentDetails?.status ?? ""}</p>
            </>
          ) : (
            <p>{applicationData?.paymentDetails?.paymentDetails?.status ?? ""}</p>
          )}
        </div>,
      verified: <input type="checkbox" />,
    },
  ];

  // const establishmentRegCLRAData: AppData[] = [
  //   {
  //     id: "6.(a)",
  //     parameters: "Registration Number",
  //     inputs:
  //       !applicationData?.clra?.isAvailable ?
  //         <div className="flex gap-3">
  //           <p>{applicationData?.clra?.number?.value ?? ""}</p>
  //           <button className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1">Not Available in {DOMAIN_NAME}</button>
  //         </div> :
  //         <div className="flex gap-3">
  //           <p>{applicationData?.clra?.number?.value ?? ""}</p>
  //           <button
  //             className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1"
  //             onClick={() => { navigate(`/alc-visible-applications/${applicationData?.clraDetails?.clraID}/${applicationData?.clraDetails?.clraUserId}`) }}
  //           >View More of Registration</button>
  //         </div>,
  //     // verified: applicationData?.clra?.number?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("clra_registration_number")}
  //         onCheckedChange={() => toggleVerifiedField("clra_registration_number")}
  //       />,
  //   },
  //   {
  //     id: "6.(b)",
  //     parameters: "Date of Registration",
  //     inputs:
  //       applicationData?.clra?.date?.value
  //         ? new Date(applicationData?.clra?.date?.value).toLocaleDateString()
  //         : "",
  //     // verified: applicationData?.clra?.date?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("clra_registration_date")}
  //         onCheckedChange={() => toggleVerifiedField("clra_registration_date")}
  //       />,
  //   },
  //   {
  //     id: "7.",
  //     parameters: "Nature of Work",
  //     inputs:
  //       applicationData?.paymentDetails.totalFees ?? "",
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("nature_of_work")}
  //         onCheckedChange={() => toggleVerifiedField("nature_of_work")}
  //       />,
  //   },
  //   {
  //     id: "8.",
  //     parameters: "Particulars of Contractors and Migrant Workmen",
  //     inputs:
  //       <div className="flex gap-4">
  //         <p>Number of Contractor / Person Responsible: {applicationData?.contractors?.count}</p>
  //         <button className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1" onClick={() => { navigate(`/view-details/directorpartner-info/${applicationId}/CONTRACTOR`) }}><Eye size={15} /> View Details</button>
  //       </div>,
  //     // verified: applicationData?.contractors.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("modify_contractors")}
  //         onCheckedChange={() => toggleVerifiedField("modify_contractors")}
  //       />,
  //   },
  //   {
  //     id: "9.",
  //     parameters:
  //       <div className="">
  //         <p className="text-wrap wrap-break-word">Maximum number of migrant workmen are to be employed on any day through each contractor</p>
  //       </div>,
  //     inputs:
  //       <div className="flex gap-2">
  //         <p>{applicationData?.maxMigrantWorkmen?.value ?? ""}</p>
  //         <p className="text-xs font-semibold text-green-800"> [ FEES IS CALCULATED BASED ON THIS VALUE ]</p>
  //       </div>,
  //     // verified: applicationData?.maxMigrantWorkmen?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
  //     verified:
  //       <Checkbox
  //         className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
  //                     data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
  //         checked={verifiedFields.has("max_num_migrant_wrkmen")}
  //         onCheckedChange={() => toggleVerifiedField("max_num_migrant_wrkmen")}
  //       />,
  //   },
  // ];

  // const demoRemarkData: RemarkData[] = [
  //   {
  //     id: "1",
  //     date: "2024-01-12",
  //     remark: "Sample remark",
  //     status: "Pending",
  //     remarkby: "Admin",
  //     act: "View",
  //   },
  // ];

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

  const getOptionText = (option: unknown): string => {
    if (typeof option === "string" || typeof option === "number") {
      return String(option);
    }
    if (option && typeof option === "object") {
      const obj = option as { label?: unknown; value?: unknown };
      if (typeof obj.label === "string" || typeof obj.label === "number") {
        return String(obj.label);
      }
      if (typeof obj.value === "string" || typeof obj.value === "number") {
        return String(obj.value);
      }
    }
    return "";
  };

  const unwrapValue = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map(unwrapValue);
    }
    if (input && typeof input === "object") {
      if ("value" in input) {
        return unwrapValue(input.value);
      }
      const output: Record<string, any> = {};
      Object.entries(input).forEach(([key, value]) => {
        output[key] = unwrapValue(value);
      });
      return output;
    }
    return input;
  };


  const handleActionChange = (value: string) => {
    setAction(value);

    if (remarkRules[value]) {
      setRemark(remarkRules[value]);
    } else {
      setRemark("");
    }
  };

  useEffect(() => {
    if (!rawApplicationData || !applicationData || !establishmentData) return;

    const initialVerified = new Set<string>();

    // --------- Contractor ----------
    if (establishmentData?.name?.value)
      initialVerified.add("e_name");

    if (rawApplicationData?.contractor?.address?.verified)
      initialVerified.add("contractor_dist");

    if (rawApplicationData?.contractor?.address?.verified)  // to be done
      initialVerified.add("cooperative_society");

    if (rawApplicationData?.contractor?.dob?.verified)
      initialVerified.add("dob_contractor");

    if (rawApplicationData?.contractor?.managerName?.verified)
      initialVerified.add("name_of_agent");

    if (rawApplicationData?.contractor?.managerAddress?.verified)
      initialVerified.add("address_of_manager");

    if (rawApplicationData?.labourDetails?.categoryDesignation?.verified)
      initialVerified.add("category_designation");

    // -------- Rate of Wages --------
    if (rawApplicationData?.labourDetails?.wages?.unskilled?.rate?.verified)
      initialVerified.add("unskilled_rate_wages");

    if (rawApplicationData?.labourDetails?.wages?.semiSkilled?.rate?.verified)
      initialVerified.add("semiskilled_rate_wages");

    if (rawApplicationData?.labourDetails?.wages?.skilled?.rate?.verified)
      initialVerified.add("skilled_rate_wages");

    if (rawApplicationData?.labourDetails?.wages?.highlySkilled?.rate?.verified)
      initialVerified.add("highlyskilled_rate_wages");

    // ------------ Hours of Work --------------
    if (rawApplicationData?.labourDetails?.workConditions?.hoursOfWork?.verified)
      initialVerified.add("hours_work");

    if (rawApplicationData?.labourDetails?.workConditions?.overtime?.verified)
      initialVerified.add("overtime");

    if (rawApplicationData?.labourDetails?.workConditions?.overtimeWages?.verified)
      initialVerified.add("overtime_wages");

    // -------- Leave ---------
    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.annualLeave?.days?.verified)
      initialVerified.add("annual_leave_no");

    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.casualLeave?.days?.verified)
      initialVerified.add("casual_leave_no");

    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.sickLeave?.days?.verified)
      initialVerified.add("sick_leave_no");

    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.maternityLeave?.days?.verified)
      initialVerified.add("maternity_leave_no");

    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.otherLeave?.days?.verified)
      initialVerified.add("other_leave_no");

    if (rawApplicationData?.labourDetails?.leaveAndHolidays?.holidays?.totalHolidays?.verified)
      initialVerified.add("holiday");

    // -------- Compliance --------
    if (rawApplicationData?.labourDetails?.compliance?.convicted?.details?.verified)
      initialVerified.add("contractor_convicted");

    if (rawApplicationData?.labourDetails?.compliance?.revokedOrSuspended?.details?.verified)
      initialVerified.add("contractor_revoking");

    if (rawApplicationData?.labourDetails?.compliance?.previousEmployer?.details?.verified)
      initialVerified.add("contractor_previous_employer");

    if (rawApplicationData?.worksite?.addressLine?.verified)
      initialVerified.add("worksite_add");

    if (rawApplicationData?.contractor?.contractorType?.verified)
      initialVerified.add("frm_v");

    if (rawApplicationData?.labourDetails?.maxLabour?.verified)
      initialVerified.add("max_labour");

    // -------- Documents --------
    const docs = rawApplicationData?.documentsSummary;

    if (docs?.formV?.verified)
      initialVerified.add("frm_v_file_id");

    if (docs?.workOrder?.verified)
      initialVerified.add("work_order_file_id");

    if (docs?.residential?.verified)
      initialVerified.add("residential_file_id");

    if (docs?.other?.verified)
      initialVerified.add("other_doc_id");

    if (docs?.formIV?.verified)
      initialVerified.add("form_iv_id");

    setVerifiedFields(initialVerified);
  }, [applicationData, establishmentData]);


  const buildAutoVerifiedFields = () => {
    const auto = new Set<string>();
    const hasVal = (v: unknown) => String(v ?? "").trim() !== "";

    // Establishment / address
    if (hasVal(establishmentData?.name?.value)) auto.add("e_name");

    [
      "contractor_dist",
      "cooperative_society",
      "dob_contractor",
      "name_of_agent",
      "address_of_manager",
      "category_designation",
      "unskilled_rate_wages",
      "semiskilled_rate_wages",
      "skilled_rate_wages",
      "highlyskilled_rate_wages",
      "hours_work",
      "overtime",
      "overtime_wages",
      "annual_leave_no",
      "casual_leave_no",
      "sick_leave_no",
      "maternity_leave_no",
      "other_leave_no",
      "holiday",
      "contractor_convicted",
      "contractor_revoking",
      "contractor_previous_employer",
      "worksite_add",
      "frm_v",
      "max_labour",
    ].forEach((f) => auto.add(f));

    // Documents
    const docs = applicationData?.documentsSummary;
    if (docs?.formV?.available) auto.add("frm_v_file_id");
    if (docs?.workOrder?.available) auto.add("work_order_file_id");
    if (docs?.residential?.available) auto.add("residential_file_id");
    if (docs?.other?.available) auto.add("other_doc_id");
    if (docs?.formIV?.available && action === "I") auto.add("form_iv_id");

    return auto;
  };

  const submitRemark = async (fieldSet: Set<string>) => {
    if (!applicationId || !applicantUserId) return;

    const payload = {
      particularid: applicationData?.application?.contractorParticularID,
      // contractor_user_id: applicationData?.contractor?.id,
      contractor_user_id: applicantUserId,
      license_id: applicationId,
      serial: remarkData[0]?.formv_refno,
      act_id: 12,
      remarks_text: remark,
      remark_type: action,
      license_fieldname:
        fieldSet.size > 0
          ? Array.from(fieldSet).join(",")
          : "",
    };

    try {
      const res = await axios.post(
        `${API_BASE}contractor-license/alc/view-license-form-submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Remark submitted:", res.data);
      setAfterSubmitRes(res.data);

      // Refresh remark list after submit
      setRemark("");
      setAction("");
      setVerifiedFields(new Set());

      alert("Action submitted successfully");
    } catch (error) {
      console.error("Submit failed", error);
      alert("Failed to submit remark");
    }
  };

  const handleFirstSubmitButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }
    if (action === "A" || action === "AW" || action === "I") {
      const auto = buildAutoVerifiedFields();
      setVerifiedFields(auto);
      setVerifySubmitFields(auto);
      setShowSubmitModal(true);
      return;
    }
    await submitRemark(verifiedFields);
  };

  const handleDeleteRemark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!applicationId || !applicantUserId) return;

    const payload = {
      action: "DELETE_LAST_REMARK",
    };

    try {
      const res = await axios.post(
        `${API_BASE}contractor-license/alc/applications/${applicationId}/${applicantUserId}/remark`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Remark deleted:", res.data);
      setAfterDeleteRemark(res.data);

      alert("Remark Deleted Successfully");
    } catch (error) {
      console.error("remark delete failed", error);
      alert("Failed to delete remark");
    }
  }


  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        if (!applicationId || !applicantUserId) return;

        const applicationRes = await axios.get<any>(
          `${API_BASE}contractor-license/alc/applications/${applicationId}/${applicantUserId}/general-details`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        const data = applicationRes?.data ?? {};
        setRawApplicationData(data);   // should be removed
        const raw = unwrapValue(data);

        // Normalize new CLRA-license payload to existing UI shape.
        // verified field should be added in every field of normalizedData
        const normalizedData = {
          ...raw,
          clraDetails: {
            clraID: raw?.clraDetails?.clraID ?? null,
            clraUserId: raw?.clraDetails?.clraUserId ?? null,
          },
          clra: {
            isAvailable: !raw?.establishment?.peRegistrationNumber,
            number: { value: raw?.establishment?.peRegistrationNumber ?? "", verified: false },
            date: { value: raw?.establishment?.peRegistrationDate ?? null, verified: false },
            applicationId: raw?.application?.id ?? Number(applicationId),
            applicantUserId: raw?.application?.applicantUserId ?? Number(applicantUserId),
          },
          principalEmployer: {
            name: { value: raw?.establishment?.principalEmployerName ?? "" },
            contact: { value: raw?.establishment?.principalEmployerAddress ?? "" },
            gender: { value: "" },
          },
          directors: { count: 0, verified: false },
          managers: { verified: false },
          contractors: { count: 1, verified: false },
          maxMigrantWorkmen: {
            value: raw?.contractor?.maxContractLabour ?? "",
            verified: false,
          },
          labourDetails: {
            categoryDesignation: raw?.labourDetails?.categoryDesignation ?? "",
            wages: {
              unskilled: { rate: raw?.labourDetails?.wages?.unskilled?.rate ?? "" },
              semiSkilled: { rate: raw?.labourDetails?.wages?.semiSkilled?.rate ?? "" },
              skilled: { rate: raw?.labourDetails?.wages?.skilled?.rate ?? "" },
              highlySkilled: { rate: raw?.labourDetails?.wages?.highlySkilled?.rate ?? "" },
            },
            workConditions: {
              hoursOfWork: raw?.labourDetails?.workConditions?.hoursOfWork ?? "",
              overtime: raw?.labourDetails?.workConditions?.overtime ?? "",
              overtimeWages: raw?.labourDetails?.workConditions?.overtimeWages ?? "",
            },
            leaveAndHolidays: {
              annualLeave: { days: raw?.labourDetails?.leaveAndHolidays?.annualLeave?.days ?? "" },
              casualLeave: { days: raw?.labourDetails?.leaveAndHolidays?.casualLeave?.days ?? "" },
              sickLeave: { days: raw?.labourDetails?.leaveAndHolidays?.sickLeave?.days ?? "" },
              maternityLeave: { days: raw?.labourDetails?.leaveAndHolidays?.maternityLeave?.days ?? "" },
              otherLeave: { days: raw?.labourDetails?.leaveAndHolidays?.otherLeave?.days ?? "" },
              holidays: {
                totalHolidays: raw?.labourDetails?.leaveAndHolidays?.holidays?.totalHolidays ?? "",
                displayText: raw?.labourDetails?.leaveAndHolidays?.holidays?.displayText ?? "",
              },
            },
            compliance: {
              convicted: { details: raw?.labourDetails?.compliance?.convicted?.details ?? "" },
              revokedOrSuspended: { details: raw?.labourDetails?.compliance?.revokedOrSuspended?.details ?? "" },
              previousEmployer: { details: raw?.labourDetails?.compliance?.previousEmployer?.details ?? "" },
            },
            maxLabour: raw?.labourDetails?.maxLabour ?? "",
          },
          paymentDetails: {
            totalFees: raw?.paymentDetails?.totalFees ?? "",
            licenseFees: raw?.paymentDetails?.licenseFees ?? "",
            securityFees: raw?.paymentDetails?.securityFees ?? "",
            paymentDetails: {
              type: raw?.paymentDetails?.paymentDetails?.type ?? "",
              label: raw?.paymentDetails?.paymentDetails?.label ?? "",
              grnNumber: raw?.paymentDetails?.paymentDetails?.grnNumber ?? "",
              transactionId: raw?.paymentDetails?.paymentDetails?.transactionId ?? "",
              totalAmount: raw?.paymentDetails?.paymentDetails?.totalAmount ?? "",
              transactionDate: raw?.paymentDetails?.paymentDetails?.transactionDate ?? "",
              bankCode: raw?.paymentDetails?.paymentDetails?.bankCode ?? "",
              status: raw?.paymentDetails?.paymentDetails?.status ?? "",
            },
          },
          documentsSummary: {
            formV: { available: Boolean(raw?.documentsSummary?.formV) || Boolean(raw?.documentsSummary?.formVFallbackAvailable), verified: Boolean(raw?.documentsSummary?.formV?.verified) },
            workOrder: { available: Boolean(raw?.documentsSummary?.workOrder) || Boolean(raw?.documentsSummary?.workOrderFallbackAvailable), verified: Boolean(raw?.documentsSummary?.workOrder?.verified) },
            residential: { available: Boolean(raw?.documentsSummary?.residential) || Boolean(raw?.documentsSummary?.residentialFallbackAvailable), verified: Boolean(raw?.documentsSummary?.residential?.verified) },
            other: { available: Boolean(raw?.documentsSummary?.other) || Boolean(raw?.documentsSummary?.otherFallbackAvailable), verified: Boolean(raw?.documentsSummary?.other?.verified) },
            formIV: { available: Boolean(raw?.documentsSummary?.formIV) || Boolean(raw?.documentsSummary?.formIVFallbackAvailable), verified: Boolean(raw?.documentsSummary?.formIV?.verified) },
          },
          applicationStatus: {
            ...raw?.applicationStatus,
            latestRemarkParticularId: raw?.applicationStatus?.latestRemarkParticularId ?? null,
          },
        };

        console.log(normalizedData)
        setApplicationData(normalizedData);

        setEstablishmentData({
          name: { value: raw?.establishment?.establishmentName ?? "" },
          type: { value: raw?.establishment?.establishmentType ?? "" },
          location: { value: raw?.establishment?.establishmentLocation ?? "" },
        });

        setFormV(Boolean(normalizedData?.documentsSummary?.formV?.available));
        setWorkOrder(Boolean(normalizedData?.documentsSummary?.workOrder?.available));
        setResidential(Boolean(normalizedData?.documentsSummary?.residential?.available));
        setOtherCertificate(Boolean(normalizedData?.documentsSummary?.other?.available));
        setFormIV(Boolean(normalizedData?.documentsSummary?.formIV?.available));
        setApplicationStatus(raw?.applicationStatusMoreInfo?.status ?? "");
        setApplicationStatusType(raw?.applicationStatusMoreInfo?.type ?? "");
        setApplicationStatusMsg(raw?.applicationStatusMoreInfo?.message ?? "");

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchApplicationData();
  }, [applicationId, applicantUserId, afterSubmitRes, afterDeleteRemark])


  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        if (!applicationId || !applicantUserId) return;

        const q = new URLSearchParams();
        const derivedParticularId =
          applicationData?.applicationStatus?.latestRemarkParticularId ??
          applicationData?.application?.particularId;
        if (derivedParticularId != null && Number(derivedParticularId) > 0) {
          q.set("particularId", String(derivedParticularId));
        }
        q.set("flag", "L");

        const remarkRes = await axios.get(
          `${API_BASE}contractor-license/alc/applications/${applicationId}/${applicantUserId}/remarks?${q.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        if (!remarkRes.data || !Array.isArray(remarkRes.data.remarks)) {
          setRemarkData([]);
          return;
        }

        const remarkTableData: RemarkData[] = remarkRes?.data?.remarks.map((r: any) => ({
          id: String(r.id ?? ""),
          formv_refno: String(remarkRes?.data?.formVSerialNo) ?? "",
          datetime: r.remarkDate
            ? new Date(r.remarkDate).toLocaleString()
            : "",
          remark: r.remarkText ?? "",
          status: renderStatusImage(r.statusLabel ?? r.remarkType ?? "") ?? <></>,
          remarkby: r.remarkByName ?? "",
          remarkByUserId: r.remarkByUserId ?? "",
          act: (
            <button
              disabled={false}
              onClick={handleDeleteRemark}
              className={`p-1 ${"text-red-600 hover:text-red-800"
                }`}
            >
              <MdDelete size={18} />
            </button>
          ),

        }));

        setRemarkData(remarkTableData);

      } catch (error) {
        console.error("API Error:", error);
        setRemarkData([]); // prevent stale UI
      }
    };

    fetchRemarkData();
  }, [applicationId, applicantUserId, applicationData, afterSubmitRes, afterDeleteRemark]);


  useEffect(() => {
    const fetchRemarksInputDropdown = async () => {
      try {
        if (!applicationId || !applicantUserId) return;
        const remarkDropdownRes = await axios.get(
          `${API_BASE}contractor-license/alc/applications/${applicationId}/${applicantUserId}/actions`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        const data = remarkDropdownRes?.data;
        setRemarkOptions(data);

      } catch (error) {
        console.error("API Error:", error);
        setRemarkOptions({});
      }
    }
    fetchRemarksInputDropdown();
  }, [applicationId, applicantUserId])



  return (
    <div className="min-h-[250px] mb-15">

      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">Applying For License Under The acts of CLRA</h1>

      {/* --------------------- Estd & Contractor Data ---------------- */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ================= ESTABLISHMENT BLOCK ================= */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="border rounded-md p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="bg-sky-700 py-2 px-3 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              1. Establishment Details [ Verified ]
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                            text-white text-xl font-bold
                            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="p-2 border rounded-none">
                <Table className="border border-gray-400 rounded-md text-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r w-20">Sl</TableHead>
                      <TableHead className="border-r w-[320px]">Parameters</TableHead>
                      <TableHead className="border-r">Inputs</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {estdData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="border-r">{item.id}</TableCell>
                        <TableCell className="border-r">{item.parameters}</TableCell>
                        <TableCell className="border-r">{item.inputs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ================= CONTRACTOR BLOCK ================= */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-2"
          className="border rounded-md p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-2">
            <AccordionTrigger className="bg-sky-700 py-2 px-3 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              2. Contractor Details provided by Principal Employer [ Verified ]
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="p-2 border rounded-none">
                <Table className="border border-gray-400 rounded-md text-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r w-20">Sl</TableHead>
                      <TableHead className="border-r w-[320px]">Parameters</TableHead>
                      <TableHead className="border-r">Inputs</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {contractorData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="border-r">{item.id}</TableCell>
                        <TableCell className="border-r">{item.parameters}</TableCell>
                        <TableCell className="border-r">{item.inputs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            3. Inputs are provided by Contractor [For Verification]
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r font-semibold">Sl.</TableHead>
                  <TableHead className="border-r font-semibold">Parameters</TableHead>
                  <TableHead className="border-r font-semibold">Inputs</TableHead>
                  <TableHead className="font-semibold">Verified?</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {inputsByContractorData.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Number and Date of Registration Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    5. Rate of Wages, DA and other cash benefits paid / to be paid to each category (i.e (a) Unskilled (b) Semi-Skilled (c) Skilled (d) Highly-Skilled etc.) of contract labour
                  </TableHead>
                </TableRow>

                {rateOfWagesDaData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Work, Overtime Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    6. Hours of Work, Overtime and Overtime Wages
                  </TableHead>
                </TableRow>

                {hoursOfWorkData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Other Condition of service Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    7. Other Condition of service like leave ( annual leave, casual leave,sick leave, maternity leave etc.) Holidays etc. of the contract labour
                  </TableHead>
                </TableRow>

                {otherConditionOfServiceData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Document Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    14. DOCUMENTS UPLOADED
                  </TableHead>
                </TableRow>

                {docData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>

                    <TableCell className="border-r flex items-center gap-2">
                      {/* <Dialog>
                        <DialogTrigger>Open</DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>File Preview</DialogTitle>
                            <DialogDescription>
                              Document preview functionality here.
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog> */}

                      {item.inputs} {item.icon1}
                    </TableCell>

                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Payment Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    15. PAYMENT DETAILS
                  </TableHead>
                </TableRow>

                {paymentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    {/* <TableCell>{item.verified}</TableCell> */}
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
        {applicationStatusType === "warning" || applicationStatusType === "info" ?
          <Card className="bg-amber-500 p-5">
            <p className="flex items-start gap-2 text-white">
              <IoMdWarning className="text-2xl" />
              <span>
                <strong>Current status: {applicationStatusMsg}</strong>
                <br />
                {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""}
              </span>
            </p>
          </Card> :
          applicationStatusType === "success" &&
          <Card className="bg-green-700 p-5">
            <p className="flex items-start gap-2 text-white">
              <MdDone className="text-2xl" />
              <span>
                <strong>Current status: {applicationStatusMsg}</strong>
                <br />
                {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""}
              </span>
            </p>
          </Card>}
      </div>

      {/* --------------------- ACTION & REMARK --------------------- */}
      {`${remarkData[0]?.remarkByUserId}` !== `${getUserId()}` &&
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
                      {getOptionText(label)}
                    </option>
                  ))}
                </select>
              </div>

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

              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 mt-2">Submit</button>
            </form>
          </Card>
        </div>
      }

      {/* --------------------- REMARK SUMMARY --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-black">
          <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
            <GrNotes /> <span>REMARK SUMMARY</span>
          </CardHeader>

          <Table className="border rounded-md text-black">
            <TableHeader className="bg-[#3C8DBC]">
              <TableRow>
                <TableHead className="text-white border-r">SL. NO.</TableHead>
                <TableHead className="text-white border-r">FORM-V / REF NO.</TableHead>
                <TableHead className="text-white border-r">REMARK</TableHead>
                <TableHead className="text-white border-r">DATE - TIME</TableHead>
                <TableHead className="text-white border-r">REMARK STATUS</TableHead>
                <TableHead className="text-white border-r">REMARK BY</TableHead>
                {/* <TableHead className="text-white">ACTION</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {remarkData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border-r">{item.id}</TableCell>
                  <TableCell className="border-r">{item.formv_refno}</TableCell>
                  <TableCell className="border-r">{item.remark}</TableCell>
                  <TableCell className="border-r">{item.datetime}</TableCell>
                  <TableCell className="border-r">{item.status}</TableCell>
                  <TableCell className="border-r">{item.remarkby}</TableCell>
                  {/* <TableCell>{item.act}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Submit Modal (Verify/Approve) */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Please confirm before submitting the action.
            </DialogDescription>
          </DialogHeader>

          {/* <div className="max-h-52 overflow-auto rounded border p-2 text-sm">
            {verifySubmitFields.size > 0 ? (
              <ul className="list-disc pl-5">
                {Array.from(verifySubmitFields).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No verified fields selected.</p>
            )}
          </div> */}

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
                  Are you confirm that Form-IV is uploaded correctly by the applicant and checked?
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
              onClick={async () => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
                await submitRemark(verifySubmitFields);
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

      {/* Fees Chart Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
            <h2 className="text-sm font-semibold uppercase">Fees Chart</h2>
          </div>

          {/* DESCRIPTION */}
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            If the Number of Migrant Workmen proposed to be employed in the establishment on any day
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

    </div>
  );
};

export default AlcViewLicense;
