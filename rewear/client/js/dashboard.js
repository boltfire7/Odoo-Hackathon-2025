// Dashboard JavaScript for ReWear
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();
            this.currentUser = data.user;
            this.updateUserInterface();
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/login.html';
        }
    }

    updateUserInterface() {
        const userNameElements = document.querySelectorAll('#userName, #userNameHeader');
        userNameElements.forEach(element => {
            element.textContent = this.currentUser.name;
        });
    }

    setupEventListeners() {
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadUserStats(),
            this.loadMyItems(),
            this.loadSwapRequests(),
            this.loadRecentActivity(),
            this.loadPointsHistory()
        ]);
    }

    async loadUserStats() {
        try {
            const [itemsResponse, swapsResponse, pointsResponse] = await Promise.all([
                fetch('/api/items/user/items', { credentials: 'include' }),
                fetch('/api/swaps/user/pending-requests', { credentials: 'include' }),
                fetch('/api/points/balance', { credentials: 'include' })
            ]);

            const items = await itemsResponse.json();
            const swaps = await swapsResponse.json();
            const points = await pointsResponse.json();

            // Update stats
            document.getElementById('itemsCount').textContent = items.length || 0;
            document.getElementById('swapsCount').textContent = swaps.length || 0;
            document.getElementById('pointsBalance').textContent = points.points || 0;
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async loadMyItems() {
        try {
            const response = await fetch('/api/items/user/items', {
                credentials: 'include'
            });
            const items = await response.json();
            this.renderMyItems(items);
        } catch (error) {
            console.error('Error loading my items:', error);
            this.renderMyItems([]);
        }
    }

    renderMyItems(items) {
        const container = document.getElementById('myItems');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tshirt"></i>
                    <h3>No items yet</h3>
                    <p>Start by adding your first clothing item!</p>
                    <a href="add-item.html" class="btn btn-primary">Add Item</a>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => this.createItemCard(item)).join('');
    }

    createItemCard(item) {
        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : '/assets/placeholder.jpg';
        
        return `
            <div class="item-card">
                <img src="${imageUrl}" alt="${item.title}" class="item-image">
                <div class="item-content">
                    <h4 class="item-title">${item.title}</h4>
                    <div class="item-details">
                        <span>${item.condition} • ${item.category}</span>
                        <span class="item-price">${item.points_value} pts</span>
                    </div>
                    <div class="item-status">
                        <span class="status-badge status-${item.status}">${item.status}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-outline btn-sm" onclick="editItem(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="deleteItem(${item.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadSwapRequests() {
        try {
            const response = await fetch('/api/swaps/user/pending-requests', {
                credentials: 'include'
            });
            const requests = await response.json();
            this.renderSwapRequests(requests);
        } catch (error) {
            console.error('Error loading swap requests:', error);
            this.renderSwapRequests([]);
        }
    }

    renderSwapRequests(requests) {
        const container = document.getElementById('swapRequests');
        if (!container) return;

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>No pending requests</h3>
                    <p>You don't have any pending swap requests.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(request => this.createSwapRequestCard(request)).join('');
    }

    createSwapRequestCard(request) {
        return `
            <div class="swap-request">
                <div class="swap-request-header">
                    <span class="swap-request-user">${request.requester.name}</span>
                    <span class="swap-request-status ${request.status}">${request.status}</span>
                </div>
                <div class="swap-request-item">
                    Wants to swap: ${request.item.title}
                </div>
                <div class="swap-request-actions">
                    <button class="btn btn-primary btn-sm" onclick="approveSwap(${request.id})">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="rejectSwap(${request.id})">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `;
    }

    async loadRecentActivity() {
        try {
            const [itemsResponse, swapsResponse, pointsResponse] = await Promise.all([
                fetch('/api/items/user/items', { credentials: 'include' }),
                fetch('/api/swaps/user/requests', { credentials: 'include' }),
                fetch('/api/points/transactions', { credentials: 'include' })
            ]);

            const items = await itemsResponse.json();
            const swaps = await swapsResponse.json();
            const points = await pointsResponse.json();

            const activities = this.combineActivities(items, swaps, points);
            this.renderRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.renderRecentActivity([]);
        }
    }

    combineActivities(items, swaps, points) {
        const activities = [];

        // Add recent items
        items.slice(0, 3).forEach(item => {
            activities.push({
                type: 'item',
                title: `Added "${item.title}"`,
                description: `You listed a new ${item.category}`,
                time: item.created_at,
                icon: 'fas fa-tshirt'
            });
        });

        // Add recent swaps
        swaps.slice(0, 3).forEach(swap => {
            activities.push({
                type: 'swap',
                title: `Swap request for "${swap.item.title}"`,
                description: `Request ${swap.status}`,
                time: swap.created_at,
                icon: 'fas fa-exchange-alt'
            });
        });

        // Add recent points transactions
        points.slice(0, 3).forEach(transaction => {
            activities.push({
                type: 'points',
                title: `${transaction.amount > 0 ? 'Earned' : 'Spent'} ${Math.abs(transaction.amount)} points`,
                description: transaction.reason,
                time: transaction.created_at,
                icon: 'fas fa-coins'
            });
        });

        // Sort by time and return recent 5
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No recent activity</h3>
                    <p>Your activity will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => this.createActivityCard(activity)).join('');
    }

    createActivityCard(activity) {
        const timeAgo = this.getTimeAgo(new Date(activity.time));
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }

    async loadPointsHistory() {
        try {
            const response = await fetch('/api/points/transactions', {
                credentials: 'include'
            });
            const transactions = await response.json();
            this.renderPointsHistory(transactions);
        } catch (error) {
            console.error('Error loading points history:', error);
            this.renderPointsHistory([]);
        }
    }

    renderPointsHistory(transactions) {
        const container = document.getElementById('pointsHistory');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coins"></i>
                    <h3>No points history</h3>
                    <p>Your points transactions will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => this.createPointsTransactionCard(transaction)).join('');
    }

    createPointsTransactionCard(transaction) {
        const isPositive = transaction.amount > 0;
        const timeAgo = this.getTimeAgo(new Date(transaction.created_at));
        
        return `
            <div class="points-transaction">
                <div class="transaction-details">
                    <h4>${transaction.reason}</h4>
                    <p>${timeAgo}</p>
                </div>
                <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : ''}${transaction.amount} pts
                </div>
            </div>
        `;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Global functions for item actions
window.editItem = function(itemId) {
    window.location.href = `/edit-item.html?id=${itemId}`;
};

window.deleteItem = async function(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
    }
};

window.approveSwap = async function(requestId) {
    try {
        const response = await fetch(`/api/swaps/requests/${requestId}/approve`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to approve swap');
        }
    } catch (error) {
        console.error('Error approving swap:', error);
        alert('Failed to approve swap. Please try again.');
    }
};

window.rejectSwap = async function(requestId) {
    try {
        const response = await fetch(`/api/swaps/requests/${requestId}/reject`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to reject swap');
        }
    } catch (error) {
        console.error('Error rejecting swap:', error);
        alert('Failed to reject swap. Please try again.');
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Add CSS for empty states
const dashboardStyles = `
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }
    
    .empty-state i {
        font-size: 3rem;
        color: var(--text-light);
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .empty-state p {
        margin-bottom: 1.5rem;
    }
    
    .item-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .status-available {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-swapped {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .status-pending {
        background-color: #dbeafe;
        color: #1e40af;
    }
`;

// Inject dashboard styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet); 