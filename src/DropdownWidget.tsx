import React from 'react';
import { Column, Operator, Value } from './types';

interface DropdownWidgetProps {
  options: (Column | Operator | Value)[];
  selectedIndex: number;
  onSelect: (option: Column | Operator | Value) => void;
  onHoverChange: (index: number) => void;
}

const DropdownWidget: React.FC<DropdownWidgetProps> = ({
  options,
  selectedIndex,
  onSelect,
  onHoverChange
}) => {
  return (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
      {options.map((option, index) => (
        <div
          key={`option-${index}`}
          className={`px-3 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelect(option)}
          onMouseEnter={() => onHoverChange(index)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default DropdownWidget;