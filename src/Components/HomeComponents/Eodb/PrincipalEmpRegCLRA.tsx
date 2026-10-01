import { useRef } from "react";

export default function FeeBreakdown() {
  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">

      {/* PRINT + BACK */}
      <div className="flex justify-end gap-4 text-sm mb-3 no-print">
        <button onClick={handlePrint} className="hover:underline">
          🖨 PRINT
        </button>
        <a href="/eodb-dashboard" className="hover:underline">
          BACK »
        </a>
      </div>

      {/* PRINT AREA */}
      <div ref={printRef} id="print-area">

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-center mb-4">
          Application for Registration of Principal Employer Under Contract Labour (R&A) Act,1970
        </h2>

        {/* FORM */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">

          <div>
            <label className="text-sm">Application no.</label>
            <input
              className="border w-full p-2 text-sm"
              placeholder="Enter Application No"
            />
          </div>

          <div>
            <label className="text-sm">From Date</label>
            <input type="date" className="border w-full p-2 text-sm" />
          </div>

          <div>
            <label className="text-sm">To Date</label>
            <input type="date" className="border w-full p-2 text-sm" />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mb-4 no-print">
          <button className="border px-4 py-2 text-sm">RESET</button>
          <button className="bg-blue-600 text-white px-4 py-2 text-sm">
            SEARCH
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-auto border border-[#bfa58a]">
          <table className="w-full border-collapse text-sm">

            {/* HEADER */}
            <thead>
              <tr className="bg-[#5a2d0c] text-white text-center">
                <th className="border p-2">Sl. No</th>
                <th className="border p-2">Application no.</th>
                <th className="border p-2">Application date</th>
                <th className="border p-2">Approval date</th>
                <th className="border p-2">Fee details</th>
                <th className="border p-2">Total fee charged</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {[
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
                ["CAF260A282556", "2026-04-23", "23-04-2026", "₹1000", "₹1000"],
                ["CAF260A264200", "2026-04-18", "22-04-2026", "₹2000", "₹2000"],
                ["CAF260A261701", "2026-04-16", "23-04-2026", "₹2000", "₹2000"],
                ["CAF260A238047", "2026-04-16", "22-04-2026", "₹5000", "₹5000"],
              ].map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-[#f1ece6]" : "bg-[#e2d8cf]"}
                >
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{row[0]}</td>
                  <td className="border p-2">{row[1]}</td>
                  <td className="border p-2">{row[2]}</td>
                  <td className="border p-2">{row[3]}</td>
                  <td className="border p-2">{row[4]}</td>
                </tr>
              ))}
            </tbody>

            {/* FOOTER */}
            <tfoot>
              <tr className="bg-[#5a2d0c] text-white">
                <td colSpan="5" className="p-2 font-semibold">
                  TOTAL 4022 RECORDS FOUND IN 202 PAGES.
                </td>
                <td className="p-2 text-right">
                  « Previous || Next »
                </td>
              </tr>
            </tfoot>

          </table>
        </div>

      </div>
    </div>
  );
}