const API_BASE_URL = '[https://dakhandvoter.akhandapps.com](https://dakhandvoter.akhandapps.com)';

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
    if (typeof searchParamsOrUrl === 'string') {
        url = searchParamsOrUrl;
    } else {
        const query = new URLSearchParams(searchParamsOrUrl).toString();
        url = `${API_BASE_URL}/api/records/?${query}`;
    }

    const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch search results.');
    return response.json();
}

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

async function uploadData(batchName, files, gender) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const formData = new FormData();
    formData.append('batch_name', batchName);
    formData.append('gender', gender);
    // Append each file
    for (const file of files) {
        formData.append('files', file);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload-data/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file(s).');
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
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
    });
    if (!response.ok) throw new Error('Failed to update record.');
    return response.json();
}

// --- NEW: API FUNCTION TO SYNC MULTIPLE CHANGES ---
async function syncOfflineChanges(changes) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/sync-records/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sync changes.');
    }
    return response.json();
}


async function assignEventsToRecord(recordId, eventIds) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/records/${recordId}/assign-events/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_ids: eventIds }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign events.');
    }
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

async function getAnalysisStats() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/analysis-stats/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch analysis stats.');
    return response.json();
}

async function recalculateAllAges() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/recalculate-ages/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recalculate ages.');
    }
    return response.json();
}

async function getFamilyTree(personId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/family-relationships/?person_id=${personId}`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch family tree.');
    return response.json();
}

async function addFamilyMember(personId, relativeId, relationshipType) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/family-relationships/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            person: personId,
            relative: relativeId,
            relationship_type: relationshipType
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add family member.');
    }
    return response.json();
}

async function removeFamilyMember(relationshipId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/family-relationships/${relationshipId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove family member.');
}


async function getCallHistory(recordId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/call-history/?record_id=${recordId}`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch call history.');
    return response.json();
}

async function addCallLog(recordId, callDate, summary) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/call-history/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            record: recordId,
            call_date: callDate,
            summary: summary
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add call log.');
    }
    return response.json();
}

async function getEvents() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/events/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch events.');
    return response.json();
}

async function addEvent(eventName) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/events/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: eventName }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.name[0] || 'Failed to add event.');
    }
    return response.json();
}

async function deleteEvent(eventId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
    });
    if (response.status !== 204) throw new Error('Failed to delete event.');
}

async function getRecordsForEvent(eventId, url = null) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    
    const targetUrl = url || `${API_BASE_URL}/api/events/${eventId}/records/`;

    const response = await fetch(targetUrl, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch records for the event.');
    return response.json();
}

async function getAllRecords(progressCallback) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/api/all-records/`, {
        headers: { 'Authorization': `Token ${token}` },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch all records.');
    }

    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    const chunks = [];
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;
        if (progressCallback) {
            progressCallback(receivedLength, contentLength || receivedLength);
        }
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    const result = new TextDecoder("utf-8").decode(chunksAll);
    return JSON.parse(result);
}

// --- NEW: Function to get all events for offline mode ---
async function getAllEvents() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/all-events/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch all events.');
    return response.json();
}

// --- NEW: Function to get all relationships for offline mode ---
async function getAllFamilyRelationships() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/all-family-relationships/`, {
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch all family relationships.');
    return response.json();
}

// --- NEW: Data Management API Functions ---

async function deleteFileData(batchId, fileName) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/delete-file/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_name: fileName }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file data.');
    }
    return response.json();
}

async function deleteBatch(batchId) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
    });
    if (response.status !== 204) throw new Error('Failed to delete batch.');
}

async function deleteAllData() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/api/delete-all-data/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete all data.');
    }
    return response.json();
}
