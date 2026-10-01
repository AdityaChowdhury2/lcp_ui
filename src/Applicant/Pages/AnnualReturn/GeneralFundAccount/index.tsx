import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaTimes } from "react-icons/fa";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";

import { ExpRow, IncomeRow, ModalRow, NotificationState } from "./types/generalFund.types";
import { EXPENDITURE_LABELS, incomeTitleIdMap } from "./constants/generalFund.constants";
import { IncomeTable } from "./components/IncomeTable";
import { ExpenditureTable } from "./components/ExpenditureTable";
import { IncomeExpModal } from "./components/IncomeExpModal";
import { IncomeExpComparisonBanner } from "./components/IncomeExpComparisonBanner";

const GeneralFundAccountModule: React.FC = () => {
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
  const [expenditureRows, setExpenditureRows] = useState<ExpRow[]>(
    EXPENDITURE_LABELS.map((item) => ({ ...item, amount: 0 }))
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

  /* ========== LOAD INCOME DETAILS ========== */
  const getGeneralAccountDetails = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    setLoadingIncome(true);
    try {
      const res = await axios.get(`${API_BASE}trade-union/general-account/${safeRegId}/${safeReturnYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = res?.data;
      const formattedData: IncomeRow[] = [
        { id: 1, label: "Balance at the begining of the year", amount: Number(resData?.balance_beginning_amount || 0), hasDescription: false },
        { id: 2, label: "Subscription from members", amount: Number(resData?.subscriptions_amount || 0), hasDescription: true },
        { id: 3, label: "Donation from members", amount: Number(resData?.donation_amount || 0), hasDescription: true },
        { id: 4, label: "Loans from", amount: Number(resData?.loans_amount || 0), hasDescription: true },
        { id: 5, label: "Sale of periodicals books, rules, etc.", amount: Number(resData?.sale_periodicals_amount || 0), hasDescription: true },
        { id: 6, label: "Interest on investments", amount: Number(resData?.interest_amount || 0), hasDescription: true },
        { id: 7, label: "Income from miscellaneous sources (to be specified)", amount: Number(resData?.interest_mis_amount || 0), hasDescription: true },
      ];
      setIncomeRows(formattedData);
    } catch (err) {
      console.error("Failed to load general account details", err);
    } finally {
      setLoadingIncome(false);
    }
  };

  /* ========== LOAD EXPENDITURE DETAILS ========== */
  const getExpenditureDetails = async () => {
    if (!token || !safeRegId || !safeReturnYear) return;
    setLoadingExp(true);
    try {
      const res = await axios.get(`${API_BASE}trade-union/expenditure/${safeRegId}/${safeReturnYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data || {};

      const mapApiToId: Record<number, number> = {
        1: Number(data.salaries_amount || 0),
        2: Number(data.estblishment_amount || 0),
        3: Number(data.auditors_fees_amount || 0),
        4: Number(data.legal_amount || 0),
        5: Number(data.compensation_paid_amount || 0),
        6: Number(data.funeral_amount || 0),
        7: Number(data.education_amount || 0),
        8: Number(data.fixed_deposit_amount || 0),
        9: Number(data.general_charges_amount || 0),
        10: Number(data.electric_amount || 0),
        11: Number(data.rent_amount || 0),
        12: Number(data.printing_amount || 0),
        13: Number(data.affiliation_amount || 0),
        14: Number(data.expenses_incurred_amount || 0),
        15: Number(data.other_expenses_amount || 0),
        16: Number(data.balance_at_end_amount || 0),
      };

      setExpenditureRows(
        EXPENDITURE_LABELS.map((item) => ({
          ...item,
          amount: mapApiToId[item.id] || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load expenditure details", err);
    } finally {
      setLoadingExp(false);
    }
  };

  useEffect(() => {
    getGeneralAccountDetails();
    getExpenditureDetails();
  }, []);

  /* ========== MODAL DATA LOAD ========== */
  const getModalTableData = async (category: "income" | "expenditure", titleOrId: string | number) => {
    setLoadingModal(true);
    try {
      let res: any;
      if (category === "income") {
        const titleId = incomeTitleIdMap[String(titleOrId)];
        if (!titleId) return [];
        res = await axios.get(`${API_BASE}trade-union/general-account-sub/${safeRegId}/${safeReturnYear}/${titleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.get(`${API_BASE}trade-union/expenditure-sub/${safeRegId}/${safeReturnYear}/${titleOrId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const resData = res?.data || [];
      const formattedData: ModalRow[] = resData.map((item: any, index: number) => ({
        sl: index + 1,
        id: item?.encrypted_id,
        description: item?.decs || "",
        amount: Number(item?.amount) || 0,
      }));
      setModalRows(formattedData);
      return formattedData;
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
    setModalTitle(row.label);
    setActiveTitleId(incomeTitleIdMap[row.label]);
    setModalDesc("");
    setModalAmount("");
    setModalError("");
    getModalTableData("income", row.label);
    setShowModal(true);
  };

  const openExpModal = (row: ExpRow) => {
    setModalCategory("expenditure");
    setModalTitle(row.label);
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

        await axios.post(`${API_BASE}trade-union/general-account-sub`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freshRows = (await getModalTableData("income", modalTitle)) ?? [];
        setIncomeRows((prev) =>
          prev.map((r) => {
            if (r.label === modalTitle) {
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

        await axios.post(`${API_BASE}trade-union/expenditure-sub`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freshRows = (await getModalTableData("expenditure", activeTitleId)) ?? [];
        setExpenditureRows((prev) =>
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
        await axios.post(`${API_BASE}trade-union/general-account-sub-delete/${safeEncryptedId}/${safeRegId}/${safeReturnYear}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const freshRows = (await getModalTableData("income", modalTitle)) ?? [];
        setIncomeRows((prev) =>
          prev.map((r) => {
            if (r.label === modalTitle) {
              const sum = freshRows.reduce((acc, row) => acc + row.amount, 0);
              return { ...r, amount: sum };
            }
            return r;
          })
        );
      } else {
        await axios.post(`${API_BASE}trade-union/expenditure-sub-delete/${safeEncryptedId}/${safeRegId}/${safeReturnYear}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const freshRows = (await getModalTableData("expenditure", activeTitleId)) ?? [];
        setExpenditureRows((prev) =>
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
  const totalExpenditure = expenditureRows.reduce((acc, r) => acc + Number(r.amount || 0), 0);

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
      // 1. Save Income (General Account)
      const incomePayload = {
        encryptedRegId,
        encryptedWizardId: encryptedReturnYear,
        balance_beginning_amount: incomeRows.find((r) => r.id === 1)?.amount || 0,
        subscriptions_amount: incomeRows.find((r) => r.id === 2)?.amount || 0,
        donation_amount: incomeRows.find((r) => r.id === 3)?.amount || 0,
        loans_amount: incomeRows.find((r) => r.id === 4)?.amount || 0,
        sale_periodicals_amount: incomeRows.find((r) => r.id === 5)?.amount || 0,
        interest_amount: incomeRows.find((r) => r.id === 6)?.amount || 0,
        interest_mis_amount: incomeRows.find((r) => r.id === 7)?.amount || 0,
      };
      await axios.post(`${API_BASE}trade-union/general-account`, incomePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Save Expenditure
      const expPayload = {
        encryptedRegId,
        encryptedWizardId: encryptedReturnYear,
        salaries_amount: expenditureRows.find((r) => r.id === 1)?.amount || 0,
        estblishment_amount: expenditureRows.find((r) => r.id === 2)?.amount || 0,
        auditors_fees_amount: expenditureRows.find((r) => r.id === 3)?.amount || 0,
        legal_amount: expenditureRows.find((r) => r.id === 4)?.amount || 0,
        compensation_paid_amount: expenditureRows.find((r) => r.id === 5)?.amount || 0,
        funeral_amount: expenditureRows.find((r) => r.id === 6)?.amount || 0,
        education_amount: expenditureRows.find((r) => r.id === 7)?.amount || 0,
        fixed_deposit_amount: expenditureRows.find((r) => r.id === 8)?.amount || 0,
        general_charges_amount: expenditureRows.find((r) => r.id === 9)?.amount || 0,
        electric_amount: expenditureRows.find((r) => r.id === 10)?.amount || 0,
        rent_amount: expenditureRows.find((r) => r.id === 11)?.amount || 0,
        printing_amount: expenditureRows.find((r) => r.id === 12)?.amount || 0,
        affiliation_amount: expenditureRows.find((r) => r.id === 13)?.amount || 0,
        expenses_incurred_amount: expenditureRows.find((r) => r.id === 14)?.amount || 0,
        other_expenses_amount: expenditureRows.find((r) => r.id === 15)?.amount || 0,
        balance_at_end_amount: expenditureRows.find((r) => r.id === 16)?.amount || 0,
      };
      await axios.post(`${API_BASE}trade-union/expenditure`, expPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("success", "General Fund Account (Income & Expenditure) saved successfully");
      navigate("/trade-union/annual-upload-documents", {
        state: { regNo, returnYear },
      });
    } catch (err) {
      console.error("Save General Fund Account failed", err);
      showNotification("error", "Failed to save General Fund Account");
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
          <span>GENERAL FUND ACCOUNT (INCOME & EXPENDITURE)</span>
        </div>

        {/* TABLES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME TABLE COMPONENT */}
          <IncomeTable
            incomeRows={incomeRows}
            setIncomeRows={setIncomeRows}
            loadingIncome={loadingIncome}
            onOpenIncomeModal={openIncomeModal}
            totalIncome={totalIncome}
          />

          {/* EXPENDITURE TABLE COMPONENT */}
          <ExpenditureTable
            expenditureRows={expenditureRows}
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
        <IncomeExpComparisonBanner
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
      <IncomeExpModal
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

export default GeneralFundAccountModule;
