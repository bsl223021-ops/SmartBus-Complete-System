import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange, getDriverProfile, syncDriverDocument } from "../services/firebaseService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await syncDriverDocument(firebaseUser);
          const profile = await getDriverProfile(firebaseUser.uid);
          setDriverProfile(profile);
        } catch (err) {
          console.warn("Failed to load driver profile:", err.message);
        }
      } else {
        setDriverProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getDriverProfile(user.uid);
      setDriverProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, driverProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
