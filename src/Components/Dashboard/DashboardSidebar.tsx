import { IMAGE_BASE } from "@/constants/constants";
import { STATISTICS_ROLE_ID } from "@/routing/roleGroups";
import { logout } from "@/store/authSlice";
import { AppDispatch } from "@/store/store";
import React, { FC, useState } from "react";
import { AiFillDashboard } from "react-icons/ai";
import {
  FaBook,
  FaCertificate,
  FaClipboardList,
  FaEnvelope,
  FaExclamationTriangle,
  FaHeadset,
  FaImages,
  FaKey,
  FaList,
  FaPhone,
  FaRandom,
  FaRegCreditCard,
  FaShoppingCart,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { GrDocument } from "react-icons/gr";
import { HiClipboardDocument } from "react-icons/hi2";
import { IoIosMail } from "react-icons/io";
import { IoAppsSharp, IoPower } from "react-icons/io5";
import { PiGridNineFill } from "react-icons/pi";
import { RiGitRepositoryFill } from "react-icons/ri";
import { SiMdbook } from "react-icons/si";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../Components/ui/accordion";

/** DLC officer — restricted sidebar (role id 5). */
const DLC_ROLE_ID = 5;

interface HeaderProps {
  role: string | null | number;
  sidebarOpen: boolean;
  username: string | null;
  setSidebarOpen: (open: boolean) => void;
}

const isActivePath = (pathname: string, to: string) => {
  if (to === "#" || !to) return false;
  if (to === "/") return pathname === "/";
  const cleanTo = to.split("?")[0];
  return pathname === cleanTo || pathname.startsWith(cleanTo + "/");
};

/** Accordion section title — expand/collapse only; must not navigate. */
const AccordionMenuLabel: FC<{
  className?: string;
  children: React.ReactNode;
}> = ({
  className = "flex flex-1 min-w-0 items-center gap-2 text-left text-[13px]",
  children,
}) => <span className={className}>{children}</span>;

const DashboardSidebar: FC<HeaderProps> = ({ sidebarOpen, role, username }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const pathname = location.pathname;

  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!sidebarOpen) return null;
  const roleNumber = Number(role);

  const filterByHideForRoles = <T extends { hideForRoles?: number[] }>(
    items: T[],
  ) =>
    items.filter(
      (sub) => !sub.hideForRoles || !sub.hideForRoles.includes(roleNumber),
    );

  const filterByShowForRoles = <T extends { showForRoles?: number[] }>(
    items: T[],
  ) => items.filter((sub) => sub.showForRoles?.includes(roleNumber));

  /** Trade Union Management: Register List for all roles; other items only for role 11. */
  const filterTuManagementSubs = <
    T extends { showForRoles?: number[]; hideForRoles?: number[] },
  >(
    items: T[],
  ) =>
    items.filter((sub) => {
      if (sub.showForRoles?.length) {
        return sub.showForRoles.includes(roleNumber);
      }
      if (sub.hideForRoles?.length) {
        return !sub.hideForRoles.includes(roleNumber);
      }
      return true;
    });

      // CLRA (PE) Application: ALC (4) & LWFC (7)
  const subItemsCLRAPEApplications = [
    // 1. Application List - both
    {
      to: "/receivedapplications/clra",
      label: "Application List",
      showForRoles: [4, 7],
    },
    // 2. Issued Application List - both
    // { to: "#", label: "Issued Application List", showForRoles: [4] },
  ];

  // CLRA License Application: ALC (4) & LWFC (7)
  const subItemsCLRALicense = [
    // 1. License List - both
    {
      to: "/alc-received-license",
      label: "License Lists",
      showForRoles: [4, 7],
    },
    // 2. Issued License Lists - ALC only
    // { to: "#", label: "Issued License Lists", showForRoles: [4] },
    // 3. Renewal of License Lists - both
    {
      to: "/alc-received-renewal-details",
      label: "Renewal of License Lists",
      showForRoles: [4, 7],
    },
    // 4. Amendment of License Lists - ALC only
    {
      to: "/alc-received-ammendment-license",
      label: "Amendment of License Lists",
      showForRoles: [4, 7],
    },
    // 5. Issued applications (Amendment of License) - ALC only
    // {
    //   to: "#",
    //   label: "Issued Applications (Amendment of License)",
    //   showForRoles: [4],
    // },
  ];



  // ISMW (Registration + License): ALC (4) & LWFC (7)
  const subItemsISMW = [
    // Registration — Application List (ALC) / Registration Applications (LWFC)
    {
      to: "/receivedapplications/ismw",
      label: "Registrations",
      showForRoles: [4, 7],
    },
    // Registration — Issued Application List
    // { to: "#", label: "Issued Application List", showForRoles: [4] },
    // License — Employment List (ALC) / Employment Applications (LWFC)
    {
      to: "/ismwlicense-list/employment",
      label: "Employment Licenses",
      showForRoles: [4, 7],
    },
    // License — Recruitment List (ALC) / Recruitment Applications (LWFC)
    {
      to: "/ismwlicense-list/recruitment",
      label: "Recruitment Licenses",
      showForRoles: [4, 7],
    },
  ];

  const subItemsBOCWAApplications = [
    {
      to: "/receivedapplications/bocwa",
      label: "Application List",
      hideForRoles: [1], // lwfc can view
    },
  ];

  // MTW Applications: ALC (4) & LWFC (7)
  const subItemsMTWApplications = [
    // 1. Applications (New Reg) - ALC
    {
      to: "/receivedapplications/mtw/newreg",
      label: "Applications (New Reg)",
      showForRoles: [4],
    },
    // 2. Applications (Renewal) - ALC
    {
      to: "/receivedapplications/mtw/renewal",
      label: "Applications (Renewal)",
      showForRoles: [4],
    },
    // 3. Registration Applications - LWFC
    {
      to: "/receivedapplications/mtw/newreg",
      label: "Registration Applications",
      showForRoles: [7],
    },
    // 4. Issued Applications (Renewal) - LWFC
    { to: "#", label: "Issued Applications (Renewal)", showForRoles: [] },
    // 5. Renewal Applications - LWFC
    {
      to: "/receivedapplications/mtw/renewal",
      label: "Renewal Applications",
      showForRoles: [7],
    },
  ];

  // WBLC Users Info: per-role visibility using showForRoles
  // Roles: ALC=4, DLC=5, Super Admin=12
  const subItemsWBLCUsersInfo = [
    // 1. DLC List - show for Super Admin
    {
      to: "/user-list/dlc",
      label: "DLC List",
      showForRoles: [12],
    },
    // 1. ALC List - show for DLC, Super Admin
    {
      to: "/user-list/alc",
      label: "ALC List",
      showForRoles: [5],
    },
    // 3. Inspectors List
    {
      to: "/user-list/inspector",
      label: "Inspectors List",
      showForRoles: [4],
    },
    // 2. MCDLSC(CKCO) - coming soon for DLC; live for Super Admin
    {
      // to: "/user-list/mcdlscckco",
      label: "MCDLSC(CKCO) (Coming Soon)",
      showForRoles: [5],
      disabled: true,
    },
    // 4. Applicant List - show for DLC, ALC
    {
      label: "Applicant List (Coming Soon)",
      showForRoles: [4, 5],
      disabled: true,
    },
    // 6. Add New Officer - show for Super Admin
    {
      to: "/officer/add-modify-emp",
      label: "Add New Officer",
      showForRoles: [12],
    },
    // 7. Services Wise Officer - show for Super Admin
    {
      to: "/service-wise-user",
      label: "Services Wise Users",
      showForRoles: [12],
    },
    // 8. Inspection User - show for Super Admin
    // { to: "/inspection-report/ins-user-list", label: "Inspection User", showForRoles: [12] },
  ];

  const subItemsInspection: {
    to: string;
    label: string;
    showForRoles?: number[];
  }[] = [
      {
        to: "/inspector-randomization",
        label: "Randomization",
      },
      {
        to: "/alc-and-dlc-inspection-order-list",
        label: "Randomized Order List",
      },
      {
        to: "/central-inspection-list",
        label: "Central Inspection List",
      },
    ];

  const subItemsInspectionALC = [
    {
      to: "/inspection-submission-list",
      label: "Randomization orders",
    },
    {
      to: "/alc-orders-list",
      label: "Order Lists",
    },
    {
      to: "/inspector-inspection-list",
      label: "Inspection List",
    },
    {
      to: "/central-inspection-list",
      label: "Central Inspection List",
    },
    {
      to: "/print-inspection-note",
      label: "Print Blank Inspection Note",
    },
    {
      to: "/inspection-list/final-submit?source=ins",
      label: "New Inspection",
    },
  ];

  const subItemsTUManagement = [
    {
      to: "trade-union-master-list/add-trade-union",
      label: "Add New Trade Union",
      showForRoles: [11],
    },
    { to: "trade-union-master-list", label: "Register List" },
    // { to: "trade-union-annual-return-list", label: "Annual Return (Coming Soon)" },
    // {
    //   label: "Annual Return (Coming Soon)",
    //   disabled: true,
    //   showForRoles: [11],
    // },
    {
      to: "trade-union-return-reg-id",
      label: "Annual Return Search by Registration No",
      showForRoles: [11],
    },
    {
      to: "user-by-return-list",
      label: "Action on Return",
      showForRoles: [11],
    },
  ];

  const subItemsMigrantWorker = [
    {
      to: "/migrant-worker/forward-to-nodal-officer",
      label: "Forward to Nodal Officer",
      hideForRoles: [12],
    },
    {
      to: "/migrant-worker/food-coupon",
      label: "Food Coupon",
      hideForRoles: [12],
    },
    {
      to: "/migrant-worker/summary-report",
      label: "Summary Report",
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
    {
      label: "Schedule Inspection (GP)",
      to: "/alcrandomization",
      showForRoles: [4],
    },
    { label: "Order List", to: "/alc-previous-list", showForRoles: [4] },
    // ALC + Super Admin
    {
      label: "Schedule Inspection (CIS)",
      to: "/risk-wise-randomization-list/central-incpection",
      showForRoles: [4, 12],
    },
    // ALC + LWFC
    { label: "Inspection List", to: "/inspection/list", showForRoles: [4, 7] },
    // ALC only
    {
      label: "Blank Inspection Note Print",
      to: "/inspectionprint",
      showForRoles: [4],
    },
    // LWFC only
    { label: "New Inspection", to: "/inspection/new", showForRoles: [7] },
    { label: "Inspection Note", to: "/inspection/note", showForRoles: [7] },
    {
      label: "Show-Cause/Let off",
      to: "/inspection/show-cause",
      showForRoles: [7],
    },
    {
      label: "Court Case/Let off",
      to: "/inspection/courtcase",
      showForRoles: [7],
    },
    {
      label: "Court Case Register",
      to: "/inscourtcaselist",
      showForRoles: [7],
    },
    {
      label: "Print Blank Inspection Note",
      to: "/inspectionprint",
      showForRoles: [7],
    },
    { label: "User Manual for Inspection", to: "#", showForRoles: [7] },
  ];

  const subItemsFAWLOI = [
    {
      label: "Already Approved Unit List",
      to: "/already-approved-unit-list",
      showForRoles: [4, 7, 12],
    },
    {
      label: "Notice List",
      to: "/fawloi-notice/list",
      showForRoles: [4, 7, 12],
    },
    {
      label: "Declaration List",
      to: "/fawloi-declaration-list",
      showForRoles: [4, 7, 12],
    },
    {
      label: "User Manual for Upload Worker Info",
      to: "/fawloi-user-manual-upload-worker-info",
      showForRoles: [4, 7, 12],
    },
  ];

  const subItemsFoodCoupon = [
    {
      label: "Coupon Quota",
      to: "/already-approved-unit-list",
      showForRoles: [12],
    },
    { label: "Coupon Approval", to: "/fawloi-notice/list", showForRoles: [12] },
    {
      label: "Coupon Download",
      to: "/fawloi-declaration-list",
      showForRoles: [12],
    },
    {
      label: "Summary Report(District)",
      to: "/fawloi-declaration-list",
      showForRoles: [12],
    },
    {
      label: "Summary Report(Sub Division)",
      to: "/fawloi-declaration-list",
      showForRoles: [12],
    },
  ];

  // fetching active parent menu for nested menus
  const isClraPeActive = subItemsCLRAPEApplications.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isClraLicenseActive = subItemsCLRALicense.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isIsmwActive = subItemsISMW.some((s) => isActivePath(pathname, s.to));
  const isBocwaActive = subItemsBOCWAApplications.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isMtwActive = subItemsMTWApplications.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isWblcUsersInfoActive = subItemsWBLCUsersInfo.some(
    (s) => s.to && isActivePath(pathname, String(s.to)),
  );
  const isPaymentStatusActive = isActivePath(
    pathname,
    "/epayments-info/verification",
  );
  const isInspectionALCActive = subItemsInspectionALC.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isTuManagementActive = subItemsTUManagement.some(
    (s) => s.to && isActivePath(pathname, "/" + s.to),
  );
  const isMigrantWorkerActive = subItemsMigrantWorker.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isInspectionManagementActive = subItemsInspectionManagement.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isCentralInspectionActive =
    isActivePath(pathname, "/central-inspection/scheduled-inspection") ||
    isActivePath(pathname, "/central-inspection/inspector/scheduled-inspection") ||
    isActivePath(pathname, "/risk-wise-randomization-list/central-incpection");
  const isFawloiActive = subItemsFAWLOI.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isFoodCouponActive = subItemsFoodCoupon.some((s) =>
    isActivePath(pathname, s.to),
  );
  const isDlcInspectionsActive =
    isActivePath(pathname, "/banglar-bhumi") ||
    isActivePath(pathname, "/banglar-bhumi/inquiry");

  // filter out items based on showForRoles & hideForRoles
  const visibleSubsCLRAPEApplications = filterByShowForRoles(
    subItemsCLRAPEApplications,
  );
  const visibleSubsCLRALicense = filterByShowForRoles(subItemsCLRALicense);
  const visibleSubsISMW = filterByShowForRoles(subItemsISMW);
  const visibleSubsBOCWAApplications = filterByHideForRoles(
    subItemsBOCWAApplications,
  );
  const visibleSubsMTWApplications = filterByShowForRoles(
    subItemsMTWApplications,
  );
  const visibleSubsWBLCUsersInfo = filterByShowForRoles(subItemsWBLCUsersInfo);
  const visibleSubsInspectionALC = subItemsInspectionALC;
  const visibleSubsTUManagement = filterTuManagementSubs(subItemsTUManagement);
  const visibleInspectionManagementSubs = filterByShowForRoles(
    subItemsInspectionManagement,
  );
  const visibleFAWLOISubs = filterByShowForRoles(subItemsFAWLOI);
  const visibleMigrantWorkerSubs = filterByHideForRoles(subItemsMigrantWorker);
  const visibleFoodCouponSubs = filterByShowForRoles(subItemsFoodCoupon);

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const renderMinWagesSidebar = () => (
    <>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/min-wages/scheduled-employment"
          className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/min-wages/scheduled-employment") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <FaClipboardList size={16} /> Scheduled Employment
        </Link>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/min-wages/non-scheduled-employment"
          className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/min-wages/non-scheduled-employment") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <FaClipboardList size={16} /> Non Scheduled Employment
        </Link>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <span className="block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 text-[#8aa4af] cursor-not-allowed">
          <FaClipboardList size={16} /> CPI Management (Coming Soon)
        </span>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/insvariousreport"
          className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/insvariousreport") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <GrDocument className="mt-[2px]" /> Administrative All Report
        </Link>
      </li>
      {renderSidebarFooter()}
    </>
  );

  const renderSidebarFooter = () => (
    <>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="change-password"
          className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/change-password") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <FaKey className="mt-1" /> Change Password
        </Link>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleLogout(e)}
          className="block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41]"
        >
          <IoPower className="mt-1" /> Logout
        </Link>
      </li>
    </>
  );

  const renderDlcOfficerSidebar = () => (
    <>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/dashboard"
          className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/dashboard") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <AiFillDashboard className="mt-[2px]" /> Dashboard
        </Link>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Accordion
          type="single"
          collapsible
          value={openSection === "banglar-bhumi" ? "item-1" : ""}
          onValueChange={(v) => setOpenSection(v ? "banglar-bhumi" : null)}
          className="space-y-1.5"
        >
          <AccordionItem
            value="item-1"
            className="border-t border-dashed border-[#3a3835]"
          >
            <AccordionTrigger
              className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isActivePath(pathname, "/banglar-bhumi") ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
            >
              <AccordionMenuLabel>
                <FaClipboardList className="mt-[2px]" /> Banglar Bhumi
              </AccordionMenuLabel>
            </AccordionTrigger>
            <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
              <ul className="list-none mx-[1px] text-[13px]">
                <li
                  className={`rounded-[2px] py-[10px] text-[#fff] ${pathname === "/banglar-bhumi" ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                >
                  <Link
                    to="/banglar-bhumi"
                    className={`px-3 py-1 pl-[15px] flex gap-2 ${pathname === "/banglar-bhumi" ? "text-white font-medium" : "text-[#8aa4af]"}`}
                  >
                    <FaList className="mt-[2px]" /> Inspection List
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Accordion
          type="single"
          collapsible
          value={openSection === "inspection" ? "item-1" : ""}
          onValueChange={(v) => setOpenSection(v ? "inspection" : null)}
          className="space-y-1.5"
        >
          <AccordionItem
            value="item-1"
            className="border-t border-dashed border-[#3a3835]"
          >
            <AccordionTrigger
              className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isActivePath(pathname, "/inspector-randomization") ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
            >
              <AccordionMenuLabel>
                <FaClipboardList className="mt-[2px]" /> Inspection
              </AccordionMenuLabel>
            </AccordionTrigger>
            <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
              <ul className="list-none mx-[1px] text-[13px]">
                {subItemsInspection
                  .filter(
                    (sub) =>
                      !sub.showForRoles ||
                      sub.showForRoles.includes(roleNumber),
                  )
                  .map((sub) => {
                    const isSubActive = isActivePath(pathname, sub.to);

                    return (
                      <li
                        key={sub.to}
                        className={`rounded-[2px] py-[10px] text-[#fff] ${isSubActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                      >
                        <Link
                          to={sub.to}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaRandom className="mt-[2px]" /> {sub.label}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/insvariousreport"
          className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/insvariousreport") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <GrDocument className="mt-[2px]" /> Administrative All Report
        </Link>
      </li>
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
            <AccordionTrigger
              className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isWblcUsersInfoActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
            >
              <AccordionMenuLabel>
                <FaUsers className="mt-[2px]" /> WBLC Users Info
              </AccordionMenuLabel>
            </AccordionTrigger>
            <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
              <ul className="list-none mx-[1px] text-[13px]">
                {visibleSubsWBLCUsersInfo.map((sub) => {
                  const subTo = sub.to != null ? String(sub.to) : "";
                  const isSubActive =
                    subTo && subTo !== "#"
                      ? isActivePath(pathname, subTo)
                      : false;
                  const isDisabled =
                    Boolean((sub as { disabled?: boolean }).disabled) || !subTo;

                  return (
                    <li
                      key={subTo || sub.label}
                      className={`rounded-[2px] py-[10px] text-[#fff] ${isSubActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                    >
                      {isDisabled ? (
                        <span
                          className="px-3 py-1 pl-[15px] flex gap-2 text-[#6b7c85] cursor-not-allowed opacity-60 select-none"
                          aria-disabled
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </span>
                      ) : (
                        <Link
                          to={subTo}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </li>
      <li className="border-t border-dashed border-[#3a3835]">
        <Link
          to="/epayments-info/verification"
          className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[14px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/epayments-info/verification") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
        >
          <FaRegCreditCard className="mt-[2px]" /> Payment Status
        </Link>
      </li>
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
            <AccordionTrigger
              className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isTuManagementActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
            >
              <AccordionMenuLabel>
                <FaUsers size={16} /> Trade Union Management
              </AccordionMenuLabel>
            </AccordionTrigger>
            <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden">
              <ul className="list-none mx-[1px] pl-[5px] border-b border-dashed border-[#3a3835]text-[13px]">
                {visibleSubsTUManagement.map((sub) => {
                  const subPath = sub.to ? "/" + sub.to : "";
                  const isSubActive = sub.to
                    ? isActivePath(pathname, subPath)
                    : false;
                  const isDisabled =
                    Boolean((sub as { disabled?: boolean }).disabled) || !sub.to;

                  return (
                    <li
                      key={sub.to ?? sub.label}
                      className={`rounded-[2px] mb-[2px] py-[10px] text-[13px] ${isSubActive ? "bg-[#1e3a47] text-[#fff]" : "bg-[#2c3b41]"}`}
                    >
                      {isDisabled ? (
                        <span
                          className="px-3 py-1 pl-[15px] flex gap-2 text-[#6b7c85] cursor-not-allowed opacity-60 select-none"
                          aria-disabled
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </span>
                      ) : (
                        <Link
                          to={sub.to!}
                          className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                        >
                          <FaList className="mt-[2px]" /> {sub.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </li>
      {renderSidebarFooter()}
    </>
  );

  const renderCentralTradeUnionSidebar = () => {
    const isAnnualReturnActive =
      isActivePath(pathname, "/central-trade-union-annual-return-list") ||
      isActivePath(pathname, "/trade-union/tu-fed-final-pdf-central-admin-end");

    return (
      <>
        {/* Dashboard */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Link
            to="/dashboard"
            className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[13px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/dashboard")
              ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
              : "border-l-transparent text-[#8aa4af]"
              }`}
          >
            <AiFillDashboard className="mt-[2px]" /> Dashboard
          </Link>
        </li>

        {/* Annual Return Accordion */}
        <li className="border-t border-dashed border-[#3a3835]">
          <Accordion
            type="single"
            collapsible
            value={openSection === "ctu-annual-return" || isAnnualReturnActive ? "item-1" : ""}
            onValueChange={(v) => setOpenSection(v ? "ctu-annual-return" : null)}
            className="space-y-1.5"
          >
            <AccordionItem value="item-1" className="border-t border-dashed border-[#3a3835]">
              <AccordionTrigger
                className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isAnnualReturnActive
                  ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                  : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41] text-[#8aa4af]"
                  }`}
              >
                <AccordionMenuLabel>
                  <FaList className="mt-[2px]" /> Annual Return
                </AccordionMenuLabel>
              </AccordionTrigger>
              <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                <ul className="list-none mx-[1px] text-[13px]">
                  <li
                    className={`rounded-[2px] py-[10px] text-[#fff] ${isAnnualReturnActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"
                      }`}
                  >
                    <Link
                      to="/central-trade-union-annual-return-list"
                      className={`px-3 py-1 pl-[15px] flex gap-2 ${isAnnualReturnActive ? "text-white font-medium" : "text-[#8aa4af]"
                        }`}
                    >
                      <FaList className="mt-[2px]" /> List of Annual Return
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>

        {/* User Manual */}
        <li className="border-t border-dashed border-[#3a3835]">
          <span className="block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 text-[#8aa4af] cursor-not-allowed opacity-75">
            <FaBook className="mt-[2px]" /> User Manual
          </span>
        </li>

        {/* Auto Forward/Update Info */}
        <li className="border-t border-dashed border-[#3a3835]">
          <span className="block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] border-l-transparent flex gap-2 text-[#8aa4af] cursor-not-allowed opacity-75">
            <FaList className="mt-[2px]" /> Auto Forward/Update Info
          </span>
        </li>

        {/* Change Password & Logout Footer */}
        {renderSidebarFooter()}
      </>
    );
  };

  const isDlcOfficer = roleNumber === DLC_ROLE_ID;

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
        {roleNumber === STATISTICS_ROLE_ID ? (
          renderMinWagesSidebar()
        ) : isDlcOfficer ? (
          renderDlcOfficerSidebar()
        ) : roleNumber === 22 ? (
          renderCentralTradeUnionSidebar()
        ) : roleNumber === 23 ? (
          <>
            {/* SLI Admin Menu Items */}
            <li className="border-t border-dashed border-[#3a3835]">
              <Link
                to="/sli-admin/dashboard"
                className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/sli-admin/dashboard")
                  ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                  : "border-l-transparent text-[#8aa4af]"
                  }`}
              >
                <AiFillDashboard className="mt-[2px]" /> SLI Admin Dashboard
              </Link>
            </li>
            <li className="border-t border-dashed border-[#3a3835]">
              <Link
                to="/sli-admin/applications"
                className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/sli-admin/applications")
                  ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                  : "border-l-transparent text-[#8aa4af]"
                  }`}
              >
                <FaList className="mt-[2px]" /> SLI Applications List
              </Link>
            </li>
            {renderSidebarFooter()}
          </>
        ) : (
          <>
            {/* Dashboard */}
            {roleNumber !== 11 && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/dashboard"
                  className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/dashboard") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <AiFillDashboard className="mt-[2px]" /> Dashboard
                </Link>
              </li>
            )}
            {[4, 12].includes(roleNumber) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "dlc-inspections" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "dlc-inspections" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isDlcInspectionsActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaClipboardList className="mt-[2px]" /> Banglar Bhumi
                      </AccordionMenuLabel>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                      <ul className="list-none mx-[1px] text-[13px]">
                        <li
                          className={`rounded-[2px] py-[10px] text-[#fff] ${pathname === "/banglar-bhumi" ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                        >
                          <Link
                            to="/banglar-bhumi"
                            className={`px-3 py-1 pl-[15px] flex gap-2 ${pathname === "/banglar-bhumi" ? "text-white font-medium" : "text-[#8aa4af]"}`}
                          >
                            <FaList className="mt-[2px]" /> Inspection List
                          </Link>
                        </li>
                        {roleNumber === 12 && (
                          <li
                            className={`rounded-[2px] py-[10px] text-[#fff] ${pathname === "/banglar-bhumi/inquiry" ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                          >
                            <Link
                              to="/banglar-bhumi/inquiry"
                              className={`px-3 py-1 pl-[15px] flex gap-2 ${pathname === "/banglar-bhumi/inquiry" ? "text-white font-medium" : "text-[#8aa4af]"}`}
                            >
                              <FaList className="mt-[2px]" /> Generate
                              Inspection Order
                            </Link>
                          </li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}

            {/* Contractor License Certificate — Super Admin only */}
            {roleNumber === 12 && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/contractor-license-certificate"
                  className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/contractor-license-certificate") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <FaCertificate className="mt-[2px]" /> Contractor License
                  Certificate
                </Link>
              </li>
            )}

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
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isClraPeActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> CLRA (PE) Application
                      </AccordionMenuLabel>
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
                  onValueChange={(v) =>
                    setOpenSection(v ? "clra-license" : null)
                  }
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isClraLicenseActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> CLRA (License)
                        Applications
                      </AccordionMenuLabel>
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

            {/* ISMW — registrations + employment/recruitment licenses */}
            {[4, 7].includes(roleNumber) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "ismw" ? "item-1" : ""}
                  onValueChange={(v) => setOpenSection(v ? "ismw" : null)}
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isIsmwActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> ISMW
                      </AccordionMenuLabel>
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
                        {visibleSubsISMW.map((sub) => (
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
            {role === 7 && ( // LWFC = Inspector = Role ID - 7
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
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isBocwaActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> BOCWA Applications
                      </AccordionMenuLabel>
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
            {role === 4 && ( // ALC = Role ID - 4
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/receivedapplications/bocwa"
                  className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/receivedapplications/bocwa") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <FaList className="mt-[2px]" /> BOCWA Application
                </Link>
              </li>
            )}

            {/* SLI Admission for Applicants */}
            {![4, 7, 11, 12, 23].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/sli-admission/list"
                  className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/sli-admission/list")
                    ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                    : "border-l-transparent text-[#8aa4af]"
                    }`}
                >
                  <FaList className="mt-[2px]" /> SLI Admission
                </Link>
              </li>
            )}

            {/* SLI Admin Menu Items */}
            {Number(role) === 23 && (
              <>
                <li className="border-t border-dashed border-[#3a3835]">
                  <Link
                    to="/sli-admin/dashboard"
                    className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/sli-admin/dashboard")
                      ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                      : "border-l-transparent text-[#8aa4af]"
                      }`}
                  >
                    <AiFillDashboard className="mt-[2px]" /> SLI Admin Dashboard
                  </Link>
                </li>
                <li className="border-t border-dashed border-[#3a3835]">
                  <Link
                    to="/sli-admin/applications"
                    className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/sli-admin/applications")
                      ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                      : "border-l-transparent text-[#8aa4af]"
                      }`}
                  >
                    <FaList className="mt-[2px]" /> SLI Applications List
                  </Link>
                </li>
              </>
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
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isMtwActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> MTW Applications
                      </AccordionMenuLabel>
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

            {/* Self Certification - Temporarily Disabled */}
            {[4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/received-self-certification-application"
                  className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/received-self-certification-application")
                    ? "border-l-[#32dff3] bg-[#2c3b41] text-white"
                    : "border-l-transparent"
                    }`}
                >
                  <FaList className="mt-[2px]" />
                  Self Certification
                </Link>
              </li>
            )}

            {/* Administrative All Report */}
            {![11].includes(Number(role)) && (
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
            {/* {!([11, 4].includes(Number(role))) && (
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
                  <AccordionMenuLabel>
                    <FaList className="mt-[2px]" /> Migrant Worker
                  </AccordionMenuLabel></AccordionTrigger>
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
        )} */}

            {/* Register Record Repository */}
            {![11, 12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/register-record"
                  className={`block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] items-center ${isActivePath(pathname, "/register-record") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <RiGitRepositoryFill size={16} /> Register Record Repository
                </Link>
              </li>
            )}

            {/* Inspection Management - Temporarily Disabled */}
            {/* {[4, 12].includes(Number(role)) && (
              // <li className="border-t border-dashed border-[#3a3835]">
              //   <div
              //     className="
              //       py-[12px]
              //       pl-[15px]
              //       text-[13px]
              //       mr-[1px]
              //       border-l-[3px]
              //       border-l-transparent
              //       flex items-center gap-2
              //       bg-[#2c3b41]
              //       text-[#8aa4af]
              //       cursor-not-allowed
              //       opacity-60
              //     "
              //   >
              //     <FaClipboardList size={16} />
              //     Inspection Management (Coming Soon)
              //   </div>
              // </li>
            )} */}

            {/* Inspection Management - visible only for ALC (4), LWFC (7), Super Admin (12) */}
            {/* {[4, 7, 12].includes(Number(role)) && (
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
                  <AccordionMenuLabel>
                    <FaClipboardList size={16} /> Inspection Management
                  </AccordionMenuLabel></AccordionTrigger>
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
        )} */}

            {/* FAWLOI Management - visible only for ALC (4), LWFC (7)*/}
            {[0].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "fawloi" ? "item-1" : ""}
                  onValueChange={(v) => setOpenSection(v ? "fawloi" : null)}
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isFawloiActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <SiMdbook size={16} /> FAWLOI Management
                      </AccordionMenuLabel>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                      <ul className="list-none mx-px text-[13px]">
                        {visibleFAWLOISubs.map((sub) => (
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

            {/* TU Enquiry List */}
            {[11].includes(Number(role)) && (
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
            {![7, 11, 12].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/annual-return-alc"
                  className={`block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] items-center ${isActivePath(pathname, "/annual-return-alc")
                    ? "border-l-[#32dff3] bg-[#2c3b41]"
                    : "border-l-transparent"
                    }`}
                >
                  <PiGridNineFill size={16} /> Annual Return List
                </Link>
              </li>
            )}

            {/* OLD/OFFLINE DATA */}
            {![11, 12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "old-offline" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "old-offline" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger className="">
                      <AccordionMenuLabel>
                        <FaList className="mt-[2px]" /> OLD/OFFLINE DATA
                      </AccordionMenuLabel>
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
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isWblcUsersInfoActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaUsers className="mt-[2px]" /> WBLC Users Info
                      </AccordionMenuLabel>
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
                        {visibleSubsWBLCUsersInfo.map((sub) => {
                          const subTo = sub.to != null ? String(sub.to) : "";
                          const isSubActive =
                            subTo && subTo !== "#"
                              ? isActivePath(pathname, subTo)
                              : false;
                          const isDisabled =
                            Boolean((sub as { disabled?: boolean }).disabled) ||
                            !subTo;

                          return (
                            <li
                              key={subTo || sub.label}
                              className={`rounded-[2px] py-[10px] text-[#fff] ${isSubActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                            >
                              {isDisabled ? (
                                <span
                                  className="px-3 py-1 pl-[15px] flex gap-2 text-[#6b7c85] cursor-not-allowed opacity-60 select-none"
                                  aria-disabled
                                >
                                  <FaList className="mt-[2px]" /> {sub.label}
                                </span>
                              ) : (
                                <Link
                                  to={subTo}
                                  className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                                >
                                  <FaList className="mt-[2px]" /> {sub.label}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}

            {/* Service wise Applicant List */}
            {![11, 12].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  // to="/register-record"
                  to="#"
                  className={`block py-[12px] text-[13px] pl-[15px] mr-[1px] border-l-[3px] flex items-center gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/register-record") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <PiGridNineFill size={16} /> Service wise Applicant List
                  (Coming Soon)
                </Link>
              </li>
            )}

            {/* Employee Details */}
            {![11, 12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "employee-details" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "employee-details" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger className="">
                      <AccordionMenuLabel>
                        <FaUsers className="mt-[2px]" /> Employee Details
                      </AccordionMenuLabel>
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
            {![11, 12, 4, 7].includes(Number(role)) && (
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
            {![11, 12, 4, 7].includes(Number(role)) && (
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
                      <AccordionMenuLabel>
                        <FaImages className="mt-[2px]" /> Gallery
                      </AccordionMenuLabel>
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
            {![11, 12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "user-manual" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "user-manual" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger className="">
                      <AccordionMenuLabel>
                        <FaBook className="mt-[2px]" /> User Manual
                      </AccordionMenuLabel>
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
            {![11].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/epayments-info/verification"
                  className={`block py-[12px] pl-[15px] mr-[1px] border-l-[3px] text-[14px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isPaymentStatusActive ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <FaRegCreditCard className="mt-[2px]" /> Payment Status
                </Link>
              </li>
            )}

            {/* Grievance List */}
            {![11, 12, 4, 7].includes(Number(role)) && (
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
            {![11, 12, 4, 7].includes(Number(role)) && (
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
            {![12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="contact-information"
                  className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/contact-information") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <FaPhone className="mt-1" /> Contact Information
                </Link>
              </li>
            )}

            {/* Randomization Orders - visible for ALC (4) & LWFC (7) */}
            {/* Inspection */}
            {[4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={
                    openSection === "randomization-orders" ||
                      openSection === "inspection-alc"
                      ? "item-1"
                      : ""
                  }
                  onValueChange={(v) =>
                    setOpenSection(
                      v
                        ? Number(role) === 4
                          ? "inspection-alc"
                          : "randomization-orders"
                        : null,
                    )
                  }
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${[
                        "/inspection-submission-list",
                        "/alc-orders-list",
                        "/inspection-list",
                        "/central-inspection-list",
                        "/print-inspection-note",
                        "/inspector-inspection-list",
                        "/inspection/show-cause",
                        "/inspection/courtcase",
                        "/inspection/showcause-list",
                      ].some((p) => isActivePath(pathname, p))
                        ? "border-l-[#32dff3] bg-[#2c3b41]"
                        : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"
                        }`}
                    >
                      <AccordionMenuLabel>
                        <FaClipboardList size={16} /> Inspection
                      </AccordionMenuLabel>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                      <ul className="list-none mx-[1px] text-[13px]">
                        {[
                          {
                            to: "/inspection-submission-list",
                            label: "Randomization orders",
                            showForRoles: [4],
                          },
                          {
                            to: "/alc-orders-list",
                            label: "Randomization Order Lists",
                            showForRoles: [4],
                          },
                          {
                            to: "/inspection-list",
                            label: "Randomization Order",
                            showForRoles: [7],
                          },
                          {
                            to: "/print-inspection-note",
                            label: "Print Blank Inspection Note",
                          },
                          {
                            to: "/inspection-list/final-submit?source=ins",
                            label: "New Inspection",
                          },
                          {
                            to: "/inspector-inspection-list",
                            label: "Internal Inspection List",
                          },
                          // {
                          //   to: "/inspection/show-cause",
                          //   label: "Late Off Files",
                          // },
                          // {
                          //   to: "/inspection/courtcase",
                          //   label: "Court Case Files",
                          // },
                          // {
                          //   to: "/inspection/showcause-list",
                          //   label: "Show Cause List",
                          // },
                        ]
                          .filter(
                            (sub) =>
                              !sub.showForRoles ||
                              sub.showForRoles.includes(Number(role)),
                          )
                          .map((sub) => {
                            const isSubActive = isActivePath(pathname, sub.to);
                            return (
                              <li
                                key={sub.to}
                                className={`rounded-[2px] py-[10px] text-[#fff] ${isSubActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                              >
                                <Link
                                  to={sub.to}
                                  className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                                >
                                  <FaList className="mt-[2px]" /> {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}

            {/* Central Inspection - separate from the Inspection menu */}
            {[4, 7, 12].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "central-inspection" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "central-inspection" : null)
                  }
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isCentralInspectionActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <HiClipboardDocument className="mt-[2px]" /> Central Inspection
                      </AccordionMenuLabel>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-t-none rounded-b-[3px] overflow-hidden pb-0">
                      <ul className="list-none mx-[1px] text-[13px]">
                        {(() => {
                          const scheduledInspectionPath =
                            Number(role) === 7
                              ? "/central-inspection/inspector/scheduled-inspection"
                              : "/central-inspection/scheduled-inspection";
                          const isScheduledInspectionActive =
                            isActivePath(pathname, scheduledInspectionPath) ||
                            isActivePath(
                              pathname,
                              "/risk-wise-randomization-list/central-incpection",
                            );

                          return (
                            <li
                              className={`rounded-[2px] py-[10px] text-[#fff] ${isScheduledInspectionActive ? "bg-[#1e3a47]" : "bg-[#2c3b41]"}`}
                            >
                              <Link
                                to={scheduledInspectionPath}
                                className={`px-3 py-1 pl-[15px] flex gap-2 ${isScheduledInspectionActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                              >
                                <FaList className="mt-[2px]" /> Scheduled Inspection
                              </Link>
                            </li>
                          );
                        })()}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}

            {/* Randomization - visible only for DLC (role 5) */}
            {[5].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "randomization-dlc" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "randomization-dlc" : null)
                  }
                  className=""
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger className="">
                      <AccordionMenuLabel>
                        <AiFillDashboard className="mt-[2px]" /> Randomization
                      </AccordionMenuLabel>
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
                          {
                            to: "/central-inspection-list",
                            label: "Central Inspection List",
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
            {![11, 12, 4, 7].includes(Number(role)) && (
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
                      <AccordionMenuLabel>
                        <HiClipboardDocument className="mt-[2px]" /> CLRA
                        Registration
                      </AccordionMenuLabel>
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
            {![11, 12, 4, 7].includes(Number(role)) && (
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
                      <AccordionMenuLabel>
                        <HiClipboardDocument className="mt-[2px]" /> BOCWA Est.
                        Registration
                      </AccordionMenuLabel>
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
            {![12, 4, 7].includes(Number(role)) && (
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
                      <AccordionMenuLabel>
                        <FaUsers className="mt-[2px]" /> Central/State Trade
                        Union and Federation Management
                      </AccordionMenuLabel>
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
            {![4].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "tu-management" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "tu-management" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger
                      className={`mr-[1px] rounded-none border-l-[3px] py-[12px] pl-[15px] text-[13px] hover:no-underline [&>svg]:text-current transition-colors ${isTuManagementActive ? "border-l-[#32dff3] bg-[#2c3b41]" : "border-l-transparent hover:border-l-[#32dff3] hover:bg-[#2c3b41]"}`}
                    >
                      <AccordionMenuLabel>
                        <FaUsers size={16} /> Trade Union Management
                      </AccordionMenuLabel>
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
                        {visibleSubsTUManagement.map((sub) => {
                          const subPath = sub.to ? "/" + sub.to : "";
                          const isSubActive = sub.to
                            ? isActivePath(pathname, subPath)
                            : false;
                          const isDisabled =
                            Boolean((sub as { disabled?: boolean }).disabled) || !sub.to;

                          return (
                            <li
                              key={sub.to ?? sub.label}
                              className={`rounded-[2px] mb-[2px] py-[10px] text-[13px] ${isSubActive ? "bg-[#1e3a47] text-[#fff]" : "bg-[#2c3b41]"}`}
                            >
                              {isDisabled ? (
                                <span
                                  className="px-3 py-1 pl-[15px] flex gap-2 text-[#6b7c85] cursor-not-allowed opacity-60 select-none"
                                  aria-disabled
                                >
                                  <FaList className="mt-[2px]" /> {sub.label}
                                </span>
                              ) : (
                                <Link
                                  to={sub.to!}
                                  className={`px-3 py-1 pl-[15px] flex gap-2 ${isSubActive ? "text-white font-medium" : "text-[#8aa4af]"}`}
                                >
                                  <FaList className="mt-[2px]" /> {sub.label}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}

            {/* Trade Union */}
            {![11, 12].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Link
                  to="/trade-union-master-list"
                  className={`block py-[12px] pl-[15px] text-[13px] mr-[1px] border-l-[3px] flex items-center gap-2 hover:border-l-[#32dff3] hover:bg-[#2c3b41] ${isActivePath(pathname, "/trade-union-master-list") ? "border-l-[#32dff3] bg-[#2c3b41] text-white" : "border-l-transparent"}`}
                >
                  <IoAppsSharp size={16} /> Trade Union {/* dlc can view */}
                </Link>
              </li>
            )}

            {/* Food Coupon */}
            {![11, 12, 4, 7].includes(Number(role)) && (
              <li className="border-t border-dashed border-[#3a3835]">
                <Accordion
                  type="single"
                  collapsible
                  value={openSection === "food-coupon" ? "item-1" : ""}
                  onValueChange={(v) =>
                    setOpenSection(v ? "food-coupon" : null)
                  }
                  className="space-y-1.5"
                >
                  <AccordionItem
                    value="item-1"
                    className="border-t border-dashed border-[#3a3835]"
                  >
                    <AccordionTrigger className="">
                      <AccordionMenuLabel>
                        <FaShoppingCart size={16} /> Food Coupon
                      </AccordionMenuLabel>
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

            {renderSidebarFooter()}
          </>
        )}
      </ul>
    </div>
  );
};

export default DashboardSidebar;
