import { API_BASE } from "@/constants/constants";
import {
  STATISTICS_MIN_WAGES_PATHS,
  STATISTICS_ROLE_ID,
} from "@/routing/roleGroups";
import { FC, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserName, getUserRole } from "../utils/auth";
import DashboardFooter from "./Dashboard/DashboardFooter";
import DashboardHeader from "./Dashboard/DashboardHeader";
import DashboardSidebar from "./Dashboard/DashboardSidebar";


const DashboardLayout: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<string | null | number>(null);
  const [username, setUsername] = useState<string | null>("");
  const [name, setName] = useState<string | null>("");

  useEffect(() => {
    setRole(getUserRole());
    setUsername(getUserName());
    const fetchAlcRloDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE}dashboard/rlo-details`);
        const data = response.data;

        if (data?.code === 200) {
          const result = data?.result;
          setName(result.alc_name);
        } else {
          console.error("ALC RLO Data not fetched");
        }
      } catch (error) {
        console.error("Fetch ALC RLO details API error:", error);
      }
    };
    fetchAlcRloDetails();
  }, []);

  // STATISTICS (role 15): only min-wages pages + change password
  useEffect(() => {
    const roleId = Number(role);
    if (roleId !== STATISTICS_ROLE_ID) return;

    const allowed =
      STATISTICS_MIN_WAGES_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      ) || pathname.endsWith("/change-password");

    if (!allowed) {
      navigate("/min-wages/scheduled-employment", { replace: true });
    }
  }, [role, pathname, navigate]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - now controls sidebar */}
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} name={name} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!pathname.startsWith("/sli-admission") && (
          <div className="relative z-50 h-full overflow-hidden flex-shrink-0">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} username={username} />
          </div>
        )}

        {/* Overlay when sidebar open on mobile */}
        {sidebarOpen && !pathname.startsWith("/sli-admission") && (
          <div
            className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-4 lg:p-5 pb-6">
              {/* <MigrationNoticeBanner /> */}
              <Outlet />
            </div>
          </main>

          {/* Footer - now full width on mobile */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;