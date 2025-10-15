import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

type FormState = {
  email: string;
  password: string;
  agree: boolean;
};

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

export default function RegisterPage(): JSX.Element {
  const [form, setForm] = useState<FormState>({ email: "", password: "", agree: false });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "server", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => ensurePoppins(), []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Please enter a valid email.";
    }
    if (!form.password) {
      errs.password = "Please enter a password.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (!form.agree) errs.agree = "You must agree to the terms.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, role: "student" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, server: data?.error || "Registration failed." }));
      } else {
        navigate("/login");
      }
    } catch {
      setErrors((prev) => ({ ...prev, server: "Network error. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  const css = `
  :root{
    --bg:#F3F6FC;
    --ink:#2F2F2F;
    --muted:#6B7280;
    --accent:#D55B00;
    --accent-2:#FFCEAA;
    --field:#FFFFFF;
    --field-bd:#E5E7EB;
    --shadow:0 8px 24px rgba(0,0,0,.08);
  }
  *{box-sizing:border-box}
  html,body,#root{height:100%;margin:0;font-family:Poppins,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  body{background:var(--bg)}
  a{color:inherit}
  /* NAVBAR */
  .nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;min-height:88px;background:#fff;border-bottom:1px solid #E6E6E6;
    position:sticky;top:0;z-index:50;
  }
  .nav-left{display:flex;align-items:center;gap:40px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand img{width:64px;height:64px;object-fit:contain}
  .navlinks{display:flex;gap:32px}
  .navlinks a{color:var(--accent);font-weight:400;font-size:16px;text-decoration:none;letter-spacing:.3px}
  .cta{background:var(--accent);color:#fff;border:none;border-radius:28px;padding:10px 28px;font-weight:600;cursor:pointer}

  /* LAYOUT */
  .wrap{min-height:100vh;display:flex;flex-direction:column}
  .hero{
    position:relative;flex:1;display:flex;align-items:stretch;overflow:hidden;
  }
 /* GRASP bg: overflow on left corner + lighter opacity */
.art {
  position: absolute;
  left: -22%;          /* push it past the left edge */
  bottom: -20%;        /* anchor toward lower-left corner */
  width: 95vw;         /* big enough to overflow */
  height: 120%;        /* let it bleed vertically a bit */
  background: url('/GRASPLogo2.png') no-repeat left bottom / contain;
  opacity: 0.80;       /* subtle, faded look */
  pointer-events: none;
  z-index: 0;
}

/* Keep it subtle and centered on small screens */
@media (max-width: 900px) {
  .art {
    left: -50%;
    bottom: -10%;
    width: 140vw;
    height: 120%;
    opacity: 0.06;     /* even lighter on mobile */
    background-position: left bottom;
  }
}

  .content{
    position:relative;z-index:1;display:grid;grid-template-columns:1fr minmax(420px,520px);
    align-items:center;gap:24px;width:100%;max-width:1200px;margin:0 auto;padding:48px 24px 64px;
  }
  .panel{background:transparent}
  .sign-title{margin:0;color:var(--ink);font-size:56px;font-weight:800;letter-spacing:.2px}
  .sign-title .up{background:linear-gradient(90deg,var(--accent),var(--accent-2));
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{margin:6px 0 26px;color:#9CA3AF;font-size:14px}
  .sub a{color:var(--accent);font-weight:600;text-decoration:none}
  form{display:flex;flex-direction:column;gap:16px}
  .field{display:flex;flex-direction:column;gap:8px}
  .label{font-size:13px;color:#374151;font-weight:600}
  input[type="email"],input[type="password"]{
    background:var(--field);border:1px solid var(--field-bd);border-radius:12px;
    padding:12px 14px;font-size:15px;outline:none;
  }
  .terms{display:flex;gap:10px;align-items:center;color:#9CA3AF;font-size:12px;margin-top:-6px}
  .terms input{width:16px;height:16px;accent-color:var(--accent)}
  .error{color:#d00000;font-size:12px;margin-top:-4px}
  .server-error{margin-top:4px;padding:10px 12px;background:#ffe8e8;border:1px solid #ffcccc;color:#9b1c1c;border-radius:10px;font-size:13px}
  .btn{margin-top:8px;background:var(--accent);border:none;color:#fff;border-radius:24px;padding:12px 18px;
       font-weight:800;letter-spacing:.3px;cursor:pointer;box-shadow:var(--shadow)}
  .btn:disabled{opacity:.7;cursor:not-allowed}

  /* Make only the CREATE ACCOUNT button shorter */
.btn-create {
  width: 200px;                 /* fixed neat width */
  text-align: center;
  justify-content: center;
  align-self: flex-start;       /* keeps it aligned left in the form */
  display: inline-flex;
  white-space: nowrap;
  font-size: 12px;
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.btn-create:hover {
  transform: scale(1.03);
  background-color: #e26000;
}

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

  @media (max-width: 900px){
    .content{grid-template-columns:1fr;gap:12px;padding:32px 16px 48px}
    .art{left:-40%;width:120vw;opacity:.35}
    .sign-title{font-size:40px}
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
          <button className="cta" onClick={() => navigate("/register")}>SIGN UP</button>
        </nav>

        {/* SIGN UP SECTION */}
        <main className="hero">
          <div className="back" onClick={() => navigate(-1)} aria-label="Back">←</div>
          <div className="art" aria-hidden="true" />
          <div className="content">
            <div /> {/* empty spacer for left art */}
            <section className="panel">
              <h1 className="sign-title">
                Sign <span className="up">Up</span>
              </h1>
              <p className="sub">
                Already have an account?{" "}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Log in
                </a>
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <label className="field">
                  <span className="label">Email Address</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <small className="error">{errors.email}</small>}
                </label>

                <label className="field">
                  <span className="label">Password</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.password && <small className="error">{errors.password}</small>}
                </label>

                <label className="terms">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to Platform{" "}
                    <a href="#tos" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                  </span>
                </label>
                {errors.agree && <small className="error">{errors.agree}</small>}

                {errors.server && <div className="server-error">{errors.server}</div>}

                <button className="btn btn-create" type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "CREATE ACCOUNT"}
                </button>

              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
