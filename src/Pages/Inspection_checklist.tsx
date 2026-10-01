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
    title: "Child Labour (P & R) Act, 1986 and W.B Rules, 1995 thereunder",
    pdf: "/pdfs/child_labour.pdf",
  },
  {
    id: 2,
    title: "Shops & Establishments Act, 1963 and W.B Rules, 1964 thereunder",
    pdf: "/pdfs/shops&establishment.pdf",
  },
  {
    id: 3,
    title: "Contract Labour (R & A) Act, 1970 & W.B. Rules, 1972 thereunder, For Contractors",
    pdf: "/pdfs/contract-labour.pdf",
  },
  {
    id: 4,
    title: "Minimum Wages Act, 1948 & W.B. Rules 1951 thereunder",
    pdf: "/pdfs/minimum-wages.pdf",
  },
  {
    id: 5,
    title: "The W.B Workmen's House-Rent Allowance Act, 1974 & W.B Rules 1975 thereunder",
    pdf: "/pdfs/wb-workmen.pdf",
  },
  {
    id: 6,
    title: "Maternity Bennefit Act, 1961",
    pdf: "/pdfs/maternity-benifit.pdf",
  },
  {
    id: 7,
    title: "The Inter-State Migrant Workmen (RECS) Act 1979 & W.B. Rules 1981, For Principal Employer",
    pdf: "/pdfs/interstate-migrant.pdf",
  },
  {
    id: 8,
    title: "The West Bengal Labour Welfare Fund Act, 1974",
    pdf: "/pdfs/wb-labour.pdf",
  },
  {
    id: 9,
    title: "Beedi and Cigar workers(Condition of Employment) Act, 1966 and W.B rules thereunder",
    pdf: "/pdfs/beedi-cigar.pdf",
  },
  {
    id: 10,
    title: "The Payment of Bonus Act, 1965 and The Payment of Bonus Rules 1975 thereunder",
    pdf: "/pdfs/bonus-act-1965.pdf",
  },
  {
    id: 11,
    title: "Motor Transport Workers Act, 1961 and W.B Rules, 1963 thereunder",
    pdf: "/pdfs/motor-transport.pdf",
  },
  {
    id: 12,
    title: "BOCW(R & C) Act, 1996 & W.B Rules 2004 thereunder",
    pdf: "/pdfs/bocw-act-1996.pdf",
  },
  {
    id: 13,
    title: "Payment of Gratuity Act, 1972 and W.B Rules, 1973 thereunder",
    pdf: "/pdfs/payment-graturity-1972.pdf",
  },
  {
    id: 14,
    title: "The Inter-State Migrant Workmen (RECS) Act 1979 & W.B. Rules 1981, For Contractor",
    pdf: "/pdfs/RECS-1979.pdf",
  },

  {
    id: 15,
    title: "Sales Promotion Emp.(C.S) Act, 1976",
    pdf: "/pdfs/sales-promotion.pdf",
  },
  {
    id: 16,
    title: "Payment of Wages Act, 1936 & W.B. Rules, 1958 thereunder",
    pdf: "/pdfs/payment-wages-1936.pdf",
  },
  {
    id: 17,
    title: "Equal Remuneration Act, 1976 thereunder",
    pdf: "/pdfs/Equal-Remuneration-Act-1976.pdf",
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

const InspectionChecklist = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h5 className="text-4xl font-bold text-center text-amber-900 mb-8"> Inspection Checklist </h5>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white">
                <th className="border border-gray-400 px-4 py-3 text-left w-24">SL. NO.</th>
                <th className="border border-gray-400 px-4 py-3 text-left">INSPECTION NOTE</th>
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

export default InspectionChecklist;
