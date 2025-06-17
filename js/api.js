// Gestion des appels à l'API OpenTDB
export async function fetchQuestions(category, amount) {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}