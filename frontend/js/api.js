// This file will handle all communications with the Django backend API.

const API_BASE_URL = 'http://127.0.0.1:8000'; // The base URL of your Django backend

/**
 * Logs in a user by sending their credentials to the backend.
 * @param {string} username The user's username.
 * @param {string} password The user's password.
 * @returns {Promise<object>} A promise that resolves with the server's response data (including the token).
 */
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get-token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.non_field_errors[0] || 'Login failed');
        }
        return data;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}

/**
 * Logs out a user.
 */
async function logoutUser() {
    // This is primarily a frontend action with token auth
    console.log('Logging out.');
}


// NEW FUNCTION TO GET DASHBOARD STATS
/**
 * Fetches dashboard statistics from the backend.
 * Requires a valid auth token.
 * @returns {Promise<object>} A promise that resolves with the statistics data.
 */
async function getDashboardStats() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('No authentication token found.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard-stats/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include the token in the Authorization header
                'Authorization': `Token ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats.');
        }

        return await response.json();
    } catch (error) {
        console.error('Get Dashboard Stats API error:', error);
        throw error;
    }
}

