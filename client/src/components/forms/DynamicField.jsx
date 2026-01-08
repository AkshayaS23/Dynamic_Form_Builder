import React, { useState } from 'react';

const DynamicField = ({ field, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const val =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(field.id, val);
  };

  const handleMultiCheckbox = (option, checked) => {
    const current = value || [];
    const updated = checked
      ? [...current, option]
      : current.filter((v) => v !== option);
    onChange(field.id, updated);
  };

  const classes = `w-full px-4 py-2.5 border ${
    error ? 'border-red-500' : 'border-gray-300'
  } rounded-lg focus:ring-2 focus:ring-blue-500`;

  switch (field.type) {
    /* ---------------- TEXT TYPES ---------------- */
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return (
        <input
          type={field.type}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          className={classes}
        />
      );

    /* ---------------- PASSWORD ---------------- */
    case 'password':
      return (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            className={`${classes} pr-20`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>

          {field.helpText && (
            <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      );

    /* ---------------- TEXTAREA ---------------- */
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          className={classes}
        />
      );

    /* ---------------- NUMBER ---------------- */
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          className={classes}
        />
      );

    /* ---------------- DATE ---------------- */
    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={handleChange}
          required={field.required}
          className={classes}
        />
      );

    /* ---------------- TIME ---------------- */
    case 'time':
      return (
        <input
          type="time"
          value={value || ''}
          onChange={handleChange}
          required={field.required}
          className={classes}
        />
      );

    /* ---------------- DROPDOWN ---------------- */
    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={handleChange}
          required={field.required}
          className={classes}
        >
          <option value="">Select an option</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    /* ---------------- RADIO ---------------- */
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label
              key={i}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name={`field-${field.id}`}
                value={opt}
                checked={value === opt}
                onChange={handleChange}
                required={field.required}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );

    /* ---------------- FILE UPLOAD ---------------- */
    case 'file':
      return (
        <div>
          <input
            type="file"
            accept={field.accept || '*'}
            multiple={field.multiple || false}
            required={field.required}
            onChange={(e) => {
              const files = field.multiple
                ? Array.from(e.target.files)
                : e.target.files[0];
              onChange(field.id, files);
            }}
            className={classes}
          />

          {value && (
            <div className="mt-2 text-sm text-gray-600">
              {Array.isArray(value)
                ? value.map((file, i) => <div key={i}>{file.name}</div>)
                : value.name}
            </div>
          )}
        </div>
      );

    /* ---------------- CHECKBOX ---------------- */
    case 'checkbox':
      if (field.options && field.options.length > 0) {
        return (
          <div className="space-y-2">
            {field.options.map((opt, i) => (
              <label key={i} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt)}
                  onChange={(e) =>
                    handleMultiCheckbox(opt, e.target.checked)
                  }
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <input
          type="checkbox"
          checked={value || false}
          onChange={handleChange}
        />
      );

    /* ---------------- RATING ---------------- */
    case 'rating':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange(field.id, r)}
              className={`w-10 h-10 rounded-lg border-2 ${
                value >= r
                  ? 'bg-yellow-400 border-yellow-500 text-white'
                  : 'border-gray-300'
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
