/**
 * A function that executes in each search result page to scrap the required information
 */
module.exports = function extractDataFromPage() {
    let resultsNode = Array.from(document.querySelector('[data-testid="results"]').childNodes);

    pageData = resultsNode.map(function (result) {

        let linkNode = result.querySelector('[itemprop="url"]');
        if (linkNode !== null) {
            url = linkNode.href;
        } else {
            url = null;
        }

        let priceNode = result.querySelector('[data-testid="listing-card-price"]');
        if (priceNode !== null) {
            price = priceNode.innerText;
        } else {
            price = null;
        }

        let addressLine1Node = result.querySelector('[data-testid="address-line1"]');
        if (addressLine1Node !== null) {
            addressLine1 = addressLine1Node.innerText;
        } else {
            addressLine1 = null;
        }

        let addressLine2Node = result.querySelector('[data-testid="address-line2"]');
        if (addressLine2Node !== null) {
            addressLine2 = addressLine2Node.innerText;
        } else {
            addressLine2 = null;
        }

        return {
            url: url,
            price: price,
            address1: addressLine1,
            address2: addressLine2
        };
    });

    // Filter out any entries in the results that doesn't have any URL
    // This is to counter side-effect of the querySelector for "results" yielding stray DOM nodes
    pageData = pageData.filter(entry => entry.url !== null);

    return pageData;
}