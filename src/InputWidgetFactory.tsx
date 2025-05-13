import React from 'react';
import { Column } from './types';
import DropdownWidget from './DropdownWidget';

// WIP: This is a factory for creating input widgets based on the current 
// filter state (column or operator or value) and (if we are in the value 
// state), the column type

// Interface for widget props that all widgets will receive
export interface InputWidgetProps {
  currentInput: string;
  onSelect: (value: string) => void;
  onInputChange?: (value: string) => void;
  selectedIndex?: number; // only used for dropdowns
  onHoverChange?: (index: number) => void; // only used for dropdowns
}

// Props for the InputWidgetFactory component
interface InputWidgetFactoryProps extends InputWidgetProps {
  column?: Column;
  filterState: 'column' | 'operator' | 'value';
  operators: { id: string; label: string }[];
  columns: Column[];
  showSuggestions: boolean;
  suggestions: any[];
}

const InputWidgetFactory: React.FC<InputWidgetFactoryProps> = ({
  column,
  filterState,
  operators,
  columns,
  showSuggestions,
  suggestions,
  currentInput,
  onSelect,
  onInputChange,
  selectedIndex = 0,
  onHoverChange = () => {},
}) => {
  // If we're not supposed to show suggestions, don't render anything
  if (!showSuggestions) {
    return null;
  }

  // When selecting columns or operators, always use the standard dropdown
  if (filterState === 'column' || filterState === 'operator') {
    return (
      <DropdownWidget
        options={suggestions}
        selectedIndex={selectedIndex}
        onSelect={(selected) => onSelect(selected.label)}
        onHoverChange={onHoverChange}
      />
    );
  }

  // When we're selecting a value, use the appropriate widget based on column data type
  if (filterState === 'value' && column) {
    switch (column.type) {
      case 'picklist':
        return (
          <DropdownWidget
            options={column.picklistOptions || []}
            currentInput={currentInput}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            onHoverChange={onHoverChange}
          />
        );
      case 'boolean':
        // For boolean, we could create a simple dropdown with true/false options
        return (
          <DropdownWidget
            options={[{ id: 'true', label: 'true' }, { id: 'false', label: 'false' }]}
            selectedIndex={selectedIndex}
            onSelect={(selected) => onSelect(selected.label)}
            onHoverChange={onHoverChange}
          />
        );
      // case 'date':
      // return <SuggestionDateTime/>
      // note that "SuggestionInputFactory" isn't a good name, because for a DateTime, we aren't 'suggesting'
      // anything, we are just showing a widget to enter a value.
      default:
        // For text and other types, don't show a widget when entering a value
        // User will just type the value directly
        return null;
    }
  }

  return null;
};

export default InputWidgetFactory;