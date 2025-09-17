const API_BASE_URL = 'http://127.0.0.1:8000';

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const headers = {
        ...options.headers,
        'Authorization': `Token ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            // Extract meaningful errors from DRF responses
            errorMessage = Object.entries(errorData).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`).join(' | ') || 'An unknown error occurred.';
        } catch (e) {
            // Not a JSON response, stick with the status code
        }
        throw new Error(errorMessage);
    }
    
    // Handle 204 No Content response for DELETE requests
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// --- Auth ---
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

// --- Dashboard & Stats ---
async function getDashboardStats() { return fetchWithAuth(`${API_BASE_URL}/api/dashboard-stats/`); }
async function getRelationshipStats() { return fetchWithAuth(`${API_BASE_URL}/api/relationship-stats/`); }
async function getAnalysisStats() { return fetchWithAuth(`${API_BASE_URL}/api/analysis-stats/`); }

// --- Records & Batches ---
async function getBatches() { return fetchWithAuth(`${API_BASE_URL}/api/batches/`); }
async function getBatchFiles(batchId) { return fetchWithAuth(`${API_BASE_URL}/api/batches/${batchId}/files/`); }
async function searchRecords(searchParamsOrUrl) {
    let url;
    if (typeof searchParamsOrUrl === 'string') {
        url = searchParamsOrUrl;
    } else {
        const query = new URLSearchParams(searchParamsOrUrl).toString();
        url = `${API_BASE_URL}/api/records/?${query}`;
    }
    return fetchWithAuth(url);
}
async function addRecord(recordData) {
    return fetchWithAuth(`${API_BASE_URL}/api/records/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    });
}
async function updateRecord(recordId, recordData) {
    return fetchWithAuth(`${API_BASE_URL}/api/records/${recordId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
    });
}
async function uploadData(batchName, file) {
    const formData = new FormData();
    formData.append('batch_name', batchName);
    formData.append('file', file);
    return fetchWithAuth(`${API_BASE_URL}/api/upload-data/`, {
        method: 'POST',
        body: formData,
    });
}

// --- Age Management ---
async function recalculateAllAges() {
    return fetchWithAuth(`${API_BASE_URL}/api/recalculate-ages/`, {
        method: 'POST',
    });
}

// --- Family Tree ---
async function getFamilyTree(personId) { return fetchWithAuth(`${API_BASE_URL}/api/family-relationships/?person_id=${personId}`); }
async function addFamilyMember(personId, relativeId, relationshipType) {
    return fetchWithAuth(`${API_BASE_URL}/api/family-relationships/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person: personId, relative: relativeId, relationship_type: relationshipType }),
    });
}
async function removeFamilyMember(relationshipId) {
    return fetchWithAuth(`${API_BASE_URL}/api/family-relationships/${relationshipId}/`, { method: 'DELETE' });
}

// --- Call History ---
async function getCallHistory(recordId) { return fetchWithAuth(`${API_BASE_URL}/api/call-history/?record_id=${recordId}`); }
async function addCallLog(recordId, callDate, summary) {
    return fetchWithAuth(`${API_BASE_URL}/api/call-history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: recordId, call_date: callDate, summary: summary }),
    });
}

// --- NEW: Event Management Functions ---
async function getEvents() {
    return fetchWithAuth(`${API_BASE_URL}/api/events/`);
}
async function addEvent(eventName) {
    return fetchWithAuth(`${API_BASE_URL}/api/events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: eventName }),
    });
}
async function deleteEvent(eventId) {
    return fetchWithAuth(`${API_BASE_URL}/api/events/${eventId}/`, {
        method: 'DELETE',
    });
}
async function assignEventsToRecord(recordId, eventIds) {
    return fetchWithAuth(`${API_BASE_URL}/api/records/${recordId}/assign_events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_ids: eventIds }),
    });
}
