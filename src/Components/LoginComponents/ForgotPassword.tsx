import { API_BASE } from "@/constants/constants";
import ChangePasswordForm from "@/Components/ChangePassword/ChangePasswordForm";
import { encryptionDecryptionFun } from "@/utils/encryption";
import axios from "axios";
import React, { useEffect, useState } from "react";

const FORGOT_OTP_SESSION_KEY = "lc_forgot_password_otp";
const FORGOT_VERIFIED_TOKEN_KEY = "lc_forgot_password_verified";

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

type ForgotPasswordResponse = {
  status?: string;
  canProceed?: boolean;
  message?: string;
  encryptedOtp?: string;
  expiresAt?: number;
  channels?: {
    sms?: { sent?: boolean; to?: string };
    email?: { sent?: boolean; to?: string };
  };
};

type OtpPayload = {
  uid?: number;
  exp?: number;
  otp?: number;
};

type ForgotOtpSession = {
  encryptedOtp: string;
  expiresAt: number;
};

function saveOtpSession(session: ForgotOtpSession) {
  sessionStorage.setItem(FORGOT_OTP_SESSION_KEY, JSON.stringify(session));
}

function loadOtpSession(): ForgotOtpSession | null {
  try {
    const raw = sessionStorage.getItem(FORGOT_OTP_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ForgotOtpSession;
    if (!parsed?.encryptedOtp || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearOtpSession() {
  sessionStorage.removeItem(FORGOT_OTP_SESSION_KEY);
}

function saveVerifiedToken(encryptedOtp: string, expiresAt: number) {
  sessionStorage.setItem(
    FORGOT_VERIFIED_TOKEN_KEY,
    JSON.stringify({ encryptedOtp, expiresAt }),
  );
}

function loadVerifiedToken(): ForgotOtpSession | null {
  try {
    const raw = sessionStorage.getItem(FORGOT_VERIFIED_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ForgotOtpSession;
    if (!parsed?.encryptedOtp || !parsed?.expiresAt) return null;
    if (parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(FORGOT_VERIFIED_TOKEN_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearVerifiedToken() {
  sessionStorage.removeItem(FORGOT_VERIFIED_TOKEN_KEY);
}

function parseOtpPayload(encryptedOtp: string): OtpPayload | null {
  const decrypted = encryptionDecryptionFun("decrypt", encryptedOtp);
  if (!decrypted) return null;
  try {
    return JSON.parse(decrypted) as OtpPayload;
  } catch {
    return null;
  }
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
}

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [passwordStep, setPasswordStep] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setCaptcha(generateCaptcha());
    const verified = loadVerifiedToken();
    if (verified) {
      setVerifiedToken(verified.encryptedOtp);
      setPasswordStep(true);
      return;
    }
    const existing = loadOtpSession();
    if (existing && existing.expiresAt > Date.now()) {
      setOtpStep(true);
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !captchaInput) {
      setError("All fields are required.");
      return;
    }

    if (captcha !== captchaInput.toUpperCase()) {
      setError("Invalid captcha code.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post<ForgotPasswordResponse>(
        `${API_BASE}auth/forgot-password`,
        { username: username.trim(), email: email.trim().toLowerCase() },
      );

      if (!data?.canProceed || !data?.encryptedOtp || !data?.expiresAt) {
        clearOtpSession();
        setOtpStep(false);
        setError(data?.message || "OTP could not be sent. Please try again.");
        return;
      }

      saveOtpSession({
        encryptedOtp: data.encryptedOtp,
        expiresAt: data.expiresAt,
      });

      setOtpStep(true);
      setOtp("");
      const sentVia = [
        data.channels?.sms?.sent ? `SMS (${data.channels.sms.to || "mobile"})` : null,
        data.channels?.email?.sent ? `email (${data.channels.email.to || "registered email"})` : null,
      ]
        .filter(Boolean)
        .join(" and ");
      setSuccess(
        data.message ||
          `OTP sent${sentVia ? ` via ${sentVia}` : ""}. Enter the code below to continue.`,
      );
    } catch (err) {
      clearOtpSession();
      setOtpStep(false);
      setError(apiErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = otp.replace(/\D/g, "");
    const session = loadOtpSession();
    if (!session?.encryptedOtp) {
      setError("Please request an OTP first.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    if (session.expiresAt < Date.now()) {
      clearOtpSession();
      setOtpStep(false);
      setError("OTP expired. Please request a new code.");
      return;
    }

    const payload = parseOtpPayload(session.encryptedOtp);
    if (!payload?.otp || !payload?.exp) {
      setError("Invalid OTP session. Please request a new code.");
      return;
    }

    if (payload.exp < Date.now()) {
      clearOtpSession();
      setOtpStep(false);
      setError("OTP expired. Please request a new code.");
      return;
    }

    if (String(payload.otp) !== code) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    clearOtpSession();
    saveVerifiedToken(session.encryptedOtp, session.expiresAt);
    setVerifiedToken(session.encryptedOtp);
    setOtpStep(false);
    setPasswordStep(true);
    setSuccess("OTP verified. Set your new password below.");
  };

  if (passwordStep && verifiedToken) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-start px-16 pt-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl italic text-gray-700 mb-6">Forgot Password</h1>
          {success ? <p className="text-green-600 text-sm mb-4">{success}</p> : null}
          <ChangePasswordForm
            mode="forgot"
            resetToken={verifiedToken}
            title="Set New Password"
            successRedirectTo="/applicant-login"
            onCancel={() => {
              clearVerifiedToken();
              setPasswordStep(false);
              setVerifiedToken("");
              setSuccess("");
              setError("");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-start justify-start px-16 pt-16">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl italic text-gray-700 mb-10">Forgot Password</h1>

        <form onSubmit={otpStep ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
          <div className="flex items-center gap-6">
            <label className="w-56 text-sm">
              Registered Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-[500px] border border-gray-300 px-3 py-2 disabled:bg-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={otpStep || loading}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="w-56 text-sm">
              Registered Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-[500px] border border-gray-300 px-3 py-2 disabled:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpStep || loading}
            />
          </div>

          {!otpStep ? (
            <div className="flex items-start gap-6">
              <label className="w-56 text-sm pt-2">
                What code is in the image? <span className="text-red-500">*</span>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the characters shown in the image.
                </p>
              </label>
              <div className="flex items-center gap-6">
                <input
                  type="text"
                  className="w-[250px] border border-gray-300 px-3 py-2"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  disabled={loading}
                />
                <div
                  className="px-6 py-2 text-3xl tracking-widest font-bold text-green-700 bg-gray-100 select-none"
                  style={{ fontFamily: "cursive", transform: "rotate(-2deg)" }}
                >
                  {captcha}
                </div>
              </div>
            </div>
          ) : null}

          {otpStep ? (
            <div className="flex items-center gap-6">
              <label className="w-56 text-sm">
                OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                className="w-[250px] border border-gray-300 px-3 py-2 tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
              />
            </div>
          ) : null}

          {error ? <p className="text-red-600 text-sm ml-56">{error}</p> : null}
          {success ? <p className="text-green-600 text-sm ml-56">{success}</p> : null}

          <div className="ml-56 flex flex-wrap gap-3">
            {!otpStep ? (
              <button
                type="submit"
                disabled={loading}
                className="bg-[#7b6a58] text-white px-6 py-2 uppercase text-sm hover:bg-[#6a5a4a] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Request OTP"}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#7b6a58] text-white px-6 py-2 uppercase text-sm hover:bg-[#6a5a4a] disabled:opacity-60"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    clearOtpSession();
                    clearVerifiedToken();
                    setOtpStep(false);
                    setPasswordStep(false);
                    setVerifiedToken("");
                    setOtp("");
                    setError("");
                    setSuccess("");
                    setCaptcha(generateCaptcha());
                    setCaptchaInput("");
                  }}
                  className="border border-gray-400 text-gray-700 px-6 py-2 uppercase text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
