// Tuning Guide — instrument-specific tuning information
const tuningGuide = {
    patterns: {
        'Guitar': [
            { name: 'Standard Tuning', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], desc: 'Most common guitar tuning' },
            { name: 'Drop D', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'], desc: 'Lower the 6th string to D for power chords' },
            { name: 'Open G', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'], desc: 'Strum open strings for a G chord' },
            { name: 'Open D', notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], desc: 'Strum open strings for a D chord' },
            { name: 'Half-Step Down', notes: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'], desc: 'All strings lowered by one semitone' },
            { name: 'DADGAD', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'], desc: 'Celtic/folk tuning with open D sound' }
        ],
        'Bass': [
            { name: 'Standard 4-String', notes: ['E1', 'A1', 'D2', 'G2'], desc: 'Most common bass tuning' },
            { name: 'Standard 5-String', notes: ['B0', 'E1', 'A1', 'D2', 'G2'], desc: 'Extended range with low B string' },
            { name: 'Standard 6-String', notes: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'], desc: 'Wide range bass, two octaves of E' },
            { name: 'Drop D Bass', notes: ['D1', 'A1', 'D2', 'G2'], desc: 'Lower the E string to D for heavier riffs' }
        ],
        'Strings': [
            { name: 'Violin Standard', notes: ['G3', 'D4', 'A4', 'E5'], desc: 'Standard violin tuning, perfect fifths' },
            { name: 'Viola Standard', notes: ['G3', 'D4', 'A4', 'E5'], desc: 'Same as violin but an octave lower' },
            { name: 'Cello Standard', notes: ['G2', 'D3', 'A3', 'E4'], desc: 'Standard cello tuning, perfect fifths' },
            { name: 'Double Bass Standard', notes: ['E1', 'A1', 'D2', 'G2'], desc: 'Same as bass guitar but larger instrument' }
        ],
        'Piano': [
            { name: 'Concert Pitch (A440)', notes: ['A4'], desc: 'A4 = 440 Hz is the standard tuning reference' },
            { name: 'Middle C', notes: ['C4'], desc: 'C4 = 261.63 Hz, located near center of keyboard' },
            { name: 'Octave Reference', notes: ['C3', 'C4', 'C5', 'C6', 'C7'], desc: 'All C notes across the piano range' }
        ],
        'Drums': [
            { name: 'Snare — Standard', notes: ['12 o\'c'], desc: 'Center lug at top, tune in star pattern (opposite lugs) for even tension' },
            { name: 'Snare — Low & Loose', notes: ['Lower 4th'], desc: 'Tune snare a 4th lower for a deeper, fatter sound. Loosen batter head more.' },
            { name: 'Rack Tom — Standard', notes: ['C3, G2, D2'], desc: 'Typical rack tom range. Tuned in descending 4ths between toms (rack higher than floor).' },
            { name: 'Floor Tom — Standard', notes: ['G1, D1'], desc: 'Tuned a 4th or 5th below the rack tom for smooth pitch descent.' },
            { name: 'Bass Drum — Standard', notes: ['C2'], desc: 'Common bass drum fundamental. Punch a hole in resonant head to reduce low end.' },
            { name: 'Tom Tuning Pattern', notes: ['Lug star'], desc: 'Always tune lugs in opposite pairs (star pattern). 12 o\'c → 6 o\'c → 3 → 9 → etc.' }
        ],
        'Percussion': [
            { name: 'Timpani Ranges', notes: ['C2', 'G2', 'C3', 'G3'], desc: 'Common timpani tuning intervals' },
            { name: 'Conga Tuning', notes: ['D3', 'A2'], desc: 'Tuned congas in a fifth interval' }
        ],
        'Other': [
            { name: 'Ukulele Standard (GCEA)', notes: ['G4', 'C4', 'E4', 'A4'], desc: 'Most common ukulele tuning' },
            { name: 'Banjo Open G', notes: ['G4', 'D3', 'G3', 'B3', 'D4'], desc: 'Standard banjo tuning for bluegrass' },
            { name: 'Mandolin Standard', notes: ['G3', 'D4', 'G4', 'B4', 'E5'], desc: 'Pairs tuned in unison, like a violin but higher' },
            { name: 'Dobro Open G', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'D4'], desc: 'Open G chord for slide guitar playing' }
        ]
    },

    render(category) {
        const cat = category || 'Other';
        const patterns = this.patterns[cat] || this.patterns['Other'];

        let html = `<h3>Tuning Guide — ${cat}</h3><div class="pattern-list">`;

        for (const p of patterns) {
            const notesHtml = p.notes.map(n => {
                const hue = this.noteToHue(n);
                return `<span class="tuning-note-badge" style="background:hsl(${hue},60%,40%)">${n}</span>`;
            }).join('');

            html += `
                <div class="pattern-item">
                    <h4>${p.name}</h4>
                    <p>${p.desc}</p>
                    <div class="pattern-diagram">${notesHtml}</div>
                </div>`;
        }

        html += '</div>';
        return html;
    },

    noteToHue(note) {
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1).replace('#', '');
        const semitones = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const semi = semitones[noteName] || 0;
        return ((octave - 1) * 12 + semi) * 360 / 48 % 360;
    }
};
