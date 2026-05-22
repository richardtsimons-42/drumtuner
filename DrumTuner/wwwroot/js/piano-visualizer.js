// Piano Visualizer — simplified keyboard layout for piano tuning
const pianoVisualizer = {
    instrumentId: null,
    octaveRange: [0, 8], // A0 to B7 (full 88-key range)
    activeKeys: {},       // noteName -> {cents, isDetected}

    init(instrumentId, defaultNotes) {
        this.instrumentId = instrumentId;
        this.activeKeys = {};
        // Initialize with detected key info for all notes in the piano range
        for (let octave = this.octaveRange[0]; octave <= this.octaveRange[1]; octave++) {
            for (const note of ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']) {
                const key = `${note}${octave}`;
                this.activeKeys[key] = { cents: null, isDetected: false };
            }
        }
    },

    render() {
        let html = '<div class="piano-visualizer">';

        // Group by octave
        for (let octave = this.octaveRange[0]; octave <= this.octaveRange[1]; octave++) {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            html += `<div class="piano-octave" data-octave="${octave}">`;

            notes.forEach(note => {
                const key = `${note}${octave}`;
                const info = this.activeKeys[key];
                const isWhite = !note.includes('#');
                const isActive = info && info.isDetected;
                const color = isActive ? this.centsColor(info.cents) : (isWhite ? '#fff' : '#333');

                if (isWhite) {
                    html += `<div class="piano-key white-key" data-note="${key}" onclick="pianoVisualizer.playKey('${key}')"
                        style="background:${isActive ? color : '#fff'};border-color:#ccc;height:120px">
                        <span style="color:#333;font-size:10px">${note}${octave}</span>
                    </div>`;
                } else {
                    // Black key — render with offset
                    html += `<div class="piano-key black-key" data-note="${key}" onclick="pianoVisualizer.playKey('${key}')"
                        style="background:${isActive ? color : '#222'};border-color:#111;height:75px">
                    </div>`;
                }
            });

            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    centsColor(cents) {
        const abs = Math.abs(cents);
        if (abs <= 5) return '#4ade80';
        if (abs <= 20) return '#facc15';
        return '#ef4444';
    },

    playKey(note) {
        if (window.tonePlayer) {
            window.tonePlayer.playNote(note, 2);
        }
    },

    updateFromPitch(pitch) {
        if (!pitch || !pitch.isDetected) return;

        const noteName = pitch.note.replace(/\d/, '');
        const octave = parseInt(pitch.note.slice(-1));

        for (let o = Math.max(this.octaveRange[0], octave - 2); o <= Math.min(this.octaveRange[1], octave + 2); o++) {
            const key = `${noteName}${o}`;
            if (this.activeKeys[key]) {
                this.activeKeys[key] = { cents: pitch.cents, isDetected: true };
            }
        }

        // Clear other keys after a timeout (handled by resetUndetected)
    },

    resetUndetected() {
        Object.keys(this.activeKeys).forEach(key => {
            this.activeKeys[key].isDetected = false;
        });
    },

    getInstrumentId() { return this.instrumentId; }
};
