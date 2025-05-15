import React, { useState, useRef, useEffect } from 'react';
import DropdownWidget from './DropdownWidget.tsx';
import FilterPill from './FilterPill';
import { Column, Operator, FilterPill as FilterPillType, Value } from './types';

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
  const [currentFilterParts, setCurrentFilterParts] = useState<FilterPillType>({});

  // Tracks where in the filter building process we are
  // 'invalid' because if value is set we should have added the pill to filterPills - we 
  // should not have a completed pill in 'currentFilterParts"
  const currentFilterState: 'column' | 'operator' | 'value' | 'invalid' = 
    currentFilterParts.value ? 'invalid' : 
    (currentFilterParts.operator ? 'value' : 
    (currentFilterParts.column ? 'operator' : 'column'));
  
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
  }, [currentInput, currentFilterParts]);

  // Watch for changes to currentFilterParts and create a pill when all parts are present
  useEffect(() => {
    // Check if we have all the parts needed to create a pill
    if (currentFilterParts.column && currentFilterParts.operator && currentFilterParts.value) {
      // Create new filter pill
      const newFilterPill: FilterPillType = {
        column: currentFilterParts.column,
        operator: currentFilterParts.operator,
        value: currentFilterParts.value
      };
      
      // Add the new filter pill
      setFilterPills(prevPills => [...prevPills, newFilterPill]);
      
      // Reset current filter parts
      setCurrentFilterParts({});
      
      // Clear the input
      if (inputRef.current) {
        inputRef.current.textContent = '';
      }
      setCurrentInput('');
    }
  }, [currentFilterParts]);

  // Handle selection from dropdown
  const handleSelectOption = (option: Column | Operator | Value) => {
    // Update the current filter parts based on the current state
    if (currentFilterState === 'column') {
      const column = option as Column;
      const defaultOperator = operators.find(op => op.id === column.defaultOperatorId);
      setCurrentFilterParts({
        ...currentFilterParts,
        column: column.label,
        operator: defaultOperator?.label
      });
    } else if (currentFilterState === 'operator') {
      const operator = option as Operator;
      setCurrentFilterParts({
        ...currentFilterParts,
        operator: operator.label
      });
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
      // For contentEditable elements, we need to use the Selection and Range APIs
      const selection = window.getSelection();
      const range = document.createRange();
      
      // Set position to end of content
      range.selectNodeContents(inputRef.current);
      range.collapse(false); // false means collapse to end
      
      // Apply the selection
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [currentFilterParts, filterPills.length]);

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

  // TODO: Way too much business logic. Lots of repeated code. Should be refactored.
  // no matter which approach is taken, click and keyboard events should both use
  // shared logic to update state.
  // 1: Create file with helpers: too verbose. Half the code would be parameters
  // 2: Helper functions: could be added to this component & directly access state
  // 3: [PREFERRED] State machine using reducers: This seems like the best approach,
  //    I won't have the time to implement this

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // TODO: show all suggestions when clicked if no input (refactor logic from handleKeyDown
    // into reusable function/helper/whatever)

    // TODO: add event listener on document to hide suggestions when you click outside of the input
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Show all suggestions when down arrow is pressed with no input
    if (e.key === 'ArrowDown' && currentInput === '' && !showSuggestions) {
      e.preventDefault();
      // Set suggestions based on current filter state
      if (currentFilterState === 'column') {
        setSuggestions(columns);
      } else if (currentFilterState === 'operator') {
        setSuggestions(operators);
      }
      // Show suggestions dropdown
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
      return;
    }

    // Handle shift+tab to go back to previous state
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      
      if (currentFilterState === 'column' && filterPills.length > 0 && currentInput === '') {
        // if we're in column state and there are pills, and no input, go back to editing the last pill
        const newPills = [...filterPills];
        const lastPill = newPills.pop();
        if (lastPill) {
          // Go back to value state
          const {column, operator, value} = lastPill;
          setCurrentFilterParts({column, operator});
          // Restore value as input
          if (inputRef.current) {
            inputRef.current.textContent = value || '';
            setCurrentInput(value || '');
          }
          setFilterPills(newPills);
        }
      } else if(currentFilterState === 'operator' && currentFilterParts.column) {
        // Restore column as input
        if (inputRef.current) {
          inputRef.current.textContent = currentFilterParts.column;
          setCurrentInput(currentFilterParts.column);
        }
        // Clear current filter parts
        setCurrentFilterParts({});
      } 
      else if (currentFilterState === 'value' && currentFilterParts.column) {
        // Restore operator as input
        if (inputRef.current && currentFilterParts.operator) {
          inputRef.current.textContent = currentFilterParts.operator;
          setCurrentInput(currentFilterParts.operator);
        }
        // Modify filter parts to keep only column
        setCurrentFilterParts({
          column: currentFilterParts.column
        });
      }
      return;
    }

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
        handleSelectOption(suggestions[selectedSuggestionIndex]);
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
        setCurrentFilterParts({});
      } 
      else if (currentFilterState === 'value' && currentFilterParts.operator) {
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

    // No matter what, we do not want to create a new line
    if (e.key === 'Enter') {
      e.preventDefault();
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
      <div className="relative flex-grow">
        {/* Editable filter area */}
        <div 
          ref={editableRef}
          className="min-h-12 p-3 border border-gray-300 rounded bg-white flex flex-wrap items-center gap-1"
          onClick={() => {
            handleClick();
          }}
        >
          {/* Render the filter pills*/}
          {[...filterPills, currentFilterParts].map((pill, index) => (
            <FilterPill key={`pill-${index}`} pill={pill} />
          ))}
          
          {/* contenteditable span */}
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
            options={suggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSelectOption}
            onHoverChange={setSelectedSuggestionIndex}
          />
        )}
      </div>
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="m-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 self-start"
      >
        Apply Filter
      </button>
    </div>
  );
};

export default FilterBuilder;