"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, X } from "lucide-react"
import ErrorAlert from "./error-alert"

interface SearchDialogProps {
  open: boolean
  onClose: () => void
  onSearch: (city: string, state: string, country: string, date?: string) => void
  onUseMyLocation: () => void
  initialData?: {
    city: string;
    state: string;
    country: string;
    date?: string;
  } | null;
}

export default function SearchDialog({ open, onClose, onSearch, onUseMyLocation, initialData }: SearchDialogProps) {
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [date, setDate] = useState("")
  const [error, setError] = useState("")

  // Extract primitive values from initialData, providing defaults
  const initialCity = initialData?.city ?? "";
  const initialState = initialData?.state ?? "";
  const initialCountry = initialData?.country ?? "";
  const initialDate = initialData?.date ?? "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!city || !state || !country) {
      setError("City, state, and country are required")
      return
    }

    setError("")
    onSearch(city, state, country, date)
    onClose()
  }

  const handleUseMyLocation = () => {
    onUseMyLocation()
  }

  // Effect to reset/pre-fill form when dialog opens or initialData values change
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Pre-fill with initial data
        setCity(initialCity);
        setState(initialState);
        setCountry(initialCountry);
        setDate(initialDate);
        setError("");
      } else {
        // Reset fields if no initial data
        setCity("");
        setState("");
        setCountry("");
        setDate("");
        setError("");
      }
    }
  // Use the extracted primitive values in the dependency array
  }, [open, initialCity, initialState, initialCountry, initialDate]);

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Search Weather</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country *
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date (Optional)
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium"
              >
                <Search className="mr-2 h-5 w-5" />
                Get Weather
              </button>

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 font-medium"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Use My Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

