import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { FormData } from "../types/officersRelinquishing.types";

interface OfficerRelinquishingFormProps {
  form: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export const OfficerRelinquishingForm: React.FC<OfficerRelinquishingFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="bg-white border border-[#ddd] rounded shadow-sm mb-4">
      <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm">
        OFFICERS RELINQUISHING OFFICE
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 grid grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            1. Name <span className="text-red-600">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Enter Name"
            className="w-full h-[34px] border border-[#aaa] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Office */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            2. Office <span className="text-red-600">*</span>
          </label>
          <input
            {...register("office")}
            placeholder="Enter Office"
            className="w-full h-[34px] border border-[#aaa] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.office && (
            <p className="text-red-600 text-xs mt-1">{errors.office.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            3. Date of Relinquishing Office <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            {...register("date")}
            className="w-full h-[34px] border border-[#aaa] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.date && (
            <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-end justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#337ab7] text-white px-6 py-1.5 rounded text-sm hover:bg-[#286090] transition flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {isSubmitting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
            SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
};
