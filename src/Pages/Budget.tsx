import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
interface BudgetRow {
  head: string;
  scheme?: string;
  budget?: string;
  rowSpan?: number;
}

const budget2017_18: BudgetRow[] = [
  {
    head: "2230-01-001-SP-001-V-13-04",
    scheme: "Strengthening of enforcement machinery or the Labour Directorate",
    budget: "15,000,000",
  },

  {
    head: "2230-01-001-SP-002-V-13-03",
    scheme: "Strengthening of Training Institute-cum-Central Library",
    budget: "300,000",
    rowSpan: 2,
  },
  {
    head: "2230-01-001-SP-002-V-13-04",
    budget: "4,700,000",
  },

  {
    head: "2230-01-004-SP-001-V-13-04",
    scheme: "Improvement of Labour Statistics",
    budget: "1,00,000",
  },

  {
    head: "2230-01-101-SP-003-V-33-05",
    scheme: "Bidi Workers Welfare Scheme",
    rowSpan: 3,
  },
  {
    head: "2230-01-101-SP-003-V-50",
  },
  {
    head: "2230-01-10%9-SP-001-V-13-04",
  },

  {
    head: "2230-01-101-SP-004-V-13-04",
    scheme: "Improvement of Working Conditions of Child and Woman Labour",
    budget: "3,000,000",
  },

  {
    head: "2230-01-101-SP-007-V-13-03",
    scheme: "Statewide Survey to Identity Child Labour in different employment",
    budget: "300,000",
    rowSpan: 3,
  },
  {
    head: "2230-01-101-SP-007-V-13-04",
    budget: "700,000",
  },
  {
    head: "2230-01-101-SP-007-V-31-02",
    budget: "3,000,000",
  },

  {
    head: "2230-02-001-SP-003-V-77",
    scheme: "National e-Governance Action Plan[LB]",
    budget: "100,000,000",
  },

  {
    head: "2235-60-200-SP-005-V-31-02",
    scheme: "Provident Fund Scheme for Unorganised Workers in Urban and Rural Areas[SASPFUW]",
    budget: "1,506,900,000",
    rowSpan: 3,
  },
  {
    head: "2235-60-789-SP-003-V-31-02",
    budget: "480,000,000",
  },
  {
    head: "2235-60-796-SP-005-V-31-02",
    budget: "150,000,000",
  },

  {
    head: "2235-60-200-SP-008-V-31-02",
    scheme: "Health Insurance Scheme for Unorganised Workers[WBUSWHSS]",
    budget: "500,000,000",
    rowSpan: 3,
  },
  {
    head: "2235-60-789-SP-010-V-31-02",
    budget: "150,000,000",
  },
  {
    head: "2235-60-796-SP-010-V-31-02",
    budget: "50,000,000",
  },
];
interface BudgetRow2015 {
  slNo: number;
  head: string;
  scheme?: string;
  budget?: string;
  remarks?: string;
  rowSpan?: number;
}

const budget2015_16: BudgetRow2015[] = [
  {
    slNo: 5,
    head: "2230-01-001-SP-001-V-13-04",
    scheme: "Strengthening of enforcement machinery or the Labour Directorate",
    budget: "12500000",
  },

  {
    slNo: 6,
    head: "2230-01-001-SP-002-V-13-03",
    scheme: "Strengthening of Training Institute-cum-Central Library",
    budget: "300000",
    rowSpan: 2,
  },
  {
    slNo: 6,
    head: "2230-01-001-SP-002-V-13-04",
    budget: "5700000",
  },

  {
    slNo: 7,
    head: "2230-01-004-SP-001-V-13-04",
    scheme: "Improvement of Labour Statistics",
    budget: "1200000",
  },

  {
    slNo: 10,
    head: "2230-01-101-SP-003-V-33-05",
    scheme: "Bidi Workers Welfare Scheme",
    budget: "4750000",
    rowSpan: 3,
  },
  {
    slNo: 10,
    head: "2230-01-101-SP-003-V-50",
    budget: "2500000",
  },
  {
    slNo: 11,
    head: "2230-01-10%9-SP-001-V-13-04",
    budget: "10000000",
  },

  {
    slNo: 12,
    head: "2230-01-101-SP-004-V-13-04",
    scheme: "Improvement of Working Conditions of Child and Woman Labour",
    budget: "2000000",
  },

  {
    slNo: 13,
    head: "2230-01-101-SP-007-V-13-03",
    scheme: "Statewide Survey to Identity Child Labour in different employment",
    budget: "300000",
    rowSpan: 2,
  },
  {
    slNo: 13,
    head: "2230-01-101-SP-007-V-13-04",
    budget: "700000",
  },

  {
    slNo: 15,
    head: "2230-01-101-SP-010-V-50",
    scheme: "Welfare of Agricultural Labours, Construction Labours and Unorganised Labours",
    budget: "0",
  },

  {
    slNo: 21,
    head: "2230-02-001-SP-003-V-77",
    scheme: "National e-Governance Action Plan[LB]",
    budget: "20000000",
  },

  {
    slNo: 27,
    head: "2235-60-200-SP-005-V-31-02",
    scheme: "Provident Fund Scheme for Unorganised Workers in Urban and Rural Areas[SASPFUW]",
    budget: "1250000000",
    rowSpan: 3,
  },
  {
    slNo: 28,
    head: "2235-60-10%9-SP-001-V-31-02",
    budget: "48000000",
  },
  {
    slNo: 29,
    head: "2235-60-796-SP-001-V-31-02",
    budget: "100000000",
  },

  {
    slNo: 30,
    head: "2235-60-200-SP-008-V-31-02",
    scheme: "Health Insurance Scheme for Unorganised Workers[WBUSWHSS]",
    budget: "232300000",
    rowSpan: 3,
  },
  {
    slNo: 31,
    head: "2235-60-10%9-SP-010-V-31-02",
    budget: "60000000",
  },
  {
    slNo: 32,
    head: "2235-60-796-SP-010-V-31-02",
    budget: "10000000",
  },

  {
    slNo: 3,
    head: "4250-00-201-SP-006-V-53-00",
    scheme: "Construction & Renovation of Buildings under Labour Department",
    budget: "120000000",
  },
];

const BudgetPage = () => {
  return (
    <div className="min-h-screen g-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-900 mb-4"> BUDGET </h1>
        <div id="budget2017">
          <table className="w-full border-collapse text-[14px] mb-8">
            <thead>
              <tr className="bg-white text-amber-950 text-lg py-2 border border-amber-900 text-left">
                <th colSpan={3} className="pl-2">
                  Budget Details (F.Y. 2017-18){" "}
                </th>
              </tr>
              <tr className="bg-amber-950 text-white">
                <th className="border border-[#8f826d] px-3 py-3 text-left w-[380px]">HEAD OF ACCOUNT CODE</th>

                <th className="border border-[#8f826d] px-3 py-3 text-left">SCHEME</th>

                <th className="border border-[#8f826d] px-3 py-3 text-left w-[380px]">BUDGET ESTIMATE 2017-18</th>
              </tr>
            </thead>

            <tbody>
              {budget2017_18.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-[#f4f4f4]" : "bg-[#dfdcd6]"}>
                  <td className="border border-[#9b8f7d] px-2 py-2 align-middle">{item.head}</td>

                  {item.scheme && (
                    <td rowSpan={item.rowSpan || 1} className="border border-[#9b8f7d] px-2 py-2 align-middle">
                      {item.scheme}
                    </td>
                  )}

                  <td className="border border-[#9b8f7d] px-2 py-2 align-middle">{item.budget || ""}</td>
                </tr>
              ))}

              <tr className="bg-[#dfdcd6] font-bold">
                <td colSpan={2} className="border border-[#9b8f7d] px-3 py-2 text-center">
                  TOTAL
                </td>

                <td className="border border-[#9b8f7d] px-3 py-4">2,964,900,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="budget2015">
          <table className="border-collapse text-[14px]">
            <thead>
              <tr className="bg-white text-amber-950 text-lg py-2 border border-amber-900 text-left">
                <th colSpan={5} className="pl-2">
                  Annual Plan, Physical Achievement 2014-15, Target & Proposal for 2015-16 under demand no. 35
                </th>
              </tr>
              <tr className="bg-amber-950 text-white">
                <th className="border border-[#8f826d] px-2 py-3 text-left w-[120px]">SL. NO.</th>

                <th className="border border-[#8f826d] px-2 py-3 text-left w-[320px]">HEAD OF ACCOUNT CODE</th>

                <th className="border border-[#8f826d] px-2 py-3 text-left">SCHEME</th>

                <th className="border border-[#8f826d] px-2 py-3 text-left w-[280px]">BUDGET ESTIMATE 2015-16</th>

                <th className="border border-[#8f826d] px-2 py-3 text-left w-[180px]">REMARKS</th>
              </tr>
            </thead>

            <tbody>
              {budget2015_16.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-[#f4f4f4]" : "bg-[#dfdcd6]"}>
                  <td className="border border-[#9b8f7d] px-2 py-4 align-middle">{item.slNo}</td>

                  <td className="border border-[#9b8f7d] px-2 py-4 align-middle">{item.head}</td>

                  {item.scheme && (
                    <td rowSpan={item.rowSpan || 1} className="border border-[#9b8f7d] px-2 py-4 align-middle">
                      {item.scheme}
                    </td>
                  )}

                  <td className="border border-[#9b8f7d] px-2 py-4 align-middle">{item.budget || ""}</td>

                  <td className="border border-[#9b8f7d] px-2 py-4 align-middle">{item.remarks || ""}</td>
                </tr>
              ))}

              <tr className="bg-[#dfdcd6] font-bold">
                <td colSpan={3} className="border border-[#9b8f7d] px-3 py-4 text-center">
                  TOTAL
                </td>

                <td className="border border-[#9b8f7d] px-3 py-4">23550,00,000</td>

                <td className="border border-[#9b8f7d] px-3 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default BudgetPage;
