const reviewWords = JSON.parse(
    localStorage.getItem("harunote-words") || "[]"
);

let cardIndex = 0;

function showCard() {
    const hasWords = reviewWords.length > 0;

    document.getElementById("flashcard-panel").hidden = !hasWords;
    document.getElementById("review-empty").hidden = hasWords;

    if (!hasWords) {
        document.getElementById("review-progress").textContent = "";
        return;
    }

    const word = reviewWords[cardIndex];

    document.getElementById("flashcard-korean").textContent = word.korean;
    document.getElementById("flashcard-meaning").textContent = word.meaning;
    document.getElementById("flashcard-meaning").hidden = true;

    document.getElementById("reveal-answer").textContent = "Show meaning";

    document.getElementById("review-progress").textContent =
        "Card " + (cardIndex + 1) + " of " + reviewWords.length;
}

document.getElementById("reveal-answer").addEventListener("click", function () {
    const meaning = document.getElementById("flashcard-meaning");

    meaning.hidden = !meaning.hidden;
    this.textContent = meaning.hidden ? "Show meaning" : "Hide meaning";
});

document.getElementById("next-card").addEventListener("click", function () {
    if (reviewWords.length === 0) {
        return;
    }

    cardIndex = (cardIndex + 1) % reviewWords.length;
    showCard();
});

showCard();