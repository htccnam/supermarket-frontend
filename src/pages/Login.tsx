import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@supermarket.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try { setLoading(true); await login(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : "Đăng nhập thất bại"); }
    finally { setLoading(false); }
  }
  return <main className="auth"><section className="auth-visual"><div className="auth-brand"><span className="brand-mark">S</span><strong>Supermart</strong></div><div className="auth-copy"><span className="eyebrow">NỀN TẢNG QUẢN LÝ BÁN LẺ</span><h1>Vận hành cửa hàng đơn giản hơn.</h1><p>Quản lý bán hàng, tồn kho và đội ngũ của bạn trong một không gian duy nhất.</p><div className="auth-stat"><div><strong>24/7</strong><span>Theo dõi vận hành</span></div><div><strong>100%</strong><span>Dữ liệu chính xác</span></div></div></div></section><section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="eyebrow">CHÀO MỪNG QUAY LẠI</span><h2>Đăng nhập tài khoản</h2><p>Nhập thông tin của bạn để tiếp tục.</p><div className="field"><label htmlFor="email">Địa chỉ email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></div><div className="field"><label htmlFor="password">Mật khẩu</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></div>{error && <div className="error">{error}</div>}<button className="primary-button" disabled={loading}>{loading ? "Đang xác thực..." : "Đăng nhập"}</button></form></section></main>;
}
