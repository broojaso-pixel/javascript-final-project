
// ==========================================
// SIMPLIFIED FLIX - MOVIE SEARCH WEBSITE
// ==========================================

// 1. API KEY
const API_KEY = "98f9815c";

// 2. SELECT HTML ELEMENTS
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const moviesGrid = document.querySelector("#moviesGrid");
const resultsInfo = document.querySelector("#resultsInfo");
const sortSelect = document.querySelector("#sortSelect");

// 3. STORE MOVIES
let movies = [];

// 4. SEARCH FOR MOVIES USING THE OMDb API
async function fetchMovies(searchTerm) {

  // Display loading skeletons.
  showLoading();

  try {
    // Fetch movie information from OMDb.
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie&page=1`
    );

    // Convert the response into readable JSON.
    const data = await response.json();

    // Check whether the API returned an error.
    if (data.Response === "False") {
      movies = [];
      moviesGrid.innerHTML = "";
      resultsInfo.textContent = data.Error || "No movies found.";
      return;
    }

    // Save the movie results.
    movies = data.Search;

    // Display the search results.
    displayMovies();

  } catch (error) {
    console.error("Error fetching movies:", error);

    moviesGrid.innerHTML = "";
    resultsInfo.textContent =
      "Something went wrong. Please check your internet connection and try again.";
  }
}

// 5. DISPLAY MOVIES ON THE WEBSITE
function displayMovies() {

  // Create a copy so the original API results remain unchanged.
  let sortedMovies = [...movies];

  // Get the selected sorting option.
  const sortValue = sortSelect.value;

  // Sort movies alphabetically or by release year.
  if (sortValue === "a-z") {
    sortedMovies.sort((a, b) =>
      a.Title.localeCompare(b.Title)
    );

  } else if (sortValue === "z-a") {
    sortedMovies.sort((a, b) =>
      b.Title.localeCompare(a.Title)
    );

  } else if (sortValue === "newest") {
    sortedMovies.sort((a, b) =>
      getYear(b.Year) - getYear(a.Year)
    );

  } else if (sortValue === "oldest") {
    sortedMovies.sort((a, b) =>
      getYear(a.Year) - getYear(b.Year)
    );
  }

  // Update the results information.
  resultsInfo.innerHTML =
    `<span>Showing:</span> ${escapeHTML(searchInput.value.trim() || "Marvel")}`;

  // Use .map() to create a movie card for every result.
  moviesGrid.innerHTML = sortedMovies.map((movie) => {

    const posterAvailable =
      movie.Poster && movie.Poster !== "N/A";

    return `
      <div class="movie-card">

        ${
          posterAvailable
            ? `
              <img
                class="movie-card__img"
                src="${escapeHTML(movie.Poster)}"
                alt="${escapeHTML(movie.Title)} poster"
                loading="lazy"
                onerror="this.replaceWith(createPosterPlaceholder())"
              />
            `
            : `
              <div class="movie-card__poster-placeholder">
                Movie Poster<br />
                Not Available
              </div>
            `
        }

        <h2 class="movie-card__title">
          ${escapeHTML(movie.Title)}
        </h2>

        <p class="movie-card__year">
          ${escapeHTML(movie.Year)}
        </p>

      </div>
    `;
  }).join("");
}

// 6. GET THE RELEASE YEAR
function getYear(year) {
  const match = String(year).match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

// 7. PROTECT MOVIE TEXT BEFORE ADDING IT TO HTML
function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, (character) => {

    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return characters[character];
  });
}

// 8. CREATE POSTER PLACEHOLDER
function createPosterPlaceholder() {

  const placeholder = document.createElement("div");

  placeholder.className = "movie-card__poster-placeholder";

  placeholder.textContent = "Movie Poster - Not Available";

  return placeholder;
}

// 9. CREATE LOADING SKELETONS
function showLoading() {

  resultsInfo.textContent = "Loading movies...";

  // Create 10 temporary skeleton cards.
  moviesGrid.innerHTML = Array(10).fill(`
    <div class="movie-card--skeleton">
      <div class="movie-card__img--skeleton"></div>
      <div class="movie-card__title--skeleton"></div>
      <div class="movie-card__year--skeleton"></div>
    </div>
  `).join("");
}

// 10. SEARCH FORM EVENT LISTENER
searchForm.addEventListener("submit", (event) => {

  // Prevent the browser from refreshing the page.
  event.preventDefault();

  // Get the search input.
  const searchTerm = searchInput.value.trim();

  // Only search if the input isn't empty.
  if (searchTerm) {
    sortSelect.value = "default";
    fetchMovies(searchTerm);
  }
});

// 11. SORTING EVENT LISTENER
sortSelect.addEventListener("change", () => {
  displayMovies();
});

// 12. LOAD DEFAULT MARVEL MOVIES WHEN THE WEBSITE OPENS
fetchMovies("Marvel");
