const Dice = {
    rollSingle(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    classifyResult(rolls, sumRolls, total) {
        const sides = Config.state.currentDice;
        const count = Config.state.diceCount;
        const isCheck = Config.state.currentMode === 'check';
        const dc = parseInt(document.getElementById('dcInput').value) || 15;

        if (isCheck) {
            // В режиме проверки используем D20
            const r = rolls[0];
            if (r === 20) return 'nat20';
            if (r === 1) return 'nat1';
            return total >= dc ? 'success' : 'failure';
        }

        // Свободный режим
        if (sides === 100) {
            if (rolls[0] === 100) return 'nat100';
            if (rolls[0] === 1) return 'nat1';
            return 'neutral';
        }

        // Все максимальные?
        const allMax = rolls.every(r => r === sides);
        if (allMax) return 'nat20';

        const allMin = rolls.every(r => r === 1);
        if (allMin) return 'nat1';

        return 'neutral';
    },

    getResultLabel(resultType) {
        const isCheck = Config.state.currentMode === 'check';
        const count = Config.state.diceCount;

        if (isCheck) {
            switch (resultType) {
                case 'nat20': return 'Критический успех!';
                case 'nat1': return 'Критический провал';
                case 'success': return 'Успех';
                case 'failure': return 'Провал';
            }
        } else {
            switch (resultType) {
                case 'nat20': return count > 1 ? 'Все максимум!' : 'Натуральная 20!';
                case 'nat100': return 'Натуральная 100!';
                case 'nat1': return count > 1 ? 'Все единицы!' : 'Натуральная 1';
                default: return 'Бросок завершён';
            }
        }
    },

    getResultClass(resultType) {
        switch (resultType) {
            case 'nat20':
            case 'nat100': return 'nat20';
            case 'success': return 'success';
            case 'failure':
            case 'nat1': return 'failure';
            default: return 'neutral';
        }
    },

    getLabelClass(resultType) {
        switch (resultType) {
            case 'nat20':
            case 'nat100': return 'critical';
            case 'success': return 'success';
            case 'failure':
            case 'nat1': return 'failure';
            default: return 'neutral';
        }
    },

    async roll() {
        if (Config.state.isRolling) return;
        Config.state.isRolling = true;

        const rollBtn = document.getElementById('rollBtn');
        rollBtn.disabled = true;

        UI.clearResult();

        const sides = Config.state.currentDice;
        const count = Config.state.currentMode === 'check' ? 1 : Config.state.diceCount;
        const modifier = Config.state.currentMode === 'check'
            ? (parseInt(document.getElementById('modInput').value) || 0)
            : 0;

        // Генерация бросков
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(this.rollSingle(sides));
        }
        const sumRolls = rolls.reduce((a, b) => a + b, 0);
        const total = sumRolls + modifier;

        // Анимация
        const diceContainer = document.getElementById('diceContainer');
        const diceNumber = document.getElementById('diceNumber');
        const useRocking = sides === 4 || sides === 10 || sides === 100;
        const isFast = Config.state.fastMode;

        let animClass;
        if (useRocking) {
            animClass = isFast ? 'rocking-fast' : 'rocking';
        } else {
            animClass = isFast ? 'rolling-fast' : 'rolling';
        }
        diceContainer.classList.add(animClass);

        Audio_FX.playRoll();

        const timings = Config.getTimings();

        // Превью случайных чисел во время броска
        diceNumber.classList.add('visible');
        const previewInterval = setInterval(() => {
            diceNumber.textContent = this.rollSingle(sides);
        }, isFast ? 60 : 90);

        await new Promise(r => setTimeout(r, timings.roll));

        clearInterval(previewInterval);
        diceContainer.classList.remove(animClass);

        // Финальное число
        const displayNum = count === 1 ? rolls[0] : sumRolls;
        diceNumber.textContent = displayNum;

        const resultType = this.classifyResult(rolls, sumRolls, total);

        if (resultType === 'nat20' || resultType === 'nat100') {
            diceNumber.classList.add('nat20');
        } else if (resultType === 'nat1') {
            diceNumber.classList.add('nat1');
        }

        // Эффекты
        Effects.createSparks(resultType);
        Effects.showBurstRing(resultType);
        Effects.showFlash(resultType);

        if (resultType === 'nat20' || resultType === 'nat100') {
            Effects.shakeContainer(true);
            Audio_FX.playCritical();
        } else if (resultType === 'success') {
            Audio_FX.playSuccess();
        } else if (resultType === 'failure' || resultType === 'nat1') {
            Effects.shakeContainer(false);
            Audio_FX.playFailure();
        }

        // DC-кольцо
        if (Config.state.currentMode === 'check' && sides === 20) {
            const dc = parseInt(document.getElementById('dcInput').value) || 15;
            const progress = Math.min(1, total / 30);
            const ringColor = total >= dc ? 'success' : 'failure';
            UI.updateDCRing(progress, ringColor);
        }

        // Показ результата
        await new Promise(r => setTimeout(r, timings.resultDelay));

        const resultTotal = document.getElementById('resultTotal');
        const resultBreakdown = document.getElementById('resultBreakdown');
        const resultLabel = document.getElementById('resultLabel');

        const resultClass = this.getResultClass(resultType);
        const labelClass = this.getLabelClass(resultType);

        if (Config.state.currentMode === 'check') {
            resultTotal.textContent = total;
        } else {
            resultTotal.textContent = sumRolls;
        }
        resultTotal.classList.add('visible', resultClass);

        // Breakdown
        if (Config.state.currentMode === 'check') {
            const modStr = modifier === 0
                ? ''
                : ` <span class="mod-val ${modifier < 0 ? 'neg' : ''}">${modifier >= 0 ? '+' : ''}${modifier}</span>`;
            resultBreakdown.innerHTML = `<span class="roll-val">[${rolls[0]}]</span>${modStr}`;
        } else {
            if (count === 1) {
                resultBreakdown.innerHTML = `<span class="roll-val">D${sides} = ${rolls[0]}</span>`;
            } else {
                const chips = rolls.map(r => {
                    let chipClass = 'roll-chip';
                    if (r === sides) chipClass += ' crit-max';
                    else if (r === 1) chipClass += ' crit-min';
                    return `<span class="${chipClass}">${r}</span>`;
                }).join('');
                resultBreakdown.innerHTML = `
                    <div>${count}D${sides} = <span class="roll-val">${sumRolls}</span></div>
                    <div class="rolls-list">${chips}</div>
                `;
            }
        }
        resultBreakdown.classList.add('visible');

        resultLabel.textContent = this.getResultLabel(resultType);
        resultLabel.classList.add('visible', labelClass);

        // История
        UI.addToHistory(rolls, sumRolls, total, modifier, resultType, sides, count);

        Config.state.isRolling = false;
        rollBtn.disabled = false;
    }
};