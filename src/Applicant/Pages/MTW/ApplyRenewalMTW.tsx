import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";

type FormData = {
  regNumber: string;
};

const schema = yup.object({
  regNumber: yup
    .string()
    .trim()
    .required("Registration number is required"),
});

const ApplyRenewalMTW: React.FC = () => {
  const navigate = useNavigate();
  // const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleContinue = async (data: FormData) => {
    try {
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

      const response = await fetch(
        `${API_BASE}applicant-module/applications/renewal/mtw/step-one`,
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

      if (result.success !== true) {
        toast.error(result.message || "Something went wrong");
        return;
      }

      if (result.nextStep === "EDIT_AMENDMENT") {
        const id = result.applicationID;

        if (!id) {
          toast.error("Application ID missing from response");
          return;
        }

        sessionStorage.setItem(
          "MTW_RENEWAL_CTX",
          JSON.stringify({
            applicationID: id,
            applicantSubdivisionCode: result.applicantSubdivisionCode,
            applicantBlockCode: result.applicantBlockCode,
          })
        );

        sessionStorage.setItem(
          "MTW_RENEWAL_PARENT_CTX",
          JSON.stringify({
            parentApplicationID: id,
          })
        );

        navigate(`/mtw-renewal?id=${id}`);
      }
      else if (result.nextStep === "APPLICANT_DASHBOARD") {
        navigate("/applicant-dashboard?act=mtw");
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }

  };

  return (<div className="w-full min-h-screen font-sans">


    <div className="bg-white p-4 mb-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Apply for Renewal of Motor Transport Undertaking Registration Certificate
      </h1>
    </div>

    <div className="bg-white rounded-md shadow border">

      <div className="bg-[#215e87] text-white text-md font-semibold px-4 py-3 rounded-t-md">
        CHECK FOR PREVIOUS REGISTERED INFORMATION
      </div>

      <form onSubmit={handleSubmit(handleContinue)} className="p-6">

        <label className="block font-semibold text-gray-800 mb-2">
          Enter your registration number: <span className="text-red-600">*</span>
        </label>

        <Input
          {...register("regNumber")}
          className="w-full border rounded h-12 text-lg px-3"
        />

        {errors.regNumber && (
          <p className="text-red-600 text-sm mt-1">
            {errors.regNumber.message}
          </p>
        )}

        <p className="text-red-600 text-sm mt-1">
          Note :- Enter the registration number of the certificate to be renewed.
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

export default ApplyRenewalMTW;
