const Theme = {
    init() {
        const saved = Storage.loadTheme();
        if (saved === 'light') {
            document.body.classList.add('light-theme');
        }
        this.updateUI();
    },

    toggle() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        Storage.saveTheme(isLight ? 'light' : 'dark');
        this.updateUI();
    },

    updateUI() {
        const isLight = document.body.classList.contains('light-theme');
        const icon = document.getElementById('themeIcon');
        const label = document.getElementById('themeLabel');
        if (icon) icon.textContent = isLight ? '🌙' : '☀️';
        if (label) label.textContent = isLight ? 'Тёмная' : 'Светлая';
    }
};

const SpeedMode = {
    init() {
        Config.state.fastMode = Storage.loadFastMode();
        if (Config.state.fastMode) {
            document.body.classList.add('fast-mode');
        }
        this.updateUI();
    },

    toggle() {
        Config.state.fastMode = !Config.state.fastMode;
        document.body.classList.toggle('fast-mode', Config.state.fastMode);
        Storage.saveFastMode(Config.state.fastMode);
        this.updateUI();
    },

    updateUI() {
        const icon = document.getElementById('speedIcon');
        const label = document.getElementById('speedLabel');
        if (icon) icon.textContent = Config.state.fastMode ? '⚡' : '🐢';
        if (label) label.textContent = Config.state.fastMode ? 'Быстрая' : 'Обычная';
    }
};