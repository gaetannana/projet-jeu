// Configuration et état du quiz
let configQuiz = { pseudo: "Joueur Anonyme", nombreQuestions: 10 };
let listeCategories = [];
let questionsQuiz = [];
let indexQuestionCourante = 0;

// Initialisation de l'application lorsque le DOM est chargé
document.addEventListener("DOMContentLoaded", () => {
    // Charger les paramètres sauvegardés et récupérer les catégories
    chargerParametres();
    recupererCategories();
});

// Afficher un écran spécifique (paramètres, catégories, quiz)
function afficherEcran(idEcran) {
    // Masquer tous les écrans
    document.querySelectorAll(".screen").forEach(ecran => {
        ecran.style.display = "none";
    });
    // Afficher l'écran demandé
    document.getElementById(idEcran).style.display = "block";

    // Si l'écran des catégories est affiché, sauvegarder les paramètres et afficher les catégories
    if (idEcran === "categories-screen") {
        sauvegarderParametres();
        afficherCategories();
    }
}

// Sauvegarder les paramètres dans localStorage
function sauvegarderParametres() {
    // Récupérer le pseudo et le nombre de questions des champs de saisie
    let pseudoSaisi = document.getElementById("username").value;
    let nombreQuestionsSaisi = parseInt(document.getElementById("num-questions").value);

    // Définir des valeurs par défaut si les entrées sont invalides
    configQuiz.pseudo = pseudoSaisi.trim() === "" ? "Joueur Anonyme" : pseudoSaisi;
    configQuiz.nombreQuestions = isNaN(nombreQuestionsSaisi) || nombreQuestionsSaisi < 1 ? 10 : nombreQuestionsSaisi;

    // Sauvegarder dans localStorage
    localStorage.setItem("configQuiz", JSON.stringify(configQuiz));
}

// Charger les paramètres depuis localStorage
function chargerParametres() {
    // Récupérer et analyser les paramètres sauvegardés
    const configSauvegardee = localStorage.getItem("configQuiz");
    if (configSauvegardee) {
        configQuiz = JSON.parse(configSauvegardee);
        // Mettre à jour les champs de saisie avec les valeurs sauvegardées
        document.getElementById("username").value = configQuiz.pseudo;
        document.getElementById("num-questions").value = configQuiz.nombreQuestions;
    }
}

// Récupérer les catégories depuis l'API OpenTDB
async function recupererCategories() {
    try {
        const reponse = await fetch("https://opentdb.com/api_category.php");
        const donnees = await reponse.json();
        listeCategories = donnees.trivia_categories;
    } catch (erreur) {
        console.error("Erreur lors de la récupération des catégories :", erreur);
    }
}

// Afficher les catégories dans le menu déroulant
function afficherCategories() {
    const menuCategories = document.getElementById("category-select");
    menuCategories.innerHTML = ""; // Vider les options existantes

    // Ajouter une option par défaut
    const optionDefaut = document.createElement("option");
    optionDefaut.value = "";
    optionDefaut.textContent = "Choisir une catégorie";
    menuCategories.appendChild(optionDefaut);

    // Ajouter chaque catégorie comme option
    listeCategories.forEach(categorie => {
        const option = document.createElement("option");
        option.value = categorie.id;
        option.textContent = categorie.name;
        menuCategories.appendChild(option);
    });
}

// Lancer le quiz en récupérant les questions selon les paramètres
function lancerQuiz() {
    const categorieChoisie = document.getElementById("category-select").value;
    let urlApi = `https://opentdb.com/api.php?amount=${configQuiz.nombreQuestions}`;
    
    // Ajouter la catégorie à l'URL si sélectionnée
    if (categorieChoisie !== "") {
        urlApi += `&category=${categorieChoisie}`;
    }
    
    recupererQuestions(urlApi);
}

// Récupérer les questions depuis l'API OpenTDB
async function recupererQuestions(urlApi) {
    try {
        const reponse = await fetch(urlApi);
        const donnees = await reponse.json();
        
        if (donnees.response_code === 0) {
            questionsQuiz = donnees.results;
            indexQuestionCourante = 0;
            afficherEcran("quiz-screen");
            // Afficher le pseudo
            document.getElementById("username-display").textContent = `Joueur : ${configQuiz.pseudo}`;
            afficherQuestion();
        } else {
            alert("Échec du chargement des questions. Veuillez réessayer.");
        }
    } catch (erreur) {
        console.error("Erreur lors de la récupération des questions :", erreur);
        alert("Une erreur s'est produite lors du chargement des questions.");
    }
}

// Afficher la question courante et ses réponses
function afficherQuestion() {
    const questionCourante = questionsQuiz[indexQuestionCourante];
    
    // Mettre à jour le numéro et le texte de la question
    document.getElementById("question-number").textContent = `Question ${indexQuestionCourante + 1}`;
    document.getElementById("question-text").textContent = questionCourante.question;

    // Préparer les réponses (combiner correctes et incorrectes, puis mélanger)
    let reponses = [...questionCourante.incorrect_answers, questionCourante.correct_answer];
    reponses = melangerTableau(reponses);

    // Afficher les réponses
    const conteneurReponses = document.getElementById("answers");
    conteneurReponses.innerHTML = "";
    reponses.forEach(reponse => {
        const bouton = document.createElement("button");
        bouton.className = "answer-btn";
        bouton.textContent = reponse;
        conteneurReponses.appendChild(bouton);
    });
}

// Mélanger un tableau (algorithme de Fisher-Yates)
function melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
}

// Passer à la question suivante ou retourner à l'écran des paramètres
function passerQuestionSuivante() {
    indexQuestionCourante++;
    if (indexQuestionCourante < questionsQuiz.length) {
        afficherQuestion();
    } else {
        afficherEcran("settings-screen");
    }
}

// Retourner à l'écran des paramètres
function retourParametres() {
    afficherEcran("settings-screen");
}

// Écouteurs d'événements pour les boutons
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

// Gérer la touche Entrée dans le champ du nombre de questions
document.getElementById("num-questions").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sauvegarderParametres();
        afficherEcran("categories-screen");
    }
});