import React from 'react';
import { FilterPill as FilterPillType } from './types';

interface FilterPillProps {
  pill: FilterPillType;
}

// TODO: add support for partial pills and integrate into here

const FilterPill: React.FC<FilterPillProps> = ({ pill }) => {
  return (
    <div className="px-2 py-1 rounded-md bg-red-700 text-white font-medium text-sm">
      {pill.column} {pill.operator} {pill.value}
    </div>
  );
};

export default FilterPill;