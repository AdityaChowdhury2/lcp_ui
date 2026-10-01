// src/components/ViewDetailsModal.tsx
import React from "react";
import { DetailData } from "./types";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DetailData;
}

const ViewDetailsModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-3 pt-40 md:pt-15">
            <div className="bg-white w-full max-w-3xl rounded shadow-lg overflow-hidden border w:md-[592px]">

                {/* HEADER */}
                <div className="bg-[#1E73BE] text-white px-4 py-3 flex justify-between items-center">
                    <h2 className="font-semibold text-base tracking-wide">
                        {data.establishmentName}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-white text-xl font-bold hover:opacity-80 cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}
                <div className="p-0 border-t">
                    <table className="w-full border border-gray-300 border-collapse text-sm">
                        <tbody>
                            {[
                                ["Registration Number", data.registrationNumber],
                                ["Registration Date", data.registrationDate],
                                ["Name of the Establishment", data.establishmentName],
                                ["Address of the Establishment", data.establishmentAddress],
                                ["Name of the Principal Employer", data.principalEmployerName],
                                ["Address of the Principal Employer", data.principalEmployerAddress],
                                ["Maximum Number of Contract Labours", data.maxContractLabours],
                                ["Fees", `₹${data.fees}`],
                            ].map(([label, value], index) => (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="p-3 bg-gray-100 font-semibold w-1/2">
                                        {label}
                                    </td>
                                    <td className="p-3">{value}</td>
                                </tr>
                            ))}

                            {/* STATUS ROW */}
                            <tr>
                                <td className="p-3 bg-gray-100 font-semibold">Status</td>
                                <td className="p-3 flex items-center gap-3">
                                    {data.status === "invalid" ? (
                                        <span className="bg-red-600 text-white px-3 py-1 rounded text-xs">
                                            ✖ Invalid
                                        </span>
                                    ) : (
                                        <span className="bg-green-600 text-white px-3 py-1 rounded text-xs">
                                            ✔ Valid
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-600">
                                        (Already generated a new number)
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end p-3 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ViewDetailsModal;