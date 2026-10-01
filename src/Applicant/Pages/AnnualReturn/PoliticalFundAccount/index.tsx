import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaTimes } from "react-icons/fa";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";

import { ExpRow, IncomeRow, ModalRow, NotificationState } from "./types/politicalFund.types";
import { PFA_EXP_LABELS, incomeTitleIdMap } from "./constants/politicalFund.constants";
import { PFAIncomeTable } from "./components/PFAIncomeTable";
import { PFAExpenditureTable } from "./components/PFAExpenditureTable";
import { PFAModal } from "./components/PFAModal";
import { PFAComparisonBanner } from "./components/PFAComparisonBanner";

const PoliticalFundAccountModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regNo = location.state?.regNo;
  const returnYear = location.state?.returnYear;

  const encryptedReturnYear = encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
  const encryptedRegId = encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
  const safeRegId = encodeURIComponent(encryptedRegId);
  const safeReturnYear = encodeURIComponent(encryptedReturnYear);

  const token = getAuthToken() ?? "";

  /* INCOME STATE */
  const [incomeRows, setIncomeRows] = useState<IncomeRow[]>([]);
  const [loadingIncome, setLoadingIncome] = useState<boolean>(false);

  /* EXPENDITURE STATE */
  const [expRows, setExpRows] = useState<ExpRow[]>(
    PFA_EXP_LABELS.map((item) => ({ ...item, amount: 0 }))
  );
  const [loadingExp, setLoadingExp] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  /* MODAL STATE */
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<"income" | "expenditure">("income");
  const [modalTitle, setModalTitle] = useState<string>("");
  const [activeTitleId, setActiveTitleId] = useState<number>(0);
  const [modalDesc, setModalDesc] = useState<string>("");
  const [modalAmount, setModalAmount] = useState<string>("");
  const [modalRows, setModalRows] = useState<ModalRow[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [isSavingModal, setIsSavingModal] = useState<boolean>(false);
  const [deletingModalId, setDeletingModalId] = useState<string | number | null>(null);
  const [modalError, setModalError] = useState<string>("");

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

  /* ========== LOAD INCOME DATA ========== */
  const getPFAIncomeData = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    setLoadingIncome(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/pfa-income/${safeRegId}/${safeReturnYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resData = res?.data || {};
      const pfaIncomeTableData: IncomeRow[] = [
        {
          id: 1,
          description: "Balance at the begining of the year",
          amount: Number(resData?.incomeRecord?.balance_beginning_year) || 0,
          hasModal: false,
        },
        {
          id: 2,
          description: "Contributions from members",
          amount: Number(resData?.totalContribution) || 0,
          hasModal: true,
        },
      ];
      setIncomeRows(pfaIncomeTableData);
    } catch (err) {
      console.error("Failed to load PFA income data", err);
    } finally {
      setLoadingIncome(false);
    }
  };

  /* ========== LOAD EXPENDITURE DATA ========== */
  const getPFAExpenseData = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    setLoadingExp(true);
    try {
      const res = await axios.get(
        `${API_BASE}trade-union/pfa-expense/${safeRegId}/${safeReturnYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resData = res?.data || {};

      setExpRows(
        PFA_EXP_LABELS.map((item) => {
          let amt = 0;
          if (item.id === 1) amt = Number(resData.payments_objects_specified) || 0;
          if (item.id === 2) amt = Number(resData.expenses_management) || 0;
          if (item.id === 3) amt = Number(resData.balance_end_year) || 0;
          return { ...item, amount: amt };
        })
      );
    } catch (err) {
      console.error("Failed to load PFA expense data", err);
    } finally {
      setLoadingExp(false);
    }
  };

  useEffect(() => {
    getPFAIncomeData();
    getPFAExpenseData();
  }, []);

  /* ========== MODAL DATA LOAD ========== */
  const getModalTableData = async (category: "income" | "expenditure", titleOrId: string | number) => {
    setLoadingModal(true);
    try {
      let res: any;
      if (category === "income") {
        const titleId = incomeTitleIdMap[String(titleOrId)];
        if (!titleId) return [];
        res = await axios.get(
          `${API_BASE}trade-union/pfa-income-sub/${safeRegId}/${safeReturnYear}/${titleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.get(
          `${API_BASE}trade-union/pfa-expense-sub/${safeRegId}/${safeReturnYear}/${titleOrId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const resData = res?.data || [];
      const formatted: ModalRow[] = resData.map((item: any, i: number) => ({
        sl: i + 1,
        id: item.encrypted_id,
        description: item.decs || item.description || "",
        amount: Number(item.amount) || 0,
      }));

      setModalRows(formatted);
      return formatted;
    } catch (err) {
      console.error("Failed to load modal rows", err);
      return [];
    } finally {
      setLoadingModal(false);
    }
  };

  /* ========== OPEN MODALS ========== */
  const openIncomeModal = (row: IncomeRow) => {
    setModalCategory("income");
    setModalTitle(row.description);
    setActiveTitleId(incomeTitleIdMap[row.description]);
    setModalDesc("");
    setModalAmount("");
    setModalError("");
    getModalTableData("income", row.description);
    setShowModal(true);
  };

  const openExpModal = (row: ExpRow) => {
    setModalCategory("expenditure");
    setModalTitle(row.description);
    setActiveTitleId(row.id);
    setModalDesc("");
    setModalAmount("");
    setModalError("");
    getModalTableData("expenditure", row.id);
    setShowModal(true);
  };

  /* ========== SAVE MODAL ITEM ========== */
  const handleModalSave = async () => {
    if (!modalDesc.trim()) {
      setModalError("Please enter Description");
      return;
    }
    if (!modalAmount || isNaN(Number(modalAmount)) || Number(modalAmount) <= 0) {
      setModalError("Please enter valid Amount");
      return;
    }

    setModalError("");
    setIsSavingModal(true);

    try {
      if (modalCategory === "income") {
        const titleId = incomeTitleIdMap[modalTitle];
        if (!titleId) return;

        const payload = {
          encryptedRegId,
          encryptedWizardId: encryptedReturnYear,
          title_id: titleId,
          desc: modalDesc.trim(),
          amount: Number(modalAmount),
        };

        await axios.post(`${API_BASE}trade-union/pfa-income-sub`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freshRows = (await getModalTableData("income", modalTitle)) ?? [];
        setIncomeRows((prev) =>
          prev.map((r) => {
            if (r.description === modalTitle) {
              const sum = freshRows.reduce((acc, row) => acc + row.amount, 0);
              return { ...r, amount: sum };
            }
            return r;
          })
        );
      } else {
        const payload = {
          encryptedRegId,
          encryptedWizardId: encryptedReturnYear,
          title_id: activeTitleId,
          desc: modalDesc.trim(),
          amount: Number(modalAmount),
        };

        await axios.post(`${API_BASE}trade-union/pfa-expense-sub`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freshRows = (await getModalTableData("expenditure", activeTitleId)) ?? [];
        setExpRows((prev) =>
          prev.map((r) => {
            if (r.id === activeTitleId) {
              const sum = freshRows.reduce((acc, row) => acc + row.amount, 0);
              return { ...r, amount: sum };
            }
            return r;
          })
        );
      }

      setModalDesc("");
      setModalAmount("");
      showNotification("success", "Item added successfully");
    } catch (err) {
      console.error("Modal save failed", err);
      setModalError("Failed to save item");
    } finally {
      setIsSavingModal(false);
    }
  };

  /* ========== DELETE MODAL ITEM ========== */
  const handleModalDelete = async (encryptedId: string | number) => {
    setDeletingModalId(encryptedId);
    try {
      const safeEncryptedId = encodeURIComponent(encryptedId);
      if (modalCategory === "income") {
        await axios.post(`${API_BASE}trade-union/pfa-income-sub-delete/${safeEncryptedId}/${safeRegId}/${safeReturnYear}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const freshRows = (await getModalTableData("income", modalTitle)) ?? [];
        setIncomeRows((prev) =>
          prev.map((r) => {
            if (r.description === modalTitle) {
              const sum = freshRows.reduce((acc, row) => acc + row.amount, 0);
              return { ...r, amount: sum };
            }
            return r;
          })
        );
      } else {
        await axios.post(`${API_BASE}trade-union/pfa-expense-sub-delete/${safeEncryptedId}/${safeRegId}/${safeReturnYear}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const freshRows = (await getModalTableData("expenditure", activeTitleId)) ?? [];
        setExpRows((prev) =>
          prev.map((r) => {
            if (r.id === activeTitleId) {
              const sum = freshRows.reduce((acc, row) => acc + row.amount, 0);
              return { ...r, amount: sum };
            }
            return r;
          })
        );
      }
      showNotification("success", "Item deleted successfully");
    } catch (err) {
      console.error("Modal delete failed", err);
      showNotification("error", "Failed to delete item");
    } finally {
      setDeletingModalId(null);
    }
  };

  /* ========== TOTAL COMPUTATIONS ========== */
  const totalIncome = incomeRows.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const totalExpenditure = expRows.reduce((acc, r) => acc + Number(r.amount || 0), 0);

  /* ========== SUBMIT BOTH FORMS ========== */
  const handleSubmitAll = async () => {
    if (totalIncome !== totalExpenditure) {
      setValidationError(
        `Total Income (₹${totalIncome}) and Total Expenditure (₹${totalExpenditure}) must be equal before submitting.`
      );
      return;
    }
    setValidationError("");
    setIsSaving(true);

    try {
      // 1. Save Political Fund Income
      const incomePayload = {
        encryptedRegId,
        encryptedWizardId: encryptedReturnYear,
        balance_beginning_year: Number(incomeRows.find((r) => r.id === 1)?.amount || 0),
        contributions_members: Number(incomeRows.find((r) => r.id === 2)?.amount || 0),
      };
      await axios.post(`${API_BASE}trade-union/pfa-income`, incomePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Save Political Fund Expenditure
      const expPayload = {
        encryptedRegId,
        encryptedWizardId: encryptedReturnYear,
        payments_objects_specified: expRows.find((r) => r.id === 1)?.amount || 0,
        expenses_management: expRows.find((r) => r.id === 2)?.amount || 0,
        balance_end_year: expRows.find((r) => r.id === 3)?.amount || 0,
      };
      await axios.post(`${API_BASE}trade-union/pfa-expense`, expPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("success", "Political Fund Account (Income & Expenditure) saved successfully");
      navigate("/trade-union/annual-upload-documents", {
        state: { regNo, returnYear },
      });
    } catch (err) {
      console.error("Save Political Fund Account failed", err);
      showNotification("error", "Failed to save Political Fund Account");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="bg-white border border-[#d5d5d5] rounded-sm shadow-sm p-5 space-y-6">
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold flex items-center justify-between rounded-sm">
          <span>POLITICAL FUND ACCOUNT (INCOME & EXPENDITURE)</span>
        </div>

        {/* TABLES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME TABLE COMPONENT */}
          <PFAIncomeTable
            incomeRows={incomeRows}
            setIncomeRows={setIncomeRows}
            loadingIncome={loadingIncome}
            onOpenIncomeModal={openIncomeModal}
            totalIncome={totalIncome}
          />

          {/* EXPENDITURE TABLE COMPONENT */}
          <PFAExpenditureTable
            expRows={expRows}
            loadingExp={loadingExp}
            onOpenExpModal={openExpModal}
            totalExpenditure={totalExpenditure}
          />
        </div>

        {/* VALIDATION ERROR DISPLAY */}
        {validationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-semibold">
            ⚠️ {validationError}
          </div>
        )}

        {/* TOTAL COMPARISON BANNER COMPONENT */}
        <PFAComparisonBanner
          totalIncome={totalIncome}
          totalExpenditure={totalExpenditure}
        />

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            className="bg-[#337ab7] text-white px-6 py-2 rounded text-[13px] hover:bg-[#286090] transition font-medium"
            onClick={() =>
              navigate(`/trade-union/annual-upload-documents`, {
                state: { regNo, returnYear },
              })
            }
          >
            Back
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmitAll}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-[13px] font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
            SAVE & CONTINUE
          </button>
        </div>
      </div>

      {/* DESCRIPTION MODAL COMPONENT */}
      <PFAModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        modalTitle={modalTitle}
        modalCategory={modalCategory}
        modalError={modalError}
        modalDesc={modalDesc}
        setModalDesc={setModalDesc}
        modalAmount={modalAmount}
        setModalAmount={setModalAmount}
        isSavingModal={isSavingModal}
        onSaveModal={handleModalSave}
        loadingModal={loadingModal}
        modalRows={modalRows}
        deletingModalId={deletingModalId}
        onDeleteModal={handleModalDelete}
      />
    </div>
  );
};

export default PoliticalFundAccountModule;
