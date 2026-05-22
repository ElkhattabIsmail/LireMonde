
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

// ================= DELETE BOOK =================

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


