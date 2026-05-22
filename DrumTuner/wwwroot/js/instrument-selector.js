// Instrument Selector Page — category-based instrument picker + drums
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
        const [instrumentTypes, drumTypes] = await Promise.all([
            apiClient.getInstrumentTypes(),
            apiClient.getDrumTypes()
        ]);

        // Group instruments by category
        const groups = {};
        instrumentTypes.forEach(t => {
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

        // Add drums section
        if (drumTypes && drumTypes.length > 0) {
            const iconMap = { 'Snare': '🥁', 'Tom': '🪘', 'Kick': '🔊' };
            html += `<div class="selector-category"><h3>🥁 Drums</h3><div class="instrument-grid">`;

            drumTypes.forEach(t => {
                html += `
                    <div class="instrument-card" onclick="app.selectDrum(${t.id})">
                        <div class="instrument-card-icon">${iconMap[t.category] || '🥁'}</div>
                        <div class="instrument-card-name">${t.name}</div>
                        <div class="instrument-card-info">${t.lugCount} lugs · ${t.defaultNote}</div>
                    </div>`;
            });

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
