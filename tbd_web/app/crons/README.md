# Subscription Expiry WhatsApp Notifications

This unified cron job handles both 1-day and 7-day subscription expiry notifications via WhatsApp.

## File Location
```
/usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/cron_job_subscription_expiry_unified.js
```

## Usage

### Run Both 1-day and 7-day notifications:
```bash
node cron_job_subscription_expiry_unified.js
```

### Run Only 1-day expiry notifications:
```bash
node cron_job_subscription_expiry_unified.js 1
```

### Run Only 7-day expiry notifications:
```bash
node cron_job_subscription_expiry_unified.js 7
```

## Cron Job Setup

Add these entries to your crontab:

```bash
# Edit crontab
crontab -e

# Option 1: Run both at the same time (9:00 AM daily)
0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js >> /var/log/subscription_expiry.log 2>&1

# Option 2: Run separately (recommended)
# 1-day expiry at 9:00 AM
0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js 1 >> /var/log/subscription_expiry_1day.log 2>&1

# 7-day expiry at 9:30 AM
30 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js 7 >> /var/log/subscription_expiry_7days.log 2>&1
```

## Log Files

Create log files for monitoring:
```bash
sudo touch /var/log/subscription_expiry.log
sudo touch /var/log/subscription_expiry_1day.log
sudo touch /var/log/subscription_expiry_7days.log
sudo chmod 666 /var/log/subscription_expiry*.log
```

## Monitoring

View logs:
```bash
# View recent logs
tail -f /var/log/subscription_expiry.log
tail -f /var/log/subscription_expiry_1day.log
tail -f /var/log/subscription_expiry_7days.log

# Check cron job status
crontab -l | grep subscription
```

## Manual Testing

Test the cron job manually:
```bash
# Test both
cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/
node cron_job_subscription_expiry_unified.js

# Test 1-day only
node cron_job_subscription_expiry_unified.js 1

# Test 7-day only
node cron_job_subscription_expiry_unified.js 7
```

## WhatsApp Templates Required

Ensure these templates are created and approved in Interakt:
- `membership_expired_` - For 1-day expiry notifications
- `membership_expired__6g` - For 7-day expiry notifications

Both should be media templates with image headers and variables for:
- {{1}} - User Name
- {{2}} - Expiry Date  
- {{3}} - Days since expiry
