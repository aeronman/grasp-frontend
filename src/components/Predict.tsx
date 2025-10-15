// StudentEmployabilityForm.jsx
import React, { useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "./Sidebar";

/* --------------------------
   Global / Layout
   -------------------------- */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Poppins', sans-serif; background: #F5F8FF; color: #222; }
`;

const AppWrap = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  padding: 28px;
  margin-right: 24px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 8px 30px rgba(15,27,40,0.05);
`;

const Title = styled.h2`
  margin: 0 0 6px;
  font-weight: 800;
  letter-spacing: 0.2px;
`;

const Sub = styled.p`
  margin: 0 0 18px;
  color: #6b7280;
`;

/* --------------------------
   Form styling
   -------------------------- */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  grid-column: span ${(p) => p.span || 6};
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #374151;

  .label { font-weight: 600; }

  select, input {
    padding: 12px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    outline: none;
    background: #fff;
    font-size: 14px;
  }

  input[type="number"] { -moz-appearance: textfield; }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0;
  }

  small { color: #9aa0a6; font-size: 11px; }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 18px;
`;

const Button = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(15,27,40,0.05);
  transition: transform 0.05s ease;

  &:active { transform: translateY(1px); }

  &.primary { background: #d55b00; color: #fff; }
  &.ghost { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 18px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Preview = styled.pre`
  margin: 0;
  background: #0b1020;
  color: #e5edff;
  border-radius: 12px;
  padding: 16px;
  font-size: 12px;
  overflow: auto;
  max-height: 520px;
`;

const ResultCard = styled(Card)`
  border-left: 5px solid #d55b00;
`;

const ProbTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 8px;

  th, td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid #f0f2f5;
  }
  th { color: #6b7280; font-weight: 600; }
  td { color: #374151; }
`;

/* --------------------------
   Options (from dataset)
   -------------------------- */
const OPTIONS = {
  gender: ["Male", "Female"],
  location: ["Inside of Bulacan", "Outside of Bulacan"],
  livingArrangement: ["Permanent Housing", "Temporary Housing"],
  extracurricular: ["No Participation", "Single Extracurricular", "Multiple Extracurricular"],
  yesNo: ["Yes", "No"],
  specialization: ["Business Analytics","Web and Mobile Application Development","Service Management"],
  softSkill: ["Foundational", "Developing", "Advanced"],
  monthlyIncome: [
    "Poor (Less than 10,956)",
    "Low-Income (10,957 - 21,194)",
    "Lower-Middle Income (21,195 - 43,828)",
    "Middle Income (43,829 - 76,669)",
    "Upper-Middle Income (76,670+)"
  ],
  currentJob: [
    "Unemployed",
    "Employed in an IT-related Job",
    "Employed in Non-IT-related Job",
    "Self-Employed in an IT-related Job"
  ],
 
};

/* --------------------------
   Helpers
   -------------------------- */
const NumberField = ({ label, value, onChange, min=1.0, max=5.0, step=0.25, span=4, hint }) => (
  <Field span={span}>
    <span className="label">{label}</span>
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      placeholder={`${min} - ${max}`}
    />
    {hint && <small>{hint}</small>}
  </Field>
);

const SelectField = ({ label, value, onChange, options, span=6, placeholder="Select..." }) => (
  <Field span={span}>
    <span className="label">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </Field>
);

const TextField = ({ label, value, onChange, span=6, placeholder }) => (
  <Field span={span}>
    <span className="label">{label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </Field>
);

/* --------------------------
   Component
   -------------------------- */
export default function StudentEmployabilityForm() {
  const [active, setActive] = useState("Predict");
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  

  // Raw-data style fields (you can store them; only FINAL_FEATURES are sent to API)
  const [form, setForm] = useState({
    StudentNo: "", GradYear: "", FirstName: "", MiddleName: "", LastName: "",
    Age: "", Gender: "",
    Location: "", LivingArrangement: "", Extracurricular: "", Awards: "",
    SpecializationTrack: "", LatinHonors: "", GraduateOnTime: "", FailedGrade: "",
    DroppedSubjects: "", SoftSkillLevel: "", MonthlyIncomeStatus: "",
    CurrentJob: "", FurtherStudies: "", Cerification: "",
    Programming: "", Networking: "", Database: "", WebandSystemDevelopment: "",
    HardwareandComputingFundamentals: "", Electives: ""
  });

  const setF = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Build EXACT payload required by model (FINAL FEATURES)
  const modelPayload = useMemo(() => ({
    Location: form.Location || "Inside of Bulacan",
    LivingArrangement: form.LivingArrangement || "Permanent Housing",
    Extracurricular: form.Extracurricular || "Single Extracurricular",
    Awards: form.Awards || "No",
    SpecializationTrack: form.SpecializationTrack || "Web and Mobile Application Development",
    LatinHonors: form.LatinHonors || "No",
    GraduateOnTime: form.GraduateOnTime || "Yes",
    FailedGrade: form.FailedGrade || "No",
    SoftSkillLevel: form.SoftSkillLevel || "Developing",
    MonthlyIncomeStatus: form.MonthlyIncomeStatus || "Low-Income (10,957 - 21,194)",
    CurrentJob: form.CurrentJob || "Unemployed",
    FurtherStudies: form.FurtherStudies || "No",
    Cerification: form.Cerification || "No",
    Programming: form.Programming === "" ? 1.75 : Number(form.Programming),
    Networking: form.Networking === "" ? 1.50 : Number(form.Networking),
    Database: form.Database === "" ? 2.00 : Number(form.Database),
    WebandSystemDevelopment: form.WebandSystemDevelopment === "" ? 1.75 : Number(form.WebandSystemDevelopment),
    HardwareandComputingFundamentals: form.HardwareandComputingFundamentals === "" ? 2.00 : Number(form.HardwareandComputingFundamentals),
    Electives: form.Electives === "" ? 1.75 : Number(form.Electives),
  }), [form]);


  const API_BASE = "https://7081632a-ae22-4129-a4ef-6278bbe2e1dd-00-1z76er70sktr4.pike.replit.dev";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setApiResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `API error ${res.status}`);
      }
      setApiResult(data);
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to predict.");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { label: "Dashboard", url: "/admindashboard" },
    { label: "Predict", url: "/predict" },
    { label: "Students", url: "/students" },
    { label: "Manage Profile", url: "/profile" },
    { label: "All reports", url: "/reports" },
    { label: "System Logs", url: "/logs" },
    { label: "Export", url: "/export" },
    { label: "Log Out", url: "/logout" },
  ];

  const resetForm = () =>
    setForm({
      StudentNo: "", GradYear: "", FirstName: "", MiddleName: "", LastName: "",
      Age: "", Gender: "",
      Location: "", LivingArrangement: "", Extracurricular: "", Awards: "",
      SpecializationTrack: "", LatinHonors: "", GraduateOnTime: "", FailedGrade: "",
      DroppedSubjects: "", SoftSkillLevel: "", MonthlyIncomeStatus: "",
      CurrentJob: "", FurtherStudies: "", Cerification: "",
      Programming: "", Networking: "", Database: "", WebandSystemDevelopment: "",
      HardwareandComputingFundamentals: "", Electives: ""
    });

  return (
    <>
      <GlobalStyle />
      <AppWrap>
        <Sidebar
          menuItems={menuItems}
          active={active}
          onSelect={(item) => setActive(item)}
        />

        <Main>
          <Title>Student Employability Prediction</Title>
          <Sub>Fill in the fields based on the raw dataset. Numbers use the grade scale (e.g., 1.00–5.00).</Sub>

          <TwoCol>
            {/* Left: Form */}
            <Card>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  {/* Identity / demographic */}
                  <TextField span={4} label="Student No." value={form.StudentNo} onChange={(v) => setF("StudentNo", v)} />
                  <TextField span={4} label="Graduation Year" value={form.GradYear} onChange={(v) => setF("GradYear", v)} />
                  <TextField span={4} label="Age" value={form.Age} onChange={(v) => setF("Age", v)} />
                  <TextField span={4} label="First Name" value={form.FirstName} onChange={(v) => setF("FirstName", v)} />
                  <TextField span={4} label="Middle Name" value={form.MiddleName} onChange={(v) => setF("MiddleName", v)} />
                  <TextField span={4} label="Last Name" value={form.LastName} onChange={(v) => setF("LastName", v)} />
                  <SelectField span={4} label="Gender" value={form.Gender} onChange={(v) => setF("Gender", v)} options={OPTIONS.gender} />

                  {/* Categorical features (FINAL FEATURES) */}
                  <SelectField span={6} label="Location" value={form.Location} onChange={(v) => setF("Location", v)} options={OPTIONS.location} />
                  <SelectField span={6} label="Living Arrangement" value={form.LivingArrangement} onChange={(v) => setF("LivingArrangement", v)} options={OPTIONS.livingArrangement} />
                  <SelectField span={6} label="Extracurricular" value={form.Extracurricular} onChange={(v) => setF("Extracurricular", v)} options={OPTIONS.extracurricular} />
                  <SelectField span={6} label="Awards" value={form.Awards} onChange={(v) => setF("Awards", v)} options={OPTIONS.yesNo} />
                  <SelectField span={6} label="Specialization Track" value={form.SpecializationTrack} onChange={(v) => setF("SpecializationTrack", v)} options={OPTIONS.specialization} />
                  <SelectField span={6} label="Latin Honors" value={form.LatinHonors} onChange={(v) => setF("LatinHonors", v)} options={OPTIONS.yesNo} />
                  <SelectField span={6} label="Graduate On Time" value={form.GraduateOnTime} onChange={(v) => setF("GraduateOnTime", v)} options={OPTIONS.yesNo} />
                  <SelectField span={6} label="Failed Grade" value={form.FailedGrade} onChange={(v) => setF("FailedGrade", v)} options={OPTIONS.yesNo} />
                  <SelectField span={6} label="Soft Skill Level" value={form.SoftSkillLevel} onChange={(v) => setF("SoftSkillLevel", v)} options={OPTIONS.softSkill} />
                  <SelectField span={12} label="Monthly Income Status" value={form.MonthlyIncomeStatus} onChange={(v) => setF("MonthlyIncomeStatus", v)} options={OPTIONS.monthlyIncome} />
                  <SelectField span={6} label="Current Job" value={form.CurrentJob} onChange={(v) => setF("CurrentJob", v)} options={OPTIONS.currentJob} />
                  <SelectField span={6} label="Further Studies" value={form.FurtherStudies} onChange={(v) => setF("FurtherStudies", v)} options={OPTIONS.yesNo} />
                  <SelectField span={6} label="Cerification (spelled as CSV)" value={form.Cerification} onChange={(v) => setF("Cerification", v)} options={OPTIONS.yesNo} />

                  {/* Grades (numeric) */}
                  <NumberField span={4} label="Programming" value={form.Programming} onChange={(v) => setF("Programming", v)} hint="1.00–5.00 (step 0.25)" />
                  <NumberField span={4} label="Networking" value={form.Networking} onChange={(v) => setF("Networking", v)} hint="1.00–5.00 (step 0.25)" />
                  <NumberField span={4} label="Database" value={form.Database} onChange={(v) => setF("Database", v)} hint="1.00–5.00 (step 0.25)" />
                  <NumberField span={4} label="Web and System Development" value={form.WebandSystemDevelopment} onChange={(v) => setF("WebandSystemDevelopment", v)} hint="1.00–5.00 (step 0.25)" />
                  <NumberField span={4} label="Hardware & Computing Fundamentals" value={form.HardwareandComputingFundamentals} onChange={(v) => setF("HardwareandComputingFundamentals", v)} hint="1.00–5.00 (step 0.25)" />
                  <NumberField span={4} label="Electives" value={form.Electives} onChange={(v) => setF("Electives", v)} hint="1.00–5.00 (step 0.25)" />


                  
                </FormGrid>

                <Actions>
                  <Button type="submit" className="primary" disabled={loading}>
                    {loading ? "Predicting..." : "Predict"}
                  </Button>
                  <Button type="button" className="ghost" onClick={resetForm}>Clear</Button>
                </Actions>
              </form>
            </Card>

            {/* Right: Live payload preview + Result */}
            <div>
             

              {apiResult && (
                <ResultCard style={{ marginTop: 18 }}>
                  <h3 style={{ marginTop: 0 }}>Prediction Result</h3>
                  <p style={{ margin: "6px 0 0" }}>
                    <b>Label:</b> {apiResult.prediction_label} <br/>
                    <b>Index:</b> {apiResult.prediction_index}
                  </p>

                  {apiResult.probabilities && (
                    <>
                      <h4 style={{ marginBottom: 6 }}>Probabilities</h4>
                      <ProbTable>
                        <thead>
                          <tr><th>Class</th><th>Probability</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(apiResult.probabilities).map(([name, val]) => (
                            <tr key={name}>
                              <td>{name}</td>
                              <td>{(val * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </ProbTable>
                    </>
                  )}
                </ResultCard>
              )}

              {apiError && (
                <Card style={{ marginTop: 18, borderLeft: "5px solid #ef4444" }}>
                  <h3 style={{ marginTop: 0, color: "#b91c1c" }}>Prediction Error</h3>
                  <p style={{ color: "#6b7280" }}>{apiError}</p>
                </Card>
              )}
            </div>
          </TwoCol>
        </Main>
      </AppWrap>
    </>
  );
}
