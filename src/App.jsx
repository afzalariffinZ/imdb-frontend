import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar'; // Adjust the path as necessary
import HeroSection from './components/HeroSection';
import PopularSection from './components/PopularSection';
import YourBackgroundGif from './assets/index_background.gif'; // Import your GIF

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const popularItems = [
    { id: 1, title: "Movie Placeholder 1", type: "movie", imageUrl: null },
    { id: 2, title: "Series Placeholder", type: "tv", imageUrl: null /* "/path/to/your/series-poster.jpg" */ },
    { id: 3, title: "Person Placeholder", type: "person", imageUrl: null /* "/path/to/your/person-poster.jpg" */ },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background GIF Placeholder */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Replace with your actual GIF */}
        <img src={YourBackgroundGif} alt="Background" className="w-full h-full object-cover opacity-10 dark:opacity-5" />
        <div className="w-full h-full bg-black flex items-center justify-center">
           <p className="text-theme-medium-gray text-xl opacity-20">Background GIF Area</p>
        </div>
      </div>
      
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow relative z-0"> {/* z-0 so navbar (z-50) is above */}
        <HeroSection />
        <PopularSection items={popularItems} />
      </main>

      <footer className="py-6 text-center text-sm themed-text-secondary relative z-0">
        © {new Date().getFullYear()} IMDb2. A fictional site.
        <div className="mt-1">
          <a href="#" className="hover:text-theme-yellow mx-2">About</a> |
          <a href="#" className="hover:text-theme-yellow mx-2">Contact</a> |
          <a href="#" className="hover:text-theme-yellow mx-2">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;