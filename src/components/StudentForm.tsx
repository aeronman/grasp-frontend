// StudentFormWithClustering.jsx
import { useEffect, useMemo, useState } from "react";
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
const Field = styled.label<{ span?: number }>`
  grid-column: span ${p=>p.span||6};
  display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;
  .label{font-weight:600;}
  input,select,textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;}
  small{color:#6b7280}
`;
const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const Button = styled.button<{ $ghost?: boolean }>`
  border:0;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer;
  box-shadow:0 8px 30px rgba(15,27,40,0.05);
  background:${p=>p.$ghost?'#fff':'#d55b00'};
  color:${p=>p.$ghost?'#374151':'#fff'};
  border:${p=>p.$ghost?'1px solid #e5e7eb':'0'};
  &:disabled{opacity:.6; cursor:not-allowed}
`;
const ResultRow = styled.div`
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  .pill{background:#eef2ff;color:#1f2a5a;border-radius:999px;padding:6px 10px;font-weight:700}
  .muted{color:#6b7280}
`;
const List = styled.ul`
  list-style:none; padding-left:0; margin:8px 0 0 0;
  li{display:flex; align-items:flex-start; gap:8px; margin:6px 0;}
`;
const Dot = styled.span<{ bad?: boolean }>`
  width:8px; height:8px; border-radius:999px; margin-top:6px;
  background:${p=>p.bad ? "#ef4444" : "#10b981"};
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

/* Simple web/radar chart (SVG, no deps) */
const RadarBox = styled.div`
  background:#fafafa; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px;
`;
function RadarChart({ size=300, labels=[], strengths=[], weaknesses=[] }) {
  const pad = 24;
  const r = (size - pad*2) / 2;
  const cx = size/2, cy = size/2;
  const N = labels.length || 1;

  const toPoint = (idx: number, val: number) => {
    const angle = (Math.PI * 2 * idx / N) - Math.PI/2;
    const rr = (val/5) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };

  const polygon = (vals: any[], stroke: string | undefined, fill: string | undefined) => {
    const pts = vals.map((v, i)=>toPoint(i, v)).map(([x,y])=>`${x},${y}`).join(" ");
    return (
      <g>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2" opacity="0.5"/>
        {vals.map((v,i)=>{
          const [x,y]=toPoint(i,v);
          return <circle key={i} cx={x} cy={y} r="3" fill={stroke} />;
        })}
      </g>
    );
  };

  const rings = [1,2,3,4,5].map(k=>(<circle key={k} cx={cx} cy={cy} r={(k/5)*r} fill="none" stroke="#e5e7eb"/>));

  const spokeEls = labels.map((lab,i)=>{
    const [x,y] = toPoint(i, 5.4);
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={toPoint(i,5)[0]} y2={toPoint(i,5)[1]} stroke="#e5e7eb"/>
        <text x={x} y={y} textAnchor="middle" fontSize="11" fill="#374151">{lab}</text>
      </g>
    );
  });

  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Strengths/weaknesses radar">
      <g>
        {rings}
        {spokeEls}
        {polygon(weaknesses, "#ef4444", "#fecaca")}
        {polygon(strengths, "#10b981", "#bbf7d0")}
        <circle cx={cx} cy={cy} r="2" fill="#6b7280" />
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
];

const SOFT_SKILLS = [
  "Verbal Communication","Written Communication","Critical Thinking","Leadership",
  "Time Management","Problem-Solving Skills","Networking","Collaboration",
  "Ethical Judgment","Stress Management","Socializing / Interpersonal Skills","Adaptability and Flexibility",
];

const yesno = ["Yes","No"];
const spec = ["Business Analytics","Web and Mobile Application Development","Service Management"];
const gender = ["Male","Female"];
const locationOpts = ["Inside of Bulacan","Outside of Bulacan"];
const income = [
  "Poor (Less than 10,956)",
  "Low-Income (10,957 - 21,194)",
  "Lower-Middle Income (21,195 - 43,828)",
  "Middle Income (43,829 - 76,669)",
  "Upper-Middle Income (76,670 - 131,484)",
  "Upper-Income (131,485 - 219,140)",
  "Rich (219,141 and above)"
];
const housingBasis = ["Own/Parents/Relative","Boarding/Dorm/Bedspace","Rented Apartment/Condo"];
const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

/* ===== Grade dropdown values: 1.00–3.00 (step .25) then 5.00 ===== */
const GRADE_VALUES = [
  ...Array.from({ length: 9 }, (_, i) => (1 + i * 0.25).toFixed(2)), // 1.00..3.00
  "5.00",
];

function GradeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select…</option>
      {GRADE_VALUES.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  );
}

const menuItems = [
  { label: "Dashboard", url: "/student-dashboard" },
  { label: "Predict", url: "/predict" },
  { label: "Manage Profile", url: "/student-manage-profile" },
  { label: "Log Out", url: "/logout" },
];

function avg(grades: any[]) {
  const nums = grades.map(Number).filter(v => !isNaN(v));
  if (nums.length === 0) return "";
  const sum = nums.reduce((a, b) => a + b, 0);
  return (sum / nums.length).toFixed(2);
}
function softComposite(arr: string | any[]){
  const n=arr.length;
  if(n>=9) return {score:n,level:"Advanced"};
  if(n>=5) return {score:n,level:"Developing"};
  return {score:n,level:"Foundational"};
}
function extraCluster(arr: any[]){
  const a = arr.filter(x => x && x !== "None");
  const n=a.length;
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
  return (text||"")
    .split(",")
    .map(x=>x.trim())
    .filter(Boolean);
}

/* Map strengths/weakness strings -> category scores for radar (0..5) */
function radarFromAssessment({ strengths=[], weaknesses=[] }){
  const L = ["Programming","Networking","Database","Web & System Dev","Soft Skills","Extracurricular"];
  const has = (arr: any[], key: string) => arr.some(t => t.toLowerCase().includes(key));

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

/* =================== Component =================== */
export default function StudentFormWithClustering(){
  type StudentFormState = {
    student_no: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    age: string;
    gender: string;
    location: string;
    living_basis: string;
    awards: string;
    specialization_track: string;
    latin_honors: string;
    failed_grade: string;
    dropped_subjects: string;
    monthly_income_status: string;
    certification_text: string;
    extracurricular: string[];
    soft_skills: string[];
    it105: string;
    it203: string;
    it207: string;
    it204: string;
    it106: string;
    it210: string;
    it202: string;
    it206: string;
    it303: string;
    it304: string;
    it310: string;
    it102: string;
    it104: string;
    it306: string;
    it307: string;
    it311: string;
    it312: string;
    [key: string]: any; // <-- Add index signature
  };

  const [form, setForm] = useState<StudentFormState>({
    student_no:"", first_name:"", middle_name:"", last_name:"", age:"", gender:"",
    location:"", living_basis:"", awards:"No", specialization_track:"", latin_honors:"No",
    failed_grade:"No",
    dropped_subjects:"No",
    monthly_income_status: income[1],
    certification_text:"",
    extracurricular: [], soft_skills: [],
    // Courses (now use dropdown values like "1.00", "1.25", ...)
    it105:"", it203:"", it207:"", it204:"",
    it106:"", it210:"",
    it202:"", it206:"",
    it303:"", it304:"", it310:"",
    it102:"", it104:"",
    it306:"", it307:"", it311:"", it312:"",
  });

  const [saving, setSaving] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [savedStudent, setSavedStudent] = useState(null);
  type Prediction = {
    prediction_index: number;
    prediction_label: string;
    proba_json: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    note?: string;
  };
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [existingPrediction, setExistingPrediction] = useState<{ prediction_index: number } | null>(null);

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
          const s = stuJson.student;
          setForm(prev => ({ ...prev,
            student_no: s.student_no || "", first_name: s.first_name || "", middle_name: s.middle_name || "",
            last_name: s.last_name || "", age: s.age || "", gender: s.gender || "",
            location: s.location || "", living_basis: s.living_basis || "", awards: s.awards || "No",
            specialization_track: s.specialization_track || "", latin_honors: s.latin_honors || "No",
            failed_grade: s.failed_grade || "No",
            monthly_income_status: s.monthly_income_status || income[1],
            certification_text: s.certification_text || "",
            extracurricular: JSON.parse(s.extracurricular_json || "[]"),
            soft_skills: JSON.parse(s.soft_skills_json || "[]"),
            // ensure loaded grades are strings that match dropdown options
            it105: s.it105 || "", it203: s.it203 || "", it207: s.it207 || "", it204: s.it204 || "",
            it106: s.it106 || "", it210: s.it210 || "",
            it202: s.it202 || "", it206: s.it206 || "",
            it303: s.it303 || "", it304: s.it304 || "", it310: s.it310 || "",
            it102: s.it102 || "", it104: s.it104 || "",
            it306: s.it306 || "", it307: s.it307 || "", it311: s.it311 || "", it312: s.it312 || "",
          }));

          const sid = s.id;
          const predRes = await fetch(`${API_BASE}/predictions/${sid}`);
          const predJson = await predRes.json();
          if (predJson?.prediction) {
            setExistingPrediction(predJson.prediction);
            setPrediction({
              prediction_index: predJson.prediction.prediction_index,
              prediction_label: predJson.prediction.prediction_label,
              proba_json: predJson.prediction.proba_json || {},
              strengths: predJson.prediction.strengths || [],
              weaknesses: predJson.prediction.weaknesses || [],
              note: "existing_prediction",
            });
          }
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [studentId]);

  const setF=(k: string,v: string)=>setForm(s=>({...s,[k]:v}));

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
  const cert_yn         = splitCerts(form.certification_text).length ? "Yes" : "No";

  const toggleInArray=(arrKey: string, value: unknown)=>{
    setForm(s=>{
      const arr = new Set(s[arrKey]);
      if(arr.has(value)) arr.delete(value); else arr.add(value);
      return {...s,[arrKey]: Array.from(arr)};
    });
  };

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
    }catch(err){
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(String((err as { message?: string }).message));
      } else {
        setError(String(err));
      }
    }
    finally{ setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const predictOnce = async () => {
    const sid = savedStudent?.id || studentId;
    if (!sid) { setError("Missing student_id — save first or re-login."); return; }
    setError(""); setPredicting(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Prediction failed");

      setPrediction({
        prediction_index: j.prediction_index,
        prediction_label: j.prediction_label,
        proba_json: j.proba_json || {},
        strengths: j.strengths || [],
        weaknesses: j.weaknesses || [],
        note: j.note || "saved_prediction",
      });
      setExistingPrediction({ prediction_index: j.prediction_index });
    } catch (err) {
      setError(typeof err === "object" && err !== null && "message" in err ? String((err as { message?: string }).message) : String(err));
    } finally {
      setPredicting(false);
    }
  };

  const radar = radarFromAssessment({
    strengths: prediction?.strengths || [],
    weaknesses: prediction?.weaknesses || [],
  });

  /* ====== RENDER ====== */

  const FormCard = (
    <Card>
      <H>Student Profile</H>
      <Grid>
        <Field span={3}><span className="label">Student No.</span><input value={form.student_no} onChange={e=>setF('student_no',e.target.value)}/></Field>
        <Field span={2}><span className="label">Age</span><input value={form.age} onChange={e=>setF('age',e.target.value)}/></Field>
        <Field span={4}><span className="label">Gender</span>
          <select value={form.gender} onChange={e=>setF('gender',e.target.value)}>
            <option value="">Select...</option>{gender.map(g=><option key={g}>{g}</option>)}
          </select>
        </Field>

        <Field span={6}><span className="label">First Name</span><input value={form.first_name} onChange={e=>setF('first_name',e.target.value)}/></Field>
        <Field span={3}><span className="label">Middle Name</span><input value={form.middle_name} onChange={e=>setF('middle_name',e.target.value)}/></Field>
        <Field span={3}><span className="label">Last Name</span><input value={form.last_name} onChange={e=>setF('last_name',e.target.value)}/></Field>

        <Field span={6}><span className="label">Location</span>
          <select value={form.location} onChange={e=>setF('location',e.target.value)}>
            <option value="">Select...</option>{locationOpts.map(o=><option key={o}>{o}</option>)}
          </select>
        </Field>

        <Field span={6}><span className="label">Housing Basis</span>
          <select value={form.living_basis} onChange={e=>setF('living_basis',e.target.value)}>
            <option value="">Select...</option>{housingBasis.map(o=><option key={o}>{o}</option>)}
          </select>
          <small>Derived Living Arrangement: <b>{living_resolved||'-'}</b></small>
        </Field>

        <Field span={4}><span className="label">Awards</span>
          <select value={form.awards} onChange={e=>setF('awards',e.target.value)}>{yesno.map(x=><option key={x}>{x}</option>)}</select>
        </Field>
        <Field span={8}><span className="label">Specialization Track</span>
          <select value={form.specialization_track} onChange={e=>setF('specialization_track',e.target.value)}>
            <option value="">Select...</option>{spec.map(x=><option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field span={4}><span className="label">Latin Honors</span>
          <select value={form.latin_honors} onChange={e=>setF('latin_honors',e.target.value)}>{yesno.map(x=><option key={x}>{x}</option>)}</select>
        </Field>

        <Field span={4}><span className="label">Failed Grade</span>
          <select value={form.failed_grade} onChange={e=>setF('failed_grade',e.target.value)}>{yesno.map(x=><option key={x}>{x}</option>)}</select>
        </Field>

        <Field span={4}><span className="label">Dropped Subjects</span>
          <select value={form.dropped_subjects} onChange={e=>setF('dropped_subjects',e.target.value)}>
            {yesno.map(x=><option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field span={12}><span className="label">Monthly Income Status</span>
          <select value={form.monthly_income_status} onChange={e=>setF('monthly_income_status',e.target.value)}>
            {income.map(x=><option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field span={3}><span className="label">Certification(s)</span>
          <input value={form.certification_text} onChange={e=>setF('certification_text',e.target.value)} placeholder="comma-separated; empty=No"/>
          <small>Derived: <b>{cert_yn}</b></small>
        </Field>

        {/* EXTRACURRICULAR */}
        <Field span={12}>
          <span className="label">Extracurricular (check all that apply)</span>
          <Row>
            {EXTRACURR.map(x=>(
              <label key={x} style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={form.extracurricular.includes(x)} onChange={()=>toggleInArray('extracurricular',x)} />
                {x}
              </label>
            ))}
          </Row>
          <small>Cluster: <b>{extra_cluster}</b></small>
        </Field>

        {/* SOFT SKILLS */}
        <Field span={12}>
          <span className="label">Soft Skills (check all that apply)</span>
          <Row>
            {SOFT_SKILLS.map(x=>(
              <label key={x} style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={form.soft_skills.includes(x)} onChange={()=>toggleInArray('soft_skills',x)} />
                {x}
              </label>
            ))}
          </Row>
          <small>Composite: <b>{soft_comp.score}</b> → Level: <b>{soft_comp.level}</b></small>
        </Field>

        {/* ===== CLUSTERED COURSE GRADES (now dropdowns) ===== */}
        <Card style={{gridColumn:'1 / -1', background:'#fafafa'}}>
          <b>Course Grades (1.00–5.00)</b>

          <SubH>Programming</SubH>
          <Grid>
            <Field span={2}><span className="label">IT105</span><GradeSelect value={form.it105} onChange={v=>setF('it105',v)} /></Field>
            <Field span={2}><span className="label">IT203</span><GradeSelect value={form.it203} onChange={v=>setF('it203',v)} /></Field>
            <Field span={2}><span className="label">IT207</span><GradeSelect value={form.it207} onChange={v=>setF('it207',v)} /></Field>
            <Field span={2}><span className="label">IT204</span><GradeSelect value={form.it204} onChange={v=>setF('it204',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={programming_avg} /></Field>
          </Grid>

          <SubH>Networking</SubH>
          <Grid>
            <Field span={2}><span className="label">IT106</span><GradeSelect value={form.it106} onChange={v=>setF('it106',v)} /></Field>
            <Field span={2}><span className="label">IT210</span><GradeSelect value={form.it210} onChange={v=>setF('it210',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={networking_avg} /></Field>
          </Grid>

          <SubH>Database</SubH>
          <Grid>
            <Field span={2}><span className="label">IT202</span><GradeSelect value={form.it202} onChange={v=>setF('it202',v)} /></Field>
            <Field span={2}><span className="label">IT206</span><GradeSelect value={form.it206} onChange={v=>setF('it206',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={database_avg} /></Field>
          </Grid>

          <SubH>Web and System Development</SubH>
          <Grid>
            <Field span={2}><span className="label">IT303</span><GradeSelect value={form.it303} onChange={v=>setF('it303',v)} /></Field>
            <Field span={2}><span className="label">IT304</span><GradeSelect value={form.it304} onChange={v=>setF('it304',v)} /></Field>
            <Field span={2}><span className="label">IT310</span><GradeSelect value={form.it310} onChange={v=>setF('it310',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={wsd_avg} /></Field>
          </Grid>

          <SubH>Hardware and Computing Fundamentals</SubH>
          <Grid>
            <Field span={2}><span className="label">IT102</span><GradeSelect value={form.it102} onChange={v=>setF('it102',v)} /></Field>
            <Field span={2}><span className="label">IT104</span><GradeSelect value={form.it104} onChange={v=>setF('it104',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={hcf_avg} /></Field>
          </Grid>

          <SubH>Electives</SubH>
          <Grid>
            <Field span={2}><span className="label">IT306</span><GradeSelect value={form.it306} onChange={v=>setF('it306',v)} /></Field>
            <Field span={2}><span className="label">IT307</span><GradeSelect value={form.it307} onChange={v=>setF('it307',v)} /></Field>
            <Field span={2}><span className="label">IT311</span><GradeSelect value={form.it311} onChange={v=>setF('it311',v)} /></Field>
            <Field span={2}><span className="label">IT312</span><GradeSelect value={form.it312} onChange={v=>setF('it312',v)} /></Field>
            <Field span={2}><span className="label">Avg</span><input readOnly value={electives_avg} /></Field>
          </Grid>
        </Card>
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

  const ResultsCard = (
    <Card>
      <H>Results</H>
      {prediction ? (
        <>
          <ResultRow>
            <span className="pill">Label: {prediction.prediction_label}</span>
            <span className="pill">Index: {prediction.prediction_index}</span>
            <Muted>
              {prediction.note === "existing_prediction"
                ? "This is the existing saved prediction for the student."
                : "One-time prediction saved for this student."}
            </Muted>
          </ResultRow>

          <SubH style={{marginTop:16}}>Percentages</SubH>
          <BarWrap>
            {Object.entries(prediction.proba_json || {}).map(([label, p])=>{
              const pct = Math.round(Number(p) * 10000) / 100;
              return (
                <Bar key={label}>
                  <div className="label">{label}</div>
                  <div className="track"><div className="fill" style={{width:`${pct}%`}}/></div>
                  <div className="val">{pct.toFixed(2)}%</div>
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
              <Muted>Green area = strengths; Red area = weaknesses (higher = more pronounced).</Muted>
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
        onSelect={() => {}}     // keep this to satisfy Sidebar’s required prop
        onLogout={handleLogout}
      />


        <Content>
          {!shouldHideForm && FormCard}
          {ResultsCard}
        </Content>
      </Shell>
    </>
  );
}
