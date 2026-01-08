import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FIELD_TYPES, FIELDS_REQUIRING_OPTIONS } from '../../utils/constants';

const FieldModal = ({ onClose, onSave, initial }) => {
  const [data, setData] = useState(initial || {
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    helpText: '',
    options: []
  });
  const [optInput, setOptInput] = useState('');
  
  const needsOptions = FIELDS_REQUIRING_OPTIONS.includes(data.type);
  
  const addOption = () => {
    if (optInput.trim()) {
      setData({ ...data, options: [...(data.options || []), optInput.trim()] });
      setOptInput('');
    }
  };
  
  const removeOption = (idx) => {
    setData({ ...data, options: data.options.filter((_, i) => i !== idx) });
  };
  
  const handleSave = () => {
    if (!data.label.trim()) {
      alert('Please enter a field label');
      return;
    }
    if (needsOptions && (!data.options || data.options.length === 0)) {
      alert('Please add at least one option');
      return;
    }
    onSave(data);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">{initial ? 'Edit Field' : 'Add Field'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Field Label *</label>
            <input 
              type="text" 
              value={data.label} 
              onChange={(e) => setData({ ...data, label: e.target.value })} 
              placeholder="e.g., Full Name" 
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Field Type *</label>
            <select 
              value={data.type} 
              onChange={(e) => setData({ ...data, type: e.target.value, options: [] })} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {FIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Placeholder</label>
            <input 
              type="text" 
              value={data.placeholder || ''} 
              onChange={(e) => setData({ ...data, placeholder: e.target.value })} 
              placeholder="Enter placeholder" 
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Help Text</label>
            <input 
              type="text" 
              value={data.helpText || ''} 
              onChange={(e) => setData({ ...data, helpText: e.target.value })} 
              placeholder="Additional instructions" 
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.required} 
              onChange={(e) => setData({ ...data, required: e.target.checked })} 
              className="w-5 h-5 rounded" 
            />
            <span className="text-sm font-medium">Required Field</span>
          </label>
          
          {needsOptions && (
            <div>
              <label className="block text-sm font-medium mb-2">Options *</label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={optInput} 
                  onChange={(e) => setOptInput(e.target.value)} 
                  onKeyPress={handleKeyPress}
                  placeholder="Enter option and press Add" 
                  className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
                <button 
                  type="button" 
                  onClick={addOption} 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {(data.options || []).length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.options.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{opt}</span>
                      <button 
                        type="button" 
                        onClick={() => removeOption(i)} 
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {initial ? 'Update' : 'Add'} Field
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldModal;