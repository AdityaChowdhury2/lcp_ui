import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import { useEmploymentFlow } from "./EmploymentFlowContext";
import {
  fetchStates,
  fetchWorkmenList,
  saveWorkmanDetails,
  deleteWorkman,
  type Option,
  type WorkmanRow,
} from "./ismwLicenseApi";

type FormState = Record<string, string>;

const INITIAL_FORM: FormState = {
  id: "", // present if editing
  workmenName: "",
  guardianName: "",
  workmenDob: "", // YYYY-MM-DD for native input
  contactNumber: "",
  email: "",
  idProof: "",
  workmenState: "",
  policeStation: "",
  pinCode: "",
  addressWorkmen: "",
  workmenType: "",
};

const INPUT =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a] bg-white rounded-sm";
const TEXTAREA =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a] bg-white rounded-sm h-24 resize-y";
const LABEL = "text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider";
const req = <span className="text-red-500 font-bold">*</span>;

const SKILL_OPTIONS = [
  { value: "1", label: "Highly Skilled" },
  { value: "2", label: "Skilled" },
  { value: "3", label: "Semi-Skilled" },
  { value: "4", label: "Unskilled" },
];

const getSkillLabel = (val: string) => {
  const matched = SKILL_OPTIONS.find((o) => o.value === val);
  return matched ? matched.label : val || "—";
};

const WorkmenDetails: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const licenceIdEncRaw = params["*"] || "";
  const licenceIdEnc = flow?.licenceIdEnc || decodeURIComponent(licenceIdEncRaw);

  const [states, setStates] = useState<Option[]>([]);
  const [workmen, setWorkmen] = useState<WorkmanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const patch = (p: Record<string, string>) =>
    setForm((f) => ({ ...f, ...p }));

  const loadData = async () => {
    try {
      const [stList, listRes] = await Promise.all([
        fetchStates(1),
        fetchWorkmenList(licenceIdEnc),
      ]);
      setStates(stList);
      setWorkmen(listRes.workmen || []);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to load workmen details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [licenceIdEnc]);

  const handleEdit = (w: WorkmanRow) => {
    // Format dob from dd-mm-yyyy to YYYY-MM-DD
    let dobInput = "";
    if (w.dob) {
      const parts = w.dob.split("-");
      if (parts.length === 3) {
        dobInput = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    setForm({
      id: w.id,
      workmenName: w.name,
      guardianName: w.guardianName,
      workmenDob: dobInput,
      contactNumber: w.contactNumber,
      email: w.email,
      idProof: w.idProof,
      workmenState: w.state,
      policeStation: w.policeStation,
      pinCode: w.pinCode,
      addressWorkmen: w.rawAddress,
      workmenType: w.workmenType,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (workmanId: string) => {
    if (!window.confirm("Are you sure you want to delete this workman?")) return;
    try {
      await deleteWorkman(licenceIdEnc, workmanId);
      toast.success("Workman deleted successfully.");
      loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to delete workman."
      );
    }
  };

  const handleSave = async () => {
    if (!form.workmenName.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!form.guardianName.trim()) {
      toast.error("Father/Husband Name is required.");
      return;
    }
    if (!form.workmenDob) {
      toast.error("Date of Birth is required.");
      return;
    }
    if (!/^\d{10}$/.test(form.contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number.");
      return;
    }
    if (!form.workmenState) {
      toast.error("Please select a state.");
      return;
    }
    if (!form.policeStation.trim()) {
      toast.error("Police Station is required.");
      return;
    }
    if (!/^\d{6}$/.test(form.pinCode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (!form.addressWorkmen.trim()) {
      toast.error("Address is required.");
      return;
    }
    if (!form.workmenType) {
      toast.error("Please select workmen skill type.");
      return;
    }

    try {
      setSaving(true);

      // Format dob from YYYY-MM-DD to DD-MM-YYYY
      const dateObj = new Date(form.workmenDob);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const dobFormatted = `${day}-${month}-${year}`;

      const payload = {
        licenceId: licenceIdEnc,
        workmanId: form.id || undefined,
        workmenName: form.workmenName.trim(),
        guardianName: form.guardianName.trim(),
        workmenDob: dobFormatted,
        contactNumber: form.contactNumber,
        email: form.email.trim() || undefined,
        idProof: form.idProof.trim() || undefined,
        addressWorkmen: form.addressWorkmen.trim(),
        workmenState: form.workmenState,
        policeStation: form.policeStation.trim(),
        pinCode: form.pinCode,
        workmenType: form.workmenType,
      };

      await saveWorkmanDetails(payload);
      toast.success(form.id ? "Workman details updated." : "Workman added successfully.");
      
      // Reset form and go back to list
      setForm(INITIAL_FORM);
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to save workman."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (flow) {
      flow.goToTab("documents");
    } else {
      navigate(`/ismw-license/documents-upload/${encodeURIComponent(licenceIdEnc)}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading workmen details…
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Employment License — Workmen Details
        </h1>
      </div>

      {/* Tab bar */}
      <EmploymentTabBar active="workmen" licenceIdEnc={licenceIdEnc} />

      <div className="px-4 pt-4">
        {isFormOpen ? (
          /* FORM VIEW */
          <div className="bg-white rounded shadow border mb-6">
            <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
              {form.id ? "Edit Migrant Workmen" : "Add Migrant Workmen"}
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className={LABEL}>Name {req}</label>
                <input
                  type="text"
                  className={INPUT}
                  value={form.workmenName}
                  onChange={(e) => patch({ workmenName: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className={LABEL}>Father/Husband Name {req}</label>
                <input
                  type="text"
                  className={INPUT}
                  value={form.guardianName}
                  onChange={(e) => patch({ guardianName: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className={LABEL}>Date of Birth {req}</label>
                <input
                  type="date"
                  className={INPUT}
                  value={form.workmenDob}
                  onChange={(e) => patch({ workmenDob: e.target.value })}
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
                <label className={LABEL}>Aadhar / Voter ID</label>
                <input
                  type="text"
                  className={INPUT}
                  value={form.idProof}
                  onChange={(e) => patch({ idProof: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className={LABEL}>Select State {req}</label>
                <select
                  className={INPUT}
                  value={form.workmenState}
                  onChange={(e) => patch({ workmenState: e.target.value })}
                >
                  <option value="">- Select State -</option>
                  {states.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Police Station {req}</label>
                <input
                  type="text"
                  className={INPUT}
                  value={form.policeStation}
                  onChange={(e) => patch({ policeStation: e.target.value })}
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

              <div className="md:col-span-3">
                <label className={LABEL}>Address of the Workmen [ Please provide address in details ] {req}</label>
                <textarea
                  className={TEXTAREA}
                  value={form.addressWorkmen}
                  onChange={(e) => patch({ addressWorkmen: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className={LABEL}>Select Workmen Skill {req}</label>
                <select
                  className={INPUT}
                  value={form.workmenType}
                  onChange={(e) => patch({ workmenType: e.target.value })}
                >
                  <option value="">Select Skill Type</option>
                  {SKILL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 border-t p-4">
              <button
                type="button"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setIsFormOpen(false);
                }}
                className="border border-[#337ab7] text-[#337ab7] hover:bg-gray-100 px-6 py-2 rounded text-xs font-semibold uppercase tracking-wider transition"
              >
                &lt;&lt; Back to Workmen Details
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2 rounded text-xs font-semibold uppercase tracking-wider transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white rounded shadow border mb-6">
            <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
              Migrant Workmen Details
            </div>
            
            <div className="p-4">
              <button
                type="button"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setIsFormOpen(true);
                }}
                className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-2 text-sm font-semibold rounded mb-4 shadow transition"
              >
                + Add New Workmen
              </button>

              {workmen.length === 0 ? (
                <div className="border border-gray-200 bg-gray-50 rounded p-4 text-sm text-gray-500 font-semibold italic text-center">
                  No data found!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border text-sm text-left">
                    <thead>
                      <tr className="bg-[#2c5f8a] text-white text-xs font-bold uppercase tracking-wider">
                        <th className="border p-3 w-16 text-center">Sl. No</th>
                        <th className="border p-3">Workmen Name</th>
                        <th className="border p-3">Address</th>
                        <th className="border p-3">Contact Details</th>
                        <th className="border p-3">Skill Type</th>
                        <th className="border p-3 w-24 text-center">Status</th>
                        <th className="border p-3 w-32 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workmen.map((w, index) => (
                        <tr key={w.id} className="hover:bg-gray-50 text-gray-800">
                          <td className="border p-3 text-center font-semibold">{index + 1}</td>
                          <td className="border p-3 font-semibold text-gray-900 leading-normal">
                            {w.name}
                            <div className="text-xs text-gray-500 font-normal">
                              S/O, D/O: {w.guardianName}
                            </div>
                            <div className="text-xs text-gray-500 font-normal">
                              DOB: {w.dob}
                            </div>
                          </td>
                          <td className="border p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                            {w.address}
                          </td>
                          <td className="border p-3 text-xs text-gray-600 leading-normal">
                            {w.contactNumber && (
                              <div>
                                <span className="font-semibold text-gray-700">Phone:</span> {w.contactNumber}
                              </div>
                            )}
                            {w.email && (
                              <div>
                                <span className="font-semibold text-gray-700">Email:</span> {w.email}
                              </div>
                            )}
                            {w.idProof && (
                              <div>
                                <span className="font-semibold text-gray-700">ID:</span> {w.idProof}
                              </div>
                            )}
                          </td>
                          <td className="border p-3 text-xs font-semibold text-gray-700">
                            {getSkillLabel(w.workmenType)}
                          </td>
                          <td className="border p-3 text-center text-xs">
                            <span className="bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="border p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => handleEdit(w)}
                                className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(w.id)}
                                className="bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* SAVE & CONTINUE bottom navigation footer */}
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={handleContinue}
                className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2.5 rounded text-sm font-semibold tracking-wide shadow-md transition"
              >
                SAVE & CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkmenDetails;
