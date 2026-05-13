import io
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File

router = APIRouter(prefix="/data", tags=["data"])

REQUIRED_COLUMNS = {
    "date", "admissions", "discharges",
    "occupied_beds", "available_beds", "average_length_of_stay",
}

PT_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
             "Jul", "Ago", "Set", "Out", "Nov", "Dez"]


def read_file(file: UploadFile) -> pd.DataFrame:
    content = file.file.read()
    if file.filename.endswith(".xlsx"):
        return pd.read_excel(io.BytesIO(content))
    return pd.read_csv(io.BytesIO(content))


def occ_pct(occ: pd.Series, avail: pd.Series) -> float:
    total = occ + avail
    return round(float((occ / total * 100).mean()), 1)


def horizon_7d(df: pd.DataFrame) -> dict:
    d = df.sort_values("date").tail(7)
    chart = [
        {
            "label": PT_DAYS[row["date"].weekday()],
            "pct": round(float(
                row["occupied_beds"] / (row["occupied_beds"] + row["available_beds"]) * 100
            ), 1),
        }
        for _, row in d.iterrows()
    ]
    return {
        "metrics": {
            "avg_occupancy_rate": occ_pct(d["occupied_beds"], d["available_beds"]),
            "avg_stay_hours": round(float(d["average_length_of_stay"].mean() * 24), 1),
            "total_admissions": int(d["admissions"].sum()),
        },
        "chart": chart,
    }


def horizon_months(df: pd.DataFrame) -> dict:
    d = df.copy()
    d["period"] = d["date"].dt.to_period("M")
    g = d.groupby("period").agg(
        occ=("occupied_beds", "mean"),
        avail=("available_beds", "mean"),
        stay=("average_length_of_stay", "mean"),
        admissions=("admissions", "sum"),
    ).reset_index()
    chart = [
        {
            "label": PT_MONTHS[row["period"].month - 1],
            "pct": round(float(row["occ"] / (row["occ"] + row["avail"]) * 100), 1),
        }
        for _, row in g.iterrows()
    ]
    return {
        "metrics": {
            "avg_occupancy_rate": occ_pct(g["occ"], g["avail"]),
            "avg_stay_hours": round(float(g["stay"].mean() * 24), 1),
            "total_admissions": int(d["admissions"].sum()),
        },
        "chart": chart,
    }


def horizon_years(df: pd.DataFrame) -> dict:
    d = df.copy()
    d["year"] = d["date"].dt.year
    g = d.groupby("year").agg(
        occ=("occupied_beds", "mean"),
        avail=("available_beds", "mean"),
        stay=("average_length_of_stay", "mean"),
        admissions=("admissions", "sum"),
    ).reset_index()
    chart = [
        {
            "label": str(int(row["year"])),
            "pct": round(float(row["occ"] / (row["occ"] + row["avail"]) * 100), 1),
        }
        for _, row in g.iterrows()
    ]
    return {
        "metrics": {
            "avg_occupancy_rate": occ_pct(g["occ"], g["avail"]),
            "avg_stay_hours": round(float(g["stay"].mean() * 24), 1),
            "total_admissions": int(d["admissions"].sum()),
        },
        "chart": chart,
    }


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Formato inválido. Use CSV ou XLSX.")

    try:
        df = read_file(file)
    except Exception:
        raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo.")

    df.columns = df.columns.str.strip().str.lower()
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Colunas ausentes: {', '.join(sorted(missing))}",
        )

    df["date"] = pd.to_datetime(df["date"])

    return {
        "filename": file.filename,
        "rows": len(df),
        "horizons": {
            "7d": horizon_7d(df),
            "months": horizon_months(df),
            "years": horizon_years(df),
        },
    }