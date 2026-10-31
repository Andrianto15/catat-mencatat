'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { filterWorkshopSuggestions } from '@/lib/motor/actions';

interface WorkshopAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  workshops: string[];
  placeholder?: string;
  initialOpen?: boolean;
}

export function WorkshopAutocomplete({
  id,
  value,
  onChange,
  workshops,
  placeholder = 'Bengkel Resmi / Ahass',
  initialOpen = false,
}: WorkshopAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const filteredOptions = filterWorkshopSuggestions(workshops, value);
  const trimmedValue = value.trim();
  const isExactMatch = workshops.some(
    (w) => w.toLowerCase() === trimmedValue.toLowerCase()
  );
  const showAddNew = trimmedValue.length > 0 && !isExactMatch;

  const totalItemsCount = filteredOptions.length + (showAddNew ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedName: string) => {
    onChange(selectedName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItemsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItemsCount) % totalItemsCount);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < totalItemsCount) {
        e.preventDefault();
        if (highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (showAddNew) {
          handleSelect(trimmedValue);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          placeholder={placeholder}
          className="form-input"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '0.625rem 2.25rem 0.625rem 0.625rem',
            minHeight: '44px',
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Buka pilihan bengkel"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: 'absolute',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
          }}
        >
          <ChevronDown
            size={18}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: '220px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.15))',
            margin: 0,
            padding: '0.25rem 0',
            listStyle: 'none',
          }}
        >
          {filteredOptions.map((opt, index) => {
            const isHighlighted = highlightedIndex === index;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-main)',
                  backgroundColor: isHighlighted
                    ? 'var(--bg-card-hover, rgba(0,0,0,0.05))'
                    : 'transparent',
                  cursor: 'pointer',
                  fontWeight: value === opt ? 600 : 400,
                }}
              >
                {opt}
              </li>
            );
          })}

          {showAddNew && (
            <li
              role="option"
              aria-selected={highlightedIndex === filteredOptions.length}
              onClick={() => handleSelect(trimmedValue)}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              style={{
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
                backgroundColor:
                  highlightedIndex === filteredOptions.length
                    ? 'var(--bg-card-hover, rgba(0,0,0,0.05))'
                    : 'transparent',
                borderTop: filteredOptions.length > 0 ? '1px solid var(--border-card)' : 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <Plus size={16} />
              <span>
                Tambah &quot;{trimmedValue}&quot;
              </span>
            </li>
          )}

          {filteredOptions.length === 0 && !showAddNew && (
            <li
              style={{
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
            >
              Belum ada riwayat bengkel
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

