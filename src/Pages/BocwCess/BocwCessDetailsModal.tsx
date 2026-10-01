import React from "react";
import { X } from "lucide-react";
import { ObpassCessRecord } from "./BocwCessList";

interface BocwCessDetailsModalProps {
  record: ObpassCessRecord | null;
  onClose: () => void;
}

export const BocwCessDetailsModal: React.FC<BocwCessDetailsModalProps> = ({
  record,
  onClose,
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold">OBPASS Cess Application Details</h3>
            <p className="text-xs text-blue-300 font-mono">
              Ref: {record.reference_number || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Applicant Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Applicant Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-200">
              <div>
                <span className="text-gray-500">Applicant Name:</span>{" "}
                <strong className="text-gray-900">{record.applicant_name || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Mobile:</span>{" "}
                <strong className="text-gray-900">{record.applicant_mobile || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{" "}
                <strong className="text-gray-900">{record.applicant_email || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Aadhaar:</span>{" "}
                <strong className="text-gray-900">{record.applicant_aadhar || "N/A"}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">Address:</span>{" "}
                <strong className="text-gray-900">{record.applicant_address || "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Property & Location */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Property & Site Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-200">
              <div>
                <span className="text-gray-500">ULB Name:</span>{" "}
                <strong className="text-gray-900">{record.ulb_name || record.ulb_id || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">District:</span>{" "}
                <strong className="text-gray-900">{record.district || record.district_id || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Ward No:</span>{" "}
                <strong className="text-gray-900">{record.ward_no || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Plot No:</span>{" "}
                <strong className="text-gray-900">{record.plot_no || "N/A"} ({record.plot_no_type || "N/A"})</strong>
              </div>
              <div>
                <span className="text-gray-500">Building Type:</span>{" "}
                <strong className="text-gray-900">{record.building_classification || "N/A"}</strong>
              </div>
              <div>
                <span className="text-gray-500">Property Character:</span>{" "}
                <strong className="text-gray-900">{record.character_of_property || "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Cess Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Labour Cess Payment Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl text-xs border border-emerald-200">
              <div>
                <span className="text-gray-600">Estimated Project Cost:</span>{" "}
                <strong className="text-gray-900 font-mono">
                  ₹{Number(record.estimated_cost || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">Total Labour Cess (1%):</span>{" "}
                <strong className="text-emerald-700 font-mono text-sm">
                  ₹{Number(record.total_labour_cess || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">BOCW Fund Share (99%):</span>{" "}
                <strong className="text-purple-700 font-mono">
                  ₹{Number(record.bocw_labour_cess || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">ULB Collection Share (1%):</span>{" "}
                <strong className="text-amber-700 font-mono">
                  ₹{Number(record.ulb_labour_cess || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">Payment Date:</span>{" "}
                <strong className="text-gray-900">{record.payment_date?.split('T')[0] || "N/A"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl text-right">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BocwCessDetailsModal;
