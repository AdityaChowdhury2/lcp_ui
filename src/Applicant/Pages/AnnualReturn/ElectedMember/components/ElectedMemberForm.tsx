import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { ElectionForm } from "../types/electedMember.types";

interface ElectedMemberFormProps {
  form: UseFormReturn<ElectionForm>;
  onSubmit: (data: ElectionForm) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
}

export const ElectedMemberForm: React.FC<ElectedMemberFormProps> = ({
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
        ELECTION
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
              <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>
            )}
          </div>

          {/* 2. Date of Birth */}
          <div>
            <label className={labelCls}>
              2. Date of Birth <span className="text-red-600">*</span>
            </label>
            <input type="date" {...register("dob")} className={inputCls} />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-0.5">{errors.dob.message}</p>
            )}
          </div>

          {/* 3. Title */}
          <div>
            <label className={labelCls}>
              3. Title of position held in Union/Federation{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="Enter Position Title"
              className={inputCls}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-0.5">{errors.title.message}</p>
            )}
          </div>

          {/* 4. Date of Election */}
          <div>
            <label className={labelCls}>
              4. Date of Election <span className="text-red-600">*</span>
            </label>
            <input type="date" {...register("electionDate")} className={inputCls} />
            {errors.electionDate && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.electionDate.message}
              </p>
            )}
          </div>

          {/* 5. Date of Last Election */}
          <div>
            <label className={labelCls}>
              5. Date of Last Election <span className="text-red-600">*</span>
            </label>
            <input type="date" {...register("lastElectionDate")} className={inputCls} />
            {errors.lastElectionDate && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.lastElectionDate.message}
              </p>
            )}
          </div>

          {/* 6. Date of Next Election */}
          <div>
            <label className={labelCls}>
              6. Date of Next Election <span className="text-red-600">*</span>
            </label>
            <input type="date" {...register("nextElectionDate")} className={inputCls} />
            {errors.nextElectionDate && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.nextElectionDate.message}
              </p>
            )}
          </div>

          {/* 7. Private Address */}
          <div className="row-span-2">
            <label className={labelCls}>
              7. Private Address <span className="text-red-600">*</span>
            </label>
            <textarea
              {...register("privateAddress")}
              rows={5}
              placeholder="Enter Private Address"
              className="w-full border border-[#a6a6a6] px-2 py-1 text-sm resize-none rounded-sm focus:outline-none focus:border-[#2c5f8a]"
            />
            {errors.privateAddress && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.privateAddress.message}
              </p>
            )}
          </div>

          {/* 8. Mobile Number */}
          <div>
            <label className={labelCls}>
              8. Mobile Number <span className="text-red-600">*</span>
            </label>
            <input
              {...register("mobile")}
              placeholder="Enter 10-digit Mobile Number"
              className={inputCls}
            />
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-0.5">{errors.mobile.message}</p>
            )}
          </div>

          {/* 10. Upload Signature */}
          <div>
            <label className={labelCls}>
              10. Upload Signature <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              {...register("signature")}
              className="text-sm cursor-pointer"
            />
            {errors.signature && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.signature.message}
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
