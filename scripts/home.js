
// DEFINE THE BASE URL FOR YOUR BACKEND HERE
const BASE_URL = "http://localhost:3000";

// Token management
let accessToken = localStorage.getItem('accessToken');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// Tab functionality
const tabs = [
    document.getElementById('openTab'),
    document.getElementById('inProgressTab'),
    document.getElementById('closedTab')
];
const highlight = document.getElementById('highlight');

// Function to refresh token
async function refreshAccessToken() {
    try {
        const response = await fetch(`${BASE_URL}/api/users/refresh-token`, {
            method: 'POST',
            credentials: 'include' // Important for cookies
        });
        
        if (response.ok) {
            const data = await response.json();
            accessToken = data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            if (data.user) {
                currentUser = data.user;
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
    return false;
}

// Authenticated fetch function
async function authFetch(url, options = {}) {
    // Add authorization header if we have a token
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
        ...options,
        headers: headers,
        credentials: 'include'
    });

    // If token expired, try to refresh
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed && accessToken) {
            // Retry the request with new token
            headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, {
                ...options,
                headers: headers,
                credentials: 'include'
            });
        } else {
            // Refresh failed, logout user
            logout();
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
}

// Move highlight and switch tabs
function moveHighlight(tab) {
    if (!highlight) return;
    
    highlight.style.width = `${tab.offsetWidth}px`;
    highlight.style.left = `${tab.offsetLeft}px`;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    loadComplaints(tab.textContent.trim());
}

// Load complaints (PUBLIC - no auth needed)
async function loadComplaints(status = 'Open') {
    try {
        showLoading();
        const response = await fetch(`${BASE_URL}/api/user_issue?status=${status}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }

        const result = await response.json();
        
        if (result.success) {
            displayComplaints(result.data, status);
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error loading complaints:', error);
        displaySampleComplaints(status);
    } finally {
        hideLoading();
    }
}

// Display complaints in the grid
function displayComplaints(complaints, status) {
    const container = document.getElementById('issuesContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (!complaints || complaints.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No ${status.toLowerCase()} complaints</h3>
                <p class="text-gray-500">${status === 'Open' ? 'Be the first to report an issue!' : 'No complaints match the current filter.'}</p>
            </div>
        `;
        return;
    }

    complaints.forEach(complaint => {
        const statusColor = getStatusColor(complaint.status);
        const priorityColor = getPriorityColor(complaint.priority);
        const voteCount = complaint.voteCount || 0;
        
        const complaintCard = `
            <div class="bg-white rounded-xl shadow-lg p-4 issue-card flex gap-4">
                <!-- Voting -->
                <div class="flex flex-col items-center space-y-1">
                    <button class="vote-btn" onclick="handleVote('${complaint._id}')">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    <span class="font-bold text-gray-800">${voteCount}</span>
                    <span class="text-xs text-gray-500">Votes</span>
                </div>
                
                <!-- Main Content -->
                <div class="flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg text-gray-800">${complaint.title}</h3>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${complaint.status}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3">${complaint.description}</p>
                    
                    <div class="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
                        <span><i class="fas fa-calendar mr-1"></i>${new Date(complaint.createdAt).toLocaleDateString()}</span>
                        <span><i class="fas fa-user mr-1"></i>${complaint.user?.name || 'Anonymous'}</span>
                        <span><i class="fas fa-map-marker-alt mr-1"></i>${complaint.location?.address || 'No location'}</span>
                    </div>
                </div>
                
                <!-- Image Preview -->
                <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    ${complaint.images && complaint.images.length > 0 ? 
                        `<img src="${complaint.images[0]}" class="w-full h-full object-cover" alt="Complaint image">` : 
                        `<i class="fas fa-camera text-gray-400 text-xl"></i>`
                    }
                </div>
            </div>
        `;
        container.innerHTML += complaintCard;
    });
}

// Handle voting
async function handleVote(complaintId) {
    try {
        const response = await fetch(`${BASE_URL}/api/user_issue/${complaintId}/vote`, {
            method: 'PUT'
        });

        const result = await response.json();
        
        if (result.success) {
            // Reload complaints to show updated vote count
            const activeTab = document.querySelector('.tab.active');
            loadComplaints(activeTab.textContent.trim());
        } else {
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error voting:', error);
        alert('Error voting on complaint');
    }
}

// Handle complaint submission (WITH AUTH)
document.getElementById('reportIssueForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to submit a complaint');
        return;
    }

    const formData = new FormData(this);
    const complaintData = {
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        category: formData.get('category')
    };

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await authFetch(`${BASE_URL}/api/user_issue`, {
            method: 'POST',
            body: JSON.stringify(complaintData)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Complaint submitted successfully!');
            reportModal.classList.add('hidden');
            this.reset();
            loadComplaints('Open');
        } else {
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        alert('Error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Update UI based on auth status
function updateAuthUI() {
    const welcomeElement = document.getElementById('userWelcome');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (currentUser && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${currentUser.name}!`;
    }
    
    if (logoutBtn) {
        if (currentUser) {
            logoutBtn.style.display = 'block';
            logoutBtn.textContent = 'Logout';
        } else {
            logoutBtn.style.display = 'block';
            logoutBtn.textContent = 'Login';
            logoutBtn.onclick = () => window.location.href = 'index.html';
        }
    }
    
    if (mobileLogoutBtn) {
        if (currentUser) {
            mobileLogoutBtn.style.display = 'block';
            mobileLogoutBtn.textContent = 'Logout';
        } else {
            mobileLogoutBtn.style.display = 'block';
            mobileLogoutBtn.textContent = 'Login';
            mobileLogoutBtn.onclick = () => window.location.href = 'index.html';
        }
    }
}

// Logout function
async function logout() {
    try {
        await fetch(`${BASE_URL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        accessToken = null;
        currentUser = null;
        updateAuthUI();
        window.location.reload();
    }
}

// Helper functions for styling
function getStatusColor(status) {
    const colors = {
        'pending': 'bg-green-100 text-green-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-blue-100 text-blue-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function getPriorityColor(priority) {
    const colors = {
        'high': 'bg-red-500',
        'medium': 'bg-yellow-500', 
        'low': 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
}

function showLoading() {
    const container = document.getElementById('issuesContainer');
    if (container) {
        container.innerHTML = `
            <div class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        `;
    }
}

function hideLoading() {
    // Loading is handled by displayComplaints
}

// Display sample complaints if API fails
function displaySampleComplaints(status = 'Open') {
    const sampleComplaints = {
        'Open': [
            {
                _id: '1',
                title: "Large Pothole on Main Street",
                description: "A large and dangerous pothole has formed near the intersection of Main St and 1st Ave.",
                location: { address: "Main Street & 1st Ave" },
                category: "road",
                status: "pending",
                priority: "high",
                user: { name: "Jane Doe" },
                createdAt: new Date().toISOString(),
                voteCount: 5,
                images: []
            }
        ],
        'In-Progress': [
            {
                _id: '2',
                title: "Broken Streetlight",
                description: "The streetlight on the corner has been out for over a week.",
                location: { address: "City Park Area" },
                category: "electricity",
                status: "in-progress",
                priority: "medium",
                user: { name: "John Smith" },
                createdAt: new Date().toISOString(),
                voteCount: 3,
                images: []
            }
        ],
        'Closed': [
            {
                _id: '3',
                title: "Garbage Collection Issue",
                description: "Garbage hasn't been collected for 3 days in our area.",
                location: { address: "Maple Street" },
                category: "sanitation",
                status: "resolved",
                priority: "medium",
                user: { name: "Mike Johnson" },
                createdAt: new Date().toISOString(),
                voteCount: 8,
                images: []
            }
        ]
    };

    const complaints = sampleComplaints[status] || [];
    displayComplaints(complaints, status);
}

// Modal functionality
const reportModal = document.getElementById("reportModal");
const closeReportModal = document.getElementById("closeReportModal");
const reportIssueBtn = document.getElementById("reportIssueBtn");
const floatingReportBtn = document.getElementById("floatingReportBtn");

// Setup event listeners for modals
if (reportIssueBtn) {
    reportIssueBtn.addEventListener("click", () => {
        if (!currentUser) {
            alert('Please login to submit a complaint');
            window.location.href = 'index.html';
            return;
        }
        if (reportModal) reportModal.classList.remove("hidden");
    });
}

if (floatingReportBtn) {
    floatingReportBtn.addEventListener("click", () => {
        if (!currentUser) {
            alert('Please login to submit a complaint');
            window.location.href = 'index.html';
            return;
        }
        if (reportModal) reportModal.classList.remove("hidden");
    });
}

if (closeReportModal && reportModal) {
    closeReportModal.addEventListener("click", () => {
        reportModal.classList.add("hidden");
    });

    reportModal.addEventListener("click", (e) => {
        if (e.target === reportModal) {
            reportModal.classList.add("hidden");
        }
    });
}

// Setup tab functionality
if (tabs.length > 0 && highlight) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            moveHighlight(tab);
        });
    });
}

// Setup logout buttons
function setupLogoutButtons() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (logoutBtn && currentUser) {
        logoutBtn.onclick = logout;
    }
    
    if (mobileLogoutBtn && currentUser) {
        mobileLogoutBtn.onclick = logout;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    setupLogoutButtons();
    
    // Load initial complaints if we have tabs
    if (tabs.length > 0) {
        moveHighlight(tabs[0]);
    } else {
        // Fallback: just load open complaints
        loadComplaints('Open');
    }
});