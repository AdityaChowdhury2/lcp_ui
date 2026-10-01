import { FC, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

/* ------------------------------------
   TYPES
------------------------------------ */
// "1" = In West Bengal [Employment], "2" = Outside West Bengal [Recruitment]
type LocationType = "" | "1" | "2";

interface LocationPayload {
  location: 1 | 2;
  peRegistrationNumber: string;
  formSixNumber?: string;
  recLicenseNo?: string;
  recLicenseDate?: string;
  recLicenseExpiryDate?: string;
  recLicenseFileName?: string;
  recLicenseFileContent?: string;
}

/* ------------------------------------
   HELPERS
------------------------------------ */
/** Reads a File and returns its base64 content (without the data: prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------
   MAIN COMPONENT
------------------------------------ */
const NewLicenseISMW: FC = () => {
  const navigate = useNavigate();

  const [locationType, setLocationType] = useState<LocationType>("");
  const [submitting, setSubmitting] = useState(false);

  // In West Bengal (Employment) fields
  const [recLicenseNo, setRecLicenseNo] = useState("");
  const [recLicenseDate, setRecLicenseDate] = useState("");
  const [recLicenseExpiryDate, setRecLicenseExpiryDate] = useState("");
  const [recFile, setRecFile] = useState<File | null>(null);
  const [empFormSix, setEmpFormSix] = useState("");
  const [empPeReg, setEmpPeReg] = useState("");

  // Outside West Bengal (Recruitment) fields
  const [recPeReg, setRecPeReg] = useState("");
  const [recFormSix, setRecFormSix] = useState("");

  const resetFields = () => {
    setRecLicenseNo("");
    setRecLicenseDate("");
    setRecLicenseExpiryDate("");
    setRecFile(null);
    setEmpFormSix("");
    setEmpPeReg("");
    setRecPeReg("");
    setRecFormSix("");
  };

  const handleLocationChange = (value: LocationType) => {
    setLocationType(value);
    resetFields();
  };

  const buildPayload = async (): Promise<LocationPayload | null> => {
    if (locationType === "1") {
      const formSix = empFormSix.trim();
      const peReg = empPeReg.trim();
      if (!formSix || !peReg) {
        toast.error(
          "FORM-VI Number and Principal Employer Registration Number are required."
        );
        return null;
      }
      if (!/^\d+$/.test(formSix)) {
        toast.error("FORM-VI Number must be numeric.");
        return null;
      }

      const payload: LocationPayload = {
        location: 1,
        peRegistrationNumber: peReg,
        formSixNumber: formSix,
        recLicenseNo: recLicenseNo.trim() || undefined,
        recLicenseDate: recLicenseDate || undefined,
        recLicenseExpiryDate: recLicenseExpiryDate || undefined,
      };

      if (recFile) {
        payload.recLicenseFileName = recFile.name;
        payload.recLicenseFileContent = await fileToBase64(recFile);
      }
      return payload;
    }

    if (locationType === "2") {
      const peReg = recPeReg.trim();
      if (!peReg) {
        toast.error("Principal Employer Registration Number is required.");
        return null;
      }
      return {
        location: 2,
        peRegistrationNumber: peReg,
        formSixNumber: recFormSix.trim() || undefined,
      };
    }

    toast.error("Please select the location of the establishment.");
    return null;
  };

  const handleContinue = async () => {
    const payload = await buildPayload();
    if (!payload) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Your session has expired. Please log in again.");
      navigate("/applicant-login?usertype=user");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE}ismw-license/location/continue`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message) toast.success(res.data.message);
      const route: string | undefined = res.data?.route;
      if (route) {
        navigate(route);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen">
      {/* Main Government Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          License application for Inter State Migrant Workmen
        </h1>
      </div>

      <div className="bg-white rounded shadow border mb-6">
        <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
          Establishment Location and Form-VI Number
        </div>

        <div className="p-4">
          <label className="block text-sm font-semibold mb-2">
            Select Location of the Establishment{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            className="border px-3 py-2 w-80 text-sm"
            value={locationType}
            onChange={(e) => handleLocationChange(e.target.value as LocationType)}
          >
            <option value="">- Select -</option>
            <option value="1">In West Bengal [ For Employment ]</option>
            <option value="2">Outside West Bengal [ For Recruitment ]</option>
          </select>
        </div>
      </div>

      {/* =========================
                IN WEST BENGAL FORM (Employment)
            ========================= */}
      {locationType === "1" && (
        <>
          {/* LICENSE DETAILS */}
          <div className="bg-white rounded shadow border mb-6">
            <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
              Particulars of License for Recruitment of Migrant Workmen
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold block mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  className="border w-full px-3 py-2 text-sm"
                  value={recLicenseNo}
                  onChange={(e) => setRecLicenseNo(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* LICENSE DATE */}
              <div>
                <label className="text-sm font-semibold block mb-1">
                  License Date
                </label>
                <input
                  type="date"
                  className="border w-full px-3 py-2 text-sm"
                  value={recLicenseDate}
                  onChange={(e) => setRecLicenseDate(e.target.value)}
                />
              </div>

              {/* EXPIRY DATE */}
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="border w-full px-3 py-2 text-sm"
                  value={recLicenseExpiryDate}
                  onChange={(e) => setRecLicenseExpiryDate(e.target.value)}
                />
              </div>

              {/* FILE UPLOAD */}
              <div className="md:col-span-3">
                <label className="text-sm font-semibold block mb-1">
                  Upload Recruitment License Certificate of State/UT where migrant
                  workmen are to be recruited
                </label>

                <input
                  type="file"
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-1 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-100 hover:file:bg-gray-200"
                  accept=".pdf"
                  onChange={(e) => setRecFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only PDF files are allowed.
                </p>
              </div>
            </div>
          </div>

          {/* FORM VI DETAILS */}
          <div className="bg-white rounded shadow border mb-6">
            <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
              Particulars of Form-VI and Registration of Principal Employer under
              ISMW Act 1979
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Enter FORM-VI Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border w-full px-3 py-2 text-sm"
                  value={empFormSix}
                  onChange={(e) => setEmpFormSix(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">
                  Enter Principal Employer Registration Number{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border w-full px-3 py-2 text-sm"
                  value={empPeReg}
                  onChange={(e) => setEmpPeReg(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================
                OUTSIDE WEST BENGAL FORM (Recruitment)
            ========================= */}
      {locationType === "2" && (
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
            Particulars of Form-VI and Registration of Principal Employer under
            ISMW Act 1979
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold block mb-1">
                Enter Principal Employer Registration Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="border w-full px-3 py-2 text-sm"
                value={recPeReg}
                onChange={(e) => setRecPeReg(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Enter FORM-VI Number (Optional)
              </label>
              <input
                type="text"
                className="border w-full px-3 py-2 text-sm"
                value={recFormSix}
                onChange={(e) => setRecFormSix(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================
                CONTINUE BUTTON
            ========================= */}
      {locationType && (
        <div className="flex justify-end pb-8 pr-2">
          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "PLEASE WAIT..." : "CONTINUE"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewLicenseISMW;
