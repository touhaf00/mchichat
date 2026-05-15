type OpenMeteoResponse = {
    current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number;
    };
};

type ReverseGeoResponse = {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
};

export async function getCurrentWeather(
    latitude: number,
    longitude: number
) {
    const weatherUrl = new URL(
        "https://api.open-meteo.com/v1/forecast"
    );

    weatherUrl.searchParams.set(
        "latitude",
        latitude.toString()
    );

    weatherUrl.searchParams.set(
        "longitude",
        longitude.toString()
    );

    weatherUrl.searchParams.set(
        "current",
        [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code",
        ].join(",")
    );

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
        throw new Error(
            "Impossible de récupérer la météo"
        );
    }

    const weatherData =
        (await weatherResponse.json()) as OpenMeteoResponse;

    const geoUrl = new URL(
        "https://nominatim.openstreetmap.org/reverse"
    );

    geoUrl.searchParams.set(
        "lat",
        latitude.toString()
    );

    geoUrl.searchParams.set(
        "lon",
        longitude.toString()
    );

    geoUrl.searchParams.set("format", "json");

    const geoResponse = await fetch(geoUrl, {
        headers: {
            "User-Agent": "Mchichat",
        },
    });

    let city = "Position inconnue";
    let country = "";

    if (geoResponse.ok) {
        const geoData = (await geoResponse.json()) as {
            address?: ReverseGeoResponse;
        };

        city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            "Position inconnue";

        country =
            geoData.address?.country || "";
    }

    return {
        temperature:
        weatherData.current.temperature_2m,

        apparentTemperature:
        weatherData.current.apparent_temperature,

        humidity:
        weatherData.current.relative_humidity_2m,

        windSpeed:
        weatherData.current.wind_speed_10m,

        weatherCode:
        weatherData.current.weather_code,

        city,
        country,
    };
}