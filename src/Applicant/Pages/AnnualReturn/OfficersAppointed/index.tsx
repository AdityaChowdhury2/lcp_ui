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

import { NotificationState, OfficerRow, OfficersAppointedForm as FormType } from "./types/officersAppointed.types";
import { formatDate } from "./utils/officersAppointed.utils";
import { OfficerAppointedForm } from "./components/OfficerAppointedForm";
import { OfficerAppointedTable } from "./components/OfficerAppointedTable";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  dob: yup.string().required("Date of Birth is required"),
  privateAddress: yup.string().trim().required("Private Address is required"),
  personalOccupation: yup.string().trim().required("Personal Occupation is required"),
  titlePosition: yup.string().trim().required("Title of Position is required"),
  appointmentDate: yup.string().required("Date on which appointment was taken up is required"),
  otherOffice: yup.string().trim().required("Other Office details are required"),
});

const OfficersAppointedModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const [tableData, setTableData] = useState<OfficerRow[]>([]);
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

  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);

  const token = getAuthToken() ?? "";
  const encryptedWizardId = encryptedReturnYear;

  const form = useForm<FormType>({
    resolver: yupResolver(schema),
  });

  const getOfficersAppointed = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/annual-return/officers-appointed/${safeRegId}/${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res?.data?.data || [];
      const formattedData = data.map((item: any) => ({
        ...item,
        dob: formatDate(item.dob),
        date_appointment_was_taken: formatDate(item.date_appointment_was_taken),
      }));
      setTableData(formattedData);
    } catch (err) {
      console.error("Failed to fetch officers appointed", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getOfficersAppointed();
  }, []);

  /* SUBMIT */
  const onSubmit = async (data: FormType) => {
    setIsSubmitting(true);
    try {
      const payload = {
        reg_id: encryptedRegId,
        wizard_id: encryptedWizardId,
        name: data.name,
        dob: data.dob,
        private_address: data.privateAddress,
        tital_position_held: data.titlePosition,
        personal_occupation: data.personalOccupation,
        date_which_appointment: data.appointmentDate,
        other_office_held: data.otherOffice,
      };

      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/submit-officers-appointed`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201 || res.status === 200) {
        form.reset();
      }

      showNotification("success", "Officer details saved successfully");
      getOfficersAppointed();
    } catch (error) {
      console.error("SUBMIT ERROR ❌", error);
      showNotification("error", "Failed to submit officer details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRow = async (row: OfficerRow) => {
    try {
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/officers-appointed-delete/${encodeURIComponent(row.encrypted_id)}/${safeRegId}/${safeReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const message = res?.data?.message || "Officer record deleted successfully";
      showNotification("success", message);
      getOfficersAppointed();
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
    <div className="bg-[#eef1f4] min-h-screen p-6 font-sans">
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
      <OfficerAppointedForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onBack={handleBack}
      />

      {/* TABLE COMPONENT */}
      <OfficerAppointedTable
        tableData={tableData}
        loadingTable={loadingTable}
        onDelete={deleteRow}
      />
    </div>
  );
};

export default OfficersAppointedModule;
