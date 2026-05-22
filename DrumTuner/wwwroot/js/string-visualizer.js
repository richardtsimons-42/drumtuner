// String Visualizer — horizontal string rows for guitar/bass/strings/ukulele/etc.
const stringVisualizer = {
    instrumentId: null,
    strings: [],       // [{index, targetNote, currentNote, cents}]
    isTuningMode: false,

    init(instrumentId, stringCount, defaultNotes) {
        this.instrumentId = instrumentId;
        this.strings = defaultNotes.map((note, i) => ({
            index: i,
            targetNote: note,
            currentNote: null,
            cents: null
        }));
    },

    render() {
        const count = this.strings.length;
        const isWide = count > 6;
        const rowHeight = isWide ? 48 : 56;
        const totalHeight = count * rowHeight + 32;

        let html = `<div class="string-visualizer" style="max-width:${isWide ? '100%' : '400px'}">`;
        html += `<div class="string-rows" style="height:${totalHeight}px">`;

        this.strings.forEach((s, i) => {
            const noteColor = s.cents !== null ? this.centsColor(s.cents) : '#666';
            const barWidth = s.cents !== null ? Math.min(100, Math.abs(s.cents) / 50 * 100) : 0;
            const needleLeft = s.cents !== null ? 50 + (s.cents / 50) * 50 : 50;

            html += `
                <div class="string-row" style="height:${rowHeight}px" onclick="stringVisualizer.playString(${i})">
                    <div class="string-num">${i + 1}</div>
                    <div class="string-info">
                        <div class="string-target-note">${s.targetNote}</div>
                        <div class="string-detected-note" style="color:${noteColor}">
                            ${s.currentNote ? s.currentNote : '—'}
                        </div>
                    </div>
                    <div class="string-gauge">
                        <div class="string-bar-bg"></div>
                        <div class="string-bar-fill" style="width:${barWidth}%;background:${noteColor};opacity:0.3"></div>
                        <div class="string-needle" style="left:${needleLeft}%"></div>
                    </div>
                    <div class="string-cents">${s.cents !== null ? `${s.cents > 0 ? '+' : ''}${s.cents}¢` : '—'}</div>
                </div>`;
        });

        html += `</div></div>`;
        return html;
    },

    centsColor(cents) {
        const abs = Math.abs(cents);
        if (abs <= 5) return '#4ade80';
        if (abs <= 20) return '#facc15';
        return '#ef4444';
    },

    playString(index) {
        const note = this.strings[index].targetNote;
        if (note && window.tonePlayer) {
            window.tonePlayer.playNote(note, 2);
        }
    },

    updateFromPitch(pitch) {
        if (!pitch || !pitch.isDetected) return;

        // Find closest string by matching note name (ignoring octave)
        const noteName = pitch.note.replace(/\d/, '');
        let closestIdx = -1;
        let closestDist = Infinity;

        this.strings.forEach(s => {
            const targetName = s.targetNote.replace(/\d/, '');
            if (targetName === noteName) {
                // Same note name — check octave proximity
                const dist = Math.abs(parseInt(pitch.note.slice(-1)) - parseInt(s.targetNote.slice(-1)));
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = s.index;
                }
            }
        });

        // If no exact note match, find by frequency proximity
        if (closestIdx === -1) {
            this.strings.forEach(s => {
                const targetFreq = window.tonePlayer ? window.tonePlayer.getFrequency(s.targetNote) : 440;
                const freqDiff = Math.abs(pitch.frequency - targetFreq);
                if (freqDiff < closestDist && freqDiff < 200) { // within 200 Hz
                    closestDist = freqDiff;
                    closestIdx = s.index;
                }
            });
        }

        if (closestIdx >= 0) {
            this.strings[closestIdx].currentNote = pitch.note;
            this.strings[closestIdx].cents = pitch.cents;
        }
    },

    resetPitch() {
        this.strings.forEach(s => {
            s.currentNote = null;
            s.cents = null;
        });
    },

    getInstrumentId() { return this.instrumentId; },
    getStrings() { return this.strings; }
};
