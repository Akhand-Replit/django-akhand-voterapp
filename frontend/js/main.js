// This file will contain the main logic for controlling the user interface.

document.addEventListener('DOMContentLoaded', function() {
    // Get references to all the important elements on the page
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    // Get references to the new stat display elements
    const totalRecordsStat = document.getElementById('total-records-stat');
    const totalBatchesStat = document.getElementById('total-batches-stat');
    const friendCountStat = document.getElementById('friend-count-stat');
    const enemyCountStat = document.getElementById('enemy-count-stat');

    // Check if the user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }

    /**
     * Handles the login form submission.
     */
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        loginError.textContent = '';

        try {
            const data = await loginUser(username, password);
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                showDashboard();
            } else {
                loginError.textContent = 'Login successful, but no token received.';
            }
        } catch (error) {
            loginError.textContent = error.message;
        }
    });

    /**
     * Handles the logout button click.
     */
    logoutButton.addEventListener('click', function() {
        logoutUser(); // Call the (mostly frontend) logout function
        localStorage.removeItem('authToken');
        showLogin();
    });

    /**
     * Hides the dashboard and shows the login screen.
     */
    function showLogin() {
        loginContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
    }

    /**
     * Hides the login screen, shows the dashboard, and fetches stats.
     */
    async function showDashboard() {
        loginContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex');
        
        // As soon as the dashboard is shown, fetch the stats
        try {
            const stats = await getDashboardStats();
            // Update the text content of the stat elements
            totalRecordsStat.textContent = stats.total_records;
            totalBatchesStat.textContent = stats.total_batches;
            friendCountStat.textContent = stats.friend_count;
            enemyCountStat.textContent = stats.enemy_count;
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            // Optionally, handle the error in the UI, e.g., show a message
        }
    }
});

