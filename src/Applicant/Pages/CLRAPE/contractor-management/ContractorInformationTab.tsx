import { IMAGE_BASE } from "@/constants/constants";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import type { Contractor } from "./constants";
import { getViewContractorPath, getEditContractorPath } from "./constants";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { toggleContractorStatus } from "@/store/contractorsSlice";
import { toast } from "react-toastify";
import { encryptionDecryptionFun } from "@/utils/encryption";

const CONTRACTOR_TABLE_STYLES = {
  headRow: {
    style: {
      backgroundColor: "#2A628C",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "14px",
      minHeight: "45px",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
    },
  },
  rows: {
    style: {
      minHeight: "42px",
    },
  },
} as const;

export interface ContractorInformationTabProps {
  contractors: Contractor[];
  onAdd: () => void;
  onStatusChanged?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  maxContractLabourLimit?: string | number | null;
  encryptedAppId?: string;
  isEditable?: boolean;
  /** Application status char; Form V is only downloadable on "I" (Issued). */
  applicationStatus?: string | null;
}

export function ContractorInformationTab({
  contractors,
  onAdd,
  onStatusChanged,
  loading = false,
  error = null,
  maxContractLabourLimit = null,
  encryptedAppId,
  isEditable = true,
  applicationStatus = null,
}: ContractorInformationTabProps) {

  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleStatusClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setShowStatusModal(true);
  };

  const isApplicationIssued =
    String(applicationStatus ?? "").toUpperCase() === "I";

  /**
   * A contractor carried over from before the amendment already holds a Form V,
   * so it keeps its reference number instead of getting a second one.
   */
  const existedBeforeAmendment = (row: Contractor) => {
    if (row.existedBeforeAmendment != null) return row.existedBeforeAmendment;
    // The API sends the parent id as a string, a number, or null, so "0" has to
    // be treated as absent rather than truthy.
    const parentId = String(row.contractorParentId ?? "").trim();
    return parentId !== "" && parentId !== "0";
  };

  /**
   * Form V is issued only against an issued application, only for contractors
   * added by this amendment, and only over the 10-labour threshold.
   */
  const canDownloadFormV = (row: Contractor) => {
    const allowed =
      row.canDownloadFormV ??
      (isApplicationIssued && !existedBeforeAmendment(row));
    return allowed && Number(row.maxLabour) > 10;
  };

  const referenceNumberOf = (row: Contractor) =>
    row.formvReferenceNumber ??
    (row.formv_serial_number
      ? String(row.formv_serial_number).padStart(7, "0")
      : null);

  const handleDownloadFormV = (row: Contractor) => {
    const appIdToUse = encryptedAppId || 
      (row.application_id && /^\d+$/.test(String(row.application_id)) 
        ? (encryptionDecryptionFun("encrypt", String(row.application_id)) ?? "") 
        : row.application_id);

    navigate("/form-V-pdf", {
      state: {
        appId: appIdToUse,
        contractorId: row.id,
        formVSerialNo: row.formv_serial_number ?? row.id,
      },
    });
  };

  const handleStatusConfirm = async () => {
    if (!selectedContractor) return;

    // The action is a toggle, so a second click would silently undo the first.
    if (isTogglingStatus) return;
    setIsTogglingStatus(true);

    try {
      const result = await dispatch(
        toggleContractorStatus(selectedContractor.id)
      ).unwrap();

      toast.success(
        result?.message ??
        "Contractor status updated successfully"
      );

      if (onStatusChanged) {
        await onStatusChanged();
      }

      setShowStatusModal(false);
      setSelectedContractor(null);
    } catch (err: any) {
      toast.error(
        err || "Failed to update contractor status"
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const columns: TableColumn<Contractor>[] = useMemo(
    () => [
      {
        name: "Sl. No",
        cell: (_, index) => index + 1,
        width: "90px",
      },
      {
        name: "Contractor Name",
        selector: (row) => row.name,
        wrap: true,
      },
      {
        name: "Contractor Address",
        selector: (row) => row.address,
        wrap: true,
      },
      {
        name: "Nature of Work",
        selector: (row) => row.nature,
      },
      {
        name: "Maximum Number of Contractor Labour",
        selector: (row) => row.maxLabour,
        style: { justifyContent: "center" },
        width: "320px",
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex gap-3 items-center">
            <button
              type="button"
              title="View details"
              onClick={() =>
                navigate(getViewContractorPath(row.id))
              }
              className="p-1 rounded hover:bg-gray-100"
              aria-label={`View details for ${row.name}`}
            >
              <img
                src={`${IMAGE_BASE}view.png`}
                alt="View"
                className="w-4 h-4"
              />
            </button>

             {isEditable && (
              <button
                type="button"
                title="Edit"
                onClick={() =>
                  navigate(getEditContractorPath(row.id))
                }
                className="p-1 rounded hover:bg-gray-100"
                aria-label={`Edit ${row.name}`}
              >
                <img
                  src={`${IMAGE_BASE}edit.png`}
                  alt="Edit"
                  className="w-4 h-4"
                />
              </button>
            )}

            {isEditable && (
              <button
                type="button"
                title={
                  row.status === 1
                    ? "Active Contractor"
                    : "Inactive Contractor"
                }
                onClick={() => handleStatusClick(row)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label={`Update Status for ${row.name}`}
              >
                {row.status === 1 ? (
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    ✕
                  </div>
                )}
              </button>
            )}
          </div>
        ),
      },
      {
        name: "Form V/Ref. No.",
        cell: (row) => (
          <div className="text-xs leading-5">
            <button
              type="button"
              className="flex items-center gap-1 text-[#0066cc] hover:underline"
              onClick={() => navigate(getViewContractorPath(row.id))}
            >
              <span className="text-[#0066cc] text-base leading-none">▶</span>
              <span>View Details</span>
            </button>

            {/* <div className="flex items-center gap-1 text-gray-400 mt-1">
              <span className="text-black text-base leading-none">▶</span>
              <span>Edit Details</span>
            </div> */}

            {existedBeforeAmendment(row) ? (
              <div className="mt-1 text-gray-700" title="Form V was already issued before this amendment">
                <span className="text-gray-500">Ref. No.: </span>
                <span className="font-semibold">
                  {referenceNumberOf(row) ?? "—"}
                </span>
              </div>
            ) : canDownloadFormV(row) ? (
              <button
                type="button"
                className="flex items-center gap-1 text-[#0066cc] hover:underline mt-1 cursor-pointer"
                onClick={() => handleDownloadFormV(row)}
              >
                <span className="text-[#0066cc] text-base leading-none">▶</span>
                <span>Download Form V</span>
              </button>
            ) : (
              !isApplicationIssued &&
              Number(row.maxLabour) > 10 && (
                <div className="mt-1 text-gray-400">
                  Form V available once the application is issued
                </div>
              )
            )}
          </div>
        ),
      },
    ],
    [navigate, isEditable, isApplicationIssued]
  );

  return (
    <div className="bg-white border rounded shadow">
      <div className="bg-[#2A628C] text-white px-4 py-3 font-semibold">
        CONTRACTOR LIST
      </div>
      <div className="p-4">
        {maxContractLabourLimit !== null &&
          String(maxContractLabourLimit).trim() !== "" && (
            <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Maximum Total Number of Contract Labour can be added less or equal to {maxContractLabourLimit}
            </div>
          )}
        {isEditable && (
          <button
            type="button"
            className="border border-[#2A628C] text-[#2A628C] px-4 py-2 rounded hover:bg-blue-50 mb-4"
            onClick={onAdd}
          >
            + Add New Contractor
          </button>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading contractor list...
          </div>
        )}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-4">
            {error}
          </div>
        )}
        {!loading && (
          <DataTable
            columns={columns}
            data={contractors}
            customStyles={CONTRACTOR_TABLE_STYLES}
            striped
            highlightOnHover
            responsive
          />
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      {showStatusModal && selectedContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[450px] p-6">
            <h3 className="text-lg font-semibold mb-4">
              Confirmation
            </h3>

            <p>
              {selectedContractor.status === 1
                ? "Are you sure to deactivate this contractor now?"
                : "Are you sure to activate this contractor now?"}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedContractor(null);
                }}
                disabled={isTogglingStatus}
                className="px-4 py-2 border rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleStatusConfirm}
                disabled={isTogglingStatus}
                aria-busy={isTogglingStatus}
                className="px-4 py-2 bg-[#2A628C] text-white rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isTogglingStatus && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  />
                )}
                {isTogglingStatus ? "Updating..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractorInformationTab;
