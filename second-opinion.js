// Second Opinion Form JavaScript - Simple WhatsApp Integration

document.addEventListener('DOMContentLoaded', function() {
    let uploadedFiles = [];

    // Doctor's email for receiving second opinion requests
    const DOCTOR_EMAIL = 'prathyusha23@gmail.com';

    // Form elements
    const form = document.getElementById('secondOpinionForm');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileList = document.getElementById('fileList');
    const successMessage = document.getElementById('successMessage');

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
        const submitBtn = form.querySelector('.submit-btn');
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
                    <h2>Thank You!</h2>
                    <p>Your second opinion request has been successfully submitted.</p>
                    <p><strong>Dr Prathyusha will review your medical reports and provide her expert opinion.</strong></p>
                    <p>You will receive her response directly via WhatsApp within 24-48 hours.</p>
                    <div class="submission-details">
                        <p><strong>Submission ID:</strong> ${generateSubmissionId()}</p>
                        <p><strong>Files uploaded:</strong> ${uploadedFiles.length}</p>
                        <p><strong>Contact method:</strong> Email to ${patientData.email}</p>
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
}); 