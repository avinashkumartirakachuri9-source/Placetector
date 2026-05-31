from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from dotenv import load_dotenv
from google import genai

from bson import ObjectId

from flask import Flask, request, jsonify, send_file

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from flask import send_file

from pymongo import MongoClient
from datetime import datetime

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet

load_dotenv()
mongo_client = MongoClient(
    os.getenv("MONGO_URI")
)

db = mongo_client["placement_predictor"]

predictions_collection = db["predictions"]
app = Flask(__name__)
CORS(app)

model = joblib.load("placement_model.pkl")

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

@app.route("/")
def home():
    return "Placement Prediction API Running"

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    features = [[
        float(data["cgpa"]),
        int(data["internships"]),
        int(data["projects"]),
        int(data["coding_skills"]),
        int(data["communication_skills"]),
        int(data["aptitude_score"]),
        int(data["soft_skills"]),
        int(data["certifications"]),
        int(data["backlogs"])
    ]]

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    predictions_collection.insert_one({
        "name": data["name"],
        "probability": round(probability * 100, 2),
        "prediction": (
            "Likely Placed"
            if prediction == 1
            else "Not Likely Placed"
        ),
        "created_at": datetime.now()
    })

    prompt = f"""
You are an expert placement mentor.

Student Details:

Name: {data["name"]}
CGPA: {data["cgpa"]}
Internships: {data["internships"]}
Projects: {data["projects"]}
Coding Skills: {data["coding_skills"]}/10
Communication Skills: {data["communication_skills"]}/10
Aptitude Score: {data["aptitude_score"]}/10
Soft Skills: {data["soft_skills"]}/10
Certifications: {data["certifications"]}
Backlogs: {data["backlogs"]}

Return ONLY:

## Strengths
## Weaknesses
## Placement Roadmap

Keep it under 120 words.
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        advice = response.text

    except Exception as e:

        print("Gemini Error:", e)

        advice = """
## Strengths
Strong technical profile.

## Weaknesses
Continue improving communication skills.

## Placement Roadmap
Build more projects and practice interviews.
"""

    return jsonify({
        "prediction": int(prediction),
        "probability": round(probability * 100, 2),
        "advice": advice
    })
@app.route("/history")
def history():

    records = list(
        predictions_collection
        .find()
        .sort("created_at", -1)
        .limit(10)
    )

    for record in records:
        record["_id"] = str(record["_id"])

    return jsonify(records)
@app.route("/delete/<id>", methods=["DELETE"])
def delete_prediction(id):

    predictions_collection.delete_one({
        "_id": ObjectId(id)
    })

    return jsonify({
        "message": "Deleted"
    })


@app.route("/report", methods=["POST"])
def report():

    data = request.json

    pdf_file = "career_report.pdf"

    doc = SimpleDocTemplate(pdf_file)

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "AI Placement Prediction Report",
            styles["Title"]
        )
    )

    content.append(Spacer(1, 12))

    content.append(
        Paragraph(
            f"Student Name: {data['name']}",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            f"Placement Chance: {data['probability']}%",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            f"Prediction: {data['prediction']}",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 12))

    content.append(
        Paragraph(
            "AI Career Analysis",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            data["advice"].replace("\n", "<br/>"),
            styles["Normal"]
        )
    )

    doc.build(content)

    return send_file(
        pdf_file,
        as_attachment=True
    )

if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False
    )