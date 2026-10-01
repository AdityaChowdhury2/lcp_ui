import { IMAGE_BASE } from "@/constants/constants";
import React, { FC, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  clearAuthError,
  sendLoginOtp,
  verifyLoginOtp,
} from "@/store/authSlice";
import type { User } from "@/types/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";
import {
  APPLICANT_ROLES,
  CTU_ROLES,
  OFFICER_ROLES,
} from "@/routing/roleGroups";

/* ---------- Error Bubble (same as LoginModal) ---------- */
const ErrorBubble: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-block mt-2 relative">
    <div className="bg-[#ee0101] relative z-[5001] text-white w-[200px] font-[tahoma] text-[11px] shadow-[0_0_6px_#000] px-[10px] py-[4px] rounded-[6px] border-[#ddd] border-2">
      {children}
    </div>
    <div
      className="absolute left-4 -top-2 w-0 h-0"
      style={{
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid #d33",
      }}
    />
  </div>
);

const validationSchema = Yup.object({
  mobile: Yup.string()
    .required("This field is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be of 10 digits"),
});

const initialValues = {
  mobile: "",
};

const OTP_COOKIE = "lc_login_enc_otp";
const OTP_EXP_COOKIE = "lc_login_otp_exp";
const OTP_MOBILE_COOKIE = "lc_login_otp_mobile";

function setCookie(name: string, value: string, expiresAtMs: number) {
  const date = new Date(expiresAtMs);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string {
  const key = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(key));
  return found ? decodeURIComponent(found.slice(key.length)) : "";
}

function clearOtpCookies() {
  const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `${OTP_COOKIE}=; expires=${expired}; path=/; SameSite=Lax`;
  document.cookie = `${OTP_EXP_COOKIE}=; expires=${expired}; path=/; SameSite=Lax`;
  document.cookie = `${OTP_MOBILE_COOKIE}=; expires=${expired}; path=/; SameSite=Lax`;
}

function getPostLoginPath(user: User | null | undefined): string {
  const role = Number(user?.role);
  if (role === 8 && user?.isSliApplicant) {
    return "/sli-admission/list";
  }
  if (role === 11) return "/trade-union-dashboard";
  if (role === 15) return "/min-wages/scheduled-employment";
  if (role === 16) return "/trade-union/trade-federation-annual-return-form";
  if (role === 28) return "/bocwcess/admin";
  if (OFFICER_ROLES.includes(role)) return "/dashboard";
  if (CTU_ROLES.includes(role)) return "/central-trade-union-annual-return-list";
  if (APPLICANT_ROLES.includes(role)) return "/applicant-dashboard";
  return "/";
}

/* ---------- Page ---------- */
const MobileOtpLogin: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authError = useSelector((state: RootState) => state.auth.error);

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState("");
  const [clientError, setClientError] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);

  const loading = authStatus === "loading";
  const apiError = typeof authError === "string"
    ? authError
    : (authError?.message ?? "Request failed");
  const displayError = clientError || (!loading && authError ? apiError : "");

  useEffect(() => {
    if (step !== "otp") return;
    const syncExpiry = () => {
      const exp = Number(getCookie(OTP_EXP_COOKIE));
      if (!exp || Date.now() > exp) {
        setOtpExpired(true);
      } else {
        setOtpExpired(false);
      }
    };

    syncExpiry();
    const timer = window.setInterval(syncExpiry, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const handleSubmit = async (values: typeof initialValues) => {
    setInfo("");
    setClientError("");
    dispatch(clearAuthError());
    const result = await dispatch(sendLoginOtp({ mobile: values.mobile }));
    if (sendLoginOtp.fulfilled.match(result)) {
      const data = result.payload;
      setCookie(OTP_COOKIE, String(data.encryptedOtp), Number(data.expiresAt));
      setCookie(OTP_EXP_COOKIE, String(data.expiresAt), Number(data.expiresAt));
      setCookie(
        OTP_MOBILE_COOKIE,
        String(data.mobile || values.mobile),
        Number(data.expiresAt),
      );
      setMobile(
        String(data.mobile || values.mobile)
          .replace(/\D/g, "")
          .slice(-10),
      );
      setStep("otp");
      setOtpExpired(false);
      setOtp("");
      setInfo(data.message || "OTP sent successfully.");
    }
  };

  const handleResendOtp = async () => {
    if (!mobile) {
      setClientError("Please change mobile and generate OTP again.");
      return;
    }
    setInfo("");
    setClientError("");
    dispatch(clearAuthError());
    const result = await dispatch(sendLoginOtp({ mobile }));
    if (sendLoginOtp.fulfilled.match(result)) {
      const data = result.payload;
      setCookie(OTP_COOKIE, String(data.encryptedOtp), Number(data.expiresAt));
      setCookie(OTP_EXP_COOKIE, String(data.expiresAt), Number(data.expiresAt));
      setCookie(OTP_MOBILE_COOKIE, String(data.mobile || mobile), Number(data.expiresAt));
      setOtpExpired(false);
      setOtp("");
      setInfo(data.message || "OTP resent successfully.");
    }
  };

  const handleVerifyOtp = async () => {
    setInfo("");
    setClientError("");
    dispatch(clearAuthError());

    const encOtp = getCookie(OTP_COOKIE);
    const exp = Number(getCookie(OTP_EXP_COOKIE));
    const cookieMobile = getCookie(OTP_MOBILE_COOKIE) || mobile;
    if (!encOtp || !exp || Date.now() > exp) {
      clearOtpCookies();
      setOtpExpired(true);
      setClientError("OTP expired. Please generate OTP again.");
      return;
    }

    const encryptedInputOtp = encryptionDecryptionFun("encrypt", otp) || "";
    if (!encryptedInputOtp || encryptedInputOtp !== encOtp) {
      setClientError("Invalid OTP");
      return;
    }

    const result = await dispatch(
      verifyLoginOtp({
        mobile: cookieMobile,
        otp,
        encryptedOtp: encOtp,
        expiresAt: exp,
      }),
    );

    if (verifyLoginOtp.fulfilled.match(result)) {
      clearOtpCookies();
      const user =
        result.payload.user ??
        (result.payload.data as { user?: User } | undefined)?.user;
      navigate(getPostLoginPath(user));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-cover"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}images/loginbg.jpg)`,
      }}
    >
      <style>{`
        .login-card { width: 90%; }
        @media (min-width: 768px) and (max-width: 980px) {
          .login-card { width: 80%; }
        }
        @media (min-width: 981px) {
          .login-card { width: 500px; }
        }
      `}</style>

      {/* <div
      className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[url('${IMAGE_BASE}loginbg.jpg')] bg-cover`}
    >
      <style>{`
        .login-card { width: 90%; }
        @media (min-width: 768px) and (max-width: 980px) {
          .login-card { width: 80%; }
        }
        @media (min-width: 981px) {
          .login-card { width: 500px; }
        }
      `}</style> */}

      <div className="relative bg-[rgba(0,0,0,0.68)] shadow-2xl w-full login-card">
        <h1 className="p-0 bg-[#cfb264] text-center text-black uppercase leading-[60px] text-[28px] mt-0 font-bold">
          USER LOGIN
        </h1>

        <div className="p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form noValidate>
                {step === "mobile" ? (
                  <>
                    <div className="mt-[1em] mb-[1em]">
                      <label className="block text-white font-[600] mb-2">
                        Enter Your 10 Digit Mobile Number{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Field
                        name="mobile"
                        type="text"
                        maxLength={10}
                        className="w-full px-4 py-3 h-[39px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="XXXXXXXXXX"
                      />

                      <ErrorMessage name="mobile">
                        {(msg) => <ErrorBubble>{msg}</ErrorBubble>}
                      </ErrorMessage>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="mt-6 w-full bg-[#C90] text-white font-bold text-[16px] p-[9px] transition disabled:opacity-50"
                    >
                      {isSubmitting || loading
                        ? "Processing..."
                        : "GENERATE OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mt-[1em] mb-[1em]">
                      <label className="block text-white font-[600] mb-2">
                        Enter OTP sent to {mobile}
                      </label>
                      <input
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="w-full px-4 py-3 h-[39px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="6 digit OTP"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={otpExpired ? handleResendOtp : handleVerifyOtp}
                      disabled={loading || (!otpExpired && otp.length !== 6)}
                      className="mt-2 w-full bg-[#C90] text-white font-bold text-[16px] p-[9px] transition disabled:opacity-50"
                    >
                      {loading
                        ? otpExpired
                          ? "Sending..."
                          : "Verifying..."
                        : otpExpired
                          ? "RESEND OTP"
                          : "VERIFY OTP & LOGIN"}
                    </button>
                    {otpExpired && (
                      <p className="text-amber-300 text-sm mt-2">
                        OTP expired. Click "RESEND OTP" to continue.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        clearOtpCookies();
                        setStep("mobile");
                        setOtp("");
                        setInfo("");
                        setClientError("");
                        dispatch(clearAuthError());
                      }}
                      className="mt-3 w-full bg-gray-600 text-white font-bold text-[14px] p-[9px]"
                    >
                      CHANGE MOBILE
                    </button>
                  </>
                )}
                {info ? (
                  <p className="text-emerald-300 text-sm mt-3">{info}</p>
                ) : null}
                {displayError ? (
                  <p className="text-rose-300 text-sm mt-3">{displayError}</p>
                ) : null}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default MobileOtpLogin;
