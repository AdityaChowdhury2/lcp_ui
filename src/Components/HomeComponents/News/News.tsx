import React, { FC } from "react";
import Marquee from "react-fast-marquee";
import { IMAGE_BASE } from "@/constants/constants";

const News:FC = () => {

  interface scrollingItemsProps {
img:string,
title:string,
link:string | null
  }

  const scrollingItems:scrollingItemsProps[] = [
    {
      img: `${IMAGE_BASE}modal1.png`,
      title: "Bangla Sahayata Kendra",
      link: "https://www.bsk.wb.gov.in",
    },
    {
      img: `${IMAGE_BASE}shilpasathi.jpg`,
      title: "Silpa Sathi",
      link: "https://silpasathi.wb.gov.in",
    },
    {
      img: `${IMAGE_BASE}labour-bureau,-govt-of-india.jpg`,
      title: "Labour Bureau, Govt. of India",
      link: "http://labourbureau.gov.in",
    },
    {
      img: `${IMAGE_BASE}ministry-of-labour-and-employment.jpg`,
      title: "Ministry of Labour & Employment",
      link: "http://labour.gov.in",
    },
    {
      img: `${IMAGE_BASE}v.v.-giri-national-labour-institute.jpg`,
      title: "V.V. Giri National Labour Instutite",
      link: "https://vvgnli.gov.in/",
    },
    {
      img: `${IMAGE_BASE}international-labour-rganization.jpg`,
      title: "International Labour Organization",
      link: "http://www.ilo.org/global/about-the-ilo/lang--en/index.htm",
    },
    {
      img: `${IMAGE_BASE}ebangla.jpg`,
      title: "Egiye Bangla",
      link: "https://wb.gov.in",
    },
    {
      img: `${IMAGE_BASE}registered-trade-union-in-WB.jpg`,
      title: "Registered Trade Union in WB",
      link: "/search-registered-trade-union",
    },
    {
      img: `${IMAGE_BASE}shramik-sathi.jpg`,
      title: "Toll Free : 1800-103-0009",
      link: null,
    },
    {
      img: `${IMAGE_BASE}shramik-barta.jpg`,
      title: "Shramik Barta",
      link: "/shramik-barta",
    },
    {
      img: `${IMAGE_BASE}photo-gallery.jpg`,
      title: "Photo Gallery",
      link: "/gallery",
    },
  ];

  return (
    <>
      <div id="contact" className="py-3 bg-[#d7d2d280]">
        <div className="max-w-6xl mx-auto px-4">
          <Marquee speed={40} pauseOnHover={true} gradient={false}>
            <ul className="flex items-center gap-1">
              {scrollingItems.map((item, index) => (
                <li key={index}>
                  <div className="relative w-60 h-[120px] ms-5">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-fill"
                        />
                      </a>
                    ) : (
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-fill"
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute bottom-0 left-0 w-full bg-[#3a2310] text-white text-sm font-semibold p-1 text-center">
                      {item.title}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Marquee>
        </div>
      </div>
    </>
  );
};

export default News;
