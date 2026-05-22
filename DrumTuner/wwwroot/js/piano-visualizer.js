// Piano Visualizer — simplified keyboard layout for piano tuning
const pianoVisualizer = {
    instrumentId: null,
    octaveRange: [0, 8], // A0 to B7 (full 88-key range)
    activeKeys: {},       // noteName -> {cents, isDetected}
    selectedKey: null,    // currently focused key
    centsHistory: [],     // rolling average of cents for smoothing
    historySize: 6,       // number of samples to average
    lastRenderedCents: null, // track what was rendered to avoid jittery re-renders
    lastDetectedTime: {}, // track when each key was last detected for decay

    init(instrumentId, defaultNotes) {
        this.instrumentId = instrumentId;
        this.activeKeys = {};
        this.selectedKey = null;
        this.centsHistory = [];
        this.lastRenderedCents = null;
        this.lastDetectedTime = {};
        // Initialize with detected key info for all notes in the piano range
        for (let octave = this.octaveRange[0]; octave <= this.octaveRange[1]; octave++) {
            for (const note of ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']) {
                const key = `${note}${octave}`;
                this.activeKeys[key] = { cents: null, isDetected: false };
            }
        }
    },

    selectKey(note) {
        this.selectedKey = note;
        this.centsHistory = [];
        this.lastRenderedCents = null;
        // Re-render to show selection highlight
        const pc = document.getElementById('pianoContainer');
        if (pc) pc.innerHTML = this.render();

        // Update tuner gauge to show the selected note as target
        const noteEl = document.getElementById('tunerNote');
        const freqEl = document.getElementById('tunerFreq');
        if (noteEl && freqEl) {
            const freq = window.tonePlayer ? window.tonePlayer.getFrequency(note) : 440;
            noteEl.textContent = note;
            freqEl.textContent = `${freq} Hz`;
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
                const isSelected = this.selectedKey === key;
                const color = isActive ? this.centsColor(info.cents) : (isWhite ? '#fff' : '#333');

                if (isWhite) {
                    html += `<div class="piano-key white-key${isSelected ? ' selected-key' : ''}" data-note="${key}" onclick="pianoVisualizer.selectKey('${key}')"
                        style="background:${isActive ? color : '#fff'};border-color:#ccc;height:120px">
                        <span style="color:#333;font-size:10px">${note}${octave}</span>
                    </div>`;
                } else {
                    // Black key — render with offset
                    html += `<div class="piano-key black-key${isSelected ? ' selected-key' : ''}" data-note="${key}" onclick="pianoVisualizer.selectKey('${key}')"
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

    updateFromPitch(pitch) {
        if (!pitch || !pitch.isDetected) return;

        const noteName = pitch.note.replace(/\d/, '');
        const octave = parseInt(pitch.note.slice(-1));
        const now = Date.now();

        // Only update the selected key's pitch info when in tune mode
        if (this.selectedKey) {
            for (let o = Math.max(this.octaveRange[0], octave - 2); o <= Math.min(this.octaveRange[1], octave + 2); o++) {
                const key = `${noteName}${o}`;
                if (key === this.selectedKey) {
                    // Smooth cents with rolling average to reduce jitter
                    this.centsHistory.push(pitch.cents);
                    if (this.centsHistory.length > this.historySize) {
                        this.centsHistory.shift();
                    }
                    const avgCents = Math.round(this.centsHistory.reduce((a, b) => a + b, 0) / this.centsHistory.length);

                    // Only re-render when cents crosses a threshold (prevents jittery DOM updates)
                    if (this.lastRenderedCents === null || Math.abs(avgCents - this.lastRenderedCents) >= 3) {
                        this.activeKeys[key] = { cents: avgCents, isDetected: true };
                        this.lastRenderedCents = avgCents;

                        const pc = document.getElementById('pianoContainer');
                        if (pc) pc.innerHTML = this.render();
                    } else {
                        // Just update the data without re-rendering
                        this.activeKeys[key] = { cents: avgCents, isDetected: true };
                    }
                }
            }

            // Clear non-selected keys immediately to prevent ghosts
            Object.keys(this.activeKeys).forEach(key => {
                if (key !== this.selectedKey) {
                    this.activeKeys[key].isDetected = false;
                    this.lastDetectedTime[key] = 0;
                }
            });
        } else {
            // No selection yet — update all nearby keys as before
            for (let o = Math.max(this.octaveRange[0], octave - 2); o <= Math.min(this.octaveRange[1], octave + 2); o++) {
                const key = `${noteName}${o}`;
                if (this.activeKeys[key]) {
                    this.activeKeys[key] = { cents: pitch.cents, isDetected: true };
                    this.lastDetectedTime[key] = now;
                }
            }
        }

        // Decay old detections to prevent ghosts — keys not detected for >800ms fade out
        Object.keys(this.activeKeys).forEach(key => {
            if (key !== this.selectedKey && this.lastDetectedTime[key] && (now - this.lastDetectedTime[key]) > 800) {
                this.activeKeys[key].isDetected = false;
            }
        });
    },

    resetUndetected() {
        Object.keys(this.activeKeys).forEach(key => {
            this.activeKeys[key].isDetected = false;
        });
        this.centsHistory = [];
        this.lastRenderedCents = null;
        this.lastDetectedTime = {};
    },

    getInstrumentId() { return this.instrumentId; }
};
