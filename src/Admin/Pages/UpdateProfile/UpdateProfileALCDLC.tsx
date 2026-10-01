import React, {
    useEffect,
    useState,
} from "react";
import axios from "axios";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import {
    API_BASE,
} from "@/constants/constants";
import {
    getAuthToken,
} from "@/utils/auth";
import { toast } from "react-toastify";

const UpdateProfileALCDLC = () => {
    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const userId =
        searchParams.get("userId");

    const from =
        searchParams.get("from");

    const [loading, setLoading] =
        useState(false);

    const [formData, setFormData] =
        useState({
            fullname: "",
            employeeId: "",
            mobile: "",
            email: "",
            username: "",
            password: "",
        });

    /*
    =========================================
    FETCH USER DETAILS
    =========================================
    */

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const fetchUserDetails =
        async () => {
            try {
                setLoading(true);

                const token =
                    getAuthToken();

                const response =
                    await axios.get(
                        `${API_BASE}users/officer-profile/${userId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const user =
                    response?.data?.data;

                setFormData({
                    fullname:
                        user?.fullname || "",
                    employeeId:
                        user?.employee_id || "",
                    mobile:
                        user?.mobile || "",
                    email:
                        user?.email || "",
                    username:
                        user?.username || "",
                    password: "",
                });
            } catch {
                toast.error(
                    "Failed to fetch user details"
                );
            } finally {
                setLoading(false);
            }
        };

    /*
    =========================================
    HANDLE INPUT CHANGE
    =========================================
    */

    const handleChange = (
        field: keyof typeof formData,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /*
    =========================================
    HANDLE UPDATE
    =========================================
    */

    const handleUpdate =
        async () => {
            if (
                !formData.fullname.trim()
            ) {
                toast.error(
                    "Full Name is required",
                );
                return;
            }

            if (
                !formData.employeeId.trim()
            ) {
                toast.error(
                    "Employee Id (HRMS) is required",
                );
                return;
            }

            if (
                !formData.mobile.trim()
            ) {
                toast.error(
                    "Mobile Number is required",
                );
                return;
            }

            if (
                !/^\d{10}$/.test(
                    formData.mobile,
                )
            ) {
                toast.error(
                    "Mobile Number must be exactly 10 digits",
                );
                return;
            }

            if (
                !formData.email.trim()
            ) {
                toast.error(
                    "Email Address is required",
                );
                return;
            }

            if (
                formData.password !== ""
            ) {
                if (
                    /\s/.test(
                        formData.password,
                    )
                ) {
                    toast.error(
                        "Password must not contain spaces",
                    );
                    return;
                }

                if (
                    formData.password
                        .length < 4
                ) {
                    toast.error(
                        "Password must be at least 4 characters",
                    );
                    return;
                }
            }

            try {
                setLoading(true);

                const token =
                    getAuthToken();

                const response =
                    await axios.patch(
                        `${API_BASE}users/update-alc-dlc-profile/${userId}`,
                        {
                            fullname:
                                formData.fullname,
                            employeeId:
                                formData.employeeId,
                            mobile:
                                formData.mobile,
                            email:
                                formData.email,
                            password:
                                formData.password,
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                toast.success(
                    response?.data?.message ||
                    "Updated successfully"
                );

                setTimeout(() => {
                    navigate(
                        from === "alc"
                            ? "/user-list/alc"
                            : "/user-list/dlc"
                    );
                }, 1000);
            } catch (error: any) {
                toast.error(
                    error?.response?.data
                        ?.message ||
                    "Failed to update profile"
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="min-h-screen bg-[#f4f6f9] p-6">
            <div className="max-w-4xl mx-auto bg-white border shadow-sm rounded-md">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-semibold text-[#2c3e50]">
                        Modify User Information
                        {formData.fullname
                            ? `: ${formData.fullname}`
                            : ""}
                    </h1>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FULL NAME */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Full Name{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    formData.fullname
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "fullname",
                                        e.target.value,
                                    )
                                }
                                className="w-full border rounded-md px-3 h-10"
                            />
                        </div>

                        {/* EMPLOYEE ID (HRMS) */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Employee Id
                                (HRMS){" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    formData.employeeId
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "employeeId",
                                        e.target.value,
                                    )
                                }
                                className="w-full border rounded-md px-3 h-10"
                            />
                        </div>

                        {/* MOBILE NUMBER */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Mobile Number{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                value={
                                    formData.mobile
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "mobile",
                                        e.target.value
                                            .replace(
                                                /\D/g,
                                                "",
                                            )
                                            .slice(
                                                0,
                                                10,
                                            ),
                                    )
                                }
                                className="w-full border rounded-md px-3 h-10"
                            />
                        </div>

                        {/* EMAIL ADDRESS */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Email Address{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "email",
                                        e.target.value,
                                    )
                                }
                                className="w-full border rounded-md px-3 h-10"
                            />
                        </div>

                        {/* USERNAME (READ ONLY) */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Username{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    formData.username
                                }
                                readOnly
                                disabled
                                className="w-full border rounded-md px-3 h-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block mb-2 font-medium">
                                Password
                            </label>

                            <input
                                type="password"
                                value={
                                    formData.password
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "password",
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter password"
                                autoComplete="new-password"
                                className="w-full border rounded-md px-3 h-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            onClick={
                                handleUpdate
                            }
                            disabled={loading}
                            className="bg-[#3c8dbc] text-white px-5 h-10 rounded-md disabled:opacity-60"
                        >
                            {loading
                                ? "Updating..."
                                : "Update"}
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    from === "alc"
                                        ? "/user-list/alc"
                                        : "/user-list/dlc"
                                )
                            }
                            className="border px-5 h-10 rounded-md"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default UpdateProfileALCDLC;
