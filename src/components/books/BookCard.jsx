'use client';
import React from "react";

const BookCard = ({ book, onClick, getImageUrl }) => {
  return (
    <div
      className="h-full border-0 overflow-hidden rounded shadow-md cursor-pointer transition duration-300 hover:shadow-lg"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={getImageUrl(book.image)}
          alt={book.title}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        <div 
          className="absolute top-0 right-0 m-2 px-2 py-1 rounded text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-bg-primary)'
          }}
        >
          {book.author}
        </div>
      </div>
      <div className="p-3">
        <h5 
          className="font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          {book.title}
        </h5>
      </div>
    </div>
  );
};

export default BookCard;