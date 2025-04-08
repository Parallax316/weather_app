"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface MapDisplayProps {
  latitude: number
  longitude: number
  isLoaded: boolean
  locationName?: string
}

export default function MapDisplay({ latitude, longitude, isLoaded, locationName }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const initMap = () => {
      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }],
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#fefefe" }, { lightness: 20 }],
          },
        ],
      }

      // Create new map instance if it doesn't exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
      } else {
        // Update existing map
        mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude })
      }

      // Remove existing marker if it exists
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // Create new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstanceRef.current,
        title: locationName || "Location",
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4f46e5",
          fillOpacity: 0.7,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-family: Arial, sans-serif; padding: 5px;"><strong>${locationName || "Location"}</strong><br>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</div>`,
      })

      markerRef.current.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current)
      })
    }

    initMap()
  }, [latitude, longitude, isLoaded, locationName])

  if (!latitude || !longitude) return null

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
        <MapPin className="h-5 w-5 text-red-500 mr-2" />
        Location Map
      </h2>

      <div
        ref={mapRef}
        className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-200/30 dark:border-gray-700/30"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isLoaded && (
          <div className="text-gray-500 dark:text-gray-400 flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading map...
          </div>
        )}
      </div>
    </div>
  )
}

