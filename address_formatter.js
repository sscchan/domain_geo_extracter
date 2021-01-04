module.exports = function formatAddress(addressLine1, addressLine2) {
    // AddressLine1 always have dangling comma + space that we want to remove
    // e.g "8-10 Divett Street, " -> "8-10 Divett Street"

    if (addressLine1 !== null) {
        streetAddress = addressLine1.substring(0, addressLine1.length - 2);
    } else {
        streetAddress = null;
    }
    return {
        streetAddress: streetAddress,
        postCode: addressLine2.substring(addressLine2.length - 4, addressLine2.length),
        suburb: addressLine2.substring(0, addressLine2.length - 8),
        state: addressLine2.substring(addressLine2.length - 7, addressLine2.length - 5)
    }
}
