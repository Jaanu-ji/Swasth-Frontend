// ✅ Auth Hook - Migrated to React Native CLI
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("swasth_user");
      const storedToken = await AsyncStorage.getItem("swasth_token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Restore session error:", e);
      await AsyncStorage.multiRemove(["swasth_user", "swasth_token"]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIN ---------------- */
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const res = await loginUser(email, password);

    if (!res?.user || !res?.token) {
      throw new Error("Invalid login response from server");
    }

    await AsyncStorage.multiSet([
      ["swasth_user", JSON.stringify(res.user)],
      ["swasth_token", res.token],
    ]);

    setUser(res.user);
    setToken(res.token);

    return res.user;
  };

  /* ---------------- REGISTER ---------------- */
  const register = async (data) => {
    if (!data?.email || !data?.password) {
      throw new Error("Email and password are required");
    }

    console.log("🔥 useAuth.register CALLED", data.email);

    const res = await registerUser(data);

    console.log("🔥 register API response:", res);

    if (!res?.user || !res?.token) {
      throw new Error("Invalid registration response from server");
    }

    await AsyncStorage.multiSet([
      ["swasth_user", JSON.stringify(res.user)],
      ["swasth_token", res.token],
    ]);

    setUser(res.user);
    setToken(res.token);

    return res.user;
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await AsyncStorage.multiRemove(["swasth_user", "swasth_token"]);
    setUser(null);
    setToken(null);
  };

  /* ---------------- REFRESH USER ---------------- */
  const refreshUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("swasth_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Refresh user error:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
