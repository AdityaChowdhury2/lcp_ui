// src/layouts/DashboardLayout.tsx
import { getUserDetails } from "@/utils/auth";
import { FC, memo, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardApplicantFooter from "./DashboardApplicant/DashboardApplicantFooter";
import DashboardApplicantHeader from "./DashboardApplicant/DashboardApplicantHeader";
import DashboardApplicantSidebar from "./DashboardApplicant/DashboardApplicantSidebar";

const isDesktopViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

/** Isolated from sidebarOpen so toggling the menu does not re-render the page (Outlet). */
const ApplicantPageColumn = memo(function ApplicantPageColumn() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-100">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="p-4 lg:p-5">
          {/* <MigrationNoticeBanner /> */}
          <Outlet />
        </div>
      </main>
      <DashboardApplicantFooter />
    </div>
  );
});

const DashboardApplicantLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(isDesktopViewport);
  const { pathname } = useLocation();
  const user = getUserDetails();
  const isSliCandidate = !!(user?.isSliApplicant || pathname.startsWith("/sli-admission"));

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setSidebarOpen(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <DashboardApplicantHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {!isSliCandidate && (
          <>
            {/* Desktop spacer: pushes content without animating the sidebar's own width. */}
            <div
              className={`hidden shrink-0 lg:block ${sidebarOpen ? "w-[280px]" : "w-0"
                } transition-[width] duration-300 ease-out`}
              aria-hidden="true"
            />
            <aside
              id="applicant-sidebar"
              className={[
                "absolute inset-y-0 left-0 z-50 w-[280px] max-w-[280px]",
                "overflow-hidden bg-[#272523] text-white",
                "transition-transform duration-300 ease-out will-change-transform",
                sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
              ].join(" ")}
              aria-hidden={!sidebarOpen}
            >
              <div className="hide-scrollbar h-full w-[280px] max-w-[280px] overflow-x-hidden overflow-y-auto overscroll-y-contain">
                <DashboardApplicantSidebar setSidebarOpen={setSidebarOpen} />
              </div>
            </aside>
          </>
        )}

        {sidebarOpen && !isSliCandidate && (
          <div
            className="absolute inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <ApplicantPageColumn />
      </div>
    </div>
  );
};

export default DashboardApplicantLayout;
