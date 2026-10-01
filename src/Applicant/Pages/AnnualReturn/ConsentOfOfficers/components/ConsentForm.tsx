import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { ConsentForm as FormType } from "../types/consentOfOfficers.types";

interface ConsentFormProps {
  form: UseFormReturn<FormType>;
  onSubmit: (data: FormType) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  onBack,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const labelCls = "block text-[13px] font-semibold mb-1 text-gray-800";
  const inputCls =
    "w-full border border-[#a6a6a6] px-2 py-[6px] text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]";

  return (
    <div className="bg-white border border-[#ddd] rounded shadow-sm">
      <div className="bg-[#2c5f8a] text-white px-4 py-2 text-sm font-semibold">
        CONSENT OF OFFICERS
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* 1. Name */}
          <div>
            <label className={labelCls}>
              1. Name <span className="text-red-600">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Enter Name"
              className={inputCls}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>
            )}
          </div>

          {/* 2. Designation */}
          <div>
            <label className={labelCls}>
              2. Designation <span className="text-red-600">*</span>
            </label>
            <input
              {...register("designation")}
              placeholder="Enter Designation"
              className={inputCls}
            />
            {errors.designation && (
              <p className="text-xs text-red-600 mt-0.5">
                {errors.designation.message}
              </p>
            )}
          </div>

          {/* 3. Mobile */}
          <div>
            <label className={labelCls}>
              Mobile <span className="text-red-600">*</span>
            </label>
            <input
              {...register("mobile")}
              placeholder="Enter 10-digit Mobile Number"
              className={inputCls}
            />
            {errors.mobile && (
              <p className="text-xs text-red-600 mt-0.5">
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/* 4. Upload Signature */}
          <div>
            <label className={labelCls}>
              Upload Signature <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              {...register("signature")}
              className="text-sm cursor-pointer"
            />
            {errors.signature && (
              <p className="text-xs text-red-600 mt-0.5">
                {errors.signature.message as string}
              </p>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="bg-[#337ab7] text-white px-6 py-1.5 rounded text-sm hover:bg-[#286090] transition font-medium"
            onClick={onBack}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#337ab7] text-white px-6 py-1.5 rounded text-sm hover:bg-[#286090] transition font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
};
