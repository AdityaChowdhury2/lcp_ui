import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import DataTable, { type TableColumn } from "react-data-table-component";
import { PiCheckFatFill } from "react-icons/pi";
import { API_BASE } from "@/constants/constants";

type PaymentData = {
  departmentRefNo: string;
  transactionId: string;
  bankTransactionId: string;
  bankCode: string;
  bankTransactionDate: string;
  challanTotalAmt: string;
  challanRefId: string;
  challanRefDate: string;
  bankTransactionStatus: string;
  bankTransactionMsg: string;
};

type RowType = {
  label: string;
  value: string;
};

const VerificationStatusAfterPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  const id = searchParams.get("id");

  const [rows, setRows] = useState<RowType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const demoSucess: string = "Your payment verification status successful. Please wait maximum 3 hours for effect your application";

//   const [loading, setLoading] = useState(false);

  const columns: TableColumn<RowType>[] = useMemo(
    () => [
      {
        // name: "",
        selector: (row) => row.label,
        cell: (row) => (
          <div className="font-medium px-3 py-2">{row.label}</div>
        ),
        width: "320px",
      },
      {
        // name: "",
        selector: (row) => row.value,
        cell: (row) => (
          <div className="px-3 py-2">{row.value}</div>
        ),
        grow: 2,
      },
    ],
    []
  );

  const demoData = [
    {
        label: "Department Reference Number",
        value: "0502025175801816",
    },
    {
        label: "Transaction ID",
        value: "05000205002175801816",
    },
    {
        label: "Bank Transaction ID",
        value: "IK0DKDOWU6",
    },
    {
        label: "Bank Code",
        value: "SBIN0000001",
    },
    {
        label: "Bank Transaction Date",
        value: "16/09/2025 15:54:11",
    },
    {
        label: "Challan Total Amount",
        value: "156",
    },
    {
        label: "Challan Reference ID",
        value: "192025260272715565",
    },
    {
        label: "Challan Reference Date",
        value: "16/09/2025 15:53:04",
    },
    {
        label: "Bank Transaction Status",
        value: "Success",
    },
    {
        label: "Bank Transaction Message",
        value: "Transaction Successful",
    },
  ]

  useEffect(() => {
    if (!id) {
      setError("Invalid or missing identification number.");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}epayments/doubleverification`, {
          params: { id },
        });

        const d = res.data;   // res.data -> API Response, demoData -> Demo Data
        // const d = demoData;

        if (!d || Object.keys(d).length === 0) {
          setError("No payment record found.");
          return;
        }

        const mappedRows: RowType[] = [
            { label: "Department Reference Number:", value: d.departmentRefNo },   // d.departmentRefNo for API Response
            { label: "Transaction ID:", value: d.transactionId },
            { label: "Bank Transaction ID:", value: d.bankTransactionId },
            { label: "Bank Code:", value: d.bankCode },
            { label: "Bank Transaction Date:", value: d.bankTransactionDate },
            { label: "Challan Total Amount:", value: d.challanTotalAmt },
            { label: "Challan Reference ID:", value: d.challanRefId },
            { label: "Challan Reference Date:", value: d.challanRefDate },
            { label: "Bank Transaction Status:", value: d.bankTransactionStatus },
            { label: "Bank Transaction Message:", value: d.bankTransactionMsg },
        ];

        setRows(mappedRows);  
        setSuccess("Your payment verification status successful. Please wait maximum 3 hours for effect your application.");

      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Invalid identification number or no record found."
        );
      }
    };

    fetchData();
  }, [id, API_BASE]);


  return (
    <div className="min-h-screen p-2">
      <div className="max-w-5xl">

        <h1 className="text-2xl font-normal mb-6">
          Payment verification status
        </h1>

        {/* Loading
        {loading && (
          <p className="text-gray-600 text-sm">Loading...</p>
        )} */}

        {/* Error UI */}
        {/* {success && (  */}
          <div className="bg-green-700 p-2 rounded text-white text-md font-bold mb-4 flex gap-2">
            <PiCheckFatFill /> {demoSucess}
          </div>
        {/* )} */}

        {/* Data Table UI */}
        {/* {!error && rows.length > 0 && ( */}
          <>
            <div className="bg-white border border-gray-300 p-2">
              <DataTable
                columns={columns}
                data={demoData}
                noHeader
                striped
                customStyles={{
                  table: {
                    style: {
                      borderCollapse: "collapse",
                    },
                  },
                  head: {
                    style: {
                      display: "none",  // hide original header row
                    },
                  },
                  cells: {
                    style: {
                      borderBottom: "1px solid #ddd",
                      borderRight: "1px solid #ddd",
                    },
                  },
                  rows: {
                    style: {
                      minHeight: "40px",
                    },
                  },
                }}
              />
            </div>
          </>
        {/* )} */}
      </div>
    </div>
  );
};

export default VerificationStatusAfterPayment;
