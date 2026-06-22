class EmailSender {
    constructor() {
        this.currentStep = 1;
        this.emailTemplates = {};
        this.fieldDefinitions = {};
        this.selectedTemplate = null;
        this.formData = {};
        this.pdfFile = null;
        
        this.init();
    }

    async init() {
        await this.loadEmailTemplates();
        this.setupEventListeners();
        this.populateEmailTypes();
    }

    async loadEmailTemplates() {
        try {
            console.log('Attempting to load email templates from API...');
            const response = await fetch('/api/email-templates');
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);
                this.emailTemplates = data.emailTemplates;
                this.fieldDefinitions = data.fieldDefinitions;
                console.log('Templates loaded from API successfully');
            } else {
                console.log('API failed, falling back to hardcoded templates');
                // Fallback to hardcoded templates if API fails
                this.loadFallbackTemplates();
            }
        } catch (error) {
            console.error('Error loading email templates:', error);
            console.log('Falling back to hardcoded templates due to error');
            this.loadFallbackTemplates();
        }
    }

    loadFallbackTemplates() {
        // Fallback templates for development/testing
        this.emailTemplates = {
            "bookingConfirmationToUser": {
                name: "Booking Confirmation to User",
                description: "Send booking confirmation to customer",
                requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "bookingConfirmationToHost": {
                name: "Booking Confirmation to Host",
                description: "Send booking confirmation to property host",
                requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "bookingCanceledByUser": {
                name: "Booking Cancelled by User",
                description: "Notify user about booking cancellation",
                requiredFields: ["client_first_name", "client_name", "amount", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "bookingCanceledByUserToHost": {
                name: "Booking Cancelled by User to Host",
                description: "Notify host about user cancellation",
                requiredFields: ["client_first_name", "client_name", "amount", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "flightBookingConfirmation": {
                name: "Flight Booking Confirmation",
                description: "Send flight booking confirmation",
                requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "flightBookingFailed": {
                name: "Flight Booking Failed",
                description: "Notify about failed flight booking",
                requiredFields: ["client_first_name", "client_name", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "flightBookingFullRefund": {
                name: "Flight Full Refund",
                description: "Notify about full refund for flight",
                requiredFields: ["client_first_name", "client_name", "amount", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "flightBookingPartialRefund": {
                name: "Flight Partial Refund",
                description: "Notify about partial refund for flight",
                requiredFields: ["client_first_name", "client_name", "amount", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "flightBookingCancellation": {
                name: "Flight Cancellation",
                description: "Notify about flight cancellation",
                requiredFields: ["client_first_name", "client_name", "destination"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "signUpOTP": {
                name: "Sign Up OTP",
                description: "Send OTP for user registration",
                requiredFields: ["client_first_name"],
                optionalFields: []
            },
            "valentine": {
                name: "Valentine Special",
                description: "Valentine day promotional email",
                requiredFields: ["client_first_name"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "valentine-two": {
                name: "Valentine Special 2",
                description: "Alternative valentine promotional email",
                requiredFields: ["client_first_name"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "dauSpecial": {
                name: "Daily Active User Special",
                description: "Special offers for active users",
                requiredFields: ["client_first_name"],
                optionalFields: ["sales_owner", "sales_team", "sales_emails"]
            },
            "landPackageBooking": {
                name: "Land Package Booking",
                description: "Land Package Booking",
                requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date", "sales_owner"],
                optionalFields: ["sales_team", "sales_emails"]
            }
        };

        this.fieldDefinitions = {
            "client_first_name": {
                label: "Client First Name",
                type: "text",
                placeholder: "Enter client's first name",
                required: true
            },
            "client_name": {
                label: "Client Full Name",
                type: "text",
                placeholder: "Enter client's full name",
                required: true
            },
            "amount": {
                label: "Amount",
                type: "number",
                placeholder: "Enter amount",
                required: true
            },
            "destination": {
                label: "Destination",
                type: "text",
                placeholder: "Enter destination",
                required: true
            },
            "trip_date": {
                label: "Trip Date",
                type: "date",
                placeholder: "Select trip date",
                required: true
            },
            "sales_owner": {
                label: "Sales Owner",
                type: "text",
                placeholder: "Enter sales owner name",
                required: false
            },
            "sales_team": {
                label: "Sales Team",
                type: "text",
                placeholder: "Enter sales team (comma separated for multiple)",
                required: false
            },
            "sales_emails": {
                label: "Sales Emails",
                type: "email",
                placeholder: "Enter sales emails (comma separated for multiple)",
                required: false
            }
        };
    }

    setupEventListeners() {
        // Email type selection
        document.getElementById('emailType').addEventListener('change', (e) => {
            this.handleEmailTypeChange(e.target.value);
        });

        // Navigation buttons
        document.getElementById('nextToStep2').addEventListener('click', () => {
            this.goToStep(2);
        });

        document.getElementById('backToStep1').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('nextToStep3').addEventListener('click', () => {
            this.goToStep(3);
        });

        document.getElementById('backToStep2').addEventListener('click', () => {
            this.goToStep(2);
        });

        // Send email
        document.getElementById('sendEmail').addEventListener('click', () => {
            this.sendEmail();
        });

        // File upload
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileUpload = document.getElementById('fileUpload');
        const pdfFile = document.getElementById('pdfFile');
        const removeFile = document.getElementById('removeFile');

        // Click to browse
        fileUpload.addEventListener('click', () => {
            pdfFile.click();
        });

        // File selection
        pdfFile.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files[0]);
        });

        // Drag and drop
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                this.handleFileSelection(file);
            }
        });

        // Remove file
        removeFile.addEventListener('click', () => {
            this.removePdfFile();
        });
    }

    handleFileSelection(file) {
        if (file && file.type === 'application/pdf') {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showAlert('File size must be less than 10MB', 'error');
                return;
            }

            this.pdfFile = file;
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileUpload').classList.add('has-file');
        } else {
            this.showAlert('Please select a valid PDF file', 'error');
        }
    }

    removePdfFile() {
        this.pdfFile = null;
        document.getElementById('pdfFile').value = '';
        document.getElementById('fileName').textContent = '';
        document.getElementById('fileUpload').classList.remove('has-file');
    }

    populateEmailTypes() {
        const select = document.getElementById('emailType');
        select.innerHTML = '<option value="">Choose an email template...</option>';
        
        Object.entries(this.emailTemplates).forEach(([key, template]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = template.name;
            select.appendChild(option);
        });
    }

    handleEmailTypeChange(templateKey) {
        if (!templateKey) {
            document.getElementById('nextToStep2').disabled = true;
            document.getElementById('templateDescription').style.display = 'none';
            return;
        }

        this.selectedTemplate = this.emailTemplates[templateKey];
        document.getElementById('nextToStep2').disabled = false;
        
        // Show template description
        document.getElementById('templateDesc').textContent = this.selectedTemplate.description;
        document.getElementById('templateDescription').style.display = 'block';
    }

    goToStep(step) {
        if (step === 2 && !this.validateStep1()) return;
        if (step === 3 && !this.validateStep2()) return;

        // Hide all step contents
        document.querySelectorAll('[id$="-content"]').forEach(el => {
            el.classList.add('hidden');
        });

        // Show target step content
        document.getElementById(`step${step}-content`).classList.remove('hidden');

        // Update step indicators
        this.updateStepIndicators(step);

        // Generate dynamic fields if going to step 2
        if (step === 2) {
            this.generateDynamicFields();
        }

        // Populate review if going to step 3
        if (step === 3) {
            this.populateReview();
        }

        this.currentStep = step;
    }

    updateStepIndicators(activeStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === activeStep) {
                step.classList.add('active');
            } else if (stepNum < activeStep) {
                step.classList.add('completed');
            }
        });
    }

    generateDynamicFields() {
        const container = document.getElementById('dynamicFields');
        container.innerHTML = '';

        if (!this.selectedTemplate) return;

        const allFields = [...this.selectedTemplate.requiredFields, ...this.selectedTemplate.optionalFields];
        
        allFields.forEach(fieldKey => {
            const fieldDef = this.fieldDefinitions[fieldKey];
            if (!fieldDef) return;

            const fieldGroup = document.createElement('div');
            fieldGroup.className = `form-group ${fieldDef.required ? 'required' : ''}`;
            
            const label = document.createElement('label');
            label.htmlFor = fieldKey;
            label.textContent = fieldDef.label;
            
            let input;
            if (fieldDef.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else {
                input = document.createElement('input');
                input.type = fieldDef.type;
            }
            
            input.id = fieldKey;
            input.placeholder = fieldDef.placeholder;
            input.required = fieldDef.required;
            
            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
            container.appendChild(fieldGroup);
        });
    }

    validateStep1() {
        if (!this.selectedTemplate) {
            this.showAlert('Please select an email template', 'error');
            return false;
        }
        return true;
    }

    validateStep2() {
        const recipientEmail = document.getElementById('recipientEmail').value.trim();
        const subject = document.getElementById('emailSubject').value.trim();

        if (!recipientEmail) {
            this.showAlert('Please enter recipient email', 'error');
            return false;
        }

        if (!subject) {
            this.showAlert('Please enter email subject', 'error');
            return false;
        }

        // Validate required fields
        if (this.selectedTemplate) {
            for (const fieldKey of this.selectedTemplate.requiredFields) {
                const field = document.getElementById(fieldKey);
                if (field && !field.value.trim()) {
                    this.showAlert(`Please fill in ${this.fieldDefinitions[fieldKey].label}`, 'error');
                    field.focus();
                    return false;
                }
            }
        }

        return true;
    }

    populateReview() {
        // Collect form data
        this.formData = {
            emailType: this.selectedTemplate.name,
            recipientEmail: document.getElementById('recipientEmail').value.trim(),
            subject: document.getElementById('emailSubject').value.trim(),
            fields: {},
            attachment: this.pdfFile ? this.pdfFile.name : null
        };

        // Collect dynamic field values
        if (this.selectedTemplate) {
            const allFields = [...this.selectedTemplate.requiredFields, ...this.selectedTemplate.optionalFields];
            allFields.forEach(fieldKey => {
                const field = document.getElementById(fieldKey);
                if (field) {
                    this.formData.fields[fieldKey] = field.value.trim();
                }
            });
        }

        // Update review display
        document.getElementById('reviewEmailType').textContent = this.formData.emailType;
        document.getElementById('reviewRecipient').textContent = this.formData.recipientEmail;
        document.getElementById('reviewSubject').textContent = this.formData.subject;
        
        // Display fields
        const fieldsText = Object.entries(this.formData.fields)
            .map(([key, value]) => `${this.fieldDefinitions[key]?.label || key}: ${value}`)
            .join(', ');
        document.getElementById('reviewFields').textContent = fieldsText;

        // Show/hide attachment info
        if (this.formData.attachment) {
            document.getElementById('reviewAttachment').style.display = 'flex';
            document.getElementById('reviewAttachmentName').textContent = this.formData.attachment;
        } else {
            document.getElementById('reviewAttachment').style.display = 'none';
        }
    }

    async sendEmail() {
        const sendButton = document.getElementById('sendEmail');
        const originalText = sendButton.innerHTML;
        
        try {
            sendButton.disabled = true;
            sendButton.innerHTML = '<span class="loading"></span>Sending...';

            // Prepare form data
            const formData = new FormData();
            formData.append('emailType', this.getEmailTypeKey());
            formData.append('recipientEmail', this.formData.recipientEmail);
            formData.append('subject', this.formData.subject);
            formData.append('templateData', JSON.stringify(this.formData.fields));
            
            if (this.pdfFile) {
                formData.append('attachment', this.pdfFile);
            }

            // Send email
            const response = await fetch('/api/send-email', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showAlert('Email sent successfully!', 'success');
                
                // Reset form and go back to step 1
                setTimeout(() => {
                    this.resetForm();
                    this.goToStep(1);
                }, 2000);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            this.showAlert(`Error sending email: ${error.message}`, 'error');
        } finally {
            sendButton.disabled = false;
            sendButton.innerHTML = originalText;
        }
    }

    getEmailTypeKey() {
        return Object.keys(this.emailTemplates).find(key => 
            this.emailTemplates[key].name === this.formData.emailType
        );
    }

    resetForm() {
        // Reset form fields
        document.getElementById('emailType').value = '';
        document.getElementById('recipientEmail').value = '';
        document.getElementById('emailSubject').value = '';
        
        // Clear dynamic fields
        document.getElementById('dynamicFields').innerHTML = '';
        
        // Remove PDF file
        this.removePdfFile();
        
        // Reset data
        this.selectedTemplate = null;
        this.formData = {};
        this.pdfFile = null;
        
        // Reset step indicators
        this.updateStepIndicators(1);
        
        // Hide template description
        document.getElementById('templateDescription').style.display = 'none';
        
        // Disable next button
        document.getElementById('nextToStep2').disabled = true;
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

// Initialize the email sender when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmailSender();
});
