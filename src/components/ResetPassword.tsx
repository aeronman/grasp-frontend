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

export default function ResetPassword(): JSX.Element {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => ensurePoppins(), []);

  function validate() {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg) return;
    // Simulate reset success
    setTimeout(() => setDone(true), 600);
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

  /* NAVBAR (same as other pages) */
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

  /* PAGE LAYOUT */
  .wrap{min-height:calc(100vh - 88px);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:60px 20px}
  /* Right-side giant circuit art overlapping edges */
  .art{
    position:absolute;right:-12%;top:-6%;
    width:min(60vw,950px);height:120%;
    background:url('/GRASPLogo2.png') no-repeat left center/contain;
    opacity:1;pointer-events:none;z-index:0;
  }

  /* Centered card */
  .card{
    position:relative;z-index:1;
    width:min(640px,92vw);
    background:var(--card);
    border-radius:16px;
    box-shadow:0 20px 40px rgba(23,39,56,.08);
    padding:32px 36px 32px;
    text-align:left;
  }
  .close{position:absolute;left:16px;top:14px;border:none;background:transparent;color:#9AA3AF;font-size:22px;cursor:pointer}

  /* Small gear icon substitute */
  .gear{
    width:54px;height:54px;border-radius:14px;margin:4px 0 8px;
    background: radial-gradient(circle at 30% 30%, #FFDDB8 0%, #FFC387 45%, #FF9F40 100%);
    box-shadow:0 10px 24px rgba(213,91,0,.15);
  }

  .title{margin:6px 0 18px;font-size:28px;font-weight:800;color:#333}
  .field{margin-bottom:14px}
  .label{display:block;font-size:13px;color:#666;margin-bottom:8px;font-weight:600}
  input{
    width:100%;padding:12px 16px;border-radius:12px;border:1px solid #eee;background:#fff;
    box-shadow:0 4px 10px rgba(12,20,31,.06) inset;outline:none;font-size:14px;
  }
  input:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(213,91,0,.14)}
  .error{color:#D9534F;font-size:13px;margin:6px 2px -2px}

  .btn{
    display:inline-block;margin-top:6px;background:var(--accent);color:#fff;border:none;
    border-radius:22px;padding:10px 22px;font-weight:700;cursor:pointer;
  }

  .done{color:#444;margin:8px 0 12px}

  @media (max-width: 520px){
    .card{padding:24px 20px}
  }`;

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

        <div className="card" role="dialog" aria-labelledby="reset-title">
          <button className="close" aria-label="Close" onClick={() => navigate("/login")}>✕</button>

          <div className="gear" aria-hidden="true" />

          <h1 id="reset-title" className="title">Reset Password</h1>

          {!done ? (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="new" className="label">New Password</label>
                <input
                  id="new"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="confirm" className="label">Confirm New Password</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="btn">RESET PASSWORD</button>
            </form>
          ) : (
            <>
              <p className="done">Your password has been updated successfully.</p>
              <button className="btn" onClick={() => navigate("/login")}>Back to Login</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
