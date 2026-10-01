// // src/Pages/ActsRules.tsx (or wherever you keep it)
// import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import axios from "axios";
// import React, { useEffect, useMemo, useState } from "react";
// import DataTable, {
//   type TableColumn,
//   type ConditionalStyles,
// } from "react-data-table-component";

// type ApiActRule = {
//   act_title: string;
//   act?: string;
//   rules?: string;
//   notification?: string;
//   [key: string]: unknown;
// };

// interface ActRuleRow extends ApiActRule {
//   _rowIndex: number;
// }

// const ActsRules: React.FC = () => {
//   const [data, setData] = useState<ActRuleRow[]>([]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE}actsandrules`)
//       .then((res) => {
//         const raw = Array.isArray(res?.data)
//           ? (res.data as ApiActRule[])
//           : ((res?.data?.data ?? []) as ApiActRule[]);

//         const withIndex: ActRuleRow[] = raw.map((item, idx) => ({
//           ...item,
//           _rowIndex: idx,
//         }));

//         setData(withIndex);
//       })
//       .catch((err) => {
//         console.error(err);
//         setData([]);
//       });
//   }, [API_BASE]);

//   const columns: TableColumn<ActRuleRow>[] = useMemo(
//     () => [
//       {
//         name: "SL. NO.",
//         selector: (row) => row._rowIndex + 1,
//         width: "70px",
//         cell: (row) => (
//           <div className="text-center w-20 px-2 py-3">
//             {row._rowIndex + 1}.
//           </div>
//         ),
//         sortable: true,
//       },
//       {
//         name: "ACT",
//         selector: (row) => row.act_title,
//         grow: 2,
//         cell: (row) => (
//           <div className="px-4 py-3 break-words">{row.act_title}</div>
//         ),
//         sortable: true,
//       },
//       {
//         name: "RULES",
//         selector: (row) => row.rules ?? "",
//         width: "110px",
//         center: true,
//         cell: () => (
//           <div className="px-4 py-3 flex items-center justify-center">
//             <img src={`${IMAGE_BASE}pdf.png`} alt="Rules PDF" />
//           </div>
//         ),
//       },
//       {
//         name: "NOTIFICATION",
//         selector: (row) => row.notification ?? "",
//         width: "140px",
//         cell: () => (
//           <div className="px-4 py-3 flex items-center justify-center">
//             <img src={`${IMAGE_BASE}pdf.png`} alt="Notification PDF" />
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const conditionalRowStyles: ConditionalStyles<ActRuleRow>[] = [
//     {
//       when: (row) => row._rowIndex % 2 === 0,
//       style: { backgroundColor: "#ffffff" },
//     },
//     {
//       when: (row) => row._rowIndex % 2 !== 0,
//       style: { backgroundColor: "#e1ddd6" },
//     },
//   ];

//   return (
//     <div className="min-h-screen px-6 py-8 bg-white">
//       <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm">
//         <h2 className="text-center text-2xl font-semibold text-[#5b3f2f] mb-4">
//           Acts and Rules
//         </h2>

//         <div className="w-full overflow-hidden border border-[#e7dfd6] rounded">
//           <div className="h-[500px] overflow-y-auto">
//             <DataTable
//               columns={columns}
//               data={data}
//               customStyles={{
//                 tableWrapper: {
//                   style: {
//                     border: "1px solid #c6b8ae",
//                   },
//                 },
//                 headRow: {
//                   style: {
//                     backgroundColor: "#4b3022",
//                     color: "#fff",
//                     borderBottom: "2px solid #c6b8ae",
//                   },
//                 },
//                 headCells: {
//                   style: {
//                     padding: "12px 10px",
//                     fontWeight: 700,
//                     borderRight: "1px solid #c6b8ae",
//                   },
//                 },
//                 rows: {
//                   style: {
//                     minHeight: "48px",
//                     borderBottom: "1px solid #c6b8ae",
//                   },
//                 },
//                 cells: {
//                   style: {
//                     padding: 0,
//                     borderRight: "1px solid #c6b8ae",
//                   },
//                 },
//               }}
//               conditionalRowStyles={conditionalRowStyles}
//               noHeader
//               pagination
//               responsive
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActsRules;


import React from "react";
import { FileText } from "lucide-react";

interface ActRule {
  id: number;
  act: string;
  rulesPdf?: string;
  notificationPdf?: string;
}

const actsAndRules: ActRule[] = [
  {
    id: 1,
    act: "Beedi Cigar Workers(Conditions of Employment) Act, 1966",
    rulesPdf: "/pdfs/beedi-workers-rules.pdf",
  },
  {
    id: 2,
    act: "Bonded Labour System (Abolition) Act, 1978",
  },
  {
    id: 3,
    act: "Building & other Construction Workers(Regulation of Employment and Conditions of Service) Act 1996",
    rulesPdf: "/pdfs/construction-workers-rules.pdf",
  },
  {
    id: 4,
    act: "Child Labour (Prohibition and Regulation) Act, 1986",
    notificationPdf: "/pdfs/child-labour-notification.pdf",
  },
  {
    id: 5,
    act: "Cine workers and Cinema Theatre Workers (Regulation of Employment) Act, 1981",
  },
  {
    id: 6,
    act: "Contract Labour (R & A) Act 1970",
    notificationPdf: "/pdfs/contract-labour-notification.pdf",
  },
  {
    id: 7,
    act: "Equal Remuneration Act, 1976",
    rulesPdf: "/pdfs/equal-remuneration-rules.pdf",
    notificationPdf: "/pdfs/equal-remuneration-notification.pdf",
  },
  {
    id: 8,
    act: "Industrial Dispute Act,1947",
    notificationPdf: "/pdfs/industrial-dispute-notification.pdf",
  },
  {
    id: 9,
    act: "Industrial Employment(Standing Order) Act, 1946",
    notificationPdf: "/pdfs/industrial-employment-notification.pdf",
  },
  {
    id: 10,
    act: "Inter State Migrant Workmen (Regulation of Employment & Conditions of Service)Act 1979",
    rulesPdf: "/pdfs/interstate-migrant-rules.pdf",
    notificationPdf: "/pdfs/interstate-migrant-notification.pdf",
  },
  {
    id: 11,
    act: "Labour Welfare Fund Act,1974",
  },
  {
    id: 12,
    act: "Maternity Benefit Act,1969",
  },
  {
    id: 13,
    act: "Minimum Wages Act 1948",
    notificationPdf: "/pdfs/minimum-wages-notification.pdf",
  },
  {
    id: 14,
    act: "Motor Transport Workers Act, 1961",
    notificationPdf: "/pdfs/motor-transport-notification.pdf",
  },
  {
    id: 15,
    act: "Motor Transport Workers' Welfare Cess Act 2010",
  },
  {
    id: 16,
    act: "Payment of Bonus Act 1965",
  },
  {
    id: 17,
    act: "Payment of Gratuity Act, 1972",
    notificationPdf: "/pdfs/payment-gratuity-notification.pdf",
  },
  {
    id: 18,
    act: "Payment of Wages Act, 1936",
  },
  {
    id: 19,
    act: "Payments of wages(West Bengal Amendment) Act, 1993",
  },
  {
    id: 20,
    act: "Plantation Labour Act 1951",
    notificationPdf: "/pdfs/minimum-wages-notification.pdf",
  },
  {
    id: 21,
    act: "Sales Promotion Employees (Condition of Service)Act, 1976",
    notificationPdf: "/pdfs/motor-transport-notification.pdf",
  },
  {
    id: 22,
    act: "The Un-organised Workers Social Security Act, 2008",
  },
  {
    id: 23,
    act: "Trade Union Act 1926",
    notificationPdf: "/pdfs/payment-gratuity-notification.pdf",
  },
  {
    id: 24,
    act: "WB Right to Public Service Act, 2013",
  },
  {
    id: 25,
    act: "WB Unorganised Sector Workers Welfare Act, 2007",
  },
  {
    id: 26,
    act: "WB Workmen's House Rent Allowance Act 1974",
    notificationPdf: "/pdfs/motor-transport-notification.pdf",
  },
  {
    id: 27,
    act: "West Bengal Payment of Subsistence Allowance Act, 1969",
  },
  {
    id: 28,
    act: "West Bengal Shops & Establishment Act, 1963",
    notificationPdf: "/pdfs/payment-gratuity-notification.pdf",
  },
  {
    id: 29,
    act: "Working Journalists & other Newspaper Employees (condition of service) and Miscellaneous Provisions Act, 1955",
  },
];

const PdfLink = ({ link }: { link?: string }) => {
  if (!link) {
    return <span className="text-gray-500">---</span>;
  }

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
      <div className="border border-gray-400 rounded p-1 hover:bg-gray-100 transition">
        <FileText className="w-5 h-5 text-red-600" />
      </div>
    </a>
  );
};

const ActsRules = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-900 mb-8">Acts and Rules</h1>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white">
                <th className="border border-gray-400 px-4 py-3 text-left w-24">SL. NO.</th>
                <th className="border border-gray-400 px-4 py-3 text-left">ACT</th>
                <th className="border border-gray-400 px-4 py-3 text-center w-32">RULES</th>
                <th className="border border-gray-400 px-4 py-3 text-center w-40">NOTIFICATION</th>
              </tr>
            </thead>

            <tbody>
              {actsAndRules.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-stone-200"} hover:bg-amber-200 transition`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.id}.</td>

                  <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">{item.act}</td>

                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <PdfLink link={item.rulesPdf} />
                  </td>

                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <PdfLink link={item.notificationPdf} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActsRules;
