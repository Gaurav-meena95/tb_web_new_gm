require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.API_KEY;
const apiUrl = 'https://api.thehosteller.com/rest/v1/partner/';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(null, async (error) => {
    const { config, response } = error;
    const maxRetries = 3;
    let retryCount = config.__retryCount || 0;

    if (retryCount >= maxRetries) {
        return Promise.reject(error);
    }

    if (response && (response.status === 429 || response.status >= 500)) {
        retryCount += 1;
        config.__retryCount = retryCount;

        const backoff = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000 * Math.pow(2, retryCount));
        });

        await backoff;
        return axiosInstance(config);
    }

    return Promise.reject(error);
});

async function getAllHostellers(){
    let responseObject = {};
    await axiosInstance.get(apiUrl + 'hostel-details', {
        headers: {
            //'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        }
    })
    .then(response => {
        responseObject = { status: "success", "responseCode": response.status, object: response.data };
    })
    .catch(error => {
        responseObject = { status: "error", "responseCode": 400, message: error.message };
    });
    return responseObject;
}

async function getHostellersFromLocation(locationName){
    let responseObject = {};
    await axiosInstance.get(apiUrl + 'destination?destination=' + locationName, {
        headers: {
            //'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        }
    })
    .then(response => {
        responseObject = { status: "success", "responseCode": response.status, object: response.data };
    })
    .catch(error => {
        responseObject = { status: "error", "responseCode": 400, message: error.message };
    });
    return responseObject;
}

async function getNewHostellers(locationName){
    let responseObject = {};
    await axiosInstance.get(apiUrl + 'destination?destination=new', {
        headers: {
            //'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        }
    })
    .then(response => {
        responseObject = { status: "success", "responseCode": response.status, object: response.data };
    })
    .catch(error => {
        responseObject = { status: "error", "responseCode": 400, message: error.message };
    });
    return responseObject;
}

module.exports = {
    getAllHostellers: getAllHostellers,
    getHostellersFromLocation: getHostellersFromLocation,
    getNewHostellers: getNewHostellers
};
