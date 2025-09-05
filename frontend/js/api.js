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

// --- NEW FUNCTION for Age Management ---
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
        headers: { 'Authorization': `Token ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recalculate ages.');
    }
    return response.json();
}

// --- NEW FUNCTIONS FOR FAMILY TREE ---

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
    // No content is returned on successful deletion
}


// --- NEW FUNCTIONS FOR CALL HISTORY ---

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

