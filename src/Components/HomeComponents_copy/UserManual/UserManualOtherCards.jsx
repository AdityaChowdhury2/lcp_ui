// components/HomeCards.tsx
import React from "react";

const UserManualOtherCards = () => {
  const cards = [
    {
      title: "USER MANUAL AND SOP",
      subtitle: "User Manual and Standard Operating Procedure",
      bgImage: "/images/user-manual-SOP.jpg",
    },
    {
      title: "ESTABLISHMENT INFORMATION",
      bgImage: "/images/establishment.png",
    },
    {
      title: "TRADE UNION",

      bgImage: "/images/trade-union.jpg",
    },
    { title: "VIEW & DOWNLOAD", bgImage: "/images/view-download.jpg" },
    { title: "REPORT(EODB)", bgImage: "/images/report.jpg" },
    { title: "MINIMUM WAGES", bgImage: "/images/minimum-wages.jpg" },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
        {cards.map((card, index) => (
          <div
            key={index}
            className="relative overflow-hidden  shadow-xl cursor-pointer group"
            style={{
              backgroundImage: `url(${card.bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "236px",
            }}
          >
            {/* Bottom bar that slides up on hover */}
            <div
              className="absolute inset-x-0 bottom-0 bg-black/70 transform translate-y-1/3 
                            group-hover:translate-y-0 transition-transform duration-500 ease-out 
                            flex flex-col items-center justify-center"
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl font-normal tracking-wide uppercase text-white py-8 px-4 text-center">
                {card.title}
              </h3>
              <p
                className="text-sm md:text-base text-gray-200 opacity-0 group-hover:opacity-100 
                             transition-opacity duration-500 delay-100"
              >
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManualOtherCards;
