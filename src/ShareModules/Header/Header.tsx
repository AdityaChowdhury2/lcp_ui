import { IMAGE_BASE } from "@/constants/constants";
import React, { useState, useEffect, type FC } from "react";
import { Menu, Search, Phone, Languages } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderStyle.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu"; // note: "components", not "Components"

const Header: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();
  const isBocwCessPage = location.pathname.startsWith("/bocwcess");
  const logoImage = isBocwCessPage ? `${IMAGE_BASE}bocw_cess_logo.png` : `${IMAGE_BASE}lc_logo.png`;

  React.useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = function () {
      const { google } = window;
      if (!google?.translate?.TranslateElement) return;

      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,bn",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>

      {/* GOOGLE TRANSLATE STYLE (widget itself lives in the navbar below) */}
      <style>
        {`
            #google_translate_element {
              line-height: 0;
            }

              .goog-te-gadget {
                font-size: 0 !important;
                display: flex !important;
                align-items: center !important;
                overflow: visible !important;
              }

            .goog-te-gadget .goog-te-combo {
              margin: 0 !important;
              height: 30px !important;
              padding: 0 12px !important;
              border-radius: 2px !important;
              border: 1px solid #8a5a2b !important;
              background: #3b1d01 !important;
              color: #e1d4b0 !important;
              cursor: pointer;
              font-size: 13px !important;
              outline: none !important;
              min-width: 170px;
            }

            .goog-te-gadget .goog-te-combo:hover {
              background: #4d2703 !important;
            }

              .goog-logo-link {
                display: none !important;
              }

              .goog-te-gadget span {
                display: none !important;
              }

              .goog-te-banner-frame.skiptranslate {
                display: none !important;
              }

              iframe.goog-te-banner-frame {
                display: none !important;
              }

              iframe.goog-te-menu-frame {
                z-index: 999999 !important;
              }

              .goog-te-menu-frame {
                z-index: 999999 !important;
              }

              .skiptranslate {
                z-index: 999999 !important;
              }

            body {
              top: 0 !important;
            }
          `}
      </style>

      {/* Top bar */}
      {!isBocwCessPage && (
        <div className="bg-[#1c1103]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap justify-between">
              <div className="flex gap-1 text-white items-center blink">
                <Phone className="w-5 h-5 fill-current stroke-0" />
                <a
                  href="tel:+9118001030009"
                  className="hover:underline text-[20px]"
                >
                  1800-103-0009
                </a>
              </div>

              <div className="flex flex-wrap gap-1">
                <ul className="flex gap-2 items-center text-white">
                  <li>
                    <Link
                      to="/otplogin"
                      className="hover:underline hover:text-[#e1d4b0] gap-2"
                    >
                      Login Via OTP
                    </Link>
                  </li>
                  <li className="border-r h-full" />
                  <li>
                    <Link to="/applicant-login?usertype=user" className="hover:underline hover:text-[#e1d4b0]">
                      Login
                    </Link>
                  </li>
                  <li className="border-r h-full" />
                  {/* <li>
                  <Link to="/applicant-register" className="hover:underline hover:text-[#e1d4b0]">
                    Register
                  </Link>
                </li> */}
                  {/* <li className="border-r h-full" /> */}
                </ul>

                <ul className="flex items-center gap-2 text-[#e1d4b0]">
                  <li>
                    <a href="#" className="hover:text-white">
                      -A
                    </a>
                  </li>
                  <li className="border-r h-full" />
                  <li>
                    <a href="#" className="hover:text-white">
                      A
                    </a>
                  </li>
                  <li className="border-r h-full" />
                  <li>
                    <a href="#" className="hover:text-white">
                      +A
                    </a>
                  </li>
                  <li className="border-r h-full" />
                  <li className="text-center bg-gray-100 text-[#1c1103]">
                    <a href="#" className="p-1">
                      A
                    </a>
                  </li>
                  <li className="border-r h-full" />
                  <li>
                    <a href="#" className="hover:text-white">
                      Screen Reader
                    </a>
                  </li>
                  <li className="border-r h-full" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main header + nav */}
      <nav className="relative z-10 bg-[#0c3086] pt-1 pb-0 shadow-sm bg-[url('/images/header_bg.png')] bg-cover bg-center bg-no-repeat w-full">

        {/* HEADER CONTENT */}
        <div className="max-w-7xl mx-auto px-4">

          {/* TOP ROW */}
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <Link to="/" className="flex items-center">
              <img alt="Home" className="h-24" src={logoImage}></img>
            </Link>

            {/* MOBILE TOGGLE */}
            {!isBocwCessPage && (
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="lg:hidden p-2 text-white"
              >
                <Menu />
              </button>
            )}
          </div>
        </div>

        {/* FULL WIDTH NAVBAR */}
        {!isBocwCessPage && (
          <div
            className={`${open ? "block" : "hidden"} lg:block w-full bg-[#5a3206]`}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* MENU */}
              <ul className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 text-white font-normal">

                {/* ACTS & RULES */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/">Home</Link>
                </li>
                {/* ACTS & RULES */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/acts-rules">Acts &amp; Rules</Link>
                </li>

                {/* E-SERVICES */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/e-services">E-services</Link>
                </li>

                {/* RTI */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/right-to-information">RTI</Link>
                </li>

                {/* TENDER */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/tender">Tender</Link>
                </li>

                {/* BUDGET */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/budget">Budget</Link>
                </li>

                {/* EODB */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/eodb-dashboard">EODB Dashboard</Link>
                </li>

                {/* CONTACT */}
                <li className="hover:text-[#ffd28a] transition-all duration-200">
                  <Link to="/contactinfo">Contact Us</Link>
                </li>

                {/* STAFF LOGIN */}
                <li>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer hover:text-[#ffd28a] transition-all duration-200">
                      Staff Login ▾
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="bg-[#3b1d01] border-0 text-gray-300 rounded-none"
                    >
                      <DropdownMenuItem className="border-b border-dashed rounded-none border-[#654a2d] bg-[#3b1d01] focus:bg-transparent focus:text-[#e2c26d]">
                        <Link to="/applicant-login?usertype=staff">
                          Admin Login
                        </Link>
                      </DropdownMenuItem>

                      {/* <DropdownMenuItem className="rounded-none bg-[#3b1d01] focus:bg-transparent focus:text-[#e2c26d]">
                      <Link to="/employee-login">
                        HRMS Verification
                      </Link>
                    </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              </ul>

              {/* RIGHT SIDE OF NAVBAR */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">

                {/* MOBILE SEARCH */}
                <div className="lg:hidden flex items-center border border-white/40 px-3 py-2 bg-white/10">
                  <input
                    type="text"
                    placeholder="Search"
                    className="outline-none bg-transparent text-white placeholder:text-[#d6b38a] px-1 w-full"
                  />

                  <Search size={18} color="white" />
                </div>

                {/* LANGUAGE SELECTOR */}
                <div className="flex items-center gap-2 overflow-visible">
                  <Languages className="w-4 h-4 text-[#e1d4b0]" />
                  <div id="google_translate_element" className="overflow-visible"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
