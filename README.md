# 🏙️ Berlin Tropical Nights Calendar

A beautiful, interactive calendar visualization tracking **tropical nights** in Berlin — those sultry summer evenings when the temperature never drops below 20°C (68°F).

🌐 **Live Site**: [https://jarvis-claw-ai.github.io/berlin-tropical-nights/](https://jarvis-claw-ai.github.io/berlin-tropical-nights/)

## What are Tropical Nights?

Tropical nights are a meteorological phenomenon where the minimum daily temperature stays at or above 20°C (68°F). These warm nights are becoming increasingly important in urban climate studies as they can significantly impact:

- **Human comfort** and sleep quality
- **Energy consumption** for cooling
- **Urban heat island** effects
- **Climate change** monitoring

In Berlin, tropical nights are relatively rare but have been increasing in frequency due to climate change, making them an important indicator for tracking urban warming trends.

## Features

- 📅 **Interactive Calendar**: Beautiful monthly grid view for years 2021-present
- 🌡️ **Temperature Visualization**: Color-coded days based on minimum temperature
- 📊 **Statistics Dashboard**: Key metrics including tropical night counts and percentages
- 🌙 **Dark Theme**: Sleek, modern design optimized for readability
- 📱 **Mobile Responsive**: Fully functional on all device sizes
- 🔄 **Auto-updating**: Nightly data refresh via GitHub Actions

## Data Source

Weather data is sourced from the [Open-Meteo Archive API](https://open-meteo.com/), a free and open-source weather API providing historical meteorological data. The data includes:

- **Location**: Berlin, Germany (52.52°N, 13.41°E)
- **Metric**: Daily minimum temperature (°C)
- **Timezone**: Europe/Berlin
- **Update Frequency**: Daily at 2:00 UTC

## Technical Implementation

### Architecture
- **Frontend**: Vanilla HTML, CSS, and JavaScript (no dependencies)
- **Data**: JSON files updated via Python script
- **Deployment**: GitHub Pages with automated workflows
- **CI/CD**: GitHub Actions for data fetching and deployment

### Data Processing
The `scripts/fetch_weather.py` script:
- Fetches historical data from Open-Meteo API
- Processes daily minimum temperatures for Berlin
- Generates annual JSON files in `data/YYYY.json` format
- Runs nightly to keep data current

### Visualization
The calendar interface features:
- **Color Gradients**: Tropical nights use warm colors (orange to red) based on temperature intensity
- **Interactive Tooltips**: Hover over any day to see exact temperature and date
- **Year Navigation**: Switch between different years using the tab interface
- **Statistics Panel**: Real-time calculation of tropical night statistics

## Repository Structure

```
berlin-tropical-nights/
├── index.html              # Main calendar interface
├── style.css               # Styling and responsive design
├── script.js               # Calendar functionality and data visualization
├── data/                   # Weather data files
│   ├── 2021.json          # Historical data by year
│   ├── 2022.json
│   └── ...
├── scripts/
│   └── fetch_weather.py   # Data fetching script
└── .github/workflows/
    ├── fetch-weather.yml  # Nightly data update
    └── deploy.yml         # GitHub Pages deployment
```

## Development

To run locally:

1. Clone the repository
2. Fetch initial data: `python3 scripts/fetch_weather.py`
3. Serve files using a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser

## Climate Context

This project serves as both a data visualization tool and a climate awareness initiative. The increasing frequency of tropical nights in temperate cities like Berlin reflects broader global warming trends. By making this data accessible and visually engaging, we hope to contribute to climate literacy and urban planning discussions.

## Attribution

- Weather data: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0)
- Implementation: Built as a showcase project for modern web development practices
- Hosting: GitHub Pages

---

*Data updated nightly • Last update: Check the commit history for the most recent data refresh*