// Journal Component
const journal = {
    async render() {
        const sessions = await apiClient.getSessions();
        return `
            <h2 style="margin-bottom:20px;color:#e94560;">📋 Tuning Journal</h2>
            ${sessions.length === 0 ? '<p style="color:#888">No tuning sessions yet. Start tuning to save your first session!</p>' : `
                <div class="journal-list">
                    ${sessions.map(s => `
                        <div class="journal-item">
                            <div class="journal-info">
                                <h4>${s.drumTypeId}</h4>
                                <p>${new Date(s.createdAt).toLocaleString()}</p>
                                ${s.notes ? `<p style="color:#aaa;font-style:italic;margin-top:4px">"${s.notes}"</p>` : ''}
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="btn btn-secondary" onclick="journal.load(${s.id})">Load</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        `;
    },

    async init() {
        document.getElementById('app').innerHTML = await this.render();
    },

    async load(sessionId) {
        const session = await apiClient.getSession(sessionId);
        // For now, just show the data — could restore lugs to a drum
        alert(`Session loaded!\nDrum Type ID: ${session.drumTypeId}\nDate: ${new Date(session.createdAt).toLocaleString()}\n\nLug Records:\n${session.lugRecords.map(r => `  Lug ${r.position}: ${r.note}`).join('\n')}`);
    }
};
