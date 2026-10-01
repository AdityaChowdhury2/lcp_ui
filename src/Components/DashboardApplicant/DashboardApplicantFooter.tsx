import { FRONTEND_BASE } from "@/constants/constants";
import { FC, memo } from "react";
import { Link } from "react-router-dom";

const DashboardApplicantFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 bg-[#bdbdbd] px-3 py-3 text-xs text-black sm:px-[15px] sm:text-sm">
      <div className="float-right">
        <b className="font-[500]">Version</b> 2.0
      </div>
      <strong>
        Copyright © 2015-{currentYear}{" "}
        <Link
          to={FRONTEND_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700"
        >
          Commissionerate of Labour
        </Link>
        .
      </strong>{" "}
      All rights reserved.
    </footer>
  );
};

export default memo(DashboardApplicantFooter);
