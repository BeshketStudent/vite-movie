import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        const data = await res.json();
        setMovie(data);

        // Fetch videos (trailers)
        const videoRes = await fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS);
        const videoData = await videoRes.json();
        const trailer = (videoData.results || []).find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailerKey(trailer ? trailer.key : null);
      } catch (err) {
        setMovie(null);
        setTrailerKey(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <div className="modal-content"><p>Loading...</p></div>;
  if (!movie) return <div className="modal-content"><p>Movie not found.</p></div>;

  return (
    <div className="movie-details-backdrop">
      <div className="movie-details-content">
        <button className="close-btn" onClick={() => navigate(-1)}>
          <img src="/back-icon.svg" alt="Back" style={{ width: 24, height: 24 }} />
        </button>
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'}
          alt={movie.title}
        />
        <h2>{movie.title}</h2>
        <p><strong>Rating:</strong> {movie.vote_average}</p>
        <p><strong>Release Date:</strong> {movie.release_date}</p>
        <p><strong>Language:</strong> {movie.original_language}</p>
        <p><strong>Overview:</strong> {movie.overview}</p>
        {movie.genres && (
          <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
        )}
        {movie.runtime && (
          <p><strong>Runtime:</strong> {movie.runtime} min</p>
        )}
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
      </div>
    </div>
  );
};

export default MoviePage;