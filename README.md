# Preventive Risk & Clinical Decision Support System

A prototype web application demonstrating AI-powered clinical decision support for diabetes risk assessment.

---

## Features

- **Risk Assessment**: Comprehensive diabetes risk calculation using clinical parameters  
- **Dual Views**: Separate interfaces for healthcare providers and patients  
- **Interactive Visualizations**: Charts and graphs for risk communication  
- **Responsive Design**: Works on desktop, tablet, and mobile devices  
- **Real-time Calculations**: Instant risk assessment and recommendations  

---

## Technology Stack

### Backend
- **Python 3.8+**
- **Flask** (Web framework)
- **JSON** (Data exchange format)

### Frontend  
- **HTML5 / CSS3**
- **JavaScript (ES6+)**
- **Chart.js** (Data visualization)
- **Inter Font**

### Architecture
- **RESTful API** (Clear frontend-backend separation)
- **Responsive Design** (Mobile-first approach)
- **Progressive Enhancement**

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Acod01-hub/preventive-risk-cds.git
cd preventive-risk-cds
```

---

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment:

**Linux / Mac**
```bash
source venv/bin/activate
```

**Windows**
```bash
venv\Scripts\activate
```

---

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Step 4: Run the Application

```bash
python app.py
```

The app will run locally at:

```
http://127.0.0.1:5000/
```

---

## Usage

1. Navigate to the homepage.
2. Enter patient data in the Risk Calculator form.
3. View results in:
   - **Clinician View** (Technical explanation)
   - **Patient View** (Simplified explanation)
4. Explore charts and personalized recommendations.

---

## ML + GenAI Integration

- Risk scoring powered by ML prototype logic.
- GenAI generates:
  - Clinician explanations (technical reasoning)
  - Patient explanations (simplified communication)
  - Counterfactual scenarios  
    (e.g., *“What if BMI reduced?”*)

---

## Challenges Faced

- Handling uncertainty in risk predictions  
- Designing dual communication layers (Doctor vs Patient)  
- Ensuring fairness and minimizing bias  

---

## Business Feasibility

- Integrates into OPD / clinic workflows  
- Scalable to multiple chronic diseases  
- Potential partnerships with health-tech providers  

---

## Future Improvements

- Integration with real-world patient datasets  
- Longitudinal health tracking  
- Bias detection & AI safety guardrails  
- Cloud-based deployment (SaaS model)  

---
