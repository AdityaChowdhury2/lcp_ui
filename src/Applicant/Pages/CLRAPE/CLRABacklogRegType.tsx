import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CLRABacklogRegType: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!selectedOption) {
      setShowError(true);
      return;
    }

    setShowError(false);

    if (selectedOption === "existing") {
      navigate("/clra_backlog");
    }

    if (selectedOption === "new") {
      window.location.href = "https://silpasathi.wb.gov.in";
    }
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-lg font-semibold bg-white p-5 mb-6">
        REGISTRATION OF PRINCIPAL EMPLOYERS UNDER CONTRACT LABOUR (REGULATION & ABOLITION) ACT 1970.
      </h1>

      {showError && (
        <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded mb-6">
          <span className="text-xl font-bold">×</span>
          <span>Choose any option to continue for registration field is required.</span>
        </div>
      )}

      <div className="bg-white rounded shadow">
        <div className="bg-[#2c5f87] text-white px-5 py-3 rounded-t font-semibold">
          NEW REGISTRATION OF PRINCIPAL EMPLOYERS
        </div>

        <div className="p-5">
          <p className="font-semibold mb-3">
            Choose any option to continue for registration <span className="text-red-600">*</span>
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="registrationOption"
                value="existing"
                checked={selectedOption === "existing"}
                onChange={() => setSelectedOption("existing")}
                className="mt-1"
              />
              <span>
                Already have a registration number of the establishment under The Contract Labour (Regulation & Abolition) Act, 1970
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="registrationOption"
                value="new"
                checked={selectedOption === "new"}
                onChange={() => setSelectedOption("new")}
                className="mt-1"
              />
              <span>
                New registration ( You will be redirected to Shilpa Sathi Portal (https://silpasathi.wb.gov.in) to avail this service. Click on <b>CONTINUE</b> to proceed )
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleContinue}
          className="bg-[#2f78b7] text-white px-6 py-2 rounded hover:bg-[#266aa3]"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default CLRABacklogRegType;
