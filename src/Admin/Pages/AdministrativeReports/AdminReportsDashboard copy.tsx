import React from "react";
import { useNavigate } from "react-router-dom";

type CardProps = {
  title: string;
  actionLabel: string;
  color: string;
  onClick?: () => void;
};

const ReportCard: React.FC<CardProps> = ({ title, actionLabel, color, onClick }) => {
  return (
    <div
      className={`shadow-md p-6 flex flex-col justify-between transition-transform duration-200 hover:shadow-lg ${color}`}
    >
      <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
      <button
        onClick={onClick}
        className="text-white font-medium flex items-center gap-2 hover:underline cursor-pointer transition-opacity duration-200 hover:opacity-80"
      >
        {actionLabel} →
      </button>
    </div>
  );
};

const AdminReportsDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="pl-1 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Administrative Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-white border-t-3 border-solid border-blue-400">
        <ReportCard
          title="Proforma - I Monthly Report"
          actionLabel="Generate & Download"
          color="bg-sky-400"
          onClick={() => navigate('/lcreport/proforma-one')}
        />
        {/* <ReportCard
          title="Proforma - I Monthly Report"
          actionLabel="Download"
          color="bg-sky-400"
          onClick={() => navigate('/lcreport/proforma-one-xls-download')}
        /> */}
        <ReportCard
          title="Proforma - III Monthly Report"
          actionLabel="View & Download"
          color="bg-green-700"
          onClick={() => navigate('/lcreport/proformathree')}
        />
        <ReportCard
          title="Prosecution Cases Report"
          actionLabel="View & Download"
          color="bg-amber-500"
          onClick={() => navigate('/courtcasereport')}
        />
        <ReportCard
          title="Analytical Report"
          actionLabel="View & Download"
          color="bg-purple-800"
          onClick={() => navigate('/office/analytic-report')}
        />
        <ReportCard
          title="Payment Report"
          actionLabel="View & Download"
          color="bg-red-700"
          onClick={() => navigate('/office/analytic-payment-report')}
        />
        <ReportCard
          title="CS Dashboard Report"
          actionLabel="View & Download"
          color="bg-amber-500"
          onClick={() => navigate('/office/cs-reports')}
        />
        <ReportCard
          title="RTPS Report"
          actionLabel="View & Download"
          color="bg-green-700"
          onClick={() => navigate('/office/rtps-reports')}
        />
      </div>
    </div>
  );
};

export default AdminReportsDashboard;
