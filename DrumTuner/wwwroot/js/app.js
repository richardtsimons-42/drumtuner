// Main App — Navigation, State Management & Instrument Tuning
const app = {
    currentPage: 'selector',
    currentInstrumentId: null,
    currentInstrumentTypeId: null,
    currentCategory: null,
    isTuningMode: false,
    lastPitch: null,

    async init() {
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

        let visualizerHtml = '';
        if (isPiano) {
            pianoVisualizer.init(data.id, data.defaultNotes);
            visualizerHtml = `<div id="pianoContainer">${pianoVisualizer.render()}</div>`;
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
                    <button class="btn btn-secondary" onclick="app.showGuide()">📖 Guide</button>
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
        const pianoContainer = document.getElementById('pianoContainer');
        if (!pianoContainer) return;

        const whiteKeys = pianoContainer.querySelectorAll('.white-key');
        let tuned = 0;
        let total = whiteKeys.length;

        whiteKeys.forEach(key => {
            const info = pianoVisualizer.activeKeys?.[key.dataset.note];
            if (info && info.isDetected) tuned++;
        });

        const pct = total > 0 ? (tuned / total * 100) : 0;

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

            // Update piano visualizer
            if (pianoVisualizer.getInstrumentId()) {
                pianoVisualizer.updateFromPitch(pitch);
                const pc = document.getElementById('pianoContainer');
                if (pc) pc.innerHTML = pianoVisualizer.render();
            } else {
                pianoVisualizer.resetUndetected();
            }

            this.updateTunerUI(pitch);
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
