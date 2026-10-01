import { ACTS, API_BASE, AUTH_STORAGE_KEY, IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { getAuthToken, getUserName, getUserId } from "../../utils/auth";
import { encryptionDecryptionFun } from "../../utils/encryption";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";

interface RowData {
  id: number;
  regNo: string;
  regDate: string;
  /** Amendment issue date — shown only when it falls after the reg date. */
  amendmentDate: string;
  establishment: string;
  identificationNo: string;
  act: string;
  status: string;
}

export default function DashboardApplicant() {
  const [tableData, setTableData] = useState<RowData[]>([]);
  const userName = getUserName() ?? "";

  const navigate = useNavigate()

  const [isRenew, setIsRenew] = useState(false);

  // INCOMPLETE CLRA drafts (status = null) can be deleted from the dashboard.
  const [rowToDelete, setRowToDelete] = useState<RowData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncompleteClra = (row: RowData) =>
    row.status === null && (row.act ?? "").toUpperCase().includes("CLRA");

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    setIsDeleting(true);
    try {
      const encAppId =
        encryptionDecryptionFun("encrypt", String(rowToDelete.id)) ?? "";
      await axios.delete(
        `${API_BASE}clra/applications/incomplete/${encodeURIComponent(encAppId)}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      setTableData((prev) => prev.filter((r) => r.id !== rowToDelete.id));
      setRowToDelete(null);
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Unable to delete application.");
    } finally {
      setIsDeleting(false);
    }
  };

  function getActionLinks(row: RowData) {
    const encAppId = encryptionDecryptionFun("encrypt", String(row.id)) ?? "";
    const actUpper = (row.act ?? "").toUpperCase();
    const isClraAmendment = (actUpper.includes("CLRA") && actUpper.includes("AMENDMENT"));
    const isClraAct = actUpper.includes("CLRA");
    const isBocwaAct = actUpper.includes("BOCWA");
    const isMtwAct = actUpper.includes("MTW");
    const isIsmwAct = actUpper.includes("ISMW");

    const encClraActId = encryptionDecryptionFun("encrypt", "1") ?? "";
    const encBocwaActId = encryptionDecryptionFun("encrypt", "2") ?? "";
    const encMtwActId = encryptionDecryptionFun("encrypt", "3") ?? "";

    const actId = isClraAct ? "1" : isBocwaAct ? "2" : isMtwAct ? "3" : isIsmwAct ? "4" : "";
    const encActId = encryptionDecryptionFun("encrypt", actId) ?? "";
    const isBocwaAmendment = actUpper.includes("BOCWA") && actUpper.includes("AMENDMENT");
    const isFeesPending = row.status === "Fees Pending" || row.status === "V";

    const isFormIBacked = row.status === "U" || row.status === "VA" || row.status === "T";

    const formIBackUrl =
      isFormIBacked && isClraAct
        ? `/upload_signed_application_form/${encodeURIComponent(encAppId)}/${encodeURIComponent(encClraActId)}/${row.identificationNo}`
        : isFormIBacked && isBocwaAct
          ? `/upload_signed_application_form/${encodeURIComponent(encAppId)}/${encodeURIComponent(encBocwaActId)}/${row.identificationNo}`
          : isFormIBacked && isMtwAct
            ? `/upload_signed_application_form/${encodeURIComponent(encAppId)}/${encodeURIComponent(encMtwActId)}/${row.identificationNo}`
            : null;

    const viewDetailsUrl = isClraAmendment
      ? row.status === null || row.status === "U" || row.status === "B"
        ? `/clra-reg-amendment/view-clra-application?id=${encodeURIComponent(encAppId)}&tab=preview&fromDashboard=true`
        : `/clra-reg-amendment/view-details?applicationId=${encodeURIComponent(encAppId)}`
      : isBocwaAmendment
        ? `/amendment-bocwa/bocwa-amendment-submit?id=${encodeURIComponent(encAppId)}&tab=2`
        : isMtwAct
          ? row.status === null || row.status === "U" || row.status === "B"
            ? `/mtw-renewal?tab=3&id=${encodeURIComponent(encAppId)}&renwalStatus=${isRenew}`
            : `/mtw/view-details?id=${encodeURIComponent(encAppId)}&renwalStatus=${isRenew}`
          : "#";

    const payNowUrl = isFeesPending && isClraAmendment
      ? `/epayments-preview?applicationId=${encodeURIComponent(encAppId)}&actId=${encodeURIComponent(encClraActId)}`
      : isFeesPending && isBocwaAmendment
        ? `/epayments-preview?applicationId=${encodeURIComponent(encAppId)}&actId=${encodeURIComponent(encBocwaActId)}`
        : isFeesPending && isMtwAct
          ? `/epayments-preview?applicationId=${encodeURIComponent(encAppId)}&actId=${encodeURIComponent(encMtwActId)}`
          : null;

    const userId = getUserId();
    const certificateUrl = isClraAct
      ? `${API_BASE}certificate/formII/clra?applicationId=${encodeURIComponent(encAppId)}&userId=${userId}`
      : isBocwaAct
        ? `${API_BASE}certificate/formII/bocwa?applicationId=${encodeURIComponent(encAppId)}&userId=${userId}`
        : isMtwAct
          ? `${API_BASE}certificate/formII/mtw?applicationId=${encodeURIComponent(encAppId)}&userId=${userId}`
          : isIsmwAct
            ? `${API_BASE}certificate/formII/ismw?applicationId=${encodeURIComponent(encAppId)}&userId=${userId}`
            : null;

    return { viewDetailsUrl, payNowUrl, formIBackUrl, certificateUrl, encAppId, isClraAct, isBocwaAct, isMtwAct, encClraActId, encBocwaActId, encMtwActId, isIsmwAct, encActId };
  }

  const handleGenerateCertificatePdf = async (certificateUrl: string) => {
    if (!certificateUrl) return;
    try {
      const response = await axios.get(
        certificateUrl,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}")?.token}`,
          },
          responseType: "blob",
        }
      );
      // Create blob directly from response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(blobUrl, "_blank");
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);

    } catch (error: any) {
      console.error("Error fetching Certificate PDF:", error);
      alert("Unable to fetch document.");
    }
  };

  function renderStatusCell(status: string) {
    if (status === null) {
      return (
        <div className="bg-red-600 px-2 py-1 text-red-100 rounded-sm text-[11px]">
          INCOMPLETE
        </div>
      );
    }

    const fileName = STATUS_IMAGE_MAP[status];
    if (!fileName) return null;

    return (
      <img
        src={`${IMAGE_BASE}${fileName}`}
        alt={status}
        className="object-contain"
      />
    );
  }

  useEffect(() => {
    const getDashboardTableData = async () => {
      try {
        const responses = await Promise.all(
          ACTS.map((act: string) =>
            axios.get(
              `${API_BASE}applicant-module/applications/dashboard?act=${act}`,
              {
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`,
                  "Content-Type": "application/json",
                },
              }
            )
          )
        );


        // ================= CLRA AMENDMENT MENU CHECK =================
        const clraResponse = responses.find(
          (res) =>
            res?.config?.url?.includes(
              "applicant-module/applications/dashboard?act=CLRA"
            )
        );

        const clraData = clraResponse?.data?.data || [];

        const latestClraRecord = [...clraData].sort(
          (a, b) => Number(b.id) - Number(a.id)
        )[0];

        const showClraAmendmentMenu =
          latestClraRecord?.status === "I";

        sessionStorage.setItem(
          "SHOW_CLRA_AMENDMENT_MENU",
          String(showClraAmendmentMenu)
        );

        window.dispatchEvent(
          new Event("clra-amendment-menu-updated")
        );

        // ============================================================

        const mergedData = responses.flatMap(
          (res) => res?.data?.data || []
        );

        setIsRenew(mergedData.some((d: any) => d.is_renew));

        const rowData: RowData[] = mergedData.map((d: any) => {
          // Show the amendment date only when it actually post-dates the
          // registration date (amendment records carry the original reg date).
          const regDateRaw = d?.registration_date ? new Date(d.registration_date) : null;
          const amendDateRaw = d?.amendment_date ? new Date(d.amendment_date) : null;
          const showAmendment =
            amendDateRaw && (!regDateRaw || amendDateRaw.getTime() > regDateRaw.getTime());

          return {
            id: d?.id,
            regNo: d?.registration_number,
            establishment: d?.e_name || d?.mtw_name,
            regDate: regDateRaw ? regDateRaw.toLocaleDateString() : "",
            amendmentDate: showAmendment ? amendDateRaw!.toLocaleDateString() : "",
            identificationNo: d?.identification_number,
            act: d?.act,
            status: d?.status,
          };
        });

        setTableData(rowData);
      } catch (error) {
        console.error("Dashboard API Error:", error);
        setTableData([]);
      }
    };

    getDashboardTableData();
  }, []);

  // Form V must reflect the current live registration, so among a registration's
  // CLRA rows (original + amendments) only the latest application (max id) may
  // download it. Older issued rows are superseded and shown disabled.
  const latestClraIdByReg = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of tableData) {
      if (!(r.act ?? "").toUpperCase().includes("CLRA")) continue;
      const key = r.regNo ?? "";
      const prev = map.get(key);
      if (prev === undefined || Number(r.id) > prev) {
        map.set(key, Number(r.id));
      }
    }
    return map;
  }, [tableData]);

  const columns = useMemo<TableColumn<RowData>[]>(
    () => [
      {
        name: "Sl. No",
        cell: (_row, index) => index + 1,
        width: "80px",
      },
      {
        name: "REG NO. & DATE",
        style: { minWidth: "150px" },
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold">{row.regNo}</span>
            <span className="text-sm">{row.regDate}</span>
            {row.amendmentDate && (
              <span className="text-sm text-amber-700">
                Amendment: {row.amendmentDate}
              </span>
            )}
          </div>
        ),
        wrap: true,
      },
      {
        name: "ESTABLISHMENT NAME",
        style: { minWidth: "200px" },
        selector: (row) => row.establishment,
        wrap: true,
      },
      {
        name: "SERVICE",
        style: { minWidth: "150px" },
        selector: (row) => row.act,
        wrap: true,
      },
      {
        name: "STATUS",
        width: "150px",
        selector: (row) => row.status,
        cell: (row) => renderStatusCell(row.status),
      },
      {
        name: "ACTION",
        width: "230px",
        cell: (row, index) => {
          const { viewDetailsUrl, payNowUrl, formIBackUrl, certificateUrl, encAppId, encClraActId, isClraAct, encBocwaActId, isBocwaAct, encMtwActId, isMtwAct, isIsmwAct, encActId } = getActionLinks(row);
          const isIssued = row.status === "I";
          const isFirstRow = index === 0;
          // const isSecondRow = index === 1;
          const firstRowIssued = tableData[0]?.status === "I";
          return (
            <div className="flex flex-col gap-1 text-blue-600 text-xs font-medium">
              {isIncompleteClra(row) && (
                <span
                  onClick={() => setRowToDelete(row)}
                  className="text-red-600 hover:text-red-800 flex gap-1 cursor-pointer"
                >
                  <IoIosArrowDroprightCircle /> Delete
                </span>
              )}
              {payNowUrl && (
                <p
                  onClick={() => navigate(payNowUrl)}
                  className="hover:text-blue-800 flex gap-1 cursor-pointer"
                >
                  <IoIosArrowDroprightCircle />
                  Pay Now
                </p>
              )}
              {!isIsmwAct && (
                <a
                  onClick={() => {
                    const actUpper = row.act?.toUpperCase() || "";

                    if (actUpper.includes("CLRA") && actUpper.includes("AMENDMENT")) {
                      sessionStorage.setItem(
                        "CLRA_CTX",
                        JSON.stringify({
                          encryptedApplicationId: encAppId,
                        })
                      );
                    }

                    let DETAILS_URL = viewDetailsUrl;
                    if (actUpper.includes("BOCWA") && actUpper.includes("AMENDMENT")) {
                      sessionStorage.setItem(
                        "BOCWA_CTX",
                        JSON.stringify({
                          encryptedApplicationId: encAppId,
                        })
                      );
                      DETAILS_URL = viewDetailsUrl + "&isView=true"
                    }
                    if (actUpper.includes("MTW") && actUpper.includes("RENEWAL")) {
                      sessionStorage.setItem(
                        "MTW_CTX",
                        JSON.stringify({
                          encryptedApplicationId: encAppId,
                        })
                      );
                    }
                    navigate(DETAILS_URL);
                  }}
                  className={`flex gap-1 ${viewDetailsUrl === "#"}`}
                >
                  <IoIosArrowDroprightCircle />
                  View Details
                </a>
              )}
              {/* <a
                href={viewDetailsUrl}
                className={`flex gap-1 ${viewDetailsUrl === "#"
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:text-blue-800"`}
                  }`}
              >
                <IoIosArrowDroprightCircle />
                View Details
              </a> */}

              <span
                onClick={() => navigate(`/view-remarks/${encodeURIComponent(encActId)}/${encodeURIComponent(encAppId)}`)}
                className="hover:text-blue-800 flex gap-1 cursor-pointer"
              >
                <IoIosArrowDroprightCircle /> View Remarks
              </span>

              {formIBackUrl && (
                <p
                  onClick={() => navigate(formIBackUrl)}
                  className="text-amber-600 hover:text-amber-700 flex gap-1 cursor-pointer"
                >
                  <IoIosArrowDroprightCircle />
                  Download & Upload Form-I with Signature
                </p>
              )}

              {certificateUrl && (
                <p
                  className={`flex gap-1 ${isIssued
                    ? "hover:text-blue-800 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  onClick={() => {
                    if (isIssued) {
                      handleGenerateCertificatePdf(certificateUrl);
                    }
                  }}
                >
                  <IoIosArrowDroprightCircle /> Download Certificate
                </p>
              )}

              {isClraAct && row.status !== null && row.status !== undefined && row.status !== "" && (() => {
                // Only the latest CLRA application for this registration may
                // download Form V; superseded (older) issued rows are disabled.
                const isLatestClra =
                  latestClraIdByReg.get(row.regNo ?? "") === Number(row.id);
                const canDownloadFormV = isIssued && isLatestClra;
                return (
                  <p
                    onClick={() => {
                      // Form V certifies an engagement under a live registration.
                      if (canDownloadFormV) {
                        navigate('/view-contractors-form-v', {
                          state: {
                            appId: encAppId,
                            isClraAct: true,
                          }
                        });
                      }
                    }}
                    className={`flex gap-1 ${canDownloadFormV
                      ? "hover:text-blue-800 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed pointer-events-none"
                      }`}
                  >
                    <IoIosArrowDroprightCircle /> Download Form-V
                  </p>
                );
              })()}

              {isIsmwAct && row.status !== null && row.status !== undefined && row.status !== "" && (
                <p
                  onClick={() => navigate('/view-contractors-form-v', {
                    state: {
                      appId: encAppId,
                      isIsmwAct: true,
                    }
                  })}
                  className={`flex gap-1 hover:text-blue-800 cursor-pointer`}
                >
                  <IoIosArrowDroprightCircle /> Download Form-VI
                </p>
              )}

              {!isIsmwAct && (
                <p
                  className={`flex gap-1 ${isIssued
                    ? "hover:text-blue-800 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  onClick={() => {
                    if (isIssued) {
                      navigate('/form-I-pdf', {
                        state: {
                          appId: encAppId,
                          isClraAct: isClraAct,
                          encClraActId,
                          encBocwaActId,
                          isBocwaAct,
                          isMtwAct,
                          encMtwActId,
                        }
                      });
                    }
                  }}
                >
                  <IoIosArrowDroprightCircle /> Download Acknowledgement
                </p>
              )}
            </div>
          );
        },
      },
    ],
    [tableData]
  );

  return (
    <>
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          MY DASHBOARD
        </h1>
      </div>

      <div className="bg-white shadow rounded border p-4 mb-15">
        <DataTable
          columns={columns}
          data={tableData}
          striped
          highlightOnHover
          responsive
          noDataComponent={
            <div className="py-6 text-center text-gray-500 text-sm font-medium">
              No applications found for {userName}.
            </div>
          }
          customStyles={{
            headRow: {
              style: {
                backgroundColor: "#2b5f88",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "13px",
              },
            },
            headCells: {
              style: {
                borderRight: "1px solid #e5e7eb",
                whiteSpace: "normal",
              },
            },
            rows: {
              style: {
                fontSize: "13px",
              },
            },
            cells: {
              style: {
                borderRight: "1px solid #e5e7eb",
                alignItems: "flex-start",
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            },
          }}
        />
      </div>

      {/* Delete Confirmation Modal (INCOMPLETE CLRA only) */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[450px] p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>

            <p>Are you sure you want to delete this incomplete application?</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
                className="px-4 py-2 bg-[#2A628C] text-white rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  />
                )}
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
