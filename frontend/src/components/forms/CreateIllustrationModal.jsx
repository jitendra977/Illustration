import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import {
  useManufacturers,
  useCarModels,
  useEngineModels,
  usePartCategories,
  usePartSubCategories,
} from '../../hooks/useIllustrations';
import { illustrationAPI } from '../../api/illustrations';

const CreateIllustrationModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
    part_subcategory: '',
    title: '',
    description: '',
    files: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch data hooks
  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();
  const { engineModels, fetchEngineModels } = useEngineModels();
  const { categories, fetchCategories } = usePartCategories();
  const { subCategories, fetchSubCategories } = usePartSubCategories();

  // Load dependent dropdowns
  useEffect(() => {
    if (formData.manufacturer) {
      fetchCarModels({ manufacturer: formData.manufacturer });
    }
  }, [formData.manufacturer]);

  useEffect(() => {
    if (formData.car_model) {
      fetchEngineModels({ car_model: formData.car_model });
    }
  }, [formData.car_model]);

  useEffect(() => {
    if (formData.engine_model) {
      fetchCategories({ engine_model: formData.engine_model });
    }
  }, [formData.engine_model]);

  useEffect(() => {
    if (formData.part_category) {
      fetchSubCategories({ part_category: formData.part_category });
    }
  }, [formData.part_category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset dependent fields
    if (name === 'manufacturer') {
      setFormData(prev => ({
        ...prev,
        car_model: '',
        engine_model: '',
        part_category: '',
        part_subcategory: '',
      }));
    } else if (name === 'car_model') {
      setFormData(prev => ({
        ...prev,
        engine_model: '',
        part_category: '',
        part_subcategory: '',
      }));
    } else if (name === 'engine_model') {
      setFormData(prev => ({
        ...prev,
        part_category: '',
        part_subcategory: '',
      }));
    } else if (name === 'part_category') {
      setFormData(prev => ({ ...prev, part_subcategory: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.manufacturer) newErrors.manufacturer = 'Required';
      if (!formData.car_model) newErrors.car_model = 'Required';
      if (!formData.engine_model) newErrors.engine_model = 'Required';
    } else if (step === 2) {
      if (!formData.part_category) newErrors.part_category = 'Required';
    } else if (step === 3) {
      if (!formData.title) newErrors.title = 'Required';
      if (formData.files.length === 0) newErrors.files = 'At least one file required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    try {
      const data = {
        engine_model: formData.engine_model,
        part_category: formData.part_category,
        part_subcategory: formData.part_subcategory || undefined,
        title: formData.title,
        description: formData.description,
        uploaded_files: formData.files,
      };

      await illustrationAPI.create(data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create illustration' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">Illustration created successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Illustration</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              {step === 1 ? 'Vehicle Details' : step === 2 ? 'Part Selection' : 'Illustration Details'}
            </span>
            <span className="text-xs text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Vehicle Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer *
                </label>
                <select
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select manufacturer...</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {errors.manufacturer && (
                  <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>
                )}
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
                {errors.car_model && (
                  <p className="text-red-500 text-sm mt-1">{errors.car_model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Model *
                </label>
                <select
                  name="engine_model"
                  value={formData.engine_model}
                  onChange={handleChange}
                  disabled={!formData.car_model}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.engine_model ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                >
                  <option value="">Select engine model...</option>
                  {engineModels.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                {errors.engine_model && (
                  <p className="text-red-500 text-sm mt-1">{errors.engine_model}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Part Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Category *
                </label>
                <select
                  name="part_category"
                  value={formData.part_category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.part_category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.part_category && (
                  <p className="text-red-500 text-sm mt-1">{errors.part_category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Subcategory (Optional)
                </label>
                <select
                  name="part_subcategory"
                  value={formData.part_subcategory}
                  onChange={handleChange}
                  disabled={!formData.part_category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select subcategory...</option>
                  {subCategories.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Illustration Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Engine Assembly Diagram"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add details about this illustration..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PNG, JPG, PDF up to 10MB
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>
                {errors.files && (
                  <p className="text-red-500 text-sm mt-1">{errors.files}</p>
                )}

                {/* File List */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Illustration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateIllustrationModal;