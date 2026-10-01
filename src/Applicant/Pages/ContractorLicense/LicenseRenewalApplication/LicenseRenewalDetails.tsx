import React, { useState } from "react";
import InfoSection from "./InfoSection";

const LicenseRenewalDetails: React.FC = () => {
    const formRefNo = "00833153";

    const [file, setFile] = useState<File | null>(null);
    const [checked, setChecked] = useState(false);

    // ✅ Dummy Data (matches Drupal)
    const sections = [
        {
            title: "Principal Employer Information",
            rows: [
                {
                    label: "Name & Address of the Establishment",
                    value:
                        "TEST SUCHINTA\nTEST SUCHINTA JHARGRAM,\nWard-16, Jhargram Municipality, Jhargram - 721501",
                },
                {
                    label: "Name & Address of the Principal Employer",
                    value: "TEST\nTEST\nJhargram",
                },
                {
                    label:
                        "Type of Business, trade, industry, manufacture or occupation",
                    value: "AC Maintenance, Civil Works, Electrical Works...",
                },
                {
                    label: "Number and date of Certificate",
                    value: "TEST SUCHINTA\n02nd Sep 2025",
                },
            ],
        },

        {
            title: "Contractor Information provided by Principal Employer",
            rows: [
                {
                    label: "Name & Address of Contractor",
                    value: "TEST\nWard-18, Jhargram Municipality",
                },
                {
                    label: "Maximum number of Contract Labour",
                    value: "123",
                },
                {
                    label: "Nature of work",
                    value: "-",
                },
                {
                    label: "Duration of work",
                    value: "01 Jan 2021 to 31 Mar 2029\nEstimated Duration: 3011 days",
                },
            ],
        },

        {
            title: "License Information",
            rows: [
                {
                    label: "Name & Address of Contractor",
                    value: "TEST\nJhargram",
                },
                {
                    label: "Work-site address",
                    value: (
                        <>
                            Fartabad, Garia{"\n"}
                            <span className="text-red-600 font-semibold">
                                Note: Your application will be forwarded to RLO Jhargram
                            </span>
                        </>
                    ),
                },
                {
                    label: "License Number & Date",
                    value: "JGM01/CLL/000176 issued on 02nd Sep 2025",
                },
                {
                    label: "Maximum Labour",
                    value: (
                        <span className="font-semibold">
                            123 (One Hundred Twenty Three){" "}
                            <span className="text-red-600">**</span>
                        </span>
                    ),
                },
                {
                    label: "Expiry Date",
                    value: (
                        <span className="font-semibold">
                            01st Sep 2027 <span className="text-red-600">**</span>
                        </span>
                    ),
                },
                {
                    label: "Renewal Fees",
                    value: (
                        <span className="font-semibold">
                            ₹500/- (Five Hundred only){" "}
                            <span className="text-red-600">**</span>
                        </span>
                    ),
                },
                {
                    label: "Co-operative Society",
                    value: "No",
                },
            ],
        },

        {
            title: "Uploaded Documents",
            rows: [
                { label: "Previous Work Order", value: "No Document uploaded" },
                { label: "FORM-VII", value: "Will be uploaded after fees submission" },
            ],
        },
    ];

    return (
        <div className="w-full px-2 md:px-10 py-4">
            {/* Header */}
            <div className="bg-white border rounded shadow-sm mb-6">
                <div className="text-center py-3 text-[16px] font-semibold">
                    Form-V/Reference Number:{" "}
                    <span className="text-black">{formRefNo}</span>
                </div>
            </div>

            {/* Sections */}
            {sections.map((section, idx) => (
                <InfoSection key={idx} title={section.title} rows={section.rows} />
            ))}

            {/* Upload Section */}
            <div className="border border-gray-300 rounded bg-white shadow-sm mb-6">
                <div className="bg-[#2C5D7C] text-white px-4 py-2 text-sm font-semibold">
                    Upload Extended Work Order
                </div>

                <div className="p-4">
                    <label className="block text-sm mb-2">
                        Extended Work-order <span className="text-red-600">*</span>
                    </label>

                    <input
                        type="file"
                        className="border px-2 py-1 text-sm"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            {/* Declaration */}
            <div className="mb-6">
                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <span>
                        <b>
                            Declaration: I hereby declare that the details given above are
                            correct to the best of my knowledge and belief.
                        </b>{" "}
                        <span className="text-red-600">*</span>
                    </span>
                </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    disabled={!checked}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default LicenseRenewalDetails;