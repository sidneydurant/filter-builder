import React, { useEffect, useState } from 'react';
import FilterBuilder from './FilterBuilder'
import { Column, Operator, FilterPill as FilterPillType } from './types';
import { fetchOperators, fetchColumns, fetchInitialFilters } from "./api";

function App() {

  const [operators, setOperators] = useState<Operator[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [initialFilters, setInitialFilters] = useState<FilterPillType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchOperators(), fetchColumns(), fetchInitialFilters()])
      .then(([ops, cols, initialFilters]) => {
        setOperators(ops);
        setColumns(cols);
        setInitialFilters(initialFilters);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Use the created filters
  const handleApplyFilters = (filters: FilterPillType[]) => {
    alert(`Filter: ${filters.map(pill => pill.column + ' ' + pill.operator + ' ' + pill.value).join(' AND ')}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
