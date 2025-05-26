// src/MovieComponents/MovieCard.jsx
import React from 'react';
// Use a shared placeholder or define one. For consistency, let's assume one from MoviesPage or a global const.
const DEFAULT_PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/cardplaceholder/400/600'; // Consistent placeholder

const MovieCard = ({ movie, onCardClick }) => {
  // Your API provides 'image_url'. If 'posterUrl' was another possible key, this handles it.
  const posterSrc = movie.image_url || movie.posterUrl || DEFAULT_PLACEHOLDER_IMAGE;
  console.log(movie);
  return (
    <div
      className="themed-bg-card rounded-lg shadow-lg overflow-hidden group cursor-pointer transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col" // z-100 was likely a typo, removed
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onCardClick()}
    >
      <div className="relative aspect-[2/3] bg-gray-700"> {/* bg-gray-700 for placeholder visibility */}
        <img
          src={posterSrc} // This will use movie.image_url from your API
          alt={movie.primary_title || movie.title || 'Movie poster'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PLACEHOLDER_IMAGE;
          }}
        />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-md themed-text truncate group-hover:text-theme-yellow transition-colors">
          {movie.primary_title || movie.title || 'Untitled Movie'}
        </h3>
        <p className="text-xs themed-text-secondary">
          {movie.start_year || 'N/A'} {/* API provides start_year */}
          {movie.runtime_minutes && ` • ${movie.runtime_minutes} min`} {/* API provides runtime_minutes */}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;