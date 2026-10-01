import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdDocument, IoMdWarning } from "react-icons/io";
import { QRCodeCanvas } from "qrcode.react";
import DataTable, { TableColumn } from "react-data-table-component";

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
import { Form, useNavigate, useParams } from "react-router-dom";
import { API_BASE, AUTH_STORAGE_KEY, IMAGE_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { generateMtwFormIPdfTemplate } from "./MtwPdfTemplates";

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
  regNo: string;
  regDate: string;
  viewRegDetails: ReactElement | String;
}

interface AppData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
  verified: ReactElement;
}

interface DocData {
  id: string;
  parameters: ReactElement | string;
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

interface TradeUnionData {
  id: string;
  registrationNo: string;
  name: string;
  act: ReactElement;
}

interface ParticularsCCLData {
  id: string;
  contractorName: string;
  contractLabourNo: string;
  natureOfWork: string | ReactElement;
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
  noOfWorkers: string;
  fee: string;
}

interface ContractorModalRow {
  contractorName: string;
  contractorEmail: string;
  contractorAddress: string;
  natureOfWork: string;
  maxNoOfContractLabour: string;
  dateOfEmployment: string;
  status: ReactElement;
}

interface OwnershipRow {
  person_id: number | null;
  name: string;
  designation: string;
  address: string | ReactElement;
  verified: boolean;
}

// --------------------- Dummy Data ---------------------

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
  { slNo: 1, noOfWorkers: "Does not exceed less or equal to 5", fee: "₹10" },
  { slNo: 2, noOfWorkers: "Exceeds 5 but does not exceed 25", fee: "₹25" },
  { slNo: 3, noOfWorkers: "Exceeds 25 but does not exceed 50", fee: "₹50" },
  { slNo: 4, noOfWorkers: "Exceeds 50 but does not exceed 100", fee: "₹100" },
  { slNo: 5, noOfWorkers: "Exceeds 100 but does not exceed 250", fee: "₹250" },
  { slNo: 6, noOfWorkers: "Exceeds 250 but does not exceed 500", fee: "₹500" },
  { slNo: 7, noOfWorkers: "Exceeds 500 but does not exceed 750", fee: "₹750" },
  { slNo: 8, noOfWorkers: "Exceeds 750 but does not exceed 999", fee: "₹1000" },
  { slNo: 9, noOfWorkers: "Exceeds 1000", fee: "₹1000" },
];

// --------------------- Auto Fill Rules ---------------------

const remarkRules: Record<string, string> = {
  "B": "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
  "U": "Application is sent back for rectification of Form-I. Kindly modify and re-upload Form-I.",
  "V": "Application is verified, applicant is allowed to pay the fees.",
  "VA": "Application is approved.",
  "R": "Application is rejected due to discrepancies.",
  "I": "Congratulations!! Certificate is issued.",
};


// --------------------- Main Component ---------------------

const AlcApplicationsDetailsMTW = () => {
  const navigate = useNavigate();

  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicantUserId } = useParams<{ applicantUserId: string }>();
  const alcUserId = getUserId();
  const enApplicationId = encryptionDecryptionFun("encrypt", String(applicationId)) ?? '';
  const safeApplicationId = encodeURIComponent(enApplicationId);

  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [applicationData, setApplicationData] = useState<any>();
  const [establishmentData, setEstablishmentData] = useState<any>();
  const [feesModalOpen, setFeesModalOpen] = useState(false);
  const [contractorModalOpen, setContractorModalOpen] = useState(false);
  const [distCode, setDistCode] = useState();
  const [subDivCode, setSubDivCode] = useState();
  const [distName, setDistName] = useState();
  const [subDivName, setSubDivName] = useState();
  const [areaTypeCode, setAreaTypeCode] = useState();
  const [blockCode, setBlockCode] = useState();
  const [blockName, setBlockName] = useState();
  const [villageWardCode, setVillageWardCode] = useState();
  const [villageWardName, setVillageWardName] = useState();
  const [policeStationCode, setPoliceStationCode] = useState();
  const [policeStationName, setPoliceStationName] = useState();
  const [pinCode, setPinCode] = useState();

  const [ownershipData, setOwnershipData] = useState<OwnershipRow[]>();

  const [tradeLicense, setTradeLicense] = useState<boolean>(false);
  const [aoamoa, setAoamoa] = useState<boolean>(false);
  const [blueBook, setBlueBook] = useState<boolean>(false);
  const [insuranceCertificate, setInsuranceCertificate] = useState<boolean>(false);
  const [supportingDocs, setSupportingDocs] = useState<boolean>(false);
  const [addressProof, setAddressProof] = useState<boolean>(false);
  const [formI, setFormI] = useState<string | null>();

  const [applicationStatus, setApplicationStatus] = useState();
  const [applicationStatusType, setApplicationStatusType] = useState();
  const [applicationStatusMsg, setApplicationStatusMsg] = useState();
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
    const owners = applicationData?.ownershipResult || [];

    // ✅ FILTER BASED ON DESIGNATION
    const proprietorsPartners = owners.filter(
      (o: any) =>
        o.designation?.toLowerCase() === "proprietor" ||
        o.designation?.toLowerCase() === "partner"
    );

    const directors = owners.filter(
      (o: any) => o.designation?.toLowerCase() === "director"
    );

    const generalManagers = owners.filter(
      (o: any) => o.designation?.toLowerCase() === "general_manager"
    );

    // ✅ FORMAT FUNCTION (COMMON)
    const formatPeople = (list: any[]) =>
      list.length > 0
        ? list
          .map(
            (o) => `
            <div style="margin-bottom:6px;">
              <b>${o.name}</b><br/>
              ${o.address}
            </div>
          `
          )
          .join("")
        : "-";

    const dynamicData = {
      // ✅ Establishment
      establishmentName: establishmentData?.mtwName?.value || "",

      establishmentAddress: `
      ${villageWardName || ""}, ${blockName || ""}, ${subDivName || ""} <br/>
      Dist - ${distName || ""}, PIN - ${pinCode || ""}
    `,

      postalAddress: `
      ${villageWardName || ""}, ${blockName || ""} <br/>
      ${subDivName || ""}, PS - ${policeStationName || ""} <br/>
      ${distName || ""}, PIN - ${pinCode || ""}
    `,

      // ✅ Service Details
      natureOfWork: applicationData?.natureOfService?.value || "",

      totalRoutes: applicationData?.totalNoOfRoutes?.value || "",
      totalMileage: applicationData?.totalRouteMilage?.value || "",
      totalVehicles: applicationData?.totalNoOfVehicles?.value || "",
      maxWorkers: applicationData?.maxWorkers?.value || "",

      // ❌ No invalid dates
      estDateComm: "",
      estDateComp: "",

      // ✅ OWNERSHIP (FIXED)
      proprietorsPartners: formatPeople(proprietorsPartners),
      directors: formatPeople(directors),
      generalManagers: formatPeople(generalManagers),

      // (Optional: if still needed somewhere)
      allOwners: formatPeople(owners),

      // ✅ Fees
      amount: applicationData?.fees?.value || 0,

      // ✅ Registration
      registrationNo: registrationNo || "",
      registrationDate: registrationDate
        ? new Date(registrationDate).toLocaleDateString()
        : "",

      applicationDate: new Date().toLocaleDateString(),
    };

    const htmlContent = generateMtwFormIPdfTemplate(dynamicData);

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleViewPdfDocuments = async (documentCode: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${safeApplicationId}&documentCode=${documentCode}&source=D`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("AUTH_STORAGE_KEY") || "{}")?.token
              }`,
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

    } catch (error: any) {
      console.error("Error fetching PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  const handleGenerateMTWRegCertPdf = async () => {
    if (!applicationId || !applicantUserId) return;
    // const url = `/clra-reg-cert/${applicationId}/${applicantUserId}`;
    // window.open(url, "_blank");

    try {
      const response = await axios.get(
        `${API_BASE}certificate/formII/mtw`,
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
      // 🔥 Create blob directly from response
      // const blob = new Blob([response.data], { type: "application/pdf" });
      // const blobUrl = window.URL.createObjectURL(blob);

      const blobUrl = window.URL.createObjectURL(response.data);

      // Open in new tab
      window.open(blobUrl, "_blank");

    } catch (error: any) {
      console.error("Error fetching Certificate PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  console.log("verifiedFelds", verifiedFields)

  const empData: EmpData[] = [
    {
      regNo: registrationNo ?? "",
      regDate: (new Date(registrationDate ?? ""))?.toLocaleString() ?? "",
      viewRegDetails: (
        <button className="flex items-center gap-1 text-orange-600 hover:text-blue-600" onClick={() => { navigate("/alc-visible-applications") }}>
          <IoInformationCircle />
          View Registration Details
        </button>
      ),
    },
  ];

  const appData: AppData[] = [
    {
      id: "1.",
      parameters: "Name of Motor Transport Undertaking",
      inputs:
        <div>
          {establishmentData?.mtwName?.value}
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("mtw_name")}
          onCheckedChange={() => toggleVerifiedField("mtw_name")}
        />,
    },
    {
      id: "2.",
      parameters: <p className="text-wrap wrap-break-word">Full Address to which communications relating to the Motor Transport undertaking should be sent</p>,
      inputs:
        <div>
          <p>{villageWardName}, {blockName}</p>
          <p>{subDivName}, PS - {policeStationName},</p>
          <p>{distName}, PIN - {pinCode}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("mtw_loc_address")}
          onCheckedChange={() => toggleVerifiedField("mtw_loc_address")}
        />,
    },
    {
      id: "3.",
      parameters: "Nature of motor transport service",
      inputs:
        <div>
          {applicationData?.natureOfService?.value}
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("mtw_nature")}
          onCheckedChange={() => toggleVerifiedField("mtw_nature")}
        />,
    },
    {
      id: "4.",
      parameters:
        <div>
          <p className="text-wrap wrap-break-word">Total number of routes</p>
        </div>,
      inputs:
        <div>
          <p>{applicationData?.totalNoOfRoutes?.value}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("total_routes")}
          onCheckedChange={() => toggleVerifiedField("total_routes")}
        />,
    },
    {
      id: "5.",
      parameters: "Total no of Route - Total Route Milage",
      inputs:
        <div>
          <p>{applicationData?.totalRouteMilage?.value}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("total_routes")}
          onCheckedChange={() => toggleVerifiedField("total_route_milage")}
        />,
    },
    {
      id: "6.",
      parameters: <p className="text-wrap wrap-break-word">Total number of motor transport vehicles on the last date or the preceeding year</p>,
      inputs:
        <div className="">
          {applicationData?.totalNoOfVehicles?.value}
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("total_mtw_vehicle")}
          onCheckedChange={() => toggleVerifiedField("total_mtw_vehicle")}
        />,
    },
    {
      id: "7.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Maximum number of motor transport workers employed on any day during the preceeding year
        </p>,
      inputs:
        <div className="flex justify-between">
          <p>{applicationData?.maxWorkers?.value}</p>
          <button className="bg-sky-500 hover:bg-sky-600 text-white rounded-sm px-2 py-1 flex gap-1" onClick={() => setFeesModalOpen(true)}>
            <IoInformationCircle /> Fees Chart
          </button>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("mtw_maxworkers")}
          onCheckedChange={() => toggleVerifiedField("mtw_maxworkers")}
        />,
    },
  ];

  const getLabel = (designation: string): string => {
    const d = designation.toLowerCase();

    if (d === "proprietor" || d === "partner") {
      return `Name and Address of the ${designation} in case of firm not registered under the Companies Act,1956`;
    }
    if (d === "general_manager") {
      return "Name and Address of the General Manager in the case of a public sector undertaking";
    }
    if (d === "director") {
      return "Name and Address of the Director in case of company registered under the Companies Act,1956";
    }
    return `Name and Address of the ${designation}`;
  };

  const ownershipColumns: TableColumn<OwnershipRow>[] = [
    {
      name: "Name",
      selector: (row) => row.name,
      cell: (row) => (
        <div className="grid gap-1">
          <p className="font-semibold">{row.name}</p>
          <p>({getLabel(row.designation)})</p>
        </div>
      ),
      wrap: true,
      grow: 2,
    },
    {
      name: "Designation",
      selector: (row) => row.designation,
      cell: (row) => row.designation,
      center: true,
    },
    {
      name: "Residential",
      cell: (row) => row.address,
      wrap: true,
      grow: 2,
    },
    {
      name: "Verified?",
      cell: (row) => (
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has(`owner_id_${row.person_id}`)}
          onCheckedChange={() => toggleVerifiedField(`owner_id_${row.person_id}`)}
        />
      ),
      center: true,
    },
  ];


  const demoOwnershipData: OwnershipRow[] = [
    {
      person_id: null,
      name: "",
      designation: "",
      address: "",
      verified: false,
    },
  ];

  const docData: DocData[] = [
    {
      id: "1",
      parameters: "Trade License",
      inputs: "",
      icon1:
        tradeLicense ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("TL") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
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
      id: "2",
      parameters: <p className="text-wrap wrap-break-word">Articles of Association and Memorandum of Association/Partnership Deed</p>,
      inputs: "",
      icon1:
        aoamoa ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("AOA") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
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
      id: "3",
      parameters: <p className="text-wrap wrap-break-word">Blue Book/ Smart Card Issued by Motor Vehicles</p>,
      inputs: "",
      icon1:
        blueBook ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("BB") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: factoryLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.factoryLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("form_one_asses_ses_file")}
          onCheckedChange={() => toggleVerifiedField("form_one_asses_ses_file")}
        />,
    },
    {
      id: "4",
      parameters: <p className="text-wrap wrap-break-word">Insurance Certificate of Motor Vehicles</p>,
      inputs: "",
      icon1:
        insuranceCertificate ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("IC") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: otherStateCertificate ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherStateCert?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("supp_asses_ses_file")}
          onCheckedChange={() => toggleVerifiedField("supp_asses_ses_file")}
        />,
    },
    {
      id: "5",
      parameters: <p className="text-wrap wrap-break-word">Documents in support of correctness of the application</p>,
      inputs: "",
      icon1:
        supportingDocs ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("ODSC") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: supportingDocs ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.supportingDocs?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_file")}
          onCheckedChange={() => toggleVerifiedField("other_doc_file")}
        />,
    },
    {
      id: "6",
      parameters: "Address Proof",
      inputs: "",
      icon1:
        addressProof ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("AP") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.formI?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("address_proof_file")}
          onCheckedChange={() => toggleVerifiedField("address_proof_file")}
        />,
    },
    {
      id: "7",
      parameters: "Form - I Application",
      inputs: "",
      icon1:
        formI !== "PENDING" ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("FI") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            {/* <button onClick={handleGenerateFormIPdf} className="text-amber-500">Generated Form-I</button> */}
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p className="text-wrap wrap-break-word">Form I will be uploaded after fees payment</p>,
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("signed_pdf_file")}
          onCheckedChange={() => toggleVerifiedField("signed_pdf_file")}
        />,
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "8",
      parameters: "Amount Fees",
      inputs:
        <div className="flex gap-2">
          <p className="font-semibold">
            ₹{applicationData?.fees?.value}.00
          </p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("fees_paid")}
          onCheckedChange={() => toggleVerifiedField("fees_paid")}
        />,
    },
    {
      id: "9",
      parameters: "Payment Details",
      inputs:
        <div className="">
          <p className="font-semibold">GRIPS Payment [Online / Counter]</p>
          <p>IFSC Code: {applicationData?.paymentDetails?.totalFees ?? ""}</p>
          <p>GRN Number: {applicationData?.paymentDetails?.totalFees ?? ""}</p>
          <p>Bank Transaction Id: {applicationData?.paymentDetails?.totalFees ?? ""}</p>
          <p>Total Amount: {applicationData?.paymentDetails?.totalFees ?? ""}</p>
          <p>Transaction Date: {applicationData?.paymentDetails?.totalFees ?? ""}</p>
          <p>Transaction Status: {applicationData?.paymentDetails?.totalFees ?? ""}</p>

        </div>,
      verified: <></>,
    },
  ];

  const regCertificateData: AppData[] = [
    {
      id: "10",
      parameters: "MTW Certificate",
      inputs:
        <div className="flex gap-2">
          <button className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1" onClick={handleGenerateMTWRegCertPdf}>
            <IoDownload /> Signed MTW Registration Certificate
          </button>
          <FaMagnifyingGlass className="text-2xl text-black" />
        </div>,
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
  //     act: "View",
  //   },
  // ];


  const renderStatusImage = (status: string): ReactElement | null => {
    if (!status) return null;

    const normalized = status
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .trim()
      .toLowerCase();

    const normalizedMap: Record<string, string> = {
      "approved": `${IMAGE_BASE}btn-approved.png`,
      "applied": `${IMAGE_BASE}btn-applied.png`,
      "renewal applied": `${IMAGE_BASE}btn-applied.png`,
      "fees paid": `${IMAGE_BASE}btn-fees-paid.png`,
      "fees pending": `${IMAGE_BASE}btn-fees-pending.png`,
      "pending": `${IMAGE_BASE}btn-pending.png`,
      "final submitted": `${IMAGE_BASE}btn-final-submit.png`,
      "final submit": `${IMAGE_BASE}btn-final-submit.png`,
      "issued": `${IMAGE_BASE}btn-issued.png`,
      "rectification": `${IMAGE_BASE}btn-rectification.png`,
      "back to applicant by officer": `${IMAGE_BASE}btn-rectification.png`,
      "rejected": `${IMAGE_BASE}btn-reject.png`,
      "forwarded": `${IMAGE_BASE}btn-to-alc.png`,
      "form-i backed": `${IMAGE_BASE}btn-rectify-signed-form.png`,
    };

    const src = normalizedMap[normalized];

    if (!src) {
      console.log("UNKNOWN STATUS:", normalized);
      return <span className="text-red-500">{status}</span>;
    }

    return (
      <img
        src={src}
        alt={status}
        className="object-contain w-auto h-auto"
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

  // const mapActionToBackend = (uiAction: string) => {
  //   switch (uiAction) {
  //     case "correction":
  //     case "approve":
  //     case "reject":
  //       return "WORKFLOW";
  //     default:
  //       return "ADD_REMARK";
  //   }
  // };

  useEffect(() => {
    if (!applicationData || !establishmentData) return;

    const initialVerified = new Set<string>();

    // -------- Establishment --------
    if (establishmentData?.mtwName?.verified)
      initialVerified.add("mtw_name");

    if (establishmentData?.mtwLocationAddress?.verified)
      initialVerified.add("mtw_loc_address");

    // -------- Ownership People --------
    applicationData?.ownershipResult.map((r: any) => (
      (r?.verified) &&
      initialVerified.add(`owner_id_${r.person_id}`)
    ));

    // -------- Routes & Details --------
    if (applicationData?.natureOfService?.verified)
      initialVerified.add("mtw_nature");

    if (applicationData?.totalNoOfRoutes?.verified)
      initialVerified.add("total_routes");

    if (applicationData?.totalRouteMilage?.verified)
      initialVerified.add("total_route_milage");

    if (applicationData?.totalNoOfVehicles?.verified)
      initialVerified.add("total_mtw_vehicle");

    if (applicationData?.maxWorkers?.verified)
      initialVerified.add("mtw_maxworkers");

    // -------- Documents --------
    const docs = applicationData?.documentsSummary;

    if (docs?.tradeLicense?.verified)
      initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.verified)
      initialVerified.add("article_of_assoc_file");

    if (docs?.blueBook?.verified)
      initialVerified.add("form_one_asses_ses_file");

    if (docs?.insuranceCertificate?.verified)
      initialVerified.add("supp_asses_ses_file");

    if (docs?.supportingDocs?.verified)
      initialVerified.add("other_doc_file");

    if (docs?.addressProof?.verified)
      initialVerified.add("address_proof_file");

    if (docs?.formI?.verified)
      initialVerified.add("signed_pdf_file");

    // ✅ ADD HERE
    if (applicationData?.fees?.verified)
      initialVerified.add("fees_paid");

    setVerifiedFields(initialVerified);
  }, [applicationData, establishmentData]);



  const handleFirstSubmitButton = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }
    // console.log(action)

    if (action === "V" || action === "VA" || action === "I") {
      setShowSubmitModal(true);   // If Verify selected
    } else {
      handleSubmitManual(e);    // For other actions
    }
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

    const payload = {
      // action: mapActionToBackend(action),
      amendmentId: applicationId,
      comment: remark,
      remarkType: action,
      verifiedFields:
        verifiedFields.size > 0
          ? Array.from(verifiedFields).join(",")
          : "",
      signedCertificateFileId: "",
      // workflowAction: mapWorkflowAction(action),   // workflowAction
    };

    try {
      const res = await axios.post(
        `${API_BASE}mtw/${applicationId}/${applicantUserId}/${alcUserId}/remark`,    // API integration due
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

  const handleSubmitForVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialVerified = new Set<string>();
    const docs = applicationData?.documentsSummary;

    // 🟢 CASE 1: VERIFY / APPROVE (V / VA)
    if (action === "V" || action === "VA") {

      // -------- Registration --------
      initialVerified.add("reg_details");

      // -------- Establishment --------
      initialVerified.add("mtw_name");
      initialVerified.add("mtw_loc_address");

      // -------- Ownership People --------
      applicationData?.ownershipResult?.forEach((r: any) => {
        initialVerified.add(`owner_id_${r.person_id}`);
      });

      // -------- Routes & Details --------
      initialVerified.add("mtw_nature");
      initialVerified.add("total_routes");
      initialVerified.add("total_route_milage");
      initialVerified.add("total_mtw_vehicle");
      initialVerified.add("mtw_maxworkers");

      // -------- Documents --------
      if (docs?.tradeLicense?.available)
        initialVerified.add("trade_license_file");

      if (docs?.aoaMoa?.available)
        initialVerified.add("article_of_assoc_file");

      if (docs?.blueBook?.available)
        initialVerified.add("form_one_asses_ses_file");

      if (docs?.insuranceCertificate?.available)
        initialVerified.add("supp_asses_ses_file");

      if (docs?.supportingDocs?.available)
        initialVerified.add("other_doc_file");

      if (docs?.addressProof?.available)
        initialVerified.add("address_proof_file");
    }

    // 🟢 CASE 2: ISSUE CERTIFICATE (I)
    else if (action === "I") {

      const updated = new Set<string>();

      // ✅ STEP 1: Start with ALL previously checked fields
      verifiedFields.forEach(field => {
        initialVerified.add(field);
      });

      // ✅ STEP 2: Add Form-I if available
      if (docs?.formI?.available !== "PENDING") {
        initialVerified.add("signed_pdf_file");
      }

      // ✅ ALWAYS add payment verification
      initialVerified.add("fees_paid");
    }

    setVerifiedFields(initialVerified);

    const payload = {
      amendmentId: applicationId,
      comment: remark,
      remarkType: action,
      verifiedFields: Array.from(initialVerified).join(","),
      signedCertificateFileId: "",
    };

    try {
      const res = await axios.post(
        `${API_BASE}mtw/${applicationId}/${applicantUserId}/${alcUserId}/remark`,
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

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        if (!distCode || distCode == null) return;
        const districtNameRes = await axios.get<any>(
          `${API_BASE}district/${distCode}`,
        );
        setDistName(districtNameRes?.data.district_name);
        const subDivisionNameRes = await axios.get<any>(
          `${API_BASE}subdivision/${distCode}/${subDivCode}`,
        );
        setSubDivName(subDivisionNameRes?.data.sub_div_name);
        const blockNameRes = await axios.get<any>(
          `${API_BASE}block/${distCode}/${subDivCode}/${areaTypeCode}/${blockCode}`,
        );
        setBlockName(blockNameRes?.data.block_mun_name);
        const villageOrWardNameRes = await axios.get<any>(
          `${API_BASE}villageward/${blockCode}/${villageWardCode}`,
        );
        setVillageWardName(villageOrWardNameRes?.data.village_name);
        const policeStationNameRes = await axios.get<any>(
          `${API_BASE}policestation/${distCode}/${policeStationCode}`,
        );
        setPoliceStationName(policeStationNameRes?.data.name_of_police_station);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchAddressData();
  }, [distCode, subDivCode, areaTypeCode, blockCode, villageWardCode, policeStationCode, pinCode])


  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const applicationRes = await axios.get<any>(
          `${API_BASE}mtw/applications/${applicationId}/${alcUserId}/${applicantUserId}/general-details`,
          // `http://192.168.29.56:3000/clra/applications/3424/1094/general-details`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        console.log("applicationRes", applicationRes);

        setApplicationData(applicationRes.data);
        setEstablishmentData(applicationRes.data?.establishment);
        setDistCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.district);
        setSubDivCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.subdivision);
        setAreaTypeCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.areaType?.toLowerCase());
        setBlockCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.areaTypeCode);
        setVillageWardCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.villageOrWard);
        setPoliceStationCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.policeStation);
        setPinCode(applicationRes.data?.establishment?.mtwLocationAddress?.value?.pinCode);

        setTradeLicense(applicationRes.data?.documentsSummary?.tradeLicense?.available);
        setAoamoa(applicationRes.data?.documentsSummary?.aoaMoa?.available);
        setBlueBook(applicationRes.data?.documentsSummary?.blueBook?.available);
        setInsuranceCertificate(applicationRes.data?.documentsSummary?.insuranceCertificate?.available);
        setSupportingDocs(applicationRes.data?.documentsSummary?.supportingDocs?.available);
        setAddressProof(applicationRes.data?.documentsSummary?.addressProof?.available);
        setFormI(applicationRes.data?.documentsSummary?.formI?.available);

        setApplicationStatus(applicationRes.data?.applicationStatus?.status);
        setApplicationStatusType(applicationRes.data?.applicationStatus?.type);
        setApplicationStatusMsg(applicationRes.data?.applicationStatus?.message);
        setRegistrationNo(applicationRes.data?.applicationStatus?.registrationNumber);
        setRegistrationDate(applicationRes.data?.applicationStatus?.registrationDate);
        setQrCode(applicationRes.data?.applicationStatus?.qrCode);
        setCertificate(applicationRes.data?.applicationStatus?.certificateAvailable);

        const ownershipRes: any = applicationRes.data?.ownershipResult;
        const ownershipTableData: OwnershipRow[] = ownershipRes.map((r: any) => ({
          person_id: r.person_id ?? null,
          name: r.name ?? "",   // ✅ FIX: backend uses "name"
          designation: (r.designation ?? "").toUpperCase(),
          address: r.address ?? "-",   // ✅ THIS IS THE MAIN FIX
          verified: Boolean(r.verified),
        }));

        setOwnershipData(ownershipTableData);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchApplicationData();
  }, [afterSubmitRes])


  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        const remarkRes = await axios.get(
          `${API_BASE}mtw/applications/${applicationId}/${applicantUserId}/${alcUserId}/remarks`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        // console.log("remarkRes", remarkRes);

        if (!remarkRes.data) {
          setRemarkData([]);
          return;
        }

        const remarkTableData: RemarkData[] = remarkRes.data.result.map((r: any) => ({
          id: String(r.sl_no ?? ""),
          date: r.date_time
            ? new Date(r.date_time).toLocaleString()
            : "",
          remark: r.remark_text ?? "",
          status: renderStatusImage(r.remark_status) ?? <></>,
          remarkby: r.remark_by ?? "",
          remarkByUserId: r.remarkByUserId ?? "",
          act: (
            <button
              disabled={!r.can_delete}
              className={`p-1 ${r.can_delete
                ? "text-red-600 hover:text-red-800"
                : "text-gray-400 cursor-not-allowed"
                }`}
            >
              <MdDelete size={18} />
            </button>
          ),
        }));

        setRemarkData(remarkTableData);

      } catch (error) {
        console.error("API Error:", error);
        setRemarkData([]);
      }
    };

    fetchRemarkData();

  }, [afterSubmitRes]);


  useEffect(() => {
    const fetchRemarksInputDropdown = async () => {
      try {
        const remarkDropdownRes = await axios.get(
          `${API_BASE}mtw/${applicationId}/${applicantUserId}/alc/actions`,
          // `http://192.168.29.56:3000/clra/3424/4147/alc/actions`,
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
      <h1 className="text-xl mb-6">Details of Registration of Motor Transport Undertaking</h1>


      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Establishments Details</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <div className="border border-x-gray-400 border-t-gray-400 text-black">
              <div className="p-2 flex gap-2">
                <p><span className="font-semibold">NOTE:</span> All inputs are provided by Applicant. </p>
                <div className="flex gap-2">
                  <div className="flex gap-1">
                    <Checkbox
                      checked
                      className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                                  data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
                    />
                    <span>Verified</span>
                  </div>
                  <div className="flex gap-1">
                    <Checkbox
                      className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                                  data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
                    />
                    <span>Not verified</span>
                  </div>
                </div>
              </div>
            </div>

            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r font-semibold w-30">Sl. No.</TableHead>
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
              </TableBody>
            </Table>
          </div>
        </Card>



        {/* ----- Ownership Section Title ----- */}

        <Card className="p-3 text-white mt-5">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Ownership Details</span>
          </CardHeader>

          <div>
            <DataTable
              columns={ownershipColumns}
              data={ownershipData || []}
              striped
              // dense
              // highlightOnHover
              customStyles={{
                table: {
                  style: {
                    border: "1px solid #d1d5db", // full table border
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #d1d5db",
                    minHeight: "36px",
                  },
                },
                headCells: {
                  style: {
                    fontWeight: "600",
                    fontSize: "14px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    borderRight: "1px solid #d1d5db",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                  },
                },
                rows: {
                  style: {
                    fontSize: "14px",
                    minHeight: "32px",
                    borderBottom: "1px solid #e5e7eb",
                  },
                },
                cells: {
                  style: {
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    borderRight: "1px solid #e5e7eb",
                  },
                },
              }}
            />
          </div>
        </Card>



        {/* ----- Document Section Title ----- */}
        <Card className="p-3 text-white mt-5">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>UPLOADED DOCUMENTS</span>
          </CardHeader>

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
            </TableBody>
          </Table>
        </Card>

        {/* ----- Payment Section Title ----- */}
        <Card className="p-3 text-white mt-5">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Payment Details</span>
          </CardHeader>

          <Table className="border border-gray-400 rounded-md text-black">
            {/* <TableHeader>
              <TableRow>
                <TableHead className="border-r font-semibold">Sl. No.</TableHead>
                <TableHead className="border-r font-semibold">Parameters</TableHead>
                <TableHead className="border-r font-semibold">Inputs</TableHead>
                <TableHead className="font-semibold">Verified?</TableHead>
              </TableRow>
            </TableHeader> */}

            <TableBody>
              {paymentData.map((item) => (
                <TableRow key={item.id}>
                  {/* <TableCell className="border-r">{item.id}</TableCell> */}
                  <TableCell className="border-r">{item.parameters}</TableCell>
                  <TableCell className="border-r">{item.inputs}</TableCell>
                  <TableCell>{item.verified}</TableCell>
                </TableRow>
              ))}

              {applicationData?.applicationStatus?.status === "I" && regCertificateData.map((item) => (
                <TableRow key={item.id}>
                  {/* <TableCell className="border-r">{item.id}</TableCell> */}
                  <TableCell className="border-r">{item.parameters}</TableCell>
                  <TableCell className="border-r">{item.inputs}</TableCell>
                  {/* <TableCell>{item.verified}</TableCell> */}
                </TableRow>
              ))}

            </TableBody>
          </Table>
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
            <div className="flex justify-between">
              <p className="flex items-start gap-2 text-white mr-4">
                <MdDone className="text-2xl" />
                <span>
                  <strong>Current status: {applicationStatusMsg}</strong>
                  <br />
                  {applicationStatusDetailMsgMap[applicationStatus ?? ""] ?? ""}
                </span>
              </p>
              {/* {qrCode &&
              <QRCodeCanvas
                value={qrCode ?? ""}
                size={90}
                level="H"
                className="p-1 bg-white"
              />} */}
            </div>
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
      <Dialog open={feesModalOpen} onOpenChange={setFeesModalOpen}>
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
                  <TableHead className="text-white">NO OF WORKERS</TableHead>
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
                    <TableCell>{row.noOfWorkers}</TableCell>
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
              onClick={() => setFeesModalOpen(false)}
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
            {action === "V" || action === "VA" ?
              <label className="text-sm text-gray-700">
                Are you confirm that all data fields are checked which are given by the applicant?
              </label>
              : action === "I" ?
                <label className="text-sm text-gray-700">
                  Are you confirm that Form-I is uploaded correctly and payment details are verified by the applicant and checked?
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
                if (action === "V" || action === "VA" || action === "I") handleSubmitForVerify(e);
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

export default AlcApplicationsDetailsMTW;
