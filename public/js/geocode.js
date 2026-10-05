const location = "Jaipur, Rajasthan";

const url =
  "https://nominatim.openstreetmap.org/search?" +
  new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: 1,
    countrycodes: "in"
  });

const response = await fetch(url, {
  headers: {
    "User-Agent": "YourAppName/1.0"
  }
});

const data = await response.json();

console.log(data);