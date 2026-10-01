import React from "react";

/* ================= MOCK DATA ================= */
const rows = [

    { name: "ALIPURDUAR", total: 120, citizen: 32, office: 7, final: 0, issued: 78, rejected: 3 },
    { name: "BANKURA", total: 899, citizen: 79, office: 7, final: 0, issued: 798, rejected: 15 },
    { name: "BIRBHUM", total: 550, citizen: 47, office: 6, final: 2, issued: 439, rejected: 55 },
    { name: "COOCHBEHAR", total: 257, citizen: 56, office: 2, final: 0, issued: 187, rejected: 11 },
    { name: "DAKSHIN DINAJPUR", total: 128, citizen: 25, office: 0, final: 0, issued: 94, rejected: 8 },
    { name: "DARJEELING", total: 729, citizen: 122, office: 5, final: 1, issued: 594, rejected: 6 },
    { name: "HOOGHLY", total: 2525, citizen: 266, office: 22, final: 0, issued: 2137, rejected: 99 },
    { name: "HOWRAH", total: 3609, citizen: 352, office: 51, final: 10, issued: 3128, rejected: 67 },
    { name: "JALPAIGURI", total: 513, citizen: 56, office: 4, final: 3, issued: 443, rejected: 7 },
    { name: "JHARGRAM", total: 117, citizen: 24, office: 5, final: 1, issued: 82, rejected: 5 },
    { name: "KALIMPONG", total: 424, citizen: 10, office: 1, final: 0, issued: 413, rejected: 0 },
    { name: "KOLKATA", total: 5968, citizen: 589, office: 13, final: 3, issued: 5283, rejected: 76 },
    { name: "MALDAH", total: 353, citizen: 94, office: 5, final: 4, issued: 218, rejected: 32 },
    { name: "MURSHIDABAD", total: 803, citizen: 157, office: 6, final: 1, issued: 599, rejected: 40 },
    { name: "NADIA", total: 1401, citizen: 181, office: 2, final: 5, issued: 1146, rejected: 67 },
    { name: "NORTH 24 PARGANAS", total: 7057, citizen: 579, office: 22, final: 11, issued: 6366, rejected: 78 },
    { name: "PASCHIM BARDHAMAN", total: 1912, citizen: 114, office: 7, final: 2, issued: 1766, rejected: 22 },
    { name: "PASCHIM MEDINIPUR", total: 1821, citizen: 139, office: 4, final: 0, issued: 1598, rejected: 80 },
    { name: "PURBA BARDHAMAN", total: 951, citizen: 126, office: 3, final: 3, issued: 792, rejected: 27 },
    { name: "PURBA MEDINIPUR", total: 2309, citizen: 125, office: 9, final: 0, issued: 2085, rejected: 90 },
    { name: "PURULIA", total: 447, citizen: 38, office: 0, final: 1, issued: 387, rejected: 20 },
    { name: "SOUTH 24 PARGANAS", total: 2562, citizen: 337, office: 22, final: 14, issued: 2141, rejected: 46 },
    { name: "UTTAR DINAJPUR", total: 161, citizen: 38, office: 4, final: 0, issued: 108, rejected: 11 },

    // 👉 add rest later or from API
];

const handlePrint = () => {
  const printContents = document.getElementById("print-area").innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;

  window.location.reload(); // restore React state
};

/* ================= TOTAL CALC ================= */
const getTotals = (data) => {
    return data.reduce(
        (acc, row) => {
            acc.total += row.total;
            acc.citizen += row.citizen;
            acc.office += row.office;
            acc.final += row.final;
            acc.issued += row.issued;
            acc.rejected += row.rejected;
            return acc;
        },
        { total: 0, citizen: 0, office: 0, final: 0, issued: 0, rejected: 0 }
    );
};

export default function DistrictReport() {
    const totals = getTotals(rows);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 print-area" id="print-area" >

            {/* TITLE */}
            <h1 className="text-xl md:text-2xl italic text-gray-700 mb-4">
                District wise application status for registration and amendment of
                principal employer under CLRA
            </h1>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 text-sm mb-2">
                <button onClick={handlePrint}>
                    🖨 PRINT
                </button>

                <a href="/report-eodb" className="hover:underline">
                    BACK »
                </a>
            </div>

            {/* TABLE CONTAINER */}
            <div className="overflow-auto border border-[#bfa58a]">

                <table className="w-full border-collapse text-sm">

                    {/* HEADER */}
                    <thead>
                        <tr className="bg-[#5a2d0c] text-white text-center">
                            <th className="p-2 border">DISTRICT NAME</th>
                            <th className="p-2 border">TOTAL<br />APPLICATION SUBMIT</th>
                            <th className="p-2 border">PENDING<br />IN CITIZEN</th>
                            <th className="p-2 border">PENDING<br />IN OFFICE</th>
                            <th className="p-2 border">FINAL SUBMIT<br />AFTER PAYMENT</th>
                            <th className="p-2 border">ISSUED</th>
                            <th className="p-2 border">REJECTED</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className={`text-center ${i % 2 === 0 ? "bg-[#f1ece6]" : "bg-[#e2d8cf]"
                                    } hover:bg-[#d6a77d]`}
                            >
                                <td className="p-2 border text-left font-semibold text-[#5a2d0c]">
                                    {row.name}
                                </td>
                                <td className="border">{row.total}</td>
                                <td className="border">{row.citizen}</td>
                                <td className="border">{row.office}</td>
                                <td className="border">{row.final}</td>
                                <td className="border">{row.issued}</td>
                                <td className="border">{row.rejected}</td>
                            </tr>
                        ))}
                    </tbody>

                    {/* FOOTER */}
                    <tfoot>
                        <tr className="bg-[#5a2d0c] text-white font-bold text-center">
                            <td className="p-2 border text-left">TOTAL</td>
                            <td className="border">{totals.total}</td>
                            <td className="border">{totals.citizen}</td>
                            <td className="border">{totals.office}</td>
                            <td className="border">{totals.final}</td>
                            <td className="border">{totals.issued}</td>
                            <td className="border">{totals.rejected}</td>
                        </tr>
                    </tfoot>

                </table>
            </div>

            {/* BOTTOM BACK */}
            <div className="mt-3 text-right text-sm">
                <a href="/report-eodb" className="hover:underline">
                    BACK »
                </a>
            </div>
        </div>
    );
}