import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Gauge, AlertCircle } from 'lucide-react';
import { useEngineModels, useManufacturers, useCarModels } from '../../hooks/useIllustrations';

const EngineModelManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({ manufacturer: '', car_model: '', name: '', slug: '' });
  const [errors, setErrors] = useState({});

  const { engineModels, loading, error, createEngineModel, deleteEngineModel } = useEngineModels();
  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();

  const filteredEngines = engineModels.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.car_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (engine = null) => {
    if (engine) {
      setEditingEngine(engine);
      setFormData({
        manufacturer: '',
        car_model: engine.car_model,
        name: engine.name,
        slug: engine.slug,
      });
    } else {
      setEditingEngine(null);
      setFormData({ manufacturer: '', car_model: '', name: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'manufacturer') {
      setFormData(prev => ({ ...prev, car_model: '' }));
      fetchCarModels({ manufacturer: value });
    }
    
    if (name === 'name' && !editingEngine) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.car_model) newErrors.car_model = 'Car model is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createEngineModel({ car_model: formData.car_model, name: formData.name, slug: formData.slug });
      setShowModal(false);
      setFormData({ manufacturer: '', car_model: '', name: '', slug: '' });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (engine) => {
    if (window.confirm(`Are you sure you want to delete ${engine.name}?`)) {
      try {
        await deleteEngineModel(engine.slug);
      } catch (err) {
        alert('Failed to delete engine model');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Engine Models</h1>
              <p className="text-sm text-gray-500 mt-1">Manage engine specifications</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Engine Model
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search engine models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

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
        ) : filteredEngines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Gauge size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No engine models found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first engine model'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Engine Model
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manufacturer
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
                {filteredEngines.map((engine) => (
                  <tr key={engine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{engine.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{engine.car_model_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{engine.manufacturer_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{engine.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(engine)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add Engine Model</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer *
                </label>
                <select
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select manufacturer...</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Model *
                </label>
                <select
                  name="car_model"
                  value={formData.car_model}
                  onChange={handleChange}
                  disabled={!formData.manufacturer}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.car_model ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                >
                  <option value="">Select car model...</option>
                  {carModels.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.car_model && <p className="text-red-500 text-sm mt-1">{errors.car_model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2.0L Turbo"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                  placeholder="e.g., 2-0l-turbo"
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineModelManagement;