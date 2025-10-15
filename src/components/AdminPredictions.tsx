// AdminPredictions.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "./SideBar";

const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

/* ================= UI shell (same look as AdminStudents) ================= */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;font-family:'Poppins',sans-serif;background:#F5F8FF;color:#222}
`;
const AppWrap = styled.div`display:flex; min-height:100vh;`;
const Main = styled.main`flex:1; padding:24px; max-width:1200px; margin:0 auto;`;
const Card = styled.div`background:#fff;border-radius:14px;padding:22px;box-shadow:0 8px 30px rgba(15,27,40,0.05);margin-bottom:16px;`;
const H = styled.h2`margin:0 0 8px;`;

const Controls = styled.div`
  display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end; margin-bottom:10px;
  label{display:flex; flex-direction:column; gap:6px; font-size:13px; color:#374151; min-width:220px;}
  input, select{padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; font-size:14px;}
`;
const Actions = styled.div`display:flex; gap:10px; align-items:flex-end;`;

const TableWrap = styled.div`overflow:auto;border-radius:14px;box-shadow:0 8px 30px rgba(15,27,40,0.05);`;
const Table = styled.table`
  width:100%; border-collapse:collapse; font-size:14px; background:#fff;
  th, td { border-bottom:1px solid #eee; padding:12px; text-align:left; white-space:nowrap; }
  th { color:#6b7280; font-weight:600; background:#fafafa; position:sticky; top:0; z-index:1; }
  .actions { display:flex; gap:8px; }
  .icon-btn { border:0; background:#fff; cursor:pointer; padding:8px 10px; border-radius:10px; box-shadow:0 4px 18px rgba(15,27,40,.05);}
  .danger { color:#b91c1c; }
`;
const Footer = styled.div`
  display:flex; align-items:center; justify-content:space-between; padding:12px;
  font-size:13px; color:#6b7280; background:#fff; border-radius:0 0 14px 14px;
  select{padding:8px 10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff;}
`;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  ghost?: boolean;
  className?: string;
};

function Button({children, ghost, className, ...rest}: ButtonProps) {
  return (
    <button
      {...rest}
      className={className}
      style={{
        borderRadius:10,padding:"12px 16px",fontWeight:700,cursor:"pointer",
        boxShadow:"0 8px 30px rgba(15,27,40,0.05)",
        background: ghost ? "#fff" : "#d55b00",
        color: ghost ? "#374151" : "#fff",
        border: ghost ? "1px solid #e5e7eb" : "0"
      }}
    >
      {children}
    </button>
  );
}

/* ================= Component ================= */
type PredictionRow = {
  student_id: string;
  student_no?: string;
  first_name?: string;
  last_name?: string;
  pred_label?: string;
  pred_index?: string | number;
  proba_json?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
};

export default function AdminPredictions() {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PredictionRow | null>(null);

  // table search/filters
  const [q, setQ] = useState("");
  const [labelFilter, setLabelFilter] = useState("All");
  const [minConf, setMinConf] = useState(""); // string input; parse to number when filtering

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const labels = useMemo(() => {
    const s = new Set(rows.map(r => r.pred_label).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [rows]);

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
        const r = await fetch(`${API_BASE}/predictions_admin`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to load predictions");
        setRows(j.items || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openView = async (studentId: string) => {
    try {
      setError("");
      const r = await fetch(`${API_BASE}/predictions/${studentId}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load prediction");
      const meta: PredictionRow = rows.find(x => x.student_id === studentId) || {} as PredictionRow;
      setSelected({
        ...j.prediction,
        student_id: studentId,
        student_no: meta.student_no,
        name: [meta.first_name, meta.last_name].filter(Boolean).join(" "),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(String(e));
    }
  };

  const remove = async (studentId: string | undefined) => {
    if (!window.confirm("Delete this prediction?")) return;
    try {
      const r = await fetch(`${API_BASE}/predictions/${studentId}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Delete failed");
      setRows(rs => rs.filter(x => x.student_id !== studentId));
      if (selected?.student_id === studentId) setSelected(null);
    } catch (e) {
      setError(String(e));
    }
  };

  const confidenceOf = (proba_json :any, label:any) => {
    if (!proba_json) return null;
    const v = proba_json[label];
    if (v == null) {
      const first = Object.values(proba_json)[0];
      return typeof first === "number" ? first : null;
    }
    return typeof v === "number" ? v : null;
  };

  // filtering + search
  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    const min = minConf === "" ? null : Number(minConf);

    return rows.filter(r => {
      if (labelFilter !== "All" && r.pred_label !== labelFilter) return false;
      if (min != null && !Number.isNaN(min)) {
        const c = confidenceOf(r.proba_json, r.pred_label);
        if (!(typeof c === "number" && c >= min)) return false;
      }
      if (!qlc) return true;

      const name = [r.first_name, r.last_name].filter(Boolean).join(" ").toLowerCase();
      const fields = [
        name,
        String(r.student_no || "").toLowerCase(),
        String(r.pred_label || "").toLowerCase(),
        String(r.pred_index ?? "").toLowerCase(),
      ];
      return fields.some(f => f.includes(qlc));
    });
  }, [rows, q, labelFilter, minConf]);

  // pagination derived values
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, lastPage);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // reset to page 1 when filters/search change
  useEffect(() => { setPage(1); }, [q, labelFilter, minConf]);

  // export
  function toCSV(items:any) {
    if (!items.length) return "";
    const cols = ["student_id","student_no","first_name","last_name","pred_label","pred_index","confidence"] as const;
    type ColKeys = typeof cols[number];
    const header = cols.join(",");
    const body = items.map((r: { proba_json: any; pred_label: any; student_id: any; student_no: any; first_name: any; last_name: any; pred_index: any; }) => {
      const conf = confidenceOf(r.proba_json, r.pred_label);
      const obj: Record<ColKeys, string> = {
        student_id: r.student_id ?? "",
        student_no: r.student_no ?? "",
        first_name: r.first_name ?? "",
        last_name: r.last_name ?? "",
        pred_label: r.pred_label ?? "",
        pred_index: r.pred_index ?? "",
        confidence: typeof conf === "number" ? conf.toFixed(6) : "",
      };
      return cols.map(k => `"${String(obj[k]).replace(/"/g,'""')}"`).join(",");
    }).join("\n");
    return header + "\n" + body;
  }
  function download(filename: string, content: BlobPart, type="text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function exportCSV() {
    const csv = toCSV(filtered);
    download("predictions.csv", csv, "text/csv");
  }
  function exportJSON() {
    download("predictions.json", JSON.stringify(filtered, null, 2), "application/json");
  }

  return (
    <>
      <GlobalStyle />
      <AppWrap>
        <Sidebar
          menuItems={menuItems}
          active={"Predictions"}
          onLogout={() => { localStorage.clear(); window.location.replace("/login"); }}
        />

        <Main>
          <Card>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
              <H>Predictions</H>
              <Actions>
                <Button ghost onClick={exportCSV}>Export CSV</Button>
                <Button ghost onClick={exportJSON}>Export JSON</Button>
              </Actions>
            </div>

            {error && <div style={{ color: "#b91c1c", marginBottom: 10 }}>⚠ {error}</div>}

            <Controls>
              <label>
                <span>Search</span>
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  placeholder="Search name, student no., label, index…"
                />
              </label>

              <label>
                <span>Label</span>
                <select value={labelFilter} onChange={e=>setLabelFilter(e.target.value)}>
                  {labels.map(l => <option key={l}>{l}</option>)}
                </select>
              </label>

              <label>
                <span>Min Confidence</span>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={minConf}
                  onChange={e=>setMinConf(e.target.value)}
                  placeholder="e.g. 0.65"
                />
              </label>
            </Controls>

            {loading ? (
              <div>Loading…</div>
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student No.</th>
                      <th>Label</th>
                      <th>Index</th>
                      <th>Confidence</th>
                      <th style={{ width: 160 }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paged.map((r) => {
                      const conf = confidenceOf(r.proba_json, r.pred_label);
                      return (
                        <tr key={r.student_id}>
                          <td>{[r.first_name, r.last_name].filter(Boolean).join(" ")}</td>
                          <td>{r.student_no || "—"}</td>
                          <td>{r.pred_label}</td>
                          <td>{r.pred_index}</td>
                          <td>{typeof conf === "number" ? conf.toFixed(4) : "—"}</td>
                          <td>
                            <div className="actions">
                              <button
                                className="icon-btn"
                                title="View"
                                onClick={() => openView(r.student_id)}
                              >
                                🔍
                              </button>
                              <button
                                className="icon-btn danger"
                                title="Delete"
                                onClick={() => remove(r.student_id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "22px" }}>
                          No matching predictions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <Footer>
                  <div>
                    {total === 0
                      ? "Showing 0 of 0"
                      : <>Showing {(currentPage-1)*pageSize + 1}–{Math.min(currentPage*pageSize, total)} of {total}</>}
                  </div>
                  <div style={{display:"flex", gap:8, alignItems:"center"}}>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    >
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
            )}
          </Card>

          {/* VIEW PANEL — keep or expand as needed */}
          {selected && (
            <Card>
              <H>Details</H>
              <div style={{marginBottom:10}}>
                <b>{selected.name || "—"}</b> &middot; Student No.: <b>{selected.student_no || "—"}</b>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10}}>
                <div><b>Label:</b> {selected.pred_label}</div>
                <div><b>Index:</b> {selected.pred_index}</div>
                <div><b>Confidence:</b> {
                  typeof selected.proba_json?.[selected.pred_label] === "number"
                    ? selected.proba_json[selected.pred_label].toFixed(4)
                    : "—"
                }</div>
              </div>

              <div style={{marginTop:14}}>
                <b>Percentages</b>
                <div style={{marginTop:8}}>
                  {selected.proba_json ? (
                    Object.entries(selected.proba_json).map(([k,v])=>(
                      <div key={k} style={{display:"grid", gridTemplateColumns:"180px 1fr 80px", gap:10, alignItems:"center", margin:"6px 0"}}>
                        <div>{k}</div>
                        <div style={{background:"#f3f4f6", borderRadius:10, overflow:"hidden", height:12}}>
                          <div style={{width:`${(Number(v)||0)*100}%`, height:"100%", background:"#1f2a5a"}}/>
                        </div>
                        <div style={{textAlign:"right", fontWeight:700}}>{((Number(v)||0)*100).toFixed(2)}%</div>
                      </div>
                    ))
                  ) : <div style={{color:"#6b7280"}}>—</div>}
                </div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16}}>
                <div>
                  <b>Strengths</b>
                  <ul style={{margin:"8px 0 0 16px"}}>
                    {(selected.strengths || []).map((s,i)=><li key={i}>{s}</li>)}
                    {(!selected.strengths || !selected.strengths.length) && <li style={{color:"#6b7280"}}>—</li>}
                  </ul>
                </div>
                <div>
                  <b>Weaknesses</b>
                  <ul style={{margin:"8px 0 0 16px"}}>
                    {(selected.weaknesses || []).map((s,i)=><li key={i}>{s}</li>)}
                    {(!selected.weaknesses || !selected.weaknesses.length) && <li style={{color:"#6b7280"}}>—</li>}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </Main>
      </AppWrap>
    </>
  );
}
