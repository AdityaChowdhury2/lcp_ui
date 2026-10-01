import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdDocument, IoMdWarning } from "react-icons/io";

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
import { IoDownload, IoInformationCircle, IoRemove } from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, AUTH_STORAGE_KEY, IMAGE_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { generateBocwaFormIPdfTemplate } from "./BocwaPdfTemplates";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../Components/ui/dialog";

// --------------------- Data Interfaces ---------------------

interface AppData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  verified: ReactElement;
}

interface DocData {
  id: string;
  parameters: string | ReactElement;
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
    status: <Button className="bg-green-700 text-white">Active</Button>,
    act: (
      <Button className="bg-blue-700 text-white">
        <FaInfo /> More
      </Button>
    ),
  },
];

const feeData: FeeRow[] = [
  { slNo: 1, description: "Is upto 100", fee: "₹500.00" },
  {
    slNo: 2,
    description: "Exceeds 100 but does not exceed 500",
    fee: "₹2000.00",
  },
  { slNo: 3, description: "Exceeds 500", fee: "₹10000.00" },
];

// --------------------- Auto Fill Rules ---------------------

const remarkRules: Record<string, string> = {
  B: "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
  U: "Application is sent back for rectification of Form-I. Kindly modify and re-upload Form-I.",
  V: "Application is verified, applicant is allowed to pay the fees.",
  VA: "Application is approved.",
  R: "Application is rejected due to discrepancies.",
  BI: "Application is sent back to Inspector.",
  I: "Congratulations!! Certificate is issued.",
};

// --------------------- Main Component ---------------------

const AlcReceivedApplicationsBOCWA = () => {
  const navigate = useNavigate();

  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicantUserId } = useParams<{ applicantUserId: string }>();
  const alcUserId = getUserId();
  const enApplicationId =
    encryptionDecryptionFun("encrypt", String(applicationId)) ?? "";
  const safeApplicationId = encodeURIComponent(enApplicationId);

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
  const [villageWardCode, setVillageWardCode] = useState<
    string | number | null
  >();
  const [villageWardName, setVillageWardName] = useState<string | null>();
  const [policeStationCode, setPoliceStationCode] = useState<string | null>();
  const [policeStationName, setPoliceStationName] = useState<string | null>();
  const [pinCode, setPinCode] = useState<string | number | null>();

  const [distCodePostal, setDistCodePostal] = useState<
    string | number | null
  >();
  const [subDivCodePostal, setSubDivCodePostal] = useState<
    string | number | null
  >();
  const [distNamePostal, setDistNamePostal] = useState<string | null>();
  const [subDivNamePostal, setSubDivNamePostal] = useState<string | null>();
  const [areaTypeCodePostal, setAreaTypeCodePostal] = useState<string | null>();
  const [blockCodePostal, setBlockCodePostal] = useState<
    string | number | null
  >();
  const [blockNamePostal, setBlockNamePostal] = useState<string | null>();
  const [villageWardCodePostal, setVillageWardCodePostal] = useState<
    string | number | null
  >();
  const [villageWardNamePostal, setVillageWardNamePostal] = useState<
    string | null
  >();
  const [policeStationCodePostal, setPoliceStationCodePostal] = useState<
    string | null
  >();
  const [policeStationNamePostal, setPoliceStationNamePostal] = useState<
    string | null
  >();
  const [pinCodePostal, setPinCodePostal] = useState<string | number | null>();

  const [distCodePermanent, setDistCodePermanent] = useState<
    string | number | null
  >();
  const [subDivCodePermanent, setSubDivCodePermanent] = useState<
    string | number | null
  >();
  const [distNamePermanent, setDistNamePermanent] = useState<string | null>();
  const [subDivNamePermanent, setSubDivNamePermanent] = useState<
    string | null
  >();
  const [areaTypeCodePermanent, setAreaTypeCodePermanent] = useState<
    string | null
  >();
  const [blockCodePermanent, setBlockCodePermanent] = useState<
    string | number | null
  >();
  const [blockNamePermanent, setBlockNamePermanent] = useState<string | null>();
  const [villageWardCodePermanent, setVillageWardCodePermanent] = useState<
    string | number | null
  >();
  const [villageWardNamePermanent, setVillageWardNamePermanent] = useState<
    string | null
  >();
  const [policeStationCodePermanent, setPoliceStationCodePermanent] = useState<
    string | null
  >();
  const [policeStationNamePermanent, setPoliceStationNamePermanent] = useState<
    string | null
  >();
  const [pinCodePermanent, setPinCodePermanent] = useState<
    string | number | null
  >();

  const [distCodeManager, setDistCodeManager] = useState<
    string | number | null
  >();
  const [subDivCodeManager, setSubDivCodeManager] = useState<
    string | number | null
  >();
  const [distNameManager, setDistNameManager] = useState<string | null>();
  const [subDivNameManager, setSubDivNameManager] = useState<string | null>();
  const [areaTypeCodeManager, setAreaTypeCodeManager] = useState<
    string | null
  >();
  const [blockCodeManager, setBlockCodeManager] = useState<
    string | number | null
  >();
  const [blockNameManager, setBlockNameManager] = useState<string | null>();
  const [villageWardCodeManager, setVillageWardCodeManager] = useState<
    string | number | null
  >();
  const [villageWardNameManager, setVillageWardNameManager] = useState<
    string | null
  >();
  const [policeStationCodeManager, setPoliceStationCodeManager] = useState<
    string | null
  >();
  const [policeStationNameManager, setPoliceStationNameManager] = useState<
    string | null
  >();
  const [pinCodeManager, setPinCodeManager] = useState<
    string | number | null
  >();

  const [tradeLicense, setTradeLicense] = useState<boolean>(false);
  const [aoamoa, setAoamoa] = useState<boolean>(false);
  const [otherDocSupport, setOtherDocSupport] = useState<boolean>(false);
  const [otherCertificate, setOtherCertificate] = useState<boolean>(false);
  const [challan, setChallan] = useState<boolean>(false);
  const [workOrder, setWorkOrder] = useState<boolean>(false);
  const [cessForm, setCessForm] = useState<boolean>(false);
  const [paymentProof, setPaymentProof] = useState<boolean>(false);
  const [otherDocs, setOtherDocs] = useState<boolean>(false);
  const [addressProof, setAddressProof] = useState<boolean>(false);
  const [formI, setFormI] = useState<string | null>();
  const [previousCertificate, setPreviousCertificate] = useState<
    string | null
  >();

  const [applicationStatus, setApplicationStatus] = useState();
  const [applicationStatusType, setApplicationStatusType] = useState();
  const [applicationStatusMsg, setApplicationStatusMsg] = useState();
  const [registrationNo, setRegistrationNo] = useState();
  const [registrationDate, setRegistrationDate] = useState();
  const [qrCode, setQrCode] = useState();
  const [certificate, setCertificate] = useState();
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [remarkOptions, setRemarkOptions] = useState<Record<string, string>>(
    {},
  );
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();
  const [afterDeleteRemark, setAfterDeleteRemark] = useState<any>();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [appFetched, setAppFetched] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading application details...");

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


  const handleGenerateFormIPdf = () => {
    console.log("establishmentData", establishmentData);
    const dynamicData = {
      establishmentName: establishmentData?.name?.value || "N/A",
      establishmentAddress: `${villageWardName || ""}, ${blockName || ""}, ${subDivName || ""}, <br/> Dist - ${distName || ""}, PIN - ${pinCode || ""}`,
      postalAddress: `${villageWardNamePostal || ""}, ${blockNamePostal || ""}, ${subDivNamePostal || ""}, <br/> Dist - ${distNamePostal || ""}, PIN - ${pinCodePostal || ""}`,
      permanentAddress: `${villageWardNamePermanent || ""}, ${blockNamePermanent || ""}, ${subDivNamePermanent || ""}, <br/> Dist - ${distNamePermanent || ""}, PIN - ${pinCodePermanent || ""}`,
      managerName: applicationData?.manager?.name?.value || "N/A",
      managerAddress: `${applicationData?.manager?.address?.value?.address || ""}, <br/> ${villageWardNameManager || ""}, ${blockNameManager || ""}, ${subDivNameManager || ""}, <br/> Dist - ${distNameManager || ""}, PIN - ${pinCodeManager || ""}`,

      natureOfWork: applicationData?.work?.nature?.value || "N/A",
      maxDirectWorkers: applicationData?.work?.maxWorkers?.value || "N/A",
      estDateComm: applicationData?.work?.startDate?.value
        ? new Date(applicationData.work.startDate.value).toLocaleDateString("en-IN")
        : "N/A",
      estDateComp: applicationData?.work?.endDate?.value
        ? new Date(applicationData.work.endDate.value).toLocaleDateString("en-IN")
        : "N/A",
      amount: applicationData?.payment?.fees || "N/A",

      registrationNo: registrationNo || "N/A",
      registrationDate: registrationDate
        ? new Date(registrationDate).toLocaleDateString("en-IN")
        : "N/A",
      applicationDate: new Date().toLocaleDateString("en-IN"),
    };

    const htmlContent = generateBocwaFormIPdfTemplate(dynamicData);

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleViewPdfDocuments = async (documentCode: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${safeApplicationId}&documentCode=${documentCode}&source=D`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("AUTH_STORAGE_KEY") || "{}")
                ?.token
              }`,
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

  const handleGenerateBOCWARegCertPdf = async () => {
    if (!applicationId || !applicantUserId) return;
    // const url = `/clra-reg-cert/${applicationId}/${applicantUserId}`;
    // window.open(url, "_blank");

    try {
      const response = await axios.get(
        `${API_BASE}certificate/formII/bocwa?applicationId=${safeApplicationId}&userId=${applicantUserId}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}")?.token}`,
          },
          responseType: "blob",
        },
      );
      // 🔥 Create blob directly from response
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
      parameters: (
        <p className="text-wrap break-words">Name of the Establishment</p>
      ),
      inputs: establishmentData?.name?.value ?? "",
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
      parameters: "Establishment Type",
      inputs: establishmentData?.type?.value ?? "",
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
      id: "1.(c)",
      parameters: (
        <p className="text-wrap break-words">
          Location (Work site) of the Establishment
        </p>
      ),
      inputs: (
        <div>
          <p>
            {villageWardName}, {blockName},
          </p>
          <p>
            {subDivName}, PS - {policeStationName},
          </p>
          <p>
            {distName}, PIN - {pinCode}
          </p>
        </div>
      ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("loc_e_name")}
          onCheckedChange={() => toggleVerifiedField("loc_e_name")}
        />
      ),
    },
    {
      id: "2.",
      parameters: (
        <p className="text-wrap break-words">
          Postal Address (Work site) of the Establishment
        </p>
      ),
      inputs: (
        <div>
          <p>
            {villageWardNamePostal}, {blockNamePostal},
          </p>
          <p>
            {subDivNamePostal}, PS - {policeStationNamePostal},
          </p>
          <p>
            {distNamePostal}, PIN - {pinCodePostal}
          </p>
        </div>
      ),
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
      id: "3.(a)",
      parameters: (
        <p className="text-wrap break-words">Full Name of the Establishment</p>
      ),
      inputs: establishmentData?.name?.value ?? "",
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
      id: "3.(b)",
      parameters: (
        <p className="text-wrap break-words">
          Permanent Address Of the Establishment
        </p>
      ),
      inputs: (
        <div>
          <p>
            {villageWardNamePermanent}, {blockNamePermanent},
          </p>
          <p>
            {subDivNamePermanent}, PS - {policeStationNamePermanent},
          </p>
          <p>
            {distNamePermanent}, PIN - {pinCodePermanent}
          </p>
        </div>
      ),
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("per_address_est")}
          onCheckedChange={() => toggleVerifiedField("per_address_est")}
        />
      ),
    },
    {
      id: "4.(a)",
      parameters: (
        <p className="text-wrap break-words">
          Full name of the Manager or Person Responsible for the Supervision and
          control of the Establishment
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.manager?.name?.value}</p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("man_name")}
          onCheckedChange={() => toggleVerifiedField("man_name")}
        />
      ),
    },
    {
      id: "4.(b)",
      parameters: (
        <p className="text-wrap break-words">
          Address of the Manager or Person Responsible for the Supervision and
          control of the Establishment
        </p>
      ),
      inputs: (
        <div className="">
          <p>{applicationData?.manager?.address?.value?.address}</p>
          <p>
            {villageWardNameManager}, {blockNameManager},
          </p>
          <p>
            {subDivNameManager}, PS - {policeStationNameManager},
          </p>
          <p>
            {distNameManager}, PIN - {pinCodeManager}
          </p>
        </div>
      ),
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("man_address")}
          onCheckedChange={() => toggleVerifiedField("man_address")}
        />
      ),
    },
    {
      id: "5.",
      parameters: (
        <p className="text-wrap break-words">
          Nature of building or other construction work carried/is to be carried
          on in the Establishment
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.work?.nature?.value}</p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_nature_of_work")}
          onCheckedChange={() => toggleVerifiedField("e_nature_of_work")}
        />
      ),
    },
    {
      id: "6.",
      parameters: (
        <p className="text-wrap break-words">
          Maximum Number of building workers to be employed on any day
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.work?.maxWorkers?.value}</p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("max_num_of_workmen")}
          onCheckedChange={() => toggleVerifiedField("max_num_of_workmen")}
        />
      ),
    },
    {
      id: "7.",
      parameters: (
        <p className="text-wrap break-words">
          Estimated date of commencement of building or other construction work
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>
            {new Date(
              applicationData?.work?.startDate?.value ?? "",
            )?.toLocaleDateString() ?? ""}
          </p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("est_date_comm")}
          onCheckedChange={() => toggleVerifiedField("est_date_comm")}
        />
      ),
    },
    {
      id: "8.",
      parameters: (
        <p className="text-wrap break-words">
          Estimated date of completion of building or other construction work
        </p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>
            {new Date(
              applicationData?.work?.endDate?.value ?? "",
            )?.toLocaleDateString() ?? ""}
          </p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("est_date_completion")}
          onCheckedChange={() => toggleVerifiedField("est_date_completion")}
        />
      ),
    },
    {
      id: "9.(a)",
      parameters: (
        <p className="text-wrap break-words">Full Name of the Employer</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.employer?.name?.value}</p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
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
      id: "9.(b)",
      parameters: <p className="text-wrap break-words">Gender</p>,
      inputs: (
        <div className="flex gap-4">
          <p>
            {applicationData?.employer?.gender?.value === "F"
              ? "Female"
              : applicationData?.employer?.gender?.value === "M"
                ? "Male"
                : applicationData?.employer?.gender?.value === "O"
                  ? "Others"
                  : ""}
          </p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
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
      id: "9.(c)",
      parameters: (
        <p className="text-wrap break-words">Address of the Employer</p>
      ),
      inputs: (
        <div className="flex gap-4">
          <p>{applicationData?.employer?.address?.value}</p>
        </div>
      ),
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("emp_address")}
          onCheckedChange={() => toggleVerifiedField("emp_address")}
        />
      ),
    },
  ];

  const docData: DocData[] = [
    {
      id: "i)",
      parameters: "Trade License",
      inputs: "",
      icon1: tradeLicense ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("TL");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: tradeLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.tradeLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("trade_license_file")}
          onCheckedChange={() => toggleVerifiedField("trade_license_file")}
        />
      ),
    },
    {
      id: "ii)",
      parameters: (
        <p className="text-wrap break-words">
          Articles of Association and Memorandum of Association/Partnership Deed
        </p>
      ),
      inputs: "",
      icon1: aoamoa ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("AOA");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
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
      id: "iii)",
      parameters: (
        <p className="text-wrap break-words">
          Any other document in support of correctness of the particulars
          mentioned in the application if required
        </p>
      ),
      inputs: "",
      icon1: otherDocs ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("ODSC");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: otherDocSupport ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherDocSupport?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_file")}
          onCheckedChange={() => toggleVerifiedField("other_doc_file")}
        />
      ),
    },
    {
      id: "iv)",
      parameters: (
        <p className="text-wrap break-words">
          Other certificates of registration in case of other than company,
          proprietorship or partnership firm like cooperative, Trustees etc.
        </p>
      ),
      inputs: "",
      icon1: otherCertificate ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("CR");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: otherCertificate ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherStateCert?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("partnership_deed_file")}
          onCheckedChange={() => toggleVerifiedField("partnership_deed_file")}
        />
      ),
    },
    {
      id: "v)",
      parameters: "Challan",
      inputs: "",
      icon1: challan ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("CH");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: otherDocs ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherDocs?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("challan_file")}
          onCheckedChange={() => toggleVerifiedField("challan_file")}
        />
      ),
    },
    {
      id: "vi)",
      parameters: "Work Order",
      inputs: "",
      icon1: workOrder ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("WO");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.formI?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("work_order_file")}
          onCheckedChange={() => toggleVerifiedField("work_order_file")}
        />
      ),
    },
    {
      id: "vii)",
      parameters: (
        <p className="text-wrap break-words">FORM-I for assesment of CESS</p>
      ),
      inputs: "",
      icon1: cessForm ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("AC");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("form_one_asses_ses_file")}
          onCheckedChange={() => toggleVerifiedField("form_one_asses_ses_file")}
        />
      ),
    },
    {
      id: "viii)",
      parameters: (
        <p className="text-wrap break-words">
          Documents in Support of Payment of CESS
        </p>
      ),
      inputs: "",
      icon1: paymentProof ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("PC");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("supp_asses_ses_file")}
          onCheckedChange={() => toggleVerifiedField("supp_asses_ses_file")}
        />
      ),
    },
    {
      id: "ix)",
      parameters: (
        <p className="text-wrap break-words">
          Documents in Support of Correctness of Application
        </p>
      ),
      inputs: "",
      icon1: otherDocs ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("ODSC");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_file")}
          onCheckedChange={() => toggleVerifiedField("other_doc_file")}
        />
      ),
    },
    {
      id: "x)",
      parameters: "Address Proof",
      inputs: "",
      icon1: addressProof ? (
        <div className="flex gap-1">
          <button
            onClick={() => {
              handleViewPdfDocuments("AP");
            }}
          >
            <IoMdDocument className="text-yellow-500 text-2xl" />
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ) : (
        <p>No Document Uploaded</p>
      ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("address_proof_file")}
          onCheckedChange={() => toggleVerifiedField("address_proof_file")}
        />
      ),
    },
    {
      id: "xi)",
      parameters: "FORM-I",
      inputs: "",
      icon1:
        formI !== "PENDING" ? (
          <div className="flex gap-1">
            <button
              onClick={() => {
                handleViewPdfDocuments("FI");
              }}
            >
              <IoMdDocument className="text-yellow-500 text-2xl" />
            </button>
            <button onClick={handleGenerateFormIPdf} className="text-amber-500">
              Generated Form-I
            </button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
        ) : (
          <p className="text-wrap break-words">
            Form I will be uploaded after fees payment
          </p>
        ),
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("form_1_bocwa_signed_pdf_file")}
          onCheckedChange={() =>
            toggleVerifiedField("form_1_bocwa_signed_pdf_file")
          }
        />
      ),
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "11.(i)",
      parameters: "Registration Fees",
      inputs: (
        <div className="flex gap-3">
          <p>{applicationData?.payment?.fees ?? ""}</p>
          <button
            className="flex gap-1 bg-blue-400 text-white rounded-sm px-2 py-1"
            onClick={() => setModalOpen(true)}
          >
            <IoInformationCircle size={16} /> Fees Chart
          </button>
        </div>
      ),
      verified: <input type="checkbox" />,
    },
    {
      id: "11.(ii)",
      parameters: "Payment Details",
      inputs: (
        <div>
          <p className="">
            {applicationData?.payment?.details?.mode ?? ""} Payment [Online /
            Counter]
          </p>
          {applicationData?.payment?.details?.details?.banktransactionstatus ===
            "Success" ? (
            <>
              <p>
                Paid Amount: ₹
                {applicationData?.payment?.details?.details?.challanamount ??
                  "Not available"}
              </p>
              <p>
                Challan Ref Id:{" "}
                {applicationData?.payment?.details?.details?.challanrefid ??
                  "Not available"}
              </p>
              <p>
                Identification Number:{" "}
                {applicationData?.payment?.details?.details?.dept_ref_no ??
                  "Not available"}
              </p>
              <p>
                Transaction Id:{" "}
                {applicationData?.payment?.details?.details?.transaction_id ??
                  "Not available"}
              </p>
              <p>
                Bank Transaction Id:{" "}
                {applicationData?.payment?.details?.details
                  ?.banktransactionid ?? "Not available"}
              </p>
              <p>
                Transaction Date:{" "}
                {applicationData?.payment?.details?.details
                  ?.banktranstimestamp ?? "Not available"}
              </p>
              <p>
                Transaction Status:{" "}
                {applicationData?.payment?.details?.details
                  ?.banktransactionstatus ?? "Not available"}
              </p>
              <p>
                Bank Code:{" "}
                {applicationData?.payment?.details?.details?.bank_cd ??
                  "Not available"}
              </p>
            </>
          ) : (
            <p>Not available</p>
          )}
        </div>
      ),
      verified: <input type="checkbox" />,
    },
  ];

  const bocwaRegCertificateData: AppData[] = [
    {
      id: "xii)",
      parameters: "Registration Certificate BOCWA ( FORM-II )",
      inputs: (
        <div className="flex gap-2">
          <button
            className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1"
            onClick={handleGenerateBOCWARegCertPdf}
          >
            <IoDownload /> Signed BOCWA Registration Certificate
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>
      ),
      verified: <input type="checkbox" />,
    },
  ];

  // const demoRemarkData: RemarkData[] = [
  //   {
  //     id: "1",
  //     date: "2024-01-12",
  //     remark: "Sample remark",
  //     status: "Pending",
  //     remarkby: "Admin",
  //     act: <></>,
  //   },
  // ];

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
    "FORM-I Backed": `${IMAGE_BASE}btn-rectify-signed-form.png`,
    "Form-I Rectification": `${IMAGE_BASE}btn-rectify-signed-form.png`,
    "Approved Without Fees": `${IMAGE_BASE}btn-approved.png`,
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

  const mapActionToBackend = (uiAction: string) => {
    switch (uiAction) {
      case "B":
      case "BI":
      case "V":
      case "R":
        return "WORKFLOW";
      default:
        return "ADD_REMARK";
    }
  };

  const applicationStatusDetailMsgMap = {
    B: "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    BI: "Application is sent back for rectification. After modification by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    C: "Applicant is CALLED BY ALC",
    I: "Certificate is issued. For any changes in the FORM-II(Certificate), Applicant can opt for Amendment of Registration Certificate. If you want to get back to the previous remark and re-upload FORM-II(Certificate), delete the current remark by clicking the delete option.",
    F: "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    T: "Payment successful for this application. Form-I is not uploaded by the applicant. After submission of signed FORM-I by the applicant, the application can be further accessible .",
    V: "Application is approved and directed to pay fees. After fees payment and submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    R: "If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    VA: "Application is approved without fees. After submission of signed FORM-I by the applicant, the application can be further accessible. If you want to get back to the previous remark, delete the current remark by clicking the delete option.",
    S: "FORM-I is submitted by the Applicant. After verification of uploaded FORM-I, Issue of Registration Certificate can be generated now or back to rectification FORM-I.",
    U: "Application is Forwarded to ALC by Inspector for further verification. Any action can be taken for the application.",
    O: "Application is applied by the Applicant. Any action can be taken for the application.",
    "": "",
  };

  useEffect(() => {
    if (!applicationData || !establishmentData) return;

    const initialVerified = new Set<string>();

    // -------- Establishment --------
    if (establishmentData?.name?.verified) initialVerified.add("e_name");

    if (establishmentData?.type?.verified) initialVerified.add("est_type");

    if (establishmentData?.locationAddress?.verified)
      initialVerified.add("loc_e_name");

    if (establishmentData?.postalAddress?.verified)
      initialVerified.add("e_postal_address");

    if (establishmentData?.permanentAddress?.verified)
      initialVerified.add("per_address_est");

    // -------- Manager --------
    if (applicationData?.manager?.name?.verified)
      initialVerified.add("man_name");

    if (applicationData?.manager?.address?.verified)
      initialVerified.add("man_address");

    // -------- Employer --------
    if (applicationData?.employer?.name?.verified)
      initialVerified.add("emp_name");

    if (applicationData?.employer?.gender?.verified)
      initialVerified.add("emp_gender");

    if (applicationData?.employer?.address?.verified)
      initialVerified.add("emp_address");

    // -------- Work Details ---------
    if (applicationData?.work?.nature?.verified)
      initialVerified.add("e_nature_of_work");

    if (applicationData?.work?.maxWorkers?.verified)
      initialVerified.add("max_num_of_workmen");

    if (applicationData?.work?.startDate?.verified)
      initialVerified.add("est_date_comm");

    if (applicationData?.work?.endDate?.verified)
      initialVerified.add("est_date_completion");

    // -------- Documents --------
    const docs = applicationData?.documents;

    if (docs?.tradeLicense?.verified) initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.verified) initialVerified.add("article_of_assoc_file");

    // if (docs?.otherDocs?.verified)
    //   initialVerified.add("memorandum_of_cert_file");

    if (docs?.otherCert?.verified) initialVerified.add("partnership_deed_file");

    if (docs?.challan?.verified) initialVerified.add("challan_file");

    if (docs?.workOrder?.verified) initialVerified.add("work_order_file");

    if (docs?.cessForm?.verified)
      initialVerified.add("form_one_asses_ses_file");

    if (docs?.paymentProof?.verified)
      initialVerified.add("supp_asses_ses_file");

    if (docs?.otherDocs?.verified) initialVerified.add("other_doc_file");

    if (docs?.formI?.verified)
      initialVerified.add("form_1_bocwa_signed_pdf_file");

    if (docs?.addressProof?.verified) initialVerified.add("address_proof_file");

    setVerifiedFields(initialVerified);
  }, [applicationData, establishmentData]);

  const handleFirstSubmitButton = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    if (action === "V" || action === "VA" || action === "I") {
      setShowSubmitModal(true); // If Verify selected
    } else {
      handleSubmitManual(e); // For other actions
    }
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!action || !remark.trim()) {
    //   alert("Action and remark are required");
    //   return;
    // }

    const payload = {
      applicantUserId: applicantUserId,
      // action: mapActionToBackend(action),
      remarksText: remark,
      remarkType: action, // workflowAction
      // verifiedFields:
      //   verifiedFields.size > 0 ? Array.from(verifiedFields) : null,
      remarkFieldTitle:
        verifiedFields.size > 0 ? Array.from(verifiedFields).join(",") : "",
    };

    try {
      const res = await axios.post(
        `${API_BASE}bocwa/${applicationId}/${alcUserId}/remark`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
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

  const handleSubmitForVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialVerified = new Set<string>();
    // -------- Establishment --------
    initialVerified.add("e_name");
    initialVerified.add("est_type");
    initialVerified.add("loc_e_name");
    initialVerified.add("e_postal_address");
    initialVerified.add("per_address_est");
    initialVerified.add("man_name");
    initialVerified.add("man_address");
    initialVerified.add("emp_name");
    initialVerified.add("emp_gender");
    initialVerified.add("emp_address");
    initialVerified.add("e_nature_of_work");
    initialVerified.add("max_num_of_workmen");
    initialVerified.add("est_date_comm");
    initialVerified.add("est_date_completion");
    // -------- Documents --------
    const docs = applicationData?.documents;

    if (docs?.tradeLicense?.available)
      initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.available) initialVerified.add("article_of_assoc_file");

    // if (docs?.otherDocs?.available)
    //   initialVerified.add("memorandum_of_cert_file");

    if (docs?.otherCert?.available)
      initialVerified.add("partnership_deed_file");

    if (docs?.challan?.available) initialVerified.add("challan_file");

    if (docs?.workOrder?.available) initialVerified.add("work_order_file");

    if (docs?.cessForm?.available)
      initialVerified.add("form_one_asses_ses_file");

    if (docs?.paymentProof?.available)
      initialVerified.add("supp_asses_ses_file");

    if (docs?.otherDocs?.available) initialVerified.add("other_doc_file");

    if (docs?.addressProof?.available)
      initialVerified.add("address_proof_file");

    if (action === "I" && docs?.formI?.available !== "PENDING")
      initialVerified.add("form_1_bocwa_signed_pdf_file");

    setVerifiedFields(initialVerified);

    const payload = {
      applicantUserId: applicantUserId,
      // action: mapActionToBackend(action),
      remarksText: remark,
      remarkType: action, // workflowAction
      // verifiedFields:
      //   verifiedFields.size > 0 ? Array.from(verifiedFields) : null,
      remarkFieldTitle: Array.from(initialVerified).join(","),
    };

    try {
      const res = await axios.post(
        `${API_BASE}bocwa/${applicationId}/${alcUserId}/remark`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
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

  const handleDeleteRemark = async (remarkId: number) => {
    try {
      const res = await axios.delete(
        `${API_BASE}bocwa/remarks/${remarkId}/${applicationId}/${alcUserId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Remark deleted:", res.data);
      setAfterDeleteRemark(res.data);

      alert("Remark Deleted Successfully");
    } catch (error) {
      console.error("remark delete failed", error);
      alert("Failed to delete remark");
    }
  };

  useEffect(() => {
    const fetchAddressData = async () => {
      if (!appFetched) return;
      setLoadingMessage("Loading location data...");
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
        setPoliceStationName(
          policeStationNameRes?.data?.name_of_police_station,
        );

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
        setVillageWardNamePostal(
          villageOrWardNameResPostal?.data?.village_name,
        );
        const policeStationNameResPostal = await axios.get<any>(
          `${API_BASE}policestation/${distCodePostal}/${policeStationCodePostal}`,
        );
        setPoliceStationNamePostal(
          policeStationNameResPostal?.data?.name_of_police_station,
        );

        if (!distCodePermanent || distCodePermanent == null) return;

        const districtNameResPermanent = await axios.get<any>(
          `${API_BASE}district/${distCodePermanent}`,
        );
        setDistNamePermanent(districtNameResPermanent?.data?.district_name);
        const subDivisionNameResPermanent = await axios.get<any>(
          `${API_BASE}subdivision/${distCodePermanent}/${subDivCodePermanent}`,
        );
        setSubDivNamePermanent(subDivisionNameResPermanent?.data?.sub_div_name);
        const blockNameResPermanent = await axios.get<any>(
          `${API_BASE}block/${distCodePermanent}/${subDivCodePermanent}/${areaTypeCodePermanent}/${blockCodePermanent}`,
        );
        setBlockNamePermanent(blockNameResPermanent?.data?.block_mun_name);
        const villageOrWardNameResPermanent = await axios.get<any>(
          `${API_BASE}villageward/${blockCodePermanent}/${villageWardCodePermanent}`,
        );
        setVillageWardNamePermanent(
          villageOrWardNameResPermanent?.data?.village_name,
        );
        const policeStationNameResPermanent = await axios.get<any>(
          `${API_BASE}policestation/${distCodePermanent}/${policeStationCodePermanent}`,
        );
        setPoliceStationNamePermanent(
          policeStationNameResPermanent?.data?.name_of_police_station,
        );

        if (!distCodeManager || distCodeManager == null) return;

        const districtNameResManager = await axios.get<any>(
          `${API_BASE}district/${distCodeManager}`,
        );
        setDistNameManager(districtNameResManager?.data?.district_name);
        const subDivisionNameResManager = await axios.get<any>(
          `${API_BASE}subdivision/${distCodeManager}/${subDivCodeManager}`,
        );
        setSubDivNameManager(subDivisionNameResManager?.data?.sub_div_name);
        const blockNameResManager = await axios.get<any>(
          `${API_BASE}block/${distCodeManager}/${subDivCodeManager}/${areaTypeCodeManager}/${blockCodeManager}`,
        );
        setBlockNameManager(blockNameResManager?.data?.block_mun_name);
        const villageOrWardNameResManager = await axios.get<any>(
          `${API_BASE}villageward/${blockCodeManager}/${villageWardCodeManager}`,
        );
        setVillageWardNameManager(
          villageOrWardNameResManager?.data?.village_name,
        );
        const policeStationNameResManager = await axios.get<any>(
          `${API_BASE}policestation/${distCodeManager}/${policeStationCodeManager}`,
        );
        setPoliceStationNameManager(
          policeStationNameResManager?.data?.name_of_police_station,
        );
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddressData();
  }, [
    appFetched,
    distCode,
    distCodePostal,
    distCodePermanent,
    distCodeManager,
    subDivCode,
    subDivCodePostal,
    subDivCodePermanent,
    subDivCodeManager,
    areaTypeCode,
    areaTypeCodePostal,
    areaTypeCodePermanent,
    areaTypeCodeManager,
    blockCode,
    blockCodePostal,
    blockCodePermanent,
    blockCodeManager,
    villageWardCode,
    villageWardCodePostal,
    villageWardCodePermanent,
    villageWardCodeManager,
    policeStationCode,
    policeStationCodePostal,
    policeStationCodePermanent,
    policeStationCodeManager,
    pinCode,
    pinCodePostal,
    pinCodePermanent,
    pinCodeManager,
  ]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      setIsLoading(true);
      setAppFetched(false);
      setLoadingMessage("Loading application details...");
      try {
        const applicationRes = await axios.get<any>(
          `${API_BASE}bocwa/applications/${applicationId}/${alcUserId}/general-details`,
          // `http://10.150.22.95:3000/bocwa/applications/1047/1094/general-details`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );
        console.log("applicationRes", applicationRes);

        setApplicationData(applicationRes.data);
        setEstablishmentData(applicationRes.data.establishment);
        setDistCode(
          applicationRes.data.establishment.locationAddress?.value?.district,
        );
        setSubDivCode(
          applicationRes.data.establishment.locationAddress?.value?.subdivision,
        );
        setAreaTypeCode(
          applicationRes.data.establishment.locationAddress?.value?.areaType.toLowerCase(),
        );
        setBlockCode(
          applicationRes.data.establishment.locationAddress?.value
            ?.areaTypeCode,
        );
        setVillageWardCode(
          applicationRes.data.establishment.locationAddress?.value
            ?.villageOrWard,
        );
        setPoliceStationCode(
          applicationRes.data.establishment.locationAddress?.value
            ?.policeStation,
        );
        setPinCode(
          applicationRes.data.establishment.locationAddress?.value?.pinCode,
        );

        setDistCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value?.district,
        );
        setSubDivCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value?.subdivision,
        );
        setAreaTypeCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value?.areaType?.toLowerCase(),
        );
        setBlockCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value
            ?.areaTypeCode,
        );
        setVillageWardCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value
            ?.villageOrWard,
        );
        setPoliceStationCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value
            ?.policeStation,
        );
        setPinCodePostal(
          applicationRes.data?.establishment?.postalAddress?.value?.pinCode,
        );

        setDistCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value?.district,
        );
        setSubDivCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value
            ?.subdivision,
        );
        setAreaTypeCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value?.areaType?.toLowerCase(),
        );
        setBlockCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value
            ?.areaTypeCode,
        );
        setVillageWardCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value
            ?.villageOrWard,
        );
        setPoliceStationCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value
            ?.policeStation,
        );
        setPinCodePermanent(
          applicationRes.data?.establishment?.permanentAddress?.value?.pinCode,
        );

        setDistCodeManager(
          applicationRes.data?.manager?.address?.value?.district,
        );
        setSubDivCodeManager(
          applicationRes.data?.manager?.address?.value?.subdivision,
        );
        setAreaTypeCodeManager(
          applicationRes.data?.manager?.address?.value?.areaType?.toLowerCase(),
        );
        setBlockCodeManager(
          applicationRes.data?.manager?.address?.value?.areaTypeCode,
        );
        setVillageWardCodeManager(
          applicationRes.data?.manager?.address?.value?.villageOrWard,
        );
        setPoliceStationCodeManager(
          applicationRes.data?.manager?.address?.value?.policeStation,
        );
        setPinCodeManager(
          applicationRes.data?.manager?.address?.value?.pinCode,
        );

        setTradeLicense(applicationRes.data.documents.tradeLicense?.available);
        setAoamoa(applicationRes.data.documents.aoaMoa?.available);
        setOtherDocSupport(
          applicationRes.data.documents.otherDocSupport?.available,
        ); // DUE
        setOtherCertificate(applicationRes.data.documents.otherCert?.available);
        setChallan(applicationRes.data.documents.challan?.available);
        setWorkOrder(applicationRes.data.documents.workOrder?.available);
        setCessForm(applicationRes.data.documents.cessForm?.available);
        setPaymentProof(applicationRes.data.documents.paymentProof?.available);
        setOtherDocs(applicationRes.data.documents.otherDocs?.available);
        setAddressProof(applicationRes.data.documents.addressProof?.available);
        setFormI(applicationRes.data.documents.formI?.available);
        setPreviousCertificate(
          applicationRes.data.documents.previousCertificate?.status,
        );

        setApplicationStatus(applicationRes.data.statusInfo?.status);
        setApplicationStatusType(applicationRes.data.statusInfo?.type);
        setApplicationStatusMsg(applicationRes.data.statusInfo?.message);
        setRegistrationNo(applicationRes.data.application?.registrationNumber);
        setRegistrationDate(applicationRes.data.application?.registrationDate);
        setQrCode(applicationRes.data.application?.qrCode);
        setCertificate(applicationRes.data.application?.certificate);
        setAppFetched(true);
      } catch (error) {
        console.error("API Error:", error);
        setIsLoading(false);
      }
    };
    fetchApplicationData();
  }, [afterSubmitRes, afterDeleteRemark]);

  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        const remarkRes = await axios.get(
          `${API_BASE}bocwa/${applicationId}/${alcUserId}/get-remark`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );

        console.log("remarkRes", remarkRes);

        if (!remarkRes.data) {
          setRemarkData([]);
          return;
        }

        const remarkTableData: RemarkData[] = remarkRes?.data?.remarks.map(
          (r: any) => ({
            id: String(r.slNo ?? ""),
            date: r.dateTime ? new Date(r.dateTime).toLocaleString() : "",
            remark: r.remark ?? "",
            status: renderStatusImage(r.remarkStatus) ?? <></>,
            remarkby: r.remarkBy ?? "",
            remarkByUserId: r.remarkByUserId ?? "",
            act: (
              <button
                disabled={!r.canDelete}
                onClick={() => {
                  handleDeleteRemark(r.remarkId);
                }}
                className={`p-1 ${r.canDelete
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
          `${API_BASE}bocwa/${applicationId}/${alcUserId}/actions-dropdown`,
          // `http://192.168.29.56:3000/clra/3424/4147/alc/actions`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );

        const data = remarkDropdownRes?.data;
        setRemarkOptions(data);
      } catch (error) {
        console.error("API Error:", error);
        setRemarkOptions({});
      }
    };
    fetchRemarksInputDropdown();
  }, []);

  return (
    <div className="min-h-[250px] mb-15">
      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">
        Application Details for Establishment Registration Under BOCWA
      </h1>

      {showLoadingOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-2 bg-white rounded-lg shadow-lg p-6">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E73BE] border-t-transparent" />
            <p className="text-xs font-semibold mt-1 text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <span>1. Inputs are provided by Employer [For Verification]1</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r font-semibold">
                    Sl. No.
                  </TableHead>
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
                {appData.map((item) => (
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
                    10. Documents Uploaded
                  </TableHead>
                </TableRow>

                {docData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">
                      {item.parameters}
                    </TableCell>

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

                {applicationData?.application?.status === "I" &&
                  bocwaRegCertificateData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="border-r">{item.id}</TableCell>
                      <TableCell className="border-r">
                        {item.parameters}
                      </TableCell>
                      <TableCell className="border-r">{item.inputs}</TableCell>
                      {/* <TableCell>{item.verified}</TableCell> */}
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
                    <TableCell className="border-r">
                      {item.parameters}
                    </TableCell>
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
            <Button
              disabled
              className="w-full bg-sky-600 text-white"
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
                <strong>Current status: {applicationStatusMsg}</strong>
                <br />
                {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""}
              </span>
            </p>
          </Card>
        ) : (
          applicationStatusType === "success" && (
            <Card className="bg-green-700 p-5">
              <p className="flex items-start gap-2 text-white">
                <MdDone className="text-2xl" />
                <span>
                  <strong>Current status: {applicationStatusMsg}</strong>
                  <br />
                  {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""}
                </span>
              </p>
            </Card>
          )
        )}
      </div>

      {/* --------------------- ACTION & REMARK --------------------- */}
      {`${remarkData[0]?.remarkByUserId}` !== `${getUserId()}` && (
        <div className="mt-5">
          <Card className="p-3 text-black">
            <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
              <GrNotes /> <span>ACTIONS AND REMARK</span>
            </CardHeader>

            <form
              className="m-auto w-full sm:w-2/3 lg:w-1/3 p-5"
              onSubmit={handleFirstSubmitButton}
            >
              {/* ---- Dropdown ---- */}
              <div className="mb-5">
                <label className="block mb-2 text-sm text-black">
                  <b>Please Select Action</b>{" "}
                  <span className="text-red-600">*</span>
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
                  <b>Remark </b>
                  <span className="text-red-600">*</span>
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
                className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 mt-2"
              >
                Submit
              </button>
            </form>
          </Card>
        </div>
      )}

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
            {action === "V" || action === "VA" ? (
              <label className="text-sm text-gray-700">
                Are you confirm that all data fields are checked which are given
                by the applicant?
              </label>
            ) : action === "I" ? (
              <label className="text-sm text-gray-700">
                Are you confirm that Form-I is uploaded correctly by the
                applicant and checked?
              </label>
            ) : (
              <></>
            )}
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
                if (action === "V" || action === "VA" || action === "I")
                  handleSubmitForVerify(e);
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

export default AlcReceivedApplicationsBOCWA;
