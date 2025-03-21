document.addEventListener('DOMContentLoaded', () => {
    // Add click handler for back button
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', () => {
        window.location.href = '../guide/explore.html';
    });

    // Add click handlers for treatment expand buttons
    const expandButtons = document.querySelectorAll('.expand-button');
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle between + and -
            this.textContent = this.textContent === '+' ? '-' : '+';
            // Here you could add logic to show/hide treatment details
        });
    });

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
}); 