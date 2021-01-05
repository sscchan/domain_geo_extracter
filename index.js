const fs = require('fs');
const path = require('path');

const puppeteer = require('puppeteer');

const extractDataFromPage = require('./pageDataExtract.js');
const formatAddress = require('./address_formatter.js');
const CachedGeocoder = require('./cached_geocoder.js');
const GEOCODER_API_KEY = require('./secrets/geocoder_API_key.js');

const searchUrlPrefix = "https://www.domain.com.au/sale/?suburb=largs-bay-sa-5016,semaphore-sa-5019,semaphore-park-sa-5019,semaphore-south-sa-5019,west-lakes-shore-sa-5020,tennyson-sa-5022,grange-sa-5022,henley-beach-sa-5022,henley-beach-south-sa-5022,west-beach-sa-5024,glenelg-north-sa-5045,glenelg-sa-5045,somerton-park-sa-5044,north-brighton-sa-5048,brighton-sa-5048,seacliff-sa-5049&bedrooms=3-any&bathrooms=1-any&price=0-550000&excludeunderoffer=1&carspaces=1-any&page=";

const HEADLESS_MODE = false;
const MAX_PAGE_NUMBER = 100; // Max 100 page for safety

const GEOCODE_CACHE_FILEPATH = "./geocode_cache.json";
const OUTPUT_CSV_FILEPATH = "./output.csv";

(async () => {

    // Instantiate cached geocoder
    const geocoder = new CachedGeocoder(GEOCODE_CACHE_FILEPATH, GEOCODER_API_KEY);

    // Initiate headless browser
    const browser = await puppeteer.launch({ 
        headless: HEADLESS_MODE
    });
    const page = await browser.newPage();

    let extractionResults = [];
    let currentPageNumber = 1;

    // Loop through paginated results
    do {
        // Navigate to paginated result page
        await page.goto(searchUrlPrefix + currentPageNumber, {waitUntil: 'domcontentloaded', timeout: 0});

        // Check if there are no more results to extract
        let isLastPage = await page.evaluate(hasNoResults);
        if (isLastPage) break;
        
        // Extract data from page
        const pageExtractionResults = await page.evaluate(extractDataFromPage);

        // Append extract data
        extractionResults = extractionResults.concat(pageExtractionResults);

        console.log('Processing results page: ' + currentPageNumber)

        currentPageNumber++;
    } while (currentPageNumber < MAX_PAGE_NUMBER);
    
    await browser.close();
    
    // Format extracted address values to more geocoding API friendly format
    let extractionResultsWithFormattedAddress = extractionResults.map(result => {
        return {...result, ...formatAddress(result.address1, result.address2)};
    });

    extractionResultsWithFormattedAddress = extractionResultsWithFormattedAddress.filter(result => result.address1 !== null);

    // Geocode addresses and merge with result
    let extractedResultsWithCoordinates = extractionResultsWithFormattedAddress.map(result => {
        return {...result, ...geocoder.getCoordinates(result.streetAddress, result.suburb, result.state, result.postCode)};
    });

    console.log(extractedResultsWithCoordinates);

    // Save geocode cache for later use
    geocoder.saveToCache();

    // Write output to CSV file
    fs.writeFileSync(OUTPUT_CSV_FILEPATH, toCSV(extractedResultsWithCoordinates));
    
})();

function toCSV(targets) {
    let csvString = "";
    csvString += "url, price, lat, lon\n"
    
    targets.forEach(target => {
        csvString += '"' + target.url + '","' + target.price + '",' + target.lat + ',' + target.lon + "\n"
    })
    
    return csvString;
}


/**
 * Checks to see if the page contains no results.
 */
function hasNoResults() {
    return document.querySelectorAll('[alt="No search results"]').length !== 0
}
