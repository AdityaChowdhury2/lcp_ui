import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaHashtag,
  FaCalendarAlt,
  FaCommentAlt,
  FaInfoCircle,
  FaUserAlt,
} from "react-icons/fa";

const remarksData = [
  {
    id: 1,
    date: "02nd Sep, 2025",
    remark: "Certificate Issued",
    status: "Issued",
    remarkBy: "-",
  },
  {
    id: 2,
    date: "02nd Sep, 2025",
    remark: "Auto approved",
    status: "Fees Pending",
    remarkBy: "-",
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "Issued") {
    return <FaCheckCircle className="text-green-500 text-2xl" title={status} />;
  }
  return <FaClock className="text-orange-400 text-2xl" title={status} />;
};

const RemarksListPage = () => {
  return (
    <div className="bg-gray-200 min-h-screen p-4">
      <div className="max-w-[1100px] mx-auto">

        {/* HEADER */}
        <div className="bg-white border rounded shadow p-4 mb-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Remarks History
          </h1>
          <p className="text-sm text-gray-500">
            View all remarks and status updates
          </p>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded shadow overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">

              {/* HEAD */}
              <thead className="bg-[#1e7aa5] text-white">
                <tr>
                  <th className="p-3 text-center w-[8%]">
                    <span className="flex items-center justify-center gap-1"><FaHashtag /> Sl. No</span>
                  </th>
                  <th className="p-3 text-center w-[15%]">
                    <span className="flex items-center justify-center gap-1"><FaCalendarAlt /> Date - Time</span>
                  </th>
                  <th className="p-3 text-center">
                    <span className="flex items-center justify-center gap-1"><FaCommentAlt /> Remark</span>
                  </th>
                  <th className="p-3 text-center w-[12%]">
                    <span className="flex items-center justify-center gap-1"><FaInfoCircle /> Status</span>
                  </th>
                  <th className="p-3 text-center w-[20%]">
                    <span className="flex items-center justify-center gap-1"><FaUserAlt /> Remark By</span>
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {remarksData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="p-3 text-center">{item.id}</td>

                    <td className="p-3 text-center">{item.date}</td>

                    <td className="p-3 text-center font-medium text-gray-700">
                      {item.remark}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusIcon status={item.status} />
                        <span className="text-xs text-gray-600">
                          {item.status}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center text-gray-600">
                      {item.remarkBy || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RemarksListPage;