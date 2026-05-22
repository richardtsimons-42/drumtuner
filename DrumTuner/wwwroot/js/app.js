// Main App — Navigation, State Management & Instrument Tuning
const app = {
    currentPage: 'selector',
    currentInstrumentId: null,
    currentInstrumentTypeId: null,
    currentCategory: null,
    isTuningMode: false,
    lastPitch: null,

    async init() {
        await tonePlayer.loadFrequencies();
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => this.navigate(btn.dataset.page);
        });
        this.navigate('selector');
    },

    navigate(page) {
        this.currentPage = page;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        switch (page) {
            case 'selector':
                instrumentSelector.init();
                break;
            case 'journal':
                journal.init();
                break;
        }
    },

    async selectInstrument(instrumentTypeId) {
        const data = await apiClient.instantiateInstrument(instrumentTypeId);
        this.currentInstrumentId = data.id;
        this.currentInstrumentTypeId = instrumentTypeId;
        this.currentCategory = data.category;
        window.currentInstrument = data;
        window.lugs = Array.from(data.defaultNotes).map((note, i) => ({
            id: i + 1,
            position: i + 1,
            tunedNote: note
        }));

        // Set pitch detector mode for this instrument category
        pitchDetector.setInstrumentMode(data.category, data.minFrequency, data.maxFrequency);

        // Build the view based on category
        const isPiano = data.category === 'Piano';
        const isStringed = ['Guitar', 'Bass', 'Strings', 'Other'].includes(data.category);

        let visualizerHtml = '';
        if (isPiano) {
            pianoVisualizer.init(data.id, data.defaultNotes);
            visualizerHtml = `<div id="pianoContainer">${pianoVisualizer.render()}</div>`;
        } else if (isStringed) {
            stringVisualizer.init(data.id, data.stringCount, data.defaultNotes);
            visualizerHtml = stringVisualizer.render();
        }

        document.getElementById('app').innerHTML = `
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <h2>${data.name}</h2>
                    <p>${data.category} · ${data.stringCount} strings</p>
                    <div class="lug-status">
                        <span class="status-dot untuned"></span>
                        <span></span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                </div>
                <div class="visualizer-actions">
                    <button class="btn btn-primary" id="tuneBtn" onclick="app.toggleTuneMode()">🎤 Tune</button>
                    <button class="btn btn-secondary" onclick="app.playReferenceTone()" title="Play reference tone for each string">🔊 Play Tone</button>
                    <button class="btn btn-secondary" onclick="app.showGuide()">📖 Guide</button>
                    <button class="btn btn-secondary" onclick="app.saveSession()">💾 Save</button>
                    <button class="btn btn-secondary" onclick="app.goHome()">← Back</button>
                </div>
            </div>
            <div class="instrument-container">
                ${visualizerHtml}
                <div id="tunerGauge" class="tuner-gauge" style="display:none">
                    <div class="tuner-status" id="tunerStatus">Listening...</div>
                    <div class="tuner-note" id="tunerNote">--</div>
                    <div class="tuner-freq" id="tunerFreq">-- Hz</div>
                    <div class="tuner-bar">
                        <div class="tuner-needle" id="tunerNeedle"></div>
                    </div>
                    <div class="tuner-cents" id="tunerCents">-- ¢</div>
                </div>
            </div>`;

        this.updateProgress();
    },

    updateProgress() {
        const strings = stringVisualizer.getStrings();
        if (!strings) return;
        const tuned = strings.filter(s => s.currentNote !== null).length;
        const total = strings.length;
        const pct = (tuned / total * 100);

        const statusText = document.querySelectorAll('.lug-status span')[1];
        const progressFill = document.querySelector('.progress-fill');

        if (statusText) {
            statusText.textContent = `${tuned}/${total} tuned`;
        }
        if (progressFill) {
            progressFill.style.width = `${pct}%`;
        }
    },

    showGuide() {
        const existing = document.getElementById('guidePanel');
        if (existing) existing.remove();

        const guideDiv = document.createElement('div');
        guideDiv.id = 'guidePanel';
        guideDiv.className = 'guide-panel';
        guideDiv.innerHTML = tuningGuide.render(this.currentCategory);
        document.querySelector('.instrument-container').after(guideDiv);
    },

    async saveSession() {
        const notes = prompt('Add notes for this session (optional):');
        if (notes === null) return;

        let records = [];
        if (stringVisualizer.getInstrumentId()) {
            records = stringVisualizer.getStrings().map(s => ({ position: s.index + 1, note: s.targetNote }));
        } else if (window.lugs) {
            records = window.lugs.filter(l => l.tunedNote).map(l => ({ position: l.position, note: l.tunedNote }));
        }

        if (records.length === 0) {
            alert('No strings tuned yet!');
            return;
        }

        try {
            await apiClient.saveSession(this.currentInstrumentTypeId, records, notes);
            alert('Session saved!');
        } catch (e) {
            alert('Failed to save: ' + e.message);
        }
    },

    async playReferenceTone() {
        if (!window.lugs || window.lugs.length === 0) return;

        for (let i = 0; i < window.lugs.length; i++) {
            const lug = window.lugs[i];
            if (i > 0) await new Promise(r => setTimeout(r, 400));
            if (lug.tunedNote) {
                await tonePlayer.playNote(lug.tunedNote, 1.5);
            } else {
                await tonePlayer.playSilence();
            }
        }
    },

    async toggleTuneMode() {
        if (this.isTuningMode) {
            this.stopTuneMode();
        } else {
            await this.startTuneMode();
        }
    },

    async startTuneMode() {
        try {
            await pitchDetector.start();
        } catch (e) {
            alert(e.message);
            return;
        }

        this.isTuningMode = true;
        const tuneBtn = document.getElementById('tuneBtn');
        if (tuneBtn) {
            tuneBtn.textContent = '🔇 Stop';
            tuneBtn.classList.remove('btn-primary');
            tuneBtn.classList.add('btn-secondary');
        }

        const gauge = document.getElementById('tunerGauge');
        if (gauge) gauge.style.display = 'block';

        pitchDetector.listen((pitch) => {
            this.lastPitch = pitch;

            // Update string visualizer
            if (stringVisualizer.getInstrumentId()) {
                stringVisualizer.updateFromPitch(pitch);
                const container = document.getElementById('pianoContainer');
                if (!container) {
                    const svDiv = document.createElement('div');
                    svDiv.id = 'stringContainer';
                    svDiv.className = 'instrument-visualizer';
                    document.querySelector('.instrument-container').appendChild(svDiv);
                }
                const sc = document.getElementById('stringContainer') || document.createElement('div');
                if (!document.getElementById('stringContainer')) {
                    const newSc = document.createElement('div');
                    newSc.id = 'stringContainer';
                    newSc.className = 'instrument-visualizer';
                    document.querySelector('.instrument-container').appendChild(newSc);
                }
                // Re-render string visualizer in place
                const existingSc = document.getElementById('stringContainer');
                if (existingSc) {
                    existingSc.innerHTML = stringVisualizer.render();
                }
            }

            // Update piano visualizer
            if (pianoVisualizer.getInstrumentId()) {
                pianoVisualizer.updateFromPitch(pitch);
                const pc = document.getElementById('pianoContainer');
                if (pc) pc.innerHTML = pianoVisualizer.render();
            } else {
                pianoVisualizer.resetUndetected();
            }

            this.updateTunerUI(pitch);
            this.updateProgress();
        });
    },

    stopTuneMode() {
        this.isTuningMode = false;
        pitchDetector.stopListening();
        pitchDetector.stop();

        const tuneBtn = document.getElementById('tuneBtn');
        if (tuneBtn) {
            tuneBtn.textContent = '🎤 Tune';
            tuneBtn.classList.remove('btn-secondary');
            tuneBtn.classList.add('btn-primary');
        }

        const gauge = document.getElementById('tunerGauge');
        if (gauge) gauge.style.display = 'none';

        this.lastPitch = null;

        // Reset visualizers
        stringVisualizer.resetPitch();
        pianoVisualizer.resetUndetected();
    },

    updateTunerUI(pitch) {
        const noteEl = document.getElementById('tunerNote');
        const freqEl = document.getElementById('tunerFreq');
        const centsEl = document.getElementById('tunerCents');
        const needleEl = document.getElementById('tunerNeedle');
        const statusEl = document.getElementById('tunerStatus');

        if (!pitch || !pitch.isDetected) {
            statusEl.textContent = 'No signal — play a note!';
            noteEl.textContent = '--';
            freqEl.textContent = '-- Hz';
            centsEl.textContent = '-- ¢';
            centsEl.style.color = '#666';
            if (needleEl) needleEl.style.left = '50%';
            return;
        }

        statusEl.textContent = `Detected: ${pitch.note} (${pitch.frequency} Hz)`;
        noteEl.textContent = pitch.note;
        freqEl.textContent = `${pitch.frequency} Hz`;

        const absCents = Math.abs(pitch.cents);
        centsEl.textContent = `${pitch.cents > 0 ? '+' : ''}${pitch.cents} ¢`;
        if (absCents <= 5) {
            centsEl.style.color = '#4ade80';
        } else if (absCents <= 20) {
            centsEl.style.color = '#facc15';
        } else {
            centsEl.style.color = '#ef4444';
        }

        if (needleEl) {
            const pct = Math.max(0, Math.min(100, 50 + pitch.cents));
            needleEl.style.left = `${pct}%`;
        }
    },

    goHome() {
        if (this.isTuningMode) this.stopTuneMode();
        this.navigate('selector');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
