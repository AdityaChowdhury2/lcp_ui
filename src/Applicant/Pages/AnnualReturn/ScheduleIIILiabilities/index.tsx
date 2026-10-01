import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaTimes } from "react-icons/fa";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";

import { AssetState, LiabilityState, ModalRow, NotificationState } from "./types/liabilities.types";
import { ALL_FIELDS } from "./constants/liabilities.constants";
import { LiabilitiesTable } from "./components/LiabilitiesTable";
import { AssetsTable } from "./components/AssetsTable";
import { TotalComparisonBanner } from "./components/TotalComparisonBanner";
import { DescriptionModal } from "./components/DescriptionModal";

const ScheduleIIILiabilitiesModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);

  const token = getAuthToken() ?? "";

  const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
  const [remarkLocked, setRemarkLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  /* ========== NOTIFICATIONS ========== */
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

  /* ========== LIABILITIES STATE ========== */
  const [liabilities, setLiabilities] = useState<LiabilityState>({
    applicationId: null,
    generalFund: 0,
    politicalFund: 0,
    loanFrom: 0,
    debtsDue: 0,
    otherLiabilities: 0,
    total: 0,
    assetLiabilityDate: null,
  });

  /* ========== ASSETS STATE ========== */
  const [assets, setAssets] = useState<AssetState>({
    cash: 0,
    inHands: 0,
    securities: 0,
    unpaidSubscription: 0,
    loansTo: 0,
    immovableProperties: 0,
    goodsFurniture: 0,
    otherAssets: 0,
    total: 0,
  });

  /* ========== MODAL STATE ========== */
  const [activeModalFieldId, setActiveModalFieldId] = useState<number | null>(null);
  const [modalRows, setModalRows] = useState<ModalRow[]>([]);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [deletingModalId, setDeletingModalId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  const [validationError, setValidationError] = useState<string>("");

  /* ========== LOAD DATA ========== */
  const loadLiabilities = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/schedule3/liabilities/${safeRegId}/${safeReturnYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res?.data?.data;
      if (data) {
        const gf = Number(data.generalFund || 0);
        const pf = Number(data.politicalFund || 0);
        const lf = Number(data.loanFrom || 0);
        const dd = Number(data.debtsDue || 0);
        const ol = Number(data.otherLiabilities || 0);

        setLiabilities({
          ...data,
          generalFund: gf,
          politicalFund: pf,
          loanFrom: lf,
          debtsDue: dd,
          otherLiabilities: ol,
          total: gf + pf + lf + dd + ol,
        });

        if (data.assetLiabilityDate) {
          setSubmissionDate(new Date(data.assetLiabilityDate * 1000));
        }

        if (data.applicationId) {
          const r = await axios.get(
            `${API_BASE}trade-union/remarks/${data.applicationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (r.data?.data?.remark_field_title?.includes("sc_3_file")) {
            setRemarkLocked(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading liabilities:", error);
    }
  };

  const loadAssets = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/schedule3/assets/${safeRegId}/${safeReturnYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res?.data?.data;
      if (data) {
        const cash = Number(data.cash || 0);
        const inHands = Number(data.inHands || 0);
        const securities = Number(data.securities || 0);
        const unpaidSubscription = Number(data.unpaidSubscription || 0);
        const loansTo = Number(data.loansTo || 0);
        const immovableProperties = Number(data.immovableProperties || 0);
        const goodsFurniture = Number(data.goodsFurniture || 0);
        const otherAssets = Number(data.otherAssets || 0);

        const computedTotal =
          cash +
          inHands +
          securities +
          unpaidSubscription +
          loansTo +
          immovableProperties +
          goodsFurniture +
          otherAssets;

        setAssets({
          cash,
          inHands,
          securities,
          unpaidSubscription,
          loansTo,
          immovableProperties,
          goodsFurniture,
          otherAssets,
          total: computedTotal,
        });
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingData(true);
      await Promise.all([loadLiabilities(), loadAssets()]);
      setLoadingData(false);
    };
    fetchInitialData();
  }, []);

  /* ========== MODAL ACTIONS ========== */
  const loadModalRows = async (fieldId: number) => {
    setLoadingModal(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/schedule3/description/${fieldId}?encryptedRegId=${safeRegId}&encryptedReturnYear=${safeReturnYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rows = res?.data?.data || [];
      setModalRows(rows);
    } catch (error) {
      console.error("Error loading modal rows:", error);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleOpenModal = (fieldId: number) => {
    setActiveModalFieldId(fieldId);
    setDesc("");
    setAmt("");
    setModalError("");
    loadModalRows(fieldId);
  };

  const saveModalRow = async () => {
    if (!activeModalFieldId) return;
    if (!desc.trim()) {
      setModalError("Please enter Description");
      return;
    }
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
      setModalError("Please enter valid Amount");
      return;
    }

    setModalError("");
    setIsSavingModal(true);
    const config = ALL_FIELDS[activeModalFieldId];
    try {
      await axios.post(
        `${API_BASE}trade-union/schedule3/description/save`,
        {
          application_id: encryptedRegId,
          application_type: "REG",
          current_yr: encryptedReturnYear,
          field_id: activeModalFieldId,
          assets_or_liabilities: config?.flag || "L",
          description: desc.trim(),
          amount: Number(amt),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDesc("");
      setAmt("");
      showNotification("success", "Item added successfully");
      await loadModalRows(activeModalFieldId);
      await loadLiabilities();
      await loadAssets();
    } catch (error) {
      console.error("Error saving modal row:", error);
      setModalError("Failed to save description item");
      showNotification("error", "Failed to save item");
    } finally {
      setIsSavingModal(false);
    }
  };

  const deleteModalRow = async (id: number) => {
    if (!activeModalFieldId) return;
    setDeletingModalId(id);
    try {
      await axios.delete(
        `${API_BASE}trade-union/schedule3/description/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("success", "Item deleted successfully");
      await loadModalRows(activeModalFieldId);
      await loadLiabilities();
      await loadAssets();
    } catch (error) {
      console.error("Error deleting modal row:", error);
      showNotification("error", "Failed to delete item");
    } finally {
      setDeletingModalId(null);
    }
  };

  /* ========== SAVE ALL & CONTINUE ========== */
  const handleSaveAll = async () => {
    const liabilitiesTotal = Number(liabilities.total || 0);
    const assetsTotal = Number(assets.total || 0);

    if (liabilitiesTotal !== assetsTotal) {
      setValidationError(
        `Total Liabilities (₹${liabilitiesTotal}) and Total Assets (₹${assetsTotal}) must be equal before submitting.`
      );
      return;
    }
    setValidationError("");

    setIsSaving(true);
    try {
      const appType = returnYear ? "ANRN" : "REG";

      // Save Liabilities
      await axios.post(
        `${API_BASE}trade-union/schedule3/liabilities/save`,
        {
          application_id: regNo,
          application_type: appType,
          current_yr: returnYear,
          asset_liability_date: submissionDate
            ? Math.floor(submissionDate.getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          amount_general_fund: Number(liabilities.generalFund || 0),
          amount_political_fund: Number(liabilities.politicalFund || 0),
          amount_loan: Number(liabilities.loanFrom || 0),
          amount_debts_due: Number(liabilities.debtsDue || 0),
          amount_other_liabilities: Number(liabilities.otherLiabilities || 0),
          amount_total_liabilities: Number(liabilities.total || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save Assets
      await axios.post(
        `${API_BASE}trade-union/schedule3/assets/save`,
        {
          application_id: regNo,
          application_type: appType,
          current_yr: returnYear,
          cash_rs: Number(assets.cash || 0),
          hands_other_rs: Number(assets.inHands || 0),
          securities_rs: Number(assets.securities || 0),
          unpaid_subscription_rs: Number(assets.unpaidSubscription || 0),
          loans_to_rs: Number(assets.loansTo || 0),
          immve_prpot_rs: Number(assets.immovableProperties || 0),
          goods_furniture_rs: Number(assets.goodsFurniture || 0),
          others_assets_rs: Number(assets.otherAssets || 0),
          total_rs: Number(assets.total || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("success", "Statement of Liabilities & Assets saved successfully");
      navigate("/trade-union/annual-upload-documents", {
        state: {
          regNo,
          returnYear,
        },
      });
    } catch (err) {
      console.error("Save liabilities and assets failed:", err);
      showNotification("error", "Failed to save Statement of Liabilities & Assets");
    } finally {
      setIsSaving(false);
    }
  };

  const activeModalConfig = activeModalFieldId ? ALL_FIELDS[activeModalFieldId] : null;

  return (
    <div className="bg-[#eef2f5] min-h-screen p-6 font-sans">
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

      {/* MAIN CONTAINER */}
      <div className="bg-white border border-[#d5d5d5] rounded-sm shadow-sm">
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2">
          📄 STATEMENT OF LIABILITIES AND ASSETS (PART--B)
        </div>

        {loadingData ? (
          <div className="p-8 flex items-center justify-center gap-3 text-gray-600 text-sm">
            <FaSpinner className="w-5 h-5 animate-spin text-[#2c5f8a]" />
            <span>Loading statement data...</span>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* SUBMISSION DATE */}
            <div className="flex items-center gap-4 border-b border-[#eee] pb-4">
              <label className="text-[13px] text-gray-700 font-medium">
                Date of Submission of Assets-Liability Statement :
              </label>
              <DatePicker
                selected={submissionDate}
                onChange={(date: Date | null) => setSubmissionDate(date)}
                dateFormat="dd-MM-yyyy"
                disabled={remarkLocked}
                placeholderText="dd-mm-yyyy"
                className="w-[200px] h-[28px] border border-[#999] px-2 text-[12px]"
              />
            </div>

            {/* LIABILITIES TABLE COMPONENT */}
            <LiabilitiesTable
              liabilities={liabilities}
              setLiabilities={setLiabilities}
              remarkLocked={remarkLocked}
              onOpenModal={handleOpenModal}
            />

            {/* ASSETS TABLE COMPONENT */}
            <AssetsTable
              assets={assets}
              remarkLocked={remarkLocked}
              onOpenModal={handleOpenModal}
            />

            {/* VALIDATION ERROR DISPLAY */}
            {validationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-semibold">
                ⚠️ {validationError}
              </div>
            )}

            {/* TOTAL COMPARISON BANNER COMPONENT */}
            <TotalComparisonBanner
              liabilitiesTotal={Number(liabilities.total || 0)}
              assetsTotal={Number(assets.total || 0)}
            />

            {/* FOOTER BUTTONS */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                className="bg-[#337ab7] text-white px-6 py-2 rounded text-[13px] hover:bg-[#286090] transition"
                onClick={() => {
                  navigate(`/trade-union/annual-upload-documents`, {
                    state: { regNo, returnYear },
                  });
                }}
              >
                Back
              </button>
              <button
                disabled={remarkLocked || isSaving}
                className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-[13px] font-semibold transition disabled:opacity-50 flex items-center gap-2"
                onClick={handleSaveAll}
              >
                {isSaving && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                SAVE & CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESCRIPTION MODAL COMPONENT */}
      <DescriptionModal
        activeModalConfig={activeModalConfig}
        onClose={() => setActiveModalFieldId(null)}
        modalError={modalError}
        desc={desc}
        setDesc={setDesc}
        amt={amt}
        setAmt={setAmt}
        isSavingModal={isSavingModal}
        onSaveModalRow={saveModalRow}
        loadingModal={loadingModal}
        modalRows={modalRows}
        deletingModalId={deletingModalId}
        onDeleteModalRow={deleteModalRow}
      />
    </div>
  );
};

export default ScheduleIIILiabilitiesModule;
