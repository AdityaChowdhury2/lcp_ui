import React from "react";
import { useState } from "react";
import "./AnnouncementStyle.css";
import Marquee from "react-fast-marquee";

const Announcement = () => {
  return (
    <>
      <div className="w-full bg-[url('/images/MappingBg.jpg')] py-3">
        {/* TOP TICKER */}
        <div className="max-w-6xl mx-auto p-2 flex items-center gap-4 bg-white border border-black rounded-2xl">
          {/* Label */}
          <div className="bg-[#8c4949] text-white px-4 py-2 font-semibold rounded-md text-sm whitespace-nowrap">
            What's New
          </div>

          {/* Marquee */}
          <Marquee speed={50} direction="left" pauseOnHover gradient={false}>
            <ul className="flex items-center gap-5">
              {/* ITEM 1 — With image */}
              <li className="flex items-center ms-5">
                <img
                  src="/images/arrow.png"
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="http://lc.wb.gov.in/sites/default/files/contentpdf/1752582124BROCHURE_merged.pdf"
                  target="_blank"
                  className="text-red-600 font-bold"
                >
                  ADCS and PGDHRD & LW Course Detailed advertisement &
                  guidelines for admission 2025-26
                </a>
              </li>

              {/* ITEM 2 */}
              <li className="flex items-center">
                <img
                  src="/images/arrow.png"
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="https://silpasathi.wb.gov.in"
                  target="_blank"
                  className="text-red-600 font-bold"
                >
                  Signed Notification for Departmental services to deliver
                  mandatory through Silpasathi portal
                </a>
              </li>

              {/* ITEM 3 */}
              <li className="flex items-center">
                <img
                  src="/images/arrow.png"
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="/sites/default/files/contentpdf/UpdatedTelesurveythrough1921.pdf"
                  target="_blank"
                  className="text-red-600 font-bold"
                >
                  Tele Survey from 1921
                </a>
              </li>

              {/* ITEM 4 */}
              <li className="flex items-center">
                <img
                  src="/images/arrow.png"
                  className="h-4 w-4 me-1"
                  alt="arrow"
                />
                <a
                  href="mailto:technicalquery.covid19@gov.in"
                  className="text-red-600 font-bold"
                >
                  For any technical enquiry with respect to COVID19, you may
                  kindly email on technicalquery.covid19@gov.in
                </a>
              </li>
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

      {/* APP VERSION TEXT */}
      <p className="max-w-8xl text-2xl text-red-500 bg-[#ffff00] mt-2">
        Shramashree Mobile App version 1.0 downloaded before 3rd September, 2025
        needs to be upgraded by downloading latest version 2.0 from this
        website. Please contact 1800-103-0009 for further details.
      </p>
    </>
  );
};

export default Announcement;
