// src/pages/AllPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieComponents/MovieCard';
import MovieModal from '../components/MovieComponents/MovieModal';
import SearchBar from '../components/MovieComponents/SearchBar';
import Pagination from '../components/MovieComponents/Pagination';
import AllFilterBar from './AllFilterBar'; // IMPORT THE NEW FILTER BAR
import CircularProgress from '@mui/material/CircularProgress';

const ITEMS_PER_PAGE = 8; // Changed from MOVIES_PER_PAGE
const API_BASE_URL = 'http://localhost:8000';

// generateFakePrincipalsForModal can remain the same if MovieModal expects it
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
    <p className="mt-4 themed-text-secondary text-lg">Loading...</p>
  </div>
);

const AllPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const parseStateFromURL = useCallback(() => {
    const title = searchParams.get('title') || ''; // 'title' is common for movie/item search
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const genresParam = searchParams.get('genres');
    const minRatingParam = searchParams.get('minRating') || '';
    const maxRatingParam = searchParams.get('maxRating') || '';
    const startYearParam = searchParams.get('startYear') || '';
    const endYearParam = searchParams.get('endYear') || '';
    const isAdultParam = searchParams.get('isAdult'); // '0', '1', or null
    const titleTypesParam = searchParams.get('titleTypes');


    let isAdultStateValue = 'any';
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
        isAdult: isAdultStateValue,
        selectedTitleTypes: titleTypesParam ? titleTypesParam.split(',').filter(t => t && t.trim() !== '') : [],
      }
    };
  }, [searchParams]);

  const initialParsedState = React.useMemo(() => parseStateFromURL(), [parseStateFromURL]);

  const [items, setItems] = useState([]); // Changed from movies to items
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItemCount, setTotalItemCount] = useState(0); // Changed from totalMovieCount
  const [selectedItem, setSelectedItem] = useState(null); // Changed from selectedMovie
  const [fakeIndexCounter, setFakeIndexCounter] = useState(0);

  const [searchTerm, setSearchTerm] = useState(initialParsedState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialParsedState.currentPage);
  const [filters, setFilters] = useState(initialParsedState.filters);

  const totalPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);

  const updateURL = useCallback((newValues = {}) => {
    const params = new URLSearchParams();

    const finalSearchTerm = newValues.searchTerm !== undefined ? newValues.searchTerm : searchTerm;
    const finalCurrentPage = newValues.currentPage !== undefined ? Number(newValues.currentPage) : currentPage;
    const sourceFilters = newValues.filters !== undefined ? newValues.filters : filters;

    if (finalSearchTerm) params.set('title', finalSearchTerm); // Keep 'title' for consistency with API search param
    if (finalCurrentPage > 1) params.set('page', finalCurrentPage.toString());

    if (sourceFilters.minRating) params.set('minRating', sourceFilters.minRating);
    if (sourceFilters.maxRating) params.set('maxRating', sourceFilters.maxRating);
    if (sourceFilters.selectedGenres && sourceFilters.selectedGenres.length > 0) {
      params.set('genres', sourceFilters.selectedGenres.join(','));
    }
    if (sourceFilters.startYear) params.set('startYear', sourceFilters.startYear);
    if (sourceFilters.endYear) params.set('endYear', sourceFilters.endYear);
    if (sourceFilters.isAdult && sourceFilters.isAdult !== 'any') {
      params.set('isAdult', sourceFilters.isAdult === 'yes' ? '1' : '0');
    }
    if (sourceFilters.selectedTitleTypes && sourceFilters.selectedTitleTypes.length > 0) {
      params.set('titleTypes', sourceFilters.selectedTitleTypes.join(','));
    }

    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, filters, setSearchParams]);


  useEffect(() => {
    const { searchTerm: urlSearchTerm, currentPage: urlPage, filters: urlFilters } = parseStateFromURL();
    if (urlSearchTerm !== searchTerm) setSearchTerm(urlSearchTerm);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
        setFilters(urlFilters);
    }
  }, [searchParams, parseStateFromURL, searchTerm, currentPage, filters]);


  const fetchItemsList = useCallback(async () => {
    console.log("FETCHING ALL ITEMS with state:", { currentPage, searchTerm, filters });
    setItems([]);
    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
      });
      if (searchTerm) queryParams.append('search', searchTerm); // 'search' is used by api_all.php

      // Add filters
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxRating) queryParams.append('maxRating', filters.maxRating);
      if (filters.selectedGenres && filters.selectedGenres.length > 0) {
        queryParams.append('genres', filters.selectedGenres.join(','));
      }
      if (filters.startYear) queryParams.append('startYear', filters.startYear);
      if (filters.endYear) queryParams.append('endYear', filters.endYear);
      if (filters.isAdult && filters.isAdult !== 'any') {
        queryParams.append('isAdult', filters.isAdult === 'yes' ? '1' : '0');
      }
      if (filters.selectedTitleTypes && filters.selectedTitleTypes.length > 0) {
        queryParams.append('titleTypes', filters.selectedTitleTypes.join(','));
      }

      console.log("AllPage API Call Params:", queryParams.toString());
      const response = await fetch(`${API_BASE_URL}/api_all.php?${queryParams.toString()}`);

      if (!response.ok) {
        let errorText = `HTTP error! status: ${response.status}`;
        try { const errorData = await response.json(); errorText = errorData.error || errorText; }
        catch (e) { const textError = await response.text(); errorText = `${errorText} - ${textError.substring(0, 200)}`; }
        throw new Error(errorText);
      }

      const data = await response.json();
      if(data.error) throw new Error(data.error);

      setItems(Array.isArray(data.items) ? data.items : []); // Expect 'items' from api_all.php
      setTotalItemCount(data.totalCount || 0);

    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch items list:", e);
      setItems([]);
      setTotalItemCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    fetchItemsList();
  }, [fetchItemsList]);


  const handleSearchSubmit = (newTerm) => {
    updateURL({ searchTerm: newTerm, currentPage: 1 });
  };

  const handleApplyAllFilters = (appliedFiltersFromBar) => {
    // appliedFiltersFromBar: { minRating, maxRating, genres (string), startYear, endYear, isAdult ('0'/'1'), titleTypes (string) }
    let newIsAdultStateValue = 'any';
    if (appliedFiltersFromBar.isAdult === '1') newIsAdultStateValue = 'yes';
    else if (appliedFiltersFromBar.isAdult === '0') newIsAdultStateValue = 'no';

    updateURL({
      filters: {
        minRating: appliedFiltersFromBar.minRating ? String(appliedFiltersFromBar.minRating) : '',
        maxRating: appliedFiltersFromBar.maxRating ? String(appliedFiltersFromBar.maxRating) : '',
        selectedGenres: appliedFiltersFromBar.genres ? appliedFiltersFromBar.genres.split(',').filter(g => g) : [],
        startYear: appliedFiltersFromBar.startYear ? String(appliedFiltersFromBar.startYear) : '',
        endYear: appliedFiltersFromBar.endYear ? String(appliedFiltersFromBar.endYear) : '',
        isAdult: newIsAdultStateValue,
        selectedTitleTypes: appliedFiltersFromBar.titleTypes ? appliedFiltersFromBar.titleTypes.split(',').filter(t => t) : [],
      },
      currentPage: 1
    });
  };

  const handlePageChange = (page) => {
    updateURL({ currentPage: page });
  };

  const handleOpenItemModal = (item) => { // Renamed from handleOpenMovieModal
    const currentFakeIndex = fakeIndexCounter;
    setFakeIndexCounter(prev => prev + 1);
    const itemForModal = {
      ...item,
      plot: item.plot || `This is a placeholder plot for ${item.primaryTitle || item.primary_title}.`,
      tagline: item.tagline || `A gripping tagline for ${item.primaryTitle || item.primary_title}!`,
      principals: generateFakePrincipalsForModal(currentFakeIndex), // Assuming MovieModal can handle this
    };
    setSelectedItem(itemForModal); // Renamed
  };

  const handleCloseItemModal = () => setSelectedItem(null); // Renamed


  useEffect(() => {
    const itemTitle = selectedItem?.primaryTitle || selectedItem?.primary_title;
    if (selectedItem && itemTitle) {
      document.title = `${itemTitle} - Details - IMDb2`;
    } else if (searchTerm) {
      document.title = `Search: ${searchTerm} - IMDb2`;
    } else {
      let filterText = '';
      if (filters && Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : (f !== '' && f !== 'any')))) {
          filterText = " (Filtered)";
      }
      document.title = `Browse All Items${filterText} - IMDb2`;
    }
  }, [selectedItem, searchTerm, filters]);


  let pageTitleContent;
  if (searchTerm && !isLoading) {
    pageTitleContent = <>Results for "<strong>{searchTerm}</strong>" ({totalItemCount} found)</>;
  } else if (searchTerm && isLoading) {
    pageTitleContent = <>Searching for "<strong>{searchTerm}</strong>"...</>;
  } else {
    let filterText = '';
    if (filters && Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : (f !== '' && f !== 'any')))) {
        filterText = " (Filtered)";
    }
    pageTitleContent = <>Browse All Items{filterText} ({isLoading ? '...' : (totalItemCount || 0)} total)</>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 themed-text">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">{pageTitleContent}</h1>

      <SearchBar onSearch={handleSearchSubmit} initialTerm={searchTerm} type='all'/>

      <AllFilterBar
        initialFilters={{
            minRating: filters.minRating,
            maxRating: filters.maxRating,
            selectedGenres: filters.selectedGenres || [],
            startYear: filters.startYear,
            endYear: filters.endYear,
            isAdult: filters.isAdult, // 'any', 'yes', 'no'
            selectedTitleTypes: filters.selectedTitleTypes || [],
        }}
        onApplyFilters={handleApplyAllFilters}
      />

      {isLoading && <LoadingIndicator />}

      {!isLoading && error && (
        <div className="text-center my-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 text-red-300 rounded-md" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {!isLoading && !error && items.length === 0 && totalItemCount === 0 && (
        <div className="text-center my-4 p-4 bg-blue-900 bg-opacity-50 border border-blue-700 text-blue-300 rounded-md" role="alert">
          {searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : (f !== '' && f !== 'any')))
            ? `No items found matching your criteria.`
            : "No items to display."}
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {items.map((item, index) => ( // items instead of movies
            <MovieCard // Assuming MovieCard can display generic item data if structure is similar
              key={item.id || item.tconst || `item-${index}`}
              movie={item} // Pass item as movie prop, MovieCard needs to be flexible
              onCardClick={() => handleOpenItemModal(item)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && !selectedItem && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedItem && ( // Assuming MovieModal can be used for generic items too
        <MovieModal movie={selectedItem} onClose={handleCloseItemModal} type={"all"} />
      )}

      <footer className="text-center py-10 mt-10 border-t themed-border-color">
        <p className="text-sm themed-text-secondary">© {new Date().getFullYear()} IMDb2. A fictional site for demonstration.</p>
      </footer>
    </div>
  );
};

export default AllPage;