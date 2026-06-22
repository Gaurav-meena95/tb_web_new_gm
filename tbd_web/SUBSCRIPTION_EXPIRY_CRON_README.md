# Subscription Expiry WhatsApp Notification Cron Jobs

This document provides instructions for setting up and managing the subscription expiry notification cron jobs that send WhatsApp messages to users whose subscriptions have expired.

## Overview

Two cron jobs have been created to handle subscription expiry notifications:

1. **1-Day After Expiry**: Sends initial renewal reminder
2. **7-Days After Expiry**: Sends final renewal reminder

## Files Created

- `app/crons/cron_job_subscription_expiry_1day.js` - 1-day expiry notification
- `app/crons/cron_job_subscription_expiry_7days.js` - 7-day expiry notification  
- `app/crons/test_subscription_expiry_crons.js` - Test script for validation

## Database Query

Both cron jobs use the following SQL query to find users with expired subscriptions:

```sql
SELECT 
    users.user_email, 
    users.user_full_name, 
    users.primary_id, 
    users.phone_dial_code,
    users.user_phone_number,
    verified_orders.id, 
    verified_id, 
    order_id, 
    subscription_end_time, 
    EXTRACT(DAY FROM verified_orders.subscription_end_time - CURRENT_TIMESTAMP) AS days_left 
FROM 
    users, 
    verified_orders, 
    (
        SELECT 
            user_id, 
            MAX(id) AS id 
        FROM 
            verified_orders 
        GROUP BY 
            user_id
    ) vo 
WHERE 
    (users.is_verified = 1 OR verified_orders.order_status = -1)
    AND users.primary_id = verified_orders.user_id 
    AND vo.id = verified_orders.id 
    AND EXTRACT(DAY FROM verified_orders.subscription_end_time - CURRENT_TIMESTAMP) = -1  -- For 1-day: -1, For 7-day: -7
    AND users.user_phone_number IS NOT NULL
    AND users.user_phone_number != ''
    AND users.phone_dial_code IS NOT NULL
    AND users.phone_dial_code != ''
ORDER BY 
    days_left DESC;
```

## Prerequisites

1. **Node.js Environment**: Ensure Node.js is installed on your VM
2. **Database Access**: PostgreSQL database with read/write access
3. **WhatsApp Integration**: Interakt API key configured in environment variables
4. **Environment Variables**: Ensure `.env` file contains:
   - `INTERAKT_API_KEY`
   - `DEV_HOST` (for development)
   - `PROD_HOST_READ` (for production read instance)
   - `PROD_HOST_WRITE` (for production write instance)
   - `NODE_ENV` (dev/prod)

## Setup Instructions

### 1. Upload Files to VM

Upload the following files to your VM instance:
```
/usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/
├── cron_job_subscription_expiry_1day.js
├── cron_job_subscription_expiry_7days.js
└── test_subscription_expiry_crons.js
```

### 2. Install Dependencies

Ensure the following Node.js packages are installed:
```bash
npm install pg axios dotenv
```

### 3. Test the Implementation

Before setting up cron jobs, test the implementation:

```bash
cd /usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/
node test_subscription_expiry_crons.js
```

### 4. Set Up Cron Jobs

Add the following entries to your crontab:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Subscription Expiry Notifications - 1 Day After
0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/; node cron_job_subscription_expiry_1day.js >> /var/log/subscription_expiry_1day.log 2>&1

# Subscription Expiry Notifications - 7 Days After  
0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/; node cron_job_subscription_expiry_7days.js >> /var/log/subscription_expiry_7days.log 2>&1
```

### 5. Create Log Files

Create log files for monitoring:

```bash
sudo touch /var/log/subscription_expiry_1day.log
sudo touch /var/log/subscription_expiry_7days.log
sudo chmod 666 /var/log/subscription_expiry_*.log
```

## WhatsApp Template Configuration

### Required Templates

You need to create the following templates in your Interakt dashboard:

1. **membership_expired_**
   - Type: Media template (with image header)
   - Image URL: https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/42919b88-09d8-41b6-a2ee-b03eaeb7e285/message_template_media/Fz5odwaoUlPx/WhatsApp%20Image%202025-08-18%20at%2016.03.52_5f4f27e9.jpg
   - Variables: {{1}} (User Name), {{2}} (Expiry Date), {{3}} (Days since expiry)
   - Message: "Hi {{1}}, your subscription expired on {{2}} ({{3}} ago). Renew now to continue enjoying our services!"

2. **membership_expired__6g**
   - Type: Media template (with image header)
   - Image URL: https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/42919b88-09d8-41b6-a2ee-b03eaeb7e285/message_template_media/Fz5odwaoUlPx/WhatsApp%20Image%202025-08-18%20at%2016.03.52_5f4f27e9.jpg
   - Variables: {{1}} (User Name), {{2}} (Expiry Date), {{3}} (Days since expiry)
   - Message: "Hi {{1}}, your subscription expired on {{2}} ({{3}} ago). This is your final reminder to renew!"

### Template Approval

Ensure both templates are approved by WhatsApp before the cron jobs go live.

## Monitoring and Logs

### Log Files

- `/var/log/subscription_expiry_1day.log` - 1-day expiry notifications
- `/var/log/subscription_expiry_7days.log` - 7-day expiry notifications

### Monitoring Commands

```bash
# View recent logs
tail -f /var/log/subscription_expiry_1day.log
tail -f /var/log/subscription_expiry_7days.log

# Check cron job status
crontab -l | grep subscription

# View cron execution history
grep CRON /var/log/syslog | grep subscription
```

### Manual Execution

You can run the cron jobs manually for testing:

```bash
# 1-day expiry
cd /usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/
node cron_job_subscription_expiry_1day.js

# 7-day expiry
cd /usr/share/nginx/html/beatravelbuddy/tbd_ws/v5/crons/
node cron_job_subscription_expiry_7days.js
```

## Error Handling

The cron jobs include comprehensive error handling:

- Database connection errors are logged
- WhatsApp API errors are logged
- Individual user processing errors don't stop the entire job
- Rate limiting protection (1-second delay between messages)
- Detailed logging for debugging

## Performance Considerations

- **Rate Limiting**: 1-second delay between WhatsApp messages
- **Database Connections**: Proper connection pooling and cleanup
- **Memory Management**: Connections are closed after each execution
- **Error Recovery**: Individual failures don't affect other users

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify database server accessibility
   - Check credentials

2. **WhatsApp API Errors**
   - Verify INTERAKT_API_KEY
   - Check template approval status
   - Verify phone number formats

3. **No Users Found**
   - Check query logic
   - Verify date calculations
   - Check user data integrity

### Debug Mode

To run in debug mode, set environment variable:
```bash
NODE_ENV=dev node cron_job_subscription_expiry_1day.js
```

## Security Notes

- API keys are stored in environment variables
- Database credentials are not hardcoded
- Log files contain no sensitive information
- Phone numbers are validated before sending

## Support

For issues or questions:
1. Check the log files first
2. Run the test script to validate setup
3. Verify database connectivity
4. Check WhatsApp template status

## Changelog

- **v1.0** - Initial implementation with 1-day and 7-day expiry notifications
- Added comprehensive error handling and logging
- Included test script for validation
- Added rate limiting for WhatsApp API
