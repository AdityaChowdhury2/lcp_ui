import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { Button } from "@/Components/ui/button";

interface DashboardMetrics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  hrdCount: number;
  adcsCount: number;
  sponsoredCount: number;
  nonSponsoredCount: number;
}

const SliAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/admin/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      {/* Page Title */}
      <div className="bg-white p-4 mb-6 rounded-md border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          State Labour Institute (SLI) Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review student admissions, roll numbers, and course configurations.
        </p>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading metrics...</div>}
      {error && <div className="text-center py-6 text-red-500">{error}</div>}

      {!loading && !error && metrics && (
        <div className="space-y-6">
          {/* Main counts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 border rounded-md shadow-sm border-l-4 border-l-[#215e87]">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Received</span>
              <span className="text-3xl font-bold text-gray-900 block mt-1">{metrics.totalCount}</span>
            </div>

            <div className="bg-white p-5 border rounded-md shadow-sm border-l-4 border-l-yellow-500">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Review</span>
              <span className="text-3xl font-bold text-gray-900 block mt-1">{metrics.pendingCount}</span>
            </div>

            <div className="bg-white p-5 border rounded-md shadow-sm border-l-4 border-l-green-500">
              <span className="text-xs font-semibold text-gray-500 uppercase">Approved</span>
              <span className="text-3xl font-bold text-gray-900 block mt-1">{metrics.approvedCount}</span>
            </div>

            <div className="bg-white p-5 border rounded-md shadow-sm border-l-4 border-l-red-500">
              <span className="text-xs font-semibold text-gray-500 uppercase">Rejected</span>
              <span className="text-3xl font-bold text-gray-900 block mt-1">{metrics.rejectedCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course-wise splits */}
            <div className="bg-white rounded-md border shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">
                Course Wise Applications
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-600">Post Graduate Diploma (PGDHRD&LW)</span>
                  <span className="font-semibold text-gray-900">{metrics.hrdCount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-sm font-medium text-gray-600">Advanced Diploma (ADCS)</span>
                  <span className="font-semibold text-gray-900">{metrics.adcsCount}</span>
                </div>
              </div>
            </div>

            {/* Candidate Types splits */}
            <div className="bg-white rounded-md border shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">
                Candidate Sponsorship Status
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-600">Sponsored Candidates</span>
                  <span className="font-semibold text-gray-900">{metrics.sponsoredCount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-sm font-medium text-gray-600">Non-Sponsored (General) Candidates</span>
                  <span className="font-semibold text-gray-900">{metrics.nonSponsoredCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-md border shadow-sm p-6 text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Administration Actions</h3>
            <p className="text-gray-500 text-sm mb-4">
              Access the applications list to approve/reject, generate exam rolls, and export xls reports.
            </p>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <Button
                onClick={() => navigate("/sli-admin/applications")}
                className="bg-[#215e87] hover:bg-[#1a4b6c] text-white px-5 py-2.5 rounded shadow-sm text-sm"
              >
                Go to Applications list
              </Button>
              <Button
                onClick={() => navigate("/sli-admin/applications?status=1")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded shadow-sm text-sm"
              >
                Review Pending Applications
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SliAdminDashboard;
