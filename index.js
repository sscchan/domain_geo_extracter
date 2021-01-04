const fs = require('fs');
const path = require('path');

const puppeteer = require('puppeteer');

const extractDataFromPage = require('./pageDataExtract.js');
const formatAddress = require('./address_formatter.js');
const CachedGeocoder = require('./cached_geocoder.js');
const GEOCODER_API_KEY = require('./secrets/geocoder_API_key.js');

const searchUrlPrefix = "https://www.domain.com.au/sale/?suburb=largs-bay-sa-5016,semaphore-sa-5019&bedrooms=3-any&bathrooms=1-any&price=0-600000&excludeunderoffer=1&carspaces=1-any&page=";

const HEADLESS_MODE = false;
const MAX_PAGE_NUMBER = 100;

const GEOCODE_CACHE_FILEPATH = "./geocode_cache.json";
const OUTPUT_JSON_FILEPATH = "./output.json";

(async () => {

    const geocoder = new CachedGeocoder(GEOCODE_CACHE_FILEPATH, GEOCODER_API_KEY);

    const browser = await puppeteer.launch({ 
        headless: HEADLESS_MODE
    });
    const page = await browser.newPage();

    let extractionResults = [];

    let currentPageNumber = 1;

    do {
        await page.goto(searchUrlPrefix + currentPageNumber, {waitUntil: 'domcontentloaded', timeout: 0});

        let isLastPage = await page.evaluate(hasNoResults);
        if (isLastPage) break;
        
        const pageExtractionResults = await page.evaluate(extractDataFromPage);

        extractionResults = extractionResults.concat(pageExtractionResults);

        console.log('Processing results page: ' + currentPageNumber)

        currentPageNumber++;
    } while (currentPageNumber < MAX_PAGE_NUMBER);
    
    await browser.close();
    
    let extractionResultsWithFormattedAddress = extractionResults.map(result => {
        return {...result, ...formatAddress(result.address1, result.address2)};
    });

    extractionResultsWithFormattedAddress = extractionResultsWithFormattedAddress.filter(result => result.address1 !== null);

    let extractedResultsWithCoordinates = extractionResultsWithFormattedAddress.map(result => {
        return {...result, ...geocoder.getCoordinates(result.streetAddress, result.suburb, result.state, result.postCode)};
    });

    console.log(extractedResultsWithCoordinates);

    geocoder.saveToCache();

    fs.writeFileSync(OUTPUT_JSON_FILEPATH, JSON.stringify(extractedResultsWithCoordinates));
    
})();



/**
 * Checks to see if the page contains no results.
 */
function hasNoResults() {
    return document.querySelectorAll('[alt="No search results"]').length !== 0
}


function noOp() {
    return []
}
