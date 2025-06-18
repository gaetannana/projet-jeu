let configQuiz = {
    pseudo: "Joueur Anonyme",
    nombreQuestions: 10,
    difficulty: "hard",
    timerDuration: 30
};
let categories = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer;
let timeLeft;

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    fetchCategories();
    showScreen("home-screen");
});

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.style.display = "none";
    });
    document.getElementById(screenId).style.display = "block";

    if (screenId === "categories-screen") {
        saveSettings();
        displayCategories();
    } else if (screenId === "quiz-screen") {
        document.getElementById("submit-answer-btn").style.display = "block";
        document.getElementById("next-question-btn").style.display = "none";
        document.getElementById("end-quiz-btn").style.display = "none";
        document.getElementById("feedback").style.display = "none";
    }
}

function saveSettings() {
    const usernameInput = document.getElementById("username").value.trim();
    const numQuestionsInput = parseInt(document.getElementById("num-questions").value);
    const difficultyInput = document.getElementById("difficulty").value;
    const timerDurationInput = parseInt(document.getElementById("timer-duration").value);

    configQuiz.pseudo = usernameInput || "Joueur Anonyme";
    configQuiz.nombreQuestions = isNaN(numQuestionsInput) || numQuestionsInput < 1 ? 10 : numQuestionsInput;
    configQuiz.difficulty = difficultyInput || "hard";
    configQuiz.timerDuration = isNaN(timerDurationInput) || timerDurationInput < 1 ? 30 : timerDurationInput;

    localStorage.setItem("quizConfig", JSON.stringify(configQuiz));
    alert("Paramètres sauvegardés !");
}

function loadSettings() {
    try {
        const savedConfig = localStorage.getItem("quizConfig");
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            configQuiz.pseudo = parsedConfig.pseudo || "Joueur Anonyme";
            configQuiz.nombreQuestions = parsedConfig.nombreQuestions || 10;
            configQuiz.difficulty = parsedConfig.difficulty || "hard";
            configQuiz.timerDuration = parsedConfig.timerDuration || 30;
        }
    } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
    }
    document.getElementById("username").value = configQuiz.pseudo;
    document.getElementById("num-questions").value = configQuiz.nombreQuestions;
    document.getElementById("difficulty").value = configQuiz.difficulty;
    document.getElementById("timer-duration").value = configQuiz.timerDuration;
}

async function fetchCategories() {
    showScreen("loading-screen");
    try {
        const response = await fetch("https://opentdb.com/api_category.php", { cache: "no-cache" });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        categories = data.trivia_categories;
        showScreen("home-screen");
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        alert("Impossible de charger les catégories. Vérifiez votre connexion.");
        showScreen("home-screen");
    }
}

function displayCategories() {
    const categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = '<option value="">Choisir une catégorie</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    selectedAnswer = null;
    const selectedCategory = document.getElementById("category-select").value;
    let apiUrl = `https://opentdb.com/api.php?amount=${configQuiz.nombreQuestions}&difficulty=${configQuiz.difficulty}&type=multiple`;
    if (selectedCategory) {
        apiUrl += `&category=${selectedCategory}`;
    }
    fetchQuestions(apiUrl);
}

async function fetchQuestions(apiUrl) {
    showScreen("loading-screen");
    try {
        const response = await fetch(apiUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();

        if (data.response_code !== 0) {
            let errorMsg = "Erreur lors du chargement des questions: ";
            switch (data.response_code) {
                case 1:
                    errorMsg += "Pas assez de questions disponibles.";
                    break;
                case 2:
                    errorMsg += "Paramètres invalides.";
                    break;
                case 3:
                case 4:
                    errorMsg += "Problème de session. Réessayez.";
                    break;
                default:
                    errorMsg += "Erreur inconnue.";
            }
            throw new Error(errorMsg);
        }

        questions = data.results;
        currentQuestionIndex = 0;
        showScreen("quiz-screen");
        document.getElementById("username-display").textContent = `Joueur: ${configQuiz.pseudo}`;
        displayQuestion();
    } catch (error) {
        console.error("Erreur lors de la récupération des questions:", error);
        alert(error.message || "Erreur lors du chargement des questions.");
        showScreen("home-screen");
    }
}

function displayQuestion() {
    document.getElementById("feedback").style.display = "none";
    const currentQuestion = questions[currentQuestionIndex];

    document.getElementById("question-number").textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
    document.getElementById("question-text").textContent = decodeHtml(currentQuestion.question);

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";
    let answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    answers = shuffleArray(answers);

    answers.forEach(answer => {
        const button = document.createElement("button");
        button.className = "answer-btn";
        button.textContent = decodeHtml(answer);
        button.addEventListener("click", () => {
            document.querySelectorAll(".answer-btn").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedAnswer = answer;
        });
        answersDiv.appendChild(button);
    });

    document.getElementById("submit-answer-btn").style.display = "block";
    document.getElementById("next-question-btn").style.display = "none";
    document.getElementById("end-quiz-btn").style.display = "none";
    resetTimer();
    startTimer(configQuiz.timerDuration);
}

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function submitAnswer() {
    if (!selectedAnswer) {
        alert("Veuillez sélectionner une réponse !");
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const feedback = document.getElementById("feedback");

    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === decodeHtml(currentQuestion.correct_answer)) {
            btn.classList.add("correct");
        } else if (btn.textContent === decodeHtml(selectedAnswer)) {
            btn.style.backgroundColor = "#ff4d4d";
        }
    });

    if (selectedAnswer === currentQuestion.correct_answer) {
        score++;
        feedback.textContent = "Correct !";
        feedback.style.color = "#00cc00";
    } else {
        feedback.textContent = `Incorrect. La bonne réponse était : ${decodeHtml(currentQuestion.correct_answer)}`;
        feedback.style.color = "#ff4d4d";
    }

    feedback.style.display = "block";
    document.getElementById("submit-answer-btn").style.display = "none";
    document.getElementById("next-question-btn").style.display = currentQuestionIndex < questions.length - 1 ? "block" : "none";
    document.getElementById("end-quiz-btn").style.display = currentQuestionIndex === questions.length - 1 ? "block" : "none";
}

function nextQuestion() {
    currentQuestionIndex++;
    selectedAnswer = null;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    }
}

function endQuiz() {
    showScreen("results-screen");
    const percentage = (score / questions.length) * 100;
    const categoryId = document.getElementById("category-select").value || "random";
    const bestScores = JSON.parse(localStorage.getItem("bestScores") || "{}");
    if (!bestScores[categoryId] || percentage > bestScores[categoryId]) {
        bestScores[categoryId] = percentage;
        localStorage.setItem("bestScores", JSON.stringify(bestScores));
    }
    document.getElementById("final-score").textContent = `Score Final: ${score} / ${questions.length} (${percentage.toFixed(2)}%)`;
}

function displayLeaderboard() {
    const bestScores = JSON.parse(localStorage.getItem("bestScores") || "{}");
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";
    for (let categoryId in bestScores) {
        const categoryName = categories.find(cat => cat.id === parseInt(categoryId))?.name || "Aléatoire";
        const li = document.createElement("li");
        li.textContent = `${categoryName}: ${bestScores[categoryId].toFixed(2)}%`;
        leaderboardList.appendChild(li);
    }
    showScreen("leaderboard-screen");
}

function startTimer(duration) {
    timeLeft = duration;
    document.getElementById("time-left").textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("submit-answer-btn").style.display = "none";
            document.querySelectorAll(".answer-btn").forEach(btn => btn.disabled = true);
            document.getElementById("next-question-btn").style.display = currentQuestionIndex < questions.length - 1 ? "block" : "none";
            document.getElementById("end-quiz-btn").style.display = currentQuestionIndex === questions.length - 1 ? "block" : "none";
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
}

document.getElementById("random-quiz-btn").addEventListener("click", () => {
    document.getElementById("category-select").value = "";
    startQuiz();
});

document.getElementById("select-category-btn").addEventListener("click", () => {
    showScreen("categories-screen");
});

document.getElementById("settings-btn").addEventListener("click", () => {
    showScreen("settings-screen");
});

document.getElementById("save-settings-btn").addEventListener("click", () => {
    saveSettings();
    showScreen("home-screen");
});

document.getElementById("back-to-home-from-categories-btn").addEventListener("click", () => {
    showScreen("home-screen");
});

document.getElementById("back-to-home-from-settings-btn").addEventListener("click", () => {
    showScreen("home-screen");
});

document.getElementById("start-category-quiz-btn").addEventListener("click", startQuiz);

document.getElementById("submit-answer-btn").addEventListener("click", submitAnswer);

document.getElementById("next-question-btn").addEventListener("click", nextQuestion);

document.getElementById("end-quiz-btn").addEventListener("click", endQuiz);

document.getElementById("restart-quiz-btn").addEventListener("click", startQuiz);

document.getElementById("back-to-home-from-results-btn").addEventListener("click", () => {
    showScreen("home-screen");
});

document.getElementById("leaderboard-btn").addEventListener("click", displayLeaderboard);

document.getElementById("back-to-home-from-leaderboard-btn").addEventListener("click", () => {
    showScreen("home-screen");
});

document.getElementById("num-questions").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        saveSettings();
        showScreen("home-screen");
    }
});