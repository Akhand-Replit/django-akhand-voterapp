const API_BASE_URL = 'http://127.0.0.1:8000';

async function loginUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/get-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.non_field_errors[0] || 'Login failed');
    }
    return response.json();
}

async function getDashboardStats() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/dashboard-stats/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats.');
    return response.json();
}

async function searchRecords(searchParams) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const query = new URLSearchParams(searchParams).toString();
    const url = `${API_BASE_URL}/api/records/?${query}`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch search results.');
    return response.json();
}

// NEW: Function to get all batches (for the dropdown)
async function getBatches() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/batches/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch batches.');
    return response.json();
}

// NEW: Function to add a new record
async function addRecord(recordData) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/records/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        // Combine field errors into a single string for display
        const errorMessages = Object.entries(errorData).map(([field, messages]) => `${field}: ${messages.join(', ')}`);
        throw new Error(errorMessages.join(' | ') || 'Failed to add record.');
    }
    return response.json();
}

