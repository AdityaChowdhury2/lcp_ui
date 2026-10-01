import { IMAGE_BASE } from "@/constants/constants";
// src/components/Dashboard/DashboardHeader.tsx
import React, { FC } from "react";
import { Menu, Bell, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { IoPower } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { logout } from "@/store/authSlice";


// ← ADD THIS LINE (copy exactly)
interface HeaderProps {
  role: string | null | number;
  sidebarOpen: boolean;
  name: string | null;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: FC<HeaderProps> = ({ name, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };
  
  return (
    <header className={`${sidebarOpen ? '' : 'ml-0'} left-0 right-0 z-[900] h-[50px] bg-[#0f78b8] text-white shadow-lg`}>
      <div className="flex items-center justify-between h-full">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center">


          <p className="text-[16px] font-semibold bg-[#367fa9] h-[50px] w-[250px] leading-[50px] text-center">
            LABOUR Commissionerate
          </p>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* <p className="text-[14px] font-bold lg:hidden ml-2">LC Portal</p> */}
        </div>

        {/* Right: Mail, Bell, User */}
        <div className="flex items-center gap-3">
          {/* <button className="relative p-2 rounded-full hover:bg-white/10">
            <Mail className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-xs rounded-full flex items-center justify-center">3</span>
          </button>

          <button className="relative p-2 rounded-full hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-xs rounded-full flex items-center justify-center">5</span>
          </button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex w-full justify-center-md text-sm font-semibold text-white shadow-xs border-0 flex items-center gap-2 p-2 rounded-full hover:bg-white/10">
                <img src={`${IMAGE_BASE}if_profile-filled.png`} alt="User" className="w-6 h-6 rounded-full" />
                <div className="hidden sm:block text-right text-xs">
                  <p className="font-semibold uppercase tracking-wide text-[11px]">
                    {name}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="relative -left-0.58 mr-4 mt-1">
              <DropdownMenuItem><div className="flex gap-1" onClick={handleLogout}><IoPower /> Logout</div></DropdownMenuItem>  
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;