document.addEventListener('DOMContentLoaded', async () => {
    // Add click handler for back button
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', () => {
        window.location.href = '../alert/alert.html';
    });

    // Add click handlers for status icons
    const statusIcons = document.querySelectorAll('.status-icons span');
    statusIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const parent = this.parentElement;
            parent.querySelectorAll('span').forEach(span => {
                span.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        });
    });

    // Add click handlers for bottom menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // If the item contains a link, don't prevent default
            if (!item.querySelector('a')) {
                e.preventDefault();
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    await displayCropCard();
});

// Function to create a crop card element
function createCropCard(cropData) {
    const card = document.createElement('div');
    card.className = 'crop-card';

    card.innerHTML = `
        <div class="crop-icon">
            <img src="${cropData.icon}" alt="${cropData.name}">
        </div>
        <div class="crop-content">
            <div class="crop-header">
                <span>${cropData.measure}</span>
            </div>
            <div class="treatments">
                <h3>Treatments</h3>
                <p>${cropData.treatments.join(' | ')}</p>
            </div>
        </div>
    `;

    return card;
}

// Function to fetch weather data from API
async function fetchWeatherData(crop, issue) {
    try {
        const response = await fetch(`http://70.34.210.155:3490/weather/testTimWithOptAndMax?crop=${crop}&issue=${issue}`, {
            method: 'GET', headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to display single crop card and chart
// Function to display single crop card and chart
async function displayCropCard() {
    const container = document.getElementById('crop-card-container');

    // Get the crop data from sessionStorage
    const cropData = JSON.parse(sessionStorage.getItem('selectedCrop')) || {
        name: "Cotton",
        icon: "../icons/cotton.png",
        measure: "Crop Measure",
        treatments: ["Stress Buster", "Yield Booster"]
    };

    // Clear existing content
    container.innerHTML = '';

    // Add crop name
    const cropName = document.createElement('h2');
    cropName.className = 'crop-name';
    cropName.textContent = cropData.name;
    container.appendChild(cropName);

    // Add the card
    const card = createCropCard(cropData);
    container.appendChild(card);

    // Check if the measure indicates heat or freeze stress
    const measure = cropData.measure.toLowerCase();
    if (!measure.includes('heat') && !measure.includes('freeze')) {
        return; // Don't show graphs if not temperature stress related
    }

    // Determine which type of stress to show based on the measure and crop name
    const issues = [];
    const cropNameLower = cropData.name.toLowerCase();

    // Add heat stress checks
    if (measure.includes('heat')) {
        if (measure.includes('day') || measure.includes('high')) {
            issues.push('day_heat_stress');
        }
        if (measure.includes('night')) {
            issues.push('night_heat_stress');
        }
        // If no specific heat stress type is mentioned but heat is present, show both
        if (!measure.includes('day') && !measure.includes('night') && !measure.includes('high')) {
            issues.push('day_heat_stress', 'night_heat_stress');
        }
    }

    // Add freeze stress for specific crops
    if (['soybean', 'corn', 'cotton'].includes(cropNameLower) && measure.includes('freeze')) {
        issues.push('freeze_stress');
    }

    // Only proceed if we have issues to display
    if (issues.length === 0) {
        return;
    }

    for (const issue of issues) {
        const responseData = await fetchWeatherData(cropData.name, issue);
        if (responseData) {
            // Create a new chart container for each issue
            const newChartContainer = document.createElement('div');
            newChartContainer.className = 'chart-container';
            newChartContainer.innerHTML = `<canvas id="temperatureChart_${issue}"></canvas>`;
            container.appendChild(newChartContainer);

            createTemperatureChart(responseData, `temperatureChart_${issue}`);
        }
    }

    const pill = document.createElement('div');
    pill.className = 'chart-pill';
    container.appendChild(pill);

    // Fetch pill text from API
    try {
        const biological = cropData.treatments[0].toLowerCase().replace(/ /g, '_');
        const crop = cropNameLower.replace(/ /g, '_');
        const issue = measure.toLowerCase().replace(/ /g, '_');

        const pillResponse = await fetch(`http://70.34.210.155:3490/profit/get_yield_increase_percentage?crop=${crop}&issue=${issue}&biological=${biological}`);

        if (!pillResponse.ok) {
            throw new Error('Failed to fetch yield increase percentage');
        }
        const yieldIncrease = await pillResponse.json(); // Assuming the API returns a number directly

        // Parse the number into a string and format it as needed
        pill.textContent = `Yield Increase: ${yieldIncrease}%`; // Example: "Yield Increase: 15%"

    } catch (error) {
        console.error('Error fetching yield increase percentage:', error);
        pill.textContent = 'Yield Increase Data Unavailable'; // Default text if API call fails
    }
}

// Function to create temperature chart
function createTemperatureChart(responseData, chartId) {
    const ctx = document.getElementById(chartId).getContext('2d');

    const isNightHeatStress = responseData.issue === 'night_heat_stress';
    const isFreezeStress = responseData.issue === 'freeze_stress';

    // Format dates to remove time part
    const formattedDates = responseData.date.map(date => {
        // Split at the time part if it exists and take only the date
        return date.split(' ')[0];
    });

    const data = {
        labels: formattedDates, datasets: [{
            label: isFreezeStress ? 'Min Temperature (°C)' : isNightHeatStress ? 'Min Temperature (°C)' : 'Max Temperature (°C)',
            data: isFreezeStress ? responseData.min_temps : isNightHeatStress ? responseData.min_temps : responseData.max_temps,
            borderColor: isFreezeStress ? 'blue' : isNightHeatStress ? 'yellow' : 'red',
            backgroundColor: isFreezeStress ? 'blue' : isNightHeatStress ? 'yellow' : 'red',
            fill: false,
            tension: 0.1
        }, {
            label: `Optimal Threshold (${responseData.thresholds.opt}°C)`,
            data: formattedDates.map(() => responseData.thresholds.opt),
            borderColor: 'green',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0
        }, {
            label: `${isFreezeStress ? 'Min' : 'Max'} Threshold (${responseData.thresholds.max}°C)`,
            data: formattedDates.map(() => responseData.thresholds.max),
            borderColor: 'purple',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0
        }]
    };

    const config = {
        type: 'line', data: data, options: {
            responsive: true, maintainAspectRatio: false, scales: {
                x: {
                    title: {
                        display: true, text: 'Date'
                    }, ticks: {
                        maxRotation: 45, minRotation: 45
                    }
                }, y: {
                    title: {
                        display: true, text: 'Temperature (°C)'
                    }, suggestedMin: isFreezeStress ? -45 : 20, suggestedMax: isFreezeStress ? 5 : 42
                }
            }, plugins: {
                legend: {
                    position: 'top'
                }, title: {
                    display: true,
                    text: `Temperature Trend for ${responseData.crop} (${responseData.issue.replace(/_/g, ' ')})`
                }
            }
        }
    };

    new Chart(ctx, config);
} 