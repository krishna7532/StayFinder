/**
 * Client-side map initialization using Leaflet.
 * Requests raster map tiles via the secure backend proxy (/api/tiles/...)
 * ensuring that the GEOAPIFY_API_KEY is never exposed in browser source code.
 */
document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const lat = parseFloat(mapElement.dataset.lat);
    const lng = parseFloat(mapElement.dataset.lng);
    const title = mapElement.dataset.title || "Listing Location";
    const location = mapElement.dataset.location || "";

    // If coordinates are missing, invalid, or default (0, 0)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        mapElement.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100 bg-light rounded text-muted">
                <p class="mb-0"><i class="fa-solid fa-circle-exclamation me-2"></i>Map location could not be found.</p>
            </div>
        `;
        return;
    }

    // Initialize Leaflet map
    const map = L.map("map", {
        scrollWheelZoom: false,
    }).setView([lat, lng], 13);

    // Fetch tiles through secure backend proxy (Geoapify osm-bright)
    L.tileLayer("/api/tiles/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Reliable standard Leaflet pin marker icon
    const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    const popupContent = `
        <div style="font-family: inherit; min-width: 160px;">
            <h6 style="margin: 0 0 4px 0; font-weight: 600; color: #222;">${title}</h6>
            <p style="margin: 0 0 6px 0; color: #666; font-size: 0.85rem;">${location}</p>
            <span style="display: inline-block; font-size: 0.75rem; color: #fe424d; font-weight: 500;">Exact location provided after booking</span>
        </div>
    `;

    marker.bindPopup(popupContent).openPopup();
});

