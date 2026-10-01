import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import { useEmploymentFlow } from "./EmploymentFlowContext";
import {
  fetchPreviewDetails,
  finalSubmitLicenseApplication,
  fetchEmploymentDocument,
} from "./ismwLicenseApi";

const SECTION_TITLE =
  "bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide rounded-t-sm";
const TH_PREVIEW = "bg-gray-100 text-gray-700 text-xs font-bold p-3 border w-1/3 text-left uppercase";
const TD_PREVIEW = "p-3 border text-sm text-gray-800 leading-relaxed font-medium";

const getSkillLabel = (val: string) => {
  switch (val) {
    case "1":
      return "Highly Skilled";
    case "2":
      return "Skilled";
    case "3":
      return "Semi-Skilled";
    case "4":
      return "Unskilled";
    default:
      return val || "—";
  }
};

const getOwnershipLabel = (val: string) => {
  switch (val) {
    case "1":
      return "Proprietorship";
    case "2":
      return "Partnership";
    case "3":
      return "Private Limited Company";
    case "4":
      return "Public Limited Company";
    default:
      return val || "—";
  }
};

const ApplicationPreview: FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const licenceIdEncRaw = params["*"] || "";
  const licenceIdEnc = flow?.licenceIdEnc || decodeURIComponent(licenceIdEncRaw);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPreview = async () => {
    try {
      const res = await fetchPreviewDetails(licenceIdEnc);
      setData(res);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load preview details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [licenceIdEnc]);

  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const viewDocument = async (code: string) => {
    try {
      setViewingDoc(code);
      const file = await fetchEmploymentDocument(licenceIdEnc, code);
      const byteChars = atob(file.filecontent);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        bytes[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Unable to open document."
      );
    } finally {
      setViewingDoc(null);
    }
  };

  const handleSubmit = async () => {
    if (!declared) {
      toast.error("Please read and check the declaration before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await finalSubmitLicenseApplication(licenceIdEnc);
      toast.success(res.message || "Application submitted successfully.");
      
      // Modal or alert with reference number
      alert(
        `Application submitted successfully!\nYour Reference Number is: ${res.referenceNo}`
      );
      
      navigate("/ismw-employment_license-list");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading application preview…
      </div>
    );
  }

  const { licence, contractorMaster, peRegistration, directors, personsInCharge, workmen, documents } = data || {};

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          {readOnly
            ? "ISMW Employment License — Application Details"
            : "ISMW Employment License — Application Preview"}
        </h1>
        {readOnly && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-6 border border-[#337ab7] text-[#337ab7] hover:bg-gray-100 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition"
          >
            &lt;&lt; Back to List
          </button>
        )}
      </div>

      {/* Tab bar — only within the editable application flow */}
      {!readOnly && (
        <EmploymentTabBar active="preview" licenceIdEnc={licenceIdEnc} />
      )}

      <div className="px-4 pt-4 flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Section 1: Form-II Information & PE Details */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Form-II Information & PE Details</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <th className={TH_PREVIEW}>PE Registration Number</th>
                  <td className={TD_PREVIEW}>{peRegistration?.registrationNo || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Establishment Name</th>
                  <td className={TD_PREVIEW}>{peRegistration?.estName || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Establishment Address</th>
                  <td className={TD_PREVIEW}>{peRegistration?.estAddress || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Contractor Name</th>
                  <td className={TD_PREVIEW}>{contractorMaster?.name || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Father/Husband Name of Contractor</th>
                  <td className={TD_PREVIEW}>{contractorMaster?.fatherHusbandName || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Contractor Address</th>
                  <td className={TD_PREVIEW}>{contractorMaster?.address || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Contractor Email</th>
                  <td className={TD_PREVIEW}>{contractorMaster?.email || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Max Migrant Workmen in Form-II</th>
                  <td className={TD_PREVIEW}>{contractorMaster?.maxNumLabours || "0"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Worksite & Application Details */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Worksite & Application Details</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <th className={TH_PREVIEW}>Ownership Type</th>
                  <td className={TD_PREVIEW}>{getOwnershipLabel(licence?.ownershipType)}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Worksite Location Address</th>
                  <td className={TD_PREVIEW}>{licence?.worksiteLocation || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Worksite PIN Code</th>
                  <td className={TD_PREVIEW}>{licence?.worksitePin || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Agent / Manager Name</th>
                  <td className={TD_PREVIEW}>{licence?.agentManagerName || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Agent / Manager Address</th>
                  <td className={TD_PREVIEW}>{licence?.agentManagerAddress || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Recruited From Address</th>
                  <td className={TD_PREVIEW}>{licence?.recruitedAddress || "—"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Max Migrant Workmen Proposed for License</th>
                  <td className={TD_PREVIEW}>{licence?.maxNumMigrantWorkmen || "0"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>License details under CLRA act</th>
                  <td className={TD_PREVIEW}>{licence?.clraLicenseNo || "None"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Undergone conviction details</th>
                  <td className={TD_PREVIEW}>{licence?.contractorConvictedReason || "None"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>License suspension / revocation details</th>
                  <td className={TD_PREVIEW}>{licence?.contractorRevokingDate || "None"}</td>
                </tr>
                <tr>
                  <th className={TH_PREVIEW}>Nature of work in past 5 years</th>
                  <td className={TD_PREVIEW}>{licence?.pastFiveYearsWorkdetails || "None"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Directors & Partners */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Directors & Partners Details</div>
          <div className="p-4 overflow-x-auto">
            {directors?.length === 0 ? (
              <div className="text-sm italic text-gray-500 font-semibold">No directors/partners found.</div>
            ) : (
              <table className="w-full border-collapse border text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase border-b">
                    <th className="border p-3 w-16 text-center">Sl. No</th>
                    <th className="border p-3">Name</th>
                    <th className="border p-3">Designation</th>
                    <th className="border p-3">Address</th>
                    <th className="border p-3">Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  {directors?.map((d: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-3 text-center font-semibold">{i + 1}</td>
                      <td className="border p-3 font-semibold">{d.name}</td>
                      <td className="border p-3 capitalize">{d.designation}</td>
                      <td className="border p-3 text-xs leading-relaxed">{d.address}</td>
                      <td className="border p-3 text-xs">{d.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 4: Persons In Charge */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Persons in Charge Details</div>
          <div className="p-4 overflow-x-auto">
            {personsInCharge?.length === 0 ? (
              <div className="text-sm italic text-gray-500 font-semibold">No persons in charge found.</div>
            ) : (
              <table className="w-full border-collapse border text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase border-b">
                    <th className="border p-3 w-16 text-center">Sl. No</th>
                    <th className="border p-3">Name</th>
                    <th className="border p-3">Designation</th>
                    <th className="border p-3">Address</th>
                    <th className="border p-3">Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  {personsInCharge?.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-3 text-center font-semibold">{i + 1}</td>
                      <td className="border p-3 font-semibold">{p.name}</td>
                      <td className="border p-3 capitalize">{p.designation}</td>
                      <td className="border p-3 text-xs leading-relaxed">{p.address}</td>
                      <td className="border p-3 text-xs">{p.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 5: Migrant Workmen List */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Migrant Workmen Details</div>
          <div className="p-4 overflow-x-auto">
            {workmen?.length === 0 ? (
              <div className="text-sm italic text-gray-500 font-semibold">No workmen found.</div>
            ) : (
              <table className="w-full border-collapse border text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase border-b">
                    <th className="border p-3 w-16 text-center">Sl. No</th>
                    <th className="border p-3">Workmen Name</th>
                    <th className="border p-3">Father/Husband Name</th>
                    <th className="border p-3">Date of Birth</th>
                    <th className="border p-3">Address</th>
                    <th className="border p-3">Skill Type</th>
                  </tr>
                </thead>
                <tbody>
                  {workmen?.map((w: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-3 text-center font-semibold">{i + 1}</td>
                      <td className="border p-3 font-semibold">{w.name}</td>
                      <td className="border p-3">{w.guardianName}</td>
                      <td className="border p-3 text-xs">{w.dob}</td>
                      <td className="border p-3 text-xs leading-relaxed">{w.address}</td>
                      <td className="border p-3 text-xs font-semibold">{getSkillLabel(w.workmenType)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 6: Uploaded Supporting Documents */}
        <div className="bg-white rounded shadow border">
          <div className={SECTION_TITLE}>Uploaded Supporting Documents</div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full border-collapse border text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase border-b">
                  <th className="border p-3 w-16 text-center">Sl. No</th>
                  <th className="border p-3">Document Name</th>
                  <th className="border p-3 w-48 text-center">Status</th>
                  <th className="border p-3 w-32 text-center">Document</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "FORM-VI", code: "F6", field: "formSixFile", required: true },
                  { label: "Work Order", code: "WO", field: "workOrderFile", required: true },
                  { label: "Trade License", code: "TL", field: "tradeLicenseFile", required: true },
                  { label: "Address Proof", code: "AP", field: "addressProofFile", required: true },
                  { label: "Other Supporting Document", code: "ODSC", field: "otherDocFile", required: false },
                ].map((d, i) => {
                  const uploaded = !!documents?.[d.field];
                  return (
                    <tr key={d.code}>
                      <td className="border p-3 text-center font-semibold">{i + 1}</td>
                      <td className="border p-3 font-semibold">{d.label}</td>
                      <td className="border p-3 text-center text-xs">
                        <span
                          className={`font-semibold px-3 py-1 rounded-full ${
                            uploaded
                              ? "bg-green-100 text-green-800"
                              : d.required
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {uploaded ? "Uploaded" : d.required ? "Not Available" : "Not Uploaded"}
                        </span>
                      </td>
                      <td className="border p-3 text-center">
                        {uploaded ? (
                          <button
                            type="button"
                            onClick={() => viewDocument(d.code)}
                            disabled={viewingDoc === d.code}
                            className="text-[#1E73BE] hover:underline text-xs font-semibold disabled:opacity-60"
                          >
                            {viewingDoc === d.code ? "Opening…" : "View"}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Declaration + Submit (editable flow) OR Back button (read-only view) */}
        {readOnly ? (
          <div className="bg-white rounded shadow border p-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-[#337ab7] text-[#337ab7] hover:bg-gray-100 px-6 py-2.5 rounded text-sm font-semibold tracking-wide transition"
            >
              &lt;&lt; Back to List
            </button>
          </div>
        ) : (
          <div className="bg-white rounded shadow border p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-start gap-3">
              <input
                id="decl-check"
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="decl-check" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                I hereby declare that the particulars given above are true to the best of my knowledge and belief.
              </label>
            </div>

            <button
              type="button"
              disabled={submitting || !declared}
              onClick={handleSubmit}
              className="bg-[#337ab7] hover:bg-[#286090] disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded text-sm tracking-wide shadow-md transition whitespace-nowrap disabled:cursor-not-allowed"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ApplicationPreview;
