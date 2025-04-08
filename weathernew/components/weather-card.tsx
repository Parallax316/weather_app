import { Clock, Droplets, Thermometer, Wind } from "lucide-react"

interface WeatherCardProps {
  weatherData: any
  isHistorical?: boolean
}

export default function WeatherCard({ weatherData, isHistorical = false }: WeatherCardProps) {
  const { location, current, forecast } = weatherData

  // For historical data, we use the first day in the forecast
  const historicalDay = isHistorical && forecast?.forecastday?.[0]?.day

  if (!location) return null

  let backgroundImageUrl = "/morning.jpg"; // Default

  if (location.localtime) {
    try {
      // Extract hour (assuming format YYYY-MM-DD HH:MM)
      const timeString = location.localtime.split(" ")[1];
      const hour = parseInt(timeString.split(":")[0], 10);

      // Set background based on hour
      if (hour >= 5 && hour < 12) {
        backgroundImageUrl = "/morning.jpg";
      } else if (hour >= 12 && hour < 16) { // 12 PM to 3:59 PM
        backgroundImageUrl = "/noon.jpg";
      } else if (hour >= 16 && hour < 20) { // 4 PM to 7:59 PM
        backgroundImageUrl = "/evening.jpg";
      } else { // 8 PM to 4:59 AM
        backgroundImageUrl = "/night.jpg";
      }

    } catch (e) {
       console.error("Error parsing location localtime:", location.localtime, e);
       // Keep default background in case of parsing error
    }
  }

  return (
    <div
      className="rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden transition-all duration-300 hover:shadow-2xl bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10"> {/* Content Wrapper */}
        <div className="px-6 py-6 relative overflow-hidden text-white">
          <div className="relative">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold drop-shadow-md">
                  {location.name}, {location.region}, {location.country}
                </h2>
                <p className="text-gray-200 flex items-center mt-1 text-sm drop-shadow-sm">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {location.localtime}
                </p>
              </div>
              {weatherData.ai_summary && !isHistorical && (
                <div className="mt-1 p-3 bg-white/10 rounded-lg backdrop-blur-sm max-w-xs ml-4">
                  <p className="text-sm italic">{weatherData.ai_summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 text-gray-800 dark:text-gray-200">
          {isHistorical ? (
            <div className="flex flex-col items-center text-white">
              <h3 className="text-lg font-semibold mb-4">
                Historical Weather for {forecast.forecastday[0].date}
              </h3>
              {historicalDay.condition && (
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={`https:${historicalDay.condition.icon}`}
                    alt={historicalDay.condition.text}
                    className="w-20 h-20 filter drop-shadow-lg"
                  />
                  <p className="mt-1">{historicalDay.condition.text}</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
                <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm p-4 rounded-lg text-center shadow-sm border border-white/10">
                  <Thermometer className="h-5 w-5 mx-auto text-red-400" />
                  <p className="text-xs mt-1">Avg Temp</p>
                  <p className="text-lg font-semibold">{historicalDay.avgtemp_c}°C</p>
                </div>
                <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm p-4 rounded-lg text-center shadow-sm border border-white/10">
                  <Thermometer className="h-5 w-5 mx-auto text-orange-400" />
                  <p className="text-xs mt-1">Max Temp</p>
                  <p className="text-lg font-semibold">{historicalDay.maxtemp_c}°C</p>
                </div>
                <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm p-4 rounded-lg text-center shadow-sm border border-white/10">
                  <Thermometer className="h-5 w-5 mx-auto text-blue-400" />
                  <p className="text-xs mt-1">Min Temp</p>
                  <p className="text-lg font-semibold">{historicalDay.mintemp_c}°C</p>
                </div>
                <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm p-4 rounded-lg text-center shadow-sm border border-white/10">
                  <Wind className="h-5 w-5 mx-auto text-teal-400" />
                  <p className="text-xs mt-1">Max Wind</p>
                  <p className="text-lg font-semibold">{historicalDay.maxwind_kph} km/h</p>
                </div>
              </div>
            </div>
          ) : current && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="relative">
                  <img
                    src={`https:${current.condition.icon}`}
                    alt={current.condition.text}
                    className="w-24 h-24 filter drop-shadow-lg"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-4xl md:text-5xl font-bold">
                    {current.temp_c}°C
                  </h3>
                  <p className="text-gray-200">{current.condition.text}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center bg-white/20 dark:bg-black/30 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-white/10">
                  <div className="p-2 rounded-full bg-orange-400/30 text-orange-300">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-300">Feels Like</p>
                    <p className="font-semibold">{current.feelslike_c}°C</p>
                  </div>
                </div>

                <div className="flex items-center bg-white/20 dark:bg-black/30 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-white/10">
                  <div className="p-2 rounded-full bg-teal-400/30 text-teal-300">
                    <Wind className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-300">Wind</p>
                    <p className="font-semibold">{current.wind_kph} km/h</p>
                  </div>
                </div>

                <div className="flex items-center bg-white/20 dark:bg-black/30 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-white/10">
                  <div className="p-2 rounded-full bg-blue-400/30 text-blue-300">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-300">Humidity</p>
                    <p className="font-semibold">{current.humidity}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

