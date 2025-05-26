import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CelebsPage from './components/CelebComponents/CelebsPage';
// import PopularSection from './components/PopularSection'; // PopularSection might be part of HeroSection or its own route
import MoviesPage from './components/MovieComponents/MoviePage'; // Import the new MoviesPage
import YourBackgroundGif from './assets/index_background.gif';
import MovieDetailPage from './components/MovieComponents/MovieDetailPage'; // Import MovieDetailPage
import CelebDetailPage from './components/CelebComponents/CelebDetailPage';
import SeriesPage from './Pages/SeriesPage';
import ShortsPage from './Pages/ShortsPage';
import AllPage from './Pages/AllPage';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
      document.body.className = 'bg-theme-bg-dark text-theme-light-gray'; // Apply base theme to body
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
      document.body.className = 'bg-theme-bg-light text-theme-bg-dark'; // Apply base theme to body
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // popularItems might be fetched within PopularSection or passed differently if PopularSection is part of HeroSection now
  // const popularItems = [
  //   { id: 1, title: "Movie Placeholder 1", type: "movie", imageUrl: null },
  //   { id: 2, title: "Series Placeholder", type: "tv", imageUrl: null },
  //   { id: 3, title: "Person Placeholder", type: "person", imageUrl: null },
  // ];

  return (
    <Router> {/* Wrap everything in Router */}
      <div className="flex flex-col min-h-screen">
        {/* Background GIF */}
        <div className="fixed inset-0 z-[-10] overflow-hidden"> {/* Ensure it's behind everything */}
          <img 
            src={YourBackgroundGif} 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 dark:opacity-10" // Adjusted opacity
          />
        </div>
        
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <main className="flex-grow relative z-10 pt-16"> {/* Add pt-16 if navbar is sticky and fixed height (h-16) */}
          <Routes> {/* Define your routes */}
            <Route path="/" element={
              <>
                <HeroSection />
                {/* <PopularSection items={popularItems} /> You might include PopularSection here or make it part of HeroSection */}
              </>
            } />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/celebs" element={<CelebsPage />} /> {/* << ADD CELEBS ROUTE */}
            <Route path="/:type/:movieId" element={<MovieDetailPage />}></Route>
            <Route path="/celebs/:nconst" element={<CelebDetailPage />} /> 
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/all" element={<AllPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <footer className="py-6 text-center text-sm themed-text-secondary relative z-10">
          © {new Date().getFullYear()} IMDb2. A fictional site.
          <div className="mt-1">
            <a href="#" className="hover:text-theme-yellow mx-2">About</a> |
            <a href="#" className="hover:text-theme-yellow mx-2">Contact</a> |
            <a href="#" className="hover:text-theme-yellow mx-2">Privacy</a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;