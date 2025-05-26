// src/pages/CelebsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CelebCard from '../CelebComponents/CelebCard';
import SearchBar from '../MovieComponents/SearchBar';
import Pagination from '../MovieComponents/Pagination';
import CelebFilterBar from '../CelebComponents/CelebFilterBar'; // Import the new filter bar
import CircularProgress from '@mui/material/CircularProgress';
import CelebModal from '../CelebComponents/CelebModal';

const CELEBS_PER_PAGE = 12;
const API_BASE_URL = 'http://localhost:3000';

const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <CircularProgress style={{ color: '#FBBF24' }} />
    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark text-lg">Loading celebrities...</p>
  </div>
);

const CelebsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse all relevant state from URL
  const parseStateFromURL = useCallback(() => {
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const professionsParam = searchParams.get('professions'); // Comma-separated string
    const birthYearStartParam = searchParams.get('birthYearStart') || '';
    const birthYearEndParam = searchParams.get('birthYearEnd') || '';

    return {
      searchTerm: search,
      currentPage: page,
      filters: {
        selectedProfessions: professionsParam ? professionsParam.split(',').filter(p => p && p.trim() !== '') : [],
        birthYearStart: birthYearStartParam,
        birthYearEnd: birthYearEndParam,
      }
    };
  }, [searchParams]);

  // Initialize state ONCE based on the initial URL
  const initialParsedState = React.useMemo(() => parseStateFromURL(), [parseStateFromURL]);

  const [celebs, setCelebs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCelebCount, setTotalCelebCount] = useState(0);
  const [selectedCeleb, setSelectedCeleb] = useState(null);

  const [searchTerm, setSearchTerm] = useState(initialParsedState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialParsedState.currentPage);
  const [filters, setFilters] = useState(initialParsedState.filters);


  const totalPages = Math.ceil(totalCelebCount / CELEBS_PER_PAGE);

  // Function to update URL search params intelligently
  const updateURL = useCallback((newValues = {}) => {
    const params = new URLSearchParams();

    const finalSearchTerm = newValues.searchTerm !== undefined ? newValues.searchTerm : searchTerm;
    const finalCurrentPage = newValues.currentPage !== undefined ? Number(newValues.currentPage) : currentPage;
    const sourceFilters = newValues.filters !== undefined ? newValues.filters : filters;

    if (finalSearchTerm) params.set('search', finalSearchTerm);
    if (finalCurrentPage > 1) params.set('page', finalCurrentPage.toString());

    if (sourceFilters.birthYearStart) params.set('birthYearStart', sourceFilters.birthYearStart.toString());
    if (sourceFilters.birthYearEnd) params.set('birthYearEnd', sourceFilters.birthYearEnd.toString());
    if (sourceFilters.selectedProfessions && sourceFilters.selectedProfessions.length > 0) {
      params.set('professions', sourceFilters.selectedProfessions.join(','));
    }

    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, filters, setSearchParams]);

  // Effect to sync local state FROM URL changes
  useEffect(() => {
    const { searchTerm: urlSearchTerm, currentPage: urlPage, filters: urlFilters } = parseStateFromURL();

    if (urlSearchTerm !== searchTerm) setSearchTerm(urlSearchTerm);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
        setFilters(urlFilters);
    }
  }, [searchParams, parseStateFromURL, searchTerm, currentPage, filters]);


  const fetchCelebsList = useCallback(async () => {
    console.log("FETCHING CELEBS with state:", { currentPage, searchTerm, filters });
    setCelebs([]);
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * CELEBS_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: CELEBS_PER_PAGE.toString(),
        offset: offset.toString(),
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      if (filters.birthYearStart) queryParams.append('birthYearStart', filters.birthYearStart);
      if (filters.birthYearEnd) queryParams.append('birthYearEnd', filters.birthYearEnd);
      if (filters.selectedProfessions && filters.selectedProfessions.length > 0) {
        queryParams.append('professions', filters.selectedProfessions.join(','));
      }

      console.log("Celeb API Call Params:", queryParams.toString());
      const response = await fetch(`${API_BASE_URL}/api_celebs.php?${queryParams.toString()}`);
      if (!response.ok) {
        let errorText = `API Error (${response.status})`;
        try { const errorData = await response.json(); errorText = errorData.error || errorText; }
        catch (e) { try {const text = await response.text(); errorText += ` - ${text.substring(0,100)}`} catch (eInner) { /* ignore */ }}
        throw new Error(errorText);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCelebs(Array.isArray(data.celebs) ? data.celebs : []);
      setTotalCelebCount(data.totalCount || 0);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch celebrities:", e);
      setCelebs([]);
      setTotalCelebCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filters]);


  useEffect(() => {
    fetchCelebsList();
  }, [fetchCelebsList]);


  const handleSearchSubmit = (newTerm) => {
    updateURL({ searchTerm: newTerm, currentPage: 1 });
  };

  const handleApplyCelebFilters = (appliedFiltersFromBar) => {
    // appliedFiltersFromBar: { birthYearStart?: number, birthYearEnd?: number, professions?: string (comma-sep) }
    updateURL({
      filters: {
        birthYearStart: appliedFiltersFromBar.birthYearStart ? String(appliedFiltersFromBar.birthYearStart) : '',
        birthYearEnd: appliedFiltersFromBar.birthYearEnd ? String(appliedFiltersFromBar.birthYearEnd) : '',
        selectedProfessions: appliedFiltersFromBar.professions ? appliedFiltersFromBar.professions.split(',').filter(p => p) : [],
      },
      currentPage: 1
    });
  };

  const handlePageChange = (newPage) => {
    updateURL({ currentPage: newPage });
  };

  const handleOpenCelebModal = (celeb) => setSelectedCeleb(celeb);
  const handleCloseCelebModal = () => setSelectedCeleb(null);

  useEffect(() => {
    if (selectedCeleb) {
      document.title = `${selectedCeleb.primaryName} - Details - IMDb2`;
    } else if (searchTerm) {
      document.title = `Search Celebs: ${searchTerm} - IMDb2`;
    } else {
      let filterText = '';
      if (filters && Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== ''))) {
          filterText = " (Filtered)";
      }
      document.title = `Browse Celebrities${filterText} - IMDb2`;
    }
  }, [searchTerm, selectedCeleb, filters]);

  let pageTitleContent;
  if (searchTerm && !isLoading) {
    pageTitleContent = <>Results for "<strong>{searchTerm}</strong>" ({totalCelebCount} found)</>;
  } else if (searchTerm && isLoading) {
    pageTitleContent = <>Searching for "<strong>{searchTerm}</strong>"...</>;
  } else {
    let filterText = '';
    if (filters && Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== ''))) {
        filterText = " (Filtered)";
    }
    pageTitleContent = <>Browse Celebrities{filterText} ({isLoading ? '...' : (totalCelebCount || 0)} total)</>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-text-primary-light dark:text-text-primary-dark">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">{pageTitleContent}</h1>

      <SearchBar onSearch={handleSearchSubmit} initialTerm={searchTerm} type='celebs' />

      <CelebFilterBar
        initialFilters={{
            birthYearStart: filters.birthYearStart,
            birthYearEnd: filters.birthYearEnd,
            selectedProfessions: filters.selectedProfessions || [],
        }}
        onApplyFilters={handleApplyCelebFilters}
      />

      {isLoading && <LoadingIndicator />}

      {!isLoading && error && (
        <div className="text-center my-4 p-4 bg-red-700 bg-opacity-20 border border-red-600 text-red-300 rounded-md" role="alert">
          <strong className="font-bold">Error!</strong><span className="block sm:inline"> {error}</span>
        </div>
      )}
      {!isLoading && !error && celebs.length === 0 && totalCelebCount === 0 && (
        <div className="text-center my-4 p-4 bg-blue-700 bg-opacity-20 border border-blue-600 text-blue-300 rounded-md" role="alert">
          {searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== ''))
            ? `No celebrities found matching your criteria.`
            : "No celebrities to display."}
        </div>
      )}

      {!isLoading && !error && celebs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {celebs.map((celeb) => (
            <CelebCard
              key={celeb.nconst}
              celeb={celeb}
              onCardClick={() => handleOpenCelebModal(celeb)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && !selectedCeleb && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedCeleb && (
        <CelebModal celeb={selectedCeleb} onClose={handleCloseCelebModal} />
      )}

      <footer className="text-center py-10 mt-10 border-t border-border-light dark:border-border-dark">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">© {new Date().getFullYear()} IMDb2. A fictional site for demonstration.</p>
      </footer>
    </div>
  );
};

export default CelebsPage;