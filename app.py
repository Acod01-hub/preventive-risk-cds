from flask import Flask, render_template, request, jsonify
import json
import math

app = Flask(__name__)

class RiskCalculator:
    """
    Mock risk calculator for diabetes risk assessment.
    In a real implementation, this would use ML models.
    """
    
    @staticmethod
    def calculate_diabetes_risk(age, bmi, systolic_bp, diastolic_bp, blood_sugar, lifestyle):
        """
        Calculate diabetes risk score based on patient data.
        Returns risk percentage and contributing factors.
        """
        risk_score = 0
        factors = []
        
        # Age factor (0-25 points)
        if age >= 65:
            risk_score += 25
            factors.append({"factor": "Age ≥65", "impact": "High", "points": 25})
        elif age >= 45:
            risk_score += 15
            factors.append({"factor": "Age 45-64", "impact": "Moderate", "points": 15})
        elif age >= 30:
            risk_score += 5
            factors.append({"factor": "Age 30-44", "impact": "Low", "points": 5})
        
        # BMI factor (0-30 points)
        if bmi >= 35:
            risk_score += 30
            factors.append({"factor": "BMI ≥35 (Obesity Class II+)", "impact": "Very High", "points": 30})
        elif bmi >= 30:
            risk_score += 20
            factors.append({"factor": "BMI 30-34.9 (Obesity Class I)", "impact": "High", "points": 20})
        elif bmi >= 25:
            risk_score += 10
            factors.append({"factor": "BMI 25-29.9 (Overweight)", "impact": "Moderate", "points": 10})
        
        # Blood Pressure factor (0-20 points)
        if systolic_bp >= 140 or diastolic_bp >= 90:
            risk_score += 20
            factors.append({"factor": "High Blood Pressure (≥140/90)", "impact": "High", "points": 20})
        elif systolic_bp >= 130 or diastolic_bp >= 80:
            risk_score += 10
            factors.append({"factor": "Elevated Blood Pressure (130-139/80-89)", "impact": "Moderate", "points": 10})
        
        # Blood Sugar factor (0-25 points)
        if blood_sugar >= 126:
            risk_score += 25
            factors.append({"factor": "Fasting Glucose ≥126 mg/dL", "impact": "Very High", "points": 25})
        elif blood_sugar >= 100:
            risk_score += 15
            factors.append({"factor": "Prediabetic Range (100-125 mg/dL)", "impact": "High", "points": 15})
        
        # Lifestyle factor (0-15 points)
        if lifestyle.lower() == "sedentary":
            risk_score += 15
            factors.append({"factor": "Sedentary Lifestyle", "impact": "Moderate", "points": 15})
        
        # Convert to percentage (max possible score is 115)
        risk_percentage = min(round((risk_score / 115) * 100, 1), 95)
        
        return {
            "risk_percentage": risk_percentage,
            "risk_score": risk_score,
            "factors": factors,
            "recommendations": RiskCalculator.get_recommendations(risk_percentage, factors)
        }
    
    @staticmethod
    def get_recommendations(risk_percentage, factors):
        """Generate recommendations based on risk level and factors."""
        recommendations = {
            "tests": [],
            "lifestyle": [],
            "followup": []
        }
        
        if risk_percentage >= 50:
            recommendations["tests"] = [
                "HbA1c test (every 3 months)",
                "Comprehensive metabolic panel",
                "Lipid profile",
                "Microalbumin test"
            ]
            recommendations["followup"] = ["Schedule appointment with endocrinologist", "Monthly monitoring visits"]
        elif risk_percentage >= 25:
            recommendations["tests"] = [
                "HbA1c test (every 6 months)",
                "Fasting glucose test",
                "Annual comprehensive physical"
            ]
            recommendations["followup"] = ["Quarterly check-ups", "Annual diabetes screening"]
        else:
            recommendations["tests"] = [
                "Annual fasting glucose test",
                "Regular blood pressure monitoring"
            ]
            recommendations["followup"] = ["Annual physical examination"]
        
        # Lifestyle recommendations based on factors
        factor_types = [f["factor"].lower() for f in factors]
        
        if any("bmi" in f for f in factor_types):
            recommendations["lifestyle"].append("Weight management program")
            recommendations["lifestyle"].append("Nutritionist consultation")
        
        if any("blood pressure" in f for f in factor_types):
            recommendations["lifestyle"].append("Reduce sodium intake (<2300mg/day)")
            recommendations["lifestyle"].append("DASH diet implementation")
        
        if any("sedentary" in f for f in factor_types):
            recommendations["lifestyle"].append("150 minutes moderate exercise/week")
            recommendations["lifestyle"].append("Daily 30-minute walks")
        
        if any("glucose" in f for f in factor_types):
            recommendations["lifestyle"].append("Low glycemic index diet")
            recommendations["lifestyle"].append("Carbohydrate counting education")
        
        return recommendations

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/calculate_risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()
        
        # Extract and validate input data
        age = int(data.get('age', 0))
        bmi = float(data.get('bmi', 0))
        systolic_bp = int(data.get('systolic_bp', 0))
        diastolic_bp = int(data.get('diastolic_bp', 0))
        blood_sugar = int(data.get('blood_sugar', 0))
        lifestyle = data.get('lifestyle', 'active')
        
        # Calculate risk
        result = RiskCalculator.calculate_diabetes_risk(
            age, bmi, systolic_bp, diastolic_bp, blood_sugar, lifestyle
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/results', methods=['POST'])
def results():
    data = request.form

    age = int(data.get('age'))
    bmi = float(data.get('bmi'))
    systolic_bp = int(data.get('systolic_bp'))
    diastolic_bp = int(data.get('diastolic_bp'))
    blood_sugar = int(data.get('blood_sugar'))
    lifestyle = data.get('lifestyle')

    result = RiskCalculator.calculate_diabetes_risk(
        age, bmi, systolic_bp, diastolic_bp, blood_sugar, lifestyle
    )

    return render_template('results.html', result=result)

if __name__ == '__main__':
    app.run(debug=True)
