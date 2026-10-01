import React, { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import type { AppDispatch } from "@/store/store";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

interface ApplicationData {
  id: number;
  name: string;
  course_type: string;
  center: string;
  status: number;
  submitd_date: string | null;
  roll_number: string | null;
  exam_time: string | null;
  vanue: string | null;
  encId: string;
}

const SliAdmissionList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/application`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }

      const result = await response.json();
      if (result && result.application) {
        setApplication(result.application);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDoc = async (type: "acknowledgement" | "admitcard") => {
    if (!application) return;
    try {
      const token = getAuthToken();
      const endpoint = `${API_BASE}sli/${type}/${encodeURIComponent(application.encId)}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${type}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to download document");
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded">Draft</span>;
      case 1:
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">Pending Review</span>;
      case 2:
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Approved</span>;
      case 3:
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">Unknown</span>;
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3]">
      <div className="bg-white p-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          STATE LABOUR INSTITUTE ADMISSION MODULE
        </h1>
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded"
        >
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-md shadow border mx-4">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          My Admission Applications
        </div>

        <div className="p-6">
          {loading && (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          )}

          {error && (
            <div className="py-4 text-center text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div>
              {application ? (
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#215e87] text-white">
                        <th className="border px-4 py-3 text-left">Registration ID</th>
                        <th className="border px-4 py-3 text-left">Course</th>
                        <th className="border px-4 py-3 text-left">Centre</th>
                        <th className="border px-4 py-3 text-left">Status</th>
                        <th className="border px-4 py-3 text-left">Roll Number</th>
                        <th className="border px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 align-middle">
                        <td className="border px-4 py-4 font-semibold">
                          WBSLI2024-25-0000{application.id}
                        </td>
                        <td className="border px-4 py-4">{application.course_type}</td>
                        <td className="border px-4 py-4">{application.center}</td>
                        <td className="border px-4 py-4">{getStatusBadge(application.status)}</td>
                        <td className="border px-4 py-4 font-mono font-semibold">
                          {application.roll_number || "-"}
                        </td>
                        <td className="border px-4 py-4 space-y-2">
                          {application.status === 0 && (
                            <Button
                              onClick={() => navigate("/sli-admission/apply")}
                              className="bg-[#1e73be] hover:bg-[#175a93] text-white text-xs px-3 py-1.5 rounded mr-2"
                            >
                              Continue Application
                            </Button>
                          )}
                          {application.status >= 1 && (
                            <Button
                              onClick={() => handleDownloadDoc("acknowledgement")}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded mr-2"
                            >
                              Acknowledgement Slip
                            </Button>
                          )}
                          {application.status === 2 && application.roll_number && (
                            <Button
                              onClick={() => handleDownloadDoc("admitcard")}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded"
                            >
                              Download Admit Card
                            </Button>
                          )}
                          {application.status === 2 && !application.roll_number && (
                            <span className="text-xs text-gray-500 italic block">
                              Admit card will be generated soon.
                            </span>
                          )}
                          {application.status === 3 && (
                            <span className="text-xs text-red-600 block">
                              Application rejected.
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No admission applications found.</p>
                  <Button
                    onClick={() => navigate("/sli-admission/apply")}
                    className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6 py-2.5 text-sm rounded shadow-md"
                  >
                    Apply for Course Admission
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliAdmissionList;
