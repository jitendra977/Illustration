import React from 'react';
import { Eye, Download, Trash2, FileImage, Calendar, User, Paperclip } from 'lucide-react';

const IllustrationList = ({ illustrations, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageUrl = (illustration) => {
    if (illustration.files && illustration.files.length > 0) {
      return illustration.files[0].file;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preview
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Engine / Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Files
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {illustrations.map((illustration) => (
            <tr key={illustration.id} className="hover:bg-gray-50 transition-colors">
              {/* Preview */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {getImageUrl(illustration) ? (
                    <img
                      src={getImageUrl(illustration)}
                      alt={illustration.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileImage size={32} className="text-gray-300" />
                  )}
                </div>
              </td>

              {/* Title & Description */}
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {illustration.title}
                  </div>
                  {illustration.description && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {illustration.description}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <User size={12} />
                    <span>{illustration.user_name}</span>
                  </div>
                </div>
              </td>

              {/* Engine & Category */}
              <td className="px-6 py-4">
                <div className="text-xs space-y-1">
                  <div className="text-gray-700">
                    <span className="font-medium">Engine:</span>{' '}
                    {illustration.engine_model?.name || illustration.engine_model_name}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Category:</span>{' '}
                    {illustration.part_category?.name || illustration.part_category_name}
                  </div>
                  {(illustration.part_subcategory?.name || illustration.part_subcategory_name) && (
                    <div className="text-gray-500">
                      <span className="font-medium">Sub:</span>{' '}
                      {illustration.part_subcategory?.name || illustration.part_subcategory_name}
                    </div>
                  )}
                </div>
              </td>

              {/* Files Count */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Paperclip size={16} />
                  <span>{illustration.files?.length || 0}</span>
                </div>
              </td>

              {/* Created Date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>{formatDate(illustration.created_at)}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors">
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => onDelete?.(illustration.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {illustrations.length === 0 && (
        <div className="text-center py-12">
          <FileImage size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No illustrations to display</p>
        </div>
      )}
    </div>
  );
};

export default IllustrationList;