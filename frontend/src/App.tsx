import React, { useState } from "react";
import Forecast from "./Forecast";

const App: React.FC = () => {
  const [material, setMaterial] = useState("Steel");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Material Demand Forecast Dashboard</h1>
      <label>
        Select Material:
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="Steel">Steel</option>
          <option value="Cement">Cement</option>
          <option value="Conductors">Conductors</option>
        </select>
      </label>
      <Forecast material={material} />
    </div>
  );
};

export default App;
