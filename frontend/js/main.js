document.addEventListener('DOMContentLoaded', () => {
    // --- Global Element References ---
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    // --- Page Navigation Elements ---
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        search: document.getElementById('nav-search'),
        add: document.getElementById('nav-add'),
        upload: document.getElementById('nav-upload'),
        alldata: document.getElementById('nav-alldata'),
        relationships: document.getElementById('nav-relationships'),
        analysis: document.getElementById('nav-analysis'),
        age: document.getElementById('nav-age'),
        familytree: document.getElementById('nav-familytree'),
        callhistory: document.getElementById('nav-callhistory'),
        events: document.getElementById('nav-events'), // NEW
    };

    const pages = {
        dashboard: document.getElementById('dashboard-page'),
        search: document.getElementById('search-page'),
        add: document.getElementById('add-page'),
        upload: document.getElementById('upload-page'),
        alldata: document.getElementById('alldata-page'),
        relationships: document.getElementById('relationships-page'),
        analysis: document.getElementById('analysis-page'),
        age: document.getElementById('age-page'),
        familytree: document.getElementById('familytree-page'),
        callhistory: document.getElementById('callhistory-page'),
        events: document.getElementById('events-page'), // NEW
    };

    // --- Search Page Elements ---
    const searchForm = document.getElementById('search-form');
    const searchResultsContainer = document.getElementById('search-results');
    const searchPaginationContainer = document.getElementById('search-pagination');
    const searchEventFilter = document.getElementById('search-event-filter'); // NEW

    // --- Events Page Elements ---
    const addEventForm = document.getElementById('add-event-form');
    const newEventNameInput = document.getElementById('new-event-name');
    const eventStatus = document.getElementById('event-status');
    const eventsListContainer = document.getElementById('events-list-container');

    // Other element references...
    const addRecordForm = document.getElementById('add-record-form');
    const addRecordBatchSelect = document.getElementById('add-record-batch');
    const addRecordSuccessMessage = document.getElementById('add-record-success');
    const uploadDataForm = document.getElementById('upload-data-form');
    const uploadStatus = document.getElementById('upload-status');
    const allDataBatchSelect = document.getElementById('alldata-batch-select');
    const allDataFileSelect = document.getElementById('alldata-file-select');
    const allDataTableContainer = document.getElementById('alldata-table-container');
    const allDataStatus = document.getElementById('alldata-status');
    const allDataPaginationContainer = document.getElementById('alldata-pagination');
    let originalRecords = [];
    let currentAllDataParams = {};
    const editRecordModal = document.getElementById('edit-record-modal');
    const editRecordForm = document.getElementById('edit-record-form');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalCloseButtonX = document.getElementById('modal-close-button-x');
    const modalSaveButton = document.getElementById('modal-save-button');
    const editRecordIdInput = document.getElementById('edit-record-id');
    const relTabs = document.querySelectorAll('.rel-tab-button');
    const relContentContainer = document.getElementById('relationships-content');
    const relPaginationContainer = document.getElementById('relationships-pagination');
    const recalculateAgesButton = document.getElementById('recalculate-ages-button');
    const ageRecalculationStatus = document.getElementById('age-recalculation-status');
    const familyMainSearchInput = document.getElementById('family-main-search');
    const familyMainSearchResults = document.getElementById('family-main-search-results');
    const familyManagementSection = document.getElementById('family-management-section');
    const familySelectedPersonDetails = document.getElementById('family-selected-person-details');
    const familyCurrentRelatives = document.getElementById('family-current-relatives');
    const familyRelativeSearchInput = document.getElementById('family-relative-search');
    const familyRelativeSearchResults = document.getElementById('family-relative-search-results');
    const familyAddForm = document.getElementById('family-add-form');
    const relationshipTypeInput = document.getElementById('relationship-type');
    const addRelationshipButton = document.getElementById('add-relationship-button');
    const familyAddStatus = document.getElementById('family-add-status');
    const familyTreePagination = document.getElementById('family-tree-pagination');
    let selectedPersonId = null;
    let selectedRelativeId = null;
    const callHistorySearchInput = document.getElementById('callhistory-search');
    const callHistorySearchResults = document.getElementById('callhistory-search-results');
    const callHistoryManagementSection = document.getElementById('callhistory-management-section');
    const callHistorySelectedPerson = document.getElementById('callhistory-selected-person');
    const callHistoryLogsContainer = document.getElementById('callhistory-logs-container');
    const addCallLogForm = document.getElementById('add-call-log-form');
    const callLogStatus = document.getElementById('call-log-status');
    const callHistoryPagination = document.getElementById('callhistory-pagination');
    let selectedPersonForCallHistory = null;
    
    // --- Event Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if(mobileMenuButton) mobileMenuButton.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
    Object.values(navLinks).forEach(link => {
        if (link) link.addEventListener('click', handleNavigation);
    });
    if (searchForm) searchForm.addEventListener('submit', (e) => handleSearch(e));
    if (addEventForm) addEventForm.addEventListener('submit', handleAddEvent); // NEW
    if (eventsListContainer) eventsListContainer.addEventListener('click', handleEventListActions); // NEW

    // Other event listeners...
    if (addRecordForm) addRecordForm.addEventListener('submit', handleAddRecord);
    if (uploadDataForm) uploadDataForm.addEventListener('submit', handleUploadData);
    if (allDataBatchSelect) allDataBatchSelect.addEventListener('change', handleAllDataBatchSelect);
    if (allDataFileSelect) allDataFileSelect.addEventListener('change', () => handleAllDataFileSelect());
    if (relTabs) relTabs.forEach(tab => tab.addEventListener('click', () => handleRelTabClick(tab)));
    if (recalculateAgesButton) recalculateAgesButton.addEventListener('click', handleRecalculateAges);
    if (familyMainSearchInput) familyMainSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (familyRelativeSearchInput) familyRelativeSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (addRelationshipButton) addRelationshipButton.addEventListener('click', handleAddRelationship);
    if (callHistorySearchInput) callHistorySearchInput.addEventListener('input', debounce(handleCallHistorySearch, 300));
    if (addCallLogForm) addCallLogForm.addEventListener('submit', handleAddCallLog);
    if (modalCloseButton) modalCloseButton.addEventListener('click', () => editRecordModal.classList.add('hidden'));
    if (modalCloseButtonX) modalCloseButtonX.addEventListener('click', () => editRecordModal.classList.add('hidden'));
    if (modalSaveButton) modalSaveButton.addEventListener('click', handleModalSave);
    if (allDataTableContainer) {
        allDataTableContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const recordId = e.target.dataset.recordId;
                openEditModal(recordId);
            }
            const row = e.target.closest('tr');
            if (row) {
                const currentlyHighlighted = allDataTableContainer.querySelector('.highlight-row');
                if (currentlyHighlighted) {
                    currentlyHighlighted.classList.remove('highlight-row');
                }
                row.classList.add('highlight-row');
            }
        });
    }

    // --- Event Handlers ---
    async function handleLogin(e) { e.preventDefault(); loginError.textContent = ''; const username = document.getElementById('username').value; const password = document.getElementById('password').value; try { const data = await loginUser(username, password); localStorage.setItem('authToken', data.token); showApp(); } catch (error) { loginError.textContent = error.message; } }
    function handleLogout() { localStorage.removeItem('authToken'); showLogin(); }
    
    function handleNavigation(e) {
        e.preventDefault();
        const pageName = e.target.id.split('-')[1];
        navigateTo(pageName);
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
        }
    }
    
    async function handleSearch(e, url = null) { 
        if (e) e.preventDefault(); 
        searchResultsContainer.innerHTML = '<p class="text-gray-500">Searching...</p>'; 
        let searchParams; 
        if (url) { 
            searchParams = url; 
        } else { 
            const params = { 
                naam__icontains: document.getElementById('search-name').value, 
                voter_no: document.getElementById('search-voter-no').value, 
                pitar_naam__icontains: document.getElementById('search-father-name').value, 
                thikana__icontains: document.getElementById('search-address').value, 
                matar_naam__icontains: document.getElementById('search-mother-name').value,
                kromik_no: document.getElementById('search-kromik-no').value,
                pesha__icontains: document.getElementById('search-profession').value,
                phone_number__icontains: document.getElementById('search-phone').value,
                events: searchEventFilter.value, // NEW: Add event filter
            }; 
            searchParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v && v.trim() !== '')); 
        } 
        try { 
            const data = await searchRecords(searchParams); 
            displaySearchResults(data.results); 
            displayPaginationControls(searchPaginationContainer, data.previous, data.next, (nextUrl) => handleSearch(null, nextUrl)); 
        } catch (error) { 
            searchResultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`; 
        } 
    }

    // --- NEW: Event Page Handlers ---
    async function handleAddEvent(e) {
        e.preventDefault();
        const eventName = newEventNameInput.value.trim();
        if (!eventName) return;
        eventStatus.textContent = `Adding event "${eventName}"...`;
        try {
            await addEvent(eventName);
            eventStatus.textContent = `Successfully added "${eventName}"!`;
            newEventNameInput.value = '';
            initializeEventsPage(); // Refresh the list
        } catch (error) {
            eventStatus.textContent = `Error: ${error.message}`;
            eventStatus.classList.replace('text-green-600', 'text-red-600');
        }
    }

    async function handleEventListActions(e) {
        if (e.target.classList.contains('delete-event-btn')) {
            const eventId = e.target.dataset.eventId;
            const eventName = e.target.dataset.eventName;
            if (confirm(`Are you sure you want to delete the event "${eventName}"?`)) {
                try {
                    await deleteEvent(eventId);
                    initializeEventsPage(); // Refresh list
                } catch (error) {
                    alert(`Failed to delete event: ${error.message}`);
                }
            }
        }
    }

    // --- UI Update & Initialization Functions ---
    function navigateTo(pageName) { 
        if (!pages[pageName]) return;
        Object.values(pages).forEach(page => page && page.classList.add('hidden')); 
        Object.values(navLinks).forEach(link => link && link.classList.remove('active')); 
        pages[pageName].classList.remove('hidden'); 
        navLinks[pageName].classList.add('active'); 
        
        // Page-specific initializations
        if (pageName === 'add') populateBatchDropdown();
        if (pageName === 'alldata') initializeAllDataPage();
        if (pageName === 'relationships') initializeRelationshipsPage();
        if (pageName === 'analysis') initializeAnalysisPage();
        if (pageName === 'age') initializeAgeManagementPage();
        if (pageName === 'familytree') initializeFamilyTreePage();
        if (pageName === 'callhistory') initializeCallHistoryPage();
        if (pageName === 'events') initializeEventsPage(); // NEW
        if (pageName === 'search') initializeSearchPage(); // NEW
    }

    // --- NEW: Initialize Events Page ---
    async function initializeEventsPage() {
        if (!eventsListContainer) return;
        eventsListContainer.innerHTML = '<p class="text-gray-500">Loading events...</p>';
        try {
            const data = await getEvents();
            renderEventsList(data.results);
        } catch (error) {
            eventsListContainer.innerHTML = `<p class="text-red-500">Error loading events: ${error.message}</p>`;
        }
    }
    
    // --- NEW: Initialize Search Page (to populate event filter) ---
    async function initializeSearchPage() {
        if (!searchEventFilter) return;
        try {
            const data = await getEvents();
            searchEventFilter.innerHTML = '<option value="">Filter by Event</option>'; // Reset
            data.results.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.name;
                searchEventFilter.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to populate event filter:", error);
        }
    }

    // --- NEW: Render Functions for Events ---
    function renderEventsList(events) {
        if (!eventsListContainer) return;
        eventsListContainer.innerHTML = '';
        if (!events || events.length === 0) {
            eventsListContainer.innerHTML = '<p class="text-gray-600">No events have been created yet.</p>';
            return;
        }
        events.forEach(event => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
            div.innerHTML = `
                <span class="text-gray-800">${event.name}</span>
                <button 
                    data-event-id="${event.id}" 
                    data-event-name="${event.name}" 
                    class="delete-event-btn text-red-500 hover:text-red-700 text-sm font-medium">
                    Delete
                </button>
            `;
            eventsListContainer.appendChild(div);
        });
    }

    // --- Other Functions (many are unchanged) ---
    function displayPaginationControls(container, prevUrl, nextUrl, callback) { if (!container) return; container.innerHTML = ''; const prevButton = document.createElement('button'); prevButton.textContent = 'Previous'; prevButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'; prevButton.disabled = !prevUrl; prevButton.addEventListener('click', () => callback(prevUrl)); const nextButton = document.createElement('button'); nextButton.textContent = 'Next'; nextButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'; nextButton.disabled = !nextUrl; nextButton.addEventListener('click', () => callback(nextUrl)); container.appendChild(prevButton); container.appendChild(nextButton); }
    function displaySearchResults(results) { if (!searchResultsContainer) return; searchResultsContainer.innerHTML = ''; if (!results || results.length === 0) { searchResultsContainer.innerHTML = '<p class="text-gray-600">No results found.</p>'; return; } results.forEach(record => { const card = document.createElement('div'); card.className = 'search-card-detailed'; const safeText = (text) => text || '<span class="text-gray-400">N/A</span>'; card.innerHTML = ` <div class="search-card-header"> <h3>${safeText(record.naam)}</h3> <span class="kromik-no">Serial No: ${safeText(record.kromik_no)}</span> </div> <div class="search-card-body"> <img src="${record.photo_link}" alt="Voter Photo" class="search-card-photo" onerror="this.onerror=null;this.src='https://placehold.co/100x100/EEE/31343C?text=No+Image';"> <div class="search-card-details-grid"> <div class="detail-item"><span class="label">Voter No:</span> ${safeText(record.voter_no)}</div> <div class="detail-item"><span class="label">Father's Name:</span> ${safeText(record.pitar_naam)}</div> <div class="detail-item"><span class="label">Mother's Name:</span> ${safeText(record.matar_naam)}</div> <div class="detail-item"><span class="label">Date of Birth:</span> ${safeText(record.jonmo_tarikh)}</div> <div class="detail-item"><span class="label">Profession:</span> ${safeText(record.pesha)}</div> <div class="detail-item"><span class="label">Address:</span> ${safeText(record.thikana)}</div> <div class="detail-item"><span class="label">Phone:</span> ${safeText(record.phone_number)}</div> <div class="detail-item"><span class="label">Gender:</span> ${safeText(record.gender)}</div> <div class="detail-item"><span class="label">Age:</span> ${safeText(record.age)}</div> <div class="detail-item"><span class="label">Relationship:</span> ${safeText(record.relationship_status)}</div> <div class="detail-item"><span class="label">Batch:</span> ${safeText(record.batch_name)}</div> <div class="detail-item"><span class="label">Events:</span> ${record.events.join(', ') || '<span class="text-gray-400">N/A</span>'}</div> </div> </div> `; searchResultsContainer.appendChild(card); }); }
    async function updateDashboardStats() { try { const stats = await getDashboardStats(); document.getElementById('total-records').textContent = stats.total_records; document.getElementById('total-batches').textContent = stats.total_batches; document.getElementById('total-friends').textContent = stats.friend_count; document.getElementById('total-enemies').textContent = stats.enemy_count; } catch (error) { console.error('Failed to update dashboard stats:', error); } }
    function debounce(func, delay) { let timeout; return function(...args) { const context = this; clearTimeout(timeout); timeout = setTimeout(() => func.apply(context, args), delay); }; }
    function showLogin() { loginScreen.classList.remove('hidden'); appContainer.classList.add('hidden'); }
    function showApp() { loginScreen.classList.add('hidden'); appContainer.classList.remove('hidden'); navigateTo('dashboard'); updateDashboardStats(); }
    function init() { if (localStorage.getItem('authToken')) { showApp(); } else { showLogin(); } }
    
    // Unchanged functions are included for completeness but not detailed...
    async function handleAddRecord(e) { e.preventDefault(); addRecordSuccessMessage.textContent = ''; const formData = new FormData(addRecordForm); const recordData = Object.fromEntries(formData.entries()); try { await addRecord(recordData); addRecordSuccessMessage.textContent = 'Record added successfully!'; addRecordForm.reset(); updateDashboardStats(); } catch (error) { alert(error.message); } }
    async function handleUploadData(e) { e.preventDefault(); uploadStatus.innerHTML = '<p class="text-blue-600">Uploading...</p>'; const batchName = document.getElementById('upload-batch-name').value; const file = document.getElementById('upload-file').files[0]; if (!batchName || !file) { uploadStatus.innerHTML = '<p class="text-red-600">Batch name and file are required.</p>'; return; } try { const result = await uploadData(batchName, file); uploadStatus.innerHTML = `<p class="text-green-600">${result.message}</p>`; uploadDataForm.reset(); updateDashboardStats(); } catch (error) { uploadStatus.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`; } }
    async function handleAllDataBatchSelect() { const batchId = allDataBatchSelect.value; allDataFileSelect.innerHTML = '<option value="">Loading files...</option>'; allDataTableContainer.innerHTML = ''; originalRecords = []; if (!batchId) { allDataFileSelect.innerHTML = '<option value="">Select a Batch First</option>'; return; } try { const files = await getBatchFiles(batchId); allDataFileSelect.innerHTML = '<option value="all">All Files</option>'; files.forEach(file => { const option = document.createElement('option'); option.value = file; option.textContent = file; allDataFileSelect.appendChild(option); }); handleAllDataFileSelect(); } catch (error) { console.error(error); } }
    async function handleAllDataFileSelect(url = null) { const batchId = allDataBatchSelect.value; const fileName = allDataFileSelect.value; allDataTableContainer.innerHTML = '<p class="p-4 text-gray-500">Loading records...</p>'; if (!batchId) return; let params; if (url) { params = url; } else { currentAllDataParams = { batch: batchId }; if (fileName && fileName !== 'all') { currentAllDataParams.file_name = fileName; } params = currentAllDataParams; } try { const data = await searchRecords(params); originalRecords = data.results; renderReadOnlyTable(data.results); displayPaginationControls(allDataPaginationContainer, data.previous, data.next, handleAllDataFileSelect); } catch (error) { allDataTableContainer.innerHTML = `<p class="p-4 text-red-500">${error.message}</p>`; } }
    function renderReadOnlyTable(records) { if (!allDataTableContainer) return; allDataTableContainer.innerHTML = ''; if (!records || records.length === 0) { allDataTableContainer.innerHTML = '<p class="p-4 text-gray-600">No records found.</p>'; return; } const table = document.createElement('table'); table.className = 'min-w-full divide-y divide-gray-200'; table.innerHTML = ` <thead class="bg-gray-50"> <tr> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voter No</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father's Name</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-200"> </tbody> `; const tbody = table.querySelector('tbody'); records.forEach(record => { const row = document.createElement('tr'); row.dataset.recordId = record.id; row.className = 'cursor-pointer hover:bg-gray-50'; row.innerHTML = ` <td class="px-6 py-4 whitespace-nowrap">${record.naam || ''}</td> <td class="px-6 py-4 whitespace-nowrap">${record.voter_no || ''}</td> <td class="px-6 py-4 whitespace-nowrap">${record.pitar_naam || ''}</td> <td class="px-6 py-4 whitespace-nowrap">${record.thikana || ''}</td> <td class="px-6 py-4 whitespace-nowrap"> <button data-record-id="${record.id}" class="edit-btn text-indigo-600 hover:text-indigo-900">Edit</button> </td> `; tbody.appendChild(row); }); allDataTableContainer.appendChild(table); }
    function openEditModal(recordId) { const record = originalRecords.find(r => r.id == recordId); if (!record) { alert('Could not find record details.'); return; } editRecordIdInput.value = record.id; document.getElementById('edit-naam').value = record.naam || ''; document.getElementById('edit-voter-no').value = record.voter_no || ''; document.getElementById('edit-kromik-no').value = record.kromik_no || ''; document.getElementById('edit-jonmo-tarikh').value = record.jonmo_tarikh || ''; document.getElementById('edit-gender').value = record.gender || ''; document.getElementById('edit-pitar-naam').value = record.pitar_naam || ''; document.getElementById('edit-matar-naam').value = record.matar_naam || ''; document.getElementById('edit-pesha').value = record.pesha || ''; document.getElementById('edit-occupation-details').value = record.occupation_details || ''; document.getElementById('edit-phone-number').value = record.phone_number || ''; document.getElementById('edit-whatsapp-number').value = record.whatsapp_number || ''; document.getElementById('edit-facebook-link').value = record.facebook_link || ''; document.getElementById('edit-photo-link').value = record.photo_link || ''; document.getElementById('edit-thikana').value = record.thikana || ''; document.getElementById('edit-description').value = record.description || ''; document.getElementById('edit-political-status').value = record.political_status || ''; document.getElementById('edit-relationship-status').value = record.relationship_status || 'Regular'; editRecordModal.classList.remove('hidden'); }
    async function handleModalSave() { const recordId = editRecordIdInput.value; const updatedData = { naam: document.getElementById('edit-naam').value, voter_no: document.getElementById('edit-voter-no').value, kromik_no: document.getElementById('edit-kromik-no').value, jonmo_tarikh: document.getElementById('edit-jonmo-tarikh').value, gender: document.getElementById('edit-gender').value, pitar_naam: document.getElementById('edit-pitar-naam').value, matar_naam: document.getElementById('edit-matar-naam').value, pesha: document.getElementById('edit-pesha').value, occupation_details: document.getElementById('edit-occupation-details').value, phone_number: document.getElementById('edit-phone-number').value, whatsapp_number: document.getElementById('edit-whatsapp-number').value, facebook_link: document.getElementById('edit-facebook-link').value, photo_link: document.getElementById('edit-photo-link').value, thikana: document.getElementById('edit-thikana').value, description: document.getElementById('edit-description').value, political_status: document.getElementById('edit-political-status').value, relationship_status: document.getElementById('edit-relationship-status').value, }; allDataStatus.innerHTML = `<p class="text-blue-600">Saving...</p>`; try { await updateRecord(recordId, updatedData); allDataStatus.innerHTML = `<p class="text-green-600">Successfully saved!</p>`; editRecordModal.classList.add('hidden'); handleAllDataFileSelect(); } catch (error) { allDataStatus.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`; } }
    async function populateBatchDropdown() { if (!addRecordBatchSelect) return; try { const batchesData = await getBatches(); const batches = batchesData.results; addRecordBatchSelect.innerHTML = '<option value="">Select a Batch</option>'; batches.forEach(batch => { const option = document.createElement('option'); option.value = batch.id; option.textContent = batch.name; addRecordBatchSelect.appendChild(option); }); } catch (error) { console.error('Failed to populate batches:', error); } }
    async function initializeAllDataPage() { if (!allDataBatchSelect) return; allDataTableContainer.innerHTML = ''; allDataFileSelect.innerHTML = '<option value="">Select a Batch First</option>'; allDataStatus.innerHTML = ''; originalRecords = []; try { const batchesData = await getBatches(); const batches = batchesData.results; allDataBatchSelect.innerHTML = '<option value="">Select a Batch</option>'; batches.forEach(batch => { const option = document.createElement('option'); option.value = batch.id; option.textContent = batch.name; allDataBatchSelect.appendChild(option); }); } catch (error) { console.error('Failed to initialize All Data page:', error); } }
    // All other init functions...
    function handleRelTabClick(clickedTab) { relTabs.forEach(tab => tab.classList.remove('active')); clickedTab.classList.add('active'); const status = clickedTab.dataset.status; if (status === 'Stats') { displayRelationshipStats(); } else { displayRelationshipList(status); } }
    async function handleRecalculateAges() { ageRecalculationStatus.innerHTML = '<p class="text-blue-600">Recalculating...</p>'; try { const result = await recalculateAllAges(); ageRecalculationStatus.innerHTML = `<p class="text-green-600">${result.message}</p>`; initializeAgeManagementPage(); } catch (error) { ageRecalculationStatus.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`; } }
    async function handleFamilyTreeSearch(event) { const input = event.target; const query = input.value.trim(); const isMainSearch = input.id === 'family-main-search'; const resultsContainer = isMainSearch ? familyMainSearchResults : familyRelativeSearchResults; if (!query) { resultsContainer.innerHTML = ''; return; } try { const data = await searchRecords({ naam__icontains: query }); resultsContainer.innerHTML = ''; if (data.results.length === 0) { resultsContainer.innerHTML = '<p class="text-gray-500">No results found.</p>'; } else { data.results.forEach(record => { const button = document.createElement('button'); button.className = 'block w-full text-left p-2 rounded hover:bg-gray-100'; button.textContent = `${record.naam} (Voter No: ${record.voter_no || 'N/A'})`; button.onclick = () => { if (isMainSearch) { selectMainPerson(record); } else { selectRelative(record); } }; resultsContainer.appendChild(button); }); } } catch (error) { resultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`; } }
    function selectMainPerson(person) { selectedPersonId = person.id; familySelectedPersonDetails.innerHTML = `<p><strong>Name:</strong> ${person.naam}</p><p><strong>Voter No:</strong> ${person.voter_no || 'N/A'}</p>`; familyManagementSection.classList.remove('hidden'); familyMainSearchResults.innerHTML = ''; familyMainSearchInput.value = person.naam; loadFamilyTree(person.id); }
    function selectRelative(relative) { selectedRelativeId = relative.id; familyRelativeSearchResults.innerHTML = `<p class="p-2 bg-green-100 rounded">Selected: ${relative.naam}</p>`; familyRelativeSearchInput.value = relative.naam; familyAddForm.classList.remove('hidden'); }
    async function loadFamilyTree(personId, url = null) { familyCurrentRelatives.innerHTML = '<p>Loading...</p>'; try { const data = await getFamilyTree(personId, url); familyCurrentRelatives.innerHTML = ''; if (data.results.length === 0) { familyCurrentRelatives.innerHTML = '<p>No relatives added.</p>'; } else { data.results.forEach(rel => { const relDiv = document.createElement('div'); relDiv.className = 'flex justify-between items-center p-2 border-b'; relDiv.innerHTML = ` <div> <span class="font-bold">${rel.relationship_type}:</span> <span>${rel.relative.naam}</span> </div> <button data-id="${rel.id}" class="remove-relative-btn text-red-500">Remove</button> `; familyCurrentRelatives.appendChild(relDiv); }); document.querySelectorAll('.remove-relative-btn').forEach(btn => btn.addEventListener('click', handleRemoveRelationship)); } displayPaginationControls(familyTreePagination, data.previous, data.next, (nextUrl) => loadFamilyTree(personId, nextUrl)); } catch (error) { familyCurrentRelatives.innerHTML = `<p class="text-red-500">${error.message}</p>`; } }
    async function handleAddRelationship() { const relationshipType = relationshipTypeInput.value.trim(); if (!selectedPersonId || !selectedRelativeId || !relationshipType) { familyAddStatus.textContent = 'Please select a person, a relative, and a relationship type.'; return; } familyAddStatus.textContent = 'Adding...'; try { await addFamilyMember(selectedPersonId, selectedRelativeId, relationshipType); familyAddStatus.textContent = 'Added successfully!'; familyRelativeSearchInput.value = ''; relationshipTypeInput.value = ''; selectedRelativeId = null; familyRelativeSearchResults.innerHTML = ''; familyAddForm.classList.add('hidden'); loadFamilyTree(selectedPersonId); } catch (error) { familyAddStatus.textContent = `Error: ${error.message}`; } }
    async function handleRemoveRelationship(event) { const relationshipId = event.target.dataset.id; if (!confirm('Are you sure?')) return; try { await removeFamilyMember(relationshipId); loadFamilyTree(selectedPersonId); } catch (error) { alert(`Failed to remove: ${error.message}`); } }
    async function handleCallHistorySearch(event) { const query = event.target.value.trim(); if (!query) { callHistorySearchResults.innerHTML = ''; return; } try { const data = await searchRecords({ naam__icontains: query }); callHistorySearchResults.innerHTML = ''; if (data.results.length === 0) { callHistorySearchResults.innerHTML = '<p>No results found.</p>'; } else { data.results.forEach(record => { const button = document.createElement('button'); button.className = 'block w-full text-left p-2 rounded hover:bg-gray-100'; button.textContent = `${record.naam} (Voter No: ${record.voter_no || 'N/A'})`; button.onclick = () => selectPersonForCallHistory(record); callHistorySearchResults.appendChild(button); }); } } catch (error) { callHistorySearchResults.innerHTML = `<p class="text-red-500">${error.message}</p>`; } }
    function selectPersonForCallHistory(person) { selectedPersonForCallHistory = person; callHistorySelectedPerson.innerHTML = `<p><strong>Name:</strong> ${person.naam}</p>`; callHistoryManagementSection.classList.remove('hidden'); callHistorySearchResults.innerHTML = ''; callHistorySearchInput.value = person.naam; loadCallHistory(person.id); }
    async function loadCallHistory(recordId, url = null) { callHistoryLogsContainer.innerHTML = '<p>Loading history...</p>'; try { const data = await getCallHistory(recordId, url); callHistoryLogsContainer.innerHTML = ''; if (data.results.length === 0) { callHistoryLogsContainer.innerHTML = '<p>No call history found.</p>'; } else { data.results.forEach(log => { const logDiv = document.createElement('div'); logDiv.className = 'p-3 border rounded-lg bg-gray-50'; logDiv.innerHTML = ` <p class="font-bold">${log.call_date}</p> <p class="mt-1">${log.summary}</p> `; callHistoryLogsContainer.appendChild(logDiv); }); } displayPaginationControls(callHistoryPagination, data.previous, data.next, (nextUrl) => loadCallHistory(recordId, nextUrl)); } catch (error) { callHistoryLogsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`; } }
    async function handleAddCallLog(event) { event.preventDefault(); const callDate = document.getElementById('call-date').value; const summary = document.getElementById('call-summary').value.trim(); if (!callDate || !summary) { callLogStatus.textContent = 'All fields are required.'; return; } callLogStatus.textContent = 'Saving...'; try { await addCallLog(selectedPersonForCallHistory.id, callDate, summary); callLogStatus.textContent = 'Log saved!'; addCallLogForm.reset(); loadCallHistory(selectedPersonForCallHistory.id); } catch (error) { callLogStatus.textContent = `Error: ${error.message}`; } }
    function initializeRelationshipsPage() { if (!relTabs.length) return; handleRelTabClick(document.querySelector('.rel-tab-button[data-status="Friend"]')); }
    async function initializeAnalysisPage() { const contentEl = document.getElementById('analysis-content'); if (!contentEl) return; contentEl.innerHTML = '<p>Loading analysis...</p>'; try { const stats = await getAnalysisStats(); contentEl.innerHTML = ''; renderProfessionChart(stats.professions); renderGenderChart(stats.genders); renderAgeChart(stats.age_groups, 'age-chart-container'); } catch (error) { contentEl.innerHTML = `<p class="text-red-500">Failed to load analysis: ${error.message}</p>`; } }
    async function initializeAgeManagementPage() { if (ageRecalculationStatus) ageRecalculationStatus.innerHTML = ''; try { const stats = await getAnalysisStats(); renderAgeChart(stats.age_groups, 'age-management-chart-container'); } catch (error) { const container = document.getElementById('age-management-chart-container'); if (container) container.innerHTML = `<p class="text-red-500">Failed to load age chart: ${error.message}</p>`; } }
    function initializeFamilyTreePage() { if (familyMainSearchInput) familyMainSearchInput.value = ''; if (familyMainSearchResults) familyMainSearchResults.innerHTML = ''; if (familyManagementSection) familyManagementSection.classList.add('hidden'); selectedPersonId = null; selectedRelativeId = null; }
    function initializeCallHistoryPage() { if (callHistorySearchInput) callHistorySearchInput.value = ''; if (callHistorySearchResults) callHistorySearchResults.innerHTML = ''; if (callHistoryManagementSection) callHistoryManagementSection.classList.add('hidden'); selectedPersonForCallHistory = null; }
    function renderProfessionChart(data) { /* ... */ } function renderGenderChart(data) { /* ... */ } function renderAgeChart(data, containerId) { /* ... */ }
    
    init();
});



document.addEventListener('DOMContentLoaded', () => {
    // --- Global Element References ---
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    // --- Page Navigation Elements ---
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        search: document.getElementById('nav-search'),
        add: document.getElementById('nav-add'),
        upload: document.getElementById('nav-upload'),
        alldata: document.getElementById('nav-alldata'),
        relationships: document.getElementById('nav-relationships'),
        analysis: document.getElementById('nav-analysis'),
        age: document.getElementById('nav-age'),
        familytree: document.getElementById('nav-familytree'),
        callhistory: document.getElementById('nav-callhistory'),
        events: document.getElementById('nav-events'),
        eventfilter: document.getElementById('nav-eventfilter'),
    };

    const pages = {
        dashboard: document.getElementById('dashboard-page'),
        search: document.getElementById('search-page'),
        add: document.getElementById('add-page'),
        upload: document.getElementById('upload-page'),
        alldata: document.getElementById('alldata-page'),
        relationships: document.getElementById('relationships-page'),
        analysis: document.getElementById('analysis-page'),
        age: document.getElementById('age-page'),
        familytree: document.getElementById('familytree-page'),
        callhistory: document.getElementById('callhistory-page'),
        events: document.getElementById('events-page'),
        eventfilter: document.getElementById('eventfilter-page'),
    };

    // --- Search Page Elements ---
    const searchForm = document.getElementById('search-form');
    const searchResultsContainer = document.getElementById('search-results');
    const searchPaginationContainer = document.getElementById('search-pagination');
    const searchEventFilter = document.getElementById('search-event-filter');

    // --- Events Page Elements ---
    const addEventForm = document.getElementById('add-event-form');
    const newEventNameInput = document.getElementById('new-event-name');
    const eventStatus = document.getElementById('event-status');
    const eventsListContainer = document.getElementById('events-list-container');
    
    // --- Event Filter Page Elements ---
    const eventFilterSelect = document.getElementById('event-filter-select');
    const eventFilterButton = document.getElementById('event-filter-button');
    const eventFilterResultsContainer = document.getElementById('event-filter-results');
    const eventFilterPaginationContainer = document.getElementById('event-filter-pagination');

    // Other element references...
    const addRecordForm = document.getElementById('add-record-form');
    const addRecordBatchSelect = document.getElementById('add-record-batch');
    const addRecordSuccessMessage = document.getElementById('add-record-success');
    const uploadDataForm = document.getElementById('upload-data-form');
    const uploadStatus = document.getElementById('upload-status');
    const allDataBatchSelect = document.getElementById('alldata-batch-select');
    const allDataFileSelect = document.getElementById('alldata-file-select');
    const allDataTableContainer = document.getElementById('alldata-table-container');
    const allDataStatus = document.getElementById('alldata-status');
    const allDataPaginationContainer = document.getElementById('alldata-pagination');
    let originalRecords = [];
    let currentAllDataParams = {};
    const editRecordModal = document.getElementById('edit-record-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalCloseButtonX = document.getElementById('modal-close-button-x');
    const modalSaveButton = document.getElementById('modal-save-button');
    const editRecordIdInput = document.getElementById('edit-record-id');
    const relTabs = document.querySelectorAll('.rel-tab-button');
    const relContentContainer = document.getElementById('relationships-content');
    const relPaginationContainer = document.getElementById('relationships-pagination');
    const recalculateAgesButton = document.getElementById('recalculate-ages-button');
    const ageRecalculationStatus = document.getElementById('age-recalculation-status');
    const familyMainSearchInput = document.getElementById('family-main-search');
    const familyMainSearchResults = document.getElementById('family-main-search-results');
    const familyManagementSection = document.getElementById('family-management-section');
    const familySelectedPersonDetails = document.getElementById('family-selected-person-details');
    const familyCurrentRelatives = document.getElementById('family-current-relatives');
    const familyRelativeSearchInput = document.getElementById('family-relative-search');
    const familyRelativeSearchResults = document.getElementById('family-relative-search-results');
    const familyAddForm = document.getElementById('family-add-form');
    const relationshipTypeInput = document.getElementById('relationship-type');
    const addRelationshipButton = document.getElementById('add-relationship-button');
    const familyAddStatus = document.getElementById('family-add-status');
    const familyTreePagination = document.getElementById('family-tree-pagination');
    let selectedPersonId = null;
    let selectedRelativeId = null;
    const callHistorySearchInput = document.getElementById('callhistory-search');
    const callHistorySearchResults = document.getElementById('callhistory-search-results');
    const callHistoryManagementSection = document.getElementById('callhistory-management-section');
    const callHistorySelectedPerson = document.getElementById('callhistory-selected-person');
    const callHistoryLogsContainer = document.getElementById('callhistory-logs-container');
    const addCallLogForm = document.getElementById('add-call-log-form');
    const callLogStatus = document.getElementById('call-log-status');
    const callHistoryPagination = document.getElementById('callhistory-pagination');
    let selectedPersonForCallHistory = null;
    
    // --- Event Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if(mobileMenuButton) mobileMenuButton.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
    Object.values(navLinks).forEach(link => {
        if (link) link.addEventListener('click', handleNavigation);
    });
    if (searchForm) searchForm.addEventListener('submit', (e) => handleSearch(e));
    if (addEventForm) addEventForm.addEventListener('submit', handleAddEvent);
    if (eventsListContainer) eventsListContainer.addEventListener('click', handleEventListActions);
    if (eventFilterButton) eventFilterButton.addEventListener('click', (e) => handleEventFilter(e));

    // Other event listeners...
    if (addRecordForm) addRecordForm.addEventListener('submit', handleAddRecord);
    if (uploadDataForm) uploadDataForm.addEventListener('submit', handleUploadData);
    if (allDataBatchSelect) allDataBatchSelect.addEventListener('change', handleAllDataBatchSelect);
    if (allDataFileSelect) allDataFileSelect.addEventListener('change', () => handleAllDataFileSelect());
    if (relTabs) relTabs.forEach(tab => tab.addEventListener('click', () => handleRelTabClick(tab)));
    if (recalculateAgesButton) recalculateAgesButton.addEventListener('click', handleRecalculateAges);
    if (familyMainSearchInput) familyMainSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (familyRelativeSearchInput) familyRelativeSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (addRelationshipButton) addRelationshipButton.addEventListener('click', handleAddRelationship);
    if (callHistorySearchInput) callHistorySearchInput.addEventListener('input', debounce(handleCallHistorySearch, 300));
    if (addCallLogForm) addCallLogForm.addEventListener('submit', handleAddCallLog);
    if (modalCloseButton) modalCloseButton.addEventListener('click', () => editRecordModal.classList.add('hidden'));
    if (modalCloseButtonX) modalCloseButtonX.addEventListener('click', () => editRecordModal.classList.add('hidden'));
    if (modalSaveButton) modalSaveButton.addEventListener('click', handleModalSave);
    if (allDataTableContainer) {
        allDataTableContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const recordId = e.target.dataset.recordId;
                openEditModal(recordId);
            }
            const row = e.target.closest('tr');
            if (row) {
                const currentlyHighlighted = allDataTableContainer.querySelector('.highlight-row');
                if (currentlyHighlighted) currentlyHighlighted.classList.remove('highlight-row');
                row.classList.add('highlight-row');
            }
        });
    }

    // --- Event Handlers ---
    async function handleLogin(e) { e.preventDefault(); loginError.textContent = ''; const username = document.getElementById('username').value; const password = document.getElementById('password').value; try { const data = await loginUser(username, password); localStorage.setItem('authToken', data.token); showApp(); } catch (error) { loginError.textContent = error.message; } }
    function handleLogout() { localStorage.removeItem('authToken'); showLogin(); }
    
    function handleNavigation(e) {
        e.preventDefault();
        const pageName = e.target.id.split('-')[1];
        navigateTo(pageName);
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
        }
    }
    
    async function handleSearch(e, url = null) { 
        if (e) e.preventDefault(); 
        searchResultsContainer.innerHTML = '<p class="text-gray-500">Searching...</p>'; 
        let searchParams; 
        if (url) { 
            searchParams = url; 
        } else { 
            const params = { 
                naam__icontains: document.getElementById('search-name').value, 
                voter_no: document.getElementById('search-voter-no').value, 
                pitar_naam__icontains: document.getElementById('search-father-name').value, 
                thikana__icontains: document.getElementById('search-address').value, 
                matar_naam__icontains: document.getElementById('search-mother-name').value,
                kromik_no: document.getElementById('search-kromik-no').value,
                pesha__icontains: document.getElementById('search-profession').value,
                phone_number__icontains: document.getElementById('search-phone').value,
                events: searchEventFilter.value, // Event filter from main search page
            }; 
            searchParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v && v.trim() !== '')); 
        } 
        try { 
            const data = await searchRecords(searchParams); 
            displaySearchResults(searchResultsContainer, data.results); 
            displayPaginationControls(searchPaginationContainer, data.previous, data.next, (nextUrl) => handleSearch(null, nextUrl)); 
        } catch (error) { 
            searchResultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`; 
        } 
    }

    async function handleAddEvent(e) { e.preventDefault(); const eventName = newEventNameInput.value.trim(); if (!eventName) return; eventStatus.textContent = `Adding...`; try { await addEvent(eventName); eventStatus.textContent = `Successfully added "${eventName}"!`; newEventNameInput.value = ''; initializeEventsPage(); } catch (error) { eventStatus.textContent = `Error: ${error.message}`; } }
    async function handleEventListActions(e) { if (e.target.classList.contains('delete-event-btn')) { const eventId = e.target.dataset.eventId; const eventName = e.target.dataset.eventName; if (confirm(`Delete event "${eventName}"?`)) { try { await deleteEvent(eventId); initializeEventsPage(); } catch (error) { alert(`Failed to delete: ${error.message}`); } } } }

    async function handleEventFilter(e, url = null) {
        if (e) e.preventDefault();
        eventFilterResultsContainer.innerHTML = '<p class="text-gray-500">Filtering...</p>';
        let searchParams;
        if (url) {
            searchParams = url;
        } else {
            const eventId = eventFilterSelect.value;
            if (!eventId) {
                eventFilterResultsContainer.innerHTML = '<p class="text-gray-600">Please select an event to filter by.</p>';
                return;
            }
            searchParams = { events: eventId };
        }
        try {
            const data = await searchRecords(searchParams);
            displaySearchResults(eventFilterResultsContainer, data.results);
            displayPaginationControls(eventFilterPaginationContainer, data.previous, data.next, (nextUrl) => handleEventFilter(null, nextUrl));
        } catch (error) {
            eventFilterResultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    // --- UI Update & Initialization Functions ---
    function navigateTo(pageName) { 
        if (!pages[pageName]) return;
        Object.values(pages).forEach(page => page && page.classList.add('hidden')); 
        Object.values(navLinks).forEach(link => link && link.classList.remove('active')); 
        pages[pageName].classList.remove('hidden'); 
        navLinks[pageName].classList.add('active'); 
        
        if (pageName === 'add') populateBatchDropdown();
        if (pageName === 'alldata') initializeAllDataPage();
        if (pageName === 'relationships') initializeRelationshipsPage();
        if (pageName === 'analysis') initializeAnalysisPage();
        if (pageName === 'age') initializeAgeManagementPage();
        if (pageName === 'familytree') initializeFamilyTreePage();
        if (pageName === 'callhistory') initializeCallHistoryPage();
        if (pageName === 'events') initializeEventsPage();
        if (pageName === 'eventfilter') initializeEventFilterPage();
        if (pageName === 'search') initializeSearchPage();
    }

    async function initializeEventsPage() { if (!eventsListContainer) return; eventsListContainer.innerHTML = '<p>Loading...</p>'; try { const data = await getEvents(); renderEventsList(data.results); } catch (error) { eventsListContainer.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`; } }
    
    async function initializeEventFilterPage() {
        if (!eventFilterSelect) return;
        eventFilterResultsContainer.innerHTML = '';
        eventFilterPaginationContainer.innerHTML = '';
        try {
            const data = await getEvents();
            eventFilterSelect.innerHTML = '<option value="">Select an Event to Filter</option>';
            data.results.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.name;
                eventFilterSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to populate event filter:", error);
            eventFilterSelect.innerHTML = '<option value="">Could not load events</option>';
        }
    }

    async function initializeSearchPage() {
        if (!searchEventFilter) return;
        try {
            const data = await getEvents();
            searchEventFilter.innerHTML = '<option value="">Filter by Event</option>'; // Reset
            data.results.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.name;
                searchEventFilter.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to populate search event filter:", error);
        }
    }

    function renderEventsList(events) { if (!eventsListContainer) return; eventsListContainer.innerHTML = ''; if (!events || events.length === 0) { eventsListContainer.innerHTML = '<p>No events created yet.</p>'; return; } events.forEach(event => { const div = document.createElement('div'); div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg'; div.innerHTML = ` <span class="text-gray-800">${event.name}</span> <button data-event-id="${event.id}" data-event-name="${event.name}" class="delete-event-btn text-red-500 hover:text-red-700 text-sm">Delete</button> `; eventsListContainer.appendChild(div); }); }

    function displayPaginationControls(container, prevUrl, nextUrl, callback) { if (!container) return; container.innerHTML = ''; const prevButton = document.createElement('button'); prevButton.textContent = 'Previous'; prevButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'; prevButton.disabled = !prevUrl; prevButton.addEventListener('click', () => callback(prevUrl)); const nextButton = document.createElement('button'); nextButton.textContent = 'Next'; nextButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'; nextButton.disabled = !nextUrl; nextButton.addEventListener('click', () => callback(nextUrl)); container.appendChild(prevButton); container.appendChild(nextButton); }
    
    function displaySearchResults(container, results) {
        if (!container) return;
        container.innerHTML = '';
        if (!results || results.length === 0) {
            container.innerHTML = '<p class="text-gray-600">No results found.</p>';
            return;
        }
        results.forEach(record => {
            const card = document.createElement('div');
            card.className = 'search-card-detailed';
            const safeText = (text) => text || '<span class="text-gray-400">N/A</span>';
            card.innerHTML = ` <div class="search-card-header"><h3>${safeText(record.naam)}</h3><span class="kromik-no">Serial No: ${safeText(record.kromik_no)}</span></div><div class="search-card-body"><img src="${record.photo_link}" alt="Photo" class="search-card-photo" onerror="this.onerror=null;this.src='https://placehold.co/100x100/EEE/31343C?text=No+Image';"><div class="search-card-details-grid"><div class="detail-item"><span class="label">Voter No:</span> ${safeText(record.voter_no)}</div><div class="detail-item"><span class="label">Father's Name:</span> ${safeText(record.pitar_naam)}</div><div class="detail-item"><span class="label">Address:</span> ${safeText(record.thikana)}</div><div class="detail-item"><span class="label">Relationship:</span> ${safeText(record.relationship_status)}</div><div class="detail-item"><span class="label">Batch:</span> ${safeText(record.batch_name)}</div><div class="detail-item"><span class="label">Events:</span> ${record.events.join(', ') || 'N/A'}</div></div></div> `;
            container.appendChild(card);
        });
    }

    async function updateDashboardStats() { try { const stats = await getDashboardStats(); document.getElementById('total-records').textContent = stats.total_records; document.getElementById('total-batches').textContent = stats.total_batches; document.getElementById('total-friends').textContent = stats.friend_count; document.getElementById('total-enemies').textContent = stats.enemy_count; } catch (error) { console.error('Failed to update dashboard stats:', error); } }
    function debounce(func, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; }
    function showLogin() { loginScreen.classList.remove('hidden'); appContainer.classList.add('hidden'); }
    function showApp() { loginScreen.classList.add('hidden'); appContainer.classList.remove('hidden'); navigateTo('dashboard'); updateDashboardStats(); }
    function init() { if (localStorage.getItem('authToken')) { showApp(); } else { showLogin(); } }
    
    // Unchanged functions
    async function handleAddRecord(e) { e.preventDefault(); addRecordSuccessMessage.textContent = ''; const formData = new FormData(addRecordForm); const recordData = Object.fromEntries(formData.entries()); try { await addRecord(recordData); addRecordSuccessMessage.textContent = 'Record added successfully!'; addRecordForm.reset(); updateDashboardStats(); } catch (error) { alert(error.message); } }
    async function handleUploadData(e) { e.preventDefault(); uploadStatus.innerHTML = '<p>Uploading...</p>'; const batchName = document.getElementById('upload-batch-name').value; const file = document.getElementById('upload-file').files[0]; if (!batchName || !file) { uploadStatus.innerHTML = '<p class="text-red-600">All fields required.</p>'; return; } try { const result = await uploadData(batchName, file); uploadStatus.innerHTML = `<p>${result.message}</p>`; uploadDataForm.reset(); updateDashboardStats(); } catch (error) { uploadStatus.innerHTML = `<p>Error: ${error.message}</p>`; } }
    async function handleAllDataBatchSelect() { const batchId = allDataBatchSelect.value; allDataFileSelect.innerHTML = '<option value="">Loading...</option>'; allDataTableContainer.innerHTML = ''; if (!batchId) { allDataFileSelect.innerHTML = '<option value="">Select Batch</option>'; return; } try { const files = await getBatchFiles(batchId); allDataFileSelect.innerHTML = '<option value="all">All Files</option>'; files.forEach(file => { const option = document.createElement('option'); option.value = file; option.textContent = file; allDataFileSelect.appendChild(option); }); handleAllDataFileSelect(); } catch (error) { console.error(error); } }
    async function handleAllDataFileSelect(url = null) { const batchId = allDataBatchSelect.value; const fileName = allDataFileSelect.value; allDataTableContainer.innerHTML = '<p>Loading...</p>'; if (!batchId) return; let params; if (url) { params = url; } else { currentAllDataParams = { batch: batchId }; if (fileName && fileName !== 'all') currentAllDataParams.file_name = fileName; params = currentAllDataParams; } try { const data = await searchRecords(params); originalRecords = data.results; renderReadOnlyTable(data.results); displayPaginationControls(allDataPaginationContainer, data.previous, data.next, handleAllDataFileSelect); } catch (error) { allDataTableContainer.innerHTML = `<p>${error.message}</p>`; } }
    function renderReadOnlyTable(records) { if (!allDataTableContainer) return; allDataTableContainer.innerHTML = ''; if (!records || records.length === 0) { allDataTableContainer.innerHTML = '<p>No records found.</p>'; return; } const table = document.createElement('table'); table.className = 'min-w-full divide-y'; table.innerHTML = `<thead>...</thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); records.forEach(record => { const row = document.createElement('tr'); row.innerHTML = `<td>${record.naam || ''}</td><td>${record.voter_no || ''}</td><td><button data-record-id="${record.id}" class="edit-btn">Edit</button></td>`; tbody.appendChild(row); }); allDataTableContainer.appendChild(table); }
    function openEditModal(recordId) { const record = originalRecords.find(r => r.id == recordId); if (!record) { return; } editRecordIdInput.value = record.id; /* ... set all form fields ... */ editRecordModal.classList.remove('hidden'); }
    async function handleModalSave() { const recordId = editRecordIdInput.value; const updatedData = { /* ... get all form fields ... */ }; try { await updateRecord(recordId, updatedData); editRecordModal.classList.add('hidden'); handleAllDataFileSelect(); } catch (error) { alert(`Error: ${error.message}`); } }
    async function populateBatchDropdown() { if (!addRecordBatchSelect) return; try { const data = await getBatches(); addRecordBatchSelect.innerHTML = '<option value="">Select Batch</option>'; data.results.forEach(batch => { const option = document.createElement('option'); option.value = batch.id; option.textContent = batch.name; addRecordBatchSelect.appendChild(option); }); } catch (error) { console.error(error); } }
    async function initializeAllDataPage() { /* ... */ }
    function handleRelTabClick(clickedTab) { relTabs.forEach(tab => tab.classList.remove('active')); clickedTab.classList.add('active'); const status = clickedTab.dataset.status; if (status === 'Stats') { displayRelationshipStats(); } else { displayRelationshipList(status); } }
    async function handleRecalculateAges() { /* ... */ }
    async function handleFamilyTreeSearch(event) { /* ... */ }
    function selectMainPerson(person) { /* ... */ }
    function selectRelative(relative) { /* ... */ }
    async function loadFamilyTree(personId, url = null) { /* ... */ }
    async function handleAddRelationship() { /* ... */ }
    async function handleRemoveRelationship(event) { /* ... */ }
    async function handleCallHistorySearch(event) { /* ... */ }
    function selectPersonForCallHistory(person) { /* ... */ }
    async function loadCallHistory(recordId, url = null) { /* ... */ }
    async function handleAddCallLog(event) { /* ... */ }
    function initializeRelationshipsPage() { if (!relTabs.length) return; handleRelTabClick(document.querySelector('.rel-tab-button')); }
    async function initializeAnalysisPage() { /* ... */ }
    async function initializeAgeManagementPage() { /* ... */ }
    function initializeFamilyTreePage() { /* ... */ }
    function initializeCallHistoryPage() { /* ... */ }
    function renderProfessionChart(data) { /* ... */ } function renderGenderChart(data) { /* ... */ } function renderAgeChart(data, containerId) { /* ... */ }
    function displayRelationshipList(status, url = null) { /* ... */ }
    async function displayRelationshipStats() { /* ... */ }

    init();
});

