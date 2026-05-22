const API_URL = 'http://localhost:3000/books';

let books = [],
    currentBookId = null,
    currentGenre = null;

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aLire: !book.aLire })
        });

        await fetchBooks();
    } catch (error) {
        console.error(error);
    }
}

async function saveBook(bookData, id = null) {
    try {
        await fetch(id ? `${API_URL}/${id}` : API_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        await fetchBooks();
    } catch (error) {
        console.error(error);
    }
}

async function deleteBook(id) {
    if (!confirm('Supprimer ce livre ?')) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        await fetchBooks();
    } catch (error) {
        console.error(error);
    }
}

function createBookCard(book, isReading = false) {
    const card = document.createElement('div');

    card.className = 'book-card';

    card.innerHTML = `
        <img src="${book.couverture}" alt="${book.titre}" class="book-image">

        <div class="book-info">
            <h3 class="book-title">${book.titre}</h3>

            <p class="book-author">${book.auteur}</p>

            ${
                isReading
                ? `
                    <button
                        class="btn-remove"
                        onclick="event.stopPropagation(); toggleALire(${book.id})"
                    >
                        Retirer
                    </button>
                `
                : `
                    <div class="book-footer">
                        <span class="genre-badge">${book.genre}</span>

                        <button
                            class="bookmark-btn ${book.aLire ? 'bookmark-active' : 'bookmark-inactive'}"
                            onclick="event.stopPropagation(); toggleALire(${book.id})"
                        >
                            <i class="fa-solid fa-bookmark"></i>
                        </button>
                    </div>
                `
            }
        </div>
    `;

    card.onclick = () => showBookModal(book.id);

    return card;
}

function renderBooks(filteredBooks = books) {
    const container = document.getElementById('books-grid');

    container.innerHTML = '';

    filteredBooks.forEach(book =>
        container.appendChild(createBookCard(book))
    );
}

function renderReadingList() {
    const readingBooks = books.filter(book => book.aLire);

    const container = document.getElementById('reading-grid');

    container.innerHTML = '';

    document
        .getElementById('empty-reading')
        .classList.toggle('hidden', readingBooks.length > 0);

    readingBooks.forEach(book =>
        container.appendChild(createBookCard(book, true))
    );
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');

    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <img src="${book.couverture}" class="table-cover">
            </td>

            <td><strong>${book.titre}</strong></td>

            <td>${book.auteur}</td>

            <td>
                <span class="genre-badge">${book.genre}</span>
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

function handleSearch() {
    const term = document
        .getElementById('global-search')
        .value
        .toLowerCase()
        .trim();

    if (!term) return renderBooks(books);

    const filteredBooks = books.filter(book =>
        book.titre.toLowerCase().includes(term) ||
        book.auteur.toLowerCase().includes(term)
    );

    renderBooks(filteredBooks);
}

function navigate(page) {
    ['home', 'reading', 'admin'].forEach(section => {
        document.getElementById(`${section}-section`).classList.add('hidden');
        document.getElementById(`nav-${section}`).classList.remove('active');
    });

    document
        .getElementById(`${page}-section`)
        .classList.remove('hidden');

    document
        .getElementById(`nav-${page}`)
        .classList.add('active');

    if (page === 'reading') renderReadingList();

    if (page === 'admin') renderAdminTable();
}

function editBook(id) {
    const book = books.find(book => book.id === id);

    if (!book) return;

    document.getElementById('admin-modal-title').textContent = 'Modifier le livre';
    document.getElementById('edit-id').value = book.id;
    document.getElementById('form-titre').value = book.titre;
    document.getElementById('form-auteur').value = book.auteur;
    document.getElementById('form-genre').value = book.genre;
    document.getElementById('form-couverture').value = book.couverture;
    document.getElementById('form-description').value = book.description;
    document.getElementById('admin-modal').style.display = 'flex';
}

function refreshAll() {
    renderBooks();
    renderReadingList();
    renderAdminTable();
    generateGenreFilters();
}

function generateGenreFilters() {
    const genres = [...new Set(books.map(book => book.genre))];

    const container = document.getElementById('genre-filters');

    container.innerHTML = '';

    const createButton = (text, genre = null) => {
        const button = document.createElement('button');

        button.className = 'filter-btn';
        button.textContent = text;
        button.onclick = () => filterByGenre(genre);

        container.appendChild(button);
    };

    createButton('Tous');

    genres.forEach(genre => createButton(genre, genre));
}

function filterByGenre(genre) {
    currentGenre = genre;

    renderBooks(
        genre
            ? books.filter(book => book.genre === genre)
            : books
    );
}

function showBookModal(id) {
    currentBookId = id;

    const book = books.find(book => book.id === id);

    if (!book) return;

    document.getElementById('modal-image').src = book.couverture;
    document.getElementById('modal-title').textContent = book.titre;
    document.getElementById('modal-author').textContent = book.auteur;
    document.getElementById('modal-genre').textContent = book.genre;
    document.getElementById('modal-description').textContent = book.description;

    const button = document.getElementById('modal-toggle-btn');

    button.innerHTML = `
        <i class="fa-solid fa-bookmark"></i>
        ${book.aLire ? 'Retirer de À lire' : 'Ajouter à À lire'}
    `;

    button.style.borderColor = book.aLire ? '#ef4444' : 'var(--primary)';
    button.style.color = book.aLire ? '#ef4444' : 'var(--primary)';

    document.getElementById('book-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

function toggleFromModal() {
    if (currentBookId) {
        toggleALire(currentBookId);
    }

    closeModal();
}

function showAddModal() {
    document.getElementById('admin-modal-title').textContent = 'Ajouter un livre';
    document.getElementById('book-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

window.onload = () => {
    fetchBooks();
    navigate('home');
};