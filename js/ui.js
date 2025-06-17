// Gestion de l'interface utilisateur
export function initUI(settings) {
    // Initialisation des écrans
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[onclick="showScreen('${screenId}')"]`)?.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
            showScreen(screenId);
        });
    });

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            showScreen('home-screen');
        });
    });

    // Exemple : Remplir les champs des paramètres
    document.querySelectorAll('.settings-input')[0].value = settings.username;
    document.querySelectorAll('.settings-input')[1].value = settings.questionCount;

    // Gestion des changements dans les paramètres (à compléter)
    document.querySelectorAll('.settings-input').forEach(input => {
        input.addEventListener('change', () => {
            const newSettings = {
                username: document.querySelectorAll('.settings-input')[0].value,
                questionCount: document.querySelectorAll('.settings-input')[1].value
            };
            saveSettings(newSettings);
        });
    });
}