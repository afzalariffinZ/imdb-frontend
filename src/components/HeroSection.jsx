import React from 'react';
// OPTION 1: If your logo is in src/assets and you want Vite to process it
import ImdbLargeLogo from '../assets/IMDB_logo.png'; // <-- REPLACE with your actual logo file name

const HeroSection = () => {
  return (
    <section className="py-20 md:py-24 text-center relative">
      <div className="container mx-auto px-6">
        {/* IMDb Logo Image */}
        <div className="mb-6 md:mb-8 flex justify-center">
          {/* 
            OPTION 1: Using an imported image (recommended if in src/assets)
            Replace 'ImdbLargeLogo' with your imported variable name.
            Replace 'alt' text as appropriate.
          */}
          <img 
            src={ImdbLargeLogo} 
            alt="IMDb Logo" 
            className="h-20 md:h-28 w-auto" // Adjust height/width as needed
          />

          {/* 
            OPTION 2: If your logo is in the 'public' folder (e.g., public/imdb-hero-logo.png)
            It will be served from the root of your site.
            Uncomment this and comment out Option 1 if you use this method.
          */}
          
          {/* 
            OPTION 3: Placeholder if you don't have the image yet but want the space
            Remove this if you use Option 1 or 2.
          */}
          {/* <div className="bg-theme-yellow inline-block px-8 py-3 shadow-lg">
            <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-wider">
              IMDb
            </h1>
          </div> */}
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold themed-text leading-tight mb-4">
          Welcome to <span className="text-theme-yellow">IMDb2</span>
        </h2>
        <p className="mt-3 max-w-md mx-auto text-lg sm:text-xl themed-text-secondary md:mt-5 md:max-w-2xl mb-8 md:mb-12">
          Explore the world of cinema and television. Discover, rate, and discuss.
        </p>

        {/* Search Bar */}
        <form className="max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center themed-bg-card border-2 border-theme-dark-gray dark:border-theme-medium-gray focus-within:border-theme-yellow rounded-md shadow-md overflow-hidden">
            <input
              type="search"
              name="search"
              id="search"
              className="flex-grow p-3 md:p-4 text-base md:text-lg themed-text placeholder-theme-medium-gray bg-transparent focus:outline-none"
              placeholder="Search for Films, Series, People..."
            />
            <button
              type="submit"
              className="p-3 md:p-4 bg-theme-red text-theme-white hover:bg-red-700 transition-colors focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only md:inline ml-2">Search</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;