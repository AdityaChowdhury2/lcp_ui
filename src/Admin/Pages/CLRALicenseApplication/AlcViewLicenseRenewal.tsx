import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import {
  FaRegNoteSticky,
  FaMagnifyingGlass,
  FaInfo,
  FaMagnifyingGlassPlus,
} from "react-icons/fa6";
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

import { Dialog, DialogContent } from "../../../Components/ui/dialog";

import { Card, CardHeader } from "../../../Components/ui/card";
import { Button } from "../../../Components/ui/button";
import { Checkbox } from "../../../Components/ui/checkbox";
import axios from "axios";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { Eye, EyeIcon } from "lucide-react";
import {
  IoDocument,
  IoDownload,
  IoInformationCircle,
  IoRemove,
} from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../Components/ui/accordion";
import { API_BASE, DOMAIN_NAME, IMAGE_BASE } from "@/constants/constants";
import { mapWorkflowAction } from "@/utils/helper-functions/mapWorkflowAction";
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
  {
    slNo: 7,
    description: "Exceeds 800 but does not exceed 1000",
    fee: "₹1000",
  },
  { slNo: 8, description: "Exceeds 1000", fee: "₹1500" },
];

// --------------------- Auto Fill Rules ---------------------

const remarkRules: Record<string, string> = {
  B: "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
  V: "Application is verified, applicant is allowed to pay the fees.",
  VA: "Application is approved.",
  R: "Application is rejected due to discrepancies.",
  BI: "Application is sent back to Inspector.",
};

// --------------------- Main Component ---------------------

const AlcViewLicenseRenewal = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const renewal_id_enc =
    searchParams.get("renewalId") || searchParams.get("renewal_id_enc") || "";
  const license_id_enc =
    searchParams.get("licenseId") || searchParams.get("license_id_enc") || "";
  const alcUserId = getUserId();

  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [applicationData, setApplicationData] = useState<any>();
  const [modalOpen, setModalOpen] = useState(false);

  const [tradeLicense, setTradeLicense] = useState<boolean>(false);
  const [aoamoa, setAoamoa] = useState<boolean>(false);
  const [factoryLicense, setFactoryLicense] = useState<boolean>(false);

  // const [applicationStatus, setApplicationStatus] = useState();
  // const [applicationStatusType, setApplicationStatusType] = useState();
  // const [applicationStatusMsg, setApplicationStatusMsg] = useState();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null,
  );
  const [applicationStatusType, setApplicationStatusType] = useState<
    string | null
  >(null);
  const [applicationStatusMsg, setApplicationStatusMsg] = useState<
    string | null
  >(null);
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();

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

  console.log("verifiedFelds", verifiedFields);

  const navigateToRegistrationDetails = () => {
    const targetApplicationId = encryptionDecryptionFun(
      "decrypt",
      String(applicationData?.data?.section1?.rows[2].clraPeAppId),
    );
    const targetApplicantUserId = encryptionDecryptionFun(
      "decrypt",
      String(applicationData?.data?.section1?.rows[2].clraPeUserId),
    );

    if (!targetApplicationId || !targetApplicantUserId) {
      alert("Registration reference not available.");
      return;
    }

    navigate(
      `/alc-visible-applications/${targetApplicationId}/${targetApplicantUserId}`,
    );
  };

  const handleDownloadLicense = async () => {
    if (!renewal_id_enc) return;
    try {
      const response = await axios.get(
        `${API_BASE}certificate/formVI/contractor-license`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            serialEnc: encodeURIComponent(
              applicationData?.data?.meta?.serial ?? "",
            ),
            renewalAmendIdEnc: encodeURIComponent(renewal_id_enc ?? ""),
            createdByEnc: encodeURIComponent(
              applicationData?.data?.meta?.createdBy ?? "",
            ),
            licenseIdEnc: encodeURIComponent(license_id_enc ?? ""),
            flagEnc: encryptionDecryptionFun("encrypt", "R"),
            contractorNameEnc: encodeURIComponent(
              applicationData?.data?.meta?.contractorName ?? "",
            ),
          },
          responseType: "blob",
        },
      );

      const blobUrl = window.URL.createObjectURL(response.data);

      // Open in new tab
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  };

  const handleViewPdfDocsLegacy = async (documentCode: string) => {
    if (!applicationData?.data?.meta?.serial) return;
    try {
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${encodeURIComponent(applicationData?.data?.meta?.serial ?? "")}&documentCode=${documentCode}&source=D`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("AUTH_STORAGE_KEY") || "{}")?.token}`,
          },
        },
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
    } catch (error: any) {
      console.error("Error fetching PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  const handleOpenPdfDocFileManaged = async (fid: string) => {
    try {
      const token = JSON.parse(
        localStorage.getItem("AUTH_STORAGE_KEY") || "{}",
      )?.token;

      const response = await fetch(`${API_BASE}documents/file-managed/${fid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to fetch document.");
    }
  };

  const estdData: AccordionData[] = [
    {
      id: "1.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Name and address of establishment
        </p>
      ),
      inputs: (
        <div className="whitespace-pre-line text-wrap break-words">
          {applicationData?.data?.section1?.rows[0]?.value}
        </div>
      ),
    },
    {
      id: "1.(b)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Type of business, trade,industry, manufacture or occupation, which is
          carried on in the establishment
        </p>
      ),
      inputs: (
        <div className="whitespace-pre-line text-wrap break-words">
          {applicationData?.data?.section1?.rows[1]?.value}
        </div>
      ),
    },
    {
      id: "1.(c)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Number and date of certificate
        </p>
      ),
      inputs: (
        <div>
          {applicationData?.data?.section1?.rows[2]?.value}
          <div className="flex flex-wrap gap-2">
            <button className="text-orange-500 hover:text-sky-700 flex gap-1 text-xs">
              Registration Certificate <FaMagnifyingGlass />
            </button>
            <button
              className="bg-sky-700 text-white flex gap-1 text-[0.7rem] rounded-lg px-1 font-semibold"
              onClick={navigateToRegistrationDetails}
            >
              <EyeIcon size={15} /> View More of Registration
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "1.(d)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Name and address of the Principal Employer
        </p>
      ),
      inputs: (
        <div className="whitespace-pre-line text-wrap break-words">
          {applicationData?.data?.section1?.rows[3]?.value}
        </div>
      ),
    },
  ];

  const contractorData: AccordionData[] = [
    {
      id: "2.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Name and address of Contractor
        </p>
      ),
      inputs: (
        <div className="whitespace-pre-line text-wrap break-words">
          {applicationData?.data?.section2?.rows[0]?.value}
        </div>
      ),
    },
    {
      id: "2.(b)",
      parameters: "Contractor Status",
      inputs: (
        <div className="flex gap-2">
          <p> {applicationData?.data?.section2?.rows[1]?.value?.text}</p>
          {applicationData?.data?.section2?.rows[1]?.value?.badge ===
            "Active" && (
            <button className="bg-green-700 rounded-lg px-2 py-1 flex gap-1 text-white font-semibold text-xs">
              {" "}
              <MdDone size={15} />
              Active
            </button>
          )}
        </div>
      ),
    },
    {
      id: "2.(c)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Nature of work in which contract labour is employed or is to be
          employed in the establishment
        </p>
      ),
      inputs: (
        <div className="whitespace-pre-line text-wrap break-words">
          {applicationData?.data?.section2?.rows[2]?.value}
        </div>
      ),
    },
    {
      id: "2.(d)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Duration of the proposed contract work (give particulars of proposed
          date of commencing and ending)
        </p>
      ),
      inputs: <div>{applicationData?.data?.section2?.rows[3]?.value}</div>,
    },
    {
      id: "2.(e)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Maximum number of contract labour proposed to be employed in the
          establishment on any date
        </p>
      ),
      inputs: (
        <div className="flex flex-wrap justify-between">
          <p>{applicationData?.data?.section2?.rows[4]?.value?.count}</p>
          <p className="text-green-800 text-xs font-semibold">
            [ {applicationData?.data?.section2?.rows[4]?.value?.note} ]
          </p>
        </div>
      ),
    },
  ];

  const licenseDetailsData1: AccordionData[] = [
    {
      id: "1.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Name and address of the Contractor
        </p>
      ),
      inputs: (
        <div>
          <p className="text-wrap wrap-break-word">
            {applicationData?.data?.section3?.left?.[0]?.value}
          </p>
        </div>
      ),
    },
    {
      id: "2.",
      parameters: "Co-operative Society",
      inputs: (
        <div className="flex gap-2">
          <p>{applicationData?.data?.section3?.left?.[1]?.value}</p>
          <button className="bg-green-700 rounded-lg px-2 py-1 flex gap-1 text-white font-semibold text-xs">
            <MdDone size={15} />
            Active
          </button>
        </div>
      ),
    },
    {
      id: "3.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          License Number and Date of Issue
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[2]?.value}</div>,
    },
    {
      id: "4.",
      parameters: <p className="text-wrap wrap-break-word">Date of expiry</p>,
      inputs: <div>{applicationData?.data?.section3?.left?.[3]?.value}</div>,
    },
    {
      id: "5.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Maximum no. of contract labour employed by the contractor on any day
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[4]?.value}</div>,
    },
    {
      id: "6.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Special benifits provided, if any
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[5]?.value}</div>,
    },
    {
      id: "7.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Contribution made under the Employees State Insurance Act,1984
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[6]?.value}</div>,
    },
    {
      id: "8.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether the license of the contractor was suspended or revoked
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[7]?.value}</div>,
    },
    {
      id: "9.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Conribution made under the Employees Provident Fund and Miscellaneous
          Provisions Act,1952
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.left?.[8]?.value}</div>,
    },
  ];

  const licenseDetailsData2: AccordionData[] = [
    {
      id: "10.",
      parameters: (
        <p className="text-wrap wrap-break-word font-semibold">
          Worksite Address <span className="text-red-600">**</span>
        </p>
      ),
      inputs: (
        <div>
          <p className="text-wrap wrap-break-word">
            {applicationData?.data?.section3?.right?.[0]?.value}
          </p>
        </div>
      ),
    },
    {
      id: "11.",
      parameters: "Daily hours of work and spread over",
      inputs: (
        <div className="flex gap-2">
          <p>{applicationData?.data?.section3?.right?.[1]?.value}</p>
          <button className="bg-green-700 rounded-lg px-2 py-1 flex gap-1 text-white font-semibold text-xs">
            <MdDone size={15} />
            Active
          </button>
        </div>
      ),
    },
    {
      id: "12.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether weekly holiday observed was on which day
        </p>
      ),
      inputs: (
        <div>{/* {applicationData?.data?.section3?.right?.[2]?.value} */}</div>
      ),
    },
    {
      id: "13.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether weekly holiday so observed was paid holiday
        </p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[3]?.value}</div>,
    },
    {
      id: "14.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Annual leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[4]?.value}</div>,
    },
    {
      id: "15.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Casual leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[5]?.value}</div>,
    },
    {
      id: "16.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Earned leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[6]?.value}</div>,
    },
    {
      id: "17.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Sick leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[7]?.value}</div>,
    },
    {
      id: "18.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Maternity leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[8]?.value}</div>,
    },
    {
      id: "19.",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of Other leave</p>
      ),
      inputs: <div>{applicationData?.data?.section3?.right?.[9]?.value}</div>,
    },
    {
      id: "20.",
      parameters: (
        <p className="text-wrap wrap-break-word">FORM-V / REF. NO.</p>
      ),
      inputs: (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocsLegacy("FV");
            }}
            className="text-amber-600"
          >
            <IoDocument size={20} />
          </button>
          <button>
            <FaMagnifyingGlassPlus size={18} />
          </button>
        </div>
      ),
    },
    {
      id: "21.",
      parameters: (
        <p className="text-wrap wrap-break-word">Previous Work Order</p>
      ),
      inputs: (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocsLegacy("WO");
            }}
            className="text-amber-600"
          >
            <IoDocument size={20} />
          </button>
          <button>
            <FaMagnifyingGlassPlus size={18} />
          </button>
        </div>
      ),
    },
    {
      id: "22.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Residential Certificate / Trade License
        </p>
      ),
      inputs: (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocsLegacy("AP");
            }}
            className="text-amber-600"
          >
            <IoDocument size={20} />
          </button>
          <button>
            <FaMagnifyingGlassPlus size={18} />
          </button>
        </div>
      ),
    },
    {
      id: "23.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Previous License / Renewal / Amendment Certificate
        </p>
      ),
      inputs: <div></div>,
    },
  ];

  const inputsByContractorData: AppData[] = [
    {
      id: "",
      parameters: "CAF Number",
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />
      ),
    },
    {
      id: "",
      parameters: (
        <p className="text-wrap wrap-break-word">Form V Serial Number</p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />
      ),
    },
    {
      id: "1.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Father s name of the contractor (including his father s name in case
          of individuals)
        </p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />
      ),
    },
    {
      id: "1.(b)",
      parameters: (
        <p className="text-wrap wrap-break-word">Address of the contractor</p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("est_type")}
          onCheckedChange={() => toggleVerifiedField("est_type")}
        />
      ),
    },
    {
      id: "2.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">Co-operative Society **</p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_postal_address")}
          onCheckedChange={() => toggleVerifiedField("e_postal_address")}
        />
      ),
    },
    {
      id: "2.(b)",
      parameters: <div> Date of Birth and age [in case of individuals] </div>,
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_name")}
          onCheckedChange={() => toggleVerifiedField("emp_name")}
        />
      ),
    },
    {
      id: "3.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Name of the agent or manager of contractor at the work site
        </p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_gender")}
          onCheckedChange={() => toggleVerifiedField("emp_gender")}
        />
      ),
    },
    {
      id: "3.(b)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Address of the agent or manager of contractor at the work site
        </p>
      ),
      inputs: <div></div>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_guardian_name")}
          onCheckedChange={() => toggleVerifiedField("emp_guardian_name")}
        />
      ),
    },
    {
      id: "4.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Category/designation/nomenclature of the contractor labour,
          namely,fitter,welder,carpenter,mazdor etc.
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
  ];

  const rateOfWagesDaData: AppData[] = [
    {
      id: "1.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Rate of wages,DA and Other cash benefits paid/ to be paid to Unskilled
          of contract labour:
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p> {applicationData?.data?.section4?.wages[0]?.value}</p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "1.(b)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Rate of wages,DA and Other cash benefits paid/ to be paid to
          Semi-skilled of contract labour:
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p> {applicationData?.data?.section4?.wages[1]?.value}</p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "1.(c)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Rate of Wages,DA and Other cash benefits paid/ to be paid to Skilled
          of contract labour:
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.data?.section4?.wages[2]?.value}</p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "1.(d)",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Rate of Wages,DA and Other cash benefits paid/ to be paid to
          Highly-skilled of contract labour:
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p> {applicationData?.data?.section4?.wages[3]?.value}</p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
  ];

  const hoursOfWorkData: AppData[] = [
    {
      id: "6.(a)",
      parameters: "Hours of Work",
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "6.(b)",
      parameters: "Overtime",
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "6.(c)",
      parameters: "Overtime Wages",
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
  ];

  const otherConditionOfServiceData: AppData[] = [
    {
      id: "7.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of annual leave</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "7.(b)",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of casual leave</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "7.(c)",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of sick leave</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "7.(d)",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of maternity leave</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "7.(e)",
      parameters: (
        <p className="text-wrap wrap-break-word">Number of other leave</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "7.(f)",
      parameters: "Holiday(s)",
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "8.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether the contractor was convicted of any offence within the
          preceeding five years. If so, give details
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "9",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether there was any order against the contract or revoking or
          suspending license or forfeiting security deposit in respect of an
          earlier contract. If so, the date of such order.
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "10.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether the contractor has worked in any other establishment within
          the past five years. If so. give details of the principal employer,
          establishment and nature of work
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "11.",
      parameters: (
        <p className="text-wrap wrap-break-word">Work Site Address ** </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "12.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Whether a certificate by the principal employer in FORM-V is enclosed
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
    {
      id: "13.",
      parameters: (
        <p className="text-wrap wrap-break-word">
          Maximum number of contract labour proposed to be employed in the
          establishment on any date
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>Number of Director / Partner: </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />
      ),
    },
  ];

  const docData: DocData[] = [
    {
      id: "i)",
      parameters: "Extended Work Order",
      inputs: "",
      icon1: applicationData?.data?.section4?.documents[0]?.fid ? (
        <button
          onClick={() =>
            handleOpenPdfDocFileManaged(
              String(applicationData?.data?.section4?.documents[0]?.fid),
            )
          }
          className="flex gap-1 text-amber-600"
        >
          <IoDocument size={20} />
          <FaMagnifyingGlass className="text-2xl text-black" />
        </button>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: aoamoa ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.aoaMoa?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("article_of_assoc_file")}
          onCheckedChange={() => toggleVerifiedField("article_of_assoc_file")}
        />
      ),
    },
    {
      id: "ii)",
      parameters: <p className="text-wrap wrap-break-word">FORM-VII</p>,
      inputs: "",
      icon1: applicationData?.data?.section4?.documents[1]?.fid ? (
        <button
          onClick={() =>
            handleOpenPdfDocFileManaged(
              String(applicationData?.data?.section4?.documents[1]?.fid),
            )
          }
          className="flex gap-1 text-amber-600"
        >
          <IoDocument size={20} />
          <FaMagnifyingGlass className="text-2xl text-black" />
        </button>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: factoryLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.factoryLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("factory_license_file")}
          onCheckedChange={() => toggleVerifiedField("factory_license_file")}
        />
      ),
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "3.(a)",
      parameters: (
        <p className="text-wrap wrap-break-word text-red-500">
          Note: Provided that if the application for renewal is not received
          with in the time specified in R29(2)[Amendment on 27th Nov. 2015], a
          fee of 25%, in excess of the fee ordinarily payable for the licence
          shall be payable for such renewal : Provided further that in case
          where the licensing officer is satisfied that the delay in submission
          of the application is due to unavoidable circumstances beyond the
          control of the contractor, he may reduce or remit as he thinks fit the
          payment of such excess fee [ see R29 (3) ]
        </p>
      ),
      inputs: <></>,
      verified: (
        <>
          <Checkbox
            className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
            checked={verifiedFields.has("factory_license_file")}
            onCheckedChange={() => toggleVerifiedField("factory_license_file")}
          />
          <p className="text-wrap wrap-break-word text-red-500 pr-2">
            Must select for 25% additional fees
          </p>{" "}
        </>
      ),
    },
    {
      id: "3.(b)",
      parameters: "Renewal Fees",
      inputs: (
        <div className="flex gap-3">
          <p>
            {applicationData?.data?.section4?.paymentDetails?.renewalFees
              ?.amount ?? ""}
          </p>
          <p className="text-wrap wrap-break-word text-red-500">
            [ including 25% extra ]
          </p>
          <button
            className="flex gap-1 bg-sky-500 text-white rounded-sm px-2 py-1"
            onClick={() => setModalOpen(true)}
          >
            <IoInformationCircle size={15} /> Fees Chart
          </button>
        </div>
      ),
      verified: <></>,
    },
    {
      id: "3.(c)",
      parameters: "Payment Details",
      inputs: (
        <>
          {applicationData?.data?.section4?.paymentDetails?.payment?.status ===
          "Success" ? (
            <div>
              <p className="">GRIPS Payment [Online / Counter]</p>
              <p>
                Transaction Id:{" "}
                {applicationData?.data?.section4?.paymentDetails?.payment
                  ?.transactionId ?? ""}
              </p>
              <p>
                Amount:{" "}
                {applicationData?.data?.section4?.paymentDetails?.payment
                  ?.amount ?? ""}
              </p>
              <p>
                Bank Name:{" "}
                {applicationData?.data?.section4?.paymentDetails?.payment
                  ?.bank ?? ""}
              </p>
              <p>
                Status:{" "}
                {applicationData?.data?.section4?.paymentDetails?.payment
                  ?.status ?? ""}
              </p>
              <p>
                Date:{" "}
                {applicationData?.data?.section4?.paymentDetails?.payment
                  ?.date ?? ""}
              </p>
            </div>
          ) : (
            <p>Not Available</p>
          )}
        </>
      ),
      verified: <></>,
    },
  ];

  const renewalCertificateData: AppData[] = [
    {
      id: "iii)",
      parameters: "Renewal Certificate",
      inputs: (
        <div className="flex gap-2">
          <button
            className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1"
            onClick={handleDownloadLicense}
          >
            <IoDownload /> Auto-Generated Renewal Certificate
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ),
      verified: <></>,
    },
  ];

  const establishmentRegCLRAData: AppData[] = [
    {
      id: "6.(a)",
      parameters: "Registration Number",
      inputs: !applicationData?.clra?.isAvailable ? (
        <div className="flex gap-3">
          <p></p>
          <button className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1">
            Not Available in {DOMAIN_NAME}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <p></p>
          <button
            className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1"
            onClick={navigateToRegistrationDetails}
          >
            View More of Registration
          </button>
        </div>
      ),
      // verified: applicationData?.clra?.number?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("clra_registration_number")}
          onCheckedChange={() =>
            toggleVerifiedField("clra_registration_number")
          }
        />
      ),
    },
    {
      id: "6.(b)",
      parameters: "Date of Registration",
      inputs: "",
      // verified: applicationData?.clra?.date?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("clra_registration_date")}
          onCheckedChange={() => toggleVerifiedField("clra_registration_date")}
        />
      ),
    },
    {
      id: "7.",
      parameters: "Nature of Work",
      inputs: "",
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("nature_of_work")}
          onCheckedChange={() => toggleVerifiedField("nature_of_work")}
        />
      ),
    },
    {
      id: "8.",
      parameters: "Particulars of Contractors and Migrant Workmen",
      inputs: (
        <div className="flex gap-4">
          <p>Number of Contractor / Person Responsible: </p>
        </div>
      ),
      // verified: applicationData?.contractors.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_contractors")}
          onCheckedChange={() => toggleVerifiedField("modify_contractors")}
        />
      ),
    },
    {
      id: "9.",
      parameters: (
        <div className="">
          <p className="text-wrap wrap-break-word">
            Maximum number of migrant workmen are to be employed on any day
            through each contractor
          </p>
        </div>
      ),
      inputs: (
        <div className="flex gap-2">
          <p>{""}</p>
          <p className="text-xs font-semibold text-green-800">
            {" "}
            [ FEES IS CALCULATED BASED ON THIS VALUE ]
          </p>
        </div>
      ),
      // verified: applicationData?.maxMigrantWorkmen?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("max_num_migrant_wrkmen")}
          onCheckedChange={() => toggleVerifiedField("max_num_migrant_wrkmen")}
        />
      ),
    },
  ];

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
    Backed: `${IMAGE_BASE}btn-rectification.png`,
    "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
    "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
    Rejected: `${IMAGE_BASE}btn-reject.png`,
    Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
  };

  const renderStatusImage = (status: string): ReactElement | null => {
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

  const handleActionChange = (value: string) => {
    setAction(value);

    if (remarkRules[value]) {
      setRemark(remarkRules[value]);
    } else {
      setRemark("");
    }
  };

  // useEffect(() => {
  //   if (!applicationData || !establishmentData) return;

  //   const initialVerified = new Set<string>();

  //   // -------- Establishment --------
  //   if (establishmentData?.name?.verified)
  //     initialVerified.add("e_name");

  //   if (establishmentData?.type?.verified)
  //     initialVerified.add("est_type");

  //   if (establishmentData?.locationAddress?.verified)
  //     initialVerified.add("loc_e_name");

  //   if (establishmentData?.postalAddress?.verified)
  //     initialVerified.add("e_postal_address");

  //   // -------- Employer / People --------
  //   if (applicationData?.directors?.verified)
  //     initialVerified.add("modify_director_partner");

  //   if (applicationData?.managers?.verified)
  //     initialVerified.add("modify_manager");

  //   // -------- CLRA --------
  //   if (applicationData?.clra?.number?.verified)
  //     initialVerified.add("clra_registration_number");

  //   if (applicationData?.clra?.date?.verified)
  //     initialVerified.add("clra_registration_date");

  //   // -------- Contractors --------
  //   if (applicationData?.contractors?.verified)
  //     initialVerified.add("modify_contractors");

  //   if (applicationData?.maxMigrantWorkmen?.verified)
  //     initialVerified.add("max_num_migrant_wrkmen");

  //   // -------- Documents --------
  //   const docs = applicationData?.documentsSummary;

  //   if (docs?.tradeLicense?.verified)
  //     initialVerified.add("trade_license_file");

  //   if (docs?.aoaMoa?.verified)
  //     initialVerified.add("article_of_assoc_file");

  //   if (docs?.factoryLicense?.verified)
  //     initialVerified.add("factory_license_file");

  //   if (docs?.otherStateCert?.verified)
  //     initialVerified.add("certificate_other_states");

  //   if (docs?.supportingDocs?.verified)
  //     initialVerified.add("other_related_documents");

  //   if (docs?.formI?.verified)
  //     initialVerified.add("signed_pdf_file");

  //   if (docs?.previousCertificate?.verified)
  //     initialVerified.add("backlog_certificate");

  //   setVerifiedFields(initialVerified);
  // }, [applicationData, establishmentData]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!action || !remark.trim()) {
  //     alert("Action and remark are required");
  //     return;
  //   }

  //   const payload = {
  //     action: mapActionToBackend(action),
  //     comment: remark,
  //     workflowAction: mapWorkflowAction(action),
  //     verifiedFields:
  //       verifiedFields.size > 0 ? Array.from(verifiedFields) : null,
  //   };

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}ismw/ismw/${renewal_id_enc}/1094/remark`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${getAuthToken()}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Remark submitted:", res.data);
  //     setAfterSubmitRes(res.data);

  //     // Refresh remark list after submit
  //     setRemark("");
  //     setAction("");
  //     setVerifiedFields(new Set());

  //     alert("Action submitted successfully");
  //   } catch (error) {
  //     console.error("Submit failed", error);
  //     alert("Failed to submit remark");
  //   }
  // };

  // const handleDeleteRemark = async (e: React.MouseEvent) => {
  //   e.preventDefault();

  //   const payload = {
  //     action: "DELETE_LAST_REMARK",
  //   };

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}ismw/ismw/${renewal_id_enc}/1094/remark`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${getAuthToken()}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Remark deleted:", res.data);
  //     setAfterDeleteRemark(res.data);

  //     alert("Remark Deleted Successfully");
  //   } catch (error) {
  //     console.error("remark delete failed", error);
  //     alert("Failed to delete remark");
  //   }
  // }

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const applicationRes = await axios.get<any>(
          `${API_BASE}contractor-license/alc/renewal/general-details`,
          {
            params: {
              renewalId: renewal_id_enc,
              licenseId: license_id_enc,
            },
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );
        setApplicationStatusType(applicationRes.data?.data?.statusBanner?.type);
        setApplicationStatusMsg(applicationRes.data?.data?.statusBanner?.title);
        setApplicationStatus(applicationRes.data?.data?.statusBanner?.message);

        setApplicationData(applicationRes.data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    fetchApplicationData();
  }, [afterSubmitRes]);

  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        const remarkRes = await axios.get(
          `${API_BASE}contractor-license/alc/renewal/remarks`,
          {
            params: {
              renewalId: renewal_id_enc,
              licenseId: license_id_enc,
            },
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );

        if (!remarkRes.data.data) {
          setRemarkData([]);
          return;
        }

        const remarkTableData: RemarkData[] = remarkRes?.data?.data?.map(
          (r: any) => ({
            id: String(r.slNo ?? ""),
            formv_refno: String(r.formV ?? ""),
            datetime: r.remarkDate
              ? new Date(r.remarkDate).toLocaleString()
              : "",
            remark: r.remarkText ?? "",
            status: renderStatusImage(r.status) ?? <></>,
            remarkby: r.remarkBy ?? "",
            act: (
              <button
                disabled={!r.canDelete}
                onClick={() => {}}
                className={`p-1 ${
                  r.canDelete
                    ? "text-red-600 hover:text-red-800"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                // title={r.canDelete ? "Delete Remark" : "Not Allowed"}
              >
                <MdDelete size={18} />
              </button>
            ),
          }),
        );

        setRemarkData(remarkTableData);
      } catch (error) {
        console.error("API Error:", error);
        setRemarkData([]); // prevent stale UI
      }
    };

    fetchRemarkData();
  }, [afterSubmitRes]);

  // useEffect(() => {
  //   const fetchRemarksInputDropdown = async () => {
  //     try {
  //       const remarkDropdownRes = await axios.get(
  //         `${API_BASE}ismw/${renewal_id_enc}/1094/actions`,
  //         // `http://192.168.29.56:3000/clra/3424/4147/alc/actions`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${getAuthToken()}`,
  //           },
  //         }
  //       );

  //       const data = remarkDropdownRes?.data;
  //       setRemarkOptions(data);

  //     } catch (error) {
  //       console.error("API Error:", error);
  //       setRemarkOptions({});
  //     }
  //   }
  //   fetchRemarksInputDropdown();
  // }, [])

  return (
    <div className="min-h-[250px] mb-15">
      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">
        Application of Renewal of Contractor License
      </h1>

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
                      <TableHead className="border-r w-[320px]">
                        Parameters
                      </TableHead>
                      <TableHead className="border-r">Inputs</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {estdData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="border-r">{item.id}</TableCell>
                        <TableCell className="border-r">
                          {item.parameters}
                        </TableCell>
                        <TableCell className="border-r">
                          {item.inputs}
                        </TableCell>
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
                      <TableHead className="border-r w-[320px]">
                        Parameters
                      </TableHead>
                      <TableHead className="border-r">Inputs</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {contractorData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="border-r">{item.id}</TableCell>
                        <TableCell className="border-r">
                          {item.parameters}
                        </TableCell>
                        <TableCell className="border-r">
                          {item.inputs}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* --------------------- LICENSE DETAILS ------------------ */}
      <div className="mt-5">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-2">
            <AccordionTrigger className="bg-sky-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              3. License Details Provided by Contractor [ Verified ]
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap justify-between">
                <div className="p-3 rounded-none lg:w-1/2 md:w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">
                          Sl
                        </TableHead>
                        <TableHead className="border-r font-semibold">
                          Parameters
                        </TableHead>
                        <TableHead className="border-r font-semibold">
                          Inputs
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {licenseDetailsData1.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r w-20">
                            {item.id}
                          </TableCell>
                          <TableCell className="border-r">
                            {item.parameters}
                          </TableCell>
                          <TableCell className="border-r">
                            {item.inputs}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-3 rounded-none lg:w-1/2 md:w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">
                          Sl
                        </TableHead>
                        <TableHead className="border-r font-semibold">
                          Parameters
                        </TableHead>
                        <TableHead className="border-r font-semibold">
                          Inputs
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {licenseDetailsData2.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r w-20">
                            {item.id}
                          </TableCell>
                          <TableCell className="border-r">
                            {item.parameters}
                          </TableCell>
                          <TableCell className="border-r">
                            {item.inputs}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            4. Inputs are provided by Contractor for Renewal [For Verification]
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r font-semibold">Sl.</TableHead>
                  <TableHead className="border-r font-semibold">
                    Parameters
                  </TableHead>
                  <TableHead className="border-r font-semibold">
                    Inputs
                  </TableHead>
                  <TableHead className="font-semibold">Verified?</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    1. Rate of Wages, DA and other cash benefits paid / to be
                    paid to each category (i.e (a) Unskilled (b) Semi-Skilled
                    (c) Skilled (d) Highly-Skilled etc.) of contract labour{" "}
                  </TableHead>
                </TableRow>

                {rateOfWagesDaData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">
                      {item.parameters}
                    </TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Document Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    2. Documents Uploaded
                  </TableHead>
                </TableRow>

                {docData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">
                      {item.parameters}
                    </TableCell>

                    <TableCell className="border-r flex items-center gap-2">
                      {item.inputs} {item.icon1}
                    </TableCell>

                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {applicationData?.data?.meta?.status === "I" &&
                  renewalCertificateData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="border-r">{item.id}</TableCell>
                      <TableCell className="border-r">
                        {item.parameters}
                      </TableCell>
                      <TableCell className="border-r flex items-center gap-2">
                        {item.inputs}
                      </TableCell>
                      {/* <TableCell>{item.verified}</TableCell> */}
                    </TableRow>
                  ))}

                {/* ----- Payment Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    3. Payment Details
                  </TableHead>
                </TableRow>

                {paymentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell
                      className="border-r"
                      colSpan={item.id === "3.(a)" ? 2 : 1}
                    >
                      {item.parameters}
                    </TableCell>
                    {!(item.id === "3.(a)") && (
                      <TableCell className="border-r">{item.inputs}</TableCell>
                    )}
                    <TableCell>{item.verified}</TableCell>
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
            <Button
              className="w-full bg-sky-600 text-white"
              disabled
              onClick={() => {
                navigate("/view-applicant-profile");
              }}
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
            <Button
              className="w-full bg-sky-600 text-white"
              onClick={() => {
                navigate("/digitally-sign-process");
              }}
            >
              <MdQuestionMark /> How to digitally sign using USB token
            </Button>
          </div>
        </div>
      </div>

      {/* --------------------- CURRENT STATUS --------------------- */}
      <div className="mt-5">
        {applicationStatusType === "warning" ||
        applicationStatusType === "info" ? (
          <Card className="bg-amber-500 p-5">
            <p className="flex items-start gap-2 text-white">
              <IoMdWarning className="text-2xl" />
              <span>
                {/* <strong>Current status: {applicationStatusMsg}</strong> */}
                <strong>
                  Current status:{" "}
                  {applicationStatusMsg
                    ?.toLowerCase()
                    .includes("current status") &&
                    applicationStatusMsg?.split(":")[1]}
                </strong>
                <br />
                {/* {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""} */}
                {applicationStatus}
              </span>
            </p>
          </Card>
        ) : (
          applicationStatusType === "success" && (
            <Card className="bg-green-700 p-5">
              <p className="flex items-start gap-2 text-white">
                <MdDone className="text-2xl" />
                <span>
                  <strong>
                    Current status:{" "}
                    {applicationStatusMsg
                      ?.toLowerCase()
                      .includes("current status") &&
                      applicationStatusMsg?.split(":")[1]}
                  </strong>
                  <br />
                  {/* {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""} */}
                  {applicationStatus}
                </span>
              </p>
            </Card>
          )
        )}
      </div>

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
                <TableHead className="text-white border-r">
                  FORM-V / REF NO.
                </TableHead>
                <TableHead className="text-white border-r">REMARK</TableHead>
                <TableHead className="text-white border-r">
                  DATE - TIME
                </TableHead>
                <TableHead className="text-white border-r">
                  REMARK STATUS
                </TableHead>
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

      {/* Fees Chart Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
            <h2 className="text-sm font-semibold uppercase">Fees Chart</h2>
          </div>

          {/* DESCRIPTION */}
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            If the Number of Migrant Workmen proposed to be employed in the
            establishment on any day
          </div>

          {/* TABLE */}
          <div className="px-4 py-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#3f8fbf] hover:bg-[#3f8fbf]">
                  <TableHead className="text-white w-[100px]">SL.NO.</TableHead>
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

export default AlcViewLicenseRenewal;
