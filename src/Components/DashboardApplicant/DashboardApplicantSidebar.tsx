import { IMAGE_BASE } from "@/constants/constants";
import React, { FC, memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GrDocument } from "react-icons/gr";
import { SiBookstack } from "react-icons/si";
import { MdPower, MdClose } from "react-icons/md";
import { ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  FaList,
  FaUsers,
  FaKey,
  FaHome,
  FaClipboardList,
  FaSearch,
  FaIdCard,
  FaRegCreditCard,
  FaPen,
  FaRedo,
  FaPlus,
  FaBriefcase,
  FaFileAlt,
} from "react-icons/fa";
import type { AppDispatch } from "@/store/store";
import { logout } from "@/store/authSlice";
import { getUserName, getUserDetails } from "@/utils/auth";

interface SidebarProps {
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

type SubItem = {
  to: string;
  label: string;
  icon?: React.ReactNode;
};

const navItemClass = (active: boolean) =>
  `flex min-w-0 max-w-full items-center gap-2.5 py-2.5 px-3 border-l-[3px] text-[13px] transition-colors overflow-hidden ${
    active
      ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
      : "border-l-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white"
  }`;

const triggerClass = (active: boolean) =>
  `mr-[1px] flex w-full min-w-0 max-w-full cursor-pointer items-center justify-between gap-2 rounded-none border-l-[3px] py-[12px] pl-[15px] pr-2 text-left text-[13px] transition-colors ${
    active
      ? "border-l-[#32dff3] bg-[#2c3b41] text-white [&>svg]:text-[#32dff3]"
      : "border-l-transparent bg-transparent text-gray-400 hover:border-l-[#32dff3] hover:bg-[#2c3b41] hover:text-white [&>svg]:text-current"
  }`;

const MenuLabel: FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
    <span className="shrink-0">{icon}</span>
    <span className="min-w-0 truncate">{children}</span>
  </span>
);

const WelcomeBlock = memo(function WelcomeBlock({ subtitle }: { subtitle: string }) {
  return (
    <div className="border-b border-[#3a3835] px-3 py-4 pr-10 lg:pr-3">
      <div className="flex items-center gap-3">
        <img
          src={`${IMAGE_BASE}profile-img-gray.jpg`}
          className="h-12 w-12 shrink-0 rounded-full border-2 border-[#32dff3]/50 object-cover"
          alt="profile"
        />
        <div className="min-w-0 font-semibold leading-tight">
          <p className="text-[11px] tracking-wider text-[#32dff3]">WELCOME</p>
          <p className="mt-1 truncate text-sm text-white">{getUserName()}</p>
          <p className="mt-0.5 truncate text-[11px] font-normal text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
});

const SidebarNavItem = memo(function SidebarNavItem({
  to,
  active,
  onNavigate,
  icon,
  children,
}: {
  to: string;
  active: boolean;
  onNavigate: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link to={to} onClick={onNavigate} className={navItemClass(active)}>
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 truncate">{children}</span>
      </Link>
    </li>
  );
});

const SidebarSubLink = memo(function SidebarSubLink({
  to,
  label,
  icon,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <li
      className={`rounded-[2px] py-[10px] text-[#fff] ${
        active ? "bg-[#1e3a47]" : "bg-[#2c3b41]"
      }`}
    >
      <Link
        to={to}
        onClick={onNavigate}
        className={`flex min-w-0 max-w-full items-center gap-2.5 overflow-hidden px-3 py-1 pl-[15px] text-[13px] ${
          active ? "text-white font-medium" : "text-[#8aa4af] hover:text-white hover:font-medium"
        }`}
      >
        <span className="shrink-0">{icon ?? <FaList className="text-[12px]" />}</span>
        <span className="min-w-0 truncate">{label}</span>
      </Link>
    </li>
  );
});

const SidebarAccordion = memo(function SidebarAccordion({
  sectionKey,
  open,
  extraActivePaths,
  label,
  icon,
  subs,
  pathname,
  onToggle,
  onNavigate,
}: {
  sectionKey: string;
  open: boolean;
  extraActivePaths?: string[];
  label: string;
  icon: React.ReactNode;
  subs: SubItem[];
  pathname: string;
  onToggle: (key: string, open: boolean) => void;
  onNavigate: () => void;
}) {
  const activeSubTo = winningSubTo(pathname, subs);
  const sectionActive =
    Boolean(activeSubTo) ||
    (extraActivePaths ?? []).some((to) => isActivePath(pathname, to)) ||
    subs.some((s) => isActivePath(pathname, s.to));

  return (
    <li className="min-w-0">
      <button
        type="button"
        className={triggerClass(sectionActive)}
        aria-expanded={open}
        onClick={() => onToggle(sectionKey, !open)}
      >
        <MenuLabel icon={icon}>{label}</MenuLabel>
        <ChevronDown
          className={`size-4 shrink-0 text-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="mx-[1px] min-h-0 list-none overflow-hidden text-[13px]">
          {subs.map((sub) => (
            <SidebarSubLink
              key={sub.to}
              to={sub.to}
              label={sub.label}
              icon={sub.icon}
              active={activeSubTo === sub.to}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </li>
  );
});

const ICON_USERS = <FaUsers className="text-[14px]" />;
const ICON_ID_CARD = <FaIdCard className="text-[14px]" />;
const ICON_DOC = <GrDocument className="text-[14px]" />;
const ICON_CARD = <FaRegCreditCard className="text-[14px]" />;
const ICON_CLIPBOARD = <FaClipboardList className="text-[14px]" />;
const ICON_LIST = <FaList className="text-[14px]" />;
const ICON_HOME = <FaHome className="text-[14px]" />;
const ICON_SEARCH = <FaSearch className="text-[14px]" />;
const ICON_KEY = <FaKey className="text-[14px]" />;
const ICON_POWER = <MdPower className="text-[15px]" />;
const ICON_PEN_SM = <FaPen className="text-[12px]" />;
const ICON_LIST_SM = <FaList className="text-[12px]" />;

const CLRA_AMEND_SUB: SubItem = {
  to: "/clra-amendment",
  label: "Amend Registration",
  icon: ICON_PEN_SM,
};
const CLRA_EXISTING_SUB: SubItem = {
  to: "/clra_backlog",
  label: "Existing Registrations",
  icon: ICON_LIST_SM,
};

const winningSubTo = (pathname: string, subs: SubItem[]): string | null => {
  const allTos = subs.map((s) => s.to);
  const hit = subs.find((s) => isActivePathBestMatch(pathname, s.to, allTos));
  return hit?.to ?? null;
};

const SidebarShell: FC<{
  onClose: () => void;
  children: React.ReactNode;
}> = ({ onClose, children }) => (
  <div className="relative flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden text-white">
    <div className="hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
      {children}
    </div>
  </div>
);

// const CLRA_PE_SUBS = [
//   { to: "/clra-amendment", label: "Amendment of CLRA(PE) Registration Certificate" },
//   { to: "/clra_backlog/clra_registration_type", label: "New Application" },
//   { to: "/clra_backlog", label: "Already Registered" },
// ];

const CONTRACTOR_LICENSE_SUBS: SubItem[] = [
  // { to: "/check_fromv_no", label: "Apply new License" },
  { to: "/renewal/old_renewal", label: "Renew / Amend License", icon: <FaRedo className="text-[12px]" /> },
  { to: "/license-renewal-amendment-list", label: "My Applications", icon: <FaClipboardList className="text-[12px]" /> },
];

/** Includes `/contractor-license/*` so renewal, amendment & remarks keep the menu section open. */
const CONTRACTOR_LICENSE_ACTIVE_PATHS = [
  ...CONTRACTOR_LICENSE_SUBS.map((s) => s.to),
  "/contractor-license",
  "/renewal",
];

const BOCWA_SUBS: SubItem[] = [{ to: "/bocwa-amendment", label: "Amend Registration", icon: <FaPen className="text-[12px]" /> },
// { to: "/amendment-bocwa/bocwa-amendment-submit", label: "BOCWA Application" }
];

const BOCWA_ACTIVE_PATHS = [
  ...BOCWA_SUBS.map((s) => s.to),
  "/amendment-bocwa",
  "/apply-bocwa",
  "/bocwa-application-view",
];

const MTW_SUBS: SubItem[] = [
  // { to: "/mtw-registration", label: "New Registration" },
  { to: "/mtw-reg-checking", label: "Renew Registration", icon: <FaRedo className="text-[12px]" /> },
];

const MTW_ACTIVE_PATHS = [
  ...MTW_SUBS.map((s) => s.to),
  "/mtw-registration",
];

// const ISMW_SUBS = [{ to: "/ismw_application", label: "ISMW Application" }];

const ISMW_LICENSE_SUBS: SubItem[] = [
  { to: "/ismw-license-location", label: "Apply for License", icon: <FaPlus className="text-[12px]" /> },
  { to: "/ismw-employment_license-list", label: "Employment Licenses", icon: <FaBriefcase className="text-[12px]" /> },
  { to: "/ismw_recruitement_license-list", label: "Recruitment Licenses", icon: <FaUsers className="text-[12px]" /> },
];

const ISMW_LICENSE_ACTIVE_PATHS = [
  ...ISMW_LICENSE_SUBS.map((s) => s.to),
  "/ismw-license",
];

const ANNUAL_RETURN_SUBS: SubItem[] = [
  // { to: "/annual-return/wizard", label: "Submission of Return" },
  { to: "/annual-return/list", label: "My Returns", icon: <FaFileAlt className="text-[12px]" /> },
];

const CTU_ANNUAL_RETURN_SUBS: SubItem[] = [
  { to: "/central-trade-union-annual-return-list", label: "Annual Return List", icon: <FaFileAlt className="text-[12px]" /> },
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
  { key: "bocwa", paths: BOCWA_ACTIVE_PATHS },
  { key: "mtw", paths: MTW_ACTIVE_PATHS },
  { key: "annual-return", paths: ANNUAL_RETURN_ACTIVE_PATHS },
  // { key: "ismw", paths: ISMW_SUBS.map((s) => s.to) },
  { key: "ismw-license", paths: ISMW_LICENSE_ACTIVE_PATHS },
];

const DashboardApplicantSidebar: FC<SidebarProps> = ({ setSidebarOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [showClraAmendmentMenu, setShowClraAmendmentMenu] =
    useState(false);

  const clraPeSubs = useMemo<SubItem[]>(
    () => [
      ...(showClraAmendmentMenu ? [CLRA_AMEND_SUB] : []),
      // {
      //   to: "/clra_backlog/clra_registration_type",
      //   label: "New Application",
      // },
      CLRA_EXISTING_SUB,
    ],
    [showClraAmendmentMenu],
  );

  useEffect(() => {
    setShowClraAmendmentMenu(
      sessionStorage.getItem("SHOW_CLRA_AMENDMENT_MENU") === "true"
    );
  }, []);

  const [openSection, setOpenSection] = useState<string | null>(null);

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

  // const isIsmwActive = ISMW_SUBS.some((s) => isActivePath(pathname, s.to));

  // useEffect(() => {
  //   const active = NESTED_MENU_SECTIONS.find(({ paths }) => paths.some((to) => isActivePath(pathname, to)));
  //   if (active) setOpenSection(active.key);
  // }, [pathname]);

  useLayoutEffect(() => {
    const sections = [
      { key: "clra-pe", paths: ["/clra_backlog", "/clra-amendment"] },
      ...NESTED_MENU_SECTIONS,
      {
        key: "annual-return",
        paths: [
          "/central-trade-union-annual-return-list",
          "/trade-union/tu-fed-final-pdf-central-admin-end",
        ],
      },
    ];

    const active = sections.find(({ paths }) =>
      paths.some((to) => isActivePath(pathname, to))
    );

    // Follow the route only when the URL changes — never snap a click back shut.
    if (active) setOpenSection(active.key);
  }, [pathname]);

  const onNavigate = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const handleSectionToggle = useCallback((key: string, open: boolean) => {
    setOpenSection(open ? key : null);
  }, []);

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
      <SidebarShell onClose={() => setSidebarOpen(false)}>
        <WelcomeBlock subtitle="Applicant" />

        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Services
        </p>

        <ul className="list-none m-0 min-w-0 max-w-full overflow-x-hidden px-0 py-1 pb-6 text-gray-400">
          <li>
            <Link
              to="/trade-union/trade-federation-annual-return-form"
              onClick={onNavigate}
              className={navItemClass(
                isActivePath(pathname, "/applicant-dashboard") || isActivePath(pathname, "/dashboard")
              )}
            >
              <FaHome className="shrink-0 text-[14px]" />
              Dashboard
            </Link>
          </li>

          <li>
            <span className="flex items-center gap-2.5 py-2.5 px-3 text-[13px] text-gray-500 cursor-not-allowed opacity-60 select-none">
              <SiBookstack className="shrink-0 text-[14px]" />
              User Manual
            </span>
          </li>

          <li>
            <Link
              to="/trade-union/trade-federation-annual-return-form"
              onClick={onNavigate}
              className={navItemClass(isTuReturnActive)}
            >
              <FaClipboardList className="shrink-0 text-[14px]" />
              Trade Union Annual Return
            </Link>
          </li>

          <li>
            <Link
              to="/change-password-applicant"
              onClick={onNavigate}
              className={navItemClass(
                isActivePath(pathname, "/change-password-applicant") || isActivePath(pathname, "/change-password")
              )}
            >
              <FaKey className="shrink-0 text-[14px]" />
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
              className={navItemClass(false)}
            >
              <MdPower className="shrink-0 text-[15px]" />
              Logout
            </Link>
          </li>
        </ul>
      </SidebarShell>
    );
  }

  // CTU - Menus
  if (roleNumber === 22) {
    return (
      <SidebarShell onClose={() => setSidebarOpen(false)}>
        <WelcomeBlock subtitle="Applicant" />

        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Services
        </p>

        <ul className="list-none m-0 min-w-0 max-w-full overflow-x-hidden px-0 py-1 pb-6 text-gray-400">
          <li>
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className={navItemClass(isActivePath(pathname, "/dashboard"))}
            >
              <FaHome className="shrink-0 text-[14px]" />
              Dashboard
            </Link>
          </li>

          <SidebarAccordion
            sectionKey="annual-return"
            open={openSection === "annual-return"}
            extraActivePaths={[
              "/central-trade-union-annual-return-list",
              "/trade-union/tu-fed-final-pdf-central-admin-end",
            ]}
            label="Annual Returns"
            icon={ICON_CLIPBOARD}
            subs={CTU_ANNUAL_RETURN_SUBS}
            pathname={pathname}
            onToggle={handleSectionToggle}
            onNavigate={onNavigate}
          />

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
              onClick={onNavigate}
              className={navItemClass(isActivePath(pathname, "/change-password"))}
            >
              <FaKey className="shrink-0 text-[14px]" />
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
              className={navItemClass(false)}
            >
              <MdPower className="shrink-0 text-[15px]" />
              Logout
            </Link>
          </li>
        </ul>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell onClose={() => setSidebarOpen(false)}>
      <WelcomeBlock subtitle="Applicant" />

      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        Services
      </p>

      <ul className="list-none m-0 min-w-0 max-w-full overflow-x-hidden px-0 py-1 pb-6 text-gray-400">
        <SidebarNavItem
          to="/applicant-dashboard"
          active={isActivePath(pathname, "/applicant-dashboard")}
          onNavigate={onNavigate}
          icon={ICON_HOME}
        >
          Dashboard
        </SidebarNavItem>

        <SidebarAccordion
          sectionKey="clra-pe"
          open={openSection === "clra-pe"}
          extraActivePaths={["/clra_backlog", "/clra-amendment"]}
          label="CLRA (Principal Employer)"
          icon={ICON_USERS}
          subs={clraPeSubs}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />
        {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}

        <SidebarAccordion
          sectionKey="contractor-license"
          open={openSection === "contractor-license"}
          extraActivePaths={CONTRACTOR_LICENSE_ACTIVE_PATHS}
          label="Contractor License"
          icon={ICON_ID_CARD}
          subs={CONTRACTOR_LICENSE_SUBS}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />

        <SidebarAccordion
          sectionKey="bocwa"
          open={openSection === "bocwa"}
          extraActivePaths={BOCWA_ACTIVE_PATHS}
          label="BOCWA Registration"
          icon={ICON_DOC}
          subs={BOCWA_SUBS}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />

        <SidebarAccordion
          sectionKey="mtw"
          open={openSection === "mtw"}
          extraActivePaths={MTW_ACTIVE_PATHS}
          label="MTW Registration"
          icon={ICON_CARD}
          subs={MTW_SUBS}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />

        <SidebarAccordion
          sectionKey="annual-return"
          open={openSection === "annual-return"}
          extraActivePaths={ANNUAL_RETURN_ACTIVE_PATHS}
          label="Annual Returns"
          icon={ICON_CLIPBOARD}
          subs={ANNUAL_RETURN_SUBS}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />

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

        <SidebarAccordion
          sectionKey="ismw-license"
          open={openSection === "ismw-license"}
          extraActivePaths={ISMW_LICENSE_ACTIVE_PATHS}
          label="ISMW License (Coming Soon)"
          icon={ICON_LIST}
          subs={ISMW_LICENSE_SUBS}
          pathname={pathname}
          onToggle={handleSectionToggle}
          onNavigate={onNavigate}
        />

        <SidebarNavItem
          to="/self-certification-application/list"
          active={isActivePath(pathname, "/self-certification-application/list")}
          onNavigate={onNavigate}
          icon={ICON_DOC}
        >
          Self Certification
        </SidebarNavItem>

        <SidebarNavItem
          to="/applicant/view-inspection-report"
          active={isActivePath(pathname, "/applicant/view-inspection-report")}
          onNavigate={onNavigate}
          icon={ICON_SEARCH}
        >
          Inspection Reports
        </SidebarNavItem>

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

        <SidebarNavItem
          to="/change-password-applicant"
          active={isActivePath(pathname, "/change-password-applicant")}
          onNavigate={onNavigate}
          icon={ICON_KEY}
        >
          Change Password
        </SidebarNavItem>

        <li>
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className={navItemClass(false)}
          >
            {ICON_POWER}
            <span className="min-w-0 truncate">Logout</span>
          </Link>
        </li>
      </ul>
    </SidebarShell>
  );
};

export default React.memo(DashboardApplicantSidebar);
