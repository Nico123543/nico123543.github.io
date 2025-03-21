let map;
let marker;
let selectedLocation = {
    lat: 19.0760,
    lng: 72.8777
};

function toggleSelection(element) {
    element.classList.toggle('selected');
    validateForm(); // Check validation after toggling selection
}

function updateAddressDisplay(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name.split(',')[0];
            document.querySelector('.location-text').textContent = address;
            document.querySelector('.location-name').value = address;
        })
        .catch(error => {
            document.querySelector('.location-text').textContent = 'Location not found';
            document.querySelector('.location-name').value = '';
        });
}

function validateForm() {
    const nameInput = document.querySelector('.profile-name');
    const selectedPlants = document.querySelectorAll('.plant-item.selected');
    const finishBtn = document.querySelector('.finish-button');
    
    if (!finishBtn) return; // Guard clause if button not found
    
    // Check if name is not empty and at least one plant is selected
    const isValid = nameInput.value.trim() !== '' && selectedPlants.length > 0;
    
    finishBtn.style.opacity = isValid ? '1' : '0.5';
    finishBtn.style.pointerEvents = isValid ? 'auto' : 'none';
}

function searchLocation(searchText) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lng = parseFloat(location.lon);
                
                // Update map and marker
                map.setView([lat, lng], 13);
                marker.setLatLng([lat, lng]);
                
                // Update selected location
                selectedLocation = { lat, lng };
                
                // Update address display
                updateAddressDisplay(lat, lng);
            }
        })
        .catch(error => {
            console.error('Error searching location:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    map = L.map('map').setView([19.0760, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add initial marker
    marker = L.marker([19.0760, 72.8777], { draggable: true }).addTo(map);

    // Add search functionality
    const searchInput = document.querySelector('.location-name');
    searchInput.value = ''; // Clear the initial value

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchText = searchInput.value.trim();
            if (searchText) {
                searchLocation(searchText);
            }
        }
    });

    // Handle map clicks
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Update marker position
        marker.setLatLng([lat, lng]);
        
        // Update selected location
        selectedLocation = {
            lat: lat,
            lng: lng
        };
        
        // Update coordinates display
        updateAddressDisplay(lat, lng);
    });

    // Handle marker drag
    marker.on('dragend', function() {
        const position = marker.getLatLng();
        selectedLocation = {
            lat: position.lat,
            lng: position.lng
        };
        
        updateAddressDisplay(position.lat, position.lng);
    });

    // Initialize coordinates display
    updateAddressDisplay(19.0760, 72.8777);

    // Add input event listener for name field
    const nameInput = document.querySelector('.profile-name');
    nameInput.addEventListener('input', validateForm);

    // Handle finish button click
    const finishBtn = document.querySelector('.finish-button');
    
    if (finishBtn) {
        finishBtn.addEventListener('click', function() {
            // Get the user's name
            const name = document.querySelector('.profile-name').value;
            
            // Get selected plants
            const selectedPlants = [];
            document.querySelectorAll('.plant-item.selected img').forEach(img => {
                selectedPlants.push(img.alt);
            });
            
            // Create data object with location coordinates
            const userData = {
                name: name,
                selectedPlants: selectedPlants,
                location: selectedLocation
            };
            
            // Clear localStorage before storing new data
            localStorage.clear();
            
            // Store in localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userCreated', 'false');
            
            // Log to console
            console.log('Stored User Data:', userData);
            
            // Redirect to the alert page
            window.location.href = '../alert/alert.html';
        });
    }

    // Initial validation
    validateForm();
}); 
