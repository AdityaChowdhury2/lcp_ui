import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye } from "lucide-react";

type FormValues = {
    typeOfInspection: string | null;
    randomizationOrderNumber?: string | null;
    dateOfInspection: string | null;
    fromTime: string | null;
    toTime: string | null;
    natureOfIndustry: string | null;
    natureOfIndustryOther?: string | null;

    establishmentName: string | null;
    typeOfEstablishment: string | null;
    addressLine1: string | null;
    district: string | null;
    subdivision: string | null;
    block: string | null;
    gpWard: string | null;
    policeStation: string | null;
    pinCode: string | null;

    personName?: string | null;
    personDesignation?: string | null;
    personMobile?: string | null;

    // numeric fields are typed as number | string to match form inputs ("" or numeric)
    directMale?: number | string;
    directFemale?: number | string;
    contractMale?: number | string;
    contractFemale?: number | string;
    otherMale?: number | string;
    otherFemale?: number | string;
    workerSpec?: string;
};

/**
 * Helper "number field" schema:
 * - Accepts empty string (user left blank) or numeric strings.
 * - Transforms numeric string into Number.
 * - Keeps empty string as "" (so defaultValues "" is valid).
 */
const numberField = () =>
    yup
        .mixed<number | string>()
        .transform((value, originalValue) => {
            // If originalValue is empty string -> keep as empty string
            if (originalValue === "") return "";
            // If value is null/undefined/NaN -> return undefined
            const asNumber = Number(originalValue);
            return Number.isNaN(asNumber) ? undefined : asNumber;
        })
        .notRequired();

/**
 * Full Yup schema typed as ObjectSchema<FormValues>
 * All form keys are present (required/optional set to match original UX)
 */
const schema: yup.ObjectSchema<any> = yup
    .object({
        typeOfInspection: yup.string().required("Type of inspection is required"),
        randomizationOrderNumber: yup.string().notRequired(),
        dateOfInspection: yup.string().required("Date of inspection is required"),
        fromTime: yup.string().required("From time is required"),
        toTime: yup.string().required("To time is required"),
        natureOfIndustry: yup.string().required("Nature of industry is required"),
        natureOfIndustryOther: yup.string().notRequired(),

        establishmentName: yup.string().required("Establishment name is required"),
        typeOfEstablishment: yup.string().required("Type of establishment is required"),
        addressLine1: yup.string().required("Address is required"),
        district: yup.string().notRequired(),
        subdivision: yup.string().notRequired(),
        block: yup.string().notRequired(),
        gpWard: yup.string().notRequired(),
        policeStation: yup.string().notRequired(),
        pinCode: yup.string().required("Pin code is required"),

        personName: yup.string().notRequired(),
        personDesignation: yup.string().notRequired(),
        personMobile: yup.string().notRequired(),

        directMale: numberField(),
        directFemale: numberField(),
        contractMale: numberField(),
        contractFemale: numberField(),
        otherMale: numberField(),
        otherFemale: numberField(),
        workerSpec: yup.string().notRequired(),
    })
    .required();

const NewInspection: React.FC = () => {
    const [tab, setTab] = useState<string>("ESTABLISHMENT DETAILS");
    const tabs = [
        "ESTABLISHMENT DETAILS",
        "OWNER/EMPLOYER DETAILS",
        "INFRINGEMENTS",
        "VERIFY & SUBMIT",
    ];

    const defaultValues: FormValues = {
        typeOfInspection: "",
        randomizationOrderNumber: "",
        dateOfInspection: new Date().toISOString().slice(0, 10),
        fromTime: "",
        toTime: "",
        natureOfIndustry: "",
        natureOfIndustryOther: "",

        establishmentName: "",
        typeOfEstablishment: "",
        addressLine1: "",
        district: "JHARGRAM",
        subdivision: "",
        block: "",
        gpWard: "",
        policeStation: "",
        pinCode: "",

        personName: "",
        personDesignation: "",
        personMobile: "",

        directMale: "",
        directFemale: "",
        contractMale: "",
        contractFemale: "",
        otherMale: "",
        otherFemale: "",
        workerSpec: "",
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues,
        resolver: yupResolver(schema as yup.ObjectSchema<FormValues>),
        mode: "onBlur",
    });

    // Watch numeric fields (they may be string or number) and convert to numbers for totals
    const directMale = Number(watch("directMale") || 0);
    const directFemale = Number(watch("directFemale") || 0);
    const contractMale = Number(watch("contractMale") || 0);
    const contractFemale = Number(watch("contractFemale") || 0);
    const otherMale = Number(watch("otherMale") || 0);
    const otherFemale = Number(watch("otherFemale") || 0);

    const directTotal = directMale + directFemale;
    const contractTotal = contractMale + contractFemale;
    const otherTotal = otherMale + otherFemale;

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Form submit ->", data);
        // If you want to ensure numeric fields come through as numbers:
        const normalized = {
            ...data,
            directMale: data.directMale === "" ? 0 : Number(data.directMale),
            directFemale: data.directFemale === "" ? 0 : Number(data.directFemale),
            contractMale: data.contractMale === "" ? 0 : Number(data.contractMale),
            contractFemale: data.contractFemale === "" ? 0 : Number(data.contractFemale),
            otherMale: data.otherMale === "" ? 0 : Number(data.otherMale),
            otherFemale: data.otherFemale === "" ? 0 : Number(data.otherFemale),
        };
        console.log("Normalized payload ->", normalized);
        alert("Form validated and ready. Check console for data.");
    };

    const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
        children,
        required,
    }) => (
        <label className="block text-sm font-semibold text-gray-700">
            {children} {required && <span className="text-red-600">*</span>}
        </label>
    );

    return (
        <div>
            <h1 className="text-2xl mb-4 text-gray-800">Generate New Inspection Note</h1>

            <div className="bg-white p-3 shadow-sm">
                {/* Tabs */}
                <div className="flex gap-0 border-b border-gray-300 bg-white">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-all ${tab === t
                                ? "border-[#1E73BE] text-gray-800 bg-white"
                                : "border-transparent text-[#F2A33C] hover:text-blue-500"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="pt-4 pb-4">
                    {tab === "ESTABLISHMENT DETAILS" && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Inspection Information */}
                            <section className="border rounded border-[#d2d6d8]">
                                <div className="bg-[#2c88b9] text-white px-4 py-2 rounded-t">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Inspection Information</span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="grid grid-cols-12 gap-4">

                                        {/* Type of Inspection */}
                                        <div className="col-span-12 md:col-span-3">
                                            <Label required>Type of Inspection</Label>
                                            <select
                                                {...register("typeOfInspection")}
                                                className={`w-full border rounded px-2 py-2 mt-1 text-sm ${errors.typeOfInspection ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">- Select -</option>
                                                <option value="central_routine">Central/Routine Base</option>
                                                <option value="complain_base">Complain Base</option>
                                                <option value="surprise">Surprise</option>
                                                <option value="special_drive">Special Drive</option>
                                            </select>
                                        </div>

                                        {/* Randomization Order Number */}
                                        <div className="col-span-12 md:col-span-3">
                                            <Label>Randomization Order Number</Label>
                                            <input
                                                {...register("randomizationOrderNumber")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                            />
                                        </div>

                                        {/* Date of Inspection */}
                                        <div className="col-span-12 md:col-span-2">
                                            <Label required>Date of Inspection</Label>

                                            <input
                                                type="date"
                                                {...register("dateOfInspection")}
                                                readOnly
                                                onFocus={(e) => {
                                                    e.target.disabled = false;
                                                    e.target.readOnly = false;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.disabled = true;
                                                    e.target.readOnly = true;
                                                }}
                                                className={`
                w-full border rounded px-2 py-2 mt-1 text-sm 
                bg-gray-100 text-gray-600 cursor-not-allowed
                ${errors.dateOfInspection ? "border-red-500" : "border-gray-300"}
            `}
                                            />
                                        </div>

                                        {/* From Time */}
                                        <div className="col-span-6 md:col-span-2">
                                            <Label required>From Time</Label>

                                            <input
                                                type="time"
                                                {...register("fromTime")}
                                                readOnly
                                                onFocus={(e) => {
                                                    e.target.disabled = false;
                                                    e.target.readOnly = false;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.disabled = true;
                                                    e.target.readOnly = true;
                                                }}
                                                className={`
                w-full border rounded px-2 py-2 mt-1 text-sm 
                bg-gray-100 text-gray-600 cursor-not-allowed
                ${errors.fromTime ? "border-red-500" : "border-gray-300"}
            `}
                                            />
                                        </div>

                                        {/* To Time */}
                                        <div className="col-span-6 md:col-span-2">
                                            <Label required>To Time</Label>

                                            <input
                                                type="time"
                                                {...register("toTime")}
                                                readOnly
                                                onFocus={(e) => {
                                                    e.target.disabled = false;
                                                    e.target.readOnly = false;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.disabled = true;
                                                    e.target.readOnly = true;
                                                }}
                                                className={`
                w-full border rounded px-2 py-2 mt-1 text-sm 
                bg-gray-100 text-gray-600 cursor-not-allowed
                ${errors.toTime ? "border-red-500" : "border-gray-300"}
            `}
                                            />
                                        </div>

                                    </div>

                                    {/* Row 2 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Label required>Nature of Industry/Business</Label>
                                            <select
                                                {...register("natureOfIndustry")}
                                                className={`w-full border rounded px-2 py-2 mt-1 text-sm ${errors.natureOfIndustry ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">SELECT</option>
                                                <option value="water_treatment_operation">Water Treatment Operation</option>
                                                <option value="maintenance_managerial_jobs">Maintenance and Managerial Jobs</option>
                                                <option value="restaurant_service">Restaurant Service</option>
                                                <option value="ac_maintenance">AC Maintenance</option>
                                                <option value="security_service">Security Service</option>
                                                <option value="manpower_supply">Manpower Supply</option>
                                                <option value="engineering_maintenance_service">Engineering & Maintenance Service</option>
                                                <option value="housekeeping_maintenance_service">Housekeeping and Maintenance Service</option>
                                                <option value="security_guard">Security Guard</option>
                                                <option value="operation_maintenance">Operation & Maintenance</option>
                                                <option value="horticulture_gardening_nursery_maintenance">
                                                    Horticulture, Gardening & Nursery Maintenance
                                                </option>
                                                <option value="civil_works_construction_maintenance">
                                                    Civil Works, Construction & Maintenance
                                                </option>
                                                <option value="store_maintenance">Store Maintenance</option>
                                                <option value="painting_maintenance">Painting Maintenance</option>
                                                <option value="electrical_works_maintenance">Electrical Works Maintenance</option>
                                                <option value="mechanical_maintenance">Mechanical Maintenance</option>
                                                <option value="crane_operation">Crane Operation</option>
                                                <option value="loading_unloading">Loading & Unloading</option>
                                                <option value="fire_operation">Fire Operation</option>
                                                <option value="bagging_operation">Bagging Operation</option>
                                                <option value="heavy_vehicle">Heavy Vehicle</option>
                                                <option value="canteen_service">Canteen Service</option>
                                                <option value="house_keeping">House Keeping</option>
                                                <option value="guest_house_services">Guest House Services</option>
                                                <option value="laboratory_works">Laboratory Works</option>
                                                <option value="others">Others</option>
                                                <option value="fabrication_work">Fabrication Work</option>
                                                <option value="hotel">Hotel</option>
                                                <option value="trading_and_services">TRADING AND SERVICES</option>
                                            </select>

                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.natureOfIndustry?.message}
                                            </p>
                                        </div>

                                        <div>
                                            <Label>If nature of industry/business other, please specify</Label>
                                            <input
                                                {...register("natureOfIndustryOther")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300 bg-gray-100 cursor-not-allowed"
                                                disabled
                                                readOnly
                                            />
                                        </div>

                                    </div>

                                </div>
                            </section>

                            {/* Establishment Details */}
                            <section className="border rounded border-[#d2d6d8]">
                                <div className="bg-[#2c88b9] text-white px-4 py-2 rounded-t">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Establishment Details</span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Row 1 */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <Label required>Name of the Establishment/Industry/Shop</Label>
                                            <input
                                                {...register("establishmentName")}
                                                className={`w-full border rounded px-2 py-2 mt-1 text-sm ${errors.establishmentName ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.establishmentName?.message}
                                            </p>
                                        </div>

                                        <div>
                                            <Label required>Type of The Establishment</Label>
                                            <select
                                                {...register("typeOfEstablishment")}
                                                className={`w-full border rounded px-2 py-2 mt-1 text-sm ${errors.typeOfEstablishment ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">- Select -</option>
                                                <option value="micro">Micro</option>
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.typeOfEstablishment?.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <Label required>Address Line1</Label>
                                        <textarea
                                            {...register("addressLine1")}
                                            rows={4}
                                            className={`w-full border rounded px-2 py-2 mt-1 text-sm resize-none ${errors.addressLine1 ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.addressLine1?.message}
                                        </p>
                                    </div>

                                    {/* Row 2 (District / Subdivision / Block) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>District</Label>
                                            <input
                                                {...register("district")}
                                                className="w-full border bg-gray-100 cursor-not-allowed rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                                disabled
                                                readOnly
                                            />
                                        </div>


                                        <div>
                                            <Label>Sub-division</Label>
                                            <select
                                                {...register("subdivision")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                            >
                                                <option value="">- Select Sub-division -</option>
                                                <option value="">Jhargram</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Block/Municipality/Corporation/SEZ/NA</Label>
                                            <select
                                                {...register("block")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                            >
                                                <option value="">Block/Municipality/Corporation/SEZ/NA</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 3 (FIXED: GP/Ward / Police Station / Pin Code) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>GP / Ward</Label>
                                            <select
                                                {...register("gpWard")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                            >
                                                <option>GP/Ward</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Police Station</Label>
                                            <select
                                                {...register("policeStation")}
                                                className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300"
                                            >
                                                <option value="">Select Police Station</option>
                                                <option value="beliabera">Beliabera</option>
                                                <option value="belpahari">Belpahari</option>
                                                <option value="binpur">Binpur</option>
                                                <option value="gopiballavpur">Gopiballavpur</option>
                                                <option value="jamboni">Jamboni</option>
                                                <option value="jhargram">Jhargram</option>
                                                <option value="lalgarh">Lalgarh</option>
                                                <option value="nayagram">Nayagram</option>
                                                <option value="sankrail">Sankrail</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label required>Pin Code</Label>
                                            <input
                                                {...register("pinCode")}
                                                className={`w-full border rounded px-2 py-2 mt-1 text-sm ${errors.pinCode ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.pinCode?.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </section>

                            {/* Details of Person Present */}
                            <section className="border rounded border-[#d2d6d8]">
                                <div className="bg-[#2c88b9] text-white px-4 py-2 rounded-t">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Details of Person Present at the time of Inspection</span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            <input {...register("personName")} className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300" />
                                        </div>

                                        <div>
                                            <Label>Designation and other particular</Label>
                                            <input {...register("personDesignation")} className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300" />
                                        </div>

                                        <div>
                                            <Label>Mobile Number</Label>
                                            <input {...register("personMobile")} className="w-full border rounded px-2 py-2 mt-1 text-sm border-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* No. of workers employed */}
                            <section className="border rounded border-[#d2d6d8]">
                                {/* Header */}
                                <div className="bg-[#2c88b9] text-white px-4 py-2 rounded-t">
                                    <span className="font-semibold">No. of workers employed</span>
                                </div>

                                <div className="p-4 space-y-6">
                                    {/* Column Labels */}
                                    <div className="grid grid-cols-12 gap-x-6">
                                        <div className="col-span-3"></div>
                                        <div className="col-span-3 font-semibold">Male</div>
                                        <div className="col-span-3 font-semibold">Female</div>
                                        <div className="col-span-3 font-semibold">Total</div>
                                    </div>

                                    {/* ---------- DIRECT WORKERS ---------- */}
                                    <div className="grid grid-cols-12 gap-x-6 items-center">
                                        <div className="col-span-3 font-medium">No of workman/employed directly</div>

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("directMale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("directFemale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            value={directTotal}
                                            readOnly
                                            className="col-span-3 w-full border bg-gray-100 rounded px-2 py-2 text-sm border-gray-300"
                                        />
                                    </div>

                                    {/* ---------- CONTRACT WORKERS ---------- */}
                                    <div className="grid grid-cols-12 gap-x-6 items-center">
                                        <div className="col-span-3 font-medium">No of contract labour</div>

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("contractMale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("contractFemale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            value={contractTotal}
                                            readOnly
                                            className="col-span-3 w-full border bg-gray-100 rounded px-2 py-2 text-sm border-gray-300"
                                        />
                                    </div>

                                    {/* ---------- OTHER WORKERS ---------- */}
                                    <div className="grid grid-cols-12 gap-x-6 items-center">
                                        <div className="col-span-3 font-medium">No of other worker if engaged</div>

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("otherMale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("otherFemale")}
                                            className="col-span-3 w-full border rounded px-2 py-2 text-sm border-gray-300"
                                        />

                                        <input
                                            value={otherTotal}
                                            readOnly
                                            className="col-span-3 w-full border bg-gray-100 rounded px-2 py-2 text-sm border-gray-300"
                                        />
                                    </div>

                                    {/* ---------- DESCRIPTION ---------- */}
                                    <div>
                                        <div> <Label>Please specify whether ISMW/Cineworkers etc.</Label> <input {...register("workerSpec")} className="w-[49%] border rounded px-2 py-2 mt-1 text-sm border-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </section>


                            <div className="flex justify-start">
                                <button
                                    type="submit"
                                    className="bg-[#1E73BE] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Other tabs empty for now */}
                    {tab !== "ESTABLISHMENT DETAILS" && (
                        <div className="p-6 border rounded border-gray-200 text-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye size={16} />
                                <span className="font-medium"> {tab} </span>
                            </div>
                            <p>Content for the "{tab}" tab is intentionally left empty for now.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewInspection;
