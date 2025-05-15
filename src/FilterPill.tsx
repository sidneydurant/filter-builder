import React from 'react';
import { FilterPill as FilterPillType } from './types';

interface FilterPillProps {
  pill: FilterPillType;
}

// TODO: move wrapper div into here.
const FilterPill: React.FC<FilterPillProps> = ({ pill }) => {
  return (
    <>
      {(pill.column && pill.operator && pill.value) ? (
      <div className="px-2 py-1 rounded-md bg-red-700 text-white font-medium text-sm">
        {pill.column} {pill.operator} {pill.value}
      </div>
      ) : (
        <>
          {pill.column && (
            <div className="px-2 py-1 rounded-l-md bg-red-700 text-white font-medium text-sm">
              {pill.column}
            </div>
          )}
          {pill.operator && (
            <div className="px-2 py-1 bg-purple-700 text-white font-medium text-sm">
              {pill.operator}
            </div>
          )}
          {pill.value && (
            <div className="px-2 py-1 rounded-r-md bg-blue-700 text-white font-medium text-sm">
              {pill.value}
            </div>
          )}
        </>
      )}
    </>
  )
};

export default FilterPill;