import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SILPASATHI_URL = "https://silpasathi.wb.gov.in";

const ApplyNewLicense: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-sans">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          APPLICATION FOR LICENSE UNDER CONTRACT LABOUR (REGULATION &amp; ABOLITION) ACT, 1970
        </h1>
        <p className="text-sm text-gray-600">
          New contractor licence applications are submitted on the state e‑services portal (Shilpa
          Sathi).
        </p>
      </div>

      <div className="bg-white rounded-md shadow border">
        <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md">
          Applying for new licence
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-800 leading-relaxed">
            You will leave this portal and open{" "}
            <span className="font-semibold text-[#215e87]">Shilpa Sathi</span> (
            <a
              href={SILPASATHI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {SILPASATHI_URL}
            </a>
            ) to complete registration and application steps there.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = SILPASATHI_URL;
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#52C7EA] hover:bg-[#2bb8df] text-white font-semibold shadow-sm"
            >
              Continue to Shilpa Sathi
              <FaExternalLinkAlt className="text-sm opacity-90" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => navigate("/license-renewal-amendment-list")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium"
            >
              View my licence / renewal / amendment list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyNewLicense;
