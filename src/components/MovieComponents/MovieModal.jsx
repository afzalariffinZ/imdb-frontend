// src/components/MovieModal.jsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

const DEFAULT_MOVIE_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x900.png?text=No+Poster';

// --- Helper Function ---
const InfoItem = ({ label, value, className = "" }) => (
  <div className={`py-1.5 ${className}`}>
    <strong className="block text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider mb-0.5">{label}:</strong>
    <span className="text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark leading-relaxed">{value || 'N/A'}</span>
  </div>
);

const MovieModal = ({ movie: movieProp, onClose, type = 'movie' }) => {
  const movie = movieProp;
  const modalDialogRef = useRef(null);

  useEffect(() => {
    if (movie) {
      if (modalDialogRef.current) {
        modalDialogRef.current.focus();
      }
    }
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  const movieId = movie.tconst || movie.id;
  const moviePosterSrc = movie.image_url || movie.posterUrl || DEFAULT_MOVIE_PLACEHOLDER_IMAGE; // Prioritize image_url if available from API
  const titleToDisplay = movie.primaryTitle || movie.primary_title || "Untitled Movie";
  const movieYear = movie.startYear || movie.start_year || 'N/A';
  const modalId = `movie-modal-title-${movieId}`;

  const modalContentJsx = (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
    >
      <div
        ref={modalDialogRef}
        tabIndex={-1}
        className="bg-background-light dark:bg-background-dark rounded-lg shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[90vh] sm:max-h-[95vh] flex flex-col overflow-hidden animate-modal-appear outline-none"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 id={modalId} className="text-lg sm:text-xl md:text-2xl font-bold truncate pr-2">
            {movieId ? (
              <Link
                to={`/${type}/${movieId}`}
                className="text-primary-yellow hover:underline focus:outline-none focus:ring-1 focus:ring-primary-yellow rounded"
                onClick={onClose}
              >
                {titleToDisplay}
              </Link>
            ) : (
              <span className="text-primary-yellow">{titleToDisplay}</span>
            )}
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-base sm:text-lg ml-2 font-normal">
              ({movieYear})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-red text-2xl sm:text-3xl p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-yellow"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body - Main container for poster and details */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden"> {/* Parent flex container for poster and details */}

          {/* Poster Section (Left Column on Desktop) */}
          <div className="
            w-full md:w-[280px] lg:w-[320px] xl:w-[360px] /* Fixed width on larger screens */
            flex-shrink-0 /* Prevents this column from shrinking */
            order-1 md:order-none /* Poster appears first on mobile (stacked) */
            bg-surface-light dark:bg-black/30 /* Background for the poster area, black/30 for dark mode to distinguish */
            md:h-full /* Takes full height of parent on md+ screens */
          ">
            <img
              src={moviePosterSrc}
              alt={`Poster for ${titleToDisplay}`}
              className="
                block w-full h-auto aspect-[2/3] /* Mobile: full width, respects aspect ratio */
                md:w-full md:h-full /* Desktop: fill its container (which is md:h-full) */
                object-cover /* Ensures image covers the area, maintaining aspect ratio */
              "
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_MOVIE_PLACEHOLDER_IMAGE; }}
            />
          </div>

          {/* Details Section (Right Column on Desktop) */}
          <div className="
            w-full md:flex-1 /* Takes remaining width on larger screens */
            p-3 sm:p-4 md:p-5
            space-y-4 md:space-y-5
            overflow-y-auto nice-scrollbar-y /* Enables scrolling for details if content overflows */
            order-2 md:order-none /* Details appear second on mobile */
            md:h-full /* Attempts to take full height to align with poster */
          ">
            {/* Info Box */}
            <div className="bg-surface-light dark:bg-surface-dark p-3.5 sm:p-4 rounded-lg shadow-md">
              <div className="flex flex-col gap-x-4 gap-y-4">
                <h2 id={modalId} className="text-lg sm:text-xl md:text-2xl font-bold truncate pr-2 pt-5 pb-5">
                  {movieId ? (
                    <Link
                      to={`/${type}/${movieId}`}
                      className="text-[45px] text-primary-yellow hover:underline focus:outline-none focus:ring-1 focus:ring-primary-yellow rounded"
                      onClick={onClose}
                    >
                      {titleToDisplay}
                    </Link>
                  ) : (
                    <span className="text-primary-yellow">{titleToDisplay}</span>
                  )}
                  <span className="sm:text-[45px] text-text-secondary-light dark:text-text-secondary-dark text-base ml-2 font-normal">
                    ({movieYear})
                  </span>
                </h2>
                <InfoItem label="Rating" value={movie.rating ? `${movie.rating}/10` : 'N/A'} />
                <InfoItem label="Votes" value={movie.votes ? Number(movie.votes).toLocaleString() : 'N/A'} />
                <InfoItem label="Runtime" value={movie.runtimeMinutes || movie.runtime_minutes ? `${movie.runtimeMinutes || movie.runtime_minutes} min` : 'N/A'} />
                <InfoItem label="Genres" value={movie.genres ? (Array.isArray(movie.genres) ? movie.genres.join(', ') : String(movie.genres).replace(/,/g, ', ')) : 'N/A'} className="col-span-2 sm:col-span-3" />
              </div>
            </div>
            {/* Plot and Tagline sections have been removed */}
          </div>
        </div>
      </div>
      {/* Global styles */}
      <style jsx global>{`
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out forwards;
        }
        .nice-scrollbar-y::-webkit-scrollbar { width: 7px; }
        .nice-scrollbar-y::-webkit-scrollbar-track { @apply bg-surface-light dark:bg-surface-dark; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb { @apply bg-text-secondary-light dark:text-text-secondary-dark rounded; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb:hover { @apply bg-primary-red; }
      `}</style>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContentJsx, modalRoot) : modalContentJsx;
};

export default MovieModal;