"use client";

import React from "react";
// import { type } from './../../../store/authSlice';
import { Input } from "../../../Components/ui/input";
import ClraRegDashboardTabs from "./ClraRegDashboardTabs";

const ClraRegVerify: React.FC = () => {
    const data = [
        { parameter: "Name of the Establishment", input: "TEST SUCHINTA" },
        { parameter: "Establishment type", input: "Micro" },
        { parameter: "Location of the Establishment", input: "TEST SUCHINTA JHARGRAM" },
        { parameter: "District of the Establishment", input: "Jhargram" },
        { parameter: "Subdivision of the Establishment", input: "Jhargram" },
        { parameter: "Area type of the Establishment", input: "Municipality" },
        { parameter: "Municipality of the Establishment", input: "Jhargram Municipality" },
        { parameter: "Ward of the Establishment", input: "Ward-16" },
        { parameter: "Police Station of the Establishment", input: "Ward-16" },
        { parameter: "Pin Number of the Establishment", input: "Ward-16" },
        { parameter: "Postal Address of the Establishment", input: "Ward-16" },
        { parameter: "District of the Postal Address", input: "Ward-16" },
        { parameter: "Subdivision of the Postal Address", input: "Ward-16" },
        { parameter: "Area type of the Postal Address", input: "Ward-16" },
        { parameter: "Municipality of the Establishment", input: "Ward-16" },
        { parameter: "Ward of the Postal Address", input: "Ward-16" },
        { parameter: "Police Station of the Postal Address", input: "Ward-16" },
        { parameter: "Pin Number of the Postal Address", input: "Ward-16" },
        { parameter: "Full Name of the Principal Employer", input: "Ward-16" },
        { parameter: "Gender", input: "Ward-16" },
        { parameter: "Country Of the Principal Employer", input: "Ward-16" },
        { parameter: "State Of the Principal Employer", input: "Ward-16" },
        { parameter: "Address Of the Principal Employer", input: "Ward-16" },
        { parameter: "District of the Principal Employer", input: "Ward-16" },
        { parameter: "Subdivision of the Principal Employer", input: "Ward-16" },
        { parameter: "Area type of the Principal Employer", input: "Ward-16" },
        { parameter: "Municipality of the Principal Employer", input: "Ward-16" },
        { parameter: "Ward of the Principal Employer", input: "Ward-16" },
        { parameter: "Police Station of the Principal Employer", input: "Ward-16" },
        { parameter: "Pin Number of the Principal Employer", input: "Ward-16" },
        { parameter: "Full name of the Manager or Person Responsible for the Supervision  and control of the Establishment", input: "Ward-16" },
        { parameter: "State of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Address of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "District of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Subdivision of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Area type of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Municipality of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Ward of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Police Station of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Pin Number of the Manager or Person Responsible", input: "Ward-16" },
        { parameter: "Nature of Work Carried on in the Establishment", input: "Ward-16" },
        { parameter: "Maximum Number of Workmen Employed Directly on any day in the Establishment", input: "Ward-16" },
        { parameter: "Number of Workmen Engaged as Permanent/Regular Workmen", input: "Ward-16" },
        { parameter: "Number of Workmen Engaged as Temporary/Casual Workmen", input: "Ward-16" },
        { parameter: "Whether the Workmen employed/intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer", input: "Ward-16" },
        { parameter: "A complete job description of the contrator labour", input: "Ward-16" },
        { parameter: "Wage rates and other cash benefits paid/to be paid", input: "Ward-16" },
        { parameter: "Category/designation/nomenclature of the job", input: "Ward-16" },
        { parameter: "Settlement or award or judgement or minimum wages (if any applicable in the establishment)", input: "Ward-16" },
        { parameter: "Maximum number of contract labour to be employed on any day through each contractor", input: "Ward-16" },
        { parameter: "Documents Uploaded" },
        { parameter: "Upload Trade License", input: "Ward-16" },
        { parameter: "Upload Article of Association", input: "Ward-16" },
        { parameter: "Upload Memorandum of Certificate", input: "Ward-16" },
        { parameter: "Upload Partnership Deed", input: "Ward-16" },
        { parameter: "Upload Factory License", input: "Ward-16" },
        { parameter: "Form -I", input: "Ward-16" },
        {
            parameter: (
                <>
                    Fees Details
                    <br />
                    [
                    <span className="text-red-600">
                        ** Fees calculation depends on "Maximum number of contract labour to be
                        employed on any day through each contractor".
                    </span>
                    ]
                </>
            ),
            input: "Ward-16",
        },
        { parameter: "Upload Factory License", input: "Ward-16" },
        { parameter: "Form -I", input: "Ward-16" },
    ];

    const contractorData = [
        { parameter: "Contractor Type", input: "TEST SUCHINTA" },
        { parameter: "Name of the Contractor", input: "Micro" },
        { parameter: "Email of the Contractor", input: "TEST SUCHINTA JHARGRAM" },
        { parameter: "Address of the Contractor", input: "Jhargram" },
        { parameter: "Nature of Work in which Contract Labour is Employed or is to be Employed", input: "Jhargram" },
        { parameter: "Maximum Number of Contractor Labour to be Employed on any day Through Each Contractor", input: "Municipality" },

        { parameter: "Estimated Date of Employment of Each Contract Work Under Each Contractor", input: "Jhargram Municipality" },
    ]

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto">
                {/* Title */}
                            <ClraRegDashboardTabs />

                <div className="bg-[#f5f5f5] border border-gray-300 px-6 py-3 text-center">
                    <h2 className="text-lg font-bold text-[#337ab7]">
                        CLRA Amendment Registration Information
                    </h2>
                </div>

                {/* Table */}
                <table className="w-full border-collapse ">
                    {/* Header Row */}
                    <thead>
                        <tr>
                            <th className="bg-[#337ab7] text-white py-3 px-6 text-center font-semibold border border-[#337ab7]">
                                Parameters
                            </th>
                            <th className="bg-[#337ab7] text-white py-3 px-6 text-center font-semibold border border-[#337ab7]">
                                Inputs
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (

                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-white" : "bg-[#e8f4fd]"}
                            >
                                {
                                    row.parameter === "Documents Uploaded" ? (
                                        <td
                                            colSpan={2}
                                            className="text-[17px] font-bold py-3 text-center text-[#3366FF] px-6 border border-[#006595] text-center"
                                        >
                                            {row.parameter}
                                        </td>
                                    ) : (

                                        <>
                                            <td className="py-3 px-6 border border-[#006595] font-medium text-gray-800">
                                                {row.parameter}
                                            </td>
                                            <td className="py-3 px-6 border border-[#006595] text-gray-800">
                                                {row.input}
                                            </td>
                                        </>)}

                            </tr>
                        ))}

                    </tbody>
                </table>

                <p className="text-center py-[12px] font-bold">Contractors Details</p>

                <div className="bg-[#f5f5f5] border border-[#337ab7] px-6 py-3 text-center">
                    <h2 className="text-lg font-bold text-[#337ab7]">
                        CLRA Particulars of Contractors and Contract Labour(1)
                    </h2>
                </div>

                <table className="w-full border-collapse ">
                    {/* Header Row */}
                    <thead>
                        <tr>
                            <th className="bg-[#337ab7] text-white py-3 px-6 text-center font-semibold border border-[#337ab7]">
                                Parameters
                            </th>
                            <th className="bg-[#337ab7] text-white py-3 px-6 text-center font-semibold border border-[#337ab7]">
                                Inputs
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {contractorData.map((row, index) => (

                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-white" : "bg-[#e8f4fd]"}
                            >

                                <td className="py-3 px-6 border border-[#006595] font-medium text-gray-800">
                                    {row.parameter}
                                </td>
                                <td className="py-3 px-6 border border-[#006595] text-gray-800">
                                    {row.input}
                                </td>


                            </tr>
                        ))}

                    </tbody>
                </table>

                <p className="text-center py-[12px] font-bold">Trade Union Details</p>
                <table className="w-full border-collapse ">
                    {/* Header Row */}

                    <tbody>
                        <tr className="bg-[#e8f4fd]">
                            <td className="text-center py-3 px-6 border border-[#006595] font-medium text-gray-800">No Trade Union Added</td>
                            {/* <td>No Trade Union Added</td> */}

                        </tr>
                    </tbody>
                </table>

                <div className="flex items-center gap-2">
                    <Input type="checkbox" className="h-[15px] w-[15px]" />
                    <div className="text-[14px] text-[#286090] font-bold tracking-[1px] my-[12px]">
                        <span className="text-red-500">*</span>I hereby declare that the
                        particulars given above are true the best of my knowledge and
                        belief.
                    </div>
                </div>

                <button
                type="submit"
                className="px-[12px] py-[8px] bg-[#3c8dbc] hover:bg-blue-700 text-white font-medium rounded-[3px] shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                SUBMIT
              </button>
            </div>
        </div>
    );
};

export default ClraRegVerify;

