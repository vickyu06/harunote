const selectedMode = new URLSearchParams(window.location.search).get("mode") === "selected";

const allReviewWords = JSON.parse(
    selectedMode
        ? sessionStorage.getItem("harunote-review-selection") || "[]"
        : localStorage.getItem("harunote-words") || "[]"
);

let reviewWords = allReviewWords.slice();

let cardIndex = 0;
const cardRatings = new Map();

function showCard() {

    const isComplete = updateReviewStats();

    if("speechSynthesis" in window){
        window.speechSynthesis.cancel();
    }

    const hasWords = reviewWords.length > 0;

    document.getElementById("flashcard-panel").hidden = !hasWords;
    document.getElementById("review-empty").hidden = hasWords;

    if (!hasWords) {
        document.getElementById("review-progress").textContent = "";
        return;
    }

    if(isComplete){
        document.getElementById("flashcard-panel").hidden = true;
        document.getElementById("review-progress").textContent = reviewWords.length + " of " + reviewWords.length + " cards reviewed";
        return;
    }

    const word = reviewWords[cardIndex];

    document.getElementById("flashcard-korean").textContent = word.korean;
    document.getElementById("flashcard-meaning").textContent = word.meaning;
    document.getElementById("flashcard-meaning").hidden = true;
    document.getElementById("rating-panel").hidden = true;

    document.getElementById("reveal-answer").textContent = "Show meaning";

    document.getElementById("review-progress").textContent =
        "Card " + (cardIndex + 1) + " of " + reviewWords.length;
}

document.getElementById("reveal-answer").addEventListener("click", function () {
    const meaning = document.getElementById("flashcard-meaning");

    meaning.hidden = !meaning.hidden;
    document.getElementById("rating-panel").hidden = meaning.hidden;
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

document.getElementById("shuffle-cards").addEventListener("click", function(){
    for(let i=reviewWords.length - 1; i> 0; i--){
        const randomIndex = Math.floor(Math.random() * (i+1));

        const temporaryWord = reviewWords[i];
        reviewWords[i] = reviewWords[randomIndex];
        reviewWords[randomIndex] = temporaryWord;
    }

    cardIndex = 0;
    showCard();
});

document.getElementById("speak-card").addEventListener("click", function(){
    const status = document.getElementById("speech-status");
    status.textContent = "";

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        status.textContent = "Speech playback isn't supported in this browser.";
        return;
    }

    if(reviewWords.length === 0){
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        reviewWords[cardIndex].korean
    );

    speech.lang = "ko-KR";
    speech.rate = 0.85;

    speech.onerror = function(event){
        if(event.error !== "interrupted" && event.error !== "canceled"){
            status.textContent = "Could not play Korean speech. You may need to enable a Korean voice on your device.";
        }
    };

    window.speechSynthesis.speak(speech);
});

function rateCard(rating){
    if(reviewWords.length === 0){
        return;
    }

    const currentWord = reviewWords[cardIndex];
    cardRatings.set(currentWord, rating);

    cardIndex = (cardIndex + 1) % reviewWords.length;
    showCard();
}

document.getElementById("remembered-card").addEventListener("click", function(){
    rateCard("remembered");
});

document.getElementById("again-card").addEventListener("click", function(){
    rateCard("again");
})

function updateReviewStats(){
    let remembered = 0;
    let again = 0;

    for(const word of reviewWords){
        const rating = cardRatings.get(word);

        if(rating === "remembered"){
            remembered++;
        }else if (rating === "again"){
            again++;
        }
    }

    const remaining = reviewWords.length - remembered - again;
    const stats = document.getElementById("review-stats");

    stats.hidden = reviewWords.length === 0;

    stats.textContent =
        "✓ " + remembered + " remembered · " +
        "X " + again + " to practise · " +
        remaining + " unrated";

    document.getElementById("retry-cards").disabled = again === 0;

    document.getElementById("restart-review").disabled = allReviewWords.length === 0;

    const isComplete = reviewWords.length > 0 && remaining === 0;

    document.getElementById("review-complete").hidden = !isComplete;

    return isComplete;
}

const reviewTagSelect = document.getElementById("review-tag");
const reviewTags = [];

for(const word of allReviewWords){
    for(const tag of word.tags || []){
        if(!reviewTags.includes(tag)){
            reviewTags.push(tag);
        }
    }
}

for(const tag of reviewTags.sort()){
    const label = tag.charAt(0).toUpperCase() + tag.slice(1);
    reviewTagSelect.appendChild(new Option(label, tag));
}

function startReview(){
    const selectedTag = reviewTagSelect.value;

    reviewWords = allReviewWords.filter(function (word) {
        return selectedTag === "" || (word.tags || []).includes(selectedTag);
    });

    cardRatings.clear();
    cardIndex = 0;
    showCard();
}

reviewTagSelect.addEventListener("change", startReview);

document.getElementById("restart-review").addEventListener("click", startReview);

document.getElementById("retry-cards").addEventListener("click",function(){
    const difficultWords = reviewWords.filter(function(word){
        return cardRatings.get(word) === "again";
    });

    if(difficultWords.length === 0){
        return;
    }

    reviewWords = difficultWords;

    for(const word of reviewWords){
        cardRatings.delete(word);
    }

    cardIndex = 0;
    showCard();
})