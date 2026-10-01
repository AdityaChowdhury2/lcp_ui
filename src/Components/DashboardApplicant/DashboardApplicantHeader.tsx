// src/components/Dashboard/DashboardHeader.tsx
import React, { FC } from "react";
import { Menu, Bell, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu"
import { FaBullhorn } from "react-icons/fa";

// import { Marquee } from "../../Components/ui/marquee"

import { MdManageAccounts } from "react-icons/md";
import { Marquee } from "../../Components/ui/Marquee";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { getUserDetails } from "@/utils/auth";

// ← ADD THIS LINE (copy exactly)
interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardApplicantHeader: FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getUserDetails();
  const isSliCandidate = !!(user?.isSliApplicant || pathname.startsWith("/sli-admission"));
  const dispatch = useDispatch<AppDispatch>();
  const imageBase = import.meta.env.BASE_URL;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <header className="z-[900] h-[50px] shrink-0 bg-white shadow-sm">
      <div className="flex h-full items-center overflow-hidden">
        {/* Left: Logo + Hamburger — same 280px as the sidebar when it is open */}
        <div
          className={`flex h-full shrink-0 items-center overflow-hidden bg-[#1e1d1f] ${
            isSliCandidate ? "w-auto" : "w-[280px]"
          }`}
        >
          <div className="min-w-0 flex-1 px-2">
            <img
              src={`${imageBase}images/logo-profile-page.png`}
              alt="Logo"
              className="h-[35px] md:h-[50px] w-auto max-w-full object-contain object-left"
            />
          </div>
          {!isSliCandidate && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-1 shrink-0 rounded-md p-2 text-white hover:bg-white/10"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              aria-controls="applicant-sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Right: Bullhorn + Marquee + My Profile (one row, profile always visible) */}
        <div className="flex min-w-0 flex-1 items-center gap-2 bg-white px-3 sm:px-5">
          <FaBullhorn className="shrink-0 text-4xl text-red-700" />
          <div className="flex-1 min-w-0 overflow-hidden">
            <Marquee />
          </div>
          {/* Profile — SLI candidates keep their details on the admission form,
              not in the applicant profile master, so it is hidden for them. */}
          {!isSliCandidate && (
            <div className="flex items-center shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 cursor-pointer bg-white text-sm font-semibold text-gray-900 shadow-sm border-0 rounded px-2 py-1 hover:bg-gray-100">
                  <MdManageAccounts className="text-[#2b5f88] text-2xl" />
                  <span className="hidden sm:inline">My Profile</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-4 mt-1" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/my-profile")}>
                    Update Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/change-password-applicant")}>
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(DashboardApplicantHeader);
