import React from 'react';
import ImdbLogo from '../assets/IMDB_logo.png'; // Your logo path

const Navbar = ({ isDarkMode, toggleTheme }) => {
  return (
    <nav className="bg-imdb-red dark:bg-imdb-gray-darker shadow-lg sticky top-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src={ImdbLogo} alt="IMDb2" />
              
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {['Home', 'Movies', 'TV Series', 'Shorts', 'Celebs'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="theme-toggle" 
                  className="sr-only" 
                  checked={!isDarkMode} // Checked if light mode
                  onChange={toggleTheme} 
                />
                <div className="block bg-gray-600 dark:bg-imdb-gray-dark w-10 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  !isDarkMode ? 'transform translate-x-full bg-imdb-yellow' : 'bg-imdb-gray'
                }`}></div>
              </div>
              <div className="ml-3 text-white dark:text-imdb-gray-light text-xs font-medium">
                {isDarkMode ? 'Dark' : 'Light'}
              </div>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;