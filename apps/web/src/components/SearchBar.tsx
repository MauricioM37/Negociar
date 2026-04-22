import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { searchSuggestions } from '../constants/catalog';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export const SearchBar = ({ 
  onSearch, 
  placeholder = "Buscar productos, marcas y más...", 
  initialValue = '',
  autoFocus = false 
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchSuggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [query]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const searchTerm = query.trim() || inputRef.current?.value.trim();
    if (searchTerm) {
      setShowSuggestions(false);
      onSearch(searchTerm);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        handleSuggestionClick(filteredSuggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full px-4 py-3 pr-24 border-2 border-gray-300 rounded-lg 
                       transition-all duration-200 text-base
                       focus:outline-none focus:border-ml-blue focus:shadow-md
                       placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setQuery('')}
            className={`absolute right-14 text-gray-400 hover:text-gray-600 transition-colors
                       ${query.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="submit"
            className="absolute right-2 p-1.5 bg-ml-blue rounded-md text-white
                       hover:bg-primary-700 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-ml-blue focus:ring-offset-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <div 
        className={`absolute z-50 w-full mt-1 bg-white rounded-lg shadow-dropdown 
                    overflow-hidden transition-all duration-200
                    ${showSuggestions && filteredSuggestions.length > 0 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        {filteredSuggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                       ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-700">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
