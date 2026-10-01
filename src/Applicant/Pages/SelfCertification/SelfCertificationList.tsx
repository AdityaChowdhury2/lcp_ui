import React, { useEffect, useState } from "react";
import { Button } from "../../../Components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { getAuthToken } from "../../../utils/auth";

interface Action {
  key:
  | "viewApplication"
  | "payNow"
  | "uploadSignedApplication"
  | "paymentDetails"
  | "acknowledgementSlip"
  | "confirmationSlip"
  | "cancel";
  label: string;
  enabled: boolean;
  path: string | null;
  openInNewTab: boolean;
}

interface SelfCertificationApplication {
  slNo: number;
  id: number;
  userId: number;
  encId: string;
  encActId: string;
  estName: string;
  identificationNo: string;
  applyDate: string;
  contractLabourNo: number | null;
  status: string;
  statusLabel: string;
  actions: Action[];
}

const SelfCertificationList: React.FC = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<
    SelfCertificationApplication[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE}self-cert/app-list?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch applications");
      }

      setApplications(result.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: Action) => {
    if (!action.enabled || !action.path) return;

    if (action.key === "acknowledgementSlip" || action.key === "confirmationSlip" || action.key === "viewApplication") {
      try {
        const token = getAuthToken();
        let endpoint = "";
        if (action.key === "acknowledgementSlip") endpoint = "self-cert/acknowledgement-slip";
        else if (action.key === "confirmationSlip") endpoint = "self-cert/confirmation-slip";
        else if (action.key === "viewApplication") endpoint = "self-cert/application-form";

        const encIdRaw = action.path.split("/").pop();
        if (!encIdRaw) return;
        const encId = decodeURIComponent(encIdRaw);

        const response = await fetch(
          `${API_BASE}${endpoint}/${encodeURIComponent(encId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate PDF document");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to download PDF document");
      }
      return;
    }

    if (action.openInNewTab) {
      window.open(`/${action.path}`, "_blank");
    } else {
      navigate(`/${action.path}`);
    }
  };

  const renderActions = (app: SelfCertificationApplication) => {
    const enabledActions = app.actions.filter((action) => action.enabled);

    if (!enabledActions.length) return "-";

    return (
      <div className="space-y-1">
        {enabledActions.map((action) => (
          <p
            key={action.key}
            className={`cursor-pointer ${action.key === "cancel"
              ? "text-red-600"
              : action.key === "uploadSignedApplication"
                ? "text-green-600"
                : "text-blue-600"
              }`}
            onClick={() => handleActionClick(action)}
          >
            ● {action.label}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3]">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          LIST OF SELF CERTIFICATION SCHEME APPLICATION, 2016
        </h1>
      </div>

      <div className="bg-white rounded-md shadow border mx-4">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          Self Certification Applications
        </div>

        <div className="p-4">
          <div className="mb-3">
            <Link to="/self-certification-application/select-service">
              <Button className="bg-[#1e73be] hover:bg-[#175a93] text-white px-4 py-2 text-sm rounded">
                Apply
              </Button>
            </Link>
          </div>

          {loading && (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          )}

          {error && (
            <div className="py-4 text-center text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#215e87] text-white">
                    <th className="border px-3 py-2 text-left">Sl.No.</th>
                    <th className="border px-3 py-2 text-left">
                      Establishment Name
                    </th>
                    <th className="border px-3 py-2 text-left">
                      Identification No.
                    </th>
                    <th className="border px-3 py-2 text-left">
                      Contact Labour No.
                    </th>
                    <th className="border px-3 py-2 text-left">Status</th>
                    <th className="border px-3 py-2 text-left">Apply Date</th>
                    <th className="border px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 align-top">
                        <td className="border px-3 py-2">{app.slNo}</td>

                        <td className="border px-3 py-2">
                          {app.estName}
                        </td>

                        <td className="border px-3 py-2">
                          {app.identificationNo}
                        </td>

                        <td className="border px-3 py-2">
                          {app.contractLabourNo ?? "-"}
                        </td>

                        <td className="border px-3 py-2">
                          {(() => {
                            const s = (app.status ?? "").trim().toUpperCase();
                            if (s === "V" || s === "PAYMENT NOT MADE" || s === "A") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-fees-pending.png`}
                                  alt="Fees Pending"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "0" || s === "APPLIED") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-applied.png`}
                                  alt="Applied"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "APPROVED") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-approved.png`}
                                  alt="Approved"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "N" || s === "INCOMPLETE") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-not-to-be-forwarded-to-alc.png`}
                                  alt="Not To Be Forwarded To ALC"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "T" || s === "PAYMENT MADE" || s === "P") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-fees-paid.png`}
                                  alt="Fees Paid"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "FINAL SUBMIT" || s === "S" || s === "FINAL SUBMITTED") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-final-submit.png`}
                                  alt="Final Submitted"
                                  className="object-contain"
                                />
                              );
                            }
                            if (s === "ISSUED" || s === "I" || s === "CERTIFICATE ISSUED") {
                              return (
                                <img
                                  src={`${IMAGE_BASE}btn-issued.png`}
                                  alt="Issued"
                                  className="object-contain"
                                />
                              );
                            }
                            return <span className="font-semibold text-orange-600">{app.statusLabel}</span>;
                          })()}
                        </td>

                        <td className="border px-3 py-2">
                          {app.applyDate}
                        </td>

                        <td className="border px-3 py-2">
                          {renderActions(app)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfCertificationList;
