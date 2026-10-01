import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdDocument, IoMdWarning } from "react-icons/io";
import QRCode from "qrcode";
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
import { getUserId } from "../../../utils/auth";
import { IoInformationCircle } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { generateFormIPdfTemplate } from "./ClraPePdfTemplates";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { API_BASE, AUTH_STORAGE_KEY, IMAGE_BASE } from "@/constants/constants";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  clearAlcClraApplication,
  fetchAlcClraActions,
  fetchAlcClraApplication,
  fetchAlcClraRemarks,
  selectAlcClraApplicationState,
  submitAlcClraAction,
} from "@/store/alcClraApplicationSlice";


// --------------------- Data Interfaces ---------------------
interface PrincipleEmpData {
  id: string;
  parameters: string | ReactElement;
  inputs: ReactElement | String;
  verified: ReactElement;
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
  description: string;
  fee: string;
}

interface ContractorModalRow {
  contractorId: number;
  contractorName: string;
  contractorEmail: string;
  contractorAddress: string;
  natureOfWork: string;
  maxNoOfContractLabour: string;
  dateOfEmployment: string;
  status: ReactElement;
}

const feeData: FeeRow[] = [
  { slNo: 1, description: "Does not exceed less or equal to 20	", fee: "₹200" },
  { slNo: 2, description: "Exceeds 20 but does not exceed 50	", fee: "₹500" },
  { slNo: 3, description: "Exceeds 50 but does not exceed 100	", fee: "₹1000" },
  { slNo: 4, description: "Exceeds 100 but does not exceed 200	", fee: "₹2000" },
  { slNo: 5, description: "Exceeds 200 but does not exceed 400	", fee: "₹4000" },
  { slNo: 6, description: "Exceeds 400	", fee: "₹5000" },
];

// --------------------- Auto Fill Rules ---------------------
const remarkRules: Record<string, string> = {
  "B": "Application is sent back for rectification.",
  "U": "Application is sent back for rectification of Form-I. Kindly modify and re-upload Form-I.",
  "V": "Application is verified, applicant is allowed to pay the fees.",
  "VA": "Application is approved.",
  "R": "Application is rejected due to discrepancies.",
  "I": "Congratulations!! Certificate is issued.",
};

// --------------------- Main Component ---------------------
const AlcVisibleApplications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { applicationId, applicantUserId } = useParams<{ applicationId: string, applicantUserId: string }>();

  const alcUserId = getUserId();
  const enApplicationId = encryptionDecryptionFun("encrypt", String(applicationId)) ?? '';
  const safeApplicationId = encodeURIComponent(enApplicationId);

  const [action, setAction] = useState("");
  const [remark, setRemark] = useState("");
  const [applicationData, setApplicationData] = useState<any>();
  const [establishmentData, setEstablishmentData] = useState<any>();
  const [feesModalOpen, setFeesModalOpen] = useState(false);
  // const [contractorModalOpen, setContractorModalOpen] = useState(false);

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

  const [distCodePE, setDistCodePE] = useState<string | number | null>();
  const [subDivCodePE, setSubDivCodePE] = useState<string | number | null>();
  const [distNamePE, setDistNamePE] = useState<string | null>();
  const [subDivNamePE, setSubDivNamePE] = useState<string | null>();
  const [areaTypeCodePE, setAreaTypeCodePE] = useState<string | null>();
  const [blockCodePE, setBlockCodePE] = useState<string | number | null>();
  const [blockNamePE, setBlockNamePE] = useState<string | null>();
  const [villageWardCodePE, setVillageWardCodePE] = useState<string | number | null>();
  const [villageWardNamePE, setVillageWardNamePE] = useState<string | null>();
  const [policeStationCodePE, setPoliceStationCodePE] = useState<string | null>();
  const [policeStationNamePE, setPoliceStationNamePE] = useState<string | null>();
  const [pinCodePE, setPinCodePE] = useState<string | number | null>();

  const [distCodeManager, setDistCodeManager] = useState<string | number | null>();
  const [subDivCodeManager, setSubDivCodeManager] = useState<string | number | null>();
  const [distNameManager, setDistNameManager] = useState<string | null>();
  const [subDivNameManager, setSubDivNameManager] = useState<string | null>();
  const [areaTypeCodeManager, setAreaTypeCodeManager] = useState<string | null>();
  const [blockCodeManager, setBlockCodeManager] = useState<string | number | null>();
  const [blockNameManager, setBlockNameManager] = useState<string | null>();
  const [villageWardCodeManager, setVillageWardCodeManager] = useState<string | number | null>();
  const [villageWardNameManager, setVillageWardNameManager] = useState<string | null>();
  const [policeStationCodeManager, setPoliceStationCodeManager] = useState<string | null>();
  const [policeStationNameManager, setPoliceStationNameManager] = useState<string | null>();
  const [pinCodeManager, setPinCodeManager] = useState<string | number | null>();

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

  const [tradeUnionData, setTradeUnionData] = useState<TradeUnionData[]>([]);
  const [particularsCCLData, setParticularsCCLData] = useState<ParticularsCCLData[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<ContractorModalRow | null>(null);
  const [contractorModalOpen, setContractorModalOpen] = useState(false);
  const [selectedTradeUnion, setSelectedTradeUnion] = useState<any>(null);
  const [tradeUnionModalOpen, setTradeUnionModalOpen] = useState(false);

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
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const {
    application,
    remarks,
    remarkOptions: remarkOptionsState,
    loading,
    submitting
  } = useSelector(selectAlcClraApplicationState);

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
    const dynamicData = {
      establishmentName: establishmentData?.name?.value,
      establishmentAddress: `${establishmentData?.locationAddress?.value?.name}, <br/> ${villageWardName}, ${blockName}, ${subDivName}, <br/> Dist - ${distName}, PIN - ${pinCode}`,
      postalAddress: `${establishmentData?.postalAddress?.value?.address}, <br/> ${villageWardNamePostal}, ${blockNamePostal}, ${subDivNamePostal}, <br/> Dist - ${distNamePostal}, PIN - ${pinCodePostal}`,
      principalEmployerName: applicationData?.principalEmployer?.name?.value,
      principalEmployerAddress: applicationData?.principalEmployer?.address?.value,
      managerName: applicationData?.managers?.name?.value,
      managerAddress: `${applicationData?.managers?.address?.value?.address}, <br/> ${villageWardNameManager}, ${blockNameManager}, ${subDivNameManager}, <br/> Dist - ${distNameManager}, PIN - ${pinCodeManager}`,
      natureOfWork: applicationData?.natureofworks?.value,
      maxDirectWorkers: applicationData?.workmanDetails?.anydaymaxworkmen?.value,
      permanentWorkers: applicationData?.workmanDetails?.workmenreg?.value,
      temporaryWorkers: applicationData?.workmanDetails?.tempOrRegularCount?.value,
      sameWork: applicationData?.workmanDetails?.sameOrSimilarWork?.value === 1 ? "Yes" : "No",
      jobDescription: applicationData?.workmanDetails?.jobDescription?.value,
      wageBenefits: applicationData?.workmanDetails?.wageAndBenefits?.value,
      categoryDesignation: applicationData?.workmanDetails?.categoryDesignation?.value,

      maxContractLabour: "",
      registrationNo: registrationNo ?? "",
      // registrationDate: registrationDate,
      registrationDate: `${(new Date(registrationDate ?? ""))?.toLocaleDateString() ?? ""}`,
      applicationDate: `${new Date().toLocaleDateString()}`,

      // date: new Date().toLocaleDateString(),
      contractors: applicationData?.contractorsInfo?.map((con: any, index: number) => ({
        name: con.name_of_contractor ?? "",
        address: con.address_of_contractor ?? "",
        nature: con.natureofwork ?? "",
        maxLabour: con.contractor_max_no_of_labours_on_any_day ?? "",
        from: `${new Date(con.est_date_of_work_of_each_labour_from_date).toLocaleDateString()}`,
        to: `${new Date(con.est_date_of_work_of_each_labour_to_date).toLocaleDateString()}`
      })),

      tradeUnions: applicationData?.tradeUnions?.map((tu: any) => ({
        regnNo: tu.e_trade_union_regn_no ?? "",
        name: tu.e_trade_union_name ?? "",
        address: tu.e_trade_union_address ?? "",
      })) ?? [],
    };

    const htmlContent = generateFormIPdfTemplate(dynamicData);

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // printWindow.onload = function () {
      //   printWindow.focus();
      //   printWindow.print();  // Opens print dialog
      // };
    }
  };

  const handleGenerateCLRARegCert = async () => {
    if (!applicationId || !applicantUserId) return;
    try {
      const response = await axios.get(
        `${API_BASE}certificate/formII/clra`,
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
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(blobUrl, "_blank");

    } catch (error: any) {
      console.error("Error fetching Certificate PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  const handleViewPdfDocuments = async (documentCode: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}documents?enapplicationId=${safeApplicationId}&documentCode=${documentCode}&source=D`,
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

    } catch (error: any) {
      console.error("Error fetching PDF:", error);
      alert("Unable to fetch document.");
    }
  };


  const registrationData: AppData[] = [
    {
      id: "#",
      parameters:
        <div>
          <p className="text-wrap wrap-break-word">Registration number/date(Offline)</p>
        </div>,
      inputs:
        <div className="flex flex-wrap gap-2">
          <p><span className="font-semibold">Reg. No.:-</span> {registrationNo}</p>
          <p><span className="font-semibold">Date:-</span> {(new Date(registrationDate ?? ""))?.toLocaleDateString() ?? ""}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("reg_offline")}
          disabled
          onCheckedChange={() => toggleVerifiedField("reg_offline")}
        />,
    },
  ];

  const appData: AppData[] = [
    {
      id: "5.",
      parameters:
        <p className="text-wrap wrap-break-word">
          Nature of work carried on in the establishment
        </p>,
      inputs:
        <div className="flex gap-4">
          <p className="text-wrap wrap-break-word">{applicationData?.natureofworks?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_nature_of_work")}
          onCheckedChange={() => toggleVerifiedField("e_nature_of_work")}
        />,
    },
    {
      id: "5.(a)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Maximum number of workmen employed directly on any day in the establishment
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.anydaymaxworkmen?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("max_num_wrkmen")}
          onCheckedChange={() => toggleVerifiedField("max_num_wrkmen")}
        />,
    },
    {
      id: "5.(b)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of workmen engaged as permanent/regular workmen
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.workmenreg?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_num_of_workmen_per_or_reg")}
          onCheckedChange={() => toggleVerifiedField("e_num_of_workmen_per_or_reg")}
        />,
    },
    {
      id: "5.(c)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Number of workmen engaged as temporary/regular workmen
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.tempOrRegularCount?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_num_of_workmen_temp_or_reg")}
          onCheckedChange={() => toggleVerifiedField("e_num_of_workmen_temp_or_reg")}
        />,
    },
    {
      id: "5.(d)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Whether the workmen employed/intended to be employment by the contractor perform the same or similar kind of work as the workmen employed directly by the Principal Employer (if yes, please give here information as detailed below:)
        </p>,
      inputs:
        <div className="flex gap-4">
          {applicationData?.workmanDetails?.sameOrSimilarWork?.value === 1 ? <p>Yes</p> : <p>No</p>}
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("workmen_if_same_similar_kind_of_work")}
          onCheckedChange={() => toggleVerifiedField("workmen_if_same_similar_kind_of_work")}
        />,
    },
    {
      id: "5.d.i)",
      parameters:
        <p className="text-wrap wrap-break-word">
          A complete job description of the contractor labour
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.jobDescription?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("con_lab_job_desc")}
          onCheckedChange={() => toggleVerifiedField("con_lab_job_desc")}
        />,
    },
    {
      id: "5.d.ii)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Wage rates and other cash benefits paid/to be paid
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.wageAndBenefits?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("con_lab_wage_rate_other_benefits")}
          onCheckedChange={() => toggleVerifiedField("con_lab_wage_rate_other_benefits")}
        />,
    },
    {
      id: "5.d.iii)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Category/designation/nomenclature of the job
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.categoryDesignation?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("con_lab_cat_desig_nom")}
          onCheckedChange={() => toggleVerifiedField("con_lab_cat_desig_nom")}
        />,
    },
    {
      id: "5.(e)",
      parameters:
        <p className="text-wrap wrap-break-word">
          Settlement or award or judgement or minimum wages (if any applicable in the establishment)
        </p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.workmanDetails?.settlementAward?.value}</p>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_settlement_award_judgement_min_wage")}
          onCheckedChange={() => toggleVerifiedField("e_settlement_award_judgement_min_wage")}
        />,
    },
    {
      id: "6.",
      parameters:
        <p className="text-wrap wrap-break-word font-semibold">
          Maximum number of contract labour to be employed on any day through each contractor
        </p>,
      inputs:
        <div className="flex gap-4">
          <div className="flex gap-2">
            <p>{applicationData?.workmanDetails?.maxNumberOfContractLabour?.value}</p>
            <p className="text-green-700">[FEES IS CALCULATED BASED ON THIS VALUE]</p>
          </div>
          <button className="flex gap-1 bg-sky-500 text-white rounded-sm px-2 py-1" onClick={() => setFeesModalOpen(true)}><IoInformationCircle size={15} /> Fees Chart</button>
        </div>,
      // verified: applicationData?.managers?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_any_day_max_num_of_workmen")}
          onCheckedChange={() => toggleVerifiedField("e_any_day_max_num_of_workmen")}
        />,
    },
  ];

  const principleEmpData: AppData[] = [
    {
      id: "1.(a)",
      parameters:
        <div>
          <p className="text-wrap wrap-break-word">Full name of the Principle Employer</p>
        </div>,
      inputs:
        <div>
          <p className="uppercase">{applicationData?.principalEmployer?.name?.value}</p>
        </div>,
      verified:
        // <input
        //   type="checkbox"
        //   checked={verifiedFields.has("pe_name")}
        //   onChange={() => toggleVerifiedField("pe_name")}
        // />,
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("pe_details")}
          onCheckedChange={() => toggleVerifiedField("pe_details")}
        />,
    },
    {
      id: "1.(b)",
      parameters: "Gender",
      inputs:
        applicationData?.principalEmployer?.gender?.value,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("gender_pe")}
          onCheckedChange={() => toggleVerifiedField("gender_pe")}
        />,
    },
    {
      id: "1.(c)",
      parameters:
        <div>
          <p className="text-wrap wrap-break-word">Address of the Principal Employer</p>
        </div>,
      inputs:
        <div className="">
          <p className="text-wrap wrap-break-word">{applicationData?.principalEmployer?.address?.value},</p>
          <p className="text-wrap wrap-break-word">PS - {policeStationNamePE}, {villageWardNamePE},</p>
          <p className="text-wrap wrap-break-word">{blockNamePE}, {subDivNamePE},</p>
          <p className="text-wrap wrap-break-word">Dist - {distNamePE}, PIN - {pinCodePE}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("pe_details")}
          onCheckedChange={() => toggleVerifiedField("pe_details")}
        />,
    },
  ];

  const managerData: AppData[] = [
    {
      id: "2.(a)",
      parameters: <p className="text-wrap wrap-break-word">Full name of the Manager or person responsible for the supervision and control of the establishment</p>,
      inputs:
        <div className="flex gap-4">
          <p>{applicationData?.managers?.name?.value}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("man_details")}
          onCheckedChange={() => toggleVerifiedField("man_details")}
        />,
    },
    {
      id: "2.(b)",
      parameters: <p className="text-wrap wrap-break-word">Address of the Manager or person responsible for the supervision and control of the establishment</p>,
      inputs:
        <div className="">
          <p className="text-wrap wrap-break-word">{applicationData?.managers?.address?.value?.address},</p>
          <p className="text-wrap wrap-break-word">PS - {policeStationNameManager}, {villageWardNameManager},</p>
          <p className="text-wrap wrap-break-word">{blockNameManager}, {subDivNameManager},</p>
          <p className="text-wrap wrap-break-word">Dist - {distNameManager}, PIN - {pinCodeManager}</p>
        </div>,
      // verified: applicationData?.directors?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("man_details")}
          onCheckedChange={() => toggleVerifiedField("man_details")}
        />,
    },
  ];

  const nameLocEstdData: AppData[] = [
    {
      id: "3.(a)",
      parameters: "Name of the Establishment",
      inputs:
        <div>
          <p className="font-semibold">{establishmentData?.name?.value ?? ""}</p>
        </div>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("e_name")}
          onCheckedChange={() => toggleVerifiedField("e_name")}
        />,
    },
    {
      id: "3.(b)",
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
      id: "3.(c)",
      parameters: "Location of the Establishment",
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{establishmentData?.locationAddress?.value?.name},</p>
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
  ];

  const ofcAddrEstdData: AppData[] = [
    {
      id: "4.(a)",
      parameters: "Postal Address of the Establishment",
      inputs:
        <div>
          <p className="text-wrap wrap-break-word">{establishmentData?.postalAddress?.value?.address},</p>
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
  ];

  const docData: DocData[] = [
    {
      id: "i)",
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
      id: "ii)",
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
      id: "iii)",
      parameters: <p className="text-wrap wrap-break-word">Any other document in support of correctness of the particulars mentioned in the application if required</p>,
      inputs: "",
      icon1:
        supportingDocs ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("ODSC") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: factoryLicense ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.factoryLicense?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("other_doc_file")}
          onCheckedChange={() => toggleVerifiedField("other_doc_file")}
        />,
    },
    {
      id: "iv)",
      parameters: <p className="text-wrap wrap-break-word">Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.</p>,
      inputs: "",
      icon1:
        otherStateCertificate ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("CR") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: otherStateCertificate ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.otherCertificates?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("certificate_other_states")}
          onCheckedChange={() => toggleVerifiedField("certificate_other_states")}
        />,
    },
    {
      id: "v)",
      parameters: <p className="text-wrap wrap-break-word">Factory License if any</p>,
      inputs: "",
      icon1:
        factoryLicense ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("FL") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: supportingDocs ?<FaMagnifyingGlass className="text-2xl text-black" /> : <p>No Document Uploaded</p>,
      // verified: applicationData?.documentsSummary?.supportingDocs?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("factory_license_file")}
          onCheckedChange={() => toggleVerifiedField("factory_license_file")}
        />,
    },
    {
      id: "vi)",
      parameters: "FORM-I",
      inputs: "",
      icon1:
        formI !== "PENDING" ?
          <div className="flex gap-1">
            <button onClick={() => { handleViewPdfDocuments("FI") }}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <button onClick={handleGenerateFormIPdf} className="text-amber-500">Generated Form-I</button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p className="text-wrap wrap-break-word">Form I will be uploaded after fees payment</p>,
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.formI?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("signed_pdf_file")}
          onCheckedChange={() => toggleVerifiedField("signed_pdf_file")}
        />,
    },
    {
      id: "vii)",
      parameters: <p className="text-wrap wrap-break-word">Previous Registration Certificate</p>,
      inputs: "",
      icon1:
        previousCertificate !== "NOT_AVAILABLE" ?
          <div className="flex gap-1">
            <button><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <FaMagnifyingGlass className="text-2xl text-black" />
          </div>
          : <p className="text-wrap wrap-break-word">For Previous Registered Applicant, this certificate should be uploaded</p>,
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified:
        <Checkbox
          className="border-gray-400 bg-gray-200 data-[state=checked]:bg-sky-500 h-5 w-5 [&_svg]:h-4 [&_svg]:w-4
                      data-[state=checked]:border-sky-500 data-[state=checked]:text-white"
          checked={verifiedFields.has("certificates_fid")}
          onCheckedChange={() => toggleVerifiedField("certificates_fid")}
        />,
    },
  ];

  const docDataRegCertificate: DocData[] = [
    {
      id: "viii)",
      parameters: <p className="text-wrap wrap-break-word">Registration Certificate</p>,
      inputs: "",
      icon1:
        certificate ?
          <div className="flex gap-1">
            <button onClick={handleGenerateCLRARegCert}><IoMdDocument className="text-yellow-500 text-2xl" /></button>
            <p className="font-semibold">[{registrationNo}]</p>
          </div>
          : <p>No Document Uploaded</p>,
      // icon2: <></>,
      // verified: applicationData?.documentsSummary?.previousCertificate?.verified ? <input type="checkbox" checked/> : <input type="checkbox"/>,
      verified: certificate ?
        <p className="text-gray-500">Issued by ALC</p> :
        <></>
      // <input
      //   type="checkbox"
      //   checked={verifiedFields.has("backlog_certificate")}
      //   onChange={() => toggleVerifiedField("backlog_certificate")}
      // />,
    },
  ];

  const paymentData: AppData[] = [
    {
      id: "8.i)",
      parameters: <p className="text-red-600">Payable Amount: ₹{applicationData?.paymentDetails.feesPayable ?? ""}</p>,
      inputs:
        <div className="">
          <p>Total Amount: ₹{Number(applicationData?.paymentDetails?.amountPayable) + Number(applicationData?.paymentDetails?.feesPaid)}</p>
          <p>Total Fees Paid: ₹{applicationData?.paymentDetails?.feesPaid ?? ""}</p>
          <p>Amount Payable: ₹{applicationData?.paymentDetails?.amountPayable ?? ""}</p>

          {applicationData?.paymentDetails?.paymentDetails?.status === "SUCCESS" ? <>
            <p className="font-semibold">GRIPS Payment [Online / Counter]</p>
            <p>Paid Amount: ₹{applicationData?.paymentDetails?.paymentDetails?.amount ?? "Not available"}</p>
            <p>GRN: {applicationData?.paymentDetails?.paymentDetails?.grn ?? "Not available"}</p>
            <p>Identification Number: {applicationData?.paymentDetails?.paymentDetails?.identificationNo ?? "Not available"}</p>
            <p>Transaction Id: {applicationData?.paymentDetails?.paymentDetails?.transactionId ?? "Not available"}</p>
            <p>Bank Transaction Id: {applicationData?.paymentDetails?.paymentDetails?.bankTransactionId ?? "Not available"}</p>
            <p>Transaction Date: {applicationData?.paymentDetails?.paymentDetails?.transactionDate ?? "Not available"}</p>
            <p>Transaction Status: {applicationData?.paymentDetails?.paymentDetails?.status ?? "Not available"}</p>
            <p>IFSC Code: {applicationData?.paymentDetails?.paymentDetails?.ifscCode ?? "Not available"}</p>
          </> : <p>Not available</p>}

        </div>,
      verified: <div className="flex gap-1 font-semibold"><MdDone className="text-green-700" /> Verified</div>,
    },
    // {
    //   id: "9",
    //   parameters: "CLRA Registration Certificate",
    //   inputs:
    //     <div className="flex gap-2">
    //       <button className="bg-green-800 hover:bg-green-900 text-white rounded-sm flex gap-1 px-2 py-1">
    //         <IoDownload /> Signed CLRA Registration Certificate
    //       </button>
    //       <FaMagnifyingGlass className="text-2xl text-black" />
    //     </div>,
    //   verified: <input type="checkbox"/>,
    // },
  ];

  // const particularsCCLData: ParticularsCCLData[] = [
  //   {
  //     id: "1",
  //     contractorName: "NETAI SEWING",
  //     contractLabourNo: "50",
  //     natureOfWork: "Others",
  //     status:
  //       <button className="bg-green-700 text-white text-xs font-semibold flex gap-1 rounded-lg px-2 py-1">
  //         <MdDone size={15}/> Active
  //       </button>,
  //     act:
  //       <button className="bg-sky-500 hover:bg-sky-600 text-white flex gap-1 rounded-sm p-2" onClick={() => setContractorModalOpen(true)}>
  //         <IoInformationCircle size={15}/> More
  //       </button>,
  //   }
  // ];

  // const contractorModalRow: ContractorModalRow[] = [
  //   {
  //     contractorName: "",
  //     contractorEmail: "",
  //     contractorAddress: "",
  //     natureOfWork: "",
  //     maxNoOfContractLabour: "",
  //     dateOfEmployment: "",
  //     status: <></>
  //   }
  // ];


  const statusImageMap: Record<string, string> = {
    Approved: `${IMAGE_BASE}btn-approved.png`,
    Applied: `${IMAGE_BASE}btn-applied.png`,
    "Fees Paid": `${IMAGE_BASE}btn-fees-paid.png`,
    "Fees Pending": `${IMAGE_BASE}btn-fees-pending.png`,
    Pending: `${IMAGE_BASE}btn-applied.png`,
    "Final Submitted": `${IMAGE_BASE}btn-final-submit.png`,
    "Final Submit": `${IMAGE_BASE}btn-final-submit.png`,
    Issued: `${IMAGE_BASE}btn-issued.png`,
    Rectification: `${IMAGE_BASE}btn-rectification.png`,
    Backed: `${IMAGE_BASE}btn-rectification.png`,
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

  const mapActionToBackend = (uiAction: string) => {
    switch (uiAction) {
      case "B":
      case "V":
      case "R":
        return "WORKFLOW";
      default:
        return "ADD_REMARK";
    }
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

    // -------- Principle Employer --------
    if (applicationData?.principalEmployer?.name?.verified && applicationData?.principalEmployer?.address?.verified)
      initialVerified.add("pe_details");

    if (applicationData?.principalEmployer?.gender?.verified)
      initialVerified.add("gender_pe");

    // -------- Employer / People --------
    if (applicationData?.directors?.verified)
      initialVerified.add("modify_director_partner");

    if (applicationData?.managers?.name?.verified || applicationData?.managers?.address?.verified)
      initialVerified.add("man_details");

    // -------- CLRA --------
    if (applicationData?.clra?.number?.verified)
      initialVerified.add("clra_registration_number");

    if (applicationData?.clra?.date?.verified)
      initialVerified.add("clra_registration_date");

    // -------- Contractors --------
    if (applicationData?.contractors?.verified)
      initialVerified.add("add_contractor");

    if (applicationData?.maxMigrantWorkmen?.verified)
      initialVerified.add("e_any_day_max_num_of_workmen");

    // --------- Nature of Work --------
    if (applicationData?.natureofworks?.verified)
      initialVerified.add("e_nature_of_work");

    if (applicationData?.workmanDetails?.anydaymaxworkmen?.verified)
      initialVerified.add("max_num_wrkmen");

    if (applicationData?.workmanDetails?.workmenreg?.verified)
      initialVerified.add("e_num_of_workmen_per_or_reg");

    if (applicationData?.workmanDetails?.tempOrRegularCount?.verified)
      initialVerified.add("e_num_of_workmen_temp_or_reg");

    if (applicationData?.workmanDetails?.sameOrSimilarWork?.verified)
      initialVerified.add("workmen_if_same_similar_kind_of_work");

    if (applicationData?.workmanDetails?.jobDescription?.verified)
      initialVerified.add("con_lab_job_desc");

    if (applicationData?.workmanDetails?.wageAndBenefits?.verified)
      initialVerified.add("con_lab_wage_rate_other_benefits");

    if (applicationData?.workmanDetails?.categoryDesignation?.verified)
      initialVerified.add("con_lab_cat_desig_nom");

    if (applicationData?.workmanDetails?.settlementAward?.verified)  // due  // 1 more due
      initialVerified.add("e_settlement_award_judgement_min_wage");

    if (applicationData?.workmanDetails?.maxNumberOfContractLabour?.verified)
      initialVerified.add("e_any_day_max_num_of_workmen");

    // -------- Documents --------
    const docs = applicationData?.documentsSummary;

    if (docs?.tradeLicense?.verified)
      initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.verified)
      initialVerified.add("article_of_assoc_file");

    if (docs?.factoryLicense?.verified)
      initialVerified.add("factory_license_file");

    if (docs?.otherCertificates?.verified)
      initialVerified.add("certificate_other_states");

    if (docs?.supportingDocs?.verified)
      initialVerified.add("other_doc_file");

    if (docs?.formI?.verified)
      initialVerified.add("signed_pdf_file");

    if (docs?.previousCertificate?.verified)
      initialVerified.add("certificates_fid");

    setVerifiedFields(initialVerified);
  }, [applicationData, establishmentData]);


  const handleFirstSubmitButton = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action || !remark.trim()) {
      alert("Action and remark are required");
      return;
    }

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
      applicationId: String(applicationId),
      applicantUserId: String(applicantUserId),
      alcUserId: alcUserId,
      amendmentId: applicationId,
      remarkType: action,
      remarksText: remark,
      fieldname:
        verifiedFields.size > 0
          ? Array.from(verifiedFields).join(",")
          : "",
      signedCertificateFileId: Number(applicationId),
    };

    try {
      const result = await dispatch(submitAlcClraAction(payload));
      if (submitAlcClraAction.fulfilled.match(result)) {
        setRemark("");
        setAction("");
        setVerifiedFields(new Set());
        if (applicationId && applicantUserId) {
          const args = {
            applicationId: String(applicationId),
            applicantUserId: String(applicantUserId),
          };
          dispatch(fetchAlcClraApplication(args));
          dispatch(fetchAlcClraRemarks(args));
        }
        alert("Action submitted successfully");
      } else {
        alert("Failed to submit remark");
      }
    } catch (error) {
      console.error("Submit failed", error);
      alert("Failed to submit remark");
    }
  };

  const handleSubmitForVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialVerified = new Set<string>();
    // Establishment
    initialVerified.add("e_name");
    initialVerified.add("est_type");
    initialVerified.add("loc_e_name");
    initialVerified.add("e_postal_address");

    // Principal Employer
    initialVerified.add("pe_details");
    initialVerified.add("gender_pe");

    // Employer / People
    initialVerified.add("modify_director_partner");
    initialVerified.add("man_details");

    // CLRA
    initialVerified.add("clra_registration_number");
    initialVerified.add("clra_registration_date");

    // Contractors
    initialVerified.add("add_contractor");
    initialVerified.add("e_any_day_max_num_of_workmen");

    // Nature of Work
    initialVerified.add("e_nature_of_work");
    initialVerified.add("max_num_wrkmen");
    initialVerified.add("e_num_of_workmen_per_or_reg");
    initialVerified.add("e_num_of_workmen_temp_or_reg");
    initialVerified.add("workmen_if_same_similar_kind_of_work");
    initialVerified.add("con_lab_job_desc");
    initialVerified.add("con_lab_wage_rate_other_benefits");
    initialVerified.add("con_lab_cat_desig_nom");
    initialVerified.add("e_settlement_award_judgement_min_wage");
    initialVerified.add("e_any_day_max_num_of_workmen");

    // -------- Documents --------
    const docs = applicationData?.documentsSummary;

    if (docs?.tradeLicense?.available)
      initialVerified.add("trade_license_file");

    if (docs?.aoaMoa?.available)
      initialVerified.add("article_of_assoc_file");

    if (docs?.factoryLicense?.available)
      initialVerified.add("factory_license_file");

    if (docs?.otherCertificates?.available)
      initialVerified.add("certificate_other_states");

    if (docs?.supportingDocs?.available)
      initialVerified.add("other_doc_file");

    if (docs?.previousCertificate?.status !== "NOT_AVAILABLE")
      initialVerified.add("certificates_fid");

    if (action === "I" && docs?.formI?.available !== "PENDING")
      initialVerified.add("signed_pdf_file");

    // update state if you still need it elsewhere
    setVerifiedFields(initialVerified);

    const payload = {
      applicationId: String(applicationId),
      applicantUserId: String(applicantUserId),
      alcUserId: alcUserId,
      amendmentId: applicationId,
      remarkType: action,
      remarksText: remark,
      fieldname: Array.from(initialVerified).join(","),
      signedCertificateFileId: Number(applicationId),
    };

    try {
      const result = await dispatch(submitAlcClraAction(payload));
      if (submitAlcClraAction.fulfilled.match(result)) {
        setRemark("");
        setAction("");
        setVerifiedFields(new Set());
        if (applicationId && applicantUserId) {
          const args = {
            applicationId: String(applicationId),
            applicantUserId: String(applicantUserId),
          };
          dispatch(fetchAlcClraApplication(args));
          dispatch(fetchAlcClraRemarks(args));
        }
        alert("Action submitted successfully");
      } else {
        alert("Failed to submit remark");
      }
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

        if (!distCodePostal || distCodePostal == null) return;

        const districtNameResPostal = await axios.get<any>(
          `${API_BASE}district/${distCodePostal}`,
        );
        setDistNamePostal(districtNameResPostal?.data.district_name);
        const subDivisionNameResPostal = await axios.get<any>(
          `${API_BASE}subdivision/${distCodePostal}/${subDivCodePostal}`,
        );
        setSubDivNamePostal(subDivisionNameResPostal?.data.sub_div_name);
        const blockNameResPostal = await axios.get<any>(
          `${API_BASE}block/${distCodePostal}/${subDivCodePostal}/${areaTypeCodePostal}/${blockCodePostal}`,
        );
        setBlockNamePostal(blockNameResPostal?.data.block_mun_name);
        const villageOrWardNameResPostal = await axios.get<any>(
          `${API_BASE}villageward/${blockCodePostal}/${villageWardCodePostal}`,
        );
        setVillageWardNamePostal(villageOrWardNameResPostal?.data.village_name);
        const policeStationNameResPostal = await axios.get<any>(
          `${API_BASE}policestation/${distCodePostal}/${policeStationCodePostal}`,
        );
        setPoliceStationNamePostal(policeStationNameResPostal?.data.name_of_police_station);

        if (!distCodeManager || distCodeManager == null) return;

        const districtNameResManager = await axios.get<any>(
          `${API_BASE}district/${distCodeManager}`,
        );
        setDistNameManager(districtNameResManager?.data.district_name);
        const subDivisionNameResManager = await axios.get<any>(
          `${API_BASE}subdivision/${distCodeManager}/${subDivCodeManager}`,
        );
        setSubDivNameManager(subDivisionNameResManager?.data.sub_div_name);
        const blockNameResManager = await axios.get<any>(
          `${API_BASE}block/${distCodeManager}/${subDivCodeManager}/${areaTypeCodeManager}/${blockCodeManager}`,
        );
        setBlockNameManager(blockNameResManager?.data.block_mun_name);
        const villageOrWardNameResManager = await axios.get<any>(
          `${API_BASE}villageward/${blockCodeManager}/${villageWardCodeManager}`,
        );
        setVillageWardNameManager(villageOrWardNameResManager?.data.village_name);
        const policeStationNameResManager = await axios.get<any>(
          `${API_BASE}policestation/${distCodeManager}/${policeStationCodeManager}`,
        );
        setPoliceStationNameManager(policeStationNameResManager?.data.name_of_police_station);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchAddressData();
  }, [distCode, distCodePostal, distCodeManager, subDivCode, subDivCodePostal, subDivCodeManager, areaTypeCode, areaTypeCodePostal, areaTypeCodeManager, blockCode, blockCodePostal, blockCodeManager, villageWardCode, villageWardCodePostal, villageWardCodeManager, policeStationCode, policeStationCodePostal, policeStationCodeManager, pinCode, pinCodePostal, pinCodeManager])

  // Principal Employer address names. Kept in its own effect so a missing
  // manager/postal code can't skip it (the effect above bails out early).
  useEffect(() => {
    async function fetchPeAddressData() {
      try {
        if (!distCodePE || distCodePE == null) return;

        const districtNameResPE = await axios.get<any>(
          `${API_BASE}district/${distCodePE}`,
        );
        setDistNamePE(districtNameResPE?.data.district_name);
        const subDivisionNameResPE = await axios.get<any>(
          `${API_BASE}subdivision/${distCodePE}/${subDivCodePE}`,
        );
        setSubDivNamePE(subDivisionNameResPE?.data.sub_div_name);
        const blockNameResPE = await axios.get<any>(
          `${API_BASE}block/${distCodePE}/${subDivCodePE}/${areaTypeCodePE}/${blockCodePE}`,
        );
        setBlockNamePE(blockNameResPE?.data.block_mun_name);
        const villageOrWardNameResPE = await axios.get<any>(
          `${API_BASE}villageward/${blockCodePE}/${villageWardCodePE}`,
        );
        setVillageWardNamePE(villageOrWardNameResPE?.data.village_name);
        const policeStationNameResPE = await axios.get<any>(
          `${API_BASE}policestation/${distCodePE}/${policeStationCodePE}`,
        );
        setPoliceStationNamePE(policeStationNameResPE?.data.name_of_police_station);
      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchPeAddressData();
  }, [distCodePE, subDivCodePE, areaTypeCodePE, blockCodePE, villageWardCodePE, policeStationCodePE])

  useEffect(() => {
    if (!application || !application.establishment) return;

    setApplicationData(application);
    setEstablishmentData(application.establishment);

    setDistCode(application.establishment.locationAddress?.value?.district);
    setSubDivCode(application.establishment.locationAddress?.value?.subdivision);
    setAreaTypeCode(application.establishment.locationAddress?.value?.areaType?.toLowerCase());
    setBlockCode(application.establishment.locationAddress?.value?.areaTypeCode);
    setVillageWardCode(application.establishment.locationAddress?.value?.villageOrWard);
    setPoliceStationCode(application.establishment.locationAddress?.value?.policeStation);
    setPinCode(application.establishment.locationAddress?.value?.pinCode);

    setDistCodePostal(application?.establishment?.postalAddress?.value?.district);
    setSubDivCodePostal(application?.establishment?.postalAddress?.value?.subdivision);
    setAreaTypeCodePostal(application?.establishment?.postalAddress?.value?.areaType?.toLowerCase());
    setBlockCodePostal(application?.establishment?.postalAddress?.value?.areaTypeCode);
    setVillageWardCodePostal(application?.establishment?.postalAddress?.value?.villageOrWard);
    setPoliceStationCodePostal(application?.establishment?.postalAddress?.value?.policeStation);
    setPinCodePostal(application?.establishment?.postalAddress?.value?.pinCode);

    setDistCodePE(application?.principalEmployer?.address?.location?.district);
    setSubDivCodePE(application?.principalEmployer?.address?.location?.subdivision);
    setAreaTypeCodePE(application?.principalEmployer?.address?.location?.areaType?.toLowerCase());
    setBlockCodePE(application?.principalEmployer?.address?.location?.areaTypeCode);
    setVillageWardCodePE(application?.principalEmployer?.address?.location?.villageOrWard);
    setPoliceStationCodePE(application?.principalEmployer?.address?.location?.policeStation);
    setPinCodePE(application?.principalEmployer?.address?.location?.pinCode);

    setDistCodeManager(application?.managers?.address?.value?.district);
    setSubDivCodeManager(application?.managers?.address?.value?.subdivision);
    setAreaTypeCodeManager(application?.managers?.address?.value?.areaType?.toLowerCase());
    setBlockCodeManager(application?.managers?.address?.value?.areaTypeCode);
    setVillageWardCodeManager(application?.managers?.address?.value?.villageOrWard);
    setPoliceStationCodeManager(application?.managers?.address?.value?.policeStation);
    setPinCodeManager(application?.managers?.address?.value?.pinCode);

    setTradeLicense(application.documentsSummary.tradeLicense?.available);
    setAoamoa(application.documentsSummary.aoaMoa?.available);
    setFactoryLicense(application.documentsSummary.factoryLicense?.available);
    setOtherStateCertificate(application.documentsSummary.otherCertificates?.available);
    setSupportingDocs(application.documentsSummary.supportingDocs?.available);
    setFormI(application.documentsSummary.formI?.available);
    setPreviousCertificate(application.documentsSummary.previousCertificate?.status);

    setApplicationStatus(application.applicationStatus?.status);
    setApplicationStatusType(application.applicationStatus?.type);
    setApplicationStatusMsg(application.applicationStatus?.message);
    setRegistrationNo(application.applicationStatus?.registrationNumber);
    setRegistrationDate(application.applicationStatus?.registrationDate);
    setQrCode(application.applicationStatus?.qrCode);
    setCertificate(application.applicationStatus?.certificateAvailable);

    // ================= TRADE UNION BINDING =================
    if (application.tradeUnions) {
      const tuTableData: TradeUnionData[] =
        application?.tradeUnions?.map((tu: any, index: number) => ({
          id: String(index + 1),
          registrationNo: tu.e_trade_union_regn_no ?? "",
          name: tu.e_trade_union_name ?? "",
          act: (
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white flex gap-1 rounded-sm p-2"
              onClick={() => {
                setSelectedTradeUnion(tu);
                setTradeUnionModalOpen(true);
              }}
            >
              <IoInformationCircle size={15} /> More
            </button>
          ),
        }));

      setTradeUnionData(tuTableData);
    }

    // ================= CONTRACTOR BINDING =================
    if (application.contractorsInfo) {
      const contractorTableData: ParticularsCCLData[] =
        application?.contractorsInfo?.map((con: any, index: number) => ({
          id: String(index + 1),
          contractorName: con.name_of_contractor ?? "",
          contractLabourNo: String(
            con.contractor_max_no_of_labours_on_any_day ?? ""
          ),
          natureOfWork: con.natureofwork ?? "",
          status: (
            <button className="bg-green-700 text-white text-xs font-semibold flex gap-1 rounded-lg px-2 py-1">
              <MdDone size={15} /> Active
            </button>
          ),
          act: (
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white flex gap-1 rounded-sm p-2"
              onClick={() => {
                setSelectedContractor({
                  contractorId: con.id,
                  contractorName: con.name_of_contractor,
                  contractorEmail: con.email_of_contractor,
                  contractorAddress: con.address_of_contractor,
                  natureOfWork: con.natureofwork,
                  maxNoOfContractLabour:
                    con.contractor_max_no_of_labours_on_any_day,
                  dateOfEmployment: `${new Date(
                    con.est_date_of_work_of_each_labour_from_date
                  ).toLocaleDateString()} - ${new Date(
                    con.est_date_of_work_of_each_labour_to_date
                  ).toLocaleDateString()}`,
                  status: <span className="text-green-600 font-semibold">Active</span>,
                });
                setContractorModalOpen(true);
              }}
            >
              <IoInformationCircle size={15} /> More
            </button>
          ),
        }));

      setParticularsCCLData(contractorTableData);
    }

  }, [application]);

  useEffect(() => {
    if (!remarks) {
      setRemarkData([]);
      return;
    }

    const remarkTableData: RemarkData[] = remarks.map((r: any) => ({
      id: String(r.slNo ?? ""),
      date: r.dateTime ? new Date(r.dateTime).toLocaleString() : "",
      remark: r.remark ?? "",
      status: renderStatusImage(r.status) ?? <></>,
      remarkby: r.remarkBy ?? "",
      remarkByUserId: r.remarkByUserId ?? "",
      act: (
        <button
          disabled={!r.canDelete}
          className={`p-1 ${r.canDelete
            ? "text-red-600 hover:text-red-800"
            : "text-gray-400 cursor-not-allowed"
            }`}
        >
          <MdDelete size={18} />
        </button>
      ),
    }));

    setRemarkData(remarkTableData);
  }, [remarks]);

  useEffect(() => {
    setRemarkOptions(remarkOptionsState || {});
  }, [remarkOptionsState]);

  useEffect(() => {
    if (!applicationId || !applicantUserId) return;
    const args = {
      applicationId: String(applicationId),
      applicantUserId: String(applicantUserId),
    };
    dispatch(fetchAlcClraApplication(args));
    dispatch(fetchAlcClraRemarks(args));
    dispatch(fetchAlcClraActions(args));

    return () => {
      dispatch(clearAlcClraApplication());
    };
  }, [dispatch, applicationId, applicantUserId]);


  return (
    <div className="min-h-[250px] mb-15">

      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">CLRA:PRINCIPAL EMPLOYER REGISTRATION DETAILS</h1>

      {/* --------------------- APPLICATION DETAILS --------------------- */}
      <div className="mt-5">
        <Card className="p-3 text-white">
          <CardHeader className="bg-sky-700 grid items-center p-4">
            <p>NOTE:- All inputs are provided by Principal Employer OR on behalf of Principal Employer</p>
            <div className="flex gap-3">
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
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border border-gray-400 rounded-md text-black">
              <TableHeader>

                {/* Application Data */}
                <TableRow>
                  <TableHead className="border-r font-semibold">Sl. No.</TableHead>
                  <TableHead className="border-r font-semibold">Parameters</TableHead>
                  <TableHead className="border-r font-semibold">Inputs</TableHead>
                  <TableHead className="font-semibold">Verified?</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Condition to be applied for showing this Registration Offline Details */}
                {previousCertificate !== "NOT_AVAILABLE" &&
                  registrationData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="border-r">{item.id}</TableCell>
                      <TableCell className="border-r">{item.parameters}</TableCell>
                      <TableCell className="border-r">{item.inputs}</TableCell>
                      <TableCell>{item.verified}</TableCell>
                    </TableRow>
                  ))}

                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    1. Full Name and address of the Principal Employer
                  </TableHead>
                </TableRow>

                {principleEmpData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    2. Full name of the Manager or Person Responsible for the Supervision and control of the Establishment
                  </TableHead>
                </TableRow>

                {managerData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    3. Location of the Establishment
                  </TableHead>
                </TableRow>

                {nameLocEstdData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    4. Postal Address of the Establishment
                  </TableHead>
                </TableRow>

                {ofcAddrEstdData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.parameters}</TableCell>
                    <TableCell className="border-r">{item.inputs}</TableCell>
                    <TableCell>{item.verified}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableHead colSpan={4} className="text-black font-bold">
                    5. Nature of Work Carried on in the Establishment
                  </TableHead>
                </TableRow>

                {appData.map((item) => (
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
                    7. UPLOADED DOCUMENTS
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

                {
                  applicationData?.applicationStatus?.certificateAvailable &&
                  docDataRegCertificate.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="border-r">{item.id}</TableCell>
                      <TableCell className="border-r">{item.parameters}</TableCell>

                      <TableCell className="border-r flex items-center gap-2">
                        {item.inputs} {item.icon1}
                      </TableCell>

                      <TableCell>{item.verified}</TableCell>
                    </TableRow>
                  ))
                }

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

              </TableBody>
            </Table>
          </div>
        </Card>


        {/* Trade Union Section */}

        <Card className="p-3 text-white mt-5">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Trade Union Information</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r">Sl. No.</TableHead>
                  <TableHead className="border-r">Registration No.</TableHead>
                  <TableHead className="border-r">Name</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tradeUnionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.registrationNo}</TableCell>
                    <TableCell className="border-r">{item.name}</TableCell>
                    <TableCell>{item.act}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>


        {/* Particulars of Contractors and Contract Labour */}

        <Card className="p-3 text-white mt-5">
          <CardHeader className="bg-sky-700 flex items-center p-4">
            <GrNotes /> <span>Particulars of Contractors and Contract Labour</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table className="border rounded-md text-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r">Sl. No.</TableHead>
                  <TableHead className="border-r">Contractor Name</TableHead>
                  <TableHead className="border-r">Contract Labour No.</TableHead>
                  <TableHead className="border-r">Nature of Work</TableHead>
                  <TableHead className="border-r">Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {particularsCCLData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="border-r">{item.id}</TableCell>
                    <TableCell className="border-r">{item.contractorName}</TableCell>
                    <TableCell className="border-r">{item.contractLabourNo}</TableCell>
                    <TableCell className="border-r">{item.natureOfWork}</TableCell>
                    <TableCell className="border-r">{item.status}</TableCell>
                    <TableCell>{item.act}</TableCell>
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
      {
        `${remarkData[0]?.remarkByUserId}` !== `${getUserId()}` &&
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
                {/* <TableHead className="text-white ">Action</TableHead> */}
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

      {/* Contractor Details Modal */}
      <Dialog open={contractorModalOpen} onOpenChange={setContractorModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
            <h2 className="text-sm font-semibold uppercase">
              Particulars of Contractors and Contract Labour
            </h2>
          </div>

          {/* TABLE */}
          <div className="px-4 py-3">
            {selectedContractor && (
              <Table className="border border-gray-300">
                <TableBody>

                  <TableRow>
                    <TableCell className="font-semibold bg-gray-50 w-1/2 border-r">
                      <p className="text-wrap wrap-break-word">Serial Form V number</p>
                    </TableCell>
                    <TableCell>{selectedContractor.contractorId}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold bg-gray-50 w-1/2 border-r">
                      <p className="text-wrap wrap-break-word">Name of the Contractor</p>
                    </TableCell>
                    <TableCell>{selectedContractor.contractorName}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      <p className="text-wrap wrap-break-word">Email of Contractor</p>
                    </TableCell>
                    <TableCell>{selectedContractor.contractorEmail}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold bg-gray-50 border-r">
                      <p className="text-wrap wrap-break-word">Address of the Contractor</p>
                    </TableCell>
                    <TableCell>{selectedContractor.contractorAddress}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      <p className="text-wrap wrap-break-word">Nature of Work in which Contract Labour is Employed or is to be Employed</p>
                    </TableCell>
                    <TableCell>{selectedContractor.natureOfWork}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      <p className="text-wrap wrap-break-word">Maximum Number of Contract Labour to be Employed on Any Day</p>
                    </TableCell>
                    <TableCell>{selectedContractor.maxNoOfContractLabour}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      <p className="text-wrap wrap-break-word">Estimated Date of Employment</p>
                    </TableCell>
                    <TableCell>{selectedContractor.dateOfEmployment}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Status
                    </TableCell>
                    <TableCell>{selectedContractor.status}</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end px-4 py-4 border-t">
            <button
              onClick={() => setContractorModalOpen(false)}
              className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
            >
              Close
            </button>
          </div>

        </DialogContent>
      </Dialog>


      {/* Trade Union Details Modal */}
      <Dialog open={tradeUnionModalOpen} onOpenChange={setTradeUnionModalOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
            <h2 className="text-sm font-semibold uppercase">
              Trade Union Details
            </h2>
          </div>

          {/* TABLE */}
          <div className="px-4 py-3">
            {selectedTradeUnion && (
              <Table className="border border-gray-300">
                <TableBody>

                  <TableRow>
                    <TableCell className="font-semibold bg-gray-50 w-1/2 border-r">
                      Registration No
                    </TableCell>
                    <TableCell>{selectedTradeUnion.e_trade_union_regn_no}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      Trade Union Name
                    </TableCell>
                    <TableCell>{selectedTradeUnion.e_trade_union_name}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold bg-gray-50 border-r">
                      Address
                    </TableCell>
                    <TableCell>{selectedTradeUnion.e_trade_union_address}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      Identification Number
                    </TableCell>
                    <TableCell>{selectedTradeUnion.identification_number}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Application ID
                    </TableCell>
                    <TableCell>{selectedTradeUnion.application_id}</TableCell>
                  </TableRow>

                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold border-r">
                      Act ID
                    </TableCell>
                    <TableCell>{selectedTradeUnion.act_id}</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end px-4 py-4 border-t">
            <button
              onClick={() => setTradeUnionModalOpen(false)}
              className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
            >
              Close
            </button>
          </div>

        </DialogContent>
      </Dialog>


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
                  Are you confirm that Form-I is uploaded correctly by the applicant and checked?
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

    </div >
  );
};

export default AlcVisibleApplications;
