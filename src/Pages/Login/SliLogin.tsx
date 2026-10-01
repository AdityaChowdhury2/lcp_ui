import React, { FC, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  clearAuthError,
  sendSliOtp,
  verifySliOtp,
} from "@/store/authSlice";
import type { User } from "@/types/auth";
import {
  APPLICANT_ROLES,
  CTU_ROLES,
  OFFICER_ROLES,
} from "@/routing/roleGroups";
import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
import { FileText } from "lucide-react";

/* ---------- Error Bubble ---------- */
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

/* ---------- Right column content ---------- */
interface DocLink {
  text: string;
  link: string;
}

const downloads: DocLink[] = [
  {
    text: "ADCS and PGDHRD&LW course - Detailed advertisement & guidelines for admission 2025-26",
    link: `${FRONTEND_BASE}/sites/default/files/contentpdf/1752582124BROCHURE_merged.pdf`,
  },
];

const results: DocLink[] = [];

const notices: DocLink[] = [];

/* Examination related instructions shown to every candidate */
const instructions: string[] = [
  "Two courses are offered — PG Diploma in Human Resource Development & Labour Welfare (PGDHRD&LW) and Advanced Diploma in Construction Safety (ADCS). Read the detailed advertisement & guidelines in the Download section before applying.",
  "Choice of centre: PGDHRD&LW is conducted at Kolkata, Siliguri and Asansol; ADCS is conducted at Kolkata and Asansol only. The centre once chosen cannot be changed.",
  "Log in with the mobile number given in the application form. A One Time Password is sent to that number, so keep it active throughout the admission process. The OTP is valid for a limited period — use RESEND OTP if it expires.",
  "Application Fee of Rs.100/- (non-refundable) must be paid online to the account shown alongside. The transaction ID, date of payment and the bank counterfoil are mandatory in the application form.",
  "Keep ready before you apply: passport size photograph (JPG/JPEG, max 70KB) and PDF copies (max 300KB each) of date of birth proof, address proof, final marksheet/certificate and the bank payment counterfoil. Caste certificate is required for SC/ST/OBC candidates and an employer's sponsorship / no-objection certificate for sponsored candidates.",
  "Selection is made through a written Admission Test followed by an Interview at the chosen centre. Separate merit lists are drawn up for sponsored and non-sponsored candidates.",
  "Admit cards are issued online. Log in with your registered mobile number, download the admit card and carry a printout along with a valid photo identity card to the examination hall.",
  "Report at the examination centre at least 30 minutes before the reporting time printed on the admit card. Mobile phones, calculators and other electronic devices are not allowed inside the examination hall.",
  "Incomplete applications, illegible documents or applications without proof of fee payment are liable to be rejected without further reference.",
  "Results of the Admission Test and Interview are published in the Result section of this page and are also intimated to the registered mobile number.",
];

/* ---------- Right column blocks ---------- */
const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h2 className="text-[#cfb264] font-bold text-[20px] border-b border-[#cfb264]/40 pb-1 mb-3">
      {title}
    </h2>
    {children}
  </div>
);

const DocList: FC<{ items: DocLink[]; emptyText: string }> = ({
  items,
  emptyText,
}) => {
  if (!items.length) {
    return <p className="text-gray-400 text-[13px] italic">{emptyText}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2">
          <FileText size={14} className="text-[#cfb264] shrink-0 mt-0.5" />
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold text-gray-200 hover:text-[#cfb264] hover:underline leading-snug"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
};

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

const SliLogin: FC = () => {
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
    const result = await dispatch(sendSliOtp({ mobile: values.mobile }));
    if (sendSliOtp.fulfilled.match(result)) {
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
    const result = await dispatch(sendSliOtp({ mobile }));
    if (sendSliOtp.fulfilled.match(result)) {
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

    const result = await dispatch(
      verifySliOtp({
        mobile: cookieMobile,
        otp,
        encryptedOtp: encOtp,
        expiresAt: exp,
      }),
    );

    if (verifySliOtp.fulfilled.match(result)) {
      clearOtpCookies();
      const user =
        result.payload.user ??
        (result.payload.data as { user?: User } | undefined)?.user;

      const role = Number(user?.role);
      if (role === 8 && (user?.isSliApplicant || user?.name?.startsWith("sli_"))) {
        // Redirect to SLI Admission application list directly
        navigate("/sli-admission/list");
      } else {
        // Fallback to standard routes
        if (role === 11) navigate("/trade-union-dashboard");
        else if (role === 15) navigate("/min-wages/scheduled-employment");
        else if (role === 16) navigate("/trade-union/trade-federation-annual-return-form");
        else if (role === 28) navigate("/bocwcess/admin");
        else if (OFFICER_ROLES.includes(role)) navigate("/dashboard");
        else if (CTU_ROLES.includes(role)) navigate("/central-trade-union-annual-return-list");
        else navigate("/applicant-dashboard");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-8 relative overflow-hidden bg-cover"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}images/loginbg.jpg)`,
      }}
    >
      <div className="relative bg-[rgba(0,0,0,0.68)] shadow-2xl w-full max-w-6xl">
        <h1 className="p-0 bg-[#cfb264] text-center text-black uppercase leading-[60px] text-[24px] mt-0 font-bold px-2">
          SLI ADMISSION LOGIN
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] gap-8 p-6 md:p-8">
          {/* ---------- LEFT : LOGIN ---------- */}
          <div>
            <div className="bg-white px-4 py-3 flex items-center rounded-sm">
              <img
                src={`${IMAGE_BASE}lc_logo.png`}
                alt="Labour Commissionerate, Government of West Bengal"
                className="h-14 w-auto object-contain"
              />
            </div>

            <h2 className="text-white font-bold text-[24px] mt-5">
              Online Admission <span className="text-[#cfb264]">Login</span>
            </h2>
            <p className="text-gray-300 text-[13px] mt-1">
              We will send you a{" "}
              <span className="font-bold text-white">One Time Password</span> on
              your valid mobile number
            </p>

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
                        Enter Registered Mobile Number{" "}
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

            {/* Application fee & bank details */}
            <div className="mt-6 border border-[#cfb264]/40 bg-black/30 p-4">
              <p className="text-[#e07b39] text-[12px] leading-relaxed">
                Application Fee (Non Refundable): Rs.100/- Candidates are
                required to pay the application fee amounting to Rs.100/- in
                favour of the State Labour Institute through an online mode of
                payment in the following account.
              </p>
              <div className="mt-3 text-white text-[12px] font-bold leading-relaxed text-center">
                <p>Name of the Account: Director, State Labour Institute.</p>
                <p>Account No: 0263104000061375.</p>
                <p>Bank &amp; Branch: IDBI Bank, Kankurgachi Branch.</p>
                <p>IFSC Code: IBKL0000263.</p>
              </div>
            </div>

            <div className="mt-6 text-center border-t border-gray-600 pt-4">
              <span className="text-gray-300 text-sm">New Candidate? </span>
              <Link
                to="/sli-admission/apply-public"
                className="text-[#cfb264] hover:underline font-bold text-sm"
              >
                Apply For Examination
              </Link>
            </div>
          </div>

          {/* ---------- RIGHT : INSTRUCTIONS & DOCUMENTS ---------- */}
          <div className="space-y-7">
            <Section title="Instructions for Candidates">
              <ol className="list-decimal pl-5 space-y-2 text-[13px] text-gray-200 leading-snug marker:text-[#cfb264] marker:font-bold">
                {instructions.map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ol>
            </Section>

            <Section title="Download">
              <DocList
                items={downloads}
                emptyText="No document available for download at present."
              />
            </Section>

            <Section title="Result">
              <DocList
                items={results}
                emptyText="Results will be published here as and when declared."
              />
            </Section>

            <Section title="Notice">
              <DocList
                items={notices}
                emptyText="No notice published at present."
              />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliLogin;
