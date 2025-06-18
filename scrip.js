var settings = { username: "Player", numQuestions: 10 }; 
// Déclare un objet global pour stocker le nom d'utilisateur et le nombre de questions, initialisé avec des valeurs par défaut (diapo 5 : variables, diapo 33 : objets).
var questions = []; 
// Déclare un tableau global pour stocker les questions récupérées (diapo 5 : variables, diapo 11 : tableaux).
var currentIndex = 0; 
// Déclare une variable globale pour suivre l'index de la question actuelle (diapo 5 : variables).

function loadSettings() { // Définit une fonction pour charger les paramètres depuis localStorage (diapo 25 : fonctions).
    var saved = localStorage.getItem("quizSettings"); // Récupère la chaîne "quizSettings" depuis localStorage (diapo 46 : localStorage).
    if (saved) { // Vérifie si des données sauvegardées existent (diapo 9 : conditionnels).
        settings = JSON.parse(saved); // Convertit la chaîne JSON en objet et met à jour settings (diapo 46 : JSON.parse).
        document.getElementById("username").value = settings.username; // Définit la valeur de l'input username avec le nom sauvegardé (diapo 17 : getElementById, diapo 21 : valeur input).
        document.getElementById("num-questions").value = settings.numQuestions; // Définit la valeur de l'input nombre de questions avec le nombre sauvegardé (diapo 17, diapo 21).
    } // Ferme le bloc if.
} // Ferme la fonction.

function saveSettings() { // Définit une fonction pour sauvegarder les paramètres dans localStorage (diapo 25).
    var username = document.getElementById("username").value; // Récupère le nom d'utilisateur depuis le champ input (diapo 17, diapo 21).
    if (username === "") { // Vérifie si le nom est vide (diapo 9).
        username = "Player"; // Définit le nom par défaut si vide (diapo 9).
    } // Ferme le bloc if.
    var numQuestions = parseInt(document.getElementById("num-questions").value); // Récupère et convertit le nombre de questions en entier (diapo 17, diapo 21, diapo 7 : parseInt).
    if (numQuestions < 1 || isNaN(numQuestions)) { // Vérifie si le nombre est invalide (moins de 1 ou NaN) (diapo 9).
        numQuestions = 10; // Définit le nombre de questions par défaut si invalide (diapo 9).
    } // Ferme le bloc if.
    settings.username = username; // Met à jour l'objet settings avec le nom d'utilisateur (diapo 33).
    settings.numQuestions = numQuestions; // Met à jour l'objet settings avec le nombre de questions (diapo 33).
    localStorage.setItem("quizSettings", JSON.stringify(settings)); // Sauvegarde l'objet settings comme chaîne JSON dans localStorage (diapo 46 : setItem, JSON.stringify).
    alert("Paramètres sauvegardés !"); // Affiche un message de confirmation (diapo 20 : alert).
} // Ferme la fonction.

function showCategories() { // Définit une fonction pour afficher l'écran des catégories (diapo 25).
    document.getElementById("settings-screen").style.display = "none"; // Cache l'écran des paramètres en définissant display à none (diapo 17, diapo 24 : style).
    document.getElementById("categories-screen").style.display = "block"; // Affiche l'écran des catégories en définissant display à block (diapo 17, diapo 24).
    getCategories(); // Appelle la fonction pour récupérer et afficher les catégories (diapo 25).
} // Ferme la fonction.

async function getCategories() { // Définit une fonction asynchrone pour récupérer les catégories depuis l'API (diapo 52 : async/await).
    var response = await fetch("https://opentdb.com/api_category.php"); // Récupère les catégories depuis l'API Open Trivia, attend la réponse (diapo 52 : fetch).
    var data = await response.json(); // Convertit la réponse en JSON, attend le résultat (diapo 52 : json).
    var select = document.getElementById("category-select"); // Récupère l'élément select pour les catégories (diapo 17).
    select.innerHTML = ""; // Vide les options existantes dans l'élément select (diapo 24 : innerHTML).
    var defaultOption = document.createElement("option"); // Crée un nouvel élément option pour le choix par défaut (diapo 24 : createElement).
    defaultOption.value = ""; // Définit la valeur de l'option par défaut à vide (diapo 24).
    defaultOption.textContent = "Sélectionnez une catégorie"; // Définit le texte de l'option par défaut (diapo 24).
    select.appendChild(defaultOption); // Ajoute l'option par défaut à l'élément select (diapo 24 : appendChild).
    for (var i = 0; i < data.trivia_categories.length; i++) { // Parcourt le tableau des catégories (diapo 12 : boucle for).
        var option = document.createElement("option"); // Crée un nouvel élément option pour chaque catégorie (diapo 24).
        option.value = data.trivia_categories[i].id; // Définit la valeur de l'option à l'ID de la catégorie (diapo 24).
        option.textContent = data.trivia_categories[i].name; // Définit le texte de l'option au nom de la catégorie (diapo 24).
        select.appendChild(option); // Ajoute l'option à l'élément select (diapo 24).
    } // Ferme la boucle for.
} // Ferme la fonction.

function startQuiz() { // Définit une fonction pour démarrer le quiz (diapo 25).
    var category = document.getElementById("category-select").value; // Récupère l'ID de la catégorie sélectionnée (diapo 17, diapo 21).
    var url = "https://opentdb.com/api.php?amount=" + settings.numQuestions + "&type=multiple"; // Construit l'URL de base de l'API avec le nombre de questions (diapo 7 : concaténation de chaînes).
    if (category !== "") { // Vérifie si une catégorie est sélectionnée (diapo 9).
        url = url + "&category=" + category; // Ajoute la catégorie à l'URL si sélectionnée (diapo 7).
    } // Ferme le bloc if.
    getQuestions(url); // Appelle la fonction pour récupérer les questions avec l'URL construite (diapo 25).
} // Ferme la fonction.

async function getQuestions(url) { // Définit une fonction asynchrone pour récupérer les questions depuis l'API (diapo 52).
    var response = await fetch(url); // Récupère les questions avec l'URL fournie, attend la réponse (diapo 52).
    var data = await response.json(); // Convertit la réponse en JSON, attend le résultat (diapo 52).
    if (data.response_code === 0) { // Vérifie si la réponse de l'API est réussie (diapo 9).
        questions = data.results; // Stocke les questions récupérées dans le tableau global (diapo 11).
        currentIndex = 0; // Réinitialise l'index des questions à 0 (diapo 5).
        document.getElementById("categories-screen").style.display = "none"; // Cache l'écran des catégories (diapo 17, diapo 24).
        document.getElementById("quiz-screen").style.display = "block"; // Affiche l'écran du quiz (diapo 17, diapo 24).
        document.getElementById("username-display").textContent = "Joueur : " + settings.username; // Affiche le nom d'utilisateur (diapo 17, diapo 24 : textContent).
        showQuestion(); // Appelle la fonction pour afficher la première question (diapo 25).
    } else { // Gère le cas d'erreur de l'API (diapo 9).
        alert("Erreur lors du chargement des questions."); // Affiche un message d'erreur (diapo 20).
    } // Ferme le bloc if-else.
} // Ferme la fonction.

function showQuestion() { // Définit une fonction pour afficher la question actuelle (diapo 25).
    var question = questions[currentIndex]; // Récupère l'objet de la question actuelle (diapo 11).
    document.getElementById("question-number").textContent = "Question " + (currentIndex + 1); // Affiche le numéro de la question (diapo 17, diapo 24).
    document.getElementById("question-text").textContent = question.question; // Affiche le texte de la question (diapo 17, diapo 24).
    var answers = []; // Crée un tableau pour stocker les réponses (diapo 11).
    for (var i = 0; i < question.incorrect_answers.length; i++) { // Parcourt les réponses incorrectes (diapo 12).
        answers[i] = question.incorrect_answers[i]; // Ajoute chaque réponse incorrecte au tableau (diapo 11).
    } // Ferme la boucle for.
    answers[answers.length] = question.correct_answer; // Ajoute la réponse correcte à la fin du tableau (diapo 11).
    for (i = answers.length - 1; i > 0; i--) { // Parcourt le tableau à l'envers pour mélanger les réponses (diapo 12).
        var j = Math.floor(Math.random() * (i + 1)); // Génère un index aléatoire (diapo 7 : Math.random).
        var temp = answers[i]; // Stocke temporairement la réponse actuelle (diapo 5).
        answers[i] = answers[j]; // Échange la réponse actuelle avec une réponse aléatoire (diapo 11).
        answers[j] = temp; // Complète l'échange (diapo 11).
    } // Ferme la boucle for.
    var answersDiv = document.getElementById("answers"); // Récupère la div pour les réponses (diapo 17).
    answersDiv.innerHTML = ""; // Vide les réponses précédentes (diapo 24).
    for (i = 0; i < answers.length; i++) { // Parcourt les réponses mélangées (diapo 12).
        var button = document.createElement("button"); // Crée un bouton pour chaque réponse (diapo 24).
        button.textContent = answers[i]; // Définit le texte du bouton comme la réponse (diapo 24).
        button.className = "answer-btn"; // Ajoute la classe CSS pour styliser le bouton (diapo 29 : className).
        answersDiv.appendChild(button); // Ajoute le bouton à la div des réponses (diapo 24).
    } // Ferme la boucle for.
} // Ferme la fonction.

function nextQuestion() { // Définit une fonction pour passer à la question suivante (diapo 25).
    currentIndex = currentIndex + 1; // Incrémente l'index de la question (diapo 5).
    if (currentIndex < questions.length) { // Vérifie s'il reste des questions (diapo 9).
        showQuestion(); // Affiche la question suivante (diapo 25).
    } else { // Si toutes les questions sont affichées (diapo 9).
        document.getElementById("quiz-screen").style.display = "none"; // Cache l'écran du quiz (diapo 17, diapo 24).
        document.getElementById("settings-screen").style.display = "block"; // Affiche l'écran des paramètres (diapo 17, diapo 24).
    } // Ferme le bloc if-else.
} // Ferme la fonction.

function goBack() { // Définit une fonction pour revenir à l'écran des paramètres (diapo 25).
    document.getElementById("categories-screen").style.display = "none"; // Cache l'écran des catégories (diapo 17, diapo 24).
    document.getElementById("settings-screen").style.display = "block"; // Affiche l'écran des paramètres (diapo 17, diapo 24).
} // Ferme la fonction.

document.getElementById("save-btn").addEventListener("click", function() { // Attache un écouteur d'événement clic au bouton de sauvegarde (diapo 20 : addEventListener).
    saveSettings(); // Appelle la fonction pour sauvegarder les paramètres (diapo 25).
}); // Ferme l'écouteur.
document.getElementById("category-btn").addEventListener("click", function() { // Attache un écouteur clic au bouton des catégories (diapo 20).
    showCategories(); // Appelle la fonction pour afficher les catégories (diapo 25).
}); // Ferme l'écouteur.
document.getElementById("start-btn").addEventListener("click", function() { // Attache un écouteur clic au bouton de démarrage du quiz (diapo 20).
    startQuiz(); // Appelle la fonction pour démarrer le quiz (diapo 25).
}); // Ferme l'écouteur.
document.getElementById("next-btn").addEventListener("click", function() { // Attache un écouteur clic au bouton de question suivante (diapo 20).
    nextQuestion(); // Appelle la fonction pour passer à la question suivante (diapo 25).
}); // Ferme l'écouteur.
document.getElementById("back-settings-btn").addEventListener("click", function() { // Attache un écouteur clic au bouton de retour (diapo 20).
    goBack(); // Appelle la fonction pour revenir aux paramètres (diapo 25).
}); // Ferme l'écouteur.
document.getElementById("num-questions").addEventListener("keypress", function(event) { // Attache un écouteur keypress à l'input du nombre de questions (diapo 22 : keypress).
    if (event.key === "Enter") { // Vérifie si la touche Entrée est pressée (diapo 9).
        saveSettings(); // Appelle la fonction pour sauvegarder les paramètres (diapo 25).
    } // Ferme le bloc if.
}); // Ferme l'écouteur.

loadSettings(); // Appelle la fonction pour charger les paramètres au démarrage (diapo 25).