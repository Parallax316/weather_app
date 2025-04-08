# --- Load Environment Variables FIRST ---
import asyncio
import json
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import urllib.parse # For URL encoding search query
import httpx
from datetime import datetime, date as date_obj
from io import StringIO
import csv

# --- FastAPI Imports ---
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Query, Depends
from fastapi.responses import JSONResponse, Response, StreamingResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates

# --- Prisma Imports ---
from prisma import Prisma
from prisma.models import WeatherSearch
from prisma.errors import RecordNotFoundError

# --- AI Service Import ---
from ai_service import (
    generate_weather_summary,
    generate_activity_suggestions,
    generate_clothing_recommendations
)

# --- Load Environment Variables ---
load_dotenv()
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY') # Load Maps key here
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') # Load YouTube Key

# --- Prisma Client Initialization ---
db = Prisma(auto_register=True)

# --- FastAPI Lifespan for DB Connection ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect the database
    print("Connecting Prisma client...")
    await db.connect()
    print("Prisma client connected.")
    yield
    # Shutdown: Disconnect the database
    if db.is_connected():
        print("Disconnecting Prisma client...")
        await db.disconnect()
        print("Prisma client disconnected.")

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

# --- CORS Middleware Setup ---
# Allow requests from common React dev ports (Vite, Create React App)
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000", # CRA default / Your current port
    "http://127.0.0.1:3000",
    "http://localhost:3001", # New frontend port
    "http://127.0.0.1:3001", # New frontend port (IP)
    # Add your deployed frontend URL here if applicable
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Keys and Base URLs ---
BASE_URL = "http://api.weatherapi.com/v1"

# --- Helper Functions (Async) ---
async def get_recent_searches_async():
    try:
        # Get the most recent 5 searches
        searches = await db.weathersearch.find_many(
            take=5,
            order={
                'timestamp': 'desc'
            }
        )
        return searches
    except Exception as e:
        print(f"Error fetching recent searches: {e}")
        return []

# --- NEW: YouTube API Fetch Function ---
async def fetch_youtube_videos(location_name: str, max_results: int = 3):
    if not YOUTUBE_API_KEY:
        print("YouTube API Key not configured. Skipping video search.")
        return []
    if not location_name:
        print("No location name provided for YouTube search. Skipping.")
        return []

    try:
        # Construct search query (you can customize this)
        search_query = urllib.parse.quote(f"travel guide {location_name}")
        youtube_api_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_query}&key={YOUTUBE_API_KEY}&maxResults={max_results}&type=video&order=relevance"

        print(f"Requesting YouTube Videos: {youtube_api_url[:150]}...") # Log truncated URL
        async with httpx.AsyncClient() as client:
            response = await client.get(youtube_api_url, timeout=10.0)
            response.raise_for_status() # Raise HTTP errors
            data = response.json()

        videos = []
        if 'items' in data:
            for item in data['items']:
                if item.get('id', {}).get('videoId'): # Check if it's a video result
                    snippet = item.get('snippet', {})
                    videos.append({
                        'videoId': item['id']['videoId'],
                        'title': snippet.get('title'),
                        'thumbnailUrl': snippet.get('thumbnails', {}).get('default', {}).get('url')
                    })
        print(f"Found {len(videos)} YouTube videos for '{location_name}'")
        return videos

    except httpx.RequestError as e:
        print(f"Error fetching YouTube API: {e}")
        return [] # Return empty list on network/request error
    except httpx.HTTPStatusError as e:
        print(f"YouTube API returned error: {e.response.status_code} - {e.response.text}")
        # Handle specific errors like quota limits (403) if needed
        return []
    except Exception as e:
        print(f"Error processing YouTube response: {e}")
        return [] # Return empty list on other errors

# --- Pydantic Models for Request Bodies ---
class SearchUpdate(BaseModel):
    city: str | None = Field(None, min_length=1)
    state: str | None = Field(None, min_length=1)
    country: str | None = Field(None, min_length=1)

# --- FastAPI Routes ---

# --- Get Weather API Route ---
@app.get("/api/weather")
async def get_weather(
    city: str = Query(...),
    state: str = Query(...),
    country: str = Query(...),
    date: str | None = Query(None)
):
    try:
        # First, get coordinates using Google Geocoding API
        location_query = f"{city}, {state}, {country}"
        geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json"
        
        async with httpx.AsyncClient() as client:
            # Use API key for geocoding request
            geocoding_response = await client.get(
                geocoding_url,
                params={
                    "address": location_query,
                    "key": GOOGLE_MAPS_API_KEY
                },
                timeout=15.0
            )
            geocoding_response.raise_for_status()
            geocoding_data = geocoding_response.json()
            
            if geocoding_data.get('status') != 'OK':
                raise HTTPException(status_code=400, detail=f"Location not found: {location_query}")
            
            location = geocoding_data['results'][0]
            latitude = location['geometry']['location']['lat']
            longitude = location['geometry']['location']['lng']
            formatted_address = location['formatted_address']
            
            # Extract location components
            location_components = {}
            for component in location['address_components']:
                for type in component['types']:
                    location_components[type] = component['long_name']
            
            # Now get weather data from WeatherAPI.com
            weather_url = f"{BASE_URL}/forecast.json"
            params = {
                "key": WEATHER_API_KEY,
                "q": f"{latitude},{longitude}",
                "days": 5
            }
            if date:
                params["dt"] = date
                
            weather_response = await client.get(
                weather_url,
                params=params,
                timeout=15.0
            )
            weather_response.raise_for_status()
            weather_data = weather_response.json()
            
            # Transform response data
            transformed_data = {
                'location': {
                    'name': location_components.get('locality', city),
                    'region': location_components.get('administrative_area_level_1', state),
                    'country': location_components.get('country', country),
                    'lat': latitude,
                    'lon': longitude,
                    'localtime': weather_data['location']['localtime']
                },
                'current': {
                    'temp_c': weather_data['current']['temp_c'],
                    'condition': {
                        'text': weather_data['current']['condition']['text'],
                        'icon': weather_data['current']['condition']['icon']
                    },
                    'wind_kph': weather_data['current']['wind_kph'],
                    'humidity': weather_data['current']['humidity'],
                    'feelslike_c': weather_data['current']['feelslike_c']
                },
                'forecast': {
                    'forecastday': [
                        {
                            'date': day['date'],
                            'day': {
                                'maxtemp_c': day['day']['maxtemp_c'],
                                'mintemp_c': day['day']['mintemp_c'],
                                'condition': {
                                    'text': day['day']['condition']['text'],
                                    'icon': day['day']['condition']['icon']
                                }
                            }
                        }
                        for day in weather_data['forecast']['forecastday']
                    ]
                }
            }
            
            # Generate AI insights
            try:
                ai_summary = await generate_weather_summary(transformed_data)
                ai_activities = await generate_activity_suggestions(transformed_data)
                ai_clothing = await generate_clothing_recommendations(transformed_data)
            except Exception as e:
                print(f"Error generating AI insights: {e}")
                ai_summary = None
                ai_activities = None
                ai_clothing = None

            # Fetch YouTube videos
            try:
                youtube_videos = await fetch_youtube_videos(location_components.get('locality', city))
            except Exception as e:
                print(f"Error fetching YouTube videos: {e}")
                youtube_videos = []
            
            # Save search to database if it's not a historical request
            if not date:
                try:
                    await db.weathersearch.create(
                        data={
                    'city': city,
                    'state': state,
                    'country': country,
                            'weatherData': json.dumps(transformed_data)
                        }
                    )
                except Exception as e:
                    print(f"Failed to save search to database: {e}")
            
            # Add additional data to response
            response_data = {
                **transformed_data,
                'latitude': latitude,
                'longitude': longitude,
                'ai_summary': ai_summary,
                'ai_activities': ai_activities,
                'ai_clothing': ai_clothing,
                'youtube_videos': youtube_videos,
                'map_api_key': GOOGLE_MAPS_API_KEY  # Add API key for map component only
            }
            
            return response_data

    except httpx.RequestError as e:
        print(f"Error fetching weather API: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_weather: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Get Weather by Coordinates API Route ---
@app.get("/api/weather/coordinates")
async def get_weather_by_coordinates(
    lat: float = Query(...),
    lon: float = Query(...)
):
    try:
        async with httpx.AsyncClient() as client:
            # Get weather data from WeatherAPI.com
            weather_url = f"{BASE_URL}/forecast.json"
            params = {
                "key": WEATHER_API_KEY,
                "q": f"{lat},{lon}",
                "days": 5
            }
            
            weather_response = await client.get(
                weather_url,
                params=params,
                timeout=15.0
            )
            weather_response.raise_for_status()
            weather_data = weather_response.json()
            
            # Get location name using reverse geocoding
            geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json"
            geocoding_response = await client.get(
                geocoding_url,
                params={
                    "latlng": f"{lat},{lon}",
                    "key": GOOGLE_MAPS_API_KEY
                },
                timeout=15.0
            )
            geocoding_response.raise_for_status()
            geocoding_data = geocoding_response.json()
            
            # Extract location components
            location_components = {}
            if geocoding_data.get('status') == 'OK' and geocoding_data['results']:
                location = geocoding_data['results'][0]
                for component in location['address_components']:
                    for type in component['types']:
                        location_components[type] = component['long_name']
            
            transformed_data = {
                'location': {
                    'name': location_components.get('locality', 'Unknown'),
                    'region': location_components.get('administrative_area_level_1', 'Unknown'),
                    'country': location_components.get('country', 'Unknown'),
                    'lat': lat,
                    'lon': lon,
                    'localtime': weather_data['location']['localtime']
                },
                'current': {
                    'temp_c': weather_data['current']['temp_c'],
                    'condition': {
                        'text': weather_data['current']['condition']['text'],
                        'icon': weather_data['current']['condition']['icon']
                    },
                    'wind_kph': weather_data['current']['wind_kph'],
                    'humidity': weather_data['current']['humidity'],
                    'feelslike_c': weather_data['current']['feelslike_c']
                },
                'forecast': {
                    'forecastday': [
                        {
                            'date': day['date'],
                            'day': {
                                'maxtemp_c': day['day']['maxtemp_c'],
                                'mintemp_c': day['day']['mintemp_c'],
                                'condition': {
                                    'text': day['day']['condition']['text'],
                                    'icon': day['day']['condition']['icon']
                                }
                            }
                        }
                        for day in weather_data['forecast']['forecastday']
                    ]
                }
            }

            # Generate AI insights
            try:
                ai_summary = await generate_weather_summary(transformed_data)
                ai_activities = await generate_activity_suggestions(transformed_data)
                ai_clothing = await generate_clothing_recommendations(transformed_data)
            except Exception as e:
                print(f"Error generating AI insights: {e}")
                ai_summary = None
                ai_activities = None
                ai_clothing = None

            # Fetch YouTube videos
            try:
                youtube_videos = await fetch_youtube_videos(location_components.get('locality', 'Unknown'))
            except Exception as e:
                print(f"Error fetching YouTube videos: {e}")
                youtube_videos = []
            
            # Add additional data to response
            response_data = {
                **transformed_data,
                'latitude': lat,
                'longitude': lon,
                'ai_summary': ai_summary,
                'ai_activities': ai_activities,
                'ai_clothing': ai_clothing,
                'youtube_videos': youtube_videos,
                'map_api_key': GOOGLE_MAPS_API_KEY  # Add API key for map component only
            }
            
            return response_data

    except httpx.RequestError as e:
        print(f"Error fetching weather API: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_weather_by_coordinates: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Get All Searches API Route ---
@app.get("/api/searches")
async def get_searches():
    print("Fetching all searches from database...")
    try:
        searches = await db.weathersearch.find_many(
            order={'timestamp': 'desc'}
        )
        result = [search.dict() for search in searches]
        for item in result:
            item['timestamp'] = item['timestamp'].isoformat()
            # Prisma already parses JSON field to dict, no need for json.loads here
            # Check if it's already a dict (it should be)
            if not isinstance(item.get('weatherData'), dict):
                 print(f"Warning: weatherData for search {item.get('id')} is not a dict: {type(item.get('weatherData'))}")
                 # Attempt parsing if it's a string, otherwise set None
                 if isinstance(item.get('weatherData'), str):
                     try:
                         item['weatherData'] = json.loads(item['weatherData'])
                     except (json.JSONDecodeError, TypeError):
                         item['weatherData'] = None
                 else:
                     item['weatherData'] = None

        print(f"Found {len(result)} searches.")
        return result # FastAPI handles JSON conversion
    except Exception as e:
        print(f"Error retrieving searches: {e}")
        return [] 

# --- Get Specific Search API Route ---
@app.get("/api/searches/{search_id}")
async def get_search(search_id: str): # Path parameter
    print(f"Fetching search with ID: {search_id}")
    try:
        search = await db.weathersearch.find_unique(where={'id': search_id})
        if search:
            result = search.dict()
            result['timestamp'] = result['timestamp'].isoformat()
            
            # Prisma already parses JSON field to dict, no need for json.loads
            wd_from_db = result.get('weatherData')
            if not isinstance(wd_from_db, dict):
                 print(f"--- View Search --- Warning: weatherData is not a dict: {type(wd_from_db)}")
                 if isinstance(wd_from_db, str):
                     try:
                         result['weatherData'] = json.loads(wd_from_db)
                     except (json.JSONDecodeError, TypeError):
                         result['weatherData'] = None
                 else:
                     result['weatherData'] = None 

            print("Search found.")
            return result
        else:
            print("Search not found.")
            raise HTTPException(status_code=404, detail="Search not found")
    except Exception as e:
        print(f"Error retrieving search {search_id}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving search")

# --- Update Search API Route ---
@app.put("/api/searches/{search_id}")
async def update_search(search_id: str, update_data: SearchUpdate):
    print(f"Attempting to update search with ID: {search_id}")
    
    # Create a dictionary with only the fields that were provided
    update_payload = update_data.model_dump(exclude_unset=True)
    
    # Check if there's anything to update
    if not update_payload:
        raise HTTPException(status_code=400, detail="No update data provided.")
        
    try:
        updated_search = await db.weathersearch.update(
            where={'id': search_id},
            data=update_payload
        )
        
        if not updated_search:
            # Should not happen if update raises error on not found, but belts and suspenders
            raise HTTPException(status_code=404, detail="Search not found for update.")

        print(f"Search {search_id} updated successfully.")
        # Prepare response (similar to get_search)
        result = updated_search.dict()
        result['timestamp'] = result['timestamp'].isoformat()
        # Ensure weatherData is dict (it should be after update)
        if not isinstance(result.get('weatherData'), dict):
            if isinstance(result.get('weatherData'), str):
                 try: result['weatherData'] = json.loads(result['weatherData'])
                 except: result['weatherData'] = None
            else: result['weatherData'] = None
                
        return result

    except RecordNotFoundError:
        print(f"Search {search_id} not found for update.")
        raise HTTPException(status_code=404, detail="Search not found")
    except Exception as e:
        print(f"Error updating search {search_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating search")

# --- Delete Search API Route ---
@app.delete("/api/searches/{search_id}")
async def delete_search(search_id: str): # Path parameter
    print(f"Attempting to delete search with ID: {search_id}")
    try:
        await db.weathersearch.delete(where={'id': search_id})
        print("Search deleted successfully.")
        # Use Response for 204 No Content
        return Response(status_code=204) 
    except RecordNotFoundError:
        # Prisma raises specific error if record not found for delete
        print("Search not found for deletion.")
        raise HTTPException(status_code=404, detail="Search not found")
    except Exception as e:
        print(f"Error deleting search {search_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting search")

# --- Export Data API Route ---
@app.get("/api/searches/export")
async def export_searches(format: str = Query("json", pattern="^(json|csv)$")): # Default to json, validate format
    print(f"Exporting search data as {format}...")
    try:
        searches = await db.weathersearch.find_many(
            order={'timestamp': 'desc'}
        )
        
        if not searches:
            return JSONResponse(content={"message": "No search data to export."}, status_code=404)
        
        # Prepare data (convert to dicts)
        data_to_export = [s.dict() for s in searches]
        
        if format == "json":
            # Clean up data for JSON export (convert datetime, remove sensitive data)
            for item in data_to_export:
                item['timestamp'] = item['timestamp'].isoformat()
                # Keep weatherData as is (already dict)
                if not isinstance(item.get('weatherData'), dict):
                     item['weatherData'] = None # Ensure it's serializable
                
                # Remove sensitive data from weatherData if it exists
                if item.get('weatherData'):
                    weather_data = item['weatherData']
                    # Remove API keys and sensitive information
                    weather_data.pop('google_maps_api_key', None)
                    # Keep only essential weather information
                    weather_data = {
                        'location': weather_data.get('location'),
                        'current': weather_data.get('current'),
                        'forecast': weather_data.get('forecast'),
                        'ai_summary': weather_data.get('ai_summary'),
                        'ai_activities': weather_data.get('ai_activities'),
                        'ai_clothing': weather_data.get('ai_clothing'),
                        'youtube_videos': weather_data.get('youtube_videos')
                    }
                    item['weatherData'] = weather_data
            
            # Create JSON string
            json_string = json.dumps(data_to_export, indent=2)
            filename = f"weather_searches_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            # Use Response to set headers for download
            return Response(
                content=json_string,
                media_type="application/json",
                headers={'Content-Disposition': f'attachment; filename="{filename}'}
            )

        elif format == "csv":
            # Select and flatten fields for CSV
            csv_data = []
            # Define headers explicitly for consistent order
            headers = ['id', 'timestamp', 'city', 'state', 'country', 
                       'weather_location', 'weather_condition', 'weather_temp_c', 'weather_feelslike_c']
            csv_data.append(headers)
            
            for item in data_to_export:
                weather_data = item.get('weatherData') or {}
                location = weather_data.get('location') or {}
                current = weather_data.get('current') or {}
                condition = current.get('condition') or {}
                
                row = [
                    item.get('id'),
                    item.get('timestamp').isoformat() if item.get('timestamp') else '',
                    item.get('city'),
                    item.get('state'),
                    item.get('country'),
                    location.get('name'),
                    condition.get('text'),
                    current.get('temp_c'),
                    current.get('feelslike_c')
                ]
                csv_data.append(row)
            
            # Create CSV in memory
            stream = StringIO()
            writer = csv.writer(stream)
            writer.writerows(csv_data)
            stream.seek(0) # Rewind the stream
            
            filename = f"weather_searches_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            # Use StreamingResponse for CSV download
            response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
            response.headers["Content-Disposition"] = f"attachment; filename={filename}"
            return response

    except Exception as e:
        print(f"Error exporting search data: {e}")
        raise HTTPException(status_code=500, detail="Error exporting search data")