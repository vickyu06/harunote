const form = document.getElementById("vocabulary-form");

const cancelButton = document.getElementById("cancel-edit");

let editingWord = null;

const words = JSON.parse(
    localStorage.getItem("harunote-words") || "[]"
)

const selectedWords = new Set();

let selectionMode = false;

function displayWords(){
    const wordList = document.getElementById("word-list");
    wordList.textContent = "";

    for (const word of words){
    const wordItem = document.createElement("li");
    const wordText = document.createElement("span");
    wordText.textContent = word.korean + " - " + word.meaning;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "word-checkbox";
    checkbox.hidden = !selectionMode;
    checkbox.checked = selectedWords.has(word);

    checkbox.setAttribute(
        "aria-label",
        "Select " + word.korean + " for flashcards"
    );

    checkbox.addEventListener("change", function(){
        if(this.checked){
            selectedWords.add(word);
        }else{
            selectedWords.delete(word);
        }

        updateSelectionCount();
    });

    const wordContent = document.createElement("div");
    wordContent.className = "word-content";
    wordContent.appendChild(wordText);

    const tagList = document.createElement("div");
    tagList.className = "tag-list";

    for(const tag of word.tags || []){
        const tagBadge = document.createElement("span");
        tagBadge.className = "tag";
        tagBadge.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);

        tagList.appendChild(tagBadge);
    }

    if(tagList.children.length >0){
        wordContent.appendChild(tagList);
    }

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.type = "button";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function(){
        editingWord = word;

        cancelButton.hidden = false;

        document.getElementById("korean-word").value = word.korean;
        document.getElementById("english-meaning").value = word.meaning;
        document.getElementById("word-tags").value = (word.tags || []).join(", ");
        displaySelectedTags();

        form.querySelector('button[type="submit"]').textContent = "Save changes";
        document.getElementById("korean-word").focus();
    })

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function(){
        if(editingWord === word){
            editingWord = null;
            form.reset();
            document.getElementById("word-tags").value="";
            displaySelectedTags();

            form.querySelector('button[type="submit"]').textContent = "Save word";
            cancelButton.hidden = true;
        }
        const index = words.indexOf(word);
        selectedWords.delete(word);
        words.splice(index, 1);

        localStorage. setItem("harunote-words", JSON.stringify(words));

        displayWords();
        updateSelectionCount();
    })

    const wordActions = document.createElement("div");
    wordActions.className = "word-actions";

    wordActions.appendChild(editButton);
    wordActions.appendChild(deleteButton);

    const wordMain = document.createElement("div");
    wordMain.className = "word-main";

    wordMain.appendChild(checkbox);
    wordMain.appendChild(wordContent);

    wordItem.appendChild(wordMain);
    wordItem.appendChild(wordActions);
    wordList.appendChild(wordItem);
    }

    document.getElementById("empty-message").hidden = words.length > 0;

    const count = words.length;

    document.getElementById("word-count").textContent = count + (count === 1 ? " word" : " words");
    updateTagFiler();
    filterWords();
    updateSelectionCount();
}

displayWords();
updateSelectionCount();

form.addEventListener("submit", function(event){
    event.preventDefault();

    const korean = document.getElementById("korean-word").value.trim();
    const meaning = document.getElementById("english-meaning").value.trim();

    if (korean === "" || meaning === ""){
        alert("Please enter both a Korean word and its meaning.");
        return;
    }

    const tagText = document.getElementById("word-tags").value;
    const tags = [];

    for(const part of tagText.split(",")){
        const tag = part.trim().toLowerCase();

        if (tag!= "" && !tags.includes(tag)){
            tags.push(tag);
        }
    }

    if(editingWord === null){
        words.push({
            korean: korean,
            meaning: meaning,
            tags: tags
        });
    }else{
        editingWord.korean = korean;
        editingWord.meaning = meaning;
        editingWord.tags = tags;
    }

    localStorage.setItem("harunote-words", JSON.stringify(words));

    displayWords();
    updateSelectionCount();

    form.reset();
    document.getElementById("word-tags").value="";
    displaySelectedTags();
    editingWord = null;

    form.querySelector('button[type="submit"]').textContent = "Save word";
    cancelButton.hidden = true;
})

function filterWords(){
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    const selectedTag = document.getElementById("tag-filter").value;
    const wordList = document.getElementById("word-list");

    let matchCount = 0;

    for(const wordItem of wordList.children){
        const text = wordItem.querySelector("span").textContent.toLowerCase();

        let matchesTag = selectedTag === "";

        for (const badge of wordItem.querySelectorAll(" .tag")){
            if(badge.textContent.toLowerCase() === selectedTag){
                matchesTag = true;
            }
        }

        const matches = text.includes(query) && matchesTag;
        wordItem.hidden = !matches;

        if(matches){
            matchCount++;
        }
    }
    document.getElementById("no-results").hidden = matchCount > 0 || words.length === 0;
    updateSelectionCount();
}

document.getElementById("search-input").addEventListener("input", filterWords);

cancelButton.addEventListener("click", function(){
    editingWord = null;
    form.reset();
    document.getElementById("word-tags").value="";
    displaySelectedTags();

    form.querySelector('button[type="submit"]').textContent = "Save word";
    cancelButton.hidden = true;
});

function updateTagFiler(){
    const tagFilter = document.getElementById("tag-filter");
    const selectedTag = tagFilter.value;
    const allTags =[];

    for(const word of words){
        for(const tag of word.tags || []){
            if(!allTags.includes(tag)){
                allTags.push(tag);
            }
        }
    }

    allTags.sort();

    tagFilter.textContent="";
    tagFilter.appendChild(new Option("All tags", ""));

    for(const tag of allTags){
        const label = tag.charAt(0).toUpperCase() + tag.slice(1);
        tagFilter.appendChild(new Option(label, tag));
    }

    tagFilter.value = allTags.includes(selectedTag)? selectedTag : "";
}

document.getElementById("tag-filter").addEventListener("change", filterWords);

document.getElementById("delete-tag").addEventListener("click",function(){
    const selectedTag = document.getElementById("tag-filter").value;

    if(selectedTag ===""){
        alert("Please select a tag to delete.")
        return;
    }

    const confirmed = confirm(
        "Delete this tag from every word? Your vocabulary entries will stay."
    )

    if(!confirmed){
        return;
    }

    for(const word of words){
        word.tags = (word.tags || []).filter(function (tag){
            return tag !== selectedTag;
        });
    }

    const tagInput = document.getElementById("word-tags");

    tagInput.value = tagInput.value.split(",").filter(function (tag){
        return tag.trim().toLowerCase() !== selectedTag;
    }).join(", ");

    displaySelectedTags();

    localStorage.setItem("harunote-words", JSON.stringify(words));

    displayWords();
    updateSelectionCount();
})

function displaySelectedTags(){
    const container = document.getElementById("selected-tags");
    const tagInput = document.getElementById("word-tags");

    const tags = tagInput.value.split(",").map(function(tag){
        return tag.trim();
    }).filter(function(tag){
        return tag !== "";
    })

    container.textContent = "";

    for(const tag of tags){
        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-tag";
        removeButton.textContent = "x";
        removeButton.setAttribute("aria-label", "Remove tag" + tag);

        removeButton.addEventListener("click", function(){
            tagInput.value = tags.filter(function(item){
                return item !== tag;
            }).join(", ");

            displaySelectedTags();
        })

        badge.appendChild(removeButton);
        container.appendChild(badge);
    }
}

document.getElementById("add-tag").addEventListener("click", function(){
    const popover = document.getElementById("tag-popover");
    const shouldOpen = popover.hidden;

    popover.hidden = !shouldOpen;
    this.setAttribute("aria-expanded", String(shouldOpen));

    if(shouldOpen){
        document.getElementById("tag-search").focus();
    }
})

function closeTagPicker(){
    document.getElementById("tag-popover").hidden = true;
    document.getElementById("add-tag").setAttribute("aria-expanded", "false");
    document.getElementById("tag-search").value= "";
}

document.getElementById("tag-search").addEventListener("keydown", function(event){
    if(event.key !== "Enter" || event.isComposing){
        return;
    }

    event.preventDefault();
    selectTag(this.value);
})

document.addEventListener("click", function(event){
    if(!event.target.closest(".tag-picker")){
        closeTagPicker();
    }
});

function selectTag(tag){
    tag = tag.trim().toLowerCase();

    if(tag.includes(",")){
        alert("Please add one tag at a time.");
        return;
    }

    const tagInput = document.getElementById("word-tags");

    const tags = tagInput.value.split(",").map(function(item){
        return item.trim();
    }).filter(function(item){
        return item !== "";
    });

    if(tag !== "" && !tags.includes(tag)){
        tags.push(tag);
    }

    tagInput.value = tags.join(", ");
    displaySelectedTags();
    closeTagPicker();
    document.getElementById("add-tag").focus();
}

function displayTagOptions() {
    const options = document.getElementById("tag-options");
    const query = document.getElementById("tag-search")
        .value.trim().toLowerCase();

    const allTags = [];

    for (const word of words) {
        for (const tag of word.tags || []) {
            if (!allTags.includes(tag)) {
                allTags.push(tag);
            }
        }
    }

    options.textContent = "";

    for (const tag of allTags.sort()) {
        if (!tag.includes(query)) {
            continue;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "tag-option";
        button.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);

        button.addEventListener("click", function () {
            selectTag(tag);
        });

        options.appendChild(button);
    }

    if (options.children.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No saved tags match. Type a new tag and press Enter.";
        options.appendChild(message);
    }
}

document.getElementById("tag-search").addEventListener("input", displayTagOptions);
document.getElementById("tag-search").addEventListener("focus", displayTagOptions);

function updateSelectionCount(){
    const count = selectedWords.size;

    document.getElementById("selection-count").textContent = count + (count === 1 ? " word selected" : " words selected");
    document.getElementById("clear-selection").disabled = count === 0;
    const uncheckedVisible = document.querySelectorAll("#word-list > li:not([hidden]) .word-checkbox:not(:checked)");
    document.getElementById("select-visible").disabled = uncheckedVisible.length === 0;
    document.getElementById("practice-selected").disabled = count === 0;
}

document.getElementById("toggle-selection").addEventListener("click", function(){
    selectionMode = !selectionMode;

    this.textContent = selectionMode ? "Cancel selection" : "Select words";
    this.setAttribute("aria-expanded", String(selectionMode));

    document.getElementById("selection-controls").hidden = !selectionMode;

    if(!selectionMode){
        selectedWords.clear();
    }

    displayWords();
})

document.getElementById("select-visible").addEventListener("click", function(){
    const checkboxes = document.querySelectorAll("#word-list > li:not([hidden]) .word-checkbox:not(:checked)");
    for (const checkbox of checkboxes){
        checkbox.click();
    }
});

document.getElementById("clear-selection").addEventListener("click", function(){
    selectedWords.clear();
    displayWords();
});

document.getElementById("practice-selected").addEventListener("click", function(){
    if(selectedWords.size === 0){
        return;
    }

    const chosenWords = Array.from(selectedWords);

    sessionStorage.setItem("harunote-review-selection", JSON.stringify(chosenWords));
    window.location.href = "flashcards.html?mode=selected";
});