document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('videoConsultationForm');
    const successMessage = document.getElementById('successMessage');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Set minimum date to today
    const dateInput = document.getElementById('consultationDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(form);
            const consultationData = {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                age: formData.get('age'),
                sex: formData.get('sex'),
                consultationDate: formData.get('consultationDate'),
                consultationTime: formData.get('consultationTime'),
                consultationType: formData.get('consultationType'),
                medicalConcern: formData.get('medicalConcern'),
                termsAccepted: formData.get('termsAccepted') === 'on',
                consentGiven: formData.get('consentGiven') === 'on',
                timestamp: new Date().toISOString()
            };

            // Send to server
            const response = await fetch('/api/video-consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(consultationData)
            });

            if (response.ok) {
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Show notification
                showNotification('Video consultation booked successfully!', 'success');
            } else {
                throw new Error('Failed to book consultation');
            }

        } catch (error) {
            console.error('Error booking consultation:', error);
            showNotification('Failed to book consultation. Please try again.', 'error');
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Form validation
    function validateForm() {
        const requiredFields = [
            'fullName', 'phone', 'email', 'age', 'sex',
            'consultationDate', 'consultationTime', 'consultationType', 'medicalConcern'
        ];

        let isValid = true;

        // Check required fields
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field) return; // Skip if field doesn't exist
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });

        // Check checkboxes
        const termsAccepted = document.getElementById('termsAccepted');
        const consentGiven = document.getElementById('consentGiven');
        
        if (!termsAccepted.checked) {
            showFieldError(termsAccepted, 'You must accept the terms and conditions');
            isValid = false;
        } else {
            clearFieldError(termsAccepted);
        }

        if (!consentGiven.checked) {
            showFieldError(consentGiven, 'You must give consent for video consultation');
            isValid = false;
        } else {
            clearFieldError(consentGiven);
        }

        // Validate email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value && !emailRegex.test(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone
        const phone = document.getElementById('phone');
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (phone.value && !phoneRegex.test(phone.value.replace(/\s/g, ''))) {
            showFieldError(phone, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate age
        const age = document.getElementById('age');
        if (age.value && (age.value < 1 || age.value > 120)) {
            showFieldError(age, 'Please enter a valid age between 1 and 120');
            isValid = false;
        }

        // Validate date (not in the past)
        const consultationDate = document.getElementById('consultationDate');
        if (consultationDate.value) {
            const selectedDate = new Date(consultationDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError(consultationDate, 'Please select a future date');
                isValid = false;
            }
        }

        return isValid;
    }

    // Show field error
    function showFieldError(field, message) {
        clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF3B30';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#FF3B30';
    }

    // Clear field error
    function clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    function validateField(field) {
        const fieldName = field.name;
        
        switch (fieldName) {
            case 'email':
                if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    showFieldError(field, 'Please enter a valid email address');
                } else {
                    clearFieldError(field);
                }
                break;
                
            case 'phone':
                if (field.value && !/^[\+]?[1-9][\d]{0,15}$/.test(field.value.replace(/\s/g, ''))) {
                    showFieldError(field, 'Please enter a valid phone number');
                } else {
                    clearFieldError(field);
                }
                break;
                
            case 'age':
                if (field.value && (field.value < 1 || field.value > 120)) {
                    showFieldError(field, 'Please enter a valid age between 1 and 120');
                } else {
                    clearFieldError(field);
                }
                break;
                
            case 'consultationDate':
                if (field.value) {
                    const selectedDate = new Date(field.value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        showFieldError(field, 'Please select a future date');
                    } else {
                        clearFieldError(field);
                    }
                }
                break;
        }
    }

    // Sticky header shadow on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}); 