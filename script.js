let quiz = [];
let index = 0;
let score = 0;
let settings = { username: "Player", numQuestions: 10 };

function loadSettings() {
    let saved = localStorage.getItem("quizSettings");
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById("username").value = settings.username;
        document.getElementById("num-questions").value = settings.numQuestions;
    }
}

function saveSettings() {
    settings.username = document.getElementById("username").value || "Player";
    settings.numQuestions = parseInt(document.getElementById("num-questions").value) || 10;
    localStorage.setItem("quizSettings", JSON.stringify(settings));
    alert("Settings saved!");
}

async function showCategories() {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("categories-screen").style.display = "block";
    let res = await fetch("https://opentdb.com/api_category.php");
    let data = await res.json();
    let select = document.getElementById("category-select");
    select.innerHTML = "<option value=\"\">Select a category</option>";
    for (let i = 0; i < data.trivia_categories.length; i++) {
        let opt = document.createElement("option");
        opt.value = data.trivia_categories[i].id;
        opt.textContent = data.trivia_categories[i].name;
        select.appendChild(opt);
    }
}

async function startQuiz() {
    let cat = document.getElementById("category-select").value;
    let url = `https://opentdb.com/api.php?amount=${settings.numQuestions}&type=multiple${cat ? `&category=${cat}` : ""}`;
    await fetchQuiz(url);
}

async function startRandomQuiz() {
    let url = `https://opentdb.com/api.php?amount=${settings.numQuestions}&type=multiple`;
    await fetchQuiz(url);
}

async function fetchQuiz(url) {
    let res = await fetch(url);
    let data = await res.json();
    if (data.response_code === 0) {
        quiz = data.results;
        index = 0;
        score = 0;
        document.getElementById("categories-screen").style.display = "none";
        document.getElementById("quiz-screen").style.display = "block";
        document.getElementById("username-display").textContent = `Player: ${settings.username}`;
        showQuestion();
    } else {
        alert("Error fetching questions.");
    }
}

function showQuestion() {
    let q = quiz[index];
    document.getElementById("question-number").textContent = `Question ${index + 1}`;
    document.getElementById("question-text").textContent = q.question;
    let answers = [...q.incorrect_answers, q.correct_answer];
    answers.sort(() => Math.random() - 0.5);
    let ansDiv = document.getElementById("answers");
    ansDiv.innerHTML = "";
    for (let i = 0; i < answers.length; i++) {
        let btn = document.createElement("button");
        btn.textContent = answers[i];
        btn.addEventListener("click", () => checkAnswer(answers[i], q.correct_answer));
        ansDiv.appendChild(btn);
    }
}

function checkAnswer(selected, correct) {
    if (selected === correct) score++;
    nextQuestion();
}

function nextQuestion() {
    index++;
    if (index < quiz.length) {
        showQuestion();
    } else {
        document.getElementById("quiz-screen").style.display = "none";
        document.getElementById("result-screen").style.display = "block";
        document.getElementById("score").textContent = `Score: ${score}/${quiz.length}`;
    }
}

function backToSettings() {
    document.getElementById("result-screen").style.display = "none";
    document.getElementById("categories-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "block";
}

document.getElementById("save-btn").addEventListener("click", saveSettings);
document.getElementById("category-btn").addEventListener("click", showCategories);
document.getElementById("random-btn").addEventListener("click", startRandomQuiz);
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("next-btn").addEventListener("click", nextQuestion);
document.getElementById("back-settings-btn").addEventListener("click", backToSettings);
document.getElementById("back-btn").addEventListener("click", backToSettings);
document.getElementById("num-questions").addEventListener("keypress", (event) => {
    if (event.key === "Enter") saveSettings();
});

loadSettings();