//Description: Maintenance mode middleware to intercept requests during maintenance

const path = require('path');
const appConstants = require('../constants');

/**
 * Check if request is for static assets
 */
function isStaticAsset(req) {
    const staticExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf'];
    const pathname = req.path.toLowerCase();
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * Check if request is an API request
 */
function isAPIRequest(req) {
    // Check Accept header
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json')) {
        return true;
    }
    
    // Check path pattern
    const apiPaths = ['/api/', '/js-init', '/upload'];
    return apiPaths.some(apiPath => req.path.startsWith(apiPath));
}

/**
 * Check if request is a health check endpoint
 */
function isHealthCheck(req) {
    const healthPaths = ['/health', '/status', '/ping'];
    return healthPaths.includes(req.path);
}

/**
 * Check if request is for a whitelisted static HTML page
 * These pages don't require APIs or DB, so they should be accessible during maintenance
 */
function isWhitelistedPage(req) {
    // Whitelisted route paths (as defined in routes.js)
    const whitelistedRoutes = [
        '/rajasthan/tour-packages',
        '/dubai/tour-packages',
        '/thailand/tour-packages',
        '/srilanka/tour-packages',
        '/bali/tour-packages',
        '/kerela/tour-packages',
        '/maldives/tour-packages',
        '/kashmir/tour-packages',
		'/luxe',
		'/app.json'
    ];
    
    // Whitelisted HTML filenames (for direct access via /view/ path)
    const whitelistedPages = [
        'leadgen-dom-obfuscated.html',
        'leadgen-dom-ker-obfuscated.html',
        'leadgen-dom-kashmir-obfuscated.html',
        'leadgen-intl-obfuscated.html',
        'leadgen-intl-bali-obfuscated.html',
        'leadgen-intl-mald-obfuscated.html',
        'leadgen-intl-sri-obfuscated.html',
        'leadgen-intl-thai-obfuscated.html',
		'luxe-burgundy.html',
		'app.json'
    ];
    
    const pathname = req.path.toLowerCase();
    
    // Check if path matches any whitelisted route
    if (whitelistedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return true;
    }
    
    // Check if path ends with any whitelisted page filename
    return whitelistedPages.some(page => {
        // Match /view/filename.html or /filename.html
        return pathname.endsWith('/' + page.toLowerCase()) || 
               pathname.endsWith(page.toLowerCase()) ||
               pathname.includes('/' + page.toLowerCase());
    });
}

/**
 * Maintenance mode middleware
 */
function maintenanceMiddleware(req, res, next) {
    // Check if maintenance mode is enabled via environment variable only
    const maintenanceEnabled = process.env.MAINTENANCE_MODE === 'true';
    
    // If maintenance is not enabled, continue normally
    if (!maintenanceEnabled) {
        return next();
    }
    
    const maintenanceConfig = appConstants.MAINTENANCE || {};
    
    // Allow health check endpoints
    if (isHealthCheck(req)) {
        return next();
    }
    
    // Allow whitelisted static HTML pages (don't require APIs/DB)
    if (isWhitelistedPage(req)) {
        return next();
    }
    
    // Allow static assets (needed for maintenance page)
    if (isStaticAsset(req)) {
        return next();
    }
    
    // Handle API requests
    if (isAPIRequest(req)) {
        const response = {
            error: 'maintenance',
            message: maintenanceConfig.MESSAGE || "We're currently under maintenance",
            responseCode: 503
        };
        
        // Add estimated end time if available
        if (maintenanceConfig.END_TIME) {
            response.estimatedEndTime = maintenanceConfig.END_TIME;
            
            // Calculate Retry-After header (seconds until end time)
            const endTime = new Date(maintenanceConfig.END_TIME);
            const now = new Date();
            const secondsUntilEnd = Math.max(0, Math.floor((endTime - now) / 1000));
            if (secondsUntilEnd > 0) {
                res.setHeader('Retry-After', secondsUntilEnd);
            }
        }
        
        return res.status(503).json(response);
    }
    
    // Handle HTML requests - serve maintenance page
    // Inject maintenance data into HTML via meta tags
    const maintenanceHtmlPath = path.join(__dirname, '../../view/maintenance.html');
    const fs = require('fs');
    
    try {
        let htmlContent = fs.readFileSync(maintenanceHtmlPath, 'utf8');
        
        // Inject maintenance message and end time as meta tags
        const metaTags = [];
        if (maintenanceConfig.MESSAGE) {
            metaTags.push(`<meta name="maintenance-message" content="${maintenanceConfig.MESSAGE.replace(/"/g, '&quot;')}">`);
        }
        if (maintenanceConfig.END_TIME) {
            metaTags.push(`<meta name="maintenance-end-time" content="${maintenanceConfig.END_TIME}">`);
        }
        
        // Insert meta tags in head section
        if (metaTags.length > 0) {
            htmlContent = htmlContent.replace('</head>', `    ${metaTags.join('\n    ')}\n</head>`);
        }
        
        res.status(503).send(htmlContent);
    } catch (error) {
        // Fallback if maintenance.html doesn't exist
        console.error('Error serving maintenance page:', error);
        res.status(503).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Under Maintenance</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <h1>We'll be back soon!</h1>
                <p>${maintenanceConfig.MESSAGE || "We're currently under maintenance. Please check back later."}</p>
            </body>
            </html>
        `);
    }
}

module.exports = maintenanceMiddleware;

