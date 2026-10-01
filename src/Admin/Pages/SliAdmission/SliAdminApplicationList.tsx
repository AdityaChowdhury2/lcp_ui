import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { Button } from "@/Components/ui/button";

interface ApplicationData {
  id: number;
  name: string;
  course_type: string;
  center: string;
  center_code: number;
  phone: string;
  email: string;
  status: number;
  roll_number: string | null;
  exam_time: string | null;
  vanue: string | null;
  sponsored: string;
  encId: string;
}

/** Academic session ("2026-2027") the roll numbers are stamped with. */
const currentSession = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
};

const SliAdminApplicationList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");

  // State
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState(statusParam ? statusParam : "");
  const [courseFilter, setCourseFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [sponsoredFilter, setSponsoredFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Roll Generation Modal state
  const [showRollModal, setShowRollModal] = useState(false);
  const [rollForm, setRollForm] = useState({
    course: "hrd",
    center_code: "1",
    sponsored: "no",
    batch_year: currentSession(),
    exam_date: "",
    time_from: "",
    time_to: "",
    venue: "kol",
    applicant_count: "10",
  });
  const [rollLoading, setRollLoading] = useState(false);

  // Single-candidate admit card generation
  const [admitTarget, setAdmitTarget] = useState<ApplicationData | null>(null);
  const [admitForm, setAdmitForm] = useState({
    batch_year: currentSession(),
    exam_date: "",
    time_from: "",
    time_to: "",
    venue: "kol",
  });
  const [admitLoading, setAdmitLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    fetchApplications();
  }, [statusFilter, courseFilter, centerFilter, sponsoredFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();

      const queryParams = new URLSearchParams();
      if (statusFilter !== "") queryParams.append("status", statusFilter);
      if (courseFilter !== "") queryParams.append("course_type", courseFilter);
      if (centerFilter !== "") queryParams.append("center_code", centerFilter);
      if (sponsoredFilter !== "") queryParams.append("sponsored", sponsoredFilter);
      if (searchQuery !== "") queryParams.append("search", searchQuery);

      const response = await fetch(`${API_BASE}sli/admin/applications?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchApplications();
  };

  const handleDownloadAdmit = async (encId: string) => {
    try {
      const token = getAuthToken();
      const endpoint = `${API_BASE}sli/admitcard/${encodeURIComponent(encId)}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download admit card PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to download admit card");
    }
  };

  const openAdmitModal = (app: ApplicationData) => {
    setAdmitTarget(app);
    setAdmitForm({
      batch_year: currentSession(),
      exam_date: "",
      time_from: "",
      time_to: "",
      venue: app.center_code === 2 ? "slg" : app.center_code === 3 ? "ans" : "kol",
    });
  };

  const handleAdmitFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdmitForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateAdmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitTarget) return;

    try {
      setAdmitLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE}sli/admin/applications/${encodeURIComponent(admitTarget.encId)}/generate-admit-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(admitForm),
        }
      );

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to generate admit card");
      }

      alert(`Admit card generated. Roll Number: ${data?.application?.roll_number || ""}`);
      setAdmitTarget(null);
      fetchApplications();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong while generating the admit card.");
    } finally {
      setAdmitLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;

    const headers = ["Reg ID", "Name", "Phone", "Email", "Course", "Center", "Sponsorship", "Status", "Roll Number", "Exam Venue"];
    const rows = applications.map((app) => [
      `WBSLI2024-25-0000${app.id}`,
      app.name || "",
      app.phone || "",
      app.email || "",
      app.course_type || "",
      app.center ? app.center.split(":")[0] : "",
      app.sponsored === "yes" ? "Sponsored" : "Non-sponsored",
      app.status === 1 ? "Pending" : app.status === 2 ? "Approved" : app.status === 3 ? "Rejected" : "Draft",
      app.roll_number || "",
      app.vanue || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SLI_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRollFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRollForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollForm.exam_date || !rollForm.time_from || !rollForm.applicant_count) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setRollLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/admin/applications/generate-roll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...rollForm,
          center_code: Number(rollForm.center_code),
          applicant_count: Number(rollForm.applicant_count),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to generate roll numbers.");
      }

      alert("Roll numbers and exam venues allocated successfully!");
      setShowRollModal(false);
      fetchApplications();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during roll generation.");
    } finally {
      setRollLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return <span className="text-yellow-600 font-semibold">Pending</span>;
      case 2: return <span className="text-green-600 font-semibold">Approved</span>;
      case 3: return <span className="text-red-600 font-semibold">Rejected</span>;
      default: return <span className="text-gray-500">Draft</span>;
    }
  };

  const pageSize = 10;
  const totalPages = Math.ceil(applications.length / pageSize);
  const paginatedApps = applications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      {/* Header */}
      <div className="bg-white p-4 mb-4 rounded-md border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Admission Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Review student requests, download attachments, and issue roll numbers.</p>
        </div>
        <div className="flex space-x-2">
          {/* <Button
            onClick={() => setShowRollModal(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs px-4 py-2 rounded"
          >
            Generate Rolls & Venue
          </Button> */}
          <Button
            onClick={handleExportCSV}
            disabled={applications.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded"
          >
            Export to Excel/CSV
          </Button>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 mb-4 rounded-md border shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded p-1.5 text-xs bg-white"
          >
            <option value="">All (Submitted)</option>
            <option value="1">Pending Review</option>
            <option value="2">Approved</option>
            <option value="3">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full border rounded p-1.5 text-xs bg-white"
          >
            <option value="">All Courses</option>
            <option value="Post Graduate Diploma in Human Resource Development & Labour Welfare">
              PG Diploma (HRD)
            </option>
            <option value="Advanced Diploma in Construction Safety">
              Adv Diploma (Safety)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Centre</label>
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="w-full border rounded p-1.5 text-xs bg-white"
          >
            <option value="">All Centres</option>
            <option value="1">Kolkata</option>
            <option value="2">Siliguri</option>
            <option value="3">Asansol</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Sponsorship</label>
          <select
            value={sponsoredFilter}
            onChange={(e) => setSponsoredFilter(e.target.value)}
            className="w-full border rounded p-1.5 text-xs bg-white"
          >
            <option value="">All Types</option>
            <option value="yes">Sponsored</option>
            <option value="no">Non-sponsored</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Search Candidate</label>
          <div className="flex space-x-1">
            <input
              type="text"
              placeholder="Name or Roll No."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded p-1.5 text-xs"
            />
            <Button type="submit" className="bg-[#215e87] hover:bg-[#1a4b6c] text-white text-xs px-3">
              Go
            </Button>
          </div>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-md shadow border">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          Application Records ({applications.length})
        </div>

        <div className="p-4">
          {loading && <div className="py-8 text-center text-gray-500">Loading applications...</div>}
          {error && <div className="py-4 text-center text-red-500">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#215e87] text-white">
                    <th className="border px-3 py-2 text-left">Reg ID</th>
                    <th className="border px-3 py-2 text-left">Candidate Name</th>
                    <th className="border px-3 py-2 text-left">Phone</th>
                    <th className="border px-3 py-2 text-left">Course</th>
                    <th className="border px-3 py-2 text-left">Centre</th>
                    <th className="border px-3 py-2 text-left">Type</th>
                    <th className="border px-3 py-2 text-left">Status</th>
                    <th className="border px-3 py-2 text-left">Roll Number</th>
                    <th className="border px-3 py-2 text-left">Action</th>
                    <th className="border px-3 py-2 text-left">Generate Admit Card</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedApps.length > 0 ? (
                    paginatedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 align-middle">
                        <td className="border px-3 py-3 font-semibold">WBSLI2024-25-0000{app.id}</td>
                        <td className="border px-3 py-3 uppercase">{app.name}</td>
                        <td className="border px-3 py-3">{app.phone}</td>
                        <td className="border px-3 py-3 text-xs">{app.course_type?.split("in ")[1] || app.course_type}</td>
                        <td className="border px-3 py-3 text-xs">{app.center ? app.center.split(":")[0] : ""}</td>
                        <td className="border px-3 py-3 text-xs">
                          {app.sponsored === "yes" ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded">
                              Sponsored
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
                              General
                            </span>
                          )}
                        </td>
                        <td className="border px-3 py-3 text-xs">{getStatusText(app.status)}</td>
                        <td className="border px-3 py-3 font-mono text-xs font-semibold">{app.roll_number || "-"}</td>
                        <td className="border px-3 py-3">
                          <Button
                            onClick={() => navigate(`/sli-admin/application-view/${encodeURIComponent(app.encId)}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded"
                          >
                            View & Review
                          </Button>
                        </td>
                        <td className="border px-3 py-3">
                          {app.status === 2 && app.roll_number ? (
                            <Button
                              onClick={() => handleDownloadAdmit(app.encId)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded"
                            >
                              View Admit Card
                            </Button>
                          ) : app.status === 2 ? (
                            <Button
                              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2.5 py-1 rounded"
                              onClick={() => openAdmitModal(app)}
                            >
                              Generate Admit Card
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-gray-500">
                        No applications matched filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && applications.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-xs text-gray-700 gap-4">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, applications.length)} of {applications.length} entries
              </div>
              <div className="flex items-center space-x-1 flex-wrap gap-1">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50"
                >
                  First
                </Button>
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50"
                >
                  Prev
                </Button>
                <span className="px-3 py-1 bg-[#215e87] text-white rounded font-semibold">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50"
                >
                  Next
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages || 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single Candidate Admit Card Modal */}
      {admitTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-md max-w-md w-full border">
            <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md flex justify-between items-center">
              <span>Generate Admit Card</span>
              <button onClick={() => setAdmitTarget(null)} className="text-white hover:text-gray-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleGenerateAdmitCard} className="p-4 space-y-4">
              <div className="bg-gray-50 border rounded p-3 text-xs space-y-1">
                <div><span className="font-semibold text-gray-600">Candidate:</span> <span className="uppercase">{admitTarget.name}</span></div>
                <div><span className="font-semibold text-gray-600">Course:</span> {admitTarget.course_type}</div>
                <div><span className="font-semibold text-gray-600">Centre:</span> {admitTarget.center ? admitTarget.center.split(":")[0] : "-"}</div>
                <div>
                  <span className="font-semibold text-gray-600">Type:</span>{" "}
                  {admitTarget.sponsored === "yes" ? "Sponsored" : "Non-sponsored"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Batch / Session</label>
                <input type="text" name="batch_year" placeholder="e.g. 2024-2025" value={admitForm.batch_year} onChange={handleAdmitFormChange} className="w-full border rounded p-1.5 text-xs" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Exam Date (e.g. 15-12-2024)</label>
                <input type="text" name="exam_date" placeholder="e.g. 15-12-2024" value={admitForm.exam_date} onChange={handleAdmitFormChange} className="w-full border rounded p-1.5 text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">From Time</label>
                  <input type="text" name="time_from" placeholder="e.g. 12:00 PM" value={admitForm.time_from} onChange={handleAdmitFormChange} className="w-full border rounded p-1.5 text-xs" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">To Time (Optional)</label>
                  <input type="text" name="time_to" placeholder="e.g. 1:30 PM" value={admitForm.time_to} onChange={handleAdmitFormChange} className="w-full border rounded p-1.5 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Exam Venue</label>
                <select name="venue" value={admitForm.venue} onChange={handleAdmitFormChange} className="w-full border rounded p-1.5 text-xs bg-white">
                  <option value="kol">SLI Kolkata</option>
                  <option value="kol2">NTC Kolkata (ESI Hospital)</option>
                  <option value="slg">SLI Siliguri (Dagapur)</option>
                  <option value="ans">SLI Asansol (Kalyanpur)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <Button type="button" onClick={() => setAdmitTarget(null)} className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={admitLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5">
                  {admitLoading ? "Generating..." : "Generate Admit Card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roll Generation Modal */}
      {showRollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-md max-w-md w-full border">
            <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md flex justify-between items-center">
              <span>Generate Roll Numbers</span>
              <button onClick={() => setShowRollModal(false)} className="text-white hover:text-gray-200 font-bold">✕</button>
            </div>

            <form onSubmit={handleGenerateRoll} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course</label>
                <select name="course" value={rollForm.course} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs bg-white">
                  <option value="hrd">PG Diploma (HRD)</option>
                  <option value="adcs">Adv Diploma (Safety)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Centre Code</label>
                  <select name="center_code" value={rollForm.center_code} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs bg-white">
                    <option value="1">Kolkata</option>
                    <option value="2">Siliguri</option>
                    <option value="3">Asansol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Sponsorship</label>
                  <select name="sponsored" value={rollForm.sponsored} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs bg-white">
                    <option value="no">Non-sponsored</option>
                    <option value="yes">Sponsored</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Batch Year</label>
                  <input type="number" name="batch_year" value={rollForm.batch_year} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Max Candidates</label>
                  <input type="number" name="applicant_count" value={rollForm.applicant_count} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Exam Date (e.g. 15.12.2024)</label>
                <input type="text" name="exam_date" placeholder="e.g. 15.12.2024" value={rollForm.exam_date} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">From Time</label>
                  <input type="text" name="time_from" placeholder="e.g. 12:00 PM" value={rollForm.time_from} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">To Time (Optional)</label>
                  <input type="text" name="time_to" placeholder="e.g. 2:00 PM" value={rollForm.time_to} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Exam Venue</label>
                <select name="venue" value={rollForm.venue} onChange={handleRollFormChange} className="w-full border rounded p-1.5 text-xs bg-white">
                  <option value="kol">SLI Kolkata</option>
                  <option value="kol2">NTC Kolkata (ESI Hospital)</option>
                  <option value="slg">SLI Siliguri (Dagapur)</option>
                  <option value="ans">SLI Asansol (Kalyanpur)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <Button type="button" onClick={() => setShowRollModal(false)} className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={rollLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5">
                  {rollLoading ? "Allocating..." : "Generate Rolls"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SliAdminApplicationList;
