
import React from 'react';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import { categories } from '@/data/products';
import { Slider } from '@/components/ui/slider';

const FilterBar = ({ filters, setFilters }) => {
  const sortOptions = [
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'price-low-high', label: 'Preço: Menor para Maior' },
    { value: 'price-high-low', label: 'Preço: Maior para Menor' },
    { value: 'rating', label: 'Melhor Avaliados' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-green-500" />
        <h3 className="font-bold text-gray-800 text-lg">Filtros & Busca</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Produto</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Arroz, Leite..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2.5 pl-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'Todos os Departamentos' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar Por</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <span className="text-sm font-bold text-green-600">
              R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
            </span>
          </div>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
            min={0}
            max={100}
            step={1}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
