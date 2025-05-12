import React from 'react';
import { Column, Operator } from './types';

// TODO: modularize this so that we have a WidgetFactory. then DropdownWidget is used for the column and operators
// then, for the value, we use DropdownWidget for picklist, and then in the future can build DatePickerWidget etc

interface DropdownWidgetProps {
  suggestions: (Column | Operator)[];
  selectedIndex: number;
  onSelect: (suggestion: Column | Operator) => void;
  onHoverChange: (index: number) => void;
}

const DropdownWidget: React.FC<DropdownWidgetProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  onHoverChange
}) => {
  return (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <div
          key={`suggestion-${index}`}
          className={`px-3 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={() => onHoverChange(index)}
        >
          {suggestion.label}
        </div>
      ))}
    </div>
  );
};

export default DropdownWidget;