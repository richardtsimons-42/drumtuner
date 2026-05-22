class ApiClient {
    constructor() { this.base = ''; }

    async get(url) {
        const resp = await fetch(`${this.base}${url}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    }

    async post(url, body) {
        const resp = await fetch(`${this.base}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    }

    async put(url, body) {
        const resp = await fetch(`${this.base}${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    }

    // Drum types (legacy)
    async getDrumTypes() { return this.get('/api/drum-types'); }
    async instantiateDrum(drumTypeId) { return this.post(`/api/drum-types/${drumTypeId}/instantiate`, null); }
    async updateLug(lugId, note) { return this.put(`/api/lugs/${lugId}`, { note }); }

    // Instrument types
    async getInstrumentTypes() { return this.get('/api/instruments'); }
    async instantiateInstrument(instrumentTypeId) { return this.post(`/api/instruments/${instrumentTypeId}/instantiate`, null); }
    async updateString(instrumentId, stringIndex, note) { return this.put(`/api/instruments/${instrumentId}/strings/${stringIndex}`, note); }

    // Tuning sessions
    async saveSession(drumTypeId, lugRecords, notes = '') {
        return this.post('/api/tuning-sessions', { drumTypeId, notes, lugRecords });
    }
    async getSessions() { return this.get('/api/tuning-sessions'); }
    async getSession(id) { return this.get(`/api/tuning-sessions/${id}`); }
}

window.apiClient = new ApiClient();
