const Storage = {
    KEYS: {
        SKILLS: 'diceRoller_skills',
        VOLUME: 'diceRoller_volume',
        THEME: 'diceRoller_theme',
        FAST: 'diceRoller_fastMode'
    },

    loadSkills() {
        try {
            const saved = localStorage.getItem(this.KEYS.SKILLS);
            Config.state.savedSkills = saved ? JSON.parse(saved) : {};
        } catch (e) {
            Config.state.savedSkills = {};
        }
    },

    saveSkill(skillName, mod) {
        if (!skillName || skillName === 'Навык') return;
        Config.state.savedSkills[skillName] = { mod, lastUsed: Date.now() };
        try {
            localStorage.setItem(this.KEYS.SKILLS, JSON.stringify(Config.state.savedSkills));
        } catch (e) {}
    },

    resetSkills() {
        Config.state.savedSkills = {};
        try {
            localStorage.removeItem(this.KEYS.SKILLS);
        } catch (e) {}
    },

    loadVolume() {
        try {
            const v = localStorage.getItem(this.KEYS.VOLUME);
            if (v !== null) {
                const parsed = parseInt(v);
                if (!isNaN(parsed)) Config.state.masterVolume = parsed / 100;
            }
        } catch (e) {}
    },

    saveVolume(percent) {
        try {
            localStorage.setItem(this.KEYS.VOLUME, String(percent));
        } catch (e) {}
    },

    loadTheme() {
        try {
            return localStorage.getItem(this.KEYS.THEME) || 'dark';
        } catch (e) {
            return 'dark';
        }
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
        } catch (e) {}
    },

    loadFastMode() {
        try {
            return localStorage.getItem(this.KEYS.FAST) === '1';
        } catch (e) {
            return false;
        }
    },

    saveFastMode(isFast) {
        try {
            localStorage.setItem(this.KEYS.FAST, isFast ? '1' : '0');
        } catch (e) {}
    }
};