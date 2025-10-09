from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
from dateutil.relativedelta import relativedelta

# -----------------------
# Initialize FastAPI
# -----------------------
app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Load CSV and preprocess
# -----------------------
df = pd.read_csv("materials_data.csv", parse_dates=["Month"])
df["Month_Num"] = df["Month"].dt.month

# Encode categorical variables
le_project = LabelEncoder()
df["Project_Location_Encoded"] = le_project.fit_transform(df["Project_Location"])

le_tower = LabelEncoder()
df["Tower_Type_Encoded"] = le_tower.fit_transform(df["Tower_Type"])

le_material = LabelEncoder()
df["Material_Encoded"] = le_material.fit_transform(df["Material"])

# -----------------------
# Train RandomForest model
# -----------------------
X = df[["Month_Num", "Project_Location_Encoded", "Tower_Type_Encoded", "Budget", "Material_Encoded"]]
y = df["Quantity_Used"]

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

# -----------------------
# Lists for dropdowns
# -----------------------
materials_list = df["Material"].unique().tolist()
locations_list = df["Project_Location"].unique().tolist()
towers_list = df["Tower_Type"].unique().tolist()
default_percentages = [0, 5, 10, 15, 20]  # Default tax/inflation %

# -----------------------
# Dropdown endpoints
# -----------------------
@app.get("/materials")
def get_materials():
    return materials_list

@app.get("/locations")
def get_locations():
    return locations_list

@app.get("/towers")
def get_towers():
    return towers_list

@app.get("/percentages")
def get_percentages():
    return default_percentages

# -----------------------
# Forecast endpoint
# -----------------------
@app.get("/forecast")
def get_forecast(
    material: str = Query(...),
    project_location: str = Query(...),
    tower_type: str = Query(...),
    budget: float = Query(...),
    tax: float = Query(0),
    inflation: float = Query(0)
):
    # Clean inputs
    material_clean = material.strip().lower()
    project_clean = project_location.strip().lower()
    tower_clean = tower_type.strip().lower()

    # Mapping for case-insensitive lookup
    material_map = {m.lower(): m for m in le_material.classes_}
    project_map = {p.lower(): p for p in le_project.classes_}
    tower_map = {t.lower(): t for t in le_tower.classes_}

    # Validate inputs
    if material_clean not in material_map:
        return JSONResponse(status_code=400, content={"error": f"Material '{material}' not recognized."})
    if project_clean not in project_map:
        return JSONResponse(status_code=400, content={"error": f"Project Location '{project_location}' not recognized."})
    if tower_clean not in tower_map:
        return JSONResponse(status_code=400, content={"error": f"Tower Type '{tower_type}' not recognized."})

    # Encode inputs
    encoded_material = le_material.transform([material_map[material_clean]])[0]
    encoded_project = le_project.transform([project_map[project_clean]])[0]
    encoded_tower = le_tower.transform([tower_map[tower_clean]])[0]

    # Forecast for next 12 months
    start_month = datetime.now().replace(day=1)
    forecast_months = []
    forecast_quantities = []

    for i in range(12):
        month = start_month + relativedelta(months=i)
        month_num = month.month

        X_pred = pd.DataFrame([{
            "Month_Num": month_num,
            "Project_Location_Encoded": encoded_project,
            "Tower_Type_Encoded": encoded_tower,
            "Budget": budget,
            "Material_Encoded": encoded_material
        }])

        y_pred = model.predict(X_pred)[0]

        # Apply tax and inflation percentages
        y_pred *= (1 + tax / 100)
        y_pred *= (1 + inflation / 100)

        forecast_quantities.append(round(y_pred, 2))
        forecast_months.append(month.strftime("%Y-%m"))

    return {
        "Month": forecast_months,
        "Forecasted_Quantity": forecast_quantities
    }
