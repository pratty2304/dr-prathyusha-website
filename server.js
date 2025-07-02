const express = require('express');
const multer = require('multer');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = 8082;

// --- IMPORTANT ---
// Replace 'YOUR_API_KEY' with the actual API key you get from resend.com
const resend = new Resend('re_BVrwasYQ_6d6wck57CcdiwemT9qpZ4xaq');



// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use(express.static('.'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/second-opinion', (req, res) => {
    res.sendFile(path.join(__dirname, 'second-opinion.html'));
});

app.get('/video-consultation', (req, res) => {
    res.sendFile(path.join(__dirname, 'video-consultation.html'));
});

app.get('/test-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-form.html'));
});

// API endpoint for second opinion form submission
app.post('/api/second-opinion', upload.array('medicalReports'), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files || [];

        const submissionId = `SO-${Date.now().toString(36).toUpperCase()}`;
        const submissionDate = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

        // Format patient data for email
        let emailContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background: #4A90E2; color: white; padding: 20px; text-align: center;">
        <h1>🏥 New Second Opinion Request</h1>
    </div>
    
    <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 10px;">👤 Patient Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">${formData.fullName}</td></tr>
            <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Age:</td><td style="padding: 10px;">${formData.age}</td></tr>
            <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Sex:</td><td style="padding: 10px;">${formData.sex}</td></tr>
            <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Phone:</td><td style="padding: 10px;">${formData.phone}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">${formData.email}</td></tr>
        </table>
    </div>
    
    <div style="padding: 20px;">
        <h2 style="color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 10px;">🩺 Medical Concern</h2>
        <div style="padding: 15px; background: #fdfdff; border-left: 4px solid #4A90E2; margin-top: 10px;">
            <p style="white-space: pre-wrap; line-height: 1.6;">${formData.concernDescription}</p>
        </div>
    </div>
`;

        // Add attachments section if files exist
        if (files.length > 0) {
            emailContent += `
    <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 10px;">📎 Attached Files</h2>
        <ul style="list-style-type: none; padding: 0;">`;
    
            files.forEach(file => {
                emailContent += `<li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">${file.originalname} (${formatFileSize(file.size)})</li>`;
            });

            emailContent += `
        </ul>
    </div>`;
        }

        // Add footer
        emailContent += `
    <div style="padding: 20px; text-align: center; background: #f0f0f0; color: #555;">
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Submitted:</strong> ${submissionDate}</p>
    </div>
    <div style="padding: 15px; text-align: center; color: #888; font-size: 12px; background: #f9f9f9;">
        <p>This email was sent from the Second Opinion Request System.</p>
    </div>
</div>
`;

        // Prepare attachments for Resend
        let attachments = [];
        if (files.length > 0) {
            for (const file of files) {
                try {
                    const fileContent = fs.readFileSync(file.path);
                    const base64Content = fileContent.toString('base64');
                    
                    attachments.push({
                        filename: file.originalname,
                        content: base64Content
                    });
                } catch (fileError) {
                    console.error('Error reading file:', file.originalname, fileError);
                }
            }
        }

        // Send email to Dr Prathyusha with attachments
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['prathyusha23@gmail.com'],
            subject: `New Second Opinion Request - ${formData.fullName}`,
            html: emailContent,
            attachments: attachments
        });

        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send email', details: error });
        }

        console.log('Email sent successfully:', data);

        // Clean up uploaded files after sending email
        files.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });

        res.json({ success: true, message: 'Second opinion request submitted successfully' });

    } catch (error) {
        console.error('Error processing second opinion request:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// API endpoint for video consultation booking
app.post('/api/video-consultation', async (req, res) => {
    try {
        const consultationData = req.body;

        // Format consultation data for email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #007AFF; color: white; padding: 20px; text-align: center;">
                    <h1>📹 New Video Consultation Booking</h1>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">👤 Patient Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">${consultationData.fullName}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Phone:</td><td style="padding: 10px;">${consultationData.phone}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">${consultationData.email}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Age:</td><td style="padding: 10px;">${consultationData.age}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold;">Sex:</td><td style="padding: 10px;">${consultationData.sex}</td></tr>
                    </table>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">📅 Consultation Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Date:</td><td style="padding: 10px;">${consultationData.consultationDate}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Time:</td><td style="padding: 10px;">${consultationData.consultationTime}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold;">Type:</td><td style="padding: 10px;">${consultationData.consultationType}</td></tr>
                    </table>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">🏥 Medical Concern</h2>
                    <div style="padding: 15px; background: #fdfdff; border-left: 4px solid #007AFF; margin-top: 10px;">
                        <p style="white-space: pre-wrap; line-height: 1.6;">${consultationData.medicalConcern}</p>
                    </div>
                </div>
                
                <div style="padding: 20px; background: #e8f1ff;">
                    <h2 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">📋 Next Steps</h2>
                    <ol style="line-height: 1.8;">
                        <li><strong>Create Google Meet Link:</strong> Go to <a href="https://meet.google.com" style="color: #007AFF;">meet.google.com</a> and create a new meeting</li>
                        <li><strong>Send Confirmation:</strong> Email the patient with the meeting link and instructions</li>
                        <li><strong>Join Meeting:</strong> Be ready 5 minutes before the scheduled time</li>
                        <li><strong>Conduct Consultation:</strong> Use screen sharing for any medical reports if needed</li>
                    </ol>
                </div>
                
                <div style="padding: 20px; text-align: center; background: #f9f9f9; color: #555;">
                    <p><strong>Booking Time:</strong> ${new Date(consultationData.timestamp).toLocaleString()}</p>
                    <p><strong>Terms Accepted:</strong> ${consultationData.termsAccepted ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Consent Given:</strong> ${consultationData.consentGiven ? '✅ Yes' : '❌ No'}</p>
                </div>
                
                <div style="padding: 15px; text-align: center; color: #888; font-size: 12px; background: #f9f9f9;">
                    <p>This consultation request was submitted through your website.</p>
                </div>
            </div>
        `;

        // Send email to Dr Prathyusha
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['prathyusha23@gmail.com'],
            subject: `New Video Consultation Booking - ${consultationData.fullName} on ${consultationData.consultationDate} at ${consultationData.consultationTime}`,
            html: emailContent
        });

        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send email' });
        }

        res.json({ success: true, message: 'Video consultation booked successfully' });

    } catch (error) {
        console.error('Error processing video consultation booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for appointment scheduling
app.post('/api/appointment', async (req, res) => {
    try {
        const appointmentData = req.body;
        console.log('Received appointment data:', appointmentData);
        
        const submissionId = `AP-${Date.now().toString(36).toUpperCase()}`;
        const submissionDate = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

        // Get hospital details based on selection
        let hospitalDetails = '';
        if (appointmentData.hospital === 'rr-nagar') {
            hospitalDetails = 'Sparsh Hospital, RR Nagar (080676 66766) - Monday to Saturday: 10:00 AM - 2:00 PM';
        } else if (appointmentData.hospital === 'infantry-road') {
            hospitalDetails = 'Sparsh Hospital, Infantry Road (080 6122 2000) - Monday to Saturday: 3:00 PM - 4:00 PM';
        }

        // Format appointment data for email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #34C759; color: white; padding: 20px; text-align: center;">
                    <h1>📅 New Appointment Request</h1>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #34C759; border-bottom: 2px solid #34C759; padding-bottom: 10px;">👤 Patient Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">${appointmentData.name}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Phone:</td><td style="padding: 10px;">${appointmentData.phone}</td></tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">${appointmentData.email}</td></tr>
                    </table>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #34C759; border-bottom: 2px solid #34C759; padding-bottom: 10px;">🏥 Preferred Hospital</h2>
                    <div style="padding: 15px; background: #f0f9f0; border-left: 4px solid #34C759; margin-top: 10px;">
                        <p style="font-weight: 600; margin: 0;">${hospitalDetails}</p>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #34C759; border-bottom: 2px solid #34C759; padding-bottom: 10px;">⏰ Preferred Time</h2>
                    <div style="padding: 15px; background: #f0f9f0; border-left: 4px solid #34C759; margin-top: 10px;">
                        <p style="font-weight: 600; margin: 0;">${appointmentData.appointmentTime}</p>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #34C759; border-bottom: 2px solid #34C759; padding-bottom: 10px;">🏥 Medical Concern</h2>
                    <div style="padding: 15px; background: #fdfdff; border-left: 4px solid #34C759; margin-top: 10px;">
                        <p style="white-space: pre-wrap; line-height: 1.6;">${appointmentData.message || 'No specific concern mentioned'}</p>
                    </div>
                </div>
                
                <div style="padding: 20px; background: #e8f8e8;">
                    <h2 style="color: #34C759; border-bottom: 2px solid #34C759; padding-bottom: 10px;">📋 Next Steps</h2>
                    <ol style="line-height: 1.8;">
                        <li><strong>Review Request:</strong> Check patient details and medical concern</li>
                        <li><strong>Contact Patient:</strong> Call or email to confirm appointment time</li>
                        <li><strong>Schedule Appointment:</strong> Book in your calendar system</li>
                        <li><strong>Send Confirmation:</strong> Email patient with appointment details</li>
                    </ol>
                </div>
                
                <div style="padding: 20px; text-align: center; background: #f9f9f9; color: #555;">
                    <p><strong>Submission ID:</strong> ${submissionId}</p>
                    <p><strong>Submitted:</strong> ${submissionDate}</p>
                </div>
                
                <div style="padding: 15px; text-align: center; color: #888; font-size: 12px; background: #f9f9f9;">
                    <p>This appointment request was submitted through your website.</p>
                </div>
            </div>
        `;

        // Send email to Dr Prathyusha
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['prathyusha23@gmail.com'],
            subject: `New Appointment Request - ${appointmentData.name} at ${appointmentData.hospital === 'rr-nagar' ? 'RR Nagar' : 'Infantry Road'}`,
            html: emailContent
        });

        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send email', details: error });
        }

        console.log('Appointment email sent successfully:', data);

        res.json({ success: true, message: 'Appointment request submitted successfully' });

    } catch (error) {
        console.error('Error processing appointment request:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Resend Email Service' });
});

const reviewsFile = path.join(__dirname, 'reviews.json');

// Get all reviews
app.get('/api/reviews', (req, res) => {
    fs.readFile(reviewsFile, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.json([]); // No file yet
            return res.status(500).json({ error: 'Failed to read reviews' });
        }
        try {
            const reviews = JSON.parse(data);
            res.json(reviews);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse reviews' });
        }
    });
});

// Post a new review
app.post('/api/reviews', express.json(), (req, res) => {
    const { name, rating, review } = req.body;
    if (!name || !rating || !review) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newReview = {
        name,
        rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
        review,
        date: new Date().toISOString()
    };
    fs.readFile(reviewsFile, 'utf8', (err, data) => {
        let reviews = [];
        if (!err && data) {
            try { reviews = JSON.parse(data); } catch {}
        }
        reviews.unshift(newReview); // newest first
        fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Failed to save review' });
            res.json(newReview);
        });
    });
});





// Start server
app.listen(PORT, () => {
    console.log(`\n🏥 Email Server (using Resend) running on http://localhost:${PORT}`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`1. Make sure you have created a Resend API key.`);
    console.log(`2. Replace 'YOUR_API_KEY' in server.js with your actual key.`);
    console.log(`\n🚀 Server is ready to process requests.`);
}); 