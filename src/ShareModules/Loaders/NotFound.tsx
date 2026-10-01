// NotFound.jsx
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-cream/40">
      <div className="w-full max-w-xl bg-white border border-brand-sand rounded-2xl shadow-lg p-10 text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-brand-olive p-4 rounded-full">
            <svg
              className="w-10 h-10 text-brand-deep"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008h-.008V9.75zM8.25 15c1.125-1.125 2.625-1.125 3.75 0s2.625 1.125 3.75 0M12 3v1.5M12 19.5V21M4.5 12H3m18 0h-1.5M5.636 5.636l-1.06-1.06m14.848 14.848l-1.06-1.06M5.636 18.364l-1.06 1.06m14.848-14.848l-1.06 1.06"
              />
            </svg>
          </div>
        </div>

        {/* 404 Code */}
        <h1 className="text-6xl font-extrabold text-brand-dark mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-brand-deep mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-sm text-brand-deep mb-6 leading-relaxed">
          The page you are trying to access does not exist or may have been moved.
          <br />
          Please check the URL or navigate using the options below.
        </p>

        {/* Divider */}
        <div className="w-20 h-[2px] bg-brand-sand mx-auto mb-6"></div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-brand-dark text-brand-dark rounded-lg hover:bg-brand-dark hover:text-white transition"
          >
            Go Back
          </button>

          <Link
            to="/"
            className="px-5 py-2 bg-brand-dark rounded-lg shadow hover:bg-brand-deep transition"
          >
            Go to Home
          </Link>

        </div>

        {/* Footer note (gov style touch) */}
        <p className="text-xs text-gray-500 mt-6">
          If the issue persists, please contact system administrator.
        </p>

      </div>
    </div>
  );
}