
const API_URL = 'http://localhost:3000/books';

let books = [];
let currentBookId = null;
let currentGenre = null;

async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        books = await response.json();
        refreshAll();

    } catch (error) {
        console.error(error);
        alert('Impossible de se connecter au JSON Server');
    }
}

async function toggleALire(id) {
    const book = books.find(book => book.id === id);

    if (!book) return;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aLire: !book.aLire
            })
        });

        await fetchBooks();

    } catch (error) {

        console.error(error);

    }
}

async function saveBook(bookData, id = null) {

    try {

        if (id) {

            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });

        } else {

            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });

        }

        await fetchBooks();

    } catch (error) {

        console.error(error);

    }

}

async function deleteBook(id) {

    const confirmed = confirm('Supprimer ce livre ?');

    if (!confirmed) return;

    try {

        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        await fetchBooks();

    } catch (error) {

        console.error(error);

    }

}

function renderBooks(filteredBooks = books) {

    const container = document.getElementById('books-grid');

    container.innerHTML = '';

    filteredBooks.forEach(book => {

        const card = document.createElement('div');

        card.className = 'book-card';

        card.innerHTML = `
                    <img
                        src="${book.couverture}"
                        alt="${book.titre}"
                        class="book-image"
                    >

                    <div class="book-info">

                        <h3 class="book-title">
                            ${book.titre}
                        </h3>

                        <p class="book-author">
                            ${book.auteur}
                        </p>

                        <div class="book-footer">

                            <span class="genre-badge">
                                ${book.genre}
                            </span>

                            <button
                                class="bookmark-btn ${book.aLire ? 'bookmark-active' : 'bookmark-inactive'}"
                                onclick="event.stopPropagation(); toggleALire(${book.id})"
                            >
                                <i class="fa-solid fa-bookmark"></i>
                            </button>

                        </div>

                    </div>
                `;

    });

}


function renderReadingList() {

    const readingBooks = books.filter(book => book.aLire);

    const container = document.getElementById('reading-grid');

    container.innerHTML = '';

    document
        .getElementById('empty-reading')
        .classList.toggle('hidden', readingBooks.length > 0);

    readingBooks.forEach(book => {

        const card = document.createElement('div');

        card.className = 'book-card';

        card.innerHTML = `
                    <img
                        src="${book.couverture}"
                        alt="${book.titre}"
                        class="book-image"
                    >

                    <div class="book-info">

                        <h3 class="book-title">
                            ${book.titre}
                        </h3>

                        <p class="book-author">
                            ${book.auteur}
                        </p>

                        <button
                            class="btn-remove"
                            onclick="event.stopPropagation(); toggleALire(${book.id})"
                        >
                            Retirer
                        </button>

                    </div>
                `;


    });

}

function renderAdminTable() {

    const tbody = document.getElementById('admin-table-body');

    tbody.innerHTML = '';

    books.forEach(book => {

        const row = document.createElement('tr');

        row.innerHTML = `
                    <td>
                        <img
                            src="${book.couverture}"
                            class="table-cover"
                        >
                    </td>

                    <td>
                        <strong>${book.titre}</strong>
                    </td>

                    <td>${book.auteur}</td>

                    <td>
                        <span class="genre-badge">
                            ${book.genre}
                        </span>
                    </td>

                    <td class="action-cell">

                        <button
                            class="icon-btn edit-btn"
                            onclick="editBook(${book.id}); event.stopPropagation();"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="icon-btn delete-btn"
                            onclick="deleteBook(${book.id}); event.stopPropagation();"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>
                `;

        tbody.appendChild(row);

    });

}
