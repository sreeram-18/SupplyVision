import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { FaIndustry, FaMapMarkerAlt, FaProjectDiagram, FaMoneyBill, FaUserCircle } from "react-icons/fa";
import { supabase } from "./supabaseClient";
import "./App.css";

const API_URL = "process.env.https://supplyvision.onrender.com";

function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else onLogin(data.user);
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for confirmation!");
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="blob blob-green"></div>
      <div className="blob blob-purple"></div>
      <div className="blob blob-pink"></div>

      {/* Header */}
      <header className="login-header">
        <img src="/logo.svg" alt="Logo" className="login-logo" />
        <h1>SupplyVision</h1>
      </header>

      {/* Form */}
      <div className="login-form-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isLogin ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <button onClick={handleSignUp}>Sign Up</button>
        )}
        <p onClick={() => setIsLogin(!isLogin)} className="switch-auth">
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

function Profile({ user, onLogout }) {
  return (
    <div className="profile-container">
      <FaUserCircle size={30} />
      <span>{user.email}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

function ForecastPage({ user }) {
  const [forecastData, setForecastData] = useState({ Month: [], Forecasted_Quantity: [] });
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [towers, setTowers] = useState([]);
  const [material, setMaterial] = useState("");
  const [location, setLocation] = useState("");
  const [tower, setTower] = useState("");
  const [budget, setBudget] = useState(1000000);
  const [tax, setTax] = useState(5);
  const [inflation, setInflation] = useState(5);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
const [matRes, locRes, towRes] = await Promise.all([
  fetch(`${API_URL}/materials`),
  fetch(`${API_URL}/locations`),
  fetch(`${API_URL}/towers`),
]);
        const matData = await matRes.json();
        const locData = await locRes.json();
        const towData = await towRes.json();
        setMaterials(matData);
        setLocations(locData);
        setTowers(towData);
        setMaterial(matData[0]);
        setLocation(locData[0]);
        setTower(towData[0]);
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch forecast whenever inputs change
  useEffect(() => {
    const fetchForecast = async () => {
      if (!material || !location || !tower) return;
      try {
const response = await fetch(
  `${API_URL}/forecast?material=${material}&project_location=${location}&tower_type=${tower}&budget=${budget}&tax_percent=${tax}&inflation_percent=${inflation}`
);
        const data = await response.json();
        setForecastData(data);
      } catch (err) {
        console.error("Error fetching forecast:", err);
      }
    };
    fetchForecast();
  }, [material, location, tower, budget, tax, inflation]);

  const inputCards = [
    { label: "Material", icon: <FaIndustry />, value: material, setValue: setMaterial, options: materials },
    { label: "Project Location", icon: <FaMapMarkerAlt />, value: location, setValue: setLocation, options: locations },
    { label: "Tower Type", icon: <FaProjectDiagram />, value: tower, setValue: setTower, options: towers },
    { label: "Tax %", icon: <FaMoneyBill />, value: tax, setValue: setTax, options: [0, 5, 10, 15, 20] },
    { label: "Inflation %", icon: <FaMoneyBill />, value: inflation, setValue: setInflation, options: [0, 5, 10, 15, 20] },
  ];

  return (
    <div className="app-container">
      <div className="blob blob-green"></div>
      <div className="blob blob-purple"></div>
      <div className="blob blob-pink"></div>

      <header className="header">
        <div className="logo-container">
          <img src="/logo.svg" alt="SupplyVision Logo" className="logo" />
          <h1>SupplyVision</h1>
        </div>
        <p className="sub-text">Intelligent Materials Demand Forecasting</p>
        <Profile
          user={user}
          onLogout={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
        />
      </header>

      <div className="controls">
        {inputCards.map((item, idx) => (
          <div className="card input-card glow-card" style={{ animationDelay: `${idx * 0.15}s` }} key={item.label}>
            <label className="input-label">
              {item.icon} {item.label}
            </label>
            {item.options ? (
              <select
                value={item.value}
                onChange={(e) => {
                  if (item.label === "Tax %" || item.label === "Inflation %") {
                    item.setValue(Number(e.target.value));
                  } else {
                    item.setValue(e.target.value);
                  }
                }}
                className="custom-select"
              >
                {item.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={item.value}
                onChange={(e) => item.setValue(Number(e.target.value))}
                className="custom-input"
              />
            )}
          </div>
        ))}
      </div>

      <div className="chart-container card">
        <Plot
          data={[
            {
              x: forecastData.Month,
              y: forecastData.Forecasted_Quantity,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#10b981", size: 10 },
              line: { shape: "spline", color: "#10b981", width: 3 },
            },
          ]}
          layout={{
            title: `${material} Forecast`,
            xaxis: { title: "Month", showgrid: true, zeroline: false },
            yaxis: { title: "Forecasted Quantity", showgrid: true, zeroline: false },
            autosize: true,
            hovermode: "closest",
            margin: { t: 60, l: 60, r: 60, b: 60 },
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ responsive: true }}
        />
      </div>

      <div className="description-container card">
        <h2>About This Project</h2>
        <p>
          SupplyVision forecasts the demand for construction materials across different project locations and tower types. 
          By analyzing past data and including tax and inflation, it predicts the quantity of each material needed.
        </p>
        <p>
          This helps project managers plan budgets, avoid shortages, and optimize inventory management. 
          The graph above shows expected material quantities over the next 12 months based on your selections.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return <Auth onLogin={setUser} />;

  return <ForecastPage user={user} />;
}
