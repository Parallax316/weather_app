"use client"

import { useEffect, useState } from "react"

interface DynamicBackgroundProps {
  condition: string
  timeOfDay: string
}

export default function DynamicBackground({ condition, timeOfDay }: DynamicBackgroundProps) {
  const [backgroundStyle, setBackgroundStyle] = useState({
    backgroundImage: "",
    backgroundColor: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    transition: "all 1s ease-in-out",
  })

  useEffect(() => {
    const newStyle = { ...backgroundStyle }

    // Set background based on time of day and weather condition
    if (timeOfDay === "morning") {
      if (condition.includes("sunny") || condition.includes("clear")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #87CEEB, #E0F7FA)"
        newStyle.backgroundColor = "#87CEEB"
      } else if (condition.includes("cloud") || condition.includes("overcast")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #A9A9A9, #D3D3D3)"
        newStyle.backgroundColor = "#A9A9A9"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #708090, #A9A9A9)"
        newStyle.backgroundColor = "#708090"
      } else if (condition.includes("snow")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #E0E0E0, #FFFFFF)"
        newStyle.backgroundColor = "#E0E0E0"
      } else {
        newStyle.backgroundImage = "linear-gradient(to bottom, #87CEEB, #E0F7FA)"
        newStyle.backgroundColor = "#87CEEB"
      }
    } else if (timeOfDay === "afternoon") {
      if (condition.includes("sunny") || condition.includes("clear")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #1E90FF, #87CEEB)"
        newStyle.backgroundColor = "#1E90FF"
      } else if (condition.includes("cloud") || condition.includes("overcast")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #778899, #B0C4DE)"
        newStyle.backgroundColor = "#778899"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #4682B4, #B0C4DE)"
        newStyle.backgroundColor = "#4682B4"
      } else if (condition.includes("snow")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #B0C4DE, #F0F8FF)"
        newStyle.backgroundColor = "#B0C4DE"
      } else {
        newStyle.backgroundImage = "linear-gradient(to bottom, #1E90FF, #87CEEB)"
        newStyle.backgroundColor = "#1E90FF"
      }
    } else if (timeOfDay === "evening") {
      if (condition.includes("sunny") || condition.includes("clear")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #FF7F50, #FFD700)"
        newStyle.backgroundColor = "#FF7F50"
      } else if (condition.includes("cloud") || condition.includes("overcast")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #696969, #A9A9A9)"
        newStyle.backgroundColor = "#696969"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #2F4F4F, #778899)"
        newStyle.backgroundColor = "#2F4F4F"
      } else if (condition.includes("snow")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #708090, #E0E0E0)"
        newStyle.backgroundColor = "#708090"
      } else {
        newStyle.backgroundImage = "linear-gradient(to bottom, #FF7F50, #FFD700)"
        newStyle.backgroundColor = "#FF7F50"
      }
    } else if (timeOfDay === "night") {
      if (condition.includes("clear")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #191970, #483D8B)"
        newStyle.backgroundColor = "#191970"
      } else if (condition.includes("cloud") || condition.includes("overcast")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #2F4F4F, #4B0082)"
        newStyle.backgroundColor = "#2F4F4F"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #000080, #2F4F4F)"
        newStyle.backgroundColor = "#000080"
      } else if (condition.includes("snow")) {
        newStyle.backgroundImage = "linear-gradient(to bottom, #4B0082, #778899)"
        newStyle.backgroundColor = "#4B0082"
      } else {
        newStyle.backgroundImage = "linear-gradient(to bottom, #191970, #483D8B)"
        newStyle.backgroundColor = "#191970"
      }
    }

    setBackgroundStyle(newStyle)
  }, [condition, timeOfDay])

  return (
    <>
      <div style={backgroundStyle}></div>

      {/* Add stars for night time */}
      {timeOfDay === "night" && condition.includes("clear") && (
        <div className="stars-container">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      )}

      {/* Add clouds for cloudy weather */}
      {(condition.includes("cloud") || condition.includes("overcast")) && (
        <div className="clouds-container">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
          <div className="cloud cloud4"></div>
        </div>
      )}

      {/* Add rain for rainy weather */}
      {(condition.includes("rain") || condition.includes("drizzle")) && (
        <div className="rain-container">
          <div className="rain"></div>
        </div>
      )}

      {/* Add snow for snowy weather */}
      {condition.includes("snow") && (
        <div className="snow-container">
          <div className="snow"></div>
        </div>
      )}
    </>
  )
}

