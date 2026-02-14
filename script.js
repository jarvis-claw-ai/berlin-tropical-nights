// Berlin Tropical Nights Calendar JavaScript

class TropicalNightsCalendar {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.weatherData = new Map();
        this.availableYears = [];
        
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            yearTabs: document.getElementById('yearTabs'),
            calendar: document.getElementById('calendar'),
            statsPanel: document.getElementById('statsPanel'),
            tooltip: document.getElementById('tooltip')
        };
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadAvailableYears();
            await this.loadAllWeatherData();
            this.createYearTabs();
            this.renderCalendar(this.currentYear);
            this.hideLoading();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize calendar:', error);
            this.showError();
        }
    }
    
    async loadAvailableYears() {
        // Determine years from 2021 to current year + 1
        const startYear = 2021;
        const endYear = this.currentYear + 1;
        
        for (let year = startYear; year <= endYear; year++) {
            try {
                const response = await fetch(`data/${year}.json`);
                if (response.ok) {
                    this.availableYears.push(year);
                }
            } catch (error) {
                // Year file doesn't exist, skip
                console.log(`No data file for ${year}`);
            }
        }
        
        if (this.availableYears.length === 0) {
            throw new Error('No weather data files found');
        }
        
        // Set current year to the latest available year
        this.currentYear = Math.max(...this.availableYears.filter(y => y <= this.currentYear));
    }
    
    async loadAllWeatherData() {
        const loadPromises = this.availableYears.map(async (year) => {
            try {
                const response = await fetch(`data/${year}.json`);
                if (response.ok) {
                    const data = await response.json();
                    this.weatherData.set(year, this.processYearData(data));
                } else {
                    console.warn(`Failed to load data for ${year}`);
                }
            } catch (error) {
                console.error(`Error loading ${year} data:`, error);
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    processYearData(rawData) {
        const processedData = new Map();
        
        rawData.forEach(entry => {
            const date = new Date(entry.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            processedData.set(key, {
                date: entry.date,
                minTemp: entry.min_temp,
                isTropical: entry.min_temp >= 20.0
            });
        });
        
        return processedData;
    }
    
    createYearTabs() {
        this.elements.yearTabs.innerHTML = '';
        
        this.availableYears.forEach(year => {
            const tab = document.createElement('button');
            tab.className = `year-tab ${year === this.currentYear ? 'active' : ''}`;
            tab.textContent = year;
            tab.onclick = () => this.switchYear(year);
            this.elements.yearTabs.appendChild(tab);
        });
    }
    
    switchYear(year) {
        if (year === this.currentYear) return;
        
        this.currentYear = year;
        
        // Update active tab
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.textContent) === year);
        });
        
        this.renderCalendar(year);
    }
    
    renderCalendar(year) {
        this.elements.calendar.innerHTML = '';
        
        const yearData = this.weatherData.get(year) || new Map();
        
        // Create months
        for (let month = 0; month < 12; month++) {
            const monthElement = this.createMonth(year, month, yearData);
            this.elements.calendar.appendChild(monthElement);
        }
        
        this.renderStats(year, yearData);
    }
    
    createMonth(year, month, yearData) {
        const monthElement = document.createElement('div');
        monthElement.className = 'month';
        
        const monthName = document.createElement('div');
        monthName.className = 'month-name';
        monthName.textContent = this.monthNames[month];
        monthElement.appendChild(monthName);
        
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
        
        // Add weekday headers
        this.weekdays.forEach(day => {
            const weekdayElement = document.createElement('div');
            weekdayElement.className = 'weekday';
            weekdayElement.textContent = day;
            monthGrid.appendChild(weekdayElement);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            monthGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDay(year, month, day, yearData);
            monthGrid.appendChild(dayElement);
        }
        
        monthElement.appendChild(monthGrid);
        return monthElement;
    }
    
    createDay(year, month, day, yearData) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = yearData.get(dateKey);
        
        if (dayData) {
            if (dayData.isTropical) {
                dayElement.classList.add('tropical');
                dayElement.setAttribute('data-temp', Math.round(dayData.minTemp));
                
                // Add temperature-based styling
                const temp = dayData.minTemp;
                let intensity = Math.min((temp - 20) / 10, 1); // 0-1 scale
                dayElement.style.background = `linear-gradient(135deg, 
                    hsl(${15 - intensity * 15}, 100%, ${60 + intensity * 10}%), 
                    hsl(${0}, 100%, ${45 + intensity * 10}%))`;
            } else {
                dayElement.classList.add('normal');
            }
            
            // Add tooltip data
            dayElement.setAttribute('data-date', dayData.date);
            dayElement.setAttribute('data-temp-value', dayData.minTemp.toFixed(1));
        } else {
            dayElement.classList.add('no-data');
            dayElement.setAttribute('data-date', dateKey);
        }
        
        return dayElement;
    }
    
    renderStats(year, yearData) {
        const dataArray = Array.from(yearData.values());
        const tropicalNights = dataArray.filter(d => d.isTropical);
        const totalDays = dataArray.length;
        
        // Calculate additional stats
        const maxTemp = dataArray.length > 0 ? Math.max(...dataArray.map(d => d.minTemp)) : 0;
        const avgTemp = dataArray.length > 0 ? dataArray.reduce((sum, d) => sum + d.minTemp, 0) / dataArray.length : 0;
        
        // Find hottest tropical night
        const hottestTropical = tropicalNights.length > 0 
            ? tropicalNights.reduce((max, current) => current.minTemp > max.minTemp ? current : max)
            : null;
        
        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${tropicalNights.length}</span>
                    <div class="stat-label">Tropical Nights</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalDays > 0 ? ((tropicalNights.length / totalDays) * 100).toFixed(1) : 0}%</span>
                    <div class="stat-label">Percentage of Year</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${maxTemp.toFixed(1)}°C</span>
                    <div class="stat-label">Hottest Min Temp</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${avgTemp.toFixed(1)}°C</span>
                    <div class="stat-label">Avg Min Temp</div>
                </div>
                ${hottestTropical ? `
                <div class="stat-item">
                    <span class="stat-value">${hottestTropical.minTemp.toFixed(1)}°C</span>
                    <div class="stat-label">Hottest Tropical Night<br><small>${new Date(hottestTropical.date).toLocaleDateString()}</small></div>
                </div>
                ` : ''}
            </div>
        `;
        
        this.elements.statsPanel.innerHTML = statsHTML;
    }
    
    setupEventListeners() {
        // Tooltip functionality
        this.elements.calendar.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('day') && !e.target.classList.contains('empty')) {
                this.showTooltip(e.target, e);
            }
        });
        
        this.elements.calendar.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('day')) {
                this.hideTooltip();
            }
        });
        
        this.elements.calendar.addEventListener('mousemove', (e) => {
            this.updateTooltipPosition(e);
        });
    }
    
    showTooltip(dayElement, event) {
        const date = dayElement.getAttribute('data-date');
        const tempValue = dayElement.getAttribute('data-temp-value');
        const isTropical = dayElement.classList.contains('tropical');
        const hasData = !dayElement.classList.contains('no-data');
        
        const tooltipDate = this.elements.tooltip.querySelector('.tooltip-date');
        const tooltipTemp = this.elements.tooltip.querySelector('.tooltip-temp');
        
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        tooltipDate.textContent = formattedDate;
        
        if (hasData) {
            const tempCelsius = parseFloat(tempValue);
            const tempFahrenheit = (tempCelsius * 9/5 + 32).toFixed(1);
            tooltipTemp.innerHTML = `
                Min Temperature: <strong>${tempCelsius}°C (${tempFahrenheit}°F)</strong><br>
                ${isTropical ? '🔥 Tropical Night' : '❄️ Regular Night'}
            `;
        } else {
            tooltipTemp.textContent = 'No temperature data available';
        }
        
        this.elements.tooltip.classList.add('visible');
        this.updateTooltipPosition(event);
    }
    
    hideTooltip() {
        this.elements.tooltip.classList.remove('visible');
    }
    
    updateTooltipPosition(event) {
        if (!this.elements.tooltip.classList.contains('visible')) return;
        
        const tooltip = this.elements.tooltip;
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let x = event.clientX + 10;
        let y = event.clientY - rect.height - 10;
        
        // Adjust if tooltip would go off-screen
        if (x + rect.width > viewportWidth) {
            x = event.clientX - rect.width - 10;
        }
        
        if (y < 0) {
            y = event.clientY + 10;
        }
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
    
    hideLoading() {
        this.elements.loading.style.display = 'none';
    }
    
    showError() {
        this.elements.loading.style.display = 'none';
        this.elements.error.style.display = 'block';
    }
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TropicalNightsCalendar();
});