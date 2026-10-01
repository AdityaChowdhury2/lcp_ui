import { FRONTEND_BASE } from "@/constants/constants";
import { FC } from "react";
import { Link } from "react-router-dom";

const DashboardFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 w-full bg-[#594f45] p-[15px] text-[#ddd] z-10">
      <div className="float-right">
        <b className="font-[700]">Version</b> 2.0
      </div>
      <strong>
        Copyright © 2015-{currentYear}{" "}
        <Link
          to={`${FRONTEND_BASE}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f39c12]"
        >
          Labour Commissionerate
        </Link>
        .
      </strong>{" "}
      All rights reserved.
    </footer>
  );
};

export default DashboardFooter;
