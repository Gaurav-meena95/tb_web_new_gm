const emailTemplates = {
    // Booking related emails
    "bookingConfirmationToUser": {
        name: "Booking Confirmation to User",
        description: "Send booking confirmation to customer",
        requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "CONFIRMATION_EMAIL_TO_USER"
    },
    "bookingConfirmationToHost": {
        name: "Booking Confirmation to Host",
        description: "Send booking confirmation to property host",
        requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "CONFIRMATION_EMAIL_TO_HOST"
    },
    "bookingCanceledByUser": {
        name: "Booking Cancelled by User",
        description: "Notify user about booking cancellation",
        requiredFields: ["client_first_name", "client_name", "amount", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "CANCELLED_BY_USER_EMAIL_TO_USER"
    },
    "bookingCanceledByUserToHost": {
        name: "Booking Cancelled by User to Host",
        description: "Notify host about user cancellation",
        requiredFields: ["client_first_name", "client_name", "amount", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "CANCELLED_BY_USER_EMAIL_TO_HOST"
    },
    
    // Flight related emails
    "flightBookingConfirmation": {
        name: "Flight Booking Confirmation",
        description: "Send flight booking confirmation",
        requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "FLIGHT_BOOKING_CONFIRMATION"
    },
    "flightBookingFailed": {
        name: "Flight Booking Failed",
        description: "Notify about failed flight booking",
        requiredFields: ["client_first_name", "client_name", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "FLIGHT_BOOKING_FAILED"
    },
    "flightBookingFullRefund": {
        name: "Flight Full Refund",
        description: "Notify about full refund for flight",
        requiredFields: ["client_first_name", "client_name", "amount", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "FLIGHT_BOOKING_FULL_REFUND"
    },
    "flightBookingPartialRefund": {
        name: "Flight Partial Refund",
        description: "Notify about partial refund for flight",
        requiredFields: ["client_first_name", "client_name", "amount", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "FLIGHT_BOOKING_PARTIAL_REFUND"
    },
    "flightBookingCancellation": {
        name: "Flight Cancellation",
        description: "Notify about flight cancellation",
        requiredFields: ["client_first_name", "client_name", "destination"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "FLIGHT_BOOKING_CANCELLATION"
    },
    
    // Authentication emails
    "signUpOTP": {
        name: "Sign Up OTP",
        description: "Send OTP for user registration",
        requiredFields: ["client_first_name"],
        optionalFields: [],
        templateId: "SIGNUP_OTP_EMAIL_TEMPLATE_ID"
    },
    
    // Marketing emails
    "valentine": {
        name: "Valentine Special",
        description: "Valentine day promotional email",
        requiredFields: ["client_first_name"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "d-1a1ce84ab5a04a17b91dbec6dbcb1788"
    },
    "valentine-two": {
        name: "Valentine Special 2",
        description: "Alternative valentine promotional email",
        requiredFields: ["client_first_name"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "d-199b3d824af3411a8207d603f5db402c"
    },
    "dauSpecial": {
        name: "Daily Active User Special",
        description: "Special offers for active users",
        requiredFields: ["client_first_name"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "d-45ca86ebd0894c5daf9f25eb45275e19"
	},
	"landPackageBooking": {
        name: "Land Package Booking",
        description: "Land Package Booking",
        requiredFields: ["client_first_name", "client_name", "amount", "destination", "trip_date", "sales_owner"],
        optionalFields: ["sales_owner", "sales_team", "sales_emails"],
        templateId: "d-7a6b80e08ece4432827e42f3615c3a2e"
    }
};

// Field definitions with labels and types
const fieldDefinitions = {
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

module.exports = {
    emailTemplates,
    fieldDefinitions
};
