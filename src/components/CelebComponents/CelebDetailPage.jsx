// src/pages/CelebDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_MOVIE_PLACEHOLDER_IMAGE = 'https://thumbs.dreamstime.com/b/generic-person-gray-photo-placeholder-man-silhouette-white-background-144511705.jpg';
const DEFAULT_PERSON_PLACEHOLDER_IMAGE = 'https://thumbs.dreamstime.com/b/generic-person-gray-photo-placeholder-man-silhouette-white-background-144511705.jpg';

const parseCharactersSimple = (charactersJsonString) => {
    if (!charactersJsonString) return null;
    try {
        const charactersArray = JSON.parse(charactersJsonString);
        return Array.isArray(charactersArray) ? charactersArray.join(' / ') : null;
    } catch (e) {
        return null; // Not valid JSON
    }
};

const formatProfession = (professionSlug) => {
  if (!professionSlug) return '';
  return professionSlug
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh]">
    <CircularProgress style={{ color: '#FBBF24' }} />
    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark text-lg">Loading celebrity details...</p>
  </div>
);

const CelebDetailPage = () => {
  const { nconst } = useParams(); // Get nconst from URL like /celebs/:nconst
  const [celeb, setCeleb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCelebDetail = useCallback(async () => {
    if (!nconst) {
      setError("Celebrity ID (nconst) is missing from URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api_celeb_detail.php?nconst=${nconst}`);
      if (!response.ok) {
        let errorText = `API Error (${response.status})`;
        try { const errorData = await response.json(); errorText = errorData.error || `Failed to load celebrity data.`; }
        catch (e) { try {const text = await response.text(); errorText += ` - ${text.substring(0,100)}`} catch (eInner) {/*ignore*/}}
        throw new Error(errorText);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const celebData = data.celeb || data; // Expecting single object under 'celeb' or at root
      if (!celebData || !celebData.nconst) {
        throw new Error("Celebrity data not found or invalid structure.");
      }
      setCeleb(celebData);
    } catch (e) {
      setError(e.message || "An unknown error occurred.");
      console.error("Failed to fetch celeb details:", e);
      setCeleb(null);
    } finally {
      setIsLoading(false);
    }
  }, [nconst]);

  useEffect(() => {
    fetchCelebDetail();
  }, [fetchCelebDetail]);

  useEffect(() => {
    if (celeb) {
      document.title = `${celeb.primaryName || 'Celebrity'} - Details - IMDb2`;
    } else if (!isLoading && error) {
      document.title = `Error - IMDb2`;
    } else if (!isLoading && !celeb) {
      document.title = `Celebrity Not Found - IMDb2`;
    }
  }, [celeb, isLoading, error]);

  if (isLoading) return <LoadingIndicator />;
  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 dark:text-red-400 text-xl mb-4">Error: {error}</p>
      <RouterLink to="/celebs" className="text-primary-yellow hover:underline">← Back to Celebrities</RouterLink>
    </div>
  );
  if (!celeb) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-xl text-text-primary-light dark:text-text-primary-dark">Celebrity not found.</p>
      <RouterLink to="/celebs" className="mt-4 inline-block text-primary-yellow hover:underline">← Back to Celebrities</RouterLink>
    </div>
  );
  console.log("CelebDetailPage rendered with celeb:", celeb);
  const celebImageUrl = celeb.image_url || DEFAULT_PERSON_PLACEHOLDER_IMAGE;
  const birthYear = celeb.birthYear || 'N/A';
  const deathYearText = celeb.deathYear || (celeb.birthYear && !celeb.deathYear ? 'Present' : 'N/A');
  const displayProfessions = celeb.professions && celeb.professions.length > 0
    ? celeb.professions.map(formatProfession).join(', ') // Use the formatter
    : (celeb.primaryProfession && celeb.primaryProfession !== '\\N' ? formatProfession(celeb.primaryProfession) : 'N/A'); // Fallback if professions array is empty but primaryProfession (string) exists

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-text-primary-light dark:text-text-primary-dark">
      {/* Header Section */}
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-yellow">
          {celeb.primaryName}
        </h1>
        {birthYear !== 'N/A' && (
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {birthYear} {deathYearText !== 'N/A' && deathYearText !== 'Present' ? `– ${deathYearText}` : (deathYearText === 'Present' ? '– Present' : '')}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column: Image */}
        <div className="w-full lg:w-1/3 xl:w-[340px] flex-shrink-0">
          <img
            src={celebImageUrl}
            alt={`Photo of ${celeb.primaryName}`}
            className="w-full rounded-lg shadow-xl object-cover aspect-[2/3]"
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
          />
        </div>

        {/* Right Column: Details */}
        <div className="w-full lg:flex-1 space-y-6">
          {displayProfessions !== 'N/A' && (
            <section>
              <h2 className="text-xl font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Professions</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">{displayProfessions}</p>
            </section>
          )}
          
          {/* Biography - Assuming 'celeb.biography' will be added to API response */}
          {celeb.biography && (
            <section>
              <h2 className="text-xl font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Biography</h2>
              <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line">
                {celeb.biography}
              </p>
            </section>
          )}

          {celeb.titlesAssociated && celeb.titlesAssociated.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">Known For</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {celeb.titlesAssociated.map(title => (
                  <RouterLink 
                    to={`/movie/${title.tconst}`} // Link to movie detail page
                    key={title.tconst}
                    className="block bg-surface-light dark:bg-surface-dark p-3 rounded-lg shadow hover:shadow-xl transition-shadow"
                  >
                    {/* Optional: Add small placeholder for movie poster if available in title object */}
                    {/* <img src={title.posterThumbnail || DEFAULT_TITLE_PLACEHOLDER_IMAGE} alt="" className="w-full h-24 object-cover rounded mb-2"/> */}
                    <h3 className="font-semibold text-primary-yellow truncate" title={title.primaryTitle}>
                      {title.primaryTitle}
                    </h3>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      ({title.startYear}) <span className="capitalize ml-1">{title.titleType}</span>
                    </p>
                    {title.characters && parseCharactersSimple(title.characters) && (
                       <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 italic">
                         as {parseCharactersSimple(title.characters)}
                       </p>
                    )}
                  </RouterLink>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelebDetailPage;