import { IMAGE_BASE } from "@/constants/constants";
import React, { FC } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

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

/* ---------- Validation ---------- */
const validationSchema = Yup.object({
    hrms: Yup.string()
        .required("This field is required")
        .matches(/^[0-9]{10}$/, "HRMS Id must be of 10 digits"),
});

const initialValues = {
    hrms: "",
};

/* ---------- Page ---------- */
const HrmsLogin: FC = () => {
    const handleSubmit = async (values: typeof initialValues) => {
        console.log("Send OTP to:", values.hrms);

        // API call will go here later
        // await dispatch(sendOtp(values.hrms))
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[url('${IMAGE_BASE}loginbg.jpg')] bg-cover`}>
            <style>{`
        .login-card { width: 90%; }
        @media (min-width: 768px) and (max-width: 980px) {
          .login-card { width: 80%; }
        }
        @media (min-width: 981px) {
          .login-card { width: 500px; }
        }
      `}</style>

            <div className="relative bg-[rgba(0,0,0,0.68)] shadow-2xl w-full login-card">
                {/* Header */}
                <h1 className="p-0 bg-[#cfb264] text-center text-black uppercase leading-[60px] text-[28px] mt-0 font-bold">
                    AUTHENTICATE
                </h1>

                <div className="p-8">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form noValidate>
                                {/* HRMS */}
                                <div className="mt-[1em] mb-[1em]">
                                    <label className="block text-white font-[600] mb-2">
                                        Enter Your Employee Id (HRMS){" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <Field
                                        name="hrms"
                                        type="text"
                                        maxLength={10}
                                        className="w-full px-4 py-3 h-[39px] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="XXXXXXXXXX"
                                    />

                                    <ErrorMessage name="hrms">
                                        {(msg) => <ErrorBubble>{msg}</ErrorBubble>}
                                    </ErrorMessage>
                                </div>

                                {/* Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-6 w-full bg-[#C90] text-white font-bold text-[16px] p-[9px] transition disabled:opacity-50"
                                >
                                    {isSubmitting ? "Processing..." : "GENERATE OTP"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {/* Help Desk badge (same as login page) */}
            {/* <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-8 rounded-l-lg shadow-lg writing-mode-vertical-rl rotate-180">
                <span className="font-bold text-lg tracking-widest">HELP DESK</span>
            </div> */}
        </div>
    );
};

export default HrmsLogin;
