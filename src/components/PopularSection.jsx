import React from 'react';

const PopularSection = ({ items }) => {
  return (
    <section className="py-12 md:py-16 bg-imdb-gray-darker dark:bg-imdb-black"> {/* Different dark bg for contrast */}
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-imdb-yellow dark:text-imdb-yellow">
          What's Popular
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-imdb-gray-dark dark:bg-imdb-gray-darker rounded-lg shadow-xl overflow-hidden group transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative pb-[150%] bg-imdb-black group-hover:opacity-80 transition-opacity"> {/* Aspect ratio for posters (2:3) */}
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} // You will provide this image path or fetch it
                    alt={item.title} 
                    className="absolute inset-0 w-full h-full object-cover " 
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-orange-600 dark:bg-orange-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-20 h-20 md:w-24 md:h-24 opacity-60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                      <path strokeLinecap="round" d="M12 3.75v16.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 17.25h16.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white dark:text-imdb-gray-light truncate group-hover:text-imdb-yellow transition-colors">{item.title}</h3>
                <p className="text-sm text-imdb-gray dark:text-gray-500 capitalize">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSection;