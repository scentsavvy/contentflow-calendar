// Sample initial data
const initialContent = [
    {
        id: 1,
        title: "Summer Travel Tips",
        description: "Top 10 destinations for summer vacation",
        date: "2023-06-15",
        platforms: ["youtube", "instagram"],
        priority: "medium"
    },
    {
        id: 2,
        title: "New Product Launch",
        description: "Announcing our latest innovation",
        date: "2023-06-22",
        platforms: ["twitter", "instagram", "tiktok"],
        priority: "high"
    },
    {
        id: 3,
        title: "Behind the Scenes",
        description: "A look at our creative process",
        date: "2023-06-10",
        platforms: ["tiktok"],
        priority: "low"
    }
];

// Content templates
const contentTemplates = [
    {
        name: "Product Launch",
        title: "New Product: [PRODUCT_NAME]",
        description: "Introducing our latest innovation...",
        platforms: ["youtube", "instagram", "twitter"],
        priority: "high"
    },
    {
        name: "Tutorial",
        title: "How to [ACTION]",
        description: "Step-by-step guide to accomplish...",
        platforms: ["youtube", "tiktok"],
        priority: "medium"
    },
    {
        name: "Behind the Scenes",
        title: "Behind the Scenes: [PROJECT]",
        description: "A look at how we created...",
        platforms: ["instagram", "tiktok"],
        priority: "low"
    },
    {
        name: "Industry News",
        title: "[INDUSTRY] News Update",
        description: "Latest developments in our field...",
        platforms: ["twitter", "linkedin"],
        priority: "medium"
    }
];

// DOM Elements
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const contentForm = document.getElementById('content-form');
const platformFilters = document.querySelectorAll('.platform-btn');
const totalContentEl = document.getElementById('total-content');
const thisMonthEl = document.getElementById('this-month');
const storageWarning = document.getElementById('storage-warning');
const searchInput = document.getElementById('search-input');
const templateList = document.getElementById('template-list');
const notification = document.getElementById('notification');
const closeNotification = document.getElementById('close-notification');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const analyticsBtn = document.getElementById('analytics-btn');
const priorityOptions = document.querySelectorAll('.priority-option');

// State
let currentDate = new Date();
let contentItems = [];
let activeFilter = 'all';
let storageAvailable = false;
let currentSearchQuery = '';
let currentPriority = 'low';

// Check if localStorage is available
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// Load data from localStorage or use initial data
function loadData() {
    if (storageAvailable) {
        const savedData = localStorage.getItem('contentItems');
        if (savedData) {
            contentItems = JSON.parse(savedData);
        } else {
            contentItems = [...initialContent];
            saveData();
        }
    } else {
        // If no storage, use initial data for this session
        contentItems = [...initialContent];
        storageWarning.style.display = 'block';
    }
}

// Save data to localStorage
function saveData() {
    if (storageAvailable) {
        localStorage.setItem('contentItems', JSON.stringify(contentItems));
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const icon = notification.querySelector('.notification-icon i');
    const title = notification.querySelector('.notification-text h4');
    const text = notification.querySelector('.notification-text p');
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        title.textContent = 'Success!';
        notification.className = 'notification success show';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        title.textContent = 'Error!';
        notification.className = 'notification error show';
    }
    
    text.textContent = message;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close notification
closeNotification.addEventListener('click', () => {
    notification.classList.remove('show');
});

// Render templates
function renderTemplates() {
    templateList.innerHTML = '';
    
    contentTemplates.forEach(template => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.innerHTML = `
            <div class="template-title">${template.name}</div>
            <div class="template-platforms">
                ${template.platforms.map(p => 
                    `<i class="fab fa-${p === 'youtube' ? 'youtube' : 
                      p === 'instagram' ? 'instagram' : 
                      p === 'tiktok' ? 'tiktok' : 'twitter'}"></i>`
                ).join(' ')}
            </div>
        `;
        
        templateItem.addEventListener('click', () => {
            // Fill form with template data
            document.getElementById('content-title').value = template.title;
            document.getElementById('content-desc').value = template.description;
            
            // Reset checkboxes and set template platforms
            document.querySelectorAll('input[name="platform"]').forEach(checkbox => {
                checkbox.checked = template.platforms.includes(checkbox.value);
            });
            
            // Set priority
            document.querySelectorAll('.priority-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.priority === template.priority) {
                    option.classList.add('active');
                    currentPriority = template.priority;
                }
            });
            
            // Focus on title
            document.getElementById('content-title').focus();
        });
        
        templateList.appendChild(templateItem);
    });
}

// Initialize
function init() {
    // Check storage availability
    storageAvailable = isStorageAvailable();
    
    // Load data
    loadData();
    
    // Render UI
    renderCalendar();
    updateStats();
    renderTemplates();
    setupEventListeners();
    
    // Set today's date as default in form
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('content-date').value = formattedDate;
    
    // Set initial priority
    document.querySelector('.priority-option.active').dataset.priority;
}

// Render calendar
function renderCalendar() {
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Update month header
    currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month and last day
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Create day headers
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        const contentItemsContainer = document.createElement('div');
        contentItemsContainer.className = 'content-items';
        
        // Filter content for this day
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = formatDate(dayDate);
        
        let dayContent = contentItems.filter(item => item.date === formattedDate);
        
        // Apply platform filter
        if (activeFilter !== 'all') {
            dayContent = dayContent.filter(item => item.platforms.includes(activeFilter));
        }
        
        // Apply search filter
        if (currentSearchQuery) {
            dayContent = dayContent.filter(item => 
                item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(currentSearchQuery.toLowerCase())
            );
        }
        
        // Add content items
        dayContent.forEach(item => {
            const contentItem = document.createElement('div');
            contentItem.className = `content-item ${item.platforms[0]} ${item.priority}`;
            contentItem.dataset.id = item.id;
            contentItem.draggable = true;
            
            const title = document.createElement('div');
            title.className = 'content-title';
            
            // Get platform icon
            let platformIcon = '';
            if (item.platforms.includes('youtube')) platformIcon = '<i class="fab fa-youtube"></i>';
            else if (item.platforms.includes('instagram')) platformIcon = '<i class="fab fa-instagram"></i>';
            else if (item.platforms.includes('tiktok')) platformIcon = '<i class="fab fa-tiktok"></i>';
            else if (item.platforms.includes('twitter')) platformIcon = '<i class="fab fa-twitter"></i>';
            
            title.innerHTML = `<span class="platform-icon">${platformIcon}</span> ${item.title}`;
            contentItem.appendChild(title);
            
            const desc = document.createElement('div');
            desc.className = 'content-desc';
            desc.textContent = item.description;
            contentItem.appendChild(desc);
            
            const meta = document.createElement('div');
            meta.className = 'content-meta';
            meta.innerHTML = `
                <span>${item.platforms.length} platform${item.platforms.length > 1 ? 's' : ''}</span>
                <span>${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}</span>
            `;
            contentItem.appendChild(meta);
            
            const actions = document.createElement('div');
            actions.className = 'content-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editContent(item.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteContent(item.id);
            });
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            contentItem.appendChild(actions);
            
            // Drag events
            contentItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                contentItem.classList.add('dragging');
            });
            
            contentItem.addEventListener('dragend', () => {
                contentItem.classList.remove('dragging');
            });
            
            contentItemsContainer.appendChild(contentItem);
        });
        
        dayCell.appendChild(contentItemsContainer);
        
        // Drop event for calendar day
        dayCell.addEventListener('dragover', (e) => {
            e.preventDefault();
            dayCell.style.backgroundColor = '#e3f2fd';
        });
        
        dayCell.addEventListener('dragleave', () => {
            dayCell.style.backgroundColor = '';
        });
        
        dayCell.addEventListener('drop', (e) => {
            e.preventDefault();
            dayCell.style.backgroundColor = '';
            const contentId = e.dataTransfer.getData('text/plain');
            const newDate = dayCell.dataset.date;
            moveContentToNewDate(contentId, newDate);
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

// Move content to new date
function moveContentToNewDate(contentId, newDate) {
    const content = contentItems.find(item => item.id == contentId);
    if (content) {
        content.date = newDate;
        saveData();
        renderCalendar();
        showNotification(`Moved "${content.title}" to ${newDate}`);
    }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Update statistics
function updateStats() {
    totalContentEl.textContent = contentItems.length;
    
    // Count content for current month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyContent = contentItems.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    thisMonthEl.textContent = monthlyContent.length;
}

// Add new content
function addContent(title, description, date, platforms, priority) {
    const newContent = {
        id: Date.now(),
        title,
        description,
        date,
        platforms,
        priority
    };
    
    contentItems.push(newContent);
    saveData();
    renderCalendar();
    updateStats();
    showNotification('Content added successfully!');
}

// Edit content
function editContent(id) {
    const content = contentItems.find(item => item.id === id);
    if (!content) return;
    
    // Fill form with content data
    document.getElementById('content-title').value = content.title;
    document.getElementById('content-desc').value = content.description;
    document.getElementById('content-date').value = content.date;
    
    // Reset checkboxes
    document.querySelectorAll('input[name="platform"]').forEach(checkbox => {
        checkbox.checked = content.platforms.includes(checkbox.value);
    });
    
    // Set priority
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.priority === content.priority) {
            option.classList.add('active');
            currentPriority = content.priority;
        }
    });
    
    // Change form submit behavior
    contentForm.dataset.editId = id;
    contentForm.querySelector('button').innerHTML = '<i class="fas fa-edit"></i> Update Content';
}

// Update content
function updateContent(id, title, description, date, platforms, priority) {
    const index = contentItems.findIndex(item => item.id === id);
    if (index !== -1) {
        contentItems[index] = { id, title, description, date, platforms, priority };
        saveData();
        renderCalendar();
        updateStats();
        
        // Reset form
        contentForm.reset();
        delete contentForm.dataset.editId;
        contentForm.querySelector('button').innerHTML = '<i class="fas fa-save"></i> Save Content';
        
        showNotification('Content updated successfully!');
    }
}

// Delete content
function deleteContent(id) {
    if (confirm('Are you sure you want to delete this content?')) {
        contentItems = contentItems.filter(item => item.id !== id);
        saveData();
        renderCalendar();
        updateStats();
        showNotification('Content deleted successfully!');
    }
}

// Export to CSV
function exportToCSV() {
    let csv = 'Title,Description,Date,Platforms,Priority\n';
    contentItems.forEach(item => {
        const platforms = item.platforms.join('|');
        csv += `"${item.title}","${item.description}",${item.date},"${platforms}","${item.priority}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-calendar.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Content exported successfully!');
}

// Import from JSON
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedItems = JSON.parse(e.target.result);
                contentItems = [...contentItems, ...importedItems];
                saveData();
                renderCalendar();
                updateStats();
                showNotification('Content imported successfully!');
            } catch (error) {
                showNotification('Invalid JSON file', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Analytics
function showAnalytics() {
    const analytics = {
        totalPosts: contentItems.length,
        platformDistribution: {},
        monthlyTrends: {},
        priorityDistribution: { high: 0, medium: 0, low: 0 }
    };
    
    contentItems.forEach(item => {
        // Platform distribution
        item.platforms.forEach(platform => {
            analytics.platformDistribution[platform] = 
                (analytics.platformDistribution[platform] || 0) + 1;
        });
        
        // Monthly trends
        const month = item.date.substring(0, 7); // YYYY-MM
        analytics.monthlyTrends[month] = (analytics.monthlyTrends[month] || 0) + 1;
        
        // Priority distribution
        analytics.priorityDistribution[item.priority]++;
    });
    
    // Create analytics modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    modalContent.innerHTML = `
        <h2><i class="fas fa-chart-bar"></i> Content Analytics</h2>
        <div style="margin: 20px 0;">
            <h3>Total Content: ${analytics.totalPosts}</h3>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Platform Distribution</h3>
            <ul>
                ${Object.entries(analytics.platformDistribution).map(([platform, count]) => 
                    `<li>${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${count}</li>`
                ).join('')}
            </ul>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Priority Distribution</h3>
            <ul>
                <li>High: ${analytics.priorityDistribution.high}</li>
                <li>Medium: ${analytics.priorityDistribution.medium}</li>
                <li>Low: ${analytics.priorityDistribution.low}</li>
            </ul>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Monthly Trends</h3>
            <ul>
                ${Object.entries(analytics.monthlyTrends).map(([month, count]) => 
                    `<li>${month}: ${count} posts</li>`
                ).join('')}
            </ul>
        </div>
        
        <button id="close-analytics" class="btn btn-primary" style="margin-top: 20px;">
            Close
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    document.getElementById('close-analytics').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateStats();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateStats();
    });
    
    // Platform filters
    platformFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            platformFilters.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update filter
            activeFilter = btn.dataset.platform;
            renderCalendar();
        });
    });
    
    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderCalendar();
    });
    
    // Priority options
    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            priorityOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentPriority = option.dataset.priority;
        });
    });
    
    // Form submission
    contentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('content-title').value;
        const description = document.getElementById('content-desc').value;
        const date = document.getElementById('content-date').value;
        
        // Get selected platforms
        const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
            .map(checkbox => checkbox.value);
        
        if (platforms.length === 0) {
            showNotification('Please select at least one platform', 'error');
            return;
        }
        
        // Check if we're editing or adding
        if (contentForm.dataset.editId) {
            const id = parseInt(contentForm.dataset.editId);
            updateContent(id, title, description, date, platforms, currentPriority);
        } else {
            addContent(title, description, date, platforms, currentPriority);
        }
        
        // Reset form
        contentForm.reset();
        document.querySelector('.priority-option.active').classList.remove('active');
        document.querySelector('.priority-option.low').classList.add('active');
        currentPriority = 'low';
    });
    
    // Export button
    exportBtn.addEventListener('click', exportToCSV);
    
    // Import button
    importBtn.addEventListener('click', importFromJSON);
    
    // Analytics button
    analyticsBtn.addEventListener('click', showAnalytics);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
