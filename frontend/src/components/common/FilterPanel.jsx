import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import {
  useManufacturers,
  useCarModels,
  useEngineModels,
  usePartCategories,
} from '../../hooks/useIllustrations';

const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
  });

  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();
  const { engineModels, fetchEngineModels } = useEngineModels();
  const { categories, fetchCategories } = usePartCategories();

  // Fetch dependent data
  useEffect(() => {
    if (filters.manufacturer) {
      fetchCarModels({ manufacturer: filters.manufacturer });
    }
  }, [filters.manufacturer]);

  useEffect(() => {
    if (filters.car_model) {
      fetchEngineModels({ car_model: filters.car_model });
    }
  }, [filters.car_model]);

  useEffect(() => {
    if (filters.engine_model) {
      fetchCategories({ engine_model: filters.engine_model });
    }
  }, [filters.engine_model]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    
    // Reset dependent filters
    if (name === 'manufacturer') {
      newFilters.car_model = '';
      newFilters.engine_model = '';
      newFilters.part_category = '';
    } else if (name === 'car_model') {
      newFilters.engine_model = '';
      newFilters.part_category = '';
    } else if (name === 'engine_model') {
      newFilters.part_category = '';
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    onFilterChange(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      manufacturer: '',
      car_model: '',
      engine_model: '',
      part_category: '',
    });
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="space-y-4">
        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer
          </label>
          <select
            value={filters.manufacturer}
            onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All manufacturers</option>
            {manufacturers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Car Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Model
          </label>
          <select
            value={filters.car_model}
            onChange={(e) => handleFilterChange('car_model', e.target.value)}
            disabled={!filters.manufacturer}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
          >
            <option value="">All models</option>
            {carModels.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Engine Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engine Model
          </label>
          <select
            value={filters.engine_model}
            onChange={(e) => handleFilterChange('engine_model', e.target.value)}
            disabled={!filters.car_model}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
          >
            <option value="">All engines</option>
            {engineModels.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* Part Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Part Category
          </label>
          <select
            value={filters.part_category}
            onChange={(e) => handleFilterChange('part_category', e.target.value)}
            disabled={!filters.engine_model}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplyFilters}
        className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Apply Filters
      </button>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-gray-500 mb-2">Active Filters:</p>
          <div className="space-y-1">
            {filters.manufacturer && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Manufacturer</span>
                <button
                  onClick={() => handleFilterChange('manufacturer', '')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.car_model && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Car Model</span>
                <button
                  onClick={() => handleFilterChange('car_model', '')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.engine_model && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Engine Model</span>
                <button
                  onClick={() => handleFilterChange('engine_model', '')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.part_category && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Category</span>
                <button
                  onClick={() => handleFilterChange('part_category', '')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;