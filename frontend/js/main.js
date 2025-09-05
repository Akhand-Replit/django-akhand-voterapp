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
        alldata: document.getElementById('nav-alldata'),
        relationships: document.getElementById('nav-relationships'),
        analysis: document.getElementById('nav-analysis'),
        age: document.getElementById('nav-age'),
        familytree: document.getElementById('nav-familytree'),
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
    };

    // --- Search Page Elements ---
    const searchForm = document.getElementById('search-form');
    const searchResultsContainer = document.getElementById('search-results');
    const searchPaginationContainer = document.getElementById('search-pagination');

    // --- Add Record Page Elements ---
    const addRecordForm = document.getElementById('add-record-form');
    const addRecordBatchSelect = document.getElementById('add-record-batch');
    const addRecordSuccessMessage = document.getElementById('add-record-success');

    // --- Upload Page Elements ---
    const uploadDataForm = document.getElementById('upload-data-form');
    const uploadStatus = document.getElementById('upload-status');

    // --- All Data Page Elements ---
    const allDataBatchSelect = document.getElementById('alldata-batch-select');
    const allDataFileSelect = document.getElementById('alldata-file-select');
    const allDataTableContainer = document.getElementById('alldata-table-container');
    const saveAllDataButton = document.getElementById('save-all-data-button');
    const allDataStatus = document.getElementById('alldata-status');
    const allDataPaginationContainer = document.getElementById('alldata-pagination');
    let originalRecords = [];
    let currentAllDataParams = {};

    // --- Relationships Page Elements ---
    const relTabs = document.querySelectorAll('.rel-tab-button');
    const relContentContainer = document.getElementById('relationships-content');
    const relPaginationContainer = document.getElementById('relationships-pagination');

    // --- Analysis Page Elements ---
    const analysisContent = document.getElementById('analysis-content');

    // --- Age Management Page Elements ---
    const recalculateAgesButton = document.getElementById('recalculate-ages-button');
    const ageRecalculationStatus = document.getElementById('age-recalculation-status');

    // --- Family Tree Page Elements ---
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

    let selectedPersonId = null;
    let selectedRelativeId = null;



    // --- Event Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    Object.values(navLinks).forEach(link => {
        if (link) link.addEventListener('click', handleNavigation);
    });
    if (searchForm) searchForm.addEventListener('submit', (e) => handleSearch(e));
    if (addRecordForm) addRecordForm.addEventListener('submit', handleAddRecord);
    if (uploadDataForm) uploadDataForm.addEventListener('submit', handleUploadData);
    if (allDataBatchSelect) allDataBatchSelect.addEventListener('change', handleAllDataBatchSelect);
    if (allDataFileSelect) allDataFileSelect.addEventListener('change', () => handleAllDataFileSelect());
    if (saveAllDataButton) saveAllDataButton.addEventListener('click', handleSaveChanges);
    if (relTabs) relTabs.forEach(tab => {
        tab.addEventListener('click', () => handleRelTabClick(tab));
    });
    if (recalculateAgesButton) recalculateAgesButton.addEventListener('click', handleRecalculateAges);
    if (familyMainSearchInput) familyMainSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (familyRelativeSearchInput) familyRelativeSearchInput.addEventListener('input', debounce(handleFamilyTreeSearch, 300));
    if (addRelationshipButton) addRelationshipButton.addEventListener('click', handleAddRelationship);


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
        const pageName = e.target.id.split('-')[1];
        navigateTo(pageName);
    }

    async function handleSearch(e, url = null) {
        if (e) e.preventDefault();
        if (!searchResultsContainer) return;
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
            };
            searchParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v.trim() !== ''));
        }

        try {
            const data = await searchRecords(searchParams);
            displaySearchResults(data.results);
            displayPaginationControls(searchPaginationContainer, data.previous, data.next, (nextUrl) => handleSearch(null, nextUrl));
        } catch (error) {
            searchResultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    async function handleAddRecord(e) {
        e.preventDefault();
        if (!addRecordSuccessMessage) return;
        addRecordSuccessMessage.textContent = '';
        const formData = new FormData(addRecordForm);
        const recordData = Object.fromEntries(formData.entries());

        try {
            await addRecord(recordData);
            addRecordSuccessMessage.textContent = 'Record added successfully!';
            addRecordForm.reset();
            updateDashboardStats();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleUploadData(e) {
        e.preventDefault();
        if (!uploadStatus) return;
        uploadStatus.innerHTML = '<p class="text-blue-600">Uploading and processing file...</p>';

        const batchName = document.getElementById('upload-batch-name').value;
        const fileInput = document.getElementById('upload-file');
        const file = fileInput.files[0];

        if (!batchName || !file) {
            uploadStatus.innerHTML = '<p class="text-red-600">Please provide a batch name and select a file.</p>';
            return;
        }

        try {
            const result = await uploadData(batchName, file);
            uploadStatus.innerHTML = `<p class="text-green-600">${result.message}</p>`;
            uploadDataForm.reset();
            updateDashboardStats();
        } catch (error) {
            uploadStatus.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
        }
    }

    async function handleAllDataBatchSelect() {
        const batchId = allDataBatchSelect.value;
        if (!allDataFileSelect || !allDataTableContainer) return;
        allDataFileSelect.innerHTML = '<option value="">Loading files...</option>';
        allDataTableContainer.innerHTML = '';
        originalRecords = [];

        if (!batchId) {
            allDataFileSelect.innerHTML = '<option value="">Select a Batch First</option>';
            return;
        }

        try {
            const files = await getBatchFiles(batchId);
            allDataFileSelect.innerHTML = '<option value="all">All Files</option>';
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                allDataFileSelect.appendChild(option);
            });
            handleAllDataFileSelect();
        } catch (error) {
            allDataFileSelect.innerHTML = '<option value="">Error loading files</option>';
            console.error(error);
        }
    }

    async function handleAllDataFileSelect(url = null) {
        if (!allDataBatchSelect || !allDataFileSelect || !allDataTableContainer) return;
        const batchId = allDataBatchSelect.value;
        const fileName = allDataFileSelect.value;
        allDataTableContainer.innerHTML = '<p class="p-4 text-gray-500">Loading records...</p>';

        if (!batchId) return;

        let params;
        if (url) {
            params = url;
        } else {
            currentAllDataParams = {
                batch: batchId
            };
            if (fileName && fileName !== 'all') {
                currentAllDataParams.file_name = fileName;
            }
            params = currentAllDataParams;
        }

        try {
            const data = await searchRecords(params);
            originalRecords = data.results;
            renderEditableTable(data.results);
            displayPaginationControls(allDataPaginationContainer, data.previous, data.next, handleAllDataFileSelect);
        } catch (error) {
            allDataTableContainer.innerHTML = `<p class="p-4 text-red-500">${error.message}</p>`;
        }
    }

    async function handleSaveChanges() {
        if (!allDataStatus || !allDataTableContainer) return;
        allDataStatus.innerHTML = '<p class="text-blue-600">Saving changes...</p>';
        const tableRows = allDataTableContainer.querySelectorAll('tbody tr');
        const updatePromises = [];

        tableRows.forEach((row, index) => {
            const recordId = row.dataset.recordId;
            const originalRecord = originalRecords.find(r => r.id == recordId);
            if (!originalRecord) return;

            const currentRecord = {
                naam: row.querySelector('input[data-field="naam"]').value,
                voter_no: row.querySelector('input[data-field="voter_no"]').value,
                pitar_naam: row.querySelector('input[data-field="pitar_naam"]').value,
                thikana: row.querySelector('textarea[data-field="thikana"]').value,
                relationship_status: row.querySelector('select[data-field="relationship_status"]').value,
            };

            const hasChanged = Object.keys(currentRecord).some(key => originalRecord[key] !== currentRecord[key]);

            if (hasChanged) {
                updatePromises.push(updateRecord(recordId, currentRecord));
            }
        });

        if (updatePromises.length === 0) {
            allDataStatus.innerHTML = '<p class="text-gray-600">No changes detected.</p>';
            return;
        }

        try {
            await Promise.all(updatePromises);
            allDataStatus.innerHTML = `<p class="text-green-600">Successfully saved ${updatePromises.length} records!</p>`;
            handleAllDataFileSelect(currentAllDataParams);
        } catch (error) {
            allDataStatus.innerHTML = `<p class="text-red-600">Error saving changes: ${error.message}</p>`;
        }
    }

    function handleRelTabClick(clickedTab) {
        if (!relTabs) return;
        relTabs.forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
        const status = clickedTab.dataset.status;

        if (status === 'Stats') {
            displayRelationshipStats();
        } else {
            displayRelationshipList(status);
        }
    }

    async function handleRecalculateAges() {
        if (!ageRecalculationStatus) return;
        ageRecalculationStatus.innerHTML = '<p class="text-blue-600">Recalculating ages for all records. This might take a moment...</p>';
        try {
            const result = await recalculateAllAges();
            ageRecalculationStatus.innerHTML = `<p class="text-green-600">${result.message}</p>`;
            initializeAgeManagementPage();
        } catch (error) {
            ageRecalculationStatus.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
        }
    }

    async function handleFamilyTreeSearch(event) {
        const input = event.target;
        const query = input.value.trim();
        const isMainSearch = input.id === 'family-main-search';
        const resultsContainer = isMainSearch ? familyMainSearchResults : familyRelativeSearchResults;

        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }

        try {
            const data = await searchRecords({ naam__icontains: query });
            resultsContainer.innerHTML = '';
            if (data.results.length === 0) {
                resultsContainer.innerHTML = '<p class="text-gray-500">No results found.</p>';
            } else {
                data.results.forEach(record => {
                    const button = document.createElement('button');
                    button.className = 'block w-full text-left p-2 rounded hover:bg-gray-100';
                    button.textContent = `${record.naam} (Voter No: ${record.voter_no || 'N/A'})`;
                    button.onclick = () => {
                        if (isMainSearch) {
                            selectMainPerson(record);
                        } else {
                            selectRelative(record);
                        }
                    };
                    resultsContainer.appendChild(button);
                });
            }
        } catch (error) {
            resultsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    function selectMainPerson(person) {
        selectedPersonId = person.id;
        familySelectedPersonDetails.innerHTML = `<p><strong>Name:</strong> ${person.naam}</p><p><strong>Voter No:</strong> ${person.voter_no || 'N/A'}</p>`;
        familyManagementSection.classList.remove('hidden');
        familyMainSearchResults.innerHTML = '';
        familyMainSearchInput.value = person.naam;
        loadFamilyTree(person.id);
    }

    function selectRelative(relative) {
        selectedRelativeId = relative.id;
        familyRelativeSearchResults.innerHTML = `<p class="p-2 bg-green-100 rounded">Selected: ${relative.naam}</p>`;
        familyRelativeSearchInput.value = relative.naam;
        familyAddForm.classList.remove('hidden');
    }

    async function loadFamilyTree(personId) {
        familyCurrentRelatives.innerHTML = '<p class="text-gray-500">Loading relatives...</p>';
        try {
            const relationships = await getFamilyTree(personId);
            familyCurrentRelatives.innerHTML = '';
            if (relationships.length === 0) {
                familyCurrentRelatives.innerHTML = '<p class="text-gray-500">No relatives added yet.</p>';
            } else {
                relationships.forEach(rel => {
                    const relDiv = document.createElement('div');
                    relDiv.className = 'flex justify-between items-center p-2 border-b';
                    relDiv.innerHTML = `
                        <div>
                            <span class="font-bold">${rel.relationship_type}:</span>
                            <span>${rel.relative.naam} (Voter No: ${rel.relative.voter_no || 'N/A'})</span>
                        </div>
                        <button data-id="${rel.id}" class="remove-relative-btn text-red-500 hover:text-red-700">Remove</button>
                    `;
                    familyCurrentRelatives.appendChild(relDiv);
                });
                document.querySelectorAll('.remove-relative-btn').forEach(btn => {
                    btn.addEventListener('click', handleRemoveRelationship);
                });
            }
        } catch (error) {
            familyCurrentRelatives.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    async function handleAddRelationship() {
        const relationshipType = relationshipTypeInput.value.trim();
        if (!selectedPersonId || !selectedRelativeId || !relationshipType) {
            familyAddStatus.textContent = 'Please select a main person, a relative, and enter a relationship type.';
            return;
        }

        familyAddStatus.textContent = 'Adding...';
        try {
            await addFamilyMember(selectedPersonId, selectedRelativeId, relationshipType);
            familyAddStatus.textContent = 'Relationship added successfully!';
            familyRelativeSearchInput.value = '';
            relationshipTypeInput.value = '';
            selectedRelativeId = null;
            familyRelativeSearchResults.innerHTML = '';
            familyAddForm.classList.add('hidden');
            loadFamilyTree(selectedPersonId);
        } catch (error) {
            familyAddStatus.textContent = `Error: ${error.message}`;
        }
    }

    async function handleRemoveRelationship(event) {
        const relationshipId = event.target.dataset.id;
        if (!confirm('Are you sure you want to remove this relationship?')) return;
        
        try {
            await removeFamilyMember(relationshipId);
            loadFamilyTree(selectedPersonId);
        } catch (error) {
            alert(`Failed to remove relationship: ${error.message}`);
        }
    }


    // --- UI Update Functions ---
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
    }

    function displayPaginationControls(container, prevUrl, nextUrl, callback) {
        if (!container) return;
        container.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed';
        prevButton.disabled = !prevUrl;
        prevButton.addEventListener('click', () => callback(prevUrl));

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed';
        nextButton.disabled = !nextUrl;
        nextButton.addEventListener('click', () => callback(nextUrl));

        container.appendChild(prevButton);
        container.appendChild(nextButton);
    }

    function renderEditableTable(records) {
        if (!allDataTableContainer) return;
        allDataTableContainer.innerHTML = '';
        if (!records || records.length === 0) {
            allDataTableContainer.innerHTML = '<p class="p-4 text-gray-600">No records found for this selection.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter No</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            </tbody>
        `;

        const tbody = table.querySelector('tbody');
        records.forEach(record => {
            const row = document.createElement('tr');
            row.dataset.recordId = record.id;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap"><input type="text" data-field="naam" class="w-full p-1 border rounded" value="${record.naam || ''}"></td>
                <td class="px-6 py-4 whitespace-nowrap"><input type="text" data-field="voter_no" class="w-full p-1 border rounded" value="${record.voter_no || ''}"></td>
                <td class="px-6 py-4 whitespace-nowrap"><input type="text" data-field="pitar_naam" class="w-full p-1 border rounded" value="${record.pitar_naam || ''}"></td>
                <td class="px-6 py-4 whitespace-nowrap"><textarea data-field="thikana" class="w-full p-1 border rounded">${record.thikana || ''}</textarea></td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select data-field="relationship_status" class="w-full p-1 border rounded">
                        <option value="Regular" ${record.relationship_status === 'Regular' ? 'selected' : ''}>Regular</option>
                        <option value="Friend" ${record.relationship_status === 'Friend' ? 'selected' : ''}>Friend</option>
                        <option value="Enemy" ${record.relationship_status === 'Enemy' ? 'selected' : ''}>Enemy</option>
                        <option value="Connected" ${record.relationship_status === 'Connected' ? 'selected' : ''}>Connected</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });

        allDataTableContainer.appendChild(table);
    }

    function displayRelationshipList(status, url = null) {
        if (!relContentContainer || !relPaginationContainer) return;
        relContentContainer.innerHTML = '<p class="text-gray-500">Loading...</p>';
        relPaginationContainer.innerHTML = '';

        const params = {
            relationship_status: status
        };

        searchRecords(url || params).then(data => {
            if (!data.results || data.results.length === 0) {
                relContentContainer.innerHTML = `<p class="text-gray-600">No records found with status: ${status}.</p>`;
                return;
            }

            const listContainer = document.createElement('div');
            listContainer.className = 'space-y-4';
            data.results.forEach(record => {
                const card = document.createElement('div');
                card.className = 'result-card';
                card.innerHTML = `
                    <h3>${record.naam}</h3>
                    <p><strong>Voter No:</strong> ${record.voter_no || 'N/A'}</p>
                    <p><strong>Father's Name:</strong> ${record.pitar_naam || 'N/A'}</p>
                    <p><strong>Address:</strong> ${record.thikana || 'N/A'}</p>
                    <p><strong>Batch:</strong> ${record.batch_name}</p>
                `;
                listContainer.appendChild(card);
            });
            relContentContainer.innerHTML = '';
            relContentContainer.appendChild(listContainer);

            displayPaginationControls(relPaginationContainer, data.previous, data.next, (nextUrl) => displayRelationshipList(status, nextUrl));
        }).catch(error => {
            relContentContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        });
    }

    async function displayRelationshipStats() {
        if (!relContentContainer || !relPaginationContainer) return;
        relContentContainer.innerHTML = '<p class="text-gray-500">Loading statistics...</p>';
        relPaginationContainer.innerHTML = '';

        try {
            const stats = await getRelationshipStats();
            let byBatchHtml = '<h3>Distribution by Batch</h3><div class="space-y-4 mt-4">';
            const batchData = stats.by_batch.reduce((acc, item) => {
                if (!acc[item.batch__name]) {
                    acc[item.batch__name] = {};
                }
                acc[item.batch__name][item.relationship_status] = item.count;
                return acc;
            }, {});

            for (const batchName in batchData) {
                const counts = batchData[batchName];
                byBatchHtml += `
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-bold">${batchName}</h4>
                        <div class="flex justify-center space-x-4 mt-2 items-end">
                            <div class="text-center">
                                <div class="bg-green-500 text-white text-xs py-1 flex items-center justify-center rounded-t-md" style="height: ${ (counts.Friend || 0) * 10 + 20 }px; width: 60px;">${counts.Friend || 0}</div>
                                <div class="text-xs mt-1">Friend</div>
                            </div>
                             <div class="text-center">
                                <div class="bg-red-500 text-white text-xs py-1 flex items-center justify-center rounded-t-md" style="height: ${ (counts.Enemy || 0) * 10 + 20 }px; width: 60px;">${counts.Enemy || 0}</div>
                                <div class="text-xs mt-1">Enemy</div>
                            </div>
                             <div class="text-center">
                                <div class="bg-yellow-500 text-white text-xs py-1 flex items-center justify-center rounded-t-md" style="height: ${ (counts.Connected || 0) * 10 + 20 }px; width: 60px;">${counts.Connected || 0}</div>
                                <div class="text-xs mt-1">Connected</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            byBatchHtml += '</div>';

            relContentContainer.innerHTML = byBatchHtml;
        } catch (error) {
            relContentContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }


    function displaySearchResults(results) {
        if (!searchResultsContainer) return;
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
        if (!addRecordBatchSelect) return;
        try {
            const batchesData = await getBatches();
            const batches = batchesData.results;
            addRecordBatchSelect.innerHTML = '<option value="">Select a Batch (Required)</option>';
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

    function initializeRelationshipsPage() {
        if (!relTabs.length) return;
        handleRelTabClick(document.querySelector('.rel-tab-button[data-status="Friend"]'));
    }

    async function initializeAllDataPage() {
        if (!allDataTableContainer || !allDataFileSelect || !allDataStatus || !allDataBatchSelect) return;
        allDataTableContainer.innerHTML = '';
        allDataFileSelect.innerHTML = '<option value="">Select a Batch First</option>';
        allDataStatus.innerHTML = '';
        originalRecords = [];
        try {
            const batchesData = await getBatches();
            const batches = batchesData.results;
            allDataBatchSelect.innerHTML = '<option value="">Select a Batch</option>';
            batches.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch.id;
                option.textContent = batch.name;
                allDataBatchSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to initialize All Data page:', error);
            allDataBatchSelect.innerHTML = '<option value="">Error loading batches</option>';
        }
    }

    async function initializeAnalysisPage() {
        const contentEl = document.getElementById('analysis-content');
        if (!contentEl) return;
        contentEl.innerHTML = '<p class="text-gray-500">Loading analysis data...</p>';
        try {
            const stats = await getAnalysisStats();
            contentEl.innerHTML = '';
            renderProfessionChart(stats.professions);
            renderGenderChart(stats.genders);
            renderAgeChart(stats.age_groups, 'age-chart-container');
        } catch (error) {
            contentEl.innerHTML = `<p class="text-red-500">Failed to load analysis data: ${error.message}</p>`;
        }
    }

    async function initializeAgeManagementPage() {
        if (ageRecalculationStatus) ageRecalculationStatus.innerHTML = '';
        try {
            const stats = await getAnalysisStats();
            renderAgeChart(stats.age_groups, 'age-management-chart-container');
        } catch (error) {
            const container = document.getElementById('age-management-chart-container');
            if (container) container.parentElement.innerHTML = `<p class="text-red-500">Failed to load age chart: ${error.message}</p>`;
        }
    }


    function renderProfessionChart(professionData) {
        const container = document.getElementById('profession-chart-container');
        if (!container || !professionData || professionData.length === 0) {
            if (container) container.innerHTML = '<p class="text-gray-500">No profession data available.</p>';
            return;
        }
        const canvas = container.getContext('2d');
        if (Chart.getChart(canvas)) {
            Chart.getChart(canvas).destroy();
        }

        const labels = professionData.map(p => p.pesha);
        const data = professionData.map(p => p.count);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Professions',
                    data: data,
                    backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#D946EF', '#FBBF24', '#34D399'],
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Voter Distribution by Profession' } } }
        });
    }

    function renderGenderChart(genderData) {
        const container = document.getElementById('gender-chart-container');
        if (!container || !genderData || genderData.length === 0) {
            if (container) container.innerHTML = '<p class="text-gray-500">No gender data available.</p>';
            return;
        }
        const canvas = container.getContext('2d');
        if (Chart.getChart(canvas)) {
            Chart.getChart(canvas).destroy();
        }

        const labels = genderData.map(g => g.gender);
        const data = genderData.map(g => g.count);

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Genders',
                    data: data,
                    backgroundColor: ['#3B82F6', '#EC4899', '#6B7280'],
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Voter Distribution by Gender' } } }
        });
    }

    function renderAgeChart(ageData, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !ageData) {
            if (container) container.innerHTML = '<p class="text-gray-500">No age data available.</p>';
            return;
        }
        const canvas = container.getContext('2d');
        if (Chart.getChart(canvas)) {
            Chart.getChart(canvas).destroy();
        }

        const labels = ['18-25', '26-35', '36-45', '46-60', '60+'];
        const data = [ageData.group_18_25, ageData.group_26_35, ageData.group_36_45, ageData.group_46_60, ageData.group_60_plus];

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Voters',
                    data: data,
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, title: { display: true, text: 'Voter Distribution by Age Group' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function initializeFamilyTreePage() {
        if (familyMainSearchInput) familyMainSearchInput.value = '';
        if (familyMainSearchResults) familyMainSearchResults.innerHTML = '';
        if (familyManagementSection) familyManagementSection.classList.add('hidden');
        if (familyRelativeSearchInput) familyRelativeSearchInput.value = '';
        if (familyRelativeSearchResults) familyRelativeSearchResults.innerHTML = '';
        if (familyAddForm) familyAddForm.classList.add('hidden');
        selectedPersonId = null;
        selectedRelativeId = null;
    }


    // --- App Initialization & Utilities ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    function showLogin() {
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }

    function showApp() {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
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

    
    // --- NEW: Call History Elements ---
    const callHistorySearchInput = document.getElementById('callhistory-search');
    const callHistorySearchResults = document.getElementById('callhistory-search-results');
    const callHistoryManagementSection = document.getElementById('callhistory-management-section');
    const callHistorySelectedPerson = document.getElementById('callhistory-selected-person');
    const callHistoryLogsContainer = document.getElementById('callhistory-logs-container');
    const addCallLogForm = document.getElementById('add-call-log-form');
    const callLogStatus = document.getElementById('call-log-status');
    let selectedPersonForCallHistory = null;


    // --- Event Listeners ---
    // ... (all existing event listeners up to addRelationshipButton)
    if (addRelationshipButton) addRelationshipButton.addEventListener('click', handleAddRelationship);
    
    // --- NEW: Call History Event Listeners ---
    if (callHistorySearchInput) callHistorySearchInput.addEventListener('input', debounce(handleCallHistorySearch, 300));
    if (addCallLogForm) addCallLogForm.addEventListener('submit', handleAddCallLog);


    // --- Event Handlers ---
    // ... (all existing event handlers up to handleRemoveRelationship)

    async function handleRemoveRelationship(event) {
        const relationshipId = event.target.dataset.id;
        if (!confirm('Are you sure you want to remove this relationship?')) return;
        
        try {
            await removeFamilyMember(relationshipId);
            loadFamilyTree(selectedPersonId);
        } catch (error) {
            alert(`Failed to remove relationship: ${error.message}`);
        }
    }

    // --- NEW: Call History Event Handlers ---
    async function handleCallHistorySearch(event) {
        const query = event.target.value.trim();
        if (!query) {
            callHistorySearchResults.innerHTML = '';
            return;
        }
        try {
            const data = await searchRecords({ naam__icontains: query });
            callHistorySearchResults.innerHTML = '';
            if (data.results.length === 0) {
                callHistorySearchResults.innerHTML = '<p class="text-gray-500">No results found.</p>';
            } else {
                data.results.forEach(record => {
                    const button = document.createElement('button');
                    button.className = 'block w-full text-left p-2 rounded hover:bg-gray-100';
                    button.textContent = `${record.naam} (Voter No: ${record.voter_no || 'N/A'})`;
                    button.onclick = () => selectPersonForCallHistory(record);
                    callHistorySearchResults.appendChild(button);
                });
            }
        } catch (error) {
            callHistorySearchResults.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    function selectPersonForCallHistory(person) {
        selectedPersonForCallHistory = person;
        callHistorySelectedPerson.innerHTML = `<p><strong>Name:</strong> ${person.naam}</p><p><strong>Voter No:</strong> ${person.voter_no || 'N/A'}</p>`;
        callHistoryManagementSection.classList.remove('hidden');
        callHistorySearchResults.innerHTML = '';
        callHistorySearchInput.value = person.naam;
        loadCallHistory(person.id);
    }

    async function loadCallHistory(recordId) {
        callHistoryLogsContainer.innerHTML = '<p class="text-gray-500">Loading history...</p>';
        try {
            const history = await getCallHistory(recordId);
            callHistoryLogsContainer.innerHTML = '';
            if (history.length === 0) {
                callHistoryLogsContainer.innerHTML = '<p class="text-gray-500">No call history found for this person.</p>';
            } else {
                history.forEach(log => {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'p-3 border rounded-lg bg-gray-50';
                    logDiv.innerHTML = `
                        <p class="font-bold text-gray-700">${log.call_date}</p>
                        <p class="text-gray-600 mt-1">${log.summary}</p>
                    `;
                    callHistoryLogsContainer.appendChild(logDiv);
                });
            }
        } catch (error) {
            callHistoryLogsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    async function handleAddCallLog(event) {
        event.preventDefault();
        const callDate = document.getElementById('call-date').value;
        const summary = document.getElementById('call-summary').value.trim();
        if (!callDate || !summary) {
            callLogStatus.textContent = 'Please fill out all fields.';
            return;
        }

        callLogStatus.textContent = 'Saving...';
        try {
            await addCallLog(selectedPersonForCallHistory.id, callDate, summary);
            callLogStatus.textContent = 'Log saved successfully!';
            addCallLogForm.reset();
            loadCallHistory(selectedPersonForCallHistory.id);
        } catch (error) {
            callLogStatus.textContent = `Error: ${error.message}`;
        }
    }


    // --- UI Update Functions ---
    function navigateTo(pageName) {
        // ... (existing navigateTo function)
        if (pageName === 'age') initializeAgeManagementPage();
        if (pageName === 'familytree') initializeFamilyTreePage();
        if (pageName === 'callhistory') initializeCallHistoryPage(); // Add this line
    }

    // ... (rest of UI update functions down to initializeFamilyTreePage)

    function initializeFamilyTreePage() {
        if (familyMainSearchInput) familyMainSearchInput.value = '';
        if (familyMainSearchResults) familyMainSearchResults.innerHTML = '';
        if (familyManagementSection) familyManagementSection.classList.add('hidden');
        if (familyRelativeSearchInput) familyRelativeSearchInput.value = '';
        if (familyRelativeSearchResults) familyRelativeSearchResults.innerHTML = '';
        if (familyAddForm) familyAddForm.classList.add('hidden');
        selectedPersonId = null;
        selectedRelativeId = null;
    }

    function initializeCallHistoryPage() {
        if (callHistorySearchInput) callHistorySearchInput.value = '';
        if (callHistorySearchResults) callHistorySearchResults.innerHTML = '';
        if (callHistoryManagementSection) callHistoryManagementSection.classList.add('hidden');
        if(addCallLogForm) addCallLogForm.reset();
        if(callLogStatus) callLogStatus.textContent = '';
        selectedPersonForCallHistory = null;
    }



    init();
});

