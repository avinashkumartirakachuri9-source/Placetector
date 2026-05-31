import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";


function App() {

  const deletePrediction = async (id) => {
  try {

    await axios.delete(
      `https://placetector.onrender.com//delete/${id}`
    );

    loadHistory();

  } catch (err) {

    console.log(err);

  }
};

  const [form, setForm] = useState({
    name: "",
    cgpa: "",
    internships: "",
    projects: "",
    coding_skills: "",
    communication_skills: "",
    aptitude_score: "",
    soft_skills: "",
    certifications: "",
    backlogs: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const downloadReport = async () => {
  try {

    const response = await axios.post(
      "https://placetector.onrender.com/report",
      {
        name: form.name,
        probability: result.probability,
        prediction:
          result.prediction === 1
            ? "Likely Placed"
            : "Not Likely Placed",
        advice: result.advice,
      },
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "career_report.pdf"
    );

    document.body.appendChild(link);

    link.click();

  } catch (err) {
    console.log(err);
  }
};

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loadHistory = async () => {
  try {
    const res = await axios.get(
      "https://placetector.onrender.com//history"
    );

    setHistory(res.data);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  loadHistory();
}, []);

 const predict = async () => {
  if (
  form.cgpa === "" ||
  form.internships === "" ||
  form.projects === "" ||
  form.coding_skills === "" ||
  form.communication_skills === "" ||
  form.aptitude_score === "" ||
  form.soft_skills === "" ||
  form.certifications === "" ||
  form.backlogs === ""
) {
  alert("Please fill all details");
  return;
}
  try {

    setLoading(true);

    const res = await axios.post(
      "http://placetector.onrender.com/predict",
      form
    );

    setResult(res.data);
    loadHistory();

  } catch (err) {

    console.error(err);
    alert("Backend error. Check Flask terminal.");

  } finally {

    setLoading(false);

  }
};

  return (
    <div className="container">
      <div className="card">

        <h1>🚀 AI Placement Predictor</h1>

        <div className="form-grid">

          <input
            type="text"
            name="name"
            placeholder="Student Name"
            onChange={handleChange}
          />

          <input
            type="number"
            name="cgpa"
            placeholder="CGPA"
            onChange={handleChange}
          />

          <input
            type="number"
            name="internships"
            placeholder="Internships"
            onChange={handleChange}
          />

          <input
            type="number"
            name="projects"
            placeholder="Projects"
            onChange={handleChange}
          />

          <input
            type="number"
            name="coding_skills"
            placeholder="Coding Skills"
            onChange={handleChange}
          />

          <input
            type="number"
            name="communication_skills"
            placeholder="Communication Skills"
            onChange={handleChange}
          />

          <input
            type="number"
            name="aptitude_score"
            placeholder="Aptitude Score"
            onChange={handleChange}
          />

          <input
            type="number"
            name="soft_skills"
            placeholder="Soft Skills"
            onChange={handleChange}
          />

          <input
            type="number"
            name="certifications"
            placeholder="Certifications"
            onChange={handleChange}
          />

          <input
            type="number"
            name="backlogs"
            placeholder="Backlogs"
            onChange={handleChange}
          />

        </div>

        <button onClick={predict}>
          Predict Placement
        </button>
      {loading && (
    <h3>🤖 Analyzing Profile...</h3>
  )}
        {result && (
  <div className="result-box">

    <h3>
      Student: {form.name}
    </h3>

    <h2>
      Placement Chance
    </h2>

    <div className="percentage">
      {result.probability}%
    </div>

    <div
      className={
        result.prediction === 1
          ? "success"
          : "danger"
      }
    >
      {result.prediction === 1
        ? "Likely Placed ✅"
        : "Not Likely Placed ❌"}
    </div>

    <div
      style={{
        marginTop: "25px",
        textAlign: "left",
      }}
    >
      <h3>AI Career Analysis</h3>
      <button
  onClick={downloadReport}
  style={{
    marginTop: "20px",
  }}
>
  📄 Download Report
</button>

<div
  style={{
    marginTop: "10px",
    whiteSpace: "pre-wrap",
    textAlign: "left",
    lineHeight: "1.7",
  }}
>
  {result.advice}
</div>
    </div>

  </div>
)}
{history.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      textAlign: "left",
    }}
  >
    <h2>Recent Predictions</h2>

    {history.map((item, index) => (
      <div
        key={index}
        style={{
          padding: "10px",
          marginTop: "10px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <strong>{item.name}</strong>

  <button
    onClick={() =>
      deletePrediction(item._id)
    }
  >
    ❌ Delete
  </button>
</div>

        <br />

        {item.probability}% — {item.prediction}
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}

export default App;