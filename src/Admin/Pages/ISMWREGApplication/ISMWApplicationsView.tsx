import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdDocument, IoMdWarning } from "react-icons/io";
import { encryptionDecryptionFun } from "../../../utils/encryption";

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
} from "../../../Components/ui/dialog";

import { Card, CardHeader } from "../../../Components/ui/card";
import { Button } from "../../../Components/ui/button";
import { Checkbox } from "../../../Components/ui/checkbox";
import axios from "axios";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { Eye } from "lucide-react";
import { IoDownload, IoInformationCircle, IoRemove } from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, DOMAIN_NAME, IMAGE_BASE, AUTH_STORAGE_KEY } from "@/constants/constants";
import { mapWorkflowAction } from "@/utils/helper-functions/mapWorkflowAction";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../Components/ui/dialog";

// --------------------- Data Interfaces ---------------------

interface EmpData {
  id: string;
  name: string;
  licenseNo: string;
  status: string;
  appliedOn: string;
}

interface AppData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  verified: ReactElement;
}

interface DocData {
  id: string;
  parameters: string;
  inputs: string;
  icon1: ReactElement | string;
  // icon2: ReactElement | string;
  verified: ReactElement;
}

interface TradeData {
  id: string;
  reg: string;
  name: string;
  act: string;
}

interface PartData {
  id: string;
  contractor: string;
  contract: string;
  nature: string;
  status: ReactElement;
  act: ReactElement;
}

interface RemarkData {
  id: string;
  date: string;
  remark: string;
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


const ALL_VERIFIABLE_FIELDS = [
  "reg_details",
  "mtw_name",
  "mtw_loc_address",
  "mtw_nature",
  "total_routes",
  "total_route_milage",
  "total_mtw_vehicle",
  "mtw_maxworkers",

  // ownership dynamic
  // owner_id_${id}

  // documents
  "trade_license_file",
  "article_of_assoc_file",
  "form_one_asses_ses_file",
  "supp_asses_ses_file",
  "other_doc_file",
  "address_proof_file",
];


const tradeData: TradeData[] = [
  {
    id: "1",
    reg: "Trade License",
    name: "Alstom Transport India Limited",
    act: "rr",
  },
];

const partData: PartData[] = [
  {
    id: "1",
    contractor: "A.P. Securitas Private Limited",
    contract: "3",
    nature: "Manpower Services",
    status: (
      <Button className="bg-green-700 text-white">
        Active
      </Button>
    ),
    act: (
      <Button className="bg-blue-700 text-white">
        <FaInfo /> More
      </Button>
    ),
  },
];

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
  "U": "Application is sent back for rectification of Form-I. Kindly modify and re-upload Form-I.",
  "V": "Application is verified, applicant is allowed to pay the fees.",
  "VA": "Application is approved.",
  "R": "Application is rejected due to discrepancies.",
  "BI": "Application is sent back to Inspector.",
  "I": "Congratulations!! Certificate is issued.",
};

// --------------------- Main Component ---------------------

const ISMWApplicationsView = () => {
  const navigate = useNavigate();

  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicantUserId } = useParams<{ applicantUserId: string }>();
  const alcUserId = getUserId();

  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [applicationData, setApplicationData] = useState<any>();
  const [establishmentData, setEstablishmentData] = useState<any>();
  const [modalOpen, setModalOpen] = useState(false);

  const [distCode, setDistCode] = useState<string | number | null>();
  const [subDivCode, setSubDivCode] = useState<string | number | null>();
  const [distName, setDistName] = useState<string | null>();
  const [subDivName, setSubDivName] = useState<string | null>();
  const [areaTypeCode, setAreaTypeCode] = useState<string | null>();
  const [blockCode, setBlockCode] = useState<string | number | null>();
  const [blockName, setBlockName] = useState<string | null>();
  const [villageWardCode, setVillageWardCode] = useState<string | number | null>();
  const [villageWardName, setVillageWardName] = useState<string | null>();
  const [policeStationCode, setPoliceStationCode] = useState<string | null>();
  const [policeStationName, setPoliceStationName] = useState<string | null>();
  const [pinCode, setPinCode] = useState<string | number | null>();

  const [distCodePostal, setDistCodePostal] = useState<string | number | null>();
  const [subDivCodePostal, setSubDivCodePostal] = useState<string | number | null>();
  const [distNamePostal, setDistNamePostal] = useState<string | null>();
  const [subDivNamePostal, setSubDivNamePostal] = useState<string | null>();
  const [areaTypeCodePostal, setAreaTypeCodePostal] = useState<string | null>();
  const [blockCodePostal, setBlockCodePostal] = useState<string | number | null>();
  const [blockNamePostal, setBlockNamePostal] = useState<string | null>();
  const [villageWardCodePostal, setVillageWardCodePostal] = useState<string | number | null>();
  const [villageWardNamePostal, setVillageWardNamePostal] = useState<string | null>();
  const [policeStationCodePostal, setPoliceStationCodePostal] = useState<string | null>();
  const [policeStationNamePostal, setPoliceStationNamePostal] = useState<string | null>();
  const [pinCodePostal, setPinCodePostal] = useState<string | number | null>();

  const [tradeLicense, setTradeLicense] = useState<boolean>(false);
  const [aoamoa, setAoamoa] = useState<boolean>(false);
  const [factoryLicense, setFactoryLicense] = useState<boolean>(false);
  const [otherStateCertificate, setOtherStateCertificate] = useState<boolean>(false);
  const [supportingDocs, setSupportingDocs] = useState<boolean>(false);
  const [formI, setFormI] = useState<string | null>();
  const [previousCertificate, setPreviousCertificate] = useState<string | null>();

  const [applicationStatus, setApplicationStatus] = useState();
  const [applicationStatusType, setApplicationStatusType] = useState();
  const [applicationStatusMsg, setApplicationStatusMsg] = useState();
  const [registrationNo, setRegistrationNo] = useState();
  const [registrationDate, setRegistrationDate] = useState();
  const [qrCode, setQrCode] = useState();
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [remarkOptions, setRemarkOptions] = useState<Record<string, string>>({});
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();
  const [afterDeleteRemark, setAfterDeleteRemark] = useState<any>();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

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

  const enApplicationId = encryptionDecryptionFun("encrypt", String(applicationId)) ?? "";
  const safeApplicationId = encodeURIComponent(enApplicationId);

  const handleViewPdfDocuments = async (documentCode: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}documents`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            enapplicationId: safeApplicationId,
            documentCode,
            source: "D",
          },
        }
      );

      const { filecontent } = response.data;

      if (!filecontent) {
        alert("File not found");
        return;
      }

      const byteCharacters = atob(filecontent);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to open document");
    }
  };

  // ==============================
  // Add certificate click handler
  // ==============================
  const handleViewISMWregistrationCertificate = async () => {
    if (!qrCode) {
      alert("Certificate not available");
      return;
    }

    try {
      const encodedQr = encryptionDecryptionFun("encrypt", qrCode);

      const response = await axios.get(
        `${API_BASE}certificate/formII/ismw`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}")?.token
              }`,
          },
          params: {
            applicationId: safeApplicationId,
            userId: applicantUserId,
          },
          responseType: "blob",
        }
      );
      // Create blob directly from response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(blobUrl, "_blank");

    } catch (error: any) {
      console.error("Error fetching Certificate PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  const appData: AppData[] = [
    {
      id: "1.(a)",
      parameters: "Establishment Name",
      inputs:
        establishmentData?.name?.value ?? "",
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
      parameters: "Establishment Type",
      inputs:
        establishmentData?.type?.value ?? "",
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("est_type")}
          onCheckedChange={() => toggleVerifiedField("est_type")}
        />,
    },
    {
      id: "1.(c)",
      parameters: "Location of Establishment",
      inputs:
        <div>
          <p>{villageWardName}, {blockName},</p>
          <p>{subDivName}, PS - {policeStationName},</p>
          <p>{distName}, PIN - {pinCode}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("loc_e_name")}
          onCheckedChange={() => toggleVerifiedField("loc_e_name")}
        />,
    },
    {
      id: "2.",
      parameters: "Postal Address of the Establishment",
      inputs:
        <div>
          <p>{villageWardNamePostal}, {blockNamePostal},</p>
          <p>{subDivNamePostal}, PS - {policeStationNamePostal},</p>
          <p>{distNamePostal}, PIN - {pinCodePostal}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_postal_address")}
          onCheckedChange={() => toggleVerifiedField("e_postal_address")}
        />,
    },
    {
      id: "3.(a)",
      parameters:
        <div>
          <p>Name of the Principal Employer</p>
          <p>Contact Number</p>
        </div>,
      inputs:
        <div>
          <p>{applicationData?.principalEmployer?.name?.value}</p>
          <p>{applicationData?.principalEmployer?.contact?.value}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_name")}
          onCheckedChange={() => toggleVerifiedField("emp_name")}
        />,
    },
    {
      id: "3.(b)",
      parameters: "Gender of the Principal Employer",
      inputs:
        applicationData?.principalEmployer?.gender?.value,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_gender")}
          onCheckedChange={() => toggleVerifiedField("emp_gender")}
        />,
    },
    {
      id: "3.(c)",
      parameters: "Father/Husband name of the Principal Employer",
      inputs:
        applicationData?.principalEmployer?.guardianName?.value,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_guardian_name")}
          onCheckedChange={() => toggleVerifiedField("emp_guardian_name")}
        />,
    },
    {
      id: "3.(d)",
      parameters: "Address of the Principal Employer",
      inputs:
        applicationData?.principalEmployer?.address?.value,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_address")}
          onCheckedChange={() => toggleVerifiedField("emp_address")}
        />,
    },
    {
      id: "4.",
      parameters: "Director’s / Partner’s Information",
      inputs:
        <div className="flex gap-4">
          <p>Number of Director / Partner: {applicationData?.directors?.count}</p>
          <button className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1" onClick={() => { navigate(`/view-details/directorpartner-info/${applicationId}/DIRECTOR`) }}><Eye size={15} /> View Details</button>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_director_partner")}
          onCheckedChange={() => toggleVerifiedField("modify_director_partner")}
        />,
    },
    {
      id: "5.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Name(s) and Address(es) of the manager(s) or person(s) responsible for the supervision and control of the establishment
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>Number of Manager / Person Responsible: {applicationData?.managers?.count}</p>
          <button className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1" onClick={() => { navigate(`/view-details/directorpartner-info/${applicationId}/MANAGER`) }}><Eye size={15} /> View Details</button>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_manager")}
          onCheckedChange={() => toggleVerifiedField("modify_manager")}
        />,
    },
  ];

  const docData: DocData[] = [
    {
      id: "10.(a)",
      parameters: "Trade License",
      inputs: "",
      icon1:
        tradeLicense ?
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("TL")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: tradeLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.tradeLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("trade_license_file")}
          onCheckedChange={() => toggleVerifiedField("trade_license_file")}
        />,
    },
    {
      id: "10.(b)",
      parameters: "Articles of Association and Memorandum of Association/Partnership Deed",
      inputs: "",
      icon1:
        aoamoa ?
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("AMP")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: aoamoa ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.aoaMoa?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("article_of_assoc_file")}
          onCheckedChange={() => toggleVerifiedField("article_of_assoc_file")}
        />,
    },
    {
      id: "10.(c)",
      parameters: "Factory License",
      inputs: "",
      icon1:
        factoryLicense ?
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("FL")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: factoryLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.factoryLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("factory_license_file")}
          onCheckedChange={() => toggleVerifiedField("factory_license_file")}
        />,
    },
    {
      id: "10.(d)",
      parameters: "Certificate issued by Authorities from other state",
      inputs: "",
      icon1:
        otherStateCertificate ?
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("CIA")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: otherStateCertificate ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherStateCert?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("certificate_other_states")}
          onCheckedChange={() => toggleVerifiedField("certificate_other_states")}
        />,
    },
    {
      id: "10.(e)",
      parameters: "Documents substantiating correctness of particulars mentioned in the application",
      inputs: "",
      icon1:
        supportingDocs ?
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("DSC")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: supportingDocs ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.supportingDocs?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_related_documents")}
          onCheckedChange={() => toggleVerifiedField("other_related_documents")}
        />,
    },
    {
      id: "10.(f)",
      parameters: "FORM-I",
      inputs: "",
      icon1:
        formI === "AVAILABLE" || formI === "UPLOADED" || formI === "SUBMITTED" ? (
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("FI")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : formI === "PENDING_PAYMENT" ? (
          <p className="text-wrap wrap-break-word">
            FORM-I will be uploaded after fees payment
          </p>
        ) : (
          <p>No Document Uploaded</p>
        ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                  data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("signed_pdf_file")}
          onCheckedChange={() => toggleVerifiedField("signed_pdf_file")}
        />
      ),
    },
    {
      id: "10.(g)",
      parameters: "Previous Registration Certificate",
      inputs: "",
      icon1:
        previousCertificate === "AVAILABLE" ? (
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() => handleViewPdfDocuments("PRC")}
          >
            <FaRegNoteSticky className="text-yellow-500 text-2xl" />
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : previousCertificate === "NOT_APPLICABLE" ||
          previousCertificate === "NOT_AVAILABLE" ? (
          <p className="text-wrap wrap-break-word">
            For Previous Registered Applicant, this certificate should be uploaded
          </p>
        ) : (
          <p>No Document Uploaded</p>
        ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                  data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("backlog_certificate")}
          onCheckedChange={() => toggleVerifiedField("backlog_certificate")}
        />
      ),
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "11.(a)",
      parameters: "Total Fees",
      inputs:
        <div className="flex gap-3">
          <p>{applicationData?.paymentDetails.totalFees ?? ""}</p>
          <button className="flex gap-1 bg-blue-400 text-white rounded-sm px-2 py-1" onClick={() => setModalOpen(true)}><IoInformationCircle size={16} /> Fees Chart</button>
        </div>,
      verified: <input type="checkbox" />,
    },
    {
      id: "11.(b)",
      parameters: "Payment Details",
      inputs:
        <div>
          <p className="">GRIPS Payment [Online / Counter]</p>
          <p>{applicationData?.paymentDetails.paymentDetails.status ?? ""}</p>
        </div>,
      verified: <input type="checkbox" />,
    },
  ];

  const ismwRegCertificateData: AppData[] = [
    {
      id: "12.",
      parameters: "ISMW Registration Certificate",
      inputs: (
        <div className="flex gap-3 items-center">
          <button
            onClick={handleViewISMWregistrationCertificate}
            className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1"
          >
            <IoDownload />
            Signed ISMW Registration Certificate
          </button>

          <FaMagnifyingGlass
            className="text-2xl text-black cursor-pointer"
            onClick={handleViewISMWregistrationCertificate}
          />
        </div>
      ),
      verified: <input type="checkbox" />,
    },
  ];

  const establishmentRegCLRAData: AppData[] = [
    {
      id: "6.(a)",
      parameters: "Registration Number",
      inputs:
        !applicationData?.clra?.isAvailable ?
          <div className="flex gap-3">
            <p>{applicationData?.clra?.number?.value ?? ""}</p>
            <button className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1">Not Available in {DOMAIN_NAME}</button>
          </div> :
          <div className="flex gap-3">
            <p>{applicationData?.clra?.number?.value ?? ""}</p>
            <button
              className="bg-blue-800 text-white text-xs rounded-lg px-2 py-1"
              onClick={() => { navigate(`/alc-visible-applications/${applicationData?.clra?.applicationId}/${applicationData?.clra?.applicantUserId}`) }}
            >View More of Registration</button>
          </div>,
      // verified: applicationData?.clra?.number?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("clra_registration_number")}
          onCheckedChange={() => toggleVerifiedField("clra_registration_number")}
        />,
    },
    {
      id: "6.(b)",
      parameters: "Date of Registration",
      inputs:
        applicationData?.clra?.date?.value
          ? new Date(applicationData?.clra?.date?.value).toLocaleDateString()
          : "",
      // verified: applicationData?.clra?.date?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("clra_registration_date")}
          onCheckedChange={() => toggleVerifiedField("clra_registration_date")}
        />,
    },
    {
      id: "7.",
      parameters: "Nature of Work",
      inputs:
        (applicationData?.natureOfWork?.value ?? []).join(", "),
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("nature_of_work")}
          onCheckedChange={() => toggleVerifiedField("nature_of_work")}
        />,
    },
    {
      id: "8.",
      parameters: "Particulars of Contractors and Migrant Workmen",
      inputs:
        <div className="flex gap-4">
          <p>Number of Contractor / Person Responsible: {applicationData?.contractors?.count}</p>
          <button className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1" onClick={() => { navigate(`/view-details/directorpartner-info/${applicationId}/CONTRACTOR`) }}><Eye size={15} /> View Details</button>
        </div>,
      // verified: applicationData?.contractors.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("modify_contractors")}
          onCheckedChange={() => toggleVerifiedField("modify_contractors")}
        />,
    },
    {
      id: "9.",
      parameters:
        <div className="">
          <p className="text-wrap wrap-break-word">Maximum number of migrant workmen are to be employed on any day through each contractor</p>
        </div>,
      inputs:
        <div className="flex gap-2">
          <p>{applicationData?.maxMigrantWorkmen?.value ?? ""}</p>
          <p className="text-xs font-semibold text-green-800"> [ FEES IS CALCULATED BASED ON THIS VALUE ]</p>
        </div>,
      // verified: applicationData?.maxMigrantWorkmen?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("max_num_migrant_wrkmen")}
          onCheckedChange={() => toggleVerifiedField("max_num_migrant_wrkmen")}
        />,
    },
  ];

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

  const statusImageMap: Record<string, string> = {
    Approved: `${IMAGE_BASE}btn-approved.png`,
    Applied: `${IMAGE_BASE}btn-applied.png`,
    "Fees Paid": `${IMAGE_BASE}btn-fees-paid.png`,
    "Fees Pending": `${IMAGE_BASE}btn-fees-pending.png`,
    Pending: `${IMAGE_BASE}btn-applied.png`,
    "Final Submitted": `${IMAGE_BASE}btn-final-submit.png`,
    "Submitted": `${IMAGE_BASE}btn-final-submit.png`,
    Issued: `${IMAGE_BASE}btn-issued.png`,
    "Certificate Issued": `${IMAGE_BASE}btn-issued.png`,
    Rectification: `${IMAGE_BASE}btn-rectification.png`,
    Backed: `${IMAGE_BASE}btn-rectification.png`,
    "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
    "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
    Rejected: `${IMAGE_BASE}btn-reject.png`,
    Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
    "FORM-I Backed": `${IMAGE_BASE}btn-rectify-signed-form.png`,
  };

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


  const handleActionChange = (value: string) => {
    setAction(value);

    if (remarkRules[value]) {
      setRemark(remarkRules[value]);
    } else {
      setRemark("");
    }

    // ✅ AUTO CHECK LOGIC
    if (value === "V" || value === "VA") {

      const autoChecked = new Set<string>([
        // Establishment
        "e_name",
        "est_type",
        "loc_e_name",
        "e_postal_address",

        // Employer
        "emp_name",
        "emp_gender",
        "emp_guardian_name",
        "emp_address",

        // Others
        "modify_director_partner",
        "modify_manager",

        // CLRA
        "clra_registration_number",
        "clra_registration_date",

        // Work
        "nature_of_work",
        "modify_contractors",
        "max_num_migrant_wrkmen",

        // Documents
        "trade_license_file",
        "article_of_assoc_file",
        "factory_license_file",
        "certificate_other_states",
        "other_related_documents",
        "backlog_certificate",
      ]);

      setVerifiedFields(prev => new Set([...prev, ...autoChecked]));
    }

    if (value === "I") {
      setVerifiedFields((prev) => {
        const updated = new Set(prev);
        updated.add("signed_pdf_file"); // only FORM-I
        return updated;
      });
    }
  };

  const mapActionToBackend = (uiAction: string) => {
    switch (uiAction) {
      case "B":
      case "BI":
      case "V":
      case "R":
      case "I":   // ✅ ADD HERE
        return "WORKFLOW";

      default:
        return "ADD_REMARK";
    }
  };

  const applicationStatusDetailMsgMap = {
    "B": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "BI": "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "C": "Applicant is CALLED BY ALC",
    "I": "Certificate is issued. For any changes in the FORM-II(Certificate), Applicant can opt for Amendment of Registration Certificate. If you want to get back to the previous remark and re-upload FORM-II(Certificate), delete the current remark by clicking the delete option.",
    "F": "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    "T": "Payment successful for this application. Form-I is not uploaded by the applicant. After submission of signed FORM-I by the applicant, the application can be further accessible .",
    "V": "Application is approved and directed to pay fees. After fees payment and submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "R": "If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "VA": "Application is approved without fees. After submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    "S": "FORM-I is submitted by the Applicant. After verification of uploaded FORM-I, Issue of Registration Certificate can be generated now or back to rectification FORM-I.",
    "U": "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    "O": "Application is applied by the Applicant. Any action can be taken for the application.",
    "": "",
  };

  useEffect(() => {
    if (!applicationData || !establishmentData) return;

    const initialVerified = new Set<string>();

    // -------- Establishment --------
    if (establishmentData?.name?.verified)
      initialVerified.add("e_name");

    if (establishmentData?.type?.verified)
      initialVerified.add("est_type");

    if (establishmentData?.locationAddress?.verified)
      initialVerified.add("loc_e_name");

    if (establishmentData?.postalAddress?.verified)
      initialVerified.add("e_postal_address");

    // -------- Principal Employer --------
    if (applicationData?.principalEmployer?.name?.verified)
      initialVerified.add("emp_name");

    if (applicationData?.principalEmployer?.contact?.verified)
      initialVerified.add("emp_name"); // same checkbox (name + contact)

    if (applicationData?.principalEmployer?.gender?.verified)
      initialVerified.add("emp_gender");

    if (applicationData?.principalEmployer?.guardianName?.verified)
      initialVerified.add("emp_guardian_name");

    if (applicationData?.principalEmployer?.address?.verified)
      initialVerified.add("emp_address");

    // -------- Employer / People --------
    if (applicationData?.directors?.verified)
      initialVerified.add("modify_director_partner");

    if (applicationData?.managers?.verified)
      initialVerified.add("modify_manager");

    // -------- CLRA --------
    if (applicationData?.clra?.number?.verified)
      initialVerified.add("clra_registration_number");

    if (applicationData?.clra?.date?.verified)
      initialVerified.add("clra_registration_date");

    // -------- Contractors --------
    if (applicationData?.contractors?.verified)
      initialVerified.add("modify_contractors");

    if (applicationData?.maxMigrantWorkmen?.verified)
      initialVerified.add("max_num_migrant_wrkmen");

    // -------- Documents --------
    const docs = applicationData?.documentsSummary;

    if (docs?.tradeLicense?.verified)
      initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.verified)
      initialVerified.add("article_of_assoc_file");

    if (docs?.factoryLicense?.verified)
      initialVerified.add("factory_license_file");

    if (docs?.otherStateCert?.verified)
      initialVerified.add("certificate_other_states");

    if (docs?.supportingDocs?.verified)
      initialVerified.add("other_related_documents");

    if (docs?.formI?.verified)
      initialVerified.add("signed_pdf_file");

    if (docs?.previousCertificate?.verified)
      initialVerified.add("backlog_certificate");

    setVerifiedFields(initialVerified);
  }, [applicationData, establishmentData]);

  const handleFirstSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    // ================= VERIFY / APPROVE =================
    if (action === "V" || action === "VA") {

      const requiredFields = [
        // Establishment
        "e_name",
        "est_type",
        "loc_e_name",
        "e_postal_address",

        // Employer
        "emp_name",
        "emp_gender",
        "emp_guardian_name",
        "emp_address",

        // Others
        "modify_director_partner",
        "modify_manager",

        // CLRA
        "clra_registration_number",
        "clra_registration_date",

        // Work
        "nature_of_work",
        "modify_contractors",
        "max_num_migrant_wrkmen",

        // Documents
        "trade_license_file",
        "article_of_assoc_file",
        "factory_license_file",
        "certificate_other_states",
        "other_related_documents",
        "backlog_certificate",
      ];

      const missing = requiredFields.filter(f => !verifiedFields.has(f));

      if (missing.length > 0) {
        alert("Please verify ALL fields before proceeding.");
        return;
      }

      // open modal
      setShowSubmitModal(true);
      return;
    }

    // ================= ISSUE =================
    if (action === "I") {

      if (!verifiedFields.has("signed_pdf_file")) {
        alert("Please verify FORM-I before issuing.");
        return;
      }

      setShowSubmitModal(true);
      return;
    }

    // ================= OTHERS =================
    handleSubmit(e);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    const payload = {
      action: mapActionToBackend(action),
      comment: remark,
      workflowAction: mapWorkflowAction(action),
      verifiedFields:
        verifiedFields.size > 0 ? Array.from(verifiedFields) : null,
    };

    try {
      const res = await axios.post(
        `${API_BASE}ismw/${applicationId}/${applicantUserId}/remark`,
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

  const handleDeleteRemark = async (e: React.MouseEvent) => {
    e.preventDefault();

    const payload = {
      action: "DELETE_LAST_REMARK",
    };

    try {
      const res = await axios.post(
        `${API_BASE}ismw/${applicationId}/${applicantUserId}/remark`,
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
    const fetchAddressData = async () => {
      try {
        if (!distCode || distCode == null) return;

        const districtNameRes = await axios.get<any>(
          `${API_BASE}district/${distCode}`,
        );
        setDistName(districtNameRes?.data?.district_name);
        const subDivisionNameRes = await axios.get<any>(
          `${API_BASE}subdivision/${distCode}/${subDivCode}`,
        );
        setSubDivName(subDivisionNameRes?.data?.sub_div_name);
        const blockNameRes = await axios.get<any>(
          `${API_BASE}block/${distCode}/${subDivCode}/${areaTypeCode}/${blockCode}`,
        );
        setBlockName(blockNameRes?.data?.block_mun_name);
        const villageOrWardNameRes = await axios.get<any>(
          `${API_BASE}villageward/${blockCode}/${villageWardCode}`,
        );
        setVillageWardName(villageOrWardNameRes?.data?.village_name);
        const policeStationNameRes = await axios.get<any>(
          `${API_BASE}policestation/${distCode}/${policeStationCode}`,
        );
        setPoliceStationName(policeStationNameRes?.data?.name_of_police_station);

        if (!distCodePostal || distCodePostal == null) return;

        const districtNameResPostal = await axios.get<any>(
          `${API_BASE}district/${distCodePostal}`,
        );
        setDistNamePostal(districtNameResPostal?.data?.district_name);
        const subDivisionNameResPostal = await axios.get<any>(
          `${API_BASE}subdivision/${distCodePostal}/${subDivCodePostal}`,
        );
        setSubDivNamePostal(subDivisionNameResPostal?.data?.sub_div_name);
        const blockNameResPostal = await axios.get<any>(
          `${API_BASE}block/${distCodePostal}/${subDivCodePostal}/${areaTypeCodePostal}/${blockCodePostal}`,
        );
        setBlockNamePostal(blockNameResPostal?.data?.block_mun_name);
        const villageOrWardNameResPostal = await axios.get<any>(
          `${API_BASE}villageward/${blockCodePostal}/${villageWardCodePostal}`,
        );
        setVillageWardNamePostal(villageOrWardNameResPostal?.data?.village_name);
        const policeStationNameResPostal = await axios.get<any>(
          `${API_BASE}policestation/${distCodePostal}/${policeStationCodePostal}`,
        );
        setPoliceStationNamePostal(policeStationNameResPostal?.data?.name_of_police_station);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchAddressData();
  }, [distCode, distCodePostal, subDivCode, subDivCodePostal, areaTypeCode, areaTypeCodePostal, blockCode, blockCodePostal, villageWardCode, villageWardCodePostal, policeStationCode, policeStationCodePostal, pinCode, pinCodePostal])


  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const applicationRes = await axios.get<any>(
          `${API_BASE}ismw/applications/${applicationId}/${applicantUserId}/general-details`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        console.log("applicationRes", applicationRes);

        setApplicationData(applicationRes.data);
        setEstablishmentData(applicationRes.data.establishment);
        setDistCode(applicationRes.data.establishment.locationAddress?.value?.district);
        setSubDivCode(applicationRes.data.establishment.locationAddress?.value?.subdivision);
        setAreaTypeCode(applicationRes.data.establishment.locationAddress?.value?.areaType.toLowerCase());
        setBlockCode(applicationRes.data.establishment.locationAddress?.value?.areaTypeCode);
        setVillageWardCode(applicationRes.data.establishment.locationAddress?.value?.villageOrWard);
        setPoliceStationCode(applicationRes.data.establishment.locationAddress?.value?.policeStation);
        setPinCode(applicationRes.data.establishment.locationAddress?.value?.pinCode);

        setDistCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.district);
        setSubDivCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.subdivision);
        setAreaTypeCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.areaType?.toLowerCase());
        setBlockCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.areaTypeCode);
        setVillageWardCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.villageOrWard);
        setPoliceStationCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.policeStation);
        setPinCodePostal(applicationRes.data?.establishment?.postalAddress?.value?.pinCode);

        setTradeLicense(applicationRes.data.documentsSummary.tradeLicense?.available);
        setAoamoa(applicationRes.data.documentsSummary.aoaMoa?.available);
        setFactoryLicense(applicationRes.data.documentsSummary.factoryLicense?.available);
        setOtherStateCertificate(applicationRes.data.documentsSummary.otherStateCert?.available);
        setSupportingDocs(applicationRes.data.documentsSummary.supportingDocs?.available);
        setFormI(applicationRes.data.documentsSummary.formI?.status);
        setPreviousCertificate(applicationRes.data.documentsSummary.previousCertificate?.status);

        setApplicationStatus(applicationRes.data.applicationStatus.status);
        setApplicationStatusType(applicationRes.data.applicationStatus.statusType);
        setApplicationStatusMsg(applicationRes.data.applicationStatus.message);
        setRegistrationNo(applicationRes.data.applicationStatus.registrationNumber);
        setRegistrationDate(applicationRes.data.applicationStatus.registrationDate);
        setQrCode(applicationRes.data.applicationStatus.qrCode);
        setCertificateAvailable(applicationRes.data.applicationStatus.certificateAvailable ?? false);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchApplicationData();
  }, [afterSubmitRes, afterDeleteRemark])


  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        const remarkRes = await axios.get(
          `${API_BASE}ismw/${applicationId}/${applicantUserId}/get-remark`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        console.log("remarkRes", remarkRes);

        if (!remarkRes.data) {
          setRemarkData([]);
          return;
        }

        const remarkTableData: RemarkData[] = remarkRes?.data?.remarks.map((r: any) => ({
          id: String(r.slNo ?? ""),
          date: r.dateTime
            ? new Date(r.dateTime).toLocaleString()
            : "",
          remark: r.remark ?? "",
          status: renderStatusImage(r.remarkStatus) ?? <></>,
          remarkby: r.remarkBy ?? "",
          remarkByUserId: r.remarkByUserId ?? "",
          act: (
            <button
              disabled={!r.canDelete}
              onClick={handleDeleteRemark}
              className={`p-1 ${r.canDelete
                ? "text-red-600 hover:text-red-800"
                : "text-gray-400 cursor-not-allowed"
                }`}
            // title={r.canDelete ? "Delete Remark" : "Not Allowed"}
            >
              <MdDelete size={18} />
            </button>
          ),

        }));

        console.log("remarkTableData", remarkTableData);
        setRemarkData(remarkTableData);

      } catch (error) {
        console.error("API Error:", error);
        setRemarkData([]); // prevent stale UI
      }
    };

    fetchRemarkData();
  }, [afterSubmitRes, afterDeleteRemark]);


  useEffect(() => {
    const fetchRemarksInputDropdown = async () => {
      try {
        const remarkDropdownRes = await axios.get(
          `${API_BASE}ismw/${applicationId}/${applicantUserId}/actions`,
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
  }, [])



  return (
    <div className="min-h-[250px] mb-15">

      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">Application for Registration of Establishment Employing Migrant Workmen(ISMW)</h1>

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Application details</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r font-semibold">Sl. No.</TableHead>
                  <TableHead className="border-r font-semibold">Parameters</TableHead>
                  <TableHead className="border-r font-semibold">Inputs</TableHead>
                  <TableHead className="font-semibold">Verified?</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {appData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                {/* ----- Number and Date of Registration Section Title ----- */}
                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    6. Number and Date of Registration of the establishment Under the Contract Labour (R&A) Act,1970
                  </TableHead>
                </TableRow>

                {establishmentRegCLRAData.map((item) => (
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
                    10. DOCUMENTS UPLOAD
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
                    11. Payment Details
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

                {applicationStatus === "I" && ismwRegCertificateData.map((item) => (
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
      {`${remarkData[0]?.remarkByUserId}` !== `${getUserId()}` && applicationStatus !== "I" &&
        <div className="mt-5">
          <Card className="p-3 text-black">
            <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
              <GrNotes /> <span>ACTIONS AND REMARK</span>
            </CardHeader>

            <form className="m-auto w-full sm:w-2/3 lg:w-1/3 p-5" onSubmit={handleFirstSubmit}>
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
                <TableHead className="text-white border-r">Sl. No.</TableHead>
                <TableHead className="text-white border-r">Date</TableHead>
                <TableHead className="text-white border-r">Remark</TableHead>
                <TableHead className="text-white border-r">Status</TableHead>
                <TableHead className="text-white border-r">Remark By</TableHead>
                {/* <TableHead className="text-white">Action</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {remarkData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border-r">{item.id}</TableCell>
                  <TableCell className="border-r">{item.date}</TableCell>
                  <TableCell className="border-r">{item.remark}</TableCell>
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

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>

          <h2 className="text-lg font-semibold mb-2">Confirmation</h2>
          <p className="text-sm mb-4">
            I confirm that all required fields have been verified.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={confirmChecked}
              onCheckedChange={(v: any) => setConfirmChecked(!!v)}
            />
            <span>I confirm all fields are verified</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={!confirmChecked}
              className="bg-green-600 text-white"
              onClick={(e) => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
                handleSubmit(e as any);
              }}
            >
              Yes, Submit
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ISMWApplicationsView;
