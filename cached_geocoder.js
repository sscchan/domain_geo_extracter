const fs = require('fs');
const path = require('path');

class CachedGeocoder {
    constructor(cacheFilePath) {
        this.cache = {};
        this.cacheFilePath = cacheFilePath;

        if (fs.existsSync(this.cacheFilePath)) {
            let rawData = fs.readFileSync(this.cacheFilePath);
            this.cache = JSON.parse(rawData);
        }
    }

    saveToCache() {
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache));
    }

    getCoordinatesFromService(streetAddress, suburb, state, postCode) {
        //https://mappify.io/docs///
        // Dummy values at the moment
        return {
            lat: 123.4,
            long: -22.3
        }
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
