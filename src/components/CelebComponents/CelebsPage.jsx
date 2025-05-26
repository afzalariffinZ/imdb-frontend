// src/pages/CelebsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CelebCard from '../CelebComponents/CelebCard'; // Adjust path if CelebCard is elsewhere
import SearchBar from '../MovieComponents/SearchBar';   // Assuming SearchBar is in src/components
import Pagination from '../MovieComponents/Pagination'; // Assuming Pagination is in src/components
import CircularProgress from '@mui/material/CircularProgress';
import CelebModal from '../CelebComponents/CelebModal'; 

const CELEBS_PER_PAGE = 12; // Adjust as needed, e.g., for a 4-column layout 12 or 16
const API_BASE_URL = 'http://localhost:3000'; // Your PHP API base URL

const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <CircularProgress style={{ color: '#FBBF24' }} />
    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark text-lg">Loading celebrities...</p>
  </div>
);

// You might want a CelebModal similar to MovieModal if you plan to show details


const CelebsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialStateFromURL = useCallback(() => {
    const search = searchParams.get('search') || ''; // Use 'search' to match API
    const page = parseInt(searchParams.get('page'), 10) || 1;
    return { search, page };
  }, [searchParams]);

  const initialState = getInitialStateFromURL();

  const [celebs, setCelebs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [totalCelebCount, setTotalCelebCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialState.search);
  const [selectedCeleb, setSelectedCeleb] = useState(null); // For a potential modal

  const totalPages = Math.ceil(totalCelebCount / CELEBS_PER_PAGE);

  const updateURLParams = useCallback((newValues) => {
    const params = new URLSearchParams();
    const currentSearch = newValues.search !== undefined ? newValues.search : searchTerm;
    const currentPageForUrl = newValues.page !== undefined ? parseInt(newValues.page, 10) : currentPage;

    if (currentSearch) params.set('search', currentSearch);
    if (currentPageForUrl > 1) params.set('page', currentPageForUrl.toString());
    
    setSearchParams(params, { replace: true });
  }, [setSearchParams, searchTerm, currentPage]);


  const fetchCelebsList = useCallback(async (isNewFetch = false) => {
    if (isNewFetch) setCelebs([]);
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * CELEBS_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: CELEBS_PER_PAGE.toString(),
        offset: offset.toString(),
      });
      if (searchTerm) queryParams.append('search', searchTerm); // API expects 'search'

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
  }, [currentPage, searchTerm]);

  const handleOpenCelebModal = (celeb) => {
    // In a real app, you might fetch more detailed celeb data here if needed
    // For now, we'll use the data already fetched in the list
    // The `celeb` object from the list API should have:
    // nconst, primaryName, birthYear, deathYear, imageUrl, professions (array), titlesAssociated (array)
    setSelectedCeleb(celeb);
  };

  const handleCloseCelebModal = () => {
    setSelectedCeleb(null);
  };


  useEffect(() => {
    const { search: urlSearch, page: urlPage } = getInitialStateFromURL();
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [searchParams, getInitialStateFromURL]); // Removed searchTerm, currentPage from deps


  useEffect(() => {
    fetchCelebsList(true); // isNewFetch = true
  }, [currentPage, searchTerm, fetchCelebsList]);


  const handleSearchSubmit = (newTerm) => {
    updateURLParams({ search: newTerm, page: '1' });
  };

  const handlePageChange = (newPage) => {
    updateURLParams({ page: newPage.toString() });
  };

  // const handleOpenCelebModal = (celeb) => {
  //   // Fetch full celeb details if needed, then:
  //   setSelectedCeleb(celeb);
  // };
  // const handleCloseCelebModal = () => {
  //   setSelectedCeleb(null);
  // };

  useEffect(() => {
    if (selectedCeleb) {
      document.title = `${selectedCeleb.primaryName} - Details - IMDb2`;
    } else if (searchTerm) {
      document.title = `Search Celebs: ${searchTerm} - IMDb2`;
    } else {
      document.title = `Browse Celebrities - IMDb2`;
    }
  }, [searchTerm, selectedCeleb]);

  let pageTitleContent;
  if (searchTerm && !isLoading) {
    pageTitleContent = <>Results for "<strong>{searchTerm}</strong>" ({totalCelebCount} found)</>;
  } else if (searchTerm && isLoading) {
    pageTitleContent = <>Searching for "<strong>{searchTerm}</strong>"...</>;
  } else {
    pageTitleContent = <>Browse Celebrities ({totalCelebCount > 0 ? totalCelebCount : isLoading ? '' : '0'} total)</>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-text-primary-light dark:text-text-primary-dark">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">{pageTitleContent}</h1>

      <SearchBar onSearch={handleSearchSubmit} initialTerm={searchTerm} />

      {isLoading && <LoadingIndicator />}
      
      {!isLoading && error && (
        <div className="text-center my-4 p-4 bg-red-700 bg-opacity-20 border border-red-600 text-red-300 rounded-md" role="alert">
          <strong className="font-bold">Error!</strong><span className="block sm:inline"> {error}</span>
        </div>
      )}
      {!isLoading && !error && celebs.length === 0 && (
        <div className="text-center my-4 p-4 bg-blue-700 bg-opacity-20 border border-blue-600 text-blue-300 rounded-md" role="alert">
          {searchTerm ? `No celebrities found matching "${searchTerm}".` : "No celebrities to display."}
        </div>
      )}

      {!isLoading && celebs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {celebs.map((celeb) => (
            <CelebCard
              key={celeb.nconst}
              celeb={celeb}
              onCardClick={() => {handleOpenCelebModal(celeb)}}
            />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && !error /* && !selectedCeleb */ && (
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