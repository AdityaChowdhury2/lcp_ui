import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { loginUser } from "@/store/authSlice";
import {
  UserCheck,
  User,
  ChevronRight,
  Lock,
  ArrowLeft,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * Main BOCW Cess Portal Landing Page (/bocwcess)
 */
const BocwCess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("admin_bocw");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const resultAction = await dispatch(
        loginUser({ name: username.trim(), password: password.trim() })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        const user =
          (payload as any)?.data?.user ??
          (payload as any)?.user ??
          null;

        if (user && (user.role === 28 || user.name === "admin_bocw")) {
          navigate("/bocwcess/admin");
        } else {
          setError("Access Denied: Account is not authorized for BOCW Cess Admin.");
        }
      } else if (loginUser.rejected.match(resultAction)) {
        const err = resultAction.payload as any;
        const errorMsg =
          err?.message ||
          (typeof err === "string" ? err : "Invalid username or password.");
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-gray-800 flex flex-col justify-between">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white py-14 px-4 shadow-lg border-b border-blue-900/40 relative overflow-hidden">
        {/* Background Subtle Accent pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            BOCW Cess Collection Portal
          </h1>
        </div>
      </div>

      {/* Login Buttons & Portal Selection Section */}
      <div className="max-w-4xl mx-auto px-4 py-14 w-full flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
          {/* Card 1: Admin Login & Credentials Form */}
          <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>

            {!showLoginForm ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                      Official Access
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Admin Portal
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Authorized login for Department Officials and Administrative Staff to manage BOCW Cess collection records.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all text-base group/btn cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    Admin Login
                    <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      Official Admin Sign In
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginForm(false);
                        setError("");
                      }}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Username Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Username / Officer ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Sign In & Proceed
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Card 2: Citizen Login */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-200/70 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <User className="w-7 h-7" />
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 tracking-wide uppercase">
                  Coming Soon
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-bold py-3.5 px-6 rounded-xl text-base cursor-not-allowed border border-slate-200"
              >
                <User className="w-5 h-5 text-slate-400" />
                Citizen Login (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200/60 bg-white">
        Labour Commissionerate, Government of West Bengal © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default BocwCess;
