// src/components/LoginModal.tsx
import React, { type FC, useState, useEffect, useRef } from "react";
import { FaRegEye, FaSync } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser, logout } from "../../store/authSlice";
import type { RootState, AppDispatch } from "../../store/store";
import {
  OFFICER_ROLES,
  APPLICANT_ROLES,
  CTU_ROLES,
} from "@/routing/roleGroups";
import { hasValidAuthSession } from "@/utils/auth";
// ---- Types ----
interface LoginFormValues {
  username: string;
  password: string;
  captchaInput: string;
}

interface ServerErrorPayload {
  errors?: Record<string, string | string[]>;
  message?: string;
  [key: string]: unknown;
}

interface ErrorBubbleProps {
  children: React.ReactNode;
}

interface LoginModalProps {
  loginType: "user" | "staff";
}

// ---- Helpers ----
function generateCaptcha(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}

const ErrorBubble: FC<ErrorBubbleProps> = ({ children }) => (
  <div className="inline-block mt-2 relative">
    <div className=" bg-[#ee0101] relative z-5001 text-white w-[150px] font-[tahoma] text-[11px] shadow-[0_0_6px_#000] px-2.5 py-1 rounded-[6px] border-[#ddd] border-2 ">
      {children}
    </div>
    {/* little pointer */}
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

// Map server errors → Formik setErrors
function mapServerErrorsToFormik(
  serverPayload: ServerErrorPayload | undefined,
  setErrors: (errors: Partial<Record<keyof LoginFormValues, string>>) => void,
) {
  if (!serverPayload) return;

  if (serverPayload.errors && typeof serverPayload.errors === "object") {
    const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};

    Object.entries(serverPayload.errors).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        fieldErrors[key as keyof LoginFormValues] = val.join(" ");
      } else if (typeof val === "string") {
        fieldErrors[key as keyof LoginFormValues] = val;
      }
    });

    setErrors(fieldErrors);
  }
}

// ---- Component ----
const LoginModal: FC<LoginModalProps> = ({ loginType }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  // const auth = useSelector<RootState, RootState["auth"]>((state) => state.auth);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const captchaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const refreshCaptcha = () => setCaptcha(generateCaptcha());

  useEffect(() => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(80, 60, 30, ${0.08 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const fontSize = Math.floor(h * 0.58);
    ctx.font = `bold ${fontSize}px Verdana, sans-serif`;

    const spacing = w / (captcha.length + 1);
    for (let i = 0; i < captcha.length; i++) {
      const ch = captcha[i];
      const x = spacing * (i + 1);
      const y = h / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() - 0.5) * 0.45;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgb(${40 + Math.random() * 90}, ${30 + Math.random() * 70}, ${20 + Math.random() * 40
        })`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }, [captcha]);

  // Redirect when logged in based on role
  useEffect(() => {
    const hasValidSession = hasValidAuthSession();

    // If redux says logged-in but storage session is missing/invalid,
    // clear stale auth state to avoid login <-> dashboard redirect loops.
    if (auth.user && !hasValidSession) {
      dispatch(logout());
      return;
    }

    if (
      hasValidSession &&
      auth.status === "succeeded" &&
      auth.user &&
      auth.user.role != null
    ) {
      const role = Number(auth.user.role);
      if (!Number.isFinite(role)) {
        navigate("/");
        return;
      }

      // Find matching role ids in our role groups so `switch` cases are numbers, not booleans
      const officerMatch = OFFICER_ROLES.find((r) => r === role);
      const applicantMatch = APPLICANT_ROLES.find((r) => r === role);
      const ctuMatch = CTU_ROLES.find((r) => r === role);

      switch (role) {
        case 11: // Trade Union Admin
          navigate("/trade-union-dashboard");
          break;
        case 15: // STATISTICS — minimum wages module
          navigate("/min-wages/scheduled-employment");
          break;
        case 23: // SLI Admin
          navigate("/sli-admin/dashboard");
          break;
        case 28: // BOCWADMIN - BOCW Cess Portal Admin
          navigate("/bocwcess/admin");
          break;
        case officerMatch as number:
          navigate("/dashboard");
          break;
        case 16: // TUAPPLICANT - Trade Union Applicant
          navigate("/trade-union/trade-federation-annual-return-form");
          break;
        case ctuMatch as number:
          navigate("/central-trade-union-annual-return-list");
          break;
        case applicantMatch as number:
          navigate("/applicant-dashboard");
          break;
        default:
          navigate("/");
          break;
      }
    }
  }, [auth.status, auth.user, dispatch, navigate]);

  const validationSchema = Yup.object().shape({
    username: Yup.string().trim().required("* This field is required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
    captchaInput: Yup.string()
      .required("* This field is required")
      .test("match-captcha", "Captcha does not match", function (value) {
        if (!value) return false;
        return value.toString().trim().toUpperCase() === captcha.toUpperCase();
      }),
  });

  const initialValues: LoginFormValues = {
    username: "",
    password: "",
    captchaInput: "",
  };

  const handleSubmit = async (
    _values: LoginFormValues,
    { setSubmitting, setErrors, resetForm }: FormikHelpers<LoginFormValues>,
  ) => {
    setSubmitting(true);

    try {
      /*
      =====================================
      LOGIN API CALL
      =====================================
      */
      const response = await dispatch(
        loginUser({
          name: _values.username,
          password: _values.password,
        }),
      ).unwrap();

      /*
      =====================================
      SUCCESS TOAST
      =====================================
      */

      toast.success("Login successful");

      resetForm();
      setCaptcha(generateCaptcha());

      console.log(response);
    } catch (err: any) {
      console.error(err);

      /*
      =====================================
      FORM FIELD ERRORS
      =====================================
      */

      mapServerErrorsToFormik(err as ServerErrorPayload, setErrors);

      /*
      =====================================
      API ERROR MESSAGE
      =====================================
      */

      toast.error(err?.message || "Invalid username or password.");

      /*
      =====================================
      REFRESH CAPTCHA
      =====================================
      */

      setCaptcha(generateCaptcha());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[url('${IMAGE_BASE}loginbg.jpg')] bg-cover `}>
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

      {/* Login Card */}
      <div className="relative bg-[rgba(0,0,0,0.68)] shadow-2xl w-full login-card">
        <h1 className="p-0 bg-[#cfb264] text-center text-black uppercase leading-[60px] text-[28px] mt-0 font-bold">
          {loginType === "staff" ? "STAFF LOGIN" : "USER LOGIN"}
        </h1>

        <div className="p-8 space-y-6">
          <Formik<LoginFormValues>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5" noValidate>
                {/* Username */}
                <div className="mt-[1em] mb-[1em]">
                  <label className="block text-white font-semibold mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="username"
                    type="text"
                    className="w-full px-4 py-3 h-[39px] bg-white text-gray-800 focus:outline-none focus:ring-2"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                  <ErrorMessage name="username">
                    {(msg) => <ErrorBubble>{msg}</ErrorBubble>}
                  </ErrorMessage>
                  <p className="italic text-[0.85em] text-[#d1d1d1]">
                    Enter your username
                  </p>
                </div>

                {/* Password */}
                <div className="relative mt-[1em] mb-[1em]">
                  <label className="block text-white font-semibold mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 h-[39px] bg-white text-gray-800 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter your password"
                    autoComplete="password"
                  />
                  <ErrorMessage name="password">
                    {(msg) => <ErrorBubble>{msg}</ErrorBubble>}
                  </ErrorMessage>
                  <p className="italic text-[0.85em] text-[#d1d1d1]">
                    Enter the password that accompanies your username.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-11 text-gray-600 hover:text-gray-800"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <FaRegEye size={20} className="text-[#523718]" />
                  </button>
                </div>

                {/* CAPTCHA */}
                <div className="mt-[1em] mb-[1em]">
                  <label className="block text-white font-semibold mb-2">
                    Type The Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Field
                      name="captchaInput"
                      type="text"
                      autoComplete="off"
                      className="w-full sm:flex-1 px-4 py-3 h-[39px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter the captcha"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <canvas
                        ref={captchaCanvasRef}
                        width={170}
                        height={52}
                        className="h-[52px] w-[170px] border-2 border-[#8a5a2b] bg-[#f5f0e6] shadow-inner"
                        aria-hidden
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="flex h-[52px] w-[44px] items-center justify-center border-2 border-[#8a5a2b] bg-[#5a3206] text-[#e1d4b0] hover:bg-[#6d3f08] transition"
                        aria-label="Refresh CAPTCHA"
                        title="Refresh code"
                      >
                        <FaSync size={18} />
                      </button>
                    </div>
                  </div>
                  <ErrorMessage name="captchaInput">
                    {(msg) => <ErrorBubble>{msg}</ErrorBubble>}
                  </ErrorMessage>
                  <p className="italic text-[0.85em] text-[#d1d1d1] mt-2">
                    Enter the characters shown in the image (not case-sensitive).
                  </p>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-[#C90] text-white font-bold text-[18px] p-[9px] transition transform disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "LOG IN"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Footer Links */}
          <div className="w-full">
            {loginType === "user" && (
              <p
                onClick={() => navigate("/applicant-register")}
                className="block w-full md:inline-block md:w-auto bg-[#6f6f6f] p-2.5 text-white mr-5 text-[14px] text-center cursor-pointer"
              >
                New Registration
              </p>
            )}

            <p
              onClick={() => navigate("/forgot-password")}
              className="block w-full md:inline-block md:w-auto text-white text-[13px] text-center my-2.5 cursor-pointer"
            >
              Forgot your password?
            </p>

            {/* {loginType === "user" && (
              <p
                onClick={() => navigate("/find-user-details")}
                className="block w-full md:inline-block md:w-auto text-white text-[13px] text-center float-right my-2.5 cursor-pointer"
              >
                Forgot Account Details?
              </p>
            )} */}
          </div>
        </div>
      </div>

      {/* Help Desk Badge */}
      {/* <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-8 rounded-l-lg shadow-lg writing-mode-vertical-rl rotate-180">
        <span className="font-bold text-lg tracking-widest">HELP DESK</span>
      </div> */}
    </div>
  );
};

export default LoginModal;
