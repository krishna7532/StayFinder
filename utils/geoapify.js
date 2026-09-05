const getCoordinates = async ({ location, country, pin }) => {
    const apiKey = process.env.GEOAPIFY_API_KEY;
/**
 * Geocoding utility using Geoapify API.
 * Converts location and country to geographic coordinates (lon, lat).
 * Kept strictly server-side to protect API credentials.
 */

    if (!apiKey) {
        throw new Error("Geoapify API key is missing");
    }
const getCoordinates = async ({ location, country, pin } = {}) => {
    try {
        const apiKey = process.env.GEOAPIFY_API_KEY;

    const address = `${location}, ${country}, ${pin}`;
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&format=json&limit=1&apiKey=${apiKey}`;
    const response = await fetch(url);
        if (!apiKey) {
            console.error("Geoapify Geocoding: GEOAPIFY_API_KEY environment variable is missing.");
            return null;
        }

    if (!response.ok) {
        throw new Error("Geoapify geocoding request failed");
    }
        // Build clean search query without undefined or empty values
        const queryParts = [];
        if (location && typeof location === "string" && location.trim().length > 0) {
            queryParts.push(location.trim());
        }
        if (country && typeof country === "string" && country.trim().length > 0) {
            queryParts.push(country.trim());
        }
        if (pin && typeof pin === "string" && pin.trim().length > 0) {
            queryParts.push(pin.trim());
        }

    const data = await response.json();
        if (queryParts.length === 0) {
            return null;
        }

    if (!data.results || data.results.length === 0) {
        throw new Error("Geoapify could not find this location");
        const searchText = queryParts.join(", ");
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchText)}&format=json&limit=1&apiKey=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Geoapify geocoding HTTP error: status ${response.status}`);
            return null;
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            return null;
        }

        const result = data.results[0];
        if (typeof result.lon !== "number" || typeof result.lat !== "number") {
            return null;
        }

        return {
            type: "Point",
            coordinates: [result.lon, result.lat], // GeoJSON standard: [longitude, latitude]
            formattedAddress: result.formatted || searchText,
        };
    } catch (err) {
        console.error("Geoapify geocoding request error:", err.message);
        return null;
    }

    return {
        type: "Point",
        coordinates: [data.results[0].lon, data.results[0].lat],
    };
};

module.exports = { getCoordinates };
