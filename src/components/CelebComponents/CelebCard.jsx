// src/components/CelebCard.jsx (or src/CelebComponents/CelebCard.jsx)
import React from 'react';

const DEFAULT_PERSON_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200x300.png?text=No+Image';

const CelebCard = ({ celeb, onCardClick }) => {
  const imageUrl = celeb.imageUrl || DEFAULT_PERSON_PLACEHOLDER_IMAGE;
  const birthYear = celeb.birthYear || 'N/A';
  const deathYear = celeb.deathYear || 'Present';
  const lifeSpan = celeb.birthYear ? `${birthYear} - ${celeb.deathYear ? deathYear : 'Present'}` : 'N/A';

  return (
    <div 
      className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-out"
      onClick={() => onCardClick(celeb)} // Assuming you might want a modal for celebs too
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onCardClick(celeb)}
    >
      <img 
        src={imageUrl} 
        alt={celeb.primaryName} 
        className="w-full h-72 object-cover object-center" // Fixed height for consistency
        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PERSON_PLACEHOLDER_IMAGE; }}
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-primary-yellow mb-1 truncate" title={celeb.primaryName}>
          {celeb.primaryName}
        </h3>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
          {lifeSpan}
        </p>
        {celeb.professions && celeb.professions.length > 0 && (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1 truncate" title={celeb.professions.join(', ')}>
            Prof: {celeb.professions.join(', ').substring(0, 50)}{celeb.professions.join(', ').length > 50 ? '...' : ''}
          </p>
        )}
        {celeb.titlesAssociated && celeb.titlesAssociated.length > 0 && (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-auto pt-1 truncate" title={celeb.titlesAssociated.map(t => t.primaryTitle).join(', ')}>
            Known for: {celeb.titlesAssociated[0].primaryTitle}
            {celeb.titlesAssociated.length > 1 ? `, ...` : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default CelebCard;