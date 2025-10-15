// AdminStudents.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "./Sidebar";

/* =================== Global / Layout (match student form) =================== */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;font-family:'Poppins',sans-serif;background:#F5F8FF;color:#222}
`;
const AppWrap = styled.div`display:flex; min-height:100vh;`;
const Main = styled.main`flex:1; padding:24px; max-width:1200px; margin:0 auto;`;
const Card = styled.div`background:#fff;border-radius:14px;padding:22px;box-shadow:0 8px 30px rgba(15,27,40,0.05);margin-bottom:16px;`;
const H = styled.h2`margin:0 0 8px;`;
const SubH = styled.h3`margin:10px 0 12px;font-size:16px;color:#1f2937;`;
const Grid = styled.div`
  display:grid;grid-template-columns:repeat(12,1fr);gap:12px;
  @media(max-width:1024px){grid-template-columns:1fr;}
`;
const Field = styled.label`
  grid-column: span ${p=>p.span||6};
  display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;
  .label{font-weight:600;}
  input,select,textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;}
  small{color:#6b7280}
`;
const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const Button = styled.button`
  border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;
  box-shadow:0 8px 30px rgba(15,27,40,0.05);
  background:${p=>p.ghost?'#fff':'#d55b00'};
  color:${p=>p.ghost?'#374151':'#fff'};
  border:${p=>p.ghost?'1px solid #e5e7eb':'0'};
  &:disabled{opacity:.6; cursor:not-allowed}
`;

const ControlsBar = styled.div`
  display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin:12px 0 16px;
  input,select{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px; background:#fff;}
  .grow{flex:1; min-width:240px;}
`;

const TableWrap = styled.div`
  background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 8px 30px rgba(15,27,40,0.05);
`;

const Table = styled.table`
  width:100%; border-collapse:collapse; font-size:14px; 
  th, td { border-bottom:1px solid #eee; padding:12px; text-align:left; }
  th { color:#6b7280; font-weight:600; background:#fafafa; user-select:none; cursor:pointer; }
  td .actions { display:flex; gap:8px; }
  .icon-btn { border:0; background:#fff; cursor:pointer; padding:8px 10px; border-radius:10px; box-shadow:0 4px 18px rgba(15,27,40,.05);}
  .danger { color:#b91c1c; }
`;

const Footer = styled.div`
  display:flex; align-items:center; justify-content:space-between; padding:12px;
  font-size:13px; color:#6b7280;
  select{padding:8px 10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff;}
`;

/* ======= Toast / Alert UI (simple, no libs) ======= */
const ToastWrap = styled.div`
  position: fixed; top: 20px; right: 20px; display: grid; gap: 10px; z-index: 9999;
`;
const Toast = styled.div`
  background: ${p => p.type === "error" ? "#fee2e2" : "#ecfdf5"};
  color: ${p => p.type === "error" ? "#991b1b" : "#065f46"};
  border: 1px solid ${p => p.type === "error" ? "#fecaca" : "#a7f3d0"};
  border-left: 6px solid ${p => p.type === "error" ? "#ef4444" : "#10b981"};
  padding: 12px 14px; border-radius: 12px; box-shadow:0 8px 30px rgba(15,27,40,.08);
  min-width: 260px; font-weight: 600;
`;

/* =================== Constants / Helpers (EXACT match to StudentForm) =================== */
const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

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
const genderOpts = ["Male","Female"];
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

/* Course keys */
const course = {
  prog: ["it105","it203","it207","it204"],
  net:  ["it106","it210"],
  db:   ["it202","it206"],
  wsd:  ["it303","it304","it310"],
  hcf:  ["it102","it104"],
  elec: ["it306","it307","it311","it312"],
};
const allCourseKeys = [...course.prog, ...course.net, ...course.db, ...course.wsd, ...course.hcf, ...course.elec];

/* ===== Corrected Grade dropdown values: 1.00–3.00 (step .25) then 5.00 ===== */
const GRADE_VALUES = [
  ...Array.from({ length: 9 }, (_, i) => (1 + i * 0.25).toFixed(2)), // 1.00–3.00
  "5.00",
];

function avg(grades) {
  const nums = grades.map(Number).filter(v => !isNaN(v));
  if (nums.length === 0) return "";
  const sum = nums.reduce((a, b) => a + b, 0);
  return (sum / nums.length).toFixed(2);
}
function softComposite(arr){
  const n=arr.length;
  if(n>=9) return {score:n,level:"Advanced"};
  if(n>=5) return {score:n,level:"Developing"};
  return {score:n,level:"Foundational"};
}
function extraCluster(arr){
  const a = (arr||[]).filter(x => x && x !== "None");
  const n=a.length;
  if(n<=0) return "No Participation";
  if(n===1) return "Single Extracurricular";
  return "Multiple Extracurricular";
}
function resolveHousing(basis){
  const s=(basis||"").toLowerCase();
  if(s.includes("boarding")||s.includes("dorm")||s.includes("bedspace")||s.includes("rented")||s.includes("apartment")||s.includes("condo")) return "Temporary Housing";
  return "Permanent Housing";
}
function splitCerts(text){
  return (text||"")
    .split(",")
    .map(x=>x.trim())
    .filter(Boolean);
}
function ageFromVal(v) {
  if (!v) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
}

/* =================== Profile Pane (View/Edit) =================== */
function AdminStudentProfile({ mode, value, onChange, onCancel, onSave, saving }) {
  const setF = (k,v)=> onChange({ ...value, [k]: v });
  const toggleInArray=(arrKey, val)=>{
    const cur = new Set(value[arrKey] || []);
    cur.has(val) ? cur.delete(val) : cur.add(val);
    onChange({ ...value, [arrKey]: Array.from(cur) });
  };

  const programming_avg = useMemo(()=>avg(course.prog.map(k=>value[k])),[value]);
  const networking_avg  = useMemo(()=>avg(course.net.map(k=>value[k])),[value]);
  const database_avg    = useMemo(()=>avg(course.db.map(k=>value[k])),[value]);
  const wsd_avg         = useMemo(()=>avg(course.wsd.map(k=>value[k])),[value]);
  const hcf_avg         = useMemo(()=>avg(course.hcf.map(k=>value[k])),[value]);
  const electives_avg   = useMemo(()=>avg(course.elec.map(k=>value[k])),[value]);

  const extra_cluster   = useMemo(()=>extraCluster(value.extracurricular||[]),[value.extracurricular]);
  const living_resolved = useMemo(()=>resolveHousing(value.living_basis),[value.living_basis]);
  const soft_comp       = useMemo(()=>softComposite(value.soft_skills||[]),[value.soft_skills]);
  const cert_yn         = splitCerts(value.certification_text).length ? "Yes" : "No";

  const readOnly = mode !== "edit";
  const Input = (p)=><input {...p} disabled={readOnly} />;
  const Select= ({options, val, onC})=>(
    <select value={val||""} onChange={e=>onC(e.target.value)} disabled={readOnly}>
      <option value="">Select...</option>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  );
  const GradeSelect = ({ val, onC }) => (
    <select value={val || ""} onChange={(e)=>onC(e.target.value)} disabled={readOnly}>
      <option value="">Select…</option>
      {GRADE_VALUES.map(g => <option key={g} value={g}>{g}</option>)}
    </select>
  );

  return (
    <Card>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <H>{mode==="edit" ? "Edit Student" : "Student Profile"} <span style={{color:"#6b7280", fontWeight:400}}>#{value.id}</span></H>
        {mode==="edit" && (
          <div style={{display:"flex", gap:8}}>
            <Button ghost onClick={onCancel}>Cancel</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>

      <Grid>
        <Field span={3}><span className="label">Student No.</span><Input value={value.student_no||""} onChange={e=>setF("student_no",e.target.value)} /></Field>
        <Field span={2}><span className="label">Age</span><Input value={value.age||""} onChange={e=>setF("age",e.target.value)} /></Field>
        <Field span={4}><span className="label">Gender</span>
          <Select options={genderOpts} val={value.gender} onC={v=>setF("gender",v)} />
        </Field>

        <Field span={6}><span className="label">First Name</span><Input value={value.first_name||""} onChange={e=>setF("first_name",e.target.value)} /></Field>
        <Field span={3}><span className="label">Middle Name</span><Input value={value.middle_name||""} onChange={e=>setF("middle_name",e.target.value)} /></Field>
        <Field span={3}><span className="label">Last Name</span><Input value={value.last_name||""} onChange={e=>setF("last_name",e.target.value)} /></Field>

        <Field span={6}><span className="label">Location</span>
          <Select options={locationOpts} val={value.location} onC={v=>setF("location",v)} />
        </Field>

        <Field span={6}><span className="label">Housing Basis</span>
          <Select options={housingBasis} val={value.living_basis} onC={v=>setF("living_basis",v)} />
          <small>Derived Living Arrangement: <b>{living_resolved||"-"}</b></small>
        </Field>

        <Field span={4}><span className="label">Awards</span>
          <Select options={yesno} val={value.awards} onC={v=>setF("awards",v)} />
        </Field>
        <Field span={8}><span className="label">Specialization Track</span>
          <Select options={spec} val={value.specialization_track} onC={v=>setF("specialization_track",v)} />
        </Field>

        <Field span={4}><span className="label">Latin Honors</span>
          <Select options={yesno} val={value.latin_honors} onC={v=>setF("latin_honors",v)} />
        </Field>

        <Field span={4}><span className="label">Failed Grade</span>
          <Select options={yesno} val={value.failed_grade} onC={v=>setF("failed_grade",v)} />
        </Field>

        <Field span={4}><span className="label">Dropped Subjects</span>
          <Select options={yesno} val={value.dropped_subjects} onC={v=>setF("dropped_subjects",v)} />
        </Field>

        <Field span={12}><span className="label">Monthly Income Status</span>
          <Select options={income} val={value.monthly_income_status} onC={v=>setF("monthly_income_status",v)} />
        </Field>

        <Field span={3}><span className="label">Certification(s)</span>
          <Input value={value.certification_text||""} onChange={e=>setF("certification_text",e.target.value)} placeholder="comma-separated; empty=No"/>
          <small>Derived: <b>{cert_yn}</b></small>
        </Field>

        <Field span={12}>
          <span className="label">Extracurricular (check all that apply)</span>
          <Row>
            {EXTRACURR.map(x=>(
              <label key={x} style={{display:'flex',alignItems:'center',gap:8, opacity: readOnly?0.7:1}}>
                <input type="checkbox" disabled={readOnly} checked={(value.extracurricular||[]).includes(x)} onChange={()=>toggleInArray("extracurricular",x)} />
                {x}
              </label>
            ))}
          </Row>
          <small>Cluster: <b>{extra_cluster}</b></small>
        </Field>

        <Field span={12}>
          <span className="label">Soft Skills (check all that apply)</span>
          <Row>
            {SOFT_SKILLS.map(x=>(
              <label key={x} style={{display:'flex',alignItems:'center',gap:8, opacity: readOnly?0.7:1}}>
                <input type="checkbox" disabled={readOnly} checked={(value.soft_skills||[]).includes(x)} onChange={()=>toggleInArray("soft_skills",x)} />
                {x}
              </label>
            ))}
          </Row>
          <small>Composite: <b>{soft_comp.score||0}</b> → Level: <b>{soft_comp.level}</b></small>
        </Field>

        <Card style={{gridColumn:'1 / -1', background:'#fafafa'}}>
          <b>Course Grades (1.00–5.00)</b>

          <SubH>Programming</SubH>
          <Grid>
            {course.prog.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={programming_avg} /></Field>
          </Grid>

          <SubH>Networking</SubH>
          <Grid>
            {course.net.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={networking_avg} /></Field>
          </Grid>

          <SubH>Database</SubH>
          <Grid>
            {course.db.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={database_avg} /></Field>
          </Grid>

          <SubH>Web and System Development</SubH>
          <Grid>
            {course.wsd.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={wsd_avg} /></Field>
          </Grid>

          <SubH>Hardware and Computing Fundamentals</SubH>
          <Grid>
            {course.hcf.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={hcf_avg} /></Field>
          </Grid>

          <SubH>Electives</SubH>
          <Grid>
            {course.elec.map(k=>(
              <Field key={k} span={2}><span className="label">{k.toUpperCase()}</span><GradeSelect val={value[k]||""} onC={(v)=>setF(k,v)} /></Field>
            ))}
            <Field span={2}><span className="label">Avg</span><input readOnly value={electives_avg} /></Field>
          </Grid>
        </Card>
      </Grid>
    </Card>
  );
}

/* =================== Page: list + filters/search/export =================== */
export default function AdminStudents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("list"); // list | view | edit
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [specF, setSpecF] = useState("");
  const [locationF, setLocationF] = useState("");

  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast state
  const [toasts, setToasts] = useState([]);
  const pushToast = (msg, type="success", ttl=3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
  };

  const menuItems = [
    { label: "Dashboard", url: "/admindashboard" },
    { label: "Students", url: "/students" },
    { label: "Manage Profile", url: "/profile" },
    { label: "Predictions", url: "/predictionlist" },
    { label: "Log Out", url: "/logout" },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API_BASE}/students`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to load students");
        setRows(j.students || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function openById(id, nextMode) {
    try {
      setError("");
      const r = await fetch(`${API_BASE}/students/${id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load student");
      const s = j.student || {};
      const normalized = {
        ...s,
        extracurricular: JSON.parse(s.extracurricular_json || "[]"),
        soft_skills: JSON.parse(s.soft_skills_json || "[]"),
      };
      setSelected(normalized);
      setMode(nextMode); // if "edit", the table will hide
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(String(e));
    }
  }

  async function saveSelected() {
    if (!selected?.id) return;
    try {
      setSaving(true);
      const graduate_on_time =
        (selected.failed_grade === "Yes" || selected.dropped_subjects === "Yes") ? "No" : "Yes";

      const payload = {
        ...selected,
        extracurricular: selected.extracurricular || [],
        soft_skills: selected.soft_skills || [],
        graduate_on_time,
      };

      // Save student
      const r = await fetch(`${API_BASE}/students/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Save failed");

      const updated = {
        ...j.student,
        extracurricular: JSON.parse(j.student.extracurricular_json || "[]"),
        soft_skills: JSON.parse(j.student.soft_skills_json || "[]"),
      };

      // Update list row meta
      setRows(rs => rs.map(x => x.id === updated.id ? {
        ...x,
        first_name: updated.first_name,
        last_name: updated.last_name,
        student_no: updated.student_no,
        gender: updated.gender,
        age: updated.age,
        specialization_track: updated.specialization_track,
        location: updated.location
      } : x));

      // Recalibrate prediction: delete existing then re-predict fresh
      try {
        await fetch(`${API_BASE}/predictions/${updated.id}`, { method: "DELETE" });
      } catch (_) {}
      try {
        await fetch(`${API_BASE}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: updated.id,
            DroppedSubjects: updated.dropped_subjects || payload.dropped_subjects || "No"
          })
        });
      } catch (_) {}

      // UI toasts & back to list
      pushToast("Student saved successfully.", "success");
      pushToast("Prediction recalibrated successfully.", "success");
      setSelected(null);
      setMode("list");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(String(e));
      pushToast(e.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this student? This also deletes any saved prediction.")) return;
    try {
      const r = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Delete failed");
      setRows(rs => rs.filter(x => x.id !== id));
      if (selected?.id === id) { setSelected(null); setMode("list"); }
      pushToast("Student deleted.", "success");
    } catch (e) {
      setError(String(e));
      pushToast(e.message || "Delete failed", "error");
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (gender && r.gender !== gender) return false;
      if (specF && r.specialization_track !== specF) return false;
      if (locationF && r.location !== locationF) return false;

      if (!needle) return true;
      const hay = [
        r.first_name, r.middle_name, r.last_name,
        r.student_no, r.gender, r.specialization_track,
        r.location, String(r.age ?? "")
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, gender, specF, locationF]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a,b) => {
      let av = a[sortKey]; let bv = b[sortKey];
      if (sortKey === "name") {
        av = `${a.first_name || ""} ${a.last_name || ""}`.trim();
        bv = `${b.first_name || ""} ${b.last_name || ""}`.trim();
      }
      const na = Number(av), nb = Number(bv);
      let cmp;
      if (!isNaN(na) && !isNaN(nb)) cmp = na - nb;
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, lastPage);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  function setSort(key) {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const exportColumns = ["id","first_name","middle_name","last_name","student_no","age","gender","specialization_track","location"];
  function toPlain(items) {
    return items.map(r => {
      const o = {};
      exportColumns.forEach(c => o[c] = r[c] ?? "");
      o.name = `${r.first_name || ""} ${r.last_name || ""}`.trim();
      return o;
    });
  }
  function download(filename, text, type="text/csv") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function exportCSV() {
    const data = toPlain(sorted);
    const cols = ["id","name","student_no","age","gender","specialization_track","location"];
    const head = cols.join(",");
    const lines = data.map(r =>
      cols.map(c => {
        const v = r[c] ?? "";
        const needsQuote = /[",\n]/.test(String(v));
        const esc = String(v).replace(/"/g,'""');
        return needsQuote ? `"${esc}"` : esc;
      }).join(",")
    );
    download(`students_${Date.now()}.csv`, [head, ...lines].join("\n"));
    pushToast("CSV exported.", "success");
  }
  function exportJSON() {
    const data = toPlain(sorted);
    download(`students_${Date.now()}.json`, JSON.stringify(data, null, 2), "application/json");
    pushToast("JSON exported.", "success");
  }
  async function copyToClipboard() {
    const data = toPlain(sorted);
    const cols = ["id","name","student_no","age","gender","specialization_track","location"];
    const lines = [cols.join("\t"), ...data.map(r => cols.map(c => r[c] ?? "").join("\t"))].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      pushToast("Copied filtered table to clipboard.", "success");
    } catch {
      pushToast("Copy failed.", "error");
    }
  }
  function printTable() {
    const data = toPlain(sorted);
    const cols = ["ID","Name","Student No.","Age","Gender","Specialization","Location"];
    const rowsHtml = data.map(r => `
      <tr>
        <td>${r.id}</td><td>${r.name}</td><td>${r.student_no}</td>
        <td>${r.age}</td><td>${r.gender}</td><td>${r.specialization_track}</td><td>${r.location}</td>
      </tr>`).join("");
    const html = `
      <html>
        <head>
          <title>Students</title>
          <style>
            body{font-family:Arial, sans-serif; padding:24px}
            table{width:100%; border-collapse:collapse}
            th,td{border:1px solid #ccc; padding:8px; text-align:left}
            th{background:#f3f4f6}
          </style>
        </head>
        <body>
          <h2>Students</h2>
          <p>Filtered total: ${data.length}</p>
          <table>
            <thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.onload=()=>window.print()</script>
        </body>
      </html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <>
      <GlobalStyle />
      <AppWrap>
        <Sidebar
          menuItems={menuItems}
          active={"Students"}
          onLogout={() => { localStorage.clear(); window.location.replace("/login"); }}
        />

        <Main>
          <Card>
            <H>Students</H>
            {error && <div style={{color:"#b91c1c", marginBottom:10}}>⚠ {error}</div>}

            {/* Controls stay visible; table hides only during edit */}
            <ControlsBar>
              <input
                className="grow"
                placeholder="Search name, student no., spec, location…"
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                disabled={mode==="edit"}
              />
              <select value={gender} onChange={e=>{ setGender(e.target.value); setPage(1); }} disabled={mode==="edit"}>
                <option value="">Gender (All)</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <select value={specF} onChange={e=>{ setSpecF(e.target.value); setPage(1); }} disabled={mode==="edit"}>
                <option value="">Specialization (All)</option>
                <option>Business Analytics</option>
                <option>Web and Mobile Application Development</option>
                <option>Service Management</option>
              </select>
              <select value={locationF} onChange={e=>{ setLocationF(e.target.value); setPage(1); }} disabled={mode==="edit"}>
                <option value="">Location (All)</option>
                <option>Inside of Bulacan</option>
                <option>Outside of Bulacan</option>
              </select>

              <Button ghost onClick={()=>{ setQ(""); setGender(""); setSpecF(""); setLocationF(""); setPage(1); }} disabled={mode==="edit"}>
                Clear
              </Button>

              <div style={{flex:1}} />

              <Button ghost onClick={copyToClipboard} disabled={mode==="edit"}>Copy</Button>
              <Button ghost onClick={exportJSON} disabled={mode==="edit"}>Export JSON</Button>
              <Button onClick={exportCSV} disabled={mode==="edit"}>Export CSV</Button>
              <Button ghost onClick={printTable} disabled={mode==="edit"}>Print</Button>
            </ControlsBar>

            {loading ? (
              <div>Loading…</div>
            ) : (
              mode !== "edit" && ( /* 🔒 hide table only while editing */
                <TableWrap>
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={()=>setSort("name")}>
                          Name {sortKey==="name" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th onClick={()=>setSort("student_no")}>
                          Student No. {sortKey==="student_no" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th onClick={()=>setSort("age")}>
                          Age {sortKey==="age" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th onClick={()=>setSort("gender")}>
                          Gender {sortKey==="gender" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th onClick={()=>setSort("specialization_track")}>
                          Specialization {sortKey==="specialization_track" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th onClick={()=>setSort("location")}>
                          Location {sortKey==="location" ? (sortDir==="asc"?"▲":"▼") : ""}
                        </th>
                        <th style={{width:180}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(r=>(
                        <tr key={r.id}>
                          <td>{[r.first_name, r.last_name].filter(Boolean).join(" ")}</td>
                          <td>{r.student_no || "—"}</td>
                          <td>{ageFromVal(r.age)}</td>
                          <td>{r.gender || "—"}</td>
                          <td>{r.specialization_track || "—"}</td>
                          <td>{r.location || "—"}</td>
                          <td>
                            <div className="actions">
                              <button className="icon-btn" title="View" onClick={()=>openById(r.id,"view")}>🔍</button>
                              <button className="icon-btn" title="Edit" onClick={()=>openById(r.id,"edit")}>✏️</button>
                              <button className="icon-btn danger" title="Delete" onClick={()=>remove(r.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paged.length===0 && (
                        <tr><td colSpan={7} style={{textAlign:"center", padding:"22px"}}>No matching students.</td></tr>
                      )}
                    </tbody>
                  </Table>

                  <Footer>
                    <div>
                      Showing {(currentPage-1)*pageSize + 1}–
                      {Math.min(currentPage*pageSize, total)} of {total}
                    </div>
                    <div style={{display:"flex", gap:8, alignItems:"center"}}>
                      <select value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                      <Button ghost onClick={()=>setPage(1)} disabled={currentPage===1}>« First</Button>
                      <Button ghost onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={currentPage===1}>‹ Prev</Button>
                      <div style={{minWidth:80, textAlign:"center"}}>Page {currentPage} / {lastPage}</div>
                      <Button ghost onClick={()=>setPage(p=>Math.min(lastPage, p+1))} disabled={currentPage===lastPage}>Next ›</Button>
                      <Button ghost onClick={()=>setPage(lastPage)} disabled={currentPage===lastPage}>Last »</Button>
                    </div>
                  </Footer>
                </TableWrap>
              )
            )}
          </Card>

          {selected && (
            <AdminStudentProfile
              mode={mode}
              value={selected}
              onChange={setSelected}
              onCancel={()=>{
                // Cancel: hide edit form and bring table back
                setSelected(null);
                setMode("list");
                window.scrollTo({ top: 0, behavior: "smooth" });
                pushToast("Edit canceled.", "success");
              }}
              onSave={saveSelected}
              saving={saving}
            />
          )}
        </Main>
      </AppWrap>

      {/* Toasts */}
      <ToastWrap>
        {toasts.map(t => (
          <Toast key={t.id} type={t.type}>{t.msg}</Toast>
        ))}
      </ToastWrap>
    </>
  );
}
