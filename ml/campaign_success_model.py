import argparse
import json
from datetime import datetime
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from pymongo import MongoClient
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

FEATURE_COLUMNS = [
    "category",
    "location",
    "target_signatures",
    "target_volunteers",
    "target_amount",
    "raised_amount",
    "organizer_reliability",
    "summary_length",
    "description_length",
    "days_active",
]
TARGET_COLUMN = "success"
CATEGORICAL_COLUMNS = ["category", "location"]
NUMERIC_COLUMNS = [
    column for column in FEATURE_COLUMNS if column not in CATEGORICAL_COLUMNS
]
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/citizenhub")


def build_pipeline() -> Pipeline:
    preprocess = ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                NUMERIC_COLUMNS,
            ),
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocess),
            ("classifier", LogisticRegression(max_iter=2000, random_state=42)),
        ]
    )
    return model


def build_demo_dataset() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "category": "Air Pollution",
                "location": "Delhi",
                "target_signatures": 5000,
                "target_volunteers": 25,
                "target_amount": 100000,
                "raised_amount": 85000,
                "organizer_reliability": 80,
                "summary_length": 120,
                "description_length": 900,
                "days_active": 14,
                "success": 1,
            },
            {
                "category": "Climate Action",
                "location": "Bengaluru",
                "target_signatures": 12000,
                "target_volunteers": 40,
                "target_amount": 250000,
                "raised_amount": 260000,
                "organizer_reliability": 92,
                "summary_length": 180,
                "description_length": 1100,
                "days_active": 21,
                "success": 1,
            },
            {
                "category": "Water & Sanitation",
                "location": "National",
                "target_signatures": 7000,
                "target_volunteers": 30,
                "target_amount": 150000,
                "raised_amount": 50000,
                "organizer_reliability": 68,
                "summary_length": 140,
                "description_length": 700,
                "days_active": 10,
                "success": 0,
            },
            {
                "category": "Women Safety & Equality",
                "location": "Mumbai",
                "target_signatures": 9000,
                "target_volunteers": 35,
                "target_amount": 200000,
                "raised_amount": 170000,
                "organizer_reliability": 88,
                "summary_length": 160,
                "description_length": 980,
                "days_active": 18,
                "success": 1,
            },
            {
                "category": "Civic Rights & Justice",
                "location": "Kolkata",
                "target_signatures": 4500,
                "target_volunteers": 20,
                "target_amount": 90000,
                "raised_amount": 40000,
                "organizer_reliability": 62,
                "summary_length": 110,
                "description_length": 640,
                "days_active": 8,
                "success": 0,
            },
            {
                "category": "Air Pollution",
                "location": "Pune",
                "target_signatures": 6000,
                "target_volunteers": 28,
                "target_amount": 120000,
                "raised_amount": 95000,
                "organizer_reliability": 75,
                "summary_length": 150,
                "description_length": 820,
                "days_active": 12,
                "success": 1,
            },
            {
                "category": "Forest & Wildlife",
                "location": "Bengaluru",
                "target_signatures": 8000,
                "target_volunteers": 22,
                "target_amount": 140000,
                "raised_amount": 73000,
                "organizer_reliability": 71,
                "summary_length": 130,
                "description_length": 760,
                "days_active": 11,
                "success": 0,
            },
            {
                "category": "Climate Action",
                "location": "National",
                "target_signatures": 15000,
                "target_volunteers": 50,
                "target_amount": 300000,
                "raised_amount": 285000,
                "organizer_reliability": 95,
                "summary_length": 200,
                "description_length": 1200,
                "days_active": 22,
                "success": 1,
            },
            {
                "category": "Water & Sanitation",
                "location": "Delhi",
                "target_signatures": 6500,
                "target_volunteers": 26,
                "target_amount": 110000,
                "raised_amount": 61000,
                "organizer_reliability": 69,
                "summary_length": 128,
                "description_length": 690,
                "days_active": 9,
                "success": 0,
            },
            {
                "category": "Women Safety & Equality",
                "location": "Hyderabad",
                "target_signatures": 10500,
                "target_volunteers": 38,
                "target_amount": 220000,
                "raised_amount": 190000,
                "organizer_reliability": 90,
                "summary_length": 170,
                "description_length": 990,
                "days_active": 19,
                "success": 1,
            },
            {
                "category": "Air Pollution",
                "location": "Chennai",
                "target_signatures": 7400,
                "target_volunteers": 30,
                "target_amount": 160000,
                "raised_amount": 110000,
                "organizer_reliability": 77,
                "summary_length": 145,
                "description_length": 860,
                "days_active": 15,
                "success": 1,
            },
            {
                "category": "Civic Rights & Justice",
                "location": "Delhi",
                "target_signatures": 4700,
                "target_volunteers": 18,
                "target_amount": 85000,
                "raised_amount": 38000,
                "organizer_reliability": 60,
                "summary_length": 100,
                "description_length": 620,
                "days_active": 7,
                "success": 0,
            },
            {
                "category": "Climate Action",
                "location": "Pune",
                "target_signatures": 13000,
                "target_volunteers": 44,
                "target_amount": 270000,
                "raised_amount": 220000,
                "organizer_reliability": 89,
                "summary_length": 190,
                "description_length": 1080,
                "days_active": 20,
                "success": 1,
            },
            {
                "category": "Water & Sanitation",
                "location": "Mumbai",
                "target_signatures": 6800,
                "target_volunteers": 29,
                "target_amount": 125000,
                "raised_amount": 64000,
                "organizer_reliability": 72,
                "summary_length": 134,
                "description_length": 710,
                "days_active": 10,
                "success": 0,
            },
        ]
    )


def load_live_dataset() -> Optional[pd.DataFrame]:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = client.get_default_database()
        campaigns = list(db.campaigns.find({}))
        if not campaigns:
            return None

        tasks = db.tasks.find({})
        volunteer_count_by_campaign = {}
        for task in tasks:
            campaign_id = str(task.get("campaignId"))
            if task.get("assignedTo"):
                volunteer_count_by_campaign.setdefault(campaign_id, set()).add(str(task["assignedTo"]))

        rows: List[Dict[str, Any]] = []
        for campaign in campaigns:
            organizer = db.users.find_one({"_id": campaign.get("organizer")}) or {}
            target_signatures = int(campaign.get("targetSignatures") or 0)
            target_volunteers = int(campaign.get("targetVolunteers") or 0)
            target_amount = float(campaign.get("targetAmount") or 0)
            raised_amount = float(campaign.get("raisedAmount") or 0)
            signatures_count = int(campaign.get("signaturesCount") or 0)
            volunteer_count = len(volunteer_count_by_campaign.get(str(campaign.get("_id")), set()))

            created_at = campaign.get("createdAt")
            updated_at = campaign.get("updatedAt")
            if created_at and updated_at:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                days_active = max(1, int((updated_at - created_at).total_seconds() / 86400))
            else:
                days_active = 1

            summary = campaign.get("summary") or ""
            description = campaign.get("description") or ""
            success = int(
                signatures_count >= max(1, target_signatures * 0.7)
                or raised_amount >= max(1, target_amount * 0.7)
                or volunteer_count >= max(1, target_volunteers * 0.7)
            )

            rows.append(
                {
                    "category": campaign.get("category") or "Other",
                    "location": campaign.get("location") or "National",
                    "target_signatures": target_signatures,
                    "target_volunteers": target_volunteers,
                    "target_amount": target_amount,
                    "raised_amount": raised_amount,
                    "organizer_reliability": int(organizer.get("reliabilityScore") or 70),
                    "summary_length": len((summary or "").split()),
                    "description_length": len((description or "").split()),
                    "days_active": days_active,
                    "success": success,
                }
            )

        if not rows:
            return None

        df = pd.DataFrame(rows)
        if df.empty or df["success"].nunique() < 2:
            return None
        return df
    except Exception:
        return None


def build_training_dataset(training_data_path: Path) -> pd.DataFrame:
    demo_df = build_demo_dataset()

    if training_data_path.exists():
        historical_df = pd.read_csv(training_data_path)
    else:
        historical_df = pd.DataFrame(columns=FEATURE_COLUMNS + [TARGET_COLUMN])

    live_df = load_live_dataset()
    if live_df is not None:
        combined = pd.concat([historical_df, demo_df, live_df], ignore_index=True)
        print("Using both historical CSV data, demo dataset, and live MongoDB campaign data.")
    else:
        combined = pd.concat([historical_df, demo_df], ignore_index=True)
        print("Using historical CSV data plus demo fallback dataset.")

    combined = combined[FEATURE_COLUMNS + [TARGET_COLUMN]].drop_duplicates(ignore_index=True)
    combined.to_csv(training_data_path, index=False)
    return combined


def load_dataset(csv_path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    required_cols = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing = [column for column in required_cols if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    return df


def train_model(csv_path: str | Path, model_output_path: str | Path) -> Dict[str, float]:
    df = load_dataset(csv_path)
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    if y.nunique() < 2:
        raise ValueError("Target column must contain both classes for training.")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float((y_pred == y_test).mean()), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }

    model_output = Path(model_output_path)
    model_output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_output)

    print("Model saved to:", model_output)
    print(classification_report(y_test, y_pred))
    print("ROC AUC:", metrics["roc_auc"])
    return metrics


def score_campaign(campaign: Dict[str, Any], model_path: str | Path) -> Dict[str, Any]:
    model = joblib.load(model_path)

    normalized = {
        "category": campaign.get("category") or "Other",
        "location": campaign.get("location") or "National",
        "target_signatures": float(campaign.get("target_signatures") or campaign.get("targetSignatures") or 0),
        "target_volunteers": float(campaign.get("target_volunteers") or campaign.get("targetVolunteers") or 0),
        "target_amount": float(campaign.get("target_amount") or campaign.get("targetAmount") or 0),
        "raised_amount": float(campaign.get("raised_amount") or campaign.get("raisedAmount") or 0),
        "organizer_reliability": float(campaign.get("organizer_reliability") or campaign.get("organizerReliability") or 70),
        "summary_length": float(campaign.get("summary_length") or len((campaign.get("summary") or "").split())),
        "description_length": float(campaign.get("description_length") or len((campaign.get("description") or "").split())),
        "days_active": float(campaign.get("days_active") or campaign.get("daysActive") or 1),
    }

    campaign_df = pd.DataFrame([normalized])[FEATURE_COLUMNS]
    probability = model.predict_proba(campaign_df)[0, 1]
    probability_pct = round(float(probability * 100), 1)

    if probability >= 0.75:
        label = "High"
    elif probability >= 0.55:
        label = "Moderate"
    else:
        label = "Low"

    return {
        "probability": float(probability),
        "probability_pct": probability_pct,
        "label": label,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="CitizenHub campaign success model")
    parser.add_argument("--predict", type=str, help="JSON campaign payload to score")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    training_data = project_root / "ml" / "campaign_success_training.csv"
    model_file = project_root / "ml" / "campaign_success_model.joblib"

    if args.predict:
        if not model_file.exists():
            training_df = build_training_dataset(training_data)
            if training_df.empty:
                training_df = build_demo_dataset()
                training_df.to_csv(training_data, index=False)
            train_model(training_data, model_file)

        payload = json.loads(args.predict)
        if isinstance(payload, dict) and "campaign" in payload:
            payload = payload["campaign"]

        prediction = score_campaign(payload, model_file)
        print(json.dumps(prediction))
        return

    training_df = build_training_dataset(training_data)

    if training_df.empty:
        training_df = build_demo_dataset()
        training_df.to_csv(training_data, index=False)

    train_model(training_data, model_file)

    example_campaign = {
        "category": "Air Pollution",
        "location": "Delhi",
        "target_signatures": 8000,
        "target_volunteers": 32,
        "target_amount": 180000,
        "raised_amount": 90000,
        "organizer_reliability": 82,
        "summary_length": 170,
        "description_length": 1100,
        "days_active": 15,
    }

    print("Sample prediction:")
    print(score_campaign(example_campaign, model_file))


if __name__ == "__main__":
    main()
