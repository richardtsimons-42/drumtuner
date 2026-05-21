// Tuning Guide Component
const tuningGuide = {
    patterns: [
        {
            name: '4-Corner',
            description: 'Classic tuning: 4 lugs at target note, opposite 4 lugs one step down. Great for a focused, punchy sound.',
            lugColors: ['primary', 'secondary', 'primary', 'secondary', 'primary', 'secondary', 'primary', 'secondary']
        },
        {
            name: 'Cross-Tuning',
            description: 'Tune opposite lugs together in pairs. Creates a more musical, bell-like tone.',
            lugColors: ['pair1', 'pair2', 'pair1', 'pair2', 'pair1', 'pair2', 'pair1', 'pair2']
        },
        {
            name: 'All Same',
            description: 'Every lug tuned to the same note. Simple, even tone — great for beginners.',
            lugColors: ['all-same', 'all-same', 'all-same', 'all-same', 'all-same', 'all-same', 'all-same', 'all-same']
        }
    ],

    render() {
        return `
            <div class="guide-panel">
                <h3>📖 Tuning Patterns</h3>
                <div class="pattern-list">
                    ${this.patterns.map((p, i) => `
                        <div class="pattern-item">
                            <h4>${p.name}</h4>
                            <p>${p.description}</p>
                            <div class="pattern-diagram">
                                ${Array.from({length: 8}, (_, j) => {
                                    const color = this.getColorClass(p.lugColors[j % p.lugColors.length]);
                                    return `<div class="pattern-lug ${color}" onclick="tuningGuide.playLug(${j + 1})">${j + 1}</div>`;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getColorClass(color) {
        const map = {
            'primary': 'highlight',
            'secondary': '',
            'pair1': 'highlight',
            'pair2': '',
            'all-same': 'highlight'
        };
        return map[color] || '';
    },

    playLug(position) {
        // Play a reference tone for the next lug in sequence
        const currentLugs = drumVisualizer.lugs;
        if (currentLugs && currentLugs[position - 1]) {
            const note = currentLugs[position - 1].tunedNote || 'D3';
            tonePlayer.playNote(note);
        } else {
            tonePlayer.playNote('D3');
        }
    },

    show() {
        // Insert guide below the drum visualizer
        const container = document.querySelector('.drum-container');
        if (container) {
            const guideDiv = document.createElement('div');
            guideDiv.id = 'guidePanel';
            guideDiv.innerHTML = this.render();
            container.after(guideDiv);
        }
    },

    hide() {
        const panel = document.getElementById('guidePanel');
        if (panel) panel.remove();
    }
};
