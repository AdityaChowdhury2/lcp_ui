import React, { useEffect, useState } from "react";
import { Button } from "../../../Components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

type OwnershipItem = {
    slNo: number;
    id: number;
    name: string;
    designation: string;
    email: string;
    contactNumber: string;
};

const SelfCertificationOwnershipList = () => {
    const navigate = useNavigate();


    const { encUserId, encActId, type } = useParams();

    const [ownerships, setOwnerships] = useState<OwnershipItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [heading, setHeading] = useState("Partners / Directors List");

    useEffect(() => {
        const fetchOwnershipList = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `${API_BASE}self-cert/ownership-list?actId=${encActId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                );

                const data = await res.json();

                console.log("Ownership API Response:", data);

                if (data?.status === "success") {
                    setOwnerships(data.data || []);
                    setHeading(data.heading || "Partners / Directors List");
                }
            } catch (error) {
                console.error("Ownership list fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (encActId) {
            fetchOwnershipList();
        }
    }, [encActId]);

    return (
        <div className="w-full min-h-screen bg-[#ecf0f3] py-4">
            <div className="bg-white rounded shadow border mx-4">
                <div className="bg-[#215e87] text-white px-4 py-3 font-semibold rounded-t">
                    {heading}
                </div>

                <div className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left">Sl No</th>
                                    <th className="border p-3 text-left">Name</th>
                                    <th className="border p-3 text-left">Designation</th>
                                    <th className="border p-3 text-left">Contact</th>
                                    {/* <th className="border p-3 text-center">Action</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : ownerships.length > 0 ? (
                                    ownerships.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border p-3">{item.slNo}</td>
                                            <td className="border p-3">{item.name}</td>
                                            <td className="border p-3">{item.designation}</td>
                                            <td className="border p-3">{item.contactNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">
                                            No ownership records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between mt-4 gap-4">
                        <Button
                            onClick={() =>
                                navigate(`/add-directorpartner/${encUserId}/${encActId}/${type}`)
                            }
                            className="bg-[#1e73be] hover:bg-[#175a93]"
                        >
                            Add New
                        </Button>

                        <button
                            onClick={() =>
                                navigate("/self-certification-application/particulars")
                            }
                            className="text-blue-600 font-medium"
                        >
                            {"<<"} BACK TO SELF CERTIFICATION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfCertificationOwnershipList;