// src/components/MovieModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

const DEFAULT_MOVIE_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x900.png?text=No+Poster';
const DEFAULT_PERSON_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/100x100.png?text=Person';

// --- Helper Functions and Sub-Components (Keep these as they were if they worked) ---
const parseCharacters = (characters) => {
  if (!characters) return '';
  try {
    const parsed = JSON.parse(characters);
    return Array.isArray(parsed) ? parsed.join(' / ') : characters;
  } catch (e) {
    return characters;
  }
};

const InfoItem = ({ label, value, className = "" }) => (
  <div className={`py-1 ${className}`}>
    <strong className="block text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">{label}:</strong>
    <span className="text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark">{value || 'N/A'}</span>
  </div>
);

const CreditItem = ({ person, type }) => (
  <a
    href={`/celebs/${person.nconst}`}
    className="flex-shrink-0 w-28 text-center group p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors"
    target="_blank" rel="noopener noreferrer"
    title={`${person.name}${person.job && type === 'writer' ? ` ${person.job}` : ''}`}
  >
    <img
      src={person.imageUrl || DEFAULT_PERSON_PLACEHOLDER_IMAGE}
      alt={person.name}
      className="w-20 h-20 mx-auto rounded-full object-cover mb-2 border-2 border-border-light dark:border-border-dark group-hover:border-primary-yellow transition-all shadow-md"
      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
    />
    <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-yellow truncate w-full block">{person.name}</span>
    {type === 'writer' && person.job && <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate w-full block">{person.job}</span>}
  </a>
);

const CastMemberItemVertical = ({ actor }) => (
  <a
    href={`/celebs/${actor.nconst}`}
    className="flex items-center space-x-3 hover:bg-surface-light dark:hover:bg-surface-dark p-2 rounded-md transition-colors w-full"
    target="_blank" rel="noopener noreferrer"
    title={`${actor.name} as ${parseCharacters(actor.characters)}`}
  >
    <img
      src={actor.imageUrl || DEFAULT_PERSON_PLACEHOLDER_IMAGE}
      alt={actor.name}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-border-light dark:border-border-dark group-hover:border-primary-yellow transition-all shadow"
      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
    />
    <div className="flex-grow min-w-0">
      <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-yellow truncate">{actor.name}</p>
      {actor.characters && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
          as {parseCharacters(actor.characters)}
        </p>
      )}
    </div>
  </a>
);

// --- Simple Pagination Controls Component ---
const SimplePaginationControls = ({ currentPage, totalPages, onPageChange, className = "" }) => {
  if (totalPages <= 1) return null;
  return (
    <div className={`flex justify-center items-center space-x-2 mt-3 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs rounded bg-surface-light dark:bg-surface-dark hover:opacity-80 disabled:opacity-50 text-text-primary-light dark:text-text-primary-dark"
      >
        Prev
      </button>
      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-xs rounded bg-surface-light dark:bg-surface-dark hover:opacity-80 disabled:opacity-50 text-text-primary-light dark:text-text-primary-dark"
      >
        Next
      </button>
    </div>
  );
};
// --- End Simple Pagination Controls Component ---


const MovieModal = ({ movie: movieProp, onClose }) => {
  const movie = movieProp;
  const modalDialogRef = useRef(null);

  // --- State for Cast Pagination ---
  const CAST_MEMBERS_PER_PAGE = 5; // Or your preferred number
  const [currentCastPage, setCurrentCastPage] = useState(1);
  // --- End State for Cast Pagination ---

  // Reset cast page to 1 when the movie prop changes (i.e., a new modal is opened)
  useEffect(() => {
    if (movie) {
      setCurrentCastPage(1);
      if (modalDialogRef.current) {
        modalDialogRef.current.focus(); // Focus the dialog for accessibility
      }
    }
    // Handle Escape key to close modal
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [movie, onClose]); // Add movie and onClose to dependency array

  if (!movie) return null;

  const movieId = movie.tconst || movie.id;

  const moviePosterSrc = movie.posterUrl || movie.image_url || DEFAULT_MOVIE_PLACEHOLDER_IMAGE;
  const directors = movie.principals?.filter(p => p.category === 'director') || [];
  const writers = movie.principals?.filter(p => p.category === 'writer') || [];
  const fullCastList = movie.principals?.filter(p => ['actor', 'actress', 'self'].includes(p.category)) || [];

  // --- Logic for Slicing Cast Data for Pagination ---
  const totalCastPages = Math.ceil(fullCastList.length / CAST_MEMBERS_PER_PAGE);
  const startIndex = (currentCastPage - 1) * CAST_MEMBERS_PER_PAGE;
  const endIndex = startIndex + CAST_MEMBERS_PER_PAGE;
  const paginatedCast = fullCastList.slice(startIndex, endIndex);

  const handleCastPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalCastPages) {
      setCurrentCastPage(newPage);
    }
  };
  // --- End Logic for Slicing Cast Data ---
  const titleToDisplay = movie.primaryTitle || movie.primary_title || "Untitled Movie";
  const movieYear = movie.startYear || movie.start_year || 'N/A';
  const modalId = `movie-modal-title-${movie.tconst || movie.id}`;

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Unchanged */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 id={modalId} className="text-lg sm:text-xl md:text-2xl font-bold truncate pr-2">
            {movieId ? (
              <Link
                to={`/movie/${movieId}`} // Adjust this path based on your actual movie detail route
                className="text-primary-yellow hover:underline focus:outline-none focus:ring-1 focus:ring-primary-yellow rounded"
                onClick={onClose} // Close the current modal when navigating
              >
                {titleToDisplay}
              </Link>
            ) : (
              <span className="text-primary-yellow">{titleToDisplay}</span> // Fallback if no ID
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
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden"> {/* Let children handle scroll */}

          {/* Poster Section - Unchanged */}
          <div className="w-full md:w-[280px] lg:w-[320px] xl:w-[360px] flex-shrink-0 bg-black relative order-1 md:order-none">
            <img
              src={moviePosterSrc}
              alt={`Poster for ${movie.primaryTitle || movie.primary_title}`}
              className="w-full h-auto aspect-[2/3] md:absolute md:inset-0 md:h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_MOVIE_PLACEHOLDER_IMAGE; }}
            />
          </div>

          {/* Details Section - This section will scroll if content is too tall */}
          <div className="w-full md:flex-1 p-3 sm:p-4 md:p-5 space-y-4 md:space-y-5 overflow-y-auto nice-scrollbar-y order-2 md:order-none">


            {/* Info Box (Rating, Runtime, Genres) - Unchanged */}
            <div className="bg-surface-light dark:bg-surface-dark p-3 sm:p-4 rounded-lg shadow">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                <InfoItem label="Rating" value={movie.rating ? `${movie.rating}/10` : 'N/A'} />
                <InfoItem label="Votes" value={movie.votes ? Number(movie.votes).toLocaleString() : 'N/A'} />
                <InfoItem label="Runtime" value={movie.runtimeMinutes || movie.runtime_minutes ? `${movie.runtimeMinutes || movie.runtime_minutes} min` : 'N/A'} />
                <InfoItem label="Genres" value={movie.genres ? (Array.isArray(movie.genres) ? movie.genres.join(', ') : String(movie.genres).replace(/,/g, ', ')) : 'N/A'} className="col-span-2 sm:col-span-3" />
              </div>
            </div>

            {/* Directors (Horizontal Scroll) - Unchanged */}
            {directors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 text-base sm:text-lg">Directed by</h4>
                <div className="flex space-x-3 pb-2 overflow-x-auto nice-scrollbar-x">
                  {directors.map(person => <CreditItem key={`${person.nconst}-dir`} person={person} type="director" />)}
                </div>
              </div>
            )}

            {/* Writers (Horizontal Scroll) - Unchanged */}
            {writers.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 text-base sm:text-lg">Written by</h4>
                <div className="flex space-x-3 pb-2 overflow-x-auto nice-scrollbar-x">
                  {writers.map(person => <CreditItem key={`${person.nconst}-write`} person={person} type="writer" />)}
                </div>
              </div>
            )}

            {/* MODIFIED Cast Section with Vertical List and Pagination */}
            {fullCastList.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 text-base sm:text-lg">Cast</h4>
                <div className="space-y-1"> {/* Container for current page of cast items */}
                  {paginatedCast.map(actor => <CastMemberItemVertical key={actor.nconst} actor={actor} />)}
                </div>
                {/* Render pagination controls if there's more than one page of cast */}
                <SimplePaginationControls
                  currentPage={currentCastPage}
                  totalPages={totalCastPages}
                  onPageChange={handleCastPageChange}
                />
              </div>
            )}
            {/* END MODIFIED Cast Section */}

          </div>
        </div>
      </div>
      {/* Global styles - Unchanged */}
      <style jsx global>{`
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out forwards;
        }
        .nice-scrollbar-x::-webkit-scrollbar { height: 5px; }
        .nice-scrollbar-x::-webkit-scrollbar-track { @apply bg-transparent; }
        .nice-scrollbar-x::-webkit-scrollbar-thumb { @apply bg-text-secondary-dark/50 dark:bg-text-secondary-light/40 rounded; }
        .nice-scrollbar-x::-webkit-scrollbar-thumb:hover { @apply bg-primary-red/70; }

        .nice-scrollbar-y::-webkit-scrollbar { width: 7px; }
        .nice-scrollbar-y::-webkit-scrollbar-track { @apply bg-surface-light dark:bg-surface-dark; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb { @apply bg-text-secondary-light dark:bg-text-secondary-dark rounded; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb:hover { @apply bg-primary-red; }
      `}</style>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContentJsx, modalRoot) : modalContentJsx;
};

export default MovieModal;