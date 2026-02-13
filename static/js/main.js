// Risk Calculator Application
class RiskCalculator {
    constructor() {
        this.form = document.getElementById('risk-form');
        this.resultsContainer = document.getElementById('results-container');
        this.loadingOverlay = document.getElementById('loading');
        this.clinicianView = document.getElementById('clinician-view');
        this.patientView = document.getElementById('patient-view');
        this.clinicianBtn = document.getElementById('clinician-view-btn');
        this.patientBtn = document.getElementById('patient-view-btn');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        if (this.clinicianBtn) {
            this.clinicianBtn.addEventListener('click', () => this.showView('clinician'));
        }
        
        if (this.patientBtn) {
            this.patientBtn.addEventListener('click', () => this.showView('patient'));
        }
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Show loading overlay
        this.showLoading();
        
        // Gather form data
        const formData = new FormData(this.form);
        const data = {
            age: parseInt(formData.get('age')),
            bmi: parseFloat(formData.get('bmi')),
            systolic_bp: parseInt(formData.get('systolic_bp')),
            diastolic_bp: parseInt(formData.get('diastolic_bp')),
            blood_sugar: parseInt(formData.get('blood_sugar')),
            lifestyle: formData.get('lifestyle')
        };
        
        try {
            const response = await fetch('/calculate_risk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            this.displayResults(result);
            
        } catch (error) {
            console.error('Error calculating risk:', error);
            alert('An error occurred while calculating the risk. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    displayResults(result) {
        // Update risk percentage
        const riskPercentageElement = document.getElementById('risk-percentage');
        if (riskPercentageElement) {
            riskPercentageElement.textContent = result.risk_percentage;
            
            // Color code risk level
            const riskScore = result.risk_percentage;
            if (riskScore >= 50) {
                riskPercentageElement.style.color = '#dc2626'; // High risk - red
            } else if (riskScore >= 25) {
                riskPercentageElement.style.color = '#d97706'; // Medium risk - orange
            } else {
                riskPercentageElement.style.color = '#059669'; // Low risk - green
            }
        }
        
        // Display contributing factors
        this.displayFactors(result.factors);
        
        // Display recommendations
        this.displayRecommendations(result.recommendations);
        
        // Setup patient view
        this.setupPatientView(result);
        
        // Show results container
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    displayFactors(factors) {
        const factorsList = document.getElementById('factors-list');
        if (!factorsList) return;
        
        factorsList.innerHTML = '';
        
        factors.forEach(factor => {
            const factorElement = document.createElement('div');
            factorElement.className = 'factor-item';
            factorElement.innerHTML = `
                <div>
                    <strong>${factor.factor}</strong>
                    <div style="font-size: 0.9rem; color: #64748b;">+${factor.points} points</div>
                </div>
                <span class="factor-impact impact-${factor.impact.toLowerCase().replace(' ', '-')}">
                    ${factor.impact} Impact
                </span>
            `;
            factorsList.appendChild(factorElement);
        });
    }
    
    displayRecommendations(recommendations) {
        // Tests
        const testsList = document.getElementById('tests-list');
        if (testsList) {
            testsList.innerHTML = '';
            recommendations.tests.forEach(test => {
                const li = document.createElement('li');
                li.textContent = test;
                testsList.appendChild(li);
            });
        }
        
        // Lifestyle
        const lifestyleList = document.getElementById('lifestyle-list');
        if (lifestyleList) {
            lifestyleList.innerHTML = '';
            recommendations.lifestyle.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                lifestyleList.appendChild(li);
            });
        }
        
        // Follow-up
        const followupList = document.getElementById('followup-list');
        if (followupList) {
            followupList.innerHTML = '';
            recommendations.followup.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                followupList.appendChild(li);
            });
        }
    }
    
    setupPatientView(result) {
        // Create risk gauge chart
        this.createRiskGauge(result.risk_percentage);
        
        // Patient explanation
        const explanationElement = document.getElementById('patient-explanation');
        if (explanationElement) {
            explanationElement.innerHTML = this.generatePatientExplanation(result);
        }
        
        // Patient actions
        const actionsElement = document.getElementById('patient-actions');
        if (actionsElement) {
            actionsElement.innerHTML = this.generatePatientActions(result.recommendations);
        }
    }
    
    createRiskGauge(riskPercentage) {
        const canvas = document.getElementById('risk-gauge');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear previous chart if exists
        if (window.riskChart) {
            window.riskChart.destroy();
        }
        
        window.riskChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Risk Level', 'Remaining'],
                datasets: [{
                    data: [riskPercentage, 100 - riskPercentage],
                    backgroundColor: [
                        riskPercentage >= 50 ? '#dc2626' : riskPercentage >= 25 ? '#d97706' : '#059669',
                        '#e5e7eb'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            plugins: [{
                beforeDraw: function(chart) {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    
                    ctx.restore();
                    const fontSize = (height / 100).toFixed(2);
                    ctx.font = fontSize + "em Inter";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#1e293b";
                    
                    const text = riskPercentage + "%";
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2;
                    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    }
    
    generatePatientExplanation(result) {
        const riskLevel = result.risk_percentage >= 50 ? 'high' : 
                         result.risk_percentage >= 25 ? 'moderate' : 'low';
        
        let explanation = `<h4>Your diabetes risk level is ${riskLevel} (${result.risk_percentage}%)</h4>`;
        
        if (riskLevel === 'high') {
            explanation += `
                <p>This means you have a higher chance of developing diabetes. However, this doesn't mean you will definitely get diabetes. Many factors contribute to this risk, and there are things you can do to lower it.</p>
            `;
        } else if (riskLevel === 'moderate') {
            explanation += `
                <p>Your risk is in the moderate range. This is a good time to take preventive action to keep your risk from increasing and potentially lower it further.</p>
            `;
        } else {
            explanation += `
                <p>Your current risk is low, which is great! Continue with healthy habits to maintain this low risk level.</p>
            `;
        }
        
        if (result.factors.length > 0) {
            explanation += `<p><strong>The main factors contributing to your risk are:</strong></p><ul>`;
            result.factors.forEach(factor => {
                explanation += `<li>${factor.factor}</li>`;
            });
            explanation += `</ul>`;
        }
        
        return explanation;
    }
    
    generatePatientActions(recommendations) {
        let actions = '';
        
        if (recommendations.lifestyle.length > 0) {
            actions += '<div class="patient-action">';
            actions += '<h4>🏃 Lifestyle Changes</h4>';
            actions += '<ul>';
            recommendations.lifestyle.forEach(item => {
                actions += `<li>${item}</li>`;
            });
            actions += '</ul></div>';
        }
        
        if (recommendations.tests.length > 0) {
            actions += '<div class="patient-action">';
            actions += '<h4>🔬 Recommended Health Screenings</h4>';
            actions += '<ul>';
            recommendations.tests.forEach(item => {
                actions += `<li>${item}</li>`;
            });
            actions += '</ul></div>';
        }
        
        if (recommendations.followup.length > 0) {
            actions += '<div class="patient-action">';
            actions += '<h4>📅 Follow-up Care</h4>';
            actions += '<ul>';
            recommendations.followup.forEach(item => {
                actions += `<li>${item}</li>`;
            });
            actions += '</ul></div>';
        }
        
        return actions;
    }
    
    showView(viewType) {
        if (viewType === 'clinician') {
            this.clinicianView.style.display = 'block';
            this.patientView.style.display = 'none';
            this.clinicianBtn.classList.add('active');
            this.patientBtn.classList.remove('active');
        } else {
            this.clinicianView.style.display = 'none';
            this.patientView.style.display = 'block';
            this.clinicianBtn.classList.remove('active');
            this.patientBtn.classList.add('active');
        }
    }
    
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
}

// Form validation helpers
class FormValidator {
    static validateAge(age) {
        return age >= 18 && age <= 120;
    }
    
    static validateBMI(bmi) {
        return bmi >= 15 && bmi <= 50;
    }
    
    static validateBloodPressure(systolic, diastolic) {
        return systolic >= 80 && systolic <= 200 && 
               diastolic >= 40 && diastolic <= 120 &&
               systolic > diastolic;
    }
    
    static validateBloodSugar(bloodSugar) {
        return bloodSugar >= 60 && bloodSugar <= 300;
    }
}

// BMI Calculator utility
class BMICalculator {
    static calculateBMI(weight, height) {
        // weight in kg, height in meters
        return weight / (height * height);
    }
    
    static getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        if (bmi < 35) return 'Obesity Class I';
        if (bmi < 40) return 'Obesity Class II';
        return 'Obesity Class III';
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize risk calculator if on calculator page
    if (document.getElementById('risk-form')) {
        new RiskCalculator();
    }
    
    // Add form validation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

function validateInput(input) {
    const value = parseFloat(input.value);
    const name = input.name;
    let isValid = true;
    
    switch (name) {
        case 'age':
            isValid = FormValidator.validateAge(value);
            break;
        case 'bmi':
            isValid = FormValidator.validateBMI(value);
            break;
        case 'blood_sugar':
            isValid = FormValidator.validateBloodSugar(value);
            break;
    }
    
    if (!isValid) {
        input.style.borderColor = '#dc2626';
        showFieldError(input, 'Please enter a valid value');
    } else {
        input.style.borderColor = '#e5e7eb';
        clearFieldError(input);
    }
}

function showFieldError(input, message) {
    clearFieldError(input);
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#dc2626';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    input.parentNode.appendChild(errorElement);
}

function clearFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}
