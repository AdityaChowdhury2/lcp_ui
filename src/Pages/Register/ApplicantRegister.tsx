import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  type FormikHelpers,
  type FormikProps,
} from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

/**
 * ApplicantRegister — modern replacement for the legacy Drupal
 * `applicant_registration_form`. Cascading location dropdowns are driven by the
 * lcp_api lookup endpoints and the whole form is submitted to
 * `POST /auth/applicant-register`.
 */

interface District {
  id: number | string;
  district_code: number | string;
  district_name: string;
}

interface Subdivision {
  id: number | string;
  sub_div_code: string | number;
  sub_div_name: string;
}

interface BlockRow {
  block_code: number | string;
  block_mun_name: string;
  type?: string | null;
}

interface VillageRow {
  village_code: number | string;
  village_name: string;
}

interface PoliceStationRow {
  police_station_code: string;
  name_of_police_station: string;
}

interface Option {
  value: string;
  label: string;
}

interface ApplicantFormValues {
  // PERSONAL INFORMATION
  firstName: string;
  middleName: string;
  lastName: string;
  idCardType: string;
  idCardNumber: string;

  // CONTACT INFORMATION
  email: string;
  mobile: string;
  otherContact: string;
  address: string;
  district_contactInfo: string;
  subdivision_contactInfo: string;
  areaType_contactInfo: string;
  blockType_contactInfo: string;
  gpWardSector_contactInfo: string;
  ps_contactInfo: string;
  pin_contactInfo: string;

  // ESTABLISHMENT INFORMATION
  estName: string;
  estType: string;
  estAddress: string;
  sameAsContact: boolean;
  district_est: string;
  subdivision_est: string;
  areaType_est: string;
  blockType_est: string;
  gpWardSector_est: string;
  ps_est: string;
  pin_est: string;

  // NUMBER OF WORKERS
  mrMale: string;
  mrFemale: string;
  mrAdolMale: string;
  mrAdolFemale: string;
  contractMale: string;
  contractFemale: string;
  contractAdolMale: string;
  contractAdolFemale: string;
  otherMale: string;
  otherFemale: string;
  otherAdolMale: string;
  otherAdolFemale: string;

  // LOGIN INFORMATION
  username: string;
  password: string;
  confirmPassword: string;
  captchaInput: string;
}

const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

const CARD_TYPES: Option[] = [
  { value: "1", label: "AADHAR" },
  { value: "2", label: "PAN" },
  { value: "3", label: "TAN" },
  { value: "4", label: "LIN" },
  { value: "5", label: "EPIC" },
];

const EST_TYPES: Option[] = [
  { value: "micro", label: "Micro" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const INPUT_CLASS =
  "w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#aca295]";

function generateCaptcha(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Build distinct area-type options ({B,M,C,S,N}) from a set of block rows. */
function deriveAreaTypes(rows: BlockRow[]): Option[] {
  const seen = new Set<string>();
  const out: Option[] = [];
  for (const r of rows) {
    const t = (r.type ?? "").toUpperCase();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push({ value: t, label: AREA_TYPE_LABELS[t] ?? t });
    }
  }
  return out;
}

const validationSchema = Yup.object({
  firstName: Yup.string().trim().required("First Name is required"),
  lastName: Yup.string().trim().required("Last Name is required"),
  idCardType: Yup.string().required("ID Card Type is required"),
  idCardNumber: Yup.string().trim().required("ID Card Number is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number")
    .required("Mobile Number is required"),
  otherContact: Yup.string().matches(/^\d*$/, "Only digits allowed"),
  address: Yup.string().trim().required("Address is required"),
  district_contactInfo: Yup.string().required("District is required"),
  subdivision_contactInfo: Yup.string().required("Subdivision is required"),
  areaType_contactInfo: Yup.string().required("Area type is required"),
  blockType_contactInfo: Yup.string().required("This field is required"),
  gpWardSector_contactInfo: Yup.string().required("This field is required"),
  ps_contactInfo: Yup.string().required("Police Station is required"),
  pin_contactInfo: Yup.string()
    .matches(/^\d{6}$/, "PIN must be 6 digits")
    .required("PIN Code is required"),
  estName: Yup.string().trim().required("Name is required"),
  estType: Yup.string().required("Establishment Type is required"),
  estAddress: Yup.string().trim().required("Address is required"),
  district_est: Yup.string().required("District is required"),
  subdivision_est: Yup.string().required("Subdivision is required"),
  areaType_est: Yup.string().required("Area type is required"),
  blockType_est: Yup.string().required("This field is required"),
  gpWardSector_est: Yup.string().required("This field is required"),
  ps_est: Yup.string().required("Police Station is required"),
  pin_est: Yup.string()
    .matches(/^\d{6}$/, "PIN must be 6 digits")
    .required("PIN Code is required"),
  username: Yup.string()
    .min(4, "Username must be longer than 4 characters")
    .matches(/^[a-zA-Z0-9.@_-]*$/, "Only letters, numbers, @ . - _ allowed")
    .required("Username is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain an upper case letter")
    .matches(/[0-9]/, "Must contain a numeric digit")
    .matches(/[^A-Za-z0-9]/, "Must contain a special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
  captchaInput: Yup.string().required("Enter the captcha"),
});

const ErrText: React.FC<{ name: string }> = ({ name }) => (
  <ErrorMessage name={name}>
    {(msg) => <div className="text-red-500 text-xs mt-1">{msg}</div>}
  </ErrorMessage>
);

const ApplicantRegister: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [districts, setDistricts] = useState<District[]>([]);

  // Contact-information cascade
  const [cSubdivisions, setCSubdivisions] = useState<Subdivision[]>([]);
  const [cAreaTypes, setCAreaTypes] = useState<Option[]>([]);
  const [cBlocks, setCBlocks] = useState<BlockRow[]>([]);
  const [cVillages, setCVillages] = useState<VillageRow[]>([]);
  const [cPoliceStations, setCPoliceStations] = useState<PoliceStationRow[]>([]);

  // Establishment cascade
  const [eSubdivisions, setESubdivisions] = useState<Subdivision[]>([]);
  const [eAreaTypes, setEAreaTypes] = useState<Option[]>([]);
  const [eBlocks, setEBlocks] = useState<BlockRow[]>([]);
  const [eVillages, setEVillages] = useState<VillageRow[]>([]);
  const [ePoliceStations, setEPoliceStations] = useState<PoliceStationRow[]>([]);

  const refreshCaptcha = () => setCaptcha(generateCaptcha());

  const initialValues: ApplicantFormValues = {
    firstName: "",
    middleName: "",
    lastName: "",
    idCardType: "",
    idCardNumber: "",
    email: "",
    mobile: "",
    otherContact: "",
    address: "",
    district_contactInfo: "",
    subdivision_contactInfo: "",
    areaType_contactInfo: "",
    blockType_contactInfo: "",
    gpWardSector_contactInfo: "",
    ps_contactInfo: "",
    pin_contactInfo: "",
    estName: "",
    estType: "",
    estAddress: "",
    sameAsContact: false,
    district_est: "",
    subdivision_est: "",
    areaType_est: "",
    blockType_est: "",
    gpWardSector_est: "",
    ps_est: "",
    pin_est: "",
    mrMale: "0",
    mrFemale: "0",
    mrAdolMale: "0",
    mrAdolFemale: "0",
    contractMale: "0",
    contractFemale: "0",
    contractAdolMale: "0",
    contractAdolFemale: "0",
    otherMale: "0",
    otherFemale: "0",
    otherAdolMale: "0",
    otherAdolFemale: "0",
    username: "",
    password: "",
    confirmPassword: "",
    captchaInput: "",
  };

  // ---- Lookup fetch helpers -------------------------------------------------
  const fetchSubdivisions = async (districtCode: string) => {
    if (!districtCode) return [];
    try {
      const res = await axios.get(`${API_BASE}subdivision/${districtCode}`);
      return Array.isArray(res.data) ? (res.data as Subdivision[]) : [];
    } catch {
      return [];
    }
  };

  const fetchAreaTypes = async (districtCode: string, subCode: string) => {
    if (!districtCode || !subCode) return [];
    try {
      const res = await axios.get(`${API_BASE}areatype/${districtCode}/${subCode}`);
      return deriveAreaTypes(Array.isArray(res.data) ? res.data : []);
    } catch {
      return [];
    }
  };

  const fetchBlocks = async (
    districtCode: string,
    subCode: string,
    areaType: string
  ) => {
    if (!districtCode || !subCode || !areaType) return [];
    try {
      const res = await axios.get(
        `${API_BASE}block/${districtCode}/${subCode}/${areaType}`
      );
      return Array.isArray(res.data) ? (res.data as BlockRow[]) : [];
    } catch {
      return [];
    }
  };

  const fetchVillages = async (blockCode: string) => {
    if (!blockCode) return [];
    try {
      const res = await axios.get(`${API_BASE}villageward/${blockCode}`);
      return Array.isArray(res.data) ? (res.data as VillageRow[]) : [];
    } catch {
      return [];
    }
  };

  const fetchPoliceStations = async (districtCode: string) => {
    if (!districtCode) return [];
    try {
      const res = await axios.get(`${API_BASE}policestation/${districtCode}`);
      return Array.isArray(res.data) ? (res.data as PoliceStationRow[]) : [];
    } catch {
      return [];
    }
  };

  // ---- Initial data + captcha render ---------------------------------------
  useEffect(() => {
    axios
      .get(`${API_BASE}district`)
      .then((res) => setDistricts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${Math.floor(h * 0.65)}px Verdana`;

    const spacing = w / (captcha.length + 1);
    for (let i = 0; i < captcha.length; i++) {
      const x = spacing * (i + 1);
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgb(${50 + Math.random() * 150}, ${
        50 + Math.random() * 150
      }, ${50 + Math.random() * 150})`;
      ctx.fillText(captcha[i], 0, 0);
      ctx.restore();
    }
  }, [captcha]);

  // ---- Submit ---------------------------------------------------------------
  const handleSubmit = async (
    values: ApplicantFormValues,
    helpers: FormikHelpers<ApplicantFormValues>
  ) => {
    if (values.captchaInput.trim().toLowerCase() !== captcha.toLowerCase()) {
      helpers.setFieldError("captchaInput", "Incorrect captcha");
      toast.error("Incorrect captcha. Please try again.");
      refreshCaptcha();
      helpers.setFieldValue("captchaInput", "");
      return;
    }

    const payload = {
      firstName: values.firstName.trim(),
      middleName: values.middleName.trim(),
      lastName: values.lastName.trim(),
      idCardType: values.idCardType,
      idCardNumber: values.idCardNumber.trim(),

      email: values.email.trim(),
      mobile: values.mobile.trim(),
      otherContact: values.otherContact.trim(),
      address: values.address.trim(),
      district: values.district_contactInfo,
      subdivision: values.subdivision_contactInfo,
      areaType: values.areaType_contactInfo,
      block: values.blockType_contactInfo,
      villWard: values.gpWardSector_contactInfo,
      ps: values.ps_contactInfo,
      pin: values.pin_contactInfo,

      estName: values.estName.trim(),
      estType: values.estType,
      estAddress: values.estAddress.trim(),
      sameAsContact: values.sameAsContact,
      estDistrict: values.district_est,
      estSubdivision: values.subdivision_est,
      estAreaType: values.areaType_est,
      estBlock: values.blockType_est,
      estVillWard: values.gpWardSector_est,
      estPs: values.ps_est,
      estPin: values.pin_est,

      mrMale: values.mrMale,
      mrFemale: values.mrFemale,
      mrAdolMale: values.mrAdolMale,
      mrAdolFemale: values.mrAdolFemale,
      contractMale: values.contractMale,
      contractFemale: values.contractFemale,
      contractAdolMale: values.contractAdolMale,
      contractAdolFemale: values.contractAdolFemale,
      otherMale: values.otherMale,
      otherFemale: values.otherFemale,
      otherAdolMale: values.otherAdolMale,
      otherAdolFemale: values.otherAdolFemale,

      username: values.username.trim(),
      password: values.password,
    };

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_BASE}auth/applicant-register`, payload);
      toast.success(res.data?.message || "Registration successful");
      helpers.resetForm();
      refreshCaptcha();
      setTimeout(() => navigate("/applicant-login?usertype=user"), 1200);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Registration failed"
      );
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-[21px] font-[700] text-[#232323]">
              User Registration
            </h2>
          </div>
        </div>

        <section className="mt-8 md:mt-0">
          <div className="flex justify-end">
            <Link
              to="/applicant-login?usertype=user"
              className="px-[25px] py-[12px] h-auto bg-[#f58b01] border border-[#f58b01] text-white
         not-italic text-[17px] font-[400] leading-[12px] rounded-none no-underline opacity-100"
            >
              CLICK HERE TO LOGIN
            </Link>
          </div>

          <Formik<ApplicantFormValues>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              handleChange,
              setFieldValue,
            }: FormikProps<ApplicantFormValues>) => (
              <Form>
                {/* ===================== PERSONAL INFORMATION ===================== */}
                <fieldset className="mx-auto bg-white p-[15px] border border-[#aca295] my-[15px] rounded-none">
                  <legend
                    className="block w-full bg-[url('${IMAGE_BASE}ftr-bg.jpg')] bg-repeat bg-left-top
    border border-[#4b403c] px-[15px] py-[2px] text-center text-white uppercase
    text-[20px] font-[400] not-italic"
                  >
                    PERSONAL INFORMATION
                  </legend>

                  <div className="pt-10 px-6 pb-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="firstName"
                            className={INPUT_CLASS}
                            placeholder="Enter your First Name"
                          />
                          <ErrText name="firstName" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Middle Name
                          </label>
                          <Field
                            name="middleName"
                            className={INPUT_CLASS}
                            placeholder="Enter your Middle Name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] text-[#433834] mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="lastName"
                            className={INPUT_CLASS}
                            placeholder="Enter your Last Name"
                          />
                          <ErrText name="lastName" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            ID Card Type <span className="text-red-500">*</span>
                          </label>
                          <Field as="select" name="idCardType" className={INPUT_CLASS}>
                            <option value="">Select Card Type</option>
                            {CARD_TYPES.map((c) => (
                              <option value={c.value} key={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="idCardType" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            ID Card Number <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="idCardNumber"
                            type="password"
                            className={INPUT_CLASS}
                            placeholder="Enter your ID card number"
                          />
                          <ErrText name="idCardNumber" />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* ===================== CONTACT INFORMATION ===================== */}
                <fieldset className="mx-auto bg-white p-[15px] border border-[#aca295] my-[15px] rounded-none">
                  <legend
                    className="block w-full bg-[url('${IMAGE_BASE}ftr-bg.jpg')] bg-repeat bg-left-top
    border border-[#4b403c] px-[15px] py-[2px] text-center text-white uppercase
    text-[20px] font-[400] not-italic"
                  >
                    CONTACT INFORMATION
                  </legend>

                  <div className="pt-10 px-6 pb-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="email"
                            type="email"
                            className={INPUT_CLASS}
                            placeholder="Enter valid Email address"
                          />
                          <ErrText name="email" />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="mobile"
                            maxLength={10}
                            className={INPUT_CLASS}
                            placeholder="Enter 10 digits mobile number"
                          />
                          <ErrText name="mobile" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] text-[#433834] mb-2">
                            Other Contact Number
                          </label>
                          <Field
                            name="otherContact"
                            maxLength={12}
                            className={INPUT_CLASS}
                            placeholder="Enter any other phone number"
                          />
                          <ErrText name="otherContact" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#433834] font-[700] mb-2">
                          House No./Village Name/Street/Road{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="address"
                          placeholder="Enter your Address"
                          className={`${INPUT_CLASS} h-[60px] block mb-0`}
                        />
                        <ErrText name="address" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select District <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="district_contactInfo"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("district_contactInfo", code);
                              // reset downstream
                              setFieldValue("subdivision_contactInfo", "");
                              setFieldValue("areaType_contactInfo", "");
                              setFieldValue("blockType_contactInfo", "");
                              setFieldValue("gpWardSector_contactInfo", "");
                              setFieldValue("ps_contactInfo", "");
                              setCSubdivisions([]);
                              setCAreaTypes([]);
                              setCBlocks([]);
                              setCVillages([]);
                              setCPoliceStations([]);
                              setCSubdivisions(await fetchSubdivisions(code));
                              setCPoliceStations(await fetchPoliceStations(code));
                            }}
                          >
                            <option value="">- Select -</option>
                            {districts.map((dst) => (
                              <option value={dst.district_code} key={dst.id}>
                                {dst.district_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="district_contactInfo" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Subdivision{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="subdivision_contactInfo"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("subdivision_contactInfo", code);
                              setFieldValue("areaType_contactInfo", "");
                              setFieldValue("blockType_contactInfo", "");
                              setFieldValue("gpWardSector_contactInfo", "");
                              setCAreaTypes([]);
                              setCBlocks([]);
                              setCVillages([]);
                              setCAreaTypes(
                                await fetchAreaTypes(
                                  values.district_contactInfo,
                                  code
                                )
                              );
                            }}
                          >
                            <option value="">- Select -</option>
                            {cSubdivisions.map((sd) => (
                              <option value={sd.sub_div_code} key={sd.id}>
                                {sd.sub_div_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="subdivision_contactInfo" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select Areatype <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="areaType_contactInfo"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const type = e.target.value;
                              setFieldValue("areaType_contactInfo", type);
                              setFieldValue("blockType_contactInfo", "");
                              setFieldValue("gpWardSector_contactInfo", "");
                              setCBlocks([]);
                              setCVillages([]);
                              setCBlocks(
                                await fetchBlocks(
                                  values.district_contactInfo,
                                  values.subdivision_contactInfo,
                                  type
                                )
                              );
                            }}
                          >
                            <option value="">- Select -</option>
                            {cAreaTypes.map((a) => (
                              <option value={a.value} key={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="areaType_contactInfo" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Block/Municipality/Corporation/SEZ/Notified Area{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="blockType_contactInfo"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("blockType_contactInfo", code);
                              setFieldValue("gpWardSector_contactInfo", "");
                              setCVillages([]);
                              setCVillages(await fetchVillages(code));
                            }}
                          >
                            <option value="">- Select -</option>
                            {cBlocks.map((b) => (
                              <option value={b.block_code} key={b.block_code}>
                                {b.block_mun_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="blockType_contactInfo" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select Gram Panchayat/Ward/Sector{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="gpWardSector_contactInfo"
                            className={INPUT_CLASS}
                          >
                            <option value="">- Select -</option>
                            {cVillages.map((v) => (
                              <option value={v.village_code} key={v.village_code}>
                                {v.village_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="gpWardSector_contactInfo" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Police Station{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="ps_contactInfo"
                            className={INPUT_CLASS}
                          >
                            <option value="">- Select -</option>
                            {cPoliceStations.map((p) => (
                              <option
                                value={p.police_station_code}
                                key={p.police_station_code}
                              >
                                {p.name_of_police_station}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="ps_contactInfo" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Pin Code <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="pin_contactInfo"
                            maxLength={6}
                            className={INPUT_CLASS}
                            placeholder="Enter your Area Pin Code"
                          />
                          <ErrText name="pin_contactInfo" />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* ===================== ESTABLISHMENT INFORMATION ===================== */}
                <fieldset className="mx-auto bg-white p-[15px] border border-[#aca295] my-[15px] rounded-none">
                  <legend
                    className="block w-full bg-[url('${IMAGE_BASE}ftr-bg.jpg')] bg-repeat bg-left-top
    border border-[#4b403c] px-[15px] py-[2px] text-center text-white uppercase
    text-[20px] font-[400] not-italic"
                  >
                    ESTABLISHMENT INFORMATION
                  </legend>

                  <div className="pt-10 px-6 pb-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Field name="estName" className={INPUT_CLASS} />
                          <ErrText name="estName" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Establishment Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field as="select" name="estType" className={INPUT_CLASS}>
                            <option value="">- Select -</option>
                            {EST_TYPES.map((t) => (
                              <option value={t.value} key={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="estType" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] text-[#433834] mb-2">
                            House No./Village Name/Street/Road{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field name="estAddress" className={INPUT_CLASS} />
                          <ErrText name="estAddress" />
                        </div>
                      </div>

                      <div className="mt-[1em] mb-[1em]">
                        <Field
                          type="checkbox"
                          name="sameAsContact"
                          checked={values.sameAsContact}
                          onChange={async (
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const checked = e.target.checked;
                            setFieldValue("sameAsContact", checked);
                            if (checked) {
                              // Copy contact values + option lists to establishment.
                              setESubdivisions(cSubdivisions);
                              setEAreaTypes(cAreaTypes);
                              setEBlocks(cBlocks);
                              setEVillages(cVillages);
                              setEPoliceStations(cPoliceStations);
                              setFieldValue(
                                "district_est",
                                values.district_contactInfo
                              );
                              setFieldValue(
                                "subdivision_est",
                                values.subdivision_contactInfo
                              );
                              setFieldValue(
                                "areaType_est",
                                values.areaType_contactInfo
                              );
                              setFieldValue(
                                "blockType_est",
                                values.blockType_contactInfo
                              );
                              setFieldValue(
                                "gpWardSector_est",
                                values.gpWardSector_contactInfo
                              );
                              setFieldValue("ps_est", values.ps_contactInfo);
                              setFieldValue("pin_est", values.pin_contactInfo);
                            } else {
                              setESubdivisions([]);
                              setEAreaTypes([]);
                              setEBlocks([]);
                              setEVillages([]);
                              setEPoliceStations([]);
                              setFieldValue("district_est", "");
                              setFieldValue("subdivision_est", "");
                              setFieldValue("areaType_est", "");
                              setFieldValue("blockType_est", "");
                              setFieldValue("gpWardSector_est", "");
                              setFieldValue("ps_est", "");
                              setFieldValue("pin_est", "");
                            }
                          }}
                        />
                        <label className="mx-1">Same as Contact Information</label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select District <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="district_est"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("district_est", code);
                              setFieldValue("subdivision_est", "");
                              setFieldValue("areaType_est", "");
                              setFieldValue("blockType_est", "");
                              setFieldValue("gpWardSector_est", "");
                              setFieldValue("ps_est", "");
                              setESubdivisions([]);
                              setEAreaTypes([]);
                              setEBlocks([]);
                              setEVillages([]);
                              setEPoliceStations([]);
                              setESubdivisions(await fetchSubdivisions(code));
                              setEPoliceStations(await fetchPoliceStations(code));
                            }}
                          >
                            <option value="">- Select -</option>
                            {districts.map((dst) => (
                              <option value={dst.district_code} key={dst.id}>
                                {dst.district_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="district_est" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Subdivision{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="subdivision_est"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("subdivision_est", code);
                              setFieldValue("areaType_est", "");
                              setFieldValue("blockType_est", "");
                              setFieldValue("gpWardSector_est", "");
                              setEAreaTypes([]);
                              setEBlocks([]);
                              setEVillages([]);
                              setEAreaTypes(
                                await fetchAreaTypes(values.district_est, code)
                              );
                            }}
                          >
                            <option value="">- Select -</option>
                            {eSubdivisions.map((sd) => (
                              <option value={sd.sub_div_code} key={sd.id}>
                                {sd.sub_div_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="subdivision_est" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select area type <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="areaType_est"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const type = e.target.value;
                              setFieldValue("areaType_est", type);
                              setFieldValue("blockType_est", "");
                              setFieldValue("gpWardSector_est", "");
                              setEBlocks([]);
                              setEVillages([]);
                              setEBlocks(
                                await fetchBlocks(
                                  values.district_est,
                                  values.subdivision_est,
                                  type
                                )
                              );
                            }}
                          >
                            <option value="">- Select -</option>
                            {eAreaTypes.map((a) => (
                              <option value={a.value} key={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="areaType_est" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Block/Municipality/Corporation/SEZ/Notified Area{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="blockType_est"
                            className={INPUT_CLASS}
                            onChange={async (
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const code = e.target.value;
                              setFieldValue("blockType_est", code);
                              setFieldValue("gpWardSector_est", "");
                              setEVillages([]);
                              setEVillages(await fetchVillages(code));
                            }}
                          >
                            <option value="">- Select -</option>
                            {eBlocks.map((b) => (
                              <option value={b.block_code} key={b.block_code}>
                                {b.block_mun_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="blockType_est" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[#433834] font-[700] mb-2">
                            Select Gram Panchayat/Ward/Sector{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="gpWardSector_est"
                            className={INPUT_CLASS}
                          >
                            <option value="">- Select -</option>
                            {eVillages.map((v) => (
                              <option value={v.village_code} key={v.village_code}>
                                {v.village_name}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="gpWardSector_est" />
                        </div>

                        <div>
                          <label className="block text-sm text-[#433834] font-[700] mb-2">
                            Select Police Station{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field as="select" name="ps_est" className={INPUT_CLASS}>
                            <option value="">- Select -</option>
                            {ePoliceStations.map((p) => (
                              <option
                                value={p.police_station_code}
                                key={p.police_station_code}
                              >
                                {p.name_of_police_station}
                              </option>
                            ))}
                          </Field>
                          <ErrText name="ps_est" />
                        </div>

                        <div>
                          <label className="block text-sm font-[700] mb-2 text-[#433834]">
                            Pin Code <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="pin_est"
                            maxLength={6}
                            className={INPUT_CLASS}
                            placeholder="Enter your Area Pin Code"
                          />
                          <ErrText name="pin_est" />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* ===================== NUMBER OF WORKERS ===================== */}
                <fieldset className="mx-auto bg-white p-[15px] border border-[#aca295] my-[15px] rounded-none">
                  <legend
                    className="block w-full bg-[url('${IMAGE_BASE}ftr-bg.jpg')] bg-repeat bg-left-top
    border border-[#4b403c] px-[15px] py-[2px] text-center text-white uppercase
    text-[20px] font-[400] not-italic"
                  >
                    NUMBER OF WORKERS EMPLOYED
                  </legend>

                  <div className="pt-5 px-6 pb-8 mt-4 border-t border-[#ccc]">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-[#433834] text-sm font-[700]">
                            <th className="text-left p-2"></th>
                            <th className="p-2">Male</th>
                            <th className="p-2">Female</th>
                            <th className="p-2">Adolescent Male</th>
                            <th className="p-2">Adolescent Female</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              [
                                "No of workman of master role / regular",
                                ["mrMale", "mrFemale", "mrAdolMale", "mrAdolFemale"],
                              ],
                              [
                                "No of contractual labour",
                                [
                                  "contractMale",
                                  "contractFemale",
                                  "contractAdolMale",
                                  "contractAdolFemale",
                                ],
                              ],
                              [
                                "No of other worker engaged",
                                [
                                  "otherMale",
                                  "otherFemale",
                                  "otherAdolMale",
                                  "otherAdolFemale",
                                ],
                              ],
                            ] as [string, string[]][]
                          ).map(([label, names]) => (
                            <tr key={label}>
                              <td className="p-2 text-sm text-[#433834]">{label}</td>
                              {names.map((n) => (
                                <td className="p-2" key={n}>
                                  <Field
                                    name={n}
                                    maxLength={20}
                                    className={`${INPUT_CLASS} w-[140px]`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </fieldset>

                {/* ===================== LOGIN INFORMATION ===================== */}
                <fieldset className="mx-auto bg-white p-[15px] border border-[#aca295] my-[15px] rounded-none">
                  <legend
                    className="block w-full bg-[url('${IMAGE_BASE}ftr-bg.jpg')] bg-repeat bg-left-top
    border border-[#4b403c] px-[15px] py-[2px] text-center text-white uppercase
    text-[20px] font-[400] not-italic"
                  >
                    LOGIN INFORMATION
                  </legend>

                  <div className="pt-10 px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-[700] mb-2 text-[#433834]">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="username"
                          className={INPUT_CLASS}
                          placeholder="Enter username"
                        />
                        <ErrText name="username" />
                      </div>

                      <div>
                        <label className="block text-sm font-[700] mb-2 text-[#433834]">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="password"
                          type="password"
                          className={INPUT_CLASS}
                          placeholder="Enter password"
                        />
                        <ErrText name="password" />
                        <div className="block italic text-[rgb(46,46,46)] text-[0.85em] font-[400] leading-[14px] mt-1">
                          * Password must be at least 8 characters, with at least 1
                          upper case letter, 1 numeric digit and 1 special character.
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-[700] text-[#433834] mb-2">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="confirmPassword"
                          type="password"
                          className={INPUT_CLASS}
                          placeholder="Enter password"
                        />
                        <ErrText name="confirmPassword" />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <canvas
                        ref={canvasRef}
                        width={216}
                        height={60}
                        className="w-[216px] h-[60px] border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-sm text-[#f58b01] underline"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <label className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                        What code is in the image?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="captchaInput"
                        type="text"
                        className="border border-gray-400 px-3 py-2 h-[36px] focus:outline-none focus:ring-0 focus:border-[#aca295] w-[140px]"
                      />
                    </div>
                    <ErrText name="captchaInput" />
                    <div className="block italic text-[rgb(46,46,46)] text-[0.85em] font-[400] leading-[14px] mt-1">
                      Enter the characters shown in the image.
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-[25px] py-[12px] h-auto bg-[#f58b01] border border-[#f58b01] text-white
         not-italic text-[17px] font-[400] leading-[12px] rounded-none no-underline opacity-100 disabled:opacity-60"
                  >
                    {submitting ? "SUBMITTING..." : "SUBMIT"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </section>

        <div className="h-12" />
      </main>
    </div>
  );
};

export default ApplicantRegister;
