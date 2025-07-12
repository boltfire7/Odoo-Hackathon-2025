// Main JavaScript for ReWear Landing Page
class ReWearApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeaturedItems();
        this.setupSearch();
        this.setupCategoryNavigation();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.navigateToCategory(category);
            });
        });

        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    setupSearch() {
        // Debounce search input
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch();
                }, 500);
            });
        }
    }

    setupCategoryNavigation() {
        // Add click handlers for category navigation
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.navigateToCategory(category);
            });
        });
    }

    async loadFeaturedItems() {
        try {
            const response = await fetch('/api/items/featured');
            const data = await response.json();
            
            this.renderFeaturedItems(data.newest, 'newestItems');
            this.renderFeaturedItems(data.popular, 'popularItems');
        } catch (error) {
            console.error('Error loading featured items:', error);
            this.renderPlaceholderItems();
        }
    }

    renderFeaturedItems(items, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (items && items.length > 0) {
            container.innerHTML = items.map(item => this.createItemCard(item)).join('');
        } else {
            container.innerHTML = this.createPlaceholderCards(3);
        }
    }

    createItemCard(item) {
        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : '/assets/placeholder.jpg';
        
        return `
            <div class="item-card" onclick="window.location.href='/item-detail.html?id=${item.id}'">
                <img src="${imageUrl}" alt="${item.title}" class="item-image">
                <div class="item-content">
                    <h4 class="item-title">${item.title}</h4>
                    <div class="item-details">
                        <span>${item.condition} • ${item.category}</span>
                        <span class="item-price">${item.points_value} pts</span>
                    </div>
                    <div class="item-uploader">
                        <small>by ${item.uploader?.name || 'Anonymous'}</small>
                    </div>
                </div>
            </div>
        `;
    }

    createPlaceholderCards(count) {
        return Array(count).fill().map(() => `
            <div class="item-card placeholder">
                <div class="item-image placeholder-image"></div>
                <div class="item-content">
                    <div class="placeholder-title"></div>
                    <div class="placeholder-details"></div>
                </div>
            </div>
        `).join('');
    }

    renderPlaceholderItems() {
        const containers = ['newestItems', 'popularItems'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = this.createPlaceholderCards(3);
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (query) {
            // Navigate to browse page with search query
            window.location.href = `/browse.html?search=${encodeURIComponent(query)}`;
        }
    }

    navigateToCategory(category) {
        window.location.href = `/browse.html?category=${encodeURIComponent(category)}`;
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatPoints(points) {
        return points.toLocaleString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReWearApp();
});

// Add CSS for notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-info {
        background-color: var(--primary-color);
    }
    
    .notification-success {
        background-color: #10b981;
    }
    
    .notification-error {
        background-color: #ef4444;
    }
    
    .placeholder-image {
        background-color: var(--bg-tertiary);
        height: 200px;
    }
    
    .placeholder-title {
        height: 20px;
        background-color: var(--bg-tertiary);
        margin-bottom: 0.5rem;
        border-radius: var(--radius-sm);
    }
    
    .placeholder-details {
        height: 16px;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-sm);
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 