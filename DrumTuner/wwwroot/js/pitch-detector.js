// Pitch Detector — microphone input + autocorrelation-based pitch detection
const pitchDetector = {
    audioContext: null,
    analyser: null,
    mediaStream: null,
    sourceNode: null,
    filterNode: null,
    rafId: null,
    onTick: null, // callback(data) called every frame during listening

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

        // Create a low-pass filter to focus on the fundamental frequency of drums
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 500;

        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();

        // Connect: source -> filter -> analyser (don't connect to destination — that would cause feedback)
        this.sourceNode.connect(this.filterNode);
        this.filterNode.connect(this.analyser);

        this.analyser.fftSize = 4096;
        this.analyser.smoothingTimeConstant = 0.8;
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

        if (correlation.rms < 0.01) return { frequency: null, note: null, cents: null, isDetected: false, rms: 0 };

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
            isDetected: correlation.rms > 0.015 && frequency >= 50 && frequency <= 2000,
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

        // Minimum period: sample rate / max frequency (50 Hz)
        const minOffset = Math.floor(this.audioContext.sampleRate / 2000);
        // Maximum period: sample rate / min frequency (50 Hz)
        const maxOffset = Math.floor(this.audioContext.sampleRate / 50);

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
