import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getUserProfile, setUserProfile } from "../services/firebaseService";

export default function ProfilePage() {
  const user = getCurrentUser();
  const [profile, setProfile] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    organization: "SmartBus",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          setProfile((prev) => ({
            ...prev,
            displayName: data.displayName || prev.displayName,
            phone: data.phone || "",
            organization: data.organization || "SmartBus",
            role: data.role || "admin",
          }));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await setUserProfile(user.uid, {
        displayName: profile.displayName,
        phone: profile.phone,
        organization: profile.organization,
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.displayName || profile.email || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "#FFC107" }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-black flex-shrink-0"
            style={{ background: "#FFC107" }}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900">
              {profile.displayName || "Admin User"}
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 capitalize">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-[20px] font-semibold text-gray-800 mb-5">Account Information</h3>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-5 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Your full name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization</label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                placeholder="Organization name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed capitalize"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account info section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
        <h3 className="text-[20px] font-semibold text-gray-800 mb-4">Account Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="font-medium text-gray-500 mb-1">User ID</dt>
            <dd className="text-gray-700 font-mono text-xs break-all">{user?.uid || "—"}</dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="font-medium text-gray-500 mb-1">Account Created</dt>
            <dd className="text-gray-700">
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="font-medium text-gray-500 mb-1">Last Sign In</dt>
            <dd className="text-gray-700">
              {user?.metadata?.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="font-medium text-gray-500 mb-1">Email Verified</dt>
            <dd>
              {user?.emailVerified ? (
                <span className="text-green-600 font-medium">✅ Verified</span>
              ) : (
                <span className="text-yellow-600 font-medium">⚠️ Not verified</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
