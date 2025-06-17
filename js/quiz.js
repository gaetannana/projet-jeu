// Logique du quiz
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

export function initQuiz(fetchQuestionsFunc) {
    // Exemple d'initialisation
    fetchQuestionsFunc(9, 10).then(q => {
        questions = q;
        displayQuestion();
    });
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        // Logique pour afficher la question et les options (à implémenter dans ui.js)
        console.log(question);
    } else {
        // Fin du quiz
        console.log(`Score: ${score}/${questions.length}`);
    }
}

// Fonction à appeler lors du clic sur une réponse
export function checkAnswer(selectedAnswer) {
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    if (selectedAnswer === correctAnswer) score++;
    currentQuestionIndex++;
    displayQuestion();
}