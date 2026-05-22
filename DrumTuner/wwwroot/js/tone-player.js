class TonePlayer {
    constructor() {
        this.audioContext = null;
        this.frequencies = {};
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    async loadFrequencies() {
        try {
            const resp = await fetch('/api/notes/frequencies');
            this.frequencies = await resp.json();
            console.log('[TonePlayer] Loaded', Object.keys(this.frequencies).length, 'frequencies');
        } catch (e) {
            console.error('[TonePlayer] Failed to load frequencies:', e);
        }
    }

    getFrequency(noteName) {
        const freq = this.frequencies[noteName];
        if (!freq) {
            console.warn('[TonePlayer] No frequency for note:', noteName, '| available keys:', Object.keys(this.frequencies).slice(0, 5));
        }
        return freq || 440;
    }

    async playNote(noteName, duration = 1.5) {
        const ctx = await this.ensureAudioContext();
        console.log('[TonePlayer] playNote:', noteName, '| freq:', this.getFrequency(noteName));

        const freq = this.getFrequency(noteName);
        if (!freq) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Envelope to avoid clicking
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    async playSilence() {
        const ctx = await this.ensureAudioContext();
        console.log('[TonePlayer] playSilence');
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    async playTest() {
        console.log('[TonePlayer] playTest — A4 = 440Hz');
        const ctx = await this.ensureAudioContext();
        const freq = 440;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.0);
    }
}

window.tonePlayer = new TonePlayer();
