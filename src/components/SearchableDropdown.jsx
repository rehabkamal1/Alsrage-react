import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({ options, placeholder, onSelect, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Sync with external value
    if (value) {
      const selectedOption = options.find(opt => opt.id === parseInt(value));
      if (selectedOption) {
        setSearchTerm(selectedOption.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  useEffect(() => {
    const results = options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(results);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSearchTerm(option.name);
    onSelect(option.id);
    setIsOpen(false);
  };

  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <div className="dropdown-input-wrapper">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="dropdown-results">
          {filteredOptions.map(option => (
            <li key={option.id} onClick={() => handleSelect(option)}>
              <span className="option-name">{option.name}</span>
              {option.phone && <span className="option-phone">{option.phone}</span>}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && filteredOptions.length === 0 && (
        <ul className="dropdown-results">
          <li className="no-results">لا يوجد نتائج مطابقة</li>
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
