import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
import React, { FC } from "react";
import Marquee from "react-fast-marquee";
import "./AnnouncementStyle.css";

const Announcement: FC = () => {
  return (
    <>
      {/* TOP TICKER */}
      <div className={`w-full bg-[url('/images/MappingBg.jpg')] py-3`}>
        <div className="max-w-6xl mx-auto p-2 flex items-center gap-4 bg-white border border-black rounded-2xl">
          {/* Label */}
          <div className="bg-[#8c4949] text-white px-4 py-2 font-semibold rounded-md text-sm whitespace-nowrap">
            What's New
          </div>

          {/* Marquee Content */}
          <Marquee speed={50} direction="left" pauseOnHover gradient={false}>
            <ul className="flex items-center gap-5">
              {/* ITEM 1 */}
              <li className="flex items-center ms-5">
                <img
                  src={`${IMAGE_BASE}arrow.png`}
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href={`${FRONTEND_BASE}/sites/default/files/contentpdf/1752582124BROCHURE_merged.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold"
                >
                  ADCS and PGDHRD & LW Course Detailed advertisement &
                  guidelines for admission 2025-26
                </a>
              </li>

              {/* ITEM 2 */}
              <li className="flex items-center">
                <img
                  src={`${IMAGE_BASE}arrow.png`}
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="https://silpasathi.wb.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold"
                >
                  Signed Notification for Departmental services to deliver
                  mandatory through Silpasathi portal
                </a>
              </li>

              {/* ITEM 3 */}
              {/* <li className="flex items-center">
                <img
                  src={`${IMAGE_BASE}arrow.png`}
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="/sites/default/files/contentpdf/UpdatedTelesurveythrough1921.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold"
                >
                  Tele Survey from 1921
                </a>
              </li> */}

              {/* ITEM 4 */}
              {/* <li className="flex items-center">
                <img
                  src={`${IMAGE_BASE}arrow.png`}
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="mailto:technicalquery.covid19@gov.in"
                  className="text-red-600 font-bold"
                >
                  For any technical enquiry regarding COVID-19, email:
                  technicalquery.covid19@gov.in
                </a>
              </li> */}
            </ul>
          </Marquee>
        </div>
      </div>

      {/* DOWNLOAD TICKER */}
      <div className="w-full bg-[#ffff00]">
        <Marquee speed={50} direction="left" gradient={false}>
          <h4 className="text-red-500 text-2xl font-medium">
            <b>Shramashree Mobile App Only For Android Users.</b>
            <a
              href="#"
              className="text-black hover:underline hover:text-[#C90] ms-1"
            >
              <strong>Click Here To Download.</strong>
            </a>
          </h4>
        </Marquee>
      </div>

      {/* CM / HMIC IMAGE */}
      {/* <div className="w-full flex justify-center py-5 bg-[url('/images/header-logo-bg.jpg')]">
        <img
          src={`${IMAGE_BASE}CM_image.png`}
          alt="CM HMIC"
          className=" max-w-full h-auto object-contain"
        />
      </div> */}

      {/* Version Notice */}
      <p className="max-w-8xl text-2xl text-red-500 bg-[#ffff00]">
        Shramashree Mobile App version 1.0 downloaded before 3rd September, 2025
        requires an update. Please download latest version 2.0. For support,
        call 1800-103-0009.
      </p>
    </>
  );
};

export default Announcement;
