import { initUI } from './ui.js';
import { loadSettings } from './storage.js';
import { initQuiz } from './quiz.js';
import { fetchQuestions } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const settings = loadSettings();
    initUI(settings);
    initQuiz(fetchQuestions);
});