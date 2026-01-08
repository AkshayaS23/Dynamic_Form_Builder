import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Trash2, Users, FileText } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';

const FormCard = ({ form, responseCount = 0, onDelete, showActions = true }) => {
  return (
    <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold truncate flex-1">{form.form_name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[form.status]}`}>
            {form.status}
          </span>
        </div>
        {form.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{form.description}</p>
        )}
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500">{form.category}</p>
          <p className="text-xs text-blue-600 font-medium">
            {responseCount} response(s)
          </p>
        </div>
      </div>
      
      {showActions && (
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/forms/${form.id}`}
            className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-center"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </Link>
          <Link
            to={`/forms/edit/${form.id}`}
            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-center"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </Link>
          <Link
            to={`/forms/responses/${form.id}`}
            className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium text-center"
          >
            <Users className="w-4 h-4 inline mr-1" />
            Responses
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(form.id);
            }}
            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FormCard;