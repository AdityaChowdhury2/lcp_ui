import React, { useState } from "react";

interface FormData {
  unionName: string;
  unionAddress: string;
  authorizedPerson: string;
  authorizedEmail: string;
  authorizedMobile: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegistrationCentralStateTradeUnion: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    unionName: "",
    unionAddress: "",
    authorizedPerson: "",
    authorizedEmail: "",
    authorizedMobile: "",
    username: "trade_union_user",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Handler
  const handleSubmit = async () => {
    setMessage("");

    // Basic validation
    if (!form.unionName || !form.unionAddress || !form.authorizedPerson ||
        !form.authorizedEmail || !form.authorizedMobile ||
        !form.username || !form.password || !form.confirmPassword) {
      setMessage("All fields marked with * are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Password & Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://your-api.com/register-trade-union", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("API Error");

      setMessage("Registration Successful!");
      setForm({
        unionName: "",
        unionAddress: "",
        authorizedPerson: "",
        authorizedEmail: "",
        authorizedMobile: "",
        username: "trade_union_user",
        password: "",
        confirmPassword: "",
      });

    } catch (err) {
      setMessage("Failed to submit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-2">
      <h1 className="text-2xl text-gray-800 mb-4">
        Registration Of Central Trade Union / State Trade Union
      </h1>

      <div className="bg-white border rounded-md shadow-sm p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Name of Union */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Name of the Central/State Trade Union <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="unionName"
              value={form.unionName}
              onChange={handleChange}
              placeholder="Name of the Central/State Trade Union"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Address of the Central/State Trade Union <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="unionAddress"
              value={form.unionAddress}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Authorized Person */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Name of the Authorized Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="authorizedPerson"
              value={form.authorizedPerson}
              onChange={handleChange}
              placeholder="Name of the Authorized Person"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Email address of the Authorized Person <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="authorizedEmail"
              value={form.authorizedEmail}
              onChange={handleChange}
              placeholder="Enter valid email address"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Mobile Number of the Authorized Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="authorizedMobile"
              value={form.authorizedMobile}
              onChange={handleChange}
              placeholder="Enter 10 digits mobile number"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Empty for layout */}
          <div></div>

          {/* Username */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full bg-blue-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-1">
              Password <span className="text-red-500">*</span>
              <span className="text-gray-500 cursor-pointer">ⓘ</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full bg-blue-50"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Enter password"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded text-white 
            ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Submitting..." : "SUBMIT"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-4 text-sm font-medium">
            {message}
          </div>
        )}

      </div>
    </div>
  );
};

export default RegistrationCentralStateTradeUnion;
