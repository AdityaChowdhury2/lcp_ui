import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { SecurityForm } from "../types/securities.types";

interface SecuritiesFormProps {
  form: UseFormReturn<SecurityForm>;
  onSubmit: (data: SecurityForm) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
}

export const SecuritiesForm: React.FC<SecuritiesFormProps> = ({
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

  const labelClass = "text-[13px] font-semibold text-gray-800";
  const inputClass =
    "w-full h-[30px] border border-[#bdbdbd] px-2 text-[13px] rounded-sm focus:outline-none focus:border-[#2c5f8a]";

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Particulars */}
        <div>
          <label className={labelClass}>
            1. Particulars <span className="text-red-600">*</span>
          </label>
          <input
            {...register("particulars")}
            className={inputClass}
            placeholder="Enter Particulars"
          />
          {errors.particulars && (
            <p className="text-red-500 text-[11px] mt-1">
              {errors.particulars.message}
            </p>
          )}
        </div>

        {/* Face Value */}
        <div>
          <label className={labelClass}>
            2. Face Value <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            onKeyDown={preventNegative}
            {...register("faceValue")}
            className={inputClass}
            placeholder="Enter Face Value"
          />
          {errors.faceValue && (
            <p className="text-red-500 text-[11px] mt-1">
              {errors.faceValue.message}
            </p>
          )}
        </div>

        {/* Cost Price */}
        <div>
          <label className={labelClass}>
            3. Cost Price <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            onKeyDown={preventNegative}
            {...register("costPrice")}
            className={inputClass}
            placeholder="Enter Cost Price"
          />
          {errors.costPrice && (
            <p className="text-red-500 text-[11px] mt-1">
              {errors.costPrice.message}
            </p>
          )}
        </div>

        {/* Market Price */}
        <div>
          <label className={labelClass}>
            4. Market price at date on which accounts have been made up{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            onKeyDown={preventNegative}
            {...register("marketPrice")}
            className={inputClass}
            placeholder="Enter Market Price"
          />
          {errors.marketPrice && (
            <p className="text-red-500 text-[11px] mt-1">
              {errors.marketPrice.message}
            </p>
          )}
        </div>

        {/* In hands of */}
        <div className="col-span-2">
          <label className={labelClass}>
            5. In hands of <span className="text-red-600">*</span>
          </label>
          <textarea
            {...register("inHand")}
            rows={4}
            className="w-full border border-[#bdbdbd] px-2 py-1 text-[13px] rounded-sm focus:outline-none focus:border-[#2c5f8a]"
            placeholder="Enter details of in hands of"
          />
          {errors.inHand && (
            <p className="text-red-500 text-[11px] mt-1">
              {errors.inHand.message}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="bg-[#337ab7] text-white px-6 py-[6px] text-[13px] rounded hover:bg-[#286090] transition flex items-center gap-1"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#337ab7] text-white px-6 py-[6px] text-[13px] rounded hover:bg-[#286090] transition disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {isSubmitting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
          SAVE
        </button>
      </div>
    </form>
  );
};
