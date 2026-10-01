import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import { useEmploymentFlow } from "./EmploymentFlowContext";
import {
  fetchStates,
  fetchDistricts,
  fetchSubdivisions,
  fetchAreaTypes,
  fetchBlocks,
  fetchVillages,
  fetchPoliceStations,
  fetchEmploymentApplicationDetails,
  saveEmploymentApplicationDetails,
  type Option,
} from "./ismwLicenseApi";

type FormState = Record<string, string>;

const INITIAL: FormState = {
  ownershipType: "", // 1=Company 2=Individual 3=Others

  // Worksite Location (West Bengal)
  contAddress: "",
  contDistrict: "",
  contSubdivision: "",
  contAreatype: "",
  contAreacode: "",
  contVillWard: "",
  contPs: "",
  contPincode: "",

  // Agent / Manager address
  agentManagerName: "",
  agentManagerAddress: "",
  agentManagerState: "",

  // Work details
  maxWorkman: "",

  // Recruited-from address (out of state)
  recruitedAddress: "",
  recruitedState: "",
  recruitedSubdiv: "",
  recruitedVillWard: "",
  recruitedPs: "",
  recruitedPin: "",

  // Compliance
  convictedReason: "",
  revokingDate: "",
  pastFiveYears: "",
  clraLicenseNo: "",
};

const INPUT =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a] bg-white rounded-sm";
const TEXTAREA =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a] bg-white rounded-sm h-20 resize-y";
const LABEL = "text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider";
const req = <span className="text-red-500 font-bold">*</span>;

const Panel: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded shadow border mb-6">
    <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
      {title}
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------------------------
   Address cascade for Worksite Location (Fixed to State = West Bengal)
   State → District → Sub-Division → Area type → Block → GP/Ward → Police Station
--------------------------------------------------------------------------- */
interface CascadeNames {
  address: string;
  district: string;
  subdivision: string;
  areatype: string;
  block: string;
  village: string;
  ps: string;
  pin: string;
}

const AddressCascade: FC<{
  names: CascadeNames;
  values: FormState;
  patch: (p: Record<string, string>) => void;
  addressLabel?: string;
}> = ({ names, values, patch, addressLabel }) => {
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [areaTypes, setAreaTypes] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const stateId = "1"; // Fixed to West Bengal
  const district = values[names.district];
  const subdivision = values[names.subdivision];
  const areatype = values[names.areatype];
  const block = values[names.block];

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
      <div className="md:col-span-3">
        <label className={LABEL}>{addressLabel ?? "Address Line"} {req}</label>
        <input
          type="text"
          className={INPUT}
          value={values[names.address] ?? ""}
          onChange={(e) => patch({ [names.address]: e.target.value })}
          autoComplete="off"
        />
      </div>

      <Select
        name={names.district}
        label="Select District"
        options={districts}
        onChange={(v) =>
          patch({
            [names.district]: v,
            [names.subdivision]: "",
            [names.areatype]: "",
            [names.block]: "",
            [names.village]: "",
            [names.ps]: "",
          })
        }
      />

      <Select
        name={names.subdivision}
        label="Select Subdivision"
        options={subdivisions}
        onChange={(v) =>
          patch({
            [names.subdivision]: v,
            [names.areatype]: "",
            [names.block]: "",
            [names.village]: "",
          })
        }
      />

      <Select
        name={names.areatype}
        label="Select Area Type"
        options={areaTypes}
        onChange={(v) =>
          patch({
            [names.areatype]: v,
            [names.block]: "",
            [names.village]: "",
          })
        }
      />

      <Select
        name={names.block}
        label="Select Block/Mun/Corp"
        options={blocks}
        onChange={(v) => patch({ [names.block]: v, [names.village]: "" })}
      />

      <Select
        name={names.village}
        label="Select Gram Panchayat/Ward"
        options={villages}
        onChange={(v) => patch({ [names.village]: v })}
      />

      <Select
        name={names.ps}
        label="Select Police Station"
        options={policeStations}
        onChange={(v) => patch({ [names.ps]: v })}
      />

      <div>
        <label className={LABEL}>Pin Code {req}</label>
        <input
          type="text"
          maxLength={6}
          className={INPUT}
          value={values[names.pin] ?? ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            patch({ [names.pin]: val });
          }}
          autoComplete="off"
        />
      </div>
    </>
  );
};

/* ---------------------------------------------------------------------------
   Main Component
--------------------------------------------------------------------------- */
const EmploymentApplication: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const licenceIdEncRaw = params["*"] || "";
  const licenceIdEnc = flow?.licenceIdEnc || decodeURIComponent(licenceIdEncRaw);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [states, setStates] = useState<Option[]>([]);
  const [maxLimit, setMaxLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const patch = (p: Record<string, string>) =>
    setForm((f) => ({ ...f, ...p }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stList, details] = await Promise.all([
          fetchStates(1),
          fetchEmploymentApplicationDetails(licenceIdEnc),
        ]);
        if (cancelled) return;
        setStates(stList);
        setMaxLimit(details.maxWorkmenLimit);
        if (details.prefill) {
          patch(details.prefill);
        }
      } catch (err: any) {
        const message = err?.response?.data?.message;
        toast.error(
          Array.isArray(message) ? message[0] : message || "Failed to load application details."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [licenceIdEnc]);

  const validate = (): string | null => {
    // Section 1
    if (!form.ownershipType) return "Ownership Type is required.";

    // Section 2
    if (!form.contAddress.trim()) return "Worksite Location is required.";
    if (!form.contDistrict) return "Worksite District is required.";
    if (!form.contSubdivision) return "Worksite Subdivision is required.";
    if (!form.contAreatype) return "Worksite Area Type is required.";
    if (!form.contAreacode) return "Worksite Block/Mun/Corp is required.";
    if (!form.contVillWard) return "Worksite GP/Ward is required.";
    if (!form.contPs) return "Worksite Police Station is required.";
    if (!/^\d{6}$/.test(form.contPincode)) return "Please enter a valid 6-digit worksite Pin Code.";

    // Section 3
    if (!form.agentManagerName.trim()) return "Agent or Manager Name is required.";
    if (!form.agentManagerAddress.trim()) return "Agent or Manager Address is required.";
    if (!form.agentManagerState) return "Agent or Manager State is required.";

    // Section 4
    const count = Number(form.maxWorkman);
    if (!form.maxWorkman || Number.isNaN(count) || count <= 0) {
      return "Please enter a valid number of proposed migrant workmen.";
    }
    if (count > maxLimit) {
      return `Proposed workmen count (${count}) cannot exceed the limit of ${maxLimit} specified by the Principal Employer.`;
    }

    // Section 6
    if (!form.recruitedAddress.trim()) return "Address of recruitment is required.";
    if (!form.recruitedState) return "State of recruitment is required.";
    if (!/^\d{6}$/.test(form.recruitedPin)) return "Please enter a valid 6-digit Recruitment Pin Code.";

    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      setSubmitting(true);
      const res = await saveEmploymentApplicationDetails({
        ...form,
        licenceIdEnc,
      });
      toast.success(res.message || "Details saved successfully.");
      if (flow) {
        flow.goToTab("owners");
      } else if (res.route) {
        navigate(res.route);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to save details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading application details…
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Employment License — Application Details
        </h1>
      </div>

      {/* Tab bar */}
      <EmploymentTabBar
        active="application"
        licenceIdEnc={licenceIdEnc}
      />

      <div className="px-4 pt-4">
        {/* 1. CONTRACTOR DETAILS */}
        <Panel title="1. Contractor Details">
          <div className="md:col-span-3">
            <label className={LABEL}>Ownership Type {req}</label>
            <div className="flex gap-8 mt-2">
              <label className="inline-flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="ownershipType"
                  value="1"
                  checked={form.ownershipType === "1"}
                  onChange={(e) => patch({ ownershipType: e.target.value })}
                  className="mr-2"
                />
                Company
              </label>
              <label className="inline-flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="ownershipType"
                  value="2"
                  checked={form.ownershipType === "2"}
                  onChange={(e) => patch({ ownershipType: e.target.value })}
                  className="mr-2"
                />
                Individual
              </label>
              <label className="inline-flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="ownershipType"
                  value="3"
                  checked={form.ownershipType === "3"}
                  onChange={(e) => patch({ ownershipType: e.target.value })}
                  className="mr-2"
                />
                Others
              </label>
            </div>
          </div>
        </Panel>

        {/* 2. WORKSITE LOCATION */}
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            2. Worksite location where migrant workmen will be engaged
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <AddressCascade
              names={{
                address: "contAddress",
                district: "contDistrict",
                subdivision: "contSubdivision",
                areatype: "contAreatype",
                block: "contAreacode",
                village: "contVillWard",
                ps: "contPs",
                pin: "contPincode",
              }}
              values={form}
              patch={patch}
              addressLabel="Location"
            />
          </div>
        </div>

        {/* 3. AGENT OR MANAGER AT WORKSITE */}
        <Panel title="3. Name and Address of the Agent or Manager of the Contractor at the Worksite">
          <div>
            <label className={LABEL}>Name of the Agent or Manager {req}</label>
            <input
              type="text"
              className={INPUT}
              value={form.agentManagerName ?? ""}
              onChange={(e) => patch({ agentManagerName: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>Select Country {req}</label>
            <select className={INPUT} disabled value="1">
              <option value="1">India</option>
            </select>
          </div>

          <div className="md:col-span-3"></div>

          <div className="md:col-span-2">
            <label className={LABEL}>Address of the Agent or Manager {req}</label>
            <input
              type="text"
              className={INPUT}
              value={form.agentManagerAddress ?? ""}
              onChange={(e) => patch({ agentManagerAddress: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>Select State {req}</label>
            <select
              className={INPUT}
              value={form.agentManagerState ?? ""}
              onChange={(e) => patch({ agentManagerState: e.target.value })}
            >
              <option value="">- Select State -</option>
              {states.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </Panel>

        {/* 4. WORK INFORMATION */}
        <Panel title="4. Work Information">
          <div className="md:col-span-3">
            <label className={LABEL}>
              Maximum number of migrant workmen proposed to be employed in the establishment on any date {req}
            </label>
            <input
              type="text"
              className={INPUT}
              value={form.maxWorkman ?? ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                patch({ maxWorkman: val });
              }}
              autoComplete="off"
            />
            <p className="text-red-600 font-semibold text-xs mt-2 italic">
              NOTE: Number of migrant Workmen cannot exceed {maxLimit} provided by PE. License fees will be based on this number of migrant workmen.
            </p>
          </div>
        </Panel>

        {/* 5. OTHER INFORMATION */}
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            5. Other Information
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LABEL}>
                a) Whether there was any order against the contractor revoking or suspending licence or forfeiting security deposits in respect of an earlier contract. If so, the date of such order:
              </label>
              <input
                type="date"
                className={INPUT}
                value={form.revokingDate ?? ""}
                onChange={(e) => patch({ revokingDate: e.target.value })}
              />
            </div>

            <div>
              <label className={LABEL}>
                b) Whether the contractor was convicted of any offence within the preceding five years. If so, give details:
              </label>
              <textarea
                className={TEXTAREA}
                placeholder="Reason in details"
                value={form.convictedReason ?? ""}
                onChange={(e) => patch({ convictedReason: e.target.value })}
              />
            </div>

            <div>
              <label className={LABEL}>
                c) Licence number and date obtained by the contractor under Contract Labour (Regulation and Abolition) Act, 1970:
              </label>
              <textarea
                className={TEXTAREA}
                placeholder="Example: ABC02/CL/12345-22/05/2005, ..."
                value={form.clraLicenseNo ?? ""}
                onChange={(e) => patch({ clraLicenseNo: e.target.value })}
              />
            </div>

            <div>
              <label className={LABEL}>
                d) Whether the contractor has worked in any other establishment within the past five years. If so, give details of the principal employer, establishment and nature of work:
              </label>
              <textarea
                className={TEXTAREA}
                placeholder="Details of Principal Employer, establishment and nature of work..."
                value={form.pastFiveYears ?? ""}
                onChange={(e) => patch({ pastFiveYears: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 6. RECRUITED-FROM ADDRESS */}
        <Panel title="6. Address from where migrant workmen proposed to be recruited from as per license issued for recruitment under Inter-State Migrant Workmen">
          <div className="md:col-span-2">
            <label className={LABEL}>Address Line {req}</label>
            <input
              type="text"
              className={INPUT}
              value={form.recruitedAddress ?? ""}
              onChange={(e) => patch({ recruitedAddress: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>Select State {req}</label>
            <select
              className={INPUT}
              value={form.recruitedState ?? ""}
              onChange={(e) => patch({ recruitedState: e.target.value })}
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
            <label className={LABEL}>Subdivision</label>
            <input
              type="text"
              className={INPUT}
              value={form.recruitedSubdiv ?? ""}
              onChange={(e) => patch({ recruitedSubdiv: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>Gram Panchayat/Ward/SEZ/Notified Area</label>
            <input
              type="text"
              className={INPUT}
              value={form.recruitedVillWard ?? ""}
              onChange={(e) => patch({ recruitedVillWard: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>Police Station</label>
            <input
              type="text"
              className={INPUT}
              value={form.recruitedPs ?? ""}
              onChange={(e) => patch({ recruitedPs: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={LABEL}>PIN Number {req}</label>
            <input
              type="text"
              maxLength={6}
              className={INPUT}
              value={form.recruitedPin ?? ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                patch({ recruitedPin: val });
              }}
              autoComplete="off"
            />
          </div>
        </Panel>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2.5 rounded text-sm font-semibold tracking-wide shadow-md transition disabled:opacity-60"
          >
            {submitting ? "SAVING..." : "SAVE & CONTINUE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmploymentApplication;
