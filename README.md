# Dr Prathyusha Eaga - Personal Website

A professional, responsive website for Dr Prathyusha Eaga, Consultant Medical Oncologist, featuring modern design and email-based second opinion service.

## Features

### Main Website
- **Professional Design**: Clean, modern interface with Apple-inspired aesthetics
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Complete Medical Information**: Qualifications, expertise, treatments, and contact details
- **Interactive Elements**: Smooth animations and hover effects

### Second Opinion Service
- **Simple Form Interface**: Easy-to-use form for patients to request second opinions
- **File Upload System**: Support for medical reports (PDF, JPG, PNG)
- **Drag & Drop**: Effortless file uploading with drag and drop functionality
- **Email Integration**: Automatic email notifications with patient details and file attachments
- **Form Validation**: Comprehensive client-side validation
- **Success Feedback**: Clear confirmation messages for patients

### Email Workflow
- **Instant Email Notifications**: Doctor receives formatted emails with patient details
- **File Attachments**: Medical reports attached directly to emails
- **Manual Review**: Doctor analyzes reports and responds via email
- **Direct Response**: Doctor sends analysis back to patient via email

## Technical Specifications

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Email Service**: Nodemailer with Gmail
- **File Handling**: Multer for file uploads
- **Styling**: Custom CSS with modern features (Grid, Flexbox, CSS Variables)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter (Google Fonts)
- **Animations**: CSS animations and transitions

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Features
- Optimized CSS and JavaScript
- Efficient file handling
- Responsive images
- Smooth animations with reduced motion support

## File Structure

```
personalwebsite/
├── index.html              # Main website homepage
├── second-opinion.html     # Second opinion request form
├── styles.css              # Main stylesheet
├── script.js               # Main website functionality
├── second-opinion.js       # Second opinion form with email integration
├── server.js               # Email server backend
├── package.json            # Node.js dependencies
├── favicon.svg             # Website favicon
└── README.md               # Project documentation
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Settings
Edit `server.js` and replace:
- `your-email@gmail.com` with your actual Gmail address (prathyusha23@gmail.com)
- `your-app-password` with your Gmail App Password

### 3. Get Gmail App Password
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Go to Security > App passwords
4. Generate an app password for this application
5. Use this password in `server.js`

### 4. Start the Server
```bash
npm start
```

### 5. Access the Website
Visit `http://localhost:8082` in your browser

## Usage Guide

### For Patients
1. **Browse Website**: Explore Dr Prathyusha's qualifications and services
2. **Request Second Opinion**: Navigate to the Second Opinion page
3. **Fill Form**: Complete personal information and medical concerns
4. **Upload Files**: Add medical reports using drag & drop or file picker
5. **Submit**: Receive confirmation and await expert analysis via email

### For Doctor
1. **Receive Email Notification**: Get formatted emails with patient details:
   ```
   Subject: 🏥 New Second Opinion Request - [Patient Name]
   
   👤 Patient Details:
   • Name: [Patient Name]
   • Age: [Age]
   • Sex: [Sex]
   • Phone: [Phone Number]
   • Email: [Email Address]
   
   🔍 Medical Concern:
   [Patient's detailed description]
   
   📎 Uploaded Files ([X]):
   1. Report1.pdf (2.5 MB) [attached]
   2. Scan2.jpg (1.8 MB) [attached]
   ...
   
   📅 Submitted: [Date and Time]
   🆔 ID: [Submission ID]
   ```
2. **Review Attachments**: Access uploaded medical files directly from email
3. **Analyze**: Review medical information and formulate opinion
4. **Respond via Email**: Send your expert analysis directly to patient's email

## Email Integration Setup

### Gmail Configuration
The system uses Gmail's SMTP service with the following setup:
- **Service**: Gmail SMTP
- **Security**: App Password authentication
- **Attachments**: Medical files sent as email attachments
- **Format**: Professional HTML email template

### Email Features
- **HTML Template**: Professional, branded email layout
- **File Attachments**: All uploaded medical reports included
- **Patient Information**: Clearly formatted patient details
- **Submission Tracking**: Unique submission IDs for reference
- **Security**: Secure SMTP transmission

## Customization

### Email Configuration
Update email settings in `server.js`:
```javascript
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'prathyusha23@gmail.com',        // Your email
        pass: 'your-app-password'              // Your Gmail app password
    }
});
```

### Contact Information
Update contact details in `index.html`:
- Hospital locations
- Phone numbers  
- Email addresses
- Working hours

### Medical Specialties
Modify expertise cards in `index.html`:
- Add/remove specialization areas
- Update treatment descriptions
- Customize medical focus areas

### Email Templates
Customize email appearance in `server.js`:
- HTML email template
- Email styling and branding
- Subject line format
- Message content structure

### Styling
Customize appearance in `styles.css`:
- Color scheme (CSS variables at top of file)
- Typography settings
- Layout adjustments
- Animation preferences

## Security Considerations

- **Email Security**: Uses Gmail's secure SMTP with app passwords
- **File Validation**: File type and size restrictions (10MB per file)
- **Input Sanitization**: Form data validation
- **HTTPS Ready**: Server configured for secure connections
- **Privacy**: Patient data sent directly to doctor's email

## Workflow Benefits

### Professional & Secure
- Medical-grade email communication
- File attachments for easy access
- Professional email templates
- Secure transmission

### Efficient Review Process
- All patient information in one email
- Medical files as direct attachments
- Easy forwarding and archiving
- Integration with existing email workflow

## Production Deployment

### For Production Use:
1. **Environment Variables**: Use environment variables for email credentials
2. **SSL Certificates**: Set up HTTPS with proper certificates
3. **Email Service**: Consider professional email services (SendGrid, Mailgun)
4. **Logging**: Implement proper logging and monitoring
5. **Backup**: Set up email backup and archiving
6. **Security**: Additional security measures for production

## Future Enhancements

- **Advanced Email Templates**: More sophisticated email designs
- **File Preview**: Direct preview of medical reports in email
- **Automated Responses**: Template-based quick responses
- **Integration**: Electronic health record (EHR) integration
- **Analytics**: Submission tracking and analytics
- **Multi-language Support**: Localization for different languages

## Support

For technical support or customization requests, please refer to the code comments or contact the development team.

## License

This website is created for Dr. Prathyusha Eaga's medical practice. All rights reserved. 