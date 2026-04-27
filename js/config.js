// Глобальная конфигурация
const Config = {
    DICE_IMAGES: {
        4: 'res/images/dices/d4.png',
        6: 'res/images/dices/d6.png',
        8: 'res/images/dices/d8.png',
        10: 'res/images/dices/d10.png',
        12: 'res/images/dices/d12.png',
        20: 'res/images/dices/d20.png',
        100: 'res/images/dices/d100.png'
    },

    DICE_SIDES: [4, 6, 8, 10, 12, 20, 100],

    MIN_DICE_COUNT: 1,
    MAX_DICE_COUNT: 20,

    // Тайминги анимации (мс)
    TIMINGS: {
        normal: {
            roll: 2000,        // длительность переката
            resultDelay: 400,  // задержка перед показом результата
            sparkRange: 200    // разброс вылета искр
        },
        fast: {
            roll: 600,
            resultDelay: 150,
            sparkRange: 80
        }
    },

    // Состояние приложения
    state: {
        currentMode: 'check',      // 'check' | 'free'
        currentDice: 20,
        diceCount: 1,
        isRolling: false,
        masterVolume: 0.5,
        fastMode: false,
        savedSkills: {}
    },

    // Получить активные тайминги
    getTimings() {
        return this.state.fastMode ? this.TIMINGS.fast : this.TIMINGS.normal;
    }
};