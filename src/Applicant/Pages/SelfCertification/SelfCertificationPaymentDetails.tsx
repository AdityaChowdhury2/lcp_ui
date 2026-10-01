import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "../../../utils/auth";
import { toast } from "react-toastify";

interface PaymentDetails {
  establishmentName: string;
  identificationNo: string;
  bankCode: string;
  bankTransactionTime: string;
  challanId: string;
  bankTransactionStatus: string;
  bankTransactionMessage: string;
  deptRefNo: string;
  transactionId: string;
  bankTransactionId: string;
  challanRefIdDate: string;
  challanAmount: string;
}

const SelfCertificationPaymentDetails: React.FC = () => {
  const { encActId, applicationId } = useParams<{ encActId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (encActId && applicationId) {
      fetchPaymentDetails();
    }
  }, [encActId, applicationId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}payment/details/${encodeURIComponent(encActId ?? "")}/${encodeURIComponent(applicationId ?? "")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch payment details");
      }
      setDetails(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen font-sans bg-[#ecf0f3] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading payment details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow border text-center">
          <p className="text-red-500 mb-4">{error || "Payment details not found."}</p>
          <Button onClick={() => navigate("/self-certification-application/list")} className="bg-[#215e87] hover:bg-[#1b4e70] text-white">
            Back to Application List
          </Button>
        </div>
      </div>
    );
  }

  const isSuccess = details.bankTransactionStatus?.toLowerCase() === "success";

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3]">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          PAYMENT DETAILS - SELF CERTIFICATION
        </h1>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-md shadow border">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          Challan Details
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Establishment Name</p>
              <p className="text-sm font-medium text-gray-900">{details.establishmentName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Identification No</p>
              <p className="text-sm font-medium text-gray-900">{details.identificationNo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">GRN (Challan Ref ID)</p>
              <p className="text-sm font-medium text-gray-900">{details.challanId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</p>
              <p className="text-sm font-medium text-gray-900">{details.transactionId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Challan Date</p>
              <p className="text-sm font-medium text-gray-900">{details.challanRefIdDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Challan Amount</p>
              <p className="text-sm font-bold text-gray-900">₹ {details.challanAmount}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Bank Code</p>
              <p className="text-sm font-medium text-gray-900">{details.bankCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Bank Transaction ID</p>
              <p className="text-sm font-medium text-gray-900">{details.bankTransactionId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Transaction Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${isSuccess ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {details.bankTransactionStatus}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Bank Message</p>
              <p className="text-sm font-medium text-gray-900">{details.bankTransactionMessage}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-end border-t pt-4">
            <Button onClick={() => navigate("/self-certification-application/list")} className="bg-[#215e87] hover:bg-[#1b4e70] text-white">
              Back to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfCertificationPaymentDetails;
