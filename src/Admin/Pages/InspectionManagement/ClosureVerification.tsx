import axios from "axios";
import {
  Building,
  ClipboardList,
  FileCheck,
  FileText,
  History,
  Send,
  Upload
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthToken, getUserId, getUserName, getUserRole } from "../../../utils/auth";



// Form fields state interface
interface FormState {
  rorDetail: string;
  physicalInspection: string;
  isOperational: string; // 'YES' | 'NO' | ''
  isCloserDeclared: string; // 'YES' | 'NO' | ''
  dateOfClosureFiled: string; // YYYY-MM-DD
  closureNoticeDetails: string;
  isFawloiOperational: string; // 'YES' | 'NO' | ''
  fawloiLastDisbursementDate: string; // YYYY-MM-DD
  fawloiPersonsInvolved: string;
  isSalaryWageClaimPending: string; // 'YES' | 'NO' | ''
  salaryWagePendingPersons: string;
  salaryWagePendingAmount: string;
  isIndustrialDisputePending: string; // 'YES' | 'NO' | ''
  industrialDisputeDetails: string;
  isGratuityCasePending: string; // 'YES' | 'NO' | ''
  gratuityPersonsInvolved: string;
  gratuityPendingAmount: string;
  pfPaymentStatus: string; // 'PAID' | 'PENDING' | ''
  esiPaymentStatus: string; // 'PAID' | 'PENDING' | ''
  isLcInspectionDone: string; // 'YES' | 'NO' | ''
  isLeaveDue: string; // 'YES' | 'NO' | ''
  isLegalCasePending: string; // 'YES' | 'NO' | ''
}

const initialFormState: FormState = {
  rorDetail: "",
  physicalInspection: "",
  isOperational: "",
  isCloserDeclared: "",
  dateOfClosureFiled: "",
  closureNoticeDetails: "",
  isFawloiOperational: "",
  fawloiLastDisbursementDate: "",
  fawloiPersonsInvolved: "",
  isSalaryWageClaimPending: "",
  salaryWagePendingPersons: "",
  salaryWagePendingAmount: "",
  isIndustrialDisputePending: "",
  industrialDisputeDetails: "",
  isGratuityCasePending: "",
  gratuityPersonsInvolved: "",
  gratuityPendingAmount: "",
  pfPaymentStatus: "",
  esiPaymentStatus: "",
  isLcInspectionDone: "",
  isLeaveDue: "",
  isLegalCasePending: "",
};

const normalizeStatus = (status: string): string => {
  const s = String(status || "").trim().toUpperCase();
  if (s === "ALC" || s === "FORWARDED TO ASSISTANT LABOUR COMMISSIONER" || s === "LYING WITH ASSISTANT LABOUR COMMISSIONER") return "ALC";
  if (s === "BALC" || s === "SENT BACK TO ASSISTANT LABOUR COMMISSIONER") return "BALC";
  if (s === "BDLC" || s === "SENT BACK TO DEPUTY LABOUR COMMISSIONER") return "BDLC";
  if (s === "DLC" || s === "INSPECTION SUBMITTED TO DEPUTY LABOUR COMMISSIONER") return "DLC";
  if (s === "LC" || s === "FORWARDED TO LABOUR COMMISSIONER" || s === "INSPECTION SUBMITTED TO LABOUR COMMISSIONER") return "LC";
  if (s === "BLC" || s === "SENT BACK TO LABOUR COMMISSIONER") return "BLC";
  if (s === "JSLD" || s === "FORWARDED TO JOINT SECRETARY") return "JSLD";
  if (s === "C" || s === "JOINT SECRETARY APPROVED") return "C";
  if (s === "NOC" || s === "NO OBJECTION CERTIFICATE GIVEN") return "NOC";
  if (s === "I" || s === "INITIATED & FORWARDED TO DEPUTY LABOUR COMMISSIONER" || s === "INITIETED & FORWARDED TO DEPUTY LABOUR COMMISSIONER") return "I";
  return s;
};

export const ViewDocument = (filePath: any) => {
  try {
    if (!filePath) return;

    const cleaned = filePath
      // Strip absolute base paths
      .replace(/^\/appdisk\/mnt\/html\/factory\//, "")
      .replace(/^\/mnt\/html\/factory\//, "")
      .replace(/^D:\/mnt\/html\/factory\//, "")
      .replace(/^C:\/mnt\/html\/factory\//, "")
      .replace(/^\/var\/www\/html\/factory\//, "")
      .replace(/^\/home\/factory\//, "")
      // Strip Documents/Uploads prefix (now handled by static route)
      .replace(/^Documents\/Uploads\//, "")
      .replace(/^\/Documents\/Uploads\//, "");

    const parts = cleaned.split("/");
    const encodedParts = parts.map((part: string, i: number) =>
      i === parts.length - 1 ? encodeURIComponent(part) : part,
    );

    const fileUrl = `https://labour.wb.gov.in/factories/documents-uploads/${encodedParts.join("/")}`;
    window.open(fileUrl, "_blank");
  } catch (error) {
    console.error("Error viewing document:", error);
    alert("Failed to load document. Please try again.");
  }
};

export const ClosureVerification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspectionData, setInspectionData] = useState<any | null>(null);
  const [loadingInspection, setLoadingInspection] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [verificationRemarks, setVerificationRemarks] = useState<string>("");

  const userRole = Number(getUserRole() || 0);
  const currentStatus = normalizeStatus(inspectionData?.lc_inspection_status || "");
  const isReadOnly = userRole !== 4 || (currentStatus !== "ALC" && currentStatus !== "BALC");

  // Form inputs state
  const [formData, setFormData] = useState<FormState>(initialFormState);

  // Five separate file upload states and preview states
  const [closureNoticeFile, setClosureNoticeFile] = useState<File | null>(null);
  const [closureNoticePreview, setClosureNoticePreview] = useState<string | null>(null);

  const [idReportFile, setIdReportFile] = useState<File | null>(null);
  const [idReportPreview, setIdReportPreview] = useState<string | null>(null);

  const [pfEsiFile, setPfEsiFile] = useState<File | null>(null);
  const [pfEsiPreview, setPfEsiPreview] = useState<string | null>(null);

  const [inspectionReportFile, setInspectionReportFile] = useState<File | null>(null);
  const [inspectionReportPreview, setInspectionReportPreview] = useState<string | null>(null);

  const [otherDocFile, setOtherDocFile] = useState<File | null>(null);
  const [otherDocPreview, setOtherDocPreview] = useState<string | null>(null);

  // Set the document title on mount
  useEffect(() => {
    document.title = "Report for NOC for Conversion of Factory/Karkhana Land";
  }, []);

  // Load inspection details on mount or ID change
  useEffect(() => {
    const fetchInspection = async () => {
      if (!id) {
        setLoadingInspection(false);
        return;
      }
      setLoadingInspection(true);
      try {
        const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        };

        // Try searching by ID in the list API
        const response = await axios.post(
          `${base_url}/bb-inspections/list`,
          { factory_id: Number(id) },
          { headers }
        );

        console.log(response.data?.data, "response")

        let data = null;
        if (response.data?.success && Array.isArray(response.data?.data)) {
          data = response.data.data[0];
        }

        if (data) {
          setInspectionData(data);

          // Populate previews from existing documents
          const docList = data?.report_docs || data?.files || [];
          docList.forEach((file: any) => {
            if (!file) return;
            if (String(file.source).toLowerCase() !== "lc") return;

            const filePath = file.file_path || file.file_name;
            if (file.doc_type_id === 1) {
              setClosureNoticePreview(filePath);
            } else if (file.doc_type_id === 2) {
              setIdReportPreview(filePath);
            } else if (file.doc_type_id === 3) {
              setPfEsiPreview(filePath);
            } else if (file.doc_type_id === 6) {
              setInspectionReportPreview(filePath);
            } else if (file.doc_type_id === 7) {
              setOtherDocPreview(filePath);
            }
          });

          // Populate default values from loaded inspection data
          const draftKey = `closure_verification_draft_${id}`;
          const savedDraft = localStorage.getItem(draftKey);

          const hasChecklist = data?.lc_checklist ||
            data?.lc_ror_details !== undefined ||
            data?.lc_physical_inspection_location !== undefined ||
            data?.is_factory_operational !== undefined;

          if (savedDraft) {
            try {
              setFormData(JSON.parse(savedDraft));
            } catch (e) {
              console.error("Failed to parse saved draft", e);
            }
          } else if (hasChecklist) {
            const ch = data?.lc_checklist || data;

            const getYesNo = (val: any) => {
              if (val === true || val === "YES" || val === "true") return "YES";
              if (val === false || val === "NO" || val === "false") return "NO";
              return "";
            };

            const formatDate = (isoString: any) => {
              if (!isoString) return "";
              try {
                return new Date(isoString).toISOString().split('T')[0];
              } catch (e) {
                return "";
              }
            };

            setFormData({
              rorDetail: ch?.lc_ror_details || "",
              physicalInspection: ch?.lc_physical_inspection_location || "",
              isOperational: getYesNo(ch?.is_factory_operational),
              isCloserDeclared: getYesNo(ch?.is_closure_declared),
              dateOfClosureFiled: formatDate(ch?.lc_closure_date || ch?.date_of_closure_filed),
              closureNoticeDetails: ch?.lc_closure_notice_details || "",
              isFawloiOperational: getYesNo(ch?.is_fawloi_operational),
              fawloiLastDisbursementDate: formatDate(ch?.fawloi_last_disbursement_date),
              fawloiPersonsInvolved: ch?.fawloi_persons_involved !== undefined && ch?.fawloi_persons_involved !== null ? String(ch.fawloi_persons_involved) : "",
              isSalaryWageClaimPending: getYesNo(ch?.is_salary_wage_claim_pending),
              salaryWagePendingPersons: ch?.salary_wage_pending_persons !== undefined && ch?.salary_wage_pending_persons !== null ? String(ch.salary_wage_pending_persons) : "",
              salaryWagePendingAmount: ch?.salary_wage_pending_amount !== undefined && ch?.salary_wage_pending_amount !== null ? String(ch.salary_wage_pending_amount) : "",
              isIndustrialDisputePending: getYesNo(ch?.is_industrial_dispute_pending),
              industrialDisputeDetails: ch?.industrial_dispute_details || "",
              isGratuityCasePending: getYesNo(ch?.is_gratuity_case_pending),
              gratuityPersonsInvolved: ch?.gratuity_persons_involved !== undefined && ch?.gratuity_persons_involved !== null ? String(ch.gratuity_persons_involved) : "",
              gratuityPendingAmount: ch?.gratuity_pending_amount !== undefined && ch?.gratuity_pending_amount !== null ? String(ch.gratuity_pending_amount) : "",
              pfPaymentStatus: ch?.pf_payment_status || "",
              esiPaymentStatus: ch?.esi_payment_status || "",
              isLcInspectionDone: getYesNo(ch?.is_lc_inspection_done),
              isLeaveDue: getYesNo(ch?.is_leave_due),
              isLegalCasePending: getYesNo(ch?.is_legal_case_pending),
            });
          } else {
            setFormData({
              ...initialFormState,
              rorDetail: "",
            });
          }
        } else {
          toast.error("Inspection details not found");
        }
      } catch (err) {
        console.error("Error fetching inspection details:", err);
        toast.error("Failed to load inspection details");
      } finally {
        setLoadingInspection(false);
      }
    };

    fetchInspection();
  }, [id]);

  // Handle inputs modification
  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      if (field === "isLcInspectionDone" && value === "NO") {
        updated.physicalInspection = "";
      }
      return updated;
    });
  };

  // Handle File Input and preview generation generically
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (isPdf && file.size > 200 * 1024) {
        toast.error("PDF size must not exceed 200 KB.");
        e.target.value = "";
        return;
      }
      setFile(file);

      // If it is an image, generate object URL for preview
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null); // non-image preview
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1] || result;
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Validate form submission
  const validateForm = (): boolean => {
    if (!formData.rorDetail.trim()) {
      toast.error("ROR details are required");
      return false;
    }

    if (!formData.isOperational) {
      toast.error("Please specify whether the factory is operational");
      return false;
    }
    if (!formData.isCloserDeclared) {
      toast.error("Please specify whether closure has been declared");
      return false;
    }
    if (!formData.dateOfClosureFiled) {
      toast.error("Please specify Date of closure");
      return false;
    }
    if (!formData.closureNoticeDetails.trim()) {
      toast.error("Closure Notice details are required");
      return false;
    }
    if (!formData.isFawloiOperational) {
      toast.error("Please specify whether FAWLOI is operational");
      return false;
    }
    if (formData.isFawloiOperational === "YES") {
      if (!formData.fawloiLastDisbursementDate) {
        toast.error("Please specify Last Date of Disbursement of FAWLOI");
        return false;
      }
      if (!formData.fawloiPersonsInvolved) {
        toast.error("Please specify Persons Involved in FAWLOI");
        return false;
      }
    }
    if (!formData.isSalaryWageClaimPending) {
      toast.error("Please specify whether salary wage claims are pending");
      return false;
    }
    if (formData.isSalaryWageClaimPending === "YES") {
      if (!formData.salaryWagePendingPersons) {
        toast.error("Please specify Persons Involved in pending salary/wage");
        return false;
      }
      if (!formData.salaryWagePendingAmount) {
        toast.error("Please specify Amount of pending salary/wage");
        return false;
      }
    }
    if (!formData.isIndustrialDisputePending) {
      toast.error("Please specify whether industrial dispute is pending");
      return false;
    }
    if (formData.isIndustrialDisputePending === "YES" && !formData.industrialDisputeDetails.trim()) {
      toast.error("Please specify industrial dispute details");
      return false;
    }
    if (!formData.isGratuityCasePending) {
      toast.error("Please specify whether gratuity case is pending");
      return false;
    }
    if (formData.isGratuityCasePending === "YES") {
      if (!formData.gratuityPersonsInvolved) {
        toast.error("Please specify Persons Involved in gratuity case");
        return false;
      }
      if (!formData.gratuityPendingAmount) {
        toast.error("Please specify Amount of gratuity pending");
        return false;
      }
    }
    if (!formData.pfPaymentStatus) {
      toast.error("Please select PF Payment status");
      return false;
    }
    if (!formData.esiPaymentStatus) {
      toast.error("Please select ESI Payment status");
      return false;
    }
    if (!formData.isLcInspectionDone) {
      toast.error("Please specify whether inspection is done");
      return false;
    }
    if (!formData.isLeaveDue) {
      toast.error("Please specify whether leave is due");
      return false;
    }
    if (!formData.isLegalCasePending) {
      toast.error("Please specify whether legal case is pending");
      return false;
    }
    return true;
  };

  // Handle verification submit for DLC and LC decisions
  const handleVerificationSubmit = async (targetStatus: string) => {
    if (!inspectionData?.id) return;
    setSubmitting(true);

    const userRole = Number(getUserRole() || 5);
    const userId = Number(getUserId() || 5);
    const userName = getUserName() || "DLC/ALC Officer";

    // Determine the source name for remarks and targetRoleId
    let sourceName = "DLC";
    let targetRoleId = 12; // Default to LC

    if (userRole === 5) {
      sourceName = "DLC";
      targetRoleId = (targetStatus === "BALC" || targetStatus === "ALC") ? 4 : 12; // ALC (4) or LC (12)
    } else if (userRole === 12) {
      sourceName = "LC";
      targetRoleId = targetStatus === "BDLC" ? 5 : 13; // DLC (5) or Joint Sec (13)
    }

    const remarksText = verificationRemarks.trim() || `Inspection status updated to ${targetStatus} by ${sourceName}.`;

    const remarksObj = {
      source: "LC",
      remarks: remarksText,
      remarks_by_id: userId,
      remarks_by_name: userName,
      remarks_by_role_id: userRole,
      remarks_to_role_id: targetRoleId,
      inspection_status: targetStatus
    };

    // Construct request payload
    const checklistFlat = {
      lc_ror_details: formData.rorDetail,
      lc_physical_inspection_location: formData.physicalInspection,
      is_factory_operational: formData.isOperational === "YES",
      is_closure_declared: formData.isCloserDeclared === "YES",
      date_of_closure_filed: formData.dateOfClosureFiled ? new Date(formData.dateOfClosureFiled).toISOString() : null,
      lc_closure_date: formData.dateOfClosureFiled ? new Date(formData.dateOfClosureFiled).toISOString() : null,
      lc_closure_notice_details: formData.closureNoticeDetails,
      is_fawloi_operational: formData.isFawloiOperational === "YES",
      fawloi_last_disbursement_date: (formData.isFawloiOperational === "YES" && formData.fawloiLastDisbursementDate) ? new Date(formData.fawloiLastDisbursementDate).toISOString() : null,
      fawloi_persons_involved: (formData.isFawloiOperational === "YES" && formData.fawloiPersonsInvolved) ? Number(formData.fawloiPersonsInvolved) : null,
      is_salary_wage_claim_pending: formData.isSalaryWageClaimPending === "YES",
      salary_wage_pending_persons: (formData.isSalaryWageClaimPending === "YES" && formData.salaryWagePendingPersons) ? Number(formData.salaryWagePendingPersons) : null,
      salary_wage_pending_amount: (formData.isSalaryWageClaimPending === "YES" && formData.salaryWagePendingAmount) ? Number(formData.salaryWagePendingAmount) : null,
      is_industrial_dispute_pending: formData.isIndustrialDisputePending === "YES",
      industrial_dispute_details: (formData.isIndustrialDisputePending === "YES" && formData.industrialDisputeDetails) ? formData.industrialDisputeDetails : "",
      is_gratuity_case_pending: formData.isGratuityCasePending === "YES",
      gratuity_persons_involved: (formData.isGratuityCasePending === "YES" && formData.gratuityPersonsInvolved) ? Number(formData.gratuityPersonsInvolved) : null,
      gratuity_pending_amount: (formData.isGratuityCasePending === "YES" && formData.gratuityPendingAmount) ? Number(formData.gratuityPendingAmount) : null,
      pf_payment_status: formData.pfPaymentStatus,
      esi_payment_status: formData.esiPaymentStatus,
      is_lc_inspection_done: formData.isLcInspectionDone === "YES",
      is_leave_due: formData.isLeaveDue === "YES",
      is_legal_case_pending: formData.isLegalCasePending === "YES"
    };

    const payload = {
      id: Number(inspectionData?.id),
      factory_id: Number(inspectionData?.factory_id),
      lc_inspection_status: targetStatus,
      remarks: [remarksObj],
      files: [], // Do not send files again on status change
      lc_checklist: checklistFlat,
      ...checklistFlat
    };

    console.log("SUBMITTING VERIFICATION PAYLOAD:", payload);

    try {
      const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      };

      const res = await axios.post(
        `${base_url}/bb-inspections/update`,
        payload,
        { headers }
      );

      if (res.data?.success || res.status === 200) {
        toast.success(`Verification action submitted: Status updated to ${targetStatus}`);
        if (id) {
          localStorage.removeItem(`closure_verification_draft_${id}`);
        }
        setTimeout(() => {
          navigate("/banglar-bhumi");
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to update status.");
      }
    } catch (err: any) {
      console.error("Error updating inspection status:", err);
      toast.error(err.response?.data?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle final submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validateForm()) return;

    setSubmitting(true);

    const userRole = Number(getUserRole() || 5);
    const userId = Number(getUserId() || 5);
    const userName = getUserName() || "DLC/ALC Officer";

    // Determine the status representation based on role
    let lc_inspection_status = "DLC";
    if (userRole === 4) {
      lc_inspection_status = "DLC";
    }

    const remarksObj = {
      source: "LC",
      remarks: `Closure verification report submitted. Operational: ${formData.isOperational}. Closure: ${formData.isCloserDeclared}.`,
      remarks_by_id: userId,
      remarks_by_name: userName,
      remarks_by_role_id: userRole,
      remarks_to_role_id: 12, // Submitted to Joint Secretary or next review layer
      inspection_status: lc_inspection_status
    };

    const filesArray = [];

    try {
      if (closureNoticeFile) {
        filesArray.push({
          file_name: closureNoticeFile.name,
          file_content: await fileToBase64(closureNoticeFile),
          source: "lc",
          doc_type_id: 1,
          submitted_by_id: userId,
          submitted_on: new Date().toISOString()
        });
      }
      if (idReportFile) {
        filesArray.push({
          file_name: idReportFile.name,
          file_content: await fileToBase64(idReportFile),
          source: "lc",
          doc_type_id: 2,
          submitted_by_id: userId,
          submitted_on: new Date().toISOString()
        });
      }
      if (pfEsiFile) {
        filesArray.push({
          file_name: pfEsiFile.name,
          file_content: await fileToBase64(pfEsiFile),
          source: "lc",
          doc_type_id: 3,
          submitted_by_id: userId,
          submitted_on: new Date().toISOString()
        });
      }
      if (inspectionReportFile) {
        filesArray.push({
          file_name: inspectionReportFile.name,
          file_content: await fileToBase64(inspectionReportFile),
          source: "lc",
          doc_type_id: 6,
          submitted_by_id: userId,
          submitted_on: new Date().toISOString()
        });
      }
      if (otherDocFile) {
        filesArray.push({
          file_name: otherDocFile.name,
          file_content: await fileToBase64(otherDocFile),
          source: "lc",
          doc_type_id: 7,
          submitted_by_id: userId,
          submitted_on: new Date().toISOString()
        });
      }
    } catch (fileErr) {
      console.error("Error reading file content as base64:", fileErr);
      toast.error("Failed to read uploaded files. Please try again.");
      setSubmitting(false);
      return;
    }

    const lc_checklist = {
      lc_ror_details: formData.rorDetail,
      lc_physical_inspection_location: formData.physicalInspection,
      is_factory_operational: formData.isOperational === "YES",
      is_closure_declared: formData.isCloserDeclared === "YES",
      date_of_closure_filed: formData.dateOfClosureFiled ? new Date(formData.dateOfClosureFiled).toISOString() : null,
      lc_closure_date: formData.dateOfClosureFiled ? new Date(formData.dateOfClosureFiled).toISOString() : null,
      lc_closure_notice_details: formData.closureNoticeDetails,
      is_fawloi_operational: formData.isFawloiOperational === "YES",
      fawloi_last_disbursement_date: (formData.isFawloiOperational === "YES" && formData.fawloiLastDisbursementDate) ? new Date(formData.fawloiLastDisbursementDate).toISOString() : null,
      fawloi_persons_involved: (formData.isFawloiOperational === "YES" && formData.fawloiPersonsInvolved) ? Number(formData.fawloiPersonsInvolved) : null,
      is_salary_wage_claim_pending: formData.isSalaryWageClaimPending === "YES",
      salary_wage_pending_persons: (formData.isSalaryWageClaimPending === "YES" && formData.salaryWagePendingPersons) ? Number(formData.salaryWagePendingPersons) : null,
      salary_wage_pending_amount: (formData.isSalaryWageClaimPending === "YES" && formData.salaryWagePendingAmount) ? Number(formData.salaryWagePendingAmount) : null,
      is_industrial_dispute_pending: formData.isIndustrialDisputePending === "YES",
      industrial_dispute_details: (formData.isIndustrialDisputePending === "YES" && formData.industrialDisputeDetails) ? formData.industrialDisputeDetails : "",
      is_gratuity_case_pending: formData.isGratuityCasePending === "YES",
      gratuity_persons_involved: (formData.isGratuityCasePending === "YES" && formData.gratuityPersonsInvolved) ? Number(formData.gratuityPersonsInvolved) : null,
      gratuity_pending_amount: (formData.isGratuityCasePending === "YES" && formData.gratuityPendingAmount) ? Number(formData.gratuityPendingAmount) : null,
      pf_payment_status: formData.pfPaymentStatus,
      esi_payment_status: formData.esiPaymentStatus,
      is_lc_inspection_done: formData.isLcInspectionDone === "YES",
      is_leave_due: formData.isLeaveDue === "YES",
      is_legal_case_pending: formData.isLegalCasePending === "YES"
    };

    const payload = {
      id: Number(inspectionData?.id),
      factory_id: Number(inspectionData?.factory_id),
      lc_inspection_status,
      remarks: [remarksObj],
      files: filesArray,
      lc_checklist,
      ...lc_checklist
    };

    console.log("SUBMITTING PAYLOAD:", payload);

    try {
      const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      };

      const res = await axios.post(
        `${base_url}/bb-inspections/update`,
        payload,
        { headers }
      );

      if (res.data?.success || res.status === 200) {
        toast.success("Verification report successfully submitted!");
        if (id) {
          localStorage.removeItem(`closure_verification_draft_${id}`);
        }
        setTimeout(() => {
          navigate("/banglar-bhumi");
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to submit verification report.");
      }
    } catch (err: any) {
      console.error("Error submitting verification report:", err);
      toast.error(err.response?.data?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generic File Input card renderer
  const renderFileInput = (
    label: string,
    file: File | null,
    preview: string | null,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void
  ) => {
    const hasDocument = !!(file || preview);
    const isServerFile = !file && !!preview;
    const fileName = file ? file.name : (preview ? preview.split("/").pop() : "");

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/70 flex flex-col space-y-3 hover:border-blue-400 transition shadow-sm">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
          {label}
        </span>

        {!hasDocument ? (
          <div className="border border-dashed border-gray-300 hover:border-[#1E73BE] rounded bg-white p-4 flex flex-col items-center justify-center relative cursor-pointer group transition h-32 select-none">
            <input
              type="file"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,application/pdf"
            />
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1E73BE] mb-1.5 transition" />
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-gray-900 text-center">
              Click to upload or drag & drop
            </span>
            <span className="text-[9px] text-gray-400 mt-0.5 text-center">
              PDF (max 200 KB), PNG, JPG
            </span>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded p-3 flex flex-col justify-between h-32 relative">
            <div className="flex items-start gap-2">
              <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-gray-800 truncate" title={fileName}>{fileName}</p>
                {file ? (
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                    Already Uploaded
                  </p>
                )}
              </div>
            </div>

            {isServerFile ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (preview) {
                        const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
                        const fileUrl = preview.startsWith("http") ? preview : `${base_url}/${preview}`;
                        window.open(fileUrl, "_blank");
                        toast.success(`Opening ${fileName}`);
                      }
                    } catch (e) {
                      console.error("Error opening file:", e);
                      toast.error("Failed to open file");
                    }
                  }}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] font-bold uppercase tracking-wider rounded transition cursor-pointer"
                >
                  View Document
                </button>
              </div>
            ) : (
              preview && preview.startsWith("blob:") ? (
                <div className="h-12 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img src={preview} alt="Preview" className="h-full object-contain" />
                </div>
              ) : (
                <div className="h-12 border rounded bg-gray-50 flex items-center justify-center text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider select-none">
                  Local Preview (PDF)
                </div>
              )
            )}

            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 text-[10px] text-red-600 hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loadingInspection) {
    return (
      <div className="w-full min-h-screen bg-[#ededed] flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-700">Loading Establishment Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#ededed] p-4 md:p-6 font-sans select-none">

      {/* -------------------- HEADER -------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#1E73BE]" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Report for NOC for Conversion of Factory/Karkhana Land</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Identify, check, and process the verification of establishment closure applications</p>
        </div>
      </div>

      {/* -------------------- MAIN PAGE CONTAINER -------------------- */}
      <div className="w-full mx-auto space-y-6">

        {/* SECTION 1: AUTO POPULATED ESTABLISHMENT DETAILS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-200">
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <h2 className="text-base md:text-lg font-bold text-amber-900 uppercase tracking-wide">Establishment Details</h2>
          </div>

          {inspectionData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700 mb-6 bg-gray-50/50 p-4 border border-gray-100 rounded-lg">
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">Establishment Name</span>
                <span className="text-gray-900 text-sm font-bold">{inspectionData.s_factory_name || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">Registration / License No</span>
                <span className="text-gray-900 text-sm font-bold">{inspectionData.registration_no || inspectionData.license_no || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">Location Info (Block / Sub-Division / District)</span>
                <span className="text-gray-900 font-medium">
                  {inspectionData.block_name || "N/A"} / {inspectionData.sub_division_name || "N/A"} / {inspectionData.district_name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">Factory Address</span>
                <span className="text-gray-900 font-medium">{inspectionData.s_addrline || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">NOC No</span>
                <span className="text-gray-900 text-sm font-bold">{inspectionData.noc_no || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal uppercase tracking-wider text-[9px] mb-0.5">Factory Land Documents</span>
                {(() => {
                  const docs = inspectionData.factory_land_docs;
                  if (Array.isArray(docs) && docs.length > 0) {
                    return (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {docs.map((doc: any, index: number) => {
                          const docPath = String(doc?.file_path || "").trim();
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => ViewDocument(docPath)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-left w-fit"
                            >
                              View {doc?.doc_type || `Document ${index + 1}`} ({doc?.file_name || 'View'})
                            </button>
                          );
                        })}
                      </div>
                    );
                  } else if (typeof docs === "string" && docs.trim()) {
                    return (
                      <button
                        type="button"
                        onClick={() => ViewDocument(docs.trim())}
                        className="mt-1 text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-left w-fit"
                      >
                        View Document
                      </button>
                    );
                  }
                  return <span className="text-gray-900 font-medium">N/A</span>;
                })()}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Detail of R-O-R / ROR <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                value={formData.rorDetail}
                onChange={(e) => handleInputChange("rorDetail", e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter Detail of R-O-R"
                className="w-full text-xs border border-gray-300 rounded px-3 py-2.5 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: VERIFICATION CHECKLIST */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-200">
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            <h2 className="text-base md:text-lg font-bold text-amber-900 uppercase tracking-wide">Verification Checklist</h2>
          </div>

          <div className="space-y-6">

            {/* 1. Physical inspection */}
            <div className="border border-gray-200 rounded p-4 bg-gray-50/50 hover:border-gray-300 transition space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                1. Physical inspection of the premises<span className="text-red-500"></span>
              </label>

              {/* (a) Inspection done */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  (a) Inspection done <span className="text-red-500"></span>
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                    } ${formData.isLcInspectionDone === "YES"
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}>
                    <input
                      type="radio"
                      name="isLcInspectionDone"
                      value="YES"
                      checked={formData.isLcInspectionDone === "YES"}
                      onChange={() => handleInputChange("isLcInspectionDone", "YES")}
                      disabled={isReadOnly}
                      className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    YES
                  </label>

                  <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                    } ${formData.isLcInspectionDone === "NO"
                      ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}>
                    <input
                      type="radio"
                      name="isLcInspectionDone"
                      value="NO"
                      checked={formData.isLcInspectionDone === "NO"}
                      onChange={() => handleInputChange("isLcInspectionDone", "NO")}
                      disabled={isReadOnly}
                      className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                    />
                    NO
                  </label>
                </div>
              </div>

            </div>

            {/* 2. Collection of all documents as per norms */}
            <div className="border border-gray-200 rounded p-4 hover:border-gray-300 transition">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#1E73BE] mb-4 pb-2 border-b">
                2. Report Parameters as per existing norms
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* a. Operational Status */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (a) Whether the factory is operational <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isOperational === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isOperational"
                        value="YES"
                        checked={formData.isOperational === "YES"}
                        onChange={() => handleInputChange("isOperational", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isOperational === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isOperational"
                        value="NO"
                        checked={formData.isOperational === "NO"}
                        onChange={() => handleInputChange("isOperational", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                </div>

                {/* b. Closer Declared Status */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (b) Whether closure has been declared <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isCloserDeclared === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isCloserDeclared"
                        value="YES"
                        checked={formData.isCloserDeclared === "YES"}
                        onChange={() => handleInputChange("isCloserDeclared", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isCloserDeclared === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isCloserDeclared"
                        value="NO"
                        checked={formData.isCloserDeclared === "NO"}
                        onChange={() => handleInputChange("isCloserDeclared", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                </div>

                {/* c. Date of closure filed */}
                {formData.isCloserDeclared === "YES" && <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (c) Date of closure <span className="text-red-500"></span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfClosureFiled}
                    onChange={(e) => handleInputChange("dateOfClosureFiled", e.target.value)}
                    disabled={isReadOnly}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                  />
                </div>}

              </div>

              {/* Questionnaire list details (d to l) */}
              <div className="mt-6 space-y-4">

                {/* d. Closure Notice details */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    (d) Closure Notice with reasons given by the employer <span className="text-red-500"></span>
                  </label>
                  <input
                    type="text"
                    value={formData.closureNoticeDetails}
                    onChange={(e) => handleInputChange("closureNoticeDetails", e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Enter details of notice (e.g. Reference No., reasons verified, Date of receipt)"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* e. FAWLOI operational */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (e) Whether FAWLOI is operational <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isFawloiOperational === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isFawloiOperational"
                        value="YES"
                        checked={formData.isFawloiOperational === "YES"}
                        onChange={() => handleInputChange("isFawloiOperational", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isFawloiOperational === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isFawloiOperational"
                        value="NO"
                        checked={formData.isFawloiOperational === "NO"}
                        onChange={() => handleInputChange("isFawloiOperational", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                  {formData.isFawloiOperational === "YES" && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Last Date of Disbursement of FAWLOI <span className="text-red-500"></span>
                        </label>
                        <input
                          type="date"
                          value={formData.fawloiLastDisbursementDate}
                          onChange={(e) => handleInputChange("fawloiLastDisbursementDate", e.target.value)}
                          disabled={isReadOnly}
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Persons Involved <span className="text-red-500"></span>
                        </label>
                        <input
                          type="number"
                          value={formData.fawloiPersonsInvolved}
                          onChange={(e) => handleInputChange("fawloiPersonsInvolved", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter number of persons involved"
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* f. Claim of salary wage pending */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (f) Whether any claim of salary/wage is pending <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isSalaryWageClaimPending === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isSalaryWageClaimPending"
                        value="YES"
                        checked={formData.isSalaryWageClaimPending === "YES"}
                        onChange={() => handleInputChange("isSalaryWageClaimPending", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isSalaryWageClaimPending === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isSalaryWageClaimPending"
                        value="NO"
                        checked={formData.isSalaryWageClaimPending === "NO"}
                        onChange={() => handleInputChange("isSalaryWageClaimPending", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                  {formData.isSalaryWageClaimPending === "YES" && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Persons Involved <span className="text-red-500"></span>
                        </label>
                        <input
                          type="number"
                          value={formData.salaryWagePendingPersons}
                          onChange={(e) => handleInputChange("salaryWagePendingPersons", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter number of persons involved"
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Amount pending <span className="text-red-500"></span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.salaryWagePendingAmount}
                          onChange={(e) => handleInputChange("salaryWagePendingAmount", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter pending amount"
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* g. Industrial Disputes Act pending */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (g) Whether any file under Industrial Disputes Act is pending <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isIndustrialDisputePending === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isIndustrialDisputePending"
                        value="YES"
                        checked={formData.isIndustrialDisputePending === "YES"}
                        onChange={() => handleInputChange("isIndustrialDisputePending", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isIndustrialDisputePending === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isIndustrialDisputePending"
                        value="NO"
                        checked={formData.isIndustrialDisputePending === "NO"}
                        onChange={() => handleInputChange("isIndustrialDisputePending", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                  {formData.isIndustrialDisputePending === "YES" && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-md">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Details of Industrial Disputes <span className="text-red-500"></span>
                        </label>
                        <textarea
                          value={formData.industrialDisputeDetails}
                          onChange={(e) => handleInputChange("industrialDisputeDetails", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter details of pending industrial disputes"
                          className="w-full text-xs border border-gray-300 rounded p-2.5 bg-white min-h-[60px] focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* h. Gratuity case pending */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (h) Whether any gratuity case against the employer is pending <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isGratuityCasePending === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isGratuityCasePending"
                        value="YES"
                        checked={formData.isGratuityCasePending === "YES"}
                        onChange={() => handleInputChange("isGratuityCasePending", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isGratuityCasePending === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isGratuityCasePending"
                        value="NO"
                        checked={formData.isGratuityCasePending === "NO"}
                        onChange={() => handleInputChange("isGratuityCasePending", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                  {formData.isGratuityCasePending === "YES" && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Persons Include <span className="text-red-500"></span>
                        </label>
                        <input
                          type="number"
                          value={formData.gratuityPersonsInvolved}
                          onChange={(e) => handleInputChange("gratuityPersonsInvolved", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter number of persons involved"
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase">
                          Amount of gratuity pending <span className="text-red-500"></span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.gratuityPendingAmount}
                          onChange={(e) => handleInputChange("gratuityPendingAmount", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Enter pending gratuity amount"
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* k. Any leave due */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (i) Whether any leave is due <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isLeaveDue === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isLeaveDue"
                        value="YES"
                        checked={formData.isLeaveDue === "YES"}
                        onChange={() => handleInputChange("isLeaveDue", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isLeaveDue === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isLeaveDue"
                        value="NO"
                        checked={formData.isLeaveDue === "NO"}
                        onChange={() => handleInputChange("isLeaveDue", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                </div>

                {/* l. Any legal case pending */}
                <div className="space-y-2 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <label className="block text-xs font-semibold text-gray-700">
                    (j) Whether any legal case is pending <span className="text-red-500"></span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isLegalCasePending === "YES"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isLegalCasePending"
                        value="YES"
                        checked={formData.isLegalCasePending === "YES"}
                        onChange={() => handleInputChange("isLegalCasePending", "YES")}
                        disabled={isReadOnly}
                        className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      YES
                    </label>

                    <label className={`flex items-center gap-2 px-4 py-1.5 border rounded text-xs cursor-pointer transition select-none ${isReadOnly ? "cursor-not-allowed opacity-75" : ""
                      } ${formData.isLegalCasePending === "NO"
                        ? "border-rose-500 bg-rose-50/50 text-rose-950 font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <input
                        type="radio"
                        name="isLegalCasePending"
                        value="NO"
                        checked={formData.isLegalCasePending === "NO"}
                        onChange={() => handleInputChange("isLegalCasePending", "NO")}
                        disabled={isReadOnly}
                        className="text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                      />
                      NO
                    </label>
                  </div>
                </div>

                {/* i. PF Payment Status & j. ESI Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100 p-3 rounded bg-white shadow-sm">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      (k) PF Payment Status <span className="text-red-500"></span>
                    </label>
                    <select
                      value={formData.pfPaymentStatus}
                      onChange={(e) => handleInputChange("pfPaymentStatus", e.target.value)}
                      disabled={isReadOnly}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Status --</option>
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      (L) ESI Payment Status <span className="text-red-500"></span>
                    </label>
                    <select
                      value={formData.esiPaymentStatus}
                      onChange={(e) => handleInputChange("esiPaymentStatus", e.target.value)}
                      disabled={isReadOnly}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Status --</option>
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>



              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: DOCUMENTS UPLOAD & PREVIEW */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-200">
          <div className="border-b border-gray-200 pb-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-base md:text-lg font-bold text-amber-900 uppercase tracking-wide">Documents Upload & Preview</h2>
            </div>
          </div>

          {isReadOnly ? (
            <div>
              {(() => {
                const docList = (inspectionData?.report_docs || inspectionData?.files || [])
                  .filter((file: any) => {
                    if (!file) return false;
                    if (String(file.source).toLowerCase() !== "lc") return false;
                    if (formData.isLcInspectionDone !== "YES" && file.doc_type_id === 6) return false;
                    return true;
                  });

                if (docList.length > 0) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {docList.map((file: any, idx: number) => {
                        const docTypeNames: Record<number, string> = {
                          1: "2. Closure Notice (Form O)",
                          2: "4. Industrial Disputes (ID) Report",
                          3: "3. Report of PF/ESI Authority",
                          4: "4. Payment of Wages Act",
                          5: "5. Leave with Wages",
                          6: "1. Physical Inspection Report",
                          7: "5. Any other document"
                        };
                        return (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-xs hover:border-[#1E73BE] transition">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                  {docTypeNames[file.doc_type_id] || "Document"}
                                </span>
                                <span className="text-xs font-bold text-gray-800 line-clamp-1">{file.file_name}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  if (file.file_content) {
                                    const linkSource = `data:application/pdf;base64,${file.file_content}`;
                                    const downloadLink = document.createElement("a");
                                    downloadLink.href = linkSource;
                                    downloadLink.download = file.file_name;
                                    downloadLink.click();
                                    toast.success(`Downloading ${file.file_name}`);
                                  } else if (file.file_path) {
                                    const base_url = import.meta.env.VITE_BANGLAR_BHUMI_INS_BASE_URL;
                                    const fileUrl = `${base_url}/${file.file_path}`;
                                    window.open(fileUrl, "_blank");
                                    toast.success(`Opening ${file.file_name}`);
                                  } else {
                                    toast.error("File source not available");
                                  }
                                } catch (e) {
                                  console.error("Error accessing file:", e);
                                  toast.error("Failed to access file");
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded shadow-sm transition cursor-pointer"
                            >
                              View / Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <p className="text-xs text-slate-400 italic">No documents were submitted for this inspection.</p>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.isLcInspectionDone === "YES" && renderFileInput(
                "1. Physical Inspection Report",
                inspectionReportFile,
                inspectionReportPreview,
                (e) => handleFileChange(e, setInspectionReportFile, setInspectionReportPreview),
                () => { setInspectionReportFile(null); setInspectionReportPreview(null); }
              )}
              {renderFileInput(
                "2. Closure Notice (Form O)",
                closureNoticeFile,
                closureNoticePreview,
                (e) => handleFileChange(e, setClosureNoticeFile, setClosureNoticePreview),
                () => { setClosureNoticeFile(null); setClosureNoticePreview(null); }
              )}
              {renderFileInput(
                "3. Report of PF/ESI Authority",
                pfEsiFile,
                pfEsiPreview,
                (e) => handleFileChange(e, setPfEsiFile, setPfEsiPreview),
                () => { setPfEsiFile(null); setPfEsiPreview(null); }
              )}
              {renderFileInput(
                "4. Industrial Disputes (ID) Report",
                idReportFile,
                idReportPreview,
                (e) => handleFileChange(e, setIdReportFile, setIdReportPreview),
                () => { setIdReportFile(null); setIdReportPreview(null); }
              )}
              {renderFileInput(
                "5. Any other document",
                otherDocFile,
                otherDocPreview,
                (e) => handleFileChange(e, setOtherDocFile, setOtherDocPreview),
                () => { setOtherDocFile(null); setOtherDocPreview(null); }
              )}
            </div>
          )}
        </div>

        {/* SECTION 3.5: INSPECTION HISTORY / REMARKS TIMELINE */}
        {(() => {
          const lcRemarks = Array.isArray(inspectionData?.remarks?.lc) ? inspectionData.remarks.lc : [];
          const jsRemarks = Array.isArray(inspectionData?.remarks?.js)
            ? inspectionData.remarks.js.filter((remark: any) => remark && String(remark.inspection_status).trim().toUpperCase() === "BLC")
            : [];
          const combinedRemarks = [...lcRemarks, ...jsRemarks];
          if (combinedRemarks.length === 0) return null;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-200">
              <div className="border-b border-gray-200 pb-3 mb-5 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base md:text-lg font-bold text-indigo-900 uppercase tracking-wide">Inspection History & Remarks</h2>
              </div>

              <div className="relative pl-6 border-l-2 border-indigo-100 ml-4 space-y-6">
                {[...combinedRemarks]
                  .sort((a, b) => {
                    const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
                    const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
                    return timeA - timeB;
                  })
                  .map((remark: any, index: number) => {
                    const remarkDate = remark.created_at ? new Date(remark.created_at).toLocaleString() : "Date N/A";

                    // Color badges for different sources
                    const sourceColors: Record<string, string> = {
                      ALC: "bg-amber-100 text-amber-800 border-amber-200",
                      DLC: "bg-blue-100 text-blue-800 border-blue-200",
                      LC: "bg-purple-100 text-purple-800 border-purple-200",
                      JS: "bg-emerald-100 text-emerald-800 border-emerald-200",
                      system: "bg-gray-100 text-gray-800 border-gray-200"
                    };

                    const badgeClass = sourceColors[remark.source] || "bg-slate-100 text-slate-800 border-slate-200";

                    return (
                      <div key={remark.id || index} className="relative group text-left">
                        {/* Bullet marker on line */}
                        <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white group-hover:bg-indigo-600 transition" />

                        <div className="bg-gray-50/70 border border-gray-100 rounded-lg p-4 hover:border-indigo-100 transition shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${badgeClass}`}>
                                {remark.designation}
                              </span>
                              {remark.remarks_by_name && (
                                <span className="text-xs font-bold text-gray-800">
                                  {remark.remarks_by_name}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-medium">
                                {remarkDate}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed bg-white/50 border border-gray-50 rounded p-2.5 whitespace-pre-line shadow-3xs">
                            {remark.remarks}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })()}

        {/* SECTION 4: VERIFICATION REMARKS (Visible only for DLC/LC during verification) */}
        {((userRole === 5 && ["I", "BDLC", "DLC"].includes(currentStatus)) || (userRole === 12 && ["LC", "BLC"].includes(currentStatus))) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition duration-200">
            <div className="border-b border-gray-200 pb-3 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-600" />
              <h2 className="text-base md:text-lg font-bold text-amber-900 uppercase tracking-wide">Verification Remarks</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-gray-700">
                Provide your comments/remarks for this decision:
              </label>
              <textarea
                value={verificationRemarks}
                onChange={(e) => setVerificationRemarks(e.target.value)}
                placeholder="Enter verification comments or reason for backing/forwarding..."
                className="w-full text-xs border border-gray-300 rounded p-2.5 bg-white min-h-[100px] focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-inner text-gray-800"
              />
            </div>
          </div>
        )}

        {/* -------------------- FORM ACTION BUTTONS -------------------- */}
        <div className="mt-8 border-t border-gray-200 pt-5 flex justify-end items-center gap-3 print:hidden">

          {/* ALC Submission */}
          {userRole === 4 && (currentStatus === "ALC" || currentStatus === "BALC") && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex items-center gap-1.5 text-white px-6 py-2 rounded-lg text-xs font-bold transition shadow-md ${submitting
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                }`}
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Recommended and Forward to DLC
                </>
              )}
            </button>
          )}

          {/* DLC Options */}
          {userRole === 5 && ["I", "BDLC", "DLC"].includes(currentStatus) && (
            <div className="flex gap-3">
              {currentStatus === "I" && (
                <button
                  type="button"
                  onClick={() => handleVerificationSubmit("ALC")}
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  Forward to Assistant LC
                </button>
              )}
              {currentStatus === "BDLC" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleVerificationSubmit("ALC")}
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Back to Assistant LC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerificationSubmit("LC")}
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Recommend and Forward to LC Headquater
                  </button>
                </>
              )}
              {currentStatus === "DLC" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleVerificationSubmit("BALC")}
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Send Back to Assistant LC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerificationSubmit("LC")}
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Recommend and Forward to LC Headquater
                  </button>
                </>
              )}
            </div>
          )}

          {/* LC Options */}
          {userRole === 12 && ["LC", "BLC"].includes(currentStatus) && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleVerificationSubmit("BDLC")}
                disabled={submitting}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
              >
                Send Back to DLC
              </button>
              <button
                type="button"
                onClick={() => handleVerificationSubmit("JSLD")}
                disabled={submitting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
              >
                Recommended and Forward to JS
              </button>
            </div>
          )}
        </div>

        {/* End of Document marker */}
        <div className="flex items-center justify-between border-t border-stone-300/60 pt-4 mt-6">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Department of Labour - Government of West Bengal</span>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-widest">End of document</span>
            <div className="w-3 h-3 bg-[#1E73BE] rounded-sm" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClosureVerification;
