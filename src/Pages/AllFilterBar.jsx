// src/components/TitleComponents/AllFilterBar.jsx (or a suitable path)
import React, { useState, useEffect } from 'react';

// These could be imported from a shared constants file
const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Film Noir", "History",
  "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi",
  "Short", "Sport", "Superhero", "Thriller", "War", "Western"
].sort();

const TITLE_TYPE_OPTIONS = [
    "movie", "short", "tvSeries"
].sort();


const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

const AllFilterBar = ({ initialFilters, onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Internal state for the filter inputs
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isAdult, setIsAdult] = useState('any'); // 'any', 'yes', 'no'
  const [selectedTitleTypes, setSelectedTitleTypes] = useState([]);

  useEffect(() => {
    setMinRating(initialFilters.minRating || '');
    setMaxRating(initialFilters.maxRating || '');
    setSelectedGenres(initialFilters.selectedGenres || []);
    setStartYear(initialFilters.startYear || '');
    setEndYear(initialFilters.endYear || '');
    setIsAdult(initialFilters.isAdult || 'any');
    setSelectedTitleTypes(initialFilters.selectedTitleTypes || []);

    const hasActiveFilters = Object.values(initialFilters).some(val =>
        val && (Array.isArray(val) ? val.length > 0 : (val !== '' && val !== 'any'))
    );
    if (hasActiveFilters) {
        setIsOpen(true);
    }
  }, [initialFilters]);

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const handleTitleTypeChange = (type) => {
    setSelectedTitleTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
      isAdult: isAdult === 'any' ? undefined : (isAdult === 'yes' ? '1' : '0'),
      titleTypes: selectedTitleTypes.length > 0 ? selectedTitleTypes.join(',') : undefined,
    });
  };

  const handleResetFilters = () => {
    setMinRating('');
    setMaxRating('');
    setSelectedGenres([]);
    setStartYear('');
    setEndYear('');
    setIsAdult('any');
    setSelectedTitleTypes([]);
    onApplyFilters({
        minRating: undefined, maxRating: undefined, genres: undefined,
        startYear: undefined, endYear: undefined, isAdult: undefined, titleTypes: undefined,
    });
  };

  return (
    <div className="mb-6 text-text-primary-light dark:text-text-primary-dark">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-surface-light dark:bg-surface-dark rounded-t-lg shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-yellow"
        aria-expanded={isOpen}
        aria-controls="all-filter-options-content"
      >
        <h3 className="text-md font-semibold">
          Filters
        </h3>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {isOpen && (
        <form
            id="all-filter-options-content"
            onSubmit={handleSubmit}
            className="p-4 bg-surface-light dark:bg-surface-dark rounded-b-lg shadow border-x border-b border-border-light dark:border-border-dark"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 items-end">
            {/* Rating Range */}
            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Rating</label>
              <div className="flex items-center space-x-2">
                <input type="number" step="0.1" min="0" max="10" placeholder="Min (0-10)" value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"/>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
                <input type="number" step="0.1" min="0" max="10" placeholder="Max (0-10)" value={maxRating} onChange={(e) => setMaxRating(e.target.value)} className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"/>
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Year</label>
              <div className="flex items-center space-x-2">
                <input type="number" min="1800" max={new Date().getFullYear() + 5} placeholder="From (YYYY)" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"/>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
                <input type="number" min="1800" max={new Date().getFullYear() + 5} placeholder="To (YYYY)" value={endYear} onChange={(e) => setEndYear(e.target.value)} className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"/>
              </div>
            </div>

            {/* Is Adult */}
            <div>
              <label htmlFor="isAdultAll" className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Adult Content</label>
              <select id="isAdultAll" value={isAdult} onChange={(e) => setIsAdult(e.target.value)} className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow h-[42px]">
                <option value="any">Any</option>
                <option value="no">No (Not Adult)</option>
                <option value="yes">Yes (Adult)</option>
              </select>
            </div>

            {/* Genres - Multiple Select */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Genres</label>
              <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-1 nice-scrollbar-y">
                {GENRE_OPTIONS.map(genre => (
                  <label key={genre} className="flex items-center space-x-1.5 text-sm cursor-pointer hover:bg-background-light dark:hover:bg-background-dark p-1 rounded select-none">
                    <input type="checkbox" checked={selectedGenres.includes(genre)} onChange={() => handleGenreChange(genre)} className="form-checkbox h-3.5 w-3.5 text-primary-yellow bg-transparent border-border-light dark:border-border-dark focus:ring-primary-yellow rounded-sm"/>
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Title Types - Multiple Select */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Title Types</label>
              <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-1 nice-scrollbar-y">
                {TITLE_TYPE_OPTIONS.map(type => (
                  <label key={type} className="flex items-center space-x-1.5 text-sm cursor-pointer hover:bg-background-light dark:hover:bg-background-dark p-1 rounded select-none">
                    <input type="checkbox" checked={selectedTitleTypes.includes(type)} onChange={() => handleTitleTypeChange(type)} className="form-checkbox h-3.5 w-3.5 text-primary-yellow bg-transparent border-border-light dark:border-border-dark focus:ring-primary-yellow rounded-sm"/>
                    <span>{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span> {/* Format for display e.g. tvSeries -> Tv Series */}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={handleResetFilters} className="px-4 py-2 text-sm rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors w-full sm:w-auto">
                Reset All
            </button>
            <button type="submit" className="px-6 py-2 text-sm rounded-md bg-primary-red text-white hover:opacity-90 transition-opacity w-full sm:w-auto">
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AllFilterBar;