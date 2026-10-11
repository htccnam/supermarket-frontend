import { createContext, useContext, useState, ReactNode } from "react";
import { api, User } from "../services/api";
type AuthContextValue = { user: User | null; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return <AuthContext.Provider value={{ user, async login(email, password) { const result = await api.login(email, password); setUser(result.user); }, async logout() { await api.logout(); setUser(null); } }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
