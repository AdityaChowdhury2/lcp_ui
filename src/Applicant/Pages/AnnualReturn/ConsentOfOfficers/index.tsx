import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";

import { ConsentForm as FormType, ConsentRow, NotificationState } from "./types/consentOfOfficers.types";
import { ConsentForm } from "./components/ConsentForm";
import { ConsentTable } from "./components/ConsentTable";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  designation: yup.string().trim().required("Designation is required"),
  mobile: yup
    .string()
    .required("Mobile is required")
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile number"),
  signature: yup
    .mixed<FileList>()
    .test(
      "fileRequired",
      "Signature is required",
      (value) => value instanceof FileList && value.length > 0
    )
    .required(),
});

const ConsentOfOfficersModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const [rows, setRows] = useState<ConsentRow[]>([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    message: "",
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 4000);
  };

  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);
  const token = getAuthToken() ?? "";

  const form = useForm<FormType>({
    resolver: yupResolver(schema),
  });

  const getConsentOfficers = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/consent-officers/${safeRegId}/${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tableData = res?.data || [];
      setRows(Array.isArray(tableData) ? tableData : []);
    } catch (err) {
      console.error("Failed to fetch consent officers", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getConsentOfficers();
  }, []);

  const onSubmit = async (data: FormType) => {
    setIsSubmitting(true);
    try {
      const file = data.signature[0];

      const formData = new FormData();
      formData.append("encryptedRegId", encryptedRegId);
      formData.append("encryptedWizardId", encryptedReturnYear);
      formData.append("signed", data.name);
      formData.append("designation", data.designation);
      formData.append("mobile", data.mobile);
      formData.append("signature", file);

      const res = await axios.post(
        `${API_BASE}trade-union/consent-officers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        showNotification("success", res.data?.message || "Consent saved successfully");
        form.reset();
      } else {
        showNotification("success", "Consent saved successfully");
        form.reset();
      }
      getConsentOfficers();
    } catch (error) {
      console.error("SUBMIT ERROR ❌", error);
      showNotification("error", "Failed to submit consent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (r: ConsentRow) => {
    try {
      const safeEncryptedId = encodeURIComponent(r.encrypted_id);
      const res = await axios.post(
        `${API_BASE}trade-union/consent-officers-delete/${safeEncryptedId}/${safeRegId}/${safeReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification("success", res?.data?.message || "Officer record deleted successfully");
      getConsentOfficers();
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("error", "Failed to delete officer record");
    }
  };

  const handleBack = () => {
    navigate(`/trade-union/annual-upload-documents`, {
      state: {
        regNo,
        returnYear,
      },
    });
  };

  return (
    <div className="bg-[#eef1f4] min-h-screen p-6 mb-10 font-sans">
      <h2 className="text-sm font-semibold mb-3 text-gray-800">VIEW ANNUAL REPORT</h2>

      {/* NOTIFICATION BANNER */}
      {notification.type && (
        <div
          className={`mb-4 px-4 py-3 rounded flex items-center justify-between shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#00a65a] text-white"
              : "bg-[#dd4b39] text-white"
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-[13px]">
            {notification.type === "success" ? (
              <FaCheckCircle className="w-4 h-4" />
            ) : (
              <FaExclamationCircle className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: null, message: "" })}
            className="text-white hover:opacity-75 focus:outline-none"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FORM COMPONENT */}
      <ConsentForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onBack={handleBack}
      />

      {/* TABLE COMPONENT */}
      <ConsentTable
        rows={rows}
        loadingTable={loadingTable}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ConsentOfOfficersModule;
