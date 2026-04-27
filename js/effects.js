const Effects = {
    initBgParticles() {
        const container = document.getElementById('bgParticles');
        const count = 30;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'bg-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = '100%';
            p.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
            p.style.setProperty('--delay', (Math.random() * 15) + 's');
            p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
            container.appendChild(p);
        }
    },

    createSparks(resultType) {
        const container = document.getElementById('sparkContainer');
        container.innerHTML = '';
        const isFast = Config.state.fastMode;

        let count, colorClass;
        switch (resultType) {
            case 'nat20': count = isFast ? 12 : 20; colorClass = 'gold'; break;
            case 'nat100': count = isFast ? 14 : 24; colorClass = 'gold'; break;
            case 'success': count = isFast ? 8 : 12; colorClass = 'green'; break;
            case 'failure': count = isFast ? 6 : 10; colorClass = 'red'; break;
            case 'nat1': count = isFast ? 10 : 16; colorClass = 'red'; break;
            default: count = isFast ? 5 : 8; colorClass = 'white';
        }

        const spread = Config.getTimings().sparkRange;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = `spark ${colorClass}`;
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = 80 + Math.random() * 80;
            spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
            spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
            container.appendChild(spark);
            setTimeout(() => spark.classList.add('animate'), Math.random() * spread);
        }
    },

    showBurstRing(resultType) {
        const ring = document.getElementById('burstRing');
        ring.className = 'burst-ring';
        switch (resultType) {
            case 'nat20':
            case 'nat100': ring.classList.add('nat20'); break;
            case 'success': ring.classList.add('success'); break;
            case 'failure':
            case 'nat1': ring.classList.add('failure'); break;
            default: ring.classList.add('neutral'); break;
        }
        // Reflow
        ring.offsetHeight;
        ring.classList.add('animate');
    },

    showFlash(resultType) {
        const flash = document.getElementById('critFlash');
        flash.className = 'crit-flash';
        switch (resultType) {
            case 'nat20':
            case 'nat100': flash.classList.add('nat20'); break;
            case 'success': flash.classList.add('success'); break;
            case 'failure':
            case 'nat1': flash.classList.add('failure'); break;
        }
    },

    shakeContainer(strong = false) {
        const container = document.getElementById('rollContainer');
        const isFast = Config.state.fastMode;
        const dur = isFast ? 0.25 : 0.5;
        container.style.animation = `shake ${dur}s`;
        setTimeout(() => { container.style.animation = ''; }, dur * 1000);
    }
};