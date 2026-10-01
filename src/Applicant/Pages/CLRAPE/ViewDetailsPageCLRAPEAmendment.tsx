import React from "react";
import { useNavigate } from "react-router-dom";
import ApplicationPreview from "./application-preview/ApplicationPreview";

const ViewDetailsPageCLRAPEAmendment: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-[#2A628C]">
                        CLRA PE Amendment Application Details
                    </h2>
                    <button
                        onClick={() => navigate("/applicant-dashboard")}
                        className="bg-[#2A628C] text-white px-4 py-2 rounded hover:bg-black text-sm animate-all duration-300"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <ApplicationPreview isEditable={false} />

                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => navigate("/applicant-dashboard")}
                        className="bg-[#2A628C] text-white px-4 py-2 rounded hover:bg-black text-sm animate-all duration-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewDetailsPageCLRAPEAmendment;
