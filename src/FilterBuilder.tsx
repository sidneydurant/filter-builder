import React, { useState, useRef, useEffect } from 'react';
import DropdownWidget from './DropdownWidget.tsx';
import FilterPill from './FilterPill';
import { Column, Operator, FilterPill as FilterPillType } from './types';

interface FilterBuilderProps {
  columns: Column[];
  operators: Operator[];
  onSubmit: (filters: FilterPillType[]) => void;
  initialFilters?: FilterPillType[];
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({ columns, operators, onSubmit, initialFilters = [] }) => {
  // State for the completed filter pills
  const [filterPills, setFilterPills] = useState<FilterPillType[]>(initialFilters);
  
  // The current filter being built
  const [currentFilterParts, setCurrentFilterParts] = useState<{
    column?: string;
    operator?: string;
    value?: string;
  }>({});

  // Tracks where in the filter building process we are
  const [currentFilterState, setCurrentFilterState] = useState<'column' | 'operator' | 'value'>('column');
  
  // Tracks the current input and suggestions
  const [currentInput, setCurrentInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<(Column | Operator)[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const editableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLSpanElement>(null);

  // Update suggestions based on current input and filter state
  useEffect(() => {
    if (currentInput.trim() === '') {
      // Don't show any suggestions when input is empty
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Prepare suggestions based on current input
    let newSuggestions: (Column | Operator)[] = [];
    
    if (currentFilterState === 'column') {
      newSuggestions = columns.filter(col => 
        col.label.toLowerCase().includes(currentInput.toLowerCase())
      );
    } else if (currentFilterState === 'operator') {
      newSuggestions = operators.filter(op => 
        op.label.toLowerCase().includes(currentInput.toLowerCase()) || op.aliases?.includes(currentInput.toLowerCase())
      );
    } /* TODO:
    else if (currentFilterState === 'value') {
      newSuggestions = values.filter(val => 
        val.toLowerCase().includes(currentInput.toLowerCase())
      );
    }
    */
    
    // Update suggestions state
    setSuggestions(newSuggestions);
    
    // Show suggestions if we're not in value state and there are matches
    setShowSuggestions(
      currentFilterState !== 'value' && newSuggestions.length > 0
    );
    
    // Reset selection index when suggestions change
    setSelectedSuggestionIndex(0);
  }, [currentInput, currentFilterState]);

  // Watch for changes to currentFilterParts and create a pill when all parts are present
  useEffect(() => {
    // Check if we have all the parts needed to create a pill
    if (currentFilterParts.column && currentFilterParts.operator && currentFilterParts.value) {
      // Create new filter pill
      const newFilterPill: FilterPillType = {
        type: 'filter',
        value: `${currentFilterParts.column} ${currentFilterParts.operator} ${currentFilterParts.value}`,
        components: {
          column: currentFilterParts.column,
          operator: currentFilterParts.operator,
          value: currentFilterParts.value
        }
      };
      
      // Add the new filter pill
      setFilterPills(prevPills => [...prevPills, newFilterPill]);
      
      // Reset current filter parts
      setCurrentFilterParts({});
      setCurrentFilterState('column');
      
      // Clear the input
      if (inputRef.current) {
        inputRef.current.textContent = '';
      }
      setCurrentInput('');
    }
  }, [currentFilterParts]);

  // Handle selection from dropdown
  const handleSelectSuggestion = (suggestion: Column | Operator) => {
    // Update the current filter parts based on the current state
    if (currentFilterState === 'column') {
      const column = suggestion as Column;
      const defaultOperator = operators.find(op => op.id === column.defaultOperatorId);
      setCurrentFilterParts({
        ...currentFilterParts,
        column: column.label,
        operator: defaultOperator?.label
      });
      setCurrentFilterState(defaultOperator ?'value' : 'operator');
    } else if (currentFilterState === 'operator') {
      const operator = suggestion as Operator;
      setCurrentFilterParts({
        ...currentFilterParts,
        operator: operator.label
      });
      setCurrentFilterState('value');
    }
    
    // Clear the input content and focus back on it
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }
    setCurrentInput('');
    
  };

  // Focus management
  useEffect(() => {
    // Focus the input whenever filterState changes or a pill is created
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentFilterState, filterPills.length]);

  // Handle value entry completion
  const handleValueComplete = () => {
    if (currentInput.trim() !== '') {
      setCurrentFilterParts({
        ...currentFilterParts,
        value: currentInput.trim()
      });
      
      // The useEffect hook will handle pill creation when state updates
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (showSuggestions && suggestions.length > 0) {
      // Arrow down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
      // Arrow up
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
      }
      // Enter or Tab to select
      else if ((e.key === 'Enter' || e.key === 'Tab') && currentFilterState !== 'value') {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      }
      // Space to select if showing suggestions
      else if (e.key === ' ' && showSuggestions && currentFilterState !== 'value') {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (currentFilterState === 'value' && (e.key === 'Enter' || e.key === 'Tab') && currentInput.trim() !== '') {
      e.preventDefault();
      handleValueComplete();
    }

    // Handle backspace to reset or remove the last part
    if (e.key === 'Backspace' && currentInput === '') {
      e.preventDefault();
      
      // If we're building a filter, go back one step
      if (currentFilterState === 'operator' && currentFilterParts.column) {
        setCurrentFilterState('column');
        setCurrentFilterParts({});
      } 
      else if (currentFilterState === 'value' && currentFilterParts.operator) {
        setCurrentFilterState('operator');
        setCurrentFilterParts({
          column: currentFilterParts.column
        });
      }
      // Otherwise remove the last complete filter pill
      else if (filterPills.length > 0 && currentFilterState === 'column') {
        const newPills = [...filterPills];
        newPills.pop(); // Remove the last filter
        setFilterPills(newPills);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.FormEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.textContent || '';
    setCurrentInput(text);
  };

  // Handle submit button click
  const handleSubmit = () => {
    onSubmit(filterPills);
  };

  return (
    <div className="flex items-center justify-left w-full mx-auto pl-4">
      <div className="flex-grow">
        {/* Editable filter area */}
        <div 
          ref={editableRef}
          className="min-h-12 p-3 border border-gray-300 rounded bg-white flex flex-wrap items-center gap-1"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          {/* Render completed filter pills */}
          {filterPills.map((pill, index) => (
            <FilterPill key={`pill-${index}`} pill={pill} />
            /* <span>AND</span> TODO: I think I prefer not having this, but revisit later */
          ))}
          
          {/* TODO: create a FilterPart component, or make FilterPill able to handle both */}
          {/* Render the building filter parts */}
          {currentFilterParts.column && (
            <div className="px-2 py-1 rounded-l-md bg-blue-500 text-white font-medium text-sm">
              {currentFilterParts.column}
            </div>
          )}
          {currentFilterParts.operator && (
            <div className="px-2 py-1 bg-purple-500 text-white font-medium text-sm">
              {currentFilterParts.operator}
            </div>
          )}
          
          <span
            ref={inputRef}
            className="outline-none min-w-1 inline-block"
            contentEditable
            onInput={handleInputChange}
            onKeyDown={handleKeyDown}
          ></span>

          {/* Render the placeholder*/}
          {!currentInput && (
            <div className="text-sm text-gray-500">
            {currentFilterState === 'column' && 'Enter a column name...'}
            {currentFilterState === 'operator' && 'Enter an operator...'}
            {currentFilterState === 'value' && 'Enter a value...'}
          </div>
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && (
          <DropdownWidget 
            suggestions={suggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSelectSuggestion}
            onHoverChange={setSelectedSuggestionIndex}
          />
        )}
      </div>
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="m-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-start"
      >
        Apply Filter
      </button>
    </div>
  );
};

export default FilterBuilder;