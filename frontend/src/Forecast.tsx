import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

type ForecastData = { Month: string; Predicted_Quantity: number }[];

interface Props {
  material: string;
}

const Forecast: React.FC<Props> = ({ material }) => {
  const [data, setData] = useState<ForecastData>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/forecast/${material}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.forecast) setData(json.forecast);
      });
  }, [material]);

  return (
    <div>
      <h2>{material} Demand Forecast</h2>
      <Plot
        data={[
          {
            x: data.map((d) => d.Month),
            y: data.map((d) => d.Predicted_Quantity),
            type: "scatter",
            mode: "lines+markers",
          },
        ]}
        layout={{ width: 800, height: 400 }}
      />
    </div>
  );
};

export default Forecast;
