import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv("train.csv")

# Convert target column
le = LabelEncoder()
df["Placement_Status"] = le.fit_transform(df["Placement_Status"])

# Features
X = df[
    [
        "CGPA",
        "Internships",
        "Projects",
        "Coding_Skills",
        "Communication_Skills",
        "Aptitude_Test_Score",
        "Soft_Skills_Rating",
        "Certifications",
        "Backlogs",
    ]
]

# Target
y = df["Placement_Status"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

# Train model
model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

# Accuracy
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("Accuracy:", accuracy)

# Save model
filename = "placement_model.pkl"

joblib.dump(model, filename)

import os

print("Saved:", os.path.abspath(filename))
print("File exists:", os.path.exists(filename))
print("Size:", os.path.getsize(filename))