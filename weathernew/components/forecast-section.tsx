import { Calendar, Droplets, Thermometer } from "lucide-react"

interface ForecastSectionProps {
  forecastDays: any[]
}

export default function ForecastSection({ forecastDays }: ForecastSectionProps) {
  // Skip the first day if it's today's forecast (already shown in current weather)
  const daysToShow = forecastDays.length > 1 ? forecastDays.slice(1) : forecastDays

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">5-Day Forecast</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {daysToShow.map((forecastDay) => (
          <div
            key={forecastDay.date}
            className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 flex flex-col items-center border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-blue-500 mr-1" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date(forecastDay.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="relative">
              <img
                src={`https:${forecastDay.day.condition.icon}`}
                alt={forecastDay.day.condition.text}
                className="w-16 h-16 my-2 drop-shadow-md"
              />
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
              {forecastDay.day.condition.text}
            </p>

            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {forecastDay.day.maxtemp_c}°
                </span>
              </div>

              <div className="flex items-center">
                <Thermometer className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {forecastDay.day.mintemp_c}°
                </span>
              </div>
            </div>

            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
              <Droplets className="h-4 w-4 text-blue-400 mr-1" />
              <span className="text-xs">{forecastDay.day.daily_chance_of_rain}% rain</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

