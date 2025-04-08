"use client"

import React from 'react';
import { useState, useEffect } from "react"
import { Search, History, MapPin, Clock } from "lucide-react"
import WeatherCard from "@/components/weather-card"
import ForecastSection from "@/components/forecast-section"
import AIInsights from "@/components/ai-insights"
import MapDisplay from "@/components/map-display"
import LoadingSpinner from "@/components/loading-spinner"
import ErrorAlert from "@/components/error-alert"
import ThemeToggle from "../components/theme-toggle"
import EditSearchModal from "@/components/edit-search-modal"
import ExportOptions from "@/components/export-options"
import SearchHistoryDialog from "@/components/search-history-dialog"
import SearchDialog from "@/components/search-dialog"
import { Button } from "@/components/ui/button"
import YoutubeSection from "../components/youtube-section"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import InfoTab from "../components/info-tab"

// Add explicit type for weather data
interface WeatherData {
  current: {
    condition: { text: string; icon: string };
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
  };
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
    lat?: number; // Optional based on usage
    lon?: number; // Optional based on usage
  };
  forecast?: {
    forecastday: any[]; // Keep as any for now, or define further
  };
  ai_summary?: string | null;
  ai_activities?: string | null;
  ai_clothing?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  map_api_key?: string; // Changed from google_maps_api_key
  youtube_videos?: {
    videoId: string;
    title: string;
    thumbnailUrl: string;
  }[]; // Add youtube videos array
}

export default function WeatherDashboard() {
  // API response state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Location state
  const [gettingLocation, setGettingLocation] = useState(true)
  const [locationError, setLocationError] = useState("")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Form state
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")

  // Search history state
  const [searchHistory, setSearchHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Google Maps state
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [mapsApiKey, setMapsApiKey] = useState("")

  // Dialog states
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [searchDialogInitialData, setSearchDialogInitialData] = useState<any>(null); // State for pre-filling

  const { theme, setTheme } = useTheme()

  // Fetch search history and get user location on component mount
  useEffect(() => {
    fetchSearchHistory()
    getUserLocation()
  }, [])

  // Load Google Maps API when we have a key
  useEffect(() => {
    if (mapsApiKey && !mapsLoaded) {
      loadGoogleMapsApi()
    }
  }, [mapsApiKey, mapsLoaded])

  // Effect to update body background based on theme
  useEffect(() => {
    const isDark = theme === "dark";
    const imageUrl = isDark ? "url('/dark.jpg')" : "url('/main.jpg')";

    // Apply styles to body
    document.body.style.backgroundImage = imageUrl;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.transition = 'background-image 0.5s ease-in-out';

    // Cleanup function to remove styles
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.transition = '';
    };
  }, [theme]); // Rerun only when theme changes

  const fetchSearchHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await fetch("http://localhost:8000/api/searches")
      if (!response.ok) {
        throw new Error("Failed to fetch search history")
      }
      const data = await response.json()
      setSearchHistory(data)
    } catch (err) {
      console.error("Error fetching search history:", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadGoogleMapsApi = () => {
    if ((window as any).google?.maps || document.querySelector('script[src*="maps.googleapis.com"]')) {
      setMapsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setMapsLoaded(true)
    document.head.appendChild(script)
  }

  const getUserLocation = () => {
    setGettingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setGettingLocation(false)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location details
          const { latitude, longitude } = position.coords

          // First try to get weather directly with coordinates
          await fetchWeatherByCoordinates(latitude, longitude)
        } catch (err: unknown) {
          // Check if err is an Error instance
          if (err instanceof Error) {
            setLocationError(err.message || "Failed to get location details")
          } else {
            setLocationError("An unknown error occurred while getting location details")
          }
          setLoading(false)
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        let errorMessage = "Failed to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access and try again."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }

        setLocationError(errorMessage)
        setGettingLocation(false)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const fetchWeatherByCoordinates = async (latitude: number, longitude: number) => {
    setLoading(true)
    setError("")

    try {
      const url = `http://localhost:8000/api/weather/coordinates?lat=${latitude}&lon=${longitude}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch weather data")
      }

      const data = await response.json()
      setWeatherData(data)

      // Set Maps API key if available
      if (data.map_api_key) {
        setMapsApiKey(data.map_api_key)
      }

      // Refresh search history
      fetchSearchHistory()
    } catch (err: unknown) {
      // Check if err is an Error instance
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred fetching weather by coordinates")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByLocation = async (city: string, state: string, country: string, date: string = "") => {
    setLoading(true)
    setError("")

    try {
      let url = `http://localhost:8000/api/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`

      if (date) {
        url += `&date=${date}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch weather data")
      }

      const data = await response.json()
      setWeatherData(data)

      // Set Maps API key if available
      if (data.map_api_key) {
        setMapsApiKey(data.map_api_key)
      }

      // Refresh search history if this wasn't a historical search
      if (!date || new Date(date).toDateString() === new Date().toDateString()) {
        fetchSearchHistory()
      }
    } catch (err: unknown) {
      // Check if err is an Error instance
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred fetching weather by location")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistoryItem = async (id: string) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`http://localhost:8000/api/searches/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Search record not found")
        }
        throw new Error("Failed to fetch search record")
      }

      const data = await response.json()
      setWeatherData(data.weatherData)
      setHistoryDialogOpen(false)
    } catch (err: unknown) {
      // Check if err is an Error instance
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred viewing history item")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistoryItem = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this search record?")

    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:8000/api/searches/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Search record not found")
        }
        throw new Error("Failed to delete search record")
      }

      // Refresh search history
      fetchSearchHistory()
    } catch (err: unknown) {
      // Check if err is an Error instance
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred deleting history item")
      }
    }
  }

  const handleDeleteMultipleHistoryItems = async (ids: string[]) => {
    if (!ids.length) return

    const confirmed = window.confirm(`Are you sure you want to delete ${ids.length} search records?`)

    if (!confirmed) return

    try {
      setHistoryLoading(true)

      // Delete each item one by one
      for (const id of ids) {
        await fetch(`http://localhost:8000/api/searches/${id}`, {
          method: "DELETE",
        })
      }

      // Refresh search history
      fetchSearchHistory()
    } catch (err: unknown) {
      // Check if err is an Error instance
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred deleting multiple history items")
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleEditHistoryItem = (item: any) => {
    // MODIFIED: Prepare data and open search dialog
    setSearchDialogInitialData({
        city: item.city,
        state: item.state,
        country: item.country,
        date: "" // Default date to empty for current weather
    });
    setHistoryDialogOpen(false);
    setSearchDialogOpen(true);
  }

  const exportWeatherData = (format: 'json' | 'csv') => {
    if (!weatherData) return

    let dataStr = ""
    let filename = `weather-data-${weatherData.location.name}-${new Date().toISOString().split("T")[0]}`

    if (format === "json") {
      // Create a copy of weatherData without the map_api_key
      const exportData = { ...weatherData }
      delete exportData.map_api_key
      dataStr = JSON.stringify(exportData, null, 2)
      filename += ".json"
    } else if (format === "csv") {
      // Create CSV content
      const headers = ["Location", "Date", "Condition", "Temperature", "Feels Like", "Humidity", "Wind"]
      const currentData = [
        `${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`,
        weatherData.location.localtime,
        weatherData.current.condition.text,
        `${weatherData.current.temp_c}°C`,
        `${weatherData.current.feelslike_c}°C`,
        `${weatherData.current.humidity}%`,
        `${weatherData.current.wind_kph} km/h`,
      ]

      dataStr = headers.join(",") + "\n" + currentData.join(",")
      filename += ".csv"
    }

    // Create download link
    const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", filename)
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUseMyLocation = (isInitial: boolean = false) => {
    if (!isInitial) {
      setIsInitialLoad(false); // User manually clicked
      setSearchDialogOpen(false); // Close dialog immediately when button is clicked
    }
    setGettingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          await fetchWeatherByCoordinates(latitude, longitude)
        } catch (err) {
          console.error("Error getting location:", err)
          setLocationError("Failed to get location details")
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        let errorMessage = "Failed to get your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access and try again."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        console.error("Geolocation error:", error)
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = new URL("http://localhost:8000/api/weather")
      url.searchParams.append("city", city)
      url.searchParams.append("state", state)
      url.searchParams.append("country", country)

      const response = await fetch(url.toString())
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch weather data")
      }

      const data = await response.json()
      
      // Set the Maps API key from the response
      if (data.map_api_key) {
        setMapsApiKey(data.map_api_key)
      }

      setWeatherData(data)
    } catch (err) {
      console.error("Error fetching weather:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
            Weather Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </Button>
              </DialogTrigger>
            </Dialog>

            <Sheet open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm">
                  <History className="h-4 w-4 mr-1.5" />
                  History
                </Button>
              </SheetTrigger>
            </Sheet>

            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {gettingLocation ? "Getting your location..." : "Loading weather data..."}
              </p>
            </div>
          ) : error || locationError ? (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8 max-w-lg">
              <ErrorAlert message={error || locationError} />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setSearchDialogOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search for a Location
                </button>
              </div>
            </div>
          ) : weatherData ? (
            <div className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden w-full max-w-5xl">
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {/* Weather Card */}
                <WeatherCard weatherData={weatherData} isHistorical={false} />

                {/* Export Options */}
                <div className="mt-4">
                  <ExportOptions onExport={exportWeatherData} />
                </div>

                {/* 5-Day Forecast */}
                {weatherData.forecast && weatherData.forecast.forecastday?.length > 1 && (
                  <div className="mt-6">
                    <ForecastSection forecastDays={weatherData.forecast.forecastday} />
                  </div>
                )}

                {/* AI Insights */}
                {(weatherData.ai_summary || weatherData.ai_activities || weatherData.ai_clothing) && (
                  <div className="mt-6">
                    <AIInsights
                      summary={weatherData.ai_summary}
                      activities={weatherData.ai_activities}
                      clothing={weatherData.ai_clothing}
                    />
                  </div>
                )}

                {/* YouTube Section */}
                {weatherData.youtube_videos && weatherData.youtube_videos.length > 0 && (
                  <div className="mt-6">
                    <YoutubeSection videos={weatherData.youtube_videos} />
                  </div>
                )}

                {/* Map Display */}
                {weatherData.latitude && weatherData.longitude && (
                  <div className="mt-6">
                    <MapDisplay
                      latitude={weatherData.latitude}
                      longitude={weatherData.longitude}
                      isLoaded={mapsLoaded}
                      locationName={weatherData.location?.name}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8 text-center">
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                No weather data available. Please search for a location.
              </p>
              <button
                onClick={() => setSearchDialogOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 mx-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                Search for a Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* InfoTab - Placed outside the main container */}
      <InfoTab />

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onClose={() => { setSearchDialogOpen(false); setSearchDialogInitialData(null); }}
        onSearch={fetchWeatherByLocation}
        onUseMyLocation={handleUseMyLocation}
        initialData={searchDialogInitialData}
      />

      {/* Search History Dialog */}
      <SearchHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        history={searchHistory}
        loading={historyLoading}
        onViewItem={handleViewHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onEditItem={handleEditHistoryItem}
        onDeleteMultiple={handleDeleteMultipleHistoryItems}
      />
    </div>
  )
}

