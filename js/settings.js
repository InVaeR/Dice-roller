const Settings = {
    isOpen: false,

    toggle() {
        this.isOpen = !this.isOpen;
        document.getElementById('settingsOverlay').classList.toggle('open', this.isOpen);
        document.getElementById('settingsModal').classList.toggle('open', this.isOpen);
    },

    close() {
        this.isOpen = false;
        document.getElementById('settingsOverlay').classList.remove('open');
        document.getElementById('settingsModal').classList.remove('open');
    },

    onSkillSelect(value) {
        if (!value) return;
        const input = document.getElementById('skillInput');
        const modInput = document.getElementById('modInput');
        input.value = value;

        const saved = Config.state.savedSkills[value];
        if (saved) {
            modInput.value = saved.mod;
            modInput.classList.add('loaded');
            input.classList.add('loaded');
            setTimeout(() => {
                modInput.classList.remove('loaded');
                input.classList.remove('loaded');
            }, 800);
        }

        UI.updateCheckDisplay();
    },

    onSkillInput() {
        const skill = document.getElementById('skillInput').value;
        const saved = Config.state.savedSkills[skill];
        if (saved) {
            const modInput = document.getElementById('modInput');
            modInput.value = saved.mod;
            modInput.classList.add('loaded');
            setTimeout(() => modInput.classList.remove('loaded'), 800);
        }
        UI.updateCheckDisplay();
    },

    onModInput() {
        const skill = document.getElementById('skillInput').value;
        const mod = parseInt(document.getElementById('modInput').value) || 0;
        Storage.saveSkill(skill, mod);
        UI.updateCheckDisplay();
    },

    onDcInput() {
        UI.updateCheckDisplay();
    },

    setVolume(percent) {
        Config.state.masterVolume = percent / 100;
        document.getElementById('volumeValue').textContent = percent + '%';
        Storage.saveVolume(percent);
    },

    resetSkills() {
        if (!confirm('Сбросить все сохранённые модификаторы навыков?')) return;
        Storage.resetSkills();
        document.getElementById('modInput').value = 0;
        UI.updateCheckDisplay();

        const btn = document.getElementById('resetBtn');
        const orig = btn.textContent;
        btn.textContent = 'Сброшено ✓';
        setTimeout(() => { btn.textContent = orig; }, 1500);
    }
};