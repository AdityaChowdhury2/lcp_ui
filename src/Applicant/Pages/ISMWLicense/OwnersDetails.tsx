import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import {
  fetchStates,
  fetchDistricts,
  fetchSubdivisions,
  fetchAreaTypes,
  fetchBlocks,
  fetchVillages,
  fetchPoliceStations,
  fetchDirectorPartnerList,
  saveDirectorPartnerDetails,
  type Option,
  type DirectorPartnerRow,
} from "./ismwLicenseApi";
import { useEmploymentFlow } from "./EmploymentFlowContext";

type FormState = Record<string, string>;

const INITIAL_FORM: FormState = {
  name: "",
  designation: "",
  email: "",
  contactNumber: "",
  country: "1", // default India
  addressLine1: "",
  state: "",
  district: "",
  subdivision: "",
  areaType: "",
  areaCode: "",
  village: "",
  policeStation: "",
  pinCode: "",
};

const INPUT =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a] bg-white rounded-sm";
const LABEL = "text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider";
const req = <span className="text-red-500 font-bold">*</span>;

/* ---------------------------------------------------------------------------
   Address Cascade for West Bengal (State = 1)
--------------------------------------------------------------------------- */
const WBAddressCascade: FC<{
  values: FormState;
  patch: (p: Record<string, string>) => void;
}> = ({ values, patch }) => {
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [areaTypes, setAreaTypes] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const stateId = "1"; // West Bengal
  const district = values.district;
  const subdivision = values.subdivision;
  const areatype = values.areaType;
  const block = values.areaCode;

  useEffect(() => {
    fetchDistricts(stateId).then(setDistricts);
  }, [stateId]);

  useEffect(() => {
    if (district) {
      fetchSubdivisions(district).then(setSubdivisions);
      fetchPoliceStations(district).then(setPoliceStations);
    } else {
      setSubdivisions([]);
      setPoliceStations([]);
    }
  }, [district]);

  useEffect(() => {
    if (district && subdivision) {
      fetchAreaTypes(district, subdivision).then(setAreaTypes);
    } else {
      setAreaTypes([]);
    }
  }, [district, subdivision]);

  useEffect(() => {
    if (district && subdivision && areatype) {
      fetchBlocks(district, subdivision, areatype).then(setBlocks);
    } else {
      setBlocks([]);
    }
  }, [district, subdivision, areatype]);

  useEffect(() => {
    if (block) {
      fetchVillages(block).then(setVillages);
    } else {
      setVillages([]);
    }
  }, [block]);

  const Select: FC<{
    name: string;
    label: string;
    options: Option[];
    onChange: (v: string) => void;
  }> = ({ name, label, options, onChange }) => (
    <div>
      <label className={LABEL}>
        {label} {req}
      </label>
      <select
        className={INPUT}
        value={values[name] ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">- Select -</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <Select
        name="district"
        label="Select District"
        options={districts}
        onChange={(v) =>
          patch({
            district: v,
            subdivision: "",
            areaType: "",
            areaCode: "",
            village: "",
            policeStation: "",
          })
        }
      />

      <Select
        name="subdivision"
        label="Select Subdivision"
        options={subdivisions}
        onChange={(v) =>
          patch({
            subdivision: v,
            areaType: "",
            areaCode: "",
            village: "",
          })
        }
      />

      <Select
        name="areaType"
        label="Select Area Type"
        options={areaTypes}
        onChange={(v) =>
          patch({
            areaType: v,
            areaCode: "",
            village: "",
          })
        }
      />

      <Select
        name="areaCode"
        label="Select Block/Mun/Corp"
        options={blocks}
        onChange={(v) => patch({ areaCode: v, village: "" })}
      />

      <Select
        name="village"
        label="Select Gram Panchayat/Ward"
        options={villages}
        onChange={(v) => patch({ village: v })}
      />

      <Select
        name="policeStation"
        label="Select Police Station"
        options={policeStations}
        onChange={(v) => patch({ policeStation: v })}
      />
    </>
  );
};

/* ---------------------------------------------------------------------------
   Main Component
--------------------------------------------------------------------------- */
const OwnersDetails: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const licenceIdEncRaw = params["*"] || "";
  const licenceIdEnc = flow?.licenceIdEnc || decodeURIComponent(licenceIdEncRaw);

  const [states, setStates] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<DirectorPartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const patch = (p: Record<string, string>) =>
    setForm((f) => ({ ...f, ...p }));

  const loadData = async () => {
    try {
      const [stList, listRes] = await Promise.all([
        fetchStates(1),
        fetchDirectorPartnerList(licenceIdEnc),
      ]);
      setStates(stList);
      setEmployees(listRes.employees || []);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to load owners details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [licenceIdEnc]);

  const handleSavePerson = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!form.designation.trim()) {
      toast.error("Designation is required.");
      return;
    }
    if (!/^\d{10}$/.test(form.contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number.");
      return;
    }
    if (!form.state) {
      toast.error("Please select a state.");
      return;
    }
    if (!form.addressLine1.trim()) {
      toast.error("Address Line 1 is required.");
      return;
    }

    // Validation for West Bengal cascades
    if (form.state === "1") {
      if (!form.district) {
        toast.error("District is required for West Bengal.");
        return;
      }
      if (!form.subdivision) {
        toast.error("Subdivision is required for West Bengal.");
        return;
      }
      if (!form.areaType) {
        toast.error("Area Type is required for West Bengal.");
        return;
      }
      if (!form.areaCode) {
        toast.error("Block/Mun/Corp is required for West Bengal.");
        return;
      }
      if (!form.village) {
        toast.error("Gram Panchayat/Ward is required for West Bengal.");
        return;
      }
      if (!form.policeStation) {
        toast.error("Police Station is required for West Bengal.");
        return;
      }
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setSaving(true);
      // This module no longer encrypts ids — send the plain ISMW employment act id.
      const payload: Record<string, any> = {
        actId: "42",
        licenceId: licenceIdEnc,
        dpName: form.name.trim(),
        designation: "others",
        otherDesignation: form.designation.trim(),
        email: form.email.trim() || undefined,
        contactNumber: form.contactNumber,
        address: form.addressLine1.trim(),
        country: "1", // India
        state: form.state,
        pinCode: form.pinCode,
      };

      // Only pass West Bengal cascades if state is West Bengal
      if (form.state === "1") {
        payload.district = form.district;
        payload.subdivision = form.subdivision;
        payload.areaType = form.areaType;
        payload.areaCode = form.areaCode;
        payload.village = form.village;
        payload.policeStation = form.policeStation;
      }

      await saveDirectorPartnerDetails(payload);
      toast.success("Person in-charge added successfully.");
      
      // Reset and close form
      setForm(INITIAL_FORM);
      setShowAddForm(false);
      
      // Reload list
      loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to save person."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (flow) {
      flow.goToTab("workmen");
    } else {
      navigate(`/ismw-license/workmen-info/${encodeURIComponent(licenceIdEnc)}`);
    }
  };

  const directors = employees.filter(
    (e) => e.designation === "director" || e.designation === "partner"
  );
  const personsInCharge = employees.filter((e) => e.designation === "others");

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading owners details…
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Employment License — Owners Details
        </h1>
      </div>

      {/* Tab bar */}
      <EmploymentTabBar active="owners" licenceIdEnc={licenceIdEnc} />

      <div className="px-4 pt-4">
        {/* SECTION 1: DIRECTORS/PARTNERS */}
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            Name and Address of the Directors/Partners [In case of Companies and Firms]
          </div>
          <div className="p-4">
            <button
              type="button"
              disabled
              className="bg-gray-300 text-gray-600 px-4 py-2 text-sm font-semibold rounded mb-4 cursor-not-allowed border border-gray-400"
            >
              + Add New Director/Partner
            </button>

            {directors.length === 0 ? (
              <div className="border border-gray-200 bg-gray-50 rounded p-4 text-sm text-gray-500 font-semibold italic text-center">
                No data found!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm text-left">
                  <thead>
                    <tr className="bg-[#2c5f8a] text-white text-xs font-bold uppercase tracking-wider">
                      <th className="border p-2 w-16 text-center">Sl. No</th>
                      <th className="border p-2">Name</th>
                      <th className="border p-2">Designation</th>
                      <th className="border p-2">Address</th>
                      <th className="border p-2">Contact Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directors.map((d, index) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="border p-2 text-center font-semibold">{index + 1}</td>
                        <td className="border p-2 font-semibold text-gray-800">{d.name}</td>
                        <td className="border p-2 capitalize text-gray-700">{d.designation}</td>
                        <td className="border p-2 text-gray-600">{d.address}</td>
                        <td className="border p-2 text-xs text-gray-600">
                          {d.email && <div>Email: {d.email}</div>}
                          {d.contactNumber && <div>Contact: {d.contactNumber}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: PERSONS IN CHARGE */}
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            Name(s) and Address(es) of the Person(s) in Charge of and Responsible to the Company/Firm for the Conduct of the Business of the Company / Firm
          </div>
          <div className="p-4">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-2 text-sm font-semibold rounded mb-4 shadow transition"
            >
              {showAddForm ? "Cancel Add Person" : "+ Add New Person"}
            </button>

            {/* ADD PERSON FORM */}
            {showAddForm && (
              <div className="border rounded bg-gray-50 border-gray-300 p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase tracking-wider">
                  Add Person In-Charge of and Responsible to the Company/Firm for the Conduct of the Business
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Name {req}</label>
                    <input
                      type="text"
                      className={INPUT}
                      value={form.name}
                      onChange={(e) => patch({ name: e.target.value })}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Select Designation {req}</label>
                    <input
                      type="text"
                      className={INPUT}
                      value={form.designation}
                      onChange={(e) => patch({ designation: e.target.value })}
                      placeholder="e.g. Manager"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Email</label>
                    <input
                      type="email"
                      className={INPUT}
                      value={form.email}
                      onChange={(e) => patch({ email: e.target.value })}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Contact Number {req}</label>
                    <input
                      type="text"
                      maxLength={10}
                      className={INPUT}
                      value={form.contactNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        patch({ contactNumber: val });
                      }}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Select Country {req}</label>
                    <select className={INPUT} disabled value="1">
                      <option value="1">India</option>
                    </select>
                  </div>

                  <div>
                    <label className={LABEL}>Select State {req}</label>
                    <select
                      className={INPUT}
                      value={form.state}
                      onChange={(e) =>
                        patch({
                          state: e.target.value,
                          district: "",
                          subdivision: "",
                          areaType: "",
                          areaCode: "",
                          village: "",
                          policeStation: "",
                        })
                      }
                    >
                      <option value="">- Select State -</option>
                      {states.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WEST BENGAL ADDRESS CASCADE */}
                  {form.state === "1" && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <WBAddressCascade values={form} patch={patch} />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className={LABEL}>Address Line1 {req}</label>
                    <input
                      type="text"
                      className={INPUT}
                      value={form.addressLine1}
                      onChange={(e) => patch({ addressLine1: e.target.value })}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={LABEL}>PIN Number {req}</label>
                    <input
                      type="text"
                      maxLength={6}
                      className={INPUT}
                      value={form.pinCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        patch({ pinCode: val });
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSavePerson}
                    className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-xs font-semibold uppercase tracking-wider transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* PERSONS IN CHARGE LIST TABLE */}
            {personsInCharge.length === 0 ? (
              <div className="border border-gray-200 bg-gray-50 rounded p-4 text-sm text-gray-500 font-semibold italic text-center">
                No data found!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm text-left">
                  <thead>
                    <tr className="bg-[#2c5f8a] text-white text-xs font-bold uppercase tracking-wider">
                      <th className="border p-3 w-16 text-center">Sl. No</th>
                      <th className="border p-3">Name</th>
                      <th className="border p-3">Designation</th>
                      <th className="border p-3">Address</th>
                      <th className="border p-3">Contact Details</th>
                      <th className="border p-3 w-24 text-center">Status</th>
                      <th className="border p-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personsInCharge.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-50 text-gray-800">
                        <td className="border p-3 text-center font-semibold">{index + 1}</td>
                        <td className="border p-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="border p-3 text-gray-700 capitalize">
                          {p.designationOthers || p.designation}
                        </td>
                        <td className="border p-3 text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                          {p.address}
                        </td>
                        <td className="border p-3 text-xs text-gray-600 leading-normal">
                          {p.email && (
                            <div>
                              <span className="font-semibold text-gray-700">Email:</span> {p.email}
                            </div>
                          )}
                          {p.contactNumber && (
                            <div>
                              <span className="font-semibold text-gray-700">Contact:</span>{" "}
                              {p.contactNumber}
                            </div>
                          )}
                        </td>
                        <td className="border p-3 text-center text-xs">
                          <span className="bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="border p-3 text-center text-xs">
                          <span className="text-gray-400">—</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleContinue}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2.5 rounded text-sm font-semibold tracking-wide shadow-md transition"
          >
            SAVE & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnersDetails;
