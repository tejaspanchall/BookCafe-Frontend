'use client';

import { useState } from 'react';

const PREDEFINED_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Fantasy',
  'Biography',
  'History',
  'Science',
  'Technology',
  'Business',
  'Self-Help',
  'Children\'s Books',
  'Educational',
  'Other'
];

const CategorySelect = ({ value, onChange, className, style }) => {
  const [isOther, setIsOther] = useState(
    value && !PREDEFINED_CATEGORIES.includes(value)
  );
  const [customCategory, setCustomCategory] = useState(
    isOther ? value : ''
  );

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Other') {
      setIsOther(true);
      onChange(customCategory || '');
    } else {
      setIsOther(false);
      onChange(selectedValue);
    }
  };

  const handleCustomCategoryChange = (e) => {
    const newValue = e.target.value;
    setCustomCategory(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <select
        value={isOther ? 'Other' : value}
        onChange={handleSelectChange}
        className={`w-full p-2 rounded border focus:outline-none ${className}`}
        style={style}
      >
        <option value="">Select Category</option>
        {PREDEFINED_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      
      {isOther && (
        <input
          type="text"
          value={customCategory}
          onChange={handleCustomCategoryChange}
          placeholder="Enter custom category"
          className={`w-full p-2 rounded border focus:outline-none ${className}`}
          style={style}
        />
      )}
    </div>
  );
};

export default CategorySelect; 