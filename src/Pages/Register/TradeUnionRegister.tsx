import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff, ShieldCheck, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

type FormValues = {
    registrationFor: "F" | "T";
    email: string;
    mobile: string;
    username: string;
    password: string;
    confirmPassword: string;
    // captcha: string;
};

const schema = yup.object({
    registrationFor: yup
        .mixed<"F" | "T">()
        .oneOf(["F", "T"])
        .required("Please select registration type"),

    email: yup
        .string()
        .email("Enter a valid email address")
        .required("Email address is required"),

    mobile: yup
        .string()
        .matches(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number")
        .required("Mobile number is required"),

    username: yup
        .string()
        .min(4, "Username must be minimum 4 characters")
        .max(30, "Username cannot exceed 30 characters")
        .required("Username is required"),

    password: yup
        .string()
        .matches(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/,
            "Password must contain uppercase, number & special character"
        )
        .required("Password is required"),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Confirm password is required"),
});

const TradeUnionRegister = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<{
        available: boolean;
        message: string;
    } | null>(null);

    const [emailChecking, setEmailChecking] = useState(false);
    const [emailStatus, setEmailStatus] = useState<{
        available: boolean;
        message: string;
    } | null>(null);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            registrationFor: "T",
        },
    });

    const usernameValue = watch("username");
    const emailValue = watch("email");

    useEffect(() => {
        const trimmed = usernameValue?.trim() ?? "";
        if (!trimmed || trimmed.length < 4) {
            setUsernameStatus(null);
            setUsernameChecking(false);
            return;
        }

        setUsernameChecking(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}custom_user/check-username?username=${encodeURIComponent(trimmed)}`
                );
                if (response.data) {
                    setUsernameStatus({
                        available: response.data.available,
                        message: response.data.message,
                    });
                }
            } catch (error) {
                console.error("Failed to check username availability", error);
                setUsernameStatus(null);
            } finally {
                setUsernameChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [usernameValue]);

    useEffect(() => {
        const trimmed = emailValue?.trim() ?? "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmed || !emailRegex.test(trimmed)) {
            setEmailStatus(null);
            setEmailChecking(false);
            return;
        }

        setEmailChecking(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}custom_user/check-email?email=${encodeURIComponent(trimmed)}`
                );
                if (response.data) {
                    setEmailStatus({
                        available: response.data.available,
                        message: response.data.message,
                    });
                }
            } catch (error) {
                console.error("Failed to check email availability", error);
                setEmailStatus(null);
            } finally {
                setEmailChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [emailValue]);

    const onSubmit = async (data: FormValues) => {
        if (usernameStatus && !usernameStatus.available) {
            toast.error(usernameStatus.message || "This username already exists.");
            return;
        }

        if (emailStatus && !emailStatus.available) {
            toast.error(emailStatus.message || "This email address already exists.");
            return;
        }

        try {
            const payload = {
                registrationFor: data.registrationFor,
                email: data.email,
                mobile: data.mobile,
                username: data.username,
                password: data.password,
                confirmPassword: data.confirmPassword,
            };

            const response = await axios.post(
                `${API_BASE}trade-union/trade-union-federation-registration`,
                payload
            );

            if (response.data?.status === "SUCCESS") {
                toast.success(response.data.message || "Registration successful");
                reset({
                    registrationFor: "T",
                    email: "",
                    mobile: "",
                    username: "",
                    password: "",
                    confirmPassword: "",
                });
                setUsernameStatus(null);
                setUsernameChecking(false);
                setEmailStatus(null);
                setEmailChecking(false);
                setLoading(true);

                setTimeout(() => {
                    navigate("/applicant-login");
                }, 1500);
            } else {
                toast.error(response.data.message || "Something went wrong");
            }
        } catch (error: any) {
            console.error(error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Registration failed";

            if (Array.isArray(message)) {
                toast.error(message[0]);
            } else {
                toast.error(message);
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4 shadow-lg">
                        <ShieldCheck className="w-10 h-10 text-amber-700" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-[#5b2b00]">
                        Trade Union Registration
                    </h1>

                    <p className="text-gray-600 mt-3 text-sm md:text-base">
                        Register yourself as Federation or Trade Union under Trade Union
                        Act, 1926
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-linear-to-r bg-[#5b2b00] px-6 py-5">
                        <h2 className="text-white text-xl font-semibold">
                            Registration Information
                        </h2>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="p-6 md:p-10"
                    >
                        {/* Registration Type */}
                        <div className="mb-8">
                            <label className="block text-[15px] font-semibold text-[#5b2b00] mb-4">
                                Registration For <span className="text-red-500">*</span>
                            </label>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-[#5b2b00] transition-all">
                                    <input
                                        type="radio"
                                        value="T"
                                        {...register("registrationFor")}
                                        className="accent-[#5b2b00]"
                                    />
                                    <span className="font-medium text-gray-700">
                                        Trade Union
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-[#5b2b00] transition-all">
                                    <input
                                        type="radio"
                                        value="F"
                                        {...register("registrationFor")}
                                        className="accent-[#5b2b00]"
                                    />
                                    <span className="font-medium text-gray-700">
                                        Federation
                                    </span>
                                </label>
                            </div>

                            {errors.registrationFor && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.registrationFor.message}
                                </p>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Email */}
                            <div>
                                <label className="block text-[15px] font-semibold text-[#5b2b00] mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter valid email address"
                                    {...register("email")}
                                    className={`w-full h-12 rounded-xl border px-4 outline-none focus:ring-2 focus:ring-[#5b2b00] focus:border-transparent ${
                                        emailStatus
                                            ? emailStatus.available
                                                ? "border-green-500"
                                                : "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />

                                {emailChecking && (
                                    <p className="text-amber-600 text-sm mt-1 font-medium">
                                        Checking email availability...
                                    </p>
                                )}

                                {!emailChecking && emailStatus && (
                                    <p
                                        className={`text-sm mt-1 font-medium flex items-center gap-1 ${
                                            emailStatus.available ? "text-green-600" : "text-red-500"
                                        }`}
                                    >
                                        {emailStatus.available ? "✓ " : "✕ "}
                                        {emailStatus.message}
                                    </p>
                                )}

                                {errors.email && !emailStatus && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[15px] font-semibold text-[#5b2b00] mb-2">
                                    Mobile Number <span className="text-red-500">*</span>
                                    <div className="relative group inline-flex items-center">
                                        <Info className="w-4 h-4 text-gray-400 hover:text-amber-800 cursor-pointer transition-colors" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 text-center pointer-events-none">
                                            Enter valid 10 digit mobile number
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                        </div>
                                    </div>
                                </label>

                                <input
                                    type="text"
                                    maxLength={10}
                                    placeholder="Enter 10 digit mobile number"
                                    {...register("mobile")}
                                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-amber-[#5b2b00] focus:border-transparent"
                                />

                                {errors.mobile && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.mobile.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="mb-8">
                            <div className="mb-6">
                                <label className="block text-[15px] font-semibold text-[#5b2b00] mb-2">
                                    Username <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    {...register("username")}
                                    className={`w-full h-12 rounded-xl border px-4 outline-none focus:ring-2 focus:ring-[#5b2b00] focus:border-transparent ${
                                        usernameStatus
                                            ? usernameStatus.available
                                                ? "border-green-500"
                                                : "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />

                                {usernameChecking && (
                                    <p className="text-amber-600 text-sm mt-1 font-medium">
                                        Checking username availability...
                                    </p>
                                )}

                                {!usernameChecking && usernameStatus && (
                                    <p
                                        className={`text-sm mt-1 font-medium flex items-center gap-1 ${
                                            usernameStatus.available ? "text-green-600" : "text-red-500"
                                        }`}
                                    >
                                        {usernameStatus.available ? "✓ " : "✕ "}
                                        {usernameStatus.message}
                                    </p>
                                )}

                                {errors.username && !usernameStatus && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[15px] font-semibold text-[#5b2b00] mb-2">
                                        Password <span className="text-red-500">*</span>
                                        <div className="relative group inline-flex items-center">
                                            <Info className="w-4 h-4 text-gray-400 hover:text-amber-800 cursor-pointer transition-colors" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-60 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 text-left pointer-events-none">
                                                <p className="font-semibold mb-1">Password Requirements:</p>
                                                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gray-200">
                                                    <li>Min 8 characters</li>
                                                    <li>1 uppercase letter</li>
                                                    <li>1 numeric digit</li>
                                                    <li>1 special character (!@#$%^&*)</li>
                                                </ul>
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            {...register("password")}
                                            className="w-full h-12 rounded-xl border border-gray-300 px-4 pr-12 outline-none focus:ring-2 focus:ring-amber-[#5b2b00] focus:border-transparent"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-[15px] font-semibold text-[#5b2b00] mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            {...register("confirmPassword")}
                                            className="w-full h-12 rounded-xl border border-gray-300 px-4 pr-12 outline-none focus:ring-2 focus:ring-amber-[#5b2b00] focus:border-transparent"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                  min-w-[220px]
                  h-[52px]
                  rounded-xl
                  bg-linear-to-r
                  from-yellow-700
                  to-yellow-500
                  text-white
                  font-semibold
                  text-[16px]
                  shadow-lg
                  hover:scale-[1.02]
                  transition-all
                  duration-300
                "
                            >
                                {loading ? "Submitting..." : "SUBMIT REGISTRATION"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TradeUnionRegister;