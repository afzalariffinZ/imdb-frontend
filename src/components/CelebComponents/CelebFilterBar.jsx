// src/CelebComponents/CelebFilterBar.jsx
import React, { useState, useEffect } from 'react';
import { PROFESSION_OPTIONS } from './celebConstants'; // Or import from wherever you define it

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

const CelebFilterBar = ({ initialFilters, onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Internal state for the filter inputs
  const [birthYearStart, setBirthYearStart] = useState('');
  const [birthYearEnd, setBirthYearEnd] = useState('');
  const [selectedProfessions, setSelectedProfessions] = useState([]); // Array of strings

  // Effect to update internal state when initialFilters (from URL/parent) change
  useEffect(() => {
    setBirthYearStart(initialFilters.birthYearStart || '');
    setBirthYearEnd(initialFilters.birthYearEnd || '');
    setSelectedProfessions(initialFilters.selectedProfessions || []);

    // Optionally open the filter bar if any initial filters are actively set
    const hasActiveFilters = Object.values(initialFilters).some(val =>
        val && (Array.isArray(val) ? val.length > 0 : val !== '')
    );
    if (hasActiveFilters) {
        setIsOpen(true);
    }
  }, [initialFilters]);

  const handleProfessionChange = (profession) => {
    setSelectedProfessions(prevProfessions =>
      prevProfessions.includes(profession)
        ? prevProfessions.filter(p => p !== profession)
        : [...prevProfessions, profession]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      birthYearStart: birthYearStart ? parseInt(birthYearStart, 10) : undefined,
      birthYearEnd: birthYearEnd ? parseInt(birthYearEnd, 10) : undefined,
      professions: selectedProfessions.length > 0 ? selectedProfessions.join(',') : undefined,
    });
  };

  const handleResetFilters = () => {
    setBirthYearStart('');
    setBirthYearEnd('');
    setSelectedProfessions([]);
    onApplyFilters({
        birthYearStart: undefined,
        birthYearEnd: undefined,
        professions: undefined,
    });
  };

  return (
    <div className="mb-6 text-text-primary-light dark:text-text-primary-dark">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-surface-light dark:bg-surface-dark rounded-t-lg shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-yellow"
        aria-expanded={isOpen}
        aria-controls="celeb-filter-options-content"
      >
        <h3 className="text-md font-semibold">
          Filters
        </h3>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {isOpen && (
        <form
            id="celeb-filter-options-content"
            onSubmit={handleSubmit}
            className="p-4 bg-surface-light dark:bg-surface-dark rounded-b-lg shadow border-x border-b border-border-light dark:border-border-dark"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 items-end">
            {/* Birth Year Range */}
            <div className="md:col-span-1"> {/* Adjust col-span as needed */}
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Birth Year</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="From (YYYY)"
                  value={birthYearStart}
                  onChange={(e) => setBirthYearStart(e.target.value)}
                  className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
                />
                <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="To (YYYY)"
                  value={birthYearEnd}
                  onChange={(e) => setBirthYearEnd(e.target.value)}
                  className="w-full p-2 text-sm rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>
            </div>

            {/* Professions - Multiple Select (checkboxes) */}
            <div className="sm:col-span-2 md:col-span-2"> {/* Adjust col-span as needed */}
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Professions</label>
              <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-md p-2 grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 nice-scrollbar-y">
                {PROFESSION_OPTIONS.map(profession => (
                  <label key={profession} className="flex items-center space-x-1.5 text-sm cursor-pointer hover:bg-background-light dark:hover:bg-background-dark p-1 rounded select-none">
                    <input
                      type="checkbox"
                      checked={selectedProfessions.includes(profession)}
                      onChange={() => handleProfessionChange(profession)}
                      className="form-checkbox h-3.5 w-3.5 text-primary-yellow bg-transparent border-border-light dark:border-border-dark focus:ring-primary-yellow rounded-sm"
                    />
                    {/* Capitalize first letter for display */}
                    <span>{profession.charAt(0).toUpperCase() + profession.slice(1).replace(/_/g, ' ')}</span>
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

export default CelebFilterBar;