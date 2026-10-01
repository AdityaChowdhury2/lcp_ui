import { useState } from "react";
import { Link } from "react-router-dom";

/* ================= FULL TAB DATA ================= */
const tabsData = [
    {
        title: "Registration of Principal Employer Under Contract Labour (R&A) Act,1970",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-clra-pe.png",
        rows: [
            ["Time limit prescribed", "30 days"],
            ["Applications received", "3996"],
            ["Applications approved", "3962"],
            ["Average time", "3 days"],
            ["Median time", "21 days"],
            ["Minimum time", "Same day"],
            ["Maximum time", "45 days"],
            ["Average fee", "989"],
        ],
    },
    {
        title: "Amendment of Registration Certificate for Principal Employer",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-clra-amend.png",
        rows: [
            ["Time limit prescribed", "30 days"],
            ["Applications received", "15191"],
            ["Applications approved", "15141"],
            ["Average time", "2 days"],
            ["Median time", "25 days"],
            ["Minimum time", "Same day"],
            ["Maximum time", "50 days"],
            ["Average fee", "1449"],
        ],
    },
    {
        title: "Registration of Establishments (BOCW Act 1996)",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-bocwa-reg.png",
        rows: [
            ["Time limit prescribed", "30 days"],
            ["Applications received", "1492"],
            ["Applications approved", "1450"],
            ["Average time", "6 days"],
            ["Median time", "19 days"],
            ["Minimum time", "Same day"],
            ["Maximum time", "45 days"],
            ["Average fee", "810"],
        ],
    },
    {
        title: "Registration under Inter State Migrant Workmen Act",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-ismw-reg2.png",
        rows: [["Data not available", "-"]],
    },
    {
        title: "Licensing for Contractors (CLRA Act)",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-con-license.png",
        rows: [["Data not available", "-"]],
    },
    {
        title: "Auto-Renewal of License (CLRA)",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-con-lic-renewal.png",
        rows: [["Data not available", "-"]],
    },
    {
        title: "Amendment of License for Contractors (CLRA Act)",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-con-lic-amend.png",
        rows: [
            ["Time limit prescribed", "30 days"],
            ["Applications received", "1661"],
            ["Applications approved", "1698"],
            ["Average time", "6 days"],
            ["Median time", "25 days"],
            ["Minimum time", "Same day"],
            ["Maximum time", "50 days"],
            ["Average fee", "00"],
        ],
    },
    {
        title: "Licensing under ISMW Act",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-con-license.png",
        rows: [["Data not available", "-"]],
    },
    {
        title: "Auto-Renewal under ISMW Act",
        icon: "https://lc.wb.gov.in/sites/all/themes/lcTheme/images/icons-con-lic-renewal.png",
        rows: [
            ["Time limit prescribed", "30 days"],
            ["Applications received", "0"],
            ["Applications approved", "0"],
            ["Average time", "N/A"],
            ["Median time", "N/A"],
            ["Minimum time", "N/A"],
            ["Maximum time", "N/A"],
            ["Average fee", "21"],
        ],
    },
];
function formatDateTime(date) {
    const pad = (n) => (n < 10 ? "0" + n : n);

    let day = pad(date.getDate());
    let month = pad(date.getMonth() + 1);
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = pad(date.getMinutes());

    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert to 12-hour

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}
/* ================= COMPONENT ================= */
export default function EodbDashboard() {
    const [activeTab, setActiveTab] = useState(6);

    return (
        <div className="min-h-screen max-w-7xl mx-auto ">



            {/* ================= TITLE ================= */}
            <div className="p-4 md:p-6">
                <h1 className="text-xl md:text-3xl italic text-gray-700">
                    Online dashboard for EODB e-services w.e.f 1st November,2020
                </h1>
                <div className="text-right text-xs md:text-sm font-semibold mt-2">
                    Last updated on :{formatDateTime(new Date())}
                </div>

                {/* ================= MAIN ================= */}
                <div className="bg-white mt-4 border rounded shadow overflow-hidden">

                    {/* MOBILE TABS */}
                    <div className="md:hidden flex overflow-x-auto border-b">
                        {tabsData.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`px-4 py-2 text-xs ${activeTab === i ? "bg-[#d6a77d]" : "bg-[#e8c4a3]"
                                    }`}
                            >
                                Tab {i + 1}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row border-2 border-[#e4831c]">

                        {/* SIDEBAR */}
                        <div className="hidden md:block w-1/4 bg-[#e8c4a3] h-[400px] overflow-y-auto">
                            {tabsData.map((tab, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveTab(i)}
                                    className={`p-4 border-b cursor-pointer text-center ${activeTab === i
                                        ? "bg-[#d6a77d] font-semibold"
                                        : "hover:bg-[#e0b58e]"
                                        }`}
                                >
                                    <img src={tab.icon} className="w-10 mx-auto mb-2" />
                                    <p className="text-xs">{tab.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* CONTENT */}
                        <div className="w-full md:w-3/4 p-2 md:p-4 overflow-x-auto     ">
                            <table className="w-full min-w-[500px] text-xs md:text-sm border border-[#e4831c]  border-collapse">
                                <thead>
                                    <tr className="bg-gray-600 text-white text-center">
                                        <th colSpan="2" className="p-2">
                                            {tabsData[activeTab].title.toUpperCase()}
                                        </th>
                                    </tr>
                                    <tr className="bg-[#8b5a3c] text-white">
                                        <th className="p-2 text-left">PARTICULARS</th>
                                        <th className="p-2 text-left">DETAILS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tabsData[activeTab].rows.map((row, i) => {
                                        const isLast = i === tabsData[activeTab].rows.length - 1;

                                        return (
                                            <tr
                                                key={i}
                                                className={`group transition-all duration-200 border-b border-[#e4831c] 
        ${i % 2 === 0 ? "bg-[#f2d1b3]" : "bg-[#e6b48c]"}
        hover:bg-[#d6a77d] hover:shadow-sm`}
                                            >
                                                {/* PARTICULARS */}
                                                <td className="p-2 border-r border-[#e4831c]  align-top">

                                                    {/* NORMAL ROW */}
                                                    {!isLast ? (
                                                        <span className="group-hover:font-semibold">
                                                            {row[0]}
                                                        </span>
                                                    ) : (
                                                        /* ⭐ SPECIAL LAST ROW (VIEW DETAILS) */
                                                        <div>
                                                            <p className="mb-2 group-hover:font-semibold">
                                                                *Average fee taken by the Department for completion of entire process of obtaining approval / certificate
                                                            </p>



                                                            {/* <Link
                                                                to="/eodb-fee-breakdown"
                                                                className="inline-block bg-[#6d5a4b] text-white text-xs px-3 py-2 hover:bg-[#5a4a3d] transition"
                                                            >
                                                                VIEW DETAILS
                                                            </Link> */}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* DETAILS */}
                                                <td className="p-2 border-[#e4831c]  text-left align-top">
                                                    {row[1]}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                {/* ================= INSPECTION ================= */}
                <div className="mt-6 bg-white border rounded shadow overflow-x-auto">
                    <table className="w-full min-w-[500px] text-xs md:text-sm border border-[#e4831c] border-collapse">
                        <thead>
                            <tr className="bg-gray-600 text-white text-center">
                                <th colSpan="2" className="p-2">
                                    INSPECTION DASHBOARD
                                </th>
                            </tr>
                            <tr className="bg-[#8b5a3c] text-white">
                                <th className="p-2 text-left">PARTICULARS</th>
                                <th className="p-2 text-left">DETAILS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {[
                                ["Total Number of inspections conducted", "1638"],
                                ["Total Number of Inspections Completed", "1638"],
                                ["Average Time Taken for Conducting Inspection", "2 days"],
                                ["Median time taken for Conducting Inspections", "2 days"],
                                ["Minimum time taken for Conducting Inspections", "0 day"],
                                ["Time Limit prescribed as per the Public Service Guarantee Act", "2 days"],
                                ["*“Average fee” taken by the Department for completion of entire process of Inspection", "Not Applicable"],
                                ["Total Number of companies that provided self-certifications and were exempted from inspections", "22"],
                                ["Total Number of companies that provided third party certifications and were exempted from inspections", "0"],
                            ].map((row, i) => {
                                const isImportant = i === 6; // average fee row

                                return (
                                    <tr
                                        key={i}
                                        className={`group transition-all duration-200 border-b border-[#e4831c] 
        ${i % 2 === 0 ? "bg-[#f2d1b3]" : "bg-[#e6b48c]"}
        hover:bg-[#d6a77d] hover:shadow-sm`}
                                    >
                                        {/* PARTICULARS */}
                                        <td className="p-2 border-r border-[#e4831c]  align-top">
                                            <span
                                                className={`${isImportant ? "italic" : ""
                                                    } group-hover:font-semibold`}
                                            >
                                                {row[0]}
                                            </span>
                                        </td>

                                        {/* DETAILS */}
                                        <td className="p-2 align-top">
                                            <span className="group-hover:font-medium">{row[1]}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>



        </div>
    );
}