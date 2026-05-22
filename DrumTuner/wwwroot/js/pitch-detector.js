// Pitch Detector — microphone input + autocorrelation-based pitch detection
const pitchDetector = {
    audioContext: null,
    analyser: null,
    mediaStream: null,
    sourceNode: null,
    filterNode: null,
    rafId: null,
    onTick: null, // callback(data) called every frame during listening

    // Instrument-specific configuration
    config: {
        minFreq: 40,      // Default minimum frequency
        maxFreq: 5000,    // Default maximum frequency
        filterCutoff: 5000, // Filter cutoff for preprocessing
        smoothing: 0.7,     // Smoothing factor
        sensitivityThreshold: 0.01 // Minimum RMS to detect signal
    },

    async start() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.error('[PitchDetector] Mic access denied:', e);
            throw new Error('Microphone access denied. Please allow mic access and reload.');
        }

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create a low-pass filter to focus on the fundamental frequency
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = this.config.filterCutoff;

        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();

        // Connect: source -> filter -> analyser (don't connect to destination — that would cause feedback)
        this.sourceNode.connect(this.filterNode);
        this.filterNode.connect(this.analyser);

        this.analyser.fftSize = 4096;
        this.analyser.smoothingTimeConstant = this.config.smoothing;
    },

    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
        if (this.filterNode) {
            this.filterNode.disconnect();
            this.filterNode = null;
        }
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
    },

    // Set instrument mode to adjust detection parameters
    setInstrumentMode(category, minFreq, maxFreq) {
        const modes = {
            'Guitar': { filterCutoff: 2000, smoothing: 0.75, sensitivityThreshold: 0.008 },
            'Bass': { filterCutoff: 800, smoothing: 0.8, sensitivityThreshold: 0.012 },
            'Piano': { filterCutoff: 6000, smoothing: 0.65, sensitivityThreshold: 0.005 },
            'Strings': { filterCutoff: 3000, smoothing: 0.7, sensitivityThreshold: 0.008 },
            'Drums': { filterCutoff: 500, smoothing: 0.85, sensitivityThreshold: 0.02 },
            'Percussion': { filterCutoff: 600, smoothing: 0.8, sensitivityThreshold: 0.015 },
            'Other': { filterCutoff: 4000, smoothing: 0.7, sensitivityThreshold: 0.01 }
        };

        const mode = modes[category] || modes['Other'];
        this.config.filterCutoff = mode.filterCutoff;
        this.config.smoothing = mode.smoothing;
        this.config.sensitivityThreshold = mode.sensitivityThreshold;

        // Update filter if already started
        if (this.filterNode) {
            this.filterNode.frequency.value = mode.filterCutoff;
        }
    },

    // Get pitch using autocorrelation on the raw waveform
    getPitch() {
        if (!this.analyser) return null;

        const bufferLength = this.analyser.fftSize;
        const domainData = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(domainData);

        // Calculate RMS level (signal strength)
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
            sumSquares += domainData[i] * domainData[i];
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Autocorrelation
        const correlation = this._autocorrelation(domainData, bufferLength);

        if (correlation.rms < this.config.sensitivityThreshold) {
            return { frequency: null, note: null, cents: null, isDetected: false, rms: 0 };
        }

        const period = correlation.bestOffset + 1;
        const frequency = this.audioContext.sampleRate / period;

        // Quantize to nearest musical note
        const midiNumber = 69 + 12 * Math.log2(frequency / 440);
        const roundedMidi = Math.round(midiNumber);
        const cents = Math.round((midiNumber - roundedMidi) * 100);

        // Convert MIDI to note name
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = noteNames[roundedMidi % 12] + Math.floor(roundedMidi / 12 - 1);

        return {
            frequency: Math.round(frequency * 10) / 10,
            note: noteName,
            cents: cents,
            isDetected: correlation.rms > this.config.sensitivityThreshold &&
                        frequency >= this.config.minFreq &&
                        frequency <= this.config.maxFreq,
            rms: correlation.rms
        };
    },

    _autocorrelation(buf, len) {
        let bestOffset = -1;
        let bestCorrelation = 0;
        let rms = 0;

        // Find RMS of the signal
        for (let i = 0; i < len; i++) {
            rms += buf[i] * buf[i];
        }
        rms = Math.sqrt(rms / len);

        // Minimum period: sample rate / max frequency
        const minOffset = Math.floor(this.audioContext.sampleRate / this.config.maxFreq);
        // Maximum period: sample rate / min frequency
        const maxOffset = Math.floor(this.audioContext.sampleRate / this.config.minFreq);

        let correlationSum = 0;
        for (let i = 0; i < len; i++) {
            correlationSum += buf[i] * buf[i];
        }
        const energy = correlationSum / len;

        if (energy < 0.0001) return { bestOffset: -1, rms: 0 };

        // Correlate with delayed version of itself
        for (let offset = minOffset; offset < Math.min(maxOffset, len / 2); offset++) {
            let correlation = 0;
            for (let i = 0; i < len - offset; i++) {
                correlation += buf[i] * buf[i + offset];
            }
            correlation /= len - offset;

            // Normalize by energy
            if (energy > 0) {
                correlation /= energy;
            }

            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        }

        return { bestOffset, rms: Math.sqrt(bestCorrelation * energy) };
    },

    // Start the processing loop
    listen(callback) {
        this.onTick = callback;
        const tick = () => {
            const pitch = this.getPitch();
            if (pitch && this.onTick) {
                this.onTick(pitch);
            }
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    },

    // Stop the processing loop
    stopListening() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.onTick = null;
    }
};
