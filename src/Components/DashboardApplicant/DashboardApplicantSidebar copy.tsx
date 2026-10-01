import { IMAGE_BASE } from "@/constants/constants";
import React, { FC, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GrDocument } from "react-icons/gr";
import { SiBookstack } from "react-icons/si";
import { MdPower } from "react-icons/md";
import { useDispatch } from "react-redux";
import { FaList, FaUsers, FaUser, FaRegCreditCard, FaPhone, FaKey } from "react-icons/fa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion";
import type { AppDispatch } from "@/store/store";
import { logout } from "@/store/authSlice";
import { getUserName, getUserDetails } from "@/utils/auth";


interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const isActivePath = (pathname: string, to: string) => {
  if (to === "#" || !to) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
};

/** Use for sub-menus where one link path can be a prefix of another; only the best (longest) match is active. */
const isActivePathBestMatch = (pathname: string, to: string, allTosInGroup: string[]) => {
  if (!isActivePath(pathname, to)) return false;
  const hasLongerMatch = allTosInGroup.some(
    (other) => other !== to && (pathname === other || pathname.startsWith(other + "/")) && other.length > to.length
  );
  return !hasLongerMatch;
};

// const CLRA_PE_SUBS = [
//   { to: "/clra-amendment", label: "Amendment of CLRA(PE) Registration Certificate" },
//   { to: "/clra_backlog/clra_registration_type", label: "New Application" },
//   { to: "/clra_backlog", label: "Already Registered" },
// ];

const CONTRACTOR_LICENSE_SUBS = [
  // { to: "/check_fromv_no", label: "Apply new License" },
  { to: "/renewal/old_renewal", label: "Renewal / Amendment of License" },
  { to: "/license-renewal-amendment-list", label: "Application List" },
];

/** Includes `/contractor-license/*` so renewal, amendment & remarks keep the menu section open. */
const CONTRACTOR_LICENSE_ACTIVE_PATHS = [
  ...CONTRACTOR_LICENSE_SUBS.map((s) => s.to),
  "/contractor-license",
];

const BOCWA_SUBS = [{ to: "/bocwa-amendment", label: "Amendment of BOCWA Registration Certificate" },
// { to: "/amendment-bocwa/bocwa-amendment-submit", label: "BOCWA Application" }
];

const MTW_SUBS = [
  // { to: "/mtw-registration", label: "New Registration" },
  { to: "/mtw-reg-checking", label: "Apply for Renewal" },
];

// const ISMW_SUBS = [{ to: "/ismw_application", label: "ISMW Application" }];

const ISMW_LICENSE_SUBS = [
  { to: "/ismw-license-location", label: "New License" },
  { to: "/ismw-employment_license-list", label: "Employment License List" },
  { to: "/ismw_recruitement_license-list", label: "Recruitment License List" },
];

const ANNUAL_RETURN_SUBS = [
  // { to: "/annual-return/wizard", label: "Submission of Return" },
  { to: "/annual-return/list", label: "Annual Return List" },
];

// const NESTED_MENU_SECTIONS: { key: string; paths: string[] }[] = [
//   { key: "clra-pe", paths: CLRA_PE_SUBS.map((s) => s.to) },
//   { key: "contractor-license", paths: CONTRACTOR_LICENSE_ACTIVE_PATHS },
//   { key: "bocwa", paths: BOCWA_SUBS.map((s) => s.to) },
//   { key: "mtw", paths: MTW_SUBS.map((s) => s.to) },
//   { key: "ismw", paths: ISMW_SUBS.map((s) => s.to) },
//   { key: "ismw-license", paths: ISMW_LICENSE_SUBS.map((s) => s.to) },
// ];

/** Includes `/annual-return/*` so the common form & sub-forms keep the section open. */
const ANNUAL_RETURN_ACTIVE_PATHS = [
  ...ANNUAL_RETURN_SUBS.map((s) => s.to),
  "/annual-return",
];

const NESTED_MENU_SECTIONS: { key: string; paths: string[] }[] = [
  { key: "contractor-license", paths: CONTRACTOR_LICENSE_ACTIVE_PATHS },
  { key: "bocwa", paths: BOCWA_SUBS.map((s) => s.to) },
  { key: "mtw", paths: MTW_SUBS.map((s) => s.to) },
  { key: "annual-return", paths: ANNUAL_RETURN_ACTIVE_PATHS },
  // { key: "ismw", paths: ISMW_SUBS.map((s) => s.to) },
  { key: "ismw-license", paths: ISMW_LICENSE_SUBS.map((s) => s.to) },
];

const DashboardApplicantSidebar: FC<HeaderProps> = ({ sidebarOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [showClraAmendmentMenu, setShowClraAmendmentMenu] =
    useState(false);

  const clraPeSubs = [
    ...(showClraAmendmentMenu
      ? [
        {
          to: "/clra-amendment",
          label: "Amendment of CLRA(PE) Registration Certificate",
        },
      ]
      : []),
    // {
    //   to: "/clra_backlog/clra_registration_type",
    //   label: "New Application",
    // },
    {
      to: "/clra_backlog",
      label: "Already Registered",
    },
  ];

  useEffect(() => {
    setShowClraAmendmentMenu(
      sessionStorage.getItem("SHOW_CLRA_AMENDMENT_MENU") === "true"
    );
  }, []);

  const [openSection, setOpenSection] = useState<string | null>(null);

  const isClraPeActive = clraPeSubs.some((s) =>
    isActivePath(pathname, s.to)
  );

  useEffect(() => {
    const updateMenu = () => {
      setShowClraAmendmentMenu(
        sessionStorage.getItem("SHOW_CLRA_AMENDMENT_MENU") === "true"
      );
    };

    updateMenu();

    window.addEventListener(
      "clra-amendment-menu-updated",
      updateMenu
    );

    return () => {
      window.removeEventListener(
        "clra-amendment-menu-updated",
        updateMenu
      );
    };
  }, []);

  const isContractorLicenseActive = CONTRACTOR_LICENSE_ACTIVE_PATHS.some((to) =>
    isActivePath(pathname, to)
  );
  const isBocwaActive = BOCWA_SUBS.some((s) => isActivePath(pathname, s.to));
  const isMtwActive = MTW_SUBS.some((s) => isActivePath(pathname, s.to));
  // const isIsmwActive = ISMW_SUBS.some((s) => isActivePath(pathname, s.to));
  const isAnnualReturnActive = ANNUAL_RETURN_ACTIVE_PATHS.some((to) =>
    isActivePath(pathname, to)
  );
  const isIsmwLicenseActive = ISMW_LICENSE_SUBS.some((s) => isActivePath(pathname, s.to));

  // useEffect(() => {
  //   const active = NESTED_MENU_SECTIONS.find(({ paths }) => paths.some((to) => isActivePath(pathname, to)));
  //   if (active) setOpenSection(active.key);
  // }, [pathname]);

  useEffect(() => {
    const sections = [
      { key: "clra-pe", paths: clraPeSubs.map((s) => s.to) },
      ...NESTED_MENU_SECTIONS,
    ];

    const active = sections.find(({ paths }) =>
      paths.some((to) => isActivePath(pathname, to))
    );

    if (active) {
      setOpenSection(active.key);
    }
  }, [pathname, showClraAmendmentMenu]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const user = getUserDetails();
  const roleNumber = Number(user?.role);

  // TU APPLICANT - Menus
  if (roleNumber === 16) {
    const isTuReturnActive = isActivePath(pathname, "/trade-union/trade-federation-annual-return-form");

    return (
      <div className="bg2 text-white h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="pb-2.5">
          <div className="p-2.5 flex items-center gap-[15px]">
            <img
              src={`${IMAGE_BASE}profile-img-gray.jpg`}
              className="h-[75px] w-[75px] rounded-full border-4 border-gray-500"
              alt="profile"
            />
            <div className="font-semibold leading-none">
              <p className="mb-[9px]">WELCOME</p>
              <p className="pr-[5px] mt-[3px] text-[11px] font-normal">{getUserName()}</p>
            </div>
          </div>
        </div>

        <ul className="list-none m-0 p-1 border-b border-dashed border-[#3a3835] text-gray-400 bg-gray-900">
          <li>
            <Link
              to="/trade-union/trade-federation-annual-return-form"
              className={`block py-3 pl-[15px] mr-px border-l-[3px] text-[13px] transition-colors ${isActivePath(pathname, "/applicant-dashboard") || isActivePath(pathname, "/dashboard")
                ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                }`}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <span className="block py-3 pl-[15px] text-[13px] text-gray-500 cursor-not-allowed opacity-60 select-none">
              User Manual
            </span>
          </li>

          <li>
            <Link
              to="/trade-union/trade-federation-annual-return-form"
              className={`block py-3 pl-[15px] text-[13px] mr-px border-l-[3px] transition-colors ${isTuReturnActive
                ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                }`}
            >
              Annual Return Trade Union
            </Link>
          </li>

          <li>
            <Link
              to="/change-password-applicant"
              className={`block py-3 pl-[15px] text-[13px] mr-px border-l-[3px] transition-colors ${isActivePath(pathname, "/change-password-applicant") || isActivePath(pathname, "/change-password")
                ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                }`}
            >
              Change Password
            </Link>
          </li>

          <li>
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="block py-3 pl-[15px] mr-px text-[13px] border-l-[3px] border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  // CTU - Menus
  if (roleNumber === 22) {
    const isAnnualReturnActive =
      isActivePath(pathname, "/central-trade-union-annual-return-list") ||
      isActivePath(pathname, "/trade-union/tu-fed-final-pdf-central-admin-end");

    return (
      <div className="bg2 text-white h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="pb-2.5">
          <div className="p-2.5 flex items-center gap-[15px]">
            <img
              src={`${IMAGE_BASE}profile-img-gray.jpg`}
              className="h-[75px] w-[75px] rounded-full border-4 border-gray-500"
              alt="profile"
            />
            <div className="font-semibold leading-none">
              <p className="mb-[9px]">WELCOME</p>
              <p className="pr-[5px] mt-[3px] text-[11px] font-normal">{getUserName()}</p>
            </div>
          </div>
        </div>

        <ul className="list-none m-0 p-1 border-b border-dashed border-[#3a3835] text-gray-400 bg-gray-900">
          <li>
            <Link
              to="/dashboard"
              className={`block py-3 pl-[15px] mr-px border-l-[3px] text-[13px] transition-colors ${isActivePath(pathname, "/dashboard")
                ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                }`}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Accordion
              type="single"
              collapsible
              value={openSection === "annual-return" || isAnnualReturnActive ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "annual-return" : null)}
            >
              <AccordionItem value="item-1">
                <AccordionTrigger
                  className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isAnnualReturnActive
                    ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                    : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                    }`}
                >
                  <span className="block flex-1">Annual Return</span>
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                  <ul className="list-none mx-px text-[13px]">
                    <li
                      className={`rounded-[2px] py-2.5 text-white transition-colors ${isAnnualReturnActive ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"
                        }`}
                    >
                      <Link
                        to="/central-trade-union-annual-return-list"
                        className={`px-3 py-1 pl-[15px] block ${isAnnualReturnActive
                          ? "text-white font-medium"
                          : "text-[#8aa4af] hover:text-white hover:font-medium"
                          }`}
                      >
                        List of Annual Return
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>

          {/* <li>
            <span className="block py-3 pl-[15px] text-[13px] text-gray-500 cursor-not-allowed opacity-60 select-none">
              User Manual
            </span>
          </li> */}

          {/* <li>
            <span className="block py-3 pl-[15px] text-[13px] text-gray-500 cursor-not-allowed opacity-60 select-none">
              Auto Forward/Update Info
            </span>
          </li> */}

          <li>
            <Link
              to="/change-password"
              className={`block py-3 pl-[15px] text-[13px] mr-px border-l-[3px] transition-colors ${isActivePath(pathname, "/change-password")
                ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
                }`}
            >
              Change Password
            </Link>
          </li>

          <li>
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="block py-3 pl-[15px] mr-px text-[13px] border-l-[3px] border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg2  text-white h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pb-2.5">
        <div className="p-2.5 flex items-center gap-[15px]">
          <img
            src={`${IMAGE_BASE}profile-img-gray.jpg`}
            className="h-[75px] w-[75px] rounded-full border-4 border-gray-500"
            alt="profile"
          />
          <div className="font-semibold leading-none">
            <p className=" mb-[9px]">WELCOME</p>
            <p className="pr-[5px] mt-[3px] text-[11px] font-normal">{getUserName()}</p>
          </div>
        </div>
      </div>

      <ul className="list-none m-0 p-1 border-b border-dashed border-[#3a3835] text-gray-400 bg-gray-900">
        <li className="">
          <Link
            to="/applicant-dashboard"
            className={`block py-3 pl-[15px] mr-px border-l-[3px] transition-colors ${isActivePath(pathname, "/applicant-dashboard") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
          >
            Dashboard
          </Link>
        </li>

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "clra-pe" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "clra-pe" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isClraPeActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="block flex-1">
                  CLRA (PE)
                </span>
                {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = clraPeSubs.map((s) => s.to);

                    return clraPeSubs.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] block ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "contractor-license" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "contractor-license" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isContractorLicenseActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="block flex-1">
                  Contractor License
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = CONTRACTOR_LICENSE_SUBS.map((s) => s.to);
                    return CONTRACTOR_LICENSE_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white flex transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] block ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "bocwa" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "bocwa" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isBocwaActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="block flex-1">
                  BOCWA
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = BOCWA_SUBS.map((s) => s.to);
                    return BOCWA_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white flex transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] block ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "mtw" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "mtw" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[14px] hover:no-underline [&>svg]:text-current transition-colors ${isMtwActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="block flex-1">
                  MTW
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px ">
                  {(() => {
                    const allTos = MTW_SUBS.map((s) => s.to);
                    return MTW_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] text-[14px] flex ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "annual-return" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "annual-return" : null)}
            className=""
          >
            <AccordionItem value="item-1" className="">
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isAnnualReturnActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="block flex-1">
                  Annual Return
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = ANNUAL_RETURN_SUBS.map((s) => s.to);
                    return ANNUAL_RETURN_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white flex transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] block ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        {/* Trade Union Module - Annual Return */}
        {/* <li className="">
          <Link
            to="/trade-union/trade-federation-annual-return-form"
            className="block py-[12px] pl-[15px] mr-[1px] border-l-transparent"
          >
            Annual Return Trade Union
          </Link>
        </li> */}

        {/* <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "ismw" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "ismw" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isIsmwActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="flex-1 flex gap-2">
                  ISMW
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = ISMW_SUBS.map((s) => s.to);
                    return ISMW_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] flex gap-2 ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li> */}

        {/* Register Record Repository */}
        {/* <li className="">
          <Link
            to="#"
            className="block py-3 pl-[15px] text-[13px] mr-px border-l-transparent gap-2"
          >
            Register Record Repository
          </Link>
        </li> */}

        <li className="">
          <Accordion
            type="single"
            collapsible
            value={openSection === "ismw-license" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "ismw-license" : null)}
            className=""
          >
            <AccordionItem
              value="item-1"
              className=""
            >
              <AccordionTrigger
                className={`mr-px rounded-none border-l-[3px] py-3 pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isIsmwLicenseActive ? "border-l-[#32dff3] bg-[#2c3b41] text-gray-300" : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"}`}
              >
                <span className="flex-1 flex gap-2">
                  ISMW License (Coming Soon)
                </span>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-px text-[13px]">
                  {(() => {
                    const allTos = ISMW_LICENSE_SUBS.map((s) => s.to);
                    return ISMW_LICENSE_SUBS.map((sub) => {
                      const active = isActivePathBestMatch(pathname, sub.to, allTos);
                      return (
                        <li
                          key={sub.to}
                          className={`rounded-[2px] py-2.5 text-white transition-colors ${active ? "bg-[#1e3a47]" : "bg-[#2c3b41] hover:bg-[#1e3a47]"}`}
                        >
                          <Link to={sub.to} className={`px-3 py-1 pl-[15px] flex gap-2 ${active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"}`}>
                            {sub.label}
                          </Link>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        <li className="">
          <Link to="/self-certification-application/list"
            // className="block py-3 pl-[15px] text-[13px] mr-px border-l-transparent gap-2"
            className="
              py-[12px]
              pl-[15px]
              text-[13px]
              mr-[1px]
              border-l-[3px]
              border-l-transparent
              flex items-center gap-2
              text-[#8aa4af]
            "
          >
            Self Certificate Details
          </Link>
        </li>

        <li className="">
          <Link to="/applicant/view-inspection-report"
            // className="block py-3 pl-[15px] text-[13px] mr-px border-l-transparent gap-2"
            className="
              py-[12px]
              pl-[15px]
              text-[13px]
              mr-[1px]
              border-l-[3px]
              border-l-transparent
              flex items-center gap-2
              text-[#8aa4af]
            "
          >
            Inspection Particulars
          </Link>
        </li>

        {/* <li className="">
          <Link
            to="#"
            className="block py-3 pl-[15px] mr-px border-l-[3px] border-l-transparent text-[14px] gap-2"
          >
            Payment Information
          </Link>
        </li>

        <li className="">
          <Link
            to="#"
            className="block py-3 pl-[15px] mr-px border-l-[3px] border-l-transparent text-[14px] gap-2"
          >
            Enquiry/Grievance
          </Link>
        </li> */}

        {/* Trade Union Management */}
        {/* <li className="">
          <Accordion
            type="single"
            collapsible
            // defaultValue="item-1"
            className="space-y-1.5"
          >
            <AccordionItem value="item-1" className="">
              <AccordionTrigger className="">
                <Link
                  to="#"
                  className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex gap-2 no-underline ..."
                  onClick={(e) => e.stopPropagation()}
                >
                  Trade Union Management
                </Link>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                  {[
                    { to: "trade-union-master-list/add-trade-union", label: "Add New Trade Union" },
                    { to: "trade-union-master-list", label: "Register List" },
                    { to: "trade-union-annual-return-list", label: "Annual Return" },
                    { to: "trade-union-return-reg-id", label: "Annual Return Search by Registration No" },
                    { to: "user-by-return-list", label: "Action on Return" },
                  ].map((sub) => (
                    <li
                      key={sub.to}
                      className="rounded-[2px] bg-[#2c3b41] mb-[2px] py-[10px] text-[#fff] text-[13px]"
                    >
                      <Link
                        to={sub.to}
                        className="px-3 py-1 pl-[15px] text-[#8aa4af]  flex gap-2"
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li> */}

        <li className="">
          <Link
            to="/change-password-applicant"
            className="block py-3 pl-[15px] text-[13px] mr-px border-l-[3px] border-l-transparent gap-2"
          >
            Change Password
          </Link>
        </li>

        <li className="">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="block py-3 pl-[15px] mr-px text-[13px] border-l-[3px] border-l-transparent gap-2"
          >
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default DashboardApplicantSidebar;
