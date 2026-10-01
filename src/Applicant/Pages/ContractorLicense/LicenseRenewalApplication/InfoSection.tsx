import React from "react";

type Row = {
    label: string;
    value: string | React.ReactNode;
};

type Props = {
    title: string;
    rows: Row[];
};

const InfoSection: React.FC<Props> = ({ title, rows }) => {
    return (
        <div className="border border-gray-300 rounded bg-white shadow-sm mb-6">
            {/* Header */}
            <div className="bg-[#2C5D7C] text-white px-4 py-2 text-sm font-semibold uppercase">
                {title}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left px-3 py-2 border w-[45%]">
                                Parameters
                            </th>
                            <th className="text-left px-3 py-2 border">
                                Inputs
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-gray-50">
                                <td className="px-3 py-2 border align-top">
                                    {row.label}
                                </td>
                                <td className="px-3 py-2 border whitespace-pre-line">
                                    {row.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InfoSection;