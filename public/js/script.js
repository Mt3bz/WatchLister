// TMDB

const API_KEY = 'api_key=YOUR_API-KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;
const header = document.getElementById('header');
const main = document.getElementById('main');
let currentPage = 1; // Track the current page

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWNkNDM3OGM4NGQ0YjgzZjQzOTZjODAzYzA5N2UxNiIsInN1YiI6IjY2Mjk2M2YyYjlhMGJkMDE2MWQ3MjIzMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.92lfNQ7ghwN1r1Dacf2rRFGGF1ij677i_McTaPSl0hc'
  }
};

// Run the function to show movies on the home page ('/')
getMovies(API_URL);

// Search for a movie
search.addEventListener('input', () => {
  const searchTerm = search.value.trim();

  if (searchTerm.length === 0) {
    getMovies(API_URL); // Show all movies if search input is empty
    return;
  }

  const url = searchURL + '&query=' + searchTerm;

  getMovies(url);
});

// Get movies from the API
function getMovies(url) {
  lastUrl = url;
  fetch(url, options)
    .then(res => res.json())
    .then(data => {
      if (data.results.length !== 0) {
        showMovies(data.results);
        console.log(data.results);
        updatePagination(data.page, data.total_pages); // Update pagination
      } else {
        main.innerHTML = `<h1 class"no-results"> No Results Found.</h1>`;
      }
    });
}

// Show popular movies on the home page
function showMovies(data) {
  main.innerHTML = '';

  data.forEach(movie => {
    const { title, poster_path, vote_average } = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');

    movieEl.innerHTML = `
    
      <img src="${IMG_URL + poster_path}" alt="${title}">
      <div class="rate">
        ${vote_average.toFixed(1)}
        <div class="imdb">
          <img src="./img/imdb.png" alt="">
        </div>
      </div>
      <div class="movie-info">
        <h3>${title}</h3>
      </div>
      <div class="watch">
        <button type="submit" class="btnLibrary" onclick="addToLibrary('${title}', '${poster_path}', '${vote_average}')">
          Add to Library
        </button>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    main.appendChild(movieEl);
  });

  // Append pagination buttons
  const pagination = document.createElement('div');
  pagination.classList.add('pagination');
  pagination.innerHTML =  `
  <div class="pagination">
  <button class="mypagination-btn1" id="previousButton" onclick="previousPage()">Previous</button>
  <button class="mypagination-btn1" id="nextButton" onclick="nextPage()">Next</button>
</div>
  `;


}

// Assuming you have a variable currentPage representing the current page

function updatePagination(currentPage, totalPages) {
  const previousButton = document.getElementById('previousButton');
  const nextButton = document.getElementById('nextButton');

  if (currentPage === 1) {
    previousButton.disabled = true; // Disable previous button
  } else {
    previousButton.disabled = false; // Enable previous button
  }

  previousButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--; // Update currentPage value
      updatePagination(currentPage, totalPages); // Update pagination with new currentPage
      const url = `${API_URL}&page=${currentPage}`;
      getMovies(url);
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++; // Update currentPage value
      updatePagination(currentPage, totalPages); // Update pagination with new currentPage
      const url = `${API_URL}&page=${currentPage}`;
      getMovies(url);
    }
  });
}

// Go to the previous page
function previousPage() {
  
  if (currentPage > 1) {
    currentPage--;
    const url = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&page=${currentPage}`;
    getMovies(url);
  }
}

// Go to the next page
function nextPage() {
  currentPage++;
  const url = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&page=${currentPage}`;
  getMovies(url);
}




function addToLibrary(title, poster_path, vote_average) {
  if (!title || !poster_path || !vote_average) {
    console.error('Missing movie data for adding to library');
    return; // Exit the function if data is missing
  }
  
  fetch('/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify({ title, poster_path, vote_average })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error adding movie to library');
      }
      return response.json();
    })
    .then(data => {
      console.log('Movie added to library:', data);
      // Handle success message or update UI
    })
    .catch(error => {
      console.error('Error adding movie to library:', error);
      // Handle error message
    });
}
