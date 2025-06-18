let configQuiz = {
    pseudo: "Invité",
    nombreQuestions: 10,
    timer: 10,
    difficulte: "easy",
    meilleursScores: {}
};
let listeCategories = [];
let questionsQuiz = [];
let indexQuestionCourante = 0;
let score = 0;
let timerId = null;

document.addEventListener("DOMContentLoaded", () => {
    chargerParametres();
    recupererCategories();
    attacherEvenements();
    afficherEcran("home-screen");
});

function attacherEvenements() {
    document.getElementById("random-quiz-btn").addEventListener("click", () => {
        document.getElementById("category-select").value = "";
        lancerQuiz();
    });
    document.getElementById("category-btn").addEventListener("click", () => afficherEcran("categories-screen"));
    document.getElementById("settings-btn").addEventListener("click", () => afficherEcran("settings-screen"));
    document.getElementById("save-btn").addEventListener("click", () => {
        sauvegarderParametres();
        afficherEcran("home-screen");
    });
    document.getElementById("start-btn").addEventListener("click", lancerQuiz);
    document.getElementById("next-btn").addEventListener("click", passerQuestionSuivante);
    document.getElementById("leaderboard-btn").addEventListener("click", () => afficherEcran("leaderboard-screen"));
    document.getElementById("back-btn").addEventListener("click", () => afficherEcran("home-screen"));
}

function afficherEcran(idEcran) {
    document.querySelectorAll(".screen").forEach(ecran => ecran.classList.remove("active"));
    document.getElementById(idEcran).classList.add("active");
    if (idEcran === "categories-screen") afficherCategories();
    else if (idEcran === "quiz-screen") afficherQuestion();
    else if (idEcran === "leaderboard-screen") afficherLeaderboardDetails();
    else if (idEcran === "result-screen") afficherResultat();
}

function sauvegarderParametres() {
    configQuiz.pseudo = document.getElementById("username").value || "Invité";
    configQuiz.nombreQuestions = parseInt(document.getElementById("num-questions").value) || 10;
    configQuiz.timer = parseInt(document.getElementById("timer-duration").value) || 10;
    configQuiz.difficulte = document.getElementById("difficulty").value || "easy";
    localStorage.setItem("configQuiz", JSON.stringify(configQuiz));
}

function chargerParametres() {
    const configSauvegardee = localStorage.getItem("configQuiz");
    if (configSauvegardee) {
        configQuiz = JSON.parse(configSauvegardee);
        configQuiz.meilleursScores = configQuiz.meilleursScores || {};
    }
    document.getElementById("username").value = configQuiz.pseudo;
    document.getElementById("num-questions").value = configQuiz.nombreQuestions;
    document.getElementById("timer-duration").value = configQuiz.timer;
    document.getElementById("difficulty").value = configQuiz.difficulte;
}

async function recupererCategories() {
    try {
        const reponse = await fetch("https://opentdb.com/api_category.php");
        const donnees = await reponse.json();
        listeCategories = donnees.trivia_categories;
        afficherCategories();
    } catch (erreur) {
        console.error(erreur);
        alert("Erreur lors du chargement des catégories.");
    }
}

function afficherCategories() {
    const menuCategories = document.getElementById("category-select");
    menuCategories.innerHTML = '<option value="">Choisir une catégorie</option>';
    listeCategories.forEach(categorie => {
        const option = document.createElement("option");
        option.value = categorie.id;
        option.textContent = categorie.name;
        menuCategories.appendChild(option);
    });
}

async function lancerQuiz() {
    const categorieChoisie = document.getElementById("category-select").value;
    let urlApi = `https://opentdb.com/api.php?amount=${configQuiz.nombreQuestions}&difficulty=${configQuiz.difficulte}&type=multiple`;
    if (categorieChoisie) urlApi += `&category=${categorieChoisie}`;
    await recupererQuestions(urlApi);
}

async function recupererQuestions(urlApi) {
    try {
        const reponse = await fetch(urlApi);
        const donnees = await reponse.json();
        if (donnees.response_code === 0) {
            questionsQuiz = donnees.results;
            indexQuestionCourante = 0;
            score = 0;
            afficherEcran("quiz-screen");
            document.getElementById("username-display").textContent = `Joueur: ${configQuiz.pseudo}`;
        } else {
            alert("Échec du chargement des questions.");
        }
    } catch (erreur) {
        console.error(erreur);
        alert("Erreur lors du chargement des questions.");
    }
}

function afficherQuestion() {
    if (indexQuestionCourante >= questionsQuiz.length) {
        sauvegarderMeilleurScore();
        afficherResultat();
        return;
    }
    clearInterval(timerId);
    const questionCourante = questionsQuiz[indexQuestionCourante];
    document.getElementById("question-number").textContent = `Question ${indexQuestionCourante + 1}/${questionsQuiz.length}`;
    document.getElementById("question-text").innerHTML = decodeHTMLEntities(questionCourante.question);
    let reponses = [...questionCourante.incorrect_answers, questionCourante.correct_answer];
    reponses = melangerTableau(reponses);
    const conteneurReponses = document.getElementById("answers");
    conteneurReponses.innerHTML = "";
    reponses.forEach(reponse => {
        const bouton = document.createElement("button");
        bouton.className = "answer-btn";
        bouton.innerHTML = decodeHTMLEntities(reponse);
        bouton.addEventListener("click", () => gererReponse(reponse, questionCourante.correct_answer));
        conteneurReponses.appendChild(bouton);
    });
    demarrerTimer();
    document.getElementById("next-btn").style.display = "none";
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

function melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
}

function demarrerTimer() {
    let tempsRestant = configQuiz.timer;
    document.getElementById("timer").textContent = `Temps: ${tempsRestant}s`;
    timerId = setInterval(() => {
        tempsRestant--;
        document.getElementById("timer").textContent = `Temps: ${tempsRestant}s`;
        if (tempsRestant <= 0) {
            clearInterval(timerId);
            document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);
            document.getElementById("next-btn").style.display = "block";
        }
    }, 1000);
}

function gererReponse(reponseSelectionnee, reponseCorrecte) {
    clearInterval(timerId);
    const boutons = document.querySelectorAll(".answer-btn");
    boutons.forEach(bouton => {
        bouton.disabled = true;
        if (bouton.innerHTML === decodeHTMLEntities(reponseCorrecte)) {
            bouton.classList.add("correct");
        } else if (bouton.innerHTML === decodeHTMLEntities(reponseSelectionnee)) {
            bouton.style.backgroundColor = "#ff0000";
        }
    });
    if (reponseSelectionnee === reponseCorrecte) score++;
    document.getElementById("next-btn").style.display = "block";
}

function passerQuestionSuivante() {
    indexQuestionCourante++;
    afficherQuestion();
}

function sauvegarderMeilleurScore() {
    const categorie = document.getElementById("category-select").value ? 
        listeCategories.find(cat => cat.id == document.getElementById("category-select").value).name : "aléatoire";
    const pourcentage = (score / questionsQuiz.length) * 100;
    if (!configQuiz.meilleursScores[categorie] || pourcentage > configQuiz.meilleursScores[categorie].score) {
        configQuiz.meilleursScores[categorie] = {
            score: pourcentage,
            pseudo: configQuiz.pseudo
        };
        localStorage.setItem("configQuiz", JSON.stringify(configQuiz));
    }
}

function afficherResultat() {
    afficherEcran("result-screen");
    const pourcentage = (score / questionsQuiz.length) * 100;
    document.getElementById("final-score").textContent = `Score final: ${score}/${questionsQuiz.length} (${pourcentage.toFixed(2)}%) - ${configQuiz.pseudo}`;
    afficherClassement();
}

function afficherClassement() {
    const classement = document.getElementById("leaderboard");
    classement.innerHTML = "<h3>Classement</h3>";
    const scores = Object.entries(configQuiz.meilleursScores).sort((a, b) => b[1].score - a[1].score);
    if (scores.length === 0) {
        classement.innerHTML += "<p>Aucun score enregistré.</p>";
    } else {
        scores.forEach(([categorie, data]) => {
            classement.innerHTML += `<p>${categorie}: ${data.score.toFixed(2)}% - ${data.pseudo}</p>`;
        });
    }
}

function afficherLeaderboardDetails() {
    const details = document.getElementById("leaderboard-details");
    details.innerHTML = `
        <p>Niveau de difficulté: ${configQuiz.difficulte}</p>
        <p>Temps par question: ${configQuiz.timer} secondes</p>
        <h3>Meilleurs scores:</h3>
    `;
    const scores = Object.entries(configQuiz.meilleursScores).sort((a, b) => b[1].score - a[1].score);
    if (scores.length === 0) {
        details.innerHTML += "<p>Aucun score enregistré.</p>";
    } else {
        scores.forEach(([categorie, data]) => {
            details.innerHTML += `<p>${categorie}: ${data.score.toFixed(2)}% - ${data.pseudo}</p>`;
        });
    }
}

function reinitialiserQuiz() {
    indexQuestionCourante = 0;
    score = 0;
    questionsQuiz = [];
    afficherEcran("home-screen");
}