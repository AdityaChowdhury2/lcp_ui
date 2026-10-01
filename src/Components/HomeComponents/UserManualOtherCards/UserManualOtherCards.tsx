
// components/UserManualOtherCards.tsx
import React, { type FC } from "react";
import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
import "./UserManualOtherCards.css";
import { Button } from "../../ui/button";

interface ServiceItem {
  id: string;
  img: string;
  title: string;
  desc: string;
  link?: string;
  comingSoon?: boolean;
}

const UserManualOtherCards: FC = () => {
  const services: ServiceItem[] = [
    {
      id: "user-manual-SOP",
      img: `${IMAGE_BASE}user-manual-SOP.jpg`,
      title: "User Manual and SOP",
      desc: "User Manual and Standard Operating Procedure",
      // link: `${FRONTEND_BASE}/user-manual-and-sop`,
      comingSoon: true,
    },
    {
      id: "search-info",
      img: `${IMAGE_BASE}search-info.jpg`,
      title: "Establishment Information",
      desc: "Search Establishment Information",
      // link: `${FRONTEND_BASE}/search-unit-wise-establishment`,
      comingSoon: true,
    },
    {
      id: "trade-union",
      img: `${IMAGE_BASE}trade-union.jpg`,
      title: "Trade Union",
      desc: "Registered Trade Union in West Bengal",
      comingSoon: true,
    },
    {
      id: "view-download",
      img: `${IMAGE_BASE}view-download.jpg`,
      title: "View & Download",
      desc: "View & Download Inspection Note",
      link: `${FRONTEND_BASE}/view-inspection-report`,
      // comingSoon: true,
    },
    // {
    //   id: "report",
    //   img: `${IMAGE_BASE}report.jpg`,
    //   title: "Report(EODB)",
    //   desc: "Report on Ease of Doing Business",
    //   link: "/report-eodb",
    // },
    // {
    //   id: "minimum-wages",
    //   img: `${IMAGE_BASE}minimum-wages.jpg`,
    //   title: "Minimum Wages",
    //   desc: "Minimum Wages",
    //   link: "/min-wages-act",
    //   // comingSoon: true,
    // },

    {
      id: "report",
      img: `${IMAGE_BASE}report.jpg`,
      title: "Report(EODB)",
      desc: "Report on Ease of Doing Business",
      link: `${FRONTEND_BASE}/report-eodb`,
    },
    {
      id: "minimum-wages",
      img: `${IMAGE_BASE}minimum-wages.jpg`,
      title: "Minimum Wages",
      desc: "Minimum Wages",
      link: `${FRONTEND_BASE}/min-wages-act`,
      // comingSoon: true,
    },
  ];

  const handleCardClick = (item: ServiceItem) => {
    if (item.comingSoon) return;

    if (item.link) {
      window.location.href = item.link;
    }
  };

  return (
    <div id="services" className="py-8">
      <div className="max-w-6xl mx-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => (
            <li key={item.id}>
              <figure
                onClick={() => handleCardClick(item)}
                className={`
                  group relative overflow-hidden
                  shadow-md bg-white 
                  transition-transform duration-300
                  ${item.comingSoon
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                  }
                `}
              >
                {/* Image */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />

                {/* Sliding / Expanding Panel */}
                <figcaption
                  className="
                    absolute left-0 w-full bg-[#000000cc] text-white
                    transition-all duration-500 slide-in-from-bottom
                    h-[20%] bottom-0 flex items-center justify-center
                    group-hover:h-full group-hover:bottom-0 
                    group-hover:flex-col group-hover:justify-center group-hover:gap-3
                  "
                >
                  {/* Title */}
                  <h3 className="text-lg font-bold uppercase text-center px-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="hidden group-hover:block text-[16px] text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 px-5">
                    {item.desc}
                  </p>

                  {/* Button */}
                  <Button
                    className={`
                      hidden group-hover:flex opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500 
                      px-5 py-2 uppercase text-white
                      ${item.comingSoon
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#cc9900] hover:bg-[#d5aca4] hover:text-black"
                      }
                    `}
                  >
                    {item.comingSoon ? "Coming Soon" : "Click Here"}
                  </Button>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManualOtherCards;




