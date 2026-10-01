// import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import axios from "axios";
// import React, { useEffect, useMemo, useState } from "react";
// import DataTable, { TableColumn, ConditionalStyles } from "react-data-table-component";

// interface RTIItem {
//   id?: number;
//   title?: string;
//   act_title?: string;
//   download?: string;
//   [key: string]: any;
//   _rowIndex: number;
// }

// const RTI: React.FC = () => {
//   const [data, setData] = useState<RTIItem[]>([]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE}right-to-information`)
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

//   const columns: TableColumn<RTIItem>[] = useMemo(
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
//         name: "DOWNLOAD",
//         selector: (row) => row.download || "",
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

//   const conditionalRowStyles: ConditionalStyles<RTIItem>[] = [
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
//           RTI
//         </h2>

//         <div className="w-full overflow-hidden border border-[#e7dfd6] rounded">
//           <div className="h-[500px] overflow-y-auto">
//             <DataTable
//               columns={columns}
//               data={data}
//               customStyles={{
//                 tableWrapper: {
//                   style: { border: "1px solid #c6b8ae" },
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

// export default RTI;

import React from "react";
import { FileText } from "lucide-react";

interface RTIinterface {
  id: number;
  title: string;
  pdf?: string;
}

const rtis: RTIinterface[] = [
  {
    id: 1,
    title: "Frequently Asked Question",
    pdf: "",
  },
  {
    id: 2,
    title: "INFORMATION COMMISSION(S), Right to Information Act, 2005",
    pdf: "",
  },
  {
    id: 3,
    title: "Labour Commissioner Notification",
    pdf: "",
  },
  {
    id: 4,
    title: "Right To Information Act",
    pdf: "",
  },
  {
    id: 5,
    title: "Right to Information Act 2005",
    pdf: "",
  },
  {
    id: 6,
    title: "ROLE OF PUBLIC INFORMATION OFFICERS",
    pdf: "",
  },
  {
    id: 7,
    title: "WEST BENGAL RIGHT TO INFORMATION RULES, 2006(WITH AMENDMENTS)",
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

const RTI = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-900 mb-8"> RTI </h1>

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
              {rtis.map((item, index) => (
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

export default RTI;

