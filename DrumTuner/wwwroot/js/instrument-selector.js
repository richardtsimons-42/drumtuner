// Instrument Selector Page — category-based instrument picker
const instrumentSelector = {
    iconMap: {
        'Guitar': '🎸',
        'Bass': '🎻',
        'Piano': '🎹',
        'Strings': '🎻',
        'Drums': '🥁',
        'Percussion': '🪘',
        'Other': '🎵'
    },

    async render() {
        const types = await apiClient.getInstrumentTypes();

        // Group by category
        const groups = {};
        types.forEach(t => {
            if (!groups[t.category]) groups[t.category] = [];
            groups[t.category].push(t);
        });

        const catOrder = ['Guitar', 'Bass', 'Piano', 'Strings', 'Drums', 'Percussion', 'Other'];
        let html = '';

        for (const cat of catOrder) {
            const items = groups[cat];
            if (!items || items.length === 0) continue;

            html += `<div class="selector-category"><h3>${this.iconMap[cat] || '🎵'} ${cat}</h3><div class="instrument-grid">`;

            for (const t of items) {
                const notes = this.formatNotes(t.defaultNotes);
                html += `
                    <div class="instrument-card" onclick="app.selectInstrument(${t.id})">
                        <div class="instrument-card-icon">${this.iconMap[cat] || '🎵'}</div>
                        <div class="instrument-card-name">${t.name}</div>
                        <div class="instrument-card-info">${t.stringCount} strings · ${notes}</div>
                    </div>`;
            }

            html += `</div></div>`;
        }

        return html;
    },

    formatNotes(json) {
        try {
            const notes = JSON.parse(json);
            return notes.slice(0, 4).join(' – ') + (notes.length > 4 ? ' …' : '');
        } catch {
            return '';
        }
    },

    async init() {
        document.getElementById('app').innerHTML = await this.render();
    }
};
