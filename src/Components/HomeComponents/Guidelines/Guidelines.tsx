import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
import React from "react";
import Marquee from "react-fast-marquee";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { SquareMenu, ChevronDown, ChevronUp } from "lucide-react";
import { type FC, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../ui/accordion";

/**
 * Resolve a file that lives in `public/` against the app's base path.
 * Vite substitutes BASE_URL as "/" in dev and "/lc/" in the deployed build
 * (see the commented `base: "/lc/"` in vite.config.ts — the current dist is
 * built with it). A root-absolute "/pdfs/..." href would leave the app root and
 * 404 behind the /lc proxy, so always build public links through this.
 */
const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const Guidelines: FC = () => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();

  interface LinkItem {
    text: string;
    link: string;
    isNew: boolean;
  }
  interface NotificationItem {
    text: string;
    link: string;
  }

  // 👉 All your items here (you can mark some as isNew: true)
  const items: LinkItem[] = [
    {
      text: "FAWLOI SELF DECLARATION FOR 2026-27 KOLKATA RLO",
      link: publicAsset("pdfs/FAWLOI-Self-declaration.pdf"),
      isNew: true,
    },
    { text: "Egiye Bangla", link: "https://wb.gov.in", isNew: false },
    {
      text: "Department of Labour, GOWB",
      link: "https://labour.wb.gov.in/",
      isNew: true,
    },
    {
      text: "BMSSY - Bina Mulya Samajik Suraksha Yojana, GOWB",
      link: "https://bmssy.wblabour.gov.in/",
      isNew: true,
    },
    {
      text: "Ministry of Labour & Employment, GOI",
      link: "https://labour.gov.in",
      isNew: true,
    },
    {
      text: "Shram Suvidha",
      link: "https://shramsuvidha.gov.in/",
      isNew: true,
    },
    {
      text: "SASPFUW",
      link: "https://www.saspfuwwb.gov.in",
      isNew: false,
    },
    {
      text: "West Bengal e-District",
      link: "https://edistrict.wb.gov.in",
      isNew: false,
    },
    {
      text: "Shops & Establishments (Kolkata)",
      link: "https://labour.gov.in",
      isNew: false,
    },
    {
      text: "Directorate General of Factory Advice Service & Labour Institute (DGFASLI)",
      link: "http://www.dgfasli.nic.in/welcome.html",
      isNew: false,
    },
    {
      text: "Employee’s Provident Fund Organisation (EPFO)",
      link: "https://www.epfo.gov.in/",
      isNew: false,
    },
    {
      text: "ESI (MB) Scheme, West Bengal",
      link: "https://esiwb.gov.in/main/",
      isNew: false,
    },
    {
      text: "West Bengal Labour Welfare Board",
      link: "https://labour.wb.gov.in/welfare_board/",
      isNew: false,
    },
    {
      text: "Directorate of Employment",
      link: "http://employmentdirectoratewb.gov.in/",
      isNew: false,
    },
    {
      text: "Employment Bank",
      link: "https://employmentbankwb.gov.in/",
      isNew: false,
    },
    {
      text: "Employee's State Insurance Corporation",
      link: "http://esic.gov.in/",
      isNew: false,
    },
    {
      text: "Government of West Bengal – Directorate of Factories",
      link: "https://labour.wb.gov.in/factory/",
      isNew: false,
    },
    {
      text: "Directorate of Boilers",
      link: "https://labour.wb.gov.in/boilers/",
      isNew: false,
    },
    {
      text: "Directorate General of Training",
      link: "https://dgt.gov.in/en",
      isNew: false,
    },
    {
      text: "Bangla Sahayata Kendra",
      link: "https://bsk.wb.gov.in/",
      isNew: true,
    },
  ];
  const notifications: NotificationItem[] = [
    {
      text: " Bonus Order 2018",
      link: "/pdfs/1537949794bonus-order-25-09-2018.pdf",
    },
    {
      text: "Inspectors",
      link: "/inspetors.pdf",
    },
    {
      text: "Registering Authorities",
      link: "/download/registering-authorities.pdf",
    },
    {
      text: "EODB Notice",
      link: "/eodb-notice",
    },
    {
      text: "FAWLOI Notification",
      link: "/fawloi-notice",
    },
    {
      text: "Inspection Checklist",
      link: `/inspection-checklist`,
    },
    {
      text: "Important Notifications",
      link: "/important-notification",
    },
    {
      text: "General Timelines",
      link: "/general-timelines",
    },
    {
      text: "Licence of CLRA",
      link: "/pdfs/AMENDMENT-OF-RULE-27-OF-THE-CONTRACT-LABOUR-ACT.pdf",
    },
  ];
  // 🔁 Seamless auto-scroll.
  // The list is rendered twice (see the ul below), so once the first copy has
  // scrolled past we subtract its height and land on the identical second copy —
  // the loop restarts with no visible jump back to the top. Movement is per
  // animation frame rather than a 40px hop every 2s, so it reads as a smooth crawl.
  const pausedRef = useRef(false);
  // Sub-pixel position is tracked here, not read back from scrollTop: the DOM
  // snaps scrollTop to whole pixels, so accumulating on it loses the fraction
  // each frame and the list barely creeps.
  const offsetRef = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const SPEED = 0.35; // px per frame ≈ 21px/s at 60fps
    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      // Normalise by elapsed time so the speed matches on 120Hz displays too.
      const delta = Math.min((now - last) / 16.67, 3);
      last = now;

      const loopHeight = el.scrollHeight / 2; // height of one copy
      if (!pausedRef.current && loopHeight > 0) {
        offsetRef.current += SPEED * delta;
        // Landing on the identical second copy — no visible jump to the top.
        if (offsetRef.current >= loopHeight) offsetRef.current -= loopHeight;
        el.scrollTop = offsetRef.current;
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Manual nudge that wraps inside the same loop instead of hitting an end. */
  const nudge = (amount: number) => {
    const el = listRef.current;
    if (!el) return;
    const loopHeight = el.scrollHeight / 2;
    let next = offsetRef.current + amount;
    if (loopHeight > 0) {
      if (next < 0) next += loopHeight;
      if (next >= loopHeight) next -= loopHeight;
    }
    offsetRef.current = next;
    el.scrollTop = next;
  };

  // ⬆️ manual scroll up
  const scrollUp = () => nudge(-40);

  // ⬇️ manual scroll down
  const scrollDown = () => nudge(40);

  return (
    <>
      <div className={`bg-[url('/images/header-logo-bg.jpg')] pt-6`}>
        <div className="max-w-5xl mx-auto p-2 flex items-center bg-white rounded px-10">
          {/* Marquee */}
          <Marquee speed={60} direction="left" pauseOnHover gradient={false}>
            <ul className="flex items-center gap-5">
              {/* ITEM 1 — With image */}
              <li className="flex items-center">
                বিনামূল্যে সরকারি পরিষেবা পেতে চলুন
                <span>
                  <a href="#" className="text-[#0897DD] mx-1">
                    বাংলা সহায়তা কেন্দ্রে
                  </a>
                </span>
                অথবা লগ ইন করুন
                <span>
                  <a href="#" className="text-[#0897DD] ms-1">
                    www.bsk.wb.gov.in
                  </a>
                </span>
              </li>
            </ul>
          </Marquee>
        </div>

        <div className="max-w-6xl mx-auto flex items-center py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WHAT IS NEW */}
            <div>
              <Card className="py-0 rounded-none border-0 gap-4 bg-[#e6e6e6eb]">
                <CardHeader className="bg-[#cdc6bb] py-2 pb-0">
                  <CardTitle className="flex items-center gap-2 font-bold text-[#4b3a1f] text-[14px] uppercase">
                    <SquareMenu size={25} />
                    What is New
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-3">
                  <ul
                    ref={listRef}
                    onMouseEnter={() => (pausedRef.current = true)}
                    onMouseLeave={() => (pausedRef.current = false)}
                    className="max-h-[235px] max-w-3xl overflow-hidden space-y-2 text-sm list-disc pl-6"
                  >
                    {/* Rendered twice so the scroll can loop seamlessly; the
                        second pass is hidden from screen readers. */}
                    {[0, 1].map((copy) =>
                      items.map((item, idx) => (
                        <li
                          key={`${copy}-${idx}`}
                          className="relative"
                          aria-hidden={copy === 1 || undefined}
                        >
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            tabIndex={copy === 1 ? -1 : undefined}
                            className="text-[12px] font-bold hover:underline hover:text-[#cc9900] flex items-center gap-2 border-b border-b-[#999] pb-1"
                          >
                            {item.text}
                            {item.isNew && (
                              <img
                                src={`${IMAGE_BASE}newicon.gif`}
                                alt="new"
                                className="w-6 h-4 inline-block"
                              />
                            )}
                          </a>
                        </li>
                      )),
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="flex justify-end gap-1 p-2 border-t border-t-[#b6b6b6] pt-2!">
                  <Button
                    onClick={scrollDown}
                    className="bg-[#adadad] hover:bg-[#eee] group"
                  >
                    <ChevronDown
                      size={20}
                      strokeWidth={5}
                      className="group-hover:stroke-[#4b3a1f]"
                    />
                  </Button>
                  <Button
                    onClick={scrollUp}
                    className="bg-[#adadad] hover:bg-[#eee] group"
                  >
                    <ChevronUp
                      size={20}
                      strokeWidth={5}
                      className="group-hover:stroke-[#4b3a1f]"
                    />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="space-y-1.5"
              >
                {/* IMPORTANT LINKS */}
                <AccordionItem value="item-1" className="bg-white border-0">
                  <AccordionTrigger className="px-3 py-2 bg-[#7a6656] data-[state=open]:bg-[#cc9900] hover:underline data-[state=open]:no-underline font-semibold uppercase text-white rounded-none text-[17px] [&>svg]:hidden cursor-pointer">
                    Important Links
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1 pt-1 max-h-32 overflow-y-auto text-[12px] font-bold ">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Egiye Bangla
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://wblabour.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Department of Labour, GOWB
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://ssy.wblabour.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          SSY – Samajik Suraksha Yojana
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://labour.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Ministry of Labour & Employment
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://efilelabourreturn.gov.in/home"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Shram Suvidha
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.saspfuwwb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          SASPFUW
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://edistrict.wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          West Bengal e-District
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://wbshopsonline.in/"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Shops & Establishments (Kolkata)
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://www.dgfasli.nic.in/welcome.html"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          DGFASLI
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://www.epfindia.com/"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          EPFO
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://esiwb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          ESI MB Scheme
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://wblwb.org/html/index.php"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Labour Welfare Board
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://employmentdirectoratewb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Employment Directorate
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://www.employmentbankwb.gov.in/"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Employment Bank
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://www.esic.nic.in/"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          ESIC
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://wbfactoryonline.in/Home.aspx"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Directorate of Factories
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://wbboilers.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Directorate Boiler
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://www.dget.nic.in/content"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Directorate General of Training
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.bsk.wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Bangla Sahayata Kendra
                        </a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* NOTIFICATION */}
                <AccordionItem value="item-2" className="bg-white border-0">
                  <AccordionTrigger className="px-3 py-2 bg-[#7a6656] data-[state=open]:bg-[#cc9900] hover:underline data-[state=open]:no-underline font-semibold uppercase text-white rounded-none text-[17px] [&>svg]:hidden cursor-pointer">
                    Notification
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1 pt-1 max-h-32 overflow-y-auto text-[12px] font-bold ">
                    <ul className="space-y-2 list-disc pl-5">
                      {notifications?.map?.((item, index) => (
                        <li key={index}>
                          <a
                            href={item?.link}
                            target={
                              item?.link?.endsWith(".pdf") ? "_blank" : "_self"
                            }
                            rel={
                              item?.link?.endsWith(".pdf")
                                ? "noopener noreferrer"
                                : ""
                            }
                            className="hover:text-[#cc9900]"
                          >
                            {item?.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* PUBLICATION */}
                <AccordionItem value="item-3" className="bg-white border-0">
                  <AccordionTrigger className="px-3 py-2 bg-[#7a6656] data-[state=open]:bg-[#cc9900] hover:underline data-[state=open]:no-underline font-semibold uppercase text-white rounded-none text-[17px] [&>svg]:hidden cursor-pointer">
                    Publication
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1 pt-1 max-h-32 overflow-y-auto text-[12px] font-bold ">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <a
                          href="/sites/default/files/labour-in-wb/labour-in-west-bengal-2022-23.pdf"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Labour in West Bengal 2022–23
                        </a>
                      </li>
                      <li>
                        <a
                          href="/sites/default/files/labour-in-wb/labour-in-west-bengal-2015-16.pdf"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Labour in West Bengal 2015–16
                        </a>
                      </li>
                      <li>
                        <a
                          href="/sites/default/files/labour-in-wb/labour-in-west-bengal-2014-15.pdf"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Labour in West Bengal 2014–15
                        </a>
                      </li>
                      <li>
                        <a
                          href="/sites/default/files/labour-in-wb/labour-in-west-bengal-2013-14.pdf"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Labour in West Bengal 2013–14
                        </a>
                      </li>
                      <li>
                        <a
                          href="/download/Synopsis-of-Tea-Garden-Survey-Final-Report.pdf"
                          className="hover:text-[#cc9900]"
                        >
                          Synopsis of Tea Garden Survey
                        </a>
                      </li>
                      <li>
                        <a
                          href="/download/TG-Survey-Final-Report.xls"
                          className="hover:text-[#cc9900]"
                        >
                          TG Survey Final Report
                        </a>
                      </li>
                      <li>
                        <a
                          href="/sites/default/files/contentpdf/1538640751Publication.pdf"
                          className="hover:text-[#cc9900]"
                        >
                          Cold Storage Tripartite Agreement 2018
                        </a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* BOARD MEETINGS */}
                <AccordionItem value="item-4" className="bg-white border-0">
                  <AccordionTrigger className="px-3 py-2 bg-[#7a6656] data-[state=open]:bg-[#cc9900] hover:underline data-[state=open]:no-underline font-semibold uppercase text-white rounded-none text-[17px] [&>svg]:hidden cursor-pointer">
                    Proceedings of Board Meetings
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1 pt-1 max-h-32 overflow-y-auto text-[12px] font-bold ">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <a
                          href={`${FRONTEND_BASE}/board-info/wbuswwb`}
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          WBUSWW Board
                        </a>
                      </li>
                      <li>
                        <a
                          href={`${FRONTEND_BASE}/board-info/wbbocwwb`}
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          WBB & OCWW Board
                        </a>
                      </li>
                      <li>
                        <a
                          href={`${FRONTEND_BASE}/board-info/wbsssb`}
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          WBSSS Board
                        </a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* OTHER ACTIVITIES */}
                <AccordionItem value="item-5" className="bg-white border-0">
                  <AccordionTrigger className="px-3 py-2 bg-[#7a6656] data-[state=open]:bg-[#cc9900] hover:underline data-[state=open]:no-underline font-semibold uppercase text-white rounded-none text-[17px] [&>svg]:hidden cursor-pointer">
                    Other Activities
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1 pt-1 max-h-32 overflow-y-auto text-[12px] font-bold ">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <a
                          href="/sites/default/files/List-of-Special-Schools-under-KCLRWS.pdf"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          NCLP
                        </a>
                      </li>
                      <li>
                        <a
                          href="/tatistical-listing"
                          className="hover:text-[#cc9900]"
                        >
                          Statistics
                        </a>
                      </li>
                      <li>
                        <a
                          href="/schedule/area-wise"
                          className="hover:text-[#cc9900]"
                        >
                          Inspection Schedule (Area Wise)
                        </a>
                      </li>
                      <li>
                        <a
                          href="/schedule/est-wise"
                          className="hover:underline"
                        >
                          Inspection Schedule (Establishment Wise)
                        </a>
                      </li>
                      <li>
                        <a
                          href="/epayments-info/verification"
                          className="hover:text-[#cc9900]"
                        >
                          Payment Status Tracking
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://wbifms.gov.in/GRIPS/grn_status.do"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          Download GRIPS Challan
                        </a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="relative">
              {/* Right Side Images — on md+ the stack is pinned to the row height so the
                  three banners split it evenly and leave no gap below the other columns */}
              <div className="flex flex-col gap-3 md:absolute md:inset-0">
                {/* First Image */}
                <a href="/e-services" className="block flex-1 min-h-0">
                  <img
                    src={`${IMAGE_BASE}eServices-s.jpg`}
                    alt="helpdesk"
                    className="w-full h-[150px] md:h-full object-cover rounded-sm"
                  />
                </a>

                {/* Second Image */}
                <a
                  href="http://bmssy.wblabour.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="block flex-1 min-h-0"
                >
                  <img
                    src={`${IMAGE_BASE}bmssy-new.jpg`}
                    alt="Samajik Suraksha Yojana"
                    className="w-full h-[150px] md:h-full object-cover rounded-sm"
                  />
                </a>

                {/* SLI ONLINE ADMISSION */}
                {/* Router-driven navigation: a plain <a href> reloads the page
                    and leaves the app base path behind (see publicAsset above),
                    so route through the SPA router from the current route. */}
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate("/sli-login")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate("/sli-login");
                    }
                  }}
                  className="relative flex flex-1 min-h-0 items-center gap-3 cursor-pointer overflow-hidden rounded-md bg-[#fffaf0] p-2 ring-2 ring-[#cc9900] shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#7a6656] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#cc9900]"
                >
                  {/* sli-addmission.png is a wide screenshot of the login page and
                      is unreadable at banner size, so the card carries the state
                      emblem as its mark and states the offer in text instead. */}
                  <img
                    src={`${IMAGE_BASE}emblem.png`}
                    alt=""
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="text-[#7a6656] font-bold uppercase text-[12px] leading-tight">
                      State Labour Institute
                    </p>
                    <p className="text-[#cc9900] font-bold uppercase text-[16px] leading-tight">
                      Online Admission
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-block animate-blink bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white rounded-sm shadow-md">
                        Admission Open
                      </span>
                      <span className="text-[11px] font-semibold uppercase text-[#7a6656]">
                        Apply / Login →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Guidelines;
