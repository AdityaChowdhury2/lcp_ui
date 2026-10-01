import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NewRegistrationISMW: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-sans">

      {/* Page Title */}
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Application for Registration of Establishment Employing Migrant Workmen
        </h1>
      </div>

      {/* Main White Box */}
      <div className="bg-white rounded-md shadow border">

        {/* Blue Section Header */}
        {/* <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md flex justify-between">
          Applying For New Licence
          <button onClick={() => {}}><FaDownload /></button>
        </div> */}

        {/* Content Section */}
        <div className="p-6 rounded-md">

          <label className="block font-semibold text-gray-800 mb-2">
            You will be redirected to Shilpa Sathi Portal (https://silpasathi.wb.gov.in) to avail this service. Click on <button onClick={() => {window.location.href = "https://silpasathi.wb.gov.in"}} className="text-blue-600">CONTINUE</button> to proceed.
          </label>


        </div>
      </div>

    </div>
  );
};

export default NewRegistrationISMW;
