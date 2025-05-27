// src/pages/MovieDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

const API_BASE_URL = 'http://localhost:8000';
const DEFAULT_MOVIE_PLACEHOLDER_IMAGE = 'https://thumbs.dreamstime.com/b/generic-person-gray-photo-placeholder-man-silhouette-white-background-144511705.jpg';
const DEFAULT_PERSON_PLACEHOLDER_IMAGE = 'https://thumbs.dreamstime.com/b/generic-person-gray-photo-placeholder-man-silhouette-white-background-144511705.jpg';

const parseCharacters = (characters) => {
  if (!characters) return '';
  try {
    const parsed = JSON.parse(characters);
    return Array.isArray(parsed) ? parsed.join(' / ') : characters;
  } catch (e) { return characters; }
};

const InfoItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <strong className="block text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">{label}:</strong>
    <span className="text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark">{value || 'N/A'}</span>
  </div>
);

const CreditListItem = ({ person, categoryOverride = null }) => (
  <RouterLink
    to={`/celebs/${person.nconst}`} // Assuming a route like /celebs/:nconst
    className="flex items-center space-x-3 p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
    title={`${person.name}${person.job ? ` (${person.job})` : ''}${person.characters ? ` as ${parseCharacters(person.characters)}` : ''}`}
  >
    <img
      src={person.imageUrl || DEFAULT_PERSON_PLACEHOLDER_IMAGE}
      alt={person.name}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-border-light dark:border-border-dark group-hover:border-primary-yellow"
      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
    />
    <div className="min-w-0">
      <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{person.name}</p>
      {categoryOverride === 'actor' && person.characters && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
          as {parseCharacters(person.characters)}
        </p>
      )}
      {categoryOverride === 'writer' && person.job && (
         <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{person.job}</p>
      )}
    </div>
  </RouterLink>
);


const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh]">
    <CircularProgress style={{ color: '#FBBF24' }} />
    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark text-lg">Loading details...</p>
  </div>
);

const MovieDetailPage = () => {
  const { movieId } = useParams(); // Gets 'movieId' from URL like /movie/:movieId
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(movieId);
  const fetchMovieDetails = useCallback(async () => {
    if (!movieId) {
      setError("Movie ID is missing from URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // *** THIS IS THE API CALL YOU NEED TO ENSURE YOUR BACKEND PROVIDES ***
      // It should return a SINGLE movie object with a 'principals' array.
      console.log('hi')
      
      const response = await fetch(`${API_BASE_URL}/api_title_details.php?id=${movieId}`);
  
      if (!response.ok) {
        let errorText = `API Error (${response.status})`;
        try { const errorData = await response.json(); errorText = errorData.error || `Failed to load movie data. Status: ${response.status}`; }
        catch (e) { try {const text = await response.text(); errorText += ` - ${text.substring(0,100)}`} catch (eInner) {/*ignore*/}}
        throw new Error(errorText);
      }
      const data = await response.json();
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }
      
      // Expecting a single movie object, possibly nested under 'movie' key
      const movieData = data.movie || data; // Adjust if your API nests it differently e.g. data.data
      
      if (!movieData) { // Basic check for valid movie data
        throw new Error("Movie data not found in API response or invalid structure.");
      }
      setMovie(movieData);

    } catch (e) {
      setError(e.message || "An unknown error occurred.");
      console.error("Failed to fetch movie details:", e);
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  useEffect(() => {
    if (movie) {
      document.title = `${movie.primaryTitle || movie.primary_title || 'Movie'} - Details - IMDb2`;
    } else if (!isLoading && error) {
      document.title = `Error - IMDb2`;
    } else if (!isLoading && !movie) {
      document.title = `Movie Not Found - IMDb2`;
    }
  }, [movie, isLoading, error]);

  if (isLoading) return <LoadingIndicator />;
  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 dark:text-red-400 text-xl mb-4">Error: {error}</p>
      <RouterLink to="/movies" className="text-primary-yellow hover:underline">
        ← Back to Movies
      </RouterLink>
    </div>
  );
  if (!movie) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-xl text-text-primary-light dark:text-text-primary-dark">Movie not found.</p>
      <RouterLink to="/movies" className="mt-4 inline-block text-primary-yellow hover:underline">
        ← Back to Movies
      </RouterLink>
    </div>
  );

  const moviePosterSrc = movie.image_url || movie.posterUrl || DEFAULT_MOVIE_PLACEHOLDER_IMAGE;
  const titleToDisplay = movie.primaryTitle || movie.primary_title || "Untitled Movie";
  const movieYear = movie.startYear || movie.start_year || 'N/A';
  const genres = movie.genres ? (Array.isArray(movie.genres) ? movie.genres.join(', ') : String(movie.genres).replace(/,/g, ', ')) : 'N/A';

  const directors = movie.principals?.filter(p => p.category === 'director') || [];
  const writers = movie.principals?.filter(p => p.category === 'writer') || [];
  const cast = movie.principals?.filter(p => ['actor', 'actress', 'self'].includes(p.category)) || [];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-text-primary-light dark:text-text-primary-dark">
      {/* Movie Header Area */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-yellow">
            {titleToDisplay}
          </h1>
          <span className="text-2xl sm:text-3xl text-text-secondary-light dark:text-text-secondary-dark font-light">
            ({movieYear})
          </span>
        </div>
        {movie.originalTitle && movie.originalTitle !== titleToDisplay && (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark italic mt-1">
            Original Title: {movie.originalTitle}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column: Poster & Quick Info */}
        <div className="w-full lg:w-1/3 xl:w-[340px] flex-shrink-0 space-y-6">
          <img
            src={moviePosterSrc}
            alt={`Poster for ${titleToDisplay}`}
            className="w-full rounded-lg shadow-xl object-cover aspect-[2/3]"
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_MOVIE_PLACEHOLDER_IMAGE; }}
          />
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow space-y-3">
            <InfoItem label="Rating" value={movie.rating ? `${parseFloat(movie.rating).toFixed(1)}/10` : 'N/A'} />
            <InfoItem label="Votes" value={movie.votes ? Number(movie.votes).toLocaleString() : 'N/A'} />
            <InfoItem label="Runtime" value={movie.runtimeMinutes || movie.runtime_minutes ? `${movie.runtimeMinutes || movie.runtime_minutes} min` : 'N/A'} />
            <InfoItem label="Genres" value={genres} />
             {movie.isAdult === 1 && <InfoItem label="Content" value="Adult" />}
          </div>
        </div>

        {/* Right Column: Plot, Cast & Crew */}
        <div className="w-full lg:flex-1 space-y-6">
          {movie.tagline && (
            <p className="text-xl italic text-text-secondary-light dark:text-text-secondary-dark">"{movie.tagline}"</p>
          )}

          {movie.plot && (
            <section>
              <h2 className="text-2xl font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Plot Summary</h2>
              <p className="text-base leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">{movie.plot}</p>
            </section>
          )}

          {directors.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">Director(s)</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {directors.map(p => <CreditListItem key={p.nconst} person={p} />)}
              </div>
            </section>
          )}
          
          {writers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">Writer(s)</h2>
               <div className="flex flex-wrap gap-x-6 gap-y-3">
                {writers.map(p => <CreditListItem key={p.nconst} person={p} type="writer" />)}
              </div>
            </section>
          )}

          {cast.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">Top Cast</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto nice-scrollbar-y pr-2">
                {cast.slice(0, 15).map(p => ( // Show top 15 cast members, for example
                  <CreditListItem key={p.nconst} person={p} categoryOverride="actor" />
                ))}
                {cast.length > 15 && <p className="text-sm text-center mt-2 text-primary-yellow">And more...</p>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;