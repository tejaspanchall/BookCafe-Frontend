'use client';
import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex list-none">
        <li className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <button
            className="px-3 py-2 border rounded-l transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)'
            }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-button-hover)', e.currentTarget.style.color = 'var(--color-bg-primary)')}
            onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)', e.currentTarget.style.color = 'var(--color-text-primary)')}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        
        {pages.map(page => (
          <li key={page}>
            <button
              className="px-3 py-2 border transition duration-300"
              style={{ 
                backgroundColor: currentPage === page ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: currentPage === page ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
                fontWeight: currentPage === page ? 'bold' : 'normal'
              }}
              onMouseOver={(e) => currentPage !== page && (e.currentTarget.style.backgroundColor = 'var(--color-button-hover)', e.currentTarget.style.color = 'var(--color-bg-primary)')}
              onMouseOut={(e) => currentPage !== page && (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)', e.currentTarget.style.color = 'var(--color-text-primary)')}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li className={`${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <button
            className="px-3 py-2 border rounded-r transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)'
            }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-button-hover)', e.currentTarget.style.color = 'var(--color-bg-primary)')}
            onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)', e.currentTarget.style.color = 'var(--color-text-primary)')}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}