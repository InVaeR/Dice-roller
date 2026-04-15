// ==================== СОСТОЯНИЕ ====================
let isRolling = false;
let currentMode = 'check'; // 'check' | 'free'
let currentDice = 20;      // текущий тип кубика
const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];
const DICE_IMAGES = {
    4: 'res/images/dices/d4.png',
    6: 'res/images/dices/d6.png',
    8: 'res/images/dices/d8.png',
    10: 'res/images/dices/d10.png',
    12: 'res/images/dices/d12.png',
    20: 'res/images/dices/d20.png',
    100: 'res/images/dices/d100.png'
};

// Сохранённые навыки (загружаются из localStorage)
let savedSkills = {};
let masterVolume = 0.5; // 0-1 (50% по умолчанию)

// ==================== ГРОМКОСТЬ ====================
function updateVolume(val) {
    masterVolume = val / 100;
    document.getElementById('volumeValue').textContent = val + '%';
    try { localStorage.setItem('diceRoller_volume', val); } catch (e) {}
}

function loadVolume() {
    try {
        const v = localStorage.getItem('diceRoller_volume');
        if (v !== null) {
            masterVolume = parseInt(v) / 100;
            document.getElementById('volumeSlider').value = v;
            document.getElementById('volumeValue').textContent = v + '%';
        }
    } catch (e) {}
}

// ==================== ТЕМА ====================
let currentTheme = 'dark';

function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');

    if (currentTheme === 'dark') {
        body.classList.add('light-theme');
        currentTheme = 'light';
        icon.textContent = '🌙';
        label.textContent = 'Тёмная';
    } else {
        body.classList.remove('light-theme');
        currentTheme = 'dark';
        icon.textContent = '☀️';
        label.textContent = 'Светлая';
    }

    try { localStorage.setItem('diceRoller_theme', currentTheme); } catch (e) {}
}

function loadTheme() {
    try {
        const saved = localStorage.getItem('diceRoller_theme');
        if (saved === 'light') {
            document.body.classList.add('light-theme');
            currentTheme = 'light';
            document.getElementById('themeIcon').textContent = '🌙';
            document.getElementById('themeLabel').textContent = 'Тёмная';
        }
    } catch (e) {}
}

// ==================== СОХРАНЕНИЕ / ЗАГРУЗКА ====================
function loadSavedSkills() {
    try {
        const data = localStorage.getItem('diceRoller_skills');
        if (data) savedSkills = JSON.parse(data);
    } catch (e) {
        savedSkills = {};
    }
    updateSkillSelectLabels();
}

function saveSkillToStorage(skillName, mod) {
    savedSkills[skillName] = { mod };
    try {
        localStorage.setItem('diceRoller_skills', JSON.stringify(savedSkills));
    } catch (e) { /* квота исчерпана — игнорируем */ }
    updateSkillSelectLabels();
}

function updateSkillSelectLabels() {
    const select = document.getElementById('skillSelect');
    const groups = select.querySelectorAll('optgroup');
    groups.forEach(group => {
        group.querySelectorAll('option').forEach(opt => {
            const val = opt.value;
            if (val && savedSkills[val] !== undefined) {
                const m = savedSkills[val].mod;
                opt.textContent = val + ' (' + (m >= 0 ? '+' : '') + m + ')';
            } else {
                opt.textContent = val;
            }
        });
    });
    // Обновляем выбранный элемент
    const skillInput = document.getElementById('skillInput');
    const currentSkill = skillInput.value.trim();
    if (savedSkills[currentSkill]) {
        select.value = currentSkill;
    } else {
        select.value = '';
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function init() {
    loadSavedSkills();
    loadVolume();
    loadTheme();
    createBgParticles();
    updateDCHint();
    updateDisplay();
}

function createBgParticles() {
    const container = document.getElementById('bgParticles');
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.className = 'bg-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = (80 + Math.random() * 20) + '%';
        p.style.setProperty('--dur', (7 + Math.random() * 8) + 's');
        p.style.setProperty('--delay', (Math.random() * 10) + 's');
        if (Math.random() > 0.7) {
            p.style.width = '3px';
            p.style.height = '3px';
            p.style.background = 'rgba(255, 200, 100, 0.15)';
        }
        container.appendChild(p);
    }
}

function updateDCHint() {
    const dc = parseInt(document.getElementById('dcInput').value) || 15;
    const hint = document.getElementById('dcHint');
    if (dc <= 5) hint.textContent = 'Очень лёгкая проверка';
    else if (dc <= 10) hint.textContent = 'Лёгкая проверка';
    else if (dc <= 14) hint.textContent = 'Умеренная проверка';
    else if (dc <= 17) hint.textContent = 'Средняя сложность';
    else if (dc <= 20) hint.textContent = 'Сложная проверка';
    else if (dc <= 24) hint.textContent = 'Очень сложная проверка';
    else hint.textContent = 'Почти невозможно';
}

// ==================== РЕЖИМЫ ====================
function setMode(mode) {
    currentMode = mode;

    document.getElementById('modeCheck').classList.toggle('active', mode === 'check');
    document.getElementById('modeFree').classList.toggle('active', mode === 'free');

    const checkDisplay = document.getElementById('checkDisplay');
    const freeDisplay = document.getElementById('freeDisplay');
    const dcRing = document.getElementById('dcRing');
    const diceSelector = document.getElementById('diceSelector');

    if (mode === 'check') {
        checkDisplay.classList.remove('hidden');
        checkDisplay.classList.add('visible');
        freeDisplay.classList.remove('visible');
        freeDisplay.classList.add('hidden');
        dcRing.classList.remove('hidden');
        diceSelector.classList.remove('visible');
        diceSelector.classList.add('hidden');
        // В режиме проверки всегда D20
        selectDice(20);
        updateDisplay();
    } else {
        checkDisplay.classList.remove('visible');
        checkDisplay.classList.add('hidden');
        freeDisplay.classList.remove('hidden');
        freeDisplay.classList.add('visible');
        dcRing.classList.add('hidden');
        diceSelector.classList.remove('hidden');
        diceSelector.classList.add('visible');
    }

    // Сброс результата при смене режима
    resetResult();
}

// ==================== ВЫБОР КУБИКА ====================
function selectDice(sides) {
    currentDice = sides;

    // Обновляем активную кнопку
    document.querySelectorAll('.dice-type-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.sides) === sides);
    });

    // Обновляем изображение и лейбл
    document.getElementById('diceImage').src = DICE_IMAGES[sides];
    document.getElementById('diceImage').alt = 'D' + sides;
    document.getElementById('diceTypeLabel').textContent = 'D' + sides;

    // Сброс результата
    resetResult();
}

// ==================== DISPLAY UPDATE ====================
function updateDisplay() {
    const skill = document.getElementById('skillInput').value.trim() || 'Навык';
    let mod = parseInt(document.getElementById('modInput').value) || 0;
    let dc = parseInt(document.getElementById('dcInput').value) || 15;

    // Ограничения
    if (mod > 20) { mod = 20; document.getElementById('modInput').value = 20; }
    if (mod < -10) { mod = -10; document.getElementById('modInput').value = -10; }
    if (dc > 30) { dc = 30; document.getElementById('dcInput').value = 30; }
    if (dc < 1) { dc = 1; document.getElementById('dcInput').value = 1; }

    document.getElementById('displaySkillName').textContent = skill;

    const modEl = document.getElementById('displayMod');
    modEl.textContent = (mod >= 0 ? '+' : '') + mod;
    modEl.className = 'display-badge-value' + (mod > 0 ? ' positive' : mod < 0 ? ' negative' : '');

    document.getElementById('displayDC').textContent = 'DC ' + dc;

    updateDCHint();

    // Автосохранение модификатора (только если навык не дефолтный)
    if (skill !== 'Навык' && currentMode === 'check') {
        saveSkillToStorage(skill, mod);
    }
}

// ==================== SETTINGS TOGGLE ====================
function toggleSettings() {
    const overlay = document.getElementById('settingsOverlay');
    const modal = document.getElementById('settingsModal');
    const isOpen = modal.classList.contains('open');
    if (isOpen) {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        overlay.classList.add('open');
        modal.classList.add('open');
        updateSkillSelectLabels();
    }
}

function closeSettingsOnOverlay(event) {
    if (event.target === event.currentTarget) {
        toggleSettings();
    }
}

// ==================== SKILL SELECT ====================
function onSkillSelect() {
    const select = document.getElementById('skillSelect');
    const skillInput = document.getElementById('skillInput');
    if (select.value) {
        skillInput.value = select.value;
        loadSavedSkillValues(select.value);
    }
}

function resetSavedSkills() {
    if (Object.keys(savedSkills).length === 0) return;
    savedSkills = {};
    try { localStorage.removeItem('diceRoller_skills'); } catch (e) {}
    // Сброс текущих значений
    document.getElementById('modInput').value = 0;
    document.getElementById('dcInput').value = 15;
    document.getElementById('skillSelect').value = '';
    updateDisplay();
    updateSkillSelectLabels();
}

function loadSavedSkillValues(skillName) {
    const modInput = document.getElementById('modInput');

    if (savedSkills[skillName]) {
        const saved = savedSkills[skillName];
        modInput.value = saved.mod;
        modInput.classList.add('loaded');
        // Убираем подсветку через 1.5с
        setTimeout(() => {
            modInput.classList.remove('loaded');
        }, 1500);
    } else {
        // Нет сохранённых — сброс дефолтного значения
        modInput.value = 0;
    }
    updateDisplay();
}

// ==================== GETTERS ====================
function getModifier() {
    return parseInt(document.getElementById('modInput').value) || 0;
}
function getDC() {
    return parseInt(document.getElementById('dcInput').value) || 15;
}
function getSkillName() {
    return document.getElementById('skillInput').value.trim() || 'Навык';
}

// ==================== ЗВУКИ (Web Audio API) ====================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playRollSound() {
    ensureAudio();
    const now = audioCtx.currentTime;
    for (let i = 0; i < 9; i++) {
        const time = now + i * 0.13 + Math.random() * 0.06;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 700 + Math.random() * 1400;
        filter.Q.value = 3;

        osc.type = 'triangle';
        osc.frequency.value = 180 + Math.random() * 500;

        const vol = 0.4 * masterVolume * Math.max(0.2, 1 - i * 0.1);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.07);
    }
}

function playResultSound(type) {
    ensureAudio();
    const now = audioCtx.currentTime;

    if (type === 'nat20' || type === 'nat100') {
        const freqs = [261.6, 329.6, 392, 523.3, 659.3, 784];
        freqs.forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = i < 3 ? 'sine' : 'triangle';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0, now + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.25 * masterVolume, now + i * 0.07 + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + 2.2);
        });
    } else if (type === 'nat1') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.9);
        gain.gain.setValueAtTime(0.35 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        const flt = audioCtx.createBiquadFilter();
        flt.type = 'lowpass'; flt.frequency.value = 500;
        osc.connect(flt); flt.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 1);
    } else if (type === 'success') {
        [523.3, 659.3, 784].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.25 * masterVolume, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now + i * 0.1); osc.stop(now + 1);
        });
    } else if (type === 'failure') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.4);
        gain.gain.setValueAtTime(0.2 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.6);
    } else {
        // neutral (free roll)
        [440, 554.4].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2 * masterVolume, now + i * 0.08 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now + i * 0.08); osc.stop(now + 0.7);
        });
    }
}

// ==================== БРОСОК ====================
function rollDice() {
    if (isRolling) return;
    isRolling = true;

    const btn = document.getElementById('rollBtn');
    btn.disabled = true;
    resetResult();

    const sides = currentDice;
    const diceRoll = Math.floor(Math.random() * sides) + 1;
    const isNatMax = diceRoll === sides;  // максимальное значение
    const isNat1 = diceRoll === 1;

    let modifier = 0;
    let dc = 0;
    let total = diceRoll;
    let isSuccess = false;
    let resultType = 'neutral';

    if (currentMode === 'check') {
        // Режим проверки — только D20
        modifier = getModifier();
        dc = getDC();
        total = diceRoll + modifier;
        isSuccess = total >= dc;

        if (diceRoll === 20) resultType = 'nat20';
        else if (isNat1) resultType = 'nat1';
        else if (isSuccess) resultType = 'success';
        else resultType = 'failure';
    } else {
        // Свободный бросок
        if (isNatMax && sides === 20) resultType = 'nat20';
        else if (isNatMax && sides === 100) resultType = 'nat100';
        else if (isNat1) resultType = 'nat1';
        else resultType = 'neutral';
    }

    // Анимация
    const container = document.getElementById('diceContainer');
    const useRocking = [4, 10, 100].includes(sides);
    container.classList.add(useRocking ? 'rocking' : 'rolling');

    playRollSound();

    setTimeout(() => {
        container.classList.remove('rocking', 'rolling');

        const diceNum = document.getElementById('diceNumber');
        diceNum.textContent = diceRoll;
        diceNum.className = 'dice-number visible';
        if (diceRoll === 20 && sides === 20) diceNum.classList.add('nat20');
        if (diceRoll === 100 && sides === 100) diceNum.classList.add('nat20');
        if (isNat1) diceNum.classList.add('nat1');

        playResultSound(resultType);

        // Модификатор бейдж — только в режиме проверки
        if (currentMode === 'check') {
            const modBadge = document.getElementById('modBadge');
            modBadge.textContent = (modifier >= 0 ? '+' : '') + modifier;
            modBadge.classList.add('visible');
            modBadge.classList.toggle('negative', modifier < 0);
        }

        // DC кольцо — только в режиме проверки
        if (currentMode === 'check') {
            animateDCRing(total, resultType);
        }

        setTimeout(() => {
            showResult(diceRoll, total, modifier, dc, resultType);
            createSparks(resultType);
            showBurstRing(resultType);
            showFlash(resultType);
            addToHistory(diceRoll, total, modifier, resultType);

            isRolling = false;
            btn.disabled = false;
        }, 400);

    }, 2000);
}

// ==================== РЕЗУЛЬТАТ ====================
function resetResult() {
    document.getElementById('resultTotal').className = 'result-total';
    document.getElementById('resultTotal').textContent = '';
    document.getElementById('resultBreakdown').className = 'result-breakdown';
    document.getElementById('resultBreakdown').innerHTML = '';
    document.getElementById('resultLabel').className = 'result-label';
    document.getElementById('resultLabel').textContent = '';
    document.getElementById('modBadge').className = 'modifier-badge';
    document.getElementById('dcRingFill').style.strokeDashoffset = 565.48;
    document.getElementById('dcRingFill').className = 'dc-ring-fill';
    document.getElementById('burstRing').className = 'burst-ring';
    document.getElementById('sparkContainer').innerHTML = '';
    document.getElementById('diceNumber').className = 'dice-number';
    document.getElementById('diceNumber').textContent = '?';

    const rc = document.getElementById('rollContainer');
    rc.style.animation = 'none';
    rc.offsetHeight;
    rc.style.animation = '';
}

function animateDCRing(total, resultType) {
    const ring = document.getElementById('dcRingFill');
    const circumference = 565.48;
    const maxVal = Math.max(getDC() + 5, 25);
    const ratio = Math.min(Math.max(total, 0) / maxVal, 1);
    const offset = circumference * (1 - ratio);
    ring.style.strokeDashoffset = offset;

    setTimeout(() => {
        if (resultType === 'nat20' || resultType === 'success') {
            ring.classList.add('success');
        } else {
            ring.classList.add('failure');
        }
    }, 700);
}

function showResult(diceRoll, total, modifier, dc, resultType) {
    const resultTotal = document.getElementById('resultTotal');
    const resultBreakdown = document.getElementById('resultBreakdown');
    const resultLabel = document.getElementById('resultLabel');

    if (currentMode === 'check') {
        resultTotal.textContent = total;
    } else {
        resultTotal.textContent = diceRoll;
    }

    resultTotal.classList.add('visible');

    // Цвет числа
    switch (resultType) {
        case 'nat20': case 'nat100': resultTotal.classList.add('nat20'); break;
        case 'success': resultTotal.classList.add('success'); break;
        case 'failure': resultTotal.classList.add('failure'); break;
        case 'nat1': resultTotal.classList.add('failure'); break;
        default: resultTotal.classList.add('neutral'); break;
    }

    // Разбивка
    if (currentMode === 'check') {
        const modSign = modifier >= 0 ? '+' : '';
        const modClass = modifier >= 0 ? 'mod-val' : 'mod-val neg';
        resultBreakdown.innerHTML =
            `<span class="roll-val">[${diceRoll}]</span> ` +
            `${modSign}<span class="${modClass}">${modifier}</span>` +
            ` &nbsp;→&nbsp; DC ${dc}`;
    } else {
        resultBreakdown.innerHTML = `Бросок D${currentDice}`;
    }
    resultBreakdown.classList.add('visible');

    // Метка
    if (currentMode === 'check') {
        switch (resultType) {
            case 'nat20':
                resultLabel.textContent = '✦ КРИТИЧЕСКИЙ УСПЕХ ✦';
                resultLabel.className = 'result-label visible critical';
                break;
            case 'nat1':
                resultLabel.textContent = '✦ КРИТИЧЕСКИЙ ПРОВАЛ ✦';
                resultLabel.className = 'result-label visible failure';
                triggerShake();
                break;
            case 'success':
                resultLabel.textContent = 'УСПЕХ';
                resultLabel.className = 'result-label visible success';
                break;
            case 'failure':
                resultLabel.textContent = 'ПРОВАЛ';
                resultLabel.className = 'result-label visible failure';
                break;
        }
    } else {
        // Свободный бросок
        if (resultType === 'nat20') {
            resultLabel.textContent = '✦ НАТУРАЛЬНАЯ 20 ✦';
            resultLabel.className = 'result-label visible critical';
        } else if (resultType === 'nat100') {
            resultLabel.textContent = '✦ НАТУРАЛЬНАЯ 100 ✦';
            resultLabel.className = 'result-label visible critical';
        } else if (resultType === 'nat1') {
            resultLabel.textContent = '✦ НАТУРАЛЬНАЯ 1 ✦';
            resultLabel.className = 'result-label visible failure';
            triggerShake();
        } else {
            resultLabel.textContent = '';
            resultLabel.className = 'result-label visible neutral';
        }
    }
}

function triggerShake() {
    const rc = document.getElementById('rollContainer');
    rc.style.animation = 'none';
    rc.offsetHeight;
    rc.style.animation = 'shake 0.5s ease-out';
}

function createSparks(resultType) {
    const container = document.getElementById('sparkContainer');
    container.innerHTML = '';

    let count, colorClass;
    switch (resultType) {
        case 'nat20': case 'nat100': count = 35; colorClass = 'gold'; break;
        case 'nat1': count = 22; colorClass = 'red'; break;
        case 'success': count = 16; colorClass = 'green'; break;
        case 'failure': count = 12; colorClass = 'red'; break;
        default: count = 10; colorClass = 'white'; break;
    }

    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = `spark ${colorClass}`;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const dist = 50 + Math.random() * 90;
        spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
        spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
        container.appendChild(spark);
        setTimeout(() => spark.classList.add('animate'), Math.random() * 200);
    }
}

function showBurstRing(resultType) {
    const ring = document.getElementById('burstRing');
    ring.className = 'burst-ring';
    switch (resultType) {
        case 'nat20': case 'nat100': ring.classList.add('nat20'); break;
        case 'success': ring.classList.add('success'); break;
        case 'failure': case 'nat1': ring.classList.add('failure'); break;
        default: ring.classList.add('neutral'); break;
    }
    ring.offsetHeight;
    ring.classList.add('animate');
}

function showFlash(resultType) {
    const flash = document.getElementById('critFlash');
    flash.className = 'crit-flash';
    switch (resultType) {
        case 'nat20': case 'nat100': flash.classList.add('nat20'); break;
        case 'success': flash.classList.add('success'); break;
        case 'failure': case 'nat1': flash.classList.add('failure'); break;
    }
}

// ==================== ИСТОРИЯ ====================
function addToHistory(diceRoll, total, modifier, resultType) {
    const histContainer = document.getElementById('rollHistory');

    let statusClass, label;
    if (currentMode === 'check') {
        switch (resultType) {
            case 'nat20': statusClass = 'nat20'; label = 'КРИТ!'; break;
            case 'nat1': statusClass = 'failure'; label = 'КРИТ ПРОВАЛ'; break;
            case 'success': statusClass = 'success'; label = 'Успех'; break;
            case 'failure': statusClass = 'failure'; label = 'Провал'; break;
        }
    } else {
        switch (resultType) {
            case 'nat20': statusClass = 'nat20'; label = 'Нат 20!'; break;
            case 'nat100': statusClass = 'nat20'; label = 'Нат 100!'; break;
            case 'nat1': statusClass = 'failure'; label = 'Нат 1'; break;
            default: statusClass = 'neutral'; label = 'Бросок'; break;
        }
    }

    const displayValue = currentMode === 'check' ? total : diceRoll;
    const detailText = currentMode === 'check'
        ? `[${diceRoll}]${modifier >= 0 ? '+' : ''}${modifier}`
        : `D${currentDice}: [${diceRoll}]`;

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

// ==================== КЛАВИАТУРА ====================
document.addEventListener('keydown', (e) => {
    // Не перехватываем если фокус в input
    const tag = document.activeElement.tagName.toLowerCase();

    // Escape — закрыть настройки
    if (e.code === 'Escape') {
        const modal = document.getElementById('settingsModal');
        if (modal.classList.contains('open')) {
            toggleSettings();
            return;
        }
    }

    if (tag === 'input') return;

    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        rollDice();
    }
});

// ==================== ЗАПУСК ====================
init();
