import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import React, { useEffect, useState } from "react";
import { FaPlus, FaPrint, FaTrash, FaEye, FaTimes } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface MemberRow {
  id: number;
  slNo: number;
  name: string;
  occupation: string;
  address: string;
}

interface OfficerRow {
  id: number;
  slNo: number;
  name: string;
  age: number;
  occupation: string;
  address?: string;
}

interface BRegisterData {
  id: number;
  registrationNo: number;
  eTradeUnionName: string;
  eTradeUnionAddress: string;
  districtName: string;
  pin: string;
  unionType: string;
  members: MemberRow[];
  officers: OfficerRow[];
}

const TradeUnionBRegister: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = getAuthToken() ?? "";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<BRegisterData | null>(null);

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({ name: "", occupation: "", address: "" });
  const [submittingMember, setSubmittingMember] = useState<boolean>(false);

  const [showOfficerModal, setShowOfficerModal] = useState<boolean>(false);
  const [officerForm, setOfficerForm] = useState({ name: "", age: "", occupation: "", address: "" });
  const [submittingOfficer, setSubmittingOfficer] = useState<boolean>(false);

  const [selectedOfficer, setSelectedOfficer] = useState<OfficerRow | null>(null);

  const loadData = async () => {
    if (!id) {
      setError("Invalid trade union ID.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}trade-union/b-register/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load Register-B details.");
      }
      setData(payload?.result ?? null);
    } catch (err: any) {
      setError(err?.message || "Failed to load Register-B details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, token]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      toast.error("Please enter member name.");
      return;
    }
    try {
      setSubmittingMember(true);
      const res = await fetch(`${API_BASE}trade-union/b-register/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(memberForm),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to add member.");
      }
      toast.success("Member added successfully.");
      setShowMemberModal(false);
      setMemberForm({ name: "", occupation: "", address: "" });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add member.");
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`${API_BASE}trade-union/b-register/${id}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete member.");
      toast.success("Member removed.");
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete member.");
    }
  };

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerForm.name.trim()) {
      toast.error("Please enter officer name.");
      return;
    }
    try {
      setSubmittingOfficer(true);
      const res = await fetch(`${API_BASE}trade-union/b-register/${id}/officers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: officerForm.name,
          age: Number(officerForm.age) || 0,
          occupation: officerForm.occupation,
          address: officerForm.address,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to add officer.");
      }
      toast.success("Officer added successfully.");
      setShowOfficerModal(false);
      setOfficerForm({ name: "", age: "", occupation: "", address: "" });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add officer.");
    } finally {
      setSubmittingOfficer(false);
    }
  };

  const handleDeleteOfficer = async (officerId: number) => {
    if (!window.confirm("Are you sure you want to remove this officer?")) return;
    try {
      const res = await fetch(`${API_BASE}trade-union/b-register/${id}/officers/${officerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete officer.");
      toast.success("Officer removed.");
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete officer.");
    }
  };

  const handlePrintPdf = () => {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const membersHtml =
      data.members.length > 0
        ? data.members
            .map(
              (m) => `
          <tr>
            <td style="border:1px solid #d2d6de; padding:6px 10px; text-align:center;">${m.slNo}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${m.name}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${m.occupation || "-"}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${m.address || "-"}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="4" style="border:1px solid #d2d6de; padding:8px; text-align:center; color:#777;">No members recorded</td></tr>`;

    const officersHtml =
      data.officers.length > 0
        ? data.officers
            .map(
              (o) => `
          <tr>
            <td style="border:1px solid #d2d6de; padding:6px 10px; text-align:center;">${o.slNo}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${o.name}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px; text-align:center;">${o.age || "-"}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${o.occupation || "-"}</td>
            <td style="border:1px solid #d2d6de; padding:6px 10px;">${o.address || "-"}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="5" style="border:1px solid #d2d6de; padding:8px; text-align:center; color:#777;">No officers recorded</td></tr>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trade Union Register B - ${data.registrationNo}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Source Sans Pro', Arial, sans-serif; color: #222; margin: 0; padding: 0; }
            .header-container { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3c8dbc; margin-bottom: 15px; }
            .title { font-size: 20px; font-weight: bold; color: #1a365d; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 14px; color: #4a5568; margin-top: 4px; }
            .section-title { font-size: 14px; font-weight: bold; color: #3c8dbc; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #3c8dbc; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
            th, td { border: 1px solid #d2d6de; padding: 8px 10px; text-align: left; }
            th { background-color: #3c8dbc; color: #fff; font-weight: bold; }
            .param-th { background-color: #3c8dbc; color: #fff; width: 35%; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="title">Labour Commissionerate</div>
            <div class="subtitle">Government of West Bengal — Trade Union Register B</div>
          </div>
          
          <div class="section-title">TRADE UNION DETAILS</div>
          <table>
            <thead>
              <tr><th class="param-th">PARAMETERS</th><th>INPUTS</th></tr>
            </thead>
            <tbody>
              <tr><td>Registration Number</td><td><strong>${data.registrationNo}</strong></td></tr>
              <tr><td>Name</td><td>${data.eTradeUnionName}</td></tr>
              <tr><td>Address</td><td>${data.eTradeUnionAddress}</td></tr>
              <tr><td>District Name</td><td>${data.districtName || "-"}</td></tr>
              <tr><td>Pin Number</td><td>${data.pin || "-"}</td></tr>
            </tbody>
          </table>

          <div class="section-title">LIST OF MEMBERS APPLYING FOR REGISTRATION</div>
          <table>
            <thead>
              <tr><th style="width:60px;">SL.NO.</th><th>NAME</th><th>OCCUPATION</th><th>ADDRESS</th></tr>
            </thead>
            <tbody>${membersHtml}</tbody>
          </table>

          <div class="section-title">LIST OF OFFICERS</div>
          <table>
            <thead>
              <tr><th style="width:60px;">SL.NO.</th><th>NAME</th><th style="width:60px;">AGE</th><th>OCCUPATION</th><th>ADDRESS</th></tr>
            </thead>
            <tbody>${officersHtml}</tbody>
          </table>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading Register B details...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 text-sm">
          {error || "Trade union data not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Source_Sans_Pro',sans-serif] bg-[#f9fafb] p-4">
      {/* Title */}
      <h1 className="max-w-6xl mx-auto mt-2 mb-3 text-[22px] font-semibold opacity-90 text-gray-800">
        {data.eTradeUnionName}[{data.registrationNo}]
      </h1>

      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-5 text-sm font-medium">
          <Link
            to={`/trade-union-master-list/view-trade-union/${data.id}`}
            className="pb-2.5 text-[#f39c12] hover:text-[#d3820d] transition-colors"
          >
            Trade Union Details
          </Link>
          <span className="pb-2.5 text-[#3c8dbc] border-b-2 border-[#3c8dbc] font-semibold">
            View &amp; Generate Register
          </span>
          <Link
            to={`/trade-union/register-b-upload/${data.id}`}
            className="pb-2.5 text-[#f39c12] hover:text-[#d3820d] transition-colors"
          >
            Upload Register
          </Link>
        </div>

        {/* Card 1: Parameters */}
        <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-6 shadow-sm">
          <div className="p-4 overflow-x-auto">
            <table className="w-full table-auto border border-[#d2d6de] text-sm">
              <thead>
                <tr className="bg-[#3c8dbc] text-white">
                  <th className="border border-[#3c8dbc] p-2.5 text-left font-semibold w-[35%]">
                    PARAMETERS
                  </th>
                  <th className="border border-[#3c8dbc] p-2.5 text-left font-semibold flex items-center justify-between">
                    <span>INPUTS</span>
                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      title="Print Register B"
                      className="text-white hover:text-gray-200 p-1 cursor-pointer transition"
                    >
                      <FaPrint className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#d2d6de]">
                  <td className="p-2.5 border-r border-[#d2d6de] bg-[#fcfcfc] font-medium text-gray-700">
                    Registration Number
                  </td>
                  <td className="p-2.5 text-gray-800 font-semibold">{data.registrationNo}</td>
                </tr>
                <tr className="border-b border-[#d2d6de]">
                  <td className="p-2.5 border-r border-[#d2d6de] bg-[#fcfcfc] font-medium text-gray-700">
                    Name
                  </td>
                  <td className="p-2.5 text-gray-800">{data.eTradeUnionName}</td>
                </tr>
                <tr className="border-b border-[#d2d6de]">
                  <td className="p-2.5 border-r border-[#d2d6de] bg-[#fcfcfc] font-medium text-gray-700">
                    Address
                  </td>
                  <td className="p-2.5 text-gray-800">{data.eTradeUnionAddress}</td>
                </tr>
                <tr className="border-b border-[#d2d6de]">
                  <td className="p-2.5 border-r border-[#d2d6de] bg-[#fcfcfc] font-medium text-gray-700">
                    District Name
                  </td>
                  <td className="p-2.5 text-gray-800">{data.districtName || "-"}</td>
                </tr>
                <tr className="bg-[#fcf8e3] border-b border-[#d2d6de]">
                  <td className="p-2.5 border-r border-[#d2d6de] font-medium text-gray-700">
                    Pin Number
                  </td>
                  <td className="p-2.5 text-gray-800 font-semibold">{data.pin || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: List of Members */}
        <div className="mb-6">
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowMemberModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#357ca5] text-white text-xs font-semibold rounded-[3px] shadow-sm transition cursor-pointer"
            >
              <FaPlus className="w-3 h-3" /> Add Members
            </button>
          </div>

          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] shadow-sm">
            <div className="p-3">
              <div className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>📄</span> List of members applying for registration
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#3c8dbc] text-white">
                      <th className="p-2 border border-[#3c8dbc] text-center w-16">SL.NO.</th>
                      <th className="p-2 border border-[#3c8dbc] text-left">NAME</th>
                      <th className="p-2 border border-[#3c8dbc] text-left">OCCUPATION</th>
                      <th className="p-2 border border-[#3c8dbc] text-left">ADDRESS</th>
                      <th className="p-2 border border-[#3c8dbc] text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 border border-gray-200 text-center text-gray-500 bg-gray-50">
                          No data found!
                        </td>
                      </tr>
                    ) : (
                      data.members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 border border-gray-200 text-center font-medium">{member.slNo}</td>
                          <td className="p-2 border border-gray-200">{member.name}</td>
                          <td className="p-2 border border-gray-200">{member.occupation || "-"}</td>
                          <td className="p-2 border border-gray-200">{member.address || "-"}</td>
                          <td className="p-2 border border-gray-200 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition cursor-pointer"
                              title="Delete Member"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: List of Officers */}
        <div className="mb-6">
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowOfficerModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#357ca5] text-white text-xs font-semibold rounded-[3px] shadow-sm transition cursor-pointer"
            >
              <FaPlus className="w-3 h-3" /> Add Officers
            </button>
          </div>

          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] shadow-sm">
            <div className="p-3">
              <div className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>📄</span> List of Officers
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#3c8dbc] text-white">
                      <th className="p-2 border border-[#3c8dbc] text-center w-16">SL.NO.</th>
                      <th className="p-2 border border-[#3c8dbc] text-left">NAME</th>
                      <th className="p-2 border border-[#3c8dbc] text-center w-16">AGE</th>
                      <th className="p-2 border border-[#3c8dbc] text-left">OCCUPATION</th>
                      <th className="p-2 border border-[#3c8dbc] text-center w-24">ACTION</th>
                      <th className="p-2 border border-[#3c8dbc] text-center w-20">VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.officers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 border border-gray-200 text-center text-gray-500 bg-gray-50">
                          No data found!
                        </td>
                      </tr>
                    ) : (
                      data.officers.map((officer) => (
                        <tr key={officer.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 border border-gray-200 text-center font-medium">{officer.slNo}</td>
                          <td className="p-2 border border-gray-200">{officer.name}</td>
                          <td className="p-2 border border-gray-200 text-center">{officer.age || "-"}</td>
                          <td className="p-2 border border-gray-200">{officer.occupation || "-"}</td>
                          <td className="p-2 border border-gray-200 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteOfficer(officer.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition cursor-pointer"
                              title="Delete Officer"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="p-2 border border-gray-200 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedOfficer(officer)}
                              className="p-1 text-[#3c8dbc] hover:text-[#357ca5] transition cursor-pointer"
                              title="View Officer Details"
                            >
                              <FaEye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full overflow-hidden">
            <div className="bg-[#3c8dbc] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Add Member Applying for Registration</h3>
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="text-white hover:opacity-80 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Occupation</label>
                <input
                  type="text"
                  value={memberForm.occupation}
                  onChange={(e) => setMemberForm({ ...memberForm, occupation: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                  placeholder="Enter occupation"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Address</label>
                <textarea
                  rows={2}
                  value={memberForm.address}
                  onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                  placeholder="Enter full address"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMember}
                  className="px-4 py-1.5 bg-[#3c8dbc] hover:bg-[#357ca5] text-white font-medium rounded transition cursor-pointer disabled:opacity-50"
                >
                  {submittingMember ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Officer Modal */}
      {showOfficerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full overflow-hidden">
            <div className="bg-[#3c8dbc] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Add Officer</h3>
              <button
                type="button"
                onClick={() => setShowOfficerModal(false)}
                className="text-white hover:opacity-80 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddOfficer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Officer Name *</label>
                <input
                  type="text"
                  required
                  value={officerForm.name}
                  onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                  placeholder="Enter officer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Age</label>
                  <input
                    type="number"
                    min={18}
                    value={officerForm.age}
                    onChange={(e) => setOfficerForm({ ...officerForm, age: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                    placeholder="e.g. 35"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    value={officerForm.occupation}
                    onChange={(e) => setOfficerForm({ ...officerForm, occupation: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Address</label>
                <textarea
                  rows={2}
                  value={officerForm.address}
                  onChange={(e) => setOfficerForm({ ...officerForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3c8dbc]"
                  placeholder="Enter address"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOfficer}
                  className="px-4 py-1.5 bg-[#3c8dbc] hover:bg-[#357ca5] text-white font-medium rounded transition cursor-pointer disabled:opacity-50"
                >
                  {submittingOfficer ? "Saving..." : "Save Officer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Officer Modal */}
      {selectedOfficer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full overflow-hidden">
            <div className="bg-[#3c8dbc] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Officer Details</h3>
              <button
                type="button"
                onClick={() => setSelectedOfficer(null)}
                className="text-white hover:opacity-80 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block font-medium">SL. NO.</span>
                <span className="text-gray-800 font-semibold">{selectedOfficer.slNo}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Name:</span>
                <span className="text-gray-800 font-medium">{selectedOfficer.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Age:</span>
                <span className="text-gray-800">{selectedOfficer.age || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Occupation:</span>
                <span className="text-gray-800">{selectedOfficer.occupation || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Address:</span>
                <span className="text-gray-800">{selectedOfficer.address || "-"}</span>
              </div>
              <div className="pt-3 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedOfficer(null)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeUnionBRegister;
