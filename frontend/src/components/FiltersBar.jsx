import React from 'react';
import { Filter, AlertTriangle, Plus } from 'lucide-react';

export default function FiltersBar({ filters, setFilters, onCreateClick }) {
  const handlePriorityChange = (e) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value }));
  };

  const toggleBreachedOnly = () => {
    setFilters((prev) => ({ ...prev, breached: !prev.breached }));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 mb-6 rounded-xl border border-stone-200/60 bg-white shadow-2xs">
      {/* Left section: Filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 font-sans text-sm font-medium mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Board:</span>
        </div>

        {/* Priority Filter */}
        <div className="relative shrink-0">
          <select
            value={filters.priority}
            onChange={handlePriorityChange}
            className="appearance-none bg-stone-50 border border-stone-200 text-slate-700 text-sm rounded-lg block w-36 px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans font-medium hover:bg-stone-100/50 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* SLA Breach Check Toggle */}
        <button
          onClick={toggleBreachedOnly}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-medium transition-all cursor-pointer select-none border ${
            filters.breached
              ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-2xs'
              : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100/50'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${filters.breached ? 'text-rose-600' : 'text-slate-400'}`} />
          <span>SLA Breached Only</span>
        </button>
      </div>

      {/* Right section: Action button */}
      <button
        onClick={onCreateClick}
        className="flex items-center justify-center gap-2 bg-slate-900 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-slate-800 active:scale-98 transition-all cursor-pointer shadow-xs"
      >
        <Plus className="w-4 h-4" />
        <span>Create Ticket</span>
      </button>
    </div>
  );
}
