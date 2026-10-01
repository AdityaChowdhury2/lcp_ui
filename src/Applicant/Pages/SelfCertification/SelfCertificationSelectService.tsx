import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

const SelfCertificationSelectService: React.FC = () => {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [regNo, setRegNo] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      toast.error("Please select a service.");
      return;
    }
    if (!regNo) {
      toast.error("Please enter the Registration Number.");
      return;
    }

    setSearching(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}self-cert/parti-est-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actId: Number(service),
          regNo: regNo,
        }),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Registration/License details not found.");
      }

      sessionStorage.setItem("selfCertSearchDetails", JSON.stringify(res));
      toast.success("Registration details found successfully!");
      // Proceed to the particulars page
      navigate("/self-certification-application/particulars");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to search registration details.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      {/* Page Title */}
      <div className="bg-white p-4 mb-4 rounded-md shadow border">
        <h1 className="text-2xl font-semibold text-gray-900">
          APPLY FOR SELF CERTIFICATION SCHEME, 2016
        </h1>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-md shadow border max-w-lg mx-auto">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          Select Service & Registration
        </div>

        <form onSubmit={handleSearch} className="p-6 space-y-6">
          {/* Service Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Service <span className="text-red-500">*</span>
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">-- Select Service --</option>
              <option value="1">CLRA(PE)</option>
              <option value="12">Contract License</option>
              <option value="2">BOCWA</option>
              <option value="3">MTW</option>
              <option value="4">ISMW</option>
            </select>
          </div>

          {/* Registration Number (Conditional Field) */}
          {service && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Registration Number / License Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Registration Number"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
                className="w-full"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={searching}
              className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6"
            >
              {searching ? "Searching..." : "Search"}
            </Button>
            <Link to="/self-certification-application/list">
              <Button
                type="button"
                variant="outline"
                className="px-6 border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfCertificationSelectService;
