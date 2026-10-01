import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
// components/UserManualOtherCards.tsx
import React, { type FC, useState } from "react";
import { Button } from "../../Components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface ServiceItem {
  id: string;
  img: string;
  title: string;
  title2: string;
  subTitle: string;
  link: string;
  isGuideLineButtonVisible: boolean;
  isGuideLineButtonTextDifferent: boolean;
  isApplyBtnTextDifferent: boolean;

  guideLineButtonText?: string;
  applyButtonText?: string;

  guideLineLink?: string;
  applyLink?: string;
}

const EServices: FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedTitle2, setSelectedTitle2] = useState("");
  const services: ServiceItem[] = [
    {
      id: "user-manual-SOP",
      img: `${IMAGE_BASE}logo-regs.png`,
      title: "Registration",
      title2: "of Principal Employer",
      subTitle: "under The Contract Labour (Regulation & Abolition) Act 1970.",
      link: `${FRONTEND_BASE}/user-manual-and-sop`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "search-info",
      img: `${IMAGE_BASE}logo-regs.png`,
      title: "Amendment",
      title2: " of Registration Certificate",
      subTitle: "for Principal Employers under The Contract Labour (Regulation & Abolition) Act 1970.",
      link: `${FRONTEND_BASE}/search-unit-wise-establishment`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "trade-union",
      img: `${IMAGE_BASE}logo-licence-contractor.png`,
      title: "Licensing",
      title2: " for Contractors",
      subTitle: "under The Contract Labour (Regulation & Abolition) Act 1970.",
      link: "/search-registered-trade-union",
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "view-download",
      img: `${IMAGE_BASE}logo-licence-contractor.png`,
      title: "Renewal",
      title2: " of License for Contractors",
      subTitle: "under The Contract Labour (Regulation & Abolition) Act 1970.",
      link: `${FRONTEND_BASE}/view-inspection-report`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "report",
      img: `${IMAGE_BASE}logo-licence-contractor.png`,
      title: "Amendment of ",
      title2: "License for Contractors",
      subTitle: "under The Contract Labour (Regulation & Abolition) Act 1970.",
      link: `${FRONTEND_BASE}/labourreport`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-regs.png`,
      title: "Registration of ",
      title2: "Principal Employers",
      subTitle: "under The Inter State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979",
      link: `${FRONTEND_BASE}/min-wages-act`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-regs.png`,
      title: "Licence of ",
      title2: "Contractors",
      subTitle: "under The Inter State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979",
      link: `${FRONTEND_BASE}/min-wages-act`,
      isGuideLineButtonVisible: false,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-building.png`,
      title: "Registration",
      title2: " of Establishments",
      subTitle:
        "under Building and Other Construction Workers (Regulation of Employment and Conditions of Service) Act, 1996.",
      link: `${FRONTEND_BASE}/min-wages-act`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-mtw.png`,
      title: "Registration of",
      title2: " Motor Transport undertaking",
      subTitle: "under Motor Transport Workers Act, 1961",
      link: `${FRONTEND_BASE}/min-wages-act`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: true,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-mtw.png`,
      title: "Renewal of",
      title2: " Registration Certificate",
      subTitle: "for Motor Transport Undertaking under Motor Transport Workers Act, 1961",
      link: `${FRONTEND_BASE}/min-wages-act`,
      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-labour-law.png`,
      title: "Submission of returns",
      title2: "",
      subTitle: "under Various Labour Laws",
      link: "#",
      isGuideLineButtonVisible: false,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
      applyLink: "/applicant-login",
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-contract-labour.png`,
      title: "View and download",
      title2: " inspection note",
      subTitle: "under Various Labour Laws",
      link: "#",
      isGuideLineButtonVisible: false,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,
      applyLink: "/applicant-login",
    },
    {
      id: "trade-union-annual-return",
      img: `${IMAGE_BASE}logo-trade-union.png`,
      title: "Annual Return of",
      title2: "Trade Union / Federation",
      subTitle: "under Trade Union Act, 1926",

      link: "#",

      isGuideLineButtonVisible: true,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,

      guideLineButtonText: "Register",
      applyButtonText: "Apply",

      guideLineLink: "/trade-union/register",
      applyLink: "/applicant-login",
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}logo-principal-emp.png`,
      title: "Registration, ",
      title2: " Renewal, Amendment etc.",
      subTitle: "under West Bengal Shop and Establishment Act, 1963",
      link: "#",
      isGuideLineButtonVisible: false,
      isGuideLineButtonTextDifferent: false,
      isApplyBtnTextDifferent: false,

      applyLink: "https://wbshopsonline.gov.in/",
    },
  ];

  const navigate = useNavigate();

  const handleCardClick = (link: string) => {
    // if (link.startsWith("http")) {
    //   window.location.href = link;
    // } else {
    //   navigate(link);
    // }

    navigate(link);
  };
const handleOpenModal = (title: string, title2: string) => {
  setSelectedTitle(title);
  setSelectedTitle2(title2);
  setOpenModal(true);
};
  return (
    <div id="services" className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="mt-[20px] mb-[10px] text-[36px] text-italic">e-services</h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => (
            <li key={item.id} className="mb-[30px] relative">
              <div
                onClick={() => handleCardClick(item.link)}
                className="
                  min-h-[300px] p-[2px] bg-gradient-to-b from-[#f0d06f] to-[#e4a057]
                "
              >
                {/* Image */}

                <div className="rounded-full w-[84px] h-[84px] mx-auto my-3 text-center p-[7px] bg-white/30">
                  <img src={item.img} alt="" className="align-middle" />
                </div>

                <h1 className="text-[#2d0a0a] text-[16px] font-[700] text-center mb-[12px]">
                  {item.title} <br />
                  {item.title2}
                </h1>
                <p className="text-white text-[14px] font-normal mb-[15px] leading-[20px] px-[15px] text-center [text-shadow:1px_1px_0_#666]">
                  {item.subTitle}
                </p>
              </div>
              <div className="absolute bottom-[10px] w-[98%]">
                {item.isGuideLineButtonVisible && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (item.guideLineLink) {
                        navigate(item.guideLineLink);
                      } else {
                        handleOpenModal(item.title, item.title2);
                      }
                    }}
                    className="
        float-left
        bg-[url('/images/btn-eservice.png')]
        bg-no-repeat bg-left-top
        w-[116px]
        h-[38px]
        text-[14px]
        text-center
        font-normal
        text-[#432702]
        leading-[38px]
        inline-block
      "
                  >
                    {item.guideLineButtonText || (item.isGuideLineButtonTextDifferent ? "User Guide" : "Guideline")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (item.applyLink) {
                      if (item.applyLink.startsWith("http")) {
                        window.open(item.applyLink, "_blank");
                      } else {
                        navigate(item.applyLink);
                      }
                    } else {
                      handleOpenModal(item.title, item.title2);
                    }
                  }}
                  className="
      float-right
      bg-[url('/images/btn-eservice.png')]
      bg-no-repeat bg-left-top
      w-[88px]
      h-[38px]
      text-[14px]
      text-center
      font-normal
      text-[#432702]
      leading-[38px]
      inline-block
    "
                >
                  {item.applyButtonText || (item.isApplyBtnTextDifferent ? "Data Entry" : "Apply")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative">
            <button onClick={() => setOpenModal(false)} className="absolute top-2 right-3 text-2xl font-bold">
              ×
            </button>

            <div className="text-[16px] leading-7 mt-5">
              To Apply
              <span className="text-base mx-2 font-semibold">
                {selectedTitle} {selectedTitle2}
              </span>
              visit Silpasathi Portal
            </div>

            <a
              href="https://silpasathi.wb.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="float-right
      bg-[url('/images/btn-eservice.png')]
      bg-no-repeat bg-left-top
      w-[88px]
      h-[38px]
      text-[14px]
      text-center
      font-normal
      text-[#432702]
      leading-[38px]
      inline-block"
            >
              Click Here
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EServices;
