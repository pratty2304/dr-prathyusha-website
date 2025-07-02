// Second Opinion Form JavaScript - Simple WhatsApp Integration

document.addEventListener('DOMContentLoaded', function() {
    let uploadedFiles = [];

    // Doctor's email for receiving second opinion requests
    const DOCTOR_EMAIL = 'prathyusha23@gmail.com';

    // Check if payment was successful (redirect from Instamojo)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        // Payment was successful, automatically submit the form
        paymentSuccess = true;
        const payBtn = document.getElementById('payBtn');
        const submitBtn = document.querySelector('.submit-btn');
        if (payBtn && submitBtn) {
            payBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Show success message
            showNotification('Payment successful! Submitting your request...', 'success');
            
            // Retrieve stored form data and submit
            const storedData = sessionStorage.getItem('secondOpinionFormData');
            if (storedData) {
                try {
                    const formData = JSON.parse(storedData);
                    console.log('Retrieved stored form data:', formData);
                    
                    // Submit the stored data directly
                    setTimeout(() => {
                        submitStoredFormData(formData);
                    }, 1000);
                } catch (error) {
                    console.error('Error parsing stored form data:', error);
                    // Fallback to regular form submission
                    setTimeout(() => {
                        form.dispatchEvent(new Event('submit'));
                    }, 1000);
                }
            } else {
                // Fallback to regular form submission
                setTimeout(() => {
                    form.dispatchEvent(new Event('submit'));
                }, 1000);
            }
        }
    }

    // Form elements
    const form = document.getElementById('secondOpinionForm');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileList = document.getElementById('fileList');
    const successMessage = document.getElementById('successMessage');

    // Instamojo payment integration
    const payBtn = document.getElementById('payBtn');
    const submitBtn = form.querySelector('.submit-btn');
    let paymentSuccess = false;

    // File upload event listeners
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        fileInput.click();
    });
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // File selection handler
    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        processFiles(files);
    }

    // Drag and drop handlers
    function handleDragOver(event) {
        event.preventDefault();
        uploadZone.classList.add('dragover');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        uploadZone.classList.remove('dragover');
    }

    function handleDrop(event) {
        event.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = Array.from(event.dataTransfer.files);
        processFiles(files);
    }

    // Process uploaded files
    function processFiles(files) {
        files.forEach((file, index) => {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                return;
            }

            // Check for duplicates
            const isDuplicate = uploadedFiles.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );
            
            if (!isDuplicate) {
                const fileData = {
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    id: `file_${Date.now()}_${index}`
                };
                uploadedFiles.push(fileData);
            }
        });

        displayFiles();
        fileInput.value = '';
    }

    // Display uploaded files
    function displayFiles() {
        if (uploadedFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }

        fileList.innerHTML = uploadedFiles.map(fileData => `
            <div class="file-item" data-file-id="${fileData.id}">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas ${getFileIcon(fileData.type)}"></i>
                    </div>
                    <div class="file-details">
                        <h5>${fileData.name}</h5>
                        <p>${formatFileSize(fileData.size)}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button type="button" onclick="removeFile('${fileData.id}')" title="Remove file">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Remove file
    window.removeFile = function(fileId) {
        uploadedFiles = uploadedFiles.filter(fileData => fileData.id != fileId);
        displayFiles();
    };

    // Get file icon
    function getFileIcon(fileType) {
        if (fileType === 'application/pdf') {
            return 'fa-file-pdf';
        } else if (fileType && fileType.includes('image')) {
            return 'fa-file-image';
        }
        return 'fa-file';
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Submit stored form data after payment
    async function submitStoredFormData(storedFormData) {
        try {
            console.log('Submitting stored form data:', storedFormData);
            
            // Create a FormData object with the stored patient data
            const formData = new FormData();
            formData.append('fullName', storedFormData.patientData.name);
            formData.append('age', storedFormData.patientData.age);
            formData.append('sex', storedFormData.patientData.sex);
            formData.append('phone', storedFormData.patientData.phone);
            formData.append('email', storedFormData.patientData.email);
            formData.append('concernDescription', storedFormData.patientData.concern);
            
            // Add files from uploadedFiles array (they should still be available)
            uploadedFiles.forEach((fileData, index) => {
                formData.append('medicalReports', fileData.file);
            });
            
            // Send the form data to the server
            const response = await fetch('/api/second-opinion', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Form submitted successfully:', result);
            
            // Show success message
            form.style.display = 'none';
            successMessage.innerHTML = `
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Payment Successful & Request Submitted!</h2>
                    <div class="success-message-content">
                        <p><strong>✅ Payment Confirmed:</strong> Your payment of ₹1,999 has been successfully processed.</p>
                        <p><strong>📋 Request Received:</strong> Your second opinion request with ${uploadedFiles.length} medical report(s) has been submitted to Dr Prathyusha.</p>
                        <p><strong>📧 Response Details:</strong> Dr Prathyusha will review your medical reports and provide her expert opinion within 24-48 hours.</p>
                        <p><strong>📱 Contact Methods:</strong> You will receive her detailed response via:</p>
                        <ul style="text-align: left; margin: 20px 0; padding-left: 20px;">
                            <li><strong>Email:</strong> ${storedFormData.patientData.email}</li>
                            <li><strong>WhatsApp:</strong> ${storedFormData.patientData.phone}</li>
                        </ul>
                        <p><strong>🆔 Reference ID:</strong> ${generateSubmissionId()}</p>
                        <p style="font-style: italic; color: #666; margin-top: 20px;">Please keep this reference ID for any future correspondence regarding your consultation.</p>
                    </div>
                    <div class="success-actions">
                        <a href="index.html" class="btn btn-secondary">Return to Home</a>
                    </div>
                </div>
            `;
            successMessage.style.display = 'block';
            
            // Clear stored data
            sessionStorage.removeItem('secondOpinionFormData');
            uploadedFiles = [];
            displayFiles();
            
        } catch (error) {
            console.error('Error submitting stored form data:', error);
            alert('There was an error submitting your request. Please contact support.');
            
            // Reset button state
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Second Opinion Request';
                submitBtn.disabled = false;
            }
        }
    }

    // Handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const patientData = {
            name: formData.get('fullName'),
            age: formData.get('age'),
            sex: formData.get('sex'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            concern: formData.get('concernDescription')
        };

        // Validate required fields
        if (!patientData.name || !patientData.phone || !patientData.concern) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            console.log('Submitting form with data:', patientData);
            console.log('Files to upload:', uploadedFiles.length);

            // Send email notification
            await sendEmailNotification(patientData, uploadedFiles);

            // Show success message
            form.style.display = 'none';
            successMessage.innerHTML = `
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Request Submitted Successfully!</h2>
                    <div class="success-message-content">
                        <p><strong>📋 Request Received:</strong> Your second opinion request with ${uploadedFiles.length} medical report(s) has been submitted to Dr Prathyusha.</p>
                        <p><strong>📧 Response Details:</strong> Dr Prathyusha will review your medical reports and provide her expert opinion within 24-48 hours.</p>
                        <p><strong>📱 Contact Methods:</strong> You will receive her detailed response via:</p>
                        <ul style="text-align: left; margin: 20px 0; padding-left: 20px;">
                            <li><strong>Email:</strong> ${patientData.email}</li>
                            <li><strong>WhatsApp:</strong> ${patientData.phone}</li>
                        </ul>
                        <p><strong>🆔 Reference ID:</strong> ${generateSubmissionId()}</p>
                        <p style="font-style: italic; color: #666; margin-top: 20px;">Please keep this reference ID for any future correspondence regarding your consultation.</p>
                    </div>
                    <div class="success-actions">
                        <a href="index.html" class="btn btn-secondary">Return to Home</a>
                    </div>
                </div>
            `;
            successMessage.style.display = 'block';

            // Clear form data
            uploadedFiles = [];
            displayFiles();

        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Provide more detailed error information
            let errorMessage = 'There was an error submitting your request. ';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Please make sure the server is running on http://localhost:8082. ';
                errorMessage += 'If you opened this page directly as a file, please access it through the server instead.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage += 'Server error: ' + error.message;
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Send email notification to doctor
    async function sendEmailNotification(patientData, files) {
        // Prepare form data for email service
        const formData = new FormData();
        
        // Add patient data in the format the server expects
        formData.append('fullName', patientData.name);
        formData.append('phone', patientData.phone);
        formData.append('email', patientData.email);
        formData.append('age', patientData.age);
        formData.append('sex', patientData.sex);
        formData.append('concernDescription', patientData.concern);
        
        // Add files with the correct field name
        files.forEach((fileData, index) => {
            formData.append('medicalReports', fileData.file);
        });
        
        try {
            console.log('Sending request to server...');
            console.log('Server URL:', window.location.origin + '/api/second-opinion');
            
            // Send email via backend service
            const response = await fetch('/api/second-opinion', {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Email sent successfully:', result);
            return result;
            
        } catch (error) {
            console.error('Error sending email:', error);
            
            // For development, log what would be sent
            console.log('Email that would be sent:', {
                fullName: patientData.name,
                phone: patientData.phone,
                email: patientData.email,
                age: patientData.age,
                sex: patientData.sex,
                concernDescription: patientData.concern,
                files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
            });
            
            // Check if it's a network error
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Unable to connect to the server. Please make sure the server is running on http://localhost:8082');
            }
            
            throw error;
        }
    }

    // Format email message
    function formatEmailMessage(patientData, files) {
        let message = `New Second Opinion Request\n\n`;
        message += `Patient Details:\n`;
        message += `• Name: ${patientData.name}\n`;
        message += `• Age: ${patientData.age}\n`;
        message += `• Sex: ${patientData.sex}\n`;
        message += `• Phone: ${patientData.phone}\n`;
        message += `• Email: ${patientData.email}\n\n`;
        message += `Medical Concern:\n${patientData.concern}\n\n`;
        
        if (files.length > 0) {
            message += `Uploaded Files (${files.length}):\n`;
            files.forEach((file, index) => {
                message += `${index + 1}. ${file.name} (${formatFileSize(file.size)})\n`;
            });
            message += `\n`;
        }
        
        message += `Submitted: ${new Date().toLocaleString()}\n`;
        message += `Submission ID: ${generateSubmissionId()}`;
        
        return message;
    }

    // Generate submission ID
    function generateSubmissionId() {
        return 'SO-' + Date.now().toString(36).toUpperCase();
    }

    // Instamojo payment integration
    payBtn.addEventListener('click', async function() {
        // Validate required fields before payment
        const formData = new FormData(form);
        const patientData = {
            name: formData.get('fullName'),
            age: formData.get('age'),
            sex: formData.get('sex'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            concern: formData.get('concernDescription')
        };
        const termsCheckbox = document.getElementById('termsCheckbox');
        if (!termsCheckbox.checked) {
            alert('You must agree to the terms and conditions before proceeding to payment.');
            return;
        }
        if (!patientData.name || !patientData.phone || !patientData.concern) {
            alert('Please fill in all required fields.');
            return;
        }
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        payBtn.disabled = true;
        try {
            // Store form data and files temporarily
            const formDataToStore = {
                patientData: patientData,
                files: uploadedFiles.map(fileData => ({
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type
                }))
            };
            
            // Store in sessionStorage for retrieval after payment
            sessionStorage.setItem('secondOpinionFormData', JSON.stringify(formDataToStore));
            
            // Create Instamojo payment request
            const res = await fetch('/api/create-instamojo-payment-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: patientData.name,
                    email: patientData.email,
                    phone: patientData.phone
                })
            });
            const data = await res.json();
            if (!data.paymentUrl) throw new Error('Payment request creation failed');
            
            // Redirect to Instamojo payment page
            window.location.href = data.paymentUrl;
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed to start. Please try again.');
            payBtn.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Payment';
            payBtn.disabled = false;
        }
    });

    // Block form submission until payment is successful
    form.addEventListener('submit', function(event) {
        if (!paymentSuccess) {
            event.preventDefault();
            alert('Please complete payment before submitting the form.');
            return false;
        }
    }, true);

    // Notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#34C759' : type === 'error' ? '#FF3B30' : '#007AFF'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: inherit;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
}); 