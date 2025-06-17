// Gestion du LocalStorage
export function loadSettings() {
    return JSON.parse(localStorage.getItem('quizSettings')) || {
        username: 'Guest',
        questionCount: 10
    };
}

export function saveSettings(settings) {
    localStorage.setItem('quizSettings', JSON.stringify(settings));
}