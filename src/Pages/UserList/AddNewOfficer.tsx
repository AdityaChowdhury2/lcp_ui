// src/Pages/UserList/AddNewOfficer.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

type AddOfficerFormValues = {
  employeeId: string;
  firstName: string;
  lastName: string;
  dob: string;
  designation: string;
  officeNumber: string;
  officeEmail: string;
  joiningDate: string;
  gender: string;
};

const AddNewOfficer: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddOfficerFormValues>({
    defaultValues: {
      employeeId: "",
      firstName: "",
      lastName: "",
      dob: "",
      designation: "",
      officeNumber: "",
      officeEmail: "",
      joiningDate: "",
      gender: "",
    },
  });

  const onSubmit = async (values: AddOfficerFormValues) => {
    try {
      const token = getAuthToken();

      // Dummy API endpoint – replace with real one when available
      const response = await fetch(`${API_BASE}users/officer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });

      // For a dummy API we'll just log, but handle non-2xx anyway
      if (!response.ok) {
        console.error("Dummy API error", await response.text());
        alert("Failed to save officer");
        return;
      }

      console.log("Dummy API success", await response.json().catch(() => null));
      alert("Officer details saved");
      reset();
    } catch (err) {
      console.error("Dummy API exception", err);
      alert("Something went wrong while saving employee details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <p className="max-w-6xl mx-auto mt-1 font-['Source Sans Pro',sans-serif'] text-[24px] font-500 opacity-90">
        Add Employee Details
      </p>

      <div className="max-w-6xl mx-auto py-3">
        <div className="bg-white rounded-lg shadow-lg border border-[#337ab7] overflow-hidden">
          <div className="bg-[#337ab7] text-white px-[15px] py-[10px]">
            <h2 className="text-[14px] font-normal">ADD EMPLOYEE DETAILS</h2>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* HRMS / Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HRMS ID/Employee Id <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeId", { required: "Employee Id is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("firstName", { required: "First name is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("lastName", { required: "Last name is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dob", { required: "Date of birth is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.dob && (
                  <p className="mt-1 text-xs text-red-500">{errors.dob.message}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Designation <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("designation", { required: "Designation is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">- Select -</option>
                  <option value="DLC">DLC</option>
                  <option value="ALC">ALC</option>
                  <option value="Inspector">Labour Inspector</option>
                  {/* <option value="Clerk">Clerk</option> */}
                </select>
                {errors.designation && (
                  <p className="mt-1 text-xs text-red-500">{errors.designation.message}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile (UGC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("officeNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.officeNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.officeNumber.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("officeEmail", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.officeEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.officeEmail.message}</p>
                )}
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date Under Labour Commissionerate{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("joiningDate", {
                    required: "Joining date is required",
                  })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.joiningDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.joiningDate.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  className="w-full px-4 py-2 border border-[#ccc] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">- Select -</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-[12px] py-[8px] bg-[#3c8dbc] hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-[3px] shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                {isSubmitting ? "Saving..." : "SAVE"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewOfficer;