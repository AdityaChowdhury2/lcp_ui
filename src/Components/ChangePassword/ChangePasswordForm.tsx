import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

export interface ChangePasswordValues {
  newPassword: string;
  confirmPassword: string;
}

const schema = yup.object({
  newPassword: yup
    .string()
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/,
      "Password must contain uppercase, number & special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const initialValues: ChangePasswordValues = {
  newPassword: "",
  confirmPassword: "",
};

const getPasswordScore = (p: string) => {
  let score = 0;
  if (!p) return score;
  if (p.length >= 8) score += 2;
  else if (p.length >= 5) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  return Math.min(score, 5);
};

const scoreToLabel = (score: number) => {
  if (score <= 1) return "Very weak";
  if (score === 2) return "Weak";
  if (score === 3) return "Fair";
  if (score === 4) return "Good";
  return "Strong";
};

export type ChangePasswordFormProps = {
  /** Logged-in change password vs forgot-password reset with token */
  mode?: "authenticated" | "forgot";
  resetToken?: string;
  title?: string;
  encUserId?: string | undefined;
  successRedirectTo?: string;
  onCancel?: () => void;
};

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  mode = "authenticated",
  resetToken,
  title = "Change Password",
  encUserId = undefined,
  successRedirectTo = "/applicant-login",
  onCancel,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const newPassword = watch("newPassword");
  const score = useMemo(() => getPasswordScore(newPassword || ""), [newPassword]);
  const pct = Math.round((score / 5) * 100);

  const handleFormSubmit = async (values: ChangePasswordValues) => {
    try {
      setLoading(true);

      if (mode === "forgot") {
        if (!resetToken) {
          toast.error("Session expired. Please request OTP again.");
          return;
        }

        const response = await fetch(`${API_BASE}auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          toast.error(data?.message || "Failed to reset password");
          return;
        }
        toast.success(data?.message || "Password reset successfully");
        reset();
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          navigate(successRedirectTo);
        }, 1500);
        return;
      }

      const response = await fetch(`${API_BASE}users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
          ...(encUserId && { encUserId }),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Password changed successfully");
        reset();
        setTimeout(() => {
          localStorage.clear();
          navigate(successRedirectTo);
        }, 1500);
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        {title ? (
          <h2 className="text-lg font-semibold text-[#333] mb-4">{title}</h2>
        ) : null}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-3 py-2 h-10 border border-[#d2d6de] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3c8dbc] pr-10"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 leading-5">
                <p>• Minimum 8 characters</p>
                <p>• At least 1 uppercase letter</p>
                <p>• At least 1 numeric digit</p>
                <p>• At least 1 special character</p>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <div>Password strength:</div>
                  <div className="font-medium">{scoreToLabel(score)}</div>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${pct}%`,
                      background:
                        score <= 1
                          ? "#ef4444"
                          : score === 2
                            ? "#f97316"
                            : score === 3
                              ? "#f59e0b"
                              : score === 4
                                ? "#10b981"
                                : "#059669",
                    }}
                  />
                </div>
              </div>
              {errors.newPassword ? (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="self-start">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-2 h-10 border border-[#d2d6de] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3c8dbc] pr-10"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3c8dbc] text-white font-medium rounded shadow hover:bg-[#357ca5] transition disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit"}
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
