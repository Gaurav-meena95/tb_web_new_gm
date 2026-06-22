/**
 * Unified Cron Job: Subscription Expiry Notifications
 * 
 * This unified cron job handles both 1-day and 7-day subscription expiry notifications.
 * It can be run multiple times per day or configured to run at different times.
 * 
 * Usage: 
 * - For 1-day expiry: node cron_job_subscription_expiry_unified.js 1
 * - For 7-day expiry: node cron_job_subscription_expiry_unified.js 7
 * - For both: node cron_job_subscription_expiry_unified.js
 * 
 * Cron Examples:
 * # Run 1-day expiry at 9:00 AM daily
 * 0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js 1 >> /var/log/subscription_expiry_1day.log 2>&1
 * 
 * # Run 7-day expiry at 9:30 AM daily  
 * 30 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js 7 >> /var/log/subscription_expiry_7days.log 2>&1
 * 
 * # Run both at 9:00 AM daily
 * 0 9 * * * cd /usr/share/nginx/html/beatravelbuddy/tbd_web/app/crons/; node cron_job_subscription_expiry_unified.js >> /var/log/subscription_expiry.log 2>&1
 */

// Load environment variables
require("dotenv").config();

// Import required modules
const { Pool } = require('pg');
const config = require('../config/config.js');
const Whatsapp = require('../send-whatsapp-new');

// Database connection setup
const env = process.env.NODE_ENV || 'dev';
const readInstanceIp = env === 'dev' ? process.env.DEV_HOST : process.env.PROD_HOST_READ;
const writeInstanceIp = env === 'dev' ? process.env.DEV_HOST : process.env.PROD_HOST_WRITE;

// PostgreSQL Read Instance connection setup
const readPool = new Pool({
    user: config.production.readInstance.username,
    host: readInstanceIp,
    database: config.production.readInstance.database,
    password: config.production.readInstance.password,
    port: 25060,
});

// PostgreSQL Write Instance connection setup
const writePool = new Pool({
    user: config.production.writeInstance.username,
    host: writeInstanceIp,
    database: config.production.writeInstance.database,
    password: config.production.writeInstance.password,
    port: 25060,
});

/**
 * Main function to process subscription expiry notifications
 * @param {number} days - Number of days after expiry (1 or 7)
 */
async function processSubscriptionExpiry(days = null) {
    const startTime = new Date();
    console.log(`=== Starting Subscription Expiry Notification Cron Job ===`);
    console.log(`Timestamp: ${startTime.toISOString()}`);
    console.log(`Processing: ${days ? `${days}-day` : 'both 1-day and 7-day'} expiry notifications`);
    
    try {
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalErrors = 0;

        // Process 1-day expiry if requested or if no specific days requested
        if (!days || days === 1) {
            const result1 = await processExpiryForDays(1);
            totalProcessed += result1.processed;
            totalSuccess += result1.success;
            totalErrors += result1.errors;
        }

        // Process 7-day expiry if requested or if no specific days requested
        if (!days || days === 7) {
            const result7 = await processExpiryForDays(7);
            totalProcessed += result7.processed;
            totalSuccess += result7.success;
            totalErrors += result7.errors;
        }

        const endTime = new Date();
        const duration = endTime - startTime;

        console.log(`=== Subscription Expiry Notification Summary ===`);
        console.log(`Total users processed: ${totalProcessed}`);
        console.log(`Successful notifications: ${totalSuccess}`);
        console.log(`Failed notifications: ${totalErrors}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Completion time: ${endTime.toISOString()}`);

    } catch (error) {
        console.error('Error in processSubscriptionExpiry:', error);
        throw error;
    } finally {
        // Close database connections
        await readPool.end();
        await writePool.end();
    }
}

/**
 * Process expiry notifications for specific number of days
 * @param {number} days - Number of days after expiry
 * @returns {Object} - Processing results
 */
async function processExpiryForDays(days) {
    console.log(`\n📅 Processing ${days}-day expiry notifications...`);
    console.log('-'.repeat(50));
    
    try {
        // Query to find users whose subscriptions expired exactly N days ago
        const query = `
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
                AND EXTRACT(DAY FROM verified_orders.subscription_end_time - CURRENT_TIMESTAMP) = -${days}
                AND users.user_phone_number IS NOT NULL
                AND users.user_phone_number != ''
                AND users.phone_dial_code IS NOT NULL
                AND users.phone_dial_code != ''
            ORDER BY 
                days_left DESC;
        `;

        console.log(`Executing query for ${days}-day expired subscriptions...`);
        const result = await readPool.query(query);
        
        console.log(`Found ${result.rows.length} users with subscriptions expired ${days} day(s) ago`);
        
        if (result.rows.length === 0) {
            console.log(`No users found with subscriptions expired ${days} day(s) ago`);
            return { processed: 0, success: 0, errors: 0 };
        }

        // Process each user
        let successCount = 0;
        let errorCount = 0;

        for (const user of result.rows) {
            try {
                console.log(`Processing user: ${user.user_full_name} (ID: ${user.primary_id})`);
                console.log(`Phone: ${user.phone_dial_code}${user.user_phone_number}`);
                console.log(`Subscription ended: ${user.subscription_end_time}`);
                
                // Send WhatsApp notification
                const whatsappResponse = await sendSubscriptionExpiryWhatsApp(user, days);
                
                if (whatsappResponse && whatsappResponse.messageId) {
                    console.log(`✅ WhatsApp sent successfully to ${user.user_full_name}`);
                    successCount++;
                } else {
                    console.log(`❌ Failed to send WhatsApp to ${user.user_full_name}`);
                    errorCount++;
                }
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error processing user ${user.user_full_name}:`, error);
                errorCount++;
            }
        }

        console.log(`=== ${days}-Day Expiry Notification Summary ===`);
        console.log(`Total users processed: ${result.rows.length}`);
        console.log(`Successful notifications: ${successCount}`);
        console.log(`Failed notifications: ${errorCount}`);

        return { processed: result.rows.length, success: successCount, errors: errorCount };

    } catch (error) {
        console.error(`Error in processExpiryForDays(${days}):`, error);
        throw error;
    }
}

/**
 * Send WhatsApp notification for subscription expiry
 * @param {Object} user - User object with subscription details
 * @param {number} days - Number of days since expiry
 * @returns {Promise<Object>} - WhatsApp API response
 */
async function sendSubscriptionExpiryWhatsApp(user, days) {
    try {
        const phoneNumber = user.user_phone_number;
        const countryCode = user.phone_dial_code || '+91';
        const userName = user.user_full_name || 'Valued Customer';
        const subscriptionEndDate = new Date(user.subscription_end_time).toLocaleDateString('en-IN');
        
        // Template parameters for the WhatsApp message
        // New templates only expect 1 parameter (user name)
        const templateParams = [userName];

        // Image URL
        const imageUrl = 'https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/42919b88-09d8-41b6-a2ee-b03eaeb7e285/message_template_media/Fz5odwaoUlPx/WhatsApp%20Image%202025-08-18%20at%2016.03.52_5f4f27e9.jpg?se=2030-08-15T07%3A45%3A53Z&sp=rt&sv=2019-12-12&sr=b&sig=dMi6PVQf%2BPG5Ymz0JytOCoziydMh6d1Cls0sjtUgJ6U%3D';

        // Choose template based on days
        const templateName = days === 1 ? '1day_premium_expire' : '7days_expired_premium';

        // Send WhatsApp message using send_template_with_quick_replies
        const response = await Whatsapp.send_template_with_quick_replies(
            phoneNumber,
            countryCode,
            templateName,
            imageUrl,
            userName,
            'en',
            `Subscription Expiry ${days} Day${days > 1 ? 's' : ''}.jpg`,
            templateParams
        );

        console.log(`WhatsApp response for ${userName}:`, response);
        return response;

    } catch (error) {
        console.error(`Error sending WhatsApp to ${user.user_full_name}:`, error);
        throw error;
    }
}

/**
 * Log function for tracking cron job execution
 */
async function logCronExecution(status, message, userCount = 0, days = null) {
    try {
        const logQuery = `
            INSERT INTO cron_execution_logs 
            (cron_name, execution_time, status, message, records_processed) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        const cronName = days ? `subscription_expiry_${days}day` : 'subscription_expiry_unified';
        
        await writePool.query(logQuery, [
            cronName,
            new Date(),
            status,
            message,
            userCount
        ]);
    } catch (error) {
        console.error('Error logging cron execution:', error);
    }
}

// Get command line arguments
/*const args = process.argv.slice(2);
const daysArg = args[0] ? parseInt(args[0]) : null;

// Validate days argument
if (daysArg && daysArg !== 1 && daysArg !== 7) {
    console.error('Error: Days argument must be 1 or 7');
    console.log('Usage:');
    console.log('  node cron_job_subscription_expiry_unified.js 1    # 1-day expiry only');
    console.log('  node cron_job_subscription_expiry_unified.js 7    # 7-day expiry only');
    console.log('  node cron_job_subscription_expiry_unified.js      # both 1-day and 7-day');
    process.exit(1);
}

// Execute the cron job
if (require.main === module) {
    processSubscriptionExpiry(daysArg)
        .then(() => {
            console.log('Subscription expiry unified cron job completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Subscription expiry unified cron job failed:', error);
            process.exit(1);
        });
}*/


module.exports = {
    processSubscriptionExpiry,
    processExpiryForDays,
    sendSubscriptionExpiryWhatsApp
};
