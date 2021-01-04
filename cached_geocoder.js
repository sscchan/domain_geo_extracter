const fs = require('fs');
const path = require('path');

const request = require('sync-request');


class CachedGeocoder {
    constructor(cacheFilePath, apiKey) {
        this.cache = {};
        this.cacheFilePath = cacheFilePath;
        this.geocoderApiKey = apiKey;

        if (fs.existsSync(this.cacheFilePath)) {
            let rawData = fs.readFileSync(this.cacheFilePath);
            this.cache = JSON.parse(rawData);
        }
    }

    saveToCache() {
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache));
    }

    /**
     *  Geocode using API from https://mappify.io/docs///
     */
    getCoordinatesFromService(streetAddress, suburb, state, postCode) {

        const url = 'https://mappify.io/api/rpc/address/geocode/';
        const payload = {
            "streetAddress": streetAddress,
            "suburb": suburb,
            "postCode": postCode,
            "state": state,
            "apiKey": this.geocoderApiKey
        };

        let response = request(
            'POST',
            url,
            {
                json: payload
            });
        
        let body = JSON.parse(response.getBody('utf8'));
        let coordinates = body.result.location;
        console.log(body);
    
        return coordinates;
    }

    getCoordinates(streetAddress, suburb, state, postCode) {
        let hash = streetAddress + " " + suburb + " " + state + " " + postCode;
        let coordinates;
        if (this.cache[hash] == undefined) {
            console.log("Cache Miss for: " + hash);
            coordinates = this.getCoordinatesFromService(streetAddress, suburb, state, postCode);
            this.cache[hash] = coordinates;
            return coordinates;
        } else {
            console.log("Cache Hit for: " + hash);
            return this.cache[hash];
        }
    }
}

module.exports = CachedGeocoder;
