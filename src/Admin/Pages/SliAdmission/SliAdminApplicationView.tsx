import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { Button } from "@/Components/ui/button";

interface ApplicationData {
  id: number;
  name: string;
  course_type: string;
  center: string;
  father_name: string;
  dob: string;
  phone: string;
  email: string;
  present_address: string;
  permanent_address: string;
  year_graduation: number | null;
  university_name: string;
  canditate_cast: string;
  sponsored: string;
  sponsored_name: string | null;
  fee_payment_transaction_id: string;
  fee_payment_transaction_date: string;
  status: number;
  roll_number: string | null;
  vanue: string | null;
  exam_time: string | null;
  centershort: string | null;
  encId: string;
}

interface DocumentData {
  profile_pic: string | null;
  proof_dob: string | null;
  proof_address: string | null;
  final_marksheet: string | null;
  bank_documents: string | null;
  cast_certificate: string | null;
  emp_certificate: string | null;
}

const SliAdminApplicationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [docs, setDocs] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const getFileUrl = (path: string | null) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${API_BASE}${cleanPath}`;
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/admin/applications/${encodeURIComponent(id || "")}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load application details.");
      }

      const result = await response.json();
      setApp(result.application);
      setDocs(result.documents);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (status: number) => {
    if (!id || !app) return;
    const confirmMsg = status === 2
      ? "Are you sure you want to APPROVE this application?"
      : "Are you sure you want to REJECT this application?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setReviewLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/admin/applications/${encodeURIComponent(id || "")}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Action failed.");
      }

      alert(status === 2 ? "Application approved successfully!" : "Application rejected.");
      fetchApplicationDetails();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownloadAdmit = async () => {
    if (!app || !id) return;
    try {
      const token = getAuthToken();
      const endpoint = `${API_BASE}sli/admitcard/${encodeURIComponent(app.encId)}`;
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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading details...</div>;
  if (error) return <div className="text-center py-6 text-red-500">{error}</div>;
  if (!app) return <div className="text-center py-6 text-gray-500">Application not found.</div>;

  const dobStr = app.dob ? new Date(app.dob).toLocaleDateString("en-GB") : "";
  const paymentDateStr = app.fee_payment_transaction_date
    ? new Date(app.fee_payment_transaction_date).toLocaleDateString("en-GB")
    : "";

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      {/* Back button */}
      <div className="mb-4">
        <Button onClick={() => navigate("/sli-admin/applications")} className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded">
          ← Back to List
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-md shadow border">
        {/* Header */}
        <div className="bg-[#215e87] text-white font-semibold px-6 py-4 rounded-t-md flex justify-between items-center">
          <span className="text-lg">Application Details - WBSLI2024-25-0000{app.id}</span>
          <span className="text-sm font-semibold uppercase font-mono">
            {app.status === 1 ? "Pending Review" : app.status === 2 ? "Approved" : app.status === 3 ? "Rejected" : "Draft"}
          </span>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Candidate Details */}
          <div>
            <h3 className="text-sm font-bold text-[#215e87] border-b pb-2 mb-4 uppercase">1. Personal & Academic Details</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold w-1/3">Course Selected</td>
                    <td className="border p-3">{app.course_type}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Centre Selected</td>
                    <td className="border p-3">{app.center}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">Candidate Name</td>
                    <td className="border p-3 uppercase font-semibold">{app.name}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Father's Name</td>
                    <td className="border p-3">{app.father_name}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">Date of Birth</td>
                    <td className="border p-3">{dobStr}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Mobile Number</td>
                    <td className="border p-3">{app.phone}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">Email ID</td>
                    <td className="border p-3">{app.email}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Present Address</td>
                    <td className="border p-3">{app.present_address}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">Permanent Address</td>
                    <td className="border p-3">{app.permanent_address}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Year of Graduation/Diploma</td>
                    <td className="border p-3">{app.year_graduation}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">University/Institution Name</td>
                    <td className="border p-3">{app.university_name}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Category</td>
                    <td className="border p-3 font-semibold">{app.canditate_cast}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold">Sponsored Candidate</td>
                    <td className="border p-3 uppercase">{app.sponsored}</td>
                  </tr>
                  {app.sponsored === "yes" && (
                    <tr>
                      <td className="border p-3 font-semibold">Sponsored Org Name & Address</td>
                      <td className="border p-3">{app.sponsored_name}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Fee details */}
          <div>
            <h3 className="text-sm font-bold text-[#215e87] border-b pb-2 mb-4 uppercase">2. Fee Payment Details</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border p-3 font-semibold w-1/3">Transaction Reference ID</td>
                    <td className="border p-3 font-mono font-semibold">{app.fee_payment_transaction_id}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Date of Payment</td>
                    <td className="border p-3">{paymentDateStr}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Uploaded Documents */}
          <div>
            <h3 className="text-sm font-bold text-[#215e87] border-b pb-2 mb-4 uppercase">3. Attached Documents</h3>
            {docs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.profile_pic && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">1. Photograph</span>
                    <a href={getFileUrl(docs.profile_pic)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.proof_dob && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">2. Date of Birth Proof</span>
                    <a href={getFileUrl(docs.proof_dob)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.proof_address && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">3. Address Proof</span>
                    <a href={getFileUrl(docs.proof_address)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.final_marksheet && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">4. Marksheet (Graduation/Diploma)</span>
                    <a href={getFileUrl(docs.final_marksheet)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.bank_documents && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">5. Fee Payment Documents</span>
                    <a href={getFileUrl(docs.bank_documents)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.cast_certificate && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">6. Caste Certificate</span>
                    <a href={getFileUrl(docs.cast_certificate)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
                {docs.emp_certificate && (
                  <div className="border p-3 rounded flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">7. Employment Certificate</span>
                    <a href={getFileUrl(docs.emp_certificate)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View File
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-100">
                No documents found for this application.
              </div>
            )}
          </div>

          {/* Section 4: Roll Allocation Details (If Approved) */}
          {app.status === 2 && (
            <div>
              <h3 className="text-sm font-bold text-green-700 border-b pb-2 mb-4 uppercase">4. Issued Exam Details</h3>
              <div className="overflow-x-auto border rounded bg-green-50/30 border-green-200">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <tr>
                      <td className="border p-3 font-semibold w-1/3">Assigned Roll Number</td>
                      <td className="border p-3 font-mono font-bold text-green-800">{app.roll_number || "Not generated yet"}</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="border p-3 font-semibold">Assigned Exam Time</td>
                      <td className="border p-3">{app.exam_time || "-"}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Assigned Venue</td>
                      <td className="border p-3">{app.vanue || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {app.roll_number && (
                <div className="mt-4">
                  <Button
                    onClick={handleDownloadAdmit}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2"
                  >
                    View / Download Admit Card
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Review Actions Panel */}
          {app.status === 1 && (
            <div className="bg-gray-50 border p-5 rounded-md flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <span className="font-semibold text-gray-800 block text-sm">Review Application Submission</span>
                <span className="text-xs text-gray-500">Approve to make candidate eligible for roll generation.</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReviewAction(2)}
                  disabled={reviewLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2"
                >
                  Approve Application
                </Button>
                <Button
                  onClick={() => handleReviewAction(3)}
                  disabled={reviewLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2"
                >
                  Reject Application
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliAdminApplicationView;
