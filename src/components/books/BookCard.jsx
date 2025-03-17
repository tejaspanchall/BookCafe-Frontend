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
              error: e.message
            });
            e.target.src = "https://via.placeholder.com/200x300?text=Book+Cover";
          }}
        />
        <div 
          className="absolute top-0 right-0 m-2 px-2 py-0.5 rounded text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-bg-primary)'
          }}
        >
          {book.author}
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
          className="font-bold text-lg line-clamp-2 mb-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {book.title}
        </h5>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs truncate max-w-[60%]" style={{ color: 'var(--color-text-secondary)' }}>
            {book.category}
          </span>
          <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full" style={{ color: 'var(--color-text-secondary)' }}>
            {book.level}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;