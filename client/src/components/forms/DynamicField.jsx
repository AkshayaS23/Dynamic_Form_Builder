import React from 'react';
import { Upload, X } from 'lucide-react';

const DynamicField = ({ field, value, onChange, error }) => {
  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(field.id, val);
  };
  
  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // OPTIONAL validation
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be under 10MB');
    return;
  }

  // ✅ STORE THE REAL FILE
  onChange(field.id, file);
};


  const removeFile = () => {
    onChange(field.id, null);
  };
  
  const handleMultiCheckbox = (option, checked) => {
    const current = value || [];
    const updated = checked ? [...current, option] : current.filter(v => v !== option);
    onChange(field.id, updated);
  };
  
  const baseClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    error 
      ? 'border-red-400 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400'
  }`;
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return (
        <input 
          type={field.type} 
          value={value || ''} 
          onChange={handleChange} 
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
          required={field.required} 
          className={baseClasses}
        />
      );
    
    case 'textarea':
      return (
        <textarea 
          value={value || ''} 
          onChange={handleChange} 
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
          required={field.required} 
          rows={4} 
          className={`${baseClasses} resize-none`}
        />
      );

    case 'password':
      return (
        <div className="relative">
          <input
            type={field.showPassword ? 'text' : 'password'}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || 'Enter password'}
            required={field.required}
            className={baseClasses + ' pr-12'}
          />

          <button
            type="button"
            onClick={() =>
              onChange(`${field.id}_toggle`, !field.showPassword)
            }
            className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {field.showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      );
    
    case 'number':
      return (
        <input 
          type="number" 
          value={value || ''} 
          onChange={handleChange} 
          placeholder={field.placeholder || 'Enter number'} 
          required={field.required} 
          className={baseClasses}
        />
      );
    
    case 'date':
      return (
        <input 
          type="date" 
          value={value || ''} 
          onChange={handleChange} 
          required={field.required} 
          className={baseClasses}
        />
      );
    
    case 'time':
      return (
        <input 
          type="time" 
          value={value || ''} 
          onChange={handleChange} 
          required={field.required} 
          className={baseClasses}
        />
      );
    
    case 'file':
      return (
        <div>
          {value ? (
            <div className="flex items-center gap-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-green-900">{value.name}</p>
                <p className="text-sm text-green-600">
                  {(value.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-green-600" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                required={field.required}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </label>
          )}
        </div>
      );
    
    case 'dropdown':
      return (
        <select 
          value={value || ''} 
          onChange={handleChange} 
          required={field.required} 
          className={baseClasses}
        >
          <option value="">Select an option</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );
    
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label 
              key={i} 
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                value === opt 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input 
                type="radio" 
                name={`field-${field.id}`} 
                value={opt} 
                checked={value === opt} 
                onChange={handleChange} 
                required={field.required} 
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500" 
              />
              <span className="font-medium text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    
    case 'checkbox':
      if (field.options && field.options.length > 0) {
        return (
          <div className="space-y-2">
            {field.options.map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  (value || []).includes(opt)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={(value || []).includes(opt)} 
                  onChange={(e) => handleMultiCheckbox(opt, e.target.checked)} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <span className="font-medium text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <input 
            type="checkbox" 
            checked={value || false} 
            onChange={handleChange} 
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
          />
          <span className="font-medium text-gray-700">{field.label}</span>
        </label>
      );
    
    case 'rating':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button 
              key={r} 
              type="button" 
              onClick={() => onChange(field.id, r)} 
              className={`w-12 h-12 rounded-lg border-2 font-semibold text-lg transition-all ${
                value >= r 
                  ? 'bg-yellow-400 border-yellow-500 text-white shadow-md transform scale-110' 
                  : 'border-gray-300 text-gray-400 hover:border-yellow-400 hover:text-yellow-500 hover:scale-105'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      );
    
    default:
      return null;
  }
};

export default DynamicField;