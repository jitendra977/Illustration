import React, { useState } from 'react';
import { Eye, Download, Trash2, FileImage, Calendar, User } from 'lucide-react';
import { illustrationAPI } from '../../api/illustrations';

const IllustrationCard = ({ illustration, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await illustrationAPI.delete(illustration.id);
      onDelete?.(illustration.id);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getImageUrl = () => {
    if (illustration.files && illustration.files.length > 0) {
      return illustration.files[0].file;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {getImageUrl() ? (
            <img
              src={getImageUrl()}
              alt={illustration.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileImage size={64} className="text-gray-300" />
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <Eye size={20} className="text-gray-700" />
            </button>
            <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <Download size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={20} className="text-red-600" />
            </button>
          </div>

          {/* File Count Badge */}
          {illustration.files && illustration.files.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
              {illustration.files.length} files
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {illustration.title}
          </h3>
          
          {illustration.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {illustration.description}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-1 mb-3">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Engine:</span>{' '}
              {illustration.engine_model?.name || illustration.engine_model_name}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Category:</span>{' '}
              {illustration.part_category?.name || illustration.part_category_name}
            </div>
            {(illustration.part_subcategory?.name || illustration.part_subcategory_name) && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Subcategory:</span>{' '}
                {illustration.part_subcategory?.name || illustration.part_subcategory_name}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User size={14} />
              <span>{illustration.user_name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(illustration.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Illustration?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{illustration.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IllustrationCard;