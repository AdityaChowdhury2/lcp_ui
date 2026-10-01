import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getUserId } from "../../../utils/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/* -------------------- REUSABLE FIELD -------------------- */
interface FieldProps {
  label: string;
  required?: boolean;
  note?: string;
  children: React.ReactNode;
  /** Extra node rendered inline after the label (e.g. edit pencil). */
  labelAdornment?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, required, note, children, labelAdornment }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
      {labelAdornment}
    </label>
    {children}
    {note && <p className="text-xs text-red-500 mt-1">Note: {note}</p>}
  </div>
);

/* -------------------- OPTIONS -------------------- */
const DESIGNATION_OPTIONS: string[] = [
  "LC", "ADDL.LC", "ADDL.LC(P)", "REGISTRAR(TU)", "JLC", "JLC(P)", "DLC", "DLC(P)",
  "ALC", "DY. REGISTRAR(TU)", "SUPERVISING INSPECTOR(S&E)", "INSPECTOR", "HEAD CLARK",
  "UDC", "LDC", "STATISTICAL ASSISTANT", "CASH SARKAR", "TYPIST BG", "TYPIST GR-I",
  "CLARK CUM TYPIST", "TYPIST SG", "RECORD SUPPLIER", "MUHURRIAR GR-I", "MUHURRIAR GR-II",
  "PEON", "ORDERLY PEON", "PCPS", "DCNW", "DRIVER", "CKCO", "LIBRARY ASS.", "GROUP-D",
];

const CATEGORY_OPTIONS: string[] = ["General", "SC", "ST", "OBC", "OBC-A", "OBC-B"];

/** Area-type char <-> label. The masters API emits chars; the profile GET a label. */
const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};
const areaTypeToCode = (value: string): string => {
  if (!value) return "";
  const v = value.trim();
  if (v.length === 1) return v.toUpperCase();
  const match = Object.entries(AREA_TYPE_LABELS).find(
    ([, label]) => label.toLowerCase() === v.toLowerCase(),
  );
  return match ? match[0] : v.slice(0, 1).toUpperCase();
};

/** Convert the API's DD-MM-YYYY date string to the YYYY-MM-DD that a
 *  native <input type="date"> requires. Passes through YYYY-MM-DD as-is. */
const toDateInputValue = (value: string): string => {
  if (!value) return "";
  const v = value.trim();
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(v);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return "";
};

/* -------------------- TYPES -------------------- */
interface ProfileForm {
  name: string;
  employeeId: string;
  dob: string;
  mobile: string;
  govtMobile: string;
  contactOffice: string;
  personalEmail: string;
  govtEmail: string;
  officeEmail: string;
  gender: string;
  category: string;
  post: string;
  designation: string;
  department: string;
  location: string;
  doj_lc: string;
  doe: string;
  doj_present: string;
  dor: string;
  additionalCharge: string;
  addressLine: string;
  pinCode: string;
  postOffice: string;
  district: string;
  subdivision: string;
  areaType: string;
  municipality: string;
  ward: string;
  policeStation: string;
}

const EMPTY_FORM: ProfileForm = {
  name: "", employeeId: "", dob: "", mobile: "", govtMobile: "", contactOffice: "",
  personalEmail: "", govtEmail: "", officeEmail: "", gender: "", category: "", post: "",
  designation: "", department: "", location: "", doj_lc: "", doe: "", doj_present: "",
  dor: "", additionalCharge: "No", addressLine: "", pinCode: "", postOffice: "",
  district: "", subdivision: "", areaType: "", municipality: "", ward: "", policeStation: "",
};

type Option = { value: string; label: string };

const inputBase = "w-full border p-2 focus:outline-none focus:ring-1 focus:ring-blue-500";
const disabledCls = "w-full border p-2 bg-gray-100 text-gray-600 cursor-not-allowed";

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const userId = getUserId();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* -------------------- MOBILE OTP STATE -------------------- */
  const [originalMobile, setOriginalMobile] = useState("");
  const [mobileEditable, setMobileEditable] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpMeta, setOtpMeta] = useState<{ encryptedOtp: string; expiresAt: number; mobile: string } | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  /* -------------------- ADDRESS LISTS -------------------- */
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [areaTypes, setAreaTypes] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const mobileChanged = form.mobile.trim() !== originalMobile.trim();

  const setField = (name: keyof ProfileForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setField(name as keyof ProfileForm, value);
  };

  /* -------------------- FETCH PROFILE -------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}custom_user/profile/${userId}`);
        const r = res?.data?.result;
        if (r) {
          const loaded: ProfileForm = {
            ...EMPTY_FORM,
            ...r,
            areaType: areaTypeToCode(r.areaType || ""),
            additionalCharge: r.additionalCharge || "No",
          };
          setForm(loaded);
          setOriginalMobile(String(r.mobile ?? ""));
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        toast.error("Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  /* -------------------- ADDRESS CASCADE (load option lists) -------------------- */
  // Districts once.
  useEffect(() => {
    axios
      .get(`${API_BASE}district`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setDistricts(list.map((x: any) => ({ value: String(x.district_code), label: x.district_name })));
      })
      .catch(() => setDistricts([]));
  }, []);

  // Sub-divisions + police stations when district changes.
  useEffect(() => {
    if (!form.district) {
      setSubdivisions([]);
      setPoliceStations([]);
      return;
    }
    axios
      .get(`${API_BASE}subdivision/${form.district}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setSubdivisions(list.map((x: any) => ({ value: String(x.sub_div_code), label: x.sub_div_name })));
      })
      .catch(() => setSubdivisions([]));
    axios
      .get(`${API_BASE}policestation/${form.district}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setPoliceStations(
          list.map((x: any) => ({ value: String(x.police_station_code), label: x.name_of_police_station })),
        );
      })
      .catch(() => setPoliceStations([]));
  }, [form.district]);

  // Area types when district + subdivision are set.
  useEffect(() => {
    if (!form.district || !form.subdivision) {
      setAreaTypes([]);
      return;
    }
    axios
      .get(`${API_BASE}areatype/${form.district}/${form.subdivision}`)
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        const seen = new Set<string>();
        const out: Option[] = [];
        for (const row of list) {
          const t = String(row.type ?? "").toUpperCase();
          if (t && !seen.has(t)) {
            seen.add(t);
            out.push({ value: t, label: AREA_TYPE_LABELS[t] ?? t });
          }
        }
        setAreaTypes(out);
      })
      .catch(() => setAreaTypes([]));
  }, [form.district, form.subdivision]);

  // Municipalities/blocks when area type is chosen.
  useEffect(() => {
    if (!form.district || !form.subdivision || !form.areaType) {
      setMunicipalities([]);
      return;
    }
    axios
      .get(`${API_BASE}block/${form.district}/${form.subdivision}/${form.areaType}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setMunicipalities(list.map((x: any) => ({ value: String(x.block_code), label: x.block_mun_name })));
      })
      .catch(() => setMunicipalities([]));
  }, [form.district, form.subdivision, form.areaType]);

  // Wards/villages when municipality is chosen.
  useEffect(() => {
    if (!form.municipality) {
      setWards([]);
      return;
    }
    axios
      .get(`${API_BASE}villageward/${form.municipality}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setWards(list.map((x: any) => ({ value: String(x.village_code), label: x.village_name })));
      })
      .catch(() => setWards([]));
  }, [form.municipality]);

  /* -------------------- MOBILE / OTP -------------------- */
  const unlockMobile = () => {
    setMobileEditable(true);
    setMobileVerified(false);
  };

  const openOtpModal = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSending(true);
    try {
      const res = await axios.post(`${API_BASE}auth/send-mobile-otp`, { mobile: form.mobile.trim() });
      const data = res?.data;
      if (data?.encryptedOtp) {
        setOtpMeta({ encryptedOtp: data.encryptedOtp, expiresAt: data.expiresAt, mobile: data.mobile });
        setOtpValue("");
        setOtpModalOpen(true);
        toast.success("OTP sent to your new mobile number.");
      } else {
        toast.error(data?.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpMeta) return;
    if (!/^\d{6}$/.test(otpValue)) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await axios.post(`${API_BASE}auth/verify-mobile-otp`, {
        otp: otpValue,
        encryptedOtp: otpMeta.encryptedOtp,
        expiresAt: otpMeta.expiresAt,
      });
      if (res?.data?.verified) {
        setMobileVerified(true);
        setMobileEditable(false);
        setOtpModalOpen(false);
        toast.success("Mobile number verified.");
      } else {
        toast.error(res?.data?.message || "Invalid OTP.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name is required.");
    if (!form.employeeId.trim()) return toast.error("Employee Id (HRMS) is required.");
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim()))
      return toast.error("Enter a valid 10-digit mobile number.");

    // A changed personal mobile must be OTP-verified before saving.
    if (mobileChanged && !mobileVerified) {
      toast.error("Please verify your new mobile number via OTP before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        // Locate the row by the logged-in uid so the Employee Id can be edited.
        ...(userId ? { uid: Number(userId) } : {}),
        name: form.name,
        employeeId: form.employeeId,
        mobile: form.mobile,
        govtMobile: form.govtMobile,
        contactOffice: form.contactOffice,
        personalEmail: form.personalEmail,
        govtEmail: form.govtEmail,
        officeEmail: form.officeEmail,
        gender: form.gender,
        category: form.category,
        designation: form.designation,
        additionalCharge: form.additionalCharge,
        // Editable date fields (DD-MM-YYYY or YYYY-MM-DD, both accepted by the API).
        dob: form.dob,
        doj_lc: form.doj_lc,
        doe: form.doe,
        doj_present: form.doj_present,
        dor: form.dor,
        // Address (Permanent Residential)
        addressLine: form.addressLine,
        pinCode: form.pinCode,
        postOffice: form.postOffice,
        district: form.district,
        subdivision: form.subdivision,
        areaType: form.areaType,
        municipality: form.municipality,
        ward: form.ward,
        policeStation: form.policeStation,
      };

      const res = await axios.post(`${API_BASE}custom_user/edit`, payload);
      if (res?.data?.code === 200 || res.status === 200 || res.status === 201) {
        toast.success("Profile updated successfully.");
        setOriginalMobile(form.mobile.trim());
        setMobileVerified(false);
        navigate("/dashboard");
      } else {
        toast.error(res?.data?.message || "Update failed.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-15">
      <h1 className="text-2xl text-gray-800 mb-4">Update Profile</h1>

      <form onSubmit={handleSubmit}>
        {/* ================= BASIC INFORMATION ================= */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="border-t-4 border-blue-500 rounded-t-md px-4 py-3 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-medium text-gray-700">Basic Information</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
            <Field label="Name" required>
              <input className={inputBase} name="name" value={form.name} onChange={handleChange} />
            </Field>

            <Field label="Employee Id(HRMS)" required>
              <input className={inputBase} name="employeeId" value={form.employeeId} onChange={handleChange} />
            </Field>

            <Field label="Date of Birth" required>
              <input
                type="date"
                className={inputBase}
                name="dob"
                value={toDateInputValue(form.dob)}
                onChange={handleChange}
              />
            </Field>

            {/* Mobile Number with OTP verification */}
            <Field
              label="Mobile Number"
              required
              labelAdornment={
                <button
                  type="button"
                  onClick={unlockMobile}
                  title="Edit mobile number"
                  className="text-orange-500 text-xs ml-1 cursor-pointer align-middle"
                >
                  ✎
                </button>
              }
            >
              <div className="flex gap-2">
                <input
                  className={mobileEditable ? inputBase : disabledCls}
                  name="mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  disabled={!mobileEditable}
                  onChange={(e) => {
                    setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10));
                    setMobileVerified(false);
                  }}
                />
                {mobileEditable && mobileChanged && (
                  <button
                    type="button"
                    onClick={openOtpModal}
                    disabled={otpSending}
                    className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 rounded disabled:opacity-60"
                  >
                    {otpSending ? "Sending…" : "Verify"}
                  </button>
                )}
              </div>
              {mobileChanged && (
                <p className={`text-xs mt-1 ${mobileVerified ? "text-green-600" : "text-red-500"}`}>
                  {mobileVerified ? "✓ New number verified" : "New number needs OTP verification"}
                </p>
              )}
            </Field>

            <Field label="Mobile Number(Govt.)" required>
              <input
                className={inputBase}
                name="govtMobile"
                inputMode="numeric"
                maxLength={10}
                value={form.govtMobile}
                onChange={(e) => setField("govtMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </Field>

            <Field label="Contact Number(Office)">
              <input className={inputBase} name="contactOffice" value={form.contactOffice} onChange={handleChange} />
            </Field>

            <Field label="E-mail Address(Personal)" required>
              <input className={inputBase} name="personalEmail" type="email" value={form.personalEmail} onChange={handleChange} />
            </Field>

            <Field label="E-mail Address (Govt.)">
              <input className={inputBase} name="govtEmail" type="email" value={form.govtEmail} onChange={handleChange} />
            </Field>

            <Field label="E-mail Address(Office)" required>
              <input className={inputBase} name="officeEmail" type="email" value={form.officeEmail} onChange={handleChange} />
            </Field>

            <Field label="Gender" required>
              <select className={inputBase} name="gender" value={form.gender} onChange={handleChange}>
                <option value="">- Select -</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Category" required>
              <select className={inputBase} name="category" value={form.category} onChange={handleChange}>
                <option value="">- Select -</option>
                {(CATEGORY_OPTIONS.includes(form.category) || !form.category
                  ? CATEGORY_OPTIONS
                  : [form.category, ...CATEGORY_OPTIONS]
                ).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Post" required>
              <input className={disabledCls} name="post" value={form.post} disabled />
            </Field>

            <Field label="Designation" required>
              <select className={inputBase} name="designation" value={form.designation} onChange={handleChange}>
                <option value="">Select designation</option>
                {(DESIGNATION_OPTIONS.includes(form.designation) || !form.designation
                  ? DESIGNATION_OPTIONS
                  : [form.designation, ...DESIGNATION_OPTIONS]
                ).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>

            <Field label="Department" required>
              <input className={disabledCls} name="department" value={form.department} disabled />
            </Field>

            <Field label="Location" required>
              <input className={disabledCls} name="location" value={form.location} disabled />
            </Field>

            <Field label="Date of Joining" required note="In Labour Commissionerate">
              <input
                type="date"
                className={inputBase}
                name="doj_lc"
                value={toDateInputValue(form.doj_lc)}
                onChange={handleChange}
              />
            </Field>

            <Field label="Date of entry" required note="In Present Post">
              <input
                type="date"
                className={inputBase}
                name="doe"
                value={toDateInputValue(form.doe)}
                onChange={handleChange}
              />
            </Field>

            <Field label="Date of Joining" required note="In Present Posting">
              <input
                type="date"
                className={inputBase}
                name="doj_present"
                value={toDateInputValue(form.doj_present)}
                onChange={handleChange}
              />
            </Field>

            <Field label="Date of Retirement" required>
              <input
                type="date"
                className={inputBase}
                name="dor"
                value={toDateInputValue(form.dor)}
                onChange={handleChange}
              />
            </Field>

            <Field label="Is this your additional charge?" required>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="additionalCharge"
                    value="Yes"
                    checked={form.additionalCharge === "Yes"}
                    onChange={handleChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="additionalCharge"
                    value="No"
                    checked={form.additionalCharge === "No"}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </Field>
          </div>
        </div>

        {/* ================= PERMANENT RESIDENTIAL ADDRESS ================= */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm mt-6">
          <div className="border-t-4 border-blue-500 rounded-t-md px-4 py-3 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-medium text-gray-700">Permanent Residential Address(Personal)</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-800">
                Village/Street/Building/Others <span className="text-red-500">*</span>
              </label>
              <textarea
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
              <Field label="PIN Code" required>
                <input
                  className={inputBase}
                  name="pinCode"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pinCode}
                  onChange={(e) => setField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </Field>

              <Field label="Post Office" required>
                {/* Stored in res_postoffice (numeric code column). */}
                <input
                  className={inputBase}
                  name="postOffice"
                  inputMode="numeric"
                  placeholder="Post office code"
                  value={form.postOffice}
                  onChange={(e) => setField("postOffice", e.target.value.replace(/\D/g, ""))}
                />
              </Field>

              <Field label="District" required>
                <select
                  className={inputBase}
                  value={form.district}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      district: v,
                      subdivision: "",
                      areaType: "",
                      municipality: "",
                      ward: "",
                      policeStation: "",
                    }));
                  }}
                >
                  <option value="">- Select District -</option>
                  {districts.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Subdivision" required>
                <select
                  className={inputBase}
                  value={form.subdivision}
                  disabled={!form.district}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      subdivision: v,
                      areaType: "",
                      municipality: "",
                      ward: "",
                    }));
                  }}
                >
                  <option value="">- Select Subdivision -</option>
                  {subdivisions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Area type" required>
                <select
                  className={inputBase}
                  value={form.areaType}
                  disabled={!form.subdivision}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({ ...prev, areaType: v, municipality: "", ward: "" }));
                  }}
                >
                  <option value="">- Select Area type -</option>
                  {areaTypes.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Municipality" required>
                <select
                  className={inputBase}
                  value={form.municipality}
                  disabled={!form.areaType}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({ ...prev, municipality: v, ward: "" }));
                  }}
                >
                  <option value="">- Select -</option>
                  {municipalities.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Ward" required>
                <select
                  className={inputBase}
                  name="ward"
                  value={form.ward}
                  disabled={!form.municipality}
                  onChange={handleChange}
                >
                  <option value="">- Select Ward -</option>
                  {wards.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Police Station" required>
                <select
                  className={inputBase}
                  name="policeStation"
                  value={form.policeStation}
                  disabled={!form.district}
                  onChange={handleChange}
                >
                  <option value="">- Select Police Station -</option>
                  {policeStations.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Updating…" : "Update"}
          </button>
        </div>
      </form>

      {/* ================= OTP MODAL ================= */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOtpModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded shadow-lg">
            <div className="flex justify-between items-center bg-[#2b5f88] text-white px-4 py-3 rounded-t">
              <h2 className="text-base font-semibold">Verify Mobile Number</h2>
              <button onClick={() => setOtpModalOpen(false)} className="text-xl font-bold leading-none">
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-semibold">{otpMeta?.mobile ?? form.mobile}</span>.
              </p>

              <input
                autoFocus
                className="w-full border p-2 tracking-[0.5em] text-center text-lg"
                inputMode="numeric"
                maxLength={6}
                placeholder="______"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={openOtpModal}
                  disabled={otpSending}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-60"
                >
                  {otpSending ? "Resending…" : "Resend OTP"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otpVerifying}
                    className="px-4 py-2 rounded text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {otpVerifying ? "Verifying…" : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
