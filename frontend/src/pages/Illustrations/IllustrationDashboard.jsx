import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, FileImage } from 'lucide-react';
import { useIllustrations } from '../../hooks/useIllustrations';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';
import IllustrationCard from '../../components/common/IllustrationCard';
import IllustrationList from '../../components/common/IllustrationList';
import FilterPanel from '../../components/common/FilterPanel';

const IllustrationDashboard = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({});

  const { illustrations, loading, error, fetchIllustrations } = useIllustrations(filters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchIllustrations(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ search: searchTerm });
  };

  const filteredIllustrations = illustrations.filter(ill =>
    ill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Illustrations</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your automotive part illustrations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Illustration
            </button>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search illustrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              Filters
            </button>

            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>
          )}

          {/* Illustrations Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredIllustrations.length === 0 ? (
              <div className="text-center py-12">
                <FileImage size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No illustrations found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first illustration'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                    Create Illustration
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIllustrations.map((illustration) => (
                  <IllustrationCard key={illustration.id} illustration={illustration} />
                ))}
              </div>
            ) : (
              <IllustrationList illustrations={filteredIllustrations} />
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateIllustrationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchIllustrations();
          }}
        />
      )}
    </div>
  );
};

export default IllustrationDashboard;