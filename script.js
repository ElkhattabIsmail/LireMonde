const API_URL = 'http://localhost:3000/books';

let books = [];
let currentBookId = null;
let currentGenre = null;
let currentPage = localStorage.getItem('currentPage') || 'home';

async function fetchBooks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Erreur serveur');
        books = await res.json();
        
        const savedPage = localStorage.getItem('currentPage') || 'home';
        if (savedPage === 'home') {
            const searchTerm = document.getElementById('global-search')?.value.toLowerCase().trim() || '';
            const filteredBooks = currentGenre ? books.filter(b => b.genre === currentGenre) : books;
            
            if (searchTerm) {
                const searchedBooks = filteredBooks.filter(b => 
                    b.titre.toLowerCase().includes(searchTerm) || 
                    b.auteur.toLowerCase().includes(searchTerm)
                );
                renderBooks(searchedBooks);
            } else {
                renderBooks(filteredBooks);
            }
            generateGenreFilters();
        } else if (savedPage === 'reading') {
            renderReadingList();
        } else if (savedPage === 'admin') {
            renderAdminTable();
        }
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
    if (!container) return;
    
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
    
    if (!container) return;

    container.innerHTML = '';
    if (empty) empty.classList.toggle('hidden', readingBooks.length > 0);

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
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#9ca3af;">Aucun livre<\/td><\/tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${book.couverture}" class="table-cover"
                     onerror="this.src='https://placehold.co/56x72?text=?'">
            <\/td>
            <td><strong>${book.titre}</strong><\/td>
            <td>${book.auteur}<\/td>
            <td><span class="genre-badge">${book.genre}</span><\/td>
            <td class="action-cell">
                <button class="icon-btn edit-btn" onclick="editBook(${book.id})" title="Modifier">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteBook(${book.id})" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            <\/td>
        `;
        tbody.appendChild(row);
    });
}

function navigate(page) {
    currentPage = page;
    localStorage.setItem('currentPage', page);
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${page}`);
    if (activeNav) activeNav.classList.add('active');
    
    const homeSection = document.getElementById('home-section');
    const readingSection = document.getElementById('reading-section');
    const adminSection = document.getElementById('admin-section');
    
    if (homeSection) homeSection.classList.add('hidden');
    if (readingSection) readingSection.classList.add('hidden');
    if (adminSection) adminSection.classList.add('hidden');
    
    const selectedSection = document.getElementById(`${page}-section`);
    if (selectedSection) selectedSection.classList.remove('hidden');
    
    if (page === 'reading') {
        renderReadingList();
    } else if (page === 'admin') {
        renderAdminTable();
    } else if (page === 'home') {
        const searchTerm = document.getElementById('global-search')?.value.toLowerCase().trim() || '';
        const filteredBooks = currentGenre ? books.filter(b => b.genre === currentGenre) : books;
        
        if (searchTerm) {
            const searchedBooks = filteredBooks.filter(b => 
                b.titre.toLowerCase().includes(searchTerm) || 
                b.auteur.toLowerCase().includes(searchTerm)
            );
            renderBooks(searchedBooks);
        } else {
            renderBooks(filteredBooks);
        }
        generateGenreFilters();
    }
}

function handleSearch() {
    if (currentPage !== 'home') return;
    
    const term = document.getElementById('global-search')?.value.toLowerCase().trim() || '';
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
    if (!container) return;
    
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
    
    if (currentPage === 'home') {
        const searchTerm = document.getElementById('global-search')?.value.toLowerCase().trim() || '';
        const filteredBooks = genre ? books.filter(b => b.genre === genre) : books;
        
        if (searchTerm) {
            const searchedBooks = filteredBooks.filter(b => 
                b.titre.toLowerCase().includes(searchTerm) || 
                b.auteur.toLowerCase().includes(searchTerm)
            );
            renderBooks(searchedBooks);
        } else {
            renderBooks(filteredBooks);
        }
    }
}

function refreshAll() {
    const savedPage = localStorage.getItem('currentPage') || 'home';
    
    if (savedPage === 'home') {
        const searchTerm = document.getElementById('global-search')?.value.toLowerCase().trim() || '';
        const filteredBooks = currentGenre ? books.filter(b => b.genre === currentGenre) : books;
        
        if (searchTerm) {
            const searchedBooks = filteredBooks.filter(b => 
                b.titre.toLowerCase().includes(searchTerm) || 
                b.auteur.toLowerCase().includes(searchTerm)
            );
            renderBooks(searchedBooks);
        } else {
            renderBooks(filteredBooks);
        }
        generateGenreFilters();
    } else if (savedPage === 'reading') {
        renderReadingList();
    } else if (savedPage === 'admin') {
        renderAdminTable();
    }
}

function showBookModal(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    currentBookId = id;

    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalAuthor = document.getElementById('modal-author');
    const modalGenre = document.getElementById('modal-genre');
    const modalDescription = document.getElementById('modal-description');
    const modalToggleBtn = document.getElementById('modal-toggle-btn');
    
    if (modalImage) modalImage.src = book.couverture;
    if (modalTitle) modalTitle.textContent = book.titre;
    if (modalAuthor) modalAuthor.textContent = book.auteur;
    if (modalGenre) modalGenre.textContent = book.genre;
    if (modalDescription) modalDescription.textContent = book.description;

    if (modalToggleBtn) {
        if (book.aLire) {
            modalToggleBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Retirer de À lire';
            modalToggleBtn.style.borderColor = '#ef4444';
            modalToggleBtn.style.color = '#ef4444';
        } else {
            modalToggleBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Ajouter à À lire';
            modalToggleBtn.style.borderColor = 'var(--primary)';
            modalToggleBtn.style.color = 'var(--primary)';
        }
    }

    const modal = document.getElementById('book-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('book-modal');
    if (modal) modal.style.display = 'none';
    currentBookId = null;
}

function toggleFromModal() {
    if (currentBookId !== null) toggleALire(currentBookId);
    closeModal();
}

function showAddModal() {
    const modalTitle = document.getElementById('admin-modal-title');
    if (modalTitle) modalTitle.textContent = 'Ajouter un livre';
    
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    
    clearForm();
    
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'flex';
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const modalTitle = document.getElementById('admin-modal-title');
    if (modalTitle) modalTitle.textContent = 'Modifier le livre';
    
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = book.id;
    
    const titreInput = document.getElementById('form-titre');
    const auteurInput = document.getElementById('form-auteur');
    const genreSelect = document.getElementById('form-genre');
    const couvertureInput = document.getElementById('form-couverture');
    const descriptionTextarea = document.getElementById('form-description');
    
    if (titreInput) titreInput.value = book.titre;
    if (auteurInput) auteurInput.value = book.auteur;
    if (genreSelect) genreSelect.value = book.genre;
    if (couvertureInput) couvertureInput.value = book.couverture;
    if (descriptionTextarea) descriptionTextarea.value = book.description;

    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
    clearForm();
}

function clearForm() {
    const editId = document.getElementById('edit-id');
    const titreInput = document.getElementById('form-titre');
    const auteurInput = document.getElementById('form-auteur');
    const genreSelect = document.getElementById('form-genre');
    const couvertureInput = document.getElementById('form-couverture');
    const descriptionTextarea = document.getElementById('form-description');
    
    if (editId) editId.value = '';
    if (titreInput) titreInput.value = '';
    if (auteurInput) auteurInput.value = '';
    if (genreSelect) genreSelect.value = '';
    if (couvertureInput) couvertureInput.value = '';
    if (descriptionTextarea) descriptionTextarea.value = '';
}

function handleBookForm(event) {
    if (event) event.preventDefault();
    
    const titre = document.getElementById('form-titre')?.value.trim() || '';
    const auteur = document.getElementById('form-auteur')?.value.trim() || '';
    const genre = document.getElementById('form-genre')?.value || '';
    const couverture = document.getElementById('form-couverture')?.value.trim() || '';
    const description = document.getElementById('form-description')?.value.trim() || '';
    const editId = document.getElementById('edit-id')?.value || '';

    if (!titre || !auteur || !genre || !couverture || !description) {
        showToast('⚠️ Veuillez remplir tous les champs', 'error');
        return;
    }

    const bookData = { titre, auteur, genre, couverture, description };

    if (editId) {
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
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast${type ? ' ' + type : ''}`;
    toast.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

const bookModal = document.getElementById('book-modal');
if (bookModal) {
    bookModal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

const adminModal = document.getElementById('admin-modal');
if (adminModal) {
    adminModal.addEventListener('click', function(e) {
        if (e.target === this) closeAdminModal();
    });
}

window.onload = () => {
    fetchBooks();
    const savedPage = localStorage.getItem('currentPage') || 'home';
    navigate(savedPage);
};