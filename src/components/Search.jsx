import React, { useState, useEffect, useRef } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const Search = ({ searchTerm, setSearchTerm, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=1`;
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) return;
        const data = await response.json();
        setSuggestions((data.results || []).slice(0, 6));
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };
    fetchSuggestions();
  }, [searchTerm]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
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
  )
}

export default Search
