// Drum Selector Page
const drumSelector = {
    iconMap: { 'Snare': '🥁', 'Tom': '🪘', 'Kick': '🔊' },

    async render() {
        const types = await apiClient.getDrumTypes();
        return `
            <div class="drum-grid">
                ${types.map(t => `
                    <div class="drum-card" onclick="app.selectDrum(${t.id})">
                        <div class="drum-card-icon">${this.iconMap[t.category] || '🥁'}</div>
                        <div class="drum-card-name">${t.name}</div>
                        <div class="drum-card-info">${t.lugCount} lugs · ${t.defaultNote}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async init() {
        document.getElementById('app').innerHTML = await this.render();
    }
};
