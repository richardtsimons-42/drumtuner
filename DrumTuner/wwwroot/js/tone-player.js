class TonePlayer {
    constructor() {
        this.audioContext = null;
        this.frequencies = {};
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    async loadFrequencies() {
        try {
            const resp = await fetch('/api/notes/frequencies');
            this.frequencies = await resp.json();
        } catch (e) {
            console.error('Failed to load frequencies:', e);
        }
    }

    getFrequency(noteName) {
        return this.frequencies[noteName] || 440;
    }

    playNote(noteName, duration = 1.5) {
        this.initAudio();
        const freq = this.getFrequency(noteName);
        if (!freq) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        // Envelope to avoid clicking
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    playSilence() {
        this.initAudio();
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }
}

window.tonePlayer = new TonePlayer();
