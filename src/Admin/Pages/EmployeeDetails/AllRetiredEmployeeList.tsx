import { FC } from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen mt-0 w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          style={{cursor: "pointer"}}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;