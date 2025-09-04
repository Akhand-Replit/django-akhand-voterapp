document.addEventListener('DOMContentLoaded', () => {
    // --- Global Element References ---
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    // --- Page Navigation Elements ---
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        search: document.getElementById('nav-search'),
        add: document.getElementById('nav-add'),
        upload: document.getElementById('nav-upload'),
    };

    const pages = {
        dashboard: document.getElementById('dashboard-page'),
        search: document.getElementById('search-page'),
        add: document.getElementById('add-page'),
        // upload page will be added later
    };

    // --- Search Page Elements ---
    const searchForm = document.getElementById('search-form');
    const searchResultsContainer = document.getElementById('search-results');

    // --- Add Record Page Elements ---
    const addRecordForm = document.getElementById('add-record-form');
    const addRecordBatchSelect = document.getElementById('add-record-batch');
    const addRecordSuccessMessage = document.getElementById('add-record-success');

    // --- Event Listeners ---
    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    Object.values(navLinks).forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    searchForm.addEventListener('submit', handleSearch);
    addRecordForm.addEventListener('submit', handleAddRecord);

    // --- Event Handlers ---
    async function handleLogin(e) {
        e.preventDefault();
        loginError.textContent = '';
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const data = await loginUser(username, password);
            localStorage.setItem('authToken', data.token);
            showApp();
        } catch (error) {
            loginError.textContent = error.message;
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        showLogin();
    }

    function handleNavigation(e) {
        e.preventDefault();
        // Extract page name from the link's ID (e.g., "nav-dashboard" -> "dashboard")
        const pageName = e.target.id.split('-')[1];
        navigateTo(pageName);
    }

    async function handleSearch(e) {
        e.preventDefault();
        searchResultsContainer.innerHTML = '<p class="text-gray-500">Searching...</p>';
        const params = {
            naam__icontains: document.getElementById('search-name').value,
            voter_no: document.getElementById('search-voter-no').value,
            pitar_naam__icontains: document.getElementById('search-father-name').value,
            thikana__icontains: document.getElementById('search-address').value,
        };
        const searchParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v.trim() !== ''));

        try {
            const results = await searchRecords(searchParams);
            displaySearchResults(results);
        } catch (error) {
            searchResultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    async function handleAddRecord(e) {
        e.preventDefault();
        addRecordSuccessMessage.textContent = '';
        const formData = new FormData(addRecordForm);
        const recordData = Object.fromEntries(formData.entries());

        try {
            await addRecord(recordData);
            addRecordSuccessMessage.textContent = 'Record added successfully!';
            addRecordForm.reset(); // Clear the form
            // Refresh dashboard stats to show the new count
            updateDashboardStats();
        } catch (error) {
            alert(error.message); // Use an alert for form submission errors
        }
    }

    // --- UI Update Functions ---
    function navigateTo(pageName) {
        if (!pages[pageName]) return; // Do nothing if page doesn't exist yet
        Object.values(pages).forEach(page => page && page.classList.add('hidden'));
        Object.values(navLinks).forEach(link => link && link.classList.remove('active'));
        
        pages[pageName].classList.remove('hidden');
        navLinks[pageName].classList.add('active');

        // Special actions when navigating to certain pages
        if (pageName === 'add') {
            populateBatchDropdown();
        }
    }

    function displaySearchResults(results) {
        searchResultsContainer.innerHTML = '';
        if (!results || results.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-gray-600">No results found.</p>';
            return;
        }
        results.forEach(record => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h3>${record.naam}</h3>
                <p><strong>Voter No:</strong> ${record.voter_no || 'N/A'}</p>
                <p><strong>Father's Name:</strong> ${record.pitar_naam || 'N/A'}</p>
                <p><strong>Address:</strong> ${record.thikana || 'N/A'}</p>
                <p><strong>Batch:</strong> ${record.batch_name}</p>
            `;
            searchResultsContainer.appendChild(card);
        });
    }

    async function updateDashboardStats() {
        try {
            const stats = await getDashboardStats();
            document.getElementById('total-records').textContent = stats.total_records;
            document.getElementById('total-batches').textContent = stats.total_batches;
            document.getElementById('total-friends').textContent = stats.friend_count;
            document.getElementById('total-enemies').textContent = stats.enemy_count;
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
    }

    async function populateBatchDropdown() {
        try {
            const batches = await getBatches();
            addRecordBatchSelect.innerHTML = '<option value="">Select a Batch (Required)</option>'; // Reset
            batches.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch.id;
                option.textContent = batch.name;
                addRecordBatchSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to populate batches:', error);
        }
    }

    // --- App Initialization ---
    function showLogin() {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }

    function showApp() {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        navigateTo('dashboard');
        updateDashboardStats();
    }

    function init() {
        if (localStorage.getItem('authToken')) {
            showApp();
        } else {
            showLogin();
        }
    }

    init();
});

