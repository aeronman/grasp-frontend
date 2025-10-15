import { useEffect, useMemo, useState, type JSX } from "react";
import styled, { createGlobalStyle } from "styled-components";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import { FiBarChart2, FiUsers, FiTrendingUp, FiCheckCircle, FiFilter } from "react-icons/fi";

const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

/* ---------- Types ---------- */
type CountRow = { label: string; n: number };
type BarDatum = { name: string; value: number };


type KPIs = {
  total_predictions: number;
  time_period_label: string;
};

type Bars = {
  extracurricular: CountRow[];
  time_period: CountRow[];
  living: CountRow[];
};

type Pies = {
  latin_honors: CountRow[];
  awards: CountRow[];
  failed_grade: CountRow[];
};

type FiltersResponse = {
  years?: number[];
  specializations?: string[];
  locations?: string[];
};

type OverviewResponse = {
  kpis?: KPIs;
  bars?: Bars;
  pies?: Pies;
  error?: string;
};

type MenuItem = { label: string; url: string };

/* ---------- Global ---------- */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;font-family:'Poppins',sans-serif;background:#F5F8FF;color:#222}
`;

const AppWrap = styled.div`display:flex; min-height:100vh;`;
const Main = styled.main`flex:1; padding:24px;`;

/* ---------- Shell blocks to mimic layout ---------- */
const SlicerBar = styled.div`
  background:#fff; border-radius:14px; box-shadow:0 8px 30px rgba(15,27,40,0.05);
  padding:12px; margin-bottom:16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  .label{ font-weight:700; color:#374151; display:flex; align-items:center; gap:8px; }
  select{
    padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;
    background:#fff; font-family:inherit; font-size:14px;
  }
`;

const BigKPI = styled.div`
  background:#fff; border-radius:14px; box-shadow:0 8px 30px rgba(15,27,40,0.05);
  padding:18px 20px; margin-bottom:18px;
`;

const KPIGrid = styled.div`
  display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;
  @media(max-width:1100px){ grid-template-columns: repeat(2, 1fr); }
  @media(max-width:640px){ grid-template-columns: 1fr; }
`;

const KpiCard = styled.div`
  background:#fff; padding:18px 20px; border-radius:12px;
  box-shadow:0 8px 30px rgba(15,27,40,0.04);
  display:flex; align-items:center; gap:12px;
  .icon{ width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, rgba(213,91,0,0.12), rgba(213,91,0,0.06)); color:#d55b00; }
  .meta .title{ font-size:12px; color:#9aa0a6; }
  .meta .value{ font-weight:700; font-size:20px; }
`;

const ThreeCol = styled.div`
  display:grid; grid-template-columns: repeat(3, 1fr); gap:18px; margin-top:12px;
  @media(max-width:1280px){ grid-template-columns: repeat(2, 1fr); }
  @media(max-width:860px){ grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background:#fff; border-radius:14px; padding:22px; box-shadow:0 8px 30px rgba(15,27,40,0.05);
`;

const Title = styled.h3`margin:0 0 10px; font-weight:700;`;

const ChartWrap = styled.div` width:100%; height:320px; `;

/* ---------- Utils ---------- */
const donutColors = ["#ffa94d", "#ff6b6b", "#5f27cd", "#00b894", "#74c0fc", "#fcc419"];

const toBarData = (rows?: CountRow[]): BarDatum[] =>
  (rows ?? []).map((r) => ({ name: r?.label ?? "Unknown", value: Number(r?.n ?? 0) }));

const toPieData = (rows?: CountRow[]): BarDatum[] =>
  (rows ?? []).map((r) => ({ name: r?.label ?? "Unknown", value: Number(r?.n ?? 0) }));

/* ---------- Component ---------- */
export default function AdminDashboard(): JSX.Element {
  const [active, setActive] = useState<string>("Dashboard");
  const navigate = useNavigate();

  // slicers
  const [years, setYears] = useState<number[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [locs, setLocs] = useState<string[]>([]);
  const [year, setYear] = useState<string>("");
  const [spec, setSpec] = useState<string>("");
  const [loc, setLoc] = useState<string>("");

  // data
  const [loading, setLoading] = useState<boolean>(false);
  const [kpis, setKpis] = useState<KPIs>({ total_predictions: 0, time_period_label: "All time" });
  const [bars, setBars] = useState<Bars>({ extracurricular: [], time_period: [], living: [] });
  const [pies, setPies] = useState<Pies>({ latin_honors: [], awards: [], failed_grade: [] });

  // auth guard (admin page)
  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const role = localStorage.getItem("user_role");
    if (!uid || role !== "admin") navigate("/login", { replace: true });
  }, [navigate]);

  // load slicers once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/filters`);
        const j = (await res.json()) as FiltersResponse;
        if (res.ok) {
          setYears(j.years ?? []);
          setSpecs(j.specializations ?? []);
          setLocs(j.locations ?? []);
        }
      } catch {
        // noop
      }
    })();
  }, []);

  // load dashboard data when slicers change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (year) params.set("year", String(year));
        if (spec) params.set("specialization", spec);
        if (loc) params.set("location", loc);

        const res = await fetch(`${API_BASE}/admin/overview?${params.toString()}`);
        const j = (await res.json()) as OverviewResponse;
        if (!res.ok) throw new Error(j.error || "Failed to load overview");

        setKpis(j.kpis ?? { total_predictions: 0, time_period_label: "All time" });
        setBars(j.bars ?? { extracurricular: [], time_period: [], living: [] });
        setPies(j.pies ?? { latin_honors: [], awards: [], failed_grade: [] });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // eslint-disable-next-line no-console
        console.warn(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [year, spec, loc]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: "Dashboard", url: "/admindashboard" },
      { label: "Students", url: "/students" },
      { label: "Manage Profile", url: "/profile" },
      { label: "Predictions", url: "/predictionlist" },
      { label: "Log Out", url: "/logout" },
    ],
    []
  );

  // prepared series
  const dataExtracurricular = useMemo<BarDatum[]>(
    () => toBarData(bars.extracurricular),
    [bars]
  );
  const dataTimePeriod = useMemo<BarDatum[]>(
    () => toBarData(bars.time_period),
    [bars]
  );
  const dataLiving = useMemo<BarDatum[]>(
    () => toBarData(bars.living),
    [bars]
  );
  const pieLatin = useMemo<BarDatum[]>(
    () => toPieData(pies.latin_honors),
    [pies]
  );
  const pieAwards = useMemo<BarDatum[]>(
    () => toPieData(pies.awards),
    [pies]
  );
  const pieFailed = useMemo<BarDatum[]>(
    () => toPieData(pies.failed_grade),
    [pies]
  );

  const totalExtra = useMemo(
    () => dataExtracurricular.reduce<number>((a, b) => a + (b?.value ?? 0), 0),
    [dataExtracurricular]
  );

  return (
    <>
      <GlobalStyle />
      <AppWrap>
        <Sidebar
          menuItems={menuItems}
          active={active}
          onSelect={(lbl: string) => setActive(lbl)}
          onLogout={() => { localStorage.clear(); navigate("/login", { replace: true }); }}
        />

        <Main>
          {/* Slicers row */}
          <SlicerBar>
            <span className="label"><FiFilter /> Slicers</span>

            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Year (All)</option>
              {years.map((y) => <option key={String(y)} value={String(y)}>{y}</option>)}
            </select>

            <select value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="">Specialization (All)</option>
              {specs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="">Location (All)</option>
              {locs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </SlicerBar>

          {/* One big KPI block */}
          <BigKPI>
            <Title style={{textAlign:"center"}}>KPI</Title>
            <KPIGrid>
              <KpiCard>
                <div className="icon"><FiBarChart2 size={22} /></div>
                <div className="meta">
                  <div className="title">Total Student Predictions</div>
                  <div className="value">{kpis.total_predictions}</div>
                </div>
              </KpiCard>
              <KpiCard>
                <div className="icon"><FiTrendingUp size={22} /></div>
                <div className="meta">
                  <div className="title">Top Time Period</div>
                  <div className="value">{kpis.time_period_label}</div>
                </div>
              </KpiCard>
              <KpiCard>
                <div className="icon"><FiUsers size={22} /></div>
                <div className="meta">
                  <div className="title">Students Count (Extracurricular)</div>
                  <div className="value">{totalExtra}</div>
                </div>
              </KpiCard>
              <KpiCard>
                <div className="icon"><FiCheckCircle size={22} /></div>
                <div className="meta">
                  <div className="title">Charts Status</div>
                  <div className="value">{loading ? "Loading..." : "Updated"}</div>
                </div>
              </KpiCard>
            </KPIGrid>
          </BigKPI>

          {/* Three PIEs row */}
          <ThreeCol>
            <Card>
              <Title>Potential Latin Honor Recipients</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieLatin} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                      {pieLatin.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>

            <Card>
              <Title>Students with Academic Awards</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieAwards} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                      {pieAwards.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>

            <Card>
              <Title>Students with Failed Grades</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieFailed} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                      {pieFailed.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>
          </ThreeCol>

          {/* Three BARs row */}
          <ThreeCol>
            <Card>
              <Title>Student Extracurricular Participation</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataExtracurricular}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar name="Count" dataKey="value" fill="#d55b00" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>

            <Card>
              <Title>Most Predicted Employment Timeline</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataTimePeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar name="Count" dataKey="value" fill="#ff9a1a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>

            <Card>
              <Title>Student Living Arrangements</Title>
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataLiving}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar name="Count" dataKey="value" fill="#74c0fc" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            </Card>
          </ThreeCol>
        </Main>
      </AppWrap>
    </>
  );
}
