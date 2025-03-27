'use client';
import React from "react";

const BookCard = ({ book, onClick, getImageUrl, showRemoveButton, onRemove }) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(book.id);
  };

  const imageUrl = getImageUrl(book.image);
  console.log('BookCard - Book details:', {
    bookId: book.id,
    originalImagePath: book.image,
    constructedImageUrl: imageUrl
  });

  // Define an inline base64 fallback image
  const fallbackImageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

  return (
    <div
      className="h-full border-0 overflow-hidden rounded shadow-md cursor-pointer transition duration-300 hover:shadow-lg relative max-w-[220px] mx-0"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={book.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
          onError={(e) => {
            console.error('BookCard - Image load error:', {
              bookId: book.id,
              imageUrl: imageUrl,
              error: e.message,
              attemptedUrl: e.target.src
            });
            e.target.src = fallbackImageUrl;
          }}
        />
        <div 
          className="absolute top-0 right-0 m-2 px-2 py-0.5 rounded text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-bg-primary)'
          }}
        >
          {book.authors && book.authors.length > 0 
            ? book.authors.map(author => author.name).join(', ')
            : 'Unknown Author'}
        </div>
        {showRemoveButton && (
          <button
            onClick={handleRemove}
            className="absolute top-0 left-0 m-2 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 text-lg font-bold"
            style={{ 
              backgroundColor: '#ff0000',
              color: 'white'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cc0000'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff0000'}
          >
            ×
          </button>
        )}
      </div>
      <div className="p-2">
        <h5 
          className="font-bold text-lg line-clamp-2 mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          {book.title}
        </h5>
        <div className="flex flex-col gap-1">
          <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {book.categories && book.categories.length > 0 
              ? book.categories.map(cat => cat.name).join(', ')
              : 'Uncategorized'
            }
          </div>
          <div className="flex justify-between items-center">
            {book.price !== null && (
              <span 
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-bg-primary)'
                }}
              >
                ₹{parseFloat(book.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;