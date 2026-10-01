// DataMigration.jsx
import { IMAGE_BASE } from "@/constants/constants";
import { useNavigate } from "react-router-dom";

export default function DataMigration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-cream/40">

      <div className="w-full max-w-xl bg-white border border-brand-sand rounded-2xl shadow-xl p-10 text-center">

        {/* 🔰 LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={`${IMAGE_BASE}emblemofindia.png`}
            alt="Department Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* 🔄 MIGRATION ICON */}
        <div className="flex justify-center mb-4">
          <div className="bg-brand-olive/60 p-4 rounded-full border border-brand-sand">
            <svg
              className="w-10 h-10 text-brand-deep animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v6h6M20 20v-6h-6M5.64 18.36A9 9 0 0112 3a9 9 0 018.36 5.64M18.36 5.64A9 9 0 0112 21a9 9 0 01-8.36-5.64"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-brand-dark mb-2">
          Data Migration in Progress
        </h1>

        {/* MESSAGE */}
        <p className="text-brand-deep text-sm mb-6">
          We are securely transferring system data. Please do not refresh or close this page.
        </p>

        {/* INFO BOX */}
        <div className="bg-brand-olive/40 border border-brand-sand rounded-lg p-4 mb-6">
          <p className="text-sm text-brand-deep">
            The migration process ensures data integrity and system improvements. 
            This may take a few moments.
          </p>
        </div>

        {/* LOADING BAR */}
        <div className="w-full bg-brand-cream rounded-full h-2 mb-6 overflow-hidden">
          <div className="h-2 bg-brand-dark animate-pulse w-2/3"></div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-brand-dark text-brand-dark rounded-lg hover:bg-brand-dark hover:text-white transition"
          >
            Go Back
          </button>

          {/* <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-brand-dark text-black rounded-lg shadow hover:bg-brand-deep transition"
          >
            Home
          </button> */}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-xs text-gray-500">
          Please wait until the process is completed. Contact administrator if delay persists.
        </div>

      </div>
    </div>
  );
}