const Audio_FX = {
    audioCtx: null,

    init() {
        const playSilent = () => {
            if (!this.audioCtx) {
                try {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {}
            }
            document.removeEventListener('click', playSilent);
            document.removeEventListener('touchstart', playSilent);
        };
        document.addEventListener('click', playSilent);
        document.addEventListener('touchstart', playSilent);
    },

    playRoll() {
        if (!this.audioCtx || Config.state.masterVolume === 0) return;
        const ctx = this.audioCtx;
        const baseVol = Config.state.masterVolume;
        const isFast = Config.state.fastMode;
        const duration = isFast ? 0.4 : Math.min(2.0, 1.4 + Config.state.diceCount * 0.05);

        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3 * baseVol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    },

    playSuccess() {
        if (!this.audioCtx || Config.state.masterVolume === 0) return;
        const ctx = this.audioCtx;
        const baseVol = Config.state.masterVolume;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.2 * baseVol, ctx.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.6);
        });
    },

    playFailure() {
        if (!this.audioCtx || Config.state.masterVolume === 0) return;
        const ctx = this.audioCtx;
        const baseVol = Config.state.masterVolume;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2 * baseVol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    },

    playCritical() {
        if (!this.audioCtx || Config.state.masterVolume === 0) return;
        const ctx = this.audioCtx;
        const baseVol = Config.state.masterVolume;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.25 * baseVol, ctx.currentTime + i * 0.08 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.8);
        });
    }
};