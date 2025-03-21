let map;
let marker;
let selectedLocation = {
    lat: 19.0760,
    lng: 72.8777
};

function toggleSelection(element) {
    element.classList.toggle('selected');
    validateForm();
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

    if (!finishBtn) return;

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

                map.setView([lat, lng], 13);
                marker.setLatLng([lat, lng]);
                selectedLocation = { lat, lng };
                updateAddressDisplay(lat, lng);
            }
        })
        .catch(error => {
            console.error('Error searching location:', error);
        });
}

async function createUser() {
    try {
        console.log("createUser called");
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!userData) {
            console.error('No user data found in localStorage');
            return;
        }

        const requestBody = {
            name: userData.name,
            longitude: userData.location.lng,
            latitude: userData.location.lat,
            crops: userData.selectedPlants
        };

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
        localStorage.setItem('userCreated', 'true');
        console.log("createUser finished");

    } catch (error) {
        console.error('Error creating user:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map').setView([19.0760, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([19.0760, 72.8777], { draggable: true }).addTo(map);

    const searchInput = document.querySelector('.location-name');
    searchInput.value = '';

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchText = searchInput.value.trim();
            if (searchText) {
                searchLocation(searchText);
            }
        }
    });

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        marker.setLatLng([lat, lng]);
        selectedLocation = { lat, lng };
        updateAddressDisplay(lat, lng);
    });

    marker.on('dragend', function() {
        const position = marker.getLatLng();
        selectedLocation = {
            lat: position.lat,
            lng: position.lng
        };
        updateAddressDisplay(position.lat, position.lng);
    });

    updateAddressDisplay(19.0760, 72.8777);

    const nameInput = document.querySelector('.profile-name');
    nameInput.addEventListener('input', validateForm);

    const finishBtn = document.querySelector('.finish-button');

    if (finishBtn) {
        finishBtn.addEventListener('click', async function(event) {
            event.preventDefault();

            const name = document.querySelector('.profile-name').value;
            const selectedPlants = [];
            document.querySelectorAll('.plant-item.selected img').forEach(img => {
                selectedPlants.push(img.alt);
            });

            const userData = {
                name: name,
                selectedPlants: selectedPlants,
                location: selectedLocation
            };

            localStorage.clear();
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userCreated', 'false');

            await createUser().catch(error => {
                console.error("createUser error:", error);
            });

            console.log('Stored User Data:', userData);
            window.location.href = '../alert/alert.html';
        });
    }

    validateForm();
});