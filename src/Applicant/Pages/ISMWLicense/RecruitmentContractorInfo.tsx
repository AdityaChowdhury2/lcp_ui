import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchStates,
  fetchDistricts,
  fetchSubdivisions,
  fetchAreaTypes,
  fetchBlocks,
  fetchVillages,
  fetchPoliceStations,
  fetchNatureOfWork,
  fetchRecruitmentContractorInfo,
  saveRecruitmentContractorInfo,
  type Option,
} from "./ismwLicenseApi";

/* ---------------------------------------------------------------------------
   Flat, DTO-aligned form state (see SubmitRecruitmentContractorDto).
--------------------------------------------------------------------------- */
type FormState = Record<string, string>;

const INITIAL: FormState = {
  ownershipType: "",
  companyRegistrationNo: "",
  ownershipDate: "",
  designation: "",
  contractorEstName: "",
  contractorName: "",
  fatherHusbandName: "",

  contState: "",
  contAddress: "",
  contDistrict: "",
  contSubdivision: "",
  contAreatype: "",
  contAreacode: "",
  contVillWard: "",
  contPs: "",
  contPincode: "",

  contStartDate: "",
  contEndDate: "",
  maxWorkman: "",
  natureOfWork: "",
  otherNature: "",

  agentManagerName: "",
  agentManagerAddress: "",
  agentManagerState: "",
  agentManagerDist: "",
  agentManagerSubdv: "",
  agentManagerAreatype: "",
  agentManagerAreacode: "",
  agentManagerVillWard: "",
  agentManagerPs: "",
  agentManagerPin: "",

  recruitedAddress: "",
  recruitedDistrict: "",
  recruitedSubdiv: "",
  recruitedAreatype: "",
  recruitedAreacode: "",
  recruitedVillWard: "",
  recruitedPs: "",
  recruitedPin: "",

  convictedReason: "",
  revokingDate: "",
  pastFiveYears: "",
  clraLicenseNo: "",
};

const INPUT =
  "border w-full px-3 py-2 text-sm focus:outline-none focus:border-[#2c5f8a]";
const LABEL = "text-sm font-semibold block mb-1";
const req = <span className="text-red-500">*</span>;

const Panel: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded shadow border mb-6">
    <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
      {title}
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------------------------
   Address cascade: State → District → Sub-Division → Area type → Block →
   GP/Ward → Police Station (+ address line + PIN).
--------------------------------------------------------------------------- */
interface CascadeNames {
  address: string;
  state?: string; // omit for the fixed-WB (recruited) group
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
  states?: Option[];
  fixedStateId?: string;
  addressLabel?: string;
}> = ({ names, values, patch, states, fixedStateId, addressLabel }) => {
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [areaTypes, setAreaTypes] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const stateId = names.state ? values[names.state] : fixedStateId ?? "";
  const district = values[names.district];
  const subdivision = values[names.subdivision];
  const areatype = values[names.areatype];
  const block = values[names.block];

  // Load option lists reactively (also rehydrates on prefill).
  useEffect(() => {
    fetchDistricts(stateId).then(setDistricts);
  }, [stateId]);

  useEffect(() => {
    fetchSubdivisions(district).then(setSubdivisions);
    fetchPoliceStations(district).then(setPoliceStations);
  }, [district]);

  useEffect(() => {
    fetchAreaTypes(district, subdivision).then(setAreaTypes);
  }, [district, subdivision]);

  useEffect(() => {
    fetchBlocks(district, subdivision, areatype).then(setBlocks);
  }, [district, subdivision, areatype]);

  useEffect(() => {
    fetchVillages(block).then(setVillages);
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
        <label className={LABEL}>{addressLabel ?? "Address Line 1"} {req}</label>
        <input
          className={INPUT}
          value={values[names.address] ?? ""}
          onChange={(e) => patch({ [names.address]: e.target.value })}
        />
      </div>

      <div>
        <label className={LABEL}>Country {req}</label>
        <input className={`${INPUT} bg-gray-100`} value="India" readOnly />
      </div>

      {names.state && (
        <Select
          name={names.state}
          label="Select State"
          options={states ?? []}
          onChange={(v) =>
            patch({
              [names.state as string]: v,
              [names.district]: "",
              [names.subdivision]: "",
              [names.areatype]: "",
              [names.block]: "",
              [names.village]: "",
              [names.ps]: "",
            })
          }
        />
      )}

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
        label="Select Sub-Division"
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
        label="Select Block / Municipality / Corporation / SEZ / Notified Area"
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
        label="Select Block / Municipality / Corporation"
        options={blocks}
        onChange={(v) => patch({ [names.block]: v, [names.village]: "" })}
      />

      <Select
        name={names.village}
        label="Select Gram Panchayat / Ward / Sector"
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
        <label className={LABEL}>PIN Code {req}</label>
        <input
          className={INPUT}
          maxLength={6}
          value={values[names.pin] ?? ""}
          onChange={(e) => patch({ [names.pin]: e.target.value })}
        />
      </div>
    </>
  );
};

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */
const RecruitmentContractorInfo: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const licenceIdEncRaw = params["*"] || "";
  // The encrypted key may contain '/' which was URL-encoded in the route; decode it back.
  const licenceIdEnc = decodeURIComponent(licenceIdEncRaw);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [states, setStates] = useState<Option[]>([]);
  const [natureOptions, setNatureOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const setField = (name: string, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));
  const patch = (p: Record<string, string>) =>
    setForm((f) => ({ ...f, ...p }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [st, nat, info] = await Promise.all([
          fetchStates(1),
          fetchNatureOfWork(),
          fetchRecruitmentContractorInfo(licenceIdEnc),
        ]);
        if (cancelled) return;
        setStates(st);
        setNatureOptions(nat);
        setForm((f) => ({ ...f, ...info.prefill }));
      } catch (err: any) {
        const message = err?.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : message || "Failed to load contractor details."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [licenceIdEnc]);

  const ownership = form.ownershipType;

  const validate = (): string | null => {
    if (!ownership) return "Please select the Ownership Type.";
    if (ownership === "1" && !form.companyRegistrationNo.trim())
      return "Company Registration Number is required.";
    if (ownership !== "3" && !form.ownershipDate)
      return ownership === "1"
        ? "Date of Company Registration is required."
        : "Contractor Date of Birth is required.";
    if (ownership === "2" && !form.fatherHusbandName.trim())
      return "Father's/Husband's Name is required.";
    if (!form.contractorEstName.trim())
      return "Contractor's Establishment Name is required.";
    if (!form.contractorName.trim()) return "Contractor's Name is required.";
    if (!form.contState || !form.contDistrict)
      return "Please complete the contractor address.";
    if (!form.contStartDate || !form.contEndDate)
      return "Contract start and end dates are required.";
    if (!form.maxWorkman.trim())
      return "Maximum number of migrant workmen is required.";
    if (!form.natureOfWork) return "Nature of Work is required.";
    if (form.natureOfWork === "28" && !form.otherNature.trim())
      return "Please specify the other nature of work.";
    if (!form.recruitedDistrict)
      return "Please complete the recruitment (West Bengal) address.";
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
      const res = await saveRecruitmentContractorInfo({
        ...form,
        licenceIdEnc,
      });
      toast.success(res.message || "Saved successfully");
      if (res.route) navigate(res.route);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to save."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading contractor details…
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen">
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Recruitment License — Contractor Details
        </h1>
      </div>

      {/* CONTRACTOR INFORMATION */}
      <Panel title="Contractor Information">
        <div className="md:col-span-3">
          <label className={LABEL}>Ownership Type {req}</label>
          <div className="flex gap-6 text-sm">
            {[
              { v: "1", l: "Company" },
              { v: "2", l: "Individual" },
              { v: "3", l: "Others" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="ownershipType"
                  checked={ownership === o.v}
                  onChange={() =>
                    patch({
                      ownershipType: o.v,
                      companyRegistrationNo: "",
                      ownershipDate: "",
                      designation: "",
                      fatherHusbandName: "",
                    })
                  }
                />
                {o.l}
              </label>
            ))}
          </div>
        </div>

        {ownership === "1" && (
          <div>
            <label className={LABEL}>Company Registration Number {req}</label>
            <input
              className={INPUT}
              value={form.companyRegistrationNo}
              onChange={(e) => setField("companyRegistrationNo", e.target.value)}
            />
          </div>
        )}

        {ownership && ownership !== "3" && (
          <div>
            <label className={LABEL}>
              {ownership === "1"
                ? "Date of Company Registration"
                : "Contractor Date of Birth"}{" "}
              {req}
            </label>
            <input
              type="date"
              className={INPUT}
              value={form.ownershipDate}
              onChange={(e) => setField("ownershipDate", e.target.value)}
            />
          </div>
        )}

        {ownership && (
          <>
            <div>
              <label className={LABEL}>Contractor's Establishment Name {req}</label>
              <input
                className={INPUT}
                value={form.contractorEstName}
                onChange={(e) => setField("contractorEstName", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Contractor's Name {req}</label>
              <input
                className={INPUT}
                value={form.contractorName}
                onChange={(e) => setField("contractorName", e.target.value)}
              />
            </div>
            {ownership === "2" ? (
              <div>
                <label className={LABEL}>Father's / Husband's Name {req}</label>
                <input
                  className={INPUT}
                  value={form.fatherHusbandName}
                  onChange={(e) => setField("fatherHusbandName", e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className={LABEL}>Designation {req}</label>
                <input
                  className={INPUT}
                  value={form.designation}
                  onChange={(e) => setField("designation", e.target.value)}
                />
              </div>
            )}
          </>
        )}

        <AddressCascade
          names={{
            address: "contAddress",
            state: "contState",
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
          states={states}
        />
      </Panel>

      {/* WORK INFORMATION */}
      <Panel title="Work Information">
        <div>
          <label className={LABEL}>Start Date of Contract {req}</label>
          <input
            type="date"
            className={INPUT}
            value={form.contStartDate}
            onChange={(e) => setField("contStartDate", e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL}>End Date of Contract {req}</label>
          <input
            type="date"
            className={INPUT}
            value={form.contEndDate}
            onChange={(e) => setField("contEndDate", e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL}>
            Max. migrant workmen proposed {req}
          </label>
          <input
            className={INPUT}
            value={form.maxWorkman}
            onChange={(e) => setField("maxWorkman", e.target.value)}
          />
          <p className="text-xs text-red-500 mt-1">
            NOTE: License fees will be based on this number.
          </p>
        </div>
        <div>
          <label className={LABEL}>Nature of Work {req}</label>
          <select
            className={INPUT}
            value={form.natureOfWork}
            onChange={(e) =>
              patch({ natureOfWork: e.target.value, otherNature: "" })
            }
          >
            <option value="">- Select -</option>
            {natureOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {form.natureOfWork === "28" && (
          <div className="md:col-span-2">
            <label className={LABEL}>Other Type of Nature of Work {req}</label>
            <input
              className={INPUT}
              value={form.otherNature}
              onChange={(e) => setField("otherNature", e.target.value)}
            />
          </div>
        )}
      </Panel>

      {/* AGENT / MANAGER INFORMATION */}
      <Panel title="Agent / Manager Information">
        <div className="md:col-span-3">
          <label className={LABEL}>Name of Agent / Manager {req}</label>
          <input
            className={INPUT}
            value={form.agentManagerName}
            onChange={(e) => setField("agentManagerName", e.target.value)}
          />
        </div>
        <AddressCascade
          names={{
            address: "agentManagerAddress",
            state: "agentManagerState",
            district: "agentManagerDist",
            subdivision: "agentManagerSubdv",
            areatype: "agentManagerAreatype",
            block: "agentManagerAreacode",
            village: "agentManagerVillWard",
            ps: "agentManagerPs",
            pin: "agentManagerPin",
          }}
          values={form}
          patch={patch}
          states={states}
        />
      </Panel>

      {/* RECRUITMENT ADDRESS (WEST BENGAL) */}
      <Panel title="Place from where workmen are recruited (West Bengal)">
        <AddressCascade
          names={{
            address: "recruitedAddress",
            district: "recruitedDistrict",
            subdivision: "recruitedSubdiv",
            areatype: "recruitedAreatype",
            block: "recruitedAreacode",
            village: "recruitedVillWard",
            ps: "recruitedPs",
            pin: "recruitedPin",
          }}
          values={form}
          patch={patch}
          fixedStateId="1"
        />
      </Panel>

      {/* COMPLIANCE */}
      <Panel title="Legal Compliance & Past Experience">
        <div className="md:col-span-3">
          <label className={LABEL}>
            Details of any conviction / revocation (leave blank if none)
          </label>
          <textarea
            className={INPUT}
            rows={2}
            value={form.convictedReason}
            onChange={(e) => setField("convictedReason", e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL}>Date of Order (if any)</label>
          <input
            type="date"
            className={INPUT}
            value={form.revokingDate}
            onChange={(e) => setField("revokingDate", e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL}>CLRA License Number (if any)</label>
          <input
            className={INPUT}
            value={form.clraLicenseNo}
            onChange={(e) => setField("clraLicenseNo", e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className={LABEL}>
            Experience of last 5 years (leave blank if none)
          </label>
          <textarea
            className={INPUT}
            rows={2}
            value={form.pastFiveYears}
            onChange={(e) => setField("pastFiveYears", e.target.value)}
          />
        </div>
      </Panel>

      <div className="flex justify-end pb-8 pr-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "SAVING..." : "SAVE & CONTINUE"}
        </button>
      </div>
    </div>
  );
};

export default RecruitmentContractorInfo;
