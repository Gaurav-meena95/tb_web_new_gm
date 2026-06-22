const axios = require('axios');
const xlsx = require('xlsx');
const fs = require('fs');

const airportInfo = require("../utility/models/air_port_info");

const INPUT_FILE = 'airports.xlsx';
const OUTPUT_FILE = 'airport_coordinates.xlsx';

// Function to get latitude and longitude using Google Places API
async function getCoordinates(airportCode) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
            params: {
                input: airportCode,
                inputtype: 'textquery',
                fields: 'geometry',
                key: process.env.GOOGLE_MAPS_KEY
            }
        });
        const data = response.data;
        if (data.candidates && data.candidates.length > 0) {
            const { lat, lng } = data.candidates[0].geometry.location;
            console.log('lat and long', lat +  ' - ' + lng);
            return { lat, lng };
        } else {
            return { lat: null, lng: null };
        }
    } catch (error) {
        console.error(`Error fetching data for ${airportCode}:`, error);
        return { lat: null, lng: null };
    }
}

// Process each airport code
const populateAirportInfo = async (payload) => {

    // Read the Excel file
    const workbook = xlsx.readFile(INPUT_FILE);
    const sheetName = workbook.SheetNames[1];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    /*const workbookairport = xlsx.readFile(OUTPUT_FILE);
    const sheetNameairport = workbookairport.SheetNames[0];
    const worksheetairport = xlsx.utils.sheet_to_json(workbookairport.Sheets[sheetNameairport]);
*/
    console.log('before populating');
    const results = [];
    let bulkRecs = [];
    let addNoOfRows = 15;
    let rowNum = 0;
    let airportLatLngRow = 0;

    async function bulkUpdateAirports(airportData) {
        const updatePromises = airportData.map(async (data) => {
            await airportInfo.update(
                {
                    lat: data.LATITUDE,
                    lng: data.LONGITUDE,
                    airport_timezone: data.TIME_ZONE
                },
                {
                    where: { airport_code: data.AIRPORT_CODE, lat: 0},
                }
            );
            console.log('airport code', data.code);
        });
    
        await Promise.all(updatePromises);
    }
    
    bulkUpdateAirports(worksheet)
        .then(() => console.log('Bulk update successful'))
        .catch(err => console.error('Bulk update failed:', err));
    
    /*
    for (const row of worksheet) {
        //if (addNoOfRows > 0){
            //addNoOfRows--;
            const airportCode = row['AIRPORTCODE'];
            airportLatLngRow = worksheetairport[rowNum];
            console.log(JSON.stringify(airportLatLngRow));
            rowNum++;
            //const coordinates = await getCoordinates(airportCode);
            bulkRecs.push({
                "airport_name": row['AIRPORTNAME'] ? row['AIRPORTNAME'] : "",
                "airport_code": row['AIRPORTCODE'] ? row['AIRPORTCODE'] : "",
                "lat": row['LATITUDE'] ? row['LATITUDE'] : 0 ,
                "lng": row['LONGITUDE'] ? row['Longitude'] : 0,
                "city_code":row['CITYCODE'] ? row['CITYCODE'] : "",
                "city_name":row['CITYNAME'] ? row['CITYNAME'] : "",
                "country_code":row['COUNTRYCODE'] ? row['COUNTRYCODE'] : "",
                "country_name":row['COUNTRYNAME'] ? row['COUNTRYNAME'] : ""
            });

            const updatedRec = await writeSeqInstance.query(
                "update msg_dashboard_job_history set no_of_users_received = no_of_users_received + $1, job_status = 'inprogress' where msg_job_id = $2",
                { bind: [chunk.length, data.messageJobId], type: QueryTypes.UPDATE}
            );

            //results.push({ AirportCode: airportCode, Latitude: coordinates.lat, Longitude: coordinates.lng });
        //}
    }

    console.log('before bulk insert');

    // wait for 2 secs
    await new Promise(resolve => setTimeout(resolve, 10000));
    airportInfo.bulkCreate(
        bulkRecs
    ).then(() => { // Notice: There are no arguments here, as of right now you'll have to...
        return airportInfo.findAll();
    }).then(airport => {
        console.log(airport) // ... in order to get the array of airport objects
    }).catch(error => {
        console.error('Bulk insert failed:', error);
    }); */

    // Write the results to a new Excel file
    /*const newSheet = xlsx.utils.json_to_sheet(results);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Coordinates');
    xlsx.writeFile(newWorkbook, OUTPUT_FILE);
    */
    console.log('Coordinates saved to', OUTPUT_FILE);
};


module.exports = populateAirportInfo;