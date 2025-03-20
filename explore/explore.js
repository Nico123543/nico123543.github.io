document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for bottom menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // If the item contains a link, don't prevent default
            if (!item.querySelector('a')) {
                e.preventDefault();
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Add click handlers for crop items
    const cropItems = document.querySelectorAll('.crop-item');
    cropItems.forEach(item => {
        item.addEventListener('click', function() {
            const cropName = this.querySelector('span').textContent.toLowerCase();
            localStorage.setItem('selectedCrop', cropName);
            window.location.href = '../explore_products/explore_products.html';
        });
    });
}); 