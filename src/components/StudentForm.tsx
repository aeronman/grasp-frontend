// StudentFormWithClustering.tsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import StudentSidebar from "./StudentSideBar";
import { useNavigate, Link } from "react-router-dom";

/* =================== Global / Layout =================== */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;font-family:'Poppins',sans-serif;background:#F5F8FF;color:#222}
`;
const Shell = styled.div`display:flex; min-height:100vh;`;
const Content = styled.main`flex:1; padding:24px; max-width:1200px; margin:0 auto;`;
const Card = styled.div`background:#fff;border-radius:14px;padding:22px;box-shadow:0 8px 30px rgba(15,27,40,0.05);margin-bottom:16px;`;
const H = styled.h2`margin:0 0 8px;`;
const SubH = styled.h3`margin:10px 0 12px;font-size:16px;color:#1f2937;`;

const Grid = styled.div`
  display:grid;grid-template-columns:repeat(12,1fr);gap:12px;
  @media(max-width:1024px){grid-template-columns:1fr;}
`;

/** Use transient prop ($span) to avoid React DOM warnings */
const Field = styled.label<{ $span?: number }>`
  grid-column: span ${(p) => p.$span || 6};
  display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;
  .label{font-weight:600;}
  input,select,textarea{
    padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px; background:#fff;
    height:40px;
  }
  textarea{height:auto; min-height:90px; resize:vertical;}
  small{color:#6b7280}
`;

const InputCompact = styled.input`
  padding:8px 12px!important; max-width:200px; height:40px!important;
`;
const InputTiny = styled.input`
  padding:8px 12px!important; max-width:120px; height:40px!important; text-align:center;
`;

const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const Button = styled.button<{ $ghost?: boolean }>`
  border:0;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer;
  box-shadow:0 8px 30px rgba(15,27,40,0.05);
  background:${(p)=>p.$ghost?'#fff':'#d55b00'};
  color:${(p)=>p.$ghost?'#374151':'#fff'};
  border:${(p)=>p.$ghost?'1px solid #e5e7eb':'0'};
  &:disabled{opacity:.6; cursor:not-allowed}
`;

const ResultRow = styled.div`
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  .pill{background:#eef2ff;color:#1f2a5a;border-radius:999px;padding:6px 10px;font-weight:700}
`;
const List = styled.ul`
  list-style:none; padding-left:0; margin:8px 0 0 0;
  li{display:flex; align-items:flex-start; gap:8px; margin:6px 0;}
`;
const Dot = styled.span<{ bad?: boolean }>`
  width:8px; height:8px; border-radius:999px; margin-top:6px;
  background:${(p)=>p.bad ? "#ef4444" : "#10b981"};
`;
const BarWrap = styled.div`display:grid; gap:8px; margin-top:8px;`;
const Bar = styled.div`
  display:flex; align-items:center; gap:10px;
  .label{width:280px; min-width:220px; font-size:14px;}
  .track{flex:1; background:#f3f4f6; border-radius:10px; height:12px; overflow:hidden;}
  .fill{height:100%; background:#1f2a5a;}
  .val{width:68px; text-align:right; font-weight:700;}
`;
const FlexSplit = styled.div`
  display:grid; grid-template-columns: 1.2fr .8fr; gap:16px;
  @media(max-width:1024px){ grid-template-columns:1fr; }
`;
const Muted = styled.div`color:#6b7280;`;
const Warn = styled.div`color:#b91c1c; font-weight:700; margin-top:6px;`;

/* =================== Radar (compact) =================== */
const RadarBox = styled.div`
  background:#fafafa; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px;
`;
type RadarChartProps = { size?: number; labels: string[]; strengths: number[]; weaknesses: number[]; };
function RadarChart({ size=300, labels=[], strengths=[], weaknesses=[] }: RadarChartProps) {
  const pad = 24;
  const r = (size - pad*2) / 2;
  const cx = size/2, cy = size/2;
  const N = labels.length || 1;
  const toPoint = (idx: number, val: number) => {
    const angle = (Math.PI * 2 * idx / N) - Math.PI/2;
    const rr = (val/5) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };
  const polygon = (vals: number[], stroke: string, fill: string) => {
    const pts = vals.map((v, i)=>toPoint(i, v)).map(([x,y])=>`${x},${y}`).join(" ");
    return (
      <g>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={2} opacity={0.5}/>
        {vals.map((v,i)=>{
          const [x,y]=toPoint(i,v);
          return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
        })}
      </g>
    );
  };
  const rings = [1,2,3,4,5].map(k=>(<circle key={k} cx={cx} cy={cy} r={(k/5)*r} fill="none" stroke="#e5e7eb"/>));
  const spokeEls = labels.map((lab,i)=>{
    const [x,y] = toPoint(i, 5.4);
    const [xt, yt] = toPoint(i, 5);
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={xt} y2={yt} stroke="#e5e7eb"/>
        <text x={x} y={y} textAnchor="middle" fontSize={11} fill="#374151">{lab}</text>
      </g>
    );
  });
  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Strengths/weaknesses radar">
      <g>
        {rings}{spokeEls}
        {polygon(weaknesses, "#ef4444", "#fecaca")}
        {polygon(strengths, "#10b981", "#bbf7d0")}
        <circle cx={cx} cy={cy} r={2} fill="#6b7280" />
      </g>
    </svg>
  );
}

/* =================== Constants / Helpers =================== */
const EXTRACURR = [
  "Organizations (e.g., SWITS, BulSU MSC, etc.)",
  "Sports (e.g., CLARAA, Intramurals, etc.)",
  "Cultural Performer",
  "Student Council (e.g., Student Government, etc.)",
  "Publication (e.g., CURSOR Publication, Pacesetter, etc.)",
] as const;

const SOFT_SKILLS = [
  "Verbal Communication","Written Communication","Critical Thinking","Leadership",
  "Time Management","Problem-Solving Skills","Networking","Collaboration",
  "Ethical Judgment","Stress Management","Socializing / Interpersonal Skills","Adaptability and Flexibility",
] as const;

const yesno = ["Yes","No"] as const;
const spec = ["Business Analytics","Web and Mobile Application Development","Service Management"] as const;
const gender = ["Male","Female"] as const;
const locationOpts = ["Inside of Bulacan","Outside of Bulacan"] as const;
const income = [
  "Poor (Less than 10,956)",
  "Low-Income (10,957 - 21,194)",
  "Lower-Middle Income (21,195 - 43,828)",
  "Middle Income (43,829 - 76,669)",
  "Upper-Middle Income (76,670 - 131,484)",
  "Upper-Income (131,485 - 219,140)",
  "Rich (219,141 and above)"
] as const;
const housingBasis = ["Own/Parents/Relative","Boarding/Dorm/Bedspace","Rented Apartment/Condo"] as const;
const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

/* ===== Grade dropdown values: 1.00–3.00 only (step .25) ===== */
const GRADE_VALUES: string[] = Array.from({ length: 9 }, (_, i) => (1 + i * 0.25).toFixed(2));

/** prettier, consistent select */
const NiceSelect = styled.select`
  width:100%; height:44px; padding:10px 12px; border:1px solid #d6dae1; border-radius:10px;
  background:#fff; font-size:14px; appearance:none;
  background-image: linear-gradient(45deg, transparent 50%, #6b7280 50%),
                    linear-gradient(135deg, #6b7280 50%, transparent 50%),
                    linear-gradient(to right, #fff, #fff);
  background-position: calc(100% - 18px) calc(1em + 2px), calc(100% - 13px) calc(1em + 2px), 100% 0;
  background-size: 5px 5px, 5px 5px, 2.5em 2.5em;
  background-repeat: no-repeat;
`;
type GradeSelectProps = { value: string; onChange: (v: string)=>void; label: string; };
function GradeSelect({ value, onChange, label }: GradeSelectProps) {
  return (
    <NiceSelect aria-label={label} value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select…</option>
      {GRADE_VALUES.map((g) => <option key={g} value={g}>{g}</option>)}
    </NiceSelect>
  );
}

/* Course descriptions */
const COURSE_DESC: Record<string,string> = {
  IT102: "Introduction to Computing",
  IT104: "Hardware System and Servicing",
  IT103: "Computer Programming 1",
  IT105: "Computer Programming 2",
  IT106: "Networking 1",
  IT210: "Networking 2",
  IT201: "Data Structures and Algorithms",
  IT202: "Information Management",
  IT203: "Object-Oriented Programming 1",
  IT207: "Object-Oriented Programming 2",
  IT204: "Integrative Programming and Technologies",
  IT206: "Advanced Database Systems",
  IT303: "System Analysis and Design",
  IT304: "Web Systems and Technologies 1",
  IT310: "Web Systems and Technologies 2",
  IT306: "Elective 1",
  IT307: "Elective 2",
  IT311: "Elective 3",
  IT312: "Elective 4",
};

const menuItems = [
  { label: "Dashboard", url: "/student-dashboard" },
  { label: "Predict", url: "/predict" },
  { label: "Manage Profile", url: "/student-manage-profile" },
  { label: "Log Out", url: "/logout" },
];

function avg(values: Array<string | number | undefined | null>) {
  const nums = values
    .map((v) => (typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN))
    .filter((v) => !isNaN(v));
  if (nums.length === 0) return "";
  const sum = nums.reduce((a, b) => a + b, 0);
  return (sum / nums.length).toFixed(2);
}
function softComposite(arr: string[]){
  const n=arr.length;
  if(n>=9) return {score:n,level:"Advanced" as const};
  if(n>=5) return {score:n,level:"Developing" as const};
  return {score:n,level:"Foundational" as const};
}
function extraCluster(arr: string[]){
  const a = arr.filter(x => x && x !== "None");
  const n = a.length;
  if(n<=0) return "No Participation";
  if(n===1) return "Single Extracurricular";
  return "Multiple Extracurricular";
}
function resolveHousing(basis: string){
  const s=(basis||"").toLowerCase();
  if(s.includes("boarding")||s.includes("dorm")||s.includes("bedspace")||s.includes("rented")||s.includes("apartment")||s.includes("condo")) return "Temporary Housing";
  return "Permanent Housing";
}
function splitCerts(text: string){
  return (text||"").split(",").map(x=>x.trim()).filter(Boolean);
}

/* Radar mapping */
function radarFromAssessment({ strengths=[], weaknesses=[] }:{ strengths?: string[]; weaknesses?: string[] }){
  const L = ["Programming","Networking","Database","Web & System Dev","Soft Skills","Extracurricular"];
  const has = (arr: string[], key: string) => arr.some(t => t.toLowerCase().includes(key));
  const strengthVals = [
    has(strengths, "programming") ? 5 : 2,
    has(strengths, "networking") ? 5 : 2,
    has(strengths, "database") ? 5 : 2,
    has(strengths, "web/system") || has(strengths,"web/system development") || has(strengths,"web/system dev") ? 5 : 2,
    has(strengths, "communication") || has(strengths, "interpersonal") || has(strengths,"teamwork") || has(strengths,"soft") ? 5 : 2,
    has(strengths, "extracurricular") ? 5 : 2,
  ];
  const weaknessVals = [
    has(weaknesses, "programming") ? 5 : 1,
    has(weaknesses, "networking") ? 5 : 1,
    has(weaknesses, "database") ? 5 : 1,
    has(weaknesses, "web/system") || has(weaknesses, "web/system development") || has(weaknesses,"web/system dev") ? 5 : 1,
    has(weaknesses, "communication") || has(weaknesses, "teamwork") || has(weaknesses,"soft") ? 5 : 1,
    has(weaknesses, "extracurricular") ? 5 : 1,
  ];
  return { labels: L, strengths: strengthVals, weaknesses: weaknessVals };
}

/* =================== Grade Section Layout =================== */
const GradeCard = styled.div`
  background:#fafafa; border-radius:12px; padding:16px; margin-top:12px;
`;
/** 4 equal columns; if there are 5 cells (4 courses + Avg), the Avg wraps neatly below */
const GradeGrid = styled.div`
  display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:16px;
  @media (max-width: 900px){ grid-template-columns: 1fr; }
`;

const CourseCellWrap = styled.div`display:flex; flex-direction:column; gap:8px;`;
const CourseLabel = styled.div`
  font-weight:600; color:#374151; line-height:1.3;
  min-height:36px; display:flex; align-items:flex-end;
  overflow:hidden;
`;

const AvgCellWrap = styled(CourseCellWrap)``;
const AvgInput = styled.input`
  width:100%; height:44px; padding:10px 12px;
  border:1px solid #d6dae1; border-radius:10px; background:#fff;
`;

type GradeItem = { code: keyof typeof COURSE_DESC; value: string; set: (v: string)=>void };
function CourseCell({ code, value, set }: GradeItem) {
  return (
    <CourseCellWrap>
      <CourseLabel>{code} — {COURSE_DESC[code]}</CourseLabel>
      <GradeSelect label={code} value={value} onChange={set} />
    </CourseCellWrap>
  );
}
type GradeSectionProps = { title: string; items: GradeItem[]; avgValue: string };
function GradeSection({ title, items, avgValue }: GradeSectionProps) {
  return (
    <>
      <SubH>{title}</SubH>
      <GradeGrid>
        {items.map((it) => <CourseCell key={it.code} {...it} />)}
        <AvgCellWrap>
          <CourseLabel>Avg</CourseLabel>
          <AvgInput readOnly value={avgValue}/>
        </AvgCellWrap>
      </GradeGrid>
    </>
  );
}

/* =================== Types =================== */
type YesNo = "Yes" | "No";
type StudentFormState = {
  student_no: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  age: string;
  gender: (typeof gender)[number] | "";
  location: (typeof locationOpts)[number] | "";
  living_basis: (typeof housingBasis)[number] | "";
  awards: YesNo;
  specialization_track: (typeof spec)[number] | "";
  latin_honors: YesNo;
  failed_grade: YesNo;
  dropped_subjects: YesNo;
  monthly_income_status: (typeof income)[number];
  certification_text: string;
  extracurricular: string[];
  soft_skills: string[];
  it105: string; it203: string; it207: string; it204: string;
  it106: string; it210: string;
  it202: string; it206: string;
  it303: string; it304: string; it310: string;
  it102: string; it104: string;
  it306: string; it307: string; it311: string; it312: string;
};
type SavedStudent = { id: number } & Partial<Record<string, any>>;
type Prediction = {
  prediction_index: number;
  prediction_label: string;
  proba_json: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  note?: string;
};

/* =================== Component =================== */
const StudentFormWithClustering: React.FC = () => {
  const [form, setForm] = useState<StudentFormState>({
    student_no:"", first_name:"", middle_name:"", last_name:"", age:"", gender:"",
    location:"", living_basis:"", awards:"No", specialization_track:"", latin_honors:"No",
    failed_grade:"No", dropped_subjects:"No",
    monthly_income_status: income[1],
    certification_text:"",
    extracurricular: [], soft_skills: [],
    it105:"", it203:"", it207:"", it204:"",
    it106:"", it210:"",
    it202:"", it206:"",
    it303:"", it304:"", it310:"",
    it102:"", it104:"",
    it306:"", it307:"", it311:"", it312:"",
  });

  const [saving, setSaving] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [savedStudent, setSavedStudent] = useState<SavedStudent | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [existingPrediction, setExistingPrediction] = useState<{ prediction_index: number } | null>(null);
  const [latinBlockMsg, setLatinBlockMsg] = useState("");

  const navigate = useNavigate();

  const studentIdRaw = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const studentId = studentIdRaw ? Number(studentIdRaw) : null;

  const saveDisabled = saving || !studentId || !!savedStudent;
  const predictDisabled = predicting || !savedStudent || !!existingPrediction;

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const stuRes = await fetch(`${API_BASE}/students/by_user/${studentId}`);
        const stuJson = await stuRes.json();
        if (stuJson?.student) {
          setSavedStudent(stuJson.student);
          const s = stuJson.student as SavedStudent;

          // Accept either array fields or JSON-string columns
          const toArr = (rawA: unknown, rawJson?: string) => {
            if (Array.isArray(rawA)) return rawA as string[];
            try { return JSON.parse(rawJson || "[]"); } catch { return []; }
          };

          setForm(prev => ({
            ...prev,
            student_no: s.student_no || "", first_name: s.first_name || "", middle_name: s.middle_name || "",
            last_name: s.last_name || "", age: s.age || "", gender: (s.gender as StudentFormState["gender"]) || "",
            location: (s.location as StudentFormState["location"]) || "", living_basis: (s.living_basis as StudentFormState["living_basis"]) || "",
            awards: (s.awards as YesNo) || "No",
            specialization_track: (s.specialization_track as StudentFormState["specialization_track"]) || "",
            latin_honors: (s.latin_honors as YesNo) || "No",
            failed_grade: (s.failed_grade as YesNo) || "No",
            monthly_income_status: (s.monthly_income_status as StudentFormState["monthly_income_status"]) || income[1],
            certification_text: s.certification_text || "",

            // Keep your arrays intact
            extracurricular: toArr((s as any).extracurricular, s.extracurricular_json as string),
            soft_skills: toArr((s as any).soft_skills, s.soft_skills_json as string),

            it105: s.it105 || "", it203: s.it203 || "", it207: s.it207 || "", it204: s.it204 || "",
            it106: s.it106 || "", it210: s.it210 || "",
            it202: s.it202 || "", it206: s.it206 || "",
            it303: s.it303 || "", it304: s.it304 || "", it310: s.it310 || "",
            it102: s.it102 || "", it104: s.it104 || "",
            it306: s.it306 || "", it307: s.it307 || "", it311: s.it311 || "", it312: s.it312 || "",
          }));

          const sid = s.id;
          if (sid) {
            const predRes = await fetch(`${API_BASE}/predictions/${sid}`);
            const predJson = await predRes.json();
            if (predJson?.prediction) {
              const p = predJson.prediction as any;
              // Robust fallback for different key names
              const prediction_index =
                p.prediction_index ?? p.index ?? p.predictionIndex ?? 0;
              const prediction_label =
                p.prediction_label ?? p.label ?? p.predictionLabel ?? "";

              setExistingPrediction({ prediction_index });
              setPrediction({
                prediction_index,
                prediction_label,
                proba_json: p.proba_json || p.probaJson || {},
                strengths: p.strengths || [],
                weaknesses: p.weaknesses || [],
                note: "existing_prediction",
              });
            }
          }
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [studentId]);

  const setF = <K extends keyof StudentFormState>(k: K, v: StudentFormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  // Interactive chip toggler (keeps arrays)
  const toggleInArray = (arrKey: "extracurricular" | "soft_skills", value: string) => {
    setForm((s) => {
      const set = new Set<string>(s[arrKey]);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...s, [arrKey]: Array.from(set) };
    });
  };

  /* ========= Derived Averages ========= */
  const programming_avg = useMemo(()=>avg([form.it105, form.it203, form.it207, form.it204]),[form]);
  const networking_avg  = useMemo(()=>avg([form.it106, form.it210]),[form]);
  const database_avg    = useMemo(()=>avg([form.it202, form.it206]),[form]);
  const wsd_avg         = useMemo(()=>avg([form.it303, form.it304, form.it310]),[form]);
  const hcf_avg         = useMemo(()=>avg([form.it102, form.it104]),[form]);
  const electives_avg   = useMemo(()=>avg([form.it306, form.it307, form.it311, form.it312]),[form]);

  const extra_cluster   = useMemo(()=>extraCluster(form.extracurricular),[form.extracurricular]);
  const living_resolved = useMemo(()=>resolveHousing(form.living_basis),[form.living_basis]);
  const soft_comp       = useMemo(()=>softComposite(form.soft_skills),[form.soft_skills]);

  /* ===== Latin honors validation: block "Yes" if any grade > 2.50 ===== */
  const anyGradeOver2_5 = useMemo(() => {
    const vals = [
      form.it105, form.it203, form.it207, form.it204,
      form.it106, form.it210,
      form.it202, form.it206,
      form.it303, form.it304, form.it310,
      form.it102, form.it104,
      form.it306, form.it307, form.it311, form.it312,
    ]
      .map((x) => parseFloat(String(x)))
      .filter((v) => !isNaN(v));
    return vals.some((v) => v > 2.5);
  }, [form]);

  useEffect(() => {
    if (anyGradeOver2_5 && form.latin_honors === "Yes") {
      setLatinBlockMsg("Cannot select 'Yes' on Latin Honors if any grade < 2.50.");
      setForm((s) => ({ ...s, latin_honors: "No" }));
    } else {
      setLatinBlockMsg("");
    }
  }, [anyGradeOver2_5, form.latin_honors, setForm]);

  const buildStudentPayload = () => {
    const graduate_on_time =
      form.failed_grade === "Yes" || form.dropped_subjects === "Yes" ? "No" : "Yes";

    return {
      user_id: studentId,
      student_no: form.student_no,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      age: form.age,
      gender: form.gender,
      location: form.location || "Inside of Bulacan",
      living_basis: form.living_basis,
      awards: form.awards,
      specialization_track: form.specialization_track,
      latin_honors: form.latin_honors,
      failed_grade: form.failed_grade,
      dropped_subjects: form.dropped_subjects,
      graduate_on_time,
      monthly_income_status: form.monthly_income_status,
      certification_text: form.certification_text,

      extracurricular: form.extracurricular,
      soft_skills: form.soft_skills,

      it105: form.it105, it203: form.it203, it207: form.it207, it204: form.it204,
      it106: form.it106, it210: form.it210,
      it202: form.it202, it206: form.it206,
      it303: form.it303, it304: form.it304, it310: form.it310,
      it102: form.it102, it104: form.it104,
      it306: form.it306, it307: form.it307, it311: form.it311, it312: form.it312,
    };
  };

  const save = async ()=>{
    if (!studentId) { setError("Missing student_id — please log in again."); return; }
    setError(""); setPrediction(null); setSaving(true);
    try{
      const payload = buildStudentPayload();
      const res = await fetch(`${API_BASE}/students`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.error || "Save failed");
      setSavedStudent(j.student);
    }catch(err: any){
      setError(err?.message || String(err));
    }
    finally{ setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const predictOnce = async () => {
    const sid = (savedStudent && savedStudent.id) || studentId;
    if (!sid) { setError("Missing student_id — save first or re-login."); return; }
    setError(""); setPredicting(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid }),
      });
      const j: any = await res.json();
      if (!res.ok) throw new Error(j.error || "Prediction failed");

      // Robust fallback for different key names
      const prediction_index =
        j.prediction_index ?? j.index ?? j.predictionIndex ?? 0;
      const prediction_label =
        j.prediction_label ?? j.label ?? j.predictionLabel ?? "";

      setPrediction({
        prediction_index,
        prediction_label,
        proba_json: j.proba_json || j.probaJson || {},
        strengths: j.strengths || [],
        weaknesses: j.weaknesses || [],
        note: j.note || "saved_prediction",
      });
      setExistingPrediction({ prediction_index });
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setPredicting(false);
    }
  };

  const radar = radarFromAssessment({
    strengths: prediction?.strengths || [],
    weaknesses: prediction?.weaknesses || [],
  });

  /* ====== RENDER ====== */

  const FormCardEl = (
    <Card>
      <H>Student Profile</H>
      <Grid>
        <Field $span={3}><span className="label">Student No.</span><InputCompact value={form.student_no} onChange={e=>setF('student_no',e.target.value)}/></Field>
        <Field $span={2}><span className="label">Age</span><InputTiny value={form.age} onChange={e=>setF('age',e.target.value)} /></Field>
        <Field $span={4}><span className="label">Gender</span>
          <NiceSelect value={form.gender} onChange={e=>setF('gender',e.target.value as StudentFormState["gender"])}>
            <option value="">Select...</option>{gender.map(g=><option key={g} value={g}>{g}</option>)}
          </NiceSelect>
        </Field>

        <Field $span={6}><span className="label">First Name</span><input value={form.first_name} onChange={e=>setF('first_name',e.target.value)}/></Field>
        <Field $span={3}><span className="label">Middle Name</span><InputCompact value={form.middle_name} onChange={e=>setF('middle_name',e.target.value)}/></Field>
        <Field $span={3}><span className="label">Last Name</span><input value={form.last_name} onChange={e=>setF('last_name',e.target.value)}/></Field>

        <Field $span={6}><span className="label">Location</span>
          <NiceSelect value={form.location} onChange={e=>setF('location',e.target.value as StudentFormState["location"])}>
            <option value="">Select...</option>{locationOpts.map(o=><option key={o} value={o}>{o}</option>)}
          </NiceSelect>
        </Field>

        <Field $span={6}><span className="label">Housing Basis</span>
          <NiceSelect value={form.living_basis} onChange={e=>setF('living_basis',e.target.value as StudentFormState["living_basis"])}>
            <option value="">Select...</option>{housingBasis.map(o=><option key={o} value={o}>{o}</option>)}
          </NiceSelect>
          <small>Derived Living Arrangement: <b>{living_resolved||'-'}</b></small>
        </Field>

        <Field $span={4}><span className="label">Awards</span>
          <NiceSelect value={form.awards} onChange={e=>setF('awards',e.target.value as YesNo)}>
            {yesno.map(x=><option key={x} value={x}>{x}</option>)}
          </NiceSelect>
        </Field>
        <Field $span={8}><span className="label">Specialization Track</span>
          <NiceSelect value={form.specialization_track} onChange={e=>setF('specialization_track',e.target.value as StudentFormState["specialization_track"])}>
            <option value="">Select...</option>{spec.map(x=><option key={x} value={x}>{x}</option>)}
          </NiceSelect>
        </Field>

        <Field $span={4}>
          <span className="label">Latin Honors</span>
          <NiceSelect
            value={form.latin_honors}
            onChange={(e)=>{
              const v = e.target.value as YesNo;
              if (anyGradeOver2_5 && v === "Yes") {
                setLatinBlockMsg("Cannot select 'Yes' on Latin Honors if any grade < 2.50.");
                setF("latin_honors","No");
              } else {
                setLatinBlockMsg("");
                setF("latin_honors", v);
              }
            }}
          >
            <option value="Yes" disabled={anyGradeOver2_5}>Yes</option>
            <option value="No">No</option>
          </NiceSelect>
          {latinBlockMsg && <Warn>⚠ {latinBlockMsg}</Warn>}
        </Field>

        <Field $span={4}><span className="label">Failed Grade</span>
          <NiceSelect value={form.failed_grade} onChange={e=>setF('failed_grade',e.target.value as YesNo)}>
            {yesno.map(x=><option key={x} value={x}>{x}</option>)}
          </NiceSelect>
        </Field>

        <Field $span={4}><span className="label">Dropped Subjects</span>
          <NiceSelect value={form.dropped_subjects} onChange={e=>setF('dropped_subjects',e.target.value as YesNo)}>
            {yesno.map(x=><option key={x} value={x}>{x}</option>)}
          </NiceSelect>
        </Field>

        <Field $span={12}><span className="label">Monthly Income Status</span>
          <NiceSelect value={form.monthly_income_status} onChange={e=>setF('monthly_income_status',e.target.value as StudentFormState["monthly_income_status"])}>
            {income.map(x=><option key={x} value={x}>{x}</option>)}
          </NiceSelect>
        </Field>

        {/* Certifications: text only (upload removed) */}
        <Field $span={12}>
          <span className="label">Certification(s)</span>
          <textarea
            value={form.certification_text}
            onChange={e=>setF('certification_text',e.target.value)}
            placeholder="Hal: AWS CCP, NCII CSS, etc. (comma-separated)"
          />
          <small>Derived: <b>{splitCerts(form.certification_text).length ? "Yes" : "No"}</b></small>
        </Field>

        {/* ===== EXTRACURRICULAR ===== */}
        <Field $span={12}>
          <span className="label">Extracurricular</span>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {EXTRACURR.map(opt => {
              const on = form.extracurricular.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={()=>toggleInArray("extracurricular", opt)}
                  style={{
                    padding:"8px 12px",
                    borderRadius:999,
                    border:on ? "1px solid #1f2a5a" : "1px solid #e5e7eb",
                    background:on ? "#eef2ff" : "#fff",
                    fontWeight:700,
                    cursor:"pointer"
                  }}
                  aria-pressed={on}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <small>Selected: <b>{form.extracurricular.length || 0}</b></small>
          <small style={{marginTop:6}}>Derived Cluster: <b>{extra_cluster}</b></small>
        </Field>

        {/* ===== SOFT SKILLS ===== */}
        <Field $span={12}>
          <span className="label">Soft Skills</span>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {SOFT_SKILLS.map(opt => {
              const on = form.soft_skills.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={()=>toggleInArray("soft_skills", opt)}
                  style={{
                    padding:"8px 12px",
                    borderRadius:999,
                    border:on ? "1px solid #065f46" : "1px solid #e5e7eb",
                    background:on ? "#d1fae5" : "#fff",
                    fontWeight:700,
                    cursor:"pointer"
                  }}
                  aria-pressed={on}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <small>Selected: <b>{form.soft_skills.length || 0}</b></small>
          <small style={{marginTop:6}}>Composite: <b>{soft_comp.level}</b> <span style={{color:"#6b7280"}}>(score {soft_comp.score})</span></small>
        </Field>

        {/* ===== CLUSTERED COURSE GRADES (aligned) ===== */}
        <GradeCard style={{gridColumn:'1 / -1'}}>
          <b>Course Grades (1.00–3.00)</b>

          <GradeSection
            title="Programming"
            items={[
              { code: "IT105", value: form.it105, set: (v)=>setF('it105',v) },
              { code: "IT203", value: form.it203, set: (v)=>setF('it203',v) },
              { code: "IT207", value: form.it207, set: (v)=>setF('it207',v) },
              { code: "IT204", value: form.it204, set: (v)=>setF('it204',v) },
            ]}
            avgValue={programming_avg}
          />

          <GradeSection
            title="Networking"
            items={[
              { code: "IT106", value: form.it106, set: (v)=>setF('it106',v) },
              { code: "IT210", value: form.it210, set: (v)=>setF('it210',v) },
            ]}
            avgValue={networking_avg}
          />

          <GradeSection
            title="Database"
            items={[
              { code: "IT202", value: form.it202, set: (v)=>setF('it202',v) },
              { code: "IT206", value: form.it206, set: (v)=>setF('it206',v) },
            ]}
            avgValue={database_avg}
          />

          <GradeSection
            title="Web and System Development"
            items={[
              { code: "IT303", value: form.it303, set: (v)=>setF('it303',v) },
              { code: "IT304", value: form.it304, set: (v)=>setF('it304',v) },
              { code: "IT310", value: form.it310, set: (v)=>setF('it310',v) },
            ]}
            avgValue={wsd_avg}
          />

          <GradeSection
            title="Hardware and Computing Fundamentals"
            items={[
              { code: "IT102", value: form.it102, set: (v)=>setF('it102',v) },
              { code: "IT104", value: form.it104, set: (v)=>setF('it104',v) },
            ]}
            avgValue={hcf_avg}
          />

          <GradeSection
            title="Electives"
            items={[
              { code: "IT306", value: form.it306, set: (v)=>setF('it306',v) },
              { code: "IT307", value: form.it307, set: (v)=>setF('it307',v) },
              { code: "IT311", value: form.it311, set: (v)=>setF('it311',v) },
              { code: "IT312", value: form.it312, set: (v)=>setF('it312',v) },
            ]}
            avgValue={electives_avg}
          />
        </GradeCard>
      </Grid>

      <Row>
        <Button onClick={save} disabled={saveDisabled}>
          {saving ? "Saving..." : savedStudent ? "Saved" : "Save"}
        </Button>
        <Button $ghost onClick={predictOnce} disabled={predictDisabled}>
          {predicting ? "Predicting..." : existingPrediction ? "Predicted" : "Predict (one-time)"}
        </Button>
        <Button $ghost as={Link} to="/student-dashboard">Go to Dashboard</Button>
      </Row>

      {!!savedStudent && !existingPrediction && (
        <div style={{marginTop:10, color:"#065f46"}}>
          ✓ Profile saved (ID #{savedStudent.id}). You can now run the one-time prediction.
        </div>
      )}
      {!!existingPrediction && (
        <div style={{marginTop:10, color:"#065f46"}}>
          ✓ Prediction already saved for this student.
        </div>
      )}

      {!!error && <div style={{marginTop:12, color:"#b91c1c", fontWeight:700}}>⚠ {error}</div>}
    </Card>
  );

  const ResultsCardEl = (
    <Card>
      <H>Results</H>
      {prediction ? (
        <>
          <ResultRow>
            {/* <span className="pill">Label: {prediction.prediction_label || "—"}</span>
            <span className="pill">Index: {typeof prediction.prediction_index === "number" ? prediction.prediction_index : "—"}</span>
            <Muted>
              {prediction.note === "existing_prediction"
                ? "This is the existing saved prediction for the student."
                : "One-time prediction saved for this student."}
            </Muted> */}
          </ResultRow>

          <SubH style={{marginTop:16}}>Percentages</SubH>
          <BarWrap>
            {Object.entries(prediction.proba_json || {}).map(([label, p])=>{
              const pct = Math.round(Number(p) * 10000) / 100;
              return (
                <Bar key={label}>
                  <div className="label">{label}</div>
                  <div className="track"><div className="fill" style={{width:`${isFinite(pct) ? pct : 0}%`}}/></div>
                  <div className="val">{isFinite(pct) ? pct.toFixed(2) : "0.00"}%</div>
                </Bar>
              );
            })}
          </BarWrap>

          <FlexSplit style={{marginTop:18}}>
            <RadarBox>
              <SubH style={{marginTop:0}}>Strengths vs Weaknesses (Radar)</SubH>
              <RadarChart
                size={340}
                labels={radar.labels}
                strengths={radar.strengths}
                weaknesses={radar.weaknesses}
              />
              <Muted>Green = strengths; Red = weaknesses.</Muted>
            </RadarBox>

            <div>
              <SubH>Strengths</SubH>
              {prediction.strengths?.length ? (
                <List>{prediction.strengths.map((s,i)=>(<li key={i}><Dot/> <span>{s}</span></li>))}</List>
              ) : <Muted>—</Muted>}

              <SubH style={{marginTop:14}}>Weaknesses</SubH>
              {prediction.weaknesses?.length ? (
                <List>{prediction.weaknesses.map((s,i)=>(<li key={i}><Dot bad/> <span>{s}</span></li>))}</List>
              ) : <Muted>—</Muted>}

              <div style={{marginTop:16}}>
                <Button $ghost as={Link} to="/student-dashboard">Open Student Dashboard</Button>
              </div>
            </div>
          </FlexSplit>
        </>
      ) : (
        <div className="muted">No prediction yet. Save or load the student, then click “Predict (one-time)”.</div>
      )}
    </Card>
  );

  const shouldHideForm = !!prediction || !!existingPrediction;

  return (
    <>
      <GlobalStyle/>
      <Shell>
        <StudentSidebar
          menuItems={menuItems}
          active="Predict"
          onSelect={() => {}}
          onLogout={handleLogout}
        />
        <Content>
          {!shouldHideForm && FormCardEl}
          {ResultsCardEl}
        </Content>
      </Shell>
    </>
  );
};

export default StudentFormWithClustering;
