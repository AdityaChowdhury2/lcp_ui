import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/auth";
import { API_BASE } from "@/constants/constants";

const OfficeAddressUpdate: FC = () => {
  const navigate = useNavigate();
  const token = getAuthToken();

  const [officeName, setOfficeName] = useState("");
  const [officeMobileNumber, setOfficeMobileNumber] = useState("");
  const [officeEmailAddress, setOfficeEmailAddress] = useState("");
  const [certificateAddress, setCertificateAddress] = useState("");
  const [aboutOffice, setAboutOffice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAlcRloDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get<any>(
          `${API_BASE}dashboard/rlo-details`,
        );
        const data = response.data;
        if (data?.code === 200) {
          const result = data?.result;
          setOfficeName(result.office_name || "");
          setOfficeMobileNumber(result.office_number || "");
          setOfficeEmailAddress(result.office_email_address || "");
          setCertificateAddress(result.certificate_address || "");
          setAboutOffice(result.about_office || "");
        }
      } catch (error) {
        console.error("Fetch ALC RLO details API error:", error);
        toast.error("Failed to load office details.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAlcRloDetails();
    }
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeName || !officeEmailAddress || !certificateAddress || !aboutOffice) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${API_BASE}dashboard/office-details`,
        {
          officeName,
          officeMobileNumber,
          officeEmailAddress,
          certificateAddress,
          aboutOffice,
        },
      );

      if (response.status === 200 || response.data?.code === 200) {
        toast.success("Office details updated successfully");
        navigate("/dashboard");
      } else {
        toast.error("Failed to update office details");
      }
    } catch (error: any) {
      console.error("Error updating office details:", error);
      toast.error(error.response?.data?.message || "Failed to update office details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading office address update page...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ecf0f3] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 uppercase tracking-wide">
          OFFICE ADDRESS UPDATE
        </h1>

        <div className="bg-white border-t-[3px] border-[#3c8dbc] rounded shadow-md p-6 max-w-5xl">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Office Name */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Office Name <span className="text-red-500">*</span>
              </label>
              <select
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- Select Office Name --</option>
                <option value="OFFICE OF THE LABOUR COMMISSIONER">OFFICE OF THE LABOUR COMMISSIONER</option>
                <option value="OFFICE OF THE JOINT LABOUR COMMISSIONER">OFFICE OF THE JOINT LABOUR COMMISSIONER</option>
                <option value="OFFICE OF THE DEPUTY LABOUR COMMISSIONER">OFFICE OF THE DEPUTY LABOUR COMMISSIONER</option>
                <option value="OFFICE OF THE LABOUR COMMISSIONER EL & MW SECTION">OFFICE OF THE LABOUR COMMISSIONER EL & MW SECTION</option>
                <option value="OFFICE OF THE ASSISTANT LABOUR COMMISSIONER">OFFICE OF THE ASSISTANT LABOUR COMMISSIONER</option>
                <option value="LABOUR WELFARE FACILITATION CENTRE">LABOUR WELFARE FACILITATION CENTRE</option>
              </select>
            </div>

            {/* Office Phone Number */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 items-center">
                Enter Office Phone Number 
                <span className="ml-1 text-orange-500 cursor-pointer text-xs">📝</span>
              </label>
              <input
                type="text"
                value={officeMobileNumber}
                onChange={(e) => setOfficeMobileNumber(e.target.value)}
                placeholder="Enter office phone number"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#f4f4f4]"
              />
            </div>

            {/* Office Email Address */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Enter Office email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={officeEmailAddress}
                onChange={(e) => setOfficeEmailAddress(e.target.value)}
                placeholder="Enter office email address"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* Office Address */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Enter Office address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={certificateAddress}
                onChange={(e) => setCertificateAddress(e.target.value)}
                placeholder="Enter office address"
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* About Office */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                About Office <span className="text-red-500">*</span>
              </label>
              <textarea
                value={aboutOffice}
                onChange={(e) => setAboutOffice(e.target.value)}
                placeholder="Enter details about office"
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-semibold px-6 py-2.5 rounded text-sm disabled:opacity-50 transition"
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficeAddressUpdate;
