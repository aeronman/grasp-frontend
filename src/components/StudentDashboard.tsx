// StudentDashboard.jsx
import { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import StudentSidebar from "./StudentSideBar";

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
const Row = styled.div`display:flex; gap:10px; flex-wrap:wrap;`;
interface ButtonProps {
  ghost?: boolean;
}

const Button = styled.button<ButtonProps>`
  border:0;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer;
  box-shadow:0 8px 30px rgba(15,27,40,0.05);
  background:${p=>p.ghost?'#fff':'#d55b00'};
  color:${p=>p.ghost?'#374151':'#fff'};
  border:${p=>p.ghost?'1px solid #e5e7eb':'0'};
`;
const BarWrap = styled.div`display:grid; gap:8px; margin-top:8px;`;
const Bar = styled.div`
  display:flex; align-items:center; gap:10px;
  .label{width:280px; min-width:220px; font-size:14px;}
  .track{flex:1; background:#f3f4f6; border-radius:10px; height:12px; overflow:hidden;}
  .fill{height:100%; background:#1f2a5a;}
  .val{width:68px; text-align:right; font-weight:700;}
`;
const List = styled.ul`list-style:none; padding-left:0; margin:8px 0 0 0; li{display:flex; gap:8px; margin:6px 0;}`;
interface DotProps {
  bad?: boolean;
}
const Dot = styled.span<DotProps>`
  width:8px; height:8px; border-radius:999px; margin-top:6px;
  background:${p => p.bad ? "#ef4444" : "#10b981"};
`;
const FlexSplit = styled.div`
  display:grid; grid-template-columns: 1.2fr .8fr; gap:16px;
  @media(max-width:1024px){ grid-template-columns:1fr; }
`;
const Muted = styled.div`color:#6b7280;`;
const Pill = styled.span`background:#eef2ff;color:#1f2a5a;border-radius:999px;padding:6px 10px;font-weight:700;`;

const RadarBox = styled.div`background:#fafafa; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px;`;

/* Simple radar again (no deps) */
interface RadarChartProps {
  size?: number;
  labels: string[];
  strengths: number[];
  weaknesses: number[];
}

function RadarChart({ size=340, labels=[], strengths=[], weaknesses=[] }: RadarChartProps) {
  const pad = 24; const r = (size - pad*2)/2; const cx=size/2, cy=size/2; const N = labels.length||1;
  const toPoint=(i: number,val: number)=>{ const a=(Math.PI*2*i/N)-Math.PI/2; const rr=(val/5)*r; return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)]; };
  const poly=(vals: number[], stroke: string | undefined, fill: string | undefined)=> {
    const pts = vals.map((v,i)=>toPoint(i,v)).map(([x,y])=>`${x},${y}`).join(" ");
    return (<g><polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2" opacity="0.5"/>{vals.map((v,i)=>{const [x,y]=toPoint(i,v);return <circle key={i} cx={x} cy={y} r="3" fill={stroke}/>;})}</g>);
  };
  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1,2,3,4,5].map(k=><circle key={k} cx={cx} cy={cy} r={(k/5)*r} fill="none" stroke="#e5e7eb"/>)}
      {labels.map((lab,i)=>{const [x,y]=toPoint(i,5.4); return (<g key={i}><line x1={cx} y1={cy} x2={toPoint(i,5)[0]} y2={toPoint(i,5)[1]} stroke="#e5e7eb"/><text x={x} y={y} textAnchor="middle" fontSize="11" fill="#374151">{lab}</text></g>);})}
      {poly(weaknesses, "#ef4444", "#fecaca")}
      {poly(strengths, "#10b981", "#bbf7d0")}
      <circle cx={cx} cy={cy} r="2" fill="#6b7280" />
    </svg>
  );
}

const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";
const menuItems = [
  { label: "Dashboard", url: "/student-dashboard" },
  { label: "Predict", url: "/predict" },
  { label: "Manage Profile", url: "/student-manage-profile" },
  { label: "Log Out", url: "/logout" },
];

function radarFromAssessment({ strengths = [], weaknesses = [] }: { strengths: string[]; weaknesses: string[] }) {
  const L = ["Programming", "Networking", "Database", "Web & System Dev", "Soft Skills", "Extracurricular"];
  const has = (arr: string[], key: string) => arr.some(t => t.toLowerCase().includes(key));
  const s: number[] = [
    has(strengths, "programming") ? 5 : 2,
    has(strengths, "networking") ? 5 : 2,
    has(strengths, "database") ? 5 : 2,
    has(strengths, "web/system") || has(strengths, "web/system development") ? 5 : 2,
    has(strengths, "communication") || has(strengths, "teamwork") || has(strengths, "soft") ? 5 : 2,
    has(strengths, "extracurricular") ? 5 : 2,
  ];
  const w: number[] = [
    has(weaknesses, "programming") ? 5 : 1,
    has(weaknesses, "networking") ? 5 : 1,
    has(weaknesses, "database") ? 5 : 1,
    has(weaknesses, "web/system") || has(weaknesses, "web/system development") ? 5 : 1,
    has(weaknesses, "communication") || has(weaknesses, "teamwork") || has(weaknesses, "soft") ? 5 : 1,
    has(weaknesses, "extracurricular") ? 5 : 1,
  ];
  return { labels: L, strengths: s, weaknesses: w };
}

interface Prediction {
  label: string;
  index: number;
  proba: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
}

interface Student {
  id: number;
  first_name?: string;
  // add other properties as needed
}

export default function StudentDashboard(){
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  const studentIdRaw = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const userId = studentIdRaw ? Number(studentIdRaw) : null;

  useEffect(()=>{
    if(!userId) return;
    (async ()=>{
      try{
        const stuRes = await fetch(`${API_BASE}/students/by_user/${userId}`);
        const stuJson = await stuRes.json();
        if(stuJson?.student){
          setStudent(stuJson.student);
          const sid = stuJson.student.id;
          const predRes = await fetch(`${API_BASE}/predictions/${sid}`);
          const predJson = await predRes.json();
          if(predJson?.prediction){
            setPrediction({
              label: predJson.prediction.pred_label,
              index: predJson.prediction.pred_index,
              proba: predJson.prediction.proba_json || {},
              strengths: predJson.prediction.strengths || [],
              weaknesses: predJson.prediction.weaknesses || [],
            });
          }
        }
      }catch(e){ /* noop */ }
    })();
  },[userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const radar = radarFromAssessment({
    strengths: prediction?.strengths || [],
    weaknesses: prediction?.weaknesses || [],
  });

  return (
    <>
      <GlobalStyle/>
      <Shell>
        <StudentSidebar
          menuItems={menuItems}
          active={"Dashboard"}
          onSelect={(item: string) => {
            if(item==="Predict") navigate("/predict");
          }}
          onLogout={handleLogout}
        />
        <Content>
          <Card>
            <H>Student Dashboard</H>
            <Muted>Welcome{student ? `, ${student.first_name || ""}` : ""}.</Muted>
          </Card>

          <Card>
            <H>Prediction Summary</H>
            {prediction ? (
              <>
                <Row style={{alignItems:"center", gap:12, margin:"6px 0 8px"}}>
                  <Pill>Label: {prediction.label}</Pill>
                  <Pill>Index: {prediction.index}</Pill>
                </Row>

                <SubH>Pseudo Percentages</SubH>
                <BarWrap>
                  {Object.entries(prediction.proba).map(([label, p])=>{
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
                    <SubH style={{marginTop:0}}>Strengths vs Weaknesses</SubH>
                    <RadarChart
                      size={360}
                      labels={radar.labels}
                      strengths={radar.strengths}
                      weaknesses={radar.weaknesses}
                    />
                    <Muted>Green = strengths, Red = weaknesses.</Muted>
                  </RadarBox>

                  <div>
                    <SubH>Strengths</SubH>
                    {prediction.strengths.length ? (
                      <List>{prediction.strengths.map((s,i)=>(<li key={i}><Dot/> {s}</li>))}</List>
                    ) : <Muted>—</Muted>}

                    <SubH style={{marginTop:14}}>Weaknesses</SubH>
                    {prediction.weaknesses.length ? (
                      <List>{prediction.weaknesses.map((s,i)=>(<li key={i}><Dot bad/> {s}</li>))}</List>
                    ) : <Muted>—</Muted>}

                    <Row style={{marginTop:16}}>
                      <Button ghost as={Link} to="/predict">Back to Predict</Button>
                    </Row>
                  </div>
                </FlexSplit>
              </>
            ) : (
              <Muted>There’s no prediction yet. Go to <Link to="/predict">Predict</Link> to generate one.</Muted>
            )}
          </Card>
        </Content>
      </Shell>
    </>
  );
}
