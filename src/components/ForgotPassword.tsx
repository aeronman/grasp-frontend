import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => ensurePoppins(), []);

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Simulate API call
    setTimeout(() => setSent(true), 800);
  }

  const css = `
  :root{
    --bg:#F3F6FC;
    --ink:#2F2F2F;
    --muted:#9CA3AF;
    --accent:#D55B00;
    --accent2:#FFCEAA;
    --card:#FFFFFF;
    --bd:#E6E6E6;
  }
  *{box-sizing:border-box}
  html,body,#root{height:100%;margin:0;font-family:Poppins,sans-serif}
  body{background:var(--bg)}

  /* ===== NAVBAR (same as landing) ===== */
  .nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;min-height:88px;background:#fff;border-bottom:1px solid var(--bd);
    position:sticky;top:0;z-index:50;
  }
  .nav-left{display:flex;align-items:center;gap:40px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand img{width:64px;height:64px;object-fit:contain}
  .navlinks{display:flex;gap:32px}
  .navlinks a{color:var(--accent);font-weight:400;font-size:16px;text-decoration:none;letter-spacing:.3px}
  .cta{background:var(--accent);color:#fff;border:none;border-radius:28px;padding:10px 28px;font-weight:600;cursor:pointer}

  /* ===== PAGE LAYOUT ===== */
  .wrap{min-height:calc(100vh - 88px);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:60px 20px}
  .art{
    position:absolute;left:-12%;bottom:-6%;
    width:min(58vw,900px);height:120%;
    background:url('/GRASPLogo2.png') no-repeat right center/contain;
    opacity:1;pointer-events:none;z-index:0;
  }

  /* Center card */
  .card{
    position:relative;z-index:1;
    width:min(640px,92vw);
    background:var(--card);
    border-radius:16px;
    box-shadow:0 20px 40px rgba(23,39,56,.08);
    padding:36px 34px 28px;
    text-align:center;
  }
  .close{
    position:absolute;left:14px;top:12px;border:none;background:transparent;color:#9AA3AF;
    font-size:22px;cursor:pointer;line-height:1;
  }

  /* Lock icon (simple inline) */
  .lock{
    width:64px;height:64px;margin:6px auto 8px;display:block;
    background: radial-gradient(circle at 30% 30%, #FFDDB8 0%, #FFC387 45%, #FF9F40 100%);
    border-radius:18px;
    box-shadow:0 10px 24px rgba(213,91,0,.15);
  }

  .title{
    margin:6px 0 6px;
    font-size:32px;font-weight:800;color:var(--ink);
  }
  .title .pw{
    background:linear-gradient(90deg,var(--accent),var(--accent2));
    -webkit-background-clip:text;background-clip:text;color:transparent;
  }
  .sub{margin:0 0 18px;color:#9AA3AF;font-size:12px}

  .field{max-width:380px;margin:0 auto 14px;text-align:left}
  .input{
    width:100%;padding:14px 16px;border-radius:22px;border:1px solid #eee;background:#fff;
    box-shadow:0 4px 10px rgba(12,20,31,.06) inset;outline:none;font-size:14px;
  }
  .input:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(213,91,0,.14)}
  .error{display:block;color:#D9534F;font-size:12px;margin-top:6px}

  .btn{
    margin-top:6px;background:var(--accent);border:none;color:#fff;border-radius:22px;
    padding:12px 34px;font-weight:700;cursor:pointer;
  }

  .back{
    margin-top:16px;color:#6B7280;font-size:14px;display:inline-flex;gap:8px;align-items:center;cursor:pointer;
  }
  .back b{color:var(--accent)}
  `;

  return (
    <>
      <style>{css}</style>

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

      {/* CONTENT */}
      <div className="wrap">
        <div className="art" aria-hidden="true" />

        <div className="card" role="dialog" aria-labelledby="fp-title">
          <button className="close" aria-label="Close" onClick={() => navigate("/login")}>✕</button>

          <span className="lock" aria-hidden="true" />

          <h1 id="fp-title" className="title">
            Forgot <span className="pw">password?</span>
          </h1>
          <p className="sub">Enter your email and we’ll send you a link to reset your password</p>

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                />
                {error && <small className="error">{error}</small>}
              </div>

              <button type="submit" className="btn">SUBMIT</button>
            </form>
          ) : (
            <>
              <p style={{ color: "#444", marginTop: 8 }}>
                We sent a recovery link to <strong>{email}</strong>. Check your inbox.
              </p>
              <button className="btn" onClick={() => setSent(false)}>Send again</button>
            </>
          )}

          <div className="back" onClick={() => navigate("/login")} role="button" tabIndex={0}>
            ‹ <span>Back to <b>Login</b></span>
          </div>
        </div>
      </div>
    </>
  );
}
