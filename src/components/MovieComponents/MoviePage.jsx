// src/pages/MoviesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../MovieComponents/MovieCard';
import MovieModal from '../MovieComponents/MovieModal';
import SearchBar from '../MovieComponents/SearchBar';
import Pagination from '../MovieComponents/Pagination';
import FilterBar from '../MovieComponents/FilterBar';
import CircularProgress from '@mui/material/CircularProgress';

const MOVIES_PER_PAGE = 8;
const API_BASE_URL = 'http://localhost:3000'; // Your PHP API base URL

const generateFakePrincipalsForModal = (movieIndex) => {
  const principals = [];
  const directorNconst = `nm${7000000 + movieIndex}d`;
  principals.push({
    nconst: directorNconst, name: `Director ${String.fromCharCode(65 + (movieIndex % 26))}`, category: 'director', job: null, characters: null,
    imageUrl: `https://i.pravatar.cc/100?u=${directorNconst}`,
  });
  for (let i = 0; i < (movieIndex % 2) + 1; i++) {
    const writerNconst = `nm${8000000 + movieIndex}w${i}`;
    principals.push({
      nconst: writerNconst, name: `Writer ${String.fromCharCode(65 + (movieIndex % 20) + i)}`, category: 'writer', job: i === 0 ? '(story)' : '(screenplay)', characters: null,
      imageUrl: `https://i.pravatar.cc/100?u=${writerNconst}`,
    });
  }
  for (let i = 0; i < (movieIndex % 3) + 3; i++) {
    const actorNconst = `nm${9000000 + movieIndex}a${i}`;
    principals.push({
      nconst: actorNconst, name: `Actor ${String.fromCharCode(65 + (movieIndex % 15) + i)} ${String.fromCharCode(65 + (movieIndex % 10) + i + 1)}.`, category: i % 2 === 0 ? 'actor' : 'actress', job: null,
      characters: JSON.stringify([`Character ${i + 1}`]), imageUrl: `https://i.pravatar.cc/100?u=${actorNconst}`,
    });
  }
  return principals;
};

const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <CircularProgress style={{ color: '#FBBF24' }} />
    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark text-lg">Loading movies...</p>
  </div>
);

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const parseStateFromURL = useCallback(() => {
    const title = searchParams.get('title') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const genresParam = searchParams.get('genres'); // Comma-separated string
    const minRatingParam = searchParams.get('minRating') || '';
    const maxRatingParam = searchParams.get('maxRating') || '';
    const startYearParam = searchParams.get('startYear') || '';
    const endYearParam = searchParams.get('endYear') || '';
    const isAdultParam = searchParams.get('isAdult'); // '0', '1', or null

    let isAdultStateValue = 'any'; // Default for local state and FilterBar
    if (isAdultParam === '1') isAdultStateValue = 'yes';
    else if (isAdultParam === '0') isAdultStateValue = 'no';
    
    return {
      searchTerm: title,
      currentPage: page,
      filters: {
        minRating: minRatingParam,
        maxRating: maxRatingParam,
        selectedGenres: genresParam ? genresParam.split(',').filter(g => g && g.trim() !== '') : [],
        startYear: startYearParam,
        endYear: endYearParam,
        isAdult: isAdultStateValue, // 'any', 'yes', 'no' for local state
      }
    };
  }, [searchParams]);

  // Initialize state using a single call to parseStateFromURL for consistency
  const initialParsedState = React.useMemo(() => parseStateFromURL(), [parseStateFromURL]);

  const [searchTerm, setSearchTerm] = useState(initialParsedState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialParsedState.currentPage);
  const [filters, setFilters] = useState(initialParsedState.filters);

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalMovieCount, setTotalMovieCount] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [fakeIndexCounter, setFakeIndexCounter] = useState(0); // For modal fake data

  const totalPages = Math.ceil(totalMovieCount / MOVIES_PER_PAGE);

  const updateURL = useCallback((newValues = {}) => {
    const params = new URLSearchParams();

    const finalSearchTerm = newValues.searchTerm !== undefined ? newValues.searchTerm : searchTerm;
    const finalCurrentPage = newValues.currentPage !== undefined ? Number(newValues.currentPage) : currentPage;
    const sourceFilters = newValues.filters !== undefined ? newValues.filters : filters;

    if (finalSearchTerm) params.set('title', finalSearchTerm);
    if (finalCurrentPage > 1) params.set('page', finalCurrentPage.toString());

    if (sourceFilters.minRating) params.set('minRating', sourceFilters.minRating.toString());
    if (sourceFilters.maxRating) params.set('maxRating', sourceFilters.maxRating.toString());
    
    if (sourceFilters.selectedGenres && sourceFilters.selectedGenres.length > 0) {
      params.set('genres', sourceFilters.selectedGenres.join(','));
    }

    if (sourceFilters.startYear) params.set('startYear', sourceFilters.startYear.toString());
    if (sourceFilters.endYear) params.set('endYear', sourceFilters.endYear.toString());
    
    // Convert 'any'/'yes'/'no' from local state to '0'/'1' for URL/API
    if (sourceFilters.isAdult && sourceFilters.isAdult !== 'any') {
      params.set('isAdult', sourceFilters.isAdult === 'yes' ? '1' : '0');
    }
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, filters, setSearchParams]);

  // Effect to sync local state FROM URL changes
  useEffect(() => {
    const { searchTerm: urlSearchTerm, currentPage: urlPage, filters: urlFilters } = parseStateFromURL();
    
    let needsUpdate = false;
    if (urlSearchTerm !== searchTerm) { setSearchTerm(urlSearchTerm); needsUpdate = true; }
    if (urlPage !== currentPage) { setCurrentPage(urlPage); needsUpdate = true; }
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      setFilters(urlFilters);
      needsUpdate = true;
    }
    // This effect ensures local state matches URL. Fetching is handled by another effect.
  }, [searchParams, parseStateFromURL, searchTerm, currentPage, filters]);


  const fetchMoviesList = useCallback(async () => {
    console.log("FETCHING MOVIES with state:", { currentPage, searchTerm, filters });
    setMovies([]);
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * MOVIES_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: MOVIES_PER_PAGE.toString(),
        offset: offset.toString(),
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      
      // Add filter params from local `filters` state
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxRating) queryParams.append('maxRating', filters.maxRating);
      if (filters.selectedGenres && filters.selectedGenres.length > 0) {
        queryParams.append('genres', filters.selectedGenres.join(','));
      }
      if (filters.startYear) queryParams.append('startYear', filters.startYear);
      if (filters.endYear) queryParams.append('endYear', filters.endYear);
      
      // Convert 'any'/'yes'/'no' from local state to '0'/'1' for API
      if (filters.isAdult && filters.isAdult !== 'any') {
        queryParams.append('isAdult', filters.isAdult === 'yes' ? '1' : '0');
      }
      
      console.log("API Call Params:", queryParams.toString());
      const response = await fetch(`${API_BASE_URL}/api_movies.php?${queryParams.toString()}`);
      
      if (!response.ok) {
        let errorText = `API Error (${response.status})`;
        try { const errorData = await response.json(); errorText = errorData.error || errorText; }
        catch (e) { try {const text = await response.text(); errorText += ` - ${text.substring(0,100)}`} catch (eInner) {/*ignore*/}}
        throw new Error(errorText);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setMovies(Array.isArray(data.movies) ? data.movies : []);
      setTotalMovieCount(data.totalCount || 0);

    } catch (e) {
      setError(e.message); console.error("Failed to fetch movies list:", e);
      setMovies([]); setTotalMovieCount(0);
    } finally { setIsLoading(false); }
  }, [currentPage, searchTerm, filters]); // API call depends on these local states

  // Effect to fetch data when critical local states (currentPage, searchTerm, filters) change
  useEffect(() => {
    fetchMoviesList();
  }, [fetchMoviesList]);


  const handleSearchSubmit = (newTerm) => {
    // updateURL will use current `filters` and `currentPage` (reset to 1) from its closure / newValues
    updateURL({ searchTerm: newTerm, currentPage: 1 });
  };
  
  const handleApplyFilters = (appliedFiltersFromBar) => {
    // appliedFiltersFromBar from FilterBar:
    // { minRating: string|undefined, maxRating: string|undefined, genres: string|undefined (comma-sep), 
    //   startYear: string|undefined, endYear: string|undefined, isAdult: string|undefined ('0', '1', or undefined) }
    
    let newIsAdultStateValue = 'any'; // Convert '0'/'1' from FilterBar back to 'any'/'yes'/'no' for local state
    if (appliedFiltersFromBar.isAdult === '1') newIsAdultStateValue = 'yes';
    else if (appliedFiltersFromBar.isAdult === '0') newIsAdultStateValue = 'no';

    updateURL({ 
      filters: { 
        minRating: appliedFiltersFromBar.minRating || '',
        maxRating: appliedFiltersFromBar.maxRating || '',
        selectedGenres: appliedFiltersFromBar.genres ? appliedFiltersFromBar.genres.split(',').filter(g=>g) : [],
        startYear: appliedFiltersFromBar.startYear || '',
        endYear: appliedFiltersFromBar.endYear || '',
        isAdult: newIsAdultStateValue, // Store as 'any', 'yes', 'no'
      }, 
      currentPage: 1 
      // searchTerm will be picked from closure by updateURL
    });
  };

  const handlePageChange = (newPage) => {
    // updateURL will use current `searchTerm` and `filters` from its closure
    updateURL({ currentPage: newPage });
  };
  
  const handleOpenMovieModal = (movieFromCard) => {
    const currentFakeIndex = fakeIndexCounter;
    setFakeIndexCounter(prev => prev + 1);
    const movieForModal = {
      ...movieFromCard,
      plot: movieFromCard.plot || `This is a placeholder plot for ${movieFromCard.primaryTitle || movieFromCard.primary_title}.`,
      tagline: movieFromCard.tagline || `A gripping tagline for ${movieFromCard.primaryTitle || movieFromCard.primary_title}!`,
      principals: generateFakePrincipalsForModal(currentFakeIndex),
    };
    setSelectedMovie(movieForModal);
  };
  const handleCloseMovieModal = () => setSelectedMovie(null);

  useEffect(() => {
    const movieTitle = selectedMovie?.primaryTitle || selectedMovie?.primary_title;
    if (selectedMovie && movieTitle) {
      document.title = `${movieTitle} - Movie Details - IMDb2`;
    } else if (searchTerm) {
      document.title = `Search: ${searchTerm} - IMDb2`;
    } else {
      document.title = `Browse Movies - IMDb2`;
    }
  }, [selectedMovie, searchTerm]);

  let pageTitleContent;
  if (searchTerm && !isLoading) {
    pageTitleContent = <>Results for "<strong>{searchTerm}</strong>" ({totalMovieCount} found)</>;
  } else if (searchTerm && isLoading) {
    pageTitleContent = <>Searching for "<strong>{searchTerm}</strong>"...</>;
  } else {
    let filterText = '';
    if (filters && Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : (f !== '' && f !== 'any')))) {
        filterText = " (Filtered)";
    }
    pageTitleContent = <>Browse Movies{filterText} ({isLoading ? '...' : (totalMovieCount || 0)} total)</>;
  }


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-text-primary-light dark:text-text-primary-dark">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">{pageTitleContent}</h1>

      <SearchBar onSearch={handleSearchSubmit} initialTerm={searchTerm} />
      
      <FilterBar 
        initialFilters={{ // Pass current local filter state to FilterBar
            minRating: filters.minRating,
            maxRating: filters.maxRating,
            selectedGenres: filters.selectedGenres || [],
            startYear: filters.startYear,
            endYear: filters.endYear,
            isAdult: filters.isAdult, // 'any', 'yes', 'no'
        }} 
        onApplyFilters={handleApplyFilters} 
      />

      {isLoading && <LoadingIndicator />}
      
      {!isLoading && error && (
        <div className="text-center my-4 p-4 bg-red-700 bg-opacity-20 border border-red-600 text-red-300 rounded-md" role="alert">
          <strong className="font-bold">Error!</strong><span className="block sm:inline"> {error}</span>
        </div>
      )}
      {!isLoading && !error && movies.length === 0 && totalMovieCount === 0 && (
        <div className="text-center my-4 p-4 bg-blue-700 bg-opacity-20 border border-blue-600 text-blue-300 rounded-md" role="alert">
          {searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : (f !== '' && f !== 'any'))) 
            ? `No movies found matching your criteria.` 
            : "No movies to display."}
        </div>
      )}
      
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-6">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id || movie.tconst || `movie-${index}`}
              movie={movie}
              onCardClick={() => handleOpenMovieModal(movie)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && !selectedMovie && movies.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedMovie && ( <MovieModal movie={selectedMovie} onClose={handleCloseMovieModal} /> )}

      <footer className="text-center py-10 mt-10 border-t border-border-light dark:border-border-dark">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">© {new Date().getFullYear()} IMDb2. A fictional site for demonstration.</p>
      </footer>
    </div>
  );
};

export default MoviesPage;