const tboHotels = require('./app/third_party_api/tbo/tbo_hotels');
const appConstants = require('./app/constants');
const utils = require('./app/utils');

// Configuration
const BATCH_SIZE = 10; // Process cities in batches to avoid overwhelming the API
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between API calls

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to log with timestamp
const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// Helper function to handle errors gracefully
const handleError = (error, context) => {
    log(`ERROR in ${context}: ${error.message}`);
    return { success: false, error: error.message };
};

// Populate countries
async function populateCountries() {
    log('Starting countries population...');
    try {
        const result = await tboHotels.populateCountriesToDB();
        if (result.status === 'success') {
            log(`✅ Countries populated successfully: ${result.object.count} countries`);
            return { success: true, count: result.object.count };
        } else {
            log(`❌ Failed to populate countries: ${result.message}`);
            return { success: false, error: result.message };
        }
    } catch (error) {
        return handleError(error, 'populateCountries');
    }
}

// Populate cities for a specific country
async function populateCitiesForCountry(countryCode) {
    try {
        log(`Populating cities for country: ${countryCode}`);
        const result = await tboHotels.populateCitiesToDB(countryCode);
        if (result.status === 'success') {
            log(`✅ Cities populated for ${countryCode}: ${result.object.count} cities`);
            return { success: true, count: result.object.count };
        } else {
            log(`❌ Failed to populate cities for ${countryCode}: ${result.message}`);
            return { success: false, error: result.message };
        }
    } catch (error) {
        return handleError(error, `populateCitiesForCountry(${countryCode})`);
    }
}

// Populate hotel codes for a specific city
async function populateHotelCodesForCity(cityCode, countryCode) {
    try {
        log(`Populating hotel codes for city: ${cityCode}`);
        const result = await tboHotels.populateHotelCodesToDB(cityCode, countryCode);
        if (result.status === 'success') {
            log(`✅ Hotel codes populated for ${cityCode}: ${result.object.count} hotels`);
            return { success: true, count: result.object.count };
        } else {
            log(`❌ Failed to populate hotel codes for ${cityCode}: ${result.message}`);
            return { success: false, error: result.message };
        }
    } catch (error) {
        return handleError(error, `populateHotelCodesForCity(${cityCode})`);
    }
}

// Populate hotel details for a specific city
async function populateHotelDetailsForCity(cityCode) {
    try {
        log(`Populating hotel details for city: ${cityCode}`);
        const result = await tboHotels.populateHotelDetailsToDB(cityCode);
        if (result.status === 'success') {
            log(`✅ Hotel details populated for ${cityCode}: ${result.object.count} hotels`);
            return { success: true, count: result.object.count };
        } else {
            log(`❌ Failed to populate hotel details for ${cityCode}: ${result.message}`);
            return { success: false, error: result.message };
        }
    } catch (error) {
        return handleError(error, `populateHotelDetailsForCity(${cityCode})`);
    }
}

// Get countries from database
async function getCountriesFromDB() {
    try {
        const result = await tboHotels.getCountriesFromDB({});
        if (result.status === 'success') {
            return result.object.countries;
        } else {
            log(`❌ Failed to get countries from DB: ${result.message}`);
            return [];
        }
    } catch (error) {
        log(`ERROR getting countries from DB: ${error.message}`);
        return [];
    }
}

// Get cities for a country from database
async function getCitiesFromDB(countryCode) {
    try {
        const result = await tboHotels.getCitiesFromDB({ countryCode });
        if (result.status === 'success') {
            return result.object.cities;
        } else {
            log(`❌ Failed to get cities for ${countryCode} from DB: ${result.message}`);
            return [];
        }
    } catch (error) {
        log(`ERROR getting cities for ${countryCode} from DB: ${error.message}`);
        return [];
    }
}

// Main population function
async function populateTboDatabase() {
    log('🚀 Starting TBO Database Population Script');
    log('==========================================');

    // Step 1: Populate Countries
    log('\n📋 Step 1: Populating Countries');
    const countriesResult = await populateCountries();
    if (!countriesResult.success) {
        log('⚠️  Countries population failed, but continuing...');
    }

    // Step 2: Get countries and populate cities
    log('\n🏙️  Step 2: Populating Cities');
    const countries = await getCountriesFromDB();
    log(`Found ${countries.length} countries in database`);

    let totalCitiesProcessed = 0;
    let totalCitiesSuccess = 0;
    let totalCitiesFailed = 0;

    // Process countries in batches
    for (let i = 0; i < countries.length; i += BATCH_SIZE) {
        const batch = countries.slice(i, i + BATCH_SIZE);
        log(`Processing countries batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(countries.length/BATCH_SIZE)}`);

        for (const country of batch) {
            try {
                const result = await populateCitiesForCountry(country.country_code);
                totalCitiesProcessed++;
                if (result.success) {
                    totalCitiesSuccess++;
                } else {
                    totalCitiesFailed++;
                }
                
                // Add delay between requests
                await delay(DELAY_BETWEEN_REQUESTS);
            } catch (error) {
                totalCitiesProcessed++;
                totalCitiesFailed++;
                log(`❌ Error processing country ${country.country_code}: ${error.message}`);
            }
        }
    }

    log(`\n📊 Cities Population Summary:`);
    log(`Total processed: ${totalCitiesProcessed}`);
    log(`Successful: ${totalCitiesSuccess}`);
    log(`Failed: ${totalCitiesFailed}`);

    // Step 3: Populate Hotel Codes and Details
    log('\n🏨 Step 3: Populating Hotel Data');
    let totalHotelsProcessed = 0;
    let totalHotelsSuccess = 0;
    let totalHotelsFailed = 0;

    for (const country of countries) {
        try {
            const cities = await getCitiesFromDB(country.country_code);
            log(`Processing ${cities.length} cities for country ${country.country_code}`);

            for (const city of cities) {
                try {
                    // Populate hotel codes
                    const hotelCodesResult = await populateHotelCodesForCity(city.city_code, country.country_code);
                    totalHotelsProcessed++;
                    if (hotelCodesResult.success) {
                        totalHotelsSuccess++;
                        
                        // Populate hotel details
                        const hotelDetailsResult = await populateHotelDetailsForCity(city.city_code);
                        if (hotelDetailsResult.success) {
                            log(`✅ Hotel details populated for ${city.city_name}`);
                        } else {
                            log(`❌ Failed to populate hotel details for ${city.city_name}`);
                        }
                    } else {
                        totalHotelsFailed++;
                    }

                    // Add delay between requests
                    await delay(DELAY_BETWEEN_REQUESTS);
                } catch (error) {
                    totalHotelsProcessed++;
                    totalHotelsFailed++;
                    log(`❌ Error processing city ${city.city_code}: ${error.message}`);
                }
            }
        } catch (error) {
            log(`❌ Error processing country ${country.country_code}: ${error.message}`);
        }
    }

    log(`\n📊 Hotel Data Population Summary:`);
    log(`Total processed: ${totalHotelsProcessed}`);
    log(`Successful: ${totalHotelsSuccess}`);
    log(`Failed: ${totalHotelsFailed}`);

    // Final Summary
    log('\n🎉 TBO Database Population Complete!');
    log('=====================================');
    log(`Countries: ${countriesResult.success ? '✅ Success' : '❌ Failed'}`);
    log(`Cities: ${totalCitiesSuccess}/${totalCitiesProcessed} successful`);
    log(`Hotels: ${totalHotelsSuccess}/${totalHotelsProcessed} successful`);
}

// Function to populate specific country (for testing)
async function populateSpecificCountry(countryCode) {
    log(`🎯 Populating specific country: ${countryCode}`);
    
    try {
        // Populate cities for the country
        const citiesResult = await populateCitiesForCountry(countryCode);
        if (!citiesResult.success) {
            log(`❌ Failed to populate cities for ${countryCode}`);
            return;
        }

        // Get cities and populate hotel data
        const cities = await getCitiesFromDB(countryCode);
        log(`Found ${cities.length} cities for ${countryCode}`);

        for (const city of cities) {
            try {
                // Populate hotel codes
                const hotelCodesResult = await populateHotelCodesForCity(city.city_code, countryCode);
                if (hotelCodesResult.success) {
                    // Populate hotel details
                    await populateHotelDetailsForCity(city.city_code);
                }
                
                await delay(DELAY_BETWEEN_REQUESTS);
            } catch (error) {
                log(`❌ Error processing city ${city.city_code}: ${error.message}`);
            }
        }

        log(`✅ Completed population for country: ${countryCode}`);
    } catch (error) {
        log(`❌ Error populating country ${countryCode}: ${error.message}`);
    }
}

// Function to populate specific city (for testing)
async function populateSpecificCity(cityCode, countryCode) {
    log(`🎯 Populating specific city: ${cityCode}`);
    
    try {
        // Populate hotel codes
        const hotelCodesResult = await populateHotelCodesForCity(cityCode, countryCode);
        if (hotelCodesResult.success) {
            // Populate hotel details
            await populateHotelDetailsForCity(cityCode);
            log(`✅ Completed population for city: ${cityCode}`);
        } else {
            log(`❌ Failed to populate hotel codes for ${cityCode}`);
        }
    } catch (error) {
        log(`❌ Error populating city ${cityCode}: ${error.message}`);
    }
}

// Export functions for use in other scripts
module.exports = {
    populateTboDatabase,
    populateSpecificCountry,
    populateSpecificCity,
    populateCountries,
    populateCitiesForCountry,
    populateHotelCodesForCity,
    populateHotelDetailsForCity
};

// Run the script if called directly
if (require.main === module) {
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Run full population
        populateTboDatabase()
            .then(() => {
                log('✅ Script completed successfully');
                process.exit(0);
            })
            .catch((error) => {
                log(`❌ Script failed: ${error.message}`);
                process.exit(1);
            });
    } else if (args.length === 1) {
        // Populate specific country
        const countryCode = args[0];
        populateSpecificCountry(countryCode)
            .then(() => {
                log('✅ Script completed successfully');
                process.exit(0);
            })
            .catch((error) => {
                log(`❌ Script failed: ${error.message}`);
                process.exit(1);
            });
    } else if (args.length === 2) {
        // Populate specific city
        const cityCode = args[0];
        const countryCode = args[1];
        populateSpecificCity(cityCode, countryCode)
            .then(() => {
                log('✅ Script completed successfully');
                process.exit(0);
            })
            .catch((error) => {
                log(`❌ Script failed: ${error.message}`);
                process.exit(1);
            });
    } else {
        log('Usage:');
        log('  node populate_tbo_database.js                    # Populate all data');
        log('  node populate_tbo_database.js <country_code>     # Populate specific country');
        log('  node populate_tbo_database.js <city_code> <country_code>  # Populate specific city');
        process.exit(1);
    }
} 