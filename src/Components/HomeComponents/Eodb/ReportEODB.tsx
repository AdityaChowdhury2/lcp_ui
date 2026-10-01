import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/constants/constants";

interface EodbDashboardResponse {
    principalEmployerClra: {
        registration: number;
        amendment: number;
        display: string;
    };
    contractorLicenseClra: {
        issued: number;
        display: string;
    };
    contractorLicenseRenewalClra: {
        issued: number;
        display: string;
    };
    establishmentRegistrationBocwa: {
        registration: number;
        amendment: number;
        display: string;
    };
    mtwRegistration: {
        registration: number;
        renewal: number;
        display: string;
    };
    ismwRegistration: {
        registered: number;
        display: string;
    };
    registeredTradeUnion: {
        registered: number;
        display: string;
    };
}

export default function ReportEODB() {

    const [dashboardData, setDashboardData] = useState<EodbDashboardResponse | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}eodb/dashboard`
                );

                if (response.data?.code === 200) {
                    setDashboardData(response.data.result);
                }
            } catch (error) {
                console.error("EODB Dashboard API Error:", error);
            }
        };

        fetchDashboard();
    }, []);

    const data = [
        {
            title: "Principal Employer under CLRA",
            desc: "Regi./Amend. Issued Application",
            value: dashboardData?.principalEmployerClra?.display ?? "",
            link: "/clrareport",
        },
        {
            title: "Contractor license under CLRA",
            desc: "Issued Application",
            value: dashboardData?.contractorLicenseClra?.display ?? "",
            link: "/clralincnreport",
        },
        {
            title: "Renewal of contractor license under CLRA",
            desc: "Issued Application",
            value: dashboardData?.contractorLicenseRenewalClra?.display ?? "",
            link: "/clralinrenewalreport",
        },
        {
            title: "Establishment registration under BOCWA",
            desc: "Reg. / Amend. Application",
            value: dashboardData?.establishmentRegistrationBocwa?.display ?? "",
            link: "/bocwareport",
        },
        // {
        //     title: "Area wise view and download Inspection Report",
        //     desc: "Total Application",
        //     value: "24962",
        //     link: "/inspectionreport",
        // },
        // {
        //     title: "Acts wise inspection reports",
        //     desc: "Total Application",
        //     value: "24962",
        //     link: "/inspectionstrep",
        // },
        // {
        //     title: "Acts & services wise establishment info",
        //     desc: "",
        //     value: "",
        //     link: "/search-act-and-area-wise-establishment-registration-information",
        // },
        // {
        //     title: "Nature of work wise contractor info",
        //     desc: "Total Registered Contractor",
        //     value: "17129",
        //     link: "/register-contractor-information",
        // },
        {
            title: "Registered Trade Union info",
            desc: "Total Registered Trade Union",
            value: dashboardData?.registeredTradeUnion?.display ?? "",
            link: "/search-registered-trade-union",
        },
        {
            title: "MTW Registration",
            desc: "Registration / Renewal of Application",
            value: dashboardData?.mtwRegistration?.display ?? "",
            link: "/mtwreport",
        },
        {
            title: "ISMW Registration",
            desc: "Issued Application",
            value: dashboardData?.ismwRegistration?.display ?? "",
            link: "/ismwreport",
        },
        // {
        //     title: "EODB Dashboard",
        //     desc: "Online Dashboard for EODB e-services",
        //     value: "",
        //     link: "/eodb-dashboard",
        // },
        // {
        //     title: "EODB Notice",
        //     desc: "Notification of Ease of doing business",
        //     value: "",
        //     link: "/eodb-notice",
        // },
        // {
        //     title: "Feedback",
        //     desc: "Feedback on Draft Regulation",
        //     value: "",
        //     link: "/feedback-draft",
        // },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">

            {/* TITLE */}
            <h1 className="text-2xl md:text-3xl font-semibold mb-6">
                Dashboard
            </h1>

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

                {data.map((item, i) => (
                    <a
                        key={i}
                        // href={item.link}
                        className="relative group block border border-[#d8b79c] shadow-sm 
  bg-[url('/images/report_bg.jpg')] bg-cover bg-center 
  transition-all duration-300 overflow-hidden
  hover:shadow-lg hover:-translate-y-1"
                    >
                        {/* OVERLAY (LIGHT → DARK) */}
                        <div className="absolute inset-0 
  transition-all duration-300 
  group-hover:bg-[#4b3f33]/90"></div>

                        {/* CONTENT */}
                        <div className="relative z-10 text-center px-4 py-6">

                            {/* TITLE */}
                            <h4 className="text-sm font-semibold text-black mb-4 
    transition duration-300 
    group-hover:text-white">
                                {item.title}
                            </h4>

                            {/* DESCRIPTION */}
                            <div className="text-xs italic text-gray-800 mb-2 
    transition duration-300 
    group-hover:text-gray-200">
                                {item.desc || "\u00A0"}
                            </div>

                            {/* VALUE */}
                            <div className="text-base font-bold text-black mb-4 
    transition duration-300 
    group-hover:text-yellow-400 group-hover:scale-110">
                                {item.value || "\u00A0"}
                            </div>

                            {/* BUTTON */}
                            {/* <span className="inline-block bg-[#5a4a3d] text-white text-xs px-3 py-1 
    transition duration-300 
    group-hover:bg-yellow-600 group-hover:text-white">
                                VIEW DETAILS
                            </span> */}

                        </div>
                    </a>
                ))}

            </div>
        </div>
    );
}