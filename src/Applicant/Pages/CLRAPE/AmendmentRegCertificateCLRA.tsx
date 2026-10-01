import React from "react";
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { AlertTriangle } from "lucide-react";

type FormData = {
  regNumber: string;
};

const schema = yup.object({
  regNumber: yup
    .string()
    .trim()
    .required("Registration number is required"),
});

const AmendmentRegCertificateCLRA: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      // ✅ Get JWT from localStorage
      const authData = localStorage.getItem("lc_portal_auth");

      if (!authData) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      const parsed = JSON.parse(authData);
      const token = parsed?.token;

      const payload = {
        regnNumber: data.regNumber,
      };

      // ✅ fetch API call
      const response = await fetch(
        `${API_BASE}applicant-module/applications/amendment/clra-registration/step-one`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // ✅ Backend validation error → toast
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result?.registrationNo) {
        localStorage.setItem("NEW_CLRA_AMENDMENT_REG_NO", result.registrationNo);
      }

      // ✅ Navigate on success
      if (result.nextStep === "EDIT_AMENDMENT") {
        const id = result.applicationID; // ← ONLY ID YOU HAVE

        if (!id) {
          toast.error("Application ID missing from response");
          return;
        }

        // ✅ Store SAME ID under two keys
        sessionStorage.setItem(
          "CLRA_AMENDMENT_CTX",
          JSON.stringify({
            applicationID: id,
            applicantSubdivisionCode: result.applicantSubdivisionCode,
            applicantBlockCode: result.applicantBlockCode,
          })
        );

        // Store the parent ID 
        sessionStorage.setItem(
          "CLRA_AMENDMENT_PARENT_CTX",
          JSON.stringify({ parentApplicationID: id }) // ← intentionally same
        );

        navigate(`/apply-clra-reg-amendment?id=${id}`);
      }
      else if (result.nextStep === "APPLICANT_DASHBOARD") {
        navigate("/applicant-dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen font-sans">

      {/* Page Title */}
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          AMENDMENT OF REGISTRATION CERTIFICATE FOR PRINCIPAL EMPLOYERS.
        </h1>
      </div>

      {/* Main White Box */}
      <div className="bg-white rounded-md shadow border">

        {/* Blue Section Header */}
        <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md">
          APPLICATION FOR AMENDMENT OF REGISTRATION CERTIFICATE FOR PRINCIPAL EMPLOYERS
        </div>

        {/* Content Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">

          <label className="block font-semibold text-gray-800 mb-2">
            Enter your CLRA registration number: <span className="text-red-600">*</span>
          </label>

          <Input
            {...register("regNumber")}
            className="w-full border rounded h-12 text-lg px-3"
            // className="w-full border rounded h-12 text-lg px-3 bg-gray-100 cursor-not-allowed"
          />

          {errors.regNumber && (
            <p className="text-red-600 text-sm mt-1">
              {errors.regNumber.message}
            </p>
          )}

          <p className="text-red-600 text-sm mt-1">
            Note :- Enter the registration number of the certificate to be amended.
          </p>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6 py-2 text-md rounded shadow disabled:opacity-60"
            >
              {isSubmitting ? "PLEASE WAIT..." : "CONTINUE"}
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AmendmentRegCertificateCLRA;
