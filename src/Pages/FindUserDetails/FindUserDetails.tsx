import React, { useState } from "react";

// Dropdown options as per image
const SERVICE_OPTIONS = [
  "Registration of Principal Emp. under CLRA",
  "Contractor License under CLRA",
  "Est.Registration under BOCWA",
  "Registration under MTW",
  "Registration under ISMW",
];

// ---- Dummy API simulation ----
interface UserInfo {
  licenseNumber?: string;
  userName: string;
  email: string;
  mobile: string;
}

const fakeSearchApi = async (payload: any): Promise<UserInfo> => {
  console.log("POST payload =>", payload);

  // simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        licenseNumber: payload.licenseNumber || payload.registrationNumber,
        userName: "isha_lc2022",
        email: "isha*****@gmail.com",
        mobile: "90******00",
      });
    }, 800);
  });
};

const FindUserDetails: React.FC = () => {
  const [service, setService] = useState<string>("");
  const [firstInput, setFirstInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>("");

  const isContractor = service === "Contractor License under CLRA";

  const handleSearch = async () => {
    setError("");
    setData(null);

    if (!firstInput && !secondInput) {
      setError("Please enter at least one value.");
      return;
    }

    const payload = isContractor
      ? {
          service,
          licenseNumber: firstInput || undefined,
          formVNumber: secondInput || undefined,
        }
      : {
          service,
          registrationNumber: firstInput || undefined,
          identificationNumber: secondInput || undefined,
        };

    setLoading(true);
    try {
      const res = await fakeSearchApi(payload);
      setData(res);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form Panel */}
        <div className="bg-[#d8d2c8] p-6 rounded">
          <label className="block text-sm font-semibold mb-2">
            Select service to get your user information <span className="text-red-600">*</span>
          </label>
          <select
            className="w-full p-2 mb-4 border rounded"
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setFirstInput("");
              setSecondInput("");
              setData(null);
            }}
          >
            <option value="">- Select -</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Dynamic Inputs */}
          {service && (
            <>
              <label className="block text-sm font-semibold mb-1">
                {isContractor ? "License Number" : "Registration Number"}
              </label>
              <input
                type="text"
                className="w-full p-2 mb-3 border rounded"
                value={firstInput}
                onChange={(e) => setFirstInput(e.target.value)}
              />

              <div className="text-center text-sm font-semibold my-2">OR</div>

              <label className="block text-sm font-semibold mb-1">
                {isContractor
                  ? "Form V Number / Reference Number"
                  : "Identification Number"}
              </label>
              <input
                type="text"
                className="w-full p-2 mb-4 border rounded"
                value={secondInput}
                onChange={(e) => setSecondInput(e.target.value)}
              />

              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-[#6b5b4b] text-white px-6 py-2 rounded hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Searching..." : "SEARCH"}
              </button>
            </>
          )}
        </div>

        {/* Right Result Panel */}
        <div className="md:col-span-2 mr-10">
          <h2 className="text-3xl font-light mb-6">User Information</h2>

          {data && (
            <div className="border rounded overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-[#3b2414] text-white">
                  <tr>
                    <th className="text-left p-3">PARAMETERS</th>
                    <th className="text-left p-3">VALUES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="p-3 font-medium">
                      {isContractor ? "License Number" : "Registration Number"}
                    </td>
                    <td className="p-3">{data.licenseNumber}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">User Name</td>
                    <td className="p-3">{data.userName}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="p-3 font-medium">Email Address</td>
                    <td className="p-3">{data.email}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Mobile Number</td>
                    <td className="p-3">{data.mobile}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindUserDetails;
