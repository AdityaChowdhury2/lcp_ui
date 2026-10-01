// EditData.tsx (UPDATED WITH FIXED DATEPICKER UI)
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

type FormValues = {
    registrationNumber: string;
    registrationDate: string;
    establishmentName: string;
    principalEmployerName: string;
    establishmentAddress: string;
    principalEmployerAddress: string;
    maxContractLabours: number;
    fees: number;
    feesCalculatedByOldChart: "yes" | "no";
};

const schema = yup.object({
    registrationNumber: yup.string().required("Registration Number is Required"),
    registrationDate: yup.string().required("Registration Data is Required"),
    establishmentName: yup.string().required("Establishment Name is Required"),
    principalEmployerName: yup.string().required("Principal Employer Name is Required"),
    establishmentAddress: yup.string().required("Establishment Address is Required"),
    principalEmployerAddress: yup.string().required("Principal Employer Address is Required"),
    maxContractLabours: yup
        .number()
        .typeError("Maximum Number of Contract Labours must be a number")
        .required("Maximum Number of Contract Labours is Required")
        .min(0),
    fees: yup
        .number()
        .typeError("Fees must be a number")
        .required("Fees Must Be Required")
        .min(0),
    feesCalculatedByOldChart: yup
        .mixed<"yes" | "no">()
        .oneOf(["yes", "no"])
        .required("Fees Calculation is Required"),
});

const EditData: React.FC = () => {
    const defaultValues: FormValues = {
        registrationNumber: "BKP/CON/R-07/2015/DLC",
        registrationDate: "2015-02-03",
        establishmentName: "SPENCERS RETAIL LIMITED",
        principalEmployerName: "SPENCERS RETAIL LIMITED",
        establishmentAddress: "14 B T ROAD",
        principalEmployerAddress: "14 B. T. ROAD KOLKATA-700056",
        maxContractLabours: 35,
        fees: 1000,
        feesCalculatedByOldChart: "yes",
    };

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues,
    });

    const onSubmit = async (data: FormValues) => {
        console.log("Submitted data:", data);
    };

    const [dateOpen, setDateOpen] = useState(false);

    const isoToDate = (iso?: string | null) => {
        if (!iso) return null;
        const parts = iso.split("-");
        if (parts.length !== 3) return null;
        return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    };

    const dateToIso = (date: Date | null) => {
        if (!date) return "";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")}`;
    };

    const formatIsoToDisplay = (iso?: string) => {
        if (!iso) return "";
        const d = isoToDate(iso);
        if (!d) return "";
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
        )}-${d.getFullYear()}`;
    };

    return (
        <div className="p-4 pt-0 md:p-0 lg:p-0 mb-[50px]">
            <div className="max-w-full">
                <h1 className="text-xl md:text-2xl mb-4 font-[24px]">
                    Edit Principal Employer
                </h1>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="border border-[#1E73BE] rounded-md bg-white p-4 md:p-6"
                    style={{ borderRadius: "3px" }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                        {/* 1 Registration Number */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                1.Registration Number <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("registrationNumber")}
                                disabled
                                readOnly
                                className="mt-2 bg-gray-100 text-sm p-2 rounded border border-gray-300"
                            />
                            {errors.registrationNumber && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.registrationNumber.message}
                                </p>
                            )}
                        </div>

                        {/* 2 Registration Date — FIXED VERSION */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                2.Registration Date <span className="text-red-600">*</span>
                            </label>

                            <Controller
                                control={control}
                                name="registrationDate"
                                render={({ field }) => {
                                    const selectedDate = isoToDate(field.value);

                                    return (
                                        <div className="relative mt-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={formatIsoToDisplay(field.value)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDateOpen(true);
                                                }}
                                                className="w-full bg-gray-100 text-sm p-2 rounded border border-gray-300 cursor-pointer pr-10"
                                            />

                                            {/* Calendar icon */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDateOpen((o) => !o);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700"
                                            >
                                                <Calendar size={18} />
                                            </button>

                                            {/* FIXED POPUP POSITION */}
                                            {dateOpen && (
                                                <div className="absolute z-50 mt-1">
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={(date) => {
                                                            const iso = dateToIso(date as Date);
                                                            field.onChange(iso);
                                                            setDateOpen(false);
                                                        }}
                                                        inline
                                                        onClickOutside={() => setDateOpen(false)}
                                                        calendarClassName="z-50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />

                            {errors.registrationDate && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.registrationDate.message}
                                </p>
                            )}
                        </div>

                        {/* 3 Establishment Name */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                3.Name of the Establishment <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("establishmentName")}
                                className="mt-2 text-sm p-2 rounded border border-gray-300"
                            />
                            {errors.establishmentName && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.establishmentName.message}
                                </p>
                            )}
                        </div>

                        {/* 4 Principal Employer Name */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                4.Name of the Principal Employer <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("principalEmployerName")}
                                className="mt-2 text-sm p-2 rounded border border-gray-300"
                            />
                            {errors.principalEmployerName && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.principalEmployerName.message}
                                </p>
                            )}
                        </div>

                        {/* 5 Establishment Address */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                5.Address of the Establishment <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                {...register("establishmentAddress")}
                                rows={4}
                                className="mt-2 text-sm p-2 rounded border border-gray-300 resize-none"
                            />
                            {errors.establishmentAddress && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.establishmentAddress.message}
                                </p>
                            )}
                        </div>

                        {/* 6 Principal Employer Address */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                6.Address of the Principal Employer <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                {...register("principalEmployerAddress")}
                                rows={4}
                                className="mt-2 text-sm p-2 rounded border border-gray-300 resize-none"
                            />
                            {errors.principalEmployerAddress && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.principalEmployerAddress.message}
                                </p>
                            )}
                        </div>

                        {/* 7 Max Labours */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                7.Maximum Number of Contract Labours <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("maxContractLabours", { valueAsNumber: true })}
                                className="mt-2 text-sm p-2 rounded border border-gray-300"
                            />
                            {errors.maxContractLabours && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.maxContractLabours.message}
                                </p>
                            )}
                        </div>

                        {/* 8 Fees */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">
                                8.Fees <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("fees", { valueAsNumber: true })}
                                className="mt-2 text-sm p-2 rounded border border-gray-300"
                            />
                            {errors.fees && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.fees.message}
                                </p>
                            )}
                        </div>

                        {/* 9 Fees Calculated by Old Chart */}
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-semibold">
                                9.This(No.-8) fees amount calculated by old fees chart <span className="text-red-600">*</span>
                            </label>

                            <div className="flex items-center gap-6 mt-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        value="yes"
                                        {...register("feesCalculatedByOldChart")}
                                        className="h-4 w-4"
                                    />
                                    Yes
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        value="no"
                                        {...register("feesCalculatedByOldChart")}
                                        className="h-4 w-4"
                                    />
                                    No
                                </label>
                                {errors.feesCalculatedByOldChart && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {errors.feesCalculatedByOldChart.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="bg-[#1E73BE] text-white px-4 py-2 rounded-md hover:bg-[#155a8d] cursor-pointer"
                            disabled={isSubmitting}
                        >
                            UPDATE
                        </button>

                        <button
                            type="button"
                            onClick={() => reset(defaultValues)}
                            className="ml-3 px-4 py-2 rounded-md border border-gray-300 text-sm cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditData;
