# Weather Dashboard

A modern, feature-rich weather application built with Next.js, FastAPI, and various APIs to provide comprehensive weather information with AI-powered insights.

## 🌟 Features

### Frontend Features

#### 1. Dynamic Theme Support
- Automatic light/dark theme switching based on system preferences
- Custom dark theme with optimized contrast and readability
- Smooth theme transitions with CSS animations

#### 2. Weather Display
- Real-time weather information display
- Dynamic background changes based on time of day
- Current temperature, humidity, wind speed, and feels-like temperature
- 5-day weather forecast
- Interactive weather cards with hover effects

#### 3. Location Features
- Automatic geolocation detection
- Manual location search with city, state, and country
- Interactive Google Maps integration showing current location
- Location-based weather data

#### 4. AI-Powered Insights
- Weather summary generation using GPT-4-mini model
- Personalized activity suggestions based on weather conditions
- Smart clothing recommendations
- Powered by OpenRouter API

#### 5. Additional Features
- YouTube video integration showing location-based content
- Search history with CRUD operations
- Export options (JSON and CSV formats)
- Responsive design for all screen sizes
- Loading states and error handling
- Beautiful UI with gradient effects and animations

### Backend Features

#### 1. API Integration
- WeatherAPI.com for accurate weather data
- Google Maps API for geocoding and map display
- YouTube Data API for location-based videos
- OpenRouter API for AI features

#### 2. Database
- PostgreSQL database with Prisma ORM
- CRUD operations for search history
- Efficient data storage and retrieval

#### 3. FastAPI Backend
- RESTful API endpoints
- CORS support
- Error handling and validation
- Rate limiting and security measures

## 🛠️ Technical Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Hooks
- Next-themes for theme management

### Backend
- FastAPI
- PostgreSQL
- Prisma ORM
- Python 3.x
- Pydantic for data validation

### APIs
- WeatherAPI.com
- Google Maps API
- YouTube Data API
- OpenRouter API (GPT-4-mini)

## 🔄 Future Enhancements

1. Dynamic Weather Visualizations
   - Real-time weather animations
   - Interactive weather maps
   - Weather radar integration
   - Precipitation forecasts

2. Enhanced AI Features
   - More detailed weather analysis
   - Personalized travel recommendations
   - Weather impact on health insights
   - Agricultural weather guidance

3. Additional Features
   - Weather alerts and notifications
   - Multiple location tracking
   - Weather widget for other websites
   - Social sharing capabilities

## 📦 Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install frontend dependencies
```bash
cd weathernew
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables
```bash
# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=your_postgresql_url
WEATHER_API_KEY=your_weatherapi_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
YOUTUBE_API_KEY=your_youtube_api_key
OPENROUTER_API_KEY=your_openrouter_key
```

5. Run the application
```bash
# Frontend
npm run dev

# Backend
uvicorn app:app --reload
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Created By

Simarpreet Singh
- Email: simarpreetsingh0316@gmail.com


This project was created as part of an assessment test for Product Manager Accelerator. 
