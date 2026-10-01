import React from "react";
import { SiMdbook } from "react-icons/si";

type StatItem = {
    label: string;
    value: number;
    color: string;
};

type StatCard = {
    title: string;
    items: StatItem[];
};

const statsData: StatCard[] = [
    {
        title: "Registration of Principal Employers",
        items: [
            { label: "Pending With Office", value: 1, color: "bg-red-500" },
            { label: "Payment Pending", value: 3, color: "bg-sky-500" },
            { label: "Successful Payment", value: 0, color: "bg-orange-400" },
            { label: "Issued Applications", value: 19, color: "bg-green-500" },
            { label: "Submitted Applications", value: 15, color: "bg-blue-700" },
        ],
    },
    {
        title: "Licensing for Contractors",
        items: [
            { label: "Pending With Office", value: 0, color: "bg-red-500" },
            { label: "Payment Pending", value: 0, color: "bg-sky-500" },
            { label: "Successful Payment", value: 0, color: "bg-orange-400" },
            { label: "Issued Applications", value: 23, color: "bg-green-500" },
            { label: "Submitted Applications", value: 27, color: "bg-blue-700" },
        ],
    },
    {
        title: "Renewal of Contractor License Under Contract Labour (R&A) Act, 1960",
        items: [
            { label: "Pending With Office", value: 0, color: "bg-red-500" },
            { label: "Payment Pending", value: 0, color: "bg-sky-500" },
            { label: "Successful Payment", value: 0, color: "bg-orange-400" },
            { label: "Issued Applications", value: 23, color: "bg-green-500" },
            { label: "Submitted Applications", value: 27, color: "bg-blue-700" },
        ],
    },
    {
        title: "Renewal of Contractor License Under Contract Labour (R&A) Act, 1960",
        items: [
            { label: "Pending With Office", value: 0, color: "bg-red-500" },
            { label: "Payment Pending", value: 0, color: "bg-sky-500" },
            { label: "Successful Payment", value: 0, color: "bg-orange-400" },
            { label: "Issued Applications", value: 23, color: "bg-green-500" },
            { label: "Submitted Applications", value: 27, color: "bg-blue-700" },
        ],
    },
    {
        title: "Renewal of Contractor License Under Contract Labour (R&A) Act, 1960",
        items: [
            { label: "Pending With Office", value: 0, color: "bg-red-500" },
            { label: "Payment Pending", value: 0, color: "bg-sky-500" },
            { label: "Successful Payment", value: 0, color: "bg-orange-400" },
            { label: "Issued Applications", value: 23, color: "bg-green-500" },
            { label: "Submitted Applications", value: 27, color: "bg-blue-700" },
        ],
    },
];

const InspectorView: React.FC = () => {
    const [collapsed, setCollapsed] = React.useState<number[]>([]);

    const toggleCard = (index: number) => {
        setCollapsed((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <h2 className="text-xl font-semibold mb-4">
                INSPECTOR Profile: PRATAP DAS (Additional Charge)
            </h2>

            <div className="relative w-full mb-5 rounded bg-white border-t-[3px] border-t-[#3c8dbc] shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                {/* content */}
                <div className="rounded-t-none rounded-b-[3px] p-2.5 overflow-hidden">
                    <div className="flex gap-6 items-start">
                        {/* LEFT PROFILE */}
                        <div className="flex flex-col gap-5 w-1/4">
                            <div className="bg-white rounded shadow p-5 border-t-4 border-sky-600">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full mb-3"></div>

                                    <h3 className="text-lg font-semibold text-center">
                                        PRATAP DAS (Additional Charge)
                                    </h3>

                                    <p className="text-sm text-gray-500 text-center">
                                        Inspector of Labour Commissionerate
                                    </p>

                                    <p className="text-sm text-gray-400 mt-2 mb-2">
                                        EMP ID - 2008001906
                                    </p>
                                </div>

                                {/* <div className="bg-gray-50 mt-4 p-3 rounded text-sm space-y-2">
                                <p><span className="font-semibold">Date of Joining:</span> 14 May 2009</p>
                                <p><span className="font-semibold">Date of Retirement:</span> 28 Feb 2039</p>
                                <p><span className="font-semibold">Contact:</span> 8900267910</p>
                                <p><span className="font-semibold">Email:</span> example@email.com</p>
                            </div> */}
                                <ul className="ml-0">

                                    <li className="relative block px-[15px] py-[10px] bg-white border border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Date of Joining:</p><span className=" text-[#F39C12]">14 May 2009</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Date of Retirement:</p><span className=" text-[#F39C12]">28 Feb 2039</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Contact:</p><span className="text-[#F39C12]">8900267910</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Email:</p>
                                        <span className="text-[#F39C12] break-all max-w-[60%] text-right">
                                            exampleverylongemailaddress@emaildomain.com
                                        </span>
                                    </li>
                                </ul>

                                <button className="w-full mt-4 bg-sky-600 text-white py-2 rounded hover:bg-sky-700 transition">
                                    Edit User Profile
                                </button>
                            </div>
                            <div className="bg-white rounded shadow border-t-4 border-sky-600">
                                <div className="flex flex-col ">
                                    {/* <div className="w-24 h-24 bg-gray-300 rounded-full mb-3"></div> */}

                                    <h3 className="text-left border-b p-3 border-b-[#f4f4f4] pb-3">
                                        About Profile
                                    </h3>
                                </div>

                                {/* <div className="bg-gray-50 mt-4 p-3 rounded text-sm space-y-2">
                                <p><span className="font-semibold">Date of Joining:</span> 14 May 2009</p>
                                <p><span className="font-semibold">Date of Retirement:</span> 28 Feb 2039</p>
                                <p><span className="font-semibold">Contact:</span> 8900267910</p>
                                <p><span className="font-semibold">Email:</span> example@email.com</p>
                            </div> */}
                                <ul className="ml-0">

                                    <li className="relative block px-[15px] py-[10px] bg-white b border-b order border-b-[#ddd] flex flex-col">
                                       <div className="flex gap-1 items-center"> <SiMdbook /><p className="font-semibold">Jurisdiction</p></div><span className="text-[#777]">Jhargram Municipality, Jhargram, Jhargram</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border-b border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Date of Retirement:</p><span className="text-[#777]">28 Feb 2039</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border-b border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Contact:</p><span className="text-[#777]">8900267910</span>
                                    </li>
                                    <li className="relative block px-[15px] py-[10px] bg-white border-b border-b-[#ddd] flex justify-between">
                                        <p className="font-semibold">Email:</p>
                                        <span className="text-[#F39C12] break-all max-w-[60%] text-right">
                                            exampleverylongemailaddress@emaildomain.com
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT DASHBOARD */}
                        <div className="grid grid-cols-3 gap-5 w-3/4">
                            {statsData.map((card, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white rounded border-l border-r py-4 border-t-4 ${idx === 0 ? "border-t border-t-[#00a65a]" : "border-t border-t-[#f39c12]"}`}
                                >
                                    <div className="px-4 flex justify-between items-center">
                                        <h4 className=" font-semibold border-b border-b-[#f4f4f4] text-sm pb-3">
                                            {card.title}
                                        </h4>

                                        <button
                                            onClick={() => toggleCard(idx)}
                                            className="text-gray-500 hover:text-black text-lg font-bold"
                                        >
                                            {collapsed.includes(idx) ? "+" : "−"}
                                        </button>
                                    </div>

                                    {/* <ul className="ml-0 border-t border-t-[#f4f4f4]">
                                        {card.items.map((item, i) => (
                                            // <div
                                            //     key={i}
                                            //     className="flex justify-between items-center text-sm"
                                            // >
                                            //     <span>{item.label}</span>
                                            //     <span
                                            //         className={`text-white text-xs px-2 py-1 rounded-full ${item.color}`}
                                            //     >
                                            //         {item.value}
                                            //     </span>
                                            // </div>
                                            <li className="relative block px-[15px] py-[10px] bg-white flex justify-between border-b border-b-[#f4f4f4]">
                                                <span>{item.label}</span>
                                                <span
                                                    className={`inline-block min-w-[10px] px-[7px] pt-[4px] text-xs font-bold leading-none rounded-[10px] text-center whitespace-nowrap align-baseline text-[#fff] ${item.color}`}
                                                >
                                                    {item.value}
                                                </span>
                                            </li>

                                        ))}
                                    </ul> */}
                                    {!collapsed.includes(idx) && (
                                        <ul className="ml-0 border-t border-t-[#f4f4f4]">
                                            {card.items.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="relative block px-[15px] py-[10px] bg-white flex justify-between border-b border-b-[#f4f4f4]"
                                                >
                                                    <span>{item.label}</span>
                                                    <span
                                                        className={`inline-block min-w-[10px] px-[7px] pt-[4px] text-xs font-bold rounded-[10px] text-white ${item.color}`}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default InspectorView;