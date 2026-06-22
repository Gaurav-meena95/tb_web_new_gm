# TBO Database Population Script

This script populates the TBO database tables with data from the TBO API. It handles countries, cities, hotel codes, and hotel details.

## Features

- ✅ **Error Handling**: Continues execution even if individual operations fail
- ✅ **Batch Processing**: Processes data in batches to avoid overwhelming the API
- ✅ **Progress Tracking**: Shows detailed progress and statistics
- ✅ **Rate Limiting**: Includes delays between API calls to respect rate limits
- ✅ **Flexible Usage**: Can populate all data or specific countries/cities
- ✅ **Comprehensive Logging**: Detailed logs with timestamps

## Prerequisites

1. Ensure your database is properly configured
2. Make sure all required environment variables are set for TBO API access
3. Verify that the TBO API endpoints are accessible

## Usage

### Populate All Data
```bash
node populate_tbo_database.js
```

### Populate Specific Country
```bash
node populate_tbo_database.js IN
```

### Populate Specific City
```bash
node populate_tbo_database.js 144306 IN
```

## Database Tables Populated

The script populates the following tables:

1. **tbo_countries** - Country information
2. **tbo_cities** - City information with country relationships
3. **tbo_hotel_codes** - Hotel codes for each city
4. **tbo_hotel_details** - Detailed hotel information

## Process Flow

1. **Countries**: Fetches all countries from TBO API and stores them
2. **Cities**: For each country, fetches cities and stores them
3. **Hotel Codes**: For each city, fetches hotel codes and stores them
4. **Hotel Details**: For each city, fetches detailed hotel information and stores them

## Configuration

You can modify these constants in the script:

```javascript
const BATCH_SIZE = 10; // Process cities in batches
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between API calls
```

## Error Handling

The script is designed to continue execution even when individual operations fail:

- ✅ Individual country failures don't stop city processing
- ✅ Individual city failures don't stop hotel processing
- ✅ API errors are logged but don't halt execution
- ✅ Database errors are handled gracefully

## Output

The script provides detailed output including:

- Progress indicators for each step
- Success/failure counts
- Error messages for failed operations
- Final summary with statistics

## Example Output

```
[2024-01-15T10:30:00.000Z] 🚀 Starting TBO Database Population Script
[2024-01-15T10:30:00.000Z] ==========================================

[2024-01-15T10:30:00.000Z] 📋 Step 1: Populating Countries
[2024-01-15T10:30:01.000Z] Starting countries population...
[2024-01-15T10:30:02.000Z] ✅ Countries populated successfully: 195 countries

[2024-01-15T10:30:02.000Z] 🏙️  Step 2: Populating Cities
[2024-01-15T10:30:02.000Z] Found 195 countries in database
[2024-01-15T10:30:02.000Z] Processing countries batch 1/20
[2024-01-15T10:30:03.000Z] Populating cities for country: IN
[2024-01-15T10:30:04.000Z] ✅ Cities populated for IN: 150 cities
...
```

## Troubleshooting

### Common Issues

1. **API Authentication Errors**: Check your TBO API credentials
2. **Database Connection Issues**: Verify database configuration
3. **Rate Limiting**: Increase `DELAY_BETWEEN_REQUESTS` if needed
4. **Memory Issues**: Reduce `BATCH_SIZE` if processing large datasets

### Debug Mode

To run with more verbose logging, you can modify the script to include additional debug information.

## Performance Considerations

- The script processes data in batches to avoid memory issues
- Delays between API calls prevent rate limiting
- Database operations use bulk inserts for efficiency
- Error handling ensures the script continues even with partial failures

## Monitoring

The script provides real-time progress updates and final statistics to help you monitor the population process.

## Support

If you encounter issues:

1. Check the logs for specific error messages
2. Verify API credentials and database connectivity
3. Ensure all required environment variables are set
4. Consider running with a smaller dataset first (specific country/city) 