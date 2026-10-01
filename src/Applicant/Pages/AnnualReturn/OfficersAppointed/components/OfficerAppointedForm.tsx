import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { OfficersAppointedForm as FormType } from "../types/officersAppointed.types";

interface OfficerAppointedFormProps {
  form: UseFormReturn<FormType>;
  onSubmit: (data: FormType) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
}

export const OfficerAppointedForm: React.FC<OfficerAppointedFormProps> = ({
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

  return (
    <div className="bg-white border border-[#ddd] rounded shadow-sm mb-4">
      <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm">
        OFFICERS APPOINTED
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 grid grid-cols-2 gap-x-6 gap-y-5"
      >
        {/* 1 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            1. Name <span className="text-red-600">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Enter Name"
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.name && (
            <p className="text-red-500 text-[11px] mt-0.5">{errors.name.message}</p>
          )}
        </div>

        {/* 2 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            2. Date of Birth <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            {...register("dob")}
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.dob && (
            <p className="text-red-500 text-[11px] mt-0.5">{errors.dob.message}</p>
          )}
        </div>

        {/* 3 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            3. Private Address <span className="text-red-600">*</span>
          </label>
          <input
            {...register("privateAddress")}
            placeholder="Enter Private Address"
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.privateAddress && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {errors.privateAddress.message}
            </p>
          )}
        </div>

        {/* 4 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            4. Personal Occupation <span className="text-red-600">*</span>
          </label>
          <input
            {...register("personalOccupation")}
            placeholder="Enter Personal Occupation"
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.personalOccupation && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {errors.personalOccupation.message}
            </p>
          )}
        </div>

        {/* 5 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            5. Title of Position held in Union/Federation{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            {...register("titlePosition")}
            placeholder="Enter Position Title"
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.titlePosition && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {errors.titlePosition.message}
            </p>
          )}
        </div>

        {/* 6 */}
        <div>
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            6. Date on which appointment in col 5 was taken up{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            {...register("appointmentDate")}
            className="w-full h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.appointmentDate && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {errors.appointmentDate.message}
            </p>
          )}
        </div>

        {/* 7 – FULL WIDTH */}
        <div className="col-span-2">
          <label className="block text-sm mb-1 text-gray-800 font-medium">
            7. Other Office held in addition to membership of executive with date{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            {...register("otherOffice")}
            placeholder="Enter Other Office details"
            className="w-[49%] h-[34px] border border-[#a6a6a6] px-2 text-sm rounded-sm focus:outline-none focus:border-[#2c5f8a]"
          />
          {errors.otherOffice && (
            <p className="text-red-500 text-[11px] mt-0.5">
              {errors.otherOffice.message}
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="col-span-2 flex justify-between mt-2">
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
