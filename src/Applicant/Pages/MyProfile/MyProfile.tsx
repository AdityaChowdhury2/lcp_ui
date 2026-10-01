import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPerson, MdLocationOn, MdLock } from "react-icons/md";

/* -------------------- SMALL UI HELPERS -------------------- */
const inputBase =
  "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2b5f88]";
const disabledCls =
  "w-full border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed";

const Field: React.FC<{
  label: string;
  required?: boolean;
  note?: string;
  children: React.ReactNode;
}> = ({ label, required, note, children }) => (
  <div>
    <label className="block text-[13px] font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {note && <p className="text-[11px] text-gray-500 mt-1">{note}</p>}
  </div>
);

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-5">
    <div className="border-t-4 border-[#2b5f88] rounded-t-md px-4 py-3 flex items-center gap-2 border-b border-b-gray-200">
      <span className="text-[#2b5f88] text-xl">{icon}</span>
      <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
        {title}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* -------------------- OPTIONS (same masters the registration form uses) -------------------- */
type Option = { value: string; label: string };

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

const GENDERS: Option[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

/* -------------------- FORM MODEL -------------------- */
interface ProfileForm {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  cardType: string;
  cardNumber: string;

  // Contact + residential address
  email: string;
  mobile: string;
  contactNumber: string;
  address: string;
  pin: string;
  district: string;
  subdivision: string;
  areaType: string;
  block: string;
  villWard: string;
  ps: string;
}

const EMPTY_FORM: ProfileForm = {
  firstName: "", middleName: "", lastName: "", dob: "", gender: "", cardType: "", cardNumber: "",
  email: "", mobile: "", contactNumber: "", address: "", pin: "", district: "", subdivision: "",
  areaType: "", block: "", villWard: "", ps: "",
};

/** API values arrive as numbers/Decimals/ISO dates — normalise them for inputs. */
const str = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v);
const dateStr = (v: unknown): string => {
  const s = str(v);
  return s ? s.slice(0, 10) : "";
};

/* -------------------- ADDRESS CASCADE -------------------- */
/**
 * Loads the district → subdivision → area type → block → ward option lists for
 * the residential address, from the same masters endpoints the registration
 * form uses.
 */
function useAddressCascade(
  district: string,
  subdivision: string,
  areaType: string,
  block: string,
) {
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [areaTypes, setAreaTypes] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const rows = (res: any): any[] =>
    Array.isArray(res.data) ? res.data : res.data?.data ?? [];

  useEffect(() => {
    axios
      .get(`${API_BASE}district`)
      .then((res) =>
        setDistricts(
          rows(res).map((x: any) => ({
            value: String(x.district_code),
            label: x.district_name,
          })),
        ),
      )
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (!district) {
      setSubdivisions([]);
      setPoliceStations([]);
      return;
    }
    axios
      .get(`${API_BASE}subdivision/${district}`)
      .then((res) =>
        setSubdivisions(
          rows(res).map((x: any) => ({
            value: String(x.sub_div_code),
            label: x.sub_div_name,
          })),
        ),
      )
      .catch(() => setSubdivisions([]));
    axios
      .get(`${API_BASE}policestation/${district}`)
      .then((res) =>
        setPoliceStations(
          rows(res).map((x: any) => ({
            value: String(x.police_station_code),
            label: x.name_of_police_station,
          })),
        ),
      )
      .catch(() => setPoliceStations([]));
  }, [district]);

  useEffect(() => {
    if (!district || !subdivision) {
      setAreaTypes([]);
      return;
    }
    axios
      .get(`${API_BASE}areatype/${district}/${subdivision}`)
      .then((res) => {
        const seen = new Set<string>();
        const out: Option[] = [];
        for (const row of rows(res)) {
          const t = String(row.type ?? "").toUpperCase();
          if (t && !seen.has(t)) {
            seen.add(t);
            out.push({ value: t, label: AREA_TYPE_LABELS[t] ?? t });
          }
        }
        setAreaTypes(out);
      })
      .catch(() => setAreaTypes([]));
  }, [district, subdivision]);

  useEffect(() => {
    if (!district || !subdivision || !areaType) {
      setBlocks([]);
      return;
    }
    axios
      .get(`${API_BASE}block/${district}/${subdivision}/${areaType}`)
      .then((res) =>
        setBlocks(
          rows(res).map((x: any) => ({
            value: String(x.block_code),
            label: x.block_mun_name,
          })),
        ),
      )
      .catch(() => setBlocks([]));
  }, [district, subdivision, areaType]);

  useEffect(() => {
    if (!block) {
      setWards([]);
      return;
    }
    axios
      .get(`${API_BASE}villageward/${block}`)
      .then((res) =>
        setWards(
          rows(res).map((x: any) => ({
            value: String(x.village_code),
            label: x.village_name,
          })),
        ),
      )
      .catch(() => setWards([]));
  }, [block]);

  return { districts, subdivisions, areaTypes, blocks, wards, policeStations };
}

/* -------------------- PAGE -------------------- */
const MyProfile: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [account, setAccount] = useState<{ username: string; accountEmail: string }>({
    username: "",
    accountEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authHeader = { Authorization: `Bearer ${getAuthToken() ?? ""}` };

  const home = useAddressCascade(form.district, form.subdivision, form.areaType, form.block);

  const setField = (name: keyof ProfileForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setField(e.target.name as keyof ProfileForm, e.target.value);

  /** Digits-only setter for the numeric columns (mobile, PIN). */
  const setDigits = (name: keyof ProfileForm, value: string, max: number) =>
    setField(name, value.replace(/\D/g, "").slice(0, max));

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}users/applicant-profile`, {
          headers: authHeader,
        });
        const d = res?.data?.data;
        setAccount({
          username: str(res?.data?.account?.username),
          accountEmail: str(res?.data?.account?.accountEmail),
        });
        if (d) {
          setForm({
            firstName: str(d.firstName),
            middleName: str(d.middleName),
            lastName: str(d.lastName),
            dob: dateStr(d.dob),
            gender: str(d.gender),
            cardType: str(d.cardType),
            cardNumber: str(d.cardNumber),

            email: str(d.email),
            mobile: str(d.mobile),
            contactNumber: str(d.contactNumber),
            address: str(d.address),
            pin: str(d.pin),
            district: str(d.districtCode),
            subdivision: str(d.subdivisionCode),
            areaType: str(d.areaType).toUpperCase(),
            block: str(d.areaTypeCode),
            villWard: str(d.villageWardCode),
            ps: str(d.policeStation),
          });
        }
      } catch (error: any) {
        console.error("Fetch applicant profile error:", error);
        toast.error(
          error?.response?.data?.message || "Unable to load your profile details.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- SAVE -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim()) return toast.error("First name is required.");
    if (!form.lastName.trim()) return toast.error("Last name is required.");
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return toast.error("Enter a valid e-mail address.");
    if (form.mobile.trim() && !/^[6-9]\d{9}$/.test(form.mobile.trim()))
      return toast.error("Enter a valid 10-digit mobile number.");
    if (form.pin.trim() && form.pin.trim().length !== 6)
      return toast.error("PIN code must be of 6 digits.");

    // The API rejects unknown keys (forbidNonWhitelisted) and empty strings on
    // typed fields, so blanks are dropped rather than sent.
    const text = (v: string) => {
      const t = v.trim();
      return t === "" ? undefined : t;
    };
    const num = (v: string) => {
      const t = v.trim();
      if (t === "") return undefined;
      const n = Number(t);
      return Number.isFinite(n) ? n : undefined;
    };

    setSaving(true);
    try {
      const payload = {
        firstName: text(form.firstName),
        middleName: text(form.middleName),
        lastName: text(form.lastName),
        dob: text(form.dob),
        gender: text(form.gender),
        cardType: num(form.cardType),
        cardNumber: text(form.cardNumber),

        email: text(form.email)?.toLowerCase(),
        mobile: num(form.mobile),
        contactNumber: num(form.contactNumber),
        address: text(form.address),
        pin: num(form.pin),
        districtCode: text(form.district),
        subdivisionCode: num(form.subdivision),
        areaType: text(form.areaType),
        areaTypeCode: num(form.block),
        villageWardCode: num(form.villWard),
        policeStation: text(form.ps),
      };

      const body = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined),
      );

      const res = await axios.post(`${API_BASE}users/applicant-profile`, body, {
        headers: authHeader,
      });

      if (res?.data?.status === "success") {
        toast.success(res.data.message || "Profile updated successfully.");
        if (payload.email) {
          setAccount((prev) => ({ ...prev, accountEmail: payload.email as string }));
        }
      } else {
        toast.error(res?.data?.message || "Update failed.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg[0] : msg || "Server error. Please try again.",
      );
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
    <div className="mb-10">
      <div className="bg-white p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">MY PROFILE</h1>
          <p className="text-xs text-gray-500 mt-1">
            Keep your personal and contact details up to date. Login credentials
            cannot be changed from this page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/change-password-applicant")}
          className="flex items-center gap-1 border border-[#2b5f88] text-[#2b5f88] px-3 py-2 text-xs font-semibold hover:bg-[#2b5f88] hover:text-white"
        >
          <MdLock size={16} /> Change Password
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ================= ACCOUNT (READ ONLY) ================= */}
        <Section title="Account Information" icon={<MdLock />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="Username" note="Login ID — cannot be changed.">
              <input className={disabledCls} value={account.username} disabled />
            </Field>
            <Field
              label="Registered Account E-mail"
              note="Updated automatically when you change the e-mail below."
            >
              <input className={disabledCls} value={account.accountEmail} disabled />
            </Field>
          </div>
        </Section>

        {/* ================= PERSONAL ================= */}
        <Section title="Personal Details" icon={<MdPerson />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="First Name" required>
              <input
                className={inputBase}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Middle Name">
              <input
                className={inputBase}
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Last Name" required>
              <input
                className={inputBase}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                className={inputBase}
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </Field>
            <Field label="Gender">
              <select
                className={inputBase}
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">- Select -</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ID Card Type">
              <select
                className={inputBase}
                name="cardType"
                value={form.cardType}
                onChange={handleChange}
              >
                <option value="">- Select -</option>
                {CARD_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="ID Card Number">
              <input
                className={inputBase}
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
              />
            </Field>
          </div>
        </Section>

        {/* ================= CONTACT + ADDRESS ================= */}
        <Section title="Contact & Residential Address" icon={<MdLocationOn />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
            <Field label="E-mail">
              <input
                className={inputBase}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </Field>
            <Field label="Mobile Number" note="10 digits, starting 6-9.">
              <input
                className={inputBase}
                name="mobile"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => setDigits("mobile", e.target.value, 10)}
              />
            </Field>
            <Field label="Other Contact Number">
              <input
                className={inputBase}
                name="contactNumber"
                inputMode="numeric"
                value={form.contactNumber}
                onChange={(e) => setDigits("contactNumber", e.target.value, 15)}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Address (Village / Street / Building)">
              <textarea
                className={inputBase}
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-5">
            <Field label="District">
              <select
                className={inputBase}
                value={form.district}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    district: e.target.value,
                    subdivision: "",
                    areaType: "",
                    block: "",
                    villWard: "",
                    ps: "",
                  }))
                }
              >
                <option value="">- Select -</option>
                {home.districts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sub-division">
              <select
                className={inputBase}
                disabled={!form.district}
                value={form.subdivision}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    subdivision: e.target.value,
                    areaType: "",
                    block: "",
                    villWard: "",
                  }))
                }
              >
                <option value="">- Select -</option>
                {home.subdivisions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Area Type">
              <select
                className={inputBase}
                disabled={!form.subdivision}
                value={form.areaType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    areaType: e.target.value,
                    block: "",
                    villWard: "",
                  }))
                }
              >
                <option value="">- Select -</option>
                {home.areaTypes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Block / Municipality">
              <select
                className={inputBase}
                disabled={!form.areaType}
                value={form.block}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, block: e.target.value, villWard: "" }))
                }
              >
                <option value="">- Select -</option>
                {home.blocks.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Village / Ward">
              <select
                className={inputBase}
                disabled={!form.block}
                name="villWard"
                value={form.villWard}
                onChange={handleChange}
              >
                <option value="">- Select -</option>
                {home.wards.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Police Station">
              <select
                className={inputBase}
                disabled={!form.district}
                name="ps"
                value={form.ps}
                onChange={handleChange}
              >
                <option value="">- Select -</option>
                {home.policeStations.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="PIN Code">
              <input
                className={inputBase}
                inputMode="numeric"
                value={form.pin}
                onChange={(e) => setDigits("pin", e.target.value, 6)}
              />
            </Field>
          </div>
        </Section>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/applicant-dashboard")}
            className="border border-gray-400 text-gray-700 px-6 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2b5f88] text-white px-8 py-2 text-sm font-semibold hover:bg-[#24507a] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
