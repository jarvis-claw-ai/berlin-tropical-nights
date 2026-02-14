#!/usr/bin/env python3
"""
Fetch daily minimum temperature data for Berlin from Open-Meteo Archive API.
Creates data/YYYY.json files with tropical nights data.
"""

import json
import os
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
import sys

# Berlin coordinates
BERLIN_LAT = 52.52
BERLIN_LON = 13.41

# API endpoint
API_URL = "https://archive-api.open-meteo.com/v1/archive"

def fetch_year_data(year, end_date=None):
    """Fetch temperature data for a given year."""
    start_date = f"{year}-01-01"
    
    if end_date is None:
        # For past years, get full year
        end_date = f"{year}-12-31"
    else:
        # For current year, use provided end date
        end_date = end_date.strftime("%Y-%m-%d")
    
    params = {
        'latitude': BERLIN_LAT,
        'longitude': BERLIN_LON,
        'daily': 'temperature_2m_min',
        'timezone': 'Europe/Berlin',
        'start_date': start_date,
        'end_date': end_date
    }
    
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    
    print(f"Fetching data for {year}: {start_date} to {end_date}")
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
        
        if 'daily' not in data:
            print(f"Error: No daily data returned for {year}")
            return None
        
        # Format data
        dates = data['daily']['time']
        temps = data['daily']['temperature_2m_min']
        
        year_data = []
        for date, temp in zip(dates, temps):
            if temp is not None:  # Skip null values
                year_data.append({
                    'date': date,
                    'min_temp': temp
                })
        
        print(f"Retrieved {len(year_data)} temperature records for {year}")
        return year_data
    
    except Exception as e:
        print(f"Error fetching data for {year}: {e}")
        return None

def save_year_data(year, data):
    """Save year data to JSON file."""
    os.makedirs('data', exist_ok=True)
    filename = f"data/{year}.json"
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Saved {len(data)} records to {filename}")

def main():
    """Main function to fetch weather data."""
    current_year = datetime.now().year
    yesterday = datetime.now() - timedelta(days=1)
    
    # Years to process
    years_to_process = list(range(2021, current_year + 2))  # Include next year for future data
    
    for year in years_to_process:
        filename = f"data/{year}.json"
        
        # Check if file already exists and is recent
        if os.path.exists(filename):
            if year < current_year:
                # Skip past years that already have data
                print(f"Skipping {year} - data already exists")
                continue
            else:
                # For current year, check if we need to update
                stat = os.stat(filename)
                file_modified = datetime.fromtimestamp(stat.st_mtime)
                if (datetime.now() - file_modified).days < 1:
                    print(f"Skipping {year} - data is recent")
                    continue
        
        # Determine end date
        if year < current_year:
            # Past years: get full year
            data = fetch_year_data(year)
        elif year == current_year:
            # Current year: get up to yesterday
            data = fetch_year_data(year, yesterday)
        else:
            # Future years: skip for now (will be handled by daily runs)
            print(f"Skipping future year {year}")
            continue
        
        if data:
            save_year_data(year, data)
        else:
            print(f"Failed to fetch data for {year}")
    
    print("Weather data fetch complete!")
    
    # Print summary of tropical nights
    print("\nTropical Nights Summary (min_temp >= 20°C):")
    print("=" * 50)
    
    for year in range(2021, current_year + 1):
        filename = f"data/{year}.json"
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                data = json.load(f)
            
            tropical_nights = [d for d in data if d['min_temp'] >= 20.0]
            print(f"{year}: {len(tropical_nights)} tropical nights")
            
            # Show the hottest tropical nights
            if tropical_nights:
                hottest = max(tropical_nights, key=lambda x: x['min_temp'])
                print(f"  → Hottest: {hottest['date']} ({hottest['min_temp']:.1f}°C)")

if __name__ == "__main__":
    main()