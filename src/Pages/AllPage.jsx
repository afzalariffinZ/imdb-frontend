// src/pages/MoviesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Make sure this is imported
import MovieCard from '../components/MovieComponents/MovieCard'; // Adjust path if MovieCard is elsewhere
import MovieModal from '../components/MovieComponents/MovieModal';
import SearchBar from '../components/MovieComponents/SearchBar';
import Pagination from '../components/MovieComponents/Pagination';
import CircularProgress from '@mui/material/CircularProgress'; // MUI Spinner

// --- Constants ---
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

// --- Loading Indicator Component ---
const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <CircularProgress style={{ color: '#FBBF24' }} /> {/* Example color (Tailwind yellow-500) */}
    <p className="mt-4 themed-text-secondary text-lg">Loading...</p>
  </div>
);

const AllPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlSearchTerm = searchParams.get('title') || '';

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMovieCount, setTotalMovieCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialUrlSearchTerm);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [fakeIndexCounter, setFakeIndexCounter] = useState(0);

  const totalPages = Math.ceil(totalMovieCount / MOVIES_PER_PAGE);

  console.log('movies lengthm', movies.length)
  const fetchMoviesList = useCallback(async (isNewSearchOrPage = false) => {
    if (isNewSearchOrPage) {
        setMovies([]); // Clear previous movies immediately for a new search/page
    }
    setIsLoading(true);
    setError(null);
    // setMovies([]); // MOVED: Set this earlier if isNewSearchOrPage is true

    try {
      const offset = (currentPage - 1) * MOVIES_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: MOVIES_PER_PAGE.toString(),
        offset: offset.toString(),
      });
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/api_all.php?${queryParams.toString()}`);

      if (!response.ok) {
        let errorText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorText;
        } catch (e) {
          const textError = await response.text();
          errorText = `${errorText} - ${textError.substring(0, 200)}`;
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      setMovies(Array.isArray(data.movies) ? data.movies : []);
      setTotalMovieCount(data.totalCount || 0);

    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch movies list:", e);
      setMovies([]); // Ensure movies are cleared on error
      setTotalMovieCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]); // Dependencies for useCallback

  // Effect for initial load and when currentPage or searchTerm changes
  useEffect(() => {
    fetchMoviesList(true); // Pass true to indicate it's a new fetch that should clear old results
  }, [currentPage, searchTerm, fetchMoviesList]); // Add fetchMoviesList to dependencies

  // Effect to sync URL 'title' param with local searchTerm state
  useEffect(() => {
    const urlSearch = searchParams.get('title') || '';
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      // setCurrentPage(1); // This will be handled by the main useEffect when searchTerm changes
    }
  }, [searchParams]); // Removed searchTerm from deps here to avoid loop, handled by main effect

  const handleSearchSubmit = (newTerm) => {
    // If the new term is different, update searchParams, which will trigger useEffects
    if (newTerm !== searchTerm) {
        setCurrentPage(1); // Reset to page 1 for a new search
        setSearchTerm(newTerm); // Update local state immediately
        if (newTerm) {
            setSearchParams({ title: newTerm, page: '1' }); // Update URL
        } else {
            setSearchParams({ page: '1' }); // Clear title, keep page
        }
    } else if (!newTerm && searchTerm) { // Clearing an existing search
        setSearchTerm('');
        setCurrentPage(1);
        setSearchParams({ page: '1' });
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Update URL to reflect page change
      const currentSearchParams = new URLSearchParams(searchParams.toString());
      currentSearchParams.set('page', page.toString());
      setSearchParams(currentSearchParams);
    }
  };

  // Effect to sync currentPage with URL 'page' param (if you want page in URL)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page'), 10) || 1;
    if (pageFromUrl !== currentPage) {
        setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);


  const handleOpenMovieModal = (movieFromCard) => {
    const currentFakeIndex = fakeIndexCounter;
    setFakeIndexCounter(prev => prev + 1);
    const movieForModal = {
      ...movieFromCard,
      plot: movieFromCard.plot || `This is a placeholder plot for ${movieFromCard.primaryTitle}.`,
      tagline: movieFromCard.tagline || `A gripping tagline for ${movieFromCard.primaryTitle}!`,
      principals: generateFakePrincipalsForModal(currentFakeIndex),
    };
    setSelectedMovie(movieForModal);
  };

  const handleCloseMovieModal = () => {
    setSelectedMovie(null);
  };

  useEffect(() => {
    if (selectedMovie) {
      document.title = `${selectedMovie.primaryTitle} - Movie Details - IMDb2`;
    } else if (searchTerm) {
      document.title = `Search: ${searchTerm} - IMDb2`;
    }
     else {
      document.title = `Browse Movies - IMDb2`;
    }
  }, [selectedMovie, searchTerm]);

  let pageTitleContent;
  if (searchTerm && !isLoading) {
    pageTitleContent = <>Results for "<strong>{searchTerm}</strong>" ({totalMovieCount} found)</>;
  } else if (searchTerm && isLoading) {
    pageTitleContent = <>Searching for "<strong>{searchTerm}</strong>"...</>;
  } else {
    pageTitleContent = <>Browse All ({totalMovieCount > 0 ? totalMovieCount : isLoading ? '' : '0'} total)</>;
  }
  
  // console.log('MoviesPage isLoading:', isLoading, 'movies.length:', movies.length);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 themed-text z-">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">{pageTitleContent}</h1>

      <SearchBar onSearch={handleSearchSubmit} initialTerm={searchTerm} type='all'/>

      {isLoading && <LoadingIndicator /> /* Show loader WHENEVER isLoading is true */}
      
      {!isLoading && error && (
        <div className="text-center my-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 text-red-300 rounded-md" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {!isLoading && !error && movies.length === 0 && (
        <div className="text-center my-4 p-4 bg-blue-900 bg-opacity-50 border border-blue-700 text-blue-300 rounded-md" role="alert">
          {searchTerm ? `No titles found matching "${searchTerm}".` : "No titles to display."}
        </div>
      )}

      {!isLoading && movies.length > 0 && ( // Only show movie grid if not loading and movies exist
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id || movie.tconst || `movie-${index}`}
              movie={movie}
              onCardClick={() => handleOpenMovieModal(movie)}
            />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && !error && !selectedMovie && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseMovieModal} type={"all"} />
      )}

      <footer className="text-center py-10 mt-10 border-t themed-border-color">
        <p className="text-sm themed-text-secondary">© {new Date().getFullYear()} IMDb2. A fictional site for demonstration.</p>
      </footer>
    </div>
  );
};

export default AllPage;