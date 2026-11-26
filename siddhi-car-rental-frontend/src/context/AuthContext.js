import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AUTH_STORAGE_KEY, getMe, loginUser, logoutUser, registerUser } from "../services/api";

const AuthContext = createContext();

const load = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null"); } catch { return null; }
};

// Keeps the logged-in user + token. Saved in localStorage so a page refresh keeps you logged in.
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(load); // { token, user } or null

  const save = useCallback((value) => {
    if (value) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(value);
  }, []);

  // refresh the profile from the server once (also detects expired tokens)
  useEffect(() => {
    if (!auth?.token) return;
    getMe()
      .then((res) => save({ token: auth.token, user: res.data }))
      .catch((err) => { if (err.response?.status === 401) save(null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onExpired = () => save(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [save]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    save(res.data);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    save(res.data);
    return res.data.user;
  };

  const logout = async () => {
    try { await logoutUser(); } catch { /* token may already be invalid */ }
    save(null);
  };

  const setUser = (user) => save({ ...auth, user });

  const user = auth?.user || null;
  return (
    <AuthContext.Provider value={{ user, token: auth?.token, isAdmin: user?.role === "ADMIN", login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const dashboardPath = (user) => (user?.role === "ADMIN" ? "/admin" : "/dashboard");
