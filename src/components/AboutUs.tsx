import React, { useState, useEffect } from "react";
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
      "https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600&display=swap";
    document.head.append(l1, l2, l3);
  }
};

const AboutUs: React.FC = () => {
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
      {/* Header (same as landing page) */}
      <header style={styles.header}>
        <div style={styles.leftSection}>
          <div style={styles.logoGroup}>
            <img src="/BULSU.png" alt="BulSU Logo" style={styles.headerLogo} />
            <img src="/CICT.png" alt="CICT Logo" style={{ ...styles.headerLogo, marginLeft: 12 }} />
          </div>

          {!isMobile && (
            <nav style={styles.navLinks}>
              <a href="#admin" style={styles.navLink}>ADMIN GUIDE</a>
              <a href="#student" style={styles.navLink}>STUDENT GUIDE</a>
              <a href="/aboutus" style={styles.navLinkActive}>ABOUT US</a>
            </nav>
          )}
        </div>

        {!isMobile && (
          <button style={styles.signUpButton} onClick={() => navigate("/register")}>
            SIGN UP
          </button>
        )}

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
          <a href="#admin" style={styles.mobileLink}>ADMIN GUIDE</a>
          <a href="#student" style={styles.mobileLink}>STUDENT GUIDE</a>
          <a href="/aboutus" style={styles.mobileLink}>ABOUT US</a>
          <button
            style={{ ...styles.signUpButton, width: "100%" }}
            onClick={() => navigate("/register")}
          >
            SIGN UP
          </button>
        </div>
      )}

      {/* Main Section */}
      <main style={styles.main}>
        {/* Background logo (stretch + overlap) */}
        <img src="/GRASPLogo2.png" alt="GRASP Background" style={styles.heroBg} />

        {/* Text content */}
        <section style={styles.textSection}>
          <h1 style={styles.title}>About Us</h1>

          <p style={styles.description}>
            At <strong>GRASP</strong> (Graduate Readiness and Success Predictor), we believe that
            data-driven insights can unlock brighter futures. GRASP is an intelligent and
            streamlined prediction system that analyzes academic and demographic data to forecast
            employability outcomes for IT graduates.
          </p>

          <p style={styles.description}>
            Our goal is to empower students, educators, and institutions by transforming raw data
            into actionable insights that guide career planning and academic support. With GRASP,
            you don’t just track progress—you shape success.
          </p>

          <button style={styles.backButton} onClick={() => navigate("/")}>
            Back to <span style={{ color: "#D55B00" }}>Home →</span>
          </button>
        </section>
      </main>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  /* NAVBAR */
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
  leftSection: { display: "flex", alignItems: "center", gap: 40 },
  logoGroup: { display: "flex", alignItems: "center" },
  headerLogo: { width: 64, height: 64, objectFit: "contain" },
  navLinks: { display: "flex", gap: 32 },
  navLink: {
    textDecoration: "none",
    color: "#D55B00",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: 16,
  },
  navLinkActive: {
    textDecoration: "none",
    color: "#D55B00",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: 16,
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
  },
  mobileLink: {
    textDecoration: "none",
    color: "#D55B00",
    fontWeight: 400,
    fontSize: 16,
  },

  /* MAIN SECTION */
    /* MAIN SECTION */
  main: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F3F6FC",
    fontFamily: "Poppins, sans-serif",
    minHeight: "calc(100vh - 88px)",
    display: "flex",
    alignItems: "center",
    padding: "80px 0",
  },

  // GRASP background watermark (soft and balanced)
  heroBg: {
    position: "absolute",
    right: "-35%",           // push slightly past right edge
    bottom: "-25%",          // anchor toward lower-right
    width: "90vw",           // large enough to overflow
    height: "120%",          // vertical bleed
    objectFit: "contain",
    opacity: 0.80,           // subtle watermark opacity
    zIndex: 0,
    pointerEvents: "none",
  },

  textSection: {
    position: "relative",
    zIndex: 1,
    width: "55%",
    padding: "0 60px",
  },

  title: {
    margin: 0,
    marginBottom: 20,
    fontWeight: 700,
    fontSize: "clamp(42px, 5vw, 72px)", // balanced large title
    lineHeight: 1.1,
    background: "linear-gradient(90deg, #D55B00, #FFCEAA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  description: {
    fontWeight: 300,
    fontSize: "clamp(16px, 1.4vw, 20px)", // smaller and consistent
    color: "#4B5563",
    lineHeight: 1.8,
    marginBottom: 18,
  },

  backButton: {
    marginTop: 28,
    background: "none",
    border: "none",
    color: "#2F2F2F",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
  },

};

export default AboutUs;
