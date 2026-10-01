import { FC, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getUserRole } from "../../../utils/auth";
import {
  FaArrowLeft,
  FaFilePdf,
  FaCheckCircle,
  FaBuilding,
  FaTimes,
  FaMapMarkerAlt,
  FaUserShield,
  FaFileInvoiceDollar,
} from "react-icons/fa";

interface InspectionDetailsData {
  id: string;
  establishment_name: string;
  registration_number: string;
  act_name: string;
  registration_date: string;
  district: string;
  sub_division: string;
  block_name: string;
  gp_ward: string;
  pincode: string;
  address: string;
  employer_name: string;
  employer_mobile: string;
  employer_email: string;
  manager_name: string;
  nature_of_work: string;
  max_workers: string;
  commencement_date: string;
  license_ref: string;
  license_date: string;
  fees_paid: string;
}

const DLCInspectionDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = searchParams.get("mode") || "view"; // "view" or "inspect"
  const [role, setRole] = useState<number | null>(null);
  
  // Modal State for document viewing
  const [activeDoc, setActiveDoc] = useState<{ title: string; content: string } | null>(null);

  // Editable inspection fields (only active in inspect mode)
  const [remarks, setRemarks] = useState("");
  const [decision, setDecision] = useState("approved");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setRole(Number(getUserRole()));
  }, []);

  // Mock details data matching the id
  const detailsData: InspectionDetailsData = {
    id: id || "INS-2026-001",
    establishment_name: "Bengal Cement Works Ltd.",
    registration_number: "REG/CLRA/2026/1029",
    act_name: "Contract Labour (Regulation & Abolition) Act, 1970",
    registration_date: "2026-01-15",
    district: "Paschim Medinipur",
    sub_division: "Kharagpur",
    block_name: "Kharagpur-II",
    gp_ward: "Chakmakampur GP",
    pincode: "721301",
    address: "Plot 42, Kharagpur Industrial Zone, Nimpura, Kharagpur",
    employer_name: "Sanjay Kumar Sen",
    employer_mobile: "+91 98765 43210",
    employer_email: "sanjay.sen@bengalcement.com",
    manager_name: "Pradip Mukhopadhyay",
    nature_of_work: "Cement Grinding and Packaging",
    max_workers: "180 workers",
    commencement_date: "2026-02-01",
    license_ref: "LIC/CLRA/WBLC/4819",
    license_date: "2026-01-20",
    fees_paid: "₹ 7,500.00",
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/banglar-bhumi");
      }, 1500);
    }, 1200);
  };

  const attachments = [
    {
      id: "doc1",
      title: "Trade License Certificate",
      desc: "Valid municipal trade license copy",
      date: "2026-01-10",
      content: "OFFICIAL TRADE LICENSE\nIssued by: Kharagpur Municipality\nEstablishment: Bengal Cement Works Ltd.\nValidity: Up to 31st March 2027\nAuthorized Activities: Industrial Manufacturing & Cement Processing\nSignatory: Licensing Authority, Municipal Affairs Dept.",
    },
    {
      id: "doc2",
      title: "Form-V Certificate",
      desc: "Form V issued by Principal Employer",
      date: "2026-01-12",
      content: "FORM V (See Rule 21(2))\nCertificate by Principal Employer\nThis is to certify that I have registered Bengal Cement Works Ltd. as an Principal Employer under the CLRA Act.\nContractor Name: Sanjay Kumar Sen\nMax Laborers: 180\nLocation: Kharagpur Industrial Zone",
    },
    {
      id: "doc3",
      title: "Work Order Agreement Copy",
      desc: "Signed contract/work order agreement",
      date: "2026-01-05",
      content: "AGREEMENT OF CONTRACT WORK\nBetween: Bengal Cement Works Ltd. & Apex Logistics\nScope: Supply of manual packers and loaders at Kharagpur Unit.\nTenure: 12 Months from 01-02-2026\nTerms: Compliant with Minimum Wages Act, West Bengal Govt. orders.",
    },
    {
      id: "doc4",
      title: "Workmen List and Wages Register",
      desc: "Details of deployed contract workmen",
      date: "2026-01-18",
      content: "WORKMEN DETAILS REGISTER\nTotal Strength: 180\nSkill Classification: Skilled (30), Semi-Skilled (50), Unskilled (100)\nEPF Registration: Compliant\nESI Registration: Compliant\nDaily shifts: 3 shifts rotational",
    },
  ];

  return (
    <div className="container mx-auto p-2">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/banglar-bhumi")}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer"
        >
          <FaArrowLeft /> Back to DLC Inspections
        </button>

        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Mode: {mode === "inspect" ? "Inspect Application" : "View Application"}
        </span>
      </div>

      {/* Main Grid: Details + Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Core Details Form (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Establishment Info */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <FaBuilding className="text-blue-500" /> Establishment & Act Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Establishment Name</label>
                <input
                  type="text"
                  value={detailsData.establishment_name}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Registration Number</label>
                <input
                  type="text"
                  value={detailsData.registration_number}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Registration Act Details</label>
                <input
                  type="text"
                  value={detailsData.act_name}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Registration Date</label>
                <input
                  type="date"
                  value={detailsData.registration_date}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Maximum Deployed Workers</label>
                <input
                  type="text"
                  value={detailsData.max_workers}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-semibold text-blue-800"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Location & Address */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-500" /> Location & Address Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">District</label>
                <input
                  type="text"
                  value={detailsData.district}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Sub-Division</label>
                <input
                  type="text"
                  value={detailsData.sub_division}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Block / Municipality</label>
                <input
                  type="text"
                  value={detailsData.block_name}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">GP / Ward Name</label>
                <input
                  type="text"
                  value={detailsData.gp_ward}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">PIN Code</label>
                <input
                  type="text"
                  value={detailsData.pincode}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Full Detailed Address</label>
                <textarea
                  value={detailsData.address}
                  disabled
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Employer & Work Profile */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <FaUserShield className="text-violet-500" /> Employer & Work details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Employer Name</label>
                <input
                  type="text"
                  value={detailsData.employer_name}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Employer Mobile</label>
                <input
                  type="text"
                  value={detailsData.employer_mobile}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Employer Email</label>
                <input
                  type="text"
                  value={detailsData.employer_email}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Manager Name</label>
                <input
                  type="text"
                  value={detailsData.manager_name}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nature of Work Deployed</label>
                <input
                  type="text"
                  value={detailsData.nature_of_work}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Work Commencement Date</label>
                <input
                  type="date"
                  value={detailsData.commencement_date}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Card 4: License & Payments */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <FaFileInvoiceDollar className="text-amber-500" /> License & Payment Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">License Reference No.</label>
                <input
                  type="text"
                  value={detailsData.license_ref}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">License Issue Date</label>
                <input
                  type="date"
                  value={detailsData.license_date}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Application Fees Paid</label>
                <input
                  type="text"
                  value={detailsData.fees_paid}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Attachments Panel & Inspection Panel (Span 1) */}
        <div className="space-y-6">
          
          {/* Attachments Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">
              Documents & Attachments
            </h2>
            <div className="space-y-3">
              {attachments.map((doc) => (
                <div key={doc.id} className="p-3.5 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-all flex justify-between items-center gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 bg-rose-50 text-rose-500 rounded shrink-0">
                      <FaFilePdf />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate" title={doc.title}>{doc.title}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{doc.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDoc({ title: doc.title, content: doc.content })}
                    className="px-2.5 py-1 text-xs font-semibold border border-blue-200 hover:border-blue-500 text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer whitespace-nowrap"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Actions Form (Only shown if mode is 'inspect') */}
          {mode === "inspect" && (
            <div className="bg-white rounded-xl shadow-md border-t-4 border-amber-500 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8" />
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                DLC Inspection Actions
              </h2>
              <p className="text-gray-400 text-xs mb-5">
                Provide your remarks and select a decision to submit the inspection report.
              </p>
              
              {submitSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-center animate-bounce">
                  <FaCheckCircle className="text-xl mx-auto mb-2 text-emerald-600" />
                  <p className="font-semibold text-sm">Report Submitted Successfully!</p>
                  <p className="text-xs text-emerald-600 mt-1">Redirecting...</p>
                </div>
              ) : (
                <form onSubmit={handleInspectionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Decision Action
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                    >
                      <option value="approved">Recommend Approval</option>
                      <option value="clarification">Request Clarification/Rectify</option>
                      <option value="rejected">Recommend Rejection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      DLC Remarks
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                      rows={4}
                      placeholder="Type details of physical/documentary inspection remarks..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? "Submitting..." : "Submit Inspection Report"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Premium Document Preview Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FaFilePdf className="text-rose-500" /> {activeDoc.title}
              </h3>
              <button
                onClick={() => setActiveDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body: Styled Document Container */}
            <div className="p-6 bg-slate-900 flex justify-center">
              <div className="bg-white text-slate-800 p-8 rounded-lg shadow-inner w-full min-h-[320px] font-serif border border-slate-200 relative overflow-hidden select-none">
                
                {/* Government Watermark Background */}
                <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                  <div className="text-6xl border-4 border-slate-800 p-6 rounded-full font-bold uppercase rotate-45 select-none text-center">
                    Government of<br />West Bengal
                  </div>
                </div>

                {/* State Emblem/Seal mockup */}
                <div className="text-center mb-6">
                  <div className="inline-block border-2 border-slate-800 p-1.5 rounded-full font-sans text-[10px] font-bold tracking-widest uppercase mb-1">
                    Seal
                  </div>
                  <h5 className="text-[11px] font-sans font-bold tracking-wider text-slate-500 uppercase">
                    Government of West Bengal
                  </h5>
                  <h6 className="text-[10px] font-sans text-slate-400 uppercase">
                    Department of Labour
                  </h6>
                </div>

                {/* Document Content */}
                <div className="whitespace-pre-line text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-4 border border-slate-100 rounded">
                  {activeDoc.content}
                </div>

                {/* Footer Signature */}
                <div className="mt-8 flex justify-end text-right">
                  <div>
                    <div className="text-[9px] text-slate-400 font-mono italic mb-1">[Digitally Signed]</div>
                    <div className="border-t border-slate-300 pt-1 font-sans text-[10px] font-bold uppercase text-slate-600">
                      Authorized Officer
                    </div>
                    <div className="font-sans text-[9px] text-slate-400">
                      WBLC e-District Portal
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setActiveDoc(null)}
                className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer text-white"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DLCInspectionDetails;
