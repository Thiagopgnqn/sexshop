import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ initialQuery = '', onSearch }) => {
  const [query, setQuery] = useState(initialQuery);
  const onSearchRef = useRef(onSearch);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearchRef.current(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    onSearchRef.current('');
  };

  return (
    <search className="relative w-full block">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
        <FiSearch className="h-4 w-4" />
      </div>
      <input
        type="search"
        aria-label="Buscar productos en el catálogo"
        className="block w-full pl-10 pr-8 py-2.5 rounded-md border border-brand-border/30 bg-surface text-content text-xs sm:text-sm placeholder:text-content-muted focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve transition-smooth"
        placeholder="Buscar por nombre, código o descripción..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-content-muted hover:text-content transition-colors"
          title="Limpiar búsqueda"
          aria-label="Limpiar búsqueda"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      )}
    </search>
  );
};

export default SearchBar;
