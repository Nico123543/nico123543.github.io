document.addEventListener('DOMContentLoaded', () => {
    // Get the selected crop from localStorage
    const selectedCrop = localStorage.getItem('selectedCrop') || 'wheat';
    
    // Update the page title
    document.getElementById('cropTitle').textContent = 
        selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1);
    
    // Initialize base image for all crops
    const baseImage = document.getElementById('baseImage');
    baseImage.src = `../icons/${getCropIcon(selectedCrop, 'base')}`;
    baseImage.style.opacity = '1';

    // Show treatments only for wheat
    const treatmentsSection = document.querySelector('.treatments');
    if (selectedCrop !== 'wheat') {
        treatmentsSection.style.display = 'none';
        // Hide other states for non-wheat crops
        document.getElementById('stressImage').style.display = 'none';
        document.getElementById('yieldImage').style.display = 'none';
        document.getElementById('combinedImage').style.display = 'none';
    } else {
        // Initialize additional images for wheat
        const stressImage = document.getElementById('stressImage');
        const yieldImage = document.getElementById('yieldImage');
        const combinedImage = document.getElementById('combinedImage');

        // Set image sources for wheat states
        stressImage.src = `../icons/${getCropIcon(selectedCrop, 'stress')}`;
        yieldImage.src = `../icons/${getCropIcon(selectedCrop, 'yield')}`;
        combinedImage.src = `../icons/${getCropIcon(selectedCrop, 'combined')}`;

        // Get sliders
        const stressSlider = document.getElementById('stressSlider');
        const yieldSlider = document.getElementById('yieldSlider');

        // Add slider event listeners
        stressSlider.addEventListener('input', updateImages);
        yieldSlider.addEventListener('input', updateImages);

        // Add click handlers for plus/minus buttons
        document.querySelectorAll('.treatment-controls').forEach(controls => {
            const minus = controls.querySelector('.minus');
            const plus = controls.querySelector('.plus');
            const slider = controls.querySelector('.slider');

            minus.addEventListener('click', () => {
                slider.value = 1;
                updateImages();
            });

            plus.addEventListener('click', () => {
                slider.value = 5;
                updateImages();
            });
        });

        // Initial image update
        updateImages();
    }
});

function updateImages() {
    const stressValue = parseInt(document.getElementById('stressSlider').value);
    const yieldValue = parseInt(document.getElementById('yieldSlider').value);

    const baseImage = document.getElementById('baseImage');
    const stressImage = document.getElementById('stressImage');
    const yieldImage = document.getElementById('yieldImage');
    const combinedImage = document.getElementById('combinedImage');

    // Hide all other images
    stressImage.style.display = 'none';
    yieldImage.style.display = 'none';
    combinedImage.style.display = 'none';

    // Show the corresponding image based on both slider values
    baseImage.src = `../AnimationPlants/${stressValue}_${yieldValue}.png`;
    baseImage.style.display = 'block';
    baseImage.style.opacity = '1';
}

function getCropIcon(crop, state = 'base') {
    const iconMap = {
        'wheat': {
            'base': 'rice.png',
            'stress': 'wheat-stress.png',
            'yield': 'wheat-yield.png',
            'combined': 'wheat-combined.png'
        },
        'soybean': { 'base': 'soya.png' },
        'cotton': { 'base': 'cotton.png' },
        'corn': { 'base': 'corn.png' },
        'rice': { 'base': 'rice.png' }
    };
    
    return iconMap[crop]?.[state] || iconMap[crop]?.['base'] || 'rice.png';
} 