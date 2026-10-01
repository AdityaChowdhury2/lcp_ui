import React from "react";
import { FileText } from "lucide-react";

interface RTIinterface {
  id: number;
  service: string;
  designatedOfficer: string;
  designatedTimeLimit: number;
  appellateOfficer: string;
  appellateTimeLimit: number;
  reviewingOfficer: string;
  reviewingTimeLimit:number;
}

const rtis: RTIinterface[] = [
  {
    id: 1,
    service:
      "Registration and Amendment of Certificate of Registration of Establishment of Principal Employer under the Contract Labour (Regulation and Abolition) Act, 1970 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 2,
    service:
      "Licensing of Contractors and Amendment, Renewal of Licence under the Contract Labour (Regulation and Abolition) Act, 1970 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 3,
    service:
      "Registration and renewal, Changes of Certificates of Registration of Shops and Establishments under the West Bengal Shops & Establishments Act, 1963 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 1,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 15,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 30,
  },
  {
    id: 4,
    service:
      "Registration and amendment of certificate of registration of establishment under the Buildings and others Construction workers (Regulation of Employment and conditions of services) Act, 1996 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 5,
    service:
      "Registration and amendment of certificate of Registration of Establishment of Principal Employer under the Inter-State Migrant Workmen (Regulation of Employment and Condition of Services) Act, 1979 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 6,
    service:
      "Licensing of Contractors and Amendment, Renewal of Licences under the Inter-State Migrant workmen (Regulation of Employment and condition of services) Act, 1979 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 7,
    service:
      "Registration and Amendment, Renewal of Certificate of Registration of the Motor Transport undertakings under the Motor Transport Workers Act, 1961 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 30,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 8,
    service:
      "Licensing of Industrial Premises and Renewal of Licenses under the Beedi and Cigar Workers (Conditions of Employment) Act, 1966 and Rules thereunder.",
    designatedOfficer: "Assistant Labour Commissioner",
    designatedTimeLimit: 90,
    appellateOfficer: "Deputy Labour Commissioner",
    appellateTimeLimit: 45,
    reviewingOfficer: "Labour Commissioner",
    reviewingTimeLimit: 60,
  },
  {
    id: 9,
    service: "Issuance of Registration Certificate as per the Trade Unions Act, 1926 to the applicant Trade Unions.",
    designatedOfficer: "Deputy Registrar of Trade Union",
    designatedTimeLimit: 42,
    appellateOfficer: "Deputy Labour Commissioner (Trade Union Section)",
    appellateTimeLimit: 45,
    reviewingOfficer: "Registrar of Trade Union",
    reviewingTimeLimit: 60,
  },
];



const GeneralTimeline = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h5 className="text-4xl font-bold text-center text-amber-900 mb-8">General Timelines</h5>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-950 text-white">
                <th className="border border-gray-400 px-4 py-2 text-left ">SL. NO.</th>
                <th className="border border-gray-400 px-4 py-2 text-left">SERVICES</th>
                <th className="border border-gray-400 px-4 py-2 text-left">DESIGNATED OFFICER</th>
                <th className="border border-gray-400 px-4 py-2 text-center">STIPULATED TIME LIMIT</th>
                <th className="border border-gray-400 px-4 py-2 text-left">APPELLATE OFFICER</th>
                <th className="border border-gray-400 px-4 py-2 text-left">STIPULATED TIME LIMIT</th>
                <th className="border border-gray-400 px-4 py-2 text-left">REVIEWING OFFICER</th>
                <th className="border border-gray-400 px-4 py-2 text-center">STIPULATED TIME LIMIT</th>
              </tr>
            </thead>

            <tbody>
              {rtis.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-stone-200"} hover:bg-amber-200 transition`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.id}.</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.service}.</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">{item.designatedOfficer}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.designatedTimeLimit}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">{item.appellateOfficer}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.appellateTimeLimit}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.reviewingOfficer}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">{item.reviewingTimeLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default  GeneralTimeline
