
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DoubleVerification = () => {
  const location = useLocation();
  const navigate=useNavigate()
  const data = location.state;
console.log("data",data)
  const tableData = [
    {
      label: "Depositor Email",
      value: data?.depositorEmail,
    },
    {
      label: "Depositor Mobile No.",
      value: data?.depositorMobile,
    },
    {
      label: "Department Reference Number",
      value: data?.deptRefNo,
    },
    {
      label: "Deposit Date",
      value: data?.bankTxnTime,
    },
    {
      label: "Identification Number",
      value: data?.identificationNo,
    },
    {
      label: "Total Amount",
      value: data?.challanAmount,
    },
    {
      label: "Service",
      value: data?.remarks,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div >
        <div className="bg-amber-900 px-6 py-2">
          <h2 className="text-white text-lg font-semibold">Double Verification Details</h2>
        </div>

        <table className="w-full border-collapse">
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-700 w-1/3 bg-gray-50">{item.label}</td>

                <td className="px-6 py-4 text-gray-900">{item.value || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
                  <div className="mt-4 flex gap-4 items-center">
               <button
                 onClick={() => navigate("/epayments-info/verification")}
                 className="text-blue-600 text-sm underline"
              >
               click here re-enter identification number.
             </button>
             </div>
      </div>
    </div>
  );
};

export default DoubleVerification;