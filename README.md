# HaruNote 🌱

A Korean vocabulary notebook for collecting words, organising them with tags, and practising with flashcards.

## Features

- Add, edit, and delete Korean vocabulary.
- Search by Korean word or English meaning.
- Create custom tags and filter vocabulary by tag.
- Select tags using a searchable picker and remove them individually.
- Delete a tag across the notebook.
- Review vocabulary on a separate flashcard page.
- Save vocabulary automatically in browser storage.
- Use a responsive layout on desktop and mobile.

## Built with

- HTML
- CSS
- JavaScript
- Browser localStorage

## Run locally

With Python installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Then [open HaruNote](http://127.0.0.1:8000/index.html). Keep the server running while using the app.

## How vocabulary is saved

Vocabulary is stored in the browser on the current device. Refreshing the page keeps saved words, but clearing the website’s browser data removes them.

This version does not include accounts, a SQL database, or cross-device syncing.

## About this project

I’m building HaruNote to practise web development and create something useful for learning Korean. This initial release focuses on vocabulary management, custom tags, and flashcard review.
