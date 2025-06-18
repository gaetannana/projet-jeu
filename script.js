let quizConfig = { pseudo: "Joueur Anonyme", nombreQuestions: 10 };
let listeCategories = [];
let questionsQuiz = [];
let indexQuestionCourante = 0;

document.addEventListener("DOMContentLoaded", () => {
    chargerParametres();
    recupererCategories();
});

function afficherEcran(idEcran) {
    document.querySelectorAll(".screen").forEach(ecran => {
        ecran.style.display = "none";
    });
    document.getElementById(idEcran).style.display = "block";

    if (idEcran === "categories-screen") {
        sauvegarderParametres();
        afficherCategories();
    }
}

function sauvegarderParametres() {
    let pseudoSaisi = document.getElementById("username").value;
    let nombreQuestionsSaisi = parseInt(document.getElementById("num-questions").value);

    quizConfig.pseudo = pseudoSaisi.trim() === "" ? "Joueur Anonyme" : pseudoSaisi;
    quizConfig.nombreQuestions = isNaN(nombreQuestionsSaisi) || nombreQuestionsSaisi < 1 ? 10 : nombreQuestionsSaisi;

    localStorage.setItem("configQuiz", JSON.stringify(quizConfig));
}

function chargerParametres() {
    const configSauvegardee = localStorage.getItem("configQuiz");
    if (configSauvegardee) {
        quizConfig = JSON.parse(configSauvegardee);
        document.getElementById("username").value = quizConfig.pseudo;
        document.getElementById("num-questions").value = quizConfig.nombreQuestions;
    }
}

async function recupererCategories() {
    try {
        const reponse = await fetch("https://opentdb.com/api_category.php");
        const donnees = await reponse.json();
        listeCategories = donnees.trivia_categories;
    } catch (erreur) {
        console.error("Erreur lors de la récupération des catégories :", erreur);
    }
}

function afficherCategories() {
    const menuCategories = document.getElementById("category-select");
    menuCategories.innerHTML = "";

    const optionDefaut = document.createElement("option");
    optionDefaut.value = "";
    optionDefaut.textContent = "Choisir une catégorie";
    menuCategories.appendChild(optionDefaut);

    listeCategories.forEach(categorie => {
        const option = document.createElement("option");
        option.value = categorie.id;
        option.textContent = categorie.name;
        menuCategories.appendChild(option);
    });
}

function lancerQuiz() {
    const categorieChoisie = document.getElementById("category-select").value;
    let urlApi = `https://opentdb.com/api.php?amount=${quizConfig.nombreQuestions}`;
    
    if (categorieChoisie !== "") {
        urlApi += `&category=${categorieChoisie}`;
    }
    
    recupererQuestions(urlApi);
}

async function recupererQuestions(urlApi) {
    try {
        const reponse = await fetch(urlApi);
        const donnees = await reponse.json();
        
        if (donnees.response_code === 0) {
            questionsQuiz = donnees.results;
            indexQuestionCourante = 0;
            afficherEcran("quiz-screen");
            document.getElementById("username-display").textContent = `Joueur : ${quizConfig.pseudo}`;
            afficherQuestion();
        } else {
            alert("Échec du chargement des questions. Veuillez réessayer.");
        }
    } catch (erreur) {
        console.error("Erreur lors de la récupération des questions :", erreur);
        alert("Une erreur s'est produite lors du chargement des questions.");
    }
}

function afficherQuestion() {
    const questionCourante = questionsQuiz[indexQuestionCourante];
    
    document.getElementById("question-number").textContent = `Question ${indexQuestionCourante + 1}`;
    document.getElementById("question-text").textContent = questionCourante.question;

    let reponses = [...questionCourante.incorrect_answers, questionCourante.correct_answer];
    reponses = melangerTableau(reponses);

    const conteneurReponses = document.getElementById("answers");
    conteneurReponses.innerHTML = "";
    reponses.forEach(reponse => {
        const bouton = document.createElement("button");
        bouton.className = "answer-btn";
        bouton.textContent = reponse;
        conteneurReponses.appendChild(bouton);
    });
}



function melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
}

function passerQuestionSuivante() {
    indexQuestionCourante++;
    if (indexQuestionCourante < questionsQuiz.length) {
        afficherQuestion();
    } else {
        afficherEcran("settings-screen");
    }
}

function retourParametres() {
    afficherEcran("settings-screen");
}

document.getElementById("save-btn").addEventListener("click", () => {
    sauvegarderParametres();
    afficherEcran("categories-screen");
});

document.getElementById("category-btn").addEventListener("click", () => {
    afficherEcran("categories-screen");
});

document.getElementById("start-btn").addEventListener("click", lancerQuiz);

document.getElementById("next-btn").addEventListener("click", passerQuestionSuivante);

document.getElementById("back-settings-btn").addEventListener("click", retourParametres);

document.getElementById("num-questions").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sauvegarderParametres();
        afficherEcran("categories-screen");
    }
});