import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ensurePoppins = () => {
  if (!document.querySelector('link[data-font="poppins"]')) {
    const link1 = document.createElement("link");
    link1.rel = "preconnect";
    link1.href = "https://fonts.googleapis.com";
    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";
    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.setAttribute("data-font", "poppins");
    link3.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600&display=swap";
    document.head.append(link1, link2, link3);
  }
};

const LandingPageUI = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    ensurePoppins();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header style={styles.header}>
        {/* LEFT SECTION: Logos + Navigation */}
        <div style={styles.leftSection}>
          <div style={styles.logoContainer}>
            <img src="/BULSU.png" alt="BulSU Logo" style={styles.headerLogo} />
            <img
              src="/CICT.png"
              alt="CICT Logo"
              style={{ ...styles.headerLogo, marginLeft: 12 }}
            />
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={styles.navLinks}>
              <a href="#admin" style={styles.navLink}>
                ADMIN GUIDE
              </a>
              <a href="#student" style={styles.navLink}>
                STUDENT GUIDE
              </a>
              <a href="/aboutus" style={styles.navLink}>
                ABOUT US
              </a>
            </nav>
          )}
        </div>

        {/* RIGHT SECTION: Sign Up button */}
        {!isMobile && (
          <button
            style={styles.signUpButton}
            onClick={() => navigate("/register")}
          >
            SIGN UP
          </button>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            style={styles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}
      </header>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div style={styles.mobileMenu}>
          <a href="#admin" style={styles.mobileLink}>
            ADMIN GUIDE
          </a>
          <a href="#student" style={styles.mobileLink}>
            STUDENT GUIDE
          </a>
          <a href="/aboutus" style={styles.mobileLink}>
            ABOUT US
          </a>
          <button
            style={{ ...styles.signUpButton, width: "100%" }}
            onClick={() => navigate("/register")}
          >
            SIGN UP
          </button>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.logoCircuit}>
          <img
            src="/GRASPLogo2.png"
            alt="GRASP Logo"
            style={styles.graspLogo}
          />
        </div>

        <div style={styles.textBlock}>
          <h1 style={styles.title}>
            Graduate Readiness <br />
            and Status Predictor <br />
            (GRASP)
          </h1>

          <p style={styles.description}>
            GRASP is a smart and streamlined prediction system that analyzes
            academic and demographic data to forecast employability outcomes for
            IT graduates. Designed to empower career planning and educational
            support, GRASP transforms your data into meaningful insights that
            would shape future success.
          </p>

          <div style={styles.ctaRow}>
            <button
              style={styles.adminButton}
              onClick={() => navigate("/login")}
            >
              ADMIN LOGIN
            </button>
            <button
              style={styles.studentButton}
              onClick={() => navigate("/login")}
            >
              STUDENT LOGIN
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E6E6E6",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    minHeight: 88,
    fontFamily: "Poppins, sans-serif",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: 40,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 64,
    height: 64,
    objectFit: "contain",
  },
  navLinks: {
    display: "flex",
    gap: 32,
  },
  navLink: {
    textDecoration: "none",
    color: "#D55B00",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  signUpButton: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: 16,
    backgroundColor: "#D55B00",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 28,
    padding: "10px 28px",
    cursor: "pointer",
  },
  hamburger: {
    fontSize: 28,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#D55B00",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 16,
    borderBottom: "1px solid #E6E6E6",
    backgroundColor: "#fff",
    fontFamily: "Poppins, sans-serif",
  },
  mobileLink: {
    textDecoration: "none",
    color: "#D55B00",
    fontWeight: 400,
    fontSize: 16,
  },

  /* MAIN */
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "40px",
    padding: "80px 60px",
    backgroundColor: "#F3F6FC",
    fontFamily: "Poppins, sans-serif",
    position: "relative",
  },

  // Enlarged GRASP logo with better scaling
  logoCircuit: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 0,
  },
  graspLogo: {
    width: "min(120%, 1350px)", // bigger logo
    height: "auto",
    aspectRatio: "1163 / 831",
    objectFit: "contain",
    opacity: 0.9,
  },

  textBlock: {
    justifySelf: "end",
    maxWidth: 760,
    textAlign: "right",
    zIndex: 1,
  },

  // balanced title
  title: {
    margin: 0,
    marginBottom: 20,
    color: "#2F2F2F",
    fontWeight: 700,
    fontSize: "clamp(60px, 6vw, 50px)", // more balanced for wide & mobile
    lineHeight: 1.08,
  },

  // better proportion with text
  description: {
    color: "#555555",
    fontWeight: 300,
    fontSize: "clamp(17px, 1.8vw, 22px)", // smaller, readable, elegant
    lineHeight: 1.8,
    margin: "0 0 32px 0",
    maxWidth: 700,
    marginLeft: "auto",
  },

  ctaRow: {
    display: "flex",
    gap: 16,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },

  adminButton: {
    backgroundColor: "#D55B00",
    border: "none",
    borderRadius: 28,
    color: "#fff",
    padding: "14px 40px",
    fontWeight: 600,
    fontSize: 17,
    cursor: "pointer",
    transition: "background 0.2s",
  },

  studentButton: {
    backgroundColor: "transparent",
    border: "2px solid #D55B00",
    borderRadius: 28,
    color: "#D55B00",
    padding: "12px 38px",
    fontWeight: 600,
    fontSize: 17,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  },
};

export default LandingPageUI;
