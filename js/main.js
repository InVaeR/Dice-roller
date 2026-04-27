(function init() {
    // Загрузка состояния
    Storage.loadSkills();
    Storage.loadVolume();

    // Инициализация модулей
    Theme.init();
    SpeedMode.init();
    Audio_FX.init();
    Effects.initBgParticles();

    // Громкость
    const volumeSlider = document.getElementById('volumeSlider');
    const initVol = Math.round(Config.state.masterVolume * 100);
    volumeSlider.value = initVol;
    document.getElementById('volumeValue').textContent = initVol + '%';

    // === Обработчики событий ===

    // Шестерёнка / закрытие модалки
    document.getElementById('settingsToggle').addEventListener('click', () => Settings.toggle());
    document.getElementById('settingsClose').addEventListener('click', () => Settings.close());
    document.getElementById('settingsOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'settingsOverlay') Settings.close();
    });

    // Тема
    document.getElementById('themeToggle').addEventListener('click', () => Theme.toggle());

    // Скорость
    document.getElementById('speedToggle').addEventListener('click', () => SpeedMode.toggle());

    // Громкость
    volumeSlider.addEventListener('input', (e) => Settings.setVolume(parseInt(e.target.value)));

    // Сброс
    document.getElementById('resetBtn').addEventListener('click', () => Settings.resetSkills());

    // Селекты/инпуты
    document.getElementById('skillSelect').addEventListener('change', (e) => Settings.onSkillSelect(e.target.value));
    document.getElementById('skillInput').addEventListener('input', () => Settings.onSkillInput());
    document.getElementById('modInput').addEventListener('input', () => Settings.onModInput());
    document.getElementById('modInput').addEventListener('blur', () => Settings.onModInput());
    document.getElementById('dcInput').addEventListener('input', () => Settings.onDcInput());

    // Режимы
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => UI.setMode(btn.dataset.mode));
    });

    // Тип кубика
    document.querySelectorAll('.dice-type-btn').forEach(btn => {
        btn.addEventListener('click', () => UI.setDiceType(parseInt(btn.dataset.sides)));
    });

    // Количество
    document.getElementById('countMinus').addEventListener('click', () => UI.changeDiceCount(-1));
    document.getElementById('countPlus').addEventListener('click', () => UI.changeDiceCount(1));

    // Бросок
    document.getElementById('rollBtn').addEventListener('click', () => Dice.roll());
    document.getElementById('diceContainer').addEventListener('click', () => Dice.roll());

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (!Settings.isOpen) Dice.roll();
        }
        if (e.code === 'Escape' && Settings.isOpen) {
            Settings.close();
        }
    });

    // Начальная отрисовка
    UI.updateCheckDisplay();
    UI.updateDiceImage();
    UI.updateDCRingVisibility();
    UI.updateModBadge();
    UI.updateMultiBadge();

    // Сохранение текущего модификатора при выходе
    window.addEventListener('beforeunload', () => Settings.onModInput());
})();