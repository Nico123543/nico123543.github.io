document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for status icons
    const statusIcons = document.querySelectorAll('.status-icons span');
    statusIcons.forEach(icon => {
        icon.addEventListener('click', function() {
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
        item.addEventListener('click', function() {
            // Remove active state from all items
            menuItems.forEach(mi => mi.classList.remove('active'));
            // Add active state to clicked item
            this.classList.add('active');
        });
    });

    displayCropCards();

    // Create user
    createUser();
});

// Function to update crop card content
function updateCropCard(cardIndex, newIcon, newTitle, newTreatments) {
    const cards = document.querySelectorAll('.crop-card');
    if (cardIndex >= 0 && cardIndex < cards.length) {
        const card = cards[cardIndex];
        
        // Update icon
        const iconImg = card.querySelector('.crop-icon img');
        if (newIcon) {
            iconImg.src = newIcon;
        }
        
        // Update title
        const titleSpan = card.querySelector('.crop-header span');
        if (newTitle) {
            titleSpan.textContent = newTitle;
        }
        
        // Update treatments
        const treatmentsP = card.querySelector('.treatments p');
        if (newTreatments) {
            treatmentsP.textContent = newTreatments;
        }
    }
}

// Example usage:
// updateCropCard(0, '../icons/new-icon.png', 'New Title', 'New Treatment 1 | New Treatment 2');

// Function to toggle text color
function toggleTextColor(cardIndex) {
    const cards = document.querySelectorAll('.crop-card');
    if (cardIndex >= 0 && cardIndex < cards.length) {
        const card = cards[cardIndex];
        const currentColor = window.getComputedStyle(card).color;
        const newColor = currentColor === 'rgb(0, 0, 0)' ? '#FFFFFF' : '#000000';
        card.style.color = newColor;
        
        const treatmentsP = card.querySelector('.treatments p');
        treatmentsP.style.color = newColor;
    }
}

// Example usage:
// toggleTextColor(0);

// Function to update status icons
function updateStatusIcons(cardIndex, showCheck, showCross) {
    const cards = document.querySelectorAll('.crop-card');
    if (cardIndex >= 0 && cardIndex < cards.length) {
        const card = cards[cardIndex];
        const checkIcon = card.querySelector('.check');
        const crossIcon = card.querySelector('.cross');
        
        checkIcon.style.display = showCheck ? 'flex' : 'none';
        crossIcon.style.display = showCross ? 'flex' : 'none';
    }
}

// Example usage:
// updateStatusIcons(0, true, false);

// Function to create a crop card element
function createCropCard(cropData, index) {
    const card = document.createElement('div');
    card.className = 'crop-card';
    
    // Set background color based on index
    const cardColors = ['var(--card-color-1)', 'var(--card-color-2)', 'var(--card-color-3)'];
    card.style.backgroundColor = cardColors[index % cardColors.length];
    
    card.innerHTML = `
        <div class="crop-icon">
            <img src="${cropData.icon}" alt="${cropData.name}">
        </div>
        <div class="crop-content">
            <div class="crop-header">
                <span>${cropData.measure}</span>
                <div class="status-icons">
                    <span class="check">✓</span>
                    <span class="cross">✕</span>
                </div>
            </div>
            <div class="treatments">
                <h3>Treatments</h3>
                <p>${cropData.treatments.join(' | ')}</p>
            </div>
        </div>
    `;

    // Add click handler to navigate to crop_detail
    card.addEventListener('click', () => {
        // Store the crop data in sessionStorage
        sessionStorage.setItem('selectedCrop', JSON.stringify(cropData));
        // Navigate to crop_detail page
        window.location.href = '../crop_detail/crop_detail.html';
    });
    
    return card;
}

// Function to add event listeners to status icons
function addStatusIconListeners() {
    const statusIcons = document.querySelectorAll('.status-icons span');
    statusIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('span').forEach(span => {
                span.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        });
    });
}

// Function to display crop cards
async function displayCropCards() {
    const container = document.getElementById('crop-cards-container');
    
    try {
        // Fetch data from the API
        const response = await fetch('http://70.34.210.155:3490/alerts/getall', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Clear existing cards
        container.innerHTML = '';
        
        // Create an array to store unique combinations of crop and measure
        const uniqueAlerts = [];
        for (let i = 0; i < Object.keys(data.crop).length; i++) {
            uniqueAlerts.push({
                name: data.crop[i],
                measure: data.measure[i],
                biological_category: data.biological_category[i]
            });
        }

        // Add new cards
        uniqueAlerts.forEach((alert, index) => {
            const cropData = {
                name: alert.name,
                icon: `../icons/${getCropIcon(alert.name.toLowerCase())}`,
                measure: alert.measure.replace(/_/g, ' ').replace(/heat/g, 'Heat'),
                treatments: [alert.biological_category]
            };
            
            const card = createCropCard(cropData, index);
            container.appendChild(card);
        });
        
        // Add event listeners to status icons
        addStatusIconListeners();
        
    } catch (error) {
        console.error('Error fetching alerts:', error);
        // Show error message to user
        container.innerHTML = '<p style="color: white; text-align: center;">Failed to load alerts. Please try again later.</p>';
    }
}

// Helper function to get crop icon
function getCropIcon(crop) {
    const iconMap = {
        'wheat': 'wheat2.png',
        'soybean': 'soya.png',
        'cotton': 'cotton.png',
        'corn': 'corn.png',
        'rice': 'rice.png'
    };
    
    return iconMap[crop.toLowerCase()] || 'rice.png';
}

/* API Integration - To be implemented later
// Function to fetch crop data from API
async function fetchCropData() {
    try {
        // Replace this URL with your actual API endpoint
        const response = await fetch('YOUR_API_ENDPOINT');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching crop data:', error);
        return [];
    }
}
*/

// Function to create user using API
async function createUser() {
    try {
        // Check if user was already created
        if (localStorage.getItem('userCreated') === 'true') {
            console.log('User was already created, skipping API call');
            return;
        }

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (!userData) {
            console.error('No user data found in localStorage');
            return;
        }

        // Prepare the request body according to the API specification
        const requestBody = {
            name: userData.name,
            longitude: userData.location.lng,
            latitude: userData.location.lat,
            crops: userData.selectedPlants
        };

        // Make the API call
        const response = await fetch('http://70.34.210.155:3490/users/create', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('User created successfully:', result);
        
        // Mark that the user has been created
        localStorage.setItem('userCreated', 'true');
        
    } catch (error) {
        console.error('Error creating user:', error);
    }
} 