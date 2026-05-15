import { api } from "../../lib/api";

export type Weather = {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    city: string;
    country: string;
};

type WeatherApiResponse = {
    weather: Weather;
};

export async function getWeatherRequest(
    latitude: number,
    longitude: number
) {
    const response = await api.get<WeatherApiResponse>(
        `/weather/current?latitude=${latitude}&longitude=${longitude}`
    );

    return response.data;
}