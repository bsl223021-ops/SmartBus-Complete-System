import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, resetPassword } from "../services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "Invalid email or password. Please try again."
        : err.code === "auth/user-not-found"
        ? "No account found with this email."
        : err.code === "auth/too-many-requests"
        ? "Too many failed attempts. Please try again later."
        : err.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      setResetSent(true);
    } catch {
      setResetSent(true); // Don't reveal if email exists
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ background: "#000000" }}
      >
        <div className="max-w-md text-center">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-8"
            style={{ background: "#FFC107" }}
          >
            <svg className="w-14 h-14 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-3-2-5-5-5H9C6 3 4 5 4 8v8zm2-8c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v1H6V8zM6 16v-5h12v5H6zm2 0a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">SmartBus</h1>
          <p className="text-lg text-gray-400 mb-8">
            Intelligent school bus management platform for administrators
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: "🚌", text: "Fleet Management" },
              { icon: "👨‍🎓", text: "Student Tracking" },
              { icon: "🗺️", text: "Route Planning" },
              { icon: "📊", text: "Live Analytics" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-gray-300 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
              style={{ background: "#FFC107" }}
            >
              <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-3-2-5-5-5H9C6 3 4 5 4 8v8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SmartBus Admin</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {!showForgot ? (
              <>
                <div className="mb-8">
                  <h2 className="text-[28px] font-bold text-gray-900">Welcome back</h2>
                  <p className="text-[16px] text-gray-500 mt-1">Sign in to your admin portal</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@smartbus.com"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="input-field pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 accent-yellow-400"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setForgotEmail(email); setError(""); }}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#FFC107" }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setShowForgot(false); setResetSent(false); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to login
                </button>
                <div className="mb-6">
                  <h2 className="text-[28px] font-bold text-gray-900">Reset password</h2>
                  <p className="text-[16px] text-gray-500 mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                {resetSent ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
                    ✅ If an account exists for <strong>{forgotEmail}</strong>, a password reset link has been sent.
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="admin@smartbus.com"
                      className="input-field"
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn-primary w-full"
                    >
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} SmartBus. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

