// UnderDevelopment.jsx
import { IMAGE_BASE } from "@/constants/constants";
import { useNavigate } from "react-router-dom";

export default function UnderDevelopment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-cream/40">

      <div className="w-full max-w-xl bg-white border border-brand-sand rounded-2xl shadow-xl p-10 text-center">

        {/* ✅ SINGLE LOGO ONLY */}
        <div className="flex justify-center mb-6">
          <img
            src={`${IMAGE_BASE}emblemofindia.png`}
            alt="Department Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* ✅ PROPER ICON (TOOLS) */}
        {/* <div className="flex justify-center mb-4">
          <div className="bg-brand-olive/60 p-4 rounded-full border border-brand-sand">

          </div>
        </div> */}

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-brand-dark mb-2">
          Under Development
        </h1>

        {/* TEXT */}
        <p className="text-brand-deep text-sm mb-6">
          This module is currently being developed and will be available soon.
        </p>

        {/* INFO BOX */}
        <div className="bg-brand-olive/40 border border-brand-sand rounded-lg p-4 mb-6">
          <p className="text-sm text-brand-deep">
            Our team is actively working to enhance this feature and ensure a seamless experience.
          </p>
        </div>

        {/* ✅ FIXED BUTTONS */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-brand-dark text-brand-dark rounded-lg hover:bg-brand-dark hover:text-white transition"
          >
            Go Back
          </button>

        </div>

        {/* FOOTER */}
        <div className="mt-6 text-xs text-gray-500">
          For assistance, please contact the system administrator.
        </div>

      </div>
    </div>
  );
}