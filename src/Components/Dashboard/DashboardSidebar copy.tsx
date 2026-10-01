import { IMAGE_BASE } from "@/constants/constants";
import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../Components/ui/accordion";
import {
  FaList,
  FaUsers,
  FaUser,
  FaRegCreditCard,
  FaPhone,
  FaKey,
  FaRandom,
  FaEnvelope,
  FaImages,
  FaBook,
  FaExclamationTriangle,
  FaHeadset,
  FaClipboardList,
  FaShoppingCart,
} from "react-icons/fa";
import { AiFillDashboard } from "react-icons/ai";
import { GrDocument } from "react-icons/gr";
import { SiBookstack, SiMdbook } from "react-icons/si";
import { IoAppsSharp, IoPower } from "react-icons/io5";
import { HiClipboardDocument } from "react-icons/hi2";
import { logout } from "@/store/authSlice";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { MdPower } from "react-icons/md";
import { PiGridNineFill } from "react-icons/pi";
import { RiGitRepositoryFill } from "react-icons/ri";
import { IoIosMail } from "react-icons/io";

interface HeaderProps {
  role: string | null | number;
  sidebarOpen: boolean;
  username: string | null;
  setSidebarOpen: (open: boolean) => void;
}

const isActivePath = (pathname: string, to: string) => {
  if (to === "#" || !to) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
};

const DashboardSidebar: FC<HeaderProps> = ({ sidebarOpen, role, username }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const pathname = location.pathname;

  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!sidebarOpen) return null;
  const roleNumber = Number(role);

  const filterByHideForRoles = <T extends { hideForRoles?: number[] }>(items: T[]) =>
    items.filter((sub) => !sub.hideForRoles || !sub.hideForRoles.includes(roleNumber));

  const filterByShowForRoles = <T extends { showForRoles?: number[] }>(items: T[]) =>
    items.filter((sub) => sub.showForRoles?.includes(roleNumber));

  // CLRA (PE) Application: ALC (4) & LWFC (7)
  const subItemsCLRAPEApplications = [
    // 1. Application List - both
    { to: "/receivedapplications/clra", label: "Application List", showForRoles: [4, 7] },
    // 2. Issued Application List - both
    { to: "#", label: "Issued Application List", showForRoles: [4, 7] },
  ];

  // CLRA License Application: ALC (4) & LWFC (7)
  const subItemsCLRALicense = [
    // 1. License List - both
    { to: "/alc-received-license", label: "License Lists", showForRoles: [4, 7] },
    // 2. Issued License Lists - ALC only
    { to: "#", label: "Issued License Lists", showForRoles: [4] },
    // 3. Renewal of License Lists - both
    { to: "/alc-received-renewal-details", label: "Renewal of License Lists", showForRoles: [4, 7] },
    // 4. Amendment of License Lists - ALC only
    { to: "/alc-received-ammendment-license", label: "Amendment of License Lists", showForRoles: [4] },
    // 5. Issued applications (Amendment of License) - ALC only
    { to: "#", label: "Issued Applications (Amendment of License)", showForRoles: [4] },
  ];

  // ISMW Registration Applications: ALC (4) & LWFC (7)
  const subItemsISMWRegApplications = [
    // 1. Application List - ALC
    { to: "/receivedapplications/ismw", label: "Application List", showForRoles: [4] },
    // 2. Issued Application List - ALC
    { to: "#", label: "Issued Application List", showForRoles: [4] },
    // 3. Registration Applications - LWFC
    { to: "/receivedapplications/ismw", label: "Registration Applications", showForRoles: [7] },
  ];

  // ISMW License Applications: ALC (4) & LWFC (7)
  const subItemsISMWLicenseApplications = [
    // 1. Employment List - ALC
    { to: "/ismwlicense-list/employment", label: "Employment List", showForRoles: [4] },
    // 2. Recruitment List - ALC
    { to: "/ismwlicense-list/recruitment", label: "Recruitment List", showForRoles: [4] },
    // 3. Employment Applications - LWFC
    { to: "/ismwlicense-list/employment", label: "Employment Applications", showForRoles: [7] },
    // 4. Recruitment Applications - LWFC
    { to: "/ismwlicense-list/recruitment", label: "Recruitment Applications", showForRoles: [7] },
  ];

  const subItemsBOCWAApplications = [
    {
      to: "/receivedapplications/bocwa",
      label: "Application List",
      hideForRoles: [1],   // lwfc can view
    },
  ];

  // MTW Applications: ALC (4) & LWFC (7)
  const subItemsMTWApplications = [
    // 1. Applications (New Reg) - ALC
    { to: "/receivedapplications/mtw/newreg", label: "Applications (New Reg)", showForRoles: [4] },
    // 2. Applications (Renewal) - ALC
    { to: "/receivedapplications/mtw/renewal", label: "Applications (Renewal)", showForRoles: [4] },
    // 3. Registration Applications - LWFC
    { to: "/receivedapplications/mtw/newreg", label: "Registration Applications", showForRoles: [7] },
    // 4. Issued Applications (Renewal) - LWFC
    { to: "#", label: "Issued Applications (Renewal)", showForRoles: [7] },
    // 5. Renewal Applications - LWFC
    { to: "/receivedapplications/mtw/renewal", label: "Renewal Applications", showForRoles: [7] },
  ];

  // WBLC Users Info: per-role visibility using showForRoles
  // Roles: ALC=4, DLC=5, Super Admin=12
  const subItemsWBLCUsersInfo = [
    // 1. ALC List - show for DLC, Super Admin
    { to: "/user-list/alc", label: "ALC List", showForRoles: [5, 12] },
    // 2. MCDLSC(CKCO) - show for DLC, Super Admin
    { to: "/user-list/mcdlscckco", label: "MCDLSC(CKCO)", showForRoles: [5, 12] },
    // 3. Inspectors List - show for DLC, Super Admin, ALC
    { to: "/user-list/inspector", label: "Inspectors List", showForRoles: [4, 5, 12] },
    // 4. Applicant List - show for DLC, ALC
    { to: "#", label: "Applicant List", showForRoles: [4, 5] },
    // 5. DLC List - show for Super Admin
    { to: "/user-list/dlc", label: "DLC List", showForRoles: [12] },
    // 6. Add New Officer - show for Super Admin
    { to: "/officer/add-modify-emp", label: "Add New Officer", showForRoles: [12] },
    // 7. Services Wise Officer - show for Super Admin
    { to: "/service-wise-user", label: "Services Wise Officer", showForRoles: [12] },
    // 8. Inspection User - show for Super Admin
    { to: "/inspection-report/ins-user-list", label: "Inspection User", showForRoles: [12] },
  ];

  const subItemsTUManagement = [
    {
      to: "trade-union-master-list/add-trade-union",
      label: "Add New Trade Union",   // tradeunionadmin can view
      hideForRoles: [1, 12],
    },
    { to: "trade-union-master-list", label: "Register List" },   // AUTH_STORAGE_KEY can view
    { to: "trade-union-annual-return-list", label: "Annual Return" },   // AUTH_STORAGE_KEY can view
    {
      to: "trade-union-return-reg-id",
      label: "Annual Return Search by Registration No",   // tradeunionadmin can view
      hideForRoles: [1, 12],
    },
    { to: "user-by-return-list", label: "Action on Return", hideForRoles: [1, 12] },   // tradeunionadmin can view
  ];

  const subItemsMigrantWorker = [
    {
      to: "/migrant-worker/forward-to-nodal-officer", label: "Forward to Nodal Officer",
      hideForRoles: [12],
    },
    {
      to: "/migrant-worker/food-coupon", label: "Food Coupon",
      hideForRoles: [12],
    },
    {
      to: "/migrant-worker/summary-report", label: "Summary Report",
      hideForRoles: [1],
    },
    // {
    //   to: "/wblc-users/dlc-list", label: "DLC List",
    //   hideForRoles: [1],
    // },
    // {
    //   to: "/wblc-users/alc-list", label: "ALC List",
    //   hideForRoles: [1],
    // },
    // {
    //   to: "/wblc-users/lc-staff", label: "LC Staff",
    //   hideForRoles: [1],
    // },
    // {
    //   to: "/wblc-users/add-user", label: "Add New User",
    //   hideForRoles: [1],
    // },
  ];

  // Inspection Management: ALC=4, LWFC=7, Super Admin=12. Each item has showForRoles = who can see it.
  const subItemsInspectionManagement = [
    // ALC only
    { label: "Schedule Inspection (GP)", to: "/alcrandomization", showForRoles: [4] },
    { label: "Order List", to: "/alc-previous-list", showForRoles: [4] },
    // ALC + Super Admin
    { label: "Schedule Inspection (CIS)", to: "/risk-wise-randomization-list/central-incpection", showForRoles: [4, 12] },
    // ALC + LWFC
    { label: "Inspection List", to: "/inspection/list", showForRoles: [4, 7] },
    // ALC only
    { label: "Blank Inspection Note Print", to: "/inspectionprint", showForRoles: [4] },
    // LWFC only
    { label: "New Inspection", to: "/inspection/new", showForRoles: [7] },
    { label: "Inspection Note", to: "/inspection/note", showForRoles: [7] },
    { label: "Show-Cause/Let off", to: "/inspection/show-cause", showForRoles: [7] },
    { label: "Court Case/Let off", to: "/inspection/courtcase", showForRoles: [7] },
    { label: "Court Case Register", to: "/inscourtcaselist", showForRoles: [7] },
    { label: "Print Blank Inspection Note", to: "/inspectionprint", showForRoles: [7] },
    { label: "User Manual for Inspection", to: "#", showForRoles: [7] },
  ];

  const subItemsFAWLOI = [
    { label: "Already Approved Unit List", to: "/already-approved-unit-list", showForRoles: [4, 7, 12] },
    { label: "Notice List", to: "/fawloi-notice/list", showForRoles: [4, 7, 12] },
    { label: "Declaration List", to: "/fawloi-declaration-list", showForRoles: [4, 7, 12] },
    { label: "User Manual for Upload Worker Info", to: "/fawloi-user-manual-upload-worker-info", showForRoles: [4, 7, 12] },
  ];

  const subItemsFoodCoupon = [
    { label: "Coupon Quota", to: "/already-approved-unit-list", showForRoles: [12] },
    { label: "Coupon Approval", to: "/fawloi-notice/list", showForRoles: [12] },
    { label: "Coupon Download", to: "/fawloi-declaration-list", showForRoles: [12] },
    { label: "Summary Report(District)", to: "/fawloi-declaration-list", showForRoles: [12] },
    { label: "Summary Report(Sub Division)", to: "/fawloi-declaration-list", showForRoles: [12] },
  ]

  // fetching active parent menu for nested menus
  const isClraPeActive = subItemsCLRAPEApplications.some((s) => isActivePath(pathname, s.to));
  const isClraLicenseActive = subItemsCLRALicense.some((s) => isActivePath(pathname, s.to));
  const isIsmwRegActive = subItemsISMWRegApplications.some((s) => isActivePath(pathname, s.to));
  const isIsmwLicenseActive = subItemsISMWLicenseApplications.some((s) => isActivePath(pathname, s.to));
  const isBocwaActive = subItemsBOCWAApplications.some((s) => isActivePath(pathname, s.to));
  const isMtwActive = subItemsMTWApplications.some((s) => isActivePath(pathname, s.to));
  const isWblcUsersInfoActive = subItemsWBLCUsersInfo.some((s) => isActivePath(pathname, s.to));
  const isTuManagementActive = subItemsTUManagement.some((s) => isActivePath(pathname, s.to));
  const isMigrantWorkerActive = subItemsMigrantWorker.some((s) => isActivePath(pathname, s.to));
  const isInspectionManagementActive = subItemsInspectionManagement.some((s) => isActivePath(pathname, s.to));
  const isFawloiActive = subItemsFAWLOI.some((s) => isActivePath(pathname, s.to));
  const isFoodCouponActive = subItemsFoodCoupon.some((s) => isActivePath(pathname, s.to));

  // filter out items based on showForRoles & hideForRoles
  const visibleSubsCLRAPEApplications = filterByShowForRoles(subItemsCLRAPEApplications);
  const visibleSubsCLRALicense = filterByShowForRoles(subItemsCLRALicense);
  const visibleSubsISMWRegApplications = filterByShowForRoles(subItemsISMWRegApplications);
  const visibleSubsISMWLicenseApplications = filterByShowForRoles(subItemsISMWLicenseApplications);
  const visibleSubsBOCWAApplications = filterByHideForRoles(subItemsBOCWAApplications);
  const visibleSubsMTWApplications = filterByShowForRoles(subItemsMTWApplications);
  const visibleSubsWBLCUsersInfo = filterByShowForRoles(subItemsWBLCUsersInfo);
  const visibleSubsTUManagement = filterByHideForRoles(subItemsTUManagement);
  const visibleInspectionManagementSubs = filterByShowForRoles(subItemsInspectionManagement);
  const visibleFAWLOISubs = filterByShowForRoles(subItemsFAWLOI);
  const visibleMigrantWorkerSubs = filterByHideForRoles(subItemsMigrantWorker);
  const visibleFoodCouponSubs = filterByShowForRoles(subItemsFoodCoupon);

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div
      className={`h-full w-[250px] bg text-white overflow-y-auto
        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        ${sidebarOpen ? "block" : "hidden lg:block"}
      `}
    >
      <div className="pb-[10px]">
        <div className="p-[10px] flex items-center gap-[15px]">
          <img
            src={`${IMAGE_BASE}default-img-male.png`}
            className="h-[45px] w-[45px] rounded-full"
            alt="profile"
          />
          <div className="font-semibold  leading-[1]">
            <p className=" mb-[9px] uppercase">{username}</p>
            <p className="pr-[5px] mt-[3px] text-[11px] font-normal">Online</p>
          </div>
        </div>
      </div>

      <ul className="list-none m-0 p-0 border-b border-dashed border-[#3a3835]">
        {/* Dashboard */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Link
            to="/dashboard"
            className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/dashboard") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
          >
            <AiFillDashboard className="mt-[2px]" /> Dashboard
          </Link>
        </li>

        {/* CLRA (PE) Application */}
        {[4, 7].includes(roleNumber) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "clra-pe" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "clra-pe" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isClraPeActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> CLRA (PE) Application
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsCLRAPEApplications.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* CLRA (License) Applications */}
        {[4, 7].includes(roleNumber) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "clra-license" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "clra-license" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isClraLicenseActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> CLRA (License) Applications
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsCLRALicense.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* ISMW (REG) Applications */}
        {[4, 7].includes(roleNumber) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "ismw-reg" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "ismw-reg" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isIsmwRegActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> ISMW (REG) Applications
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsISMWRegApplications.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* ISMW (License) Applications */}
        {[4, 7].includes(roleNumber) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "ismw-license" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "ismw-license" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isIsmwLicenseActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> ISMW (License) Applications
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsISMWLicenseApplications.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* BOCWA Applications */}
        {role === 7 && (  // LWFC = Inspector = Role ID - 7
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "bocwa-apps" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "bocwa-apps" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isBocwaActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> BOCWA Applications
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsBOCWAApplications.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* BOCWA Application */}
        {role === 4 && (  // ALC = Role ID - 4
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/receivedapplications/bocwa"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/receivedapplications/bocwa") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaList className="mt-[2px]" /> BOCWA Application
            </Link>
          </li>
        )}

        {/* Self Certification */}
        {role === 4 && (  // ALC = Role ID - 4
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/received-self-certification-application"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/received-self-certification-application") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaList className="mt-[2px]" /> Self Certification
            </Link>
          </li>
        )}

        {/* MTW Applications - visible only for ALC (4), LWFC (7) */}
        {[4, 7].includes(Number(role)) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "mtw" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "mtw" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isMtwActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> MTW Applications
                  </Link>
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
                  <ul className="list-none mx-[1px] ">
                    {visibleSubsMTWApplications.map((sub) => (
                      <li
                        key={sub.label}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] text-[13px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Administrative All Report */}
        {!([11].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/insvariousreport"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/insvariousreport") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <GrDocument className="mt-[2px]" /> Administrative All Report
            </Link>
          </li>
        )}

        {/* Migrant Worker */}
        {!([11].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "migrant-worker" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "migrant-worker" : null)}
              className="space-y-1.5"
            >
              <AccordionItem value="item-1" className="border-t border-dashed border-[#3a3835]">
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isMigrantWorkerActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="user-list/dlc"
                    className="block flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> Migrant Worker
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835 text-[13px]">
                    {visibleMigrantWorkerSubs.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Register Record Repository */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/register-record"
              className={`block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] items-center ${isActivePath(pathname, "/register-record") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <RiGitRepositoryFill size={16} /> Register Record Repository
            </Link>
          </li>
        )}

        {/* Inspection Management - visible only for ALC (4), LWFC (7), Super Admin (12) */}
        {[4, 7, 12].includes(Number(role)) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "inspection" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "inspection" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isInspectionManagementActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaClipboardList size={16} /> Inspection Management
                  </Link>
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
                    {visibleInspectionManagementSubs.map((sub) => (
                      <li
                        key={sub.label}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* FAWLOI Management - visible only for ALC (4), LWFC (7), Super Admin (12) */}
        {[4, 7, 12].includes(Number(role)) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "fawloi" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "fawloi" : null)}
              className=""
            >
              <AccordionItem value="item-1" className="border-t border-dashed border-[#3a3835]">
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isFawloiActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="#"
                    className="block flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SiMdbook size={16} /> FAWLOI Management
                  </Link>
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                  <ul className="list-none mx-px text-[13px]">
                    {visibleFAWLOISubs.map((sub) => (
                      <li key={sub.label} className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}>
                        <Link to={sub.to} className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}>
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* TU Enquiry List */}
        {([11].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/tu-enquiry-list"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/tu-enquiry-list") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <IoIosMail size={18} /> TU Enquiry List
            </Link>
          </li>
        )}

        {/* Annual Return List */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="#"
              className="block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] items-center"
            >
              <PiGridNineFill size={16} /> Annual Return List
            </Link>
          </li>
        )}

        {/* OLD/OFFLINE DATA */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "old-offline" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "old-offline" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent flex gap-2 items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaList className="mt-[2px]" /> OLD/OFFLINE DATA
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835] text-[13px]">
                    {[
                      { to: "clra-backlog-details", label: "P.E List" },
                      { to: "add_backlog_pe_data", label: "Add New P.E" },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          {sub.label === "P.E List" && (
                            <FaList className="mt-[2px]" />
                          )}{" "}
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* WBLC Users Info - visible only for ALC (4), DLC (5), Super Admin (12) */}
        {[4, 5, 12].includes(Number(role)) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "wblc-users" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "wblc-users" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isWblcUsersInfoActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                  <Link
                    to="user-list/dlc"
                    className="block flex gap-2 text-[13px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaUsers className="mt-[2px]" /> WBLC Users Info
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {visibleSubsWBLCUsersInfo.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Service wise Applicant List */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/register-record"
              className={`block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] flex items-center gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/register-record") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <PiGridNineFill size={16} /> Service wise Applicant List
            </Link>
          </li>
        )}

        {/* Employee Details */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "employee-details" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "employee-details" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex gap-2 no-underline ..."
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaUsers className="mt-[2px]" /> Employee Details
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                    {[
                      { to: "officer-list", label: "All Office Employee" },
                      {
                        to: "retired-officer-list",
                        label: "All Retired Employee",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaUser className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* User Feedback */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/mailbox/user-feedback/list"
              className={`block py-[12px] pl-[15px] mr-[1px] text-[13px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/mailbox/user-feedback/list") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaEnvelope className="mt-[2px]" /> User Feedback
            </Link>
          </li>
        )}

        {/* Gallery */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "gallery" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "gallery" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex gap-2 no-underline ..."
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaImages className="mt-[2px]" /> Gallery
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                    {[
                      { to: "officer-list", label: "All Office Employee" },
                      {
                        to: "retired-officer-list",
                        label: "All Retired Employee",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaUser className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* User Manual */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "user-manual" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "user-manual" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex gap-2 no-underline ..."
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaBook className="mt-[2px]" /> User Manual
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                    {[
                      { to: "officer-list", label: "All Office Employee" },
                      {
                        to: "retired-officer-list",
                        label: "All Retired Employee",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaUser className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Payment Status */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/epayments-info/verification"
              className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[14px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/epayments-info/verification") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaRegCreditCard className="mt-[2px]" /> Payment Status
            </Link>
          </li>
        )}

        {/* Grievance List */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/grievance-list"
              className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[14px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/grievance-list") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaExclamationTriangle className="mt-[2px]" /> Grievance List
            </Link>
          </li>
        )}

        {/* Technical Help Desk */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/technical-help-desk"
              className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[14px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/technical-help-desk") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaHeadset className="mt-[2px]" /> Technical Help Desk
            </Link>
          </li>
        )}

        {/* Contact Information */}
        {!([12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="contact-information"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/contact-information") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <FaPhone className="mt-1" /> Contact Information
            </Link>
          </li>
        )}

        {/* Randomization Orders - visible only for LWFC (role 7) */}
        {([7].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "randomization-orders" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "randomization-orders" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] border-l-[3px] text-[13px] h-full border-l-[#32dff3] flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaRandom className="mt-[2px]" /> Randomization Orders
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {[
                      {
                        to: "/alc-and-dlc-inspection-order-list",
                        label: "Randomization Order",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaRandom className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Randomization - visible only for DLC (role 5) */}
        {([5].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "randomization-dlc" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "randomization-dlc" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] border-l-[3px] text-[13px] h-full border-l-[#32dff3] flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AiFillDashboard className="mt-[2px]" /> Randomization
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {[
                      {
                        to: "/inspector-randomization",
                        label: "RLO WISE",
                      },
                      {
                        to: "/randomization-previous-list",
                        label: "PREVIOUS LIST",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* CLRA Registration */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "clra-reg" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "clra-reg" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] h-full flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiClipboardDocument className="mt-[2px]" /> CLRA Registration
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {[
                      {
                        to: "/official/clra-old-applications",
                        label: "Offline Application",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* BOCWA Est. Registration */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "bocwa-est" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "bocwa-est" : null)}
              className=""
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] h-full flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiClipboardDocument className="mt-[2px]" /> BOCWA Est. Registration
                  </Link>
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
                  <ul className="list-none mx-[1px] text-[13px]">
                    {[
                      {
                        to: "/official/old-list-of-bocwa",
                        label: "Offline Application",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isActivePath(pathname, sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Central/State Trade Union */}
        {!([12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "central-tu" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "central-tu" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex gap-2 no-underline ..."
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaUsers className="mt-[2px]" /> Central/State Trade Union
                    and Federation Management
                  </Link>
                  {/* <div
              className="
          ml-2 inline-flex h-6 w-6 items-center justify-center
          rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
          before:content-['+']
          group-data-[state=open]:before:content-['-'] float-right
        "
            /> */}
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                    {[
                      {
                        to: "central-trade-union-registration",
                        label: "Add New",
                      },
                      {
                        to: "central-trade-union-list",
                        label: "Register List",
                      },
                    ].map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, "/" + sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, "/" + sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* Trade Union Management */}
        {/* {role !== 1 && ( */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Accordion
            type="single"
            collapsible
            value={openSection === "tu-management" ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "tu-management" : null)}
            className="space-y-1.5"
          >
            <AccordionItem
              value="item-1"
              className="border-t border-dashed border-[#3a3835]"
            >
              <AccordionTrigger className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isTuManagementActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}>
                <Link
                  to="#"
                  className="block mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex items-center gap-2 no-underline ..."
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaUsers size={16} /> Trade Union Management
                </Link>
                {/* <div
                className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
              /> */}
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                  {visibleSubsTUManagement.map((sub) => (
                    <li
                      key={sub.to}
                      className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, "/" + sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                    >
                      <Link
                        to={sub.to}
                        className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, "/" + sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                      >
                        <FaList className="mt-[2px]" /> {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>
        {/* )} */}

        {/* Trade Union */}
        {!([11, 12].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Link
              to="/trade-union-master-list"
              className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex items-center gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/trade-union-master-list") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
            >
              <IoAppsSharp size={16} /> Trade Union    {/* dlc can view */}
            </Link>
          </li>
        )}

        {/* Food Coupon */}
        {!([11].includes(Number(role))) && (
          <li className="border-t border-dashed border-[#3a3835]">
            <Accordion
              type="single"
              collapsible
              value={openSection === "food-coupon" ? "item-1" : ""}
              onValueChange={(v) => setOpenSection(v ? "food-coupon" : null)}
              className="space-y-1.5"
            >
              <AccordionItem
                value="item-1"
                className="border-t border-dashed border-[#3a3835]"
              >
                <AccordionTrigger className="">
                  <Link
                    to="#"
                    className="block pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent  flex items-center gap-2 no-underline ..."
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaShoppingCart size={16} /> Food Coupon
                  </Link>
                </AccordionTrigger>
                <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
                  <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                    {visibleFoodCouponSubs.map((sub) => (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] mb-[2px] py-[10px] text-[#fff] text-[13px] ${isActivePath(pathname, "/" + sub.to) ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isActivePath(pathname, "/" + sub.to) ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        )}

        {/* {role !== 1 && ( */}
        {/* <li className="border-t border-dashed border-[#3a3835]">
          <Link
            to="#"
            className="block py-[12px] pl-[15px] mr-[1px] text-[13px] border-l-[3px] border-l-transparent "
          >
            Inspection Management
          </Link>
        </li> */}
        {/* )} */}

        {/* Change Password */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Link
            to="change-password"
            className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/change-password") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
          >
            <FaKey className="mt-1" /> Change Password
          </Link>
        </li>

        {/* Logout */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Link
            to="/"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleLogout(e)}
            className="block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41]"
          >
            <IoPower className="mt-1" /> Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default DashboardSidebar;
