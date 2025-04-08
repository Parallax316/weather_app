import httpx
import os
import json

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
MODEL_NAME = "openai/gpt-4o-mini" # Specify the desired model
YOUR_SITE_URL = "http://localhost:8000" # Replace with your actual site URL if deployed
YOUR_APP_NAME = "WeatherWise" # Or your app's name

async def get_llm_response(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str | None:
    """Sends a prompt to the OpenRouter API and returns the text response."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("Error: OPENROUTER_API_KEY environment variable not set or empty.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": YOUR_SITE_URL, # Recommended for OpenRouter identification
        "X-Title": YOUR_APP_NAME,      # Recommended for OpenRouter identification
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_API_BASE}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0 # Set a reasonable timeout
            )
            response.raise_for_status() # Raise HTTPError for bad responses
            data = response.json()
            
            # Extract the message content
            if data.get("choices") and len(data["choices"]) > 0:
                message = data["choices"][0].get("message", {}).get("content")
                if message:
                    return message.strip()
                else:
                    print("Error: No message content found in LLM response.")
                    return None
            else:
                print("Error: No choices found in LLM response.")
                return None
                
    except httpx.HTTPStatusError as e:
        print(f"LLM API request failed with status {e.response.status_code}: {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"LLM API request failed: {e}")
        return None
    except json.JSONDecodeError:
        print("Error decoding LLM API response.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred calling LLM API: {e}")
        return None

async def generate_weather_summary(weather_data: dict) -> str | None:
    """Generates a natural language summary of the weather data."""
    # Create a concise representation of the weather for the prompt
    try:
        location = weather_data.get('location', {})
        current = weather_data.get('current', {})
        forecast_today = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('day', {})
        
        prompt_data = {
            "location": f"{location.get('name')}, {location.get('region')}, {location.get('country')}",
            "current_temp_c": current.get('temp_c'),
            "feels_like_c": current.get('feelslike_c'),
            "condition": current.get('condition', {}).get('text'),
            "wind_kph": current.get('wind_kph'),
            "humidity": current.get('humidity'),
            "forecast_today": {
                "max_temp_c": forecast_today.get('maxtemp_c'),
                "min_temp_c": forecast_today.get('mintemp_c'),
                "condition": forecast_today.get('condition', {}).get('text'),
                "chance_of_rain": forecast_today.get('daily_chance_of_rain')
            }
        }
        prompt_context = json.dumps(prompt_data, indent=2)
    except Exception as e:
        print(f"Error formatting weather data for summary prompt: {e}")
        return None

    prompt = f"Based on the following weather data, provide a brief, engaging, natural language summary (2-3 sentences max) suitable for a general user. Focus on the key conditions.\n\nWeather Data:\n```json\n{prompt_context}\n```\n\nSummary:"
    
    system_prompt = "You are a weather summarizer. Provide concise and easy-to-understand weather reports."
    return await get_llm_response(prompt, system_prompt)

async def generate_activity_suggestions(weather_data: dict) -> str | None:
    """Generates activity suggestions based on the weather."""
    try:
        location = weather_data.get('location', {})
        current = weather_data.get('current', {})
        forecast_today = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('day', {})
        prompt_data = {
            "location": location.get('name'),
            "current_temp_c": current.get('temp_c'),
            "condition": current.get('condition', {}).get('text'),
            "forecast_condition": forecast_today.get('condition', {}).get('text'),
            "chance_of_rain": forecast_today.get('daily_chance_of_rain')
        }
        prompt_context = json.dumps(prompt_data, indent=2)
    except Exception as e:
        print(f"Error formatting weather data for activity prompt: {e}")
        return None

    prompt = f"Given the following weather conditions, suggest 2-3 suitable activities (mix of indoor/outdoor if appropriate). Keep suggestions brief and creative.You can also use a bit of sarcasm and humor like if the weather is too hot you can suggest just netflix and chill, or if it's too cold again suggest netflix and chill with\n\nWeather:\n```json\n{prompt_context}\n```\n\nSuggestions (use bullet points):"
    
    system_prompt = "You are an activity suggestion bot based on weather conditions."
    return await get_llm_response(prompt, system_prompt)

async def generate_clothing_recommendations(weather_data: dict) -> str | None:
    """Generates clothing recommendations based on the weather."""
    try:
        current = weather_data.get('current', {})
        forecast_today = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('day', {})
        prompt_data = {
            "current_temp_c": current.get('temp_c'),
            "feels_like_c": current.get('feelslike_c'),
            "condition": current.get('condition', {}).get('text'),
            "wind_kph": current.get('wind_kph'),
            "max_temp_c": forecast_today.get('maxtemp_c'),
            "min_temp_c": forecast_today.get('mintemp_c'),
            "chance_of_rain": forecast_today.get('daily_chance_of_rain')
        }
        prompt_context = json.dumps(prompt_data, indent=2)
    except Exception as e:
        print(f"Error formatting weather data for clothing prompt: {e}")
        return None

    prompt = f"Based on the following weather data, recommend 2-3 practical and sensible clothing items or layers. Mention if an umbrella or raincoat is needed.\n\nWeather:\n```json\n{prompt_context}\n```\n\nRecommendations (use bullet points):"
    
    system_prompt = "You provide practical clothing advice based on weather conditions."
    return await get_llm_response(prompt, system_prompt) 