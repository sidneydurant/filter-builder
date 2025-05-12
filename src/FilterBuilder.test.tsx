// FilterBuilder.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FilterBuilder from './FilterBuilder';
import '@testing-library/jest-dom';

// Mock the dependencies completely
vi.mock('./DropdownWidget.tsx', () => ({
  default: () => <div data-testid="mocked-dropdown">Mocked Dropdown</div>
}));

vi.mock('./FilterPill', () => ({
  default: ({ pill }) => <div data-testid="mocked-filter-pill">{pill.value}</div>
}));

describe('FilterBuilder Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with expected UI elements', () => {
    render(<FilterBuilder />);
    
    // Check for basic UI elements
    expect(screen.getByText('Apply Filter')).toBeInTheDocument();
    
    // Check for initial placeholder text
    expect(screen.getByText('Enter a column name...')).toBeInTheDocument();
  });

  it('handles submit button click', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<FilterBuilder />);
    
    // Click the Apply Filter button
    const submitButton = screen.getByText('Apply Filter');
    fireEvent.click(submitButton);
    
    // Verify console.log was called with expected empty filter
    expect(consoleSpy).toHaveBeenCalledWith('Filter:', '');
  });
});