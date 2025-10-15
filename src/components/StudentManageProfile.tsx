import React, { useEffect, useRef, useState, type JSX } from "react";
import styled, { createGlobalStyle } from "styled-components";
import StudentSidebar from "./StudentSideBar";
import { useNavigate } from "react-router-dom";

/* ================= GLOBAL ================= */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;font-family:'Poppins',sans-serif;background:#F5F8FF;color:#222}
`;

const Shell = styled.div`display:flex; min-height:100vh;`;
const Content = styled.main`
  flex:1; padding:24px; max-width:1100px; margin:0 auto; display:grid; gap:16px;
`;

const Card = styled.div`
  background:#fff; border-radius:22px; padding:22px;
  box-shadow:0 10px 34px rgba(15,27,40,.06);
`;

const Grid = styled.div`
  display:grid; grid-template-columns:repeat(12,1fr); gap:16px;
  @media (max-width:960px){ grid-template-columns:1fr; }
`;

/* ========== Header (avatar + name) ========== */
const HeaderBar = styled.div`
  display:flex; align-items:center; gap:18px; position:relative; padding:8px 8px 0 8px;
`;
const BackBtn = styled.button`
  position:absolute; left:6px; top:6px;
  background:#fff; color:#D55B00; border:0; width:44px; height:44px;
  border-radius:999px; font-size:22px; font-weight:800; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 16px rgba(0,0,0,.12);
  transition:transform .15s ease, background .15s ease, color .15s ease;
  &:hover{ transform:scale(1.05); background:#D55B00; color:#fff; }
`;
const AvatarStack = styled.div`
  --size: 104px;
  position:relative; width:var(--size); height:var(--size); flex:0 0 var(--size);
  cursor:pointer;
`;
const Gear = styled.div`
  position:absolute; inset:-12px; opacity:.18; filter:grayscale(1);
  background:radial-gradient(circle at center, #9aa1ac 40%, transparent 42%) center/contain no-repeat;
  mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M54.6 4.4 58 14.9a33.2 33.2 0 0 1 8.7 3.6l10.4-3.8 6.2 10.7-8.5 7.1a33.3 33.3 0 0 1 1.9 9.3l10.4 3.6-2.4 12.2-10.9-1.1a33.4 33.4 0 0 1-6.6 7.6l4.8 9.8-10.5 6.2-7.3-8.4a33.6 33.6 0 0 1-10 0l-7.3 8.4-10.5-6.2 4.8-9.8A33.4 33.4 0 0 1 18 66.7l-10.9 1.1L4.7 55.6l10.4-3.6a33.3 33.3 0 0 1 1.9-9.3l-8.5-7.1 6.2-10.7 10.4 3.8a33.2 33.2 0 0 1 8.7-3.6l3.4-10.5 11.7-.2ZM50 65a15 15 0 1 0 0-30 15 15 0 0 0 0 30Z"/></svg>') center/contain no-repeat;
`;
const Avatar = styled.img`
  position:relative; z-index:1; width:100%; height:100%; object-fit:cover;
  border-radius:999px; border:4px solid #fff; box-shadow:0 8px 24px rgba(0,0,0,.15);
`;
const HiddenFile = styled.input.attrs({ type: "file", accept: "image/*" })`
  display:none;
`;

const TitleBlock = styled.div`display:flex; flex-direction:column; gap:6px;`;
const Name = styled.h1`margin:0; font-size:48px; line-height:1.05; letter-spacing:.2px;`;
const Meta = styled.div`
  display:flex; gap:16px; align-items:center; color:#6b7280; font-size:14px;
  & span{ display:flex; align-items:center; gap:8px; }
`;
const Pill = styled.button`
  margin-left:auto; background:#fff; color:#D55B00; border:2px solid #D55B00;
  padding:8px 14px; border-radius:999px; font-weight:700; cursor:pointer;
  box-shadow:0 8px 24px rgba(213,91,0,.08);
`;

/* ========== Sections & Fields ========== */
const Section = styled(Card)`padding-top:18px;`;
const SectionBadge = styled.div`
  display:inline-block; background:#FFD8BD; color:#1f2937;
  padding:6px 14px; border-radius:14px; border:2px solid #D55B00;
  font-weight:700; font-size:13px; margin-bottom:12px;
`;

const Field = styled.label<{ span?: number }>`
  grid-column: span ${p=>p.span ?? 4};
  display:flex; flex-direction:column; gap:8px; font-size:12px; color:#111827;
  .label{font-weight:700; letter-spacing:.4px;}
  input,select{
    padding:12px 14px; font-size:14px; background:#fff;
    border-radius:14px; border:2px solid #D55B00; outline:none;
  }
`;

const Row = styled.div`display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;`;
const Button = styled.button<{ ghost?: boolean }>`
  border:0; border-radius:12px; padding:12px 16px; font-weight:800; cursor:pointer;
  background:${p=>p.ghost?'#fff':'#d55b00'}; color:${p=>p.ghost?'#374151':'#fff'};
  border:${p=>p.ghost?'2px solid #e5e7eb':'0'};
  box-shadow:0 10px 30px rgba(15,27,40,.08);
  &:disabled{opacity:.6; cursor:not-allowed}
`;

const Toast = styled.div`
  position:fixed; right:24px; bottom:24px; background:#10b981; color:#fff;
  padding:12px 14px; border-radius:12px; box-shadow:0 8px 30px rgba(15,27,40,.15);
  font-weight:700;
`;



/* ================= CONSTS ================= */
const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";
const AVATAR_FALLBACKS = [
  "https://www.gravatar.com/avatar/?d=mp&s=320",
  "https://i.pravatar.cc/320?img=67",
] as const;

type MenuItem = { label: string; url: string };
type Role = "student" | "admin" | string;

/* fields we keep ONLY in localStorage (not in DB) */
const localOnlyKeys = [
  "sex","dob","age","pob",
  "street","lot","brgy","city",
  "year_enrolled","expected_grad",
] as const;

type LocalOnlyKey = typeof localOnlyKeys[number];

type FormState = {
  // DB-backed
  student_no: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email_address: string;
  year_level: string;
  // local-only
  sex: string;
  dob: string;
  age: string;
  pob: string;
  street: string;
  lot: string;
  brgy: string;
  city: string;
  year_enrolled: string;
  expected_grad: string;
};

/* ================= COMPONENT ================= */
export default function StudentManageProfile(): JSX.Element {
  const navigate = useNavigate();

  // ---- base form ----
  const [form, setForm] = useState<FormState>({
    student_no: "", first_name: "", middle_name: "", last_name: "",
    email_address: "", year_level: "",
    sex: "", dob: "", age: "", pob: "",
    street: "", lot: "", brgy: "", city: "",
    year_enrolled: "", expected_grad: "",
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [avatarSrc, setAvatarSrc] = useState<string>(AVATAR_FALLBACKS[0]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Logged-in user info
  const userIdRaw = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const studentUserId = userIdRaw ? Number(userIdRaw) : null;
  const roleFromLS: Role = (typeof window !== "undefined" && localStorage.getItem("user_role")) || "student";
  const emailFromLS: string = (typeof window !== "undefined" && localStorage.getItem("user_email")) || "";

  const AVATAR_KEY = studentUserId ? `student_avatar_b64_${studentUserId}` : "student_avatar_b64";
  const LOCAL_PROFILE_KEY = studentUserId ? `student_profile_local_${studentUserId}` : "student_profile_local";

  const setF = (k: keyof FormState | LocalOnlyKey, v: string) => {
    setForm(s => {
      const next = { ...s, [k]: v } as FormState;
      if ((localOnlyKeys as readonly string[]).includes(k as string)) {
        persistLocalOnly({ [k as LocalOnlyKey]: v });
      }
      return next;
    });
  };

  /* ---------- localStorage helpers ---------- */
  const loadLocalOnly = (): Partial<Record<LocalOnlyKey, string>> => {
    try { return JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || "{}"); }
    catch { return {}; }
  };
  const persistLocalOnly = (partial: Partial<Record<LocalOnlyKey, string>>) => {
    const cur = loadLocalOnly();
    const next = { ...cur, ...partial };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
  };

  /* ---------- initial loads ---------- */
  // avatar + local fields
  useEffect(() => {
    if (studentUserId) {
      const cached = localStorage.getItem(AVATAR_KEY);
      if (cached) setAvatarSrc(cached);

      const localOnly = loadLocalOnly();
      if (localOnly && Object.keys(localOnly).length) {
        setForm(f => ({ ...f, ...localOnly }));
      }
    }
  }, [AVATAR_KEY, LOCAL_PROFILE_KEY, studentUserId]);

  // server profile + merge local + seed email from LS
  useEffect(() => {
    if (!studentUserId) { return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/students/by_user/${studentUserId}`);
        const j = await res.json();
        if (j?.student) {
          setForm(f => ({
            ...f,
            student_no: j.student.student_no || "",
            first_name:  j.student.first_name  || "",
            middle_name: j.student.middle_name || "",
            last_name:   j.student.last_name   || "",
            email_address: j.student.email_address || "",
            year_level:  j.student.year_level  || "",
          }));
        }
        // merge local-only
        const localOnly = loadLocalOnly();
        if (localOnly && Object.keys(localOnly).length) {
          setForm(f => ({ ...f, ...localOnly }));
        }
        // seed email from LS if still blank
        setForm(f => (!f.email_address && emailFromLS ? { ...f, email_address: emailFromLS } : f));
      } catch (e) {
        console.warn(e);
        setError("Failed to load profile.");
      } finally {
        
      }
    })();
  }, [studentUserId, emailFromLS]);

  // auto hide toast
  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2500);
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [toast]);

  /* ---------- actions ---------- */
  const save = async () => {
    if (!studentUserId) { setError("Missing user id. Please log in again."); return; }
    setSaving(true);
    setError("");
    try {
      // send only DB fields
      const payload = {
        student_no: form.student_no,
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        email_address: form.email_address,
        year_level: form.year_level,
      };

      const res = await fetch(`${API_BASE}/students/update_basic/${studentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Update failed");

      // snapshot local-only too
      const snap: Partial<Record<LocalOnlyKey, string>> = {};
      for (const k of localOnlyKeys) snap[k] = (form as any)[k] ?? "";
      persistLocalOnly(snap);

      setToast("Profile updated!");
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = String(reader.result || "");
      setAvatarSrc(b64);
      if (studentUserId) localStorage.setItem(AVATAR_KEY, b64);
      setToast("Photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const menuItems: MenuItem[] = [
    { label: "Dashboard", url: "/student-dashboard" },
    { label: "Predict", url: "/predict" },
    { label: "Manage Profile", url: "/student-manage-profile" },
    { label: "Log Out", url: "/logout" },
  ];

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ") || "Your Name";
  const displayRole = (roleFromLS || "student").toUpperCase();
  const emailShow = form.email_address || emailFromLS || "your.email@domain.com";

  return (
    <>
      <GlobalStyle/>
      <Shell>
        <StudentSidebar
          menuItems={menuItems}
          active="Manage Profile"
          onSelect={() => { /* noop if required by Sidebar */ }}
          onLogout={handleLogout}
        />
        <Content>
          {/* ===== HEADER ===== */}
          <Card style={{paddingTop:28}}>
            <HeaderBar>
              <BackBtn aria-label="Back" onClick={()=>navigate(-1)}>←</BackBtn>

              <AvatarStack onClick={()=>fileRef.current?.click()} title="Click to change photo">
                <Gear/>
                <Avatar src={avatarSrc} alt="Profile" />
                <HiddenFile ref={fileRef} onChange={onPickAvatar}/>
              </AvatarStack>

              <TitleBlock>
                <Name>{fullName}</Name>
                <Meta>
                  <span style={{fontWeight:700, color:"#9095a0"}}>{displayRole}</span>
                  <span>📧 {emailShow}</span>
                </Meta>
              </TitleBlock>

              <Pill onClick={()=>window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"})}>
                ✏️ EDIT
              </Pill>
            </HeaderBar>
          </Card>

          {/* ===== INITIAL INFORMATION ===== */}
          <Section>
            <SectionBadge>INITIAL INFORMATION</SectionBadge>
            <Grid>
              <Field><span className="label">FIRST NAME</span>
                <input value={form.first_name} onChange={e=>setF("first_name", e.target.value)} />
              </Field>
              <Field><span className="label">MIDDLE NAME</span>
                <input value={form.middle_name} onChange={e=>setF("middle_name", e.target.value)} />
              </Field>
              <Field><span className="label">LAST NAME</span>
                <input value={form.last_name} onChange={e=>setF("last_name", e.target.value)} />
              </Field>

              <Field><span className="label">SEX</span>
                <select value={form.sex} onChange={e=>setF("sex", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </Field>
              <Field span={5}><span className="label">DATE OF BIRTH</span>
                <input type="date" value={form.dob} onChange={e=>setF("dob", e.target.value)} />
              </Field>
              <Field><span className="label">AGE</span>
                <input value={form.age} onChange={e=>setF("age", e.target.value)} />
              </Field>
              <Field span={5}><span className="label">PLACE OF BIRTH</span>
                <input value={form.pob} onChange={e=>setF("pob", e.target.value)} />
              </Field>
            </Grid>
          </Section>

          {/* ===== HOME ADDRESS ===== */}
          <Section>
            <SectionBadge>HOME ADDRESS</SectionBadge>
            <Grid>
              <Field span={12}><span className="label">STREET</span>
                <input value={form.street} onChange={e=>setF("street", e.target.value)} />
              </Field>
              <Field><span className="label">HOUSE NO./LOT NO.</span>
                <input value={form.lot} onChange={e=>setF("lot", e.target.value)} />
              </Field>
              <Field span={6}><span className="label">SUBDIVISION AND BARANGAY</span>
                <input value={form.brgy} onChange={e=>setF("brgy", e.target.value)} />
              </Field>
              <Field><span className="label">CITY AND PROVINCE</span>
                <input value={form.city} onChange={e=>setF("city", e.target.value)} />
              </Field>
            </Grid>
          </Section>

          {/* ===== STUDENT INFORMATION ===== */}
          <Section>
            <SectionBadge>STUDENT INFORMATION</SectionBadge>
            <Grid>
              <Field span={6}><span className="label">STUDENT NUMBER</span>
                <input value={form.student_no} onChange={e=>setF("student_no", e.target.value)} />
              </Field>
              <Field span={4}><span className="label">EMAIL ADDRESS</span>
                <input type="email" value={form.email_address} onChange={e=>setF("email_address", e.target.value)} />
              </Field>
              <Field span={2}><span className="label">YEAR LEVEL</span>
                <input value={form.year_level} onChange={e=>setF("year_level", e.target.value)} />
              </Field>
            </Grid>
          </Section>

          {/* ===== BATCH INFORMATION ===== */}
          <Section>
            <SectionBadge>BATCH INFORMATION</SectionBadge>
            <Grid>
              <Field span={3}><span className="label">YEAR ENROLLED</span>
                <input placeholder="e.g., 2022" value={form.year_enrolled} onChange={e=>setF("year_enrolled", e.target.value)} />
              </Field>
              <Field span={3}><span className="label">EXPECTED GRADUATION</span>
                <input placeholder="e.g., 2026" value={form.expected_grad} onChange={e=>setF("expected_grad", e.target.value)} />
              </Field>
            </Grid>
          </Section>

          {/* ===== ACTIONS ===== */}
          <Section>
            <Row>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Row>
            {!!error && <div style={{marginTop:10, color:"#b91c1c", fontWeight:700}}>⚠ {error}</div>}
            
          </Section>
        </Content>
      </Shell>

      {toast && <Toast>{toast}</Toast>}
    </>
  );
}
