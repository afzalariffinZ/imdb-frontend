// src/components/FilterBar.jsx
import React, { useState, useEffect } from 'react';

// A list of common genres. In a real app, this might come from an API.
const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Film Noir", "History",
  "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi",
  "Short", "Sport", "Superhero", "Thriller", "War", "Western"
];

const FilterBar = ({ initialFilters, onApplyFilters }) => {
  const [minRating, setMinRating] = useState(initialFilters.minRating || '');
  const [maxRating, setMaxRating] = useState(initialFilters.maxRating || '');
  const [selectedGenres, setSelectedGenres] = useState(initialFilters.selectedGenres || []);
  const [startYear, setStartYear] = useState(initialFilters.startYear || '');
  const [endYear, setEndYear] = useState(initialFilters.endYear || '');
  const [isAdult, setIsAdult] = useState(initialFilters.isAdult || 'any'); // 'any', 'yes', 'no'

  // Update local state if initialFilters prop changes (e.g., from URL params)
  useEffect(() => {
    setMinRating(initialFilters.minRating || '');
    setMaxRating(initialFilters.maxRating || '');
    setSelectedGenres(initialFilters.selectedGenres || []);
    setStartYear(initialFilters.startYear || '');
    setEndYear(initialFilters.endYear || '');
    setIsAdult(initialFilters.isAdult || 'any');
  }, [initialFilters]);


  const handleGenreChange = (genre) => {
    setSelectedGenres(prevGenres =>
      prevGenres.includes(genre)
        ? prevGenres.filter(g => g !== genre)
        : [...prevGenres, genre]
    );
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
    });
  };

  const handleResetFilters = () => {
    setMinRating('');
    setMaxRating('');
    setSelectedGenres([]);
    setStartYear('');
    setEndYear('');
    setIsAdult('any');
    onApplyFilters({}); // Apply empty filters to reset
  };


  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow">
      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">Filters</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Rating Range */}
        <div>
          <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Rating</label>
          <div className="flex items-center space-x-2">
            <input
              type="number" step="0.1" min="0" max="10"
              placeholder="Min"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
            />
            <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
            <input
              type="number" step="0.1" min="0" max="10"
              placeholder="Max"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
            />
          </div>
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Year</label>
          <div className="flex items-center space-x-2">
            <input
              type="number" min="1800" max={new Date().getFullYear() + 5}
              placeholder="From"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
            />
            <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
            <input
              type="number" min="1800" max={new Date().getFullYear() + 5}
              placeholder="To"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
            />
          </div>
        </div>
        
        {/* Is Adult */}
        <div>
          <label htmlFor="isAdult" className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Adult Content</label>
          <select
            id="isAdult" value={isAdult} onChange={(e) => setIsAdult(e.target.value)}
            className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
          >
            <option value="any">Any</option>
            <option value="no">No (Not Adult)</option>
            <option value="yes">Yes (Adult)</option>
          </select>
        </div>

        {/* Genre - Multiple Select (using checkboxes or a multi-select component) */}
        {/* For simplicity, using checkboxes here. A dedicated multi-select dropdown would be better for many genres. */}
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
          <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Genres</label>
          <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 nice-scrollbar-y">
            {GENRE_OPTIONS.map(genre => (
              <label key={genre} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-background-light dark:hover:bg-background-dark p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="form-checkbox h-4 w-4 text-primary-yellow bg-surface-dark border-border-dark focus:ring-primary-yellow rounded"
                />
                <span className="text-text-primary-light dark:text-text-primary-dark">{genre}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm rounded-md border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark"
        >
            Reset
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-md bg-primary-red text-white hover:opacity-90"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};

export default FilterBar;