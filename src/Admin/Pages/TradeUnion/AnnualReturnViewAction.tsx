import { Label } from "../../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select";
import { Textarea } from "../../../Components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../Components/ui/dialog";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import React, { FC, useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from "@/utils/auth";

interface DocumentRow {
  id: number;
  name: string;
  checked: boolean;
  base64?: string;
  filePath?: string;
}

type SourceType = "TU_DIRECT" | "CTU_FORWARDED";

export interface AnnualReturnViewActionProps {
  mode?: "admin" | "ctu";
}

const documentNameMap: Record<string, string> = {
  application_list: "Application (System Generated)",
  liabilities_assets: "Statement of Liabilities and Assets (PART--B) (System Generated)",
  balance_sheet: "Statement of Liabilities and Assets (PART--B) (System Generated)",
  securities: "List of Securities (System Generated)",
  list_securities: "List of Securities (System Generated)",
  general_fund: "General Fund Account (System Generated)",
  political_fund: "Political Fund Account (System Generated)",
  political_fund_account: "Political Fund Account (System Generated)",
  audit_dec: "Auditor Declaration (Uploaded By Applicant)",
  relinquishing_office: "Officers Relinquishing Office (System Generated)",
  officers_appointed: "Officers Appointed (System Generated)",
  election: "Election (System Generated)",
  consent_officers: "Consent of Officers (System Generated)",
};

const documentKeyMap: Record<string, string> = {
  "Application (System Generated)": "check_formh",
  "Statement of Liabilities and Assets (PART--B) (System Generated)": "check_assets",
  "Statement of Liabilities and Assets(PART--B) (System Generated)": "check_assets",
  "List of Securities (System Generated)": "check_securities",
  "General Fund Account (System Generated)": "check_general_fund",
  "Political Fund Account (System Generated)": "check_political_fund",
  "Auditor Declaration (Uploaded By Applicant)": "check_auditor",
  "Officers Relinquishing Office (System Generated)": "check_officer_relinquishing",
  "Officers Appointed (System Generated)": "check_officer_appointed",
  "Election (System Generated)": "check_elected_member",
  "Consent of Officers (System Generated)": "check_concent_officer",
};

const actionMap: Record<string, string> = {
  approve: "Y",
  back: "B",
  back_federation: "BF",
  forward_admin: "P",
  forward_ctu: "F",
  reject: "R",
  revert_to_tu: "revert_to_tu",
  revert_to_ctu: "revert_to_ctu",
};

const actionLabels: Record<string, string> = {
  approve: "Approve",
  back: "Back for correction",
  back_federation: "Send back to Federation",
  forward_admin: "Forward to Admin",
  forward_ctu: "Forward to CTU",
  reject: "Reject",
  revert_to_tu: "Revert to TU",
  revert_to_ctu: "Revert to CTU",
};

const AnnualReturnViewAction: FC<AnnualReturnViewActionProps> = ({ mode = "admin" }) => {
  const authToken = getAuthToken();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    en_reg_id,
    en_wizard_id,
    en_row_id,
    en_user_id,
    val,
    status,
    sourceType,
    requiresAction: requiresActionFromState,
    ctuStatus: ctuStatusFromState,
  } = location.state || {};

  const [tableData, setTableData] = useState<DocumentRow[]>([]);
  const [label, setLabel] = useState<string>("Application Documents");
  const [action, setAction] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [confirmChecked, setConfirmChecked] = useState<boolean>(false);
  const [selectedDocumentNames, setSelectedDocumentNames] = useState<string[]>([]);
  const [resolvedSourceType, setResolvedSourceType] = useState<SourceType | "">(
    (sourceType as SourceType) || "",
  );
  const [requiresAction, setRequiresAction] = useState<boolean>(
    requiresActionFromState ?? status === "Pending",
  );
  const [ctuStatus, setCtuStatus] = useState<string>(ctuStatusFromState || "");

  // CTU-specific states
  const [allowedActions, setAllowedActions] = useState<string[]>([]);
  const [ctuTargets, setCtuTargets] = useState<Array<{ id: number; name: string }>>([]);
  const [ctuTargetsLoading, setCtuTargetsLoading] = useState<boolean>(false);
  const [targetCtuMasterId, setTargetCtuMasterId] = useState<string>("");

  const isCtuMode = mode === "ctu";

  const handleResponse = (result: any) => {
    const files = result?.data?.documents?.files ?? {};

    if (result?.data?.sourceType) {
      setResolvedSourceType(result.data.sourceType);
    }
    if (result?.data?.ctu_status) {
      setCtuStatus(result.data.ctu_status);
    }
    if (typeof result?.data?.requiresAction === "boolean") {
      setRequiresAction(result.data.requiresAction);
    }

    if (Array.isArray(result?.data?.allowedActions)) {
      setAllowedActions(result.data.allowedActions);
    }

    const formattedDocs: DocumentRow[] = Object.keys(files).map((key, index) => {
      const file = files[key];
      return {
        id: index + 1,
        name: documentNameMap[key] || key.replace(/_/g, " ").toUpperCase(),
        checked: true,
        base64: file?.base64,
        filePath: file?.filePath,
      };
    });

    setTableData(formattedDocs);
    setLabel(result?.data?.documents?.label || "Application Documents");
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!en_reg_id || !en_wizard_id || !en_row_id) {
        toast.error("Missing annual return reference.");
        return;
      }

      try {
        setLoading(true);
        let endpoint = "";

        if (isCtuMode) {
          endpoint = `${API_BASE}ctu/annual-return/${encodeURIComponent(en_reg_id)}/${encodeURIComponent(en_wizard_id)}/${encodeURIComponent(val || 'T')}/${encodeURIComponent(en_row_id)}`;
        } else {
          endpoint = `${API_BASE}trade-union/admin/annual-return?regId=${encodeURIComponent(en_reg_id)}&wizardId=${encodeURIComponent(en_wizard_id)}&userId=${encodeURIComponent(en_user_id || "")}&rowId=${encodeURIComponent(en_row_id)}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.message || "Failed to load annual return details");
        }
        handleResponse(result);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load annual return details");
      } finally {
        setLoading(false);
      }
    };

    void fetchDetails();
  }, [en_reg_id, en_wizard_id, en_row_id, en_user_id, isCtuMode, val, authToken]);

  const handleCheckboxChange = (id: number) => {
    setTableData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const showCheckboxColumn = isCtuMode ? allowedActions.length > 0 : requiresAction;

  const columns: TableColumn<DocumentRow>[] = [
    {
      width: "80px",
      cell: (row) => `${row.id}.`,
    },
    {
      selector: (row) => row.name,
      wrap: true,
      grow: 2,
    },
    {
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            if (row.base64) {
              const cleanBase64 = row.base64.includes(",")
                ? row.base64.split(",")[1]
                : row.base64;
              const byteCharacters = atob(cleanBase64.trim());
              const byteNumbers = new Array(byteCharacters.length)
                .fill(0)
                .map((_, i) => byteCharacters.charCodeAt(i));
              const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              window.open(url);
            } else if (row.filePath) {
              window.open(row.filePath);
            } else {
              toast.error("PDF document not available for this section.");
            }
          }}
        >
          <img src={`${IMAGE_BASE}pdf.png`} alt="pdf" className="w-[22px] mx-auto cursor-pointer" />
        </button>
      ),
    },
    ...(showCheckboxColumn
      ? [
        {
          width: "80px",
          cell: (row: DocumentRow) => (
            <input
              type="checkbox"
              checked={row.checked}
              onChange={() => handleCheckboxChange(row.id)}
              className="w-4 h-4 accent-[#3c8dbc]"
            />
          ),
          center: true,
        } as TableColumn<DocumentRow>,
      ]
      : []),
  ];

  // CTU Target Loading Effect
  useEffect(() => {
    if (!isCtuMode || action !== "forward_ctu") {
      setTargetCtuMasterId("");
      setCtuTargets([]);
      return;
    }

    const fetchCtuTargets = async () => {
      try {
        setCtuTargetsLoading(true);
        const params = new URLSearchParams({
          page: "1",
          limit: "500",
          isActive: "Y",
          types: "WT,AT",
        });
        const response = await fetch(`${API_BASE}ctu/master-list?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const result = await response.json();

        if (!response.ok || result?.status !== "SUCCESS") {
          toast.error(result?.message || "Unable to load CTU list");
          setCtuTargets([]);
          return;
        }

        type CtuTargetRow = { id: number; name: string };
        const rows = Array.isArray(result.result) ? result.result : [];
        setCtuTargets(
          rows
            .map((row: CtuTargetRow) => ({
              id: row.id,
              name: row.name ?? "",
            }))
            .sort((a: CtuTargetRow, b: CtuTargetRow) => a.name.localeCompare(b.name)),
        );
      } catch (error) {
        console.error(error);
        toast.error("Unable to load CTU list");
        setCtuTargets([]);
      } finally {
        setCtuTargetsLoading(false);
      }
    };

    void fetchCtuTargets();
  }, [action, authToken, isCtuMode]);

  const ctuActionOptions = useMemo(
    () =>
      allowedActions.map((key) => ({
        value: key,
        label: actionLabels[key] || key,
      })),
    [allowedActions],
  );

  const submitAction = async () => {
    try {
      if (!action) {
        toast.error("Please select an action");
        return;
      }

      let payload: Record<string, any> = {};

      if (isCtuMode) {
        const apiAction = actionMap[action] || action;
        payload = { action: apiAction };

        if (apiAction !== "Y") {
          payload.reason = reason.trim();
        }

        if (action === "forward_ctu") {
          if (!targetCtuMasterId) {
            toast.error("Please select a CTU to forward to");
            return;
          }
          payload.targetCtuMasterId = Number(targetCtuMasterId);
        }

        if (apiAction === "Y") {
          const selectedFields = tableData
            .filter((doc) => doc.checked)
            .map((doc) => documentKeyMap[doc.name])
            .filter(Boolean);
          payload.verifiedFields = selectedFields.join(",");
        }
      } else {
        // Admin mode
        payload = { action };
        if (action !== "approve") {
          payload.reason = reason.trim();
        }
        if (action === "approve") {
          const selectedFields = tableData
            .filter((doc) => doc.checked)
            .map((doc) => documentKeyMap[doc.name])
            .filter(Boolean);
          payload.verifiedFields = selectedFields.join(",");
        }
      }

      const endpoint = isCtuMode
        ? `${API_BASE}ctu/annual-returns/${encodeURIComponent(en_row_id)}/action`
        : `${API_BASE}trade-union/admin/annual-returns/${encodeURIComponent(en_row_id)}/action`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || (isCtuMode ? !result.success : !result.success)) {
        throw new Error(result?.message || "Action failed");
      }

      toast.success(result.message);
      setAction("");
      setReason("");
      setConfirmChecked(false);
      setSelectedDocumentNames([]);
      setShowSubmitModal(false);
      navigate(isCtuMode ? "/central-trade-union-annual-return-list" : "/user-by-return-list");
    } catch (error: any) {
      toast.error(error?.message || "API Error");
    }
  };

  const handleSubmitAction = () => {
    if (!action) {
      toast.error("Please select action");
      return;
    }

    if (isCtuMode) {
      if ((action === "back" || action === "back_federation") && !reason.trim()) {
        toast.error("Reason is required");
        return;
      }
      if (action === "forward_ctu" && !targetCtuMasterId) {
        toast.error("Please select a CTU to forward to");
        return;
      }
    } else {
      if (action !== "approve" && !reason.trim()) {
        toast.error("Reason is required");
        return;
      }
    }

    const selectedDocs = tableData.filter((doc) => doc.checked).map((doc) => doc.name);
    setSelectedDocumentNames(selectedDocs);
    setConfirmChecked(false);
    setShowSubmitModal(true);
  };

  const handleBackNavigation = () => {
    navigate(isCtuMode ? "/central-trade-union-annual-return-list" : "/user-by-return-list");
  };

  return (
    <div className="w-full px-[15px] pb-[60px]">
      <div className="bg-white border border-gray-300">
        {/* HEADER */}
        <div className="flex justify-between items-center p-[10px] border-b bg-gray-100">
          <h2 className="text-sm text-gray-700 font-semibold">
            Annual Return Application Trade Union / Federation
          </h2>
          <button
            type="button"
            onClick={handleBackNavigation}
            className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white px-4 py-1 text-sm rounded transition-colors"
          >
            Back to list
          </button>
        </div>

        <div className="m-[15px] border">
          {/* SUBHEADER BAR */}
          <div className="bg-gray-100 px-[10px] py-[8px] border-b text-sm text-gray-700 font-medium text-center">
            Annual Return Documents
          </div>

          {/* TABLE */}
          <div className="p-[10px]">
            <DataTable
              columns={columns}
              data={tableData}
              progressPending={loading}
              dense
              striped
              highlightOnHover
              noTableHead
            />
          </div>

          {/* ACTION TAKEN SECTION */}
          {isCtuMode ? (
            allowedActions.length > 0 ? (
              <div className="m-[15px] border rounded overflow-hidden">
                <div className="bg-gray-100 px-[10px] py-[10px] border-b text-sm text-gray-700 font-semibold">
                  Action Taken
                </div>

                <div className="p-[15px] grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Action <span className="text-red-500">*</span>
                    </Label>

                    <Select value={action} onValueChange={(value) => setAction(value)}>
                      <SelectTrigger className="w-full h-[38px] text-sm border-slate-300">
                        <SelectValue placeholder="- Select -" />
                      </SelectTrigger>

                      <SelectContent>
                        {ctuActionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(action === "back" || action === "back_federation") && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        {action === "back_federation"
                          ? "Reason for sending back to Federation"
                          : "Reason of Back For Correction"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="min-h-[120px] text-sm border-slate-300"
                      />
                    </div>
                  )}

                  {action === "forward_ctu" && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Select CTU (West Bengal Unit){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={targetCtuMasterId}
                        onValueChange={setTargetCtuMasterId}
                        disabled={ctuTargetsLoading}
                      >
                        <SelectTrigger className="w-full h-[38px] text-sm border-slate-300">
                          <SelectValue
                            placeholder={
                              ctuTargetsLoading ? "Loading CTU list..." : "- Select CTU -"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ctuTargets.map((ctu) => (
                            <SelectItem key={ctu.id} value={String(ctu.id)}>
                              {ctu.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white px-6 py-2 text-sm font-medium rounded transition-colors"
                      onClick={handleSubmitAction}
                    >
                      SUBMIT
                    </button>
                  </div>
                </div>
              </div>
            ) : null
          ) : (
            /* ADMIN MODE ACTION SECTION */
            <div className="m-[15px] border border-slate-200 rounded overflow-hidden">
              <div className="bg-[#3c8dbc] text-white px-4 py-2 text-sm font-semibold uppercase">
                Action
              </div>

              <div className="p-4">
                {resolvedSourceType === "CTU_FORWARDED" || ctuStatus ? (
                  (() => {
                    const isAccepted =
                      (ctuStatus &&
                        (ctuStatus.toLowerCase().includes("accept") ||
                          ctuStatus.toLowerCase().includes("approved"))) ||
                      status === "Approved";
                    return (
                      <div
                        className={`${
                          isAccepted ? "bg-[#00a65a]" : "bg-[#dd4b39]"
                        } text-white p-3 rounded font-bold text-sm flex items-center gap-2`}
                      >
                        <span className="text-base">{isAccepted ? "✔" : "⚠"}</span>
                        <span>
                          {ctuStatus ||
                            (status === "Approved"
                              ? "ACCEPTED BY AFFILIATION"
                              : "PENDING ON AFFILIATION END")}
                        </span>
                      </div>
                    );
                  })()
                ) : requiresAction ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="rectificationConfirm"
                        checked={confirmChecked}
                        onChange={(e) => setConfirmChecked(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#3c8dbc]"
                      />
                      <label htmlFor="rectificationConfirm" className="text-sm text-slate-800">
                        <span className="text-red-600 font-bold mr-1">*</span>
                        CHECK THE BOX TO SEND THE RETURN APPLICATION FOR THE RECTIFICATION TO THE APPLICANT.
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!confirmChecked}
                        onClick={() => {
                          setAction("revert_to_tu");
                          setReason("Reverted for rectification by Admin");
                          setShowSubmitModal(true);
                        }}
                        className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white px-6 py-2 text-sm font-medium rounded disabled:opacity-50 transition-colors"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const isAccepted = status === "Approved";
                    return (
                      <div
                        className={`${
                          isAccepted ? "bg-[#00a65a]" : "bg-[#dd4b39]"
                        } text-white p-3 rounded font-bold text-sm flex items-center gap-2`}
                      >
                        <span className="text-base">{isAccepted ? "✔" : "⚠"}</span>
                        <span>
                          {isAccepted ? "ACCEPTED BY AFFILIATION" : "PENDING ON AFFILIATION END"}
                        </span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>Review selected documents before final submission.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[220px] overflow-y-auto border rounded px-3 py-2">
            <ul className="text-sm text-gray-700 space-y-2">
              {selectedDocumentNames.map((docName) => (
                <li key={docName} className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="accent-[#3c8dbc]" />
                  <span>{docName}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-1"
            />
            <label className="text-sm text-gray-700">
              I confirm that the selected document checks are correct.
            </label>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSubmitModal(false);
                setConfirmChecked(false);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmChecked}
              onClick={submitAction}
              className={`px-4 py-2 rounded text-white ${confirmChecked
                ? "bg-[#3c8dbc] hover:bg-[#357ca5]"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Submit
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnualReturnViewAction;
