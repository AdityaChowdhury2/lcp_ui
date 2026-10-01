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

import { ElectionForm, ElectionRow, NotificationState } from "./types/electedMember.types";
import { formatDate } from "./utils/electedMember.utils";
import { ElectedMemberForm } from "./components/ElectedMemberForm";
import { ElectedMemberTable } from "./components/ElectedMemberTable";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  dob: yup.string().required("Date of Birth is required"),
  title: yup.string().trim().required("Title of position is required"),
  electionDate: yup.string().required("Date of Election is required"),
  lastElectionDate: yup.string().required("Date of Last Election is required"),
  nextElectionDate: yup.string().required("Date of Next Election is required"),
  privateAddress: yup.string().trim().required("Private Address is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile number")
    .required("Mobile Number is required"),
  signature: yup
    .mixed<FileList>()
    .test(
      "fileRequired",
      "Signature is required",
      (value) => value instanceof FileList && value.length > 0
    )
    .required(),
});

const ElectedMemberModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const [rows, setRows] = useState<ElectionRow[]>([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);

  const token = getAuthToken() ?? "";

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

  const getElection = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/annual-election/${safeRegId}/${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tableData = res?.data || [];
      const formattedData = Array.isArray(tableData)
        ? tableData.map((r: any) => ({
            ...r,
            date_of_birth: formatDate(r.date_of_birth),
            date_of_election: formatDate(r.date_of_election),
          }))
        : [];
      setRows(formattedData);
    } catch (err) {
      console.error("Failed to fetch election data", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getElection();
  }, []);

  const form = useForm<ElectionForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      dob: "",
      title: "",
      electionDate: "",
      lastElectionDate: "",
      nextElectionDate: "",
      privateAddress: "",
      mobile: "",
      signature: undefined as unknown as FileList,
    },
  });

  const onSubmit = async (data: ElectionForm) => {
    setIsSubmitting(true);
    try {
      const file = data.signature[0];

      const formData = new FormData();
      formData.append("encryptedRegId", encryptedRegId);
      formData.append("encryptedWizardId", encryptedReturnYear);
      formData.append("name", data.name);
      formData.append("date_of_birth", data.dob);
      formData.append("title_position_federation", data.title);
      formData.append("date_election", data.electionDate);
      formData.append("date_last_election", data.lastElectionDate);
      formData.append("date_next_election", data.nextElectionDate);
      formData.append("private_address", data.privateAddress);
      formData.append("mobile", data.mobile);
      formData.append("signature", file);

      const res = await axios.post(
        `${API_BASE}trade-union/annual-election`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201 || res.status === 200) {
        form.reset();
      }

      showNotification("success", "Election details saved successfully");
      getElection();
    } catch (error) {
      console.error("SUBMIT ERROR ❌", error);
      showNotification("error", "Failed to submit election details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRow = async (row: any) => {
    try {
      const res = await axios.post(
        `${API_BASE}trade-union/annual-election-delete/${encodeURIComponent(row.encrypted_id)}/${safeRegId}/${safeReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const message = res?.data?.message || "Record deleted successfully";
      showNotification("success", message);
      getElection();
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("error", "Failed to delete election record");
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
      <h2 className="text-sm font-semibold mb-3 text-gray-800">
        RETURN TO BE MADE BY FEDERATION OF TRADE UNIONS
      </h2>

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
      <ElectedMemberForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onBack={handleBack}
      />

      {/* TABLE COMPONENT */}
      <ElectedMemberTable
        rows={rows}
        loadingTable={loadingTable}
        onDelete={deleteRow}
      />
    </div>
  );
};

export default ElectedMemberModule;
