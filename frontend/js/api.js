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

async function searchRecords(searchParamsOrUrl) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    let url;
    // If the argument is a full URL (for next/prev pages), use it directly.
    if (typeof searchParamsOrUrl === 'string') {
        url = searchParamsOrUrl;
    } else {
        // Otherwise, build the query from parameters.
        const query = new URLSearchParams(searchParamsOrUrl).toString();
        url = `${API_BASE_URL}/api/records/?${query}`;
    }

    const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch search results.');
    return response.json(); // This will now return {count, next, previous, results}
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
        const errorMessages = Object.entries(errorData).map(([field, messages]) => `${field}: ${messages.join(', ')}`);
        throw new Error(errorMessages.join(' | ') || 'Failed to add record.');
    }
    return response.json();
}

async function uploadData(batchName, file) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const formData = new FormData();
    formData.append('batch_name', batchName);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload-data/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file.');
    }
    return response.json();
}

async function getBatchFiles(batchId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/files/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch batch files.');
    return response.json();
}

async function updateRecord(recordId, recordData) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/records/${recordId}/`, {
        method: 'PATCH', // Use PATCH to update only changed fields
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
    });
    if (!response.ok) throw new Error('Failed to update record.');
    return response.json();
}

async function getRelationshipStats() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/relationship-stats/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch relationship stats.');
    return response.json();
}

// --- NEW FUNCTION ---
async function getAnalysisStats() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/analysis-stats/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch analysis stats.');
    return response.json();
}

