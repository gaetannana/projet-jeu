var settings = { username: "Player", numQuestions: 10 };
var questions = [];
var currentIndex = 0;

function loadSettings() {
    var saved = localStorage.getItem("quizSettings");
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById("username").value = settings.username;
        document.getElementById("num-questions").value = settings.numQuestions;
    }
}

function saveSettings() {
    var username = document.getElementById("username").value;
    if (username === "") {
        username = "Player";
    }
    var numQuestions = parseInt(document.getElementById("num-questions").value);
    if (numQuestions < 1 || isNaN(numQuestions)) {
        numQuestions = 10;
    }
    settings.username = username;
    settings.numQuestions = numQuestions;
    localStorage.setItem("quizSettings", JSON.stringify(settings));
    alert("Settings saved!");
}

function showCategories() {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("categories-screen").style.display = "block";
    getCategories();
}

async function getCategories() {
    var response = await fetch("https://opentdb.com/api_category.php");
    var data = await response.json();
    var select = document.getElementById("category-select");
    select.innerHTML = "";
    var defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a category";
    select.appendChild(defaultOption);
    for (var i = 0; i < data.trivia_categories.length; i++) {
        var option = document.createElement("option");
        option.value = data.trivia_categories[i].id;
        option.textContent = data.trivia_categories[i].name;
        select.appendChild(option);
    }
}

function startQuiz() {
    var category = document.getElementById("category-select").value;
    var url = "https://opentdb.com/api.php?amount=" + settings.numQuestions + "&type=multiple";
    if (category !== "") {
        url = url + "&category=" + category;
    }
    getQuestions(url);
}

async function getQuestions(url) {
    var response = await fetch(url);
    var data = await response.json();
    if (data.response_code === 0) {
        questions = data.results;
        currentIndex = 0;
        document.getElementById("categories-screen").style.display = "none";
        document.getElementById("quiz-screen").style.display = "block";
        document.getElementById("username-display").textContent = "Player: " + settings.username;
        showQuestion();
    } else {
        alert("Error loading questions.");
    }
}

function showQuestion() {
    var question = questions[currentIndex];
    document.getElementById("question-number").textContent = "Question " + (currentIndex + 1);
    document.getElementById("question-text").textContent = question.question;
    var answers = [];
    for (var i = 0; i < question.incorrect_answers.length; i++) {
        answers[i] = question.incorrect_answers[i];
    }
    answers[answers.length] = question.correct_answer;
    for (i = answers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = answers[i];
        answers[i] = answers[j];
        answers[j] = temp;
    }
    var answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";
    for (i = 0; i < answers.length; i++) {
        var button = document.createElement("button");
        button.textContent = answers[i];
        button.className = "answer-btn";
        answersDiv.appendChild(button);
    }
}

function nextQuestion() {
    currentIndex = currentIndex + 1;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        document.getElementById("quiz-screen").style.display = "none";
        document.getElementById("settings-screen").style.display = "block";
    }
}

function goBack() {
    document.getElementById("categories-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "block";
}

document.getElementById("save-btn").addEventListener("click", function() {
    saveSettings();
});
document.getElementById("category-btn").addEventListener("click", function() {
    showCategories();
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
document.getElementById("num-questions").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        saveSettings();
    }
});

loadSettings();