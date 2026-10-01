import { getAuthToken } from "../../../utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { encryptionDecryptionFun } from "../../../utils/encryption"
import { Form, Formik, FormikProps } from "formik";
import { API_BASE } from "@/constants/constants";
/* =======================
   PART 1 – COMPONENT
======================= */
interface ApplicantFormValues {
    // This form uses many fields coming from backend context.
    // We keep the type flexible to avoid repetitive boilerplate and to
    // prevent TS errors when `initialValues` and `values.*` include many keys.
    [key: string]: any;

    payment_for: string;
    classification_sector: string[];
}

const TradeUnionAnnualReturnFullPage: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const regNo = location?.state?.regNo;
    const returnYear = location?.state?.returnYear;
    const token = getAuthToken() ?? null;

    const [contextDetails, setContextDetails] = useState<any>(null);

    const encRegNo = encryptionDecryptionFun("encrypt", String(regNo));
    const encYear = encryptionDecryptionFun("encrypt", String(returnYear));

    useEffect(() => {
        getTUAnnualReturnFormDatas()
    }, [])

    const getTUAnnualReturnFormDatas = async () => {
        try {
            const res = await axios.get(`${API_BASE}trade-union/annual-return/form-context`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    encryptedRegId: encRegNo,
                    encryptedReturnYear: encYear,
                },

            })

            console.log(res);
            setContextDetails(res.data)
        }
        catch (err: any) {
            console.log(err);

        }
    }

    const formatDateDisplay = (dateVal: any) => {
        if (!dateVal) return 'Not Found';
        const num = Number(dateVal);
        if (!isNaN(num) && num > 0) {
            const ms = num < 10000000000 ? num * 1000 : num;
            return new Date(ms).toLocaleDateString("en-GB");
        }
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? 'Not Found' : d.toLocaleDateString("en-GB");
    };

    const formatDateForInput = (date?: string) => {
        if (!date) return "";
        return date.split("T")[0]; // YYYY-MM-DD
    };

    const MAX_FILE_SIZE = 50 * 1024; // 50KB
    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => {
                const result = reader.result as string;

                // remove data:image/png;base64,
                const base64String = result.split(",")[1];

                resolve(base64String);
            };

            reader.onerror = (error) => reject(error);
        });
    };

    const handleSignatureUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: any,
        base64Field: string,
        fileNameField: string
    ) => {
        try {
            const file = e.target.files?.[0];

            if (!file) return;

            // Validate type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                alert("Only JPG, JPEG and PNG files are allowed");

                e.target.value = "";

                setFieldValue(base64Field, "");
                setFieldValue(fileNameField, "");

                return;
            }

            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                alert("File size must be maximum 50KB");

                e.target.value = "";

                setFieldValue(base64Field, "");
                setFieldValue(fileNameField, "");

                return;
            }

            // Convert to base64
            const base64 = await convertFileToBase64(file);

            // Store in formik
            setFieldValue(base64Field, base64);
            setFieldValue(fileNameField, file.name);
        } catch (err) {
            console.log(err);
            alert("Failed to process file");
        }
    };


    return (
        <Formik
            enableReinitialize
            validate={(values) => {
                const errors: Record<string, string> = {};

                // 1. Whether Affiliated
                if (!values.whether_affilited) {
                    errors.whether_affilited = "Whether Affiliated selection is required";
                } else if (values.whether_affilited === "1") {
                    if (!values.what_affilited) {
                        errors.what_affilited = "Affiliation type is required";
                    }
                    if (!values.affiliation_name || String(values.affiliation_name).trim() === "") {
                        errors.affiliation_name = "Affiliation name is required";
                    }
                    if (!values.affiliation_number || String(values.affiliation_number).trim() === "") {
                        errors.affiliation_number = "Number of All-India Body/Federation is required";
                    }
                    if (!values.no_payment || String(values.no_payment).trim() === "") {
                        errors.no_payment = "Challan number is required";
                    }
                    if (!values.date_payment || String(values.date_payment).trim() === "") {
                        errors.date_payment = "Challan date is required";
                    }
                }

                // 2. Classification of Sector
                const sector = values.classification_sector;
                const isSectorEmpty = Array.isArray(sector)
                    ? sector.length === 0
                    : !sector || String(sector).trim() === "";
                if (isSectorEmpty) {
                    errors.classification_sector = "Classification of Sector is required";
                }

                // 3. Payment For
                if (!values.payment_for || String(values.payment_for).trim() === "") {
                    errors.payment_for = "Payment For is required";
                }

                // 4. Membership Fee (5.)
                if (values.number_affiliated === undefined || values.number_affiliated === null || String(values.number_affiliated).trim() === "") {
                    errors.number_affiliated = "Membership fee is required";
                }

                // 5. Members opening (6.)
                if (values.no_members === undefined || values.no_members === null || String(values.no_members).trim() === "") {
                    errors.no_members = "Number of members at beginning of year is required";
                }

                // 6. Members admitted (7.)
                if (values.no_members_admitted === undefined || values.no_members_admitted === null || String(values.no_members_admitted).trim() === "") {
                    errors.no_members_admitted = "Number of members admitted is required";
                }

                // 7. Members left (8.)
                if (values.no_members_left === undefined || values.no_members_left === null || String(values.no_members_left).trim() === "") {
                    errors.no_members_left = "Number of members who left is required";
                }

                // 8. Male & Female count
                if (values.male === undefined || values.male === null || String(values.male).trim() === "") {
                    errors.male = "Male members count is required";
                }
                if (values.female === undefined || values.female === null || String(values.female).trim() === "") {
                    errors.female = "Female members count is required";
                }

                // 9. Total amount of contribution (10.)
                if (values.members_contribution === undefined || values.members_contribution === null || String(values.members_contribution).trim() === "") {
                    errors.members_contribution = "Total contribution count is required";
                }

                // 10. Arrear fields (12. & 13.)
                if (values.arrear_less === undefined || values.arrear_less === null || String(values.arrear_less).trim() === "") {
                    errors.arrear_less = "Number of members in arrear (<=3 months) is required";
                }
                if (values.arrear_less_total === undefined || values.arrear_less_total === null || String(values.arrear_less_total).trim() === "") {
                    errors.arrear_less_total = "Number of members in arrear (>3 months) is required";
                }

                // 11. Industry recognition (14.)
                if (!values.federation_recognised_industry) {
                    errors.federation_recognised_industry = "Industry recognition choice is required";
                }

                // 12. Bipartite agreements (15.)
                if (values.no_bipartite === undefined || values.no_bipartite === null || String(values.no_bipartite).trim() === "") {
                    errors.no_bipartite = "Number of bipartite agreements is required";
                }

                // 13. Disputes (16.)
                if (values.indus_dis === undefined || values.indus_dis === null || String(values.indus_dis).trim() === "") {
                    errors.indus_dis = "Industrial Disputes count is required";
                }
                if (values.pay_wag === undefined || values.pay_wag === null || String(values.pay_wag).trim() === "") {
                    errors.pay_wag = "Payment of Wages count is required";
                }
                if (values.min_wag === undefined || values.min_wag === null || String(values.min_wag).trim() === "") {
                    errors.min_wag = "Minimum Wages count is required";
                }
                if (values.workmen_com === undefined || values.workmen_com === null || String(values.workmen_com).trim() === "") {
                    errors.workmen_com = "Workmens Compensation count is required";
                }
                if (values.emp_state === undefined || values.emp_state === null || String(values.emp_state).trim() === "") {
                    errors.emp_state = "ESI count is required";
                }

                // 14. Officers resigned / consent joined (17. & 18.)
                if (!values.resigned_officers) {
                    errors.resigned_officers = "Resigned officers selection is required";
                }
                if (!values.consent_officers_joined) {
                    errors.consent_officers_joined = "Consent of officers joined selection is required";
                }

                // 15. Signatures
                if (!values.sec_sign && !contextDetails?.data?.signatures?.secSign) {
                    errors.sec_sign = "Secretary signature is required";
                }
                if (!values.e_sign && !contextDetails?.data?.signatures?.eSign) {
                    errors.e_sign = "Treasurer signature is required";
                }

                // 16. Applicant details
                if (!values.applicant_name || String(values.applicant_name).trim() === "") {
                    errors.applicant_name = "Applicant name is required";
                }
                if (!values.applicant_mobile || String(values.applicant_mobile).trim() === "") {
                    errors.applicant_mobile = "Applicant mobile is required";
                }

                return errors;
            }}
            initialValues={{
                whether_affilited: contextDetails?.data?.affiliation?.whetherAffilited !== undefined
                    ? String(contextDetails.data?.affiliation.whetherAffilited)
                    : "",
                what_affilited:
                    contextDetails?.data?.affiliation?.whatAffilited
                        ? contextDetails.data?.affiliation.whatAffilited.toLowerCase()
                        : "",
                payment_for: contextDetails?.data?.payment?.paymentFor ?? "",
                classification_sector:
                    Array.isArray(contextDetails?.data?.classificationSector)
                        ? contextDetails.data?.classificationSector
                        : [],
                // affiliation_name_other: "",
                // affiliation_name: "Deep",
                affiliation_name: contextDetails?.data?.affiliation?.affiliationName
                    !== undefined
                    ? String(contextDetails?.data?.affiliation?.affiliationName)
                    : "",
                // affiliation_name_other: 
                //     String(contextDetails?.data?.affiliation?.affiliationNameOther) ?? "",
                affiliation_number: contextDetails?.data?.affiliation?.affiliationNumber
                    !== undefined
                    ? String(contextDetails.data?.affiliation.affiliationNumber)
                    : "",
                no_payment: contextDetails?.data?.payment?.challanNumber
                    !== undefined
                    ? contextDetails.data?.payment?.challanNumber
                    : "",
                date_payment: contextDetails?.data?.payment?.challanDate
                    !== undefined
                    ? formatDateForInput(
                        contextDetails?.data?.payment?.challanDate
                    ) : "",
                number_affiliated: contextDetails?.data?.payment?.membershipAmount
                    !== undefined
                    ? formatDateForInput(
                        contextDetails?.data?.payment?.membershipAmount
                    ) : "",
                no_members: contextDetails?.data?.members?.opening
                    !== undefined
                    ?
                    contextDetails?.data?.members?.opening
                    : "",
                no_members_admitted: contextDetails?.data?.members?.admitted
                    !== undefined
                    ?
                    contextDetails?.data?.members?.admitted
                    : "",
                no_members_left: contextDetails?.data?.members?.left
                    !== undefined
                    ?
                    contextDetails?.data?.members?.left
                    : "",
                male: contextDetails?.data?.members?.male
                    !== undefined
                    ?
                    contextDetails?.data?.members?.male
                    : "",
                female: contextDetails?.data?.members?.female
                    !== undefined
                    ?
                    contextDetails?.data?.members?.female
                    : "",
                total: contextDetails?.data?.members?.total
                    !== undefined
                    ?
                    contextDetails?.data?.members?.total
                    : "",
                members_contribution: contextDetails?.data?.members?.politicalContribution
                    !== undefined
                    ?
                    contextDetails?.data?.members?.politicalContribution
                    : "",
                arrear_less: contextDetails?.data?.members?.arrearLess3Months
                    !== undefined
                    ?
                    contextDetails?.data?.members?.arrearLess3Months
                    : "",
                arrear_less_total: contextDetails?.data?.members?.arrearMore3Months
                    !== undefined
                    ?
                    contextDetails?.data?.members?.arrearMore3Months
                    : "",
                federation_recognised_industry: contextDetails?.data?.recognition?.recognisedByIndustry
                    !== undefined
                    ?
                    contextDetails?.data?.recognition?.recognisedByIndustry === "Yes" ? "1" : "0"
                    : "",
                no_bipartite: contextDetails?.data?.recognition?.bipartiteAgreements
                    !== undefined
                    ?
                    contextDetails?.data?.recognition?.bipartiteAgreements
                    : "",
                indus_dis: contextDetails?.data?.disputes?.industrialDisputes
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.industrialDisputes
                    : "",
                pay_wag: contextDetails?.data?.disputes?.paymentOfWages
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.paymentOfWages
                    : "",
                min_wag: contextDetails?.data?.disputes?.minimumWages
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.minimumWages
                    : "",
                workmen_com: contextDetails?.data?.disputes?.workmenCompensation
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.workmenCompensation
                    : "",
                emp_state: contextDetails?.data?.disputes?.esi
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.esi
                    : "",
                any_other_act_detail: contextDetails?.data?.disputes?.otherActName
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.otherActName
                    : "",
                any_other_act: contextDetails?.data?.disputes?.otherActCount
                    !== undefined
                    ?
                    contextDetails?.data?.disputes?.otherActCount
                    : "",
                resigned_officers:
                    contextDetails?.data?.officers?.resigned !== undefined
                        ? String(contextDetails.data.officers.resigned)
                        : "",
                consent_officers_joined:
                    contextDetails?.data?.officers?.consentJoined !== undefined
                        ? String(contextDetails.data.officers.consentJoined)
                        : "",
                sec_sign: contextDetails?.data?.signatures?.secSign ?? "",
                e_sign: contextDetails?.data?.signatures?.eSign ?? "",
                sec_sign_file_name: contextDetails?.data?.signatures?.secSignFileName ?? "",
                e_sign_file_name: contextDetails?.data?.signatures?.eSignFileName ?? "",
                applicant_name: contextDetails?.data?.applicant?.name !== undefined
                    ? contextDetails.data.applicant?.name
                    : "",

                applicant_mobile: contextDetails?.data?.applicant?.mobile !== undefined
                    ? contextDetails.data.applicant?.mobile
                    : "",
            }}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                try {
                    const parseCount = (input: unknown): number => {
                        const digits = String(input ?? "").replace(/\D/g, "");
                        if (!digits) return 0;
                        const parsed = Number(digits);
                        return Number.isFinite(parsed) ? parsed : 0;
                    };

                    // 🔹 Validate that 6,7,8 tallies with 9 (Total)
                    const openingMembers = parseCount(values.no_members); // 6
                    const admittedMembers = parseCount(values.no_members_admitted); // 7
                    const leftMembers = parseCount(values.no_members_left); // 8
                    const expectedClosingMembers =
                        openingMembers + admittedMembers - leftMembers;
                    const totalFromField9 = parseCount(values.total);
                    const maleCount = parseCount(values.male);
                    const femaleCount = parseCount(values.female);
                    const genderTotal = maleCount + femaleCount;

                    if (
                        (openingMembers !== 0 ||
                            admittedMembers !== 0 ||
                            leftMembers !== 0) &&
                        expectedClosingMembers !== totalFromField9
                    ) {
                        setFieldError(
                            "total",
                            "Total must be equal to: (6. Opening members) + (7. Admitted during year) - (8. Left during year)."
                        );
                        setSubmitting(false);
                        return;
                    }

                    // 🔹 Validate that 9 (Total) equals Male + Female
                    if (totalFromField9 !== 0 && totalFromField9 !== genderTotal) {
                        setFieldError(
                            "total",
                            "Total must be equal to: Male members + Female members."
                        );
                        setSubmitting(false);
                        return;
                    }

                    // 🔹 Build payload exactly as backend expects
                    const payload = {
                        ...values,
                    }
                    // 🔥 If NOT affiliated → force empty values
                    if (values.whether_affilited === "0") {
                        payload.what_affilited = "";
                        payload.affiliation_name = "";
                        // payload.affiliation_name_other = "";
                        payload.affiliation_number = "";
                    }

                    // console.log("PAYLOAD TO SUBMIT", payload);

                    // return;

                    const res = await axios.post(
                        `${API_BASE}trade-union/annual-return/save-and-continue`,
                        payload,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            params: {
                                encryptedRegId: encRegNo,
                                encryptedReturnYear: encYear,
                            },
                        }
                    );

                    console.log("API RESPONSE ✅", res.data);

                    console.log(res);
                    if (res.data?.status === "SUCCESS") {
                        navigate('/trade-union/annual-upload-documents', {
                            state: {
                                regNo,
                                returnYear
                            }
                        })
                    }
                    // alert("Saved successfully");
                } catch (error) {
                    console.error("SUBMIT ERROR ❌", error);
                    alert("Failed to save data");
                } finally {
                    setSubmitting(false);
                }
            }}
        >

            {({ values, setFieldValue, handleChange, isSubmitting, errors, touched, setFieldError, submitCount }) => (
                <Form>
                    {(() => {
                        const renderError = (field: string) => {
                            const err = (errors as any)[field];
                            const touch = (touched as any)[field];
                            if (err && (touch || submitCount > 0)) {
                                return <p className="text-red-600 text-xs mt-1 font-semibold">{String(err)}</p>;
                            }
                            return null;
                        };

                        const parseCount = (input: unknown): number => {
                            const digits = String(input ?? "").replace(/\D/g, "");
                            if (!digits) return 0;
                            const parsed = Number(digits);
                            return Number.isFinite(parsed) ? parsed : 0;
                        };

                        const handleMemberGenderCountChange = (
                            field: "male" | "female",
                            rawValue: string
                        ) => {
                            const sanitized = rawValue.replace(/\D/g, "");
                            setFieldValue(field, sanitized);

                            const openingMembers = parseCount(values.no_members);
                            const admittedMembers = parseCount(values.no_members_admitted);
                            const leftMembers = parseCount(values.no_members_left);
                            const expectedClosingMembers =
                                openingMembers + admittedMembers - leftMembers;

                            const maleCount = parseCount(
                                field === "male" ? sanitized : String(values.male ?? "")
                            );
                            const femaleCount = parseCount(
                                field === "female" ? sanitized : String(values.female ?? "")
                            );
                            const genderTotal = maleCount + femaleCount;
                            const totalFromField9 = parseCount(values.total);

                            // Clear previous error first
                            setFieldError("total", "");

                            if (
                                (openingMembers !== 0 ||
                                    admittedMembers !== 0 ||
                                    leftMembers !== 0) &&
                                expectedClosingMembers !== totalFromField9
                            ) {
                                setFieldError(
                                    "total",
                                    "Total must be equal to: (6. Opening members) + (7. Admitted during year) - (8. Left during year)."
                                );
                            } else if (totalFromField9 !== genderTotal) {
                                setFieldError(
                                    "total",
                                    "Total must be equal to: Male members + Female members."
                                );
                            }
                        };

                        const handleMembersChange = (
                            field: "no_members" | "no_members_admitted" | "no_members_left",
                            rawValue: string
                        ) => {
                            const sanitized = rawValue.replace(/\D/g, "");
                            setFieldValue(field, sanitized);

                            const opening = field === "no_members" ? sanitized : String(values.no_members ?? "");
                            const admitted = field === "no_members_admitted" ? sanitized : String(values.no_members_admitted ?? "");
                            const left = field === "no_members_left" ? sanitized : String(values.no_members_left ?? "");

                            const openingNum = parseCount(opening);
                            const admittedNum = parseCount(admitted);
                            const leftNum = parseCount(left);
                            const totalMembers = openingNum + admittedNum - leftNum;

                            setFieldValue("total", totalMembers > 0 ? String(totalMembers) : "0");

                            // Reset gender split so user can re‑enter ratio based on new total
                            setFieldValue("male", "0");
                            setFieldValue("female", "0");

                            // Re‑evaluate error message as user edits 6/7/8
                            setFieldError("total", "");
                            const totalFromField9 = parseCount(
                                totalMembers > 0 ? String(totalMembers) : "0"
                            );
                            const genderTotal =
                                parseCount("0") + parseCount("0"); // both reset to 0

                            if (
                                (openingNum !== 0 ||
                                    admittedNum !== 0 ||
                                    leftNum !== 0) &&
                                totalMembers !== totalFromField9
                            ) {
                                setFieldError(
                                    "total",
                                    "Total must be equal to: (6. Opening members) + (7. Admitted during year) - (8. Left during year)."
                                );
                            } else if (totalFromField9 !== genderTotal) {
                                setFieldError(
                                    "total",
                                    "Total must be equal to: Male members + Female members."
                                );
                            }
                        };

                        return (
                            <>
                                <div className="bg-[#f4f6f8] min-h-screen p-6">
                                    {/* PAGE TITLE */}
                                    <h2 className="text-lg font-semibold mb-4">
                                        ANNUAL RETURN FOR TRADE UNION
                                    </h2>

                                    {/* MAIN PANEL */}
                                    <div className="bg-white border border-[#ddd] rounded mb-[50px]">
                                        {/* BLUE HEADER */}
                                        <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm">
                                            ONLINE FILING OF RETURN FOR : {contextDetails?.data?.tradeUnionName}
                                        </div>

                                        {/* STATIC INFO TABLE */}
                                        <div className="p-4">
                                            <table className="w-full border border-[#b5babe] text-sm">
                                                <tbody>
                                                    <tr>
                                                        <th className="border border-[#b5babe] px-3 py-2 w-1/4 text-left italic">
                                                            Registration Number
                                                        </th>
                                                        <td className="border border-[#b5babe] px-3 py-2">
                                                            {contextDetails?.registrationNumber}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th className="border border-[#b5babe] px-3 py-2 text-left italic">
                                                            Registration Date
                                                        </th>
                                                        <td className="border border-[#b5babe] px-3 py-2">
                                                            {formatDateDisplay(contextDetails?.data?.createdDate)}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th className="border border-[#b5babe] px-3 py-2 text-left italic">
                                                            Name
                                                        </th>
                                                        <td className="border border-[#b5babe] px-3 py-2">
                                                            {contextDetails?.data?.tradeUnionName}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th className="border border-[#b5babe] px-3 py-2 text-left italic">
                                                            Registered Address
                                                        </th>
                                                        <td className="border border-[#b5babe] px-3 py-2">
                                                            {contextDetails?.data?.address?.address + ", " + contextDetails?.data?.address?.district + ", " + contextDetails?.data?.address?.pin}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan={2}
                                                            className="border border-[#b5babe] px-3 py-2 text-sm"
                                                        >
                                                            If your Registration Number/Registration Date/Name of the Trade
                                                            Union/Registered Address mismatch, please{" "}
                                                            <a
                                                                href="#"
                                                                className="text-blue-600 underline font-medium"
                                                            >
                                                                Click here
                                                            </a>{" "}
                                                            to send mail (Please check your email id and phone number from
                                                            My profile, if it is not belongs to you make a change)
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* WHETHER AFFILIATED */}
                                        <div className="px-6 pb-4">
                                            <label className="block text-sm font-semibold mb-1">
                                                (✔) Whether Affiliated <span className="text-red-600">*</span>
                                            </label>

                                            <select
                                                name="whether_affilited"
                                                className="w-[260px] h-[36px] border border-[#ccc] px-2 text-sm"
                                                value={values.whether_affilited}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="0">No</option>
                                                <option value="1">Yes</option>
                                            </select>
                                            {renderError("whether_affilited")}
                                        </div>

                                        {values.whether_affilited == "1" && (


                                            <div className="px-6 pb-4">
                                                <label className="block text-sm font-semibold mb-1">
                                                    (✔) Affiliated From <span className="text-red-600">*</span>
                                                </label>

                                                <select
                                                    name="what_affilited"
                                                    className="w-[260px] h-[36px] border border-[#ccc] px-2 text-sm"
                                                    value={values?.what_affilited}
                                                    onChange={handleChange}
                                                // onChange={(e) => {
                                                //     const val = e.target.value;
                                                //     setFieldValue("what_affilited", val);

                                                //     // reset dependent fields
                                                //     setFieldValue("affiliation_name", "");
                                                //     setFieldValue("affiliation_name_other", "");
                                                // }}
                                                >
                                                    <option value="">Select</option>

                                                    {contextDetails?.dropdowns?.affiliationType?.map(
                                                        (each: string, ind: number) => (
                                                            <option key={ind} value={each}>
                                                                {each === "ctu" ? "Central Trade Union" : each === "f" ? "Any Other Federation" : ""}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                {renderError("what_affilited")}
                                            </div>

                                        )}


                                        {/* CLASSIFICATION OF SECTOR */}
                                        <div className="px-6 pb-6">
                                            <label className="block text-sm font-semibold mb-2">
                                                1. Classification of Sector{" "}
                                                <span className="text-red-600">*</span>
                                            </label>

                                            {/* <div className="space-y-1 text-sm">
                                    <label className="block">
                                        <input type="checkbox" className="mr-2 align-middle" />
                                        Public Sector Central Sphere
                                    </label>

                                    <label className="block">
                                        <input type="checkbox" className="mr-2 align-middle" />
                                        Public Sector State Sphere
                                    </label>

                                    <label className="block">
                                        <input type="checkbox" className="mr-2 align-middle" />
                                        Private Sector Central Sphere
                                    </label>

                                    <label className="block">
                                        <input type="checkbox" className="mr-2 align-middle" />
                                        Private Sector State Sphere
                                    </label>

                                    <label className="block">
                                        <input type="checkbox" className="mr-2 align-middle" />
                                        Others
                                    </label>
                                </div> */}
                                            <div className="space-y-1 text-sm">
                                                {contextDetails?.dropdowns?.classificationSectorOptions.map((opt: string) => (
                                                    <label key={opt} className="block cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="classification_sector"
                                                            value={opt}
                                                            checked={
                                                                Array.isArray(values.classification_sector)
                                                                    ? values.classification_sector.includes(opt)
                                                                    : values.classification_sector === opt
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue("classification_sector", e.target.value);
                                                            }}
                                                            className="mr-2 align-middle accent-[#3c8dbc]"
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                            {renderError("classification_sector")}


                                            <p className="text-black mt-2 font-semibold">
                                                Note: Please state to which of the following four categories the
                                                Union/Federation belong
                                            </p>
                                            {/* =======================
                                            PART 2 – FIELDS 2(i) to 8
                                            ======================= */}


                                            <div className="pt-6 pb-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                                    {/* If user selects ctu, then the dropdown will be shown to display ctu names */}
                                                    {values.whether_affilited == "1" && values?.what_affilited === "ctu" && (
                                                        <div className="pb-4">
                                                            <label className="block text-sm font-semibold mb-1">
                                                                2. Name of the Central Trade Union West Bengal Unit
                                                                <span className="text-red-600">*</span>
                                                            </label>

                                                            <select
                                                                name="affiliation_name"
                                                                className="w-full h-[36px] border border-[#ccc] px-2 text-sm"
                                                                value={values.affiliation_name}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Select</option>

                                                                {contextDetails?.dropdowns?.ctuAffiliations &&
                                                                    Object.entries(contextDetails.dropdowns.ctuAffiliations)
                                                                        .sort((a: any, b: any) => a[1].localeCompare(b[1]))
                                                                        .map(
                                                                            ([key, value]: [string, any], ind: number) => (
                                                                                <option key={ind} value={key}>
                                                                                    {value}
                                                                                </option>
                                                                            )
                                                                        )}
                                                            </select>
                                                            {renderError("affiliation_name")}
                                                        </div>
                                                    )}

                                                    {/* If user selects federation, then the same dropdown will be shown to display federation names */}
                                                    {values.whether_affilited == "1" && values?.what_affilited === "f" && (
                                                        <div className="pb-4">
                                                            <label className="block text-sm font-semibold mb-1">
                                                                2. Name Of The Federation
                                                                <span className="text-red-600"> *</span>
                                                            </label>

                                                            <select
                                                                name="affiliation_name"
                                                                className="w-full h-[36px] border border-[#ccc] px-2 text-sm"
                                                                value={values.affiliation_name}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">- Select Federation Name -</option>

                                                                {contextDetails?.dropdowns?.federationAffiliations &&
                                                                    Object.entries(contextDetails.dropdowns.federationAffiliations)
                                                                        .sort((a: any, b: any) => a[1].localeCompare(b[1]))
                                                                        .map(
                                                                            ([key, value]: [string, any], ind: number) => (
                                                                                <option key={ind} value={key}>
                                                                                    {value}
                                                                                </option>
                                                                            )
                                                                        )}
                                                            </select>
                                                        </div>
                                                    )}
                                                    {/* 2(i) */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            2.(i) Number of the All-India Body/Federation to which affiliated{" "}
                                                            {values.whether_affilited === "1" && <span className="text-red-600">*</span>}
                                                        </label>
                                                        <input
                                                            name="affiliation_number"
                                                            value={values.affiliation_number}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                            onChange={handleChange}
                                                        />
                                                        {renderError("affiliation_number")}
                                                    </div>

                                                    {/* 3 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            3. Number of receipt for payment of affiliation fee (Challan Number){" "}
                                                            {values.whether_affilited === "1" && <span className="text-red-600">*</span>}
                                                        </label>
                                                        <input
                                                            name="no_payment"
                                                            value={values.no_payment}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("no_payment")}
                                                    </div>

                                                    {/* 4 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            4. Date of receipt for payment of affiliation fee (Challan Date){" "}
                                                            {values.whether_affilited === "1" && <span className="text-red-600">*</span>}
                                                        </label>
                                                        <input
                                                            name="date_payment"
                                                            value={values.date_payment}
                                                            onChange={handleChange}
                                                            type="date"
                                                            className="w-full h-[36px] border border-[#ccc] px-2 bg-[#f9f9f9]"
                                                        />
                                                        {renderError("date_payment")}
                                                    </div>

                                                    {/* Payment For */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            Payment For <span className="text-red-600">*</span>
                                                        </label>
                                                        <select className="w-full h-[36px] border border-[#ccc] px-2"
                                                            name="payment_for"
                                                            value={values?.payment_for}
                                                            onChange={handleChange}>
                                                            <option value="">Select</option>
                                                            {contextDetails?.dropdowns?.paymentFrequency?.map(
                                                                (each: string, ind: number) => (
                                                                    <option key={ind} value={each}>
                                                                        {each}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* 5 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            5. Membership fee <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="number_affiliated"
                                                            value={values?.number_affiliated}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("number_affiliated")}
                                                    </div>

                                                    {/* 6 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            6. Number of members on books at the beginning of the year{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="no_members"
                                                            value={values?.no_members}
                                                            onChange={(e) =>
                                                                handleMembersChange("no_members", e.target.value)
                                                            }
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("no_members")}
                                                    </div>

                                                    {/* 7 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            7. Number of member admitted during the year{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="no_members_admitted"
                                                            value={values?.no_members_admitted}
                                                            onChange={(e) =>
                                                                handleMembersChange("no_members_admitted", e.target.value)
                                                            }
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("no_members_admitted")}
                                                    </div>

                                                    {/* 8 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            8. Number of members who left during the year{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="no_members_left"
                                                            value={values?.no_members_left}
                                                            onChange={(e) =>
                                                                handleMembersChange("no_members_left", e.target.value)
                                                            }
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("no_members_left")}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* =======================
                                            PART 3 – FIELDS 9 to 13
                                            ======================= */}
                                            <div className="pt-6 pb-6 text-sm">

                                                {/* 9. MEMBERS TABLE */}
                                                <table className="w-full border border-[#b5babe] mb-2">
                                                    <thead>
                                                        <tr className="bg-[#f2f2f2]">
                                                            <th className="border border-[#b5babe] px-3 py-2 text-left font-semibold">
                                                                9. Number of members on books as on 31st December:
                                                                <span className="text-red-600">*</span>
                                                            </th>
                                                            <th className="border border-[#b5babe] px-3 py-2 w-[120px] text-left font-semibold">
                                                                Number
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-[#b5babe] px-3 py-3">Male</td>
                                                            <td className="border border-[#b5babe] px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    name="male"
                                                                    value={values.male}
                                                                    onChange={(e) =>
                                                                        handleMemberGenderCountChange("male", e.target.value)
                                                                    }
                                                                    className="w-full h-[34px] border border-[#ccc] px-2"
                                                                />
                                                                {renderError("male")}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td className="border border-[#b5babe] px-3 py-3">Female</td>
                                                            <td className="border border-[#b5babe] px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    name="female"
                                                                    value={values.female}
                                                                    onChange={(e) =>
                                                                        handleMemberGenderCountChange("female", e.target.value)
                                                                    }
                                                                    className="w-full h-[34px] border border-[#ccc] px-2"
                                                                />
                                                                {renderError("female")}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td className="border border-[#b5babe] px-3 py-3">Total</td>
                                                            <td className="border border-[#b5babe] px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    name="total"
                                                                    value={values.total}
                                                                    readOnly
                                                                    className="w-full h-[34px] border border-[#ccc] px-2"
                                                                />
                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                                {typeof errors.total === "string" && (
                                                    <p className="text-red-600 text-xs mt-1">
                                                        {errors.total}
                                                    </p>
                                                )}

                                                {/* 10. POLITICAL FUND */}
                                                <div className="mb-6">
                                                    <label className="block font-semibold mb-1">
                                                        10. Number of members contributing to Political Fund{" "}
                                                        <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        name="members_contribution"
                                                        value={values?.members_contribution}
                                                        onChange={handleChange}
                                                        type="text"
                                                        className="w-[50%] h-[36px] border border-[#ccc] px-2"
                                                    />
                                                    {renderError("members_contribution")}
                                                </div>

                                                {/* 11–13 SUBSCRIPTION TABLE */}
                                                <table className="w-full border border-[#b5babe]">
                                                    <thead>
                                                        <tr className="bg-[#f2f2f2]">
                                                            <th className="border border-[#b5babe] px-3 py-2 text-left font-semibold">
                                                                11. Number of members who paid their subscription for the whole year:
                                                                <span className="text-red-600">*</span>
                                                            </th>
                                                            <th className="border border-[#b5babe] px-3 py-2 w-[120px] text-left font-semibold">
                                                                Number
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-[#b5babe] px-3 py-3">
                                                                12. Number of members of whose subscription are arrear for three months or less
                                                            </td>
                                                            <td className="border border-[#b5babe] px-3 py-2">
                                                                <input
                                                                    name="arrear_less"
                                                                    value={values?.arrear_less}
                                                                    onChange={handleChange}
                                                                    type="text"
                                                                    className="w-full h-[34px] border border-[#ccc] px-2"
                                                                />
                                                                {renderError("arrear_less")}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td className="border border-[#b5babe] px-3 py-3">
                                                                13. Number of members of whose subscription are in arrear for more than three months
                                                            </td>
                                                            <td className="border border-[#b5babe] px-3 py-2">
                                                                <input
                                                                    name="arrear_less_total"
                                                                    value={values?.arrear_less_total}
                                                                    onChange={handleChange}
                                                                    type="text"
                                                                    className="w-full h-[34px] border border-[#ccc] px-2"
                                                                />
                                                                {renderError("arrear_less_total")}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* =======================
                                            PART 4 – FIELDS 14 to 16
                                            ======================= */}
                                            <div className="pt-6 pb-6 text-sm">

                                                {/* 14 & 15 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 mb-6">

                                                    {/* 14 */}
                                                    <div>
                                                        <label className="block font-semibold mb-2">
                                                            14. Whether the Union is recognised by the employer by Industry{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>

                                                        <div className="flex items-center gap-6">
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="federation_recognised_industry"
                                                                    value="0"
                                                                    checked={values.federation_recognised_industry === "0"}
                                                                    onChange={handleChange}
                                                                />
                                                                No
                                                            </label>

                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="federation_recognised_industry"
                                                                    value="1"
                                                                    checked={values.federation_recognised_industry === "1"}
                                                                    onChange={handleChange}
                                                                />
                                                                Yes
                                                            </label>
                                                        </div>
                                                    </div>


                                                    {/* 15 */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            15. Number of bipartite agreements entered into by the Federation
                                                            with the employer industry{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>

                                                        <input
                                                            name="no_bipartite"
                                                            value={values.no_bipartite}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("no_bipartite")}
                                                    </div>
                                                </div>

                                                {/* 16 – SCROLLABLE DISPUTES TABLE */}
                                                <div className="border border-[#b5babe] max-h-[260px] overflow-y-auto">

                                                    <table className="w-full border-collapse">
                                                        <thead className="bg-[#f2f2f2] sticky top-0 z-10">
                                                            <tr>
                                                                <th
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-2 text-left font-semibold"
                                                                >
                                                                    16. Number of disputes/cases taken up by the Union on behalf
                                                                    of the workmen under the following Acts:
                                                                    <span className="text-red-600">*</span>
                                                                </th>
                                                                <th className="border border-[#b5babe] px-3 py-2 w-[120px] text-left font-semibold">
                                                                    Number
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>

                                                            <tr >
                                                                <td
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-3"
                                                                >
                                                                    (i) Industrial Disputes Act, 1947
                                                                </td>
                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="indus_dis"
                                                                        value={values.indus_dis}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr >
                                                                <td
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-3"
                                                                >
                                                                    (ii)Payment of Wages Act, 1936
                                                                </td>
                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="pay_wag"
                                                                        value={values.pay_wag}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr >
                                                                <td
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-3"
                                                                >
                                                                    (iii) Minimum Wages Act, 1948
                                                                </td>
                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="min_wag"
                                                                        value={values.min_wag}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr >
                                                                <td
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-3"
                                                                >
                                                                    (iv) Workmens Compensation Act, 1923
                                                                </td>
                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="workmen_com"
                                                                        value={values.workmen_com}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                            <tr >
                                                                <td
                                                                    colSpan={2}
                                                                    className="border border-[#b5babe] px-3 py-3"
                                                                >
                                                                    (v) Employees State Insurance Act, 1948
                                                                </td>
                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="emp_state"
                                                                        value={values.emp_state}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>


                                                            {/* (vi) Any Other Act */}
                                                            <tr>
                                                                <td className="border border-[#b5babe] px-3 py-3 w-[45%]">
                                                                    (vi) Any Other Act (to be specified)
                                                                </td>

                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="any_other_act_detail"
                                                                        value={values.any_other_act_detail}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        placeholder="Please Specify name of the Act"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>

                                                                <td className="border border-[#b5babe] px-3 py-2">
                                                                    <input
                                                                        name="any_other_act"
                                                                        value={values.any_other_act}
                                                                        onChange={handleChange}
                                                                        type="text"
                                                                        className="w-full h-[34px] border border-[#ccc] px-2"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {/* =======================
                                            PART 5 – FIELDS 17 to SUBMIT
                                            ======================= */}
                                            <div className="pt-6 text-sm">

                                                {/* 17 & 18 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-6">

                                                    {/* 17 */}
                                                    <div>
                                                        <label className="block font-semibold mb-2">
                                                            17. Whether any office bearers resigned during this year{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>

                                                        <div className="flex items-center gap-6">
                                                            <label className="flex items-center gap-2">
                                                                <input type="radio"
                                                                    name="resigned_officers"
                                                                    value="0"
                                                                    checked={values.resigned_officers == "0"}
                                                                    onChange={handleChange} />
                                                                No
                                                            </label>

                                                            <label className="flex items-center gap-2">
                                                                <input type="radio" name="resigned_officers"
                                                                    value="1"
                                                                    checked={values.resigned_officers == "1"}
                                                                    onChange={handleChange} />
                                                                Yes
                                                            </label>
                                                        </div>
                                                        {renderError("resigned_officers")}
                                                    </div>

                                                    {/* 18 */}
                                                    <div>
                                                        <label className="block font-semibold mb-2">
                                                            18. Whether any Consent of Officers joined during this year{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>

                                                        <div className="flex items-center gap-6">
                                                            <label className="flex items-center gap-2">
                                                                <input type="radio" name="consent_officers_joined"
                                                                    value="0"
                                                                    checked={values.consent_officers_joined == "0"}
                                                                    onChange={handleChange} />
                                                                No
                                                            </label>

                                                            <label className="flex items-center gap-2">
                                                                <input type="radio" name="consent_officers_joined"
                                                                    value="1"
                                                                    checked={values.consent_officers_joined == "1"}
                                                                    onChange={handleChange} />
                                                                Yes
                                                            </label>
                                                        </div>
                                                        {renderError("consent_officers_joined")}
                                                    </div>
                                                </div>

                                                {/* FILE UPLOADS */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-6">

                                                    {/* Secretary Signature */}
                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            Upload Secretary Signature <span className="text-red-600">*</span>
                                                        </label>

                                                        <input
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                                            onChange={(e) =>
                                                                handleSignatureUpload(
                                                                    e,
                                                                    setFieldValue,
                                                                    "sec_sign",
                                                                    "sec_sign_file_name"
                                                                )
                                                            }
                                                        />

                                                        {(values.sec_sign_file_name || contextDetails?.data?.signatures?.secSignFileName || values.sec_sign || contextDetails?.data?.signatures?.secSign) && (
                                                             <div className="flex items-center gap-3 mt-1.5 p-1.5 bg-green-50 border border-green-200 rounded">
                                                                 <span className="text-green-700 text-xs font-semibold">
                                                                     ✓ {values.sec_sign_file_name || contextDetails?.data?.signatures?.secSignFileName || "Signature Uploaded"}
                                                                 </span>
                                                                 {(values.sec_sign || contextDetails?.data?.signatures?.secSign) && (
                                                                     <img
                                                                         src={
                                                                             (values.sec_sign || contextDetails?.data?.signatures?.secSign)?.startsWith("data:image")
                                                                                 ? (values.sec_sign || contextDetails?.data?.signatures?.secSign)
                                                                                 : `data:image/png;base64,${values.sec_sign || contextDetails?.data?.signatures?.secSign}`
                                                                         }
                                                                         alt="Secretary Signature Preview"
                                                                         className="h-8 border p-0.5 rounded bg-white object-contain"
                                                                     />
                                                                 )}
                                                             </div>
                                                         )}
                                                         {renderError("sec_sign")}
                                                     </div>

                                                     {/* Treasurer Signature */}
                                                     <div>
                                                         <label className="block font-semibold mb-1">
                                                             Upload Treasurer Signature <span className="text-red-600">*</span>
                                                         </label>

                                                         <input
                                                             type="file"
                                                             accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                                             onChange={(e) =>
                                                                 handleSignatureUpload(
                                                                     e,
                                                                     setFieldValue,
                                                                     "e_sign",
                                                                     "e_sign_file_name"
                                                                 )
                                                             }
                                                         />

                                                         {(values.e_sign_file_name || contextDetails?.data?.signatures?.eSignFileName || values.e_sign || contextDetails?.data?.signatures?.eSign) && (
                                                             <div className="flex items-center gap-3 mt-1.5 p-1.5 bg-green-50 border border-green-200 rounded">
                                                                 <span className="text-green-700 text-xs font-semibold">
                                                                     ✓ {values.e_sign_file_name || contextDetails?.data?.signatures?.eSignFileName || "Signature Uploaded"}
                                                                 </span>
                                                                 {(values.e_sign || contextDetails?.data?.signatures?.eSign) && (
                                                                     <img
                                                                         src={
                                                                             (values.e_sign || contextDetails?.data?.signatures?.eSign)?.startsWith("data:image")
                                                                                 ? (values.e_sign || contextDetails?.data?.signatures?.eSign)
                                                                                 : `data:image/png;base64,${values.e_sign || contextDetails?.data?.signatures?.eSign}`
                                                                         }
                                                                         alt="Treasurer Signature Preview"
                                                                         className="h-8 border p-0.5 rounded bg-white object-contain"
                                                                     />
                                                                 )}
                                                             </div>
                                                         )}
                                                         {renderError("e_sign")}
                                                     </div>
                                                </div>

                                                {/* APPLICANT DETAILS */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-8">

                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            Name Of Applicant{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="applicant_name"
                                                            value={values.applicant_name}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("applicant_name")}
                                                    </div>

                                                    <div>
                                                        <label className="block font-semibold mb-1">
                                                            Mobile Number Of Applicant{" "}
                                                            <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            name="applicant_mobile"
                                                            value={values.applicant_mobile}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-full h-[36px] border border-[#ccc] px-2"
                                                        />
                                                        {renderError("applicant_mobile")}
                                                    </div>
                                                </div>

                                                {Object.keys(errors).length > 0 && submitCount > 0 && (
                                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-semibold text-sm">
                                                        Please fill in all mandatory fields before submitting. ({Object.keys(errors).length} mandatory field{Object.keys(errors).length > 1 ? "s" : ""} remaining)
                                                    </div>
                                                )}

                                                {/* SUBMIT BUTTON */}
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-[#337ab7] text-white px-6 py-3 rounded text-sm font-semibold cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? "Saving..." : "SAVE & CONTINUE"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </Form>
            )}
        </Formik>
    );
};

export default TradeUnionAnnualReturnFullPage;
