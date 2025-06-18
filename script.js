let settings = { playerName: "Joueur Anonyme", questionCount: 10 };
let categories = [];
let questions = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
    getCategories();
});

function showScreen(screenId) {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("categories-screen").style.display = "none";
    document.getElementById("quiz-screen").style.display = "none";
    document.getElementById(screenId).style.display = "block";

    if (screenId === "categories-screen") {
        saveSettings();
        showCategories();
    }
}

function saveSettings() {
    let name = document.getElementById("playerName").value;
    if (name === "") {
        name = "Joueur Anonyme";
    }
    let count = parseInt(document.getElementById("questionCount").value);
    if (isNaN(count) || count < 1) {
        count = 10;
    }
    settings.playerName = name;
    settings.questionCount = count;
    localStorage.setItem("quizSettings", JSON.stringify(settings));
}

function loadSettings() {
    let saved = localStorage.getItem("quizSettings");
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById("playerName").value = settings.playerName;
        document.getElementById("questionCount").value = settings.questionCount;
    }
}

async function getCategories() {
    let response = await fetch("https://opentdb.com/api_category.php");
    let data = await response.json();
    categories = data.trivia_categories;
}

function showCategories() {
    let select = document.getElementById("category-select");
    select.innerHTML = "";
    let option = document.createElement("option");
    option.value = "";
    option.textContent = "Choisir une catégorie";
    select.appendChild(option);
    for (let i = 0; i < categories.length; i++) {
        option = document.createElement("option");
        option.value = categories[i].id;
        option.textContent = categories[i].name;
        select.appendChild(option);
    }
}

function startQuiz() {
    let categoryId = document.getElementById("category-select").value;
    let url = "https://opentdb.com/api.php?amount=" + settings.questionCount;
    if (categoryId !== "") {
        url = url + "&category=" + categoryId;
    }
    getQuestions(url);
}

async function getQuestions(url) {
    let response = await fetch(url);
    let data = await response.json();
    if (data.response_code === 0) {
        questions = data.results;
        currentIndex = 0;
        showScreen("quiz-screen");
        document.getElementById("username-display").textContent = "Joueur : " + settings.playerName;
        showQuestion();
    } else {
        alert("Erreur lors du chargement des questions !");
    }
}

function showQuestion() {
    let question = questions[currentIndex];
    document.getElementById("question-number").textContent = "Question " + (currentIndex + 1);
    document.getElementById("question-text").textContent = question.question;
    let answers = question.incorrect_answers;
    answers[answers.length] = question.correct_answer;
    for (let i = answers.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = answers[i];
        answers[i] = answers[j];
        answers[j] = temp;
    }
    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";
    for (let i = 0; i < answers.length; i++) {
        let button = document.createElement("button");
        button.textContent = answers[i];
        answersDiv.appendChild(button);
    }
}

function nextQuestion() {
    currentIndex = currentIndex + 1;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        showScreen("settings-screen");
    }
}

function goBack() {
    showScreen("settings-screen");
}

document.getElementById("save-btn").addEventListener("click", function() {
    saveSettings();
    showScreen("categories-screen");
});
document.getElementById("category-btn").addEventListener("click", function() {
    showScreen("categories-screen");
});
document.getElementById("start-btn").addEventListener("click", function() {
    startQuiz();
});
document.getElementById("next-btn").addEventListener("click", function() {
    nextQuestion();
});
document.getElementById("back-settings-btn").addEventListener("click", function() {
    goBack();
});
document.getElementById("questionCount").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        saveSettings();
        showScreen("categories-screen");
    }
});