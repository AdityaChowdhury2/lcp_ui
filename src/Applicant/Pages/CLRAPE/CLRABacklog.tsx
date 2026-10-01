import React, { useState } from "react";
import { Input } from "../../../Components/ui/input"; // shadcn input
import { Button } from "../../../Components/ui/button"; // shadcn button (optional)
import { useNavigate } from "react-router-dom";

const CLRABacklog: React.FC = () => {
  const [regNumber, setRegNumber] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!regNumber.trim()) {
      alert("Please enter the registration number.");
      return;
    }

    console.log("CLRA Registration Number:", regNumber);
  };

  return (
    <div className="w-full min-h-screen font-sans">

      {/* Page Title */}
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Enter your previous registration number
        </h1>
      </div>

      {/* Main White Box */}
      <div className="bg-white rounded-md shadow border">

        {/* Blue Section Header */}
        <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md">
          Offline / manual registration number
        </div>

        {/* Content Section */}
        <div className="p-6">

          <label className="block font-semibold text-gray-800 mb-2">
            Enter offline / manual registration number: <span className="text-red-600">*</span>
          </label>

          {/* Text Input */}
          <Input
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full border rounded h-12 text-lg px-3"
            placeholder=""
          />

          {/* Red Note */}
          <p className="text-red-600 text-sm mt-1">
            Note :- If you already have an Offline Registration Number Under Contract Labour (Regulation & Abolition) Act 1970, provide the Offline Registration Number and get a System Generated Registration Number.
          </p>

          {/* Continue Button */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={() => navigate("/clra_backlog/clra_registration_type")}
              className="border-[#1e73be] bg-white hover:bg-gray-300 text-[#1e73be] px-6 py-2 text-md rounded shadow"
            >
              {"<< Back"}
            </Button>

            <Button
              onClick={handleContinue}
              className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6 py-2 text-md rounded shadow"
            >
              CONTINUE
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CLRABacklog;
