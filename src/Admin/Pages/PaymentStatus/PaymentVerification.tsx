import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentVerification: React.FC = () => {
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleVerify = async () => {
    setError(null);
      if (!/^\d+$/.test(idNumber)) {
        setError("Identification number must contain only digits.");
        return;
      }

      if (idNumber.length !== 20) {
        setError("Identification number must be exactly 20 digits.");
        return;
      }
    try {
      const response = await axios.get(`${API_BASE}grips/user-verify/${idNumber}`);
      console.log("response", response);
      if (response?.data?.success == false) {
        toast.error(response?.data?.message);
      }
      if (response?.data?.success == true) {
         navigate("/epayments/doubleverification", {
           state: response?.data?.data,
         });
      }
     } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };
  return (
    <div className="min-h-screen p-2">
      <div className="max-w-3xl">
        {/* Title */}
        <h1 className="text-2xl font-normal mb-8">
          Payment status verification
        </h1>

        {/* Label */}
        <label className="block font-semibold text-sm mb-2">
          Enter Identification Number <span className="text-red-600">*</span>
        </label>

        {/* Input */}
        <input
          type="text"
          placeholder="Enter 20 digit identification number"
          value={idNumber}
          maxLength={20}
          onChange={(e) => setIdNumber(e.target.value)}
          className="w-full max-w-2xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-gray-500"
        />

        {/* Sample text */}
        <p className="text-red-500 text-xs mt-2">
          Sample Identification Number: 05000205001212121210
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}

        {/* Button */}
        <button
          type="button"
          onClick={handleVerify}
          className="mt-6 border border-gray-500 px-4 py-1 text-sm hover:bg-gray-200"
        >
          VERIFY
        </button>
      </div>
    </div>
  );
};

export default PaymentVerification;
