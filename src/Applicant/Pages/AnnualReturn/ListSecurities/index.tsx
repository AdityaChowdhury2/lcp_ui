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
import { NotificationState, SecurityForm, SecurityRow } from "./types/securities.types";
import { SecuritiesForm } from "./components/SecuritiesForm";
import { SecuritiesTable } from "./components/SecuritiesTable";

/* ================= VALIDATION SCHEMA ================= */
const schema = yup.object({
  particulars: yup.string().required("Particulars is required"),
  faceValue: yup
    .string()
    .required("Face Value is required")
    .test("non-negative", "Face Value cannot be negative", (val) => !val || Number(val) >= 0),
  costPrice: yup
    .string()
    .required("Cost Price is required")
    .test("non-negative", "Cost Price cannot be negative", (val) => !val || Number(val) >= 0),
  marketPrice: yup
    .string()
    .required("Market Price is required")
    .test("non-negative", "Market Price cannot be negative", (val) => !val || Number(val) >= 0),
  inHand: yup.string().required("In hands of is required"),
});

const ListSecuritiesModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);

  const token = getAuthToken() ?? "";

  const [data, setData] = useState<SecurityRow[]>([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const form = useForm<SecurityForm>({
    resolver: yupResolver(schema),
  });

  const getListOfSecurities = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/annual-list-securities/${safeRegId}/${safeReturnYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = res.data.map((item: any) => ({
        sl_no: item.sl_no,
        particulars: item.particulars,
        face_value: Number(item.face_value),
        cost_price: Number(item.cost_price),
        market_price: Number(item.market_price),
        in_hand: item.in_hand,
        encrypted_id: item.encrypted_id,
      }));

      setData(apiData);
    } catch (err) {
      console.error("Failed to load securities list", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    getListOfSecurities();
  }, []);

  const onSubmit = async (formData: SecurityForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        encryptedRegId: encryptedRegId,
        encryptedWizardId: encryptedReturnYear,
        particulars: formData.particulars,
        face_value: formData.faceValue,
        cost_price: formData.costPrice,
        market_price: formData.marketPrice,
        in_hand: formData.inHand,
      };

      const res = await axios.post(`${API_BASE}trade-union/annual-list-securities`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const message = res?.data?.message || "Securities List record has been added";
      showNotification("success", message);
      form.reset();
      await getListOfSecurities();
    } catch (err: any) {
      console.error("Submit failed", err);
      showNotification("error", err?.response?.data?.message || "Failed to add security record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRow = async (row: SecurityRow) => {
    setDeletingId(row.encrypted_id);
    try {
      const res = await axios.post(
        `${API_BASE}trade-union/list-securities-delete/${encodeURIComponent(row.encrypted_id)}/${safeRegId}/${safeReturnYear}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification("success", res?.data?.message || "Record deleted successfully");
      setData((prev) => prev.filter((r) => r.encrypted_id !== row.encrypted_id));
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("error", "Failed to delete record");
    } finally {
      setDeletingId(null);
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
    <div className="bg-[#eef2f5] min-h-screen p-6">
      {/* PAGE TITLE */}
      <div className="text-[14px] font-semibold mb-4 text-gray-800">
        VIEW ANNUAL REPORT
      </div>

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

      <div className="bg-white border border-[#d5d5d5] rounded-sm shadow-sm">
        {/* SECTION HEADER */}
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2">
          LIST OF SECURITIES
        </div>

        {/* FORM COMPONENT */}
        <SecuritiesForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onBack={handleBack}
        />

        {/* TABLE COMPONENT */}
        <SecuritiesTable
          data={data}
          loading={loadingTable}
          deletingId={deletingId}
          onDelete={deleteRow}
        />
      </div>
    </div>
  );
};

export default ListSecuritiesModule;
