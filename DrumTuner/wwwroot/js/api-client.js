class ApiClient {
    constructor() {
        this.base = '';
    }

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

    async getDrumTypes() {
        return this.get('/api/drum-types');
    }

    async instantiateDrum(drumTypeId) {
        return this.post(`/api/drum-types/${drumTypeId}/instantiate`, null);
    }

    async getLugs(drumId) {
        return this.get(`/api/lugs/drum/${drumId}`);
    }

    async updateLug(lugId, note) {
        return this.put(`/api/lugs/${lugId}`, { note });
    }

    async saveSession(drumTypeId, lugRecords, notes = '') {
        return this.post('/api/tuning-sessions', {
            drumTypeId,
            notes,
            lugRecords
        });
    }

    async getSessions() {
        return this.get('/api/tuning-sessions');
    }

    async getSession(id) {
        return this.get(`/api/tuning-sessions/${id}`);
    }
}

window.apiClient = new ApiClient();
