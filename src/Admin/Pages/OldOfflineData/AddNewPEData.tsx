import React, { useState } from "react";

const AddNewPEData: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile && !selectedFile.name.endsWith(".xlsx")) {
            setError("Only .xlsx is a valid extension.");
        } else {
            setError("");
        }
    };

    const handleUpload = () => {
        if (!file) {
            setError("Please select a file.");
            return;
        }
        if (!file.name.endsWith(".xlsx")) {
            setError("Only .xlsx is a valid extension.");
            return;
        }

        alert("File uploaded successfully!");
    };

    return (
        <div className="w-full min-h-screen bg-[#F9F6F1] p-6 md:p-5">

            {/* PAGE TITLE */}
            <h1 className="text-2xl font-[24px] text-gray-900 mb-5">PE DATA</h1>

            {/* RED INSTRUCTIONS */}
            <p className="text-600 text-sm leading-relaxed max-w-3xl" style={{ color: "#ff0000" }}>
                Before the uploading, please click{" "}
                <a href="#" className="text-700 font-medium" style={{ color: "#f39c12" }}>
                    here
                </a>{" "}
                and download the excel file. After filling up the establishment
                details in the specified format then upload this file.
            </p>

            {/* LABEL */}
            <h2 className="mt-6 mb-2 text-gray-900 font-semibold">Select Excel File</h2>

            {/* FILE INPUT + NAME */}
            <div className="flex flex-col items-start gap-2">
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="block text-sm text-gray-800 
                               file:mr-4 file:py-2 file:px-4
                               file:border file:border-gray-300
                               file:rounded file:bg-white
                               file:text-gray-800
                               file:hover:bg-gray-100"
                />

                {file && (
                    <span className="text-gray-700 text-sm">{file.name}</span>
                )}
            </div>

            {/* NOTE */}
            <p className="text-xs text-red-600 mt-2" style={{ color: "#ff0000" }}>
                #Note : .xlsx is only a valid extension
            </p>

            {/* VALIDATION ERROR */}
            {error && <p className="text-sm text-600 mt-2" style={{ color: "#ff0000" }}>{error}</p>}

            {/* UPLOAD BUTTON */}
            <button
                onClick={handleUpload}
                className="mt-4 px-5 py-2 bg-white text-[#ff0000] 
                           rounded hover:bg-[#F9F6F1] text-sm cursor-pointer border"
            >
                Upload
            </button>
        </div>
    );
};

export default AddNewPEData;
