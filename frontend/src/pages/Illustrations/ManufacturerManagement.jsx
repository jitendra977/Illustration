import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Globe, AlertCircle } from 'lucide-react';
import { useManufacturers } from '../../hooks/useIllustrations';

const ManufacturerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [formData, setFormData] = useState({ name: '', country: '', slug: '' });
  const [errors, setErrors] = useState({});

  const {
    manufacturers,
    loading,
    error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
  } = useManufacturers();

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (manufacturer = null) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        country: manufacturer.country,
        slug: manufacturer.slug,
      });
    } else {
      setEditingManufacturer(null);
      setFormData({ name: '', country: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name' && !editingManufacturer) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingManufacturer) {
        await updateManufacturer(editingManufacturer.slug, formData);
      } else {
        await createManufacturer(formData);
      }
      setShowModal(false);
      setFormData({ name: '', country: '', slug: '' });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (manufacturer) => {
    if (window.confirm(`Are you sure you want to delete ${manufacturer.name}?`)) {
      try {
        await deleteManufacturer(manufacturer.slug);
      } catch (err) {
        alert('Failed to delete manufacturer');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manufacturers</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage vehicle manufacturers
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Manufacturer
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search manufacturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : filteredManufacturers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Globe size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No manufacturers found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first manufacturer'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Manufacturer
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManufacturers.map((manufacturer) => (
                  <tr key={manufacturer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{manufacturer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{manufacturer.country || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{manufacturer.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(manufacturer)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(manufacturer)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Toyota"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Japan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., toyota"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingManufacturer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturerManagement;