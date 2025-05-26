import { Operator, FilterPill as FilterPillType, Column } from "./types";

const API_BASE_URL = "http://localhost:4000";
const MOCK_LATENCY = 500;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches the list of available operators from the API.
 * Simulates network latency using MOCK_LATENCY.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the result.
 * @throws {Error} If the network response is not OK.
 */
function fetchFromApi<T>(endpoint: string): Promise<T> {
  return wait(MOCK_LATENCY)
    .then(() => fetch(`${API_BASE_URL}/${endpoint}`))
    .then(res => {
      if (!res.ok) throw new Error(`Error fetching ${endpoint}: ${res.statusText}`);
      return res.json();
    })
}

/**
 * Fetches the list of available operators from the API.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the operators.
 * @throws {Error} If the network response is not OK.
 */
export const fetchOperators = () => fetchFromApi<Operator[]>("operators");

/**
 * Fetches the initial filters from the API.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the initial filters.
 * @throws {Error} If the network response is not OK.
 */
export const fetchInitialFilters = () => fetchFromApi<FilterPillType[]>("initialFilters");

/**
 * Fetches the list of available columns from the API.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the columns.
 * @throws {Error} If the network response is not OK.
 */
export const fetchColumns = () => fetchFromApi<Column[]>("columns");