import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo, FaMagnifyingGlassPlus } from "react-icons/fa6";
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
} from "../../../Components/ui/dialog";

import { Card, CardHeader } from "../../../Components/ui/card";
import { Button } from "../../../Components/ui/button";
import { Checkbox } from "../../../Components/ui/checkbox";
import axios from "axios";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { Eye, EyeIcon } from "lucide-react";
import { IoDocument, IoDownload, IoInformationCircle, IoRemove } from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../Components/ui/accordion";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
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

interface AccordionData {
  id: string;
  parameters: string | ReactElement;
  inputs: string | ReactElement;
}

interface AccordionData2 {
  type: string;
  male: string | ReactElement;
  female: string | ReactElement;
  total: string | ReactElement;
}

interface AccordionData3 {
  id: string;
  parameters: string | ReactElement;
  inputs1: string | ReactElement;
  inputs2: string | ReactElement;
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
  formv_refno?: string;
  remark: string;
  datetime: string;
  status: ReactElement | string;
  remarkby: string;
  remarkByUserId?: string;
  act: ReactElement;
}

interface FeeRow {
  slNo: number;
  description: string;
  fee: string;
}



// --------------------- Auto Fill Rules ---------------------

const remarkRules: Record<string, string> = {
  "B": "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application.",
  "V": "Application is verified and approved. Certificate is issued.",
  "VA": "Application is approved.",
  "R": "Application is rejected due to discrepancies.",
  "BI": "Application is sent back to Inspector.",
};


// --------------------- Main Component ---------------------

const SelfCertificationViewDetails = () => {
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

  const [applicationStatus, setApplicationStatus] = useState<string>();
  const [applicationStatusType, setApplicationStatusType] = useState<string>();
  const [applicationStatusMsg, setApplicationStatusMsg] = useState<string>();
  const [registrationNo, setRegistrationNo] = useState<string>();
  const [registrationDate, setRegistrationDate] = useState<string>();
  const [qrCode, setQrCode] = useState<string>();
  const [certificate, setCertificate] = useState<string | null>(null);
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);
  const [remarkOptions, setRemarkOptions] = useState<Record<string, string>>({});
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [afterSubmitRes, setAfterSubmitRes] = useState<any>();
  const [afterDeleteRemark, setAfterDeleteRemark] = useState<any>();

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

  const estdData: AccordionData[] = [
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Name of the establishment</p>,
      inputs:
        <div>
          <p>{establishmentData?.name?.value ?? ""}</p>
        </div>,
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Address/Location of the establishment</p>,
      inputs:
        <div>
          <p>{villageWardName}, {blockName},</p>
          <p>{subDivName}, PS - {policeStationName},</p>
          <p>{distName}, PIN - {pinCode}</p>
        </div>,
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Phone Number</p>,
      inputs:
        establishmentData?.phoneNo?.value ?? "",
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Email Address</p>,
      inputs:
        establishmentData?.emailAddress?.value ?? "",
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Name of the Employer</p>,
      inputs:
        establishmentData?.employerName?.value ?? "",
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">Name of the Proprietor (if applicable)</p>,
      inputs:
        establishmentData?.proprietorName?.value ?? "",
    },
    {
      id: "",
      parameters: <p className="text-wrap wrap-break-word">List of partners/Directors</p>,
      inputs:
        <div>
          <p>{establishmentData?.partnersDirectors?.value ?? ""}</p>
        </div>,
    },
  ];

  const noOfWorkersData: AccordionData2[] = [
    {
      type: "Regular",
      male: establishmentData?.workers?.regular?.male ?? 0,
      female: establishmentData?.workers?.regular?.female ?? 0,
      total: establishmentData?.workers?.regular?.total ?? 0,
    },
    {
      type: "Contract",
      male: establishmentData?.workers?.contract?.male ?? 0,
      female: establishmentData?.workers?.contract?.female ?? 0,
      total: establishmentData?.workers?.contract?.total ?? 0,
    },
    {
      type: "Others",
      male: establishmentData?.workers?.others?.male ?? 0,
      female: establishmentData?.workers?.others?.female ?? 0,
      total: establishmentData?.workers?.others?.total ?? 0,
    },
    {
      type: "Total",
      male: establishmentData?.workers?.grandTotal?.male ?? 0,
      female: establishmentData?.workers?.grandTotal?.female ?? 0,
      total: establishmentData?.workers?.grandTotal?.total ?? 0,
    },
  ];

  const actsApplicableData: AccordionData[] = [
    {
      id: "I",
      parameters: <p className="text-wrap wrap-break-word">Minimum Wages Act, 1948 and Rules framed thereunder if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Minimum Wages Act, 1948 and Rules framed thereunder if")} disabled />,
    },
    {
      id: "II",
      parameters: <p className="text-wrap wrap-break-word">Payment of Wages Act, 1936 and Rules framed thereunder (other than those seen by the Factories Directorate) if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Payment of Wages Act, 1936 and Rules framed thereunder (other than those seen by the Factories Directorate) if")} disabled />,
    },
    {
      id: "III",
      parameters: <p className="text-wrap wrap-break-word">Contract Labour (Regulation and Abolition) Act, 1970 and Rules framed thereunder if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Contract Labour (Regulation and Abolition) Act, 1970 and Rules framed thereunder if")} disabled />,
    },
    {
      id: "IV",
      parameters: <p className="text-wrap wrap-break-word">Payment of Bonus Act, 1965 and Rules framed thereunder if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Payment of Bonus Act, 1965 and Rules framed thereunder if")} disabled />,
    },
    {
      id: "V",
      parameters: <p className="text-wrap wrap-break-word">Payment of Gratuity Act, 1972 and Rules framed thereunder if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Payment of Gratuity Act, 1972 and Rules framed thereunder if")} disabled />,
    },
    {
      id: "VI",
      parameters: <p className="text-wrap wrap-break-word">Maternity Benefit Act, 1961 and Rules framed thereunder(for those establishments where officers of labour commissioners are the inspectors) if</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Maternity Benefit Act, 1961 and Rules framed thereunder(for those establishments where officers of labour commissioners are the inspectors) if")} disabled />,
    },
    {
      id: "VII",
      parameters: <p className="text-wrap wrap-break-word">West Bengal Shops and Establishments Act, 1963 and Rules framed thereunder.</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("West Bengal Shops and Establishments Act, 1963 and Rules framed thereunder.")} disabled />,
    },
    {
      id: "VIII",
      parameters: <p className="text-wrap wrap-break-word">The Inter-State Migrant Workmen (RECS) Act, 1979 and Rules framed thereunder.</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The Inter-State Migrant Workmen (RECS) Act, 1979 and Rules framed thereunder.")} disabled />,
    },
    {
      id: "IX",
      parameters: <p className="text-wrap wrap-break-word">The Equal Remuneration Act, 1976 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The Equal Remuneration Act, 1976 and Rules framed thereunder")} disabled />,
    },
    {
      id: "X",
      parameters: <p className="text-wrap wrap-break-word">Motor Transport Workers Act, 1961 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Motor Transport Workers Act, 1961 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XI",
      parameters: <p className="text-wrap wrap-break-word">The Building and Other Construction Workers(RE&CSW), Act, and Rules framed thereunder other than provisions relating to safety and health</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The Building and Other Construction Workers(RE&CSW), Act, and Rules framed thereunder other than provisions relating to safety and health")} disabled />,
    },
    {
      id: "XII",
      parameters: <p className="text-wrap wrap-break-word">The Child Labour (P&R), Act, 1986 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The Child Labour (P&R), Act, 1986 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XIII",
      parameters: <p className="text-wrap wrap-break-word">The West Bengal Workmens House Rent Allowance Act, 1974 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The West Bengal Workmens House Rent Allowance Act, 1974 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XIV",
      parameters: <p className="text-wrap wrap-break-word">The West Bengal Payment of Subsistence Allowance Act, 1969 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The West Bengal Payment of Subsistence Allowance Act, 1969 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XV",
      parameters: <p className="text-wrap wrap-break-word">The Beedi and Cigar Workers (Condition of Employment) Act, 1966 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("The Beedi and Cigar Workers (Condition of Employment) Act, 1966 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XVI",
      parameters: <p className="text-wrap wrap-break-word">Working Journalist and other Newspaper Employees (Conditions of Service) and Miscellaneous Provisions Act, 1955 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Working Journalist and other Newspaper Employees (Conditions of Service) and Miscellaneous Provisions Act, 1955 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XVII",
      parameters: <p className="text-wrap wrap-break-word">West Bengal Labour Welfare Fund Act, 1974 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("West Bengal Labour Welfare Fund Act, 1974 and Rules framed thereunder")} disabled />,
    },
    {
      id: "XVIII",
      parameters: <p className="text-wrap wrap-break-word">Sales Promotion Employees (CS) Act, 1976 and Rules framed thereunder</p>,
      inputs: <Checkbox checked={establishmentData?.acts?.includes("Sales Promotion Employees (CS) Act, 1976 and Rules framed thereunder")} disabled />,
    },
  ];

  const getDocInput = (masterId: number) => {
    const upload = applicationData?.uploads?.find((u: any) => u.masterId === masterId);
    if (upload) {
      return (
        <a
          href={`${API_BASE}${upload.filePath.startsWith('/') ? upload.filePath.substring(1) : upload.filePath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
        >
          <Eye size={16} /> View Document
        </a>
      );
    }
    return <span className="text-gray-400">Not Uploaded / Not Applicable</span>;
  };

  const getDocIcon = (masterId: number) => {
    const upload = applicationData?.uploads?.find((u: any) => u.masterId === masterId);
    return (
      <div className={upload ? "text-amber-500 text-xl" : "text-gray-300 text-xl"}>
        {upload ? <IoMdDocument /> : <IoRemove />}
      </div>
    );
  };

  const submittedDocsInfoData: AccordionData3[] = [
    {
      id: "I",
      parameters: <p className="text-wrap wrap-break-word">Registration / License No. under Contract Labour (Regulation & Abolition) Act, 1970 and Rules framed thereunder</p>,
      inputs1: getDocIcon(21),
      inputs2: getDocInput(21),
    },
    {
      id: "II",
      parameters: <p className="text-wrap wrap-break-word">Registration Number under West Bengal Shops & Establishments Act, 1963 and Rules framed thereunder</p>,
      inputs1: getDocIcon(22),
      inputs2: getDocInput(22),
    },
    {
      id: "III",
      parameters: <p className="text-wrap wrap-break-word">Registration No. / License No. under the Inter-State Migrant Worksman (RECS) Act, 1979 and Rules framed thereunder</p>,
      inputs1: getDocIcon(23),
      inputs2: getDocInput(23),
    },
    {
      id: "IV",
      parameters: <p className="text-wrap wrap-break-word">Registration No. under Motor Transport Workers Act, 1961 and Rules framed thereunder</p>,
      inputs1: getDocIcon(24),
      inputs2: getDocInput(24),
    },
    {
      id: "V",
      parameters: <p className="text-wrap wrap-break-word">Registration No. under the Building & Other Construction Workers (RE & CSW), Act, 1996 and Rules framed thereunder</p>,
      inputs1: getDocIcon(25),
      inputs2: getDocInput(25),
    },
    {
      id: "VI",
      parameters: <p className="text-wrap wrap-break-word">Registration Number under the Beedi & Cigar Workers (Condition of Employment) Act, 1966 & Rules framed thereunder</p>,
      inputs1: getDocIcon(26),
      inputs2: getDocInput(26),
    },
    {
      id: "VII",
      parameters: <p className="text-wrap wrap-break-word">Registration No. West Bengal Labour Welfare Fund Act, 1974 and Rules framed thereunder</p>,
      inputs1: getDocIcon(27),
      inputs2: getDocInput(27),
    },
  ];

  const othersData: AccordionData[] = [
    {
      id: "E",
      parameters: <p className="text-wrap wrap-break-word">Specify the name of scheduled employment and wages paid:</p>,
      inputs: (
        <div className="font-semibold text-blue-900">
          {establishmentData?.employments && establishmentData.employments.length > 0 ? (
            establishmentData.employments.map((emp: string, i: number) => (
              <p key={i}>• {emp}</p>
            ))
          ) : (
            <span>N/A</span>
          )}
        </div>
      ),
    },
    {
      id: "F",
      parameters: <p className="text-wrap wrap-break-word">Whether appointment letters / ID Cards issued to all Employees:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.F ?? "N/A"}</span>,
    },
    {
      id: "G",
      parameters: <p className="text-wrap wrap-break-word">Whether required registered under all the relevant Acts maintained by the Principal Employer and Contractor:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.G ?? "N/A"}</span>,
    },
    {
      id: "H",
      parameters: <p className="text-wrap wrap-break-word">Whether returns as per Schedule under the Acts / Rules submitted before due date:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.H ?? "N/A"}</span>,
    },
    {
      id: "I",
      parameters: <p className="text-wrap wrap-break-word">Whether Maternity benefit extended to the women employees:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.I ?? "N/A"}</span>,
    },
    {
      id: "J",
      parameters: <p className="text-wrap wrap-break-word">Whether arrangements are made to pay the wages to the employees by 7th. / 10th. of the succeeding month:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.J ?? "N/A"}</span>,
    },
    {
      id: "K",
      parameters: <p className="text-wrap wrap-break-word">Whether retired / resigned etc. employees are paid gratuity, leave encashment etc. as per the provisions of Act / Rules</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.K ?? "N/A"}</span>,
    },
    {
      id: "L",
      parameters: <p className="text-wrap wrap-break-word">Whether the conditions of service, holidays, leaves, weeklyoffs etc. allowed to the employees under the relevant Act / Rules:</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.L ?? "N/A"}</span>,
    },
    {
      id: "M",
      parameters: <p className="text-wrap wrap-break-word">Nature of business</p>,
      inputs: <span className="font-bold uppercase text-blue-900">{establishmentData?.answers?.M ?? "N/A"}</span>,
    },
  ];

  const paymentsData: AccordionData[] = [
    {
      id: "GRN Number/Others Information",
      parameters: (
        <div>
          <p className="text-wrap wrap-break-word underline font-semibold">Grips Payment Details[Online/Counter]</p>
          <p className="text-wrap wrap-break-word">GRN:</p>
          <p className="text-wrap wrap-break-word">Total Amount:</p>
          <p className="text-wrap wrap-break-word">Transaction Date:</p>
          <p className="text-wrap wrap-break-word">Transaction Status:</p>
        </div>
      ),
      inputs: (
        <div>
          {applicationData?.paymentDetails ? (
            <>
              <p className="font-semibold text-blue-900">{applicationData.paymentDetails.grnNumber || "N/A"}</p>
              <p className="font-semibold text-blue-900">₹{applicationData.paymentDetails.amount || "0"}</p>
              <p className="font-semibold text-blue-900">{applicationData.paymentDetails.transactionDate || "N/A"}</p>
              <p className="font-bold text-green-700 uppercase">{applicationData.paymentDetails.status || "N/A"}</p>
            </>
          ) : (
            <span className="text-gray-400">No payment details available</span>
          )}
        </div>
      ),
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
    Issued: `${IMAGE_BASE}btn-issued.png`,
    "Certificate Issued": `${IMAGE_BASE}btn-issued.png`,
    Rectification: `${IMAGE_BASE}btn-rectification.png`,
    Backed: `${IMAGE_BASE}btn-rectification.png`,
    "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
    "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
    Rejected: `${IMAGE_BASE}btn-reject.png`,
    Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
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

  const applicationStatusDetailMsgMap: Record<string, string> = {
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
        `${API_BASE}self-cert/alc/applications/${encodeURIComponent(applicationId ?? "")}/remark`,
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
        `${API_BASE}self-cert/alc/applications/${encodeURIComponent(applicationId ?? "")}/remark`,
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

  const handleViewCertificate = async () => {
    if (!applicationId) return;
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}self-cert/alc/application-form/${encodeURIComponent(applicationId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate certificate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to download certificate PDF");
    }
  };


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
          `${API_BASE}self-cert/alc/applications/${encodeURIComponent(applicationId ?? "")}/general-details`,
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
        setAreaTypeCode(applicationRes.data.establishment.locationAddress?.value?.areaType?.toLowerCase());
        setBlockCode(applicationRes.data.establishment.locationAddress?.value?.areaTypeCode);
        setVillageWardCode(applicationRes.data.establishment.locationAddress?.value?.villageOrWard);
        setPoliceStationCode(applicationRes.data.establishment.locationAddress?.value?.policeStation);
        setPinCode(applicationRes.data.establishment.locationAddress?.value?.pinCode);

        setTradeLicense(applicationRes.data.documentsSummary.doc1?.available);
        setAoamoa(applicationRes.data.documentsSummary.doc2?.available);
        setFactoryLicense(applicationRes.data.documentsSummary.doc3?.available);
        setOtherStateCertificate(applicationRes.data.documentsSummary.doc4?.available);
        setSupportingDocs(applicationRes.data.documentsSummary.doc5?.available);
        setFormI(applicationRes.data.documentsSummary.doc6?.available ? 'UPLOADED' : 'PENDING');
        setPreviousCertificate(applicationRes.data.documentsSummary.doc7?.available ? 'UPLOADED' : 'PENDING');

        setApplicationStatus(applicationRes.data.applicationStatus.status);
        setApplicationStatusType(applicationRes.data.applicationStatus.statusType);
        setApplicationStatusMsg(applicationRes.data.applicationStatus.message);
        setRegistrationNo(applicationRes.data.applicationStatus.registrationNumber);
        setRegistrationDate(applicationRes.data.applicationStatus.registrationDate);
        setQrCode(applicationRes.data.applicationStatus.qrCode);
        setCertificate(applicationRes.data.applicationStatus.certificate);

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
          `${API_BASE}self-cert/alc/applications/${encodeURIComponent(applicationId ?? "")}/get-remark`,
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
          datetime: r.dateTime
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
          `${API_BASE}self-cert/alc/applications/${encodeURIComponent(applicationId ?? "")}/actions`,
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
      <h1 className="text-xl mb-6">Application Details of Self Certification</h1>

      {/* --------------------- Estd & Contractor Data ---------------- */}
      <div className="w-full grid gap-4">
        {/* ================= ESTABLISHMENT BLOCK ================= */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="border rounded-md p-3 bg-white shadow-sm"
        >
          <AccordionItem value="item-1" defaultValue="item-1">
            <AccordionTrigger className="bg-sky-700 py-4 px-3 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              A. Particulars Of Establishment
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
                      {/* <TableHead className="border-r w-20">Sl</TableHead> */}
                      <TableHead className="border-r w-[320px]">Parameters</TableHead>
                      <TableHead className="border-r">Inputs</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {estdData.map((item) => (
                      <TableRow key={item.id}>
                        {/* <TableCell className="border-r">{item.id}</TableCell> */}
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

        {/* ================= No. of Workers Employed ================= */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-2"
          className="border rounded-md p-3 bg-white shadow-sm"
        >
          <AccordionItem value="item-2">
            <AccordionTrigger className="bg-sky-700 py-4 px-3 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              B. No. of Workers Employed
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
                      <TableHead className="border-r w-20">TYPE OF WORKER</TableHead>
                      <TableHead className="border-r w-[320px]">MALE</TableHead>
                      <TableHead className="border-r w-[320px]">FEMALE</TableHead>
                      <TableHead className="border-r">TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {noOfWorkersData.map((item) => (
                      <TableRow key={item.type}>
                        <TableCell className="border-r">{item.type}</TableCell>
                        <TableCell className="border-r">{item.male}</TableCell>
                        <TableCell className="border-r">{item.female}</TableCell>
                        <TableCell className="border-r">{item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>


      {/* --------------------- C ------------------ */}
      <div className="mt-5">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-3"
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-3">
            <AccordionTrigger className="bg-sky-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              C. List of Acts applicable to the establishment
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap justify-between">
                <div className="p-3 rounded-none w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    {/* <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">Sl</TableHead>
                        <TableHead className="border-r font-semibold">Parameters</TableHead>
                        <TableHead className="border-r font-semibold">Inputs</TableHead>
                      </TableRow>
                    </TableHeader> */}

                    <TableBody>
                      {actsApplicableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r w-20">{item.id}</TableCell>
                          <TableCell className="border-r">{item.parameters}</TableCell>
                          <TableCell className="border-r">{item.inputs}</TableCell>
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

      {/* --------------------- D ------------------ */}
      <div className="mt-5">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-4"
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-4">
            <AccordionTrigger className="bg-sky-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              D. Submitted Documents and Information [whichever is applicable]
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap justify-between">
                <div className="p-3 rounded-none w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    {/* <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">Sl</TableHead>
                        <TableHead className="border-r font-semibold">Parameters</TableHead>
                        <TableHead className="border-r font-semibold">Inputs</TableHead>
                      </TableRow>
                    </TableHeader> */}

                    <TableBody>
                      {submittedDocsInfoData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r w-20">{item.id}</TableCell>
                          <TableCell className="border-r">{item.parameters}</TableCell>
                          <TableCell className="border-r">{item.inputs1}</TableCell>
                          <TableCell className="border-r">{item.inputs2}</TableCell>
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

      {/* --------------------- Others ------------------ */}
      <div className="mt-5">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-5"
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-5">
            <AccordionTrigger className="bg-sky-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              Others Information
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap justify-between">
                <div className="p-3 rounded-none w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    {/* <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">Sl</TableHead>
                        <TableHead className="border-r font-semibold">Parameters</TableHead>
                        <TableHead className="border-r font-semibold">Inputs</TableHead>
                      </TableRow>
                    </TableHeader> */}

                    <TableBody>
                      {othersData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r w-20">{item.id}</TableCell>
                          <TableCell className="border-r">{item.parameters}</TableCell>
                          <TableCell className="border-r">{item.inputs}</TableCell>
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

      {/* --------------------- Payment ------------------ */}
      <div className="mt-5">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-6"
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <AccordionItem value="item-6">
            <AccordionTrigger className="bg-sky-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
              Payment Information
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                          text-white text-xl font-bold
                          before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right"
              />
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap justify-between">
                <div className="p-3 rounded-none w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    {/* <TableHeader>
                      <TableRow>
                        <TableHead className="border-r font-semibold">Sl</TableHead>
                        <TableHead className="border-r font-semibold">Parameters</TableHead>
                        <TableHead className="border-r font-semibold">Inputs</TableHead>
                      </TableRow>
                    </TableHeader> */}

                    <TableBody>
                      {paymentsData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="border-r">{item.id}</TableCell>
                          <TableCell className="border-r">{item.parameters}</TableCell>
                          <TableCell className="border-r">{item.inputs}</TableCell>
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

      {/* --------------------- Certificate Information (If Issued) ------------------ */}
      {(applicationStatus === "I" || applicationStatus === "Issued" || applicationStatusType === "I") && (
        <div className="mt-5">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-certificate"
            className="border rounded-lg p-2 bg-white shadow-sm"
          >
            <AccordionItem value="item-certificate">
              <AccordionTrigger className="bg-green-700 p-4 m-1 text-white rounded-none hover:no-underline [&>svg]:hidden relative">
                Registration Certificate Details
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2
                            text-white text-xl font-bold
                            before:content-['+']
              group-data-[state=open]:before:content-['-'] float-right"
                />
              </AccordionTrigger>

              <AccordionContent>
                <div className="p-3 rounded-none w-full">
                  <Table className="border border-gray-400 rounded-md text-black">
                    <TableBody>
                      {/* <TableRow>
                        <TableCell className="border-r w-[320px]">Registration Number</TableCell>
                        <TableCell className="border-r font-bold text-green-700">{registrationNo || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border-r">Registration Date</TableCell>
                        <TableCell className="border-r font-bold text-green-700">{registrationDate || "N/A"}</TableCell>
                      </TableRow> */}
                      <TableRow>
                        <TableCell className="border-r">Self Certification Registration Certificate</TableCell>
                        <TableCell className="border-r">
                          <div className="flex gap-3 items-center justify-center">
                            <button
                              onClick={handleViewCertificate}
                              className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1 text-sm font-semibold"
                            >
                              <IoDownload />
                              Signed Self Certification Registration Certificate
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* --------------------- CURRENT STATUS --------------------- */}
      <div className="mt-5">
        {applicationStatusType === "warning" || applicationStatusType === "info" ? (
          <Card className="bg-amber-500 p-5">
            <p className="flex items-start gap-2 text-white">
              <IoMdWarning className="text-2xl" />
              <span>
                <strong>Current status: {applicationStatusMsg}</strong>
                <br />
                {applicationStatusDetailMsgMap[applicationStatusType ?? ""] ?? ""}
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
                  {applicationStatusDetailMsgMap[applicationStatusType ?? ""] ?? ""}
                </span>
              </p>
            </Card>
          )
        )}
      </div>

      {/* --------------------- ACTION & REMARK --------------------- */}
      {applicationStatus !== "I" && applicationStatus !== "Issued" && applicationStatusType !== "I" && (
        <div className="mt-5">
          <Card className="p-3 text-black">
            <CardHeader className="bg-[#D2D6DE] flex items-center p-4">
              <GrNotes /> <span>Action & Remark</span>
            </CardHeader>

            <form className="m-auto w-full sm:w-2/3 lg:w-1/3 p-5" onSubmit={handleSubmit}>
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
                <TableHead className="text-white border-r">SL. NO.</TableHead>
                {/* <TableHead className="text-white border-r">FORM-V / REF NO.</TableHead> */}
                <TableHead className="text-white border-r">DATE & TIME</TableHead>
                <TableHead className="text-white border-r">REMARK</TableHead>
                <TableHead className="text-white border-r">STATUS</TableHead>
                <TableHead className="text-white border-r">REMARK BY</TableHead>
                {/* <TableHead className="text-white">ACTION</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {remarkData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border-r">{item.id}</TableCell>
                  {/* <TableCell className="border-r">{item.formv_refno}</TableCell> */}
                  <TableCell className="border-r">{item.datetime}</TableCell>
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

    </div>
  );
};

export default SelfCertificationViewDetails;
