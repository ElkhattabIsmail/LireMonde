
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



        