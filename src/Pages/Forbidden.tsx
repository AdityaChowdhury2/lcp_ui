import React from "react";
import { useLocation, Link } from "react-router-dom";

const Forbidden: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold mb-2">403 - Forbidden</h1>
      <p className="mb-4">
        You don&apos;t have permission to access{" "}
        <span className="font-mono">{location.pathname}</span>.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Go to Home
        </Link>
        <Link
          to="/applicant-login"
          className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
        >
          Sign in with a different account
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;

