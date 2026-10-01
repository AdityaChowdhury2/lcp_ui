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

import { FormData, NotificationState, OfficerRow } from "./types/officersRelinquishing.types";
import { formatDate } from "./utils/officersRelinquishing.utils";
import { OfficerRelinquishingForm } from "./components/OfficerRelinquishingForm";
import { OfficerRelinquishingTable } from "./components/OfficerRelinquishingTable";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  office: yup.string().trim().required("Office is required"),
  date: yup.string().required("Date of Relinquishing Office is required"),
});

const OfficersRelinquishingOfficeModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

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

  const [tableData, setTableData] = useState<OfficerRow[]>([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const getOfficersTableData = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/annual-return/officers-relinquishing/${safeRegId}/${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const resData = res?.data?.data || [];
      const formattedData: OfficerRow[] = resData.map((item: any, index: number) => ({
        sl: item?.slNo || index + 1,
        id: item?.id,
        name: item?.name ?? "",
        office: item?.office ?? "",
        date: formatDate(item?.date_of_relinquishing_office ?? ""),
      }));
      setTableData(formattedData);
    } catch (err) {
      console.error("Failed to load officers relinquishing data", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getOfficersTableData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        reg_id: encryptedRegId,
        wizard_id: encryptedReturnYear,
        name: data.name,
        office: data.office,
        date_of_relinquisihing: data.date,
      };

      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/submit-officers-relinquishing`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification("success", res?.data?.message || "Officer record saved successfully");
      form.reset();
      getOfficersTableData();
    } catch (err) {
      console.error("Save officers relinquishing record failed", err);
      showNotification("error", "Failed to save officer record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOfficersData = async (id: number) => {
    try {
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/delete-officers-relinquishing/${safeRegId}/${safeReturnYear}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification("success", res?.data?.message || "Officer record deleted successfully");
      getOfficersTableData();
    } catch (err) {
      console.error("Delete officer record failed", err);
      showNotification("error", "Failed to delete officer record");
    }
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
      <OfficerRelinquishingForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      {/* NOTE */}
      <div className="text-red-600 font-semibold mb-2 text-sm">
        Note:- The following changes officers have been made during the year {returnYear || "...."}
      </div>

      {/* TABLE COMPONENT */}
      <OfficerRelinquishingTable
        tableData={tableData}
        loadingTable={loadingTable}
        onDelete={handleDeleteOfficersData}
      />

      {/* BACK BUTTON */}
      <div className="mt-4">
        <button
          type="button"
          className="bg-[#337ab7] text-white px-6 py-1.5 rounded text-sm hover:bg-[#286090] transition"
          onClick={() => {
            navigate(`/trade-union/annual-upload-documents`, {
              state: {
                regNo,
                returnYear,
              },
            });
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default OfficersRelinquishingOfficeModule;
