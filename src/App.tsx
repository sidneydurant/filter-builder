import React from 'react';
import FilterBuilder from './FilterBuilder'
import { Column, Operator, FilterPill as FilterPillType } from './types';

function App() {

  // This parent component is responsible for fetching columns, operators, 
  // and initial (previously saved) filters from the server.
  const columns: Column[] = [
    { id: "name", label: "Name", type: "string", defaultOperatorId: "contains" },
    { id: "company", label: "Company", type: "string", defaultOperatorId: "equals" },
    { id: "city", label: "City", type: "string", defaultOperatorId: "contains" },
    { id: "state", label: "State", type: "picklist", defaultOperatorId: "equals", picklistOptions: [{id: "CA", label: "CA"}, {id: "NV", label: "NV"}, {id: "OR", label: "OR"}] },
    { id: "info", label: "Info", type: "string", defaultOperatorId: "contains" },
    { id: "age", label: "Age", type: "number", defaultOperatorId: "equals" },
    { id: "is_active", label: "Is Active", type: "boolean", defaultOperatorId: "equals" },
  ];

  // TODO: need a map from data types to possible operators.

  const operators: Operator[] = [
    { id: "equals", label: "Equals", aliases: ["=", "==", "equals", "===", "is"] },
    { id: "not_equals", label: "Not Equals", aliases: ["!=", "!==", "not equals", "not equal", "is not"] },
    { id: "contains", label: "Contains", aliases: ["contains", "includes"] },
    { id: "does_not_contain", label: "Does Not Contain", aliases: ["does not include", "doesnt include", "does not contain", "doesnt contain"] }
  ];

  const initialFilters: FilterPillType[] = [
    {
      type: 'filter',
      value: 'Company Equals Streak',
      components: {
        column: 'Company',
        operator: 'Equals',
        value: 'Streak'
      }
    }
  ];

  // Parent component is responsible for using/applying the created filters
  const handleApplyFilters = (filters: FilterPillType[]) => {
    console.log("Filter:", filters.map(pill => pill.value).join(' AND '));
  };

  return (
    <>
      <h2 className="m-4 text-xl font-bold">Filter Builder</h2>
        <div className="max-w-2xl">
          <FilterBuilder columns={columns} operators={operators} onSubmit={handleApplyFilters} initialFilters={initialFilters} />
        </div>
    </>
  )
}

export default App
