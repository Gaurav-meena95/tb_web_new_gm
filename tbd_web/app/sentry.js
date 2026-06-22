module.exports = function initializeSentry(dsn) {
    Sentry.init({
        dsn: "",
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            // Automatically instrument Node.js libraries and frameworks
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
};
