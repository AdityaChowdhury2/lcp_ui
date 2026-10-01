"use client";

import React from "react";
import { Input } from "../../../Components/ui/input";
import ClraRegDashboardTabs from "./ClraRegDashboardTabs";
import ClraRegDashboardTabsContractorAdded from "./ClraRegDashboardTabsContractorAdded";

type RowType = {
    parameter: React.ReactNode;
    input?: string;
};

const ClraRegVerifyContractorAdded: React.FC = () => {
    const leftData: RowType[] = [
        { parameter: "Name of the Establishment", input: "TEST SUCHINTA" },
        { parameter: "Establishment type", input: "Micro" },
        {
            parameter: "Location of the Establishment",
            input:
                "TEST SUCHINTA JHARGRAM, Ward-16, Jhargram Municipality, PS-Gopiballavpur, PIN-721501",
        },
        {
            parameter: "Postal Address of the Establishment",
            input:
                "Fartabad, Beltala, Garia, Ward-18, Jhargram Municipality, PS-Jhargram, PIN-700086",
        },
        {
            parameter: "Nature of Work Carried on in the Establishment",
            input: "Others, repairing",
        },
        {
            parameter: "Maximum Number of Workmen Employed Directly on any day in the Establishment",
            input: "23",
        },
        {
            parameter: "Number of Workmen Engaged as Permanent / Regular Workmen",
            input: "23",
        },
        {
            parameter: "Number of Workmen Engaged as Temporary / Regular Workmen",
            input: "23",
        },
        {
            parameter: "A complete job description of the contract labour",
            input: "23",
        },
    ];

    const rightData: RowType[] = [
        { parameter: "Full Name of the Principal Employer", input: "Lopamudra Jana" },
        { parameter: "Gender", input: "Female" },
        { parameter: "Mobile No.", input: "" },
        {
            parameter: "Address of the Principal Employer",
            input:
                "Fartabad, Beltala, Garia, Ward-18, Jhargram Municipality, PS-Jhargram, PIN-700086, West Bengal",
        },
        {
            parameter:
                "Full name of the Manager or Person Responsible for the Supervision and control of the Establishment",
            input: "Lopamudra Jana",
        },
        {
            parameter: "Address of the Manager or Person Responsible for the Supervision  and control of the Establishment",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Whether the Workmen employed / intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Wage rates and other cash benefits paid/to be paid",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Settlement or award or judgement or minimum wages (if any applicable in the establishment)",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Maximum number of contract labour to be employed on any day through each contractor",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Category / designation / nomenclature of the job",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
    ];

    const secondTableData: RowType[] = [
        { parameter: "Trade License", input: "Lopamudra Jana" },
        { parameter: "Article of Association and Memorandum of Association / Partnership Deed", input: "Female" },
        { parameter: "Any other document in support of correctness of the particulars mentioned in the application if required", input: "" },
        {
            parameter: "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc",
            input:
                "Fartabad, Beltala, Garia, Ward-18, Jhargram Municipality, PS-Jhargram, PIN-700086, West Bengal",
        },
        {
            parameter:
                "Factory License if any",
            input: "Lopamudra Jana",
        },
        {
            parameter:
                "Form -I ",
            input: "Lopamudra Jana",
        },
    ];

    const thirdTableData: RowType[] = [{

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
    ]

    const contractor1TableData: RowType[] = [
        { parameter: "Contractor Type", input: "Lopamudra Jana" },
        { parameter: "Name of the Contractor", input: "Female" },
        { parameter: "Email of the Contractor", input: "" },
        {
            parameter: "Address of the Contractor",
            input:
                "Fartabad, Beltala, Garia, Ward-18, Jhargram Municipality, PS-Jhargram, PIN-700086, West Bengal",
        },
        {
            parameter:
                "Nature of Work in which Contract Labour is Employed or is to be Employed",
            input: "Lopamudra Jana",
        },
        {
            parameter: "Maximum Number of Contractor Labour to be Employed on any day Through Each Contractor",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },
        {
            parameter: "Estimated Date of Employment of Each Contract Work Under Each Contractor",
            input:
                "Fartabad, Beltala, Garia, Ward-15, Jhargram Municipality, PS-Jhargram, PIN-700084, West Bengal",
        },

    ];

    const renderFirstTable = (data: RowType[]) => (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-[#7b8a92]">
                    <th className="text-white py-2 px-4 border text-left">
                        Parameters
                    </th>
                    <th className="text-white py-2 px-4 border text-left">
                        Inputs
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-[#f2f6f8]" : "bg-white"}
                    >
                        <td className="py-2 px-4 border font-medium">
                            {row.parameter}
                        </td>
                        <td className="py-2 px-4 border font-semibold">
                            {row.input}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderSecondTable = (data: RowType[]) => (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-[#7b8a92]">
                    <th colSpan={2} className="text-white text-center py-2 px-4 border">
                        Documents Uploaded
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-[#f2f6f8]" : "bg-white"}
                    >
                        <td className="py-2 px-4 border font-medium">
                            {row.parameter}
                        </td>
                        <td className="py-2 px-4 border font-semibold">
                            {row.input}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderThirdTable = (data: RowType[]) => (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-[#7b8a92]">
                    <th colSpan={2} className="text-white text-center py-2 px-4 border">
                        Fees Details
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-[#f2f6f8]" : "bg-white"}
                    >
                        <td className="w-1/2 py-2 px-4 border font-medium">
                            {row.parameter}
                        </td>
                        <td className="py-2 px-4 border font-semibold">
                            {row.input}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderContractor1Table = (data: RowType[]) => (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-[#7b8a92]">
                    <th colSpan={2} className="text-white text-center py-2 px-4 border">
                        Contractor-1
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-[#f2f6f8]" : "bg-white"}
                    >
                        <td className="py-2 px-4 border font-medium">
                            {row.parameter}
                        </td>
                        <td className="py-2 px-4 border font-semibold">
                            {row.input}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <>
         <div className="bg-gray-100 p-4 border-b">
                <h1 className="text-xl font-semibold text-gray-900">
                    APPLICATION PREVIEW
                </h1>
            </div>
        <div className="min-h-screen bg-slate-200 p-6">
           
            <div className="mx-auto max-w-7xl bg-white border border-gray-300">
                <ClraRegDashboardTabsContractorAdded />

                {/* HEADER */}
                <div className="bg-[#2c5f87] text-white px-6 py-2 font-bold">
                    ESTABLISHMENT DETAILS
                </div>

                {/* AUTH OFFICE */}
                <div className="flex items-center justify-between px-6 py-3 text-sm">
                    <div>
                        <strong>Authorized Registering office for this application :</strong>{" "}
                        Regional Labour Office - Jhargram, Jhargram
                    </div>
                    <button className="bg-[#1da1f2] text-white px-3 py-1 rounded text-xs">
                        MORE INFO.
                    </button>
                </div>

                {/* TWO COLUMN TABLES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
                    {renderFirstTable(leftData)}
                    {renderFirstTable(rightData)}
                </div>

                <div className="grid grid-cols-1 gap-6 px-6 pb-6">
                    {renderSecondTable(secondTableData)}
                </div>

                <div className="grid grid-cols-1 gap-6 px-6 pb-6">
                    {renderThirdTable(thirdTableData)}
                </div>

                {/* DECLARATION */}

            </div>

            <div className="mx-auto max-w-7xl mt-[4em] bg-white border border-gray-300">

                {/* HEADER */}
                <div className="bg-[#2c5f87] mb-4 text-white px-6 py-2 font-bold">

                    CONTRACTORS AND CONTRACT LABOUR DETAILS
                </div>

                {/* AUTH OFFICE */}

                <div className="grid grid-cols-1 gap-6 px-6 pb-6">
                    {renderContractor1Table(contractor1TableData)}
                </div>



                {/* DECLARATION */}

            </div>

            <div className="mx-auto max-w-7xl mt-[4em] pb-[2em] bg-white border border-gray-300">

                {/* HEADER */}
                <div className="bg-[#2c5f87] mb-4 text-white px-6 py-2 font-bold">

                    TRADE UNION DETAILS
                </div>

                {/* AUTH OFFICE */}

                
               <table className="w-full border-collapse  px-6 ">
                    {/* Header Row */}

                    <tbody>
                        <tr className="bg-[#f2f6f8] ">
                            <td className="text-center py-3 border  font-medium text-gray-800">No Trade Union Added</td>
                            {/* <td>No Trade Union Added</td> */}

                        </tr>
                    </tbody>
                </table>


                {/* DECLARATION */}

            </div>


            <div className="flex items-center gap-2 px-6 py-4">
                <Input type="checkbox" className="h-4 w-4" />
                <div className="text-sm text-[#286090] font-bold">
                    <span className="text-red-500">*</span> I hereby declare that the
                    particulars given above are true to the best of my knowledge and
                    belief.
                </div>
            </div>

            {/* SUBMIT */}
            <div className="px-6 pb-6 text-right">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#3c8dbc] hover:bg-blue-700 text-white font-medium rounded shadow"
                >
                    SUBMIT
                </button>
            </div>
        </div>
        </>
    );
};

export default ClraRegVerifyContractorAdded;
