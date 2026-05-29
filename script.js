const API_URL = 'http://localhost:3000/books';

let books = [];
let currentBookId = null;
let currentGenre = null;


async function fetchBooks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Erreur serveur');
        books = await res.json();
        refreshAll();
    } catch (err) {
        showToast('❌ Impossible de se connecter au serveur', 'error');
        console.error(err);
    }
}

async function toggleALire(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aLire: !book.aLire })
        });
        if (!res.ok) throw new Error();
        await fetchBooks();
        showToast(book.aLire ? '🗑️ Retiré de la liste' : '📌 Ajouté à la liste');
    } catch (err) {
        showToast('❌ Erreur lors de la mise à jour', 'error');
        console.error(err);
    }
}

async function saveBook(bookData, id = null) {
    try {
        const url = id ? `${API_URL}/${id}` : API_URL;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (!res.ok) throw new Error();
        await fetchBooks();
        showToast(id ? '✅ Livre modifié !' : '✅ Livre ajouté !', 'success');
    } catch (err) {
        showToast('❌ Erreur lors de la sauvegarde', 'error');
        console.error(err);
    }
}

async function deleteBook(id) {
    if (!confirm('Supprimer ce livre définitivement ?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        await fetchBooks();
        showToast('🗑️ Livre supprimé', 'error');
    } catch (err) {
        showToast('❌ Erreur lors de la suppression', 'error');
        console.error(err);
    }
}


function renderBooks(list = books) {
    const container = document.getElementById('books-grid');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="no-results">Aucun livre trouvé.</p>';
        return;
    }

    list.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.couverture}" alt="${book.titre}" class="book-image"
                 onerror="this.src='https://placehold.co/220x320?text=No+Image'">
            <div class="book-info">
                <h3 class="book-title">${book.titre}</h3>
                <p class="book-author">${book.auteur}</p>
                <div class="book-footer">
                    <span class="genre-badge">${book.genre}</span>
                    <button
                        class="bookmark-btn ${book.aLire ? 'bookmark-active' : 'bookmark-inactive'}"
                        onclick="event.stopPropagation(); toggleALire(${book.id})"
                        title="${book.aLire ? 'Retirer de À lire' : 'Ajouter à À lire'}"
                    >
                        <i class="fa-solid fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
        card.onclick = () => showBookModal(book.id);
        container.appendChild(card);
    });
}

function renderReadingList() {
    const readingBooks = books.filter(b => b.aLire);
    const container = document.getElementById('reading-grid');
    const empty = document.getElementById('empty-reading');

    container.innerHTML = '';
    empty.classList.toggle('hidden', readingBooks.length > 0);

    readingBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.couverture}" alt="${book.titre}" class="book-image"
                 onerror="this.src='https://placehold.co/220x320?text=No+Image'">
            <div class="book-info">
                <h3 class="book-title">${book.titre}</h3>
                <p class="book-author">${book.auteur}</p>
                <button class="btn-remove" onclick="event.stopPropagation(); toggleALire(${book.id})">
                    Retirer
                </button>
            </div>
        `;
        card.onclick = () => showBookModal(book.id);
        container.appendChild(card);
    });
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#9ca3af;">Aucun livre</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${book.couverture}" class="table-cover"
                     onerror="this.src='https://placehold.co/56x72?text=?'">
            </td>
            <td><strong>${book.titre}</strong></td>
            <td>${book.auteur}</td>
            <td><span class="genre-badge">${book.genre}</span></td>
            <td class="action-cell">
                <button class="icon-btn edit-btn" onclick="editBook(${book.id})" title="Modifier">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteBook(${book.id})" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


function navigate(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('#home-section, #reading-section, #admin-section')
        .forEach(s => s.classList.add('hidden'));// Hide all sections

    document.getElementById(`${page}-section`).classList.remove('hidden');
    document.getElementById(`nav-${page}`).classList.add('active');

    if (page === 'reading') renderReadingList();
    if (page === 'admin') renderAdminTable();
    if (page === 'home') renderBooks(currentGenre ? books.filter(b => b.genre === currentGenre) : books);
}



function handleSearch() {
    const term = document.getElementById('global-search').value.toLowerCase().trim();
    const base = currentGenre ? books.filter(b => b.genre === currentGenre) : books;

    if (!term) {
        renderBooks(base);
        return;
    }

    renderBooks(base.filter(b =>
        b.titre.toLowerCase().includes(term) ||
        b.auteur.toLowerCase().includes(term)
    ));
}

function generateGenreFilters() {
    const genres = [...new Set(books.map(b => b.genre))];
    const container = document.getElementById('genre-filters');
    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn' + (currentGenre === null ? ' active' : '');
    allBtn.textContent = 'Tous';
    allBtn.onclick = () => filterByGenre(null);
    container.appendChild(allBtn);

    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (currentGenre === genre ? ' active' : '');
        btn.textContent = genre;
        btn.onclick = () => filterByGenre(genre);
        container.appendChild(btn);
    });
}

function filterByGenre(genre) {
    currentGenre = genre;
    generateGenreFilters();
    renderBooks(genre ? books.filter(b => b.genre === genre) : books);
}

function refreshAll() {
    renderBooks(currentGenre ? books.filter(b => b.genre === currentGenre) : books);
    renderAdminTable();
    generateGenreFilters();
    // Si on est sur reading, re-render
    if (!document.getElementById('reading-section').classList.contains('hidden')) {
        renderReadingList();
    }
}

function showBookModal(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    currentBookId = id;

    document.getElementById('modal-image').src = book.couverture;
    document.getElementById('modal-title').textContent = book.titre;
    document.getElementById('modal-author').textContent = book.auteur;
    document.getElementById('modal-genre').textContent = book.genre;
    document.getElementById('modal-description').textContent = book.description;

    const btn = document.getElementById('modal-toggle-btn');
    if (book.aLire) {
        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Retirer de À lire';
        btn.style.borderColor = '#ef4444';
        btn.style.color = '#ef4444';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Ajouter à À lire';
        btn.style.borderColor = 'var(--primary)';
        btn.style.color = 'var(--primary)';
    }

    document.getElementById('book-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
    currentBookId = null;
}

function toggleFromModal() {
    if (currentBookId !== null) toggleALire(currentBookId);
    closeModal();
}

function showAddModal() {
    document.getElementById('admin-modal-title').textContent = 'Ajouter un livre';
    document.getElementById('edit-id').value = '';
    clearForm();
    document.getElementById('admin-modal').style.display = 'flex';
}

function editBook(id) {
    const book = books.find(b => b.id === id);
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

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
    clearForm();
}

function clearForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('form-titre').value = '';
    document.getElementById('form-auteur').value = '';
    document.getElementById('form-genre').value = '';
    document.getElementById('form-couverture').value = '';
    document.getElementById('form-description').value = '';
}

function handleBookForm() {
    const titre = document.getElementById('form-titre').value.trim();
    const auteur = document.getElementById('form-auteur').value.trim();
    const genre = document.getElementById('form-genre').value;
    const couverture = document.getElementById('form-couverture').value.trim();
    const description = document.getElementById('form-description').value.trim();
    const editId = document.getElementById('edit-id').value;

    // Validation
    if (!titre || !auteur || !genre || !couverture || !description) {
        showToast('⚠️ Veuillez remplir tous les champs', 'error');
        return;
    }

    const bookData = { titre, auteur, genre, couverture, description };

    if (editId) {
        // Garder aLire existant
        const existing = books.find(b => b.id === parseInt(editId));
        if (existing) bookData.aLire = existing.aLire;
        saveBook(bookData, parseInt(editId));
    } else {
        bookData.aLire = false;
        saveBook(bookData);
    }

    closeAdminModal();
}


let toastTimer = null;

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast${type ? ' ' + type : ''}`;
    toast.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() =>
         toast.classList.add('hidden'), 3000);
}

document.getElementById('book-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.getElementById('admin-modal').addEventListener('click', function(e) {
    if (e.target === this) closeAdminModal();
});

window.onload = () => {
    fetchBooks();
    navigate('home');
};