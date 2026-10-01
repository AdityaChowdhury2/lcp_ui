// import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import axios from "axios";
// import React, { useEffect, useMemo, useState } from "react";
// import DataTable, { TableColumn, ConditionalStyles } from "react-data-table-component";

// interface TenderItem {
//   id?: number;
//   title?: string;
//   act_title?: string;
//   viewanddownload?: string;
//   [key: string]: any;
//   _rowIndex: number;
// }

// const Tender: React.FC = () => {
//   const [data, setData] = useState<TenderItem[]>([]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE}tender`)
//       .then((res) => {
//         const arr = Array.isArray(res?.data)
//           ? res.data
//           : res?.data?.data ?? [];

//         const withIndex = arr.map((item: any, idx: number) => ({
//           ...item,
//           _rowIndex: idx,
//         }));

//         setData(withIndex);
//       })
//       .catch((err) => {
//         console.error(err);
//         setData([]);
//       });
//   }, []);

//   const columns: TableColumn<TenderItem>[] = useMemo(
//     () => [
//       {
//         name: "SL NO.",
//         selector: (row) => row._rowIndex + 1,
//         width: "80px",
//         cell: (row) => (
//           <div className="text-center w-20 px-2 py-3">
//             {row._rowIndex + 1}.
//           </div>
//         ),
//         sortable: true,
//       },
//       {
//         name: "TITLE",
//         selector: (row) => row.act_title || row.title || "",
//         grow: 2,
//         cell: (row) => (
//           <div className="px-4 py-3 break-words">
//             {row.act_title || row.title}
//           </div>
//         ),
//         sortable: true,
//       },
//       {
//         name: "VIEW & DOWNLOAD",
//         selector: (row) => row.viewanddownload || "",
//         width: "140px",
//         cell: () => (
//           <div className="px-4 py-3 flex items-center justify-center">
//             <img src={`${IMAGE_BASE}pdf.png`} alt="pdf" />
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const conditionalRowStyles: ConditionalStyles<TenderItem>[] = [
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
//           Tender
//         </h2>

//         <div className="w-full overflow-hidden border border-[#e7dfd6] rounded">
//           <div className="h-[500px] overflow-y-auto">
//             <DataTable
//               columns={columns}
//               data={data}
//               customStyles={{
//                 tableWrapper: { style: { border: "1px solid #c6b8ae" } },
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
//                     fontWeight: "700",
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
//                     padding: "0",
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

// export default Tender;

import React from "react";
import { FileText } from "lucide-react";

interface tenderinterface {
  id: number;
  title: string;
  pdf?: string;
}

const tenders: tenderinterface[] = [
  {
    id: 1,
    title: "Supply of rates for Printing and Delivery of 200 copies of annual reports",
    pdf: "",
  },
  {
    id: 2,
    title:
      "Tender for supply of 1 POCO F1 by Xiaomi (Rosso Red, 256 GB) (8 GB RAM) and a Power Bank up to date for the official use",
    pdf: "",
  },
  {
    id: 3,
    title:
      "Fax Machine of up to date technical configurations / features for the official use of the Labour Commissioner, West Bengal, Memb",
    pdf: "",
  },
  {
    id: 4,
    title:
      "Digital Photocopier Machine according to date technical configurations / features as noted in the Sl. No. 9 of DGS & D for the o",
    pdf: "",
  },
  {
    id: 5,
    title:
      "Technical configurations / features for the official use of the RLO Mathabhanga, Cooch Behar for implementation of official work",
    pdf: "",
  },
  {
    id: 6,
    title: `e-QUOTATION DOCUMENT FOR HOUSEKEEPING CONTRACT Of "Shramik Bhawan", Asansol`,
    pdf: "",
  },
  {
    id: 7,
    title: "Notice for conducting a detailed survey of on child labour in Kolkata",
    pdf: "",
  },
  {
    id: 8,
    title:
      "Annual Maintenance Contract for two Water purifier (Aquaguard Water purifier, Model NO.AG-200), installed in the office of the La",
    pdf: "",
  },
  {
    id: 9,
    title:
      "Binding of Registers and Bills of Labour Commissionerate, West Bengal, 11th floor, N.S. Building, Kolkata-1",
    pdf: "",
  },
  {
    id: 10,
    title:
      "Supply and installation of nos Water Purifier(Hi Flo -2 liter per min) in the Office of the Labour Commissioner, West Bengal",
    pdf: "",
  },
  {
    id: 11,
    title:
      "Supply and installation of two nos. 'Water Cooler' (Storage Capacity- 80 liter& Cooling Capacity -60 liter/hr) in the office of t",
    pdf: "",
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

const Tender = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-900 mb-8"> TENDER </h1>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white">
                <th className="border border-gray-400 px-4 py-3 text-left w-24">SL. NO.</th>
                <th className="border border-gray-400 px-4 py-3 text-left">TITLE</th>
                <th className="border border-gray-400 px-4 py-3 text-center w-32">DOWNLOAD</th>
              </tr>
            </thead>

            <tbody>
              {tenders.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-stone-200"} hover:bg-amber-200 transition`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.id}.</td>

                  <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">{item.title}</td>

                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <PdfLink link={item.pdf} />
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

export default Tender;


