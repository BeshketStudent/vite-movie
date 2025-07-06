# 🎬 React Movie Search App — Full Technical Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Entry Point: main.jsx](#entry-point-mainjsx)
5. [Main App Logic: App.jsx](#main-app-logic-appjsx)
6. [Search Component: Search.jsx](#search-component-searchjsx)
7. [Movie Card Component: MovieCard.jsx](#movie-card-component-moviecardjsx)
8. [Movie Details Page: MoviePage.jsx](#movie-details-page-moviepagejsx)
9. [Trending & Appwrite Integration: appwrite.js](#trending--appwrite-integration-appwritejs)
10. [Styling: index.css & Tailwind](#styling-indexcss--tailwind)
11. [Other Files](#other-files)
12. [Development & Deployment](#development--deployment)
13. [How Everything Works Together](#how-everything-works-together)
14. [Extending the Project](#extending-the-project)

---

## Project Overview

This is a modern movie search web app built with **React** and **Vite**.  
It allows users to search for movies, view trending movies, see detailed info (including trailers), and is styled with **Tailwind CSS**.  
It uses [The Movie Database (TMDB)](https://www.themoviedb.org/) API for movie data and [Appwrite](https://appwrite.io/) for tracking trending searches.

---

## Project Structure

```
react-movie/
│
├── public/                # Static assets (images, icons)
├── src/                   # Source code
│   ├── components/        # Reusable React components
│   │   ├── MovieCard.jsx
│   │   ├── MoviePage.jsx
│   │   ├── Search.jsx
│   │   └── Spinner.jsx
│   ├── App.jsx            # Main app component
│   ├── appwrite.js        # Appwrite backend logic
│   ├── index.css          # Main CSS (with Tailwind)
│   ├── main.jsx           # Entry point for React
│   └── App.css            # (Optional) extra styles
├── .env.local             # Environment variables (API keys, etc.)
├── index.html             # HTML template
├── package.json           # Project metadata and dependencies
├── vite.config.js         # Vite configuration
└── .gitignore             # Files/folders to ignore in git
```

---

## Environment Variables

Environment variables are used for API keys and Appwrite configuration.  
They are loaded from the Vercel dashboard or a local `.env.local` file.

**Example:**
```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

**Usage:**  
Accessed in code as `import.meta.env.VITE_TMDB_API_KEY` etc.

---

## Entry Point: main.jsx

[`src/main.jsx`](src/main.jsx) sets up the React app, router, and imports global styles.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import MoviePage from './components/MoviePage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/movie/:id" element={<MoviePage />} />
    </Routes>
  </BrowserRouter>
);
```

- **BrowserRouter**: Enables client-side routing.
- **Routes**: Defines `/` for the main app and `/movie/:id` for the movie details page.
- **index.css**: Loads Tailwind and custom styles.

---

## Main App Logic: App.jsx

[`src/App.jsx`](src/App.jsx) is the core of the app.  
It manages state, handles searching, infinite scroll, trending movies, and rendering.

### Key State

- `searchTerm`, `debouncedSearchTerm`: For controlled search input and debouncing.
- `movieList`: Array of movies to display.
- `trendingMovies`: Array of trending movies from Appwrite.
- `isLoading`, `errorMessage`, `hasMore`, `totalPages`: UI and pagination state.
- `page`: Current page for infinite scroll.
- `selectedMovie`: For modal navigation (not used in current code).

### Debounced Search

```jsx
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);
  return () => clearTimeout(handler);
}, [searchTerm]);
```
- Waits 500ms after typing before updating the debounced term.

### Fetching Movies

```jsx
const fetchMovies = async (query = '', pageNum = 1, append = false) => {
  // ...fetch logic...
  setMovieList(prev =>
    append ? [...prev, ...(data.results || [])] : (data.results || [])
  );
  // ...update trending, pagination, error handling...
}
```
- Fetches from TMDB API.
- Appends or replaces movie list.
- Updates trending search count via Appwrite.

### Trending Movies

```jsx
const loadTrendingMovies = async () => {
  const movies = await getTrendingMovies();
  setTrendingMovies(movies);
}
```
- Loads top 5 trending movies from Appwrite.

### Infinite Scroll

```jsx
useEffect(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
          !isLoading &&
          hasMore
        ) {
          setPage(prev => prev + 1);
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [isLoading, hasMore]);
```
- Loads more movies when near the bottom of the page.

### Filtering Banned Movies

```jsx
const bannedKeywords = [
  'porn', 'porno', 'adult', 'av', 'jav', 'erotic', 'xxx', 'sex'
];
function isBannedMovie(movie) {
  const text = `${movie.title} ${movie.overview || ''}`.toLowerCase();
  return bannedKeywords.some(word => text.includes(word));
}
```
- Filters out movies with banned keywords in title/overview.

### Rendering

- **Header**: Logo, title, and search bar.
- **Trending Section**: Shows trending movies with horizontal scroll.
- **All Movies Section**: Shows search results or popular movies, with infinite scroll.
- **Spinner**: Shows while loading.
- **Error Message**: Shows if fetch fails.

---

## Search Component: Search.jsx

[`src/components/Search.jsx`](src/components/Search.jsx)  
A controlled search input with a dropdown for suggestions.

### Key Features

- **Debounced Suggestions**: Fetches top 6 movie suggestions as user types.
- **Dropdown**: Shows suggestions in a styled dropdown.
- **Click Outside**: Closes dropdown when clicking outside.
- **Click Suggestion**: Sets search term and closes dropdown.

### Example

```jsx
<div className="search" ref={inputRef}>
  <div>
    <img src="search.svg" alt="search" />
    <input
      type="text"
      placeholder="Search through thousands of movies"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
    />
  </div>
  {showDropdown && suggestions.length > 0 && (
    <ul className="search-dropdown">
      {suggestions.map(movie => (
        <li
          key={movie.id}
          className="search-dropdown-item"
          onClick={() => {
            setSearchTerm(movie.title);
            setShowDropdown(false);
            if (onSuggestionClick) onSuggestionClick(movie.title);
          }}
        >
          {movie.title}
        </li>
      ))}
    </ul>
  )}
</div>
```

---

## Movie Card Component: MovieCard.jsx

[`src/components/MovieCard.jsx`](src/components/MovieCard.jsx)  
Displays a single movie in the grid.

- **Poster**: Uses TMDB image or fallback.
- **Title**: Movie title.
- **Rating**: Star icon and average.
- **Language**: Original language.
- **Year**: Release year.

---

## Movie Details Page: MoviePage.jsx

[`src/components/MoviePage.jsx`](src/components/MoviePage.jsx)  
Shows detailed info for a movie, including a trailer.

### Fetching

- Fetches movie details from TMDB by ID.
- Fetches videos (trailers) for the movie.
- Finds the first YouTube trailer and embeds it.

### Rendering

- **Back Button**: Returns to previous page.
- **Poster, Title, Rating, Release Date, Language, Overview, Genres, Runtime**
- **Trailer**: Embedded YouTube trailer if available.

```jsx
{trailerKey && (
  <div className="w-full my-4">
    <iframe
      width="100%"
      height="315"
      src={`https://www.youtube.com/embed/${trailerKey}`}
      title="Trailer"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="rounded-xl shadow-lg"
    ></iframe>
  </div>
)}
```

---

## Trending & Appwrite Integration: appwrite.js

[`src/appwrite.js`](src/appwrite.js)  
Handles trending search tracking using Appwrite.

- **updateSearchCount**: Increments count for a search term or creates a new record.
- **getTrendingMovies**: Gets top 5 most searched movies.

---

## Styling: index.css & Tailwind

[`src/index.css`](src/index.css)  
Uses Tailwind CSS for utility classes and custom component styles.

- **@layer base**: Global styles (body, headings, main, header).
- **@layer components**: Custom classes for `.pattern`, `.wrapper`, `.trending`, `.search`, `.search-dropdown`, `.movie-card`, `.movie-details-backdrop`, `.movie-details-content`, etc.
- **Scrollbar Hiding**: Custom CSS for hiding scrollbars in dropdowns and trending section.
- **Responsive**: Uses Tailwind responsive utilities and custom media queries.

---

## Other Files

- **vite.config.js**: Configures Vite with React and Tailwind plugins.
- **App.css**: Optional extra styles.
- **.gitignore**: Ignores node_modules, dist, .env, etc.
- **README.md**: Basic project info.

---

## Development & Deployment

### Local Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up `.env.local` with your API keys.
3. Start the dev server:
   ```sh
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

### Deployment (Vercel)

- Connect your repo to Vercel.
- Set environment variables in the Vercel dashboard.
- Ensure output directory is set to `dist`.
- Push to `main` for production, or to `dev` for preview/beta.

---

## How Everything Works Together

- User types in the search bar.
- App debounces input, fetches suggestions and results from TMDB.
- Results are displayed as cards; trending movies are shown from Appwrite.
- Infinite scroll loads more results as user scrolls.
- Clicking a movie shows the details page with info and trailer.
- All UI is styled with Tailwind and custom CSS.

---

## Extending the Project

- **Add user authentication** (Appwrite or Auth0).
- **Allow users to save favorite movies.**
- **Add reviews/comments.**
- **Improve mobile responsiveness.**
- **Add more filters (genre, year, etc).**
- **Paginate trending movies.**
- **Add dark/light mode toggle.**

---

**This documentation covers every major aspect and file of the project. For further details, read the code comments and refer to the official docs for React, Vite, TMDB, Appwrite, and Tailwind CSS.**

---