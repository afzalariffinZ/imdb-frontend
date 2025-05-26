// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import ImdbLogo from '../assets/IMDB_logo.png'; // Your logo path
// For React Router or Next.js, you'd import Link here
import { Link } from 'react-router-dom';

// Hamburger Icon SVG
const HamburgerIcon = () => (
  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Close Icon SVG
const CloseIcon = () => (
  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Helper function to generate paths
const getPathForItem = (item) => {
  if (item === 'Home') return '/';
  if (item === 'Movies') return '/movies'; // <<< Specific path for Movies
  return `/${item.toLowerCase().replace(/\s+/g, '-')}`; // Generic path for others like TV Series -> /tv-series
};


const NavLink = ({ href, children }) => {
  // If using React Router:
  return (
    <Link
      to={href}
      className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );

  // If using Next.js Link:
  // return (
  //   <Link href={href} legacyBehavior>
  //     <a className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
  //       {children}
  //     </a>
  //   </Link>
  // );
  
  // For simple hrefs (as currently used):
  return (
    <a
      href={href}
      className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </a>
  );
};

const MobileNavLink = ({ href, children, onClick }) => {
  // If using React Router:
  return (
    <Link
      to={href}
      onClick={onClick}
      className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
    >
      {children}
    </Link>
  );


  // For simple hrefs:
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-imdb-gray-light hover:bg-red-700 dark:hover:bg-imdb-gray-dark hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
    >
      {children}
    </a>
  );
};


const Navbar = ({ isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = ['Home', 'Movies', 'TV Series', 'Shorts', 'Celebs'];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <nav className="bg-[#DB0000] dark:bg-[#222222] shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0"> {/* Or Link to="/" */}
              <img className="h-8 w-auto" src={ImdbLogo} alt="IMDb2" />
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item}
                  href={getPathForItem(item)} // Use helper function for path
                >
                  {item}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <label htmlFor="theme-toggle" className="flex items-center cursor-pointer mr-4">
              <div className="relative">
                <input
                  type="checkbox"
                  id="theme-toggle"
                  className="sr-only"
                  checked={!isDarkMode}
                  onChange={toggleTheme}
                />
                <div className="block bg-gray-600 dark:bg-imdb-gray-dark w-10 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  !isDarkMode ? 'transform translate-x-full bg-imdb-yellow' : 'bg-imdb-gray'
                }`}></div>
              </div>
              <div className="ml-3 text-white dark:text-imdb-gray-light text-xs font-medium hidden sm:block">
                {isDarkMode ? 'Dark' : 'Light'}
              </div>
            </label>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-imdb-gray-light hover:text-white hover:bg-red-700 dark:hover:bg-imdb-gray-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-imdb-red dark:bg-imdb-gray-darker"> {/* Added background color here too */}
          {navItems.map((item) => (
            <MobileNavLink
              key={item}
              href={getPathForItem(item)} // Use helper function for path
              onClick={() => setIsMobileMenuOpen(false)} 
            >
              {item}
            </MobileNavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;