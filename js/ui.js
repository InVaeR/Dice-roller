const UI = {
    getDifficultyText(dc) {
        if (dc <= 5) return 'Очень легко';
        if (dc <= 10) return 'Легко';
        if (dc <= 15) return 'Средне';
        if (dc <= 20) return 'Сложно';
        if (dc <= 25) return 'Очень сложно';
        return 'Почти невозможно';
    },

    updateModBadge() {
        const badge = document.getElementById('modBadge');
        const modVal = parseInt(document.getElementById('modInput').value) || 0;

        if (Config.state.currentMode !== 'check') {
            badge.classList.remove('visible');
            return;
        }

        badge.textContent = (modVal >= 0 ? '+' : '') + modVal;
        badge.classList.toggle('negative', modVal < 0);
        badge.classList.add('visible');
    },

    updateMultiBadge() {
        const badge = document.getElementById('multiBadge');
        if (Config.state.currentMode === 'free' && Config.state.diceCount > 1) {
            badge.textContent = '×' + Config.state.diceCount;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    },

    updateDCRing(progress = 0, color = null) {
        const ring = document.getElementById('dcRingFill');
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - progress);
        ring.style.strokeDashoffset = offset;
        ring.classList.remove('success', 'failure');
        if (color) ring.classList.add(color);
    },

    updateDCRingVisibility() {
        const ring = document.getElementById('dcRing');
        const isCheck = Config.state.currentMode === 'check' && Config.state.currentDice === 20;
        ring.classList.toggle('hidden', !isCheck);
    },

    updateCheckDisplay() {
        const skillInput = document.getElementById('skillInput');
        const modInput = document.getElementById('modInput');
        const dcInput = document.getElementById('dcInput');

        const skill = skillInput.value || 'Навык';
        const mod = parseInt(modInput.value) || 0;
        const dc = parseInt(dcInput.value) || 15;

        document.getElementById('displaySkillName').textContent = skill;

        const modBadge = document.getElementById('displayMod');
        modBadge.textContent = (mod >= 0 ? '+' : '') + mod;
        modBadge.classList.remove('positive', 'negative');
        if (mod > 0) modBadge.classList.add('positive');
        if (mod < 0) modBadge.classList.add('negative');

        document.getElementById('displayDC').textContent = 'DC ' + dc;
        document.getElementById('dcHint').textContent = this.getDifficultyText(dc);

        this.updateModBadge();
    },

    updateFreeDisplay() {
        const text = document.getElementById('freeDisplayText');
        const count = Config.state.diceCount;
        const sides = Config.state.currentDice;
        if (count === 1) {
            text.textContent = `Простой бросок D${sides}`;
        } else {
            text.textContent = `Бросок ${count}D${sides}`;
        }
    },

    updateDiceImage() {
        const img = document.getElementById('diceImage');
        const sides = Config.state.currentDice;
        img.src = Config.DICE_IMAGES[sides];
        img.alt = 'D' + sides;
        document.getElementById('diceTypeLabel').textContent = 'D' + sides;
    },

    updateCountSelector() {
        document.getElementById('countValue').textContent = Config.state.diceCount;
        document.getElementById('countSuffix').textContent = '×D' + Config.state.currentDice;
        document.getElementById('countMinus').disabled = Config.state.diceCount <= Config.MIN_DICE_COUNT;
        document.getElementById('countPlus').disabled = Config.state.diceCount >= Config.MAX_DICE_COUNT;
        this.updateMultiBadge();
    },

    setMode(mode) {
        if (Config.state.isRolling) return;
        Config.state.currentMode = mode;

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const isCheck = mode === 'check';
        const isFree = mode === 'free';

        document.getElementById('checkDisplay').classList.toggle('hidden', !isCheck);
        document.getElementById('checkDisplay').classList.toggle('visible', isCheck);
        document.getElementById('freeDisplay').classList.toggle('hidden', !isFree);
        document.getElementById('freeDisplay').classList.toggle('visible', isFree);

        document.getElementById('diceSelector').classList.toggle('hidden', !isFree);
        document.getElementById('countSelector').classList.toggle('hidden', !isFree);

        if (isCheck) {
            Config.state.currentDice = 20;
            Config.state.diceCount = 1;
            this.updateDiceImage();
        } else {
            this.updateFreeDisplay();
            this.updateCountSelector();
        }

        this.updateDCRingVisibility();
        this.updateModBadge();
        this.updateMultiBadge();
        this.clearResult();
    },

    setDiceType(sides) {
        if (Config.state.isRolling) return;
        Config.state.currentDice = sides;
        document.querySelectorAll('.dice-type-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.sides) === sides);
        });
        this.updateDiceImage();
        this.updateFreeDisplay();
        this.updateCountSelector();
        this.updateDCRingVisibility();
        this.clearResult();
    },

    changeDiceCount(delta) {
        if (Config.state.isRolling) return;
        const next = Config.state.diceCount + delta;
        if (next < Config.MIN_DICE_COUNT || next > Config.MAX_DICE_COUNT) return;
        Config.state.diceCount = next;
        this.updateCountSelector();
        this.updateFreeDisplay();
    },

    clearResult() {
        document.getElementById('resultTotal').className = 'result-total';
        document.getElementById('resultTotal').textContent = '';
        document.getElementById('resultBreakdown').className = 'result-breakdown';
        document.getElementById('resultBreakdown').innerHTML = '';
        document.getElementById('resultLabel').className = 'result-label';
        document.getElementById('resultLabel').textContent = '';
        document.getElementById('diceNumber').classList.remove('visible', 'nat20', 'nat1');
        document.getElementById('diceNumber').textContent = '?';
        UI.updateDCRing(0);
    },

    addToHistory(rolls, sumRolls, total, modifier, resultType, sides, count) {
        const histContainer = document.getElementById('rollHistory');
        let statusClass, label;

        if (Config.state.currentMode === 'check') {
            switch (resultType) {
                case 'nat20': statusClass = 'nat20'; label = 'КРИТ!'; break;
                case 'nat1': statusClass = 'failure'; label = 'КРИТ ПРОВАЛ'; break;
                case 'success': statusClass = 'success'; label = 'Успех'; break;
                case 'failure': statusClass = 'failure'; label = 'Провал'; break;
            }
        } else {
            switch (resultType) {
                case 'nat20': statusClass = 'nat20'; label = count > 1 ? 'Все макс!' : 'Нат 20!'; break;
                case 'nat100': statusClass = 'nat20'; label = 'Нат 100!'; break;
                case 'nat1': statusClass = 'failure'; label = count > 1 ? 'Все 1' : 'Нат 1'; break;
                default: statusClass = 'neutral'; label = 'Бросок'; break;
            }
        }

        let displayValue, detailText;
        if (Config.state.currentMode === 'check') {
            displayValue = total;
            detailText = `[${rolls[0]}]${modifier >= 0 ? '+' : ''}${modifier}`;
        } else {
            displayValue = sumRolls;
            if (count === 1) {
                detailText = `D${sides}: [${rolls[0]}]`;
            } else {
                const rollsStr = rolls.length <= 8 ? rolls.join(',') : rolls.slice(0, 8).join(',') + '…';
                detailText = `${count}D${sides}: [${rollsStr}]`;
            }
        }

        const item = document.createElement('div');
        item.className = `history-item ${statusClass}`;
        item.innerHTML = `
            <span class="hist-result">${displayValue}</span>
            <span style="margin-left:6px">${detailText} — ${label}</span>
        `;

        histContainer.insertBefore(item, histContainer.firstChild);

        while (histContainer.children.length > 10) {
            histContainer.removeChild(histContainer.lastChild);
        }
    }
};