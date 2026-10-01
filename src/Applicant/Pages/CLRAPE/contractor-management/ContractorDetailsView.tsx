import React, { useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import type { Contractor } from "./constants";
import { ROUTE_CONTRACTOR_LIST } from "./constants";
import {
  fetchContractorDetails,
  clearCurrentContractor,
  selectCurrentContractor,
  selectContractorsLoading,
  selectContractorsError,
} from "@/store/contractorsSlice";

const TABLE_BORDER = "border border-[#c7ced6]";
const CELL_CLASS = `${TABLE_BORDER} px-3 py-2 align-top`;

interface DetailRow {
  label: string;
  value: React.ReactNode;
}

interface DetailsTableProps {
  rows: DetailRow[];
}

function DetailsTable({ rows }: DetailsTableProps) {
  return (
    <table className={`w-full ${TABLE_BORDER} text-[13px]`}>
      <thead>
        <tr className="bg-[#7c8a96] text-white">
          <th className={`${CELL_CLASS} text-left w-[45%]`}>Parameters</th>
          <th className={`${CELL_CLASS} text-left`}>Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={`${row.label}-${index}`}
            className={index % 2 === 0 ? "bg-[#f3f4f6]" : "bg-white"}
          >
            <td className={CELL_CLASS}>{row.label}</td>
            <td className={`${CELL_CLASS} font-semibold`}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function buildContractorRows(contractor: Contractor): DetailRow[] {
  const statusDisplay = contractor.identificationNumber
    ? `${contractor.statusLabel ?? contractor.status} / ${contractor.identificationNumber}`
    : contractor.statusLabel ?? contractor.status;

  const rows: DetailRow[] = [
    { label: "Name of the Contractor", value: contractor.name },
    { label: "Contractor Address", value: contractor.address },
    { label: "Nature of Work", value: contractor.nature || "—" },
    {
      label: "Maximum Number of Contractor Labour",
      value: String(contractor.maxLabour),
    },
    { label: "Status / From V/Ref. No.", value: statusDisplay },
  ];
  if (contractor.email != null && contractor.email !== "") {
    rows.push({ label: "Email of the Contractor", value: contractor.email });
  }
  if (
    (contractor.stateName != null && contractor.stateName !== "") ||
    (contractor.state != null && contractor.state !== "")
  ) {
    rows.push({ label: "State", value: contractor.stateName || contractor.state });
  }
  if (
    contractor.natureOfWork != null &&
    Array.isArray(contractor.natureOfWork) &&
    contractor.natureOfWork.length > 0
  ) {
    rows.push({
      label: "Nature of Work (detail)",
      value: contractor.natureOfWork.join(", "),
    });
  }
  if (
    contractor.employmentFrom != null ||
    contractor.employmentTo != null ||
    contractor.totalDays != null
  ) {
    rows.push({
      label: "Estimated Date of Employment",
      value: (
        <>
          {contractor.employmentFrom != null && (
            <>From: <strong>{contractor.employmentFrom}</strong></>
          )}
          {contractor.employmentTo != null && (
            <> To: <strong>{contractor.employmentTo}</strong></>
          )}
          {contractor.totalDays != null && (
            <> Total Days: <strong>{contractor.totalDays}</strong></>
          )}
        </>
      ),
    });
  }
  return rows;
}

const ContractorDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const contractor = useSelector(selectCurrentContractor);
  const loading = useSelector(selectContractorsLoading);
  const error = useSelector(selectContractorsError);

  useEffect(() => {
    if (!id) {
      navigate(ROUTE_CONTRACTOR_LIST, { replace: true });
      return;
    }
    dispatch(fetchContractorDetails(id));
  }, [id, navigate, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentContractor());
    };
  }, [dispatch]);

  const contractorRows = useMemo(
    () => (contractor ? buildContractorRows(contractor) : []),
    [contractor]
  );

  const handleBack = () => navigate(-1);

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">CONTRACTOR DETAILS</h1>
        <div className="flex items-center justify-center py-12 text-gray-500">
          Loading contractor details...
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:underline"
        >
          BACK TO CONTRACTOR LIST
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">CONTRACTOR DETAILS</h1>
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-blue-600 hover:underline"
          >
            BACK TO CONTRACTOR LIST
          </button>
        </div>
      </div>
    );
  }

  if (!contractor || contractor.id !== Number(id)) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        CONTRACTOR DETAILS
      </h1>

      <div className="bg-white border shadow-sm">
        <div className="bg-[#2f5f85] px-4 py-2 font-semibold text-white">
          PARTICULARS OF CONTRACTOR
        </div>
        <div className="p-4">
          <DetailsTable rows={contractorRows} />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:underline"
          aria-label="Back to contractor list"
        >
          BACK TO CONTRACTOR LIST
        </button>
      </div>
    </div>
  );
};

export default ContractorDetailsView;
