import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = import.meta.env.VITE_API_BASE || "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

const ensurePoppins = () => {
  if (!document.querySelector('link[data-font="poppins"]')) {
    const l1 = document.createElement("link");
    l1.rel = "preconnect";
    l1.href = "https://fonts.googleapis.com";
    const l2 = document.createElement("link");
    l2.rel = "preconnect";
    l2.href = "https://fonts.gstatic.com";
    l2.crossOrigin = "anonymous";
    const l3 = document.createElement("link");
    l3.rel = "stylesheet";
    l3.setAttribute("data-font", "poppins");
    l3.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;700;800&display=swap";
    document.head.append(l1, l2, l3);
  }
};

type ServerUser = {
  id: number;
  email: string;
  role: "admin" | "student";
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
};

type ServerResp =
  | { user: ServerUser }
  | { error: string }
  | Record<string, unknown>;

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => ensurePoppins(), []);

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!emailRegex.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, server: undefined }));

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: ServerResp = await res.json().catch(() => ({}));

      if (!res.ok || !("user" in data)) {
        const msg =
          (data as any)?.error ||
          (res.status === 401 ? "Invalid credentials." : "Login failed. Please try again.");
        setErrors((prev) => ({ ...prev, server: msg }));
        return;
      }

      const user = (data as { user: ServerUser }).user;

      localStorage.setItem("user_id", String(user.id));
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("user_role", user.role);

      const parts = [(user.first_name ?? "").trim(), (user.last_name ?? "").trim()].filter(Boolean);
      const fullName = parts.join(" ").replace(/\s+/g, " ").trim();
      if (fullName) localStorage.setItem("user_name", fullName);
      else localStorage.removeItem("user_name");

      if (user.role === "admin") navigate("/admindashboard");
      else navigate("/predict");
    } catch {
      setErrors((prev) => ({ ...prev, server: "Network error. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  const css = `
  :root {
    --bg: #F3F6FC;
    --ink: #2F2F2F;
    --muted: #9CA3AF;
    --accent: #D55B00;
    --accent-2: #FFCEAA;
  }
  *{box-sizing:border-box}
  html, body, #root { height: 100%; margin: 0; font-family: Poppins, sans-serif; }
  body { background: var(--bg); }

  /* NAVBAR */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; min-height: 88px;
    background: #fff; border-bottom: 1px solid #E6E6E6;
    position: sticky; top: 0; z-index: 50;
  }
  .nav-left { display: flex; align-items: center; gap: 40px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 64px; height: 64px; object-fit: contain; }
  .navlinks { display: flex; gap: 32px; }
  .navlinks a { color: var(--accent); font-weight: 400; font-size: 16px; text-decoration: none; letter-spacing: .3px; }
  .cta { background: var(--accent); color: #fff; border: none; border-radius: 28px; padding: 10px 28px; font-weight: 600; cursor: pointer; }

  /* MAIN LAYOUT */
  .hero { position: relative; display: flex; align-items: stretch; overflow: hidden; min-height: calc(100vh - 88px); }

  /* Round back button (to homepage) */
  .back {
  position: absolute;
  left: 24px;
  top: 24px;
  color: var(--accent);           /* use your main orange tone */
  font-size: 32px;                /* make it larger and more visible */
  font-weight: 700;               /* thicker arrow */
  cursor: pointer;
  user-select: none;
  background: #fff;               /* subtle white circle background */
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
  z-index: 10;
}

.back:hover {
  background: var(--accent);
  color: #fff;
  transform: scale(1.05);
}
  /* GRASP bg: overflow on right corner + lighter opacity */
  .art{
    position: absolute;
    right: -22%;
    bottom: -20%;
    width: 95vw;
    height: 120%;
    background: url('/GRASPLogo2.png') no-repeat right bottom / contain;
    opacity: .80; /* less opacity */
    pointer-events: none;
    z-index: 0;
  }

  /* Keep it subtle and centered on small screens */
  @media (max-width: 900px){
    .art{
      right: -50%;
      bottom: -10%;
      width: 140vw;
      height: 120%;
      opacity: .06;      /* even lighter on mobile */
      background-position: right bottom;
    }
  }

  .content {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; width: 100%; max-width: 1200px;
    margin: 0 auto; padding: 60px 40px; gap: 60px;
  }

  /* LEFT SIDE - FORM */
  .left { max-width: 480px; width: 100%; }
  .title { font-size: 56px; font-weight: 800; color: var(--ink); margin: 0 0 12px; }
  .title .in {
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .sub { color: var(--muted); margin: 0 0 28px; font-size: 15px; }
  .sub a { color: var(--accent); text-decoration: none; font-weight: 600; }

  .form { display: flex; flex-direction: column; gap: 20px; }
  .label { display: flex; flex-direction: column; font-size: 14px; color: #374151; font-weight: 600; }

  .input {
    margin-top: 8px; padding: 14px 20px;
    border-radius: 20px; border: 1px solid #E5E7EB;
    font-size: 15px; outline: none; background: #fff;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    width: 100%;
  }

  /* Password field: toggle inside the input so total width matches email field */
  .pw-wrap { position: relative; }
  .input--pw { padding-right: 86px; }
  .pw-toggle {
    position: absolute; top: 50%; right: 10px; transform: translateY(-50%);
    background: none; border: none; color: var(--accent);
    font-weight: 600; cursor: pointer; padding: 6px 10px; border-radius: 8px;
  }

  .error { color: #d04545; font-size: 12px; margin-top: 4px; }

  .server-error {
    background: #ffe8e8; border: 1px solid #ffd0d0; color: #8b1e1e; font-size: 13px;
    padding: 10px 12px; border-radius: 12px; max-width: 480px;
  }

  .submit {
    margin-top: 12px; width: 180px; background: var(--accent);
    border: none; color: #fff; padding: 14px 22px; border-radius: 28px;
    font-weight: 700; letter-spacing: 1px; cursor: pointer;
  }
  .submit:disabled { opacity: .7; cursor: not-allowed; }

  .recover { margin-top: 14px; color: var(--muted); font-size: 14px; }
  .recover-link { color: var(--accent); text-decoration: none; font-weight: 600; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .content { grid-template-columns: 1fr; gap: 24px; padding: 40px 20px; }
    .art { right: -50%; width: 120vw; opacity: .3; }
    .title { font-size: 42px; }
    .submit { width: 100%; }
  }`;

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        {/* NAVBAR */}
        <nav className="nav">
          <div className="nav-left">
            <div className="brand">
              <img src="/BULSU.png" alt="BulSU" />
              <img src="/CICT.png" alt="CICT" />
            </div>
            <div className="navlinks">
              <a href="#admin">ADMIN GUIDE</a>
              <a href="#student">STUDENT GUIDE</a>
              <a href="/aboutus">ABOUT US</a>
            </div>
          </div>
          <button className="cta" onClick={() => navigate("/register")}>
            SIGN UP
          </button>
        </nav>

        {/* LOGIN SECTION */}
        <main className="hero">
          {/* ✅ Back to homepage button */}
          <div
            className="back"
            onClick={() => navigate("/")}
            aria-label="Back to homepage"
            title="Back to homepage"
          >
           ←
          </div>

          <div className="art" aria-hidden="true" />
          <div className="content">
            {/* Left form */}
            <div className="left">
              <h1 className="title">
                Log <span className="in">In</span>
              </h1>
              <p className="sub">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Sign Up
                </a>
              </p>

              <form onSubmit={handleSubmit} className="form" noValidate>
                <label className="label">
                  Email Address
                  <input
                    type="email"
                    className="input"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {errors.email && <div className="error">{errors.email}</div>}
                </label>

                <label className="label">
                  Password
                  <div className="pw-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input--pw"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <div className="error">{errors.password}</div>}
                </label>

                {errors.server && <div className="server-error">{errors.server}</div>}

                <button type="submit" className="submit" disabled={submitting}>
                  {submitting ? "Logging in..." : "LOGIN"}
                </button>

                <div className="recover">
                  Forgot password?{" "}
                  <a
                    href="#recover"
                    className="recover-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgotpassword");
                    }}
                  >
                    Recover
                  </a>
                </div>
              </form>
            </div>

            {/* Right logo */}
            <div className="right" aria-hidden="true"></div>
          </div>
        </main>
      </div>
    </>
  );
}
