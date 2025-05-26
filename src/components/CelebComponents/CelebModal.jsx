// src/components/CelebModal.jsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

const DEFAULT_PERSON_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x600.png?text=No+Image';
const DEFAULT_TITLE_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225.png?text=No+Poster';

const CelebModal = ({ celeb, onClose }) => {
    const modalDialogRef = useRef(null);

    useEffect(() => {
        if (celeb && modalDialogRef.current) {
            modalDialogRef.current.focus();
        }
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [celeb, onClose]);

    if (!celeb) return null;

    const celebImageUrl = celeb.imageUrl || DEFAULT_PERSON_PLACEHOLDER_IMAGE;
    const birthYear = celeb.birthYear || 'N/A';
    const deathYear = celeb.deathYear || (celeb.birthYear ? 'Present' : 'N/A');
    const modalId = `celeb-modal-title-${celeb.nconst}`;

    console.log("CelebModal rendered with celeb:", celeb);

    const formatProfession = (professionSlug) => {
        if (!professionSlug) return '';
        return professionSlug
            .split('_') // Split by underscore
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(' '); // Join words with a space
    };

    const displayProfessions = celeb.professions && celeb.professions.length > 0
        ? celeb.professions.map(formatProfession).join(', ')
        : 'N/A';
    const modalContentJsx = (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out z-50 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalId}
        >
            <div
                ref={modalDialogRef}
                tabIndex={-1}
                className="bg-background-light dark:bg-background-dark rounded-lg shadow-2xl w-full max-w-3xl lg:max-w-4xl max-h-[90vh] sm:max-h-[95vh] flex flex-col overflow-hidden animate-modal-appear outline-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
                    <h2 id={celeb.nconst} className="text-xl sm:text-2xl font-bold text-primary-yellow truncate pr-2">
                        {modalId ? (
                            <Link
                                to={`/celebs/${celeb.nconst}`} // Adjust this path based on your actual movie detail route
                                className="text-primary-yellow hover:underline focus:outline-none focus:ring-1 focus:ring-primary-yellow rounded"
                                onClick={onClose} // Close the current modal when navigating
                            >
                                {celeb.primaryName || "Unknown Celebrity"}
                            </Link>
                        ) : (
                            <span className="text-primary-yellow">{celeb.primaryName || "Unknown Celebrity"}</span> // Fallback if no ID
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-red text-2xl sm:text-3xl p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Body - This main body will scroll if its content (image + details) overflows on small screens */}
                <div className="flex flex-col md:flex-row flex-grow overflow-y-auto md:overflow-hidden nice-scrollbar-y">

                    {/* Celeb Image Section */}
                    <div className="w-full md:w-[240px] lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-black order-1 md:order-none">
                        {/* 
              - On small screens (<md), this div is part of the vertical flex flow.
                The img inside with w-full h-auto will dictate its height.
              - On md+ screens, this div becomes a fixed-width column.
            */}
                        <img
                            src={celebImageUrl}
                            alt={`Photo of ${celeb.primaryName}`}
                            className="w-full h-auto md:h-full object-cover"
                            // <md: w-full h-auto -> image scales with width, height is automatic by aspect ratio.
                            // md+: h-full object-cover -> image covers the height of its fixed-width parent column.
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
                        />
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:flex-1 p-3 sm:p-4 md:p-5 space-y-4 md:space-y-5 order-2 md:order-none md:overflow-y-auto md:nice-scrollbar-y">
                        {/* 
              - On small screens (<md), this div stacks below the image. The parent (.nice-scrollbar-y) handles scrolling.
              - On md+ screens, this div takes remaining width and handles its own vertical scrolling.
            */}
                        <div className="space-y-1">
                            <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                                <span className="font-semibold">Born:</span> {birthYear}
                            </p>
                            {celeb.deathYear && celeb.deathYear !== 'Present' && (
                                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                                    <span className="font-semibold">Died:</span> {celeb.deathYear}
                                </p>
                            )}
                        </div>

                        {celeb.professions && celeb.professions.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-1 text-base sm:text-lg">Professions:</h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {displayProfessions}
                                </p>
                            </div>
                        )}

                        {celeb.titlesAssociated && celeb.titlesAssociated.length > 0 && (
                            <div className="mt-3">
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 text-base sm:text-lg">Known For:</h4>
                                <div className="flex space-x-3 pb-2 overflow-x-auto nice-scrollbar-x">
                                    {celeb.titlesAssociated.map(title => (
                                        <a
                                            key={title.tconst}
                                            href={`/movie/${title.tconst}`}
                                            className="flex-shrink-0 w-32 sm:w-36 bg-surface-light dark:bg-surface-dark p-2 rounded-md shadow hover:shadow-lg transition-shadow"
                                            target="_blank" rel="noopener noreferrer"
                                        >
                                            <p className="text-xs sm:text-sm font-semibold text-primary-yellow truncate" title={title.primaryTitle}>
                                                {title.primaryTitle}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                ({title.startYear}) - <span className="capitalize">{title.titleType}</span>
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Global styles */}
            <style jsx global>{`
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out forwards;
        }
        /* ... other scrollbar styles ... */
        .nice-scrollbar-y::-webkit-scrollbar { width: 7px; }
        .nice-scrollbar-y::-webkit-scrollbar-track { @apply bg-surface-light dark:bg-surface-dark; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb { @apply bg-text-secondary-light dark:text-text-secondary-dark rounded; }
        .nice-scrollbar-y::-webkit-scrollbar-thumb:hover { @apply bg-primary-red; }

        .nice-scrollbar-x::-webkit-scrollbar { height: 5px; }
        .nice-scrollbar-x::-webkit-scrollbar-track { @apply bg-transparent; }
        .nice-scrollbar-x::-webkit-scrollbar-thumb { @apply bg-text-secondary-dark/50 dark:bg-text-secondary-light/40 rounded; }
        .nice-scrollbar-x::-webkit-scrollbar-thumb:hover { @apply bg-primary-red/70; }
      `}</style>
        </div>
    );

    const modalRoot = document.getElementById('modal-root');
    return modalRoot ? ReactDOM.createPortal(modalContentJsx, modalRoot) : modalContentJsx;
};

export default CelebModal;