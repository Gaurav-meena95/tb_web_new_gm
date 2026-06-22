# 📧 Email Sender Interface - Travel Buddy

A comprehensive email sending interface built with Node.js, Express, and SendGrid that allows users to send personalized emails with dynamic content and PDF attachments.

## ✨ Features

- **Multi-step Email Interface**: Clean, intuitive 3-step process
- **Dynamic Template Selection**: Choose from predefined email templates
- **Smart Field Generation**: Automatically shows required fields based on template
- **PDF Attachment Support**: Upload and attach PDF files (up to 10MB)
- **SendGrid Integration**: Professional email delivery service
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Form validation with helpful error messages
- **Review System**: Preview email details before sending

## 🚀 Quick Start

### 1. Access the Interface

- **Main Interface**: Navigate to `/email-sender`
- **Test Page**: Navigate to `/email-test` for testing functionality

### 2. Send an Email

1. **Select Email Type**: Choose from available templates
2. **Fill Details**: Enter recipient, subject, and template fields
3. **Upload PDF** (Optional): Attach PDF files if needed
4. **Review & Send**: Confirm details and send the email

## 🏗️ Architecture

### Frontend Components

- **HTML Interface** (`/view/email-sender.html`): Main user interface
- **JavaScript Logic** (`/view/assets/js/email-sender.js`): Frontend functionality
- **CSS Styling**: Embedded in HTML for easy deployment

### Backend Components

- **Email Templates Config** (`/app/email-templates-config.js`): Template definitions
- **API Routes** (`/app/routes.js`): REST endpoints for email operations
- **SendGrid Integration** (`/app/send-email.js`): Email sending functionality

### API Endpoints

```
GET  /api/email-templates     - Get available email templates
POST /api/send-email         - Send email with template and attachment
GET  /email-sender          - Main email sender interface
GET  /email-test            - Test page for development
```

## 📋 Email Templates

### Available Templates

| Template Key | Name | Description | Required Fields |
|--------------|------|-------------|-----------------|
| `bookingConfirmationToUser` | Booking Confirmation to User | Send booking confirmation to customer | `client_first_name`, `client_name`, `amount`, `destination`, `trip_date` |
| `bookingConfirmationToHost` | Booking Confirmation to Host | Send booking confirmation to property host | `client_first_name`, `client_name`, `amount`, `destination`, `trip_date` |
| `flightBookingConfirmation` | Flight Booking Confirmation | Send flight booking confirmation | `client_first_name`, `client_name`, `amount`, `destination`, `trip_date` |
| `signUpOTP` | Sign Up OTP | Send OTP for user registration | `client_first_name` |
| `valentine` | Valentine Special | Valentine day promotional email | `client_first_name` |

### Template Fields

| Field Key | Label | Type | Required | Description |
|-----------|-------|------|----------|-------------|
| `client_first_name` | Client First Name | text | ✅ | Client's first name |
| `client_name` | Client Full Name | text | ✅ | Client's full name |
| `amount` | Amount | number | ✅ | Transaction amount |
| `destination` | Destination | text | ✅ | Travel destination |
| `trip_date` | Trip Date | date | ✅ | Travel date |
| `sales_owner` | Sales Owner | text | ❌ | Sales person name |
| `sales_team` | Sales Team | text | ❌ | Sales team members |
| `sales_emails` | Sales Emails | email | ❌ | Sales team emails |

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=your_verified_sender_email@domain.com
FROM_NAME=Your Company Name
```

### Adding New Templates

1. **Edit** `/app/email-templates-config.js`
2. **Add** new template definition:

```javascript
"newTemplateKey": {
    name: "New Template Name",
    description: "Template description",
    requiredFields: ["field1", "field2"],
    optionalFields: ["field3"],
    templateId: "SENDGRID_TEMPLATE_ID"
}
```

3. **Add** field definitions if needed:

```javascript
"new_field": {
    label: "Field Label",
    type: "text", // text, email, number, date, textarea
    placeholder: "Enter value...",
    required: true
}
```

## 📁 File Structure

```
tbd_web/
├── app/
│   ├── email-templates-config.js    # Email template definitions
│   ├── routes.js                    # API routes (email endpoints)
│   └── send-email.js               # SendGrid integration
├── view/
│   ├── email-sender.html           # Main email interface
│   ├── email-test.html             # Test page
│   └── assets/
│       └── js/
│           └── email-sender.js     # Frontend JavaScript
└── EMAIL_SENDER_README.md          # This documentation
```

## 🧪 Testing

### 1. Test Page

Visit `/email-test` to:
- Test API connectivity
- Verify email templates loading
- Send test emails
- Check system status

### 2. Manual Testing

1. **Open** `/email-sender`
2. **Select** an email template
3. **Fill** required fields
4. **Upload** a PDF (optional)
5. **Review** and send

### 3. API Testing

```bash
# Test email templates endpoint
curl http://localhost:3000/api/email-templates

# Test email sending (with form data)
curl -X POST http://localhost:3000/api/send-email \
  -F "emailType=signUpOTP" \
  -F "recipientEmail=test@example.com" \
  -F "subject=Test Email" \
  -F "templateData={\"client_first_name\":\"John\"}"
```

## 🚨 Troubleshooting

### Common Issues

1. **SendGrid API Key Error**
   - Verify `SENDGRID_API_KEY` in `.env`
   - Check SendGrid account status

2. **Template Not Found**
   - Verify template ID in SendGrid
   - Check template configuration

3. **PDF Upload Fails**
   - Ensure file is PDF format
   - Check file size (max 10MB)
   - Verify file permissions

4. **Email Not Sending**
   - Check server logs for errors
   - Verify recipient email format
   - Check SendGrid sending limits

### Debug Mode

Enable debug logging by adding to your server startup:

```javascript
process.env.DEBUG = 'email-sender:*';
```

## 🔒 Security Considerations

- **File Upload Validation**: Only PDF files accepted
- **File Size Limits**: Maximum 10MB per file
- **Input Sanitization**: All user inputs are validated
- **Rate Limiting**: Consider implementing rate limiting for production
- **Authentication**: Add user authentication for production use

## 📈 Performance

- **File Processing**: PDFs are processed asynchronously
- **Memory Management**: Temporary files are cleaned up after processing
- **Error Handling**: Graceful fallbacks for API failures
- **Caching**: Template configurations are loaded once per session

## 🚀 Deployment

### Production Checklist

- [ ] Set production SendGrid API key
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (Sentry)
- [ ] Test email delivery
- [ ] Set up backup email service

### Environment-Specific Configs

```javascript
// Development
const config = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/pdf'],
    debug: true
};

// Production
const config = {
    maxFileSize: 5 * 1024 * 1024,  // 5MB
    allowedFileTypes: ['application/pdf'],
    debug: false
};
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review server logs
- Test with the test page
- Contact the development team

## 📄 License

This project is part of the Travel Buddy application suite.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Travel Buddy Development Team
