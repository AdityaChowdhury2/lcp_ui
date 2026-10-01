import React from "react";
import { FileText } from "lucide-react";

interface RTIinterface {
  id: number;
  title: string;
  date: string;
  pdf?: string;
}

const rtis: RTIinterface[] = [
  {
    id: 1,
    date: "23/02/2021",
    title: "CO/Secretary/Social Security Board Notification",
    pdf: "",
  },
  {
    id: 2,
    date: "08/11/2019",
    title: "Exemptions relating to Bye Elections in West Bengal",
    pdf: "",
  },
  {
    id: 3,
    date: "",
    title: "Industrial Dispute (Amendment) Act, 2010",
    pdf: "",
  },
  {
    id: 4,
    date: "02/04/1981",
    title: "Notifications under different Acts",
    pdf: "",
  },
  {
    id: 5,
    date: "01/10/2010",
    title: "Rate of Cess",
    pdf: "",
  },
  {
    id: 6,
    date: "11/06/2015",
    title: "Right to Public Services Notification",
    pdf: "",
  },
  {
    id: 7,
    date: "11/06/2015",
    title:
      "Notification relating to corrigendum of Labour Department Notification No. 1688-GE/G/3A-20/2014 dated, 11th June, 2015 on time limit regarding registration of Shops and Establishment under W.B S & E Act, 1963",
    pdf: "",
  },
  {
    id: 8,
    date: "03/03/2015",
    title: "Submission of Inspection Report Within 72 Hours",
    pdf: "",
  },
  {
    id: 9,
    date: "21/05/2015",
    title: "Surprise Inspection",
    pdf: "",
  },
  {
    id: 10,
    date: "15/06/2015",
    title: "Synchronized Inspection System of Multiple Inspections by one Inspector Labour Dept.",
    pdf: "",
  },
  {
    id: 11,
    date: "01/08/2016",
    title: "Reconstitution of State Advisory Contract Labour Board.",
    pdf: "",
  },
  {
    id: 12,
    date: "01/08/2016",
    title: "Reconstitution of West Bengal Tea Plantation Employees Welfare Board.",
    pdf: "",
  },
  {
    id: 13,
    date: "31/08/2016",
    title: "Reconstitution of West Bengal Building and Other Construction Workers Welfare Board.",
    pdf: "",
  },
  {
    id: 14,
    date: "31/08/2016",
    title: "Reconstitution of West Bengal State Social Security Board.",
    pdf: "",
  },
  {
    id: 15,
    date: "31/08/2016",
    title: "Reconstitution of West Bengal Unorganised Sector Workers Welfare Board.",
    pdf: "",
  },
  {
    id: 16,
    date: "28/09/2016",
    title: "Reconstitution of West Bengal Labour Welfare Board.",
    pdf: "",
  },
  {
    id: 17,
    date: "28/09/2016",
    title: "Reappointment of the Minimum Wages Advisory Board.",
    pdf: "",
  },
  {
    id: 18,
    date: "05/06/2018",
    title: "Reappointment of the Minimum Wages Advisory Board.",
    pdf: "",
  },
  {
    id: 19,
    date: "28/12/2018",
    title: "Office order regarding online Registration/Renewal under MTW",
    pdf: "",
  },
  {
    id: 20,
    date: "10/06/2015",
    title: "Shops & Est Amendment bill",
    pdf: "",
  },
  {
    id: 21,
    date: "",
    title: "Notifications under different Acts",
    pdf: "",
  },
  {
    id: 22,
    date: "18/09/2013",
    title: "Amendment rule s & E Act on OT",
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

const ImpNotification = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h5 className="text-4xl font-bold text-center text-amber-900 mb-8">Important Notification </h5>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white">
                <th className="border border-gray-400 px-4 py-2 text-left ">SL. NO.</th>
                <th className="border border-gray-400 px-4 py-2 text-left">INSPECTION DATE</th>
                <th className="border border-gray-400 px-4 py-2 text-left">TITLE</th>
                <th className="border border-gray-400 px-4 py-2 text-center">DOWNLOAD</th>
              </tr>
            </thead>

            <tbody>
              {rtis.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-stone-200"} hover:bg-amber-200 transition`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.id}.</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.date}.</td>
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

export default ImpNotification;
