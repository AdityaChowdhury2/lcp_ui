import React, { useRef, useState } from "react";
import { Input } from "../../../Components/ui/input"; // shadcn input
import { Textarea } from "../../../Components/ui/textarea";
import { Button } from "../../../Components/ui/button"; // shadcn button (optional)

const RegisterRecordRepositoryCafLogin: React.FC = () => {
  const [regNumber, setRegNumber] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("No file chosen");

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
          REGISTER RECORD REPOSITORY
        </h1>
      </div>

      {/* Main White Box */}
      <div className="bg-white rounded-md shadow border">
        {/* Blue Section Header */}
        <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md">
          REGISTER RECORD REPOSITORY FORM
        </div>

        {/* Content Section */}
        <div className="p-6">
          <label className="block font-bold text-gray-800 mb-2">
            Title <span className="text-red-600">*</span>
          </label>

          {/* Text Input */}
          <Input
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full border rounded h-12 text-lg px-3 mb-8"
            placeholder=""
          />

          <label className="block font-bold text-gray-800 mb-2">
            Description <span className="text-red-600">*</span>
          </label>

          {/* Text Input */}
          <Textarea
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full border rounded h-12 text-lg px-3 mb-3"
            placeholder=""
          />

          <label className="block font-bold text-gray-800 mb-2">
            File <span className="text-red-600">*</span>
          </label>

          {/* Text Input */}
          <Input
            type="file"
            ref={fileRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file ? file.name : "No file chosen");
            }}
            className="hidden"
          />

          {/* Choose File button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-10 font-500 bg-gray-100 border border-black mr-2"
          >
            Choose File
          </Button>

          {/* Text beside button */}
          <span className="text-sm text-black">{fileName}</span>
          {/* Red Note */}
          {/* <p className="text-red-600 text-sm mt-1">
            Note :- Enter the registration number of the certificate to be amended.
          </p> */}
          <div className="flex items-center">
             <Input
             type="checkbox"
           
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-auto px-3"
            placeholder=""
          />

            <div className="text-[14px] text-[#286090] font-bold tracking-[1px] ml-2">
              <span className="text-red-500">*</span>I hereby declare that the
              particulars given above are true the best of my knowledge and
              belief.
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6 py-2 mt-4 text-md rounded shadow"
          >
            SAVE
          </Button>

          {/* Continue Button */}
          <div className="flex justify-end mt-6"></div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRecordRepositoryCafLogin;
