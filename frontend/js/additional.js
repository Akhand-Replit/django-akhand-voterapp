// This creates a global object to hold the event page functions
window.eventPageModule = {
    initializeEventsPage,
    handleAddEvent,
    handleDeleteEvent,
    handleFilterByEvent,
    populateEventList,
    populateEventFilterDropdown,
    displayEventRecords
};

// --- Event Handlers ---
async function initializeEventsPage() {
    const addEventForm = document.getElementById('add-event-form');
    const filterByEventButton = document.getElementById('filter-by-event-button');
    if(addEventForm && !addEventForm.dataset.listenerAttached) {
        addEventForm.addEventListener('submit', handleAddEvent);
        addEventForm.dataset.listenerAttached = 'true';
    }
    if(filterByEventButton && !filterByEventButton.dataset.listenerAttached) {
        filterByEventButton.addEventListener('click', () => handleFilterByEvent());
        filterByEventButton.dataset.listenerAttached = 'true';
    }

    try {
        const eventsResponse = await getEvents();
        populateEventList(eventsResponse.results);
        populateEventFilterDropdown(eventsResponse.results);
    } catch (error) {
        const existingEventsList = document.getElementById('existing-events-list');
        const eventFilterSelect = document.getElementById('event-filter-select');
        if(existingEventsList) existingEventsList.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        if(eventFilterSelect) eventFilterSelect.innerHTML = `<option>Error loading events</option>`;
    }
}

async function handleAddEvent(e) {
    e.preventDefault();
    const newEventNameInput = document.getElementById('new-event-name');
    const addEventStatus = document.getElementById('add-event-status');
    const eventName = newEventNameInput.value.trim();
    if (!eventName) {
        addEventStatus.textContent = 'Event name cannot be empty.';
        addEventStatus.className = 'text-red-500 text-sm';
        return;
    }
    
    addEventStatus.textContent = 'Adding...';
    addEventStatus.className = 'text-blue-600 text-sm';

    try {
        await addEvent(eventName);
        addEventStatus.textContent = 'Event added successfully!';
        addEventStatus.className = 'text-green-600 text-sm';
        e.target.reset();
        initializeEventsPage(); // Refresh the lists
    } catch (error) {
        addEventStatus.textContent = error.message;
        addEventStatus.className = 'text-red-500 text-sm';
    }
}

async function handleDeleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
        return;
    }
    try {
        await deleteEvent(eventId);
        initializeEventsPage(); // Refresh list after deletion
    } catch (error) {
        alert(error.message);
    }
}

async function handleFilterByEvent(url = null) {
    const eventFilterSelect = document.getElementById('event-filter-select');
    const eventFilterResults = document.getElementById('event-filter-results');
    const eventFilterPagination = document.getElementById('event-filter-pagination');
    const eventId = eventFilterSelect.value;
    if (!eventId || isNaN(parseInt(eventId))) {
        eventFilterResults.innerHTML = '<p class="text-gray-600">Please select a valid event to filter.</p>';
        return;
    }

    eventFilterResults.innerHTML = '<p class="text-gray-500">Loading records...</p>';
    
    try {
        const data = await getRecordsForEvent(eventId, url);
        displayEventRecords(data.results);
        displayPaginationControls(eventFilterPagination, data.previous, data.next, (nextUrl) => handleFilterByEvent(nextUrl));
    } catch (error) {
        eventFilterResults.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
}

// --- UI Update Functions ---
function populateEventList(events) {
    const existingEventsList = document.getElementById('existing-events-list');
    if (!existingEventsList) return;
    existingEventsList.innerHTML = '';
    if (!events || events.length === 0) {
        existingEventsList.innerHTML = '<p class="text-gray-500">No events created yet.</p>';
        return;
    }

    events.forEach(event => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `
            <span>${event.name}</span>
            <button data-event-id="${event.id}" class="delete-event-btn text-red-500 hover:text-red-700 text-sm">Delete</button>
        `;
        existingEventsList.appendChild(div);
    });

    document.querySelectorAll('.delete-event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const eventId = e.target.dataset.eventId;
            handleDeleteEvent(eventId);
        });
    });
}

function populateEventFilterDropdown(events) {
    const eventFilterSelect = document.getElementById('event-filter-select');
    if (!eventFilterSelect) return;
    eventFilterSelect.innerHTML = '<option value="">Select an Event</option>';
    if (!events) return;
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        eventFilterSelect.appendChild(option);
    });
}

function displayEventRecords(records) {
    const eventFilterResults = document.getElementById('event-filter-results');
    if (!eventFilterResults) return;
    eventFilterResults.innerHTML = '';
    if (!records || records.length === 0) {
        eventFilterResults.innerHTML = '<p class="text-gray-600">No records found for this event.</p>';
        return;
    }

    records.forEach(record => {
        const card = document.createElement('div');
        card.className = 'search-card-detailed';
        const safeText = (text) => text || '<span class="text-gray-400">N/A</span>';
        card.innerHTML = `
            <div class="search-card-header">
                <h3>${safeText(record.naam)}</h3>
                <span class="kromik-no">Serial No: ${safeText(record.kromik_no)}</span>
            </div>
            <div class="search-card-body">
                <img src="${record.photo_link}" alt="Voter Photo" class="search-card-photo" onerror="this.onerror=null;this.src='https://placehold.co/100x100/EEE/31343C?text=No+Image';">
                <div class="search-card-details-grid">
                    <div class="detail-item"><span class="label">Voter No:</span> ${safeText(record.voter_no)}</div>
                    <div class="detail-item"><span class="label">Father's Name:</span> ${safeText(record.pitar_naam)}</div>
                    <div class="detail-item"><span class="label">Address:</span> ${safeText(record.thikana)}</div>
                    <div class="detail-item"><span class="label">Batch:</span> ${safeText(record.batch_name)}</div>
                    <div class="detail-item"><span class="label">Assigned Events:</span> ${safeText(record.event_names.join(', '))}</div>
                </div>
            </div>
        `;
        eventFilterResults.appendChild(card);
    });
}
