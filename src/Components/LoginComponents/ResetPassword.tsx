import { API_BASE } from "@/constants/constants";
import React, { useEffect, useState } from "react";

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // const token = window.location.pathname.split("/").pop();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  // 🔹 Validate token on page load
  useEffect(() => {
    setCaptcha(generateCaptcha());

    if (!token) {
      setTokenValid(false);
      setLoading(false);
      return;
    }

    validateToken(token);
  }, []);

  // 🔹 Token validation API
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(
        `${API_BASE}auth/validate-reset-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      setTokenValid(data.valid === true);
    } catch (error) {
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Submit new password API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword || !captchaInput) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (captcha !== captchaInput.toUpperCase()) {
      setError("Invalid captcha code.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    // try {
    //   const response = await fetch(
    //     `${API_BASE}reset-password`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         token,
    //         password,
    //       }),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error();
    //   }

    //   setSuccess("Password Changed Successfully.");
    // } catch {
    //   setError("Failed to reset password. Try again.");
    // }
  };

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking link validity...
      </div>
    );
  }

  // 🔹 Invalid / Expired link
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-3">
            Link Expired or Invalid
          </h2>
          <p className="text-gray-600">
            Please request a new password reset link.
          </p>
        </div>
      </div>
    );
  }

  // 🔹 VALID TOKEN → SHOW FORM
  return (
    <div className="min-h-screen bg-white flex items-start justify-start px-16 pt-16">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl italic text-gray-700 mb-10">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password */}
          <div className="flex items-center gap-6">
            <label className="w-56 text-sm">
              Enter Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-[500px] border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm */}
          <div className="flex items-center gap-6">
            <label className="w-56 text-sm">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-[500px] border px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Captcha */}
          <div className="flex items-start gap-6">
            <label className="w-56 text-sm pt-2">
              What code is in the image?{" "}
              <span className="text-red-500">*</span>
              <p className="text-xs text-gray-500 mt-1">
                Enter the characters shown in the image.
              </p>
            </label>

            <div className="flex items-center gap-6">
              <input
                type="text"
                className="w-[250px] border px-3 py-2"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />

              <div
                className="px-6 py-2 text-3xl tracking-widest font-bold text-green-700 bg-gray-100 select-none"
                style={{ fontFamily: "cursive" }}
              >
                {captcha}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm ml-56">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm ml-56">
              {success}
            </p>
          )}

          <div className="ml-56">
            <button
              type="submit"
              className="bg-[#7b6a58] text-white px-6 py-2 uppercase text-sm hover:bg-[#6a5a4a]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
