import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { getAuthToken, getUserId } from "@/utils/auth";

interface ParamRow {
  parameter: string;
  input: string;
}

interface DocRow {
  name: string;
  fileUrl: string;
}


const AnnualReturnPreview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? '';
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? '';
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);
  const userId = getUserId();
  const encryptedUserId = encryptionDecryptionFun("encrypt", String(userId)) ?? '';
  const safeUserId = encodeURIComponent(encryptedUserId);
  const token = getAuthToken() ?? "";
    
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [params, setParams] = useState<ParamRow[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [isOtpRes, setIsOtpRes] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string>("");
  const [agree, setAgree] = useState(false);
  const [finalStatus, setFinalStatus] = useState(false);
  const [otpSent, setOtpSent] = useState(false);   // hardcoded
  const [canSubmit, setCanSubmit] = useState(true);  // hardcoded
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAnnualReturnPreview = async () => {
    try {
      setLoadingDocs(true);
      const res = await axios.get(
        `${API_BASE}trade-union/annual-return/preview?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const resData = res?.data || {};
  
      // 🔹 Parameters table mapping
      const parametersTableData: ParamRow[] = [
        {
          parameter: "Registration Number",
          input: String(resData?.preview?.registrationNumber ?? "-"),
        },
        {
          parameter: "Trade Union Name",
          input: resData?.preview?.tradeUnionName ?? "-",
        },
        {
          parameter: "Registered Address",
          input: resData?.preview?.registeredAddress ?? "-",
        },
      ];
  
      setParams(parametersTableData);
  
      // 🔹 Call combined PDF API (blob)
      const combinedPdfRes = await axios.get(
        `${API_BASE}trade-union/annual-return/combined/pdf?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}&encryptedUserId=${encryptedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // 🔥 Important
        }
      );
  
      const combinedPdfBlob = new Blob([combinedPdfRes.data], { type: "application/pdf" });
      const combinedPdfUrl = URL.createObjectURL(combinedPdfBlob);

      // 🔹 Call Auditors Declaration PDF API (blob)
      const auditorPdfRes = await axios.get(
        `${API_BASE}trade-union/auditor-declaration?regId=${safeRegId}&wizardId=${safeReturnYear}&userId=${encryptedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // 🔥 Important
        }
      );
  
      const auditorPdfBlob = new Blob([auditorPdfRes.data], { type: "application/pdf" });
      const auditorPdfUrl = URL.createObjectURL(auditorPdfBlob);
  
      // 🔹 Documents table mapping
      const docsTableData: DocRow[] = [
        {
          name: "View your information",
          fileUrl: combinedPdfUrl, 
        },
        {
          name: "Auditors Declaration",
          fileUrl: resData?.documents?.auditDeclarationAvailable ? auditorPdfUrl : '#',
        }
      ];
  
      setDocs(docsTableData);
    } finally {
      setLoadingDocs(false);
    }
  };


  const checkFinalizeStatus = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/finalize?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res?.data;
      setFinalStatus(data?.finalStatus);
      setOtpSent(data?.otpSent);
      setCanSubmit(data?.canSubmit);

      if (data.finalStatus) {
        setNotification({ type: "error", message: "Annual Return already submitted." });
      }
    } catch {
      // silent catch for checkFinalizeStatus
    }
  };

  useEffect(() => {
    getAnnualReturnPreview();
  }, []);


  const sendOtpHandle = async () => {
    try {
      setSendingOtp(true);
      setNotification(null);
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/send-otp?encryptedRegId=${encryptedRegId}&encryptedWizardId=${encryptedReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setOtpSent(true);
        setNotification({
          type: "success",
          message: res.data?.message || "OTP sent successfully to your registered mobile number.",
        });
      } else {
        setNotification({
          type: "error",
          message: res.data?.message || "Failed to send OTP.",
        });
      }
    } catch (err: any) {
      console.error("Failed to send OTP", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setSendingOtp(false);
      setTimeout(() => {
        notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };


  const paramColumns: TableColumn<ParamRow>[] = [
    {
        name: "Parameters",
        selector: (row) => row.parameter,
        grow: 2,
    },
    {
        name: "Inputs",
        selector: (row) => row.input,
        grow: 4,
    },
  ];

  const docColumns: TableColumn<DocRow>[] = [
    {
        name: "",
        selector: (row) => row.name,
        grow: 3,
    },
    {
        name: "",
        cell: (row) => (
        <a href={row.fileUrl} target="_blank" rel="noreferrer">
            <img src={`${IMAGE_BASE}pdfred.png`} alt="PDF" className="w-5 h-5 inline-block" />
        </a>
        ),
        grow: 1,
    },
  ];


  const handleSubmit = async () => {
    if (!otp) {
      setOtpError("OTP is required");
      setNotification({ type: "error", message: "Please enter the 6-digit Security Code sent to your mobile number." });
      setTimeout(() => {
        notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setSubmitting(true);
      setNotification(null);
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/finalize?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}&encryptedUserId=${safeUserId}&otp=${otp}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification({
        type: "success",
        message: res.data?.message || "Annual return submitted successfully.",
      });
      setTimeout(() => {
        navigate("/trade-union/trade-federation-annual-return-form");
      }, 1500);
    } catch (err: any) {
      setOtpError("Invalid OTP or submission failed.");
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Invalid OTP or submission failed. Please try again.",
      });
      setTimeout(() => {
        notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-sm font-semibold mb-4">
        RETURN TO BE MADE BY FEDERATION OF TRADE UNIONS
      </div>

      <div className="bg-white shadow rounded">
        <div className="bg-[#2b5f87] text-white px-4 py-3 font-semibold">
          PREVIEW FOR TRADE UNION FEDERATION ANNUAL RETURN
        </div>

        <div className="p-4">
          {/* Notification Banner */}
          {notification && (
            <div
              ref={notificationRef}
              className={`mb-4 p-4 rounded-md shadow-sm border flex items-center justify-between transition-all ${
                notification.type === "success"
                  ? "bg-green-50 border-green-300 text-green-800"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === "success" ? (
                  <FaCheckCircle className="text-green-600 text-lg shrink-0" />
                ) : (
                  <FaExclamationCircle className="text-red-600 text-lg shrink-0" />
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 font-bold p-1 text-sm cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <DataTable
            columns={paramColumns}
            data={params}
            noHeader
            striped
            dense
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#6B7280", // Tailwind bg-gray-500
                },
              },
              headCells: {
                style: {
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "14px",
                },
              },
            }}
          />

          <div className="mt-6 bg-gray-500 text-white px-3 py-2 font-semibold text-center">
            Documents Uploaded
          </div>

          {loadingDocs ? (
            <p className="text-center py-4 text-gray-500">Loading documents...</p>
          ) : (
            <DataTable columns={docColumns} data={docs} noHeader dense />
          )}

          <div className="mt-4 flex items-start gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-1"
            />
            <p className="text-sm">
              I hereby declare that the particulars given above are true to the
              best of my knowledge and belief.
            </p>
          </div>

          {agree && (
            <div className="mt-4">
              <button
                type="button"
                disabled={sendingOtp}
                onClick={sendOtpHandle}
                className={`bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition-all ${
                  sendingOtp ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {sendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin text-white w-4 h-4" /> Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          )}

          {agree &&
            <div>
              <div className="mt-6">
                  <label className="block text-sm font-medium mb-1">
                  Please enter the Security Code Sent to your Registered Mobile No{" "}
                  <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // only digits
                      if (val.length <= 6) setOtp(val);
                      setOtpError("");
                    }}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
              </div>
            </div> 
          }

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                navigate("/trade-union/annual-upload-documents", {
                  state: { regNo, returnYear },
                })
              }
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded font-medium text-sm flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <FaArrowLeft className="w-3.5 h-3.5" /> Back to Rectify Data
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition-all ${
                otp.length !== 6 || submitting
                  ? "bg-gray-400 cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
              disabled={otp.length !== 6 || submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-white w-4 h-4" /> Submitting...
                </>
              ) : (
                "SUBMIT"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReturnPreview;
