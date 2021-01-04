const puppeteer = require('puppeteer');
const extractDataFromPage = require('./pageDataExtract.js');
const formatAddress = require('./address_formatter.js');

const searchUrlPrefix = "https://www.domain.com.au/sale/?suburb=largs-bay-sa-5016,semaphore-sa-5019&bedrooms=3-any&bathrooms=1-any&price=0-600000&excludeunderoffer=1&carspaces=1-any&page=";
const MAX_PAGE_NUMBER = 100;
const HEADLESS_MODE = false;

(async () => {
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
    
    // console.log(extractionResults);

    let extractionResultsWithFormattedAddress = extractionResults.map(result => {
        return {...result, ...formatAddress(result.address1, result.address2)};
    })

    console.log(extractionResultsWithFormattedAddress);
})();



/**
 * Checks to see if the page contains no results.
 */
function hasNoResults() {
    return document.querySelectorAll('[alt="No search results"]').length !== 0
}


function noOp() {
    return {}
}

/**
 * Selector for URL to individual property pages
 * document.querySelector('[data-testid="results"]').querySelectorAll('[itemprop="url"]')
 * Array.from(document.querySelector('[data-testid="results"]').querySelectorAll('[itemprop="url"]')).map(url => url.href)
 * 
 * Selector for Price to properties
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="listing-card-price"]')
 * 
 * 
 * Selector for parent elements containing property features (bed, bath & carpark)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="property-features-wrapper"]')
 * 
 * Selector for Address (Street Name)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="address-line1"]')
 * 
 * Selector for Address (Suburb)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="address-line2"]')
 * 
 * Selector for when there are no result in the paginated page
 * document.querySelectorAll('[alt="No search results"]')
 */