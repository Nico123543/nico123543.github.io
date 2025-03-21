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

    displaySuccessCards();
});

// Function to create a success card element
function createSuccessCard(successData, index) {
    const card = document.createElement('div');
    card.className = 'success-card';

    // Set background color based on index
    const cardColors = ['var(--card-color-1)', 'var(--card-color-2)', 'var(--card-color-3)'];
    card.style.backgroundColor = cardColors[index % cardColors.length];

    card.innerHTML = `
        <div class="crop-icon">
            <img src="${successData.icon}" alt="${successData.name}">
        </div>
        <div class="crop-content">
            <div class="crop-header">
                <span>${successData.measure}</span>
                <div class="status-icons">
                    <span class="check" data-crop-name="${successData.name}" data-measure="${successData.measure}">✓</span>
                </div>
            </div>
            <div class="treatments">
                <h3>Treatment Applied</h3>
                <p>${successData.treatments.join(' | ')}</p>
            </div>
        </div>
    `;

    // Add click handler to navigate to crop_detail
    card.addEventListener('click', (event) => {
        if (!event.target.classList.contains('check')) {
            // Store the crop data in sessionStorage
            sessionStorage.setItem('selectedCrop', JSON.stringify(successData));
            // Navigate to crop_detail page
            window.location.href = '../crop_detail/crop_detail.html';
        }
    });

    return card;
}

// Function to display success cards
async function displaySuccessCards() {
    const container = document.getElementById('success-cards-container');
    
    try {
        // Fetch data from the API
        const response = await fetch('http://70.34.210.155:3490/success/getall', {
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
        const uniqueSuccesses = [];
        for (let i = 0; i < Object.keys(data.crop).length; i++) {
            uniqueSuccesses.push({
                name: data.crop[i],
                measure: data.measure[i],
                biological_category: data.biological_category[i]
            });
        }

        // Add new cards
        uniqueSuccesses.forEach((success, index) => {
            const successData = {
                name: success.name,
                icon: `../icons/${getCropIcon(success.name.toLowerCase())}`,
                measure: success.measure.replace(/_/g, ' ').replace(/heat/g, 'Heat'),
                treatments: [success.biological_category]
            };
            
            const card = createSuccessCard(successData, index);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error fetching success messages:', error);
        // Show error message to user
        container.innerHTML = '<p style="color: white; text-align: center;">Error loading success messages. Please try again later.</p>';
    }
}

// Function to get crop icon based on crop name
function getCropIcon(crop) {
    const iconMap = {
        'wheat': 'wheat.png',
        'corn': 'corn.png',
        'soybean': 'soybean.png',
        'cotton': 'cotton.png',
        'rice': 'rice.png',
        'potato': 'potato.png',
        'tomato': 'tomato.png',
        'default': 'default-crop.png'
    };

    return iconMap[crop] || iconMap.default;
} 