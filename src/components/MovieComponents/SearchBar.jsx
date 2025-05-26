// src/components/SearchBar.jsx
import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialTerm = '' }) => {
  const [term, setTerm] = useState(initialTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
      <div className="flex items-center themed-bg-card border-2 border-theme-dark-gray dark:border-theme-medium-gray focus-within:border-theme-yellow rounded-md shadow-md overflow-hidden">
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for movies..."
          className="flex-grow p-3 md:p-4 text-base md:text-lg themed-text placeholder-theme-medium-gray bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="p-3 md:p-4 bg-theme-red text-theme-white hover:bg-red-700 transition-colors focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="sr-only">Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;